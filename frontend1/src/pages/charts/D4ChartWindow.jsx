import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  Sparkles,
  Printer,
  Compass,
  Home,
  Shield,
  Layers,
  Info,
  Calendar,
  Clock,
  MapPin,
  RefreshCw,
  X,
  PhoneCall,
  Globe,
  Award,
  Zap,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Building,
  Key
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../utils/kundaliHubStrings';
import { API_BASE_URL, PYTHON_ASTRO_URL } from '../../services/api';
import StandaloneD1Chart from '../../components/StandaloneD1Chart';
import SouthIndianD1Chart from '../../components/SouthIndianD1Chart';
import { D4_INTERPRETATIONS } from '../../data/d4HouseInterpretations';

const PLANET_COLORS = {
  Sun: "#dc2626",
  Moon: "#0284c7",
  Mars: "#ea580c",
  Mercury: "#16a34a",
  Jupiter: "#d97706",
  Venus: "#db2777",
  Saturn: "#475569",
  Rahu: "#4f46e5",
  Ketu: "#7c3aed",
  Ascendant: "#000000",
};

// Sign Names
const SIGN_NAMES_EN = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

// Multilingual Signs
const MULTILINGUAL_SIGNS = {
  en: ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"],
  hi: ["मेष (Aries)", "वृषभ (Taurus)", "मिथुन (Gemini)", "कर्क (Cancer)", "सिंह (Leo)", "कन्या (Virgo)", "तुला (Libra)", "वृश्चिक (Scorpio)", "धनु (Sagittarius)", "मकर (Capricorn)", "कुंभ (Aquarius)", "मीन (Pisces)"],
  ta: ["மேஷம் (Aries)", "ரிஷபம் (Taurus)", "மிதுனம் (Gemini)", "கடகம் (Cancer)", "சிம்மம் (Leo)", "கன்னி (Virgo)", "துலாம் (Libra)", "விருச்சிகம் (Scorpio)", "தனுசு (Sagittarius)", "மகரம் (Capricorn)", "கும்பம் (Aquarius)", "மீனம் (Pisces)"],
  te: ["మేషం (Aries)", "వృషభం (Taurus)", "మిథునం (Gemini)", "కర్కాటకం (Cancer)", "సింహం (Leo)", "కన్య (Virgo)", "తుల (Libra)", "వృశ్చికం (Scorpio)", "ధనుస్సు (Sagittarius)", "మకరం (Capricorn)", "కుంభం (Aquarius)", "మీనం (Pisces)"],
  kn: ["ಮೇಷ (Aries)", "ವೃಷಭ (Taurus)", "ಮಿಥುನ (Gemini)", "ಕರ್ಕಾಟಕ (Cancer)", "ಸಿಂಹ (Leo)", "ಕನ್ಯಾ (Virgo)", "ತುಲಾ (Libra)", "ವೃಶ್ಚಿಕ (Scorpio)", "ಧನು (Sagittarius)", "ಮಕರ (Capricorn)", "ಕುಂಭ (Aquarius)", "ಮೀನ (Pisces)"],
  gu: ["મેષ (Aries)", "વૃષભ (Taurus)", "મિથુન (Gemini)", "કર્ક (Cancer)", "સિંહ (Leo)", "કન્યા (Virgo)", "તુલા (Libra)", "વૃશ્ચિક (Scorpio)", "ધન (Sagittarius)", "મકર (Capricorn)", "કુંભ (Aquarius)", "મીન (Pisces)"],
  mr: ["मेष (Aries)", "वृषभ (Taurus)", "मिथुन (Gemini)", "कर्क (Cancer)", "सिंह (Leo)", "कन्या (Virgo)", "तूळ (Libra)", "वृश्चिक (Scorpio)", "धनु (Sagittarius)", "मकर (Capricorn)", "कुंभ (Aquarius)", "मीन (Pisces)"],
  bn: ["মেষ (Aries)", "বৃষ (Taurus)", "মিথুন (Gemini)", "কর্কট (Cancer)", "সিংহ (Leo)", "কন্যা (Virgo)", "তুলা (Libra)", "বৃশ্চিক (Scorpio)", "ধনু (Sagittarius)", "মকর (Capricorn)", "কুম্ভ (Aquarius)", "মীন (Pisces)"],
  ml: ["മേടം (Aries)", "ഇടവം (Taurus)", "മിഥുനം (Gemini)", "കർക്കടകം (Cancer)", "ചിങ്ങം (Leo)", "കന്നി (Virgo)", "തുലാം (Libra)", "വൃശ്ചികം (Scorpio)", "ധനു (Sagittarius)", "മകരം (Capricorn)", "കുംഭം (Aquarius)", "മീനം (Pisces)"],
  pa: ["ਮੇਖ (Aries)", "ਬ੍ਰਿਖ (Taurus)", "ਮਿਥੁਨ (Gemini)", "ਕਰਕ (Cancer)", "ਸਿੰਘ (Leo)", "ਕੰਨਿਆ (Virgo)", "ਤੁਲਾ (Libra)", "ਬ੍ਰਿਸ਼ਚਕ (Scorpio)", "ਧਨੁ (Sagittarius)", "ਮਕਰ (Capricorn)", "ਕੁੰਭ (Aquarius)", "ਮੀਨ (Pisces)"],
  sa: ["मेषः (Aries)", "वृषभः (Taurus)", "मिथुनम् (Gemini)", "कर्कः (Cancer)", "सिंहः (Leo)", "कन्या (Virgo)", "तुला (Libra)", "वृश्चिकः (Scorpio)", "धनुः (Sagittarius)", "मकरः (Capricorn)", "कुम्भः (Aquarius)", "मीनः (Pisces)"]
};

