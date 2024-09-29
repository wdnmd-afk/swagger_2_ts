import {Button, Form, Input, message, Select, Table} from 'antd';
import {useState, useEffect} from 'react';
import {Http} from './util';
import './App.css'
import axios from "axios";

const App = () => {
    //模块
    const [modeOptions, setModeOptions] = useState([]);
    //模块路径
    const [optionsPath, setOptionsPath] = useState([]);
    const [params, setParams] = useState([]);
    const [apiStr, setApiStr] = useState('');
    const [dtoStr, setDtoStr] = useState('');
    const [tableData, setTableData] = useState([]);
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
        initPage();
    }, []);

    // 处理表单提交
    const onFinish = async (values) => {
        if (!values.mode) {
            return message.error('请选择必填参数');
        }
        const {data} = await Http.post('/api/merge', {
            mode: values.mode,
            options: values.options?values.options:params
        });
        setApiStr(data.data.api);
        setDtoStr(data.data.dto);
        const res = await Http.post('/api/resource', {options: values.options?values.options:params, mode: values.mode});
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
    const [flag, setFlag] = useState(true)
    const handleHide = () => {
        setFlag(!flag)
    }
    const [token, setToken] = useState('')
    const [pid, setPid] = useState('')
    const findItemInArray = (arr, url) => {
    const res = []
        arr.forEach((item) => {
            if(item.options.length){
                item.options.forEach((option) => {
                    if(option.url.includes(url)){
                        res.push(option)
                    }
                })
            }

        })
        return res
    }
    //批量登记
    const handleSend = async () => {
        tableData.forEach((item) => {
            axios.post('/prod-api/admin/api/v1/operation/addOperation', {...item, pid}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }
            }).then((res) => {
                message.success(item.urlperm + res.data.msg)
            })
        })
    }
    //表单Ref
    const [form] = Form.useForm();
    const handleForm = () => {
        const formData = form.getFieldsValue();
        if(!formData.url) return
        const options = findItemInArray(optionsPath,formData.url.trim())
        console.log(options)
        if(options.length){
onFinish({mode:formData.mode,options})
        }
    }
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
                            other: d.options
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
                        <Input value={pid} onChange={(e) => {
                            setPid(e.target.value)
                        }}></Input>
                    </div>
                    <div><Button onClick={handleSend}>批量登记</Button></div>
                </div>

                <Table columns={columns} dataSource={tableData} key={'urlperm'}/>
            </div>
        </div>
    );
};

export default App;
