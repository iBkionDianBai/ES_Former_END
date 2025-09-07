import React, {useEffect, useState, useMemo} from 'react'
import {Helmet} from 'react-helmet';
import './gaojiSearch.css'
import {useLocation, useNavigate} from "react-router-dom";
import Header from "../page/header";
import { useTranslation } from 'react-i18next';
import Footer from "../page/Footer";


function GaojiSearchComponent() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    // 使用翻译函数定义常量，避免重名
    const operators = useMemo(() => [t('and'), t('or'), t('notInclude')], [t]);
    const rowRelations = useMemo(() => [t('and'), t('or'), t('notInclude')], [t]);
    const containers = useMemo(() => [t('allContainers'), t('title'), t('school'), t('abstract'), t('fullText'), t('keywords')], [t]);
    const fuzzyOptions = useMemo(() => [t('fuzzy'), t('exact'), t('phrase')], [t]);

    // 从URL参数获取初始值
    const [searchRows, setSearchRows] = useState([{ keyword1: '', container: t('allContainers'), operator: t('and'), keyword2: '', fuzzy: t('fuzzy') }]);
    // 存储搜索开始日期
    const [startDate, setStartDate] = useState('');
    // 存储搜索结束日期
    const [endDate, setEndDate] = useState('');
    // 存储用户选择的搜索类型
    const [searchTypes, setSearchTypes] = useState([]);

    // 从URL参数初始化搜索条件
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const urlSearchData = urlParams.get('searchData');
        const q = urlParams.get('q') || '';
        
        if (urlSearchData) {
            // 如果存在searchData参数，解析并设置搜索条件
            try {
                const searchParams = JSON.parse(decodeURIComponent(urlSearchData));
                if (searchParams.conditions && searchParams.conditions.length > 0) {
                    const rows = searchParams.conditions.map((condition, index) => {
                        const row = {
                            keyword1: condition.keyword1 || '',
                            keyword2: condition.keyword2 || '',
                            container: mapFieldToContainer(condition.field),
                            operator: mapBackendOperator(condition.innerOperator),
                            fuzzy: t('fuzzy')
                        };
                        
                        if (index > 0 && condition.rowOperator) {
                            row.relation = mapBackendOperator(condition.rowOperator);
                        }
                        
                        return row;
                    });
                    setSearchRows(rows);
                }
                
                // 设置日期
                if (searchParams.startDate) {
                    setStartDate(searchParams.startDate);
                }
                if (searchParams.endDate) {
                    setEndDate(searchParams.endDate);
                }
            } catch (e) {
                console.error('解析搜索参数失败:', e);
                // 如果解析失败，使用默认值
                setSearchRows([{ keyword1: '', container: t('allContainers'), operator: t('and'), keyword2: '', fuzzy: t('fuzzy') }]);
            }
        } else if (q) {
            // 如果只有q参数，设置第一行的keyword1
            setSearchRows([{ keyword1: q, container: t('allContainers'), operator: t('and'), keyword2: '', fuzzy: t('fuzzy') }]);
        }
    }, [location.search, t]);

    // 反向映射函数：从后端字段映射到前端容器
    const mapFieldToContainer = (field) => {
        switch (field) {
            case "title": return t('title');
            case "school": return t('school');
            case "abstract": return t('abstract');
            case "content": return t('fullText');
            case "keywords": return t('keywords');
            default: return t('allContainers');
        }
    };

    // 反向映射函数：从后端操作符映射到前端操作符
    const mapBackendOperator = (op) => {
        switch (op) {
            case "AND": return t('and');
            case "OR": return t('or');
            case "NOT": return t('notInclude');
            default: return t('and');
        }
    };

    // 处理语言切换时的状态更新
    useEffect(() => {
        // 当语言变化时，更新搜索行的默认值
        setSearchRows(prevRows =>
            prevRows.map(row => ({
                ...row,
                container: row.container === '全部容器' || row.container === 'All Containers' ? t('allContainers') : row.container,
                operator: row.operator === '并且' || row.operator === 'And' ? t('and') :
                         row.operator === '或者' || row.operator === 'Or' ? t('or') :
                         row.operator === '不包含' || row.operator === 'Not Include' ? t('notInclude') : row.operator,
                fuzzy: row.fuzzy === '模糊' || row.fuzzy === 'Fuzzy' ? t('fuzzy') :
                       row.fuzzy === '精确' || row.fuzzy === 'Exact' ? t('exact') : row.fuzzy,
                relation: row.relation === '并且' || row.relation === 'And' ? t('and') :
                         row.relation === '或者' || row.relation === 'Or' ? t('or') :
                         row.relation === '不包含' || row.relation === 'Not Include' ? t('notInclude') : row.relation
            }))
        );
    }, [t]); // 当翻译函数变化时触发

    // 处理添加新搜索行的函数
    const handleAddRow = () => {
        setSearchRows([...searchRows, {
            relation: t('and'),
            keyword1: '',
            container: t('allContainers'),
            operator: t('and'),
            keyword2: '',
            fuzzy: t('fuzzy')
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

    const mapContainerToField = (container) => {
        switch (container) {
            case t('title'): return "title";
            case t('school'): return "school";
            case t('abstract'): return "abstract";
            case t('fullText'): return "content";
            case t('keywords'): return "keywords";
            default: return "all";
        }
    };

    const mapOperator = (op) => {
        if ([t('and'), "And", "and"].includes(op)) return "AND";
        if ([t('or'), "Or", "or"].includes(op)) return "OR";
        if ([t('notInclude'), "Not Include"].includes(op)) return "NOT";
        return "AND";
    };

    const mapRelation = (rel) => mapOperator(rel); // rowOperator 和 innerOperator 转换规则一样
    const mapFuzzy = (fuzzy) => {
        if ([t('fuzzy'), "Fuzzy", "fuzzy"].includes(fuzzy)) return "fuzzy";
        if ([t('exact'), "Exact", "exact"].includes(fuzzy)) return "exact";
        if ([t('phrase'), "Phrase", "phrase"].includes(fuzzy)) return "phrase";
        return "fuzzy";
    };

    // 处理搜索按钮点击事件的函数
    const handleSearch = () => {
        // 构建多行搜索条件
        const conditions = searchRows.map((row, index) => {
            const k1 = row.keyword1?.trim() || "";
            const k2 = row.keyword2?.trim() || "";
            const container = row.container || "";
            const operator = row.operator || "";
            const fuzzy = row.fuzzy || "";
            const relation = row.relation || "";

            // 构建单行条件对象
            const condition = {
                field: mapContainerToField(container),      // 转换容器到后端字段
                keyword1: k1,
                innerOperator: mapOperator(operator),       // 转换前端操作符到后端 innerOperator
                keyword2: k2
            };

            // 如果不是第一行，添加 rowOperator
            if (index > 0) {
                condition.rowOperator = mapRelation(relation);
            }

            return condition;
        });

        // 构建完整的请求参数
        const searchParams = {
            conditions: conditions,
            currentPage: 1,
            pageSize: 10,
            sortField: "_score",
            sortOrder: "desc"
        };

        // 添加日期参数（如果有的话）
        if (startDate) {
            searchParams.startDate = startDate;
        }
        if (endDate) {
            searchParams.endDate = endDate;
        }

        // 将搜索参数编码为URL参数
        const urlParams = new URLSearchParams();
        urlParams.set('searchData', JSON.stringify(searchParams));

        // 跳转到结果页面
        const url = `/gaojiSearchResult?${urlParams.toString()}`;
        navigate(url);
    };

    // 处理清除按钮点击事件的函数
    const handleClear = () => {
        setSearchRows([{ keyword1: '', container: t('allContainers'), operator: t('and'), keyword2: '', fuzzy: t('fuzzy') }]);
        setStartDate('');
        setEndDate('');
        setSearchTypes([]);
    };

    return (
        <div className="search-page">
            <h2>{t('gaojiAdvancedRetrieval')}</h2>
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
                                    <button onClick={() => handleAddRow()} className="action-button">{t('add')}</button>
                                    {/* 只在非第一行显示删除按钮 */}
                                    {index > 0 && (
                                        <button onClick={() => handleRemoveRow(index)} className="action-button">{t('delete')}</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="date-section">
                        <label>{t('date')}:</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={handleStartDateChange}
                            className="input-box"
                        />
                        <span>{t('gaojiDateRange')}:</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={handleEndDateChange}
                            className="input-box"
                        />
                    </div>
                    <div className="button-section">
                        <button onClick={handleClear} className="action-button">
                            <h3>{t('gaojiClear')}</h3>
                        </button>
                        <button onClick={handleSearch} className="action-button">
                            <h3>{t('gaojiSearch')}</h3>
                        </button>
                    </div>
                </div>
                <div className="search-instruction">
                    <h3>{t('gaojiSearchInstructions')}</h3>
                    <p>{t('gaojiSearchInstructionsText')}</p>
                </div>
            </div>
        </div>
    );
}

function GaojiSearch() {
    const { t } = useTranslation();
    const location = useLocation();
    const username = location.state?.username;
    const navigate = useNavigate();
    return (
        <div >
            <Helmet>
                <title>{t('gaojiWelcomeToAdvancedSearch')}</title>
            </Helmet>
            {/* 顶部区域 */}
            <Header />
            {/* 插入搜索组件 */}
            <GaojiSearchComponent/>
        </div>
    );
}

export default GaojiSearch