// Multilingual Sign Lords (0: Mars to 11: Jupiter)
const MULTILINGUAL_LORDS = {
  en: ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"],
  hi: ["मंगल (Mars)", "शुक्र (Venus)", "बुध (Mercury)", "चंद्र (Moon)", "सूर्य (Sun)", "बुध (Mercury)", "शुक्र (Venus)", "मंगल (Mars)", "गुरु (Jupiter)", "शनि (Saturn)", "शनि (Saturn)", "गुरु (Jupiter)"],
  ta: ["செவ்வாய் (Mars)", "சுக்கிரன் (Venus)", "புதன் (Mercury)", "சந்திரன் (Moon)", "சூரியன் (Sun)", "புதன் (Mercury)", "சுக்கிரன் (Venus)", "செவ்வாய் (Mars)", "குரு (Jupiter)", "சனி (Saturn)", "சனி (Saturn)", "குரு (Jupiter)"],
  te: ["కుజుడు (Mars)", "శుక్రుడు (Venus)", "బుధుడు (Mercury)", "చంద్రుడు (Moon)", "సూర్యుడు (Sun)", "బుధుడు (Mercury)", "శుక్రుడు (Venus)", "కుజుడు (Mars)", "గురుడు (Jupiter)", "శని (Saturn)", "శని (Saturn)", "గురుడు (Jupiter)"],
  kn: ["ಮಂಗಳ (Mars)", "ಶುಕ್ರ (Venus)", "ಬುಧ (Mercury)", "ಚಂದ್ರ (Moon)", "ಸೂರ್ಯ (Sun)", "ಬುಧ (Mercury)", "ಶುಕ್ರ (Venus)", "ಮಂಗಳ (Mars)", "ಗುರು (Jupiter)", "ಶನಿ (Saturn)", "ಶನಿ (Saturn)", "ಗುರು (Jupiter)"],
  gu: ["મંગળ (Mars)", "શુક્ર (Venus)", "બુધ (Mercury)", "ચંદ્ર (Moon)", "સૂર્ય (Sun)", "બુધ (Mercury)", "શુક્ર (Venus)", "મંગળ (Mars)", "ગુરુ (Jupiter)", "શનિ (Saturn)", "શનિ (Saturn)", "ગુરુ (Jupiter)"],
  mr: ["मंगळ (Mars)", "शुक्र (Venus)", "बुध (Mercury)", "चंद्र (Moon)", "सूर्य (Sun)", "बुध (Mercury)", "शुक्र (Venus)", "मंगळ (Mars)", "गुरू (Jupiter)", "शनी (Saturn)", "शनी (Saturn)", "गुरू (Jupiter)"],
  bn: ["মঙ্গল (Mars)", "শুক্র (Venus)", "বুধ (Mercury)", "চন্দ্র (Moon)", "সূর্য (Sun)", "বুধ (Mercury)", "শুক্র (Venus)", "মঙ্গল (Mars)", "বৃহস্পতি (Jupiter)", "শনি (Saturn)", "শনি (Saturn)", "বৃহস্পতি (Jupiter)"],
  ml: ["ചൊവ്വ (Mars)", "ശുക്രൻ (Venus)", "ബുധൻ (Mercury)", "ചന്ദ്രൻ (Moon)", "സൂര്യൻ (Sun)", "ബുധൻ (Mercury)", "ശുക്രൻ (Venus)", "ചൊവ്വ (Mars)", "വ്യാഴം (Jupiter)", "ശനി (Saturn)", "ശനി (Saturn)", "വ്യാഴം (Jupiter)"],
  pa: ["ਮੰਗਲ (Mars)", "ਸ਼ੁੱਕਰ (Venus)", "ਬੁੱਧ (Mercury)", "ਚੰਦਰਮਾ (Moon)", "ਸੂਰਜ (Sun)", "ਬੁੱਧ (Mercury)", "ਸ਼ੁੱਕਰ (Venus)", "ਮੰਗਲ (Mars)", "ਗੁਰੂ (Jupiter)", "ਸ਼ਨੀ (Saturn)", "ਸ਼ਨੀ (Saturn)", "ਗੁਰੂ (Jupiter)"],
  sa: ["मङ्गलः (Mars)", "शुक्रः (Venus)", "बुधः (Mercury)", "चन्द्रः (Moon)", "सूर्यः (Sun)", "बुधः (Mercury)", "शुक्रः (Venus)", "मङ्गलः (Mars)", "गुरुः (Jupiter)", "शनिः (Saturn)", "शनिः (Saturn)", "गुरुः (Jupiter)"]
};

