import React from 'react';
import { Helmet } from 'react-helmet';
import './ErrorPages.css';
import { useNavigate } from 'react-router-dom';

const ForbiddenPage = () => {
    const navigate = useNavigate();
    return (
        <>
            <Helmet>
                <title>403 - 禁止访问</title>
            </Helmet>
            <div className="error-page error-403">
                <h1>403 - 禁止访问</h1>
                <p>你没有权限访问该页面。</p>
                <button className="back-home-btn" onClick={() => navigate('/main')}>返回首页</button>
            </div>
        </>
    );
};

export default ForbiddenPage;