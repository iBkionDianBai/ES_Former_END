// src/page/RegisterPage.js
import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import {
    UserOutlined,
    LockOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone,
    MailOutlined,
    PhoneOutlined
} from '@ant-design/icons';
import './RegisterPage.css';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Cookies from "js-cookie";

// 模拟注册接口的mock函数
const mockRegister = (userData) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // 模拟用户名已存在的情况
            if (userData.username === 'admin') {
                reject(new Error('usernameExists'));
            } else {
                resolve({ success: true });
            }
        }, 800);
    });
};

const RegisterPage = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    // 表单状态管理
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        phone: '',
        agreement: false,
        showPassword: false,
        showConfirmPassword: false
    });

    // 错误信息管理
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const formRef = useRef(null);

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

    // 输入变化处理
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // 清除对应字段的错误
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // 密码显示切换
    const togglePasswordVisibility = (field) => {
        setFormData(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    // 表单验证
    const validateForm = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{11}$/;
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

        // 用户名验证
        if (!formData.username.trim()) {
            newErrors.username = t('inputUsername');
        } else if (formData.username.length < 4) {
            newErrors.username = t('usernameMinLength');
        } else if (formData.username.length > 20) {
            newErrors.username = t('usernameMaxLength');
        } else if (!usernameRegex.test(formData.username)) {
            newErrors.username = t('usernameInvalid');
        }

        // 密码验证
        if (!formData.password) {
            newErrors.password = t('inputPassword');
        } else if (formData.password.length < 6) {
            newErrors.password = t('passwordMinLength');
        } else if (!passwordRegex.test(formData.password)) {
            newErrors.password = t('passwordInvalid');
        }

        // 确认密码验证
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = t('confirmPassword');
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = t('passwordMismatch');
        }

        // 邮箱验证
        if (!formData.email) {
            newErrors.email = t('inputEmail');
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = t('emailInvalid');
        }

        // 手机号验证
        if (!formData.phone) {
            newErrors.phone = t('inputPhone');
        } else if (!phoneRegex.test(formData.phone)) {
            newErrors.phone = t('phoneInvalid');
        }

        // 协议同意验证
        if (!formData.agreement) {
            newErrors.agreement = t('agreeTerms');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onFinish = async (e) => {
        e.preventDefault();
        setGeneralError('');
        setSuccessMessage('');

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);

            // 调用模拟注册接口
            await mockRegister({
                username: formData.username,
                password: formData.password,
                email: formData.email,
                phone: formData.phone
            });

            setSuccessMessage(t('registerSuccess'));
            formRef.current.reset();
            setFormData({
                username: '',
                password: '',
                confirmPassword: '',
                email: '',
                phone: '',
                agreement: false,
                showPassword: false,
                showConfirmPassword: false
            });

            // 3秒后跳转到登录页
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setGeneralError(t(err.message) || t('registerFailed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <Helmet>
                <title>{t('registerPageTitle')}</title>
            </Helmet>

            {/* 语言切换按钮 */}
            <div className="language-switcher">
                <span onClick={() => changeLanguage('en')} className={i18n.language === 'en' ? 'active' : ''}>EN</span>
                <span onClick={() => changeLanguage('zh')} className={i18n.language === 'zh' ? 'active' : ''}>中文</span>
            </div>

            <div className="register-container">
                <div className="register-card">
                    <h1 className="register-title">{t('registerSystemName')}</h1>

                    {generalError && (
                        <div className="error-alert">{generalError}</div>
                    )}

                    {successMessage && (
                        <div className="success-alert">{successMessage}</div>
                    )}

                    <form ref={formRef} onSubmit={onFinish} className="register-form">
                        <div className="form-group">
                            <div className="input-icon">
                                <UserOutlined />
                            </div>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                placeholder={t('inputUsername')}
                                className={errors.username ? 'invalid' : ''}
                            />
                            {errors.username && (
                                <span className="error-message">{errors.username}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <div className="input-icon">
                                <LockOutlined />
                            </div>
                            <input
                                type={formData.showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder={t('inputPassword')}
                                className={errors.password ? 'invalid' : ''}
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => togglePasswordVisibility('showPassword')}
                            >
                                <div className="view-icon">
                                    {formData.showPassword ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                                </div>
                            </button>
                            {errors.password && (
                                <span className="error-message">{errors.password}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <div className="input-icon">
                                <LockOutlined />
                            </div>
                            <input
                                type={formData.showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder={t('confirmPassword')}
                                className={errors.confirmPassword ? 'invalid' : ''}
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => togglePasswordVisibility('showConfirmPassword')}
                            >
                                <div className="view-icon">
                                    {formData.showPassword ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                                </div>
                            </button>
                            {errors.confirmPassword && (
                                <span className="error-message">{errors.confirmPassword}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <div className="input-icon">
                                <MailOutlined />
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder={t('inputEmail')}
                                className={errors.email ? 'invalid' : ''}
                            />
                            {errors.email && (
                                <span className="error-message">{errors.email}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <div className="input-icon">
                                <PhoneOutlined />
                            </div>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder={t('inputPhone')}
                                className={errors.phone ? 'invalid' : ''}
                            />
                            {errors.phone && (
                                <span className="error-message">{errors.phone}</span>
                            )}
                        </div>

                        <div className="form-group checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="agreement"
                                    checked={formData.agreement}
                                    onChange={handleInputChange}
                                />
                                <span className="checkbox-text">
                                    {t('agreeTermsText', {
                                        terms: <Link to="/terms">{t('termsOfService')}</Link>,
                                        privacy: <Link to="/privacy">{t('privacyPolicy')}</Link>
                                    })}
                                </span>
                            </label>
                            {errors.agreement && (
                                <span className="error-message">{errors.agreement}</span>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="register-button"
                            disabled={loading}
                        >
                            {loading ? t('registering') : t('register')}
                        </button>
                    </form>

                    <div className="login-link">
                        {t('alreadyHaveAccount')} <Link to="/login">{t('loginNow')}</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;