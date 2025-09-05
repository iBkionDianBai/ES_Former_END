// src/page/LoginPage.js
import React, { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import {
    UserOutlined,
    LockOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone,
    ExclamationCircleOutlined, KeyOutlined
} from '@ant-design/icons';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Cookies from "js-cookie";
import { setPublicKey, encryptData } from '../utils/rsaEncrypt';
import {getCaptcha, login, getPublicKey} from '../api/service.js';



// 获取验证码接口
const fetchCaptcha = () => {
    return getCaptcha();
};

// 登录接口

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
    const [captchaImage, setCaptchaImage] = useState('');
    const [captchaToken, setCaptchaToken] = useState(''); // 改为存储token而不是sessionId
    const [isLoading, setIsLoading] = useState(false);
    const [captchaLoading, setCaptchaLoading] = useState(false);

    // 错误弹窗状态
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorModalMessage, setErrorModalMessage] = useState('');
    const errorModalRef = useRef(null);

    // 获取验证码
    const fetchCaptchaFromBackend = async () => {
        try {
            setCaptchaLoading(true);
            // 获取验证码数据
            const response = await fetchCaptcha();

            // 处理后端返回的验证码数据
            if (response.data && response.data.code === 200 && response.data.data) {
                const { image, token } = response.data.data; // 改为获取token而不是sessionId

                // 设置验证码图片
                if (image) {
                    setCaptchaImage(image); // 后端已返回完整的data URL格式
                } else {
                    throw new Error('验证码图片数据为空');
                }

                // 设置验证码token
                if (token) {
                    setCaptchaToken(token); // 保存token
                } else {
                    console.warn('未获取到验证码Token');
                }
            } else {
                throw new Error(response.data?.msg || '获取验证码失败');
            }
        } catch (error) {
            console.error(t('fetchCaptchaFailed'), error);
            setErrorModalMessage(error.response?.data?.msg || error.message || t('fetchCaptchaFailed'));
            setShowErrorModal(true);
        } finally {
            setCaptchaLoading(false);
        }
    };

    // 新增获取公钥的函数
    const fetchPublicKey = async () => {
        try {
            const response = await getPublicKey();
            if (response.data && response.data.data) {
                setPublicKey(response.data.data);  // 传入公钥字符串
            }
        } catch (error) {
            console.error('获取公钥失败', error);
        }
    };

    // 在组件挂载时获取公钥
    useEffect(() => {
        fetchCaptchaFromBackend();
        fetchPublicKey();
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
        
        // 清除通用错误信息
        if (errors.general) {
            setErrors(prev => ({ ...prev, general: '' }));
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

            // RSA加密密码，添加错误处理
            let encryptedPassword;
            try {
                encryptedPassword = encryptData(formData.password);
                if (!encryptedPassword) {
                    throw new Error('密码加密失败');
                }
            } catch (encryptError) {
                console.error('RSA加密错误:', encryptError);
                throw new Error('密码加密失败，请检查网络连接并重试');
            }

            const loginData = {
                username: formData.username,
                password: encryptedPassword,
                code: formData.code,
                captchaToken: captchaToken // 添加验证码token
            };

            const response = await login(loginData);

            // ✅ 成功
            if (response.data && response.data.code === 200) {
                const token = response.data.msg;
                sessionStorage.setItem('username', formData.username);
                sessionStorage.setItem('token', token);
                navigate('/main');
            } else {
                // 后端返回非 200 的情况（理论上会进入 catch，但以防万一）
                throw new Error(response.data?.msg || '登录失败');
            }

        } catch (error) {
            console.error(t('loginFailed'), error);
            let errorMsg = '';

            if (error.response && error.response.data) {
                const errorData = error.response.data;
                const errorCode = errorData.code;
                const errorMessage = errorData.msg;

                // ✅ 根据后端错误码细分 i18n 提示
                switch (errorCode) {
                    case 4: // 验证码未获取
                        errorMsg = t('captchaNotFetched') || errorMessage;
                        break;
                    case 5: // 验证码错误
                        errorMsg = t('captchaError') || errorMessage;
                        break;
                    case 7: // 用户名密码错误
                        errorMsg = t('usernameOrPasswordError') || errorMessage;
                        break;
                    case 8: // 用户账户已被封禁
                        errorMsg = t('accountBanned') || errorMessage;
                        break;
                    default: // 其他错误直接显示后端 msg
                        errorMsg = errorMessage || t('unknownError');
                }
            } else if (error.message) {
                errorMsg = error.message;
            } else {
                errorMsg = t('networkError');
            }

            setErrorModalMessage(errorMsg);
            setShowErrorModal(true);

            // 刷新验证码并清空输入框
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
                                {captchaLoading ? (
                                    <div style={{ 
                                        height: '50px', 
                                        width: '150px',
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        border: '1px solid #d9d9d9',
                                        backgroundColor: '#f5f5f5'
                                    }}>
                                        <span>{t('loading')}</span>
                                    </div>
                                ) : (
                                    <img
                                        src={captchaImage}
                                        alt={t('inputCaptcha')}
                                        style={{ 
                                            height: '50px', 
                                            cursor: 'pointer',
                                            border: '1px solid #d9d9d9',
                                            borderRadius: '4px'
                                        }}
                                        onClick={fetchCaptchaFromBackend}
                                        title={t('clickImageToRefresh')}
                                    />
                                )}
                                <div className="input-wrapper">
                                    {/* 使用钥匙图标 */}
                                    <KeyOutlined className="captcha-icon" />  {/* 使用钥匙图标 */}
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        placeholder={t('inputCaptcha')}
                                        className={`auth_input captcha-input ${errors.code ? 'error' : ''}`}
                                        maxLength="6"
                                        autoComplete="off"
                                    />
                                </div>
                            </div>
                            {errors.code && <span className="error-message">{errors.code}</span>}
                            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                {t('clickImageToRefresh')}
                            </div>
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