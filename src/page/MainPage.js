// 引入 React 相关钩子
import React, { useState } from "react";
// 引入 react-router-dom 的一些路由工具
import { useNavigate } from 'react-router-dom';
// 页面标题设置插件
import { Helmet } from 'react-helmet';
// 引入样式
import './MainPage.css';
import Header from "./header";

// 搜索组件
function SearchComponent() {
    const [selectedValue, setSelectedValue] = useState('');
    const [options] = useState([
        { value: 'option1', label: '选项 1' },
        { value: 'option2', label: '选项 2' },
        { value: 'option3', label: '选项 3' }
    ]);
    const navigate = useNavigate();
    const [inputContent, setInputContent] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [tabs] = useState([
        { name: "检索" },
        { name: "其他" }
    ]);

    const handleSearchClick = () => {
        if (inputContent === '1' || inputContent === '2') {
            navigate('/searchResult?q=' + encodeURIComponent(inputContent));
        } else {
            navigate('*');
        }
    };

    const handleGaojiSearchClick = () => {
        navigate("/gaojiSearch");
    };

    return (
        <div className="search-area">
            <div className="banner"></div>
            <div className="searchmain">
                <div className="page-title">
                    <h1>Search Doc.</h1>
                </div>
                <ul className="search-tab">
                    {tabs.map((tab, index) => (
                        <li
                            key={index}
                            className={activeTab === index ? "on active" : ""}
                            onClick={() => setActiveTab(index)}
                        >
                            {tab.name}
                        </li>
                    ))}
                </ul>
                <div className={activeTab === 0 ? "search-tab-content-normal" : "search-tab-content-other"}>
                    <div className="input-box">
                        <div>
                            <select className="sort" value={selectedValue} onChange={(e) => setSelectedValue(e.target.value)}>
                                {options.map((item) => (
                                    <option key={item.value} value={item.value}>{item.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="input-content">
                            <input
                                className="input"
                                type="text"
                                value={inputContent}
                                onChange={(e) => setInputContent(e.target.value)}
                                placeholder="键入搜索"
                            />
                        </div>
                        <div className="search-btn">
                            <button className="btn" onClick={handleSearchClick}>搜索</button>
                        </div>
                    </div>
                    <div className="readvce">
                        <button className="GaojiSearchButton" onClick={handleGaojiSearchClick}>高级搜索</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ButtonBar() {
    const navigate = useNavigate();
    const handleUploadFileClick = () => {
        navigate("/uploadFile");
    }
    const buttons = [
        { label: "上传文件", onClick: handleUploadFileClick },
    ];

    return (
        <div className="button-bar-container">
            <div className="button-bar-title">🔧工具栏：</div>
            <div className="button-bar">
                <ul className="select-list">
                    {buttons.map((btn, index) => (
                        <li key={index}>
                            <button className="btn" onClick={btn.onClick}>{btn.label}</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

function MainPage() {
    return (
        <div>
            <Helmet>
                <title>ElasticDataSearch</title>
            </Helmet>
            <Header />
            <SearchComponent />
            <ButtonBar />
        </div>
    );
}

export default MainPage;
