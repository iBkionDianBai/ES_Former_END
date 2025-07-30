// src/page/header.js
import { useNavigate } from "react-router-dom";
import React from "react";
import axios from 'axios';
import './header.css';
import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';

function Header() {
    const navigate = useNavigate();
    const username = sessionStorage.getItem('username');
    const { t, i18n } = useTranslation();

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("username");
        delete axios.defaults.headers.common["Authorization"];
        navigate("/");
    };

    const handleMain = () => {
        navigate("/main");
    }

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng)
            .then(() => {
                console.log(`Language changed to ${lng}`);
                // 更新 cookie
                Cookies.set('i18next', lng);
            })
            .catch((error) => {
                console.error('Error changing language:', error);
            });
    };

    return (
        <div className="top-section">
            <button className="logout-button" onClick={handleMain}>
                {t('returnHome')}
            </button>
            <ul className="top-section-middle"><h1>{t('publicOpinionSystem')}</h1></ul>
            <ul className="top-section-right">
                <li>{t('welcomeUser')}: {username}</li>
                <button className="logout-button" onClick={handleLogout}>
                    {t('logout')}
                </button>
                <div className="language-switcher">
                    <span onClick={() => changeLanguage('en')}>EN</span>
                    <span onClick={() => changeLanguage('zh')}>中文</span>
                </div>
            </ul>
        </div>
    );
}

export default Header;