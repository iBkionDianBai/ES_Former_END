// src/page/header.js
import { useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import axios from 'axios';
import './header.css';
import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';
import {
    ExclamationCircleOutlined,  // 新增Ant图标
    GlobalOutlined,             // Ant的地球图标
    DownOutlined,               // Ant的下拉图标
    UpOutlined                  // Ant的上拉图标
} from '@ant-design/icons';

function Header() {
    const navigate = useNavigate();
    const username = sessionStorage.getItem('username');
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false); // 弹窗状态管理
    const dropdownRef = useRef(null);
    const modalRef = useRef(null); // 弹窗引用

    // 点击外部关闭下拉框
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // 点击外部关闭弹窗
    useEffect(() => {
        const handleClickOutsideModal = (event) => {
            if (showLogoutModal && modalRef.current && !modalRef.current.contains(event.target)) {
                setShowLogoutModal(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutsideModal);
        return () => {
            document.removeEventListener('mousedown', handleClickOutsideModal);
        };
    }, [showLogoutModal]);

    // 确认退出
    const confirmLogout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("username");
        delete axios.defaults.headers.common["Authorization"];
        navigate("/");
        setShowLogoutModal(false);
    };

    // 取消退出
    const cancelLogout = () => {
        setShowLogoutModal(false);
    };

    const handleMain = () => {
        navigate("/main");
    }

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng)
            .then(() => {
                console.log(`Language changed to ${lng}`);
                Cookies.set('i18next', lng);
                setIsOpen(false);
            })
            .catch((error) => {
                console.error('Error changing language:', error);
            });
    };

    const languageOptions = [
        { code: 'en', name: 'English' },
        { code: 'zh', name: '中文' }
    ];

    const handleGaojiSearchClick = () => {
        navigate("/gaojiSearch");
    };

    const handleDirectoryClick = () => {
        navigate("/directory");
    };

    return (
        <div className="header-container">
            <div className="first-line">
                <li className="icon">
                    <h3>我是LOGO,找到图片换我</h3>
                    {/*<img src="../image/logo512.png" alt="logo"/>*/}
                </li>
                <ul className="first-line-right">
                    <li>
                        <h3>{t('welcomeUser')}: {username}</h3>
                    </li>
                    {/* 点击 logout 按钮显示弹窗 */}
                    <button
                        className="logout-button"
                        onClick={() => setShowLogoutModal(true)}
                    >
                        <h3>{t('logout')}</h3>
                    </button>

                    {/* 语言切换下拉框 */}
                    <div className="language-switcher" ref={dropdownRef}>
                        <div className="language-trigger" onClick={() => setIsOpen(!isOpen)}>
                            <GlobalOutlined className="language-icon" />
                            <span className="current-language">
                                {languageOptions.find(option => option.code === i18n.language)?.name || i18n.language}
                            </span>
                            {isOpen ? <UpOutlined className="dropdown-icon" /> : <DownOutlined className="dropdown-icon" />}
                        </div>

                        {isOpen && (
                            <div className="language-dropdown">
                                {languageOptions.map((lang) => (
                                    <div
                                        key={lang.code}
                                        className={`language-option ${i18n.language === lang.code ? 'active' : ''}`}
                                        onClick={() => changeLanguage(lang.code)}
                                    >
                                        {lang.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </ul>
            </div>
            <div className="second-line">
                <div className="return-home active">
                    <button className="return-home-btn" onClick={handleMain}>
                        <h3>{t('returnHome')}</h3>
                    </button>
                </div>
                <div className="cutter"></div>
                <div className="readvce">
                    <button className="GaojiSearchButton" onClick={handleGaojiSearchClick}>
                        <h3>{t('advancedSearch')}</h3>
                    </button>
                </div>
                <div className="directory-nav">
                    <button className="DirectoryButton" onClick={handleDirectoryClick}>
                        <h3>{t('directoryView')}</h3>
                    </button>
                </div>
            </div>

            {/* 退出确认弹窗 */}
            {showLogoutModal && (
                <>
                    {/* 背景遮罩 */}
                    <div className="modal-overlay"></div>

                    {/* 弹窗内容 */}
                    <div className="logout-modal" ref={modalRef}>
                        <div className="modal-header">
                            <ExclamationCircleOutlined className="warning-icon" />
                            <h3>{t('confirmLogout')}</h3>
                        </div>
                        <div className="modal-body">
                            <p>{t('logoutMessage')}</p>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="modal-btn cancel-btn"
                                onClick={cancelLogout}
                            >
                                {t('cancel')}
                            </button>
                            <button
                                className="modal-btn confirm-btn"
                                onClick={confirmLogout}
                            >
                                {t('confirm')}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Header;
