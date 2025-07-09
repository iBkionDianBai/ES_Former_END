import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import GaojiSearchComponent from "./gaojiSearch";
import "./SearchResultPage.css";
import { useNavigate, useLocation } from "react-router-dom";

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

function GaojiSearchResultPage() {
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState('desc');
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
    
    // 构建完整的检索内容显示
    const buildSearchText = () => {
        let text = '';
        
        // 处理搜索条件
        if (searchConditions) {
            const conditions = searchConditions.split(' | ');
            text = conditions.join('\n');
        }
        
        // 添加日期范围
        if (startDateParam || endDateParam) {
            const dateRange = [];
            if (startDateParam) dateRange.push(startDateParam);
            if (endDateParam) dateRange.push(endDateParam);
            if (text) {
                text += `\n[日期: ${dateRange.join(' - ')}]`;
            } else {
                text = `[日期: ${dateRange.join(' - ')}]`;
            }
        }
        
        // 添加类型
        if (types) {
            if (text) {
                text += `\n[类型: ${types}]`;
            } else {
                text = `[类型: ${types}]`;
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

    const toggleFilter = (filterName) => {
        setFilterOpen({ ...filterOpen, [filterName]: !filterOpen[filterName] });
    };

    // 动态生成主题选项（事件名频度）
    const themes = calculateEventNameFrequency(searchResults);

    const handleGaojiSearch = (val) => {
        if (val && val.trim() !== "") {
            navigate(`/gaojiSearchResult?q=${encodeURIComponent(val)}`);
        }
    };

    return (
        <div>
            <Helmet>
                <title>高级搜索结果</title>
            </Helmet>
            {/* 顶部为完整高级搜索表单 */}
            <GaojiSearchComponent />
            {/* 检索内容 */}
            <div className="search-bar-container">
                <div className="search-params" style={{ whiteSpace: 'pre-line' }}>检索内容: {searchText}</div>
            </div>
            <div className="main-content">
                {/* 左侧筛选区域，样式与SearchResultPage一致 */}
                <div className="filter-section">
                    {/* 主题筛选 */}
                    <div className="filter-container">
                        <div className="filter-header" onClick={() => toggleFilter('theme')} style={{ display: 'flex', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>事件名(频度)</h3>
                            <span style={{ marginLeft: 8, cursor: 'pointer' }} title="查看柱状图" onClick={e => { e.stopPropagation(); setShowChart(true); }}>📊</span>
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
                            <h3 style={{ margin: 0 }}>来源</h3>
                            <span style={{ marginLeft: 8, cursor: 'pointer' }} title="查看柱状图" onClick={e => { e.stopPropagation(); setShowSourceChart(true); }}>📊</span>
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
                            <h3 style={{ margin: 0 }}>年份</h3>
                            <span style={{ marginLeft: 8, cursor: 'pointer' }} title="查看柱状图" onClick={e => { e.stopPropagation(); setShowYearChart(true); }}>📊</span>
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
                                    {searchResults.map((result, index) => (
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

            {/* 柱状图弹窗 */}
            {showChart && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowChart(false)}>
                    <div style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 400, minHeight: 300 }} onClick={e => e.stopPropagation()}>
                        <h4 style={{textAlign:'center'}}>事件名频度柱状图 {selectedThemes.length > 0 ? `(已选择${selectedThemes.length}个事件)` : ''}</h4>
                        {/* 简单SVG柱状图 */}
                        <svg width="360" height="200">
                            {(selectedThemes.length > 0 ? selectedThemes : themes).map((item, idx) => {
                                // 提取事件名和频度
                                const eventName = item.split('（')[0];
                                const freq = parseInt(item.match(/（(\d+)）/)[1]);
                                return (
                                    <g key={item}>
                                        <rect x={30+idx*60} y={180-freq*20} width={40} height={freq*20} fill="#1890ff" />
                                        <text x={30+idx*60+20} y={195} textAnchor="middle" fontSize="12">{eventName}</text>
                                        <text x={30+idx*60+20} y={180-freq*20-5} textAnchor="middle" fontSize="12">{freq}</text>
                                    </g>
                                );
                            })}
                            {/* 坐标轴 */}
                            <line x1="20" y1="0" x2="20" y2="180" stroke="#333" />
                            <line x1="20" y1="180" x2="350" y2="180" stroke="#333" />
                            <text x="0" y="10" fontSize="12">频度</text>
                            <text x="340" y="195" fontSize="12">事件名</text>
                        </svg>
                        <div style={{textAlign:'center',marginTop:8}}><button onClick={()=>setShowChart(false)}>关闭</button></div>
                    </div>
                </div>
            )}

            {showSourceChart && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowSourceChart(false)}>
                    <div style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 400, minHeight: 300 }} onClick={e => e.stopPropagation()}>
                        <h4 style={{textAlign:'center'}}>来源事件数量柱状图</h4>
                        <svg width="360" height="200">
                            {sources.map((item, idx) => {
                                const count = searchResults.filter(r => r.source === item).length;
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

            {showYearChart && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowYearChart(false)}>
                    <div style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 740, minHeight: 300 }} onClick={e => e.stopPropagation()}>
                        <h4 style={{textAlign:'center'}}>年份事件数量柱状图</h4>
                        <svg width="700" height="220">
                            {years.map((item, idx) => {
                                const count = searchResults.filter(r => r.time === item).length;
                                const barWidth = 40;
                                const barSpacing = 16;
                                const startX = 40;
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
                            <line x1="30" y1="0" x2="30" y2="180" stroke="#333" />
                            <line x1="30" y1="180" x2="690" y2="180" stroke="#333" />
                            <text x="0" y="10" fontSize="12">年份</text>
                            <text x="620" y="210" fontSize="12">事件数</text>
                        </svg>
                        <div style={{textAlign:'center',marginTop:8}}><button onClick={()=>setShowYearChart(false)}>关闭</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GaojiSearchResultPage; 