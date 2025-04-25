import express from 'express'
import dayjs from "dayjs";
import XLSX from 'xlsx';
import path from 'path'
import {recognizeCaptcha} from './utils.js'
const interfaceMap = {
    'kangdulab-business-lis': 'lis',
    'kangdulab-business-lis-report': 'lisreport',
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
    "kangdulab-business-lis-microbiology-test": "microbiologytest",
    "kangdulab-business-lis-ngs": "lisngs",
    "kangdulab-business-lis-pathology-test": "pathologytest",
    "kangdulab-business-canteen": "canteen",
    "kangdd-business-health": "health",

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
const loginConfig = {
    username: 'linwenyu',
    password: 'kd123456',
    grant_type: 'captcha',
    verifyCode: '9',
    verifyCodeKey: 'f261a8f969464afaa42f2f4aea2b8b76',
    client_id: 'kangdulab-admin',
    client_secret: '8e343ab1e4c14dae9b46f65820396b53',
    publicKeyId: '',
    publicKey: '',
}
const loginUrl = 'http://192.168.218.202:9392/'
const baseUrl = 'http://192.168.218.203:9392/'
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
    public static ${functionName}(param: ${functionParam}) {
        return Http.${method}('${(interfaceMap[mode] || mode)}${url}', param)
    }\n`;
    });

    classCode += '}\n'+'export { Api }';

    // 生成import语句
    if (imports.size > 0) {
        apiCode += `import { ${Array.from(imports).join(', ')} } from './dto'\n`;
    }
    apiCode += `import { Http } from '/&/utils'\n\n\n`;
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
            let fieldType = type === 'integer' ? 'number | string' : 'string';
            if(dtoKey.toLowerCase().includes('ids')||dtoKey.toLowerCase().includes('list')) fieldType = 'number[] | string[]'
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

function generateVueCode(data){
    const {options,mode} = data;
    console.log(options,mode,'ssss')
}
//解析图片验证码
app.post('/login', async (req, res) => {
     const response = await fetch(`${loginUrl}auth/captcha/login/code`, {
        method: 'GET',
    });
    const {data} = await response.json();
    const verifyCode = await recognizeCaptcha(data.verifyCodeImg)
    // console.log(data, 'ddd',verifyCode);
   res.json({
       code: 200,
       data: {
           verifyCode,
           ...data
       }
   })
})
app.post('/vuecode',(req, res)=>{
    const {refreshApi,addDto,addApi,updateApi,delApi,delDto,pageApi,pageDto,queryApi,queryDto} = req.body;
    const HtmlCode = `
    <template>
    <div wh-full flex-col px-10>
        <div bg-white class="px-[12px] py-[12px]">
            <n-grid x-gap="15" y-gap="5" cols="3 1000:4 1500:5 1700:6" class="mb-[8px]">
                <n-gi>
                    <KDInput text="a" v-model="queryParams.a" clearable />
                </n-gi>

                <n-gi>
                    <KDInput text="b" v-model="queryParams.b" clearable />
                </n-gi>
                <n-gi>
                    <KDInput text="c" v-model="queryParams.c" clearable />
                </n-gi>
                <n-gi :span="2">
                    <KDTimePicker text="创建时间" class="flex-1" @getTimer="getTimer" />
                </n-gi>
                <n-gi :span="1">
                    <n-button type="primary" size="small" @click="initPage">查询</n-button>
                    <n-button class="ml-5" type="warning" size="small" @click="emptyQuery">清空查询</n-button>
                    <n-button class="ml-5" type="success" size="small" @click="handleAdd">新增</n-button>
                     ${refreshApi?'<n-button class="ml-5" type="info" size="small" @click="refreshCache">刷新緩存</n-button>':''}
                </n-gi>
            </n-grid>
        </div>

        <div flex-1 flex-col h0 mt-5 bg-white>
            <div flex-1 h0>
                <VTable :is-show-check="true" :data="tableData" :columns="columns" height="auto" :is-operate="true">
                  <template #operate="{ row }">
                    <KDDropdown :row="row" @optionClick="operate" :options="options"></KDDropdown>
                  </template>
                </VTable>
            </div>
            <KDPagination v-model="queryParams.page" :total="totalValue" :limit="queryParams.limit" @change="changePage"> </KDPagination>
        </div>
        <KDModal width="500px" v-model="visible" title="添加项目">
            <div p12>
                <n-grid cols="1" y-gap="12" x-gap="15">
                    <n-gi>
                        <KDInput
                            v-model="addForm.a"
                            text-class="textBlack"
                            text="申请项目"
                        ></KDInput>
                    </n-gi>
                    <n-gi>
                        <KDInput type="textarea" text="备注" text-class="textBlack" v-model="addForm.remark" clearable />
                    </n-gi>
                </n-grid>
            </div>
            <div flex items-center justify-end p10>
                <n-button size="small" @click="cancel">取消</n-button>
                <n-button class="ml-5" type="primary" size="small" @click="sure">确定</n-button>
            </div>
        </KDModal>
    </div>
</template>
    `

    const imports = `
    <script setup lang="ts">
import { Api } from './api'
import { ${addDto}, ${pageDto} } from './dto'
import VTable from '/&/components/VTable/index.vue'
import { VTableProps } from '/&/components/VTable/VTable'
import { MessageBox,getArrayFirst, getArrayLast, useCurrentInstance } from '/&/utils'
import KDSelect from '/&/components/KDSelect/index.vue'
import { PublicApi } from '@/api'
import KDDropdown from "/&/components/KDDropdown/index.vue";
${refreshApi?`const refreshCache = ()=>{\n  Api.${refreshApi}().then(()=>{\n    window.$message.success(\'刷新缓存成功\')\n  })\n}`:''}
//--------------------------编辑 ------------------------
const operate = ({ key, row }: any) => {
  key === 'edit' ? handleEdit(row) : handleDelete(row)
}
const handleEdit = async (row:any)=>{
      ${queryApi?`const {data} = await Api.${queryApi}({ id: row.id })`:''}
      visible.value = true
       addForm.value = ${queryApi?'data':'row'}
}
const handleDelete = (row:any)=>{
         MessageBox.confirm('确定要删除吗',()=>{
    Api.${delApi}({id:row.id}).then(()=>{
      window.$message.success('删除成功')
      initPage()
    })
  })
}
//--------------------------新增 ------------------------
const visible = ref(false)
const addForm = ref<${addDto}>({})
const handleAdd = () => {
    visible.value = true
}

const cancel = () => {
    addForm.value = {}
    visible.value = false
}
const sure = async () => {
    const fn = addForm.value.id?Api.${updateApi}: Api.${addApi}
  await fn(addForm.value)
  window.$message.success('操作成功')
  cancel()
  await initPage()
}
//--------------------查询 -----------------------
const queryParams = ref<${pageDto}>({ page: 1, limit: 50 })
const totalValue = ref(0)
const tableData = ref<any[]>([])
const columns: VTableProps.TableColumnPropsArray = [
    {
        title: '康都条码号',
        key: 'barcode',
    },
     {
    title: '备注',
    key: 'remark',
  },
  {
    title: '修改时间',
    key: 'gmtModified',
  },
  {
    title: '修改人',
    key: 'lastupdatename',
  },
  {
    title: '创建时间',
    key: 'gmtCreate',
  },
  {
    title: '创建人',
    key: 'createdname',
  },
]
const changePage = (e: PaginationChangeProp) => {
    const { type, value } = e
    queryParams.value[type] = value
    initPage()
}
const getTimer = (data: string[]) => {
    queryParams.value.beginCreateTime = getArrayFirst(data)
    queryParams.value.endCreateTime = getArrayLast(data)
    initPage()
}
const { proxy } = useCurrentInstance()
const emptyQuery = () => {
    //清空查询
    proxy.eventBus.emit('onTabViewRefresh')
}
const initPage = async () => {
    const { data, total } = (await Api.${pageApi}(queryParams.value)) as any
    totalValue.value = total
    tableData.value = data
}
onMounted(()=>{
  // initPage()
})
</script>
    `
const completeCode = HtmlCode +'\n' + imports
    res.json({code:200,data:completeCode})
})

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
    const vueCode = generateVueCode(req.body)
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
            btnperm:'1',
            operationType:2,
            operation_componet:'',
            resourceType:1,
            operationMethod
        })
    })
    res.json({data,code:200})
})

app.listen(3008)