// src/page/RegisterPage.js
import React, {useState, useRef, useEffect} from 'react';
import { Helmet } from 'react-helmet';
import {
    UserOutlined,
    LockOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone,
    MailOutlined,
    PhoneOutlined,
    KeyOutlined
} from '@ant-design/icons';
import './RegisterPage.css';
import { useNavigate, Link } from 'react-router-dom';
import {Trans, useTranslation} from 'react-i18next';
import Cookies from "js-cookie";
import { register, getPublicKey } from '../api/service.js'
import { setPublicKey, encryptData } from '../utils/rsaEncrypt';

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
        invitationCode: '',
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

        if (formData.email && !emailRegex.test(formData.email)) {
            newErrors.email = t('emailInvalid');
        }

        // 手机号验证（非必填，有输入才校验格式）
        if (formData.phone && !phoneRegex.test(formData.phone)) {
            newErrors.phone = t('phoneInvalid');
        }

        // 协议同意验证
        if (!formData.agreement) {
            newErrors.agreement = t('agreeTerms');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 新增获取公钥的函数
    const fetchPublicKey = async () => {
        try {
            const response = await getPublicKey();
            console.log('公钥响应:', response); // 添加调试日志

            // 修复：公钥直接在 response.data 中，不是 response.data.publicKey
            if (response.status === 200) {
                setPublicKey(response.data.data); // 直接使用 response.data
                console.log('公钥设置成功:', response.data.data);
            } else {
                console.error('获取公钥失败:', response);
            }
        } catch (error) {
            console.error('获取公钥失败', error);
        }
    };

    useEffect(() => {
        fetchPublicKey();
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();
        setGeneralError('');
        setSuccessMessage('');

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);

            // RSA加密处理，添加错误处理
            let encryptedPassword, encryptedEmail, encryptedPhone, encryptedInvitationCode;
            
            try {
                // 必须加密的密码
                encryptedPassword = encryptData(formData.password);
                if (!encryptedPassword) {
                    throw new Error('密码加密失败');
                }
                
                // 可选加密字段
                encryptedEmail = formData.email ? encryptData(formData.email) : '';
                encryptedPhone = formData.phone ? encryptData(formData.phone) : '';
                encryptedInvitationCode = formData.invitationCode ? encryptData(formData.invitationCode) : '';
                
            } catch (encryptError) {
                console.error('RSA加密错误:', encryptError);
                throw new Error('数据加密失败，请检查网络连接并重试');
            }

            const response = await register({
                username: formData.username,
                password: encryptedPassword,
                email: encryptedEmail,
                phone: encryptedPhone,
                invitationCode: encryptedInvitationCode
            });

            if (response.data && response.data.code === 200) {
                // 注册成功
                setSuccessMessage(t('registerSuccess'));
                formRef.current.reset();
                setFormData({
                    username: '',
                    password: '',
                    confirmPassword: '',
                    email: '',
                    phone: '',
                    invitationCode: '',
                    agreement: false,
                    showPassword: false,
                    showConfirmPassword: false
                });

                // 3秒后跳转到登录页
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                // 后端返回的业务错误
                const errorCode = response.data?.code;
                let msg = response.data?.msg || 'registerFailed';

                switch (errorCode) {
                    case 11: // 用户名已存在
                        msg = t('usernameExists');
                        break;
                    case 12: // 邮箱已存在
                        msg = t('emailExists');
                        break;
                    case 13: // 手机号已存在
                        msg = t('phoneExists');
                        break;
                    case 14: // 邀请码错误
                        msg = t('invitationCodeError');
                        break;
                    default:
                        msg = t('registerFailed');
                }

                throw new Error(msg);
            }
        } catch (err) {
            setGeneralError(err.message || t('registerFailed'));
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

                    <form ref={formRef} onSubmit={onSubmit} className="register-form">
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

                        <div className="form-group">
                            <div className="input-icon">
                                <KeyOutlined />  {/* 使用钥匙图标 */}
                            </div>
                            <input
                                type="text"
                                name="invitationCode"
                                value={formData.invitationCode}
                                onChange={handleInputChange}
                                placeholder={t('adminInvitationCode')}
                                className={errors.invitationCode ? 'invalid' : ''}
                            />
                            <span className="hint-text">{t('invitationCodeHint')}</span>  {/* 提示文字 */}
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
                                    <Trans
                                        i18nKey="agreeTermsText"
                                        components={{
                                            terms: <Link to="/terms" className="text-blue-500 underline" />,
                                            privacy: <Link to="/privacy" className="text-blue-500 underline" />,
                                        }}
                                    />
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