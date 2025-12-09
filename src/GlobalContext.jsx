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

    // 是否使用HTTPS状态管理
    const [isHttps, setIsHttps] = useState(() => {
        return localStorage.getItem('isHttps') === '1';
    });

    // baseUrl根据isHttps动态计算
    const [baseUrl, setBaseUrl] = useState(() => {
        return localStorage.getItem('isHttps') === '1' ? '/https-api' : '/prod-api';
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

    // isHttps变化时同步到localStorage和baseUrl
    useEffect(() => {
        if (isHttps) {
            localStorage.setItem('isHttps', '1');
            setBaseUrl('/https-api');
        } else {
            localStorage.removeItem('isHttps');
            setBaseUrl('/prod-api');
        }
    }, [isHttps]);

    // 提供的全局状态和方法
    const value = {
        token,
        setToken,
        roleId,
        setRoleId,
        isHttps,
        setIsHttps,
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
