import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  User,
  Calendar,
  Sparkles,
  Video,
  ChevronRight,
  Globe,
  Compass,
  Award,
  Star,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { authAPI, buildAssetUrl } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

const PersonalAlignmentCalculator = ({ onBack }) => {
  const { currentLang, changeLanguage, supportedLanguages } = useLanguage();
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
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
    if (!name || !dob) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch((import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api') + '/numerology/alignment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, dob }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('नामांक एवं जन्मांक समन्वय गणना में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setName('');
    setDob('');
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
              Vedic Nama Anka, Janma Anka & Lucky Name Spelling Consultation
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
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-teal-100 text-teal-900">
                व्यक्तिगत नामांक एवं जन्मांक समन्वय
              </span>
              <span className="text-[10px] font-semibold text-neutral-500 hidden sm:inline">Personal Name & Life Path Alignment</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black font-serif text-neutral-900 tracking-tight">
              Personal Name & Destiny Alignment
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

          <div className="flex items-center gap-1.5 text-teal-900 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200 text-xs font-bold">
            <Compass className="w-3.5 h-3.5 text-teal-600" />
            <span>Nama Anka & Janma Anka Synergy</span>
          </div>
        </div>
      </div>

      {/* 3. Form or Result Overview */}
      {!result ? (
        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left Column: Vedic Alignment Philosophy & Guidance */}
            <div className="lg:col-span-5 bg-gradient-to-br from-amber-50 via-teal-50/50 to-emerald-50/60 border border-amber-200/90 p-5 sm:p-6 rounded-2xl shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-900 border border-teal-300 text-xs font-bold uppercase tracking-wider">
                  <Compass className="w-3.5 h-3.5 text-teal-600" />
                  <span>वैदिक नामांक एवं जन्मांक समन्वय</span>
                </div>

                <div className="space-y-2">
                  <p className="text-base sm:text-lg font-bold font-serif text-amber-950 leading-snug">
                    जब आपका नाम (Destiny) आपकी जन्मतिथि (Life Path) के साथ पूर्ण सामंजस्य में होता है, तो भाग्य व सफलता स्वतः प्राप्त होती है
                  </p>
                  <p className="text-xs sm:text-[16px] text-neutral-800 leading-relaxed font-medium">
                    Discover if your Full Name vibration naturally accelerates your Date of Birth destiny or creates subtle energetic friction.
                  </p>
                </div>
              </div>

              {/* Decorative Vedic Highlight Pill */}
              <div className="bg-white/80 border border-amber-200/80 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>समन्वय विश्लेषण के प्रमुख आयाम:</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-neutral-700">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    <span>नामांक (Destiny Number)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-600" />
                    <span>जन्मांक (Life Path Number)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>ग्रह मित्रता (Planetary Lord)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span>लकी स्पेलिंग (Lucky Correction)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Name & DOB Inputs + Calculate Button */}
            <div className="lg:col-span-7 flex flex-col justify-start space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Name Input */}
                <div className="bg-white border border-teal-600 p-3.5 sm:p-5 rounded-2xl space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-teal-100 pb-1.5">
                    <div className="w-5 h-5 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900">Your Full Name (पूरा नाम)</h3>
                  </div>

                  <div className="space-y-1.5 pt-0.5">
                    <label className="text-[16px] font-bold text-neutral-800 flex items-center gap-1">
                      <span>Full Legal / Used Name</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-stone-50 border border-neutral-600 rounded-xl px-3 py-2 text-neutral-900 focus:outline-none focus:border-teal-500 transition-all text-xs sm:text-sm font-medium"
                      placeholder="e.g. Rahul Sharma"
                      required
                    />
                    <p className="text-[14px] text-neutral-900 font-medium">
                      Calculates your Chaldean & Pythagorean Destiny Number
                    </p>
                  </div>
                </div>

                {/* Date of Birth Input */}
                <div className="bg-white border border-cyan-600 p-3.5 sm:p-5 rounded-2xl space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-cyan-100 pb-1.5">
                    <div className="w-5 h-5 rounded-lg bg-cyan-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900">Date of Birth (जन्म तिथि)</h3>
                  </div>

                  <div className="space-y-1.5 pt-0.5">
                    <label className="text-[16px] font-bold text-neutral-800 flex items-center gap-1">
                      <span>Birth Date</span>
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full bg-stone-50 border border-neutral-600 rounded-xl px-3 py-2 text-neutral-900 focus:outline-none focus:border-cyan-500 transition-all text-xs sm:text-sm font-medium cursor-pointer"
                      required
                    />
                    <p className="text-[14px] text-neutral-900 font-medium">
                      Determines your Life Path (Mūlānka / Bhāgyānka)
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
                  disabled={loading || !name || !dob}
                  className="w-full bg-gradient-to-r from-amber-900 via-orange-600 to-amber-900 hover:from-teal-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-2xl shadow-md shadow-teal-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-[20px]"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>नामांक एवं जन्मांक समन्वय का विश्लेषण हो रहा है...</span>
                    </span>
                  ) : (
                    <>
                      <span>Analyze Personal Alignment</span>
                      <Compass className="w-4 h-4 text-white" />
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
                <span className="text-[14px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-300">
                  ✓ विश्लेषण पूर्ण (Analysis Completed)
                </span>
                <span className="text-[14px] font-semibold text-neutral-900 bg-stone-50 px-2 py-0.5 rounded border border-neutral-200">
                  Vedic Nama Anka & Janma Anka Synthesis
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black font-serif text-neutral-900 tracking-tight">
                Personal Destiny & Vibrational Alignment
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-center px-4 py-1.5 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl border border-teal-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-900 block">Harmony Score</span>
                <span className="text-2xl font-black text-teal-700">{result.compatibilityScore}%</span>
              </div>

              <button
                onClick={reset}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-neutral-800 text-xs font-bold transition-all border border-neutral-300 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Check Another Name</span>
              </button>
            </div>
          </div>

          {/* Result Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {/* 1. Destiny Number (Name) */}
            <div className="bg-white border border-teal-200 rounded-2xl p-5 shadow-xs flex flex-col items-center justify-between text-center space-y-3">
              <div className="w-full">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-200">
                  Nama Anka (Destiny)
                </span>
                <h4 className="text-base font-bold text-neutral-900 mt-2 truncate">{name}</h4>
              </div>

              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-500 text-white flex items-center justify-center text-3xl font-black shadow-md border-2 border-white">
                {result.destinyNumber}
              </div>

              <div className="text-[16px] text-neutral-900">
                External expression, career archetype, and social recognition frequency.
              </div>
            </div>

            {/* 2. Alignment Gauge */}
            <div className="bg-gradient-to-br from-teal-50 via-white to-cyan-50 border-2 border-teal-300 rounded-2xl p-5 shadow-xs flex flex-col items-center justify-center text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-900">Vibrational Synthesis</span>
              <div className="text-4xl sm:text-5xl font-black text-teal-700">
                {result.compatibilityScore}%
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-100 text-teal-900 border border-teal-300">
                {result.compatibilityScore >= 75 ? '★ Excellent Harmony' : result.compatibilityScore >= 50 ? '✓ Balanced Harmony' : '⚠ Correction Recommended'}
              </span>
              <p className="text-[16px] text-neutral-900 pt-1">
                {result.compatibilityScore >= 75
                  ? 'Your name and birth date resonate in natural synchronization.'
                  : 'A minor name spelling modification can unblock greater prosperity.'}
              </p>
            </div>

            {/* 3. Life Path Number (DOB) */}
            <div className="bg-white border border-cyan-200 rounded-2xl p-5 shadow-xs flex flex-col items-center justify-between text-center space-y-3">
              <div className="w-full">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-900 border border-cyan-200">
                  Janma Anka (Life Path)
                </span>
                <h4 className="text-base font-bold text-neutral-900 mt-2">{dob}</h4>
              </div>

              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-500 text-white flex items-center justify-center text-3xl font-black shadow-md border-2 border-white">
                {result.lifePathNumber}
              </div>

              <div className="text-[16px] text-neutral-900">
                Soul intention, karmic blueprint, and foundational life lessons.
              </div>
            </div>
          </div>

          {/* Detailed Analysis & Suggestion Cards */}
          <div className="bg-white border border-amber-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-amber-100 pb-2">
              <Award className="w-5 h-5 text-amber-600" />
              <h4 className="text-sm sm:text-base font-bold text-neutral-900">
                Detailed Vedic Numerology Analysis
              </h4>
            </div>

            <p className="text-sm sm:text-[16px] text-neutral-800 leading-relaxed font-medium">
              {result.message}
            </p>

            {result.suggestion && (
              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-xl p-4 flex items-start gap-3">
                <Zap className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-900 block mb-0.5">
                    Vedic Recommendation & Name Tuning:
                  </span>
                  <p className="text-xs sm:text-[16px] text-neutral-900 leading-relaxed font-medium">
                    {result.suggestion}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="bg-stone-50 border border-neutral-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[16px] text-neutral-900 text-center sm:text-left">
              Want to consult on personalized lucky name spelling or infant naming?
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/astrologers"
                className="bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-bold text-[18px] px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Speak with Numerologist</span>
              </Link>
              <button
                onClick={reset}
                className="bg-white hover:bg-neutral-100 text-neutral-800 font-bold text-xs px-4 py-2 rounded-xl border border-neutral-300 transition-all flex items-center gap-1.5"
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

export default PersonalAlignmentCalculator;
