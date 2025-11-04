import {useEffect, useMemo, useState} from 'react';
import {Button, Form, Input, message, Select, Space, Typography, Divider} from 'antd';
import CryptoJS from 'crypto-js';

// 中文注释：加密/解密组件，功能移植自 decrypt.html，适配 React + AntD
const {Text, Title} = Typography;

// 预定义的AES密钥（与 decrypt.html 保持一致）
const PREDEFINED_KEYS = {
  health: '1b9ovDYH4Inl1N7fOcTBuigPOZ8JIwBv',
  test: 'fd23f538f25a87fb1f68e8835811d240',
};

// 本地存储键
const STORAGE_KEYS = {
  selectedKeyType: 'aes_tool_selected_key_type',
  customKey: 'aes_tool_custom_key',
};

// AES加密（ECB + PKCS7）
function encryptAes(data, aesKey) {
  if (aesKey && data) {
    const key = CryptoJS.enc.Utf8.parse(aesKey);
    const result = CryptoJS.AES.encrypt(data, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    }).toString();
    return result;
  }
  return data;
}

// AES解密（输入为Base64字符串，返回JSON对象）
function decryptJson(encryptedBase64Str, aesKey) {
  const vals = CryptoJS.enc.Base64.parse(encryptedBase64Str);
  const src = CryptoJS.enc.Base64.stringify(vals);
  const key = CryptoJS.enc.Utf8.parse(aesKey);
  const decryptedData = CryptoJS.AES.decrypt(src, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  const decryptedStr = decryptedData.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decryptedStr);
}

export default function EncryptDecrypt() {
  // 中文注释：密钥选择与存储
  const [keyType, setKeyType] = useState('health');
  const [customKey, setCustomKey] = useState('');

  const currentKey = useMemo(() => {
    if (keyType === 'custom') return customKey || PREDEFINED_KEYS.health;
    return PREDEFINED_KEYS[keyType] || PREDEFINED_KEYS.health;
  }, [keyType, customKey]);

  // 加解密输入/输出状态
  const [decryptInput, setDecryptInput] = useState('');
  const [decryptResult, setDecryptResult] = useState(null); // { ok: boolean, data: any|string }

  const [encryptInput, setEncryptInput] = useState('{"topicId": "", "limit": 50, "page": 1}');
  const [encryptResult, setEncryptResult] = useState('');

  // 初始化：从 localStorage 读取密钥选择
  useEffect(() => {
    try {
      const savedType = localStorage.getItem(STORAGE_KEYS.selectedKeyType);
      const savedCustom = localStorage.getItem(STORAGE_KEYS.customKey);
      if (savedType) setKeyType(savedType);
      if (savedCustom) setCustomKey(savedCustom);
    } catch (e) {
      // 忽略读取异常
    }
  }, []);

  // 保存选择
  const persistSelection = (type, custom = undefined) => {
    try {
      localStorage.setItem(STORAGE_KEYS.selectedKeyType, type);
      if (type === 'custom' && typeof custom === 'string') {
        localStorage.setItem(STORAGE_KEYS.customKey, custom);
      }
    } catch (e) {
      // 忽略写入异常
    }
  };

  // 操作：复制到剪贴板
  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success('已复制到剪贴板');
    } catch (e) {
      message.error('复制失败：' + e.message);
    }
  };

  // 执行解密
  const performDecrypt = () => {
    const input = (decryptInput || '').trim();
    if (!input) {
      setDecryptResult({ok: false, data: '请输入要解密的数据'});
      return;
    }
    try {
      const result = decryptJson(input, currentKey);
      setDecryptResult({ok: true, data: result});
    } catch (e) {
      setDecryptResult({ok: false, data: '解密失败：' + (e?.message || '未知错误')});
    }
  };

  const clearDecrypt = () => {
    setDecryptInput('');
    setDecryptResult(null);
  };

  // 执行加密
  const performEncrypt = () => {
    const input = (encryptInput || '').trim();
    if (!input) {
      message.error('请输入要加密的JSON数据');
      return;
    }
    try {
      const jsonObj = JSON.parse(input);
      const jsonStr = JSON.stringify(jsonObj);
      const encrypted = encryptAes(jsonStr, currentKey);
      setEncryptResult(encrypted);
    } catch (e) {
      message.error('加密失败：' + (e?.message || 'JSON格式错误'));
    }
  };

  const clearEncrypt = () => {
    setEncryptInput('');
    setEncryptResult('');
  };

  const formatJson = () => {
    try {
      const jsonData = JSON.parse(encryptInput);
      setEncryptInput(JSON.stringify(jsonData, null, 2));
    } catch (e) {
      message.error('JSON格式错误，无法格式化：' + (e?.message || ''));
    }
  };

  // 示例填充
  const loadExample1 = () => {
    setEncryptInput(JSON.stringify({ topicId: '', limit: 50, page: 1 }, null, 2));
  };
  const loadExample2 = () => {
    setEncryptInput(JSON.stringify({ page: 1, limit: 20, validFlag: 1 }, null, 2));
  };
  const loadExample3 = () => {
    setEncryptInput(JSON.stringify({ topicId: '123', limit: 10, page: 1, validFlag: 1 }, null, 2));
  };

  return (
    <div>
      {/* 中文注释：密钥配置 */}
      <div className="section">
        <h2 className="section-title">密钥配置</h2>
        <Space direction="vertical" style={{width: '100%'}} size={12}>
          <Space wrap size={12}>
            <Text>选择AES密钥：</Text>
            <Select
              style={{minWidth: 220}}
              value={keyType}
              onChange={(v) => { setKeyType(v); persistSelection(v, customKey); }}
              options={[
                {label: '小程序端密钥 (health)', value: 'health'},
                {label: 'Web端密钥 (test)', value: 'test'},
                {label: '自定义密钥', value: 'custom'},
              ]}
            />
            {keyType === 'custom' && (
              <Input
                style={{minWidth: 320}}
                maxLength={32}
                placeholder="请输入32位AES密钥"
                value={customKey}
                onChange={(e) => { setCustomKey(e.target.value); persistSelection('custom', e.target.value); }}
              />
            )}
          </Space>
          <Text>
            当前密钥：<Text code>{currentKey}</Text>（长度：{currentKey.length}）
          </Text>
        </Space>
      </div>

      {/* 中文注释：解密 与 加密 两列布局 */}
      <div className="section-row">
        <div className="section">
          <h2 className="section-title">解密</h2>
          <Space direction="vertical" style={{width: '100%'}} size={12}>
            <Input.TextArea
              rows={10}
              placeholder="输入加密数据（Base64）"
              value={decryptInput}
              onChange={(e) => setDecryptInput(e.target.value)}
            />
            <Space>
              <Button type="primary" onClick={performDecrypt}>解密</Button>
              <Button onClick={clearDecrypt}>清空</Button>
            </Space>
            {decryptResult && (
              <div>
                {decryptResult.ok ? (
                  <div>
                    <Title level={5}>解密成功</Title>
                    <div style={{marginBottom: 8}}>使用密钥：<Text code>{currentKey}</Text></div>
                    <Space size={8} style={{marginBottom: 8}}>
                      <Button size="small" onClick={() => copy(JSON.stringify(decryptResult.data))}>复制紧凑JSON</Button>
                      <Button size="small" onClick={() => copy(JSON.stringify(decryptResult.data, null, 2))}>复制格式化JSON</Button>
                    </Space>
                    <pre className="json-formatted" style={{background:'#fff', border:'1px solid #e9ecef', borderRadius:6, padding:12, maxHeight: 360, overflow:'auto'}}>
                      {JSON.stringify(decryptResult.data, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div>
                    <Title level={5} type="danger">解密失败</Title>
                    <div style={{color:'#a61d24', marginBottom: 8}}>{decryptResult.data}</div>
                    <div>
                      可能原因：
                      <ul style={{margin:'6px 0 0 18px'}}>
                        <li>输入的不是有效的Base64字符串</li>
                        <li>数据不是使用相同密钥加密的</li>
                        <li>加密模式不匹配（应为 AES-ECB + PKCS7）</li>
                        <li>密钥长度不正确（建议32位）</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Space>
        </div>

        <div className="section">
          <h2 className="section-title">加密</h2>
          <Space direction="vertical" style={{width: '100%'}} size={12}>
            <Input.TextArea
              rows={12}
              placeholder='请输入JSON格式的数据'
              value={encryptInput}
              onChange={(e) => setEncryptInput(e.target.value)}
            />
            <Space>
              <Button type="primary" onClick={performEncrypt}>加密</Button>
              <Button onClick={clearEncrypt}>清空</Button>
              <Button onClick={formatJson}>格式化JSON</Button>
            </Space>
            {encryptResult && (
              <div>
                <div style={{marginBottom: 8}}>使用密钥：<Text code>{currentKey}</Text></div>
                <Space size={8} style={{marginBottom: 8}}>
                  <Button size="small" onClick={() => copy(encryptResult)}>复制加密结果</Button>
                </Space>
                <div className="result info" style={{wordBreak:'break-all', background:'#f6ffed', border:'1px solid #e9ecef', padding:12, borderRadius:6}}>
                  {encryptResult}
                </div>
              </div>
            )}
          </Space>
        </div>
      </div>

      {/* 中文注释：常用示例 */}
      <div className="section">
        <h2 className="section-title">常用示例</h2>
        <Space wrap>
          <Button onClick={loadExample1}>示例1: 查询主题产品</Button>
          <Button onClick={loadExample2}>示例2: 分页查询</Button>
          <Button onClick={loadExample3}>示例3: 带ID查询</Button>
        </Space>
      </div>
    </div>
  );
}

