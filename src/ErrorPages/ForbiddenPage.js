import React from 'react';
import { Helmet } from 'react-helmet';
import './ErrorPages.css';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ForbiddenPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <>
            <Helmet>
                <title>{t('forbidden')}</title>
            </Helmet>
            <div className="error-page error-403">
                <h1>{t('forbidden')}</h1>
                <p>{t('forbiddenMessage')}</p>
                <button className="back-home-btn" onClick={() => navigate('/main')}>{t('returnHome')}</button>
            </div>
        </>
    );
};

export default ForbiddenPage;