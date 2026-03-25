import { createContext, useContext, useState, useEffect } from 'react';

// 创建全局上下文
const GlobalContext = createContext();

// 全局状态管理Provider组件
export const GlobalProvider = ({ children }) => {
    // token状态管理
    const [token, setToken] = useState(() => {
        return localStorage.getItem('token') || '';
    });

    // 角色ID状态管理
    const [roleId, setRoleId] = useState(() => {
        return localStorage.getItem('roleId') || '';
    });

    // API环境状态管理 ('202' | '203' | '公网')
    const [apiEnvironment, setApiEnvironment] = useState(() => {
        // 读取环境配置，默认使用 203 环境
        return localStorage.getItem('apiEnvironment') || '203';
    });

    // baseUrl根据apiEnvironment动态计算
    const [baseUrl, setBaseUrl] = useState(() => {
        const savedEnv = localStorage.getItem('apiEnvironment') || '203';
        // 根据环境映射到对应的代理路径
        const envMap = {
            '202': '/test-api',
            '203': '/prod-api',
            '公网': '/https-api'
        };
        return envMap[savedEnv] || '/prod-api';
    });

    // token变化时同步到localStorage
    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

    // roleId变化时同步到localStorage
    useEffect(() => {
        if (roleId) {
            localStorage.setItem('roleId', roleId);
        } else {
            localStorage.removeItem('roleId');
        }
    }, [roleId]);

    // apiEnvironment变化时同步到localStorage、baseUrl和isHttps
    useEffect(() => {
        // 保存环境配置到 localStorage
        localStorage.setItem('apiEnvironment', apiEnvironment);
        
        // 根据环境设置 isHttps：公网环境为 1，其他环境为 0
        localStorage.setItem('isHttps', apiEnvironment === '公网' ? '1' : '0');
        
        // 根据环境映射到对应的代理路径
        const envMap = {
            '202': '/test-api',
            '203': '/prod-api',
            '公网': '/https-api'
        };
        setBaseUrl(envMap[apiEnvironment] || '/prod-api');
    }, [apiEnvironment]);

    // 提供的全局状态和方法
    const value = {
        token,
        setToken,
        roleId,
        setRoleId,
        apiEnvironment,
        setApiEnvironment,
        baseUrl,
    };

    return (
        <GlobalContext.Provider value={value}>
            {children}
        </GlobalContext.Provider>
    );
};

// 自定义Hook方便使用全局状态
export const useGlobalContext = () => {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error('useGlobalContext必须在GlobalProvider内部使用');
    }
    return context;
};
