import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import "./SearchResultPage.css";
import '../index'
import Header from "../page/header";
import Footer from "../page/Footer";
import { useTranslation } from 'react-i18next';

// 计算事件名频度的函数（显示全部，不截断）
const calculateEventNameFrequency = (results) => {
    if (!Array.isArray(results)) return [];
    const eventNameCount = {};
    results.forEach(item => {
        const eventName = item.title?.split(' ')[0];
        if (eventName) {
            eventNameCount[eventName] = (eventNameCount[eventName] || 0) + 1;
        }
    });
    // 转换为数组并按频度排序，显示全部
    return Object.entries(eventNameCount)
        .sort(([,a], [,b]) => b - a)
        .map(([name, count]) => `${name}（${count}）`);
};

// 动态提取唯一年份
const extractUniqueYears = (results) => {
    if (!Array.isArray(results)) return [];
    const years = new Set();
    results.forEach(item => {
        if (item.time) years.add(item.time);
    });
    return Array.from(years).sort((a, b) => new Date(b) - new Date(a));
};

function SearchResultPageContent() {
    const { t } = useTranslation();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const searchText = searchParams.get('q') || '';
    const [inputValue, setInputValue] = useState(searchText);
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterOpen, setFilterOpen] = useState({ theme: true, year: true });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [useLoadMore, setUseLoadMore] = useState(false);

    const navigate = useNavigate();
    const [sortOrder, setSortOrder] = useState('desc');
    const [sortField, setSortField] = useState('relevance');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedValue, setSelectedValue] = useState('');
    const searchOptions = [t('allContainers'), t('title'), t('school'), t('abstract'), t('fullText'), t('keywords')];

    // 翻译搜索条件中的操作符和容器名称
    const translateSearchConditions = (conditions) => {
        if (!conditions) return '';
        
        // 双向翻译：中文到英文，英文到中文
        let translated = conditions;
        
        // 中文到英文
        translated = translated
            .replace(/并且/g, t('and'))
            .replace(/或者/g, t('or'))
            .replace(/不包含/g, t('notInclude'))
            .replace(/模糊/g, t('fuzzy'))
            .replace(/精确/g, t('exact'))
            .replace(/全部容器/g, t('allContainers'))
            .replace(/标题/g, t('title'))
            .replace(/学校/g, t('school'))
            .replace(/摘要/g, t('abstract'))
            .replace(/全文/g, t('fullText'))
            .replace(/关键词/g, t('keywords'));
        
        // 英文到中文（反向翻译）
        translated = translated
            .replace(/\bAnd\b/g, t('and'))
            .replace(/\bOr\b/g, t('or'))
            .replace(/\bNot Include\b/g, t('notInclude'))
            .replace(/\bFuzzy\b/g, t('fuzzy'))
            .replace(/\bExact\b/g, t('exact'))
            .replace(/\bAll Containers\b/g, t('allContainers'))
            .replace(/\bTitle\b/g, t('title'))
            .replace(/\bSchool\b/g, t('school'))
            .replace(/\bAbstract\b/g, t('abstract'))
            .replace(/\bFull Text\b/g, t('fullText'))
            .replace(/\bKeywords\b/g, t('keywords'));
        
        return translated;
    };

    // 构建翻译后的搜索内容
    const buildTranslatedSearchText = () => {
        if (!searchText || searchText.trim() === '') {
            return '';
        }
        return translateSearchConditions(searchText);
    };

    const [translatedSearchText, setTranslatedSearchText] = useState(buildTranslatedSearchText());

    const handleSearch = () => {
        if (inputValue.trim() !== '') {
            navigate('/searchResult?q=' + encodeURIComponent(inputValue.trim()));
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchResults([
                { id: 1, title: "事件题目一 题目第二行", source: "平台名", time: "2020-01-15" },
                { id: 2, title: "事件题目二 题目第二行", source: "平台名", time: "2020-02-20" },
                { id: 3, title: "事件题目三 题目第二行", source: "平台名", time: "2020-03-10" },
                { id: 4, title: "事件题目四 题目第二行", source: "平台名", time: "2020-04-05" },
                { id: 5, title: "事件题目五 题目第二行", source: "平台名", time: "2020-05-25" },
                { id: 6, title: "事件题目六 题目第二行", source: "平台名", time: "2020-06-18" },
                { id: 7, title: "事件题目七 题目第二行", source: "平台名", time: "2020-07-12" },
                { id: 8, title: "事件题目八 题目第二行", source: "平台名", time: "2020-08-08" },
                { id: 9, title: "事件题目九 题目第二行", source: "平台名", time: "2020-09-30" },
                { id: 10, title: "事件题目十 题目第二行", source: "平台名", time: "2020-10-22" }
            ]);
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchText]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchText]); // 移除selectedThemes和selectedYears依赖

    // 监听语言变化，重新翻译搜索内容
    useEffect(() => {
        setTranslatedSearchText(buildTranslatedSearchText());
    }, [t, searchText]);

    const toggleFilter = (filterName) => {
        setFilterOpen({ ...filterOpen, [filterName]: !filterOpen[filterName] });
    };

    // 动态生成主题选项（事件名频度）
    const themes = calculateEventNameFrequency(searchResults);
    // 动态生成年份选项
    const yearOptions = extractUniqueYears(searchResults);

    // 修改过滤逻辑，现在只用于结果展示，不进行实际筛选
    const filteredResults = searchResults; // 不进行筛选，显示所有结果

    const sortedResults = [...filteredResults].sort((a, b) => {
        if (sortField === 'relevance') {
            return sortOrder === 'asc' ? a.id - b.id : b.id - a.id;
        } else if (sortField === 'date') {
            return sortOrder === 'asc' ? new Date(a.time) - new Date(b.time) : new Date(b.time) - new Date(a.time);
        }
        return 0;
    });

    const totalPages = Math.ceil(sortedResults.length / pageSize);
    const pagedResults = useLoadMore
        ? sortedResults.slice(0, currentPage * pageSize)
        : sortedResults.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const generatePagination = () => {
        return Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => {
                if (p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1) return true;
                if (p === currentPage - 2 || p === currentPage + 2) return 'ellipsis';
                return false;
            })
            .reduce((acc, val) => {
                if (val === 'ellipsis' && acc[acc.length - 1] !== '...') acc.push('...');
                else if (val !== 'ellipsis') acc.push(val);
                return acc;
            }, []);
    };

    return (
        <div>
            <div className="search-bar-container">
                <div className="search-bar">
                    <div className="search-select-result">
                        <select
                            onChange={(e) => setSelectedValue(e.target.value)}
                            className="sort-result"
                        >
                            {searchOptions.map((container) => (
                                <option className="Options" key={container} value={container}>{container}</option>
                            ))}
                        </select>
                    </div>
                    <input type="text" value={inputValue} placeholder={t('inputSearchContent')} onChange={e => setInputValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                    <button className="refresh-search" onClick={handleSearch}>
                        <h3>{t('refreshSearch')}</h3>
                    </button>
                </div>
                <div className="search-params">{t('searchContent')}: {translatedSearchText}</div>
            </div>
            <div className="main-content">
                {/* 左侧结果展示栏 */}
                <div className="filter-section">
                    <div className="filter-container">
                        <div className="filter-header" onClick={() => toggleFilter('theme')}>
                            <h3>{t('eventNameFrequency')}</h3>
                            <span className="filter-icon">{filterOpen.theme ? '▼' : '▶'}</span>
                        </div>
                        {filterOpen.theme && (
                            <div className="filter-content">
                                {themes.map((item, idx) => (
                                    <div className="filter-item" key={idx}>
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="filter-container">
                        <div className="filter-header" onClick={() => toggleFilter('year')}>
                            <h3>{t('year')}</h3>
                            <span className="filter-icon">{filterOpen.year ? '▼' : '▶'}</span>
                        </div>
                        {filterOpen.year && (
                            <div className="filter-content">
                                {yearOptions.map((item, idx) => (
                                    <div className="filter-item" key={idx}>
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="results-section">
                    {isLoading ? (<div className="loading">{t('loading')}...</div>) : (
                        <>
                            <div className="toolbar-row">
                                <div className="filter-toolbar">
                                    <span className="total-results">
                                        {t("totalResults", { count: searchResults.length })}
                                    </span>
                                    <span style={{marginLeft: 20}}>{t('eventTime')}: </span>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        className="date-input"
                                    />
                                    <span style={{margin: '0 6px'}}>—</span>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                        className="date-input"
                                    />
                                    <button className="applyFilter" onClick={() => {
                                        setCurrentPage(1); // 筛选后重置到第一页
                                    }}>
                                        {t('applyFilter')}
                                    </button>
                                </div>
                                <div className="results-toolbar">
                                    <span>{t('sortBy')}:</span>
                                    <select className="sort-select" value={sortField} onChange={e => setSortField(e.target.value)}>
                                        <option value="relevance">{t('relevance')}</option>
                                        <option value="date">{t('date')}</option>
                                    </select>
                                    <button
                                        className="sort-order-btn"
                                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    >
                                        {sortOrder === 'asc' ? '↑' : '↓'}
                                    </button>
                                    <span style={{ marginLeft: '15px' }}>{t('perPage')}:</span>
                                    <select
                                        className="page-size-select"
                                        value={pageSize}
                                        onChange={e => {
                                            setPageSize(Number(e.target.value));
                                            setCurrentPage(1); // 重置为第一页
                                        }}
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>
                            </div>
                            <table className="results-table">
                                <thead>
                                <tr>
                                    <th>{t('serialNumber')}</th>
                                    <th>{t('title')}</th>
                                    <th>{t('eventTime')}</th>
                                    <th>{t('operation')}</th>
                                </tr>
                                </thead>
                                <tbody>
                                {pagedResults.map((result, index) => (
                                    <tr key={result.id}>
                                        <td>{(currentPage - 1) * pageSize + index + 1}</td>
                                        <td>
                                            <span 
                                                className="clickable-link"
                                                onClick={() => navigate(`/contentViewer?id=${result.id}`)}
                                            >
                                                {result.title}
                                            </span>
                                        </td>
                                        <td>{result.time}</td>
                                        <td>
                                            <span 
                                                title={t('read')} 
                                                className="operation-icon"
                                                onClick={() => navigate(`/contentViewer?id=${result.id}`)}
                                            >
                                                📖
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>

                            <div className="pagination">
                                {generatePagination().map((page, index) => (
                                    <button
                                        key={index}
                                        className={page === currentPage ? 'active' : ''}
                                        onClick={() => page !== '...' && setCurrentPage(page)}
                                        disabled={page === '...'}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function SearchResultPage() {
    return (
        <div>
            <>
                <Helmet>
                    <title>搜索结果</title>
                </Helmet>
                <Header />
                <SearchResultPageContent />
                <Footer />
            </>
        </div>
    );
}
export default SearchResultPage;
