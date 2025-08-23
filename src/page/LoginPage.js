// src/page/LoginPage.js
import React, { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import {
    UserOutlined,
    LockOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Cookies from "js-cookie";

// 模拟验证码接口
const mockFetchCaptcha = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                data: {
                    image: 'https://via.placeholder.com/150x50?text=ABCD',
                    code: 'ABCD'
                }
            });
        }, 500);
    });
};

const mockLoginApi = (formData) => {
    return new Promise((resolve, reject) => {
        // 设置超时时间
        const timeout = 5000;
        const timer = setTimeout(() => {
            reject(new Error('Network Error'));
        }, timeout);

        // 原有验证逻辑保留
        setTimeout(() => {
            clearTimeout(timer); // 清除超时定时器
            if (formData.username !== 'admin') {
                reject({
                    response: {
                        data: {
                            code: 'USERNAME_PASSWORD_ERROR',
                            msg: '用户名不存在'
                        }
                    }
                });
            } else if (formData.password !== '123456') {
                reject({
                    response: {
                        data: {
                            code: 'USERNAME_PASSWORD_ERROR',
                            msg: '密码错误'
                        }
                    }
                });
            } else if (formData.code.toUpperCase() !== 'ABCD') {
                reject({
                    response: {
                        data: {
                            code: 'CAPTCHA_ERROR',
                            msg: '验证码不正确'
                        }
                    }
                });
            } else {
                resolve({ token: 'mock-token' });
            }
        }, 800);
    });
};

