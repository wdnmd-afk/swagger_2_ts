import { Input, Switch, Select, Button } from 'antd';
import { useGlobalContext } from './GlobalContext';

// 共享配置组件 - 包含token、角色选择、Https开关
const SharedConfig = ({ roleData, onGetTreeData, onRefreshRoles }) => {
    const { token, setToken, roleId, setRoleId, isHttps, setIsHttps } = useGlobalContext();

    // 角色下拉过滤
    const roleFilter = (newVal) => {
        return roleData.filter((d) => {
            return d.name.includes(newVal);
        });
    };

    // 角色选择变化
    const handleRoleChange = (data) => {
        setRoleId(data);
    };

    return (
        <div className={'action-bar'}>
            {/* Token输入框 */}
            <div className={'flexCenter'} style={{ width: '300px' }}>
                <div style={{ marginRight: '10px' }}>token</div>
                <Input
                    value={token}
                    onChange={(e) => {
                        setToken(e.target.value);
                    }}
                />
            </div>

            {/* 角色选择下拉框 */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Select
                    size="large"
                    showSearch
                    placeholder='选择角色'
                    value={roleId || undefined}
                    onSearch={roleFilter}
                    allowClear={true}
                    style={{ width: 200 }}
                    onChange={handleRoleChange}
                    options={(roleData || []).map(d => ({
                        value: d.id,
                        label: d.name,
                        key: d.id
                    }))}
                />
                {onRefreshRoles && (
                    <Button onClick={onRefreshRoles}>刷新角色</Button>
                )}
            </div>

            {/* Https开关 */}
            <div className={'flexCenter'} style={{ gap: 8 }}>
                <span style={{ marginRight: 10 }}>是否HTTPS</span>
                <Switch checked={isHttps} onChange={(e) => setIsHttps(e)} />
            </div>

            {/* 获取树形数据按钮 */}
            {onGetTreeData && (
                <Button onClick={onGetTreeData}>获取PID树形数据</Button>
            )}
        </div>
    );
};

export default SharedConfig;
