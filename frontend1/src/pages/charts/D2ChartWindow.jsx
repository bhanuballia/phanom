import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  Sparkles,
  Printer,
  Compass,
  Eye,
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
  Coins,
  TrendingUp,
  DollarSign,
  Sun,
  Moon,
  CheckCircle2,
  AlertTriangle,
  BookOpen
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../utils/kundaliHubStrings';
import { API_BASE_URL, PYTHON_ASTRO_URL } from '../../services/api';
import StandaloneD1Chart from '../../components/StandaloneD1Chart';
import SouthIndianD1Chart from '../../components/SouthIndianD1Chart';
import {
  PLANET_HORA_INTERPRETATIONS,
  D2_HOUSE_INTERPRETATIONS,
  CLASSICAL_HORA_GUIDELINES
} from '../../data/d2HoraInterpretations';
import { D2_BHAVAS_TITLES } from '../../data/d2BhavasTitlesMultilingual';
import { D2_SOLAR_LUNAR_DATA } from '../../data/d2SolarLunarMultilingual';
import { D2_NAV_BUTTONS } from '../../data/d2NavButtonsMultilingual';

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

// Multilingual translations for D2 Planetary Positions Table
const D2_TABLE_I18N = {
  en: {
    heading: "D2 Hora Planetary Status",
    subtitle: "Planetary distribution between Sun's Hora (Leo) & Moon's Hora (Cancer)",
    colPlanet: "Planet",
    colHoraLord: "Hora Lord",
    colHoraSign: "Hora Sign",
    colD2House: "D2 House",
  },
  hi: {
    heading: "डी2 होरा ग्रह स्थिति (D2 Hora Planetary Status)",
    subtitle: "सूर्य की होरा (सिंह) एवं चंद्रमा की होरा (कर्क) में ग्रहों का विभाजन",
    colPlanet: "ग्रह (Planet)",
    colHoraLord: "होरा स्वामी (Hora Lord)",
    colHoraSign: "होरा राशि (Hora Sign)",
    colD2House: "डी2 भाव (D2 House)",
  },
  ta: {
    heading: "டி2 ஹோரா கிரக நிலை (D2 Hora Planetary Status)",
    subtitle: "சூரிய ஹோரை (சிம்மம்) மற்றும் சந்திர ஹோரை (கடகம்) கிரகப் பகிர்வு",
    colPlanet: "கிரகம் (Planet)",
    colHoraLord: "ஹோரா அதிபதி (Hora Lord)",
    colHoraSign: "ஹோரா ராசி (Hora Sign)",
    colD2House: "டி2 பாவம் (D2 House)",
  },
  te: {
    heading: "డి2 హోరా గ్రహ స్థితి (D2 Hora Planetary Status)",
    subtitle: "సూర్య హోరా (సింహం) మరియు చంద్ర హోరా (కర్కాటకం) గ్రహాల పంపిణీ",
    colPlanet: "గ్రహం (Planet)",
    colHoraLord: "హోరా అధిపతి (Hora Lord)",
    colHoraSign: "హోరా రాశి (Hora Sign)",
    colD2House: "డి2 భావం (D2 House)",
  },
  kn: {
    heading: "ಡಿ2 ಹೋರಾ ಗ್ರಹ ಸ್ಥಿತಿ (D2 Hora Planetary Status)",
    subtitle: "ಸೂರ್ಯ ಹೋರಾ (ಸಿಂಹ) ಮತ್ತು ಚಂದ್ರ ಹೋರಾ (ಕರ್ಕಾಟಕ) ಗ್ರಹಗಳ ವಿತರಣೆ",
    colPlanet: "ಗ್ರಹ (Planet)",
    colHoraLord: "ಹೋರಾ ಅಧಿಪತಿ (Hora Lord)",
    colHoraSign: "ಹೋರಾ ರಾಶಿ (Hora Sign)",
    colD2House: "ಡಿ2 ಭಾವ (D2 House)",
  },
  gu: {
    heading: "ડી2 હોરા ગ્રહ સ્થિતિ (D2 Hora Planetary Status)",
    subtitle: "સૂર્યની હોરા (સિંહ) અને ચંદ્રની હોરા (કર્ક) માં ગ્રહોનું વિભાજન",
    colPlanet: "ગ્રહ (Planet)",
    colHoraLord: "હોરા સ્વામી (Hora Lord)",
    colHoraSign: "હોરા રાશિ (Hora Sign)",
    colD2House: "ડી2 ભાવ (D2 House)",
  },
  mr: {
    heading: "डी2 होरा ग्रह स्थिती (D2 Hora Planetary Status)",
    subtitle: "सूर्य होरा (सिंह) व चंद्र होरा (कर्क) मधील ग्रहांचे विभाजन",
    colPlanet: "ग्रह (Planet)",
    colHoraLord: "होरा स्वामी (Hora Lord)",
    colHoraSign: "होरा राशी (Hora Sign)",
    colD2House: "डी2 भाव (D2 House)",
  },
  bn: {
    heading: "ডি২ হোরা গ্রহের অবস্থান (D2 Hora Planetary Status)",
    subtitle: "সূর্যের হোরা (সিংহ) ও চন্দ্রের হোরা (কর্কট)-তে গ্রহ বণ্টন",
    colPlanet: "গ্রহ (Planet)",
    colHoraLord: "হোরা অধিপতি (Hora Lord)",
    colHoraSign: "হোরা রাশি (Hora Sign)",
    colD2House: "ডি২ ভাব (D2 House)",
  },
  ml: {
    heading: "ഡി2 ഹോരാ ഗ്രഹനില (D2 Hora Planetary Status)",
    subtitle: "സൂര്യ ഹോര (ചിങ്ങം), ചന്ദ്ര ഹോര (കർക്കടകം) ഗ്രഹ വിന്യാസം",
    colPlanet: "ഗ്രഹം (Planet)",
    colHoraLord: "ഹോരാ നാഥൻ (Hora Lord)",
    colHoraSign: "ഹോരാ രാശി (Hora Sign)",
    colD2House: "ഡി2 ഭാവം (D2 House)",
  },
  pa: {
    heading: "ਡੀ2 ਹੋਰਾ ਗ੍ਰਹਿ ਸਥਿਤੀ (D2 Hora Planetary Status)",
    subtitle: "ਸੂਰਜ ਦੀ ਹੋਰਾ (ਸਿੰਘ) ਅਤੇ ਚੰਦਰਮਾ ਦੀ ਹੋਰਾ (ਕਰਕ) ਵਿੱਚ ਗ੍ਰਹਿਆਂ ਦੀ ਵੰਡ",
    colPlanet: "ਗ੍ਰਹਿ (Planet)",
    colHoraLord: "ਹੋਰਾ ਸੁਆਮੀ (Hora Lord)",
    colHoraSign: "ਹੋਰਾ ਰਾਸ਼ੀ (Hora Sign)",
    colD2House: "ਡੀ2 ਭਾਵ (D2 House)",
  },
  sa: {
    heading: "डी२ होरा ग्रह स्थितिः (D2 Hora Planetary Status)",
    subtitle: "सूर्यहोरा (सिंह) तथा चन्द्रहोरा (कर्क) ग्रहविभागः",
    colPlanet: "ग्रहः (Planet)",
    colHoraLord: "होरास्वामी (Hora Lord)",
    colHoraSign: "होराराशिः (Hora Sign)",
    colD2House: "डी२ भावः (D2 House)",
  }
};

