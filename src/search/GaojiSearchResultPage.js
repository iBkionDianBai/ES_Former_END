import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
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
    const [selectedIds, setSelectedIds] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filterOpen, setFilterOpen] = useState({ theme: true, source: true, year: true });
    const [showChart, setShowChart] = useState(false);
    const [showSourceChart, setShowSourceChart] = useState(false);
    const [showYearChart, setShowYearChart] = useState(false);
    const [selectedThemes, setSelectedThemes] = useState([]);
    const [selectedSources, setSelectedSources] = useState([]);
    const [selectedYears, setSelectedYears] = useState([]);
    const [sources, setSources] = useState([]); // 动态来源数据
    const [years, setYears] = useState([]); // 动态年份数据
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const searchConditions = searchParams.get('searchConditions') || '';
    const startDateParam = searchParams.get('startDate') || '';
    const endDateParam = searchParams.get('endDate') || '';
    const types = searchParams.get('types') || '';
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

        // 处理搜索条件
        if (searchConditions && searchConditions.trim() !== '') {
            const conditions = searchConditions.split(' | ');
            // 翻译每个搜索条件
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

        // 添加类型
        if (types && types.trim() !== '') {
            if (text) {
                text += `\n[${t('type')}: ${types}]`;
            } else {
                text = `[${t('type')}: ${types}]`;
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
                const searchParams = {
                    searchConditions: searchConditions,
                    startDate: startDateParam,
                    endDate: endDateParam,
                    types: types
                };
                const response = await advancedSearch(searchParams);
                // 关键：无论接口返回什么，都转为数组（非数组则设为空数组）
                const data = Array.isArray(response.data) ? response.data : [];
                setSearchResults(data); // 确保存入状态的是数组

                // 从结果中提取来源和年份
                setSources(extractUniqueSources(data));
                setYears(extractUniqueYears(data));
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
    }, [searchConditions, startDateParam, endDateParam, types]);

    // 监听语言变化，重新构建搜索内容
    useEffect(() => {
        setSearchText(buildSearchText());
    }, [t]);

    const toggleFilter = (filterName) => {
        setFilterOpen({ ...filterOpen, [filterName]: !filterOpen[filterName] });
    };

    // 动态生成主题选项（事件名频度）
    const themes = calculateEventNameFrequency(searchResults);

    // 修改过滤逻辑，添加日期范围筛选
    const filteredResults = searchResults.filter(item => {
        const eventName = item.title?.split(' ')[0];
        const themeOk = selectedThemes.length === 0 || selectedThemes.some(theme => {
            const themeName = theme.split('（')[0];
            return eventName === themeName;
        });
        const sourceOk = selectedSources.length === 0 || selectedSources.includes(item.source);
        const yearOk = selectedYears.length === 0 || selectedYears.includes(item.time);

        // 新增：日期范围筛选逻辑
        const itemDate = new Date(item.time);
        const startOk = startDate ? itemDate >= new Date(startDate) : true;
        const endOk = endDate ? itemDate <= new Date(endDate) : true;
        const dateRangeOk = startOk && endOk;

        return themeOk && sourceOk && yearOk && dateRangeOk; // 加入日期筛选条件
    });

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
                {/* 左侧筛选区域，样式与SearchResultPage一致 */}
                <div className="filter-section">
                    <div className="filter-container">
                        <div className="filter-header" onClick={() => toggleFilter('theme')} style={{ display: 'flex', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>{t('eventNameFrequency')}</h3>
                            <span className="chart-icon" style={{ marginLeft: 8, cursor: 'pointer' }} title="查看柱状图" onClick={e => { e.stopPropagation(); setShowChart(true); }}>📊</span>
                            <span className="filter-icon">{filterOpen.theme ? '▼' : '▶'}</span>
                        </div>
                        {filterOpen.theme && (
                            <div className="filter-content" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {themes.map((item, idx) => (
                                    <div key={idx} className="filter-item">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={selectedThemes.includes(item)}
                                                onChange={() => {
                                                    if (selectedThemes.includes(item)) {
                                                        setSelectedThemes(selectedThemes.filter(t => t !== item));
                                                    } else {
                                                        setSelectedThemes([...selectedThemes, item]);
                                                    }
                                                }}
                                            />
                                            {item}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

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
                </div>

                {/* 右侧结果展示区域 */}
                <div className="results-section">
                    {isLoading ? (
                        <div className="loading">{t('loading')}...</div>
                    ) : (
                        <>
                            <div className="toolbar-row">
                                <div className="filter-toolbar">
                                    <input
                                        type="checkbox"
                                        checked={searchResults.length > 0 && selectedIds.length === searchResults.length}
                                        onChange={e => {
                                            if (e.target.checked) {
                                                setSelectedIds(searchResults.map(item => item.id));
                                            } else {
                                                setSelectedIds([]);
                                            }
                                        }}
                                    />
                                    <span style={{marginLeft: 8}}>{t('selectAll')}</span>
                                    <span style={{marginLeft: 16}}>{t('selectedCount')}: {selectedIds.length}</span>
                                    <span style={{marginLeft: 24}}>{t('eventTime')}: </span>
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
                                    <th>{t('select')}</th>
                                    <th>{t('title')}</th>
                                    <th>{t('source')}</th>
                                    <th>{t('date')}</th>
                                </tr>
                                </thead>
                                <tbody>
                                {sortedResults.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(item.id)}
                                                onChange={() => {
                                                    if (selectedIds.includes(item.id)) {
                                                        setSelectedIds(selectedIds.filter(id => id !== item.id));
                                                    } else {
                                                        setSelectedIds([...selectedIds, item.id]);
                                                    }
                                                }}
                                            />
                                        </td>
                                        <td>{item.title}</td>
                                        <td>{item.source}</td>
                                        <td>{item.time}</td>
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