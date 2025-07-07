import {useNavigate } from "react-router-dom";
import React from "react";
import axios from 'axios';
import './header.css';

function Header() {
    // const location = useLocation();
    // const username = location.state?.username;
    const navigate = useNavigate();
    const username = sessionStorage.getItem('username');

    const handleLogout = () => {
        // 清除 token
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("username");
        // 清除授权信息
        delete axios.defaults.headers.common["Authorization"];
        // 返回登录页面
        navigate("/");
    };
    const handleMain = () => {
        navigate("/main");
    }

    return (
        <div className="top-section">
            <button className="logout-button" onClick={handleMain} >
                返回首页
            </button>
            <ul className="top-section-middle"><h1 >舆情系统</h1></ul>
            <ul className="top-section-right">
                <li> 欢迎: {username}</li>
                <button className="logout-button" onClick={handleLogout}>
                    退出登录
                </button>
            </ul>
        </div>
    );
}

export default Header;