// D4 Chaturthamsha Deities (Sanaka, Sanandana, Sanatkumara, Sanatana)
const MULTILINGUAL_D4_DEITIES = {
  en: ["Sanaka", "Sanandana", "Sanatkumara", "Sanatana"],
  hi: ["सनक (Sanaka)", "सनन्दन (Sanandana)", "सनत्कुमार (Sanatkumara)", "सनातन (Sanatana)"],
  ta: ["ஸனகர் (Sanaka)", "ஸனந்தனர் (Sanandana)", "ஸனத்குமாரர் (Sanatkumara)", "ஸனாதனர் (Sanatana)"],
  te: ["సనకుడు (Sanaka)", "సనందనుడు (Sanandana)", "సనత్కుమారుడు (Sanatkumara)", "సనాతనుడు (Sanatana)"],
  kn: ["ಸನಕ (Sanaka)", "ಸನಂದನ (Sanandana)", "ಸನತ್ಕುಮಾರ (Sanatkumara)", "ಸನಾತನ (Sanatana)"],
  gu: ["સનક (Sanaka)", "સનંદન (Sanandana)", "સનતકુમાર (Sanatkumara)", "સનાતન (Sanatana)"],
  mr: ["सनक (Sanaka)", "सनंदन (Sanandana)", "सनत्कुमार (Sanatkumara)", "सनातन (Sanatana)"],
  bn: ["সনক (Sanaka)", "সনন্দন (Sanandana)", "সনৎকুমার (Sanatkumara)", "সনাতন (Sanatana)"],
  ml: ["സനകൻ (Sanaka)", "സനന്ദനൻ (Sanandana)", "സനത്കുമാരൻ (Sanatkumara)", "സനാതനൻ (Sanatana)"],
  pa: ["ਸਨਕ (Sanaka)", "ਸਨੰਦਨ (Sanandana)", "ਸਨਤਕੁਮਾਰ (Sanatkumara)", "ਸਨਾਤਨ (Sanatana)"],
  sa: ["सनकः (Sanaka)", "सनन्दनः (Sanandana)", "सनत्कुमारः (Sanatkumara)", "सनातनः (Sanatana)"]
};

