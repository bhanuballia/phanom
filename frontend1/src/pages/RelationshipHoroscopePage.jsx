import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import PlaceAutocomplete from '../components/PlaceAutocomplete';
import { PYTHON_ASTRO_URL, authAPI, buildAssetUrl } from '../services/api';
import {
  Heart,
  Sparkles,
  RefreshCw,
  Calendar,
  Clock,
  MapPin,
  User,
  Compass,
  ArrowLeft,
  Flame,
  MessageCircle,
  ShieldCheck,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const RASHI_HINDI = {
  Aries: 'मेष',
  Taurus: 'वृषभ',
  Gemini: 'मिथुन',
  Cancer: 'कर्क',
  Leo: 'सिंह',
  Virgo: 'कन्या',
  Libra: 'तुला',
  Scorpio: 'वृश्चिक',
  Sagittarius: 'धनु',
  Capricorn: 'मकर',
  Aquarius: 'कुंभ',
  Pisces: 'मीन'
};

export default function RelationshipHoroscopePage() {
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
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'high'

  // Top Astrologers Bar State
  const [topAstrologers, setTopAstrologers] = useState([]);

  useEffect(() => {
    fetchTopAstrologers();
  }, []);

  const fetchTopAstrologers = async () => {
    try {
      const response = await authAPI.getAstrologers();
      const list = response.data?.astrologers || [];
      setTopAstrologers(list);
    } catch (err) {
      console.error('Error fetching astrologers for relationship page:', err);
    }
  };

  // Helper to remove 'Astrologer' / 'Astro' prefix
  const cleanAstroName = (name) => {
    if (!name) return 'Expert';
    return name
      .replace(/^astrologer\s+/i, '')
      .replace(/^astro\s+/i, '')
      .trim();
  };

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
        setError('कृपया दोनों जातकों के लिए जन्म तिथि, समय और जन्म स्थान (Place) दर्ज करें।');
        return;
      }
    } else {
      if (!nameA || !dateA || !nameB || !dateB) {
        setError('कृपया दोनों जातकों के लिए नाम और जन्म तिथि दर्ज करें।');
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
      const baseUrl = PYTHON_ASTRO_URL.replace(/\/api\/kundali\/?$/, '').replace(/\/+$/, '');
      const response = await axios.post(`${baseUrl}/api/astrology/compatibility/weekly-horoscope`, payload);
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || err?.message || 'साप्ताहिक संबंध कुंडली गणना में त्रुटि हुई।');
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

  const getSignText = (signEn) => {
    if (!signEn) return '—';
    const hi = RASHI_HINDI[signEn];
    return hi ? `${hi} (${signEn})` : signEn;
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-rose-200">
      <Navigation />

      {/* TOP LIVE ASTROLOGERS HORIZONTAL STRIP (POSITIONED BELOW FIXED NAV BAR) */}
      <div className="bg-white border-b border-amber-900/10 shadow-xs pt-24 sm:pt-28 pb-3 px-2 sm:px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Talk to Relationship & Love Astrologers
            </span>
            <Link
              to="/live-astrologers"
              className="text-[11px] font-bold text-amber-700 hover:text-amber-900 transition flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Horizontal Scrollable Row of Astrologers */}
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-1 px-1 scrollbar-thin scrollbar-thumb-amber-200">
            {topAstrologers.length > 0 ? (
              topAstrologers.map((astro, i) => {
                const img = astro.avatar || astro.imageUrl || astro.profilePicture || astro.image
                  ? buildAssetUrl(astro.avatar || astro.imageUrl || astro.profilePicture || astro.image)
                  : '/images/AstroIcon.jpg';
                const name = cleanAstroName(astro.name || astro.fullName || `Expert ${i + 1}`);
                const price = astro.chatRate || astro.callRate || astro.rate || 9;

                return (
                  <Link
                    key={astro._id || i}
                    to="/live-astrologers"
                    className="flex flex-col items-center shrink-0 group text-center"
                    style={{ minWidth: '76px', maxWidth: '84px' }}
                  >
                    {/* Circle Image with Gold Border & Green Online Indicator */}
                    <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-500 shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-300">
                      <img
                        src={img}
                        alt={name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/AstroIcon.jpg';
                        }}
                        className="w-full h-full object-cover rounded-full bg-stone-100"
                      />
                      {/* Green Online Dot */}
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs"></span>
                    </div>

                    {/* Astrologer Name without Prefix */}
                    <span className="text-xs font-bold text-slate-900 mt-1.5 truncate w-full group-hover:text-amber-700 transition-colors">
                      {name}
                    </span>

                    {/* Rate per minute */}
                    <span className="text-[11px] font-bold text-slate-500 -mt-0.5">
                      ₹{price}/min
                    </span>
                  </Link>
                );
              })
            ) : (
              /* Fallback Placeholders */
              ['Kamal', 'Krishana', 'Monika Tyagi', 'Poonam', 'PreetPal', 'Ravi Jhangra', 'Ritu Saini', 'Sarika'].map((name, i) => (
                <Link
                  key={i}
                  to="/live-astrologers"
                  className="flex flex-col items-center shrink-0 text-center"
                  style={{ minWidth: '76px', maxWidth: '84px' }}
                >
                  <div className="relative w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-500 shadow-sm">
                    <img
                      src="/images/AstroIcon.jpg"
                      alt={name}
                      className="w-full h-full object-cover rounded-full bg-stone-100"
                    />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 mt-1.5 truncate w-full">
                    {name}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 -mt-0.5">
                    ₹9/min
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Single-Screen Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col justify-start">
        {!result ? (
          /* Single Viewport Enter Details Form (Fits standard laptop/desktop without scrolling) */
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-amber-900/15 p-4 sm:p-5 shadow-sm space-y-3.5 my-auto">
            {/* Header Toolbar (Compact) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-b border-amber-100 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-950 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300 transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-amber-800" />
                    <span>Home</span>
                  </Link>
                  <span className="text-xs font-bold text-red-950 font-cinzel">
                    साप्ताहिक संबंध व प्रेम राशिफल (Weekly Relationship Horoscope)
                  </span>
                </div>
                <h1 className="text-base sm:text-lg font-black text-red-950 font-cinzel flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-600 fill-rose-500" />
                  <span>दोनों जातकों का विवरण दर्ज करें (Enter Details)</span>
                </h1>
              </div>

              {/* Mode Toggle Pills */}
              <div className="inline-flex p-0.5 bg-amber-50 rounded-xl border border-amber-200 shadow-2xs self-stretch sm:self-auto justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setCalculationMode('astrology');
                    setError(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${calculationMode === 'astrology'
                    ? 'bg-gradient-to-r from-red-800 to-amber-900 text-white shadow-2xs'
                    : 'text-amber-950 hover:bg-amber-100/60'
                    }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>वैदिक ज्योतिष (Vedic)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCalculationMode('numerology');
                    setError(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${calculationMode === 'numerology'
                    ? 'bg-gradient-to-r from-purple-800 to-indigo-900 text-white shadow-2xs'
                    : 'text-amber-950 hover:bg-amber-100/60'
                    }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>अंकज्योतिष (Numerology)</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleCalculate} className="space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Partner A Card */}
                <div className="bg-gradient-to-b from-amber-50/40 to-white rounded-xl border border-amber-200/80 p-3.5 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-amber-200/60 pb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                        A
                      </div>
                      <h3 className="text-xs sm:text-sm font-extrabold text-red-950">
                        प्रथम जातक (Partner A)
                      </h3>
                    </div>
                    <span className="text-[10px] bg-rose-100 text-rose-900 px-2 py-0.5 rounded-full font-bold border border-rose-200">
                      वर / जातक A
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] font-bold text-amber-950 flex items-center gap-1 mb-0.5">
                        <User className="w-3 h-3 text-amber-800" />
                        <span>पूरा नाम (Full Name)</span>
                      </label>
                      <input
                        type="text"
                        value={nameA}
                        onChange={(e) => setNameA(e.target.value)}
                        placeholder="उदा. रोहन शर्मा"
                        className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 transition placeholder:text-stone-400 font-medium"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-amber-950 flex items-center gap-1 mb-0.5">
                          <Calendar className="w-3 h-3 text-amber-800" />
                          <span>जन्म तिथि (DOB)</span>
                        </label>
                        <input
                          type="date"
                          value={dateA}
                          onChange={(e) => setDateA(e.target.value)}
                          className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 transition font-medium"
                          required
                        />
                      </div>

                      {calculationMode === 'astrology' && (
                        <div>
                          <label className="text-[11px] font-bold text-amber-950 flex items-center gap-1 mb-0.5">
                            <Clock className="w-3 h-3 text-amber-800" />
                            <span>जन्म समय (Time)</span>
                          </label>
                          <input
                            type="time"
                            value={timeA}
                            onChange={(e) => setTimeA(e.target.value)}
                            className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 transition font-medium"
                            required
                          />
                        </div>
                      )}
                    </div>

                    {calculationMode === 'astrology' && (
                      <div>
                        <label className="text-[11px] font-bold text-amber-950 flex items-center gap-1 mb-0.5">
                          <MapPin className="w-3 h-3 text-amber-800" />
                          <span>जन्म स्थान (Birth Place)</span>
                        </label>
                        <PlaceAutocomplete
                          value={latLonA?.display_name || ''}
                          onSelect={onPlaceSelectedA}
                          placeholder="शहर या जिले का नाम खोजें (उदा. New Delhi, Mumbai)..."
                          inputClassName="w-full bg-white border border-amber-300 rounded-lg pl-8 pr-8 py-1.5 text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 transition placeholder:text-stone-400 font-medium"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Partner B Card */}
                <div className="bg-gradient-to-b from-rose-50/30 to-white rounded-xl border border-rose-200/80 p-3.5 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-rose-200/60 pb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                        B
                      </div>
                      <h3 className="text-xs sm:text-sm font-extrabold text-red-950">
                        द्वितीय जातक (Partner B)
                      </h3>
                    </div>
                    <span className="text-[10px] bg-pink-100 text-pink-900 px-2 py-0.5 rounded-full font-bold border border-pink-200">
                      कन्या / जातक B
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] font-bold text-amber-950 flex items-center gap-1 mb-0.5">
                        <User className="w-3 h-3 text-amber-800" />
                        <span>पूरा नाम (Full Name)</span>
                      </label>
                      <input
                        type="text"
                        value={nameB}
                        onChange={(e) => setNameB(e.target.value)}
                        placeholder="उदा. प्रिया वर्मा"
                        className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 transition placeholder:text-stone-400 font-medium"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-amber-950 flex items-center gap-1 mb-0.5">
                          <Calendar className="w-3 h-3 text-amber-800" />
                          <span>जन्म तिथि (DOB)</span>
                        </label>
                        <input
                          type="date"
                          value={dateB}
                          onChange={(e) => setDateB(e.target.value)}
                          className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 transition font-medium"
                          required
                        />
                      </div>

                      {calculationMode === 'astrology' && (
                        <div>
                          <label className="text-[11px] font-bold text-amber-950 flex items-center gap-1 mb-0.5">
                            <Clock className="w-3 h-3 text-amber-800" />
                            <span>जन्म समय (Time)</span>
                          </label>
                          <input
                            type="time"
                            value={timeB}
                            onChange={(e) => setTimeB(e.target.value)}
                            className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 transition font-medium"
                            required
                          />
                        </div>
                      )}
                    </div>

                    {calculationMode === 'astrology' && (
                      <div>
                        <label className="text-[11px] font-bold text-amber-950 flex items-center gap-1 mb-0.5">
                          <MapPin className="w-3 h-3 text-amber-800" />
                          <span>जन्म स्थान (Birth Place)</span>
                        </label>
                        <PlaceAutocomplete
                          value={latLonB?.display_name || ''}
                          onSelect={onPlaceSelectedB}
                          placeholder="शहर या जिले का नाम खोजें (उदा. New Delhi, Mumbai)..."
                          inputClassName="w-full bg-white border border-amber-300 rounded-lg pl-8 pr-8 py-1.5 text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 transition placeholder:text-stone-400 font-medium"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 text-xs text-center font-bold">
                  ⚠️ {error}
                </div>
              )}

              {/* Action Button & Info Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-amber-100">
                <span className="text-[11px] text-stone-500 hidden sm:inline">
                  🔒 वैदिक ज्योतिष चंद्र-शुक्र गोचर व 7-दिवसीय सामंजस्य चक्र विश्लेषण
                </span>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto min-w-[280px] bg-gradient-to-r from-red-800 via-rose-800 to-amber-900 hover:brightness-110 text-white font-extrabold py-2.5 px-6 rounded-xl shadow-xs transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>गोचर व संबंध चक्र की गणना हो रही है...</span>
                    </>
                  ) : (
                    <>
                      <span>साप्ताहिक संबंध राशिफल निकालें</span>
                      <Heart className="w-4 h-4 fill-white text-white" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Report Results View */
          <div className="space-y-5 animate-fade-in-up">
            {/* Top Baseline Compatibility Card */}
            <div className="bg-gradient-to-br from-amber-50 via-white to-rose-50/40 rounded-2xl sm:rounded-3xl border border-amber-900/15 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-200/70 pb-4">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-950 text-xs font-bold px-3 py-0.5 rounded-full border border-amber-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />
                    <span>वैदिक संबंध सामंजस्य स्कोर (Baseline Compatibility)</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-extrabold text-red-950 font-cinzel">
                    <span className="text-red-900">{result.partner_a_name}</span>{' '}
                    <span className="text-black text-base font-normal">({getSignText(result.partner_a_sign)})</span>{' '}
                    <span className="text-rose-600 font-serif">&amp;</span>{' '}
                    <span className="text-rose-900">{result.partner_b_name}</span>{' '}
                    <span className="text-black text-base font-normal">({getSignText(result.partner_b_sign)})</span>
                  </h2>

                  <p className="text-xs sm:text-[14px] text-black leading-relaxed max-w-2xl">
                    {result.baseline_message}
                  </p>
                </div>

                {/* Score Pill */}
                <div className={`p-4 rounded-xl flex flex-col items-center justify-center shrink-0 min-w-[150px] shadow-2xs text-center border ${
                  result.baseline_compatibility_score >= 70
                    ? 'bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 border-emerald-300'
                    : result.baseline_compatibility_score >= 45
                    ? 'bg-gradient-to-br from-amber-50 via-white to-amber-50/50 border-amber-300'
                    : 'bg-gradient-to-br from-rose-50 via-white to-rose-50/50 border-rose-300'
                }`}>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-950 mb-0.5">
                    कुल अनुकूलता स्कोर
                  </span>
                  <div className={`text-3xl sm:text-4xl font-black font-cinzel ${
                    result.baseline_compatibility_score >= 70
                      ? 'text-emerald-700'
                      : result.baseline_compatibility_score >= 45
                      ? 'text-amber-800'
                      : 'text-rose-700'
                  }`}>
                    {result.baseline_compatibility_score}%
                  </div>
                  <span className={`text-[11px] font-bold mt-1 px-2 py-0.5 rounded-full ${
                    result.baseline_compatibility_score >= 70
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                      : result.baseline_compatibility_score >= 45
                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                      : 'bg-rose-100 text-rose-900 border border-rose-200'
                  }`}>
                    {result.baseline_compatibility_score >= 70
                      ? 'उत्कृष्ट सामंजस्य (High)'
                      : result.baseline_compatibility_score >= 45
                      ? 'मध्यम सामंजस्य (Moderate)'
                      : 'न्यून सामंजस्य (Low)'}
                  </span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-0.5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${activeTab === 'all'
                      ? 'bg-red-900 text-white shadow-2xs'
                      : 'bg-amber-50 text-amber-950 hover:bg-amber-100 border border-amber-200'
                      }`}
                  >
                    सभी 7 दिन (All 7 Days)
                  </button>
                  <button
                    onClick={() => setActiveTab('high')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${activeTab === 'high'
                      ? 'bg-red-900 text-white shadow-2xs'
                      : 'bg-amber-50 text-amber-950 hover:bg-amber-100 border border-amber-200'
                      }`}
                  >
                    केवल उच्च सामंजस्य दिन (70%+)
                  </button>
                </div>

                <button
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-950 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-300 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-800" />
                  <span>अन्य कुंडली निकालें (New Match)</span>
                </button>
              </div>
            </div>

            {/* 7-Day Forecast Grid */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-amber-100 pb-2.5">
                <div className="flex items-center gap-2 text-red-950">
                  <CalendarDays className="w-4 h-4 text-amber-800" />
                  <h3 className="font-extrabold text-sm sm:text-base font-cinzel">
                    7-दिवसीय दैनिक संबंध पूर्वानुमान (Upcoming 7-Day Synastry Cycle)
                  </h3>
                </div>
                <span className="text-[16px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                  गोचर फल
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {result.weekly_data
                  ?.filter((day) => activeTab === 'all' || day.harmony_score >= 70)
                  ?.map((day, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-xl border border-amber-900 p-4 space-y-3 hover:shadow-md transition shadow-2xs flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                            <span className="font-extrabold text-[16px] text-red-950 font-cinzel">
                              {day.day_name}
                            </span>
                            <span className="text-[16px] font-semibold text-black bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {day.date_string}
                            </span>
                          </div>
                          <span className="text-[16px] font-bold text-black">
                            दिन {idx + 1}
                          </span>
                        </div>

                        {/* Three Pillars: Harmony, Passion, Talks */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-rose-50/70 border border-rose-200/80 p-2 rounded-lg">
                            <div className="flex items-center justify-center gap-1 text-[14px] font-bold text-rose-900">
                              <Heart className="w-2.5 h-2.5 text-rose-600 fill-rose-500" />
                              <span>Harmony</span>
                            </div>
                            <span className="text-base font-black text-rose-950 font-cinzel block mt-0.5">
                              {day.harmony_score}%
                            </span>
                          </div>

                          <div className="bg-amber-50/70 border border-amber-200/80 p-2 rounded-lg">
                            <div className="flex items-center justify-center gap-1 text-[14px] font-bold text-amber-900">
                              <Flame className="w-2.5 h-2.5 text-amber-600" />
                              <span>Passion</span>
                            </div>
                            <span className="text-base font-black text-amber-950 font-cinzel block mt-0.5">
                              {day.passion_score}%
                            </span>
                          </div>

                          <div className="bg-indigo-50/70 border border-indigo-200/80 p-2 rounded-lg">
                            <div className="flex items-center justify-center gap-1 text-[14px] font-bold text-indigo-900">
                              <MessageCircle className="w-2.5 h-2.5 text-indigo-600" />
                              <span>Talks</span>
                            </div>
                            <span className="text-base font-black text-indigo-950 font-cinzel block mt-0.5">
                              {day.communication_score}%
                            </span>
                          </div>
                        </div>

                        {/* Daily Astrological Advice */}
                        <div className="p-2.5 bg-amber-50/50 rounded-lg border border-amber-200/60 text-[16px] text-black leading-relaxed italic">
                          <span className="font-bold text-amber-900 not-italic mr-1">सलाह:</span>
                          "{day.advice}"
                        </div>
                      </div>

                      <div className="pt-2 border-t border-amber-100 flex items-center justify-between text-[14px] text-black font-medium">
                        <span>अनुकूलता स्तर</span>
                        <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${
                          day.harmony_score >= 70
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                            : day.harmony_score >= 40
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-rose-100 text-rose-900 border border-rose-200'
                        }`}>
                          {day.harmony_score >= 70 ? '⭐⭐⭐ अत्यंत शुभ (High)' : day.harmony_score >= 40 ? '⭐⭐ मध्यम (Moderate)' : '⭐ न्यून (Low)'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Bottom Floating Recalculate CTA */}
            <div className="bg-gradient-to-r from-amber-100 via-white to-amber-100 rounded-xl border border-amber-300 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-2xs">
              <div className="flex items-center gap-2 text-xs text-amber-950 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>ग्रह गोचर प्रत्येक सप्ताह बदलता रहता है। निरंतर मार्गदर्शन हेतु आगामी सप्ताह पुनः जांचें।</span>
              </div>
              <button
                onClick={reset}
                className="w-full sm:w-auto px-3.5 py-1.5 bg-gradient-to-r from-red-800 to-amber-900 hover:brightness-110 text-white font-bold text-xs rounded-lg shadow-xs transition cursor-pointer shrink-0"
              >
                नया मिलान दर्ज करें
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
