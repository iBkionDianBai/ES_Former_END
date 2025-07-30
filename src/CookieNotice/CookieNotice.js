// src/CookieNotice.js
import "./CookieNotice.css"
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const CookieNotice = () => {
    const { t } = useTranslation();
    const [showNotice, setShowNotice] = useState(false);

    useEffect(() => {
        const hasConsented = localStorage.getItem('cookieConsent');
        if (!hasConsented) {
            setShowNotice(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'true');
        setShowNotice(false);
    };

    return (
        showNotice && (
            <div className="cookie-notice slide-in">
                <p>🍪{t('cookieNoticeText')}</p>
                <button onClick={handleAccept}>{t('acceptCookies')}</button>
            </div>
        )
    );
};

export default CookieNotice;