// Multilingual translations for D4 Table & UI
const D4_TABLE_I18N = {
  en: {
    heading: "D4 Chaturthamsha Planetary Status",
    subtitle: "Planetary distribution across 4 divisions (7°30' each) representing Property, Fortune & Conveyances",
    colPlanet: "Planet",
    colLord: "Chaturthamsha Lord",
    colDeity: "Vedic Deity",
    colSign: "D4 Sign",
    colHouse: "D4 House",
    footerText: "Click on any planet row or chart element to highlight its property, wealth, and home peace analysis."
  },
  hi: {
    heading: "चतुर्थांश कुंडली (D4) ग्रहीय स्थिति",
    subtitle: "प्रत्येक 7°30' भाग में ग्रहों का वितरण - भूमि, भवन, वाहन एवं भाग्य का सूक्ष्म विश्लेषण",
    colPlanet: "ग्रह",
    colLord: "चतुर्थांश स्वामी",
    colDeity: "वैदिक देवता",
    colSign: "D4 राशि",
    colHouse: "D4 भाव",
    footerText: "किसी भी ग्रह पर क्लिक करके उसकी अचल संपत्ति, भवन सुख और भाग्य का फल देखें।"
  }
};

/**
 * Calculates D4 Chaturthamsha chart based on classical Parashara rule:
 * Each 30° sign is divided into four 7°30' segments:
 * - 0°00' to 7°30': 1st Pada -> Same sign (signIdx + 0)
 * - 7°30' to 15°00': 2nd Pada -> 4th sign from itself (signIdx + 3)
 * - 15°00' to 22°30': 3rd Pada -> 7th sign from itself (signIdx + 6)
 * - 22°30' to 30°00': 4th Pada -> 10th sign from itself (signIdx + 9)
 */
function calculateD4Chaturthamsha(basePlanets = [], baseAscDeg = 0, lang = 'en') {
  const deities = MULTILINGUAL_D4_DEITIES[lang] || MULTILINGUAL_D4_DEITIES['hi'] || MULTILINGUAL_D4_DEITIES['en'];
  const lords = MULTILINGUAL_LORDS[lang] || MULTILINGUAL_LORDS['hi'] || MULTILINGUAL_LORDS['en'];
  const signNames = MULTILINGUAL_SIGNS[lang] || MULTILINGUAL_SIGNS['hi'] || MULTILINGUAL_SIGNS['en'];

  const getD4Info = (totalDeg) => {
    const normDeg = ((totalDeg % 360) + 360) % 360;
    const baseSignIdx = Math.floor(normDeg / 30);
    const degInSign = normDeg % 30;

    let part = 0; // 0 = 0-7.5, 1 = 7.5-15, 2 = 15-22.5, 3 = 22.5-30
    let signOffset = 0;

    if (degInSign < 7.5) {
      part = 0;
      signOffset = 0; // 1st house from itself
    } else if (degInSign < 15.0) {
      part = 1;
      signOffset = 3; // 4th house from itself
    } else if (degInSign < 22.5) {
      part = 2;
      signOffset = 6; // 7th house from itself
    } else {
      part = 3;
      signOffset = 9; // 10th house from itself
    }

    const d4SignIndex = (baseSignIdx + signOffset) % 12;
    return {
      d4SignIndex,
      part,
      deity: deities[part] || deities[0],
      lord: lords[d4SignIndex] || lords[0],
      translatedSign: signNames[d4SignIndex] || SIGN_NAMES_EN[d4SignIndex]
    };
  };

  const ascD4 = getD4Info(baseAscDeg);
  const ascD4Sign = ascD4.d4SignIndex;

  // Initialize 12 houses starting from Ascendant's D4 sign
  const d4Houses = {};
  for (let h = 1; h <= 12; h++) {
    const signIndex = (ascD4Sign + (h - 1)) % 12;
    d4Houses[h] = {
      sign_index: signIndex,
      planets: []
    };
  }

  const d4PlanetPositions = [];

  basePlanets.forEach((p) => {
    const pDeg = Number(p.degree !== undefined ? p.degree : p.lon || 0);
    const dInfo = getD4Info(pDeg);

    // Calculate house offset from Ascendant's D4 sign (1-indexed)
    const houseNum = ((dInfo.d4SignIndex - ascD4Sign + 12) % 12) + 1;

    const pCopy = {
      ...p,
      house: houseNum,
      sign_index: dInfo.d4SignIndex,
      sign: dInfo.translatedSign,
      d4Part: dInfo.part + 1,
      deity: dInfo.deity,
      d4Lord: dInfo.lord
    };

    d4PlanetPositions.push(pCopy);

    if (d4Houses[houseNum]) {
      d4Houses[houseNum].planets.push(pCopy);
    }
  });

  return {
    d4Houses,
    d4PlanetPositions,
    ascD4Sign,
    ascD4
  };
}

