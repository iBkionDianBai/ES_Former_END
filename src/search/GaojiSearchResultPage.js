import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import GaojiSearchComponent from "./gaojiSearch";
import "../SearchResultPage.css";
import { useNavigate, useLocation } from "react-router-dom";

const themes = ["主题（频度）", "主题（频度）", "主题（频度）", "主题（频度）", "主题（频度）"];
const sources = ["来源（该来源事件数量）", "来源（该来源事件数量）", "来源（该来源事件数量）", "来源（该来源事件数量）", "来源（该来源事件数量）"];
const years = ["年份（该年份事件数量）", "年份（该年份事件数量）", "年份（该年份事件数量）", "年份（该年份事件数量）", "年份（该年份事件数量）"];

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
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const q = searchParams.get('q') || '';
    const [searchText, setSearchText] = useState(q);

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
            setSearchText(q);
        }, 500);
        return () => clearTimeout(timer);
    }, [q]);

    const toggleFilter = (filterName) => {
        setFilterOpen({ ...filterOpen, [filterName]: !filterOpen[filterName] });
    };

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
                <div className="search-params">检索内容: {searchText}</div>
            </div>
            <div className="main-content">
                {/* 左侧筛选区域，样式与SearchResultPage一致 */}
                <div className="filter-section">
                    {/* 主题筛选 */}
                    <div className="filter-container">
                        <div className="filter-header" onClick={() => toggleFilter('theme')} style={{ cursor: 'pointer' }}>
                            <h3>主题</h3>
                            <span className="filter-icon">{filterOpen.theme ? '▼' : '▶'}</span>
                        </div>
                        {filterOpen.theme && (
                            <div className="filter-content">
                                {themes.map((item, idx) => (
                                    <div className="filter-item" key={idx}>
                                        <input type="checkbox" /> {item}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* 来源筛选 */}
                    <div className="filter-container">
                        <div className="filter-header" onClick={() => toggleFilter('source')} style={{ cursor: 'pointer' }}>
                            <h3>来源</h3>
                            <span className="filter-icon">{filterOpen.source ? '▼' : '▶'}</span>
                        </div>
                        {filterOpen.source && (
                            <div className="filter-content">
                                {sources.map((item, idx) => (
                                    <div className="filter-item" key={idx}>
                                        <input type="checkbox" /> {item}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* 年份筛选 */}
                    <div className="filter-container">
                        <div className="filter-header" onClick={() => toggleFilter('year')} style={{ cursor: 'pointer' }}>
                            <h3>年份</h3>
                            <span className="filter-icon">{filterOpen.year ? '▼' : '▶'}</span>
                        </div>
                        {filterOpen.year && (
                            <div className="filter-content">
                                {years.map((item, idx) => (
                                    <div className="filter-item" key={idx}>
                                        <input type="checkbox" /> {item}
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
                                            <td>{result.title}</td>
                                            <td>{result.source}</td>
                                            <td>{result.time}</td>
                                            <td></td>
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