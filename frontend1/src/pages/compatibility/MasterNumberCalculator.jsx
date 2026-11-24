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
  Award,
  Eye,
  Zap,
  Crown,
  Star,
  ShieldCheck
} from 'lucide-react';
import { authAPI, buildAssetUrl } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

const MasterNumberCalculator = ({ onBack }) => {
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
      const response = await fetch((import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api') + '/numerology/master-number', {
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
      setError('मास्टर नंबर एवं आध्यात्मिक संबंध गणना में त्रुटि हुई। कृपया पुनः प्रयास करें।');
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
              Master Numbers (11, 22, 33), Soul Contracts & Spiritual Affinity
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
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                आध्यात्मिक मास्टर नंबर व सोल कॉन्ट्रैक्ट
              </span>
              <span className="text-[10px] font-semibold text-neutral-500 hidden sm:inline">Spiritual Bond & Master Numbers (11, 22, 33)</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black font-serif text-neutral-900 tracking-tight">
              Spiritual Bond & Master Number Checker
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
            <Crown className="w-3.5 h-3.5 text-amber-600" />
            <span>Soul Contracts (11, 22, 33)</span>
          </div>
        </div>
      </div>

      {/* 3. Form or Result Overview */}
      {!result ? (
        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left Column: Master Number Guidance & Philosophy */}
            <div className="lg:col-span-5 bg-gradient-to-br from-amber-50 via-yellow-50/60 to-orange-50/70 border border-amber-200/90 p-5 sm:p-6 rounded-2xl shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold uppercase tracking-wider">
                  <Crown className="w-3.5 h-3.5 text-amber-700" />
                  <span>मास्टर नंबर और उच्च आध्यात्मिक बंधन</span>
                </div>

                <div className="space-y-2">
                  <p className="text-base sm:text-lg font-bold font-serif text-amber-950 leading-snug">
                    अंकशास्त्र में 11, 22 व 33 मास्टर नंबर हैं, जो जन्म-जन्मांतर के गहन आत्मिक अनुबंध (Soul Contract) को दर्शाते हैं
                  </p>
                  <p className="text-xs sm:text-[16px] text-neutral-800 leading-relaxed font-medium">
                    Check whether you or your partner carry these rare vibrational portals that bring extraordinary spiritual mission, deep empathy, and life transformation.
                  </p>
                </div>
              </div>

              {/* Decorative Vedic Highlight Pill */}
              <div className="bg-white/80 border border-amber-200/80 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>मास्टर संख्याओं की विशेषताएँ:</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-neutral-700">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>मास्टर 11: अंतर्ज्ञान व आत्मिक जागृति</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-600" />
                    <span>मास्टर 22: महान निर्माता व स्वप्नदृष्टा</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    <span>मास्टर 33: करुणा व विश्व मार्गदर्शक</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>सोल कॉन्ट्रैक्ट: पूर्वजन्म संबंध</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: DOB Selectors + Calculate Button */}
            <div className="lg:col-span-7 flex flex-col justify-start space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Partner 1 DOB */}
                <div className="bg-white border border-amber-600 p-3.5 sm:p-5 rounded-2xl space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-amber-100 pb-1.5">
                    <div className="w-5 h-5 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                      1
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900">Partner 1 (प्रथम साथी)</h3>
                  </div>

                  <div className="space-y-1.5 pt-0.5">
                    <label className="text-[16px] font-bold text-neutral-800 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      <span>Date of Birth / जन्म तिथि</span>
                    </label>
                    <input
                      type="date"
                      value={dob1}
                      onChange={(e) => setDob1(e.target.value)}
                      className="w-full bg-stone-50 border border-neutral-600 rounded-xl px-3 py-2 text-neutral-900 focus:outline-none focus:border-amber-500 transition-all text-xs sm:text-sm font-medium cursor-pointer"
                      required
                    />
                    <p className="text-[16px] text-neutral-900 font-medium">
                      Checks for Master Number in Birth Vibration
                    </p>
                  </div>
                </div>

                {/* Partner 2 DOB */}
                <div className="bg-white border border-yellow-600 p-3.5 sm:p-5 rounded-2xl space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-yellow-100 pb-1.5">
                    <div className="w-5 h-5 rounded-lg bg-yellow-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                      2
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900">Partner 2 (द्वितीय साथी)</h3>
                  </div>

                  <div className="space-y-1.5 pt-0.5">
                    <label className="text-[16px] font-bold text-neutral-800 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-yellow-600" />
                      <span>Date of Birth / जन्म तिथि</span>
                    </label>
                    <input
                      type="date"
                      value={dob2}
                      onChange={(e) => setDob2(e.target.value)}
                      className="w-full bg-stone-50 border border-neutral-600 rounded-xl px-3 py-2 text-neutral-900 focus:outline-none focus:border-yellow-500 transition-all text-xs sm:text-sm font-medium cursor-pointer"
                      required
                    />
                    <p className="text-[16px] text-neutral-900 font-medium">
                      Checks for Master Number in Birth Vibration
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
                  className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-neutral-950 font-bold py-3 px-6 rounded-2xl shadow-md shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-neutral-900" />
                      <span>मास्टर नंबर एवं आत्मिक बंधनों की खोज हो रही है...</span>
                    </span>
                  ) : (
                    <>
                      <span>Reveal Spiritual Bonds</span>
                      <Eye className="w-4 h-4 text-neutral-950" />
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
                <span className={`text-[14px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${result.hasMasterNumber
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-stone-100 text-neutral-800 border-neutral-300'
                  }`}>
                  ✓ विश्लेषण पूर्ण (Analysis Completed)
                </span>
                <span className="text-[14px] font-semibold text-neutral-900 bg-stone-50 px-2 py-0.5 rounded border border-neutral-200">
                  Master Number & Soul Contract Synthesis
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black font-serif text-neutral-900 tracking-tight">
                {result.message}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-center px-4 py-1.5 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-300">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">Status</span>
                <span className="text-xl sm:text-2xl font-black text-amber-700">
                  {result.hasMasterNumber ? 'Soul Contract' : 'Standard Alignment'}
                </span>
              </div>

              <button
                onClick={reset}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-neutral-800 text-xs font-bold transition-all border border-neutral-300 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Check Another Connection</span>
              </button>
            </div>
          </div>

          {/* Result Showcase Card */}
          <div className={`rounded-2xl border p-6 sm:p-8 text-center space-y-4 shadow-sm ${result.hasMasterNumber
            ? 'bg-gradient-to-br from-amber-50 via-yellow-50/50 to-orange-50 border-amber-300'
            : 'bg-white border-neutral-200'
            }`}>
            <div className="relative inline-block mx-auto">
              {result.hasMasterNumber ? (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-white flex items-center justify-center shadow-lg border-4 border-yellow-200 animate-pulse">
                  <Sparkles className="w-12 h-12 text-neutral-950" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center shadow-inner border-2 border-stone-300">
                  <Eye className="w-12 h-12 text-stone-500" />
                </div>
              )}
            </div>

            <div className="max-w-2xl mx-auto space-y-2">
              <h3 className="text-2xl sm:text-3xl font-black text-neutral-900">
                {result.message}
              </h3>
              <p className="text-sm sm:text-base text-neutral-700 leading-relaxed font-medium">
                {result.details}
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-stone-50 border border-neutral-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[16px] text-neutral-900 text-center sm:text-left">
              Curious about discovering your full karmic past-life ties and synastry chart?
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

export default MasterNumberCalculator;
