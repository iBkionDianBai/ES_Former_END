import React, { useState, useEffect, useRef } from 'react';
import './ContentViewerPage.css';
import Header from "./header";
import { Helmet } from "react-helmet";
import Footer from "./Footer";
import { useTranslation } from 'react-i18next';
import { useLocation, useSearchParams } from 'react-router-dom';
import { getArticleContent } from '../api/service.js';
import { ZoomInOutlined, ZoomOutOutlined, FileTextOutlined, PictureOutlined } from '@ant-design/icons';

// 工具函数：解析文章内容
const parseArticleContent = (htmlContent) => {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = htmlContent;

    // 清除所有元素的内联样式，防止影响页面布局
    const allElements = tempElement.querySelectorAll('*');
    allElements.forEach(element => {
        element.removeAttribute('style');
        // 同时移除class属性以避免外部CSS类影响
        // 但保留一些语义化重要的类名，如目录、图表等需要的类名
        const classes = element.className;
        if (classes && typeof classes === 'string') {
            // 保留一些特定的类名，移除其他可能影响样式的类名
            const preservedClasses = classes.split(' ').filter(cls => 
                cls.startsWith('toc-') || 
                cls.startsWith('figure-') || 
                cls.startsWith('table-') ||
                cls === 'caption' ||
                cls === 'media'
            ).join(' ');
            element.className = preservedClasses;
        }
    });

    // 提取目录（优先查找h1标签，然后查找h2, h3）
    const headings = Array.from(tempElement.querySelectorAll('h1, h2, h3'));
    const toc = headings.map((heading, index) => {
        // 如果没有id，为其生成一个
        if (!heading.id) {
            heading.id = `heading-${index}`;
        }
        
        // 根据标题内容判断级别，处理中文标题格式
        let level = heading.tagName === 'H1' ? 1 : heading.tagName === 'H2' ? 2 : 3;
        const text = heading.textContent?.trim() || `Heading ${index + 1}`;
        
        // 检查是否为中文标题格式并调整级别
        // 例如："一、"、"二、"等格式通常为二级标题
        // "(一)"、"(二)"等格式通常为三级标题
        if (/^[一二三四五六七八九十]+、/.test(text)) {
            level = 2; // 中文数字+顿号格式为二级标题
        } else if (/^\([一二三四五六七八九十]+\)/.test(text)) {
            level = 3; // 中文数字+括号格式为三级标题
        } else if (/^[(（][一二三四五六七八九十]+[)）]/.test(text)) {
            level = 3; // 中文数字+全角或半角括号格式为三级标题
        }
        
        return {
            id: heading.id,
            text: text,
            level: level,
        };
    });

    // 提取图表和表格
    const figures = Array.from(tempElement.querySelectorAll('figure')).map((figure, index) => {
        if (!figure.id) {
            figure.id = `figure-${index}`;
        }
        return {
            id: figure.id,
            caption: figure.querySelector('figcaption')?.textContent || `Figure ${index + 1}`,
            type: 'figure'
        };
    });

    const tables = Array.from(tempElement.querySelectorAll('table')).map((table, index) => {
        if (!table.id) {
            table.id = `table-${index}`;
        }
        return {
            id: table.id,
            caption: table.querySelector('caption')?.textContent || 
                    table.nextElementSibling?.classList.contains('table-caption')
                        ? table.nextElementSibling.textContent
                        : `Table ${index + 1}`,
            type: 'table'
        };
    });

    // 按文档顺序合并媒体项
    const media = [...figures, ...tables].sort((a, b) => {
        const elementA = tempElement.querySelector(`#${a.id}`);
        const elementB = tempElement.querySelector(`#${b.id}`);
        if (!elementA || !elementB) return 0;
        return elementA.compareDocumentPosition(elementB) & Node.DOCUMENT_POSITION_PRECEDING ? 1 : -1;
    });

    // 将修改后的HTML更新回去
    const updatedContent = tempElement.innerHTML;

    return { toc, media, updatedContent };
};

