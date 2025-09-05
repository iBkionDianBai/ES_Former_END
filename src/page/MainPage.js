// src/page/MainPage.js
import React, {useMemo, useState} from "react";
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { message } from 'antd';
import './MainPage.css';
import Header from "./header";
import Footer from "./Footer";
import RankingBoard from "../MainPageExtend/RankingBoard";
import { checkAdminPermission } from '../api/service';

// 图标
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

// 搜索组件
function SearchComponent() {
    const { t } = useTranslation();
    const [selectedValue, setSelectedValue] = useState('');
    const searchOptions = [t('allContainers'), t('title'), t('school'), t('abstract'), t('fullText'), t('keywords')];
    const navigate = useNavigate();
    const [inputContent, setInputContent] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const tabs = useMemo(() => [
        { name: t('retrieval') },
        { name: t('other') }
    ], [t]);

    const handleSearchClick = () => {
        if (inputContent.trim() !== '') {
            navigate('/searchResult?q=' + encodeURIComponent(inputContent.trim()));
        }
    };

    return (
        <div className="search-area">
            <div className="banner">
                <div className="searchmain">
                    <div className="search-tab">
                        <ul>
                            {tabs.map((tab, index) => (
                                <li
                                    key={index}
                                    className={activeTab === index ? "on active" : ""}
                                    onClick={() => setActiveTab(index)}
                                >
                                    {tab.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="page-title">
                        <h1>{t('searchDoc')}</h1>
                    </div>
                    <div className={activeTab === 0 ? "search-tab-content-normal" : "search-tab-content-other"}>
                        <div className="input-box">
                            <div className="search-select">
                                <select
                                    onChange={(e) => setSelectedValue(e.target.value)}
                                    className="sort"
                                >
                                    {searchOptions.map((container) => (
                                        <option className="Options" key={container} value={container}>{container}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-content">
                                <input
                                    className="input"
                                    type="text"
                                    value={inputContent}
                                    onChange={(e) => setInputContent(e.target.value)}
                                    placeholder={t('search')}
                                />
                            </div>
                            <div className="search-btn">
                                <button className="btn" onClick={handleSearchClick}>
                                    <FontAwesomeIcon icon={faSearch} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ButtonBar() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const handleUploadFileClick = () => {
        navigate("/uploadFile");
    }
    
    const handleAdminToolsClick = async () => {
        try {
            // 验证管理员权限
            const response = await checkAdminPermission();
            
            if (response.data.code === 200 && response.data.data === true) {
                // 管理员验证通过，跳转到管理员页面
                navigate("/adminTools");
            } else {
                // 非管理员用户，跳转到403页面
                navigate('/403');
            }
        } catch (error) {
            console.error('管理员权限验证失败:', error);
            
            if (error.response && error.response.data) {
                const { code, msg } = error.response.data;
                
                switch (code) {
                    case 500:
                        if (msg === '未登录') {
                            message.error(t('notLoggedIn') || '请先登录');
                            navigate('/login');
                        } else if (msg === '身份验证失败') {
                            message.error(t('authenticationFailed') || '身份验证失败，请重新登录');
                            navigate('/login');
                        } else if (msg === '非管理员用户') {
                            // 非管理员用户，跳转到403页面
                            navigate('/403');
                        } else {
                            message.error(msg || t('unknownError') || '未知错误');
                        }
                        break;
                    default:
                        message.error(msg || t('unknownError') || '未知错误');
                }
            } else {
                message.error(t('networkError') || '网络错误，请稍后重试');
            }
        }
    }
    const buttons = [
        { label: t('uploadFile'), onClick: handleUploadFileClick },
        { label: t('adminTools') || '管理员工具', onClick: handleAdminToolsClick },
    ];

    return (
        <div className="button-bar-container">
            <div className="button-bar-title">
                <h1>{t('toolbar')}</h1>
            </div>
            <div className="button-bar">
                <ul className="select-list">
                    {buttons.map((btn, index) => (
                        <li key={index}>
                            <button className="btn" onClick={btn.onClick}>{btn.label}</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

function MainPage() {
    const { t } = useTranslation();
    return (
        <div className="page-wrapper">
            <Helmet>
                <title>{t('welcome')}</title>
            </Helmet>
            <Header />
            <SearchComponent />
            <ButtonBar />
            <RankingBoard />
            <Footer />
        </div>
    );
}

export default MainPage;