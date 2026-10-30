import React, { createContext, useContext, useState } from 'react';
import { Language, translations } from '../i18n/translations.js';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en'], params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getInitialLanguage = (): Language => {
  const saved = localStorage.getItem('peoplebooks_lang');
  if (saved === 'en' || saved === 'pt-BR' || saved === 'es') {
    return saved as Language;
  }
  return 'en'; // Default is always English
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('peoplebooks_lang', lang);
  };

  const t = (key: keyof typeof translations['en'], params?: Record<string, string | number>): string => {
    let str = translations[language][key] || translations['en'][key] || String(key);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return str;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};

