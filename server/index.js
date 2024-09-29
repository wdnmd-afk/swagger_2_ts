import express from 'express'
import dayjs from "dayjs";
import XLSX from 'xlsx';
import path from 'path'
const interfaceMap = {
    'kangdulab-business-lis': 'lis',
    'kangdulab-business-docking': 'docking',
    'kangdulab-business-oss': 'oss',
    'kangdulab-log': 'log',
    "kangdulab-business-lis-application-order": "lisapplicationorder",
    "kangdulab-business-admin": "admin",
    "kangdulab-business-lis-test": "listest",
    "kangdulab-business-lis-sortting": "lissortting",
    "kangdulab-auth": "auth",
    "kangdulab-business-logistics": "logistics",
    "kangdulab-business-import-export": "importexport",
    "kangdulab-business-charge": "charge",
}

/* NOTE: all fields are optional expect one of `output`, `url`, `spec` */
function extractQueryByNameDto(schema) {
    if (!schema?.content) return {}
    if (!schema?.content['application/json']) return {}
    if (!schema?.content['application/json']?.schema) return {}
    if (!schema?.content['application/json']?.schema?.$ref) return {}


    const ref = schema.content['application/json'].schema?.$ref.replace('#/components/schemas/', '');

    // return schema.components.schemas[ref];
    return ref
}

const baseUrl = 'http://192.168.218.202:9392/'
const app = express()
app.use(express.json())
app.get('/list', async (req, res) => {
    const response = await fetch(baseUrl + 'v3/api-docs/swagger-config')
    const data = await response.json();
    res.json({
        data,
        code: 200
    })
})

function mergeApis(apis) {
    const groupedApis = {};

    apis.forEach(api => {
        const {tagName, ...otherProps} = api;

        if (!groupedApis[tagName]) {
            groupedApis[tagName] = [];
        }

        groupedApis[tagName].push(otherProps);
    });

    return Object.keys(groupedApis).map(tagName => ({
        tagName,
        options: groupedApis[tagName]
    }));
}

function generateApiCode(data) {
    const {mode, options} = data;
    let apiCode = '';
    const imports = new Set(); // 用于存储所有需要import的functionParam

    let classCode = `class Api {\n`;

    options.forEach(option => {
        const {method, url, key, summary} = option;
        // 提取URL最后一个部分作为函数名
        const functionName = url.split('/').pop();
        const functionParam = typeof key === 'string' ? `${key}Prop` : 'any';

        if (functionParam !== 'any') {
            imports.add(functionParam); // 添加到imports集合中
        }
        console.log(mode)
        classCode += `    //${summary}
    public static ${functionName}(param: ${functionParam}): AxiosPromise {
        return Http.${method}('${(interfaceMap[mode] || mode)}${url}', param)
    }\n`;
    });

    classCode += '}\n'+'export { Api }';

    // 生成import语句
    if (imports.size > 0) {
        apiCode += `import { ${Array.from(imports).join(', ')} } from './dto'\n`;
    }
    apiCode += `import { Http } from '/&/utils'\nimport { AxiosPromise } from 'axios'\n\n`;
    apiCode += classCode;

    return apiCode;
}

function generateDtoCode(data) {
    const {options} = data;
    let dtoInterfaces = '';
    const generatedKeys = new Set(); // 用于跟踪已生成的接口，避免重复

    options.forEach(option => {
        const {key, dto} = option;
        if (!key || generatedKeys.has(key) || typeof key !== 'string') return; // 如果没有key或者key已经生成，跳过

        let interfaceCode = `interface ${key}Prop {\n`;
        Object.entries(dto || {}).forEach(([dtoKey, {type, description}]) => {
            // 判断类型，如果是integer则转换为number，否则默认为string
            const fieldType = type === 'integer' ? 'number' : 'string';
            // 添加字段到interface，字段都是可选的
            interfaceCode += `    ${dtoKey}?: ${fieldType} // ${description || ''}\n`;
        });
        interfaceCode += '}\n';
        dtoInterfaces += interfaceCode;
        generatedKeys.add(key); // 标记此key已生成
    });

    // 将所有接口名称添加到export语句中
    const exports = Array.from(generatedKeys).map(key => `${key}Prop`).join(', ');
    dtoInterfaces += `\nexport { ${exports} }`;

    return dtoInterfaces;
}

