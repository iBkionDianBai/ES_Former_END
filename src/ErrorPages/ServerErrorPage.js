import React from 'react';
import { Helmet } from 'react-helmet';
import './ErrorPages.css';
import { useNavigate } from 'react-router-dom';

const ServerErrorPage = () => {
    const navigate = useNavigate();
    return (
        <>
            <Helmet>
                <title>500 - 服务器内部错误</title>
            </Helmet>
            <div className="error-page error-500">
                <h1>500 - 服务器内部错误</h1>
                <p>服务器遇到问题，请稍后再试。</p>
                <button className="back-home-btn" onClick={() => navigate('/main')}>返回首页</button>
            </div>
        </>
    );
};

export default ServerErrorPage;