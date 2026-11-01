import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';
import { SUPPORTED_LANGUAGES } from '../utils/kundaliHubStrings';

// Multilingual UI headers & labels for Dynamic AI Assessment
const DYNAMIC_AI_UI = {
  en: {
    heading: "Dynamic AI Assessment",
    subheading: "Deity & Vargottama Analysis",
    sourceBadge: "AI Synthesis"
  },
  hi: {
    heading: "गतिशील एआई विश्लेषण (Dynamic AI Assessment)",
    subheading: "देवता एवं वर्गोत्तम सूक्ष्म विश्लेषण",
    sourceBadge: "एआई संश्लेषण"
  },
  ta: {
    heading: "இயக்கநிலை ஏஐ மதிப்பீடு (Dynamic AI Assessment)",
    subheading: "தெய்வம் மற்றும் வர்கோத்தம பகுப்பாய்வு",
    sourceBadge: "ஏஐ தொகுப்பு"
  },
  te: {
    heading: "డైనమిక్ AI విశ్లేషణ (Dynamic AI Assessment)",
    subheading: "దేవత మరియు వర్గోత్తమ విశ్లేషణ",
    sourceBadge: "AI సంశ్లేషణ"
  },
  kn: {
    heading: "ಡೈನಾಮಿಕ್ AI ಮೌಲ್ಯಮಾಪನ (Dynamic AI Assessment)",
    subheading: "ದೇವತೆ ಮತ್ತು ವರ್ಗೋತ್ತಮ ವಿಶ್ಲೇಷಣೆ",
    sourceBadge: "AI ಸಂಶ್ಲೇಷಣೆ"
  },
  gu: {
    heading: "ડાયનેમિક AI મૂલ્યાંકન (Dynamic AI Assessment)",
    subheading: "દેવતા અને વર્ગોત્તમ વિશ્લેષણ",
    sourceBadge: "AI સંશ્લેષણ"
  },
  mr: {
    heading: "डायनॅमिक AI विश्लेषण (Dynamic AI Assessment)",
    subheading: "देवता व वर्गोत्तम सूक्ष्म विश्लेषण",
    sourceBadge: "AI संश्लेषण"
  },
  bn: {
    heading: "ডায়নামিক এআই মূল্যায়ন (Dynamic AI Assessment)",
    subheading: "দেবতা ও বর্গোত্তম বিশ্লেষণ",
    sourceBadge: "এআই সংশ্লেষণ"
  },
  ml: {
    heading: "ഡൈനാമിക് AI വിശകലനം (Dynamic AI Assessment)",
    subheading: "ദേവതയും വർഗോത്തമ വിശകലനവും",
    sourceBadge: "AI വിശകലനം"
  },
  pa: {
    heading: "ਡਾਇਨਾਮਿਕ AI ਮੁਲਾਂਕਣ (Dynamic AI Assessment)",
    subheading: "ਦੇਵਤਾ ਅਤੇ ਵਰਗੋਤਮ ਵਿਸ਼ਲੇਸ਼ਣ",
    sourceBadge: "AI ਸੰਸਲੇਸ਼ਣ"
  },
  sa: {
    heading: "गतिशील एआई मूल्यांकनम् (Dynamic AI Assessment)",
    subheading: "देवता तथा वर्गोत्तम सूक्ष्म विश्लेषणम्",
    sourceBadge: "एआई विश्लेषणम्"
  }
};

