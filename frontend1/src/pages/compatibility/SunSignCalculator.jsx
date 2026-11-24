import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  Heart,
  Sun,
  Sparkles,
  Video,
  ChevronRight,
  Flame,
  Droplet,
  Wind,
  Mountain,
  Compass,
  CheckCircle2,
  Activity,
  Zap,
  Globe
} from 'lucide-react';
import { authAPI, buildAssetUrl, API_BASE_URL } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

const VEDIC_SUN_SIGNS = [
  { en: 'Aries', hi: 'मेष (Mesh)', dates: 'Mar 21 – Apr 19', element: 'Fire', lord: 'Mars (Mangal)', symbol: '♈', trait: 'Dynamic & Initiating' },
  { en: 'Taurus', hi: 'वृषभ (Vrishabha)', dates: 'Apr 20 – May 20', element: 'Earth', lord: 'Venus (Shukra)', symbol: '♉', trait: 'Persistent & Sensual' },
  { en: 'Gemini', hi: 'मिथुन (Mithun)', dates: 'May 21 – Jun 21', element: 'Air', lord: 'Mercury (Budh)', symbol: '♊', trait: 'Versatile & Intellectual' },
  { en: 'Cancer', hi: 'कर्क (Kark)', dates: 'Jun 22 – Jul 22', element: 'Water', lord: 'Moon (Chandra)', symbol: '♋', trait: 'Protective & Intuitive' },
  { en: 'Leo', hi: 'सिंह (Simha)', dates: 'Jul 23 – Aug 22', element: 'Fire', lord: 'Sun (Surya)', symbol: '♌', trait: 'Confident & Radiant' },
  { en: 'Virgo', hi: 'कन्या (Kanya)', dates: 'Aug 23 – Sep 22', element: 'Earth', lord: 'Mercury (Budh)', symbol: '♍', trait: 'Analytical & Discerning' },
  { en: 'Libra', hi: 'तुला (Tula)', dates: 'Sep 23 – Oct 23', element: 'Air', lord: 'Venus (Shukra)', symbol: '♎', trait: 'Harmonious & Artistic' },
  { en: 'Scorpio', hi: 'वृश्चिक (Vrishchik)', dates: 'Oct 24 – Nov 21', element: 'Water', lord: 'Mars (Mangal)', symbol: '♏', trait: 'Passionate & Magnetic' },
  { en: 'Sagittarius', hi: 'धनु (Dhanu)', dates: 'Nov 22 – Dec 21', element: 'Fire', lord: 'Jupiter (Guru)', symbol: '♐', trait: 'Philosophical & Adventurous' },
  { en: 'Capricorn', hi: 'मकर (Makar)', dates: 'Dec 22 – Jan 19', element: 'Earth', lord: 'Saturn (Shani)', symbol: '♑', trait: 'Ambitious & Grounded' },
  { en: 'Aquarius', hi: 'कुंभ (Kumbh)', dates: 'Jan 20 – Feb 18', element: 'Air', lord: 'Saturn (Shani)', symbol: '♒', trait: 'Visionary & Original' },
  { en: 'Pisces', hi: 'मीन (Meen)', dates: 'Feb 19 – Mar 20', element: 'Water', lord: 'Jupiter (Guru)', symbol: '♓', trait: 'Empathetic & Transcendent' }
];

