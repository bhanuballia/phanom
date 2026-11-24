import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  Calendar,
  Sparkles,
  Video,
  ChevronRight,
  Globe,
  Compass,
  Award,
  Star,
  Zap,
  Heart,
  Infinity,
  Flame,
  Hexagon
} from 'lucide-react';
import { authAPI, buildAssetUrl } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

const RelationshipPathCalculator = ({ onBack }) => {
  const { currentLang, changeLanguage, supportedLanguages } = useLanguage();
  const [dob1, setDob1] = useState('');
  const [dob2, setDob2] = useState('');
  const [result, setResult] = useState(null);
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

  const handleCalculate = async (e) => {
    e.preventDefault();
    if (!dob1 || !dob2) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch((import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api') + '/numerology/relationship-path', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dob1, dob2 }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('रिलेशनशिप पाथ व संयुक्त भाग्य गणना में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setDob1('');
    setDob2('');
    setError(null);
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
              Vedic Karmic Destiny & Joint Relationship Path Consultation
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
            <span>हमारे वरिष्ठ वैदिक अंकशास्त्री एवं ज्योतिषी अभी उपलब्ध हैं।</span>
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
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-900">
                संयुक्त संबंध पथ व कार्मिक उद्देश्य
              </span>
              <span className="text-[10px] font-semibold text-neutral-500 hidden sm:inline">The Relationship Path & Joint Destiny</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black font-serif text-neutral-900 tracking-tight">
              The Relationship Path Calculator
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

          <div className="flex items-center gap-1.5 text-purple-900 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 text-xs font-bold">
            <Infinity className="w-3.5 h-3.5 text-purple-600" />
            <span>Joint Soul Purpose & Life Path Synthesis</span>
          </div>
        </div>
      </div>

      {/* 3. Form or Result Overview */}
      {!result ? (
        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left Column: Relationship Path Guidance & Philosophy */}
            <div className="lg:col-span-5 bg-gradient-to-br from-amber-50 via-purple-50/50 to-indigo-50/60 border border-amber-200/90 p-5 sm:p-6 rounded-2xl shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-300 text-xs font-bold uppercase tracking-wider">
                  <Hexagon className="w-3.5 h-3.5 text-purple-600" />
                  <span>संयुक्त कार्मिक संबंध पथ</span>
                </div>

                <div className="space-y-2">
                  <p className="text-base sm:text-lg font-bold font-serif text-amber-950 leading-snug">
                    दो आत्माओं का मिलन केवल संयोग नहीं, अपितु एक साझा जीवन पथ और आध्यात्मिक उद्देश्य का प्रतीक है
                  </p>
                  <p className="text-xs sm:text-[16px] text-neutral-800 leading-relaxed font-medium">
                    By combining both partners' Life Path numbers, uncover the collective mission, growth trajectory, and ultimate destiny of your bond.
                  </p>
                </div>
              </div>

              {/* Decorative Vedic Highlight Pill */}
              <div className="bg-white/80 border border-amber-200/80 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>संयुक्त पथ विश्लेषण के प्रमुख आयाम:</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-neutral-700">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>साझा जीवन उद्देश्य (Joint Destiny)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                    <span>कार्मिक पाठ (Karmic Lessons)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>सामंजस्य शक्ति (Synergy Power)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>भविष्य स्थायित्व (Long-term Harmony)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: DOB Selectors + Calculate Button */}
            <div className="lg:col-span-7 flex flex-col justify-start space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Partner 1 DOB */}
                <div className="bg-white border border-indigo-600 p-3.5 sm:p-5 rounded-2xl space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-indigo-100 pb-1.5">
                    <div className="w-5 h-5 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                      1
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900">Partner 1 (प्रथम साथी)</h3>
                  </div>

                  <div className="space-y-1.5 pt-0.5">
                    <label className="text-[16px] font-bold text-neutral-800 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Date of Birth / जन्म तिथि</span>
                    </label>
                    <input
                      type="date"
                      value={dob1}
                      onChange={(e) => setDob1(e.target.value)}
                      className="w-full bg-stone-50 border border-neutral-600 rounded-xl px-3 py-2 text-neutral-900 focus:outline-none focus:border-indigo-500 transition-all text-xs sm:text-sm font-medium cursor-pointer"
                      required
                    />
                    <p className="text-[11px] text-neutral-500 font-medium">
                      Determines Partner 1's Life Path Vibration
                    </p>
                  </div>
                </div>

                {/* Partner 2 DOB */}
                <div className="bg-white border border-purple-600 p-3.5 sm:p-5 rounded-2xl space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-purple-100 pb-1.5">
                    <div className="w-5 h-5 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                      2
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900">Partner 2 (द्वितीय साथी)</h3>
                  </div>

                  <div className="space-y-1.5 pt-0.5">
                    <label className="text-[16px] font-bold text-neutral-800 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-purple-600" />
                      <span>Date of Birth / जन्म तिथि</span>
                    </label>
                    <input
                      type="date"
                      value={dob2}
                      onChange={(e) => setDob2(e.target.value)}
                      className="w-full bg-stone-50 border border-neutral-600 rounded-xl px-3 py-2 text-neutral-900 focus:outline-none focus:border-purple-500 transition-all text-xs sm:text-sm font-medium cursor-pointer"
                      required
                    />
                    <p className="text-[11px] text-neutral-500 font-medium">
                      Determines Partner 2's Life Path Vibration
                    </p>
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
                  disabled={loading || !dob1 || !dob2}
                  className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 hover:from-indigo-700 hover:to-rose-700 text-white font-bold py-3 px-6 rounded-2xl shadow-md shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>संयुक्त संबंध पथ का विश्लेषण हो रहा है...</span>
                    </span>
                  ) : (
                    <>
                      <span>Reveal Relationship Destiny</span>
                      <Infinity className="w-4 h-4 text-white" />
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
                <span className="text-[14px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300">
                  ✓ विश्लेषण पूर्ण (Analysis Completed)
                </span>
                <span className="text-[14px] font-semibold text-neutral-900 bg-stone-50 px-2 py-0.5 rounded border border-neutral-200">
                  Vedic Joint Destiny Synthesis
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black font-serif text-neutral-900 tracking-tight">
                Your Shared Relationship Destiny
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-center px-4 py-1.5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-purple-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900 block">Joint Path</span>
                <span className="text-2xl font-black text-purple-700">Number {result.relationshipNumber}</span>
              </div>

              <button
                onClick={reset}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-neutral-800 text-xs font-bold transition-all border border-neutral-300 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Calculate Another Path</span>
              </button>
            </div>
          </div>

          {/* Result Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {/* 1. Partner 1 Life Path */}
            <div className="bg-white border border-indigo-200 rounded-2xl p-5 shadow-xs flex flex-col items-center justify-between text-center space-y-3">
              <div className="w-full">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200">
                  Partner 1 Life Path
                </span>
                <h4 className="text-base font-bold text-neutral-900 mt-2">{dob1}</h4>
              </div>

              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 text-white flex items-center justify-center text-3xl font-black shadow-md border-2 border-white">
                {result.lifePath1}
              </div>

              <div className="text-[16px] text-neutral-900">
                Individual Life Path Vibration & Soul Lesson.
              </div>
            </div>

            {/* 2. Joint Destiny Center Hexagon */}
            <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-2 border-purple-300 rounded-2xl p-5 shadow-xs flex flex-col items-center justify-center text-center space-y-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-purple-500/5 pointer-events-none"></div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-900">Collective Life Path Number</span>
              <div className="w-24 h-24 relative flex items-center justify-center my-1">
                <Hexagon className="w-24 h-24 text-purple-600 fill-purple-100/50" strokeWidth={1.5} />
                <span className="absolute text-4xl font-black text-purple-900">
                  {result.relationshipNumber}
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-purple-900">
                "{result.title}"
              </h4>
              <span className="text-[16px] font-semibold px-3 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                Shared Soul Contract
              </span>
            </div>

            {/* 3. Partner 2 Life Path */}
            <div className="bg-white border border-purple-200 rounded-2xl p-5 shadow-xs flex flex-col items-center justify-between text-center space-y-3">
              <div className="w-full">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                  Partner 2 Life Path
                </span>
                <h4 className="text-base font-bold text-neutral-900 mt-2">{dob2}</h4>
              </div>

              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-500 to-rose-500 text-white flex items-center justify-center text-3xl font-black shadow-md border-2 border-white">
                {result.lifePath2}
              </div>

              <div className="text-[16px] text-neutral-900">
                Individual Life Path Vibration & Soul Lesson.
              </div>
            </div>
          </div>

          {/* Detailed Analysis & Spiritual Meaning */}
          <div className="bg-white border border-amber-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-amber-100 pb-2">
              <Award className="w-5 h-5 text-purple-600" />
              <h4 className="text-sm sm:text-base font-bold text-neutral-900">
                Karmic Purpose & Destiny Guidance
              </h4>
            </div>

            <p className="text-sm sm:text-base text-neutral-800 leading-relaxed font-medium">
              {result.message}
            </p>
          </div>

          {/* Action Bar */}
          <div className="bg-stone-50 border border-neutral-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[18px] text-neutral-900 text-center sm:text-left">
              Want to consult on timing auspicious milestones (Muhurta, marriage, joint investments)?
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/astrologers"
                className="bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-bold text-[16px] px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Speak with Astrologer</span>
              </Link>
              <button
                onClick={reset}
                className="bg-white hover:bg-neutral-100 text-neutral-800 font-bold text-[16px] px-4 py-2 rounded-xl border border-neutral-300 transition-all flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RelationshipPathCalculator;
