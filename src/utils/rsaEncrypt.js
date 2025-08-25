import JSEncrypt from 'jsencrypt';

let encrypt = new JSEncrypt();

export const setPublicKey = (publicKey) => {
    console.log('设置公钥:', publicKey);
    encrypt.setPublicKey(publicKey);
};

export const encryptData = (data) => {
    if (!data || data === '') {
        console.warn('加密数据为空，跳过加密');
        return '';
    }

    const encrypted = encrypt.encrypt(data);

    console.log('原文:', data, '密文:', encrypted);
    return encrypted;
};