export default function D4ChartWindow() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [chartStyle, setChartStyle] = useState('north');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const audioRef = useRef(null);

  // Extract query params
  const name = searchParams.get('name') || 'Native';
  const date = searchParams.get('date') || '1990-01-01';
  const time = searchParams.get('time') || '12:00';
  const lat = parseFloat(searchParams.get('lat') || '28.6139');
  const lon = parseFloat(searchParams.get('lon') || '77.2090');
  const tzOffset = parseFloat(searchParams.get('tz_offset') || '5.5');
  const locationName = searchParams.get('location_name') || 'New Delhi, India';

  const urlLang = searchParams.get('lang');
  const savedLang = localStorage.getItem('kundali_hub_lang') || 'en';
  const initialLang = urlLang || savedLang;

  const [currentLang, setCurrentLang] = useState(initialLang);
  const [translations, setTranslations] = useState(null);
  const [d4Translations, setD4Translations] = useState(null);
  const [isLangLoading, setIsLangLoading] = useState(false);

  // Switch Language
  const handleLanguageChange = async (newLang) => {
    if (newLang === currentLang) return;
    setIsLangLoading(true);
    setCurrentLang(newLang);
    localStorage.setItem('kundali_hub_lang', newLang);

    const newParams = new URLSearchParams(searchParams);
    newParams.set('lang', newLang);
    setSearchParams(newParams);

    try {
      const res = await axios.get(`${API_BASE_URL}/translate/kundali-hub/${newLang}`);
      if (res.data?.success && res.data?.data) {
        setTranslations(res.data.data);
      }
    } catch (e) {
      console.warn("Language load failed:", e);
    } finally {
      setIsLangLoading(false);
    }
  };

  // Load General UI Dictionary, Planet Translations & D4 Database Interpretations
  useEffect(() => {
    if (!currentLang || currentLang === 'en') {
      setTranslations(null);
      setD4Translations(null);
      return;
    }

    const loadDictionaryAndD4 = async () => {
      setIsLangLoading(true);
      try {
        // 1. Astro Dictionary
        const localCacheKey = `astro_dict_${currentLang}`;
        const cached = localStorage.getItem(localCacheKey);
        if (cached) {
          setTranslations(JSON.parse(cached));
        } else {
          const res = await axios.get(`${API_BASE_URL}/translate/astro-dictionary/${currentLang}`);
          if (res.data?.success && res.data?.data) {
            setTranslations(res.data.data);
            localStorage.setItem(localCacheKey, JSON.stringify(res.data.data));
          }
        }

        // 2. D4 Chaturthamsha Database Interpretations
        const d4CacheKey = `d4_chaturthamsha_trans_${currentLang}`;
        const cachedD4 = localStorage.getItem(d4CacheKey);
        if (cachedD4) {
          setD4Translations(JSON.parse(cachedD4));
        } else {
          const d4Res = await axios.get(`${API_BASE_URL}/translate/d4-chaturthamsha/${currentLang}`);
          if (d4Res.data?.success && d4Res.data?.data) {
            setD4Translations(d4Res.data.data);
            localStorage.setItem(d4CacheKey, JSON.stringify(d4Res.data.data));
          }
        }
      } catch (err) {
        console.warn(`Could not load translations for ${currentLang}:`, err.message);
      } finally {
        setIsLangLoading(false);
      }
    };

    loadDictionaryAndD4();
  }, [currentLang]);

  // Fetch Chart Data
  useEffect(() => {
    fetchData();
  }, [date, time, lat, lon, tzOffset]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    // 1. Try reading cached data from sessionStorage / localStorage
    try {
      const cached = sessionStorage.getItem('lastGeneratedKundali') || localStorage.getItem('worksheetData');
      if (cached) {
        const parsed = JSON.parse(cached);
        const candidate = parsed.reportData || parsed;
        if (candidate && candidate.charts) {
          setReportData(candidate);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not read cached reportData', e);
    }

    // 2. Fetch from Vedic backend
    try {
      const response = await axios.post((PYTHON_ASTRO_URL.includes('/api/kundali') ? `${PYTHON_ASTRO_URL}/report/data` : `${PYTHON_ASTRO_URL}/api/report/data`), {
        name,
        date,
        time,
        lat,
        lon,
        tz_offset: tzOffset,
      }, { timeout: 15000 });

      if (response.data && response.data.charts) {
        setReportData(response.data);
      } else {
        throw new Error('No chart data received from astrology engine.');
      }
    } catch (err) {
      console.warn('Failed primary report/data endpoint, trying fallback /api/kundali...', err);
      try {
        const fallbackRes = await axios.post((PYTHON_ASTRO_URL.includes('/api/kundali') ? `${PYTHON_ASTRO_URL}/calc` : `${PYTHON_ASTRO_URL}/api/kundali`), {
          date,
          time,
          lat,
          lon,
          tz_offset: tzOffset,
        });

        if (fallbackRes.data && fallbackRes.data.houses) {
          const formatted = {
            basic_details: { name, date, time, lat, lon, tz_offset: tzOffset, place: locationName },
            charts: fallbackRes.data,
            planet_positions: Object.entries(fallbackRes.data.planet_positions || {}).map(([pName, pObj]) => {
              if (typeof pObj === 'object') {
                return {
                  planet: pName,
                  degree: pObj.sidereal?.lon || pObj.lon || 0,
                  nakshatra: pObj.sidereal?.nakshatra || pObj.nakshatra || 'Ashwini',
                  nakshatra_pada: pObj.nakshatra_pada || pObj.pada || 1,
                  sign_lord: pObj.sidereal?.sign_lord || pObj.sign_lord || 'Mars',
                  is_retrograde: pObj.is_retrograde,
                  is_combust: pObj.is_combust,
                  house: pObj.house || 1,
                };
              }
              return {
                planet: pName,
                degree: Number(pObj),
                nakshatra: 'Ashwini',
                nakshatra_pada: 1,
                sign_lord: 'Mars',
                house: 1
              };
            })
          };
          setReportData(formatted);
        } else {
          throw new Error('Both calculation endpoints failed.');
        }
      } catch (fErr) {
        setError('Failed to compute D4 Chaturthamsha Kundali. Please make sure the astrology backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Audio Playback
  useEffect(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('/sounds/swasti_vachan_mantra.mp3');
        audioRef.current.loop = true;
      }
      audioRef.current.volume = 0.65;
      audioRef.current.play().catch(e => console.log('Audio autoplay prevented:', e));
    } catch (err) {
      console.log('Audio error:', err);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isAudioMuted) {
      audioRef.current.play().catch(() => { });
      setIsAudioMuted(false);
    } else {
      audioRef.current.pause();
      setIsAudioMuted(true);
    }
  };

  // Compute D4 Chaturthamsha
  const basePlanets = reportData?.planet_positions || [];
  const baseAscDeg = reportData?.charts?.ascendant_deg !== undefined
    ? reportData.charts.ascendant_deg
    : (reportData?.charts?.houses?.[1]?.cusp_deg || 0);

  const {
    d4Houses,
    d4PlanetPositions
  } = calculateD4Chaturthamsha(basePlanets, baseAscDeg, currentLang);

  const tableI18n = D4_TABLE_I18N[currentLang] || D4_TABLE_I18N['hi'] || D4_TABLE_I18N['en'];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white px-4">
        <div className="relative mb-6">
          <div className="w-20 h-20 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <Building className="w-8 h-8 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
        </div>
        <h2 className="text-xl md:text-2xl font-serif font-black tracking-wide text-emerald-200">
          Synthesizing D4 Chaturthamsha (चतुर्थांश कुंडली)...
        </h2>
        <p className="text-sm text-slate-400 mt-2">Computing Parashara 4-fold divisions, deities, property & fixed assets</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4">
        <div className="p-4 bg-red-950/50 border border-red-500/40 rounded-2xl max-w-md text-center">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-red-200">Calculation Error</h3>
          <p className="text-sm text-red-300 mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition"
          >
            Retry Calculation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/30">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif font-black text-slate-900 text-base md:text-lg flex items-center gap-2">
                D4 Chaturthamsha Chart
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  अचल संपत्ति व भाग्य
                </span>
              </h1>
              <p className="text-[16px] text-slate-900 font-medium hidden sm:block">
                {name} • {date} • {time} • {locationName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={toggleAudio}
              className={`p-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${!isAudioMuted
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 shadow-2xs'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/60'
                }`}
              title={isAudioMuted ? 'Play Swasti Vachan Mantra' : 'Mute Mantra'}
            >
              <Zap className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline">{isAudioMuted ? 'Play Audio' : 'Mute Audio'}</span>
            </button>

            {/* Language Selector */}
            <div className="relative">
              <select
                value={currentLang}
                onChange={(e) => handleLanguageChange(e.target.value)}
                disabled={isLangLoading}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 px-3 rounded-xl border border-slate-300 cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.native} ({l.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
              title="Print D4 Chart"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Close Window */}
            <button
              onClick={() => window.close()}
              className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition"
              title="Close Tab"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 md:px-6 py-6 space-y-6 flex-grow">
        {/* ROW 1: D4 Chart Visual + D4 Planetary Distribution Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* D4 Chart Container */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center">
            {chartStyle === 'north' ? (
              <StandaloneD1Chart
                houses={d4Houses}
                planetPositions={d4PlanetPositions}
                title="D4 Chaturthamsha Chart (चतुर्थांश कुंडली - भूमि, भवन, वाहन एवं भाग्य)"
                lang={currentLang}
                onPlanetClick={(pName) => setSelectedPlanet(pName)}
                headerExtra={
                  <div className="inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200/90 shadow-2xs items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setChartStyle('north')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${chartStyle === 'north'
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-black'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                    >
                      <span className="text-blue-600 text-[13px] leading-none">🔷</span>
                      <span>North Indian (उत्तर)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartStyle('south')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${chartStyle === 'south'
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-black'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                    >
                      <span className="text-orange-600 text-[13px] leading-none">🔶</span>
                      <span>South Indian (दक्षिण)</span>
                    </button>
                  </div>
                }
              />
            ) : (
              <SouthIndianD1Chart
                houses={d4Houses}
                planetPositions={d4PlanetPositions}
                title="D4 Chaturthamsha Chart (चतुर्थांश कुंडली - भूमि, भवन, वाहन एवं भाग्य)"
                lang={currentLang}
                onPlanetClick={(pName) => setSelectedPlanet(pName)}
                headerExtra={
                  <div className="inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200/90 shadow-2xs items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setChartStyle('north')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${chartStyle === 'north'
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-black'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                    >
                      <span className="text-blue-600 text-[13px] leading-none">🔷</span>
                      <span>North Indian (उत्तर)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartStyle('south')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${chartStyle === 'south'
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-black'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                    >
                      <span className="text-orange-600 text-[13px] leading-none">🔶</span>
                      <span>South Indian (दक्षिण)</span>
                    </button>
                  </div>
                }
              />
            )}
          </div>

          {/* D4 Planetary Positions Table Card */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col h-full">
            <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200/80 p-3.5 rounded-2xl mb-4">
              <div>
                <h2 className="text-base font-black font-serif text-slate-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-600" />
                  {tableI18n.heading}
                </h2>
                <p className="text-xs font-bold text-emerald-900 mt-0.5">
                  {tableI18n.subtitle}
                </p>
              </div>
              <span className="text-xs font-black text-emerald-950 bg-white px-2.5 py-1 rounded-full border border-emerald-300">
                16-Varga D4
              </span>
            </div>

            <div className="overflow-x-auto flex-grow max-h-[480px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[14px] font-bold uppercase tracking-wider text-black bg-slate-50/90">
                    <th className="py-3 px-3">{tableI18n.colPlanet}</th>
                    <th className="py-3 px-3">{tableI18n.colLord}</th>
                    <th className="py-3 px-3">{tableI18n.colDeity}</th>
                    <th className="py-3 px-3">{tableI18n.colSign}</th>
                    <th className="py-3 px-3">{tableI18n.colHouse}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-sm">
                  {d4PlanetPositions.map((p) => {
                    const color = PLANET_COLORS[p.planet] || "#0f172a";
                    const isSelected = selectedPlanet === p.planet;
                    const translatedPlanet = translations?.planets?.[p.planet] || p.planet;

                    return (
                      <tr
                        key={p.planet}
                        onClick={() => setSelectedPlanet(p.planet)}
                        className={`hover:bg-emerald-50/60 cursor-pointer transition ${isSelected ? "bg-emerald-100/70 font-bold" : ""}`}
                      >
                        <td className="py-3 px-3 font-sans font-bold flex items-center gap-2 text-base" style={{ color }}>
                          <span>{translatedPlanet}</span>
                        </td>
                        <td className="py-3 px-3 font-sans font-semibold text-slate-800 text-xs">
                          {p.d4Lord}
                        </td>
                        <td className="py-3 px-3 font-sans font-bold text-emerald-800 text-xs">
                          <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            {p.deity}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-sans font-semibold text-black">
                          {p.sign}
                        </td>
                        <td className="py-3 px-3 font-black text-emerald-900 text-base">
                          H{p.house || 1}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-600 font-medium">
              <span>{tableI18n.footerText}</span>
            </div>
          </div>
        </div>

        {/* ROW 2: D4 Property, Assets & Domestic Happiness Interpretations */}
        <section id="section-d4-interpretations" className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/90 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium font-serif text-slate-900 flex items-center gap-2">
                <Home className="w-5 h-5 text-emerald-600" />
                {d4Translations?.ui?.sectionTitle || "चतुर्थांश विश्लेषण (D4 - Real Estate, Assets & Domestic Bliss)"}
              </h2>
              <p className="text-[15px] font-bold text-emerald-900 mt-1">
                {d4Translations?.ui?.sectionSubtitle || "Detailed classical Parashari reading for all planets regarding land, home happiness, and material fortune"}
              </p>
            </div>
            <span className="text-[15px] font-bold text-emerald-950 bg-white px-3 py-1 rounded-full border border-emerald-300 shadow-2xs">
              9 Planetary Placements
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {d4PlanetPositions.map((p) => {
              const color = PLANET_COLORS[p.planet] || "#0f172a";
              const isSelected = selectedPlanet === p.planet;
              const translatedPlanetName = translations?.planets?.[p.planet] || p.planet;
              const houseBadgeLabel = d4Translations?.ui?.houseBadge || "House";
              const deityBadgeLabel = d4Translations?.ui?.deityLabel || "Deity";
              const partBadgeLabel = d4Translations?.ui?.partLabel || "Quarter";
              const impactBadgeLabel = d4Translations?.ui?.impactLabel || "D4 Asset Impact";

              // 1. Check translated interpretations from database
              const dbPlanetInterps = d4Translations?.interpretations?.[p.planet]?.[p.house];
              // 2. Fallback to local default interpretations
              const fallbackInterps = D4_INTERPRETATIONS[p.planet]?.[p.house] || {};
              const activeInterps = dbPlanetInterps || fallbackInterps;
              const interpText = activeInterps.positive || activeInterps.neutral || activeInterps.negative || "Provides foundational grounding and property influence in this domain.";

              return (
                <div
                  key={p.planet}
                  onClick={() => setSelectedPlanet(p.planet)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${isSelected
                    ? 'border-emerald-400 bg-emerald-50/60 shadow-md ring-2 ring-emerald-300'
                    : 'border-slate-200/90 bg-slate-50/50 hover:bg-slate-100/70 hover:border-slate-300'
                    }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 border-b border-slate-200/70 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
                        <h3 className="font-serif font-black text-slate-900 text-[16px]" style={{ color }}>
                          {translatedPlanetName}
                        </h3>
                      </div>
                      <span className="text-[15px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                        {houseBadgeLabel} {p.house} ({p.sign})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[15px] font-bold text-black mb-2.5">
                      <span>{deityBadgeLabel}: {p.deity}</span>
                      <span>•</span>
                      <span>{partBadgeLabel}: {p.d4Part}/4</span>
                    </div>

                    <p className="text-[16px] font-medium text-black leading-relaxed">
                      {interpText}
                    </p>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[14px] font-bold text-slate-900">
                    <span>Chaturthamsha Lord: {p.d4Lord}</span>
                    <span className="text-emerald-900 font-semibold">{impactBadgeLabel}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
