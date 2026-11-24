import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  Heart,
  Moon,
  Sparkles,
  Video,
  ChevronRight,
  Flame,
  Droplet,
  Wind,
  Mountain,
  Compass,
  ShieldCheck,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { authAPI, buildAssetUrl } from '../../services/api';

const VEDIC_MOON_SIGNS = [
  { en: 'Aries', hi: 'मेष (Mesh)', element: 'Fire', lord: 'Mars (Mangal)', symbol: '♈' },
  { en: 'Taurus', hi: 'वृषभ (Vrishabha)', element: 'Earth', lord: 'Venus (Shukra)', symbol: '♉' },
  { en: 'Gemini', hi: 'मिथुन (Mithun)', element: 'Air', lord: 'Mercury (Budh)', symbol: '♊' },
  { en: 'Cancer', hi: 'कर्क (Kark)', element: 'Water', lord: 'Moon (Chandra)', symbol: '♋' },
  { en: 'Leo', hi: 'सिंह (Simha)', element: 'Fire', lord: 'Sun (Surya)', symbol: '♌' },
  { en: 'Virgo', hi: 'कन्या (Kanya)', element: 'Earth', lord: 'Mercury (Budh)', symbol: '♍' },
  { en: 'Libra', hi: 'तुला (Tula)', element: 'Air', lord: 'Venus (Shukra)', symbol: '♎' },
  { en: 'Scorpio', hi: 'वृश्चिक (Vrishchik)', element: 'Water', lord: 'Mars (Mangal)', symbol: '♏' },
  { en: 'Sagittarius', hi: 'धनु (Dhanu)', element: 'Fire', lord: 'Jupiter (Guru)', symbol: '♐' },
  { en: 'Capricorn', hi: 'मकर (Makar)', element: 'Earth', lord: 'Saturn (Shani)', symbol: '♑' },
  { en: 'Aquarius', hi: 'कुंभ (Kumbh)', element: 'Air', lord: 'Saturn (Shani)', symbol: '♒' },
  { en: 'Pisces', hi: 'मीन (Meen)', element: 'Water', lord: 'Jupiter (Guru)', symbol: '♓' }
];

const MoonSignCalculator = ({ onBack }) => {
  const [sign1, setSign1] = useState('Aries');
  const [sign2, setSign2] = useState('Aries');
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
      const response = await fetch((import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api') + '/astrology/compatibility/moon', {
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
      setError('चंद्र राशि अनुकूलता गणना में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  const sign1Meta = VEDIC_MOON_SIGNS.find((s) => s.en.toLowerCase() === (result?.sign1 || sign1).toLowerCase()) || VEDIC_MOON_SIGNS[0];
  const sign2Meta = VEDIC_MOON_SIGNS.find((s) => s.en.toLowerCase() === (result?.sign2 || sign2).toLowerCase()) || VEDIC_MOON_SIGNS[0];

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
        return <Sparkles className="w-3.5 h-3.5 text-indigo-500" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 animate-fade-in-up">
      {/* 1. Live Astrologer Strip (Compact with First Consultation Free) */}
      <div className="bg-gradient-to-r from-white via-rose-50/50 to-amber-50/60 border border-rose-200/90 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl shadow-xs space-y-1.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-rose-100 pb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <span className="text-[14px] sm:text-xs font-extrabold uppercase tracking-wider text-rose-900 font-serif flex items-center gap-1.5">
              <span>लाइव ज्योतिषी से तुरंत परामर्श लें</span>
              <span className="text-[14px] font-sans font-bold text-rose-700 bg-rose-100 border border-rose-200 px-1.5 py-0.2 rounded-full">
                LIVE NOW
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[14px] text-neutral-900 hidden md:inline">
              Vedic Chandra Rashi & Emotional Compatibility Guidance
            </span>
            <Link
              to="/live-astrologers"
              className="inline-flex items-center gap-1 text-[14px] font-bold text-rose-700 hover:text-rose-900 transition-colors bg-white px-2 py-0.5 rounded-lg border border-rose-200 shadow-2xs"
            >
              <span>View All</span>
              <ChevronRight className="w-3 h-3" />
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
          <div className="bg-white border border-rose-100 p-2 rounded-xl flex items-center justify-between text-xs text-neutral-600">
            <span>हमारे वरिष्ठ वैदिक ज्योतिषी अभी उपलब्ध हैं।</span>
            <Link
              to="/live-astrologers"
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 text-xs"
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
                      <div className="w-11 h-11 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-neutral-900 border border-white flex items-center justify-center">
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

                    <span className="mt-1 text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-rose-600 transition-colors text-center truncate max-w-[65px] sm:max-w-[75px] block leading-tight">
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
                className="group relative flex items-center gap-2.5 bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 hover:from-amber-600 hover:via-rose-600 hover:to-pink-700 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border border-amber-300/40 cursor-pointer overflow-hidden text-center"
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
                  <div className="text-[14px] font-bold text-amber-100 flex items-center gap-1">
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
      <div className="bg-white border border-rose-200/80 px-4 sm:px-6 py-3.5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
              <span className="text-[14px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900">
                वैदिक चंद्र राशि मिलान
              </span>
              <span className="text-[14px] font-semibold text-neutral-900 hidden sm:inline">Moon Sign Compatibility</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black font-serif text-neutral-900 tracking-tight">
              Match Compatibility By Moon Sign
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200 text-xs font-bold">
            <Moon className="w-3.5 h-3.5 text-indigo-600 fill-indigo-200" />
            <span>Emotional & Mental Wave Alignment</span>
          </div>
        </div>
      </div>

      {/* 3. Form or Result Overview */}
      {!result ? (
        <form onSubmit={handleCalculate} className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <p className="text-sm sm:text-base font-semibold text-neutral-800">
              वैदिक ज्योतिष में चंद्र राशि से मन, भावनात्मक जुड़ाव एवं आंतरिक समझ का आकलन किया जाता है
            </p>
            <p className="text-xs text-neutral-500">
              Select both partners' Moon signs (चंद्र राशि) to compute emotional compatibility and elemental balance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {/* Person 1 Moon Sign */}
            <div className="bg-white border border-indigo-200/80 p-5 rounded-2xl space-y-3.5 shadow-sm">
              <div className="flex items-center gap-2 border-b border-indigo-100 pb-2.5">
                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                  1
                </div>
                <h3 className="text-sm font-bold text-neutral-900">Partner 1 Moon Sign (प्रथम साथी)</h3>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800 flex items-center gap-1">
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Select Moon Sign (चंद्र राशि)</span>
                </label>
                <select
                  value={sign1}
                  onChange={(e) => setSign1(e.target.value)}
                  className="w-full bg-stone-50 border border-neutral-300 rounded-xl px-4 py-2.5 text-neutral-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm font-medium cursor-pointer"
                  required
                >
                  {VEDIC_MOON_SIGNS.map((s) => (
                    <option key={s.en} value={s.en}>
                      {s.symbol} {s.en} - {s.hi} ({s.element})
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
                  <span>Lord: {VEDIC_MOON_SIGNS.find(s => s.en === sign1)?.lord}</span>
                  <span className="font-semibold text-indigo-700">Element: {VEDIC_MOON_SIGNS.find(s => s.en === sign1)?.element}</span>
                </div>
              </div>
            </div>

            {/* Person 2 Moon Sign */}
            <div className="bg-white border border-rose-200/80 p-5 rounded-2xl space-y-3.5 shadow-sm">
              <div className="flex items-center gap-2 border-b border-rose-100 pb-2.5">
                <div className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                  2
                </div>
                <h3 className="text-sm font-bold text-neutral-900">Partner 2 Moon Sign (द्वितीय साथी)</h3>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800 flex items-center gap-1">
                  <Moon className="w-3.5 h-3.5 text-rose-600" />
                  <span>Select Moon Sign (चंद्र राशि)</span>
                </label>
                <select
                  value={sign2}
                  onChange={(e) => setSign2(e.target.value)}
                  className="w-full bg-stone-50 border border-neutral-300 rounded-xl px-4 py-2.5 text-neutral-900 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all text-sm font-medium cursor-pointer"
                  required
                >
                  {VEDIC_MOON_SIGNS.map((s) => (
                    <option key={s.en} value={s.en}>
                      {s.symbol} {s.en} - {s.hi} ({s.element})
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
                  <span>Lord: {VEDIC_MOON_SIGNS.find(s => s.en === sign2)?.lord}</span>
                  <span className="font-semibold text-rose-700">Element: {VEDIC_MOON_SIGNS.find(s => s.en === sign2)?.element}</span>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm text-center font-semibold max-w-md mx-auto">
              {error}
            </div>
          )}

          <div className="max-w-md mx-auto">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 hover:from-indigo-700 hover:to-rose-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>चंद्र युति एवं तत्व विश्लेषण हो रहा है...</span>
                </span>
              ) : (
                <>
                  <span>Calculate Moon Sign Compatibility</span>
                  <Moon className="w-4 h-4 fill-white" />
                </>
              )}
            </button>
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
                  Vedic Lunar Transit & Element Synergy
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black font-serif text-neutral-900 tracking-tight">
                Moon Sign Harmony & Emotional Connection
              </h3>
              <p className="text-xs sm:text-[16px] text-neutral-900">
                Emotional union between <strong className="text-indigo-800 font-bold">{result.sign1}</strong> ({sign1Meta.hi}) &{' '}
                <strong className="text-rose-700 font-bold">{result.sign2}</strong> ({sign2Meta.hi})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={reset}
                className="flex items-center gap-1.5 bg-white hover:bg-neutral-100 text-neutral-800 font-bold text-xs py-2 px-3 rounded-xl border border-neutral-300 shadow-2xs transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                <span>Try Another Match</span>
              </button>
              <Link
                to="/live-astrologers"
                className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-700 hover:to-rose-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl shadow-2xs transition-all"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Talk to Astrologer</span>
              </Link>
            </div>
          </div>

          {/* 3-Column Core Metric Row: Compatibility Score, Partner 1 Moon Sign, Partner 2 Moon Sign */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            {/* Overall Compatibility Card */}
            <div className="md:col-span-4 bg-gradient-to-br from-indigo-50 via-purple-50/50 to-rose-50 border border-indigo-200/90 p-4 rounded-2xl flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between border-b border-indigo-200/60 pb-2">
                <span className="text-[16px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                  <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
                  <span>Emotional Harmony Score</span>
                </span>
                <span className="text-2xl sm:text-3xl font-black font-serif text-indigo-800">
                  {result.compatibilityScore}%
                </span>
              </div>

              <p className="text-[14px] text-neutral-900 font-medium leading-relaxed">
                {result.message}
              </p>

              <div className="bg-white/80 border border-indigo-200 px-3 py-1.5 rounded-xl flex items-center justify-between text-[14px] font-bold text-neutral-800">
                <span>Vedic Moon Alignment:</span>
                <span className="text-emerald-700">
                  {result.compatibilityScore >= 70 ? '★ Highly Compatible' : result.compatibilityScore >= 50 ? 'Balanced & Supportive' : 'Requires Patience & Empathy'}
                </span>
              </div>
            </div>

            {/* Partner 1 Moon Sign Card */}
            <div className="md:col-span-4 bg-white border border-indigo-200/80 p-4 rounded-2xl flex flex-col justify-between space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl">{sign1Meta.symbol}</span>
                  <span className="text-[16px] font-bold text-indigo-900">
                    Partner 1: {result.sign1}
                  </span>
                </div>
                <span className="text-[14px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                  {sign1Meta.hi.split(' ')[0]}
                </span>
              </div>

              <div className="space-y-1 text-[16px]">
                <div className="flex justify-between py-1 border-b border-stone-100 text-neutral-900">
                  <span>Ruling Planet (स्वामी):</span>
                  <span className="font-bold text-neutral-900">{sign1Meta.lord}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100 text-neutral-900">
                  <span>Elemental Nature (तत्व):</span>
                  <span className="font-bold text-neutral-900 flex items-center gap-1">
                    {getElementIcon(sign1Meta.element)}
                    <span>{sign1Meta.element} Element</span>
                  </span>
                </div>
                <div className="flex justify-between py-1 text-neutral-900">
                  <span>Mental Wave:</span>
                  <span className="font-bold text-indigo-700">Emotional Core</span>
                </div>
              </div>

              <div className="bg-indigo-50/70 border border-indigo-200 p-2 rounded-xl text-[14px] text-indigo-900">
                Governs inner feelings, emotional security, and instincts.
              </div>
            </div>

            {/* Partner 2 Moon Sign Card */}
            <div className="md:col-span-4 bg-white border border-rose-200/80 p-4 rounded-2xl flex flex-col justify-between space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between border-b border-rose-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl">{sign2Meta.symbol}</span>
                  <span className="text-[16px] font-bold text-rose-900">
                    Partner 2: {result.sign2}
                  </span>
                </div>
                <span className="text-[14px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  {sign2Meta.hi.split(' ')[0]}
                </span>
              </div>

              <div className="space-y-1 text-[16px]">
                <div className="flex justify-between py-1 border-b border-stone-100 text-neutral-900">
                  <span>Ruling Planet (स्वामी):</span>
                  <span className="font-bold text-neutral-900">{sign2Meta.lord}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100 text-neutral-900">
                  <span>Elemental Nature (तत्व):</span>
                  <span className="font-bold text-neutral-900 flex items-center gap-1">
                    {getElementIcon(sign2Meta.element)}
                    <span>{sign2Meta.element} Element</span>
                  </span>
                </div>
                <div className="flex justify-between py-1 text-neutral-900">
                  <span>Mental Wave:</span>
                  <span className="font-bold text-rose-700">Emotional Expression</span>
                </div>
              </div>

              <div className="bg-rose-50/70 border border-rose-200 p-2 rounded-xl text-[14px] text-rose-900">
                Shapes emotional reactions, nurturing style, and domestic peace.
              </div>
            </div>
          </div>

          {/* Elemental Harmony Breakdown */}
          <div className="bg-white border border-neutral-200/90 p-4 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <div className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs sm:text-[16px] font-bold font-serif text-neutral-900">
                  Elemental Dynamics: {sign1Meta.element} + {sign2Meta.element} Synergy
                </h4>
              </div>
              <span className="text-[16px] text-neutral-500 hidden sm:inline">Pancha Tattva Harmony</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[16px]">
              <div className="bg-stone-50 border border-neutral-200/80 p-3 rounded-xl space-y-1">
                <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>तत्व अनुकूलता (Elemental Chemistry)</span>
                </div>
                <p className="text-neutral-900 leading-relaxed">
                  {sign1Meta.element === sign2Meta.element
                    ? 'समान तत्व होने के कारण दोनों में स्वाभाविक समझ और विचारों में समानता रहेगी।'
                    : (sign1Meta.element === 'Fire' && sign2Meta.element === 'Air') || (sign1Meta.element === 'Air' && sign2Meta.element === 'Fire')
                      ? 'अग्नि और वायु का संबंध परस्पर प्रेरणादायक और उत्साहवर्धक रहता है।'
                      : (sign1Meta.element === 'Water' && sign2Meta.element === 'Earth') || (sign1Meta.element === 'Earth' && sign2Meta.element === 'Water')
                        ? 'जल और पृथ्वी का मिलन पोषण, स्थिरता और दीर्घकालिक सुरक्षा प्रदान करता है।'
                        : 'विपरीत तत्वों के कारण भावनात्मक संतुलन बनाए रखने के लिए संवाद की आवश्यकता रहेगी।'}
                </p>
              </div>

              <div className="bg-stone-50 border border-neutral-200/80 p-3 rounded-xl space-y-1">
                <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-indigo-600" />
                  <span>ज्योतिषीय परामर्श (Astrological Advice)</span>
                </div>
                <p className="text-neutral-900 leading-relaxed">
                  चंद्रमा मन का कारक है। जब दोनों साथी एक-दूसरे की चंद्र राशि के स्वभाव को समझते हैं, तो मतभेद सहज ही दूर हो जाते हैं।
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={reset}
              className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-700 hover:to-rose-700 text-white text-xs sm:text-sm font-bold py-2.5 px-6 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Calculate Another Match</span>
            </button>
            <Link
              to="/book-appointment"
              className="flex items-center space-x-2 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 text-xs sm:text-sm font-bold py-2.5 px-6 rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Book Moon Sign & Kundali Consultation</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoonSignCalculator;
