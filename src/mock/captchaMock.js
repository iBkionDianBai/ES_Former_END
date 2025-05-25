// src/mock/captchaMock.js
import Mock from 'mockjs';

Mock.setup({ timeout: '500-800' });

Mock.mock('/api/captcha', 'get', () => {
    const code = Mock.mock('@string("upper", 4)');
    return {
        data: {
            image: `https://via.placeholder.com/150x50?text=${code}`,
            code
        }
    };
});
