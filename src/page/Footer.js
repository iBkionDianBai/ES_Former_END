// Footer.jsx
import React from "react";
import "./Footer.css";
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();
    return (
        <footer className="site-footer">
            <div className="footer-container">
                <div className="footer-section about">
                    <h3>{t('aboutUs')}</h3>
                    <p>{t('footerAboutUsDescription')}</p>
                </div>
                <div className="footer-section links">
                    <h3>{t('quickLinks')}</h3>
                    <ul>
                        <li><a href="/about">{t('about')}</a></li>
                        <li><a href="/services">{t('services')}</a></li>
                        <li><a href="/contact">{t('contact')}</a></li>
                        <li><a href="/faq">{t('faq')}</a></li>
                    </ul>
                </div>
                <div className="footer-section contact">
                    <h3>{t('contactInfo')}</h3>
                    <p>{t('email')}: support@fakeemail.com</p>
                    <p>{t('phone')}: +1 000-0000-0000</p>
                </div>
            </div>
            <div className="footer-bottom">
                © {new Date().getFullYear()}. {t('allRightsReserved')}
            </div>
        </footer>
    );
};

export default Footer;