// Sign Names and Lords
const SIGN_NAMES_EN = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const SIGN_NAMES_HI = ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"];

/**
 * Calculates D2 Hora chart based on classical Parashara rule:
 * In odd signs (Aries, Gemini, Leo, Libra, Sag, Aqua):
 *   - 0° - 15°: Sun's Hora (Leo = Sign Index 4)
 *   - 15° - 30°: Moon's Hora (Cancer = Sign Index 3)
 * In even signs (Taurus, Cancer, Virgo, Scorpio, Cap, Pisces):
 *   - 0° - 15°: Moon's Hora (Cancer = Sign Index 3)
 *   - 15° - 30°: Sun's Hora (Leo = Sign Index 4)
 */
function calculateD2Hora(basePlanets = [], baseAscDeg = 0) {
  const getHoraSignIndex = (totalDeg) => {
    const normDeg = ((totalDeg % 360) + 360) % 360;
    const signIdx = Math.floor(normDeg / 30); // 0 = Aries, 1 = Taurus, ...
    const degInSign = normDeg % 30;
    const isOddSign = (signIdx % 2 === 0); // 0 (Aries), 2 (Gemini), 4 (Leo)... are odd signs (1st, 3rd, 5th)

    if (isOddSign) {
      return degInSign < 15 ? 4 : 3; // 4 = Leo (Sun), 3 = Cancer (Moon)
    } else {
      return degInSign < 15 ? 3 : 4; // 3 = Cancer (Moon), 4 = Leo (Sun)
    }
  };

  const ascHoraSign = getHoraSignIndex(baseAscDeg);

  // Compute 12 houses starting from Ascendant's Hora sign
  const d2Houses = {};
  for (let h = 1; h <= 12; h++) {
    const signIndex = (ascHoraSign + (h - 1)) % 12;
    d2Houses[h] = {
      sign_index: signIndex,
      planets: []
    };
  }

  // Place planets into D2 houses
  const d2PlanetPositions = [];
  const solarWealthPlanets = [];
  const lunarWealthPlanets = [];

  basePlanets.forEach((p) => {
    const pDeg = Number(p.degree !== undefined ? p.degree : p.lon || 0);
    const pHoraSign = getHoraSignIndex(pDeg);

    // Calculate house offset from Ascendant hora sign (1-indexed)
    let houseNum = ((pHoraSign - ascHoraSign + 12) % 12) + 1;

    const horaType = pHoraSign === 4 ? 'Sun' : 'Moon';
    if (horaType === 'Sun') {
      solarWealthPlanets.push(p.planet);
    } else {
      lunarWealthPlanets.push(p.planet);
    }

    const pCopy = {
      ...p,
      house: houseNum,
      sign_index: pHoraSign,
      sign: SIGN_NAMES_EN[pHoraSign],
      horaType,
      horaLord: pHoraSign === 4 ? 'Sun (सूर्य)' : 'Moon (चंद्र)'
    };

    d2PlanetPositions.push(pCopy);

    if (d2Houses[houseNum]) {
      d2Houses[houseNum].planets.push(pCopy);
    }
  });

  return {
    d2Houses,
    d2PlanetPositions,
    ascHoraSign,
    solarWealthPlanets,
    lunarWealthPlanets
  };
}

