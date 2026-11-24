import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  Heart,
  Sparkles,
  Calendar,
  Video,
  ChevronRight,
  CheckCircle2,
  Globe,
  Compass,
  Award,
  Users,
  Hash
} from 'lucide-react';
import { authAPI, buildAssetUrl } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

const FRIENDSHIP_NUM_META = {
  1: { planet: 'Surya (Sun)', quality: 'Leadership, Loyalty & Inspiring Guide', element: 'Fire', trait: 'Protective & Direct Friend' },
  2: { planet: 'Chandra (Moon)', quality: 'Empathy, Emotional Support & Care', element: 'Water', trait: 'Compassionate & Listening Friend' },
  3: { planet: 'Guru (Jupiter)', quality: 'Joy, Wit, Optimism & Growth', element: 'Ether', trait: 'Uplifting & Creative Companion' },
  4: { planet: 'Rahu (North Node)', quality: 'Dependability, Trust & Grounding', element: 'Earth', trait: 'Steadfast & Reliable Anchor' },
  5: { planet: 'Budha (Mercury)', quality: 'Fun, Adventure & Mental Spark', element: 'Air', trait: 'Energetic & Conversational Friend' },
  6: { planet: 'Shukra (Venus)', quality: 'Harmony, Affection & Generosity', element: 'Water', trait: 'Warm, Loving & Peacemaker' },
  7: { planet: 'Ketu (South Node)', quality: 'Spiritual Bond, Trust & Deep Intellect', element: 'Water', trait: 'Soulful & Secret-Keeper' },
  8: { planet: 'Shani (Saturn)', quality: 'Endurance, Practical Help & Wisdom', element: 'Earth', trait: 'Lifelong, Rock-Solid Ally' },
  9: { planet: 'Mangal (Mars)', quality: 'Courage, Fierce Support & Drive', element: 'Fire', trait: 'Passionate Defender & Champion' }
};

