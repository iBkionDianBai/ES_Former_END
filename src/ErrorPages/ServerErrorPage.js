import React from 'react';
import { Helmet } from 'react-helmet';
import './ErrorPages.css';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ServerErrorPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    return (
        <>
            <Helmet>
                <title>{t('serverError')}</title>
            </Helmet>
            <div className="error-page error-500">
                <h1>{t('serverError')}</h1>
                <p>{t('serverErrorMessage')}</p>
                <button className="back-home-btn" onClick={() => navigate('/main')}>{t('returnHome')}</button>
            </div>
        </>
    );
};

export default ServerErrorPage;