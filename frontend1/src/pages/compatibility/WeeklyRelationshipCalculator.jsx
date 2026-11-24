import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  Heart,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  User,
  Flame,
  MessageCircle,
  ShieldCheck,
  Video,
  Phone,
  ChevronRight,
  TrendingUp,
  Zap,
  Activity,
  Star,
  Compass
} from 'lucide-react';
import PlaceAutocomplete from '../../components/PlaceAutocomplete';
import { fetchWeeklyRelationshipHoroscope, authAPI, buildAssetUrl } from '../../services/api';

const WeeklyRelationshipCalculator = ({ onBack }) => {
  const [calculationMode, setCalculationMode] = useState('astrology'); // 'astrology' | 'numerology'

  // Partner A Form State
  const [nameA, setNameA] = useState('');
  const [dateA, setDateA] = useState('');
  const [timeA, setTimeA] = useState('');
  const [latLonA, setLatLonA] = useState(null);
  const [tzOffsetA, setTzOffsetA] = useState(5.5);

  // Partner B Form State
  const [nameB, setNameB] = useState('');
  const [dateB, setDateB] = useState('');
  const [timeB, setTimeB] = useState('');
  const [latLonB, setLatLonB] = useState(null);
  const [tzOffsetB, setTzOffsetB] = useState(5.5);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Live Astrologers State
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

  const onPlaceSelectedA = (place) => {
    setLatLonA(place);
    if (typeof place?.tz_offset_hours === 'number') {
      setTzOffsetA(place.tz_offset_hours);
    }
  };

  const onPlaceSelectedB = (place) => {
    setLatLonB(place);
    if (typeof place?.tz_offset_hours === 'number') {
      setTzOffsetB(place.tz_offset_hours);
    }
  };

  const handleCalculate = async (e) => {
    e.preventDefault();

    if (calculationMode === 'astrology') {
      if (!dateA || !timeA || !latLonA || !dateB || !timeB || !latLonB) {
        setError('कृपया दोनों पार्टनर का जन्म समय, जन्म तिथि और जन्म स्थान भरें। (Please fill in birth details & locations for both partners)');
        return;
      }
    } else {
      if (!nameA || !dateA || !nameB || !dateB) {
        setError('कृपया दोनों पार्टनर का नाम और जन्म तिथि भरें। (Please fill in Name and DOB for both partners)');
        return;
      }
    }

    setLoading(true);
    setError(null);

    const payload = {
      mode: calculationMode,
      partner_a: {
        name: nameA || 'Partner A',
        date: dateA,
        time: timeA || '12:00',
        lat: latLonA ? latLonA.lat : 28.6139,
        lon: latLonA ? latLonA.lon : 77.2090,
        tz_offset: tzOffsetA
      },
      partner_b: {
        name: nameB || 'Partner B',
        date: dateB,
        time: timeB || '12:00',
        lat: latLonB ? latLonB.lat : 28.6139,
        lon: latLonB ? latLonB.lon : 77.2090,
        tz_offset: tzOffsetB
      },
      start_date: new Date().toISOString().split('T')[0]
    };

    try {
      const data = await fetchWeeklyRelationshipHoroscope(payload);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Failed to calculate weekly relationship horoscope.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setNameA('');
    setDateA('');
    setTimeA('');
    setLatLonA(null);
    setNameB('');
    setDateB('');
    setTimeB('');
    setLatLonB(null);
    setError(null);
  };

  // Helper stats computed from weekly_data to fill free space with rich analytical insights
  const getWeeklyStats = () => {
    if (!result?.weekly_data || result.weekly_data.length === 0) return null;
    const days = result.weekly_data;
    const avgHarmony = Math.round(days.reduce((acc, d) => acc + (d.harmony_score || 0), 0) / days.length);
    const avgPassion = Math.round(days.reduce((acc, d) => acc + (d.passion_score || 0), 0) / days.length);
    const avgComm = Math.round(days.reduce((acc, d) => acc + (d.communication_score || 0), 0) / days.length);
    const bestDay = [...days].sort((a, b) => (b.harmony_score + b.passion_score) - (a.harmony_score + a.passion_score))[0];
    return { avgHarmony, avgPassion, avgComm, bestDay };
  };

  const stats = result ? getWeeklyStats() : null;

  // Clean astrologer name by removing any 'Astrologer', 'Astro', etc. prefix
  const cleanAstrologerName = (name) => {
    if (!name) return 'Vedic Expert';
    return name
      .replace(/^(Astrologer|Astro\.?|Acharya|Pandit|Dr\.?)\s+/i, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 animate-fade-in-up">
      {/* 1. Live Astrologers Section (Displayed ABOVE the Top Header Bar) - Compact Height */}
      <div className="bg-gradient-to-r from-white via-rose-50/50 to-amber-50/60 border border-rose-200/90 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl shadow-xs space-y-1.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-rose-100 pb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <span className="text-[11px] sm:text-[12px] font-extrabold uppercase tracking-wider text-rose-900 font-serif flex items-center gap-1.5">
              <span>लाइव ज्योतिषी से तुरंत परामर्श लें</span>
              <span className="text-[14px] font-sans font-bold text-rose-700 bg-rose-100 border border-rose-200 px-1.5 py-0.2 rounded-full">
                LIVE NOW
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[14px] text-black hidden md:inline">
              Instant 1-on-1 Vedic Consultation for Love & Relationships
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
              <Video className="w-3 h-3" />
              <span>Connect Live</span>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3 pt-0.5">
            {/* Left/Center: Circular Live Astrologers Roster - Compact Size */}
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
                    {/* Compact Circular Avatar with Yellow Ring & Green Online Dot */}
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

                      {/* Bottom-right Green Online Indicator Dot with white border */}
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-white rounded-full shadow-2xs"></span>
                    </div>

                    {/* Name below avatar */}
                    <span className="mt-1 text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-rose-600 transition-colors text-center truncate max-w-[65px] sm:max-w-[75px] block leading-tight">
                      {displayName}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Right Side: First Consultation Free - Book Now Flex Button - Compact Height */}
            <div className="shrink-0 w-full lg:w-auto flex justify-center lg:justify-end">
              <Link
                to="/book-appointment"
                className="group relative flex items-center gap-2.5 bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 hover:from-amber-600 hover:via-rose-600 hover:to-pink-700 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border border-amber-300/40 cursor-pointer overflow-hidden text-center"
              >
                <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-amber-200 fill-amber-200 group-hover:rotate-12 transition-transform" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[14px] font-black uppercase tracking-wider bg-white/25 px-1.5 py-0.2 rounded-full text-white">
                      100% FREE
                    </span>
                    <span className="text-[14px] font-bold text-amber-100">Special Offer</span>
                  </div>
                  <div className="text-xs sm:text-[26px] font-black font-serif tracking-tight leading-tight text-white mt-0.5">
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

      {/* 2. Top Header Bar (Now situated BELOW the Live Astrologers strip) */}
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
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                साप्ताहिक प्रेम राशिफल
              </span>
              <span className="text-[10px] font-semibold text-neutral-500 hidden sm:inline">7-Day Transit Forecast</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black font-serif text-neutral-900 tracking-tight">
              Weekly Relationship Horoscope
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 text-xs font-bold">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>Vedic Transit + Numerology</span>
          </div>
        </div>
      </div>

      {!result ? (
        <form onSubmit={handleCalculate} className="space-y-6">
          {/* Subtitle description */}
          <div className="text-center max-w-xl mx-auto space-y-1">
            <p className="text-sm sm:text-base font-semibold text-neutral-800">
              आगामी 7 दिनों के लिए अपने रिश्ते की मिठास, आकर्षण एवं संवाद का सटीक विश्लेषण
            </p>
            <p className="text-[16px] text-black">
              Select calculation method and enter both partners' details below.
            </p>
          </div>

          {/* Mode Selector Toggle */}
          <div className="flex justify-center p-1 bg-stone-100 rounded-2xl max-w-md mx-auto border border-neutral-200">
            <button
              type="button"
              onClick={() => {
                setCalculationMode('astrology');
                setError(null);
              }}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${calculationMode === 'astrology'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-neutral-700 hover:text-neutral-900'
                }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Vedic (Full Details)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCalculationMode('numerology');
                setError(null);
              }}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${calculationMode === 'numerology'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-neutral-700 hover:text-neutral-900'
                }`}
            >
              <Heart className="w-4 h-4" />
              <span>Numerology(Name & DOB)</span>
            </button>
          </div>

          {/* Partners Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Partner A */}
            <div className="bg-rose-50/50 border border-slate-900 p-4 sm:p-5 rounded-2xl space-y-3.5">
              <div className="flex items-center gap-2 border-b border-rose-200/60 pb-2">
                <div className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center text-xs font-bold">
                  A
                </div>
                <h3 className="text-sm font-bold text-neutral-900">Partner 1 (प्रथम साथी)</h3>
              </div>

              <div className="space-y-1">
                <label className="text-[14px] font-bold text-neutral-800 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-rose-600" />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  value={nameA}
                  onChange={(e) => setNameA(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-500 transition-all text-xs sm:text-sm font-medium placeholder:text-neutral-400"
                  placeholder="e.g. Rahul Sharma"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[14px] font-bold text-neutral-800 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-rose-600" />
                  <span>Date of Birth</span>
                </label>
                <input
                  type="date"
                  value={dateA}
                  onChange={(e) => setDateA(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-500 transition-all text-xs sm:text-sm font-medium"
                  required
                />
              </div>

              {calculationMode === 'astrology' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[14px] font-bold text-neutral-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-rose-600" />
                      <span>Time of Birth</span>
                    </label>
                    <input
                      type="time"
                      value={timeA}
                      onChange={(e) => setTimeA(e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-500 transition-all text-xs sm:text-sm font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[14px] font-bold text-neutral-800 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-600" />
                      <span>Place of Birth</span>
                    </label>
                    <PlaceAutocomplete
                      value={latLonA?.display_name || ''}
                      onSelect={onPlaceSelectedA}
                      inputClassName="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-neutral-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-500 transition-all text-xs sm:text-sm font-medium placeholder:text-neutral-400"
                      dropdownClassName="absolute z-50 bg-white border border-neutral-300 rounded-xl w-full mt-1 max-h-60 overflow-auto shadow-xl text-neutral-800 text-xs"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Partner B */}
            <div className="bg-pink-50/50 border border-pink-900 p-4 sm:p-5 rounded-2xl space-y-3.5">
              <div className="flex items-center gap-2 border-b border-pink-200/60 pb-2">
                <div className="w-6 h-6 rounded-lg bg-pink-600 text-white flex items-center justify-center text-xs font-bold">
                  B
                </div>
                <h3 className="text-sm font-bold text-neutral-900">Partner 2 (द्वितीय साथी)</h3>
              </div>

              <div className="space-y-1">
                <label className="text-[14px] font-bold text-neutral-800 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-pink-600" />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  value={nameB}
                  onChange={(e) => setNameB(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-neutral-900 focus:outline-none focus:border-pink-600 focus:ring-1 focus:ring-pink-500 transition-all text-xs sm:text-sm font-medium placeholder:text-neutral-400"
                  placeholder="e.g. Priya Sharma"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[14px] font-bold text-neutral-800 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-pink-600" />
                  <span>Date of Birth</span>
                </label>
                <input
                  type="date"
                  value={dateB}
                  onChange={(e) => setDateB(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-neutral-900 focus:outline-none focus:border-pink-600 focus:ring-1 focus:ring-pink-500 transition-all text-xs sm:text-sm font-medium"
                  required
                />
              </div>

              {calculationMode === 'astrology' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[14px] font-bold text-neutral-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-pink-600" />
                      <span>Time of Birth</span>
                    </label>
                    <input
                      type="time"
                      value={timeB}
                      onChange={(e) => setTimeB(e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-neutral-900 focus:outline-none focus:border-pink-600 focus:ring-1 focus:ring-pink-500 transition-all text-xs sm:text-sm font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[14px] font-bold text-neutral-800 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-pink-600" />
                      <span>Place of Birth</span>
                    </label>
                    <PlaceAutocomplete
                      value={latLonB?.display_name || ''}
                      onSelect={onPlaceSelectedB}
                      inputClassName="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-neutral-900 focus:outline-none focus:border-pink-600 focus:ring-1 focus:ring-pink-500 transition-all text-xs sm:text-[14px] font-medium placeholder:text-neutral-400"
                      dropdownClassName="absolute z-50 bg-white border border-neutral-300 rounded-xl w-full mt-1 max-h-60 overflow-auto shadow-xl text-neutral-800 text-xs"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm text-center font-semibold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-700 hover:to-pink-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md shadow-rose-600/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>ग्रह गोचर व नक्षत्र विश्लेषण हो रहा है...</span>
              </span>
            ) : (
              <>
                <span>Calculate Weekly Relationship Horoscope</span>
                <Heart className="w-4 h-4 fill-white" />
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-5">

          {/* Result Overview Header - Compact & Informative */}
          <div className="bg-stone-50 border border-neutral-200/80 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-[12px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ✓ विश्लेषण पूर्ण (Analysis Completed)
                </span>
                <span className="text-[12px] font-semibold text-neutral-500 bg-white px-2 py-0.5 rounded border border-neutral-200">
                  Mode: {calculationMode === 'astrology' ? 'Vedic Astrology' : 'Numerology'}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black font-serif text-neutral-900 tracking-tight">
                7-Day Relationship & Harmony Forecast
              </h3>
              <p className="text-xs sm:text-[16px] text-neutral-700 font-medium">
                Calculated for <strong className="text-rose-700 font-bold">{result.partner_a_name}</strong> ({result.partner_a_sign}) &{' '}
                <strong className="text-pink-700 font-bold">{result.partner_b_name}</strong> ({result.partner_b_sign})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={reset}
                className="flex items-center gap-1.5 bg-white hover:bg-neutral-100 text-neutral-800 font-bold text-xs py-2 px-3 rounded-xl border border-neutral-300 shadow-2xs transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-rose-600" />
                <span>New Match</span>
              </button>
              <Link
                to="/live-astrologers"
                className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-2xs transition-all"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Talk to Astrologer</span>
              </Link>
            </div>
          </div>

          {/* 3-Column Dense Executive Summary: Baseline + Week Averages + Best Day */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            {/* Left: Baseline Compatibility Card */}
            <div className="md:col-span-6 bg-gradient-to-br from-rose-50 via-amber-50/50 to-pink-50 border border-rose-200/80 p-4 rounded-2xl flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-rose-200/60 pb-2">
                <span className="text-[16px] font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                  <span>आधारभूत अनुकूलता (Baseline Compatibility)</span>
                </span>
                <span className="text-xl sm:text-2xl font-black font-serif text-rose-600">
                  {result.baseline_compatibility_score}%
                </span>
              </div>
              <p className="text-[16px] text-neutral-900 font-medium leading-relaxed">
                {result.baseline_message}
              </p>
              <div className="pt-1 flex items-center justify-between text-[14px] font-semibold text-rose-900 bg-white/70 px-2.5 py-1 rounded-lg border border-rose-200/60">
                <span>Vedic Match Strength:</span>
                <span className="font-bold text-emerald-700">
                  {result.baseline_compatibility_score >= 70 ? '★ Very Auspicious' : result.baseline_compatibility_score >= 50 ? 'Moderate (Needs Balance)' : 'Challenging (Remedies Advised)'}
                </span>
              </div>
            </div>

            {/* Center: 7-Day Averages Metric Cards */}
            <div className="md:col-span-3 bg-white border border-neutral-200/80 p-3.5 rounded-2xl flex flex-col justify-between space-y-2">
              <div className="text-[16px] font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-neutral-600" />
                <span>Weekly Averages</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[14px] bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200/60">
                  <span className="text-neutral-700 font-semibold flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-600" /> Harmony:
                  </span>
                  <span className="font-bold text-rose-700">{stats?.avgHarmony || 75}%</span>
                </div>
                <div className="flex items-center justify-between text-[14px] bg-pink-50 px-2.5 py-1.5 rounded-lg border border-pink-200/60">
                  <span className="text-neutral-700 font-semibold flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-500" /> Passion:
                  </span>
                  <span className="font-bold text-pink-700">{stats?.avgPassion || 70}%</span>
                </div>
                <div className="flex items-center justify-between text-[14px] bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-200/60">
                  <span className="text-neutral-700 font-semibold flex items-center gap-1">
                    <MessageCircle className="w-3 h-3 text-sky-600" /> Talks:
                  </span>
                  <span className="font-bold text-sky-700">{stats?.avgComm || 72}%</span>
                </div>
              </div>
            </div>

            {/* Right: Best Day for Romance / Harmony */}
            <div className="md:col-span-3 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border border-amber-200/80 p-3.5 rounded-2xl flex flex-col justify-between space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                <span>Best Day of the Week</span>
              </div>

              <div className="bg-white/80 border border-amber-200 p-2.5 rounded-xl text-center space-y-1">
                <span className="text-xs sm:text-[14px] font-black font-serif text-neutral-900 block">
                  {stats?.bestDay?.day_name || 'Upcoming Days'}
                </span>
                <span className="text-[12px] text-neutral-900 font-semibold block">
                  {stats?.bestDay?.date_string || ''}
                </span>
                <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                  Peak Harmony: {stats?.bestDay?.harmony_score || 85}%
                </div>
              </div>

              <p className="text-[14px] text-amber-900 leading-tight line-clamp-2">
                {stats?.bestDay?.advice || 'Ideal time for open conversations and heartfelt connections.'}
              </p>
            </div>
          </div>

          {/* 7-Day Day-by-Day Forecast - Compact, Grid layout that efficiently fills the section */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <h4 className="text-sm sm:text-base font-bold font-serif text-neutral-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-rose-600" />
                <span>साप्ताहिक दिन-प्रतिदिन गोचर फलादेश (7-Day Daily Breakdown)</span>
              </h4>
              <span className="text-[16px] text-neutral-900 font-medium">Daily Transit Cycle</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.weekly_data.map((day, idx) => (
                <div
                  key={idx}
                  className="bg-stone-50 border border-neutral-amber-900 p-3.5 rounded-2xl space-y-2.5 hover:border-rose-400 hover:shadow-xs transition-all"
                >
                  <div className="flex justify-between items-center border-b border-neutral-200/70 pb-1.5">
                    <span className="font-bold text-xs sm:text-[14px] text-neutral-900 font-serif flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      <span>{day.day_name}</span>
                    </span>
                    <span className="text-[16px] font-medium text-neutral-900 bg-white px-2 py-0.5 rounded-md border border-neutral-200 shadow-2xs">
                      {day.date_string}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white border border-rose-200/60 p-1.5 rounded-xl">
                      <span className="text-[14px] text-neutral-900 font-semibold flex items-center justify-center gap-0.5">
                        <Heart className="w-3 h-3 text-rose-500" />
                        Harmony
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-rose-700">{day.harmony_score}%</span>
                    </div>
                    <div className="bg-white border border-pink-200/60 p-1.5 rounded-xl">
                      <span className="text-[14px] text-neutral-900 font-semibold flex items-center justify-center gap-0.5">
                        <Flame className="w-3 h-3 text-amber-500" />
                        Passion
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-pink-700">{day.passion_score}%</span>
                    </div>
                    <div className="bg-white border border-blue-200/60 p-1.5 rounded-xl">
                      <span className="text-[14px] text-neutral-900 font-semibold flex items-center justify-center gap-0.5">
                        <MessageCircle className="w-3 h-3 text-sky-500" />
                        Talks
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-sky-700">{day.communication_score}%</span>
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-neutral-200/70 text-[16px] text-neutral-900 font-normal leading-relaxed">
                    <strong className="text-rose-800 font-semibold block text-[14px] mb-0.5">सलाह (Daily Advice):</strong>
                    {day.advice}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 border-t border-neutral-200">
            <button
              onClick={reset}
              className="flex items-center space-x-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs sm:text-sm font-bold py-2.5 px-6 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Calculate Another Match</span>
            </button>
            <Link
              to="/live-astrologers"
              className="flex items-center space-x-2 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 text-xs sm:text-sm font-bold py-2.5 px-6 rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <Video className="w-4 h-4 text-rose-600" />
              <span>Ask an Astrologer About This Week</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyRelationshipCalculator;