const LoginPage = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    // 表单状态管理
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        code: '',
        showPassword: false
    });

    // 错误信息管理
    const [errors, setErrors] = useState({
        username: '',
        password: '',
        code: '',
        general: ''
    });

    // 验证码相关状态
    const [backendCaptcha, setBackendCaptcha] = useState('');
    const [captchaImage, setCaptchaImage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 错误弹窗状态
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorModalMessage, setErrorModalMessage] = useState('');
    const errorModalRef = useRef(null);

    // 获取验证码
    const fetchCaptchaFromBackend = async () => {
        try {
            const response = await mockFetchCaptcha();
            setCaptchaImage(response.data.image);
            setBackendCaptcha(response.data.code);
        } catch (error) {
            console.error(t('fetchCaptchaFailed'), error);
            setErrorModalMessage(t('fetchCaptchaFailed'));
            setShowErrorModal(true);
        }
    };

    // 组件挂载时获取验证码
    useEffect(() => {
        fetchCaptchaFromBackend();
    }, []);

    // 点击外部关闭弹窗
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showErrorModal && errorModalRef.current && !errorModalRef.current.contains(event.target)) {
                setShowErrorModal(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showErrorModal]);

    // 输入框变化处理
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // 清除对应字段的错误信息
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // 密码显示切换
    const togglePasswordVisibility = () => {
        setFormData(prev => ({ ...prev, showPassword: !prev.showPassword }));
    };

    // 表单验证
    const validateForm = () => {
        const newErrors = {
            username: '',
            password: '',
            code: '',
            general: ''
        };
        let isValid = true;

        if (!formData.username.trim()) {
            newErrors.username = t('inputUsername');
            isValid = false;
        }

        if (!formData.password) {
            newErrors.password = t('inputPassword');
            isValid = false;
        }

        if (!formData.code.trim()) {
            newErrors.code = t('inputCaptcha');
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // 表单提交处理
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors(prev => ({ ...prev, general: '' }));

        if (!validateForm()) {
            return;
        }

        try {
            setIsLoading(true);
            // 调用登录接口
            const response = await mockLoginApi(formData);

            // 登录成功逻辑
            sessionStorage.setItem('username', formData.username);
            sessionStorage.setItem('token', response.token);
            navigate('/main');

        } catch (error) {
            console.error(t('loginFailed'), error);
            let errorMsg = '';

            if (error.response) {
                // 后端返回的错误
                const errorCode = error.response.data.code;
                const errorMessage = error.response.data.msg;

                switch(errorCode) {
                    case 'USERNAME_PASSWORD_ERROR':
                        errorMsg = t('usernameOrPasswordError') || errorMessage;
                        break;
                    case 'CAPTCHA_ERROR':
                        errorMsg = t('captchaError') || errorMessage;
                        break;
                    default:
                        // 未知错误直接显示后端返回的信息
                        errorMsg = errorMessage || t('unknownError');
                }
            } else {
                // 网络错误等非后端返回的错误
                errorMsg = t('networkError');
            }

            // 显示错误弹窗
            setErrorModalMessage(errorMsg);
            setShowErrorModal(true);

            // 刷新验证码
            fetchCaptchaFromBackend();
            setFormData(prev => ({ ...prev, code: '' }));
        } finally {
            setIsLoading(false);
        }
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng)
            .then(() => {
                console.log(`Language changed to ${lng}`);
                Cookies.set('i18next', lng);
            })
            .catch((error) => {
                console.error('Error changing language:', error);
            });
    };

    return (
        <div className="login-page">
            <Helmet>
                <title>{t('loginPageTitle')}</title>
            </Helmet>

            {/* 语言切换按钮 */}
            <div className="language-switcher" style={{ position: 'absolute', top: 20, right: 20, zIndex: 100 }}>
                <span onClick={() => changeLanguage('en')} className={i18n.language === 'en' ? 'active' : ''}>EN</span>
                <span onClick={() => changeLanguage('zh')} className={i18n.language === 'zh' ? 'active' : ''}>中文</span>
            </div>

            {/* 登录主体容器 */}
            <div className="content-container">
                <div className="login-card">
                    <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
                        {t('loginSystemName')}
                    </h2>

                    <form onSubmit={handleSubmit} className="login-form">
                        {/* 用户名输入 */}
                        <div className="form-item">
                            <div className="input-wrapper">
                                <UserOutlined className="auth_icon auth_icon_user" />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    placeholder={t('inputUsername')}
                                    className={`auth_input ${errors.username ? 'error' : ''}`}
                                />
                            </div>
                            {errors.username && <span className="error-message">{errors.username}</span>}
                        </div>

                        {/* 密码输入 */}
                        <div className="form-item">
                            <div className="input-wrapper">
                                <LockOutlined className="auth_icon auth_icon_pwd" />
                                <input
                                    type={formData.showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder={t('inputPassword')}
                                    className={`auth_input ${errors.password ? 'error' : ''}`}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={togglePasswordVisibility}
                                >
                                    {formData.showPassword ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                                </button>
                            </div>
                            {errors.password && <span className="error-message">{errors.password}</span>}
                        </div>

                        {/* 验证码输入 */}
                        <div className="form-item">
                            <div className="captcha-container">
                                <img
                                    src={captchaImage}
                                    alt={t('inputCaptcha')}
                                    style={{ height: '50px', cursor: 'pointer' }}
                                    onClick={fetchCaptchaFromBackend}
                                />
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    placeholder={t('inputCaptcha')}
                                    className={`auth_input captcha-input ${errors.code ? 'error' : ''}`}
                                />
                            </div>
                            {errors.code && <span className="error-message">{errors.code}</span>}
                        </div>

                        {/* 提交按钮 */}
                        <div className="form-item">
                            <button
                                type="submit"
                                className="auth_btn"
                                disabled={isLoading}
                            >
                                {isLoading ? t('loggingIn') : t('loginButton')}
                            </button>
                        </div>

                        {/* 注册链接 */}
                        <div style={{ marginTop: 16, textAlign: 'center' }} className="register-link">
                            {t('noAccount')} <a href="/register" >{t('registerNow')}</a>
                        </div>
                    </form>
                </div>
            </div>

            {/* 错误弹窗 */}
            {showErrorModal && (
                <>
                    {/* 背景遮罩 */}
                    <div className="modal-overlay" onClick={() => setShowErrorModal(false)}></div>

                    {/* 错误弹窗内容 */}
                    <div className="error-modal" ref={errorModalRef}>
                        <div className="modal-header">
                            <ExclamationCircleOutlined className="warning-icon" />
                            <h3>{t('errorTitle')}</h3>
                        </div>
                        <div className="modal-body">
                            <p>{errorModalMessage}</p>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="modal-btn confirm-btn"
                                onClick={() => setShowErrorModal(false)}
                            >
                                {t('confirm')}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default LoginPage;