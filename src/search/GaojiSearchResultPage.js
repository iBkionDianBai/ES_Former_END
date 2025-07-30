import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import GaojiSearchComponent from "./gaojiSearch";
import "./SearchResultPage.css";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../page/header";
import Footer from "../page/Footer";
import { useTranslation } from 'react-i18next';

// 计算事件名频度的函数
const calculateEventNameFrequency = (results) => {
    const eventNameCount = {};

    results.forEach(item => {
        // 提取事件名（取标题的第一部分作为事件名）
        const eventName = item.title.split(' ')[0];
        eventNameCount[eventName] = (eventNameCount[eventName] || 0) + 1;
    });

    // 转换为数组并按频度排序，取前5个
    const sortedEvents = Object.entries(eventNameCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => `${name}（${count}）`);

    return sortedEvents;
};
const sources = ["平台名"];
const years = ["2020-01-15", "2020-02-20", "2020-03-10", "2020-04-05", "2020-05-25", "2020-06-18", "2020-07-12", "2020-08-08", "2020-09-30", "2020-10-22"];


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
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const searchConditions = searchParams.get('searchConditions') || '';
    const startDateParam = searchParams.get('startDate') || '';
    const endDateParam = searchParams.get('endDate') || '';
    const types = searchParams.get('types') || '';
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [useLoadMore, setUseLoadMore] = useState(false);


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

    useEffect(() => {
        setIsLoading(true);
        // 模拟API请求延迟
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
            setSearchText(buildSearchText());
        }, 500);
        return () => clearTimeout(timer);
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

    // 添加过滤逻辑
    const filteredResults = searchResults.filter(item => {
        const eventName = item.title.split(' ')[0];
        const themeOk = selectedThemes.length === 0 || selectedThemes.some(theme => {
            const themeName = theme.split('（')[0];
            return eventName === themeName;
        });
        const sourceOk = selectedSources.length === 0 || selectedSources.includes(item.source);
        const yearOk = selectedYears.length === 0 || selectedYears.includes(item.time);
        return themeOk && sourceOk && yearOk;
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
                    {/* 主题筛选 */}
                    <div className="filter-container">
                        <div className="filter-header" onClick={() => toggleFilter('theme')} style={{ display: 'flex', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>{t('eventNameFrequency')}</h3>
                            <span className="chart-icon" style={{ marginLeft: 8, cursor: 'pointer' }} title="查看柱状图" onClick={e => { e.stopPropagation(); setShowChart(true); }}>📊</span>
                            <span className="filter-icon">{filterOpen.theme ? '▼' : '▶'}</span>
                        </div>
                        {filterOpen.theme && (
                            <div className="filter-content" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {themes.map((item, idx) => (
                                    <div className="filter-item" key={idx}>
                                        <input type="checkbox" checked={selectedThemes.includes(item)} onChange={e => {
                                            if (e.target.checked) setSelectedThemes([...selectedThemes, item]);
                                            else setSelectedThemes(selectedThemes.filter(t => t !== item));
                                        }} /> {item}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* 来源筛选 */}
                    <div className="filter-container">
                        <div className="filter-header" onClick={() => toggleFilter('source')} style={{ display: 'flex', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>{t('source')}</h3>
                            <span className="chart-icon" style={{ marginLeft: 8, cursor: 'pointer' }} title="查看柱状图" onClick={e => { e.stopPropagation(); setShowSourceChart(true); }}>📊</span>
                            <span className="filter-icon">{filterOpen.source ? '▼' : '▶'}</span>
                        </div>
                        {filterOpen.source && (
                            <div className="filter-content" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {sources.map((item, idx) => (
                                    <div className="filter-item" key={idx}>
                                        <input type="checkbox" checked={selectedSources.includes(item)} onChange={e => {
                                            if (e.target.checked) setSelectedSources([...selectedSources, item]);
                                            else setSelectedSources(selectedSources.filter(s => s !== item));
                                        }} /> {item}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* 年份筛选 */}
                    <div className="filter-container">
                        <div className="filter-header" onClick={() => toggleFilter('year')} style={{ display: 'flex', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>{t('year')}</h3>
                            <span className="chart-icon" style={{ marginLeft: 8, cursor: 'pointer' }} title="查看柱状图" onClick={e => { e.stopPropagation(); setShowYearChart(true); }}>📊</span>
                            <span className="filter-icon">{filterOpen.year ? '▼' : '▶'}</span>
                        </div>
                        {filterOpen.year && (
                            <div className="filter-content" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {years.map((item, idx) => (
                                    <div className="filter-item" key={idx}>
                                        <input type="checkbox" checked={selectedYears.includes(item)} onChange={e => {
                                            if (e.target.checked) setSelectedYears([...selectedYears, item]);
                                            else setSelectedYears(selectedYears.filter(y => y !== item));
                                        }} /> {item}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                {/* 右侧结果区域 */}
                <div className="results-section">
                    {isLoading ? (
                        <div className="loading">{t('loading')}...</div>
                    ) : (
                        <div>
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
                                </div>
                                <div className="results-toolbar">
                                    <span>{t('sort')}: </span>
                                    <select className="sort-select" value={sortField} onChange={e => setSortField(e.target.value)}>
                                        <option value="relevance">{t('relevance')}</option>
                                        <option value="date">{t('publishTime')}</option>
                                    </select>
                                    <button
                                        className="sort-order-btn"
                                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                        title={sortOrder === 'asc' ? t('ascending') : t('descending')}
                                        style={{marginLeft: '8px'}}
                                    >
                                        {sortOrder === 'asc' ? '↑' : '↓'}
                                    </button>
                                    <span style={{marginLeft: '20px'}}>{t('display')}: </span>
                                    <select
                                        className="page-size-select"
                                        value={pageSize}
                                        onChange={e => {
                                            setPageSize(Number(e.target.value));
                                            setCurrentPage(1); // 重置为第一页
                                        }}
                                    >
                                        <option value="10">{t('items10')}</option>
                                        <option value="20">{t('items20')}</option>
                                        <option value="50">{t('items50')}</option>
                                    </select>
                                </div>
                            </div>
                            <table className="results-table">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>{t('serialNumber')}</th>
                                        <th>{t('title')}</th>
                                        <th>{t('source')}</th>
                                        <th>{t('eventTime')}</th>
                                        <th>{t('operation')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedResults.map((result, index) => (
                                        <tr key={result.id}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(result.id)}
                                                    onChange={e => {
                                                        if (e.target.checked) {
                                                            setSelectedIds([...selectedIds, result.id]);
                                                        } else {
                                                            setSelectedIds(selectedIds.filter(id => id !== result.id));
                                                        }
                                                    }}
                                                />
                                            </td>
                                            <td>{index + 1}</td>
                                            <td>
                                                <span style={{color: '#1890ff', cursor: 'pointer', display: 'inline-block'}} onClick={() => navigate(`/contentViewer?id=${result.id}`)}>
                                                    {result.title.split(' ')[0]}<br/>{result.title.split(' ').slice(1).join(' ')}
                                                </span>
                                            </td>
                                            <td>{result.source}</td>
                                            <td>{result.time}</td>
                                            <td>
                                                <span title={t('read')} style={{cursor: 'pointer', fontSize: '20px', color: '#1890ff'}} onClick={() => navigate(`/contentViewer?id=${result.id}`)}>
                                                    📖
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {/* 分页区 */}
                            <div className="pagination">
                                <div style={{ marginTop: 5 }}>
                                    <label><input type="checkbox" checked={useLoadMore} onChange={e => { setUseLoadMore(e.target.checked); setCurrentPage(1); }} /> {t('useLoadMore')}</label>
                                </div>
                                {useLoadMore ? (
                                    <div style={{ textAlign: 'center', marginTop: 5 }}>
                                        {currentPage * pageSize < sortedResults.length ? (
                                            <button onClick={() => setCurrentPage(currentPage + 1)}>{t('loadMore')}</button>
                                        ) : (<span style={{marginLeft: 5}}>{t('loadedAll')}</span>)}
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                                        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>{t('previousPage')}</button>
                                        {generatePagination().map((p, i) => p === '...' ? <span key={i}>...</span> : <button key={p} className={currentPage === p ? 'active' : ''} onClick={() => setCurrentPage(p)}>{p}</button>)}
                                        <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>{t('nextPage')}</button>
                                        <span style={{ marginLeft: 12 }}>{t('jumpTo')}：<input type="number" min={1} max={totalPages} value={currentPage} onChange={(e) => setCurrentPage(Math.min(totalPages, Math.max(1, Number(e.target.value))))} style={{ width: 50, marginLeft: 4 }} /> / {totalPages}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 柱状图弹窗 */}
            {showChart && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowChart(false)}>
                    <div style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 400, minHeight: 300 }} onClick={e => e.stopPropagation()}>
                        <h4 style={{textAlign:'center'}}>{t('eventNameFrequencyChart')} {selectedThemes.length > 0 ? `(${t('selectedEvents')}${selectedThemes.length}${t('events')})` : ''}</h4>
                        {/* 简单SVG柱状图 */}
                        <svg width="700" height="220">
                            {(selectedThemes.length > 0 ? selectedThemes : themes).map((item, idx) => {
                                // 提取事件名和频度
                                const eventName = item.split('（')[0];
                                const freq = parseInt(item.match(/（(\d+)）/)[1]);
                                const barWidth = 40;
                                const barSpacing = 60;
                                const startX = 80;
                                const x = startX + idx * (barWidth + barSpacing);
                                return (
                                    <g key={item}>
                                        <rect x={x} y={180-freq*20} width={barWidth} height={freq*20} fill="#1890ff" />
                                        <text x={x + barWidth/2} y={205} textAnchor="middle" fontSize="12">{eventName}</text>
                                        <text x={x + barWidth/2} y={180-freq*20-5} textAnchor="middle" fontSize="12">{freq}</text>
                                    </g>
                                );
                            })}
                            {/* 坐标轴 */}
                            <line x1="30" y1="0" x2="30" y2="180" stroke="#333" />
                            <line x1="30" y1="180" x2="690" y2="180" stroke="#333" />
                            <text x="0" y="10" fontSize="12">{t('frequency')}</text>
                            <text x="620" y="210" fontSize="12">{t('eventName')}</text>
                        </svg>
                        <div style={{textAlign:'center',marginTop:8}}><button className="chart-close" onClick={()=>setShowChart(false)}>{t('close')}</button></div>
                    </div>
                </div>
            )}

            {showSourceChart && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowSourceChart(false)}>
                    <div style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 400, minHeight: 300 }} onClick={e => e.stopPropagation()}>
                        <h4 style={{textAlign:'center'}}>{t('sourceEventCountChart')}</h4>
                        <svg width="700" height="220">
                            {sources.map((item, idx) => {
                                const count = filteredResults.filter(r => r.source === item).length;
                                const barWidth = 40;
                                const barSpacing = 60;
                                const startX = 80;
                                const x = startX + idx * (barWidth + barSpacing);
                                return (
                                    <g key={item}>
                                        <rect x={x} y={180-count*20} width={barWidth} height={count*20} fill="#52c41a" />
                                        <text x={x + barWidth/2} y={205} textAnchor="middle" fontSize="12">{item}</text>
                                        <text x={x + barWidth/2} y={180-count*20-5} textAnchor="middle" fontSize="12">{count}</text>
                                    </g>
                                );
                            })}
                            <line x1="40" y1="0" x2="40" y2="180" stroke="#333" />
                            <line x1="40" y1="180" x2="690" y2="180" stroke="#333" />
                            <text x="0" y="10" fontSize="12">{t('eventCount')}</text>
                            <text x="620" y="210" fontSize="12">{t('source')}</text>
                        </svg>
                        <div style={{textAlign:'center',marginTop:8}}><button className="chart-close" onClick={()=>setShowSourceChart(false)}>{t('close')}</button></div>
                    </div>
                </div>
            )}

            {showYearChart && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowYearChart(false)}>
                    <div style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 740, minHeight: 300 }} onClick={e => e.stopPropagation()}>
                        <h4 style={{textAlign:'center'}}>{t('yearEventCountChart')}</h4>
                        <svg width="700" height="220">
                            {years.map((item, idx) => {
                                const count = filteredResults.filter(r => r.time === item).length;
                                const barWidth = 40;
                                const barSpacing = 16;
                                const startX = 50;
                                const x = startX + idx * (barWidth + barSpacing);
                                return (
                                    <g key={item}>
                                        <rect x={x} y={180-count*20} width={barWidth} height={count*20} fill="#faad14" />
                                        <text x={x + barWidth/2} y={205} textAnchor="middle" fontSize="9">{item.split('-')[0]}</text>
                                        <text x={x + barWidth/2} y={215} textAnchor="middle" fontSize="9">{item.split('-')[1] + '-' + item.split('-')[2]}</text>
                                        <text x={x + barWidth/2} y={180-count*20-5} textAnchor="middle" fontSize="12">{count}</text>
                                    </g>
                                );
                            })}
                            <line x1="40" y1="0" x2="40" y2="180" stroke="#333" />
                            <line x1="40" y1="180" x2="690" y2="180" stroke="#333" />
                            <text x="0" y="10" fontSize="12">{t('eventCount')}</text>
                            <text x="620" y="210" fontSize="12">{t('year')}</text>
                        </svg>
                        <div style={{textAlign:'center',marginTop:8}}><button className="chart-close" onClick={()=>setShowYearChart(false)}>{t('close')}</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}

function GaojiSearchResultPage() {
    return (
        <div>
            <>
                <Helmet>
                    <title>高级搜索结果</title>
                </Helmet>
                <GaojiSearchResultPageContent />
                <Footer />
            </>
        </div>
    );
}

export default GaojiSearchResultPage;