// API 请求函数
const fetchArticle = async (articleId) => {
    try {
        if (!articleId) {
            throw new Error('Article ID cannot be empty');
        }
        
        const response = await getArticleContent(articleId);
        
        // 处理后端返回的数据结构
        if (response.data && response.data.code === 200) {
            const articleData = response.data.data;
            
            // 处理HTML内容
            const htmlContent = articleData.htmlContent;
            
            if (htmlContent) {
                // 提取HTML中的标题和内容
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlContent, 'text/html');
                
                // 提取标题（优先从第一个p标签提取，如果是标题样式）
                const firstP = doc.querySelector('p');
                const firstH1 = doc.querySelector('h1');
                
                let title = 'Article Details';
                
                // 先检查第一个p标签是否为标题
                if (firstP && firstP.textContent && firstP.textContent.trim()) {
                    const pText = firstP.textContent.trim();
                    // 如果第一个p标签的内容看起来像标题（没有句号等）
                    if (pText.length < 100 && !pText.includes('。') && !pText.includes('，')) {
                        title = pText;
                    }
                }
                
                // 如果没有合适的p标签标题，再检查h1
                if (title === 'Article Details' && firstH1 && firstH1.textContent) {
                    title = firstH1.textContent.trim();
                }
                
                // 清除body标签的样式影响
                const bodyElement = doc.body;
                if (bodyElement) {
                    // 移除body标签上的所有样式属性
                    bodyElement.removeAttribute('style');
                    bodyElement.removeAttribute('class');
                }
                
                // 获取body内容
                const bodyContent = bodyElement?.innerHTML || htmlContent;
                
                // 提取head中的style内容，但不直接应用
                // 而是将其转换为更安全的内联样式
                let styles = '';
                const styleElements = doc.querySelectorAll('head style, style');
                styleElements.forEach(styleEl => {
                    if (styleEl.textContent) {
                        styles += styleEl.textContent;
                    }
                });
                
                // 将样式转换为更安全的形式（可选）
                // 这里我们简单地移除所有样式，以确保不会影响页面布局
                styles = '';
                
                return {
                    id: articleData.id,
                    title: title.length > 50 ? title.substring(0, 50) + '...' : title,
                    content: bodyContent, // 只使用清理后的内容
                    author: '',
                    publishDate: '',
                    references: [],
                    referencesTitle: 'References'
                };
            } else {
                throw new Error('Article content is empty');
            }
        } else {
            throw new Error(response.data?.message || 'Failed to get article');
        }
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// 导航组件
const Navigation = ({ activeTab, onTabChange, zoomLevel, onZoomIn, onZoomOut, articleTitle }) => {
    const { t } = useTranslation();
    return (
        <nav className="navigation">
            <div className="nav-container">
                <ul className="nav-tabs">
                    <li
                        className={`tab-item ${activeTab === t('tableOfContents') ? 'active' : ''}`}
                        onClick={() => onTabChange(t('tableOfContents'))}
                    >
                        <FileTextOutlined style={{ marginRight: '8px' }} />
                        {t('tableOfContents')}
                    </li>
                    <li
                        className={`tab-item ${activeTab === t('media') ? 'active' : ''}`}
                        onClick={() => onTabChange(t('media'))}
                    >
                        <PictureOutlined style={{ marginRight: '8px' }} />
                        {t('media')}
                    </li>
                </ul>
                
                {/* 文章标题显示区域 */}
                <div className="article-title-nav">
                    <span className="article-title-text">
                        {articleTitle || t('articleTitle')}
                    </span>
                </div>
                
                <div className="toolbar">
                    <span className="zoom-info">{t('zoom')}: {Math.round(zoomLevel * 100)}%</span>
                    <button className="tool-btn" onClick={onZoomIn} title={t('zoomIn')}>
                        <ZoomInOutlined style={{ marginRight: '5px' }} />
                        <span>{t('zoomIn')}</span>
                    </button>
                    <button className="tool-btn" onClick={onZoomOut} title={t('zoomOut')}>
                        <ZoomOutOutlined style={{ marginRight: '5px' }} />
                        <span>{t('zoomOut')}</span>
                    </button>
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
                            className={`toc-item level-${item.level}`}
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
const Article = ({ articleContent, zoomLevel }) => {
    const { t } = useTranslation();
    const articleRef = useRef(null);

    useEffect(() => {
        if (articleRef.current) {
            articleRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [articleContent]);

    // 如果没有文章内容，显示加载中
    if (!articleContent) {
        return <div className="loading">{t('loading')}</div>;
    }

    return (
        <div 
            className="event-article" 
            ref={articleRef}
            style={{ 
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top left',
                width: `${100 / zoomLevel}%`
            }}
        >
            {/* 文章内容 */}
            <div
                className="article-content"
                dangerouslySetInnerHTML={{ __html: articleContent.content }}
            />
            
            {/* 参考文献 */}
            {articleContent.references && articleContent.references.length > 0 && (
                <div className="references">
                    <h3>{articleContent.referencesTitle || t('references')}</h3>
                    <ol>
                        {articleContent.references.map((reference, index) => (
                            <li key={index}>{reference}</li>
                        ))}
                    </ol>
                </div>
            )}
        </div>
    );
};

// 主内容查看页面
const ContentViewerPage = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(t('tableOfContents'));
    const [articleContent, setArticleContent] = useState(null);
    const [tableOfContents, setTableOfContents] = useState([]);
    const [mediaItems, setMediaItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);
    const [zoomLevel, setZoomLevel] = useState(1); // 添加缩放状态

    // 从 URL 参数中获取文章 ID
    const articleId = searchParams.get('id');

    // 缩放功能
    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 0.1, 2)); // 最大200%
    };
    
    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev - 0.1, 0.5)); // 最合50%
    };

    useEffect(() => {
        if (!articleId) {
            setError(t('missingArticleId'));
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        
        fetchArticle(articleId)
            .then((data) => {
                const { toc, media, updatedContent } = parseArticleContent(data.content);
                // 使用更新后的内容，确保ID正确应用
                setArticleContent({
                    ...data,
                    content: updatedContent
                });
                setTableOfContents(toc);
                setMediaItems(media);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching article:', error);
                setError(error.message || t('loadArticleFailed'));
                setLoading(false);
            });

        const handleResize = () => setWindowHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [articleId, t]);

    const handleTabChange = (tab) => setActiveTab(tab);
    const handleScrollTo = (id) => {
        console.log('Attempting to scroll to:', id);
        
        // 尝试多种方式查找元素
        let element = document.getElementById(id);
        
        if (!element) {
            // 如果直接查找不到，尝试在文章内容区域内查找
            const articleContainer = document.querySelector('.article-content');
            if (articleContainer) {
                element = articleContainer.querySelector(`#${id}`);
            }
        }
        
        if (!element) {
            // 尝试通过CSS选择器查找
            element = document.querySelector(`[id="${id}"]`);
        }
        
        if (element) {
            console.log('Found element:', element);
            
            // 考虑缩放和导航栏高度
            const navigationHeight = document.querySelector('.navigation')?.offsetHeight || 125;
            const headerHeight = 95; // header高度
            const totalOffset = navigationHeight + headerHeight + 20; // 额外的间距
            
            // 计算目标位置
            const elementRect = element.getBoundingClientRect();
            const scrollTop = window.pageYOffset + elementRect.top - totalOffset;
            
            // 平滑滚动到目标位置
            window.scrollTo({
                top: scrollTop,
                behavior: 'smooth'
            });
            
            // 高亮目标元素（可选）
            element.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
            setTimeout(() => {
                element.style.backgroundColor = '';
            }, 2000);
        } else {
            console.warn('Element not found with id:', id);
            // 如果找不到元素，尝试通过文本匹配查找
            const allHeadings = document.querySelectorAll('.article-content h1, .article-content h2, .article-content h3');
            const targetTocItem = tableOfContents.find(item => item.id === id);
            
            if (targetTocItem) {
                const matchingHeading = Array.from(allHeadings).find(heading => 
                    heading.textContent?.trim() === targetTocItem.text
                );
                
                if (matchingHeading) {
                    console.log('Found heading by text match:', matchingHeading);
                    matchingHeading.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start',
                        inline: 'nearest'
                    });
                }
            }
        }
    };

    return (
        <div>
            <Helmet>
                <title>{articleContent?.title || t('articleDetails')}</title>
            </Helmet>
            <Header />
            <Navigation 
                activeTab={activeTab} 
                onTabChange={handleTabChange}
                zoomLevel={zoomLevel}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                articleTitle={articleContent?.title}
            />
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
                    ) : error ? (
                        <div className="error-message">
                            <h2>{t('loadFailed')}</h2>
                            <p>{error}</p>
                            <button onClick={() => window.history.back()}>{t('goBack')}</button>
                        </div>
                    ) : (
                        <Article articleContent={articleContent} zoomLevel={zoomLevel} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContentViewerPage;