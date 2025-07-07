import React from 'react';
import { Helmet } from 'react-helmet';
import './ErrorPages.css';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
    const navigate = useNavigate();
    return (
        <>
            <Helmet>
                <title>404 - 页面未找到</title>
            </Helmet>
            <div className="error-page error-404">
                <h1>404 - 页面未找到</h1>
                <p>你访问的页面不存在，请检查网址或返回主页。</p>
                <button className="back-home-btn" onClick={() => navigate('/main')}>返回首页</button>
            </div>
        </>
    );
};

export default NotFoundPage;