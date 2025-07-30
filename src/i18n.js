// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    .use(HttpApi)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'zh',
        debug: true,
        detection: {
            order: ['querystring', 'cookie'],
            cache: ['cookie']
        },
        interpolation: {
            escapeValue: false
        },
        backend: {
            loadPath: '/locales/{{lng}}/translation.json'
        }
    }, (error, t) => {
        if (error) {
            console.error('Error initializing i18n:', error);
        }
    });

export default i18n;