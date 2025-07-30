// src/page/MainPage.js
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import './MainPage.css';
import Header from "./header";
import Footer from "./Footer";

// 搜索组件
function SearchComponent() {
    const { t } = useTranslation();
    const [selectedValue, setSelectedValue] = useState('');
    const searchOptions = [t('allContainers'), t('title'), t('school'), t('abstract'), t('fullText'), t('keywords')];
    const navigate = useNavigate();
    const [inputContent, setInputContent] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [tabs] = useState([
        { name: t('retrieval') },
        { name: t('other') }
    ]);

    const handleSearchClick = () => {
        if (inputContent.trim() !== '') {
            navigate('/searchResult?q=' + encodeURIComponent(inputContent.trim()));
        }
    };

    const handleGaojiSearchClick = () => {
        navigate("/gaojiSearch");
    };

    return (
        <div className="search-area">
            <div className="banner"></div>
            <div className="searchmain">
                <div className="page-title">
                    <h1>{t('searchDoc')}</h1>
                </div>
                <ul className="search-tab">
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
                <div className={activeTab === 0 ? "search-tab-content-normal" : "search-tab-content-other"}>
                    <div className="input-box">
                        <div>
                            <select
                                onChange={(e) => setSelectedValue(e.target.value)}
                                className="sort"
                            >
                                {searchOptions.map((container) => (
                                    <option key={container} value={container}>{container}</option>
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
                            <button className="btn" onClick={handleSearchClick}>{t('search')}</button>
                        </div>
                    </div>
                    <div className="readvce">
                        <button className="GaojiSearchButton" onClick={handleGaojiSearchClick}>{t('advancedSearch')}</button>
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
    const buttons = [
        { label: t('uploadFile'), onClick: handleUploadFileClick },
    ];

    return (
        <div className="button-bar-container">
            <div className="button-bar-title">🔧{t('toolbar')}：</div>
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
            <Footer />
        </div>
    );
}

export default MainPage;