import { sleep } from 'ut2';
import ImageBg from './image/ValBack.png';
import ImagePuzzle from './image/ValPing.png';

// 配置项
const config = {
    verifyOffset: 10,
    verifyBase: 90,
    verifyWidth: 20
};

// 随机生成验证范围
const generateVerifyRange = () => {
    const offset = Math.floor(Math.random() * config.verifyOffset * 2) - config.verifyOffset;
    const min = config.verifyBase + offset - config.verifyWidth / 2;
    const max = config.verifyBase + offset + config.verifyWidth / 2;
    return { min, max };
};

// 当前验证范围
let currentVerifyRange = generateVerifyRange();

export const getCaptcha = async () => {
    await sleep();
    currentVerifyRange = generateVerifyRange();
    return {
        bgUrl: ImageBg,
        puzzleUrl: ImagePuzzle
    };
};

export const verifyCaptcha = async (data) => {
    await sleep();
    if (data?.x && data.x >= currentVerifyRange.min && data.x <= currentVerifyRange.max) {
        return { success: true, message: '验证成功' };
    }
    return Promise.reject({
        success: false,
        message: '验证失败，请重试',
        expectedRange: currentVerifyRange
    });
};

export const setCaptchaConfig = (newConfig) => {
    Object.assign(config, newConfig);
};

export default { getCaptcha, verifyCaptcha, setCaptchaConfig };