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
  MessageSquare,
  Radio,
  Globe,
  Languages,
  Volume2,
  VolumeX
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../utils/kundaliHubStrings';
import { API_BASE_URL, PYTHON_ASTRO_URL } from '../services/api';
import StandaloneD1Chart from '../components/StandaloneD1Chart';
import SouthIndianD1Chart from '../components/SouthIndianD1Chart';
import PlanetaryDrishtiSection from '../components/PlanetaryDrishtiSection';
import HouseByHouseInterpretation from '../components/HouseByHouseInterpretation';
import HouseConjunctionAnalysis from '../components/HouseConjunctionAnalysis';
import YamakantakaAnalysis from '../components/YamakantakaAnalysis';
import MandiGulikaAnalysis from '../components/MandiGulikaAnalysis';
import UpaketuAnalysis from '../components/UpaketuAnalysis';
import IndrachapaAnalysis from '../components/IndrachapaAnalysis';

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

export default function D1ChartWindow() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [showFloatingBanner, setShowFloatingBanner] = useState(false);
  const [chartStyle, setChartStyle] = useState('north'); // 'north' (default) or 'south'
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

  // Prioritize URL param if explicitly set, else fallback to local storage
  const urlLang = searchParams.get('lang');
  const savedLang = localStorage.getItem('kundali_hub_lang') || 'en';
  const initialLang = urlLang || savedLang;

  const [currentLang, setCurrentLang] = useState(initialLang);
  const [translations, setTranslations] = useState(null);
  const [isLangLoading, setIsLangLoading] = useState(false);

  // Keep state in sync if URL param changes
  useEffect(() => {
    if (urlLang && urlLang !== currentLang) {
      setCurrentLang(urlLang);
    }
  }, [urlLang]);

  useEffect(() => {
    fetchD1Data();
  }, [date, time, lat, lon, tzOffset]);

  // Fetch translations from database / backend cache when language changes
  useEffect(() => {
    if (!currentLang || currentLang === 'en') {
      setTranslations(null);
      return;
    }

    const loadDictionary = async () => {
      setIsLangLoading(true);
      try {
        const localCacheKey = `astro_dict_${currentLang}`;
        const cached = localStorage.getItem(localCacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          // If cached data has drishti, manifestation, conjunction, yamakantaka, mandiGulika, upaketu, indrachapa and nav pill headers, use it; otherwise refetch fresh from DB
          if (parsed?.ui?.occupiedHouse && parsed?.ui?.aspectLabel && parsed?.ui?.conjunctionSectionTitle && parsed?.ui?.yamakantakaTitle && parsed?.ui?.mandiGulikaTitle && parsed?.ui?.upaketuTitle && parsed?.ui?.indrachapaTitle && parsed?.ui?.navD1Chart) {
            setTranslations(parsed);
            setIsLangLoading(false);
            return;
          }
        }

        const res = await axios.get(`${API_BASE_URL}/translate/astro-dictionary/${currentLang}`);
        if (res.data?.success && res.data?.data) {
          setTranslations(res.data.data);
          localStorage.setItem(localCacheKey, JSON.stringify(res.data.data));
        }
      } catch (err) {
        console.warn(`Could not load translations for ${currentLang} from DB:`, err.message);
      } finally {
        setIsLangLoading(false);
      }
    };

    loadDictionary();
  }, [currentLang]);

  const fetchD1Data = async () => {
    setLoading(true);
    setError(null);

    // First attempt: check if cached in sessionStorage from KundaliHub
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

    try {
      // Fetch comprehensive calculation from Vedic backend
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
          // Wrap into expected structure
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
            }),
            yamakantaka: fallbackRes.data.upagrahas?.yamakantaka,
            mandi: fallbackRes.data.upagrahas?.mandi,
            gulika: fallbackRes.data.upagrahas?.gulika,
            upaketu: fallbackRes.data.upagrahas?.upaketu,
            indrachapa: fallbackRes.data.upagrahas?.indrachapa,
          };
          setReportData(formatted);
        } else {
          throw new Error('Both calculation endpoints failed.');
        }
      } catch (fErr) {
        setError('Failed to compute D1 Kundali. Please make sure the astrology backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Play Swasti Vachan Mantra while loading is true, and automatically stop when Kundali is generated
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
      // When Kundali generation finishes: automatically stop audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      // Broadcast to parent window/hub that Kundali page is generated so any hub mantra stops immediately
      try {
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          const bc = new BroadcastChannel('kundali_generation_channel');
          bc.postMessage('KUNDALI_GENERATED');
          bc.close();
        }
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }
      try {
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage('KUNDALI_GENERATED', '*');
        }
      } catch (e) {
        // Cross-origin or closed opener safety catch
      }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center text-white p-6 relative overflow-hidden select-none">
        {/* Ambient Cosmic Radial Glows */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Controls Bar (Mute & Close Window) */}
        <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
          {/* Mute / Unmute Button */}
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
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition shadow-sm ${
              isAudioMuted
                ? 'bg-rose-500/20 border-rose-400/50 text-rose-300 hover:bg-rose-500/30'
                : 'bg-amber-500/20 border-amber-400/50 text-amber-300 hover:bg-amber-500/30 animate-pulse'
            }`}
            title={isAudioMuted ? 'Unmute Mantra' : 'Mute Mantra'}
          >
            {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isAudioMuted ? 'Mantra Muted' : 'Playing Swasti Vachan'}</span>
          </button>

          {/* Close Window Button */}
          <button
            type="button"
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
              }
              window.close();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-bold border border-white/15 transition shadow-sm"
            title="Cancel & Close Window"
          >
            <X className="w-3.5 h-3.5 text-rose-400" />
            <span>Close</span>
          </button>
        </div>

        {/* Central Vedic Card */}
        <div className="max-w-md w-full text-center relative z-10 flex flex-col items-center">
          {/* Sacred Rotating Om Mandala */}
          <div className="relative mb-6 flex items-center justify-center">
            <div className="w-28 h-28 rounded-full border-2 border-dashed border-amber-400/40 animate-[spin_20s_linear_infinite] flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border border-amber-300/60"></div>
            </div>
            <div className="absolute text-5xl animate-pulse drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
              🕉️
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold font-serif tracking-wide text-amber-300 mb-2">
            Generating D1 Rasi Kundali
          </h2>

          <p className="text-amber-200/80 font-serif italic text-xs md:text-sm max-w-sm mb-6 leading-relaxed">
            "ॐ स्वस्ति न इन्द्रो वृद्धश्रवाः स्वस्ति नः पूषा विश्ववेदाः..."
          </p>

          {/* Status Badge */}
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl text-xs text-slate-300 flex items-center gap-2.5 mb-2 shadow-inner">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></div>
            <span>Calculating high-precision planetary degrees & house cusps</span>
          </div>

          <p className="text-[11px] text-slate-500 mt-3 font-sans">
            Native: <b className="text-slate-300">{name}</b> • {date} • {time}
          </p>
        </div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800">
        <div className="bg-white p-8 rounded-2xl border border-red-200 shadow-xl max-w-md text-center">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-xl">
            !
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Calculation Error</h3>
          <p className="text-sm text-slate-600 mb-4">{error || 'Could not load chart data.'}</p>
          <button
            onClick={fetchD1Data}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition"
          >
            Retry Calculation
          </button>
        </div>
      </div>
    );
  }

  const houses = reportData.charts?.houses || {};
  const planetPositions = reportData.planet_positions || [];

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-slate-900 flex flex-col">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-3 shadow-xs flex flex-wrap justify-between items-center gap-4">
        {/* Left: Native & Title Details */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-900 rounded-xl flex items-center justify-center text-white font-serif font-black text-base shadow-sm">
            D1
          </div>
          <div>
            <h1 className="text-lg font-black font-serif tracking-tight text-indigo-900 leading-tight">
              {translations?.ui?.title || 'D1 Rasi / Lagna Kundali Chart'}
            </h1>
            <p className="text-xs text-slate-900 flex flex-wrap items-center gap-3 mt-0.5 font-medium">
              <span><b>{translations?.ui?.native || 'Native'}:</b> <span className="font-bold text-black">{name}</span></span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 font-semibold text-black"><Calendar className="w-3 h-3 text-indigo-700" /> {date}</span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 font-semibold text-black"><Clock className="w-3 h-3 text-indigo-700" /> {time}</span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 font-semibold text-black"><MapPin className="w-3 h-3 text-indigo-700" /> {locationName}</span>
            </p>
          </div>
        </div>

        {/* Center: Talk To Astrologer Banner */}
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
            <span className="tracking-wide uppercase font-black text-xs md:text-sm">Talk To Astrologer</span>
            <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider hidden sm:inline-block">
              LIVE
            </span>
          </a>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Language Selector Dropdown */}
          <div className="relative flex items-center">
            <label htmlFor="d1-language-select" className="sr-only">Language</label>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition shadow-2xs">
              <Globe className={`w-3.5 h-3.5 text-indigo-700 ${isLangLoading ? 'animate-spin' : ''}`} />
              <select
                id="d1-language-select"
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
            <Printer className="w-3.5 h-3.5 text-indigo-700" />
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

      {/* Sticky Quick-Jump Pill Bar (White theme, distinct color badges) */}
      <nav className="sticky top-[61px] z-30 bg-white/95 backdrop-blur-md px-6 py-2 border-b border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <Compass className="w-3 h-3 text-indigo-600" /> {translations?.ui?.jumpTo || 'Jump To:'}
        </span>
        <button
          onClick={() => document.getElementById('section-d1-chart')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 transition shrink-0"
        >
          🌟 {translations?.ui?.navD1Chart || 'D1 Chart'}
        </button>
        <button
          onClick={() => document.getElementById('section-12-bhavas')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition shrink-0"
        >
          🏛️ {translations?.ui?.nav12Bhavas || '12 Bhavas'}
        </button>
        <button
          onClick={() => document.getElementById('section-planetary-drishti')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition shrink-0"
        >
          👁️ {translations?.ui?.navDrishti || 'Drishti (Aspects)'}
        </button>
        <button
          onClick={() => document.getElementById('section-house-interpretation')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 transition shrink-0"
        >
          📖 {translations?.ui?.navHouseAnalysis || 'House Analysis'}
        </button>
        <button
          onClick={() => document.getElementById('section-house-conjunction-analysis')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition shrink-0"
        >
          💠 {translations?.ui?.navConjunctions || 'Conjunctions'}
        </button>
        <button
          onClick={() => document.getElementById('section-yamakantaka-analysis')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition shrink-0"
        >
          🌟 {translations?.ui?.navYamakantaka || 'Yamakantaka'}
        </button>
        <button
          onClick={() => document.getElementById('section-mandi-gulika-analysis')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200 transition shrink-0"
        >
          🌑 {translations?.ui?.navMandiGulika || 'Mandi & Gulika'}
        </button>
        <button
          onClick={() => document.getElementById('section-upaketu-analysis')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-800 border border-red-200 hover:bg-red-100 transition shrink-0"
        >
          🔥 {translations?.ui?.navUpaketu || 'Upaketu'}
        </button>
        <button
          onClick={() => document.getElementById('section-indrachapa-analysis')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 transition shrink-0"
        >
          🌩️ {translations?.ui?.navIndrachapa || 'Indrachapa'}
        </button>
      </nav>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 pt-4 pb-8 space-y-6 bg-white text-black">

        {/* ROW 1: D1 Chart & Planet Degrees Table */}
        <div id="section-d1-chart" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start scroll-mt-20">

          {/* D1 SVG Chart Card */}
          <div className="lg:col-span-7 bg-white p-4 md:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center">
            {chartStyle === 'north' ? (
              <StandaloneD1Chart
                houses={houses}
                planetPositions={planetPositions}
                title="Main Birth Chart (D1 / लग्न कुंडली)"
                lang={currentLang}
                onPlanetClick={(pName) => setSelectedPlanet(pName)}
                headerExtra={
                  <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setChartStyle('north')}
                      className="px-2.5 py-1 text-xs font-bold rounded-md transition-all bg-white text-indigo-900 shadow-xs"
                    >
                      🔷 North Indian (उत्तर)
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartStyle('south')}
                      className="px-2.5 py-1 text-xs font-bold rounded-md transition-all text-slate-900 hover:text-amber-400"
                    >
                      🔶 South Indian (दक्षिण)
                    </button>
                  </div>
                }
              />
            ) : (
              <SouthIndianD1Chart
                houses={houses}
                planetPositions={planetPositions}
                title="Main Birth Chart (D1 / दक्षिण भारतीय कुंडली)"
                lang={currentLang}
                onPlanetClick={(pName) => setSelectedPlanet(pName)}
                headerExtra={
                  <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setChartStyle('north')}
                      className="px-2.5 py-1 text-xs font-bold rounded-md transition-all text-slate-600 hover:text-slate-900"
                    >
                      🔷 North Indian (उत्तर)
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartStyle('south')}
                      className="px-2.5 py-1 text-xs font-bold rounded-md transition-all bg-amber-500 text-white shadow-xs"
                    >
                      🔶 South Indian (दक्षिण)
                    </button>
                  </div>
                }
              />
            )}
          </div>

          {/* Planet Degree & Nakshatra Table */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col h-full">
            <div className="flex justify-between items-center bg-rose-50 border border-rose-200/80 p-3.5 rounded-2xl mb-4">
              <div>
                <h2 className="text-base font-black font-serif text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-rose-600 rounded-full"></span>
                  {translations?.ui?.planetaryDegreesTitle || 'Planetary Degrees & Nakshatras (ग्रह स्पष्ट)'}
                </h2>
                <p className="text-xs font-semibold text-rose-900/80 mt-0.5">
                  {translations?.ui?.planetaryDegreesSubtitle || 'Sidereal longitudes, constellations & status'}
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-white px-2.5 py-1 rounded-md text-rose-900 border border-rose-200 shadow-xs">
                {translations?.ui?.ayanamsha || 'Lahiri Ayanamsha'}
              </span>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-800 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
                    <th className="py-3 px-3.5">{translations?.ui?.colPlanet || 'Planet'}</th>
                    <th className="py-3 px-3.5">{translations?.ui?.colSign || 'Sign'}</th>
                    <th className="py-3 px-3.5">{translations?.ui?.colDegree || 'Degree'}</th>
                    <th className="py-3 px-3.5">{translations?.ui?.colNakshatra || 'Nakshatra'}</th>
                    <th className="py-3 px-3.5">{translations?.ui?.colPada || 'Pada'}</th>
                    <th className="py-3 px-3.5">{translations?.ui?.colHouse || 'House'}</th>
                    <th className="py-3 px-3.5">{translations?.ui?.colMotion || 'Motion'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-sm">
                  {planetPositions.map((p) => {
                    const color = PLANET_COLORS[p.planet] || "#0f172a";
                    const isSelected = selectedPlanet === p.planet;
                    const displayDeg = (Number(p.degree) % 30).toFixed(2);
                    const rawNak = typeof p.nakshatra === 'object' ? p.nakshatra?.name : p.nakshatra;
                    const cleanNak = (rawNak || 'Ashwini').replace(/\s+/g, '');
                    const translatedNak = translations?.nakshatras?.[cleanNak] || translations?.nakshatras?.[rawNak] || rawNak || 'Ashwini';

                    const rawSign = p.sign || p.sidereal?.sign || '-';
                    const cleanSign = rawSign.split(' ')[0];
                    const translatedSign = translations?.signs?.[cleanSign] || translations?.signs?.[rawSign] || rawSign;

                    const translatedPlanet = translations?.planets?.[p.planet] || p.planet;

                    return (
                      <tr
                        key={p.planet}
                        onClick={() => setSelectedPlanet(p.planet)}
                        className={`hover:bg-indigo-50/50 cursor-pointer transition ${isSelected ? "bg-indigo-100/70 font-bold" : ""
                          }`}
                      >
                        <td className="py-3 px-3.5 font-sans font-bold flex items-center gap-2 text-base" style={{ color }}>
                          <span>{translatedPlanet}</span>
                          {p.is_retrograde && <span className="text-xs bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-mono font-bold" title="Retrograde">R</span>}
                          {p.is_combust && <span className="text-xs bg-red-100 text-red-900 px-1.5 py-0.5 rounded font-mono font-bold" title="Combust">C</span>}
                        </td>
                        <td className="py-3 px-3.5 font-sans font-semibold text-black">{translatedSign}</td>
                        <td className="py-3 px-3.5 font-bold text-black font-mono">{displayDeg}°</td>
                        <td className="py-3 px-3.5 font-sans font-semibold text-black">{translatedNak}</td>
                        <td className="py-3 px-3.5 font-bold text-black">{p.nakshatra_pada || p.pada || 1}</td>
                        <td className="py-3 px-3.5 font-black text-indigo-800 text-base">H{p.house || 1}</td>
                        <td className="py-3 px-3.5 font-sans font-medium text-slate-800">
                          {p.is_retrograde
                            ? (translations?.ui?.retrograde || 'Retrograde (वक्र)')
                            : (translations?.ui?.direct || 'Direct (मार्गी)')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-600 font-medium flex justify-between">
              <span><b>R:</b> {translations?.ui?.retrograde || 'Retrograde (Vakri)'}</span>
              <span><b>C:</b> {translations?.ui?.combust || 'Combust (Asth)'}</span>
              <span>{translations?.ui?.inspectPlanetHint || 'Click any planet row to inspect'}</span>
            </div>
          </div>
        </div>

        {/* ROW 2: House Breakdown & Lordships */}
        <section id="section-12-bhavas" className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5 scroll-mt-24">
          <div className="bg-rose-50 border border-rose-200/80 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black font-serif text-slate-900 flex items-center gap-2">
                <span className="w-3 h-3 bg-rose-600 rounded-full"></span>
                {translations?.ui?.bhavasTitle || '12 Bhavas / Houses Analysis (द्वादश भाव विवरण)'}
              </h2>
              <p className="text-sm font-semibold text-rose-900/80 mt-0.5">
                {translations?.ui?.bhavasSubtitle || 'Signs, cusps, occupants and lordships for all 12 houses'}
              </p>
            </div>
            <span className="text-xs font-bold text-rose-900 bg-white px-3 py-1.5 rounded-full border border-rose-200 shadow-xs">
              {translations?.ui?.activeBhavas || '12 Bhavas Active'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((hNum) => {
              const hData = houses[hNum] || {};
              const rawPlanets = hData.planets || [];
              const rawSignKeys = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
              const signIdx = hData.sign_index !== undefined ? hData.sign_index : ((hNum - 1) % 12);
              const signKey = rawSignKeys[signIdx % 12];
              const signDisplay = translations?.signs?.[signKey]
                ? `${signKey} (${translations.signs[signKey]})`
                : ["Aries (मेष)", "Taurus (वृषभ)", "Gemini (मिथुन)", "Cancer (कर्क)", "Leo (सिंह)", "Virgo (कन्या)", "Libra (तुला)", "Scorpio (वृश्चिक)", "Sagittarius (धनु)", "Capricorn (मकर)", "Aquarius (कुंभ)", "Pisces (मीन)"][signIdx % 12];

              const rawSignLords = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];
              const lordKey = rawSignLords[signIdx % 12];
              const lordDisplay = translations?.planets?.[lordKey] || lordKey;

              const occupants = rawPlanets.map(p => {
                const pName = typeof p === 'string' ? p : p.planet || p.name;
                return translations?.planets?.[pName] || pName;
              });

              return (
                <div key={hNum} className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-teal-500 hover:shadow-xs transition shadow-2xs">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-black font-mono px-2.5 py-1 rounded-md bg-teal-50 text-teal-900 border border-teal-200">
                      {translations?.ui?.houseLabel || 'House'} {hNum}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {translations?.ui?.lordLabel || 'Lord'}: <strong className="text-black text-sm">{lordDisplay}</strong>
                    </span>
                  </div>
                  <div className="text-sm font-black text-black">{signDisplay}</div>
                  <div className="mt-2.5 text-xs text-slate-900 font-medium">
                    <span className="text-slate-600 font-semibold">{translations?.ui?.planetsLabel || 'Planets'}: </span>
                    {occupants.length > 0 ? (
                      <span className="font-bold text-black text-sm bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                        {occupants.join(', ')}
                      </span>
                    ) : (
                      <span className="italic text-slate-500 font-normal">{translations?.ui?.noneOccupants || 'None (रिक्त)'}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ROW 3: Planetary Drishti (Aspects) Sight of Influence & Karma */}
        <PlanetaryDrishtiSection houses={houses} translations={translations} />

        {/* ROW 4: House-by-House Interpretations */}
        <HouseByHouseInterpretation
          reportData={reportData}
          translations={translations}
          currentLang={currentLang}
        />

        {/* ROW 5: House Conjunction Analysis (Yuti) */}
        <HouseConjunctionAnalysis
          houses={houses}
          translations={translations}
          currentLang={currentLang}
        />

        {/* ROW 6: Yamakantaka Analysis */}
        <YamakantakaAnalysis
          yamakantaka={reportData?.yamakantaka}
          translations={translations}
          currentLang={currentLang}
        />

        {/* ROW 7: Mandi & Gulika Analysis */}
        <MandiGulikaAnalysis
          mandi={reportData?.mandi}
          gulika={reportData?.gulika}
          translations={translations}
          currentLang={currentLang}
        />

        {/* ROW 8: Upaketu (Sikhi) Analysis */}
        <UpaketuAnalysis
          upaketu={reportData?.upaketu}
          translations={translations}
          currentLang={currentLang}
        />

        {/* ROW 9: Indrachapa (Kodanda) Analysis */}
        <IndrachapaAnalysis
          indrachapa={reportData?.indrachapa}
          translations={translations}
          currentLang={currentLang}
        />

        {/* ROW 10: Special Upagrahas & Sensitive Calculation Points */}

      </main>
      {/* FIXED FLOATING RIGHT-SIDE BANNER: Consult to Astrologer */}
      <aside aria-label="Consult to Astrologer Floating Banner" className="fixed right-3 md:right-6 bottom-6 z-50 flex flex-col items-end">
        {showFloatingBanner ? (
          <div className="relative group bg-slate-950 p-1.5 rounded-3xl border-2 border-amber-400/90 shadow-2xl overflow-hidden max-w-[170px] sm:max-w-[210px] md:max-w-[230px] transition-all duration-300 transform hover:scale-105">
            {/* Close / Minimize button */}
            <button
              onClick={() => setShowFloatingBanner(false)}
              className="absolute top-2.5 right-2.5 z-20 w-7 h-7 bg-black/70 hover:bg-black text-white rounded-full flex items-center justify-center border border-white/30 shadow-md transition"
              title="Minimize banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Clickable Image & CTA */}
            <a
              href="/live-astrologers"
              target="_blank"
              rel="noopener noreferrer"
              className="block relative rounded-2xl overflow-hidden"
              title="Click to Consult Verified Astrologers Live"
            >
              <img
                src="/images/consult-astrologer-sidebar.jpg"
                alt="Consult to Astrologer"
                className="w-full h-auto object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
              />

              {/* Pulsing Live indicator overlay */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-amber-400/50 shadow-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-bold text-amber-200 uppercase tracking-wider">Online</span>
              </div>

              {/* Hover call to action glow */}
              <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col items-center text-center">
                <span className="w-full py-1.5 px-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-serif font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5" />
                  Connect Now
                </span>
              </div>
            </a>
          </div>
        ) : (
          /* Minimized circular launcher pill */
          <button
            onClick={() => setShowFloatingBanner(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-full shadow-2xl border-2 border-white/80 hover:scale-105 transition"
            title="Expand Consult to Astrologer Banner"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            <PhoneCall className="w-4 h-4 text-white" />
            <span className="text-xs font-black uppercase tracking-wider font-serif">Consult Astrologer</span>
          </button>
        )}
      </aside>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-[14px] text-slate-900">
        Astrology Consult • D1 Lagna Rasi Chart Window • Precision Vedic Calculation
      </footer>
    </div >
  );
}
