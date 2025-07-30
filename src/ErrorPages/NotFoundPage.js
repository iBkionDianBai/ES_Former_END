import React from 'react';
import { Helmet } from 'react-helmet';
import './ErrorPages.css';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotFoundPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <>
            <Helmet>
                <title>{t('notFound')}</title>
            </Helmet>
            <div className="error-page error-404">
                <h1>{t('notFound')}</h1>
                <p>{t('notFoundMessage')}</p>
                <button className="back-home-btn" onClick={() => navigate('/main')}>{t('returnHome')}</button>
            </div>
        </>
    );
};

export default NotFoundPage;