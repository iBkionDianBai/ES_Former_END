import React, { useState, useEffect } from 'react';
import './DirectoryPage.css';
import Header from "./header";
import Footer from "./Footer";
import { Helmet } from "react-helmet";
import { useTranslation } from 'react-i18next';
import { FolderOutlined, FileTextOutlined, SearchOutlined } from '@ant-design/icons';

function DirectoryPage() {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [directories, setDirectories] = useState([]);
    const [filteredDirectories, setFilteredDirectories] = useState([]);
    const [loading, setLoading] = useState(true);

    // 模拟目录数据 - 实际项目中应该从API获取
    const mockDirectories = [
        {
            id: 1,
            name: '技术文档',
            type: 'folder',
            children: [
                { id: 11, name: 'React 开发指南.docx', type: 'file', size: '2.3MB', lastModified: '2024-01-15' },
                { id: 12, name: 'API 接口文档.pdf', type: 'file', size: '1.8MB', lastModified: '2024-01-10' },
                { id: 13, name: 'Node.js 最佳实践.docx', type: 'file', size: '3.1MB', lastModified: '2024-01-08' }
            ]
        },
        {
            id: 2,
            name: '项目管理',
            type: 'folder',
            children: [
                { id: 21, name: '需求分析报告.docx', type: 'file', size: '4.2MB', lastModified: '2024-01-20' },
                { id: 22, name: '项目进度计划.xlsx', type: 'file', size: '1.5MB', lastModified: '2024-01-18' },
                { id: 23, name: '测试计划文档.pdf', type: 'file', size: '2.8MB', lastModified: '2024-01-12' }
            ]
        },
        {
            id: 3,
            name: '用户手册',
            type: 'folder',
            children: [
                { id: 31, name: '系统操作手册.pdf', type: 'file', size: '5.6MB', lastModified: '2024-01-25' },
                { id: 32, name: '常见问题解答.docx', type: 'file', size: '1.2MB', lastModified: '2024-01-22' },
                { id: 33, name: '快速入门指南.pdf', type: 'file', size: '3.4MB', lastModified: '2024-01-19' }
            ]
        }
    ];

    useEffect(() => {
        // 模拟API调用
        const fetchDirectories = async () => {
            setLoading(true);
            try {
                // 这里应该是实际的API调用
                setTimeout(() => {
                    setDirectories(mockDirectories);
                    setFilteredDirectories(mockDirectories);
                    setLoading(false);
                }, 1000);
            } catch (error) {
                console.error('Failed to fetch directories:', error);
                setLoading(false);
            }
        };

        fetchDirectories();
    }, []);

    useEffect(() => {
        // 根据搜索词过滤目录
        if (!searchTerm) {
            setFilteredDirectories(directories);
        } else {
            const filtered = directories.map(dir => {
                const filteredChildren = dir.children.filter(child =>
                    child.name.toLowerCase().includes(searchTerm.toLowerCase())
                );
                return filteredChildren.length > 0 ? { ...dir, children: filteredChildren } : null;
            }).filter(Boolean);
            setFilteredDirectories(filtered);
        }
    }, [searchTerm, directories]);

    const handleFileClick = (file) => {
        // 这里可以实现文件预览或下载功能
        console.log('Clicked file:', file);
        // 实际项目中可以跳转到ContentViewerPage或触发下载
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
                            {filteredDirectories.length === 0 ? (
                                <div className="no-results">
                                    <p>没有找到匹配的文件或文件夹</p>
                                </div>
                            ) : (
                                filteredDirectories.map(directory => (
                                    <div key={directory.id} className="directory-item">
                                        <div className="directory-header-item">
                                            <FolderOutlined className="folder-icon" />
                                            <h3 className="directory-name">{directory.name}</h3>
                                            <span className="file-count">({directory.children.length} 个文件)</span>
                                        </div>
                                        <div className="file-list">
                                            {directory.children.map(file => (
                                                <div
                                                    key={file.id}
                                                    className="file-item"
                                                    onClick={() => handleFileClick(file)}
                                                >
                                                    <div className="file-info">
                                                        {renderFileIcon(file.name)}
                                                        <span className="file-name">{file.name}</span>
                                                    </div>
                                                    <div className="file-meta">
                                                        <span className="file-size">{file.size}</span>
                                                        <span className="file-date">{file.lastModified}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
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