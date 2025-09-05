import React, { useState, useEffect } from "react";
import GaojiSearchComponent from "./gaojiSearch";
import "./SearchResultPage.css";
import { useNavigate, useLocation } from "react-router-dom";
import Footer from "../page/Footer";
import { useTranslation } from 'react-i18next';
import { advancedSearch } from '../api/service';


// 计算事件名频度的函数
const calculateEventNameFrequency = (results) => {
    // 确保results是数组，非数组则返回空数组
    if (!Array.isArray(results)) {
        console.warn('Invalid results data, expected array', results);
        return [];
    }

    const eventNameCount = {};
    results.forEach(item => {
        // 提取事件名（取标题的第一部分作为事件名）
        const eventName = item.title?.split(' ')[0]; // 增加item.title存在性判断
        if (eventName) { // 确保eventName有效
            eventNameCount[eventName] = (eventNameCount[eventName] || 0) + 1;
        }
    });

    // 转换为数组并按频度排序，取前5个
    const sortedEvents = Object.entries(eventNameCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => `${name}（${count}）`);

    return sortedEvents;
};

// 从结果中提取唯一的来源
const extractUniqueSources = (results) => {
    if (!Array.isArray(results)) {
        console.warn('Invalid results data, expected array', results);
        return [];
    }

    const sources = new Set();
    results.forEach(item => {
        if (item.source) {
            sources.add(item.source);
        }
    });

    return Array.from(sources);
};

// 从结果中提取唯一的年份（或日期）
const extractUniqueYears = (results) => {
    if (!Array.isArray(results)) {
        console.warn('Invalid results data, expected array', results);
        return [];
    }

    const years = new Set();
    results.forEach(item => {
        if (item.time) {
            years.add(item.time);
        }
    });

    // 按日期排序
    return Array.from(years).sort((a, b) => new Date(b) - new Date(a));
};


