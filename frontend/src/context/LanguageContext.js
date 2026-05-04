import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
    // Get default language from localStorage, if not exists use 'en'
    const [language, setLanguage] = useState(() => {
        const storedLang = localStorage.getItem('language');
        return storedLang ? storedLang : 'en';
    });

    // Save to localStorage when language changes
    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const changeLanguage = (lang) => {
        if (lang === 'en' || lang === 'tr') {
            setLanguage(lang);
        }
    };

    // Translation function
    const t = (key) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
