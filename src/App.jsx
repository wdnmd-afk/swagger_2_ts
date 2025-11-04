import {Button, Form, Input, message, Select, Switch, Table, TreeSelect, Tabs} from 'antd';
import {useEffect, useState} from 'react';
import {Http} from './util';
import './App.css'
import axios from "axios";
import VueCode from "./VueCode.jsx";

import EncryptDecrypt from './EncryptDecrypt.jsx';
import CodeGenerator from './CodeGenerator.jsx';

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


 
    const [roleId,setRoleId] = useState('')
    //批量登记
    const handleSend = async () => {
        tableData.forEach((item) => {
            console.log(item,'ddd')
            Http.post(baseUrl+'/admin/api/v1/operation/addOperation', {...item, pid}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }
            }).then((res) => {
                console.log(res,item)
                message.success(item.urlperm + (res?.msg?res?.msg:res.data.msg))
                console.log(roleId,'rrr')
                if(!roleId) return
               // if(!res?.msg.includes('重复')){
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
               // }

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
        <div className="container">
            {/* 中文注释：顶层容器使用 decrypt 风格的白色卡片 */}
            <h1 className="page-title">一键生成TS</h1>

            {/* 中文注释：通过 Tabs 切换功能模块，“权限登记” 与 “加密/解密” */}
            <Tabs
                defaultActiveKey="perm"
                items={[
                    {
                        key: 'perm',
                        label: '权限登记',
                        children: (
                            <>
                                {/* 中文注释：参数选择 独占一栏 */}
                                <div className="section">
                                    <h2 className="section-title">参数选择</h2>
                                    <Form
                                        name="basic"
                                        labelCol={{span: 6}}
                                        wrapperCol={{span: 18}}
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
                                            <Input size="large" />
                                        </Form.Item>
                                        <Form.Item wrapperCol={{offset: 6, span: 18}}>
                                            <Button type="primary" htmlType="submit" style={{marginRight: '10px'}}>
                                                一键生成
                                            </Button>
                                            <Button type={'primary'} onClick={handleForm}>单个搜索</Button>
                                        </Form.Item>
                                    </Form>
                                </div>

                                {/* 中文注释：生成结果 独占一栏 */}
                                <div className="section">
                                    <h2 className="section-title">生成结果</h2>
                                    <Button type={'primary'} onClick={handleHide} style={{marginBottom: 12}}>显示/隐藏</Button>
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
                                </div>

                                {/* 中文注释：系统配置与批量登记 独占一栏 */}
                                <div className="section">
                                    <h2 className="section-title">系统配置与批量登记</h2>
                                    <div className={'action-bar'}>
                                        <div className={'flexCenter'} style={{width: '300px'}}>
                                            <div style={{marginRight: '10px'}}>token</div>
                                            <Input value={token} onChange={(e) => {
                                                localStorage.setItem('token', e.target.value)
                                                setToken(e.target.value)
                                            }}></Input>
                                        </div>
                                        <div className={'flexCenter'} style={{width: '300px'}}>
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
                                        <div className={'flexCenter'} style={{gap: 8}}>
                                            {/*<Button onClick={login} type={'primary'}>登录</Button>*/}
                                            <span style={{marginRight:10}}>是否HTTPS</span>
                                            <Switch checked={isChecked} onChange={(e)=>setIsChecked(e)} ></Switch>
                                            <Button onClick={getTreeData}>获取PID树形数据</Button>
                                            <Button onClick={handleSend}>批量登记</Button>
                                        </div>
                                    </div>

                                    <div style={{marginTop: 12}}>
                                        <Table columns={columns} dataSource={tableData} key={'urlperm'}/>
                                    </div>
                                </div>

                                {/* 中文注释：Vue 代码生成 独占整栏，放置在页面最下方 */}
                                <div className="section">
                                    <h2 className="section-title">Vue代码生成</h2>
                                    <VueCode></VueCode>
                                </div>
                            </>
                        )
                    },
                    {
                        key: 'enc',
                        label: '加密/解密',
                        children: (
                            <div className="section" style={{padding:0, border:'none', background:'transparent'}}>
                                <EncryptDecrypt />
                            </div>
                        )
                    },
                    {
                        key: 'codegen',
                        label: '码生成器',
                        children: (
                            <div className="section" style={{padding:0, border:'none', background:'transparent'}}>
                                {/* 中文注释：二维码/条形码生成器 Tab 页面 */}
                                <CodeGenerator />
                            </div>
                        )
                    }
                ]}
            />
        </div>
    );
};

export default App;
