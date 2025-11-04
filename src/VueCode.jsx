import {Button, Col, Form, Input, Row} from "antd";
import {useState} from "react";
import {Http} from "./util";

const VueCode = () => {
    const [visible, setVisible] = useState(true)
    const [textVisible, setTextVisible] = useState(false)
    const [info, setInfo] = useState({})
    const generateCode = async (formData) => {
        console.log('123456',formData)
       const {data} = await Http.post('/api/vuecode', formData)
        setInfo(data.data)
        setTextVisible(true)
        console.log(data,'ddd')
    }
    return (
        <>
            {/* 中文注释：表单控制按钮 */}
            <div style={{marginBottom: 12}}>
                <Button onClick={() => setVisible(!visible)}>填写/收起 Vue 表单</Button>
            </div>

            {/* 中文注释：Vue 表单区域，保持原有字段，仅包装样式 */}
            {visible && <div>
                <Form labelCol={{span: 8}}
                      wrapperCol={{span: 16}} onFinish={generateCode}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="新增Api" name='addApi'>
                                <Input placeholder="请输入接口名称"/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="新增Dto" name='addDto'>
                                <Input placeholder="请输入接口名称"/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="删除Api" name='delApi'>
                                <Input placeholder="请输入接口名称"/>
                            </Form.Item>
                        </Col>

                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="更新Api"  name='updateApi'>
                                <Input placeholder="请输入接口名称"/>
                            </Form.Item>
                        </Col>

                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="分页Api"  name='pageApi'>
                                <Input placeholder="请输入接口名称"/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="分页Dto"  name='pageDto'>
                                <Input placeholder="请输入接口名称"/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="查询Api"  name='queryApi'>
                                <Input placeholder="请输入接口名称"/>
                            </Form.Item>
                        </Col>

                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="刷新缓存Api"  name='refreshApi'>
                                <Input placeholder="请输入接口名称"/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="提交">
                                <Button htmlType={'submit'} type='primary'>生成Vue代码</Button>
                            </Form.Item>
                        </Col>
                    </Row>


                </Form>
            </div>}
            {/* 中文注释：生成的 Vue 代码展示区域 */}
            {
                textVisible && <div style={{marginTop: 12}}>
                    <Input.TextArea value={info} rows={30}></Input.TextArea>
                </div>
            }
        </>
    )
}

export default VueCode
