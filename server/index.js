import express from 'express'
import { generateApi } from 'swagger-typescript-api'
import path from 'path'
const outputDir = path.resolve(process.cwd(), './src/__generated__');

/* NOTE: all fields are optional expect one of `output`, `url`, `spec` */
function extractQueryByNameDto(schema) {
    if(!schema?.content) return {}
    if(!schema?.content['application/json']) return {}
    if(!schema?.content['application/json']?.schema) return {}
    if(!schema?.content['application/json']?.schema?.$ref) return {}


    const ref = schema.content['application/json'].schema?.$ref.replace('#/components/schemas/', '');

    // return schema.components.schemas[ref];
    return ref
}
const baseUrl = 'http://192.168.218.202:9392/'
const app = express()
app.use(express.json())
app.get('/list', async (req, res) => {
    const response  = await fetch(baseUrl+'v3/api-docs/swagger-config')
    const data = await response .json();
    res.json({
        data,
        code:200
    })
})
function mergeApis(apis) {
    const groupedApis = {};

    apis.forEach(api => {
        const { tagName, ...otherProps } = api;

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
    const { mode, options } = data;
    let apiCode = '';
    const imports = new Set(); // 用于存储所有需要import的functionParam

    let classCode = `class Api {\n`;

    options.forEach(option => {
        const { method, url, key, summary } = option;
        // 提取URL最后一个部分作为函数名
        const functionName = url.split('/').pop();
        const functionParam = typeof key === 'string' ? `${key}Prop` : 'any';

        if (functionParam !== 'any') {
            imports.add(functionParam); // 添加到imports集合中
        }

        classCode += `    //${summary}
    public static ${functionName}(param: ${functionParam}): AxiosPromise {
        return Http.${method}('${mode}${url}', param)
    }\n`;
    });

    classCode += '}';

    // 生成import语句
    if (imports.size > 0) {
        apiCode += `import { ${Array.from(imports).join(', ')} } from './dto'\n`;
    }
    apiCode += `import { Http } from '/&/utils'\nimport { AxiosPromise } from 'axios'\n\n`;
    apiCode += classCode;

    return apiCode;
}

function generateDtoCode(data) {
    const { options } = data;
    let dtoInterfaces = '';
    const generatedKeys = new Set(); // 用于跟踪已生成的接口，避免重复

    options.forEach(option => {
        const { key, dto } = option;
        if (!key || generatedKeys.has(key)||typeof key !== 'string' ) return; // 如果没有key或者key已经生成，跳过

        let interfaceCode = `interface ${key}Prop {\n`;
        Object.entries(dto|| {}).forEach(([dtoKey, { type, description }]) => {
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
app.post('/docs',async (req,res)=>{
    const body = req.body
    const url = baseUrl+body.path+'/v3/api-docs'
    console.log(url)
const response = await fetch(url)
    const data = await response .json();
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
        data:result,
        code:200,
        total:categorizedData.length
    })
})


app.post('/merge',async (req,res)=>{

    const api =  generateApiCode(req.body)
    const dto =  generateDtoCode(req.body)
    res.json({
        data:{api,dto},
        code:200
    })

})

app.listen(3000)