export default function D2ChartWindow() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [showFloatingBanner, setShowFloatingBanner] = useState(false);
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
  const [d2Translations, setD2Translations] = useState(null);
  const [isLangLoading, setIsLangLoading] = useState(false);

  useEffect(() => {
    if (urlLang && urlLang !== currentLang) {
      setCurrentLang(urlLang);
    }
  }, [urlLang]);

  useEffect(() => {
    fetchData();
  }, [date, time, lat, lon, tzOffset]);

  // Load General UI Dictionary & D2 Hora Database Translations
  useEffect(() => {
    if (!currentLang || currentLang === 'en') {
      setTranslations(null);
      setD2Translations(null);
      return;
    }

    const loadDictionary = async () => {
      setIsLangLoading(true);
      try {
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

        // Fetch D2 Hora Interpretation from MongoDB
        const d2LocalKey = `d2_hora_trans_${currentLang}`;
        const d2Cached = localStorage.getItem(d2LocalKey);
        let validCached = null;
        if (d2Cached) {
          try {
            const parsed = JSON.parse(d2Cached);
            // Verify cache has planets, houses, guidelines, bhavasTitles, and solarLunar
            if (
              parsed &&
              parsed.planets &&
              Object.keys(parsed.planets).length >= 9 &&
              parsed.houses &&
              Object.keys(parsed.houses).length >= 12 &&
              Array.isArray(parsed.guidelines) &&
              parsed.guidelines.length >= 3 &&
              parsed.bhavasTitles &&
              Object.keys(parsed.bhavasTitles).length >= 12 &&
              parsed.solarLunar &&
              parsed.solarLunar.sectionTitle
            ) {
              validCached = parsed;
              setD2Translations(parsed);
            }
          } catch (e) { }
        }

        if (!validCached) {
          const d2Res = await axios.get(`${API_BASE_URL}/translate/d2-hora/${currentLang}`);
          if (
            d2Res.data?.success &&
            d2Res.data?.data &&
            d2Res.data.data.planets &&
            Object.keys(d2Res.data.data.planets).length >= 9 &&
            d2Res.data.data.houses &&
            Object.keys(d2Res.data.data.houses).length >= 12 &&
            Array.isArray(d2Res.data.data.guidelines) &&
            d2Res.data.data.guidelines.length >= 3 &&
            d2Res.data.data.bhavasTitles &&
            Object.keys(d2Res.data.data.bhavasTitles).length >= 12 &&
            d2Res.data.data.solarLunar &&
            d2Res.data.data.solarLunar.sectionTitle
          ) {
            setD2Translations(d2Res.data.data);
            localStorage.setItem(d2LocalKey, JSON.stringify(d2Res.data.data));
          } else {
            // Trigger on-demand translation & DB persistence
            const langObj = SUPPORTED_LANGUAGES.find(l => l.code === currentLang);
            const genRes = await axios.post(`${API_BASE_URL}/translate/d2-hora`, {
              targetLang: currentLang,
              targetLangName: langObj?.name || currentLang,
              planets: PLANET_HORA_INTERPRETATIONS,
              houses: D2_HOUSE_INTERPRETATIONS,
              guidelines: CLASSICAL_HORA_GUIDELINES
            });
            if (genRes.data?.success && genRes.data?.data) {
              setD2Translations(genRes.data.data);
              localStorage.setItem(d2LocalKey, JSON.stringify(genRes.data.data));
            }
          }
        }
      } catch (err) {
        console.warn(`Could not load translations for ${currentLang}:`, err.message);
      } finally {
        setIsLangLoading(false);
      }
    };

    loadDictionary();
  }, [currentLang]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    // 1. Try reading cached data from sessionStorage
    try {
      const cached = sessionStorage.getItem('lastGeneratedKundali');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.reportData && parsed.reportData.charts) {
          setReportData(parsed.reportData);
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
        setError('Failed to compute D2 Hora Kundali. Please make sure the astrology backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Swasti Mantra audio lifecycle
  useEffect(() => {
    if (loading) {
      try {
        if (!audioRef.current) {
          audioRef.current = new Audio('/sounds/swasti_vachan_mantra.mp3');
          audioRef.current.loop = true;
        }
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 0.8;
        audioRef.current.play().catch((err) => {
          console.warn('Mantra audio autoplay pending user gesture:', err.message);
        });
      } catch (err) {
        console.warn('Audio initialization notice:', err);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      try {
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          const bc = new BroadcastChannel('kundali_generation_channel');
          bc.postMessage('KUNDALI_GENERATED');
          bc.close();
        }
      } catch (e) { }
      try {
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage('KUNDALI_GENERATED', '*');
        }
      } catch (e) { }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [loading]);

  const handlePrint = () => {
    window.print();
  };

  // Loading View
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center text-white p-6 relative overflow-hidden select-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
          <button
            type="button"
            onClick={() => {
              if (audioRef.current) {
                if (isAudioMuted) {
                  audioRef.current.muted = false;
                  setIsAudioMuted(false);
                } else {
                  audioRef.current.muted = true;
                  setIsAudioMuted(true);
                }
              }
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition shadow-sm ${isAudioMuted
              ? 'bg-rose-500/20 border-rose-400/50 text-rose-300 hover:bg-rose-500/30'
              : 'bg-amber-500/20 border-amber-400/50 text-amber-300 hover:bg-amber-500/30 animate-pulse'
              }`}
          >
            {isAudioMuted ? '🔇 Unmute Mantra' : '🔊 Mantra Playing'}
          </button>

          <button
            type="button"
            onClick={() => window.close()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/50 text-rose-300 rounded-full text-xs font-bold transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" /> Close
          </button>
        </div>

        <div className="relative text-center max-w-md mx-auto z-10 flex flex-col items-center">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full border-2 border-amber-400/30 flex items-center justify-center animate-[spin_12s_linear_infinite]">
              <div className="w-20 h-20 rounded-full border-2 border-amber-400/60 flex items-center justify-center"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center text-4xl">
              💰
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-serif font-black tracking-wide text-amber-300 mb-2">
            Calculating D2 Hora Chart
          </h2>
          <p className="text-xs text-amber-200/80 font-serif italic mb-6 max-w-sm leading-relaxed">
            "ॐ स्वस्ति न इन्द्रो वृद्धश्रवाः स्वस्ति नः पूषा विश्ववेदाः..."
          </p>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full text-xs text-slate-300 flex items-center justify-center gap-2.5 backdrop-blur-sm">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin"></div>
            <span>Evaluating Wealth, Solar vs Lunar Hora & Financial Destiny</span>
          </div>
        </div>
      </div>
    );
  }

  // Error View
  if (error || !reportData) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6">
        <div className="bg-slate-800 border border-rose-500/40 p-6 rounded-2xl max-w-md text-center space-y-4">
          <p className="text-rose-400 font-bold">{error || 'Unable to compute D2 chart data.'}</p>
          <button
            onClick={() => fetchData()}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition"
          >
            Retry Calculation
          </button>
        </div>
      </div>
    );
  }

  // Extract base planets & calculate D2 Hora
  const basePlanets = reportData.planet_positions || [];
  const ascObj = basePlanets.find(p => p.planet === 'Ascendant' || p.planet === 'Lagna');
  const ascDegree = ascObj ? (Number(ascObj.degree) || 0) : 0;

  const {
    d2Houses,
    d2PlanetPositions,
    ascHoraSign,
    solarWealthPlanets,
    lunarWealthPlanets
  } = calculateD2Hora(basePlanets, ascDegree);

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 font-black text-lg shrink-0">
            D2
          </div>
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-serif font-black tracking-tight text-slate-900 truncate flex items-center gap-2">
              <span>{name}</span>
              <span className="text-xs font-sans font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                D2 Hora (होरा चक्र)
              </span>
            </h1>
            <p className="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 font-semibold text-black"><Calendar className="w-3 h-3 text-amber-700" /> {date}</span>
              <span className="flex items-center gap-1 font-semibold text-black"><Clock className="w-3 h-3 text-amber-700" /> {time}</span>
              <span className="flex items-center gap-1 font-semibold text-black"><MapPin className="w-3 h-3 text-amber-700" /> {locationName}</span>
            </p>
          </div>
        </div>

        {/* Center: Talk To Astrologer */}
        <div className="flex items-center justify-center my-1 md:my-0">
          <a
            href="/live-astrologers"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center gap-2.5 px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs md:text-sm rounded-full shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 border border-amber-300/40"
            title="Connect with verified Vedic Astrologers live"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            <PhoneCall className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            <span className="tracking-wide uppercase font-black text-xs md:text-sm">Consult Astrologer</span>
            <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider hidden sm:inline-block">
              LIVE
            </span>
          </a>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="relative flex items-center">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition shadow-2xs">
              <Globe className={`w-3.5 h-3.5 text-amber-700 ${isLangLoading ? 'animate-spin' : ''}`} />
              <select
                value={currentLang}
                onChange={(e) => {
                  const newLang = e.target.value;
                  setCurrentLang(newLang);
                  localStorage.setItem('kundali_hub_lang', newLang);
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    next.set('lang', newLang);
                    return next;
                  }, { replace: true });
                }}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="text-slate-900 bg-white">
                    {lang.native} ({lang.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-50 text-black text-xs font-bold rounded-xl border border-slate-300 shadow-2xs transition"
          >
            <Printer className="w-3.5 h-3.5 text-amber-700" />
            {translations?.ui?.printPdf || 'Print / Save PDF'}
          </button>
          <button
            onClick={() => window.close()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 shadow-2xs transition"
          >
            <X className="w-3.5 h-3.5 text-rose-600" />
            {translations?.ui?.closeWindow || 'Close Window'}
          </button>
        </div>
      </header>

      {/* Quick Jump Bar */}
      {(() => {
        const nav = D2_NAV_BUTTONS[currentLang] || D2_NAV_BUTTONS['hi'] || D2_NAV_BUTTONS['en'];
        return (
          <nav className="sticky top-[61px] z-30 bg-white/95 backdrop-blur-md px-6 py-2 border-b border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[12px] font-black uppercase text-slate-700 tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-amber-600" /> {nav.jumpTo}
            </span>
            <button
              onClick={() => document.getElementById('section-d2-chart')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition shrink-0"
            >
              {nav.d2Chart}
            </button>
            <button
              onClick={() => document.getElementById('section-solar-lunar-wealth')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-900 border border-orange-300 hover:bg-orange-100 transition shrink-0"
            >
              {nav.solarLunar}
            </button>
            <button
              onClick={() => document.getElementById('section-d2-houses')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-300 hover:bg-emerald-100 transition shrink-0"
            >
              {nav.horaBhavas}
            </button>
            <button
              onClick={() => document.getElementById('section-wealth-guide')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-900 border border-purple-300 hover:bg-purple-100 transition shrink-0"
            >
              {nav.guidelines}
            </button>
            <button
              onClick={() => document.getElementById('section-planet-hora-interpretations')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-900 border border-indigo-300 hover:bg-indigo-100 transition shrink-0"
            >
              {nav.planetInterp}
            </button>
            <button
              onClick={() => document.getElementById('section-d2-house-interpretations')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-900 border border-rose-300 hover:bg-rose-100 transition shrink-0"
            >
              {nav.houseForecasts}
            </button>
          </nav>
        );
      })()}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 pt-4 pb-8 space-y-6 bg-white text-black">
        {/* ROW 1: Chart & Planetary Hora Distribution */}
        <div id="section-d2-chart" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start scroll-mt-20">
          {/* D2 SVG Chart Card */}
          <div className="lg:col-span-7 bg-white p-4 md:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center">
            {chartStyle === 'north' ? (
              <StandaloneD1Chart
                houses={d2Houses}
                planetPositions={d2PlanetPositions}
                title="D2 Hora Chart (होरा कुंडली - धन व संपदा)"
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
                houses={d2Houses}
                planetPositions={d2PlanetPositions}
                title="D2 Hora Chart (होरा कुंडली - धन व संपदा)"
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

          {/* D2 Planetary Positions Table */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col h-full">
            {(() => {
              const tableI18n = D2_TABLE_I18N[currentLang] || D2_TABLE_I18N['hi'] || D2_TABLE_I18N['en'];
              return (
                <>
                  <div className="flex justify-between items-center bg-amber-50 border border-amber-200/80 p-3.5 rounded-2xl mb-4">
                    <div>
                      <h2 className="text-base font-black font-serif text-slate-900 flex items-center gap-2">
                        <Coins className="w-4 h-4 text-amber-600" />
                        {tableI18n.heading}
                      </h2>
                      <p className="text-xs font-bold text-amber-900 mt-0.5">
                        {tableI18n.subtitle}
                      </p>
                    </div>
                    <span className="text-xs font-black text-amber-950 bg-white px-2.5 py-1 rounded-full border border-amber-300">
                      16-Varga D2
                    </span>
                  </div>

                  <div className="overflow-x-auto flex-grow max-h-[480px]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-[14px] font-bold uppercase tracking-wider text-black bg-slate-50/90">
                          <th className="py-3 px-3">{tableI18n.colPlanet}</th>
                          <th className="py-3 px-3">{tableI18n.colHoraLord}</th>
                          <th className="py-3 px-3">{tableI18n.colHoraSign}</th>
                          <th className="py-3 px-3">{tableI18n.colD2House}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-sm">
                        {d2PlanetPositions.map((p) => {
                          const color = PLANET_COLORS[p.planet] || "#0f172a";
                          const isSelected = selectedPlanet === p.planet;
                          const translatedPlanet = translations?.planets?.[p.planet] || p.planet;

                          return (
                            <tr
                              key={p.planet}
                              onClick={() => setSelectedPlanet(p.planet)}
                              className={`hover:bg-amber-50/60 cursor-pointer transition ${isSelected ? "bg-amber-100/70 font-bold" : ""}`}
                            >
                              <td className="py-3 px-3 font-sans font-bold flex items-center gap-2 text-base" style={{ color }}>
                                <span>{translatedPlanet}</span>
                              </td>
                              <td className="py-3 px-3 font-sans font-semibold text-black">
                                {p.horaType === 'Sun' ? (
                                  <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full text-xs font-bold">
                                    <Sun className="w-3 h-3 text-amber-600" /> Sun (सूर्य)
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full text-xs font-bold">
                                    <Moon className="w-3 h-3 text-blue-600" /> Moon (चंद्र)
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3 font-sans font-semibold text-black">
                                {p.sign} {p.horaType === 'Sun' ? '(Leo / सिंह)' : '(Cancer / कर्क)'}
                              </td>
                              <td className="py-3 px-3 font-black text-amber-900 text-base">
                                H{p.house || 1}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-600 font-medium flex justify-between flex-wrap gap-2">
                    <span>{d2Translations?.solarLunar?.tableFooterSun || D2_SOLAR_LUNAR_DATA[currentLang]?.tableFooterSun || "Sun Hora: Self-effort, Enterprise, Leadership"}</span>
                    <span>{d2Translations?.solarLunar?.tableFooterMoon || D2_SOLAR_LUNAR_DATA[currentLang]?.tableFooterMoon || "Moon Hora: Inheritance, Luck, Partnerships"}</span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* ROW 2: Solar vs Lunar Wealth Dynamics */}
        {(() => {
          const slData = d2Translations?.solarLunar || D2_SOLAR_LUNAR_DATA[currentLang] || D2_SOLAR_LUNAR_DATA['hi'] || D2_SOLAR_LUNAR_DATA['en'] || {};
          return (
            <section id="section-solar-lunar-wealth" className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5 scroll-mt-24">
              <div className="bg-orange-50 border border-orange-200/80 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black font-serif text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                    {slData.sectionTitle || "Solar vs Lunar Wealth Accumulation (सौर एवं चंद्र होरा विश्लेषण)"}
                  </h2>
                  <p className="text-sm font-semibold text-orange-950/80 mt-0.5">
                    {slData.sectionSubtitle || "Sage Parashara divides human financial destiny into Solar (hard work, administration) and Lunar (comfort, emotional wealth, assets)."}
                  </p>
                </div>
                <span className="text-xs font-bold text-orange-900 bg-white px-3 py-1.5 rounded-full border border-orange-200 shadow-xs">
                  {slData.dualitiesBadge || "Hora Dualities"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Solar Hora Box */}
                <div className="p-5 rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50/70 to-orange-50/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-base">
                      <Sun className="w-5 h-5 text-amber-600" />
                      <span>{slData.solarBoxTitle || "Sun's Hora (सूर्य होरा - Leo / सिंह)"}</span>
                    </div>
                    <span className="text-[14px] font-extrabold px-2.5 py-1 rounded-full bg-amber-200 text-amber-950">
                      {solarWealthPlanets.length} {slData.solarPlanetsBadge || "Planets"}
                    </span>
                  </div>
                  <p className="text-[14px] text-black leading-relaxed">
                    {slData.solarDesc || "Represents wealth generated through independent initiative, leadership, high enterprise, government favor, administrative status, and personal sweat."}
                  </p>
                  <div className="pt-2">
                    <span className="text-xs font-bold text-slate-800">{slData.solarPlanetsLabel || "Planets in Solar Hora:"}</span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {solarWealthPlanets.length > 0 ? (
                        solarWealthPlanets.map(p => (
                          <span key={p} className="text-xs font-bold bg-white text-amber-900 px-2.5 py-1 rounded-lg border border-amber-300 shadow-2xs">
                            {p}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs italic text-slate-500">{slData.solarNoneLabel || "None in Solar Hora"}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lunar Hora Box */}
                <div className="p-5 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50/70 to-indigo-50/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-900 font-bold text-base">
                      <Moon className="w-5 h-5 text-blue-600" />
                      <span>{slData.lunarBoxTitle || "Moon's Hora (चंद्र होरा - Cancer / कर्क)"}</span>
                    </div>
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-blue-200 text-blue-950">
                      {lunarWealthPlanets.length} {slData.lunarPlanetsBadge || "Planets"}
                    </span>
                  </div>
                  <p className="text-[14px] text-black leading-relaxed">
                    {slData.lunarDesc || "Represents wealth acquired smoothly through family lineage, ancestral inheritance, maternal blessings, public popularity, liquid capital, and emotional satisfaction."}
                  </p>
                  <div className="pt-2">
                    <span className="text-[14px] font-bold text-slate-900">{slData.lunarPlanetsLabel || "Planets in Lunar Hora:"}</span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {lunarWealthPlanets.length > 0 ? (
                        lunarWealthPlanets.map(p => (
                          <span key={p} className="text-xs font-bold bg-white text-blue-900 px-2.5 py-1 rounded-lg border border-blue-300 shadow-2xs">
                            {p}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs italic text-slate-500">{slData.lunarNoneLabel || "None in Lunar Hora"}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })()}

        {/* ROW 3: 12 Hora Bhavas */}
        <section id="section-d2-houses" className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5 scroll-mt-24">
          <div className="bg-emerald-50 border border-emerald-200/80 p-4 rounded-2xl flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-black font-serif text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                {d2Translations?.ui?.bhavasGridTitle || "12 Bhavas of D2 Hora Chart (द्वादश भाव एवं धन स्रोत)"}
              </h2>
              <p className="text-sm font-semibold text-emerald-950/80 mt-0.5">
                {d2Translations?.ui?.bhavasGridSubtitle || "Houses in D2 reflect specific avenues of wealth, savings, expenditure, and liquid resources."}
              </p>
            </div>
            <span className="text-[14px] font-bold text-emerald-900 bg-white px-3 py-1.5 rounded-full border border-emerald-200 shadow-xs">
              {translations?.ui?.activeBhavas || "12 Bhavas"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((hNum) => {
              const hData = d2Houses[hNum] || {};
              const rawPlanets = hData.planets || [];
              const signIdx = hData.sign_index !== undefined ? hData.sign_index : ((hNum - 1) % 12);
              const signKey = SIGN_NAMES_EN[signIdx % 12];
              const translatedSign = translations?.signs?.[signKey] || SIGN_NAMES_HI[signIdx % 12];
              const signDisplay = `${signKey} (${translatedSign})`;
              const occupants = rawPlanets.map(p => translations?.planets?.[p.planet] || p.planet || p.name);

              // Multilingual house signification meaning from MongoDB d2Translations or D2_BHAVAS_TITLES
              const dbTitle = d2Translations?.bhavasTitles?.[hNum] || d2Translations?.bhavasTitles?.[String(hNum)];
              const houseTitleObj = D2_BHAVAS_TITLES[hNum] || {};
              const houseMeaning = dbTitle || houseTitleObj[currentLang] || houseTitleObj['hi'] || houseTitleObj['en'] || 'Wealth Avenue';

              const isSunSign = signIdx === 4;

              return (
                <div key={hNum} className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-amber-500 hover:shadow-xs transition shadow-2xs">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[14px] font-black font-mono px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                      {d2Translations?.ui?.houseLabel || translations?.ui?.houseLabel || 'House'} {hNum}
                    </span>
                    <span className={`text-[14px] font-bold px-2 py-0.5 rounded-full border ${isSunSign ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-blue-100 text-blue-900 border-blue-300'
                      }`}>
                      {isSunSign ? (d2Translations?.ui?.sunSignLabel || translations?.ui?.sunSignLabel || 'Sun Sign / सिंह') : (d2Translations?.ui?.moonSignLabel || translations?.ui?.moonSignLabel || 'Moon Sign / कर्क')}
                    </span>
                  </div>
                  <div className="text-[16px] font-bold text-amber-950 mb-1 leading-snug">{houseMeaning}</div>
                  <div className="text-[14px] font-black text-black">{signDisplay}</div>
                  <div className="mt-2.5 text-[14px] text-slate-900 font-medium">
                    <span className="text-slate-900 font-semibold">{d2Translations?.ui?.planetsLabel || translations?.ui?.planetsLabel || 'Occupants'}: </span>
                    {occupants.length > 0 ? (
                      <span className="font-bold text-black text-[14px] bg-amber-100/70 px-2 py-0.5 rounded border border-amber-300 inline-block mt-0.5">
                        {occupants.join(', ')}
                      </span>
                    ) : (
                      <span className="italic text-slate-900 font-normal">{d2Translations?.ui?.noneOccupants || translations?.ui?.noneOccupants || 'Empty'}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ROW 4: Classical Parashari Hora Guidelines */}
        <section id="section-wealth-guide" className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4 scroll-mt-24">
          <div className="bg-purple-50 border border-purple-200/80 p-4 rounded-2xl flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-black font-serif text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                {d2Translations?.ui?.guidelinesTitle || "Classical Parashari Hora Guidelines (बृहत्पाराशर होरा शास्त्र)"}
              </h2>
              <p className="text-sm font-semibold text-purple-950/80 mt-0.5">
                {d2Translations?.ui?.guidelinesSubtitle || "Key Vedic principles for interpreting financial abundance and resource security"}
              </p>
            </div>
            <span className="text-[14px] font-bold text-purple-900 bg-white px-3 py-1.5 rounded-full border border-purple-200 shadow-xs">
              {d2Translations?.ui?.rulesBadge || "Vedic Rules"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[14px] text-slate-900 leading-relaxed">
            {(Array.isArray(d2Translations?.guidelines) && d2Translations.guidelines.length > 0
              ? d2Translations.guidelines
              : CLASSICAL_HORA_GUIDELINES
            ).map((item, idx) => (
              <div key={item.id || idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1.5 hover:border-purple-300 transition shadow-2xs">
                <strong className="text-slate-900 text-[16px] block">
                  {item.title}
                </strong>
                <p className="leading-relaxed text-[16px] text-black">
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ROW 5: Detailed Planet-by-Planet D2 Hora Interpretations */}
        <section id="section-planet-hora-interpretations" className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6 scroll-mt-24">
          <div className="bg-indigo-50 border border-indigo-200/80 p-4 rounded-2xl flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                🔮
              </div>
              <div>
                <h2 className="text-lg font-black font-serif text-slate-900 flex items-center gap-2">
                  D2 Planetary Hora Interpretations (ग्रह-होरा फल विश्लेषण)
                </h2>
                <p className="text-[16px] font-semibold text-indigo-900 mt-0.5">
                  Detailed Vedic reading based on whether each planet is in Sun's Solar Hora (Leo) or Moon's Lunar Hora (Cancer)
                </p>
              </div>
            </div>
            <span className="text-[14px] font-bold text-indigo-950 bg-white px-3 py-1.5 rounded-full border border-indigo-300 shadow-xs">
              {d2PlanetPositions.length} Planetary Influences
            </span>
          </div>

          <div className="space-y-5">
            {d2PlanetPositions.map((p) => {
              // Priority: 1. MongoDB translated data for current language, 2. Default constant
              const pData = d2Translations?.planets?.[p.planet] || PLANET_HORA_INTERPRETATIONS[p.planet];
              if (!pData) return null;
              const horaReading = p.horaType === 'Sun' ? pData.Solar : pData.Lunar;
              if (!horaReading) return null;

              const isSunHora = p.horaType === 'Sun';
              const pColor = PLANET_COLORS[p.planet] || '#1e293b';
              const translatedPlanetName = translations?.planets?.[p.planet] || p.planet;

              const natureBadge = {
                highly_favorable: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                highest_fortune: 'bg-emerald-100 text-emerald-950 border-emerald-400 font-black',
                favorable: 'bg-teal-100 text-teal-900 border-teal-300',
                moderate: 'bg-amber-100 text-amber-900 border-amber-300',
                challenging: 'bg-rose-100 text-rose-900 border-rose-300',
                challenging_to_solid: 'bg-slate-200 text-slate-900 border-slate-400',
                volatile_ambitious: 'bg-purple-100 text-purple-900 border-purple-300',
                unconventional_liquid: 'bg-blue-100 text-blue-900 border-blue-300',
                spiritual_detached: 'bg-indigo-100 text-indigo-900 border-indigo-300',
                spiritual_subtle: 'bg-sky-100 text-sky-900 border-sky-300'
              }[horaReading.nature] || 'bg-slate-100 text-slate-800 border-slate-300';

              return (
                <div
                  key={p.planet}
                  className={`p-5 md:p-6 rounded-2xl border transition-all shadow-2xs hover:shadow-md ${isSunHora
                    ? 'bg-gradient-to-r from-amber-50/60 via-orange-50/20 to-white border-amber-200/90'
                    : 'bg-gradient-to-r from-blue-50/60 via-indigo-50/20 to-white border-blue-200/90'
                    }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-xs"
                        style={{ backgroundColor: pColor }}
                      >
                        {isSunHora ? '☀️' : '🌙'}
                      </div>
                      <div>
                        <h3 className="text-[14px] font-black text-slate-900 font-serif flex items-center gap-2">
                          <span>{translatedPlanetName}</span>
                          <span className="text-[14px] font-sans font-bold text-blackS">
                            in {isSunHora ? "Sun's Hora (Leo / सिंह)" : "Moon's Hora (Cancer / कर्क)"}
                          </span>
                        </h3>
                        <div className="text-[14px] font-bold text-black">
                          {translations?.ui?.houseLabel || 'House'} {p.house} · {horaReading.title}
                        </div>
                      </div>
                    </div>

                    <span className={`text-[14px] px-3 py-1 rounded-full border font-bold uppercase tracking-wider ${natureBadge}`}>
                      {horaReading.summary}
                    </span>
                  </div>

                  <p className="text-[16px] text-black leading-relaxed font-sans mb-4">
                    {horaReading.reading}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-200/80">
                    <div className="p-3 bg-white/80 rounded-xl border border-slate-200">
                      <div className="text-[16px] font-bold text-emerald-900 flex items-center gap-1.5 mb-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-900 shrink-0" />
                        <span>{d2Translations?.ui?.wealthChannels || "Key Wealth Channels & Strengths:"}</span>
                      </div>
                      <ul className="text-[16px] text-black space-y-1 list-disc list-inside">
                        {(horaReading.strengths || []).map((str, i) => (
                          <li key={i}>{str}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-white/80 rounded-xl border border-slate-200">
                      <div className="text-[16px] font-bold text-amber-900 flex items-center gap-1.5 mb-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{d2Translations?.ui?.cautionDisciplines || "Financial Disciplines to Observe:"}</span>
                      </div>
                      <ul className="text-[16px] text-black space-y-1 list-disc list-inside">
                        {(horaReading.challenges || []).map((chl, i) => (
                          <li key={i}>{chl}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ROW 6: Comprehensive 12 House Financial Forecasts */}
        <section id="section-d2-house-interpretations" className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6 scroll-mt-24">
          <div className="bg-rose-50 border border-rose-200/80 p-4 rounded-2xl flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                📜
              </div>
              <div>
                <h2 className="text-lg font-black font-serif text-slate-900 flex items-center gap-2">
                  {d2Translations?.ui?.houseSectionTitle || "D2 Hora Bhavas Detailed Forecasts (द्वादश भावगत आर्थिक फल)"}
                </h2>
                <p className="text-[14px] font-semibold text-rose-900 mt-0.5">
                  {d2Translations?.ui?.houseSectionSubtitle || "Detailed analysis of each house's treasury role, asset accumulation, risk factors and revenue conduits"}
                </p>
              </div>
            </div>
            <span className="text-[14px] font-bold text-rose-950 bg-white px-3 py-1.5 rounded-full border border-rose-300 shadow-xs">
              All 12 Houses
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((hNum) => {
              const hInterp = d2Translations?.houses?.[hNum] || D2_HOUSE_INTERPRETATIONS[hNum];
              const hData = d2Houses[hNum] || {};
              const occupants = (hData.planets || []).map(p => translations?.planets?.[p.planet] || p.planet || p.name);
              const signIdx = hData.sign_index !== undefined ? hData.sign_index : ((hNum - 1) % 12);
              const isSunSign = signIdx === 4;

              return (
                <div
                  key={hNum}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-amber-300 hover:shadow-xs transition space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-black font-mono px-2.5 py-1 rounded-md bg-amber-100 text-amber-950 border border-amber-300">
                      {translations?.ui?.houseLabel || 'House'} {hNum}
                    </span>
                    <span className={`text-[14px] px-2.5 py-0.5 rounded-full font-bold border ${isSunSign ? 'bg-amber-50 text-amber-900 border-amber-300' : 'bg-blue-50 text-blue-900 border-blue-300'
                      }`}>
                      {isSunSign ? "Sun's Hora (Leo)" : "Moon's Hora (Cancer)"}
                    </span>
                  </div>

                  <h3 className="text-[16px] font-black text-slate-900 font-serif">
                    {hInterp?.title}
                  </h3>

                  <p className="text-[16px] text-black leading-relaxed font-sans">
                    {hInterp?.core}
                  </p>

                  <div className="pt-2 border-t border-slate-200 space-y-1.5 text-[14px]">
                    <div className="flex items-start gap-1.5 text-emerald-900">
                      <span className="font-bold shrink-0">✦ {d2Translations?.ui?.prosperityTitle || "Prosperity:"}</span>
                      <span>{hInterp?.favorable}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-amber-900">
                      <span className="font-bold shrink-0">⚠ {d2Translations?.ui?.cautionTitle || "Caution:"}</span>
                      <span>{hInterp?.challenging}</span>
                    </div>
                    <div className="mt-2 text-slate-800 font-medium">
                      <span className="font-bold text-slate-600">Active Occupants: </span>
                      {occupants.length > 0 ? (
                        <span className="font-bold text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-200 shadow-2xs">
                          {occupants.join(', ')}
                        </span>
                      ) : (
                        <span className="italic text-slate-400">No Direct Occupants</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Floating Astrologer Banner */}
      <aside aria-label="Consult to Astrologer Floating Banner" className="fixed right-3 md:right-6 bottom-6 z-50 flex flex-col items-end">
        {showFloatingBanner ? (
          <div className="relative group bg-slate-950 p-1.5 rounded-3xl border-2 border-amber-400/90 shadow-2xl overflow-hidden max-w-[170px] sm:max-w-[210px] md:max-w-[230px] transition-all duration-300 transform hover:scale-105">
            <button
              onClick={() => setShowFloatingBanner(false)}
              className="absolute top-2.5 right-2.5 z-20 w-7 h-7 bg-black/70 hover:bg-black text-white rounded-full flex items-center justify-center border border-white/30 shadow-md transition"
              title="Minimize banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <a
              href="/live-astrologers"
              target="_blank"
              rel="noopener noreferrer"
              className="block relative rounded-2xl overflow-hidden"
            >
              <img
                src="/images/consult-astrologer-sidebar.jpg"
                alt="Consult to Astrologer"
                className="w-full h-auto object-cover rounded-2xl"
              />
              <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col items-center text-center">
                <span className="w-full py-1.5 px-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-serif font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5" /> Connect Now
                </span>
              </div>
            </a>
          </div>
        ) : (
          <button
            onClick={() => setShowFloatingBanner(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-full shadow-2xl border-2 border-white/80 hover:scale-105 transition"
          >
            <PhoneCall className="w-4 h-4 text-white" />
            <span className="text-xs font-black uppercase tracking-wider font-serif">Consult Astrologer</span>
          </button>
        )}
      </aside>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-[14px] text-slate-900">
        Astrology Consult • D2 Hora Wealth Chart Window • Classical Vedic Astrology
      </footer>
    </div>
  );
}
