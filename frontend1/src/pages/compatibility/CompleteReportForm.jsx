import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  FileText,
  Sparkles,
  User,
  Calendar,
  Sun,
  Moon,
  Heart,
  Flame,
  Video,
  ChevronRight,
  Globe,
  Award,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { authAPI, buildAssetUrl } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import CompleteReportView from './CompleteReportView';

const VEDIC_ZODIAC_LIST = [
  { en: 'Aries', hi: 'मेष', symbol: '♈' },
  { en: 'Taurus', hi: 'वृषभ', symbol: '♉' },
  { en: 'Gemini', hi: 'मिथुन', symbol: '♊' },
  { en: 'Cancer', hi: 'कर्क', symbol: '♋' },
  { en: 'Leo', hi: 'सिंह', symbol: '♌' },
  { en: 'Virgo', hi: 'कन्या', symbol: '♍' },
  { en: 'Libra', hi: 'तुला', symbol: '♎' },
  { en: 'Scorpio', hi: 'वृश्चिक', symbol: '♏' },
  { en: 'Sagittarius', hi: 'धनु', symbol: '♐' },
  { en: 'Capricorn', hi: 'मकर', symbol: '♑' },
  { en: 'Aquarius', hi: 'कुंभ', symbol: '♒' },
  { en: 'Pisces', hi: 'मीन', symbol: '♓' }
];

const CompleteReportForm = ({ onBack }) => {
  const { currentLang, changeLanguage, supportedLanguages } = useLanguage();
  const [formData, setFormData] = useState({
    name1: '',
    dob1: '',
    sun1: 'Aries',
    moon1: 'Aries',
    venus1: 'Taurus',
    mars1: 'Scorpio',
    name2: '',
    dob2: '',
    sun2: 'Libra',
    moon2: 'Libra',
    venus2: 'Libra',
    mars2: 'Aries'
  });

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const cleanAstrologerName = (astroName) => {
    if (!astroName) return 'Vedic Expert';
    return astroName
      .replace(/^(Astrologer|Astro\.?|Acharya|Pandit|Dr\.?)\s+/i, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const handleChange = (e, person) => {
    setFormData({
      ...formData,
      [`${e.target.name}${person}`]: e.target.value
    });
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch((import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api') + '/report/compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      setReportData(data);
    } catch (err) {
      console.error(err);
      setError('मास्टर रिपोर्ट तैयार करने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  if (reportData) {
    return <CompleteReportView data={reportData} onBack={() => setReportData(null)} />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 animate-fade-in-up pt-1 pb-16">
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
              Comprehensive Vedic Kundli, Synastry & Master Love Horoscope Consultation
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
            <span>हमारे वरिष्ठ वैदिक ज्योतिषी एवं कुंडली विशेषज्ञ अभी उपलब्ध हैं।</span>
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

            {/* Right Side: Special Consultation Free Callout */}
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
              <span className="text-[12px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-900">
                सम्पूर्ण वैदिक प्रेम एवं अनुकूलता मास्टर रिपोर्ट
              </span>
              <span className="text-[14px] font-semibold text-neutral-900 hidden sm:inline">All-in-One Printable Horoscope & Numerology Document</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black font-serif text-neutral-900 tracking-tight">
              Generate Master Love Report
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

          <div className="flex items-center gap-1.5 text-rose-900 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 text-[14px] font-bold">
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            <span>Multi-Page Comprehensive Vedic PDF</span>
          </div>
        </div>
      </div>

      {/* 3. Side-by-Side 2-Column Form with Vedic Layout */}
      <form onSubmit={handleCalculate} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left Column: Guidance, Overview & Dimensions */}
          <div className="lg:col-span-5 bg-gradient-to-br from-amber-50 via-rose-50/60 to-orange-50/70 border border-amber-200/90 p-5 sm:p-6 rounded-2xl shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-900 border border-rose-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                <span>समस्त वैदिक गणनाओं का महा-विश्लेषण</span>
              </div>

              <div className="space-y-2">
                <p className="text-base sm:text-lg font-bold font-serif text-amber-950 leading-snug">
                  एक ही रिपोर्ट में सूर्य, चंद्र, शुक्र, मंगल, जन्मांक, नामांक व कार्मिक अनुबंधों का सम्पूर्ण समन्वय
                </p>
                <p className="text-xs sm:text-[16px] text-neutral-800 leading-relaxed font-medium">
                  Generates an all-inclusive compatibility dossier combining 8 distinct Vedic methodologies into one elegant, printable summary with remedies.
                </p>
              </div>
            </div>

            {/* Decorative Vedic Highlight Pill */}
            <div className="bg-white/80 border border-amber-200/80 p-3.5 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <Award className="w-4 h-4 text-amber-600" />
                <span>मास्टर रिपोर्ट में सम्मिलित घटक:</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-neutral-700">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>सूर्य व चंद्र समन्वय</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>शुक्र-मंगल आकर्षण</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>वैदिक नामांक व जन्मांक</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>अष्टकूट व ज्योतिषीय उपाय</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Dual-Partner Placement Selectors */}
          <div className="lg:col-span-7 flex flex-col justify-start space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Partner 1 Section */}
              <div className="bg-white border border-amber-600 p-4 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center gap-2 border-b border-amber-100 pb-1.5">
                  <div className="w-5 h-5 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                    1
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900">Partner 1 (प्रथम साथी)</h3>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-[14px] font-bold text-neutral-800 flex items-center gap-1 mb-1">
                      <User className="w-3.5 h-3.5 text-amber-600" />
                      <span>Full Name / पूरा नाम</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name1}
                      onChange={(e) => handleChange(e, 1)}
                      className="w-full bg-stone-50 border border-neutral-600 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-amber-500 transition-all font-medium"
                      placeholder="e.g. Rahul Sharma"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[14px] font-bold text-neutral-800 flex items-center gap-1 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      <span>Date of Birth / जन्म तिथि</span>
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob1}
                      onChange={(e) => handleChange(e, 1)}
                      className="w-full bg-stone-50 border border-neutral-600 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-amber-500 transition-all font-medium cursor-pointer"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-amber-100">
                    <div>
                      <label className="text-[14px] font-bold text-neutral-700 flex items-center gap-1 mb-0.5">
                        <Sun className="w-3 h-3 text-amber-600" />
                        <span>Sun Sign</span>
                      </label>
                      <select
                        name="sun"
                        value={formData.sun1}
                        onChange={(e) => handleChange(e, 1)}
                        className="w-full bg-stone-50 border border-neutral-400 rounded-lg px-2 py-1 text-xs text-neutral-900 focus:outline-none cursor-pointer"
                      >
                        {VEDIC_ZODIAC_LIST.map((s) => (
                          <option key={s.en} value={s.en}>{s.symbol} {s.en}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[14px] font-bold text-neutral-700 flex items-center gap-1 mb-0.5">
                        <Moon className="w-3 h-3 text-blue-500" />
                        <span>Moon Sign</span>
                      </label>
                      <select
                        name="moon"
                        value={formData.moon1}
                        onChange={(e) => handleChange(e, 1)}
                        className="w-full bg-stone-50 border border-neutral-400 rounded-lg px-2 py-1 text-xs text-neutral-900 focus:outline-none cursor-pointer"
                      >
                        {VEDIC_ZODIAC_LIST.map((s) => (
                          <option key={s.en} value={s.en}>{s.symbol} {s.en}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[14px] font-bold text-neutral-700 flex items-center gap-1 mb-0.5">
                        <Heart className="w-3 h-3 text-rose-500" />
                        <span>Venus Sign</span>
                      </label>
                      <select
                        name="venus"
                        value={formData.venus1}
                        onChange={(e) => handleChange(e, 1)}
                        className="w-full bg-stone-50 border border-neutral-400 rounded-lg px-2 py-1 text-xs text-neutral-900 focus:outline-none cursor-pointer"
                      >
                        {VEDIC_ZODIAC_LIST.map((s) => (
                          <option key={s.en} value={s.en}>{s.symbol} {s.en}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[14px] font-bold text-neutral-700 flex items-center gap-1 mb-0.5">
                        <Flame className="w-3 h-3 text-red-500" />
                        <span>Mars Sign</span>
                      </label>
                      <select
                        name="mars"
                        value={formData.mars1}
                        onChange={(e) => handleChange(e, 1)}
                        className="w-full bg-stone-50 border border-neutral-400 rounded-lg px-2 py-1 text-xs text-neutral-900 focus:outline-none cursor-pointer"
                      >
                        {VEDIC_ZODIAC_LIST.map((s) => (
                          <option key={s.en} value={s.en}>{s.symbol} {s.en}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Partner 2 Section */}
              <div className="bg-white border border-rose-600 p-4 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center gap-2 border-b border-rose-100 pb-1.5">
                  <div className="w-5 h-5 rounded-lg bg-rose-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                    2
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900">Partner 2 (द्वितीय साथी)</h3>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-[14px] font-bold text-neutral-800 flex items-center gap-1 mb-1">
                      <User className="w-3.5 h-3.5 text-rose-600" />
                      <span>Full Name / पूरा नाम</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name2}
                      onChange={(e) => handleChange(e, 2)}
                      className="w-full bg-stone-50 border border-neutral-600 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-rose-500 transition-all font-medium"
                      placeholder="e.g. Priya Patel"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[14px] font-bold text-neutral-800 flex items-center gap-1 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-rose-600" />
                      <span>Date of Birth / जन्म तिथि</span>
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob2}
                      onChange={(e) => handleChange(e, 2)}
                      className="w-full bg-stone-50 border border-neutral-600 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-rose-500 transition-all font-medium cursor-pointer"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-rose-100">
                    <div>
                      <label className="text-[14px] font-bold text-neutral-700 flex items-center gap-1 mb-0.5">
                        <Sun className="w-3 h-3 text-amber-600" />
                        <span>Sun Sign</span>
                      </label>
                      <select
                        name="sun"
                        value={formData.sun2}
                        onChange={(e) => handleChange(e, 2)}
                        className="w-full bg-stone-50 border border-neutral-400 rounded-lg px-2 py-1 text-xs text-neutral-900 focus:outline-none cursor-pointer"
                      >
                        {VEDIC_ZODIAC_LIST.map((s) => (
                          <option key={s.en} value={s.en}>{s.symbol} {s.en}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[14px] font-bold text-neutral-700 flex items-center gap-1 mb-0.5">
                        <Moon className="w-3 h-3 text-blue-500" />
                        <span>Moon Sign</span>
                      </label>
                      <select
                        name="moon"
                        value={formData.moon2}
                        onChange={(e) => handleChange(e, 2)}
                        className="w-full bg-stone-50 border border-neutral-400 rounded-lg px-2 py-1 text-xs text-neutral-900 focus:outline-none cursor-pointer"
                      >
                        {VEDIC_ZODIAC_LIST.map((s) => (
                          <option key={s.en} value={s.en}>{s.symbol} {s.en}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[14px] font-bold text-neutral-700 flex items-center gap-1 mb-0.5">
                        <Heart className="w-3 h-3 text-rose-500" />
                        <span>Venus Sign</span>
                      </label>
                      <select
                        name="venus"
                        value={formData.venus2}
                        onChange={(e) => handleChange(e, 2)}
                        className="w-full bg-stone-50 border border-neutral-400 rounded-lg px-2 py-1 text-xs text-neutral-900 focus:outline-none cursor-pointer"
                      >
                        {VEDIC_ZODIAC_LIST.map((s) => (
                          <option key={s.en} value={s.en}>{s.symbol} {s.en}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[14px] font-bold text-neutral-700 flex items-center gap-1 mb-0.5">
                        <Flame className="w-3 h-3 text-red-500" />
                        <span>Mars Sign</span>
                      </label>
                      <select
                        name="mars"
                        value={formData.mars2}
                        onChange={(e) => handleChange(e, 2)}
                        className="w-full bg-stone-50 border border-neutral-400 rounded-lg px-2 py-1 text-xs text-neutral-900 focus:outline-none cursor-pointer"
                      >
                        {VEDIC_ZODIAC_LIST.map((s) => (
                          <option key={s.en} value={s.en}>{s.symbol} {s.en}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm text-center font-semibold">
                {error}
              </div>
            )}

            {/* Compact Submission Button */}
            <div>
              <button
                type="submit"
                disabled={loading || !formData.name1 || !formData.dob1 || !formData.name2 || !formData.dob2}
                className="w-full bg-gradient-to-r from-amber-600 via-rose-600 to-amber-700 hover:from-amber-700 hover:via-rose-700 hover:to-amber-800 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>सम्पूर्ण मास्टर रिपोर्ट तैयार हो रही है...</span>
                  </span>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Generate Master Love Report</span>
                    <Sparkles className="w-4 h-4 text-amber-200" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CompleteReportForm;