app.post('/docs', async (req, res) => {
    const body = req.body
    const url = baseUrl + body.path + '/v3/api-docs'
    console.log(url)
    const response = await fetch(url)
    const data = await response.json();
    const components = data.components?.schemas || {}
    let categorizedData = [];

// 遍历 paths
    for (const [url, methods] of Object.entries(data.paths || {})) {
        // console.log(url, methods)
        for (const [method, details] of Object.entries(methods)) {
            // 检查是否存在 tags
            if (details.tags) {
                details.tags.forEach(tag => {
                    const key = extractQueryByNameDto(details.requestBody)
                    const dto = components?.[key]?.properties
                    // 构建新的数据对象
                    let newItem = {
                        tagName: tag,
                        method: method,
                        url: url,
                        key,
                        dto,
                        parameters: details.parameters || [],
                        summary: details.summary,
                    };
                    // 添加到结果数组中
                    categorizedData.push(newItem);
                });
            }
        }
    }
    const result = mergeApis(categorizedData)

    res.json({
        data: result,
        code: 200,
        total: categorizedData.length
    })
})

app.post('/excel',async (req,res)=>{
    const {options,mode} = req.body
    const data = []
    options.forEach((option,index) => {
        const {url, summary, method} = option
        data.push({
            id:null,
            name:summary,
            gmt_create:dayjs().format('YYYY-MM-DD HH:mm:ss'),
            gmt_modified:dayjs().format('YYYY-MM-DD HH:mm:ss'),
            createdby:0,
            createdname:'kkk',
            lastupdateby:0,
            lastupdatename:'kkk',
            enableflag:1,
            remark:'',
            sort:'',
            pid:"1836966646372241408",
            urlperm:method.toUpperCase()+':/'+interfaceMap[mode]+url,
            btnperm:1,
            resourceid:'',
            operation_type:'1',
            operation_componet:'',
            resource_type:1
        })
    })
    const columns = Object.keys(data[0])
// 创建一个工作簿
    const workbook = XLSX.utils.book_new();

    // 将数据转换为工作表
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 添加表头（可选）
    XLSX.utils.sheet_add_aoa(worksheet, [columns], { origin: 'A1' });

    // 将工作表添加到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // 生成文件存储路径
    const filePath = path.join(process.cwd(), 'docs', `${mode + dayjs()}.xlsx`);

    // 写入文件到本地
    XLSX.writeFile(workbook, filePath);

    // 发送成功消息
    res.send('文件已成功保存到: ' + filePath);
})

app.post('/merge', async (req, res) => {


    const api = generateApiCode(req.body)
    const dto = generateDtoCode(req.body)
    res.json({
        data: {api, dto},
        code: 200
    })

})
const handleOperationMethod =(str)=>{
    str = str.toLowerCase()

    if(str.includes('add')||str.includes('create')|| str.includes('save')){
        return 2
    }
    if(str.includes('update')){
        return 3
    }
    if(str.includes('delete')){
        return 4
    }
    if(str.includes('import')){
        return 5
    }
    if(str.includes('export')){
        return 6
    }

    return 1
}
const methodOptions = {
    1:'查询',
    2:'新增',
    3:'修改',
    4:'删除',
    5:'导入',
    6:'导出'
}

app.post('/resource', async (req, res) => {
    const {options,mode} = req.body
    const data = []
    options.forEach(option => {
        const {url, summary, method} = option
        const temp = url.split('/')
        const operationMethod = handleOperationMethod(temp[temp.length-1])
        data.push({
            id:null,
            name:'[按钮]'+`[${methodOptions[operationMethod]}]`+summary,
            gmt_create:dayjs().format('YYYY-MM-DD HH:mm:ss'),
            gmt_modified:dayjs().format('YYYY-MM-DD HH:mm:ss'),
            createdby:0,
            createdname:'kkk',
            lastupdateby:0,
            lastupdatename:'kkk',
            enableflag:1,
            remark:'',
            sort:'',
            urlperm:method.toUpperCase()+':/'+interfaceMap[mode]+url,
            btnperm:'1234',
            operationType:2,
            operation_componet:'',
            resourceType:1,
            operationMethod
        })
    })
    res.json({data,code:200})
})

app.listen(3000)