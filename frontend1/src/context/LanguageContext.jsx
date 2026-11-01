import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SUPPORTED_LANGUAGES, BASE_TRANSLATIONS } from '../utils/siteTranslations';
import { API_BASE_URL } from '../services/api';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Read saved language from localStorage (defaults to English 'en')
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('astro_site_lang') || localStorage.getItem('kundali_hub_lang') || 'en';
  });

  // Dynamic dictionary of translated phrases: { [englishText]: translatedText }
  const [translations, setTranslations] = useState(() => {
    const saved = localStorage.getItem('astro_site_lang') || 'en';
    const cached = localStorage.getItem(`astro_dict_${saved}`);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return {};
      }
    }
    return {};
  });

  const [isTranslating, setIsTranslating] = useState(false);

  // Sync to localStorage whenever language changes
  useEffect(() => {
    localStorage.setItem('astro_site_lang', currentLang);
    localStorage.setItem('kundali_hub_lang', currentLang);
  }, [currentLang]);

  // Primary translation function:
  // 1. If English, return original
  // 2. Check BASE_TRANSLATIONS (AstroSage instant dictionary)
  // 3. Check dynamic translated dictionary
  // 4. Return original text as fallback
  const t = useCallback((text) => {
    if (!text || typeof text !== 'string') return text;
    if (currentLang === 'en') return text;

    // Check pre-compiled dictionary
    if (BASE_TRANSLATIONS[text] && BASE_TRANSLATIONS[text][currentLang]) {
      return BASE_TRANSLATIONS[text][currentLang];
    }

    // Check dynamic runtime cache
    if (translations[text]) {
      return translations[text];
    }

    return text;
  }, [currentLang, translations]);

  // Change language across the entire website
  const changeLanguage = async (newLang) => {
    if (newLang === currentLang) return;
    setCurrentLang(newLang);

    if (newLang === 'en') {
      setTranslations({});
      return;
    }

    // Check if we have cached translations for this language
    const cached = localStorage.getItem(`astro_dict_${newLang}`);
    if (cached) {
      try {
        setTranslations(JSON.parse(cached));
      } catch (e) { }
    }
  };

  // Helper to batch translate any custom dynamic text via backend Gemini API
  const translateBatch = async (stringsArray) => {
    if (currentLang === 'en' || !Array.isArray(stringsArray) || stringsArray.length === 0) {
      return;
    }

    const missing = stringsArray.filter(
      (s) => s && !translations[s] && !(BASE_TRANSLATIONS[s] && BASE_TRANSLATIONS[s][currentLang])
    );

    if (missing.length === 0) return;

    try {
      setIsTranslating(true);
      const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang);
      const stringsObj = missing.reduce((acc, curr, idx) => {
        acc[`k_${idx}`] = curr;
        return acc;
      }, {});

      const res = await fetch(`${API_BASE_URL}/translate/ui`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetLang: currentLang,
          targetLangName: langObj?.name || currentLang,
          strings: stringsObj
        })
      });

      const data = await res.json();
      if (data.success && data.translations) {
        const newEntries = {};
        missing.forEach((originalText, idx) => {
          const translated = data.translations[`k_${idx}`];
          if (translated) {
            newEntries[originalText] = translated;
          }
        });

        setTranslations((prev) => {
          const updated = { ...prev, ...newEntries };
          localStorage.setItem(`astro_dict_${currentLang}`, JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err) {
      console.warn('Batch translation warning:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        currentLang,
        currentLangObj,
        changeLanguage,
        t,
        translateBatch,
        isTranslating,
        supportedLanguages: SUPPORTED_LANGUAGES
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