const FriendshipCalculator = ({ onBack }) => {
  const { currentLang, changeLanguage, supportedLanguages } = useLanguage();
  const [dob1, setDob1] = useState('1997-04-12');
  const [dob2, setDob2] = useState('1998-11-20');
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
    if (!dob1 || !dob2) {
      setError('कृपया दोनों मित्रों की जन्मतिथि दर्ज करें। (Please enter both birth dates)');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch((import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api') + '/numerology/compatibility/friendship', {
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
      setError('मित्रता अंकशास्त्र अनुकूलता गणना में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  const p1Details = (result?.lifePath1 && FRIENDSHIP_NUM_META[result.lifePath1]) || FRIENDSHIP_NUM_META[1];
  const p2Details = (result?.lifePath2 && FRIENDSHIP_NUM_META[result.lifePath2]) || FRIENDSHIP_NUM_META[1];

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
              Vedic Maitri, Planetary Alignment & Lifelong Bond
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
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                वैदिक मित्रता अंक मिलान
              </span>
              <span className="text-[10px] font-semibold text-neutral-500 hidden sm:inline">Friendship Chemistry & Life Path Synergy</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black font-serif text-neutral-900 tracking-tight">
              Friendship Compatibility Calculator
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
            <Users className="w-3.5 h-3.5 text-amber-600" />
            <span>Maitri & Planetary Harmony</span>
          </div>
        </div>
      </div>

      {/* 3. Form or Result Overview */}
      {!result ? (
        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left Column: Vedic Friendship Numerology Philosophy & Guidance */}
            <div className="lg:col-span-5 bg-gradient-to-br from-amber-50 via-orange-50/60 to-rose-50 border border-amber-200/90 p-5 sm:p-6 rounded-2xl shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 text-amber-900 border border-amber-300 text-xs font-bold uppercase tracking-wider">
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                  <span>वैदिक मैत्री एवं ग्रहीय तालमेल</span>
                </div>

                <div className="space-y-2">
                  <p className="text-base sm:text-lg font-bold font-serif text-amber-950 leading-snug">
                    सच्ची मित्रता केवल पसंद-नापसंद नहीं, बल्कि दोनों आत्माओं के जन्मांक व ग्रहों का स्वाभाविक सामंजस्य है
                  </p>
                  <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-medium">
                    Enter both friends' dates of birth below to compute their friendship strength, trust level, and lifelong synergy.
                  </p>
                </div>
              </div>

              {/* Decorative Vedic Highlight Pill */}
              <div className="bg-white/80 border border-amber-200/80 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>मैत्री विश्लेषण के मुख्य स्तंभ:</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-neutral-700">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>परस्पर विश्वास (Trust Bond)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    <span>वैचारिक स्वतंत्रता (Intellect)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>मुश्किल समय में साथ (Support)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    <span>आजीवन निष्ठा (Loyalty)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Partners Birth Dates Inputs and Submission Button */}
            <div className="lg:col-span-7 flex flex-col justify-start space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Friend 1 Date of Birth */}
                <div className="bg-white border border-amber-600 p-3.5 sm:p-4 rounded-2xl space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-amber-100 pb-1.5">
                    <div className="w-5 h-5 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                      1
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900">Friend 1 (प्रथम मित्र)</h3>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs sm:text-[14px] font-bold text-neutral-800 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      <span>Date of Birth (जन्म तिथि)</span>
                    </label>
                    <input
                      type="date"
                      value={dob1}
                      onChange={(e) => setDob1(e.target.value)}
                      className="w-full bg-stone-50 border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-xs sm:text-sm font-medium cursor-pointer"
                      required
                    />
                    <p className="text-[16px] text-neutral-900 pt-0.5">Calculates core friendship resonance number</p>
                  </div>
                </div>

                {/* Friend 2 Date of Birth */}
                <div className="bg-white border border-orange-600 p-3.5 sm:p-4 rounded-2xl space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-orange-100 pb-1.5">
                    <div className="w-5 h-5 rounded-lg bg-orange-500 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                      2
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900">Friend 2 (द्वितीय मित्र)</h3>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs sm:text-[14px] font-bold text-neutral-800 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-orange-600" />
                      <span>Date of Birth (जन्म तिथि)</span>
                    </label>
                    <input
                      type="date"
                      value={dob2}
                      onChange={(e) => setDob2(e.target.value)}
                      className="w-full bg-stone-50 border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-xs sm:text-sm font-medium cursor-pointer"
                      required
                    />
                    <p className="text-[16px] text-neutral-900 pt-0.5">Calculates core friendship resonance number</p>
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
                  className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-bold py-3 px-6 rounded-2xl shadow-md shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>मित्रता अंक विश्लेषण हो रहा है...</span>
                    </span>
                  ) : (
                    <>
                      <span>Calculate Friendship Score</span>
                      <Users className="w-4 h-4 fill-white" />
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
                  Vedic Friendship & Maitri Synergy
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black font-serif text-neutral-900 tracking-tight">
                Friendship Bond & Cosmic Chemistry
              </h3>
              <p className="text-xs sm:text-[14px] text-neutral-900">
                Bond between Friend 1 (Number <strong className="text-amber-800 font-bold">{result.lifePath1}</strong> - {p1Details.planet}) &{' '}
                Friend 2 (Number <strong className="text-orange-700 font-bold">{result.lifePath2}</strong> - {p2Details.planet})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={reset}
                className="flex items-center gap-1.5 bg-white hover:bg-neutral-100 text-neutral-800 font-bold text-xs py-2 px-3 rounded-xl border border-neutral-300 shadow-2xs transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                <span>Try Another Pair</span>
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

          {/* 3-Column Core Metric Row: Compatibility Score, Friend 1 Number, Friend 2 Number */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            {/* Overall Friendship Compatibility Card */}
            <div className="md:col-span-4 bg-gradient-to-br from-amber-50 via-orange-50/50 to-rose-50 border border-black p-4 rounded-2xl flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                <span className="text-[16px] font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1">
                  <Users className="w-4 h-4 text-amber-600 fill-amber-300" />
                  <span>Friendship Harmony Score</span>
                </span>
                <span className="text-2xl sm:text-3xl font-black font-serif text-amber-800">
                  {result.compatibilityScore}%
                </span>
              </div>

              <p className="text-[16px] text-neutral-900 font-medium leading-relaxed">
                {result.message}
              </p>

              <div className="bg-white/80 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center justify-between text-[14px] font-bold text-neutral-800">
                <span>Vedic Maitri Verdict:</span>
                <span className="text-emerald-700">
                  {result.compatibilityScore >= 70 ? '★ Inseparable Allies' : result.compatibilityScore >= 50 ? 'Supportive Friends' : 'Casual (Mutual Boundaries)'}
                </span>
              </div>
            </div>

            {/* Friend 1 Card */}
            <div className="md:col-span-4 bg-white border border-amber-800 p-4 rounded-2xl flex flex-col justify-between space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center text-sm font-black shadow-2xs">
                    {result.lifePath1}
                  </span>
                  <span className="text-[16px] font-bold text-amber-950">
                    Friend 1 Bond Number
                  </span>
                </div>
                <span className="text-[14px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  DOB: {result.dob1}
                </span>
              </div>

              <div className="space-y-1 text-[16px]">
                <div className="flex justify-between py-1 border-b border-stone-100 text-neutral-900">
                  <span>Ruling Planet (स्वामी):</span>
                  <span className="font-bold text-neutral-900">{p1Details.planet}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100 text-neutral-900">
                  <span>Elemental Force (तत्व):</span>
                  <span className="font-bold text-neutral-900">{p1Details.element}</span>
                </div>
                <div className="flex justify-between py-1 text-neutral-900">
                  <span>Friendship Trait:</span>
                  <span className="font-bold text-amber-800">{p1Details.trait}</span>
                </div>
              </div>

              <div className="bg-amber-50/70 border border-amber-200 p-2 rounded-xl text-[14px] text-amber-950">
                Governs loyalty style, companionship energy, and shared adventures.
              </div>
            </div>

            {/* Friend 2 Card */}
            <div className="md:col-span-4 bg-white border border-orange-600 p-4 rounded-2xl flex flex-col justify-between space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between border-b border-orange-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center text-sm font-black shadow-2xs">
                    {result.lifePath2}
                  </span>
                  <span className="text-[16px] font-bold text-orange-950">
                    Friend 2 Bond Number
                  </span>
                </div>
                <span className="text-[14px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                  DOB: {result.dob2}
                </span>
              </div>

              <div className="space-y-1 text-[16px]">
                <div className="flex justify-between py-1 border-b border-stone-100 text-neutral-900">
                  <span>Ruling Planet (स्वामी):</span>
                  <span className="font-bold text-neutral-900">{p2Details.planet}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100 text-neutral-900">
                  <span>Elemental Force (तत्व):</span>
                  <span className="font-bold text-neutral-900">{p2Details.element}</span>
                </div>
                <div className="flex justify-between py-1 text-neutral-900">
                  <span>Friendship Trait:</span>
                  <span className="font-bold text-orange-800">{p2Details.trait}</span>
                </div>
              </div>

              <div className="bg-orange-50/70 border border-orange-200 p-2 rounded-xl text-[14px] text-orange-950">
                Determines communication openness, emotional trust, and reliability.
              </div>
            </div>
          </div>

          {/* Vibrational Reference Scale 1 - 9 */}
          <div className="bg-white border border-neutral-200/90 p-4 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <div className="flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs sm:text-[14px] font-bold font-serif text-neutral-900">
                  Friendship Vibration Matrix (1 - 9 Friendship Numbers)
                </h4>
              </div>
              <span className="text-[14px] text-neutral-900 hidden sm:inline">Vedic Maitri Matrix</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                const isSelected1 = result.lifePath1 === num;
                const isSelected2 = result.lifePath2 === num;
                const isHighlighted = isSelected1 || isSelected2;
                const item = FRIENDSHIP_NUM_META[num];

                return (
                  <div
                    key={num}
                    className={`rounded-xl p-2.5 text-center transition-all ${isHighlighted
                      ? 'bg-amber-100 border-2 border-amber-500 shadow-xs'
                      : 'bg-stone-50 border border-neutral-200/80 hover:border-neutral-300'
                      }`}
                  >
                    <span className="text-[12px] font-bold block text-neutral-900">
                      {item.planet.split(' ')[0]}
                    </span>
                    <span
                      className={`text-xl sm:text-2xl font-black font-serif block my-0.5 ${isHighlighted ? 'text-amber-800' : 'text-neutral-900'
                        }`}
                    >
                      {num}
                    </span>
                    <span className="text-[12px] text-neutral-900 block truncate">
                      {item.element}
                    </span>
                    {isHighlighted && (
                      <span className="inline-block mt-1 text-[8px] font-bold bg-amber-500 text-white px-1.5 py-0.2 rounded-full">
                        {isSelected1 && isSelected2 ? 'Both' : isSelected1 ? 'Friend 1' : 'Friend 2'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Elemental Harmony & Guidance Dynamics */}
          <div className="bg-white border border-neutral-200/90 p-4 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <div className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs sm:text-[14px] font-bold font-serif text-neutral-900">
                  Maitri Dynamics: {p1Details.element} + {p2Details.element} Chemistry
                </h4>
              </div>
              <span className="text-[14px] text-neutral-900 hidden sm:inline">Vedic Friendship Energy</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[16px]">
              <div className="bg-stone-50 border border-neutral-200/80 p-3 rounded-xl space-y-1">
                <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>विश्वास व समझदारी (Trust & Understanding)</span>
                </div>
                <p className="text-neutral-900 leading-relaxed">
                  {p1Details.element === p2Details.element
                    ? 'समान तत्व होने के कारण दोनों बिना कहे एक-दूसरे के मन की बात और भावनाओं को समझ लेंगे।'
                    : (p1Details.element === 'Fire' && p2Details.element === 'Air') || (p1Details.element === 'Air' && p2Details.element === 'Fire')
                      ? 'अग्नि और वायु का मेल इस दोस्ती को सदा ऊर्जावान, मौज-मस्ती और नए अनुभवों से भरपूर रखेगा।'
                      : (p1Details.element === 'Water' && p2Details.element === 'Earth') || (p1Details.element === 'Earth' && p2Details.element === 'Water')
                        ? 'जल और पृथ्वी का योग गहरी भावनात्मक वफादारी, व्यावहारिक मदद और अटूट विश्वास प्रदान करता है।'
                        : 'दोनों की रुचियां अलग हो सकती हैं, लेकिन यही विविधता इस दोस्ती को खास और सीखने योग्य बनाती है।'}
                </p>
              </div>

              <div className="bg-stone-50 border border-neutral-200/80 p-3 rounded-xl space-y-1">
                <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>वैदिक मैत्री सूत्र (Friendship Guidance)</span>
                </div>
                <p className="text-neutral-900 leading-relaxed">
                  सच्ची मित्रता में आपसी अपेक्षाओं से अधिक एक-दूसरे के आत्मसम्मान का स्थान होता है। सुख-दुःख में निरंतर संपर्क दोस्ती को अमर बनाता है।
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
              <span>Calculate Another Pair</span>
            </button>
            <Link
              to="/book-appointment"
              className="flex items-center space-x-2 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 text-xs sm:text-sm font-bold py-2.5 px-6 rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <Sparkles className="w-6 h-6 text-amber-600" />
              <span>Book Relationship & Friendship Consultation</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendshipCalculator;
