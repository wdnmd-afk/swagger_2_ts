import { useState, useEffect } from 'react';
import { Form, Input, Button, TreeSelect, Select, message, InputNumber, Radio } from 'antd';
import { useGlobalContext } from './GlobalContext';
import { Http } from './util';

// 菜单配置组件
const MenuConfig = () => {
    const { token, roleId, baseUrl } = useGlobalContext();
    const [form] = Form.useForm();
    
    // 上级菜单树形数据
    const [menuTreeData, setMenuTreeData] = useState([]);
    
    // 资源组别数据
    const [resourceGroupOptions, setResourceGroupOptions] = useState([]);
    
    // 系统列表数据
    const [applicationOptions, setApplicationOptions] = useState([]);
    
    // 选中的系统 ID
    const [selectedApplicationId, setSelectedApplicationId] = useState('');
    
    // 选中的上级菜单信息
    const [selectedParentMenu, setSelectedParentMenu] = useState(null);
    
    // 加载状态
    const [loading, setLoading] = useState(false);
    const [configLoading, setConfigLoading] = useState(false);

    // 获取上级菜单树形数据
    const getMenuTree = async () => {
        try {
            console.log('开始获取上级菜单, baseUrl:', baseUrl, 'token:', token ? '已配置' : '未配置');
            const { data } = await Http.post(
                `${baseUrl}/admin/api/v1/baseresource/getBaseResourceTree`,
                { name: '', url: '' },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    }
                }
            );
            
            console.log('上级菜单接口返回:', data);
            
            // 判断接口是否成功
            if (data.code && data.code !== '00000') {
                message.error('获取上级菜单失败: ' + (data.msg || '未知错误'));
                return;
            }
            
            // 判断data是数组还是对象
            const menuData = Array.isArray(data) ? data : (data.data || []);
            console.log('设置菜单树数据, 数据长度:', menuData.length);
            setMenuTreeData(menuData);
            if (menuData.length > 0) {
                message.success('获取上级菜单成功');
            } else {
                console.warn('上级菜单数据为空');
                message.warning('上级菜单数据为空');
            }
        } catch (error) {
            console.error('获取上级菜单失败:', error);
            message.error('获取上级菜单失败: ' + (error.message || '未知错误'));
        }
    };

    // 获取资源组别数据
    const getResourceGroups = async () => {
        try {
            console.log('开始获取资源组别, baseUrl:', baseUrl, 'token:', token ? '已配置' : '未配置');
            const { data } = await Http.post(
                `${baseUrl}/admin/api/v1/sysdictdata/querySysDictDataIdAndName`,
                { dictType: 'menu_base_resource_group' },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    }
                }
            );
            
            console.log('资源组别接口返回:', data);
            
            // 判断接口是否成功
            if (data.code && data.code !== '00000') {
                message.error('获取资源组别失败: ' + (data.msg || '未知错误'));
                return;
            }
            
            if (data) {
                console.log('设置资源组别数据, 数据长度:', data.length);
                setResourceGroupOptions(data);
                message.success('获取资源组别成功');
            } else {
                console.warn('资源组别数据为空');
            }
        } catch (error) {
            console.error('获取资源组别失败:', error);
            message.error('获取资源组别失败: ' + (error.message || '未知错误'));
        }
    };

    // 获取系统列表数据
    const getApplicationList = async () => {
        try {
            console.log('开始获取系统列表, baseUrl:', baseUrl, 'token:', token ? '已配置' : '未配置');
            const { data } = await Http.post(
                `${baseUrl}/admin/api/v1/application/getApplicationIdAndName`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    }
                }
            );
            
            console.log('系统列表接口返回:', data);
            
            // 判断接口是否成功
            if (data.code && data.code !== '00000') {
                message.error('获取系统列表失败: ' + (data.msg || '未知错误'));
                return;
            }
            
            // 判断data是数组还是对象
            const appData = Array.isArray(data) ? data : (data.data || []);
            console.log('设置系统列表数据, 数据长度:', appData.length);
            setApplicationOptions(appData);
            if (appData.length > 0) {
                message.success('获取系统列表成功');
            } else {
                console.warn('系统列表数据为空');
                message.warning('系统列表数据为空');
            }
        } catch (error) {
            console.error('获取系统列表失败:', error);
            message.error('获取系统列表失败: ' + (error.message || '未知错误'));
        }
    };

    // 移除自动加载,改为手动触发
    // useEffect(() => {
    //     if (token) {
    //         getMenuTree();
    //         getResourceGroups();
    //     }
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [token, baseUrl]);

    // 提交新增菜单
    const onFinish = async (values) => {
        if (!token) {
            message.error('请先配置token');
            return;
        }

        setLoading(true);
        
        try {
            // 构建请求参数
            const params = {
                id: '',
                baseResourceGroupId: values.baseResourceGroupId,
                component: values.component,
                iconBase64: '', // 写死为空字符串
                name: values.name,
                path: '/home/leftNav/', // 写死
                pid: values.pid,
                remark: '', // 写死为空
                resourcetype: values.resourcetype, // 权限类型: 1-页面, 2-主(子)菜单
                sort: values.sort || 1, // 默认为1
                url: `/home/leftNav/${values.component}` // 拼接component
            };

            const { data } = await Http.post(
                `${baseUrl}/admin/api/v1/baseresource/addBaseResource`,
                params,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    }
                }
            );

            console.log('新增菜单接口返回:', data);
            
            // 判断接口是否成功
            if (data && data.code && data.code !== '00000') {
                message.error('新增菜单失败: ' + (data.msg || '未知错误'));
                return;
            }
            
            message.success('新增菜单成功');
            
            // 刷新菜单树
            await getMenuTree();
            
            // 返回新增的菜单名称,供一键配置使用
            return values.name;
            
        } catch (error) {
            message.error('新增菜单失败: ' + (error.response?.data?.msg || error.message || '未知错误'));
        } finally {
            setLoading(false);
        }
    };

    // 新增并配置菜单
    const addAndAssignMenu = async () => {
        try {
            // 先新增菜单
            const menuName = await onFinish(form.getFieldsValue());
            if (!menuName) {
                return; // 新增失败
            }
            
            // 再配置给角色
            await assignMenuToRole(menuName);
        } catch (error) {
            console.error('新增并配置失败:', error);
        }
    };

    // 只配置给角色(不新增菜单)
    const assignExistingMenuToRole = async () => {
        try {
            const values = form.getFieldsValue();
            if (!values.name) {
                message.warning('请输入菜单名称');
                return;
            }
            await assignMenuToRole(values.name);
        } catch (error) {
            console.error('配置失败:', error);
        }
    };

    // 一键刷新所有数据
    const refreshAll = async () => {
        try {
            message.loading('正在刷新所有数据...', 0);
            await Promise.all([
                getMenuTree(),
                getResourceGroups(),
                getApplicationList()
            ]);
            message.destroy();
            message.success('全部刷新成功');
        } catch (error) {
            message.destroy();
            message.error('刷新失败: ' + (error.message || '未知错误'));
        }
    };

    // 一键配置菜单给系统和角色
    const assignMenuToRole = async (menuName) => {
        if (!roleId) {
            message.warning('请先选择角色');
            return;
        }

        if (!selectedApplicationId) {
            message.warning('请先选择系统');
            return;
        }

        if (!menuName) {
            message.warning('请先输入菜单名称');
            return;
        }

        setConfigLoading(true);
        try {
            console.log('开始配置菜单:', { menuName, applicationId: selectedApplicationId, roleId });

            // 步骤1: 调用接口7 - 查询菜单信息
            console.log('步骤1: 查询菜单信息...');
            const step1Response = await Http.post(
                `${baseUrl}/admin/api/v1/baseresource/queryBaseResourcePageList`,
                {
                    page: 1,
                    limit: 50,
                    name: '',
                    roleIds: [],
                    resourceId: '',
                    resourcePid: '',
                    resourceUrl: '',
                    resourceName: menuName, // 使用输入的菜单名称
                    dateTimeDto: {
                        beginTime: '',
                        endTime: ''
                    },
                    baseResourceGroupId: null
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    }
                }
            );
            
            console.log('步骤1完成(完整响应):', step1Response);
            // axios返回格式: {data: {code, data, msg}}
            const responseData = step1Response.data;
            console.log('步骤1完成(响应数据):', responseData);
            
            // 判断接口是否成功
            if (responseData && responseData.code && responseData.code !== '00000') {
                message.error('查询菜单信息失败: ' + (responseData.msg || '未知错误'));
                return;
            }
            
            // 判断是数组还是对象格式
            let menuList = [];
            if (Array.isArray(responseData)) {
                menuList = responseData;
            } else if (responseData.data) {
                menuList = responseData.data;
            }
            
            console.log('解析后的菜单列表:', menuList);
            
            if (!menuList || menuList.length === 0) {
                message.error('未找到该菜单,请检查菜单名称是否正确');
                return;
            }
            
            // 取第一个匹配的菜单
            const menuInfo = menuList[0];
            const { resourceId, pid, sortOrder } = menuInfo;
            console.log('查询到菜单信息:', { resourceId, pid, sortOrder, menuInfo });
            message.success(`步骤1: 查询菜单信息成功 (找到${menuList.length}条记录)`);

            // 步骤2: 调用接口5 - 菜单配置给系统
            console.log('步骤2: 配置菜单给系统...');
            const { data: step2Data } = await Http.post(
                `${baseUrl}/admin/api/v1/resource/saveApplicationResourceBatch`,
                { 
                    applicationId: selectedApplicationId,
                    createOrUpdateBaseResourceDtoList: [
                        {
                            baseResourcePId: pid,
                            baseResourceId: resourceId,
                            sortOrder: sortOrder
                        }
                    ]
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    }
                }
            );
            console.log('步骤2完成:', step2Data);
            
            // 判断接口是否成功
            if (step2Data && step2Data.code && step2Data.code !== '00000') {
                message.error('菜单配置给系统失败: ' + (step2Data.msg || '未知错误'));
                return;
            }
            
            message.success('步骤2: 菜单配置给系统成功');

            // 步骤3: 调用接口6 - 菜单配给角色
            console.log('步骤3: 配置菜单给角色...');
            console.log('选中的上级菜单信息(baseResource):', selectedParentMenu);
            console.log('当前菜单信息(baseResource):', { resourceId, pid, sortOrder, menuName });
            
            // 步骤3.1: 调用接口8 - 获取该系统的所有菜单
            console.log('步骤3.1: 获取系统所有菜单...');
            const { data: step3_1Data } = await Http.post(
                `${baseUrl}/admin/api/v1/resource/queryResourcePageList`,
                {
                    page: 1,
                    limit: 50,
                    resourceName: '',
                    resourceUrl: '',
                    applicationId: selectedApplicationId
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    }
                }
            );
            
            console.log('步骤3.1完成:', step3_1Data);
            
            // 判断接口是否成功
            if (step3_1Data && step3_1Data.code && step3_1Data.code !== '00000') {
                message.error('获取系统菜单失败: ' + (step3_1Data.msg || '未知错误'));
                return;
            }
            
            // 判断是数组还是对象格式
            let systemMenuList = [];
            if (Array.isArray(step3_1Data)) {
                systemMenuList = step3_1Data;
            } else if (step3_1Data && step3_1Data.data) {
                systemMenuList = step3_1Data.data;
            }
            
            console.log('系统菜单列表(共' + systemMenuList.length + '条):', systemMenuList);
            console.log('要查找的上级菜单名称:', selectedParentMenu?.baseResourceName);
            
            // 检查selectedParentMenu是否存在
            if (!selectedParentMenu) {
                message.error('未选择上级菜单,请先在表单中选择上级菜单');
                return;
            }
            
            // 根据上级菜单的baseResourceName找到对应的resource
            const parentResource = systemMenuList.find(item => {
                console.log('比较:', item.resourceName, '===', selectedParentMenu.baseResourceName);
                return item.resourceName === selectedParentMenu.baseResourceName;
            });
            
            if (!parentResource) {
                message.error('未找到上级菜单对应的系统资源,请确认上级菜单"' + selectedParentMenu.baseResourceName + '"已配置到该系统');
                console.error('查找失败,上级菜单名称:', selectedParentMenu.baseResourceName);
                console.error('系统菜单列表:', systemMenuList.map(item => item.resourceName));
                return;
            }
            
            console.log('找到上级菜单的系统资源:', parentResource);
            
            // 步骤3.2: 调用接口9 - 根据上级菜单的resourceId获取子菜单列表
            console.log('步骤3.2: 获取子菜单列表...');
            const { data: step3_2Data } = await Http.post(
                `${baseUrl}/admin/api/v1/resource/queryResourceByPid`,
                {
                    resourceId: parentResource.resourceId
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    }
                }
            );
            
            console.log('步骤3.2完成:', step3_2Data);
            
            if (step3_2Data && step3_2Data.code && step3_2Data.code !== '00000') {
                message.error('获取子菜单列表失败: ' + (step3_2Data.msg || '未知错误'));
                return;
            }
            
            // 判断是数组还是对象格式
            let childMenuList = [];
            if (Array.isArray(step3_2Data)) {
                childMenuList = step3_2Data;
            } else if (step3_2Data && step3_2Data.data) {
                childMenuList = step3_2Data.data;
            }
            
            console.log('子菜单列表(共' + childMenuList.length + '条):', childMenuList);
            console.log('要查找的当前菜单名称:', menuName);
            
            // 根据当前菜单名称找到对应的resource
            const currentResource = childMenuList.find(item => {
                console.log('比较子菜单:', item.resourceName, '===', menuName);
                return item.resourceName === menuName;
            });
            
            if (!currentResource) {
                message.error('未找到当前菜单对应的系统资源,请确认菜单"' + menuName + '"已配置到该系统');
                console.error('查找失败,当前菜单名称:', menuName);
                console.error('子菜单列表:', childMenuList.map(item => item.resourceName));
                return;
            }
            
            console.log('找到当前菜单的系统资源:', currentResource);
            
            // 构建createOrUpdateResourceDtoList
            const resourceDtoList = [];
            
            // 第一条:上级菜单本身
            resourceDtoList.push({
                resourcePId: parentResource.pid,
                resourceId: parentResource.resourceId,
                sortOrder: parentResource.sortOrder
            });
            console.log('添加上级菜单:', resourceDtoList[0]);
            
            // 第二条:当前菜单
            resourceDtoList.push({
                resourcePId: currentResource.pid,
                resourceId: currentResource.resourceId,
                sortOrder: currentResource.sortOrder
            });
            console.log('添加当前菜单:', resourceDtoList[1]);
            console.log('最终的resourceDtoList(共' + resourceDtoList.length + '条):', resourceDtoList);
            
            const { data: step3Data } = await Http.post(
                `${baseUrl}/admin/api/v1/roleResource/saveRoleResourceBatch`,
                {
                    createOrUpdateResourceDtoList: resourceDtoList,
                    roleId: roleId,
                    roleName: '', // 角色名称可以为空
                    applicationId: selectedApplicationId
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    }
                }
            );
            console.log('步骤3完成:', step3Data);
            
            // 判断接口是否成功
            if (step3Data && step3Data.code && step3Data.code !== '00000') {
                message.error('菜单配给角色失败: ' + (step3Data.msg || '未知错误'));
                return;
            }
            
            message.success(`步骤3: 菜单配给角色成功 (配置了${resourceDtoList.length}条记录)`);

            message.success('一键配置完成!');
        } catch (error) {
            console.error('配置失败:', error);
            message.error('配置失败: ' + (error.response?.data?.msg || error.message || '未知错误'));
        } finally {
            setConfigLoading(false);
        }
    };

    // 调试: 监听状态变化
    useEffect(() => {
        console.log('menuTreeData 状态更新:', menuTreeData.length, '条数据');
    }, [menuTreeData]);

    useEffect(() => {
        console.log('resourceGroupOptions 状态更新:', resourceGroupOptions.length, '条数据');
    }, [resourceGroupOptions]);

    useEffect(() => {
        console.log('applicationOptions 状态更新:', applicationOptions.length, '条数据');
    }, [applicationOptions]);

    return (
        <div style={{ marginTop: 24 }}>
            <div style={{ marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Button onClick={refreshAll} type="primary" icon="🔄">
                    一键刷新全部
                </Button>
                <Button onClick={getMenuTree} type="default">
                    刷新上级菜单 (当前: {menuTreeData.length}条)
                </Button>
                <Button onClick={getResourceGroups} type="default">
                    刷新资源组别 (当前: {resourceGroupOptions.length}条)
                </Button>
                <Button onClick={getApplicationList} type="default">
                    刷新系统列表 (当前: {applicationOptions.length}条)
                </Button>
            </div>

            {/* 系统选择区域 */}
            <div style={{ marginBottom: 16, padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
                <div style={{ marginBottom: 8, fontWeight: 'bold' }}>配置设置:</div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span>选择系统:</span>
                    <Select
                        style={{ width: 300 }}
                        placeholder="请选择系统"
                        value={selectedApplicationId}
                        onChange={setSelectedApplicationId}
                        options={applicationOptions.map(item => ({
                            label: item.name,
                            value: item.id,
                            key: item.id
                        }))}
                    />
                    {!roleId && <span style={{ color: '#ff4d4f' }}>请先选择角色</span>}
                    {!selectedApplicationId && <span style={{ color: '#ff4d4f' }}>请先选择系统</span>}
                </div>
            </div>

            <Form
                form={form}
                name="menuConfig"
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                onFinish={onFinish}
                autoComplete="off"
            >
                {/* 上级菜单选择 */}
                <Form.Item
                    label="上级菜单"
                    name="pid"
                    rules={[{ required: true, message: '请选择上级菜单' }]}
                >
                    <TreeSelect
                        showSearch
                        style={{ width: '100%' }}
                        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                        placeholder="请选择上级菜单"
                        allowClear
                        treeDefaultExpandAll
                        treeData={menuTreeData}
                        fieldNames={{
                            label: 'baseResourceName',
                            value: 'id',
                            children: 'children',
                        }}
                        onChange={(value) => {
                            // 保存选中的上级菜单信息
                            console.log('选中上级菜单ID:', value);
                            if (value) {
                                // 从menuTreeData中递归查找对应的节点
                                const findNode = (data, id) => {
                                    for (const item of data) {
                                        if (item.id === id) {
                                            return item;
                                        }
                                        if (item.children && item.children.length > 0) {
                                            const found = findNode(item.children, id);
                                            if (found) return found;
                                        }
                                    }
                                    return null;
                                };
                                
                                const node = findNode(menuTreeData, value);
                                console.log('找到的节点信息:', node);
                                
                                if (node) {
                                    setSelectedParentMenu({
                                        id: node.id,
                                        pid: node.pid || '0',
                                        sort: node.sort || 1,
                                        baseResourceName: node.baseResourceName
                                    });
                                    console.log('保存上级菜单信息:', {
                                        id: node.id,
                                        pid: node.pid || '0',
                                        sort: node.sort || 1
                                    });
                                }
                            } else {
                                setSelectedParentMenu(null);
                                console.log('清空上级菜单信息');
                            }
                        }}
                        filterTreeNode={(inputValue, treeNode) => {
                            // 根据baseResourceName进行过滤
                            return treeNode.baseResourceName && 
                                   treeNode.baseResourceName.toLowerCase().includes(inputValue.toLowerCase());
                        }}
                    />
                </Form.Item>

                {/* 资源组别选择 */}
                <Form.Item
                    label="资源组别"
                    name="baseResourceGroupId"
                    initialValue={1}
                    rules={[{ required: true, message: '请选择资源组别' }]}
                >
                    <Select
                        placeholder="请选择资源组别"
                        options={resourceGroupOptions.map(item => ({
                            label: item.name,
                            value: item.dictValue,
                            key: item.id
                        }))}
                    />
                </Form.Item>

                {/* 菜单名称 */}
                <Form.Item
                    label="菜单名称"
                    name="name"
                    rules={[{ required: true, message: '请输入菜单名称' }]}
                >
                    <Input placeholder="请输入菜单名称" />
                </Form.Item>

                {/* 组件路径 */}
                <Form.Item
                    label="组件路径"
                    name="component"
                    rules={[{ required: true, message: '请输入组件路径' }]}
                    tooltip="例如: Manufacturer, roleMenu 等"
                >
                    <Input placeholder="请输入组件路径 (例如: Manufacturer)" />
                </Form.Item>

                {/* 权限类型 */}
                <Form.Item
                    label="权限类型"
                    name="resourcetype"
                    initialValue={1}
                    rules={[{ required: true, message: '请选择权限类型' }]}
                >
                    <Radio.Group>
                        <Radio value={1}>页面</Radio>
                        <Radio value={2}>主(子)菜单</Radio>
                    </Radio.Group>
                </Form.Item>

                {/* 排序 */}
                <Form.Item
                    label="排序"
                    name="sort"
                    initialValue={1}
                >
                    <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入排序值" />
                </Form.Item>

                {/* 提交按钮 */}
                <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        新增菜单
                    </Button>
                    <Button 
                        type="primary"
                        style={{ marginLeft: 10 }}
                        onClick={addAndAssignMenu}
                        loading={configLoading}
                        disabled={!roleId || !selectedApplicationId}
                    >
                        新增并配置给角色
                    </Button>
                    <Button 
                        style={{ marginLeft: 10, backgroundColor: '#52c41a', borderColor: '#52c41a', color: '#fff' }}
                        onClick={assignExistingMenuToRole}
                        loading={configLoading}
                        disabled={!roleId || !selectedApplicationId}
                    >
                        配置给角色
                    </Button>
                    <Button 
                        style={{ marginLeft: 10 }} 
                        onClick={() => form.resetFields()}
                    >
                        重置
                    </Button>
                </Form.Item>
            </Form>

            {/* 功能提示 */}
            <div style={{ 
                marginTop: 16, 
                padding: 12, 
                background: '#e6f7ff', 
                borderRadius: 4,
                border: '1px solid #91d5ff',
                color: '#666'
            }}>
                <strong>使用说明:</strong>
                <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
                    <li><strong>新增菜单</strong>: 只新增菜单,不配置权限</li>
                    <li><strong>新增并配置给角色</strong>: 先新增菜单,再自动配置给选中的系统和角色</li>
                    <li><strong>配置给角色</strong>: 不新增菜单,只将现有菜单配置给选中的系统和角色</li>
                    <li><strong>一键刷新全部</strong>: 同时刷新上级菜单、资源组别、系统列表</li>
                    <li>配置时会自动带上上级菜单的层级结构</li>
                </ul>
            </div>
        </div>
    );
};

export default MenuConfig;