const SunSignCalculator = ({ onBack }) => {
  const { t, currentLang, changeLanguage, supportedLanguages } = useLanguage();
  const [sign1, setSign1] = useState('Aries');
  const [sign2, setSign2] = useState('Aries');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dbTranslations, setDbTranslations] = useState(null);

  // Fetch translations for Sun Sign Compatibility from MongoDB when language changes
  useEffect(() => {
    if (!currentLang || currentLang === 'en') {
      setDbTranslations(null);
      return;
    }

    const fetchTranslations = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/translate/sun-sign-compatibility/${currentLang}`);
        if (res.ok) {
          const json = await res.json();
          if (json?.data) {
            setDbTranslations(json.data);
          }
        }
      } catch (err) {
        console.warn('Could not load sun sign translations from DB:', err);
      }
    };

    fetchTranslations();
  }, [currentLang]);

  // Live Astrologers State for Header Strip
  const [liveAstrologers, setLiveAstrologers] = useState([]);
  const [loadingAstrologers, setLoadingAstrologers] = useState(false);

  useEffect(() => {
    const fetchLiveAstrologers = async () => {
      setLoadingAstrologers(true);
      try {
        const response = await authAPI.getAstrologers();
        const all = response?.data?.astrologers || [];
        const live = all.filter((a) => a.isLive);
        if (live.length > 0) {
          setLiveAstrologers(live);
        } else {
          setLiveAstrologers(all.slice(0, 8));
        }
      } catch (err) {
        console.error('Failed to load astrologers:', err);
      } finally {
        setLoadingAstrologers(false);
      }
    };

    fetchLiveAstrologers();
  }, []);

  const cleanAstrologerName = (name) => {
    if (!name) return 'Vedic Expert';
    return name
      .replace(/^(Astrologer|Astro\.?|Acharya|Pandit|Dr\.?)\s+/i, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    if (!sign1 || !sign2) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch((import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api') + '/astrology/compatibility/sun', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sign1, sign2 }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('सूर्य राशि अनुकूलता गणना में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  const sign1Meta = VEDIC_SUN_SIGNS.find((s) => s.en.toLowerCase() === (result?.sign1 || sign1).toLowerCase()) || VEDIC_SUN_SIGNS[0];
  const sign2Meta = VEDIC_SUN_SIGNS.find((s) => s.en.toLowerCase() === (result?.sign2 || sign2).toLowerCase()) || VEDIC_SUN_SIGNS[0];

  const getElementIcon = (element) => {
    switch (element) {
      case 'Fire':
        return <Flame className="w-3.5 h-3.5 text-amber-500" />;
      case 'Water':
        return <Droplet className="w-3.5 h-3.5 text-sky-500" />;
      case 'Air':
        return <Wind className="w-3.5 h-3.5 text-teal-500" />;
      case 'Earth':
        return <Mountain className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-orange-500" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 animate-fade-in-up pt-1">
      {/* 1. Live Astrologer Strip (Starts immediately after Nav Bar with zero unwanted gap) */}
      <div className="bg-gradient-to-r from-white via-amber-50/50 to-orange-50/60 border border-amber-200/90 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl shadow-xs space-y-1.5 mt-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-amber-100 pb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <span className="text-[11px] sm:text-[14px] font-extrabold uppercase tracking-wider text-amber-950 font-serif flex items-center gap-1.5">
              <span>लाइव ज्योतिषी से तुरंत परामर्श लें</span>
              <span className="text-[14px] font-sans font-bold text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.2 rounded-full">
                LIVE NOW
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[14px] text-black hidden md:inline">
              Vedic Surya Rashi, Ego & Life Vision Alignment
            </span>
            <Link
              to="/live-astrologers"
              className="inline-flex items-center gap-1 text-[14px] font-bold text-amber-800 hover:text-amber-950 transition-colors bg-white px-2 py-0.5 rounded-lg border border-amber-200 shadow-2xs"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {loadingAstrologers ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-white rounded-xl animate-pulse border border-neutral-200" />
            ))}
          </div>
        ) : liveAstrologers.length === 0 ? (
          <div className="bg-white border border-amber-100 p-2 rounded-xl flex items-center justify-between text-xs text-neutral-600">
            <span>हमारे वरिष्ठ वैदिक ज्योतिषी अभी उपलब्ध हैं।</span>
            <Link
              to="/live-astrologers"
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 text-xs"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Connect Live</span>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3 pt-0.5">
            {/* Left/Center: Circular Live Astrologers Roster */}
            <div className="flex items-center gap-3.5 sm:gap-5 overflow-x-auto py-0.5 px-0.5 scrollbar-none w-full lg:w-auto">
              {liveAstrologers.slice(0, 8).map((astro) => {
                const rawImage = astro.profilePicture || astro.image || astro.imageUrl || astro.photo;
                const imageSrc = rawImage ? buildAssetUrl(rawImage) : null;
                const liveLink = astro.isLive ? `/live/${astro._id}` : `/astrologer/${astro._id || astro.id}`;
                const displayName = cleanAstrologerName(astro.name);

                return (
                  <Link
                    key={astro._id || astro.id}
                    to={liveLink}
                    className="group flex flex-col items-center shrink-0 cursor-pointer transition-transform hover:-translate-y-0.5"
                    title={`Talk to ${displayName}`}
                  >
                    <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-500 shadow-2xs group-hover:scale-105 transition-transform">
                      <div className="w-11 h-11 sm:w-18 sm:h-18 rounded-full overflow-hidden bg-neutral-900 border border-white flex items-center justify-center">
                        {imageSrc ? (
                          <img
                            src={imageSrc}
                            alt={displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-bold text-amber-300">
                            {displayName?.charAt(0) || 'A'}
                          </span>
                        )}
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-white rounded-full shadow-2xs"></span>
                    </div>

                    <span className="mt-1 text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-amber-600 transition-colors text-center truncate max-w-[65px] sm:max-w-[75px] block leading-tight">
                      {displayName}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Right Side: First Consultation Free Button */}
            <div className="shrink-0 w-full lg:w-auto flex justify-center lg:justify-end">
              <Link
                to="/book-appointment"
                className="group relative flex items-center gap-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-600 hover:via-orange-600 hover:to-rose-700 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border border-amber-300/40 cursor-pointer overflow-hidden text-center"
              >
                <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-200 fill-amber-200 group-hover:rotate-12 transition-transform" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-black uppercase tracking-wider bg-white/25 px-1.5 py-0.2 rounded-full text-white">
                      100% FREE
                    </span>
                    <span className="text-[14px] font-bold text-amber-100">Special Offer</span>
                  </div>
                  <div className="text-xs sm:text-[24px] font-black font-serif tracking-tight leading-tight text-white mt-0.5">
                    First Consultation Free
                  </div>
                  <div className="text-[12px] font-bold text-amber-100 flex items-center gap-1">
                    <span>Book Appointment Now</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 2. Top Header Bar */}
      <div className="bg-white border border-amber-200/80 px-4 sm:px-6 py-3.5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-900 font-extrabold text-xs uppercase tracking-wider shadow-sm border border-amber-500 transition-all cursor-pointer shrink-0"
            title="Back to All Love Calculators"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to All Love Calculators</span>
          </button>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[14px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                वैदिक सूर्य राशि मिलान
              </span>
              <span className="text-[16px] font-semibold text-neutral-900 hidden sm:inline">Sun Sign Compatibility</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black font-serif text-neutral-900 tracking-tight">
              Match Compatibility By Sun Sign
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Indian Language Selector */}
          {supportedLanguages && supportedLanguages.length > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-50/80 border border-amber-200 px-2 py-1 rounded-xl">
              <Globe className="w-3.5 h-3.5 text-amber-700" />
              <select
                value={currentLang || 'en'}
                onChange={(e) => changeLanguage && changeLanguage(e.target.value)}
                className="bg-transparent text-xs font-bold text-amber-950 focus:outline-hidden cursor-pointer"
                title="Select Indian Language"
              >
                {supportedLanguages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.native} ({l.name})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-amber-900 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-xs font-bold">
            <Sun className="w-3.5 h-3.5 text-amber-600 fill-amber-300" />
            <span>Core Ego, Willpower & Lcife Goals</span>
          </div>
        </div>
      </div>

      {/* 3. Form or Result Overview */}
      {!result ? (
        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left Column: Vedic Sun Philosophy & Guidance Text */}
            <div className="lg:col-span-5 bg-gradient-to-br from-amber-50 via-orange-50/60 to-rose-50 border border-amber-200/90 p-5 sm:p-6 rounded-2xl shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 text-amber-900 border border-amber-300 text-xs font-bold uppercase tracking-wider">
                  <Sun className="w-3.5 h-3.5 text-amber-600 fill-amber-300" />
                  <span>वैदिक सौर ऊर्जा एवं जीवन दृष्टि</span>
                </div>

                <div className="space-y-2">
                  <p className="text-base sm:text-lg font-bold font-serif text-amber-950 leading-snug">
                    वैदिक ज्योतिष में सूर्य आत्मा, आत्मविश्वास एवं जीवन दृष्टि का प्रतीक है
                  </p>
                  <p className="text-xs sm:text-[16px] text-neutral-900 leading-relaxed font-medium">
                    Select both partners' Sun signs to analyze leadership harmony, mutual respect, and shared ambition.
                  </p>
                </div>
              </div>

              {/* Decorative Vedic Highlight Pill */}
              <div className="bg-white/80 border border-amber-200/80 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>सूर्य राशि मिलान के मुख्य आयाम:</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-neutral-700">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>अहंकार एवं शक्ति संतुलन</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    <span>पारस्परिक सम्मान (Respect)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>तत्व सामंजस्य (Tattva)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    <span>जीवन लक्ष्य (Life Vision)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Partners Sun Sign Selectors and Submission Button */}
            <div className="lg:col-span-7 flex flex-col justify-start space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Person 1 Sun Sign */}
                <div className="bg-white border border-amber-600 p-3.5 sm:p-4 rounded-2xl space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-amber-100 pb-1.5">
                    <div className="w-5 h-5 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                      1
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900">Partner 1 Sun Sign (प्रथम साथी)</h3>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs sm:text-[14px] font-bold text-neutral-800 flex items-center gap-1">
                      <Sun className="w-3.5 h-3.5 text-amber-600" />
                      <span>Select Sun Sign (सूर्य राशि)</span>
                    </label>
                    <select
                      value={sign1}
                      onChange={(e) => setSign1(e.target.value)}
                      className="w-full bg-stone-50 border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-xs sm:text-sm font-medium cursor-pointer"
                      required
                    >
                      {VEDIC_SUN_SIGNS.map((s) => (
                        <option key={s.en} value={s.en}>
                          {s.symbol} {s.en} - {s.hi} ({s.dates})
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center justify-between text-xs text-neutral-900 pt-0.5">
                      <span>Lord: {VEDIC_SUN_SIGNS.find(s => s.en === sign1)?.lord}</span>
                      <span className="font-semibold text-amber-700">Element: {VEDIC_SUN_SIGNS.find(s => s.en === sign1)?.element}</span>
                    </div>
                  </div>
                </div>

                {/* Person 2 Sun Sign */}
                <div className="bg-white border border-orange-600 p-3.5 sm:p-4 rounded-2xl space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-orange-100 pb-1.5">
                    <div className="w-5 h-5 rounded-lg bg-orange-500 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                      2
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900">Partner 2 Sun Sign (द्वितीय साथी)</h3>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs sm:text-[14px] font-bold text-neutral-800 flex items-center gap-1">
                      <Sun className="w-3.5 h-3.5 text-orange-600" />
                      <span>Select Sun Sign (सूर्य राशि)</span>
                    </label>
                    <select
                      value={sign2}
                      onChange={(e) => setSign2(e.target.value)}
                      className="w-full bg-stone-50 border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-xs sm:text-sm font-medium cursor-pointer"
                      required
                    >
                      {VEDIC_SUN_SIGNS.map((s) => (
                        <option key={s.en} value={s.en}>
                          {s.symbol} {s.en} - {s.hi} ({s.dates})
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center justify-between text-xs text-neutral-900 pt-0.5">
                      <span>Lord: {VEDIC_SUN_SIGNS.find(s => s.en === sign2)?.lord}</span>
                      <span className="font-semibold text-orange-700">Element: {VEDIC_SUN_SIGNS.find(s => s.en === sign2)?.element}</span>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm text-center font-semibold">
                  {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-bold py-3 px-4 rounded-2xl shadow-md shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>सूर्य युति एवं तत्व विश्लेषण हो रहा है...</span>
                    </span>
                  ) : (
                    <>
                      <span>Calculate Sun Sign Compatibility</span>
                      <Sun className="w-4 h-4 fill-white" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-5">
          {/* Result Overview Header */}
          <div className="bg-white border border-neutral-200/90 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-[14px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ✓ विश्लेषण पूर्ण (Analysis Completed)
                </span>
                <span className="text-[14px] font-semibold text-neutral-900 bg-stone-50 px-2 py-0.5 rounded border border-neutral-200">
                  Vedic Solar Energy & Core Drive Synergy
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black font-serif text-neutral-900 tracking-tight">
                Sun Sign Harmony & Life Path Compatibility
              </h3>
              <p className="text-xs sm:text-[14px] text-neutral-900">
                Solar union between <strong className="text-amber-800 font-bold">{result.sign1}</strong> ({sign1Meta.hi}) &{' '}
                <strong className="text-orange-700 font-bold">{result.sign2}</strong> ({sign2Meta.hi})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={reset}
                className="flex items-center gap-1.5 bg-white hover:bg-neutral-100 text-neutral-800 font-bold text-xs py-2 px-3 rounded-xl border border-neutral-300 shadow-2xs transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                <span>Try Another Match</span>
              </button>
              <Link
                to="/live-astrologers"
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl shadow-2xs transition-all"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Talk to Astrologer</span>
              </Link>
            </div>
          </div>

          {/* 3-Column Core Metric Row: Compatibility Score, Partner 1 Sun Sign, Partner 2 Sun Sign */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            {/* Overall Compatibility Card */}
            <div className="md:col-span-4 bg-gradient-to-br from-amber-50 via-orange-50/50 to-rose-50 border border-black p-4 rounded-2xl flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                <span className="text-[16px] font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1">
                  <Sun className="w-4 h-4 text-amber-600 fill-amber-300" />
                  <span>{dbTranslations?.ui?.solarHarmonyScore || t('Solar Harmony Score')}</span>
                </span>
                <span className="text-2xl sm:text-3xl font-black font-serif text-amber-800">
                  {result.compatibilityScore}%
                </span>
              </div>

              <p className="text-[16px] text-neutral-900 font-medium leading-relaxed">
                {(() => {
                  if (dbTranslations?.messages) {
                    if (result.message?.includes('same Sun sign') && dbTranslations.messages.sameSign) {
                      return dbTranslations.messages.sameSign;
                    }
                    if (result.message?.includes('same element') && dbTranslations.messages.sameElement) {
                      return dbTranslations.messages.sameElement;
                    }
                    if (result.message?.includes('complementary') && dbTranslations.messages.complementary) {
                      return dbTranslations.messages.complementary;
                    }
                    if (result.message?.includes('different') && dbTranslations.messages.different) {
                      return dbTranslations.messages.different;
                    }
                  }
                  return t(result.message);
                })()}
              </p>

              <div className="bg-white/80 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center justify-between text-[14px] font-bold text-neutral-800">
                <span>{dbTranslations?.ui?.vedicSolarVerdict || t('Vedic Solar Verdict:')}</span>
                <span className="text-emerald-700">
                  {result.compatibilityScore >= 70
                    ? (dbTranslations?.verdicts?.powerfulSynergy || t('★ Powerful Synergy'))
                    : result.compatibilityScore >= 50
                      ? (dbTranslations?.verdicts?.mutualRespect || t('Mutual Respect & Balance'))
                      : (dbTranslations?.verdicts?.complementary || t('Complementary (Requires Mutual Respect)'))}
                </span>
              </div>
            </div>

            {/* Partner 1 Sun Sign Card */}
            <div className="md:col-span-4 bg-white border border-amber-800 p-4 rounded-2xl flex flex-col justify-between space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl">{sign1Meta.symbol}</span>
                  <span className="text-[16px] font-bold text-amber-950">
                    Partner 1: {result.sign1}
                  </span>
                </div>
                <span className="text-[14px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  {sign1Meta.hi.split(' ')[0]}
                </span>
              </div>

              <div className="space-y-1 text-[16px]">
                <div className="flex justify-between py-1 border-b border-stone-100 text-neutral-900">
                  <span>Ruling Deity (स्वामी):</span>
                  <span className="font-bold text-neutral-900">{sign1Meta.lord}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100 text-neutral-900">
                  <span>Elemental Fire/Type (तत्व):</span>
                  <span className="font-bold text-neutral-900 flex items-center gap-1">
                    {getElementIcon(sign1Meta.element)}
                    <span>{sign1Meta.element} Element</span>
                  </span>
                </div>
                <div className="flex justify-between py-1 text-neutral-900">
                  <span>Core Life Drive:</span>
                  <span className="font-bold text-amber-800">{sign1Meta.trait}</span>
                </div>
              </div>

              <div className="bg-amber-50/70 border border-amber-200 p-2 rounded-xl text-[14px] text-amber-950">
                Governs conscious ambition, leadership style, and outer worldly expression.
              </div>
            </div>

            {/* Partner 2 Sun Sign Card */}
            <div className="md:col-span-4 bg-white border border-orange-600 p-4 rounded-2xl flex flex-col justify-between space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between border-b border-orange-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl">{sign2Meta.symbol}</span>
                  <span className="text-[16px] font-bold text-orange-950">
                    Partner 2: {result.sign2}
                  </span>
                </div>
                <span className="text-[14px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                  {sign2Meta.hi.split(' ')[0]}
                </span>
              </div>

              <div className="space-y-1 text-[16px]">
                <div className="flex justify-between py-1 border-b border-stone-100 text-neutral-900">
                  <span>Ruling Deity (स्वामी):</span>
                  <span className="font-bold text-neutral-900">{sign2Meta.lord}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100 text-neutral-900">
                  <span>Elemental Fire/Type (तत्व):</span>
                  <span className="font-bold text-neutral-900 flex items-center gap-1">
                    {getElementIcon(sign2Meta.element)}
                    <span>{sign2Meta.element} Element</span>
                  </span>
                </div>
                <div className="flex justify-between py-1 text-neutral-900">
                  <span>Core Life Drive:</span>
                  <span className="font-bold text-orange-800">{sign2Meta.trait}</span>
                </div>
              </div>

              <div className="bg-orange-50/70 border border-orange-200 p-2 rounded-xl text-[14px] text-orange-950">
                Shapes vitality, decision-making, pride, and partnership goals.
              </div>
            </div>
          </div>

          {/* Elemental Harmony & Leadership Dynamics */}
          <div className="bg-white border border-neutral-200/90 p-4 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <div className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs sm:text-[14px] font-bold font-serif text-neutral-900">
                  Solar Energy Dynamics: {sign1Meta.element} + {sign2Meta.element} Synergy
                </h4>
              </div>
              <span className="text-[14px] text-neutral-900 hidden sm:inline">Pancha Tattva Solar Force</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[16px]">
              <div className="bg-stone-50 border border-neutral-200/80 p-3 rounded-xl space-y-1">
                <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>व्यक्तित्व व अहंकार संतुलन (Ego & Power Balance)</span>
                </div>
                <p className="text-neutral-900 leading-relaxed">
                  {sign1Meta.element === sign2Meta.element
                    ? 'एक ही तत्व होने के कारण दोनों की जीवन शैली और प्राथमिकताओं में स्वाभाविक तालमेल रहेगा।'
                    : (sign1Meta.element === 'Fire' && sign2Meta.element === 'Air') || (sign1Meta.element === 'Air' && sign2Meta.element === 'Fire')
                      ? 'अग्नि और वायु का संयोग दोनों के उत्साह, सामाजिक जीवन एवं आकांक्षाओं को नई ऊर्जा देता है।'
                      : (sign1Meta.element === 'Water' && sign2Meta.element === 'Earth') || (sign1Meta.element === 'Earth' && sign2Meta.element === 'Water')
                        ? 'जल और पृथ्वी का योग जीवन में स्थिरता, व्यावहारिक सहयोग और आर्थिक सुरक्षा प्रदान करता है।'
                        : 'दोनों के दृष्टिकोण में भिन्नता हो सकती है, जिसे आपसी सम्मान और कार्य-विभाजन द्वारा संतुलन दिया जा सकता है।'}
                </p>
              </div>

              <div className="bg-stone-50 border border-neutral-200/80 p-3 rounded-xl space-y-1">
                <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-600" />
                  <span>वैदिक उपाय एवं सुझाव (Vedic Guidance)</span>
                </div>
                <p className="text-neutral-900 leading-relaxed">
                  सूर्य दोनों के आत्म-सम्मान को दर्शाता है। एक-दूसरे के कार्यक्षेत्र और उपलब्धियों की सराहना करने से संबंध सदैव प्रगाढ़ और गरिमापूर्ण बना रहता है।
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={reset}
              className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white text-xs sm:text-sm font-bold py-2.5 px-6 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <RefreshCw className="w-6 h-6" />
              <span>Calculate Another Match</span>
            </button>
            <Link
              to="/book-appointment"
              className="flex items-center space-x-2 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 text-xs sm:text-sm font-bold py-2.5 px-6 rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <Sparkles className="w-6 h-6 text-amber-600" />
              <span>Book Sun Sign & Life Path Consultation</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default SunSignCalculator;
