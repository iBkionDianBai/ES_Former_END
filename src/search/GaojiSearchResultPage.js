import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import GaojiSearchComponent from "./gaojiSearch";
import "./SearchResultPage.css";
import { useNavigate, useLocation } from "react-router-dom";

const themes = ["主题（频度）", "主题（频度）", "主题（频度）", "主题（频度）", "主题（频度）"];
const sources = ["来源（该来源事件数量）", "来源（该来源事件数量）", "来源（该来源事件数量）", "来源（该来源事件数量）", "来源（该来源事件数量）"];
const years = ["年份（该年份事件数量）", "年份（该年份事件数量）", "年份（该年份事件数量）", "年份（该年份事件数量）", "年份（该年份事件数量）"];

const themeOptions = ["主题（频度）", "主题（频度）", "主题（频度）", "主题（频度）", "主题（频度）"];
const sourceOptions = ["平台名"];
const yearOptions = ["2020-01-15", "2020-02-20", "2020-03-10", "2020-04-05", "2020-05-25", "2020-06-18", "2020-07-12", "2020-08-08", "2020-09-30", "2020-10-22"];

function GaojiSearchBox({onSearch}) {
    const [input, setInput] = useState("");
    return (
        <div className="search-bar-container">
            <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="请输入高级搜索内容"
            />
            <button onClick={() => onSearch(input)}>搜索</button>
        </div>
    );
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}`;
}

function GaojiSearchResultPage() {
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState('desc');
    const [selectedIds, setSelectedIds] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filterOpen, setFilterOpen] = useState({ theme: true, source: true, year: true });
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const q = searchParams.get('q') || '';
    const q1 = searchParams.get('q1') || '';
    const q2 = searchParams.get('q2') || '';
    const startDateParam = searchParams.get('startDate') || '';
    const endDateParam = searchParams.get('endDate') || '';
    const typesParam = searchParams.get('types') || '';
    const operatorParam = searchParams.get('operator') || '并且';
    const fuzzyParam = searchParams.get('fuzzy') || '';

    // 构建检索内容描述
    let searchSummary = '';
    if (q1 && q2) {
        searchSummary = `${q1} ${operatorParam} ${q2}`;
        if (fuzzyParam) searchSummary += `，${fuzzyParam}`;
    } else if (q1) {
        searchSummary = q1;
        if (fuzzyParam) searchSummary += `，${fuzzyParam}`;
    } else if (q) {
        searchSummary = q;
        if (fuzzyParam) searchSummary += `，${fuzzyParam}`;
    }
    let dateStr = '';
    if (startDateParam || endDateParam) {
        dateStr = `，${formatDate(startDateParam)}${(startDateParam && endDateParam) ? ' 至 ' : ''}${formatDate(endDateParam)}`;
    }
    let typeStr = '';
    if (typesParam) {
        typeStr = `，类型: ${typesParam}`;
    }
    const [searchText, setSearchText] = useState(searchSummary);
    const [selectedThemes, setSelectedThemes] = useState([]);
    const [selectedSources, setSelectedSources] = useState([]);
    const [selectedYears, setSelectedYears] = useState([]);
    const [showChart, setShowChart] = useState(false);
    const [showSourceChart, setShowSourceChart] = useState(false);
    const [showYearChart, setShowYearChart] = useState(false);

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
            setSearchText(searchSummary);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchSummary]);

    const toggleFilter = (filterName) => {
        setFilterOpen({ ...filterOpen, [filterName]: !filterOpen[filterName] });
    };

    const handleGaojiSearch = (val) => {
        if (val && val.trim() !== "") {
            navigate(`/gaojiSearchResult?q=${encodeURIComponent(val)}`);
        }
    };

    const filteredResults = searchResults.filter(item => {
        const themeOk = selectedThemes.length === 0 || selectedThemes.includes("主题（频度）");
        const sourceOk = selectedSources.length === 0 || selectedSources.includes(item.source);
        const yearOk = selectedYears.length === 0 || selectedYears.includes(item.time);
        return themeOk && sourceOk && yearOk;
    });

    return (
        <div>
            <Helmet>
                <title>高级搜索结果</title>
            </Helmet>
            {/* 顶部为完整高级搜索表单 */}
            <GaojiSearchComponent />
            {/* 检索内容 */}
            <div className="search-bar-container">
                <div className="search-params">
                    检索内容: {searchText}{dateStr}{typeStr}
                </div>
            </div>
            <div className="main-content">
                {/* 左侧筛选区域，样式与SearchResultPage一致 */}
                <div className="filter-section">
                    {/* 主题筛选 */}
                    <div className="filter-container">
                        <div className="filter-header" onClick={() => toggleFilter('theme')} style={{ display: 'flex', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>主题</h3>
                            <span style={{ marginLeft: 8, cursor: 'pointer' }} title="查看柱状图" onClick={e => { e.stopPropagation(); setShowChart(true); }}>📊</span>
                        </div>
                        {filterOpen.theme && (
                            <div className="filter-content">
                                {themeOptions.map((item, idx) => (
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
                    {/* 柱状图弹窗 */}
                    {showChart && (
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowChart(false)}>
                            <div style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 400, minHeight: 300 }} onClick={e => e.stopPropagation()}>
                                <h4 style={{textAlign:'center'}}>主题频度柱状图</h4>
                                {/* 简单SVG柱状图 */}
                                <svg width="360" height="200">
                                    {themeOptions.map((item, idx) => {
                                        // 统计频度（模拟：统计filteredResults中title包含该主题的数量）
                                        const freq = filteredResults.filter(r => r.title.includes(item)).length;
                                        return (
                                            <g key={item}>
                                                <rect x={30+idx*60} y={180-freq*20} width={40} height={freq*20} fill="#1890ff" />
                                                <text x={30+idx*60+20} y={195} textAnchor="middle" fontSize="12">{item.replace(/(主题|（频度）|\(频度\))/g,"")}</text>
                                                <text x={30+idx*60+20} y={180-freq*20-5} textAnchor="middle" fontSize="12">{freq}</text>
                                            </g>
                                        );
                                    })}
                                    {/* 坐标轴 */}
                                    <line x1="20" y1="0" x2="20" y2="180" stroke="#333" />
                                    <line x1="20" y1="180" x2="350" y2="180" stroke="#333" />
                                    <text x="0" y="10" fontSize="12">频度</text>
                                    <text x="340" y="195" fontSize="12">主题</text>
                                </svg>
                                <div style={{textAlign:'center',marginTop:8}}><button onClick={()=>setShowChart(false)}>关闭</button></div>
                            </div>
                        </div>
                    )}
                    {/* 来源筛选 */}
                    <div className="filter-container">
                        <div className="filter-header" onClick={() => toggleFilter('source')} style={{ display: 'flex', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>来源</h3>
                            <span style={{ marginLeft: 8, cursor: 'pointer' }} title="查看柱状图" onClick={e => { e.stopPropagation(); setShowSourceChart(true); }}>📊</span>
                            <span className="filter-icon">{filterOpen.source ? '▼' : '▶'}</span>
                        </div>
                        {filterOpen.source && (
                            <div className="filter-content">
                                {sourceOptions.map((item, idx) => (
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
                    {showSourceChart && (
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowSourceChart(false)}>
                            <div style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 400, minHeight: 300 }} onClick={e => e.stopPropagation()}>
                                <h4 style={{textAlign:'center'}}>来源事件数量柱状图</h4>
                                <svg width="360" height="200">
                                    {sourceOptions.map((item, idx) => {
                                        const count = filteredResults.filter(r => r.source === item).length;
                                        return (
                                            <g key={item}>
                                                <rect x={30+idx*60} y={180-count*20} width={40} height={count*20} fill="#52c41a" />
                                                <text x={30+idx*60+20} y={195} textAnchor="middle" fontSize="12">{item}</text>
                                                <text x={30+idx*60+20} y={180-count*20-5} textAnchor="middle" fontSize="12">{count}</text>
                                            </g>
                                        );
                                    })}
                                    <line x1="20" y1="0" x2="20" y2="180" stroke="#333" />
                                    <line x1="20" y1="180" x2="350" y2="180" stroke="#333" />
                                    <text x="0" y="10" fontSize="12">来源</text>
                                    <text x="340" y="195" fontSize="12">事件数</text>
                                </svg>
                                <div style={{textAlign:'center',marginTop:8}}><button onClick={()=>setShowSourceChart(false)}>关闭</button></div>
                            </div>
                        </div>
                    )}
                    {/* 年份筛选 */}
                    <div className="filter-container">
                        <div className="filter-header" onClick={() => toggleFilter('year')} style={{ display: 'flex', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>年份</h3>
                            <span style={{ marginLeft: 8, cursor: 'pointer' }} title="查看柱状图" onClick={e => { e.stopPropagation(); setShowYearChart(true); }}>📊</span>
                            <span className="filter-icon">{filterOpen.year ? '▼' : '▶'}</span>
                        </div>
                        {filterOpen.year && (
                            <div className="filter-content">
                                {yearOptions.map((item, idx) => (
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
                    {showYearChart && (
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowYearChart(false)}>
                            <div style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 400, minHeight: 300 }} onClick={e => e.stopPropagation()}>
                                <h4 style={{textAlign:'center'}}>年份事件数量柱状图</h4>
                                <svg width="360" height="200">
                                    {yearOptions.map((item, idx) => {
                                        const count = filteredResults.filter(r => r.time === item).length;
                                        return (
                                            <g key={item}>
                                                <rect x={30+idx*30} y={180-count*20} width={20} height={count*20} fill="#faad14" />
                                                <text x={30+idx*30+10} y={195} textAnchor="middle" fontSize="12">{item}</text>
                                                <text x={30+idx*30+10} y={180-count*20-5} textAnchor="middle" fontSize="12">{count}</text>
                                            </g>
                                        );
                                    })}
                                    <line x1="20" y1="0" x2="20" y2="180" stroke="#333" />
                                    <line x1="20" y1="180" x2="350" y2="180" stroke="#333" />
                                    <text x="0" y="10" fontSize="12">年份</text>
                                    <text x="340" y="195" fontSize="12">事件数</text>
                                </svg>
                                <div style={{textAlign:'center',marginTop:8}}><button onClick={()=>setShowYearChart(false)}>关闭</button></div>
                            </div>
                        </div>
                    )}
                </div>
                {/* 右侧结果区域 */}
                <div className="results-section">
                    {isLoading ? (
                        <div className="loading">加载中...</div>
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
                                    <span style={{marginLeft: 8}}>全选</span>
                                    <span style={{marginLeft: 16}}>已选: {selectedIds.length}</span>
                                    <span style={{marginLeft: 24}}>事件发生时间：</span>
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
                                    <span>排序：</span>
                                    <select className="sort-select">
                                        <option value="relevance">相关度</option>
                                        <option value="date">发表时间</option>
                                    </select>
                                    <button
                                        className="sort-order-btn"
                                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                        title={sortOrder === 'asc' ? '升序' : '降序'}
                                        style={{marginLeft: '8px'}}
                                    >
                                        {sortOrder === 'asc' ? '↑' : '↓'}
                                    </button>
                                    <span style={{marginLeft: '20px'}}>显示：</span>
                                    <select className="page-size-select" value={20}>
                                        <option value="10">10条</option>
                                        <option value="20">20条</option>
                                        <option value="50">50条</option>
                                    </select>
                                </div>
                            </div>
                            <table className="results-table">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>序号</th>
                                        <th>题目</th>
                                        <th>来源</th>
                                        <th>事件发生时间</th>
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredResults.map((result, index) => (
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
                                                <span title="阅读" style={{cursor: 'pointer', fontSize: '20px', color: '#1890ff'}} onClick={() => navigate(`/contentViewer?id=${result.id}`)}>
                                                    📖
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="pagination">
                                <button>上一页</button>
                                <button className="active">1</button>
                                <button>2</button>
                                <button>3</button>
                                <button>4</button>
                                <button>5</button>
                                <button>...</button>
                                <button>10</button>
                                <button>下一页</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default GaojiSearchResultPage; 