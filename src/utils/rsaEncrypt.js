import JSEncrypt from 'jsencrypt';

// 创建JSEncrypt实例并配置为2048位密钥长度
let encrypt = new JSEncrypt({ default_key_size: 2048 });

export const setPublicKey = (rawKey) => {
    try {
        if (!rawKey || typeof rawKey !== 'string') {
            throw new Error('无效的公钥数据');
        }

        // 格式化为 PEM 格式
        const pemKey = `-----BEGIN PUBLIC KEY-----\n${rawKey.replace(/(.{64})/g, '$1\n')}\n-----END PUBLIC KEY-----`;

        encrypt.setPublicKey(pemKey);
        console.log('公钥设置成功');
    } catch (error) {
        console.error('设置公钥失败:', error);
        throw new Error('公钥设置失败');
    }
};

export const encryptData = (data) => {
    if (!data || data === '') {
        console.warn('加密数据为空，跳过加密');
        return '';
    }

    // 检查数据长度，RSA 2048位密钥最大可加密245字节
    const maxLength = 245;
    if (data.length > maxLength) {
        console.warn(`数据长度(${data.length})超过RSA最大加密长度(${maxLength})`);
        // 对于过长的数据，可以考虑分块加密或使用AES+RSA混合加密
        throw new Error(`数据长度超过RSA加密限制，最大支持${maxLength}字节`);
    }

    try {
        const encrypted = encrypt.encrypt(data);
        if (!encrypted) {
            throw new Error('加密失败，返回值为空');
        }
        console.log("加密成功，密文长度:", encrypted.length);
        return encrypted;
    } catch (error) {
        console.error('RSA加密失败:', error);
        throw new Error('RSA加密失败: ' + error.message);
    }
};

/**
 * 获取当前使用的密钥长度信息
 * @returns {string} 密钥长度信息
 */
export const getKeyInfo = () => {
    return 'RSA-2048位密钥，最大加密长度245字节';
};