function GaojiSearchResultPageContent() {
    const { t } = useTranslation();
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState('desc');
    const [sortField, setSortField] = useState('relevance'); // 添加排序字段状态
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filterOpen, setFilterOpen] = useState({ theme: true, source: true, year: true });
    const [sources, setSources] = useState([]); // 动态来源数据
    const [years, setYears] = useState([]); // 动态年份数据
    const [totalResults, setTotalResults] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const searchConditions = searchParams.get('searchConditions') || '';
    const startDateParam = searchParams.get('startDate') || '';
    const endDateParam = searchParams.get('endDate') || '';
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);


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
            .replace(/短语/g, t('phrase'))
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
            .replace(/\bPhrase\b/g, t('phrase'))
            .replace(/\bAll Containers\b/g, t('allContainers'))
            .replace(/\bTitle\b/g, t('title'))
            .replace(/\bSchool\b/g, t('school'))
            .replace(/\bAbstract\b/g, t('abstract'))
            .replace(/\bFull Text\b/g, t('fullText'))
            .replace(/\bKeywords\b/g, t('keywords'));

        return translated;
    };

    // 构建完整的检索内容显示
    const buildSearchText = () => {
        let text = '';
        
        // 获取URL参数
        const urlParams = new URLSearchParams(location.search);
        const urlSearchData = urlParams.get('searchData');
        
        if (urlSearchData) {
            // 新的参数格式：显示JSON结构
            try {
                const searchParams = JSON.parse(decodeURIComponent(urlSearchData));
                if (searchParams.conditions && searchParams.conditions.length > 0) {
                    const conditionsText = searchParams.conditions.map((condition, index) => {
                        let conditionStr = '';
                        if (index > 0 && condition.rowOperator) {
                            conditionStr += `${condition.rowOperator} `;
                        }
                        conditionStr += `${condition.field}: "${condition.keyword1}"`;
                        if (condition.keyword2) {
                            conditionStr += ` ${condition.innerOperator} "${condition.keyword2}"`;
                        }
                        return conditionStr;
                    }).join('\n');
                    text = conditionsText;
                }
                
                // 显示日期范围
                if (searchParams.startDate || searchParams.endDate) {
                    const dateRange = [];
                    if (searchParams.startDate) dateRange.push(searchParams.startDate);
                    if (searchParams.endDate) dateRange.push(searchParams.endDate);
                    if (text) {
                        text += `\n[${t('date')}: ${dateRange.join(' - ')}]`;
                    } else {
                        text = `[${t('date')}: ${dateRange.join(' - ')}]`;
                    }
                }
            } catch (e) {
                console.error('解析搜索参数失败:', e);
                text = '搜索参数解析错误';
            }
        } else {
            // 兼容旧的参数格式
            if (searchConditions && searchConditions.trim() !== '') {
                const conditions = searchConditions.split(' | ');
                const translatedConditions = conditions.map(condition => translateSearchConditions(condition));
                text = translatedConditions.join('\n');
            }

            // 添加日期范围
            if (startDateParam || endDateParam) {
                const dateRange = [];
                if (startDateParam) dateRange.push(startDateParam);
                if (endDateParam) dateRange.push(endDateParam);
                if (text) {
                    text += `\n[${t('date')}: ${dateRange.join(' - ')}]`;
                } else {
                    text = `[${t('date')}: ${dateRange.join(' - ')}]`;
                }
            }
        }

        return text;
    };

    const [searchText, setSearchText] = useState(buildSearchText());

    // 获取搜索结果并计算动态筛选选项
    useEffect(() => {
        const fetchSearchResults = async () => {
            setIsLoading(true);
            try {
                let searchParams = {};
                
                // 从 URL 参数中获取搜索数据
                const urlParams = new URLSearchParams(location.search);
                const urlSearchData = urlParams.get('searchData');
                if (urlSearchData) {
                    // 新的参数格式：解析JSON
                    try {
                        searchParams = JSON.parse(decodeURIComponent(urlSearchData));
                        // 更新分页参数
                        searchParams.currentPage = currentPage;
                        searchParams.pageSize = pageSize;
                        searchParams.sortField = sortField === 'relevance' ? '_score' : sortField;
                        searchParams.sortOrder = sortOrder;
                    } catch (e) {
                        console.error('解析搜索参数失败:', e);
                        searchParams = {
                            conditions: [],
                            currentPage,
                            pageSize,
                            sortField: sortField === 'relevance' ? '_score' : sortField,
                            sortOrder
                        };
                    }
                } else {
                    // 兼容旧的参数格式
                    searchParams = {
                        searchConditions: searchConditions,
                        startDate: startDate || startDateParam,
                        endDate: endDate || endDateParam,
                        currentPage,
                        pageSize,
                        sortField: sortField === 'relevance' ? '_score' : sortField,
                        sortOrder
                    };
                }
                
                console.log('发送的搜索参数:', searchParams);
                const response = await advancedSearch(searchParams);
                
                // 处理新的后端返回结构
                if (response.data && response.data.code === 200) {
                    const responseData = response.data.data;
                    const items = Array.isArray(responseData.items) ? responseData.items : [];
                    setSearchResults(items);
                    setTotalResults(responseData.totalCount || 0);
                    
                    // 从结果中提取来源和年份（这里先设为空，因为后端没有返回这些字段）
                    setSources([]);
                    setYears([]);
                } else {
                    // 处理错误情况
                    setSearchResults([]);
                    setTotalResults(0);
                    setSources([]);
                    setYears([]);
                }
            } catch (err) {
                console.error('高级搜索接口调用失败', err);
                setSearchResults([]); // 出错时强制设为空数组
                setSources([]);
                setYears([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSearchResults();
    }, [location.search, currentPage, pageSize, sortField, sortOrder]);

    // 监听语言和URL变化，重新构建搜索内容
    useEffect(() => {
        setSearchText(buildSearchText());
    }, [t, location.search]);

    const toggleFilter = (filterName) => {
        setFilterOpen({ ...filterOpen, [filterName]: !filterOpen[filterName] });
    };

    // 动态生成主题选项（事件名频度）
    const themes = calculateEventNameFrequency(searchResults);

    // 修改过滤逻辑，现在只用于结果展示，不进行实际筛选
    const filteredResults = searchResults; // 不进行筛选，显示所有结果

    // 添加排序逻辑
    const sortedResults = [...filteredResults].sort((a, b) => {
        if (sortField === 'relevance') {
            // 相关度排序（按ID排序，模拟相关度）
            return sortOrder === 'asc' ? a.id - b.id : b.id - a.id;
        } else if (sortField === 'date') {
            // 时间排序
            const dateA = new Date(a.time);
            const dateB = new Date(b.time);
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        }
        return 0;
    });

    const totalPages = Math.ceil(sortedResults.length / pageSize);

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

    const handleGaojiSearch = (val) => {
        if (val && val.trim() !== "") {
            navigate(`/gaojiSearchResult?q=${encodeURIComponent(val)}`);
        }
    };

    return (
        <div>
            {/* 顶部为完整高级搜索表单 */}
            <GaojiSearchComponent />
            {/* 检索内容 */}
            <div className="search-bar-container">
                <div className="search-params" style={{ whiteSpace: 'pre-line' }}>{t('searchContent')}: {searchText}</div>
            </div>
            <div className="main-content">
                {/* 左侧结果展示栏 */}
                <div className="filter-section">
                    <div className="filter-container">
                        <div className="filter-header" onClick={() => toggleFilter('theme')} style={{ display: 'flex', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>{t('eventNameFrequency')}</h3>
                            <span className="filter-icon">{filterOpen.theme ? '▼' : '▶'}</span>
                        </div>
                        {filterOpen.theme && (
                            <div className="filter-content" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {themes.map((item, idx) => (
                                    <div key={idx} className="filter-item">
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 来源和年份筛选暂时隐藏，因为后端没有返回这些数据 */}
                    {/*
                    <div className="filter-container">
                        <div className="filter-header" onClick={() => toggleFilter('source')} style={{ display: 'flex', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>{t('source')}</h3>
                            <span className="chart-icon" style={{ marginLeft: 8, cursor: 'pointer' }} title="查看柱状图" onClick={e => { e.stopPropagation(); setShowSourceChart(true); }}>📊</span>
                            <span className="filter-icon">{filterOpen.source ? '▼' : '▶'}</span>
                        </div>
                        {filterOpen.source && (
                            <div className="filter-content">
                                {sources.map((source, idx) => (
                                    <div key={idx} className="filter-item">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={selectedSources.includes(source)}
                                                onChange={() => {
                                                    if (selectedSources.includes(source)) {
                                                        setSelectedSources(selectedSources.filter(s => s !== source));
                                                    } else {
                                                        setSelectedSources([...selectedSources, source]);
                                                    }
                                                }}
                                            />
                                            {source}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="filter-container">
                        <div className="filter-header" onClick={() => toggleFilter('year')} style={{ display: 'flex', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>{t('year')}</h3>
                            <span className="chart-icon" style={{ marginLeft: 8, cursor: 'pointer' }} title="查看柱状图" onClick={e => { e.stopPropagation(); setShowYearChart(true); }}>📊</span>
                            <span className="filter-icon">{filterOpen.year ? '▼' : '▶'}</span>
                        </div>
                        {filterOpen.year && (
                            <div className="filter-content">
                                {years.map((year, idx) => (
                                    <div key={idx} className="filter-item">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={selectedYears.includes(year)}
                                                onChange={() => {
                                                    if (selectedYears.includes(year)) {
                                                        setSelectedYears(selectedYears.filter(y => y !== year));
                                                    } else {
                                                        setSelectedYears([...selectedYears, year]);
                                                    }
                                                }}
                                            />
                                            {year}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    */}
                </div>

                {/* 右侧结果展示区域 */}
                <div className="results-section">
                    {isLoading ? (
                        <div className="loading">{t('loading')}...</div>
                    ) : (
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
                                    <select
                                        className="sort-select"
                                        value={sortField}
                                        onChange={(e) => setSortField(e.target.value)}
                                    >
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
                                        onChange={(e) => setPageSize(Number(e.target.value))}
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
                                {searchResults.map((result, index) => (
                                    <tr key={result.id}>
                                        <td>{(currentPage - 1) * pageSize + index + 1}</td>
                                        <td>
                                            <span 
                                                style={{ color: '#12cff6', cursor: 'pointer' }} 
                                                onClick={() => navigate(`/contentViewer?id=${result.id}`)}
                                            >
                                                {result.title}
                                            </span>
                                        </td>
                                        <td>{/* 时间列暂时留空 */}</td>
                                        <td>
                                            <span 
                                                title={t('read')} 
                                                style={{ cursor: 'pointer', fontSize: '20px', color: '#12cff6' }} 
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
            
            <Footer />
        </div>
    );
}

export default GaojiSearchResultPageContent;