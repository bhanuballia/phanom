import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { PYTHON_ASTRO_URL } from '../services/api';
import StandaloneD1Chart from '../components/StandaloneD1Chart';
import {
  Star,
  Clock,
  Sparkles,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Compass,
  Calendar,
  Layers,
  Info,
  Sun,
  Moon,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  PhoneCall
} from 'lucide-react';

const SIGN_MAP = {
  "Aries": 1, "Taurus": 2, "Gemini": 3, "Cancer": 4, "Leo": 5, "Virgo": 6,
  "Libra": 7, "Scorpio": 8, "Sagittarius": 9, "Capricorn": 10, "Aquarius": 11, "Pisces": 12
};

const HINDI_SIGNS = {
  "Aries": "मेष (Aries)",
  "Taurus": "वृषभ (Taurus)",
  "Gemini": "मिथुन (Gemini)",
  "Cancer": "कर्क (Cancer)",
  "Leo": "सिंह (Leo)",
  "Virgo": "कन्या (Virgo)",
  "Libra": "तुला (Libra)",
  "Scorpio": "वृश्चिक (Scorpio)",
  "Sagittarius": "धनु (Sagittarius)",
  "Capricorn": "मकर (Capricorn)",
  "Aquarius": "कुंभ (Aquarius)",
  "Pisces": "मीन (Pisces)"
};

export default function AdvancedNakshatraPage() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active view tab: 'overview' | 'chart' | 'table'
  const [activeTab, setActiveTab] = useState('overview');

  // Time Machine
  const [isLive, setIsLive] = useState(true);
  const [viewDate, setViewDate] = useState(new Date());

  // Fetch Live Nakshatra Data
  useEffect(() => {
    let active = true;
    const fetchLiveNakshatra = async () => {
      try {
        let url = `${PYTHON_ASTRO_URL}/api/nakshatra_advanced/live`;
        if (!isLive && viewDate) {
          url += `?target_datetime=${encodeURIComponent(viewDate.toISOString())}`;
        }

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to fetch Nakshatra data (HTTP ${res.status})`);
        }
        const result = await res.json();
        if (active) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    setLoading(true);
    fetchLiveNakshatra();

    let interval;
    if (isLive) {
      interval = setInterval(fetchLiveNakshatra, 60000);
    }
    return () => {
      active = false;
      if (interval) clearInterval(interval);
    };
  }, [isLive, viewDate]);

  // Build Chart Houses & Positions for StandaloneD1Chart
  const getChartData = () => {
    if (!data || !data.data) return { chartHouses: {}, formattedPositions: [] };

    const ascendantItem = data.data.find(item => item.planet && item.planet.includes("Ascendant"));
    const ascSignName = ascendantItem ? ascendantItem.sign : "Sagittarius";
    const ascSignNum = SIGN_MAP[ascSignName] || 9;

    const chartHouses = {};
    for (let h = 1; h <= 12; h++) {
      chartHouses[h] = {
        sign_index: (ascSignNum + h - 2) % 12,
        planets: []
      };
    }

    const formattedPositions = [];
    data.data.forEach(item => {
      let pName = item.planet;
      if (pName.includes("Rahu")) pName = "Rahu";
      else if (pName.includes("Ketu")) pName = "Ketu";
      else if (pName.includes("Ascendant")) pName = "Ascendant";
      else if (pName.includes("Arun") || pName.includes("Uranus")) pName = "Uranus";
      else if (pName.includes("Varun") || pName.includes("Neptune")) pName = "Neptune";
      else if (pName.includes("Yam") || pName.includes("Pluto")) pName = "Pluto";

      formattedPositions.push({
        planet: pName,
        name: pName,
        degree: item.degree,
        nakshatra: item.nakshatra,
        is_retrograde: item.speed < 0,
        is_combust: false
      });

      if (item.planet && item.planet.includes("Ascendant")) return;

      const planetSignNum = SIGN_MAP[item.sign] || 1;
      const houseNum = ((planetSignNum - ascSignNum + 12) % 12) + 1;

      if (chartHouses[houseNum]) {
        chartHouses[houseNum].planets.push({
          name: pName,
          degree: item.degree % 30,
          is_retrograde: item.speed < 0,
          is_combust: false,
          nakshatra: item.nakshatra
        });
      }
    });

    return { chartHouses, formattedPositions };
  };

  const { chartHouses, formattedPositions } = getChartData();

  // Helper for ascendant and moon
  const ascendantItem = data?.data?.find(item => item.planet && item.planet.includes("Ascendant"));
  const moonItem = data?.data?.find(item => item.planet === "Moon");
  const sunItem = data?.data?.find(item => item.planet === "Sun");

  return (
    <div className="min-h-screen bg-[#fffdfa] flex flex-col font-sans text-slate-800 selection:bg-amber-200">
      <Navigation />

      <main className="flex-1 w-full pt-20 sm:pt-24 pb-14 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">

        {/* Top Breadcrumb & Navigation Links */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700 text-[15px] font-medium">
            <Link to="/" className="hover:text-amber-800 transition">होम (Home)</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link to="/daily-panchang" className="hover:text-amber-800 transition">पंचांग (Panchang)</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-amber-900 font-bold">नक्षत्र और लाइव ग्रह स्थिति (Adv. Nakshatra)</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/advance-muhurt"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white hover:bg-amber-50 text-slate-800 border border-amber-300 shadow-2xs transition"
            >
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>शुभ मुहूर्त (Advance Muhurt)</span>
              <ArrowUpRight className="w-3 h-3 text-slate-500" />
            </Link>

            <Link
              to="/monthly-calendar"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white hover:bg-amber-50 text-slate-800 border border-amber-300 shadow-2xs transition"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-700" />
              <span>मासिक कैलेंडर (Monthly Grid)</span>
              <ArrowUpRight className="w-3 h-3 text-slate-500" />
            </Link>
          </div>
        </div>

        {/* Hero Section: Half-Width Hero Banner on Left & nk1.png on Right */}
        <div className="flex flex-col md:flex-row items-stretch justify-between gap-4">
          {/* Hero Banner with Celestial Styling matching Vedic Theme (Half of Screen Width) */}
          <div className="w-full md:w-1/2 md:max-w-[50%] relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950 via-stone-900 to-amber-950 text-white px-5 py-4 sm:px-6 sm:py-5 shadow-lg border border-amber-500/25 flex flex-col justify-center">
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute right-4 top-3 hidden lg:flex items-center gap-3 opacity-15 pointer-events-none">
              <Sun className="w-14 h-14 stroke-[1.2] text-amber-300" />
              <Moon className="w-12 h-12 stroke-[1.2] text-amber-100" />
              <Star className="w-12 h-12 stroke-[1.2] text-yellow-200" />
            </div>

            <div className="relative z-10 space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold tracking-wide">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>वैदिक नक्षत्र गणना • Live Celestial Ephemeris</span>
              </div>

              <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold font-cinzel text-amber-100 tracking-wide leading-snug">
                लाइव नक्षत्र एवं ग्रह गोचर स्पष्ट स्थिति
              </h1>

              <p className="text-xs text-amber-200/85 leading-relaxed font-normal">
                27 नक्षत्रों की सूक्ष्म पद गणना, 12 ग्रहों की सटीक क्रांति व रेखांश, तात्कालिक चंद्र नक्षत्र का मुहूर्त स्वभाव।
              </p>
            </div>
          </div>

          {/* Right Side: Nakshatra Visual Image (nk1.png) - Clickable to Astrologer Page */}
          <div className="w-full md:w-1/2 md:max-w-[50%] flex items-center justify-center">
            <Link
              to="/astrologers"
              title="ज्योतिषी से बात करें (Consult Astrologers)"
              className="w-full h-full min-h-[140px] max-h-[180px] sm:max-h-[200px] rounded-2xl overflow-hidden border border-amber-300/80 shadow-lg hover:shadow-2xl hover:border-amber-500 bg-gradient-to-br from-amber-50 to-orange-100/50 flex items-center justify-center relative group cursor-pointer transition-all duration-300"
            >
              <img
                src="/images/nk1.png"
                alt="Vedic Nakshatra & Planetary Wheel"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent group-hover:from-black/70 transition-colors pointer-events-none" />
              <div className="absolute bottom-2 left-3 flex items-center gap-1.5 text-[11px] font-bold text-amber-100 bg-black/60 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-amber-400/40 group-hover:border-amber-400 transition-colors">
                <span>✨ 27 वैदिक नक्षत्र मंडल</span>
                <span className="text-amber-300">• ज्योतिषी से परामर्श करें</span>
                <ArrowUpRight className="w-3 h-3 text-amber-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* Control Bar: Time Machine & View Switcher */}
        <div className="bg-white rounded-2xl border border-amber-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Time Machine & Date Picker */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center bg-amber-50/70 border border-amber-900 rounded-xl p-1 shadow-2xs">
              <button
                onClick={() => {
                  const newD = new Date(viewDate);
                  newD.setDate(newD.getDate() - 1);
                  setViewDate(newD);
                  setIsLive(false);
                }}
                className="p-1.5 rounded-lg hover:bg-amber-200/60 text-amber-950 transition"
                title="पिछला दिन (Previous Day)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <input
                type="datetime-local"
                value={new Date(viewDate.getTime() - (viewDate.getTimezoneOffset() * 60000)).toISOString().slice(0, 16)}
                onChange={(e) => {
                  if (e.target.value) {
                    setViewDate(new Date(e.target.value));
                    setIsLive(false);
                  }
                }}
                className="bg-transparent text-amber-950 text-[14px] font-mono font-bold outline-none px-2 text-center"
              />
              <button
                onClick={() => {
                  const newD = new Date(viewDate);
                  newD.setDate(newD.getDate() + 1);
                  setViewDate(newD);
                  setIsLive(false);
                }}
                className="p-1.5 rounded-lg hover:bg-amber-200/60 text-amber-950 transition"
                title="अगला दिन (Next Day)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {!isLive ? (
              <button
                onClick={() => {
                  setIsLive(true);
                  setViewDate(new Date());
                }}
                className="bg-red-800 hover:bg-red-900 text-white font-bold px-3 py-2 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>लाइव रीसेट (Reset to Live)</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>लाइव प्रसारण सक्रिय (Auto 60s)</span>
              </div>
            )}

            {data?.timestamp && (
              <span className="text-[14px] text-stone-900 font-mono hidden xl:inline">
                {data.timestamp}
              </span>
            )}
          </div>

          {/* View Mode Tabs */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200 w-full md:w-auto justify-center">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-[14px] font-bold transition flex items-center gap-1.5 cursor-pointer ${activeTab === 'overview'
                ? 'bg-white text-amber-900 shadow-xs border border-amber-900'
                : 'text-stone-900 hover:text-stone-900'
                }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>समग्र अवलोकन (Overview)</span>
            </button>
            <button
              onClick={() => setActiveTab('chart')}
              className={`px-3 py-1.5 rounded-lg text-[14px] font-bold transition flex items-center gap-1.5 cursor-pointer ${activeTab === 'chart'
                ? 'bg-white text-amber-900 shadow-xs border border-amber-900'
                : 'text-stone-900 hover:text-stone-900'
                }`}
            >
              <Compass className="w-3.5 h-3.5 text-amber-600" />
              <span>गोचर कुंडली (Live Chart)</span>
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${activeTab === 'table'
                ? 'bg-white text-amber-900 shadow-xs border border-amber-200'
                : 'text-stone-600 hover:text-stone-900'
                }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              <span>ग्रह तालिका (Ephemeris)</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-3xl border border-amber-200 p-16 flex flex-col items-center justify-center text-center shadow-xs">
            <div className="w-12 h-12 rounded-full border-4 border-amber-600 border-t-transparent animate-spin mb-4" />
            <h3 className="text-base font-bold text-amber-950 font-cinzel">ग्रह एवं नक्षत्र गणना हो रही है...</h3>
            <p className="text-xs text-stone-500 mt-1">Live Swiss Ephemeris & Nakshatra calculations in progress</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-rose-50 border border-rose-300 rounded-3xl p-6 text-center text-rose-900 shadow-xs">
            <p className="font-bold text-base mb-1">नक्षत्र इंजन त्रुटि (Engine Error)</p>
            <p className="text-xs text-rose-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              पुनः प्रयास करें (Retry)
            </button>
          </div>
        )}

        {data && !loading && (
          <div className="space-y-6">

            {/* Quick KPI Stat Cards (Ascendant, Moon Nakshatra, Sun Sign, Planetary Speed) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white rounded-2xl border border-amber-black p-4 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-amber-800 font-bold mb-1">
                  <span>लग्न (Ascendant)</span>
                  <Compass className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-lg sm:text-xl font-bold text-stone-900">
                  {ascendantItem ? HINDI_SIGNS[ascendantItem.sign] || ascendantItem.sign : 'Sagittarius'}
                </div>
                <div className="text-[16px] text-orange-600 font-mono mt-1">
                  {ascendantItem ? `${ascendantItem.nakshatra} (Pada ${ascendantItem.pada})` : ''}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-black p-4 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-blue-800 font-bold mb-1">
                  <span>चंद्र नक्षत्र (Moon Star)</span>
                  <Moon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-lg sm:text-xl font-bold text-stone-900">
                  {data.muhurat?.current_moon_nakshatra || moonItem?.nakshatra || 'Uttara Ashadha'}
                </div>
                <div className="text-[16px] text-orange-600 font-mono mt-1">
                  {moonItem ? `${moonItem.sign} • Pada ${moonItem.pada}` : ''}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-black p-4 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-orange-800 font-bold mb-1">
                  <span>सूर्य राशि (Sun Sign)</span>
                  <Sun className="w-4 h-4 text-orange-600" />
                </div>
                <div className="text-lg sm:text-xl font-bold text-stone-900">
                  {sunItem ? HINDI_SIGNS[sunItem.sign] || sunItem.sign : 'Libra'}
                </div>
                <div className="text-[16px] text-orange-600 font-mono mt-1">
                  {sunItem ? `${sunItem.nakshatra} (Pada ${sunItem.pada})` : ''}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-black p-4 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-emerald-800 font-bold mb-1">
                  <span>मुहूर्त प्रकृति (Muhurat Nature)</span>
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-lg sm:text-xl font-bold text-emerald-900">
                  {data.muhurat?.nature || 'Fixed / Sthira'}
                </div>
                <div className="text-[16px] text-orange-600 font-mono mt-1">
                  शुभ एवं स्थायी कार्यों हेतु
                </div>
              </div>
            </div>

            {/* Live Muhurat Analysis Box with First Talk Free CTA on the Right */}
            {data.muhurat && (
              <div className="bg-gradient-to-br from-amber-50/70 via-white to-orange-50/50 rounded-3xl border border-amber-900 p-5 sm:p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-200/70 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 text-amber-900 text-xs font-extrabold uppercase tracking-wide">
                      <Star className="w-4 h-4 text-amber-600 fill-amber-500" />
                      <span>तात्कालिक नक्षत्र मुहूर्त स्वभाव (Active Muhurat Nature)</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 mt-1">
                      चंद्रमा वर्तमान में <span className="text-amber-900 underline decoration-amber-400">{data.muhurat.current_moon_nakshatra}</span> में संचरण कर रहे हैं
                    </h2>
                    <p className="text-[14px] text-black mt-1">
                      इस नक्षत्र की प्रकृति <span className="font-bold text-amber-950 bg-amber-100 px-2 py-0.5 rounded-md">{data.muhurat.nature}</span> है।
                    </p>
                  </div>

                  {/* First Talk Free CTA Flex Box on the Right side */}
                  <div className="shrink-0 flex items-center">
                    <Link
                      to="/astrologers"
                      className="group relative inline-flex items-center gap-3 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 border border-yellow-200/70 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer overflow-hidden"
                    >
                      <div className="w-9 h-9 rounded-full bg-white/95 text-amber-900 flex items-center justify-center shadow-md group-hover:rotate-12 transition-transform shrink-0">
                        <PhoneCall className="w-4 h-4 text-orange-600 animate-pulse" />
                      </div>
                      <div className="flex flex-col text-left leading-tight">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm sm:text-base font-black uppercase tracking-wide text-slate-950">
                            First Talk Free
                          </span>
                          <span className="text-[10px] bg-red-600 text-white font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider animate-bounce shadow-xs">
                            FREE
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-amber-950/90 flex items-center gap-1 mt-0.5">
                          <span>हमारे ज्योतिषी से बात करें (Talk to Astrologer)</span>
                          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 shadow-2xs">
                    <h3 className="text-xs font-black text-emerald-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>इस समय के लिए अनुशंसित / शुभ कार्य (Favorable For)</span>
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {data.muhurat.favorable_activities?.map((act, i) => (
                        <span
                          key={i}
                          className="bg-white border border-emerald-300 text-emerald-900 text-xs font-semibold px-2.5 py-1 rounded-lg shadow-2xs"
                        >
                          ✓ {act}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-4 shadow-2xs">
                    <h3 className="text-xs font-black text-rose-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>इस समय त्यागने योग्य कार्य (Unfavorable / Avoid)</span>
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {data.muhurat.unfavorable_activities?.map((act, i) => (
                        <span
                          key={i}
                          className="bg-white border border-rose-300 text-rose-900 text-xs font-semibold px-2.5 py-1 rounded-lg shadow-2xs"
                        >
                          ✗ {act}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Overview (Chart + Summary) or dedicated tabs */}
            {(activeTab === 'overview' || activeTab === 'chart') && (
              <div className="bg-white rounded-3xl border border-amber-900 p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-amber-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-amber-700" />
                    <h3 className="text-base sm:text-lg font-bold font-serif text-stone-900">
                      तात्कालिक गोचर कुंडली (Live Planetary Chart)
                    </h3>
                  </div>
                  <span className="text-xs text-stone-500 font-semibold bg-stone-100 px-2.5 py-1 rounded-full">
                    North Indian Vedic Kundali
                  </span>
                </div>

                <div className="max-w-4xl mx-auto">
                  <StandaloneD1Chart
                    houses={chartHouses}
                    planetPositions={formattedPositions}
                    title="Real-time Celestial Transit"
                    lang="en"
                  />
                </div>
              </div>
            )}

            {(activeTab === 'overview' || activeTab === 'table') && (
              <div className="bg-white rounded-3xl border border-amber-900 shadow-sm overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-amber-100 flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-amber-50/60 to-white">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-amber-700" />
                    <div>
                      <h3 className="text-base sm:text-lg font-bold font-serif text-stone-900">
                        ग्रह-नक्षत्र स्पष्ट तालिका (Planetary Ephemeris Table)
                      </h3>
                      <p className="text-[16px] text-black">
                        Nirayana (Lahiri Ayanamsha) live astronomical positions
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-300">
                    {data.data ? `${data.data.length} पिण्ड (Bodies)` : ''}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[14px] border-collapse">
                    <thead>
                      <tr className="bg-stone-50 border-b bosrder-stone-900 text-stone-900 font-bold uppercase tracking-wider text-[14px]">
                        <th className="p-3.5">ग्रह / बिन्दु (Planet)</th>
                        <th className="p-3.5">राशि (Sign)</th>
                        <th className="p-3.5">स्पष्ट अंश (Exact Degree)</th>
                        <th className="p-3.5">नक्षत्र (Nakshatra)</th>
                        <th className="p-3.5">पद (Pada)</th>
                        <th className="p-3.5">गति (Speed deg/day)</th>
                        <th className="p-3.5">क्रांति (Dec)</th>
                        <th className="p-3.5">विषुवांश (RA)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {data.data && data.data.map((item, idx) => {
                        const isLagna = item.planet.includes("Ascendant");
                        const isRetro = item.speed < 0;
                        return (
                          <tr
                            key={idx}
                            className={`hover:bg-amber-50/40 transition-colors ${isLagna ? 'bg-amber-50/60 font-semibold' : ''
                              }`}
                          >
                            <td className="p-3.5 font-bold text-stone-900 flex items-center gap-2">
                              {isLagna && <span className="w-2 h-2 rounded-full bg-amber-600" />}
                              <span>{item.planet}</span>
                              {isRetro && (
                                <span className="text-[10px] bg-rose-100 text-rose-800 border border-rose-300 px-1.5 py-0.2 rounded font-mono font-bold">
                                  वक्र (R)
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 text-black font-medium">
                              {HINDI_SIGNS[item.sign] || item.sign}
                            </td>
                            <td className="p-3.5 text-amber-900 font-mono font-bold">
                              {item.degree?.toFixed(2)}°
                            </td>
                            <td className="p-3.5 font-bold text-stone-900">
                              {item.nakshatra}
                            </td>
                            <td className="p-3.5 text-black font-mono">
                              <span className="bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                                पद {item.pada}
                              </span>
                            </td>
                            <td className="p-3.5 font-mono font-bold text-black">
                              {item.speed !== 0 ? `${item.speed?.toFixed(4)}°/d` : '0.0000'}
                            </td>
                            <td className="p-3.5 font-mono font-bold text-black">
                              {item.dec !== 0 ? `${item.dec?.toFixed(2)}°` : '0.00°'}
                            </td>
                            <td className="p-3.5 font-mono font-bold text-black">
                              {item.ra !== 0 ? `${item.ra?.toFixed(2)}°` : '0.00°'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