const DynamicVargaAnalysis = ({ data, cid, lang = 'en', dbDynamicAi = null }) => {
  const dynamicTextEn = data?.ai_text?.varga_explanations?.[cid]?.en;
  const dynamicTextHi = data?.ai_text?.varga_explanations?.[cid]?.hi;

  const [translatedText, setTranslatedText] = useState(null);
  const [loadingTranslation, setLoadingTranslation] = useState(false);

  // Prioritize MongoDB dynamicAi if passed, else fallback to hardcoded DYNAMIC_AI_UI
  const ui = {
    heading: dbDynamicAi?.heading || DYNAMIC_AI_UI[lang]?.heading || DYNAMIC_AI_UI['hi']?.heading || DYNAMIC_AI_UI['en'].heading,
    subheading: dbDynamicAi?.subheading || DYNAMIC_AI_UI[lang]?.subheading || DYNAMIC_AI_UI['hi']?.subheading || DYNAMIC_AI_UI['en'].subheading,
    sourceBadge: dbDynamicAi?.sourceBadge || DYNAMIC_AI_UI[lang]?.sourceBadge || DYNAMIC_AI_UI['hi']?.sourceBadge || DYNAMIC_AI_UI['en'].sourceBadge
  };
  const langObj = SUPPORTED_LANGUAGES.find(l => l.code === lang) || { name: 'English', native: 'English' };

  useEffect(() => {
    // If English, no translation needed
    if (!lang || lang === 'en') {
      setTranslatedText(null);
      return;
    }

    // If Hindi and backend already provided valid Hindi text
    if (lang === 'hi' && dynamicTextHi && dynamicTextHi !== "अनुवाद उपलब्ध नहीं है।") {
      setTranslatedText(dynamicTextHi);
      return;
    }

    // If database provides a default assessment, check if sourceText is missing
    const sourceText = dynamicTextEn || dynamicTextHi || dbDynamicAi?.defaultAssessment;
    if (!sourceText) return;

    // Check localStorage cache
    const cacheKey = `dyn_ai_${cid}_${lang}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setTranslatedText(cached);
      return;
    }

    let isMounted = true;
    setLoadingTranslation(true);

    axios.post(`${API_BASE_URL}/translate/dynamic-text`, {
      text: sourceText,
      targetLang: lang,
      targetLangName: langObj.name
    })
      .then((res) => {
        if (isMounted && res.data?.success && res.data.translatedText) {
          setTranslatedText(res.data.translatedText);
          try {
            localStorage.setItem(cacheKey, res.data.translatedText);
          } catch (e) {}
        }
      })
      .catch((err) => {
        console.warn(`Dynamic AI assessment translation failed for ${lang}:`, err.message);
      })
      .finally(() => {
        if (isMounted) setLoadingTranslation(false);
      });

    return () => {
      isMounted = false;
    };
  }, [lang, cid, dynamicTextEn, dynamicTextHi, dbDynamicAi?.defaultAssessment]);

  // If there is no explanation text and no database default, don't render the section
  const hasContent = dynamicTextEn || dynamicTextHi || dbDynamicAi?.defaultAssessment;
  if (!hasContent) return null;

  return (
    <div className="mt-8 mb-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg border-2 border-white/20 text-white">
          🤖
        </div>
        <div>
          <h4 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-none">
            {ui.heading}
          </h4>
          <div className="text-[11px] font-bold text-rose-700 uppercase tracking-widest mt-1">
            {ui.subheading}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-rose-50/70 via-pink-50/50 to-orange-50/40 p-6 rounded-3xl border border-rose-200/90 shadow-sm relative overflow-hidden">
        <div className="absolute -top-4 -right-4 opacity-10 text-8xl">✨</div>

        {/* Selected Target Language View */}
        {lang !== 'en' && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2 border-b border-rose-200 pb-1">
              <h5 className="text-xs font-bold text-rose-900 uppercase tracking-widest">
                {langObj.native} ({langObj.name})
              </h5>
              <span className="text-[10px] font-bold bg-white text-rose-900 px-2 py-0.5 rounded-full border border-rose-200">
                {ui.sourceBadge}
              </span>
            </div>

            {loadingTranslation ? (
              <div className="py-4 flex items-center gap-2 text-rose-700 text-sm font-medium animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                <span>Translating AI assessment into {langObj.native}...</span>
              </div>
            ) : (
              <p className="text-slate-800 leading-relaxed font-serif text-[15px] sm:text-[16px]">
                {translatedText || dbDynamicAi?.defaultAssessment || dynamicTextHi || dynamicTextEn}
              </p>
            )}
          </div>
        )}

        {/* English Reference (Always accessible for clarity) */}
        {dynamicTextEn && (
          <div className={lang !== 'en' ? 'mt-4 pt-4 border-t border-rose-200/80' : ''}>
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                English Reference
              </h5>
              {lang === 'en' && (
                <span className="text-[10px] font-bold bg-white text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                  {ui.sourceBadge}
                </span>
              )}
            </div>
            <p className="text-slate-800 leading-relaxed font-serif text-[15px] sm:text-[16px]">
              {dynamicTextEn}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicVargaAnalysis;
