import React, {useEffect, useState} from 'react'
import {Helmet} from 'react-helmet';
import './gaojiSearch.css'
import axios from "axios";
import {useLocation, useNavigate} from "react-router-dom";
import Header from "../page/header";

// 定义搜索条件操作符
const operators = ['并且', '或者', '不包含'];
// 定义行关系操作符
const rowRelations = ['并且', '或者'];
// 定义搜索范围容器
const containers = ['全部容器', '标题', '作者', '摘要'];
// 定义模糊搜索选项
const fuzzyOptions = ['模糊', '精确'];


function GaojiSearchComponent() {
    const navigate = useNavigate();
    const location = useLocation();
    // 新增：从URL参数q获取初始值
    const searchParams = new URLSearchParams(location.search);
    const q = searchParams.get('q') || '';
    // 存储搜索行的状态，每行包含多个搜索条件
    const [searchRows, setSearchRows] = useState([{ keyword1: q, container: '全部容器', operator: '并且', keyword2: '', fuzzy: '模糊' }]);
    // 存储搜索开始日期
    const [startDate, setStartDate] = useState('');
    // 存储搜索结束日期
    const [endDate, setEndDate] = useState('');
    // 存储用户选择的搜索类型
    const [searchTypes, setSearchTypes] = useState([]);
    // 定义可选择的搜索类型
    const availableTypes = ['类型1', '类型2', '类型3'];

    // 处理添加新搜索行的函数
    const handleAddRow = () => {
        setSearchRows([...searchRows, {
            relation: '并且',
            keyword1: '',
            container: '全部容器',
            operator: '并且',
            keyword2: '',
            fuzzy: '模糊'
        }]);
    };

    // 处理删除指定索引搜索行的函数
    const handleRemoveRow = (index) => {
        if (searchRows.length > 1) {
            const newRows = [...searchRows];
            newRows.splice(index, 1);
            setSearchRows(newRows);
        }
    };

    // 处理行关系下拉框变化的函数
    const handleRelationChange = (index, e) => {
        const newRows = [...searchRows];
        newRows[index].relation = e.target.value;
        setSearchRows(newRows);
    };

    // 处理第一个关键词输入框变化的函数
    const handleKeyword1Change = (index, e) => {
        const newRows = [...searchRows];
        newRows[index].keyword1 = e.target.value;
        setSearchRows(newRows);
    };

    // 处理操作符下拉框变化的函数
    const handleOperatorChange = (index, e) => {
        const newRows = [...searchRows];
        newRows[index].operator = e.target.value;
        setSearchRows(newRows);
    };

    // 处理搜索容器下拉框变化的函数
    const handleContainerChange = (index, e) => {
        const newRows = [...searchRows];
        newRows[index].container = e.target.value;
        setSearchRows(newRows);
    };

    // 处理第二个关键词输入框变化的函数
    const handleKeyword2Change = (index, e) => {
        const newRows = [...searchRows];
        newRows[index].keyword2 = e.target.value;
        setSearchRows(newRows);
    };

    // 处理模糊搜索下拉框变化的函数
    const handleFuzzyChange = (index, e) => {
        const newRows = [...searchRows];
        newRows[index].fuzzy = e.target.value;
        setSearchRows(newRows);
    };

    // 处理开始日期输入框变化的函数
    const handleStartDateChange = (e) => {
        setStartDate(e.target.value);
    };

    // 处理结束日期输入框变化的函数
    const handleEndDateChange = (e) => {
        setEndDate(e.target.value);
    };

    // 处理搜索类型复选框变化的函数
    const handleTypeChange = (type) => {
        if (searchTypes.includes(type)) {
            setSearchTypes(searchTypes.filter((t) => t!== type));
        } else {
            setSearchTypes([...searchTypes, type]);
        }
    };

    // 处理搜索按钮点击事件的函数
    const handleSearch = () => {
        // 构建多行搜索条件
        const searchConditions = [];
        searchRows.forEach((row, index) => {
            const k1 = row.keyword1?.trim();
            const k2 = row.keyword2?.trim();
            const operator = row.operator || '';
            const fuzzy = row.fuzzy || '';
            const relation = row.relation || '';
            const container = row.container || '';
            
            if (k1 || k2) {
                let condition = '';
                if (k1 && k2) {
                    condition = `${k1} ${operator} ${k2}`;
                } else if (k1) {
                    condition = k1;
                }
                
                if (container && container !== '全部容器') {
                    condition = `[${container}] ${condition}`;
                }
                
                if (fuzzy) {
                    condition += ` (${fuzzy})`;
                }
                
                if (index > 0 && relation) {
                    condition = `${relation} ${condition}`;
                }
                
                searchConditions.push(condition);
            }
        });
        
        // 构建URL参数
        const params = new URLSearchParams();
        
        // 添加搜索条件
        if (searchConditions.length > 0) {
            params.set('searchConditions', searchConditions.join(' | '));
        }
        
        // 添加日期参数
        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);
        
        // 添加类型参数
        if (searchTypes.length > 0) {
            params.set('types', searchTypes.join('/'));
        }
        
        const url = `/gaojiSearchResult?${params.toString()}`;
        navigate(url);
    };

    // 处理清除按钮点击事件的函数
    const handleClear = () => {
        setSearchRows([{ keyword1: '', container: '全部容器', operator: '并且', keyword2: '', fuzzy: '模糊' }]);
        setStartDate('');
        setEndDate('');
        setSearchTypes([]);
    };

    return (
        <div className="search-page">
            <h2>高级检索</h2>
            <div className="main-content">
                <div className="search-content">
                    <div className="search-rows">
                        {searchRows.map((row, index) => (
                            <div className="search-row" key={index}>
                                {/* 只在非第一行显示关系下拉框，第一行显示空占位元素 */}
                                {index > 0 ? (
                                    <div className="search-item relation-select">
                                        <select
                                            value={row.relation}
                                            onChange={(e) => handleRelationChange(index, e)}
                                            className="select-box"
                                        >
                                            {rowRelations.map((relation) => (
                                                <option key={relation} value={relation}>{relation}</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="search-item relation-select" />
                                )}
                                <div className="search-item container-select">
                                    <select
                                        value={row.container}
                                        onChange={(e) => handleContainerChange(index, e)}
                                        className="select-box"
                                    >
                                        {containers.map((container) => (
                                            <option key={container} value={container}>{container}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="search-item keyword-input">
                                    <input
                                        type="text"
                                        value={row.keyword1}
                                        onChange={(e) => handleKeyword1Change(index, e)}
                                        className="input-box"
                                    />
                                </div>
                                <div className="search-item operator-select">
                                    <select
                                        value={row.operator}
                                        onChange={(e) => handleOperatorChange(index, e)}
                                        className="select-box"
                                    >
                                        {operators.map((operator) => (
                                            <option key={operator} value={operator}>{operator}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="search-item keyword-input">
                                    <input
                                        type="text"
                                        value={row.keyword2}
                                        onChange={(e) => handleKeyword2Change(index, e)}
                                        className="input-box"
                                    />
                                </div>
                                <div className="search-item fuzzy-select">
                                    <select
                                        value={row.fuzzy}
                                        onChange={(e) => handleFuzzyChange(index, e)}
                                        className="select-box"
                                    >
                                        {fuzzyOptions.map((option) => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="search-item">
                                    <button onClick={() => handleAddRow()} className="action-button">+</button>
                                    {/* 只在非第一行显示删除按钮 */}
                                    {index > 0 && (
                                        <button onClick={() => handleRemoveRow(index)} className="action-button">-</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="date-section">
                        <label>日期:</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={handleStartDateChange}
                            className="input-box"
                        />
                        <span>至:</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={handleEndDateChange}
                            className="input-box"
                        />
                    </div>
                    <div className="type-section">
                        <label>类型:</label>
                        <div className="type-options">
                            {availableTypes.map((type) => (
                                <div className="type-item" key={type}>
                                    <input
                                        type="checkbox"
                                        checked={searchTypes.includes(type)}
                                        onChange={() => handleTypeChange(type)}
                                    />
                                    {type}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="button-section">
                        <button onClick={handleClear} className="action-button">清除所有检索选项</button>
                        <button onClick={handleSearch} className="action-button">检索</button>
                    </div>
                </div>
                <div className="search-instruction">
                    <h3>检索说明区</h3>
                    <p>这里可以添加检索的相关说明信息。</p>
                </div>
            </div>
        </div>
    );
}

function GaojiSearch() {
    const location = useLocation();
    const username = location.state?.username;
    const navigate = useNavigate();
    return (
        <div>
            <Helmet>
                <title>ElasticDataSearch</title>
            </Helmet>
            {/* 顶部区域 */}
            <Header />
            {/* 插入搜索组件 */}
            <GaojiSearchComponent/>
        </div>
    );
}

export default GaojiSearch
