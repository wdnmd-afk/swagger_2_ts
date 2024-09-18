import { Button, Form, Input, message, Select } from 'antd';
import { useState, useEffect } from 'react';
import { Http } from './util';

const App = () => {
    const [options, setOptions] = useState([]);
    const [optionsPath, setOptionsPath] = useState([]);
    const [params, setParams] = useState([]);
    const [apiStr, setApiStr] = useState('');
    const [dtoStr, setDtoStr] = useState('');

    // 页面初始化
    useEffect( () => {
        const initPage = async () => {
            const { data } = await Http.get('/api/list');
            setOptions(data.data.urls);
        };
        initPage();
    }, []);

    // 处理表单提交
    const onFinish = async (values) => {
        if (!values.tags) {
            return message.error('请选择必填参数');
        }
        const { data } = await Http.post('/api/merge', {
            mode: values.mode,
            tags: values.tags,
            options: params
        });
        setApiStr(data.data.api);
        setDtoStr(data.data.dto);
    };

    // 处理模块变更
    const handleModeChange = async (value) => {
        const { data } = await Http.post('/api/docs', { path: value });
        setOptionsPath(data.data);
    };

    // 处理tag变更
    const handleTagChange = async (value, option) => {
        setParams(option.other);
    };

    // 复制文本到剪切板
    const handleCopy = async (str) => {
        if (!str) return;
        if(!navigator.clipboard) return message.error('当前浏览器不支持复制功能');
        await navigator.clipboard.writeText(str);
        message.success('复制成功');
    };

    return (
        <div>
            <Form
                name="basic"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                initialValues={{ remember: true }}
                onFinish={onFinish}
                autoComplete="off"
            >
                <Form.Item
                    label="模块"
                    name="mode"
                    rules={[{ required: true, message: '请输入您的URL' }]}
                >
                    <Select onChange={handleModeChange} size="large" options={options}
                            fieldNames={{ label: 'name', value: 'name' }} />
                </Form.Item>
                <Form.Item
                    label="Tags"
                    name="tags"
                    rules={[{ required: true, message: '请输入您的tag' }]}
                >
                    <Select
                        onChange={handleTagChange}
                        size="large"
                        options={(optionsPath || []).map(d => ({
                            value: d.tagName,
                            label: d.tagName,
                            other: d.options
                        }))}
                    />
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button type="primary" htmlType="submit">
                        一键生成
                    </Button>
                </Form.Item>
            </Form>
            <div className={'box'}>
                <div className={'inner'}>
                    <Input.TextArea rows={30} value={apiStr}></Input.TextArea>
                    <Button style={{ margin: '10px' }} type="primary" onClick={() => handleCopy(apiStr)}>复制Api</Button>
                </div>
                <div className={'inner'}>
                    <Input.TextArea rows={30} value={dtoStr}></Input.TextArea>
                    <Button style={{ margin: '10px' }} type="primary" onClick={() => handleCopy(dtoStr)}>复制Dto</Button>
                </div>
            </div>
        </div>
    );
};

export default App;
