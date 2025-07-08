// 引入 React 相关钩子
import React, { useState } from "react";
// 引入 react-router-dom 的一些路由工具
import { useNavigate } from 'react-router-dom';
// 页面标题设置插件
import { Helmet } from 'react-helmet';
// 引入样式
import './MainPage.css';
// 多余的一行 './' 应该可以删除，没引用文件会报错
import Header from "./page/header";

// 搜索组件
function SearchComponent() {
    // 用于记录下拉框的选中值
    const [selectedValue, setSelectedValue] = useState('');
    // 下拉框选项列表
    const [options] = useState([
        { value: 'option1', label: '选项 1' },
        { value: 'option2', label: '选项 2' },
        { value: 'option3', label: '选项 3' }
    ]);
    // 路由跳转函数
    const navigate = useNavigate();
    // 搜索框中的输入值
    const [inputContent, setInputContent] = useState('');
    // 当前激活的 tab（搜索类型）
    const [activeTab, setActiveTab] = useState(0);
    // 搜索 Tab 标签数组
    const [tabs] = useState([
        { name: "检索" },
        { name: "其他" }
    ]);

    // 点击搜索按钮的处理函数
    const handleSearchClick = () => {
        // 当前选择的搜索类型（如：标题、作者等）
        console.log(selectedValue);
        // 新增：如果输入为1，跳转到SearchResultPage，否则跳转到404
        if (inputContent === '1') {
            navigate('/searchResult');
            return;
        } else {
            navigate('*'); // 触发404页面
            return;
        }
        // 实际应用中应将搜索条件和关键词传递到结果页或发起查询
    };

    // 点击高级搜索按钮的处理函数
    const handleGaojiSearchClick = () => {
        // 跳转到高级搜索页面
        navigate("/gaojiSearch");
    };

    return (
        <div className="search-area">
            <div className="banner">
                <div className="searchmain">
                    <div className="page-title">
                        <h1>Search Doc.</h1> {/* 页面主标题 */}
                    </div>

                    {/* 顶部 tab 标签栏 */}
                    <ul className="search-tab">
                        {tabs.map((tab, index) => (
                            <li
                                key={index}
                                className={activeTab === index ? "on active" : ""} // 设置当前选中项高亮
                                onClick={() => setActiveTab(index)} // 点击切换 tab
                            >
                                {tab.name}
                            </li>
                        ))}
                    </ul>

                    {/* 搜索栏内容区域（不同 tab 切换不同内容） */}
                    <div className={activeTab === 0 ? "search-tab-content-normal" : "search-tab-content-other"}>
                        <div className="input-box">
                            {/* 下拉选择框 */}
                            <div>
                                <select className="sort" value={selectedValue} onChange={(e) => setSelectedValue(e.target.value)}>
                                    {options.map((item) => (
                                        <option key={item.value} value={item.value}>{item.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* 输入框 */}
                            <div className="input-content">
                                <input
                                    className="input"
                                    type="text"
                                    value={inputContent}
                                    onChange={(e) => setInputContent(e.target.value)}
                                    placeholder="键入搜索"
                                />
                            </div>

                            {/* 搜索按钮 */}
                            <div className="search-btn">
                                <button className="btn" onClick={handleSearchClick}>搜索</button>
                            </div>
                        </div>

                        {/* 高级搜索按钮 */}
                        <div className="readvce">
                            <button className="GaojiSearchButton" onClick={handleGaojiSearchClick}>高级搜索</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// 主页面组件
function MainPage() {
    return (
        <div>
            {/* 设置页面标题 */}
            <Helmet>
                <title>ElasticDataSearch</title>
            </Helmet>
            {/* 顶部区域（欢迎信息 + 退出按钮） */}
            <div><Header /></div>
            {/* 搜索功能区域  */}
            <div><SearchComponent /></div>
        </div>
    );
}

// 导出 MainPage 组件作为默认组件
export default MainPage;
