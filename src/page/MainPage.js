// src/page/MainPage.js
import React, {useMemo, useState, useEffect, useRef, useCallback} from "react";
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
import { DownOutlined } from '@ant-design/icons';

// 搜索组件
function SearchComponent({ isFirstPage = true }) {
    const { t } = useTranslation();
    const [selectedValue, setSelectedValue] = useState(t('allContainers'));
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const searchOptions = [t('allContainers'), t('title'), t('school'), t('abstract'), t('fullText'), t('keywords')];
    const navigate = useNavigate();
    const [inputContent, setInputContent] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    // 注释掉检索和其它按钮
    // const tabs = useMemo(() => [
    //     { name: t('retrieval') },
    //     { name: t('other') }
    // ], [t]);

    const handleSearchClick = () => {
        // 允许空搜索，显示所有结果
        navigate('/searchResult?q=' + encodeURIComponent(inputContent.trim()));
    };

    const handleOptionSelect = (option) => {
        setSelectedValue(option);
        setDropdownOpen(false);
    };

    // 点击外部关闭下拉菜单
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen]);

    return (
        <div className={`search-area ${isFirstPage ? 'first-page' : 'second-page'}`}>
            <div className="banner">
                <div className="searchmain">
                    {/* 注释掉检索和其它按钮 */}
                    {/* {isFirstPage && (
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
                    )} */}
                    <div className="page-title">
                        <h1>{t('searchDoc')}</h1>
                    </div>
                    <div className={activeTab === 0 ? "search-tab-content-normal" : "search-tab-content-other"}>
                        <div className="input-box">
                            <div className="search-select">
                                <div 
                                    ref={dropdownRef}
                                    className="custom-select sort"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                >
                                    <span className="select-text">{selectedValue}</span>
                                    <DownOutlined 
                                        className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`} 
                                    />
                                    {dropdownOpen && (
                                        <div className="dropdown-menu">
                                            {searchOptions.map((option) => (
                                                <div 
                                                    key={option} 
                                                    className={`dropdown-option ${selectedValue === option ? 'selected' : ''}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOptionSelect(option);
                                                    }}
                                                >
                                                    {option}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="input-content">
                                <input
                                    className="input"
                                    type="text"
                                    value={inputContent}
                                    onChange={(e) => setInputContent(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
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
            {/* 向下滑动提示 */}
            <div className="scroll-hint">
                <div className="mouse">
                    <span className="wheel"></span>
                </div>
                <div className="arrow">
                    <span></span>
                </div>
                <div className="hint-text">{t('scrollDown') || '向下滑动'}</div>
            </div>
        </div>
    );
}

function ButtonBar({ isFirstPage = false }) {
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

    if (isFirstPage) {
        return null;
    }

    return (
        <div className="button-bar-container">
            <div className="button-bar-title">
                <h1 className="button-bar-title-content" data-text={t('toolbar')}>{t('toolbar')}</h1>
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
    const [currentPage, setCurrentPage] = useState(1);
    const [showHeader, setShowHeader] = useState(false);
    const pageRef = useRef(null);

    // 手动切换页面的函数
    const switchToPage = (page) => {
        console.log(`手动切换到第${page}页`);
        setCurrentPage(page);
        setShowHeader(page === 2);
        
        if (page === 2) {
            window.scrollTo({
                top: window.innerHeight - 1,
                behavior: 'smooth'
            });
        } else {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    // 滚动处理函数
    const handleWheel = (e) => {
        console.log('Wheel事件触发! deltaY:', e.deltaY, 'currentPage:', currentPage);
        
        // 向下滚动
        if (e.deltaY > 0 && currentPage === 1) {
            console.log('向下滚动，切换到第二页');
            switchToPage(2);
        }
        // 向上滚动
        else if (e.deltaY < 0 && currentPage === 2) {
            console.log('向上滚动，切换到第一页');
            switchToPage(1);
        }
    };

    // 滚动位置处理函数
    const handleScroll = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const threshold = windowHeight * 0.5;

        console.log('Scroll事件触发! scrollTop:', scrollTop, 'threshold:', threshold);

        // 基于滚动位置决定显示哪一页
        if (scrollTop >= threshold) {
            if (currentPage !== 2) {
                console.log('滚动位置切换到第二页');
                setCurrentPage(2);
                setShowHeader(true);
            }
        } else {
            if (currentPage !== 1) {
                console.log('滚动位置切换到第一页');
                setCurrentPage(1);
                setShowHeader(false);
            }
        }
    };

    // 事件监听
    useEffect(() => {
        console.log('绑定事件监听器');
        
        // 绑定wheel事件
        window.addEventListener('wheel', handleWheel, { passive: false });
        document.addEventListener('wheel', handleWheel, { passive: false });
        document.body.addEventListener('wheel', handleWheel, { passive: false });
        
        // 绑定scroll事件
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // 立即执行一次，检查初始状态
        handleScroll();
        
        return () => {
            console.log('移除事件监听器');
            window.removeEventListener('wheel', handleWheel);
            document.removeEventListener('wheel', handleWheel);
            document.body.removeEventListener('wheel', handleWheel);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [currentPage]); // 只在currentPage变化时重新绑定

    // 渲染逻辑
    const shouldShowHeader = showHeader && currentPage === 2;
    console.log('渲染时状态:', { currentPage, showHeader, shouldShowHeader });

    return (
        <div className="page-wrapper">
            <Helmet>
                <title>{t('welcome')}</title>
            </Helmet>
            
            {/* Header渲染 */}
            {shouldShowHeader && <Header />}
            
            {/*/!* 调试信息 *!/*/}
            {/*<div style={{*/}
            {/*    position: 'fixed',*/}
            {/*    top: '10px',*/}
            {/*    right: '10px',*/}
            {/*    background: 'rgba(0,0,0,0.8)',*/}
            {/*    color: 'white',*/}
            {/*    padding: '10px',*/}
            {/*    borderRadius: '5px',*/}
            {/*    fontSize: '12px',*/}
            {/*    zIndex: 9999*/}
            {/*}}>*/}
            {/*    <div>当前页面: {currentPage}</div>*/}
            {/*    <div>Header显示: {showHeader ? '是' : '否'}</div>*/}
            {/*    <div>应该显示Header: {shouldShowHeader ? '是' : '否'}</div>*/}
            {/*    <button onClick={() => switchToPage(2)} style={{marginTop: '5px', padding: '5px'}}>*/}
            {/*        切换到第二页*/}
            {/*    </button>*/}
            {/*    <button onClick={() => switchToPage(1)} style={{marginTop: '5px', padding: '5px', marginLeft: '5px'}}>*/}
            {/*        切换到第一页*/}
            {/*    </button>*/}
            {/*</div>*/}
            
            <div className="page-content" ref={pageRef}>
                <div className="first-page">
                    <SearchComponent isFirstPage={currentPage === 1} />
                </div>
                <div className="second-page">
                    <ButtonBar isFirstPage={false} />
                    {/*<RankingBoard />*/}
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default MainPage;