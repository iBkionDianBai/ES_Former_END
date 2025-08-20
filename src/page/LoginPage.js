import React, { useEffect, useState } from'react';
import { Button, Input, Form, Col, Row, Alert } from 'antd';
import { Helmet } from'react-helmet';
import {
    UserOutlined,
    LockOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone
} from '@ant-design/icons';
import './LoginPage.css';
import loginBackground from '../image/bg1.jpg';
import smallBackground from '../image/bg2.jpg';
import { useNavigate } from'react-router-dom';
import { useTranslation } from 'react-i18next';

// 模拟验证码接口的 mock 函数
// 该函数返回一个Promise对象，使用setTimeout模拟网络延迟500毫秒后
// 成功返回包含验证码图片URL和验证码文本的对象
const mockFetchCaptcha = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                data: {
                    image: 'https://via.placeholder.com/150x50?text=ABCD', // 只是模拟图
                    code: 'ABCD'
                }
            });
        }, 500);
    });
};

const LoginPage = () => {
    const { t, i18n } = useTranslation();
    const [form] = Form.useForm();
    // 用于存储从后端获取的验证码文本
    const [backendCaptcha, setBackendCaptcha] = useState('');
    // 用于存储验证码图片的URL
    const [captchaImage, setCaptchaImage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // 获取验证码（使用 mock）
    // 这是一个异步函数，用于从模拟后端获取验证码
    // 尝试调用mockFetchCaptcha函数获取验证码响应
    // 如果获取成功，将响应中的验证码图片URL和验证码文本分别设置到captchaImage和backendCaptcha状态中
    // 如果获取过程中出现错误，在控制台打印错误信息
    const fetchCaptchaFromBackend = async () => {
        try {
            const response = await mockFetchCaptcha();
            setCaptchaImage(response.data.image);
            setBackendCaptcha(response.data.code);
        } catch (error) {
            console.error(t('fetchCaptchaFailed'), error);
        }
    };

    // 组件挂载时执行的副作用函数
    // 第二个参数是一个空数组，表示该副作用只在组件挂载时执行一次
    // 组件挂载时调用fetchCaptchaFromBackend函数获取验证码
    useEffect(() => {
        fetchCaptchaFromBackend();
    }, []);

    const onFinish = async (values) => {
        try {
            // 检查用户输入的用户名、密码和验证码是否正确
            // 用户名和密码固定为admin和123456
            // 验证码需要与后端获取的backendCaptcha匹配（不区分大小写）
            if (
                values.username === 'admin' &&
                values.password === '123456' &&
                values.code.toUpperCase() === backendCaptcha.toUpperCase()
            ) {
                sessionStorage.setItem('username', values.username);
                sessionStorage.setItem('token','mock-token');
                navigate('/main');
            } else {
                // 如果验证失败，设置错误信息
                setError(t('errorMessage'));
                // 刷新验证码，调用fetchCaptchaFromBackend函数获取新的验证码
                fetchCaptchaFromBackend();
                // 清空验证码输入框，将验证码输入框的值重置为空
                form.resetFields(['code']);
            }
        } catch (error) {
            console.error(t('loginFailed'), error);
            setError(t('loginRequestFailed'));
        }
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng)
            .then(() => {
                console.log(`Language changed to ${lng}`);
            })
            .catch((error) => {
                console.error('Error changing language:', error);
            });
    };

    return (
        <>
            <Helmet>
                <title>{t('loginPageTitle')}</title>
            </Helmet>

            <div className="App-container">
                {/* 语言切换按钮 */}
                <div className="language-switcher" style={{ position: 'absolute', top: 20, right: 20, zIndex: 100 }}>
                    <span onClick={() => changeLanguage('en')}>EN</span>
                    <span onClick={() => changeLanguage('zh')}>中文</span>
                </div>

                {/* 背景图层 */}
                <div className="left-content-container">
                    <div className="auth_bg">
                        <img
                            id="bannerbox"
                            src={loginBackground}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '30%',
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            <img src={smallBackground} alt="" style={{ width: '700px' }} />
                        </div>
                    </div>
                </div>

                {/* 登录主体容器 */}
                <div
                    className="right-content-container"
                >
                    <div className="auth-login-div">
                        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
                            {t('loginSystemName')}
                        </h2>
                        <Form
                            name="normal_login"
                            form={form}
                            className="login-form"
                            initialValues={{ remember: true }}
                            onFinish={onFinish}
                            scrollToFirstError
                        >
                            <Form.Item
                                name="username"
                                rules={[{ required: true, message: t('inputUsername') }]}
                            >
                                <Input
                                    prefix={<UserOutlined className="auth_icon auth_icon_user" />}
                                    placeholder={t('inputUsername')}
                                    className="auth_input"
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: t('inputPassword') }]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined className="auth_icon auth_icon_pwd" />}
                                    placeholder={t('inputPassword')}
                                    className="auth_input"
                                    iconRender={(visible) =>
                                        visible? <EyeTwoTone /> : <EyeInvisibleOutlined />
                                    }
                                />
                            </Form.Item>

                            <Form.Item
                                name="code"
                                rules={[{ required: true, message: t('inputCaptcha') }]}
                            >
                                <Row gutter={8}>
                                    <Col span={12}>
                                        {/* 显示验证码图片，点击图片可调用fetchCaptchaFromBackend函数刷新验证码 */}
                                        <img
                                            src={captchaImage}
                                            alt={t('inputCaptcha')}
                                            style={{ height: '50px', cursor: 'pointer' }}
                                            onClick={fetchCaptchaFromBackend}
                                        />
                                    </Col>
                                    <Col span={12}>
                                        {/* 用于用户输入验证码的输入框 */}
                                        <Input
                                            placeholder={t('inputCaptcha')}
                                            className="auth_input"
                                        />
                                    </Col>
                                </Row>
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    className="auth_btn"
                                >
                                    {t('loginButton')}
                                </Button>
                            </Form.Item>

                            {error && <Alert type="error" className="mt-4" message={error} />}
                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginPage;