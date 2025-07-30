import React, { useState, useEffect, useRef } from 'react';
import './ContentViewerPage.css';
import Header from "./header";
import { Helmet } from "react-helmet";
import Footer from "./Footer";
import { useTranslation } from 'react-i18next';

// 工具函数：解析文章内容
const parseArticleContent = (htmlContent) => {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = htmlContent;

    // 提取目录
    const headings = Array.from(tempElement.querySelectorAll('h2, h3'));
    const toc = headings.map((heading) => ({
        id: heading.id,
        text: heading.textContent,
        level: heading.tagName === 'H2' ? 1 : 2,
    }));

    // 提取图表和表格
    const figures = Array.from(tempElement.querySelectorAll('figure')).map((figure, index) => ({
        id: figure.id,
        caption: figure.querySelector('figcaption')?.textContent || `图 ${index + 1}`,
        type: 'figure'
    }));

    const tables = Array.from(tempElement.querySelectorAll('table')).map((table, index) => ({
        id: table.id,
        caption: table.nextElementSibling?.classList.contains('table-caption')
            ? table.nextElementSibling.textContent
            : `表 ${index + 1}`,
        type: 'table'
    }));

    // 按文档顺序合并媒体项
    const media = [...figures, ...tables].sort((a, b) => {
        const elementA = document.getElementById(a.id);
        const elementB = document.getElementById(b.id);
        if (!elementA || !elementB) return 0;
        return elementA.compareDocumentPosition(elementB) & Node.DOCUMENT_POSITION_PRECEDING ? -1 : 1;
    });

    return { toc, media };
};

// API 请求函数
const fetchArticle = async () => {
    try {
        const response = await fetch('/api/article');
        if (!response.ok) throw new Error('Failed to fetch article');
        const result = await response.json();
        return result.data; // 提取 data 字段
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// 导航组件
const Navigation = ({ activeTab, onTabChange }) => {
    const { t } = useTranslation();
    return (
        <nav className="navigation">
            <div className="nav-container">
                <ul className="nav-tabs">
                    <li
                        className={`tab-item ${activeTab === t('tableOfContents') ? 'active' : ''}`}
                        onClick={() => onTabChange(t('tableOfContents'))}
                    >
                        {t('tableOfContents')}
                    </li>
                    <li
                        className={`tab-item ${activeTab === t('media') ? 'active' : ''}`}
                        onClick={() => onTabChange(t('media'))}
                    >
                        {t('media')}
                    </li>
                </ul>
                <div className="toolbar">
                    <button className="tool-btn"><i className="icon">🔍</i><span>{t('zoomIn')}</span></button>
                    <button className="tool-btn"><i className="icon">🔎</i><span>{t('zoomOut')}</span></button>
                </div>
            </div>
        </nav>
    );
};

// 侧边栏组件
const Sidebar = ({ activeTab, tableOfContents, mediaItems, onItemClick, windowHeight }) => {
    const { t } = useTranslation();
    return (
        <div className="sidebar" style={{ height: `${windowHeight - 100}px` }}>
            {activeTab === t('tableOfContents') && (
                <ul className="toc">
                    {tableOfContents.map((item) => (
                        <li
                            key={item.id}
                            className={`toc-item ${item.level === 2 ? 'sub-toc-item' : ''}`}
                            onClick={() => onItemClick(item.id)}
                        >
                            {item.text}
                        </li>
                    ))}
                </ul>
            )}

            {activeTab === t('media') && (
                <ul className="media-list">
                    {mediaItems.map((item) => (
                        <li
                            key={item.id}
                            className="media-item"
                            onClick={() => onItemClick(item.id)}
                        >
                            <span className="media-type">{item.type === 'figure' ? t('figure') : t('table')}</span>
                            {item.caption}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// 文章内容组件
const Article = ({ articleContent }) => {
    const articleRef = useRef(null);

    useEffect(() => {
        if (articleRef.current) {
            articleRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [articleContent]);

    return (
        <div className="event-article" ref={articleRef}>
            <h1 className="article-title">{articleContent.title}</h1>
            <div className="article-meta">
                <span className="author">{articleContent.author}</span>
                <span className="publish-date">{articleContent.publishDate}</span>
            </div>
            <div
                className="article-content"
                dangerouslySetInnerHTML={{ __html: articleContent.content }}
            />
            <div className="references">
                <h3>{articleContent.referencesTitle}</h3>
                <ol>
                    {articleContent.references.map((reference, index) => (
                        <li key={index}>{reference}</li>
                    ))}
                </ol>
            </div>
        </div>
    );
};

// 主内容查看页面
const ContentViewerPageContent = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState(t('tableOfContents'));
    const [articleContent, setArticleContent] = useState(null);
    const [tableOfContents, setTableOfContents] = useState([]);
    const [mediaItems, setMediaItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);

    useEffect(() => {
        fetchArticle()
            .then((data) => {
                setArticleContent(data);
                const { toc, media } = parseArticleContent(data.content);
                setTableOfContents(toc);
                setMediaItems(media);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching article:', error);
                alert(t('loadArticleFailed'));
            });

        const handleResize = () => setWindowHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleTabChange = (tab) => setActiveTab(tab);
    const handleScrollTo = (id) => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="app-container">
            <Helmet>
                <title>{articleContent?.title || t('articleDetails')}</title>
            </Helmet>
            <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
            <div className="content-wrapper">
                <Sidebar
                    activeTab={activeTab}
                    tableOfContents={tableOfContents}
                    mediaItems={mediaItems}
                    onItemClick={handleScrollTo}
                    windowHeight={windowHeight}
                />
                <div className="main-content">
                    {loading ? (
                        <div className="loading">{t('loading')}</div>
                    ) : (
                        <Article articleContent={articleContent} />
                    )}
                </div>
            </div>
        </div>
    );
};

function ContentViewerPage() {
    return (
        <div>
            <>
                <Header />
                <ContentViewerPageContent />
            </>
        </div>
    );
}

export default ContentViewerPage;