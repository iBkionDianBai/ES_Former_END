import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import './DirectoryPage.css';
import Header from "./header";
import Footer from "./Footer";
import { Helmet } from "react-helmet";
import { useTranslation } from 'react-i18next';
import { FolderOutlined, FileTextOutlined, SearchOutlined } from '@ant-design/icons';
import {articleList} from '../api/service';

function DirectoryPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalResults, setTotalResults] = useState(0);
    const [allResults, setAllResults] = useState([]); // 存储所有结果

    // 获取所有结果的函数
    const fetchAllResults = async (searchParams, allData = [], currentPage = 1) => {
        try {
            const params = {
                ...searchParams,
                currentPage: currentPage,
                pageSize: 100 // 使用最大允许的页面大小
            };
            
            console.log(`获取第${currentPage}页数据:`, params);
            
            const response = await articleList(params);
            
            if (response.data.code === 200) {
                const { data } = response.data;
                const items = data.items || [];
                const newAllData = [...allData, ...items];
                
                // 如果还有更多数据，继续获取下一页
                if (items.length === 100 && newAllData.length < data.totalCount) {
                    return await fetchAllResults(searchParams, newAllData, currentPage + 1);
                } else {
                    return {
                        items: newAllData,
                        totalCount: data.totalCount || newAllData.length
                    };
                }
            } else {
                throw new Error(response.data.msg || '搜索失败');
            }
        } catch (error) {
            throw error;
        }
    };

    // 执行搜索请求的函数
    const performSearch = async () => {
        setLoading(true);
        try {
            // 构建搜索参数，默认使用 all 字段，获取所有结果
            const searchParams = {
                conditions: [
                    {
                        field: "all", // 目录页面默认搜索所有字段
                        keyword: searchTerm ? searchTerm.trim() : '' // 允许空搜索显示所有结果
                    }
                ],
                sortField: '_score', // 按相关度排序
                sortOrder: 'desc',
                enableHighlight: true
            };

            console.log('目录页面发送搜索请求:', searchParams);
            
            // 获取所有结果
            const allData = await fetchAllResults(searchParams);
            console.log('目录页面获取到所有数据:', allData);
            
            setAllResults(allData.items);
            setSearchResults(allData.items);
            setTotalResults(allData.totalCount);
        } catch (error) {
            console.error('搜索接口调用失败:', error);
            if (error.response && error.response.data) {
                message.error(error.response.data.msg || t('searchError') || '搜索出错');
            } else if (error.message) {
                message.error(error.message);
            } else {
                message.error(t('networkError') || '网络连接错误');
            }
            setAllResults([]);
            setSearchResults([]);
            setTotalResults(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        performSearch();
    }, [searchTerm]);

    const handleFileClick = (file) => {
        // 跳转到内容查看页面
        navigate(`/contentViewer?id=${file.id}`);
    };

    const renderFileIcon = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();
        const iconStyle = { marginRight: '8px', fontSize: '16px' };
        
        switch (extension) {
            case 'pdf':
                return <FileTextOutlined style={{ ...iconStyle, color: '#ff4d4f' }} />;
            case 'docx':
            case 'doc':
                return <FileTextOutlined style={{ ...iconStyle, color: '#1890ff' }} />;
            case 'xlsx':
            case 'xls':
                return <FileTextOutlined style={{ ...iconStyle, color: '#52c41a' }} />;
            default:
                return <FileTextOutlined style={iconStyle} />;
        }
    };

    return (
        <div>
            <Helmet>
                <title>{t('directoryView')} - {t('publicOpinionSystem')}</title>
            </Helmet>
            <Header />
            <div className="directory-page">
                <div className="directory-container">
                    <div className="directory-header">
                        <h1 className="directory-title">{t('directoryView')}</h1>
                        <div className="search-box">
                            <SearchOutlined className="search-icon" />
                            <input
                                type="text"
                                placeholder={t('search')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && performSearch()} // 添加回车键支持
                                className="search-input"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>{t('loading')}</p>
                        </div>
                    ) : (
                        <div className="directory-content">
                            <div className="results-summary">
                                <p>{t("totalResults", { count: totalResults })}</p>
                            </div>
                            {searchResults.length === 0 ? (
                                <div className="no-results">
                                    <p>{t('noResults')}</p>
                                </div>
                            ) : (
                                <div className="file-list">
                                    {searchResults.map((result, index) => (
                                        <div
                                            key={result.id}
                                            className="file-item"
                                            onClick={() => handleFileClick(result)}
                                        >
                                            <div className="file-info">
                                                <FileTextOutlined style={{ marginRight: '8px', fontSize: '16px', color: '#1890ff' }} />
                                                <span className="file-name">{result.title}</span>
                                                <span className="file-number">#{index + 1}</span>
                                            </div>
                                            <div className="file-meta">
                                                <span className="file-date">{result.eventStartTime || '-'}</span>
                                            </div>
                                            <div className="file-detail">
                                                <span className="file-school">{result.schoolName || '-'}</span>
                                                <span className="file-summary" title={result.summary}>{result.summary || '-'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default DirectoryPage;