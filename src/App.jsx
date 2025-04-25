import {Button, Form, Input, message, Select, Switch, Table, TreeSelect} from 'antd';
import {useEffect, useState} from 'react';
import {Http} from './util';
import './App.css'
import axios from "axios";
import VueCode from "./VueCode.jsx";

const App = () => {
    //模块
    const [modeOptions, setModeOptions] = useState([]);
    //模块路径
    const [optionsPath, setOptionsPath] = useState([]);
    const [params, setParams] = useState([]);
    const [apiStr, setApiStr] = useState('');
    const [dtoStr, setDtoStr] = useState('');
    const [tableData, setTableData] = useState([]);
    const [isChecked, setIsChecked] = useState(false);
    const [isGive, setGive] = useState(false);
    const [baseUrl, setBaseUrl] = useState('/prod-api');
    const handleDelete = (row) => {
        console.log(row)
        setTableData(tableData.filter(item => item.urlperm !== row.urlperm))
    }
    const columns = [
        {
            title: 'Button Permission',
            dataIndex: 'btnperm',
            key: 'btnperm',
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },

        {
            title: 'Operation Type',
            dataIndex: 'operation_type',
            key: 'operation_type',
        },
        {
            title: 'resourceType',
            dataIndex: 'resourceType',
            key: 'resourceType',
        },
        {
            title: 'Parent ID',
            dataIndex: 'pid',
            key: 'pid',
        },


        {
            title: 'URL Permission',
            dataIndex: 'urlperm',
            key: 'urlperm',
        },
        {
            title: 'operationMethod',
            dataIndex: 'operationMethod',
            key: 'operationMethod',
        },
        {
            title: 'Action',
            key: 'operation',
            fixed: 'right',
            width: 100,
            render: (text, record) => <Button type={'text'} onClick={() => {
                handleDelete(record)
            }}>删除</Button>,
        },
    ]
    // 页面初始化
    useEffect(() => {
        const initPage = async () => {
            const {data} = await Http.get('/api/list');
            setModeOptions(data.data.urls);
        };
        const token = localStorage.getItem('token')
        if(token){
            setToken(token)
        }

        initPage();
    }, []);

    // 处理表单提交
    const onFinish = async (values) => {
        if (!values.mode) {
            return message.error('请选择必填参数');
        }
        const {data} = await Http.post('/api/merge', {
            mode: values.mode,
            options: values.options ? values.options : params
        });
        setApiStr(data.data.api);
        setDtoStr(data.data.dto);
        const res = await Http.post('/api/resource', {
            options: values.options ? values.options : params,
            mode: values.mode
        });
        setTableData(res.data.data)
    };

    // 处理模块变更
    const handleModeChange = async (value) => {
        const {data} = await Http.post('/api/docs', {path: value});
        setOptionsPath(data.data);
    };

    // 处理tag变更
    const handleTagChange = async (value, option) => {
        option && setParams(option.other);
    };

    // 复制文本到剪切板
    const handleCopy = async (str) => {
        if (!str) return;
        if (!navigator.clipboard) return message.error('当前浏览器不支持复制功能');
        await navigator.clipboard.writeText(str);
        message.success('复制成功');
    };
    //过滤下拉
    const handleSearch = (newVal) => {
        return optionsPath.filter(d => d.tagName.includes(newVal)) || [];

    }
    useEffect(() => {
        console.log(optionsPath)
    }, [optionsPath]);
    const roleFilter = (newVal) => {
        return roleData.filter((d)=>{
            return d.name.includes(newVal)
        });

    }
    const [flag, setFlag] = useState(true)
    const handleHide = () => {
        setFlag(!flag)
    }
    const [token, setToken] = useState('')
    const [pid, setPid] = useState('')
    const findItemInArray = (arr, url) => {
        const res = []
        arr.forEach((item) => {
            if (item.options.length) {
                item.options.forEach((option) => {
                    if (option.url.includes(url)) {
                        res.push(option)
                    }
                })
            }

        })
        return res
    }
    const [roleData, setRoleData] = useState([])
    const [treeData, setTreeData] = useState([])
    const getTreeData = async ()=>{
        Http.post(baseUrl+'/admin/api/v1/operation/getAllOperationTree', {resourceType:2,name:'',urlperm:''}, {

        }).then(({data}) => {
            console.log(data,'ddd')
            setTreeData(data)
        })
        Http.post(baseUrl+'/admin/api/v1/role/queryRolePageList', {limit:200,page:1}, {

        }).then(({data}) => {
            setRoleData(data)
        })
    }
    function appendSuffix(arr) {
        let newArr = [];

        arr.forEach(item => {
            for (let i = 1; i <= 4; i++) {
                let suffix = i.toString().padStart(2, '0');  // ensures the suffix is two digits, like "01", "02", etc.
                newArr.push(item + suffix);
            }
        });

        return newArr;
    }
    const testData = [
          "10241206000003", "10241206000004", "10241206000005",
        "10241206000006", "10241206000007", "10241206000008", "10241206000009", "10241206000010",
        "10241206000011", "10241206000012", "10241206000013", "10241206000014", "10241206000015",
        "10241206000016", "10241206000017", "10241206000018", "10241206000019", "10241206000020",
        "10241206000021", "10241206000022", "10241206000023", "10241206000024", "10241206000025",
        "10241206000026", "10241206000027", "10241206000028", "10241206000029", "10241206000030",
        "10241206000031", "10241206000032", "10241206000033", "10241206000034", "10241206000035",
        "10241206000036", "10241206000037", "10241206000038", "10241206000039", "10241206000040",
        "10241206000041", "10241206000042", "10241206000043", "10241206000044", "10241206000045",
        "10241206000046", "10241206000047", "10241206000048", "10241206000049", "10241206000050",
        "10241206000051", "10241206000052", "10241206000053", "10241206000054", "10241206000055",
        "10241206000056", "10241206000057", "10241206000058"
    ]
    const login = async ()=>{
       const config =  {
            headers: {
                'Content-Type': 'application/json',
                    'Authorization': token
            }
        }
        const realData = appendSuffix(testData)
        console.log(realData,'real')
        for await (const argument of realData) {
            const {data} = await axios.post(baseUrl+'/lissortting/api/v1/sortting/querySpecimenByBarcode', {barcode:argument},config)
            console.log(data,'ddd')
             axios.post(baseUrl+'/lissortting/api/v1/sortting/addSorttingByApplicationOrderidBarcode',{applicationOrderId:data.applicationOrderId,barcode:argument},config)
        }
    }
    const [roleId,setRoleId] = useState('')
    //批量登记
    const handleSend = async () => {
        tableData.forEach((item) => {
            Http.post(baseUrl+'/admin/api/v1/operation/addOperation', {...item, pid}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }
            }).then((res) => {
                console.log(res,item)
                message.success(item.urlperm + (res?.msg?res?.msg:res.data.msg))
                if(!roleId) return
               if(!res?.msg.includes('重复')){
                   Http.post(baseUrl+'/admin/api/v1/operation/queryAllOperationPageList', {page:1,limit:10,urlperm:item.urlperm,roleId}, {
                       headers: {
                           'Content-Type': 'application/json',
                           'Authorization': token
                       }
                   }).then(({data})=>{
                       const addoperationids = data.map(item=>item.id)
                       Http.post(baseUrl+'/admin/api/v1/operation/creatRoleOperationList', {addoperationids,roleid:roleId}, {
                           headers: {
                               'Content-Type': 'application/json',
                               'Authorization': token
                           }
                       })
                   })
               }

            })
        })
    }
    //表单Ref
    const [form] = Form.useForm();
    const handleForm = () => {
        const formData = form.getFieldsValue();
        if (!formData.url) return
        const options = findItemInArray(optionsPath, formData.url.trim())
        console.log(options)
        if (options.length) {
            onFinish({mode: formData.mode, options})
        }
    }
    const onChange = (newValue) => {
        setPid(newValue);
    };
    const handleRoleChange = (data)=>{
        console.log(data,'ddd')
        setRoleId(data)
    }
    useEffect(()=>{
        console.log(isChecked,'check')
        if(isChecked){
            localStorage.setItem('isHttps','1')
            setBaseUrl('/https-api')
        }else {
            setBaseUrl('/prod-api')
            localStorage.removeItem('isHttps')

        }
    },[isChecked])
    return (
        <div>
            <Form
                name="basic"
                labelCol={{span: 8}}
                wrapperCol={{span: 16}}
                initialValues={{remember: true}}
                onFinish={onFinish}
                autoComplete="off"
                form={form}
            >
                <Form.Item
                    label="模块"
                    name="mode"
                    rules={[{required: true, message: '请输入您的URL'}]}
                >
                    <Select onChange={handleModeChange} size="large" options={modeOptions}
                            fieldNames={{label: 'name', value: 'name'}} key={'id'}/>
                </Form.Item>
                <Form.Item
                    label="Tags"
                    name="tags"
                    rules={[{required: true, message: '请输入您的tag'}]}
                >
                    <Select
                        onChange={handleTagChange}
                        size="large"
                        showSearch
                        onSearch={handleSearch}
                        allowClear={true}
                        options={(optionsPath || []).map(d => ({
                            value: d.tagName,
                            label: d.tagName,
                            other: d.options,
                            key: d.tagName
                        }))}
                    />
                </Form.Item>
                <Form.Item
                    label="Url"
                    name="url"
                >
                    <Input
                        size="large"
                    />
                </Form.Item>
                <Form.Item wrapperCol={{offset: 8, span: 16}}>
                    <Button type="primary" htmlType="submit" style={{marginRight: '10px'}}>
                        一键生成
                    </Button>
                    <Button type={'primary'} onClick={handleForm}>单个搜索</Button>
                </Form.Item>
            </Form>
            <VueCode></VueCode>
            <Button type={'primary'} onClick={handleHide}>显示隐藏</Button>
            {flag && <div className={'box'}>
                <div className={'inner'}>
                    <Input.TextArea rows={30} value={apiStr}></Input.TextArea>
                    <Button style={{margin: '10px'}} type="primary" onClick={() => handleCopy(apiStr)}>复制Api</Button>
                </div>
                <div className={'inner'}>
                    <Input.TextArea rows={30} value={dtoStr}></Input.TextArea>
                    <Button style={{margin: '10px'}} type="primary" onClick={() => handleCopy(dtoStr)}>复制Dto</Button>
                </div>
            </div>}
            <div>
                <div className={'flexCenter'}>
                    <div className={'flexCenter'} style={{width: '300px', marginRight: '10px'}}>
                        <div style={{marginRight: '10px'}}>token</div>
                        <Input value={token} onChange={(e) => {
                            localStorage.setItem('token', e.target.value)
                            setToken(e.target.value)
                        }}></Input>
                    </div>
                    <div className={'flexCenter'} style={{width: '300px', marginRight: '10px'}}>
                        <div style={{marginRight: '10px'}}>PID</div>
                       {/* <Input value={pid} onChange={(e) => {
                            setPid(e.target.value)
                        }}></Input>*/}
                        <TreeSelect
                            showSearch
                            style={{ width: '100%' }}
                            value={pid}
                            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                            placeholder="Please select"
                            allowClear
                            treeDefaultExpandAll
                            onChange={onChange}
                            treeData={treeData}
                            fieldNames={{
                                label: 'name',
                                value: 'id',
                                children: 'children',
                            }}
                        />
                    </div>
                    <div>
                        <Select
                            size="large"
                            showSearch
                            placeholder='选择角色'
                            onSearch={roleFilter}
                            allowClear={true}
                            style={{width:200}}
                            onChange={handleRoleChange}
                            options={(roleData || []).map(d => ({
                                value: d.id,
                                label: d.name,

                                key: d.id
                            }))}
                        />
                    </div>
                    <div>
                        {/*<Button onClick={login} type={'primary'}>登录</Button>*/}
                        <span style={{marginRight:10}}>是否HTTPS</span>
                        <Switch checked={isChecked} onChange={(e)=>setIsChecked(e)} ></Switch>
                        <Button onClick={getTreeData}>获取PID树形数据</Button>
                        <Button onClick={handleSend}>批量登记</Button></div>
                </div>

                <Table columns={columns} dataSource={tableData} key={'urlperm'}/>
            </div>
        </div>
    );
};

export default App;
