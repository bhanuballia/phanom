import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import PlaceAutocomplete from '../components/PlaceAutocomplete';
import MuhurtHeatmap from '../components/MuhurtHeatmap';
import { PYTHON_ASTRO_URL } from '../services/api';
import {
  Sparkles,
  RefreshCw,
  Clock,
  MapPin,
  ArrowLeft,
  Award,
  CalendarDays,
  Search,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Flame,
  CheckCircle2
} from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const CEREMONIES = [
  { id: "Marriage", name: "विवाह मुहूर्त (Marriage)", icon: "💍" },
  { id: "Grih Pravesh", name: "गृह प्रवेश (Griha Pravesh)", icon: "🏠" },
  { id: "Bhoomi Pujan", name: "भूमि पूजन (Bhoomi Pujan)", icon: "🪨" },
  { id: "Vehicle Purchase", name: "वाहन क्रय (Vehicle Purchase)", icon: "🚗" },
  { id: "Namkaran", name: "नामकरण संस्कार (Namkaran)", icon: "👶" },
  { id: "Anna Prashan", name: "अन्नप्राशन (Anna Prashan)", icon: "🥣" },
  { id: "Mundan", name: "मुंडन संस्कार (Mundan)", icon: "✂️" },
  { id: "Upnayan", name: "उपनयन / जनेऊ (Upnayan)", icon: "🧵" },
  { id: "Sagai", name: "सगाई / रोका (Engagement)", icon: "💍" },
  { id: "Tilak", name: "तिलक समारोह (Tilak)", icon: "🪔" },
  { id: "Vadhu Pravesh", name: "वधू प्रवेश (Vadhu Pravesh)", icon: "🌸" }
];

export default function AdvanceMuhurtPage() {
  const [ceremony, setCeremony] = useState("Marriage");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState({
    name: "New Delhi, India",
    lat: 28.6139,
    lon: 77.2090,
    tz: 5.5
  });

  // Top Exact Windows State
  const [topWindows, setTopWindows] = useState(null);
  const [loadingWindows, setLoadingWindows] = useState(false);
  const [windowsError, setWindowsError] = useState(null);

  // Toggle for Shastric Guidance Accordion
  const [showShastraGuide, setShowShastraGuide] = useState(false);

  // Check if user has saved worksheetData or location
  useEffect(() => {
    try {
      const savedLoc = localStorage.getItem('panchangUserLocation');
      if (savedLoc) {
        const parsed = JSON.parse(savedLoc);
        if (parsed.lat && parsed.lon) {
          setLocation({
            name: parsed.name || "My Location",
            lat: parseFloat(parsed.lat),
            lon: parseFloat(parsed.lon),
            tz: parsed.tz !== undefined ? parseFloat(parsed.tz) : 5.5
          });
        }
      }
    } catch {
      // keep default
    }
  }, []);

  const handleLocationPick = (place) => {
    setLocation({
      name: place.display_name || `${place.lat.toFixed(2)}, ${place.lon.toFixed(2)}`,
      lat: place.lat,
      lon: place.lon,
      tz: place.tz_offset_hours || 5.5
    });
  };

  // 1. Fetch Top 3 Exact Timing Windows
  const fetchTopWindows = async () => {
    setLoadingWindows(true);
    setWindowsError(null);
    try {
      const baseUrl = PYTHON_ASTRO_URL.replace(/\/api\/kundali\/?$/, '').replace(/\/+$/, '');
      const payload = {
        start_date: startDate,
        end_date: endDate || undefined,
        days: endDate ? undefined : 30,
        ceremony: ceremony,
        lat: location.lat,
        lon: location.lon,
        tz: location.tz,
        user_profile: {
          moon_lon: null
        }
      };

      const res = await axios.post(`${baseUrl}/api/muhurt/search_advanced`, payload);
      setTopWindows(res.data?.top_muhurtas || []);
    } catch (err) {
      console.error(err);
      setWindowsError(err?.response?.data?.detail || err?.message || "उन्नत मुहूर्त गणना में त्रुटि हुई।");
    } finally {
      setLoadingWindows(false);
    }
  };

  useEffect(() => {
    fetchTopWindows();
  }, [ceremony, startDate, endDate, location.lat, location.lon, location.tz]);

  const currentCeremonyObj = CEREMONIES.find(c => c.id === ceremony) || CEREMONIES[0];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-amber-200">
      <Navigation />

      {/* Editorial Header Banner - Starts completely below fixed Navigation bar */}
      <section className="pt-24 sm:pt-28 md:pt-32 bg-gradient-to-b from-amber-100/85 via-amber-50/60 to-stone-50 border-b border-amber-900/10 pb-3 sm:pb-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                to="/"
                className="inline-flex items-center gap-1 text-[14px] font-bold text-amber-950 bg-white/80 hover:bg-white px-2.5 py-1 rounded-lg border border-amber-300 shadow-2xs transition"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-amber-800" />
                <span>Home</span>
              </Link>
              <span className="text-amber-800/30">•</span>
              <span className="inline-flex items-center gap-1 bg-amber-100/90 text-amber-950 text-[11px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                <Clock className="w-3 h-3 text-amber-700" />
                <span>Muhurta Engine</span>
              </span>
              <span className="text-amber-800/30">•</span>
              <button
                onClick={() => {
                  const el = document.getElementById('auspicious-calendar-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="inline-flex items-center gap-1 text-[14px] font-bold text-red-950 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 hover:brightness-105 px-2.5 py-0.5 rounded-lg border border-amber-400 shadow-2xs transition cursor-pointer hover:shadow-xs"
              >
                <CalendarDays className="w-3 h-3 text-red-800" />
                <span>Click Here For शुभ कैलेंडर (Auspicious Calendar)</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-1 text-[14px] text-amber-950 font-semibold bg-amber-200/50 px-2.5 py-0.5 rounded-full border border-amber-300/80">
                <Sparkles className="w-3 h-3 text-amber-700" />
                <span>ग्रह-नक्षत्र व चौघड़िया अनुकूलता गणना</span>
              </div>
              <div className="flex items-center gap-1.5 text-[12px] bg-white/80 border border-amber-200 rounded-lg px-2.5 py-0.5 text-stone-600">
                <MapPin className="w-3 h-3 text-amber-700 shrink-0" />
                <span className="truncate max-w-[150px] sm:max-w-[200px] font-bold text-stone-800">{location.name}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <h1 className="text-lg sm:text-xl font-black text-red-950 font-cinzel tracking-tight flex items-center gap-2">
              <span>उन्नत शुभ मुहूर्त खोज</span>
              <span className="text-[14px] font-sans font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.2 rounded-md">
                {currentCeremonyObj.icon} {currentCeremonyObj.name}
              </span>
            </h1>
            <p className="text-[14px] sm:text-xs text-stone-900 max-w-xl truncate">
              विवाह, गृह प्रवेश, नामकरण, वाहन आदि हेतु तिथि, नक्षत्र, चौघड़िया व होरा चक्र का वैज्ञानिक विश्लेषण।
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-7">

        {/* Split Grid: Left Side = Search Parameter Card | Right Side = Top 3 Exact Recommended Windows */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

          {/* LEFT SIDE: Search Parameter Card (lg:col-span-5) */}
          <div className="lg:col-span-5 bg-white rounded-2xl sm:rounded-3xl border border-amber-900 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-amber-100 pb-2.5">
              <div className="flex items-center gap-2 text-red-950">
                <span className="text-xs font-black bg-amber-100 text-amber-900 w-5 h-5 rounded-full inline-flex items-center justify-center border border-amber-300">
                  १
                </span>
                <h2 className="text-xs sm:text-sm font-black font-cinzel uppercase tracking-wider text-amber-950">
                  खोज मापदंड (Search Parameters)
                </h2>
              </div>
              <span className="text-[10px] font-bold text-amber-900 bg-amber-100/70 border border-amber-200 px-2 py-0.5 rounded-full">
                {currentCeremonyObj.icon} {currentCeremonyObj.name.split(' ')[0]}
              </span>
            </div>

            <div className="space-y-3.5">
              {/* 1. Ceremony Select */}
              <div>
                <label className="text-[11px] font-bold text-amber-950 uppercase tracking-wide block mb-1">
                  १. संस्कार / कार्य (Ceremony)
                </label>
                <select
                  value={ceremony}
                  onChange={(e) => setCeremony(e.target.value)}
                  className="w-full bg-amber-50/50 border border-amber-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition cursor-pointer"
                >
                  {CEREMONIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Start Date & End Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-amber-950 uppercase tracking-wide block mb-1">
                    २. आरंभ तिथि (Start Date)
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-amber-50/50 border border-amber-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-amber-950 uppercase tracking-wide block mb-1">
                    ३. समाप्ति (End Date - ऐच्छिक)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="Next 30 Days"
                    className="w-full bg-amber-50/50 border border-amber-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition"
                  />
                </div>
              </div>

              {/* 3. Location Auto-lookup */}
              <div>
                <label className="text-[11px] font-bold text-amber-950 uppercase tracking-wide block mb-1">
                  ४. स्थान (City / Location)
                </label>
                <PlaceAutocomplete
                  value={location.name}
                  onSelect={handleLocationPick}
                  placeholder="स्थान खोजें (उदा. Delhi, Mumbai)..."
                  inputClassName="w-full bg-amber-50/50 border border-amber-300 rounded-xl pl-8 pr-7 py-2 text-xs sm:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition placeholder:text-stone-400"
                />
              </div>
            </div>

            {/* Note & Action Button */}
            <div className="space-y-3 pt-2 border-t border-amber-100">
              <p className="text-[11px] text-stone-500 leading-tight">
                💡 चयनित संस्कार व स्थान के अनुसार दाईं ओर शीर्ष मुहूर्त एवं नीचे सम्पूर्ण हीटमैप स्वतः अद्यतन होते हैं।
              </p>

              <button
                onClick={fetchTopWindows}
                disabled={loadingWindows}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-red-800 to-amber-900 hover:brightness-110 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loadingWindows ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>गणना जारी है...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>शुभ मुहूर्त पुनः खोजें (Recalculate)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: Top 3 Exact Recommended Windows (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-3.5">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2.5">
              <div className="flex items-center gap-2 text-red-950">
                <Award className="w-5 h-5 text-amber-800" />
                <h2 className="text-sm sm:text-base font-black font-cinzel">
                  सर्वोत्तम मुहूर्त समय (Top 3 Exact Recommended Windows)
                </h2>
              </div>
              <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                {currentCeremonyObj.name}
              </span>
            </div>

            {loadingWindows ? (
              <div className="bg-white rounded-2xl border border-amber-200 p-8 text-center space-y-3 shadow-xs">
                <RefreshCw className="w-8 h-8 text-amber-800 animate-spin mx-auto" />
                <p className="text-sm font-bold text-stone-700">
                  सहस्रों ग्रह गोचर व नक्षत्र चक्रों का विश्लेषण हो रहा है...
                </p>
                <p className="text-xs text-stone-500">
                  स्थान के अक्षांश-देशांतर व सूर्योदय अनुसार सूक्ष्म गणना जारी है।
                </p>
              </div>
            ) : windowsError ? (
              <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl text-rose-900 text-xs sm:text-sm font-semibold text-center">
                ⚠️ {windowsError}
              </div>
            ) : topWindows && topWindows.length > 0 ? (
              <div className="space-y-3">
                {topWindows.map((win, idx) => {
                  const sDate = new Date(win.start_time);
                  const eDate = new Date(win.end_time);
                  const isTop = idx === 0;

                  return (
                    <div
                      key={idx}
                      className={`bg-white rounded-2xl border p-3.5 sm:p-4 transition shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isTop
                        ? 'border-amber-400 bg-gradient-to-r from-amber-50/70 via-white to-amber-50/30 ring-2 ring-amber-300/40'
                        : 'border-amber-900 hover:border-amber-300'
                        }`}
                    >
                      {/* Left Block: Rank Badge & Date/Time */}
                      <div className="flex items-start sm:items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-2xs ${isTop
                            ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-red-950'
                            : 'bg-stone-100 text-stone-700 border border-stone-200'
                            }`}
                        >
                          #{idx + 1}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm sm:text-base font-black text-red-950 font-cinzel leading-tight">
                              {sDate.toLocaleDateString('hi-IN', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                            {isTop && (
                              <span className="text-[10px] bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                🌟 सर्वश्रेष्ठ काल
                              </span>
                            )}
                          </div>

                          <div className="text-xs sm:text-sm font-extrabold text-stone-900 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-800" />
                            <span>
                              {sDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {' — '}
                              {eDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {/* Pills for Nakshatra, Tithi, Reasons */}
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {win.nakshatra && (
                              <span className="text-[11px] bg-amber-100 text-amber-950 font-bold px-2 py-0.5 rounded-md border border-amber-200">
                                🌙 {win.nakshatra}
                              </span>
                            )}
                            {win.tithi && (
                              <span className="text-[11px] bg-rose-50 text-rose-950 font-bold px-2 py-0.5 rounded-md border border-rose-200">
                                📅 {win.tithi}
                              </span>
                            )}
                            {win.reasons?.slice(0, 2).map((rsn, rIdx) => (
                              <span
                                key={rIdx}
                                className="text-[11px] bg-emerald-50 text-emerald-950 font-semibold px-2 py-0.5 rounded-md border border-emerald-200"
                              >
                                ✓ {rsn}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Block: Score Badge */}
                      <div className="flex sm:flex-col items-center justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-amber-100 pt-2.5 sm:pt-0 sm:pl-4 shrink-0 text-center">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                            शुभता अंक
                          </div>
                          <div className="text-xl sm:text-2xl font-black text-red-950 font-cinzel">
                            {win.score}
                            <span className="text-xs text-stone-400 font-normal">/100</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full mt-0.5">
                          प्रशस्त
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-amber-200 p-6 text-center text-stone-500 font-medium">
                चयनित समयावधि में कोई अनुकूल मुहूर्त प्राप्त नहीं हुआ।
              </div>
            )}
          </div>

        </div>

        {/* Section 2: Interactive Auspiciousness Heatmap Calendar */}
        <div id="auspicious-calendar-section" className="space-y-4 pt-2 scroll-mt-6">
          <MuhurtHeatmap
            ceremony={ceremony}
            startDate={startDate}
            days={30}
            lat={location.lat}
            lon={location.lon}
            tz={location.tz}
          />
        </div>

        {/* Section 3: Shastric Guidance & Vedic Knowledge Accordion */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-amber-900/15 p-4 sm:p-6 shadow-xs space-y-4">
          <div
            onClick={() => setShowShastraGuide(!showShastraGuide)}
            className="flex items-center justify-between cursor-pointer border-b border-amber-100 pb-3"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center border border-amber-300">
                <BookOpen className="w-4 h-4 text-amber-800" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-red-950 font-cinzel">
                  {currentCeremonyObj.name} : शास्त्रीय महत्व एवं विधि
                </h2>
                <p className="text-xs text-stone-500">
                  वैदिक ग्रंथों एवं मुहूर्त चिंतामणि के अनुसार विधि-विधान, वर्जित काल व लाभ
                </p>
              </div>
            </div>

            <button
              type="button"
              className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 transition"
            >
              {showShastraGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showShastraGuide && (
            <div className="pt-1">
              <CeremonyKnowledgeCard ceremony={ceremony} />
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

// -------------------------------------------------------------
// Shastric / Classical Vedic Knowledge Component for Ceremony
// -------------------------------------------------------------
function CeremonyKnowledgeCard({ ceremony }) {
  if (ceremony === "Marriage") {
    return (
      <div className="space-y-4 text-stone-800">
        <p className="text-xs sm:text-sm leading-relaxed">
          विवाह संस्कार हिंदू धर्म के षोडश संस्कारों में सर्वाधिक महत्वपूर्ण है। विवाह मुहूर्त का निर्धारण केवल पंचांग देखकर नहीं अपितु वर-वधू की कुंडलियों के <b>त्रिबल शुद्धि (सूर्य, गुरु, चन्द्र बल)</b>, लग्न शुद्धि, तथा दशम भाव की पवित्रता का सूक्ष्म विश्लेषण करके किया जाता है।
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4 space-y-2">
            <h3 className="text-xs sm:text-sm font-black text-red-950 font-cinzel flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-800" />
              <span>मुहूर्त चयन के प्रमुख घटक</span>
            </h3>
            <ul className="text-xs space-y-1.5 list-disc list-inside text-stone-700">
              <li><b>शुभ नक्षत्र:</b> रोहिणी, मृगशिरा, मघा, हस्त, स्वाति, अनुराधा, मूल, उत्तराफाल्गुनी, उत्तराषाढ़ा, उत्तरभाद्रपद, रेवती।</li>
              <li><b>शुभ तिथियां:</b> द्वितीया, तृतीया, पंचमी, सप्तमी, एकादशी, त्रयोदशी (रिक्ता तिथियां ४, ९, १४ वर्जित)।</li>
              <li><b>शुभ वार:</b> सोमवार, बुधवार, गुरुवार व शुक्रवार (मंगलवार व शनिवार वर्जित)।</li>
              <li><b>त्रिबल शुद्धि:</b> वर हेतु सूर्य बल, कन्या हेतु गुरु बल तथा दोनों हेतु चन्द्र बल आवश्यक।</li>
            </ul>
          </div>

          <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4 space-y-2">
            <h3 className="text-xs sm:text-sm font-black text-red-950 font-cinzel flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-800" />
              <span>वर्जित काल (Prohibited Periods)</span>
            </h3>
            <ul className="text-xs space-y-1.5 list-disc list-inside text-stone-700">
              <li><b>गुरु व शुक्र अस्त:</b> जब बृहस्पति या शुक्र अस्त हों तो वैवाहिक मांगलिक कार्य पूर्णतः निषिद्ध होते हैं।</li>
              <li><b>चातुर्मास:</b> देवशयनी एकादशी से देवउठनी एकादशी तक भगवान विष्णु का शयन काल।</li>
              <li><b>मलमास / खरमास:</b> जब सूर्य धनु या मीन राशि में गोचर करते हैं।</li>
              <li><b>पितृपक्ष (श्राद्ध):</b> पितरों के प्रति श्रद्धा प्रकट करने का समय।</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (ceremony === "Grih Pravesh") {
    return (
      <div className="space-y-4 text-stone-800">
        <p className="text-xs sm:text-sm leading-relaxed">
          वास्तु शास्त्र के अनुसार भूमि एवं भवन की अपनी विशिष्ट ऊर्जा होती है। गृह प्रवेश मुहूर्त का मुख्य उद्देश्य वास्तु पुरुष को प्रसन्न करना तथा भवन में सकारात्मक ऊर्जा का संचार करना है। स्थिर नक्षत्रों में किया गया प्रवेश भवन में स्थायी सुख एवं संपत्ति की वृद्धि करता है।
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4 space-y-2">
            <h3 className="text-xs sm:text-sm font-black text-red-950 font-cinzel flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-800" />
              <span>शुभ नक्षत्र व पंचांग शुद्धि</span>
            </h3>
            <ul className="text-xs space-y-1.5 list-disc list-inside text-stone-700">
              <li><b>स्थिर नक्षत्र:</b> उत्तराफाल्गुनी, उत्तराषाढ़ा, उत्तरभाद्रपद, रोहिणी तथा धनिष्ठा अत्यंत श्रेष्ठ हैं।</li>
              <li><b>श्रेष्ठ वार:</b> सोमवार, बुधवार, गुरुवार एवं शुक्रवार।</li>
              <li><b>श्रेष्ठ तिथियां:</b> शुक्ल पक्ष की द्वितीया, तृतीया, पंचमी, सप्तमी, दशमी, एकादशी व त्रयोदशी।</li>
              <li><b>दिशा शूल परिहार:</b> प्रवेश के दिन गृह-द्वार की दिशा के अनुसार दिशाशूल का विचार अनिवार्य है।</li>
            </ul>
          </div>

          <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4 space-y-2">
            <h3 className="text-xs sm:text-sm font-black text-red-950 font-cinzel flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-800" />
              <span>गृह प्रवेश पूजा विधि क्रम</span>
            </h3>
            <ul className="text-xs space-y-1.5 list-disc list-inside text-stone-700">
              <li><b>तोरण व द्वार पूजन:</b> मुख्य द्वार पर आम के पत्ते व गेंदे के पुष्पों का वंदनवार बांधें।</li>
              <li><b>मंगल कलश प्रवेश:</b> गृहस्वामी दायीं टांग आगे रख जल-श्रीफल युक्त मंगल कलश लेकर प्रवेश करें।</li>
              <li><b>वास्तु शांति व हवन:</b> ईशान कोण में वास्तु पुरुष का आह्वान व नवग्रह शांति हवन संपन्न करें।</li>
              <li><b>दुग्ध उफान:</b> रसोई घर में सर्वप्रथम दूध को उफानकर गृह-समृद्धि का संकल्प लें।</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (ceremony === "Bhoomi Pujan") {
    return (
      <div className="space-y-4 text-stone-800">
        <p className="text-xs sm:text-sm leading-relaxed">
          भूमि पूजन भवन निर्माण का प्रथम एवं अति संवेदनशील चरण है। वास्तु पुरुष भूमि पर विशेष दिशाओं में शयन करते हैं। भूमि पूजन की सही मुहूर्त चयन से निर्माण में आने वाली रुकावटें, दुर्घटनाएं व वास्तु दोष दूर होते हैं।
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4 space-y-2">
            <h3 className="text-xs sm:text-sm font-black text-red-950 font-cinzel flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-800" />
              <span>आहूत प्रमुख देवता</span>
            </h3>
            <ul className="text-xs space-y-1.5 list-disc list-inside text-stone-700">
              <li><b>श्री गणेश:</b> निर्विघ्न निर्माण कार्य संपन्न होने हेतु विघ्नहर्ता का प्रथम पूजन।</li>
              <li><b>माता भूमि (पृथ्वी):</b> धैर्य, स्थिरता व भार वहन की शक्ति हेतु प्रार्थना।</li>
              <li><b>वास्तु पुरुष:</b> भवन के समस्त कोणों व दिशाओं में शांति व संतुलन हेतु।</li>
              <li><b>पंच महाभूत:</b> जल, अग्नि, वायु, पृथ्वी व आकाश का संतुलन।</li>
            </ul>
          </div>

          <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4 space-y-2">
            <h3 className="text-xs sm:text-sm font-black text-red-950 font-cinzel flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-800" />
              <span>शुभ मास व नक्षत्र</span>
            </h3>
            <ul className="text-xs space-y-1.5 list-disc list-inside text-stone-700">
              <li><b>अत्यंत शुभ मास:</b> माघ, वैशाख, ज्येष्ठ, श्रावण, कार्तिक व मार्गशीर्ष।</li>
              <li><b>सावधानी रखें:</b> चैत्र, आषाढ़ व आश्विन मास सामान्यतः निर्माण आरंभ हेतु त्याज्य माने गए हैं।</li>
              <li><b>श्रेष्ठ नक्षत्र:</b> रोहिणी, मृगशिरा, उत्तराफाल्गुनी, हस्त, चित्रा, स्वाति, अनुराधा, उत्तराषाढ़ा।</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (ceremony === "Vehicle Purchase") {
    return (
      <div className="space-y-4 text-stone-800">
        <p className="text-xs sm:text-sm leading-relaxed">
          कुंडली में चतुर्थ भाव वाहन एवं भौतिक सुखों का प्रतिनिधित्व करता है तथा शुक्र देव वाहन सुख के कारक ग्रह हैं। शुभ मुहूर्त में क्रय किया गया वाहन दुर्घटनाओं, आकस्मिक व्ययों व यांत्रिक दोषों से रक्षा करता है और यात्रा को मंगलमय बनाता है।
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4 space-y-2">
            <h3 className="text-xs sm:text-sm font-black text-red-950 font-cinzel flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-800" />
              <span>शुभ वार, तिथि व नक्षत्र</span>
            </h3>
            <ul className="text-xs space-y-1.5 list-disc list-inside text-stone-700">
              <li><b>श्रेष्ठ वार:</b> सोमवार, बुधवार, गुरुवार एवं शुक्रवार।</li>
              <li><b>श्रेष्ठ तिथियां:</b> द्वितीया, तृतीया, पंचमी, सप्तमी, दशमी, एकादशी, त्रयोदशी (अमावस्या व रिक्ता त्याज्य)।</li>
              <li><b>अनुकूल नक्षत्र:</b> पुष्य, पुनर्वसु, स्वाति, श्रवण, अश्विनी, रेवती व शतभिषा।</li>
              <li><b>चन्द्र शुद्धि:</b> जातक की राशि से चन्द्रमा ४, ८ या १२वें भाव में न हो।</li>
            </ul>
          </div>

          <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4 space-y-2">
            <h3 className="text-xs sm:text-sm font-black text-red-950 font-cinzel flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-800" />
              <span>वाहन पूजा विधि</span>
            </h3>
            <ul className="text-xs space-y-1.5 list-disc list-inside text-stone-700">
              <li><b>स्वस्तिक अंकन:</b> वाहन के बोनट अथवा डैशबोर्ड पर कुमकुम व हल्दी से पवित्र स्वस्तिक बनाएं।</li>
              <li><b>श्री गणेश अर्चन:</b> पुष्प, धूप व दीप से प्रथम पूज्य गणेश जी का स्मरण करें।</li>
              <li><b>श्रीफल व नीम्बू:</b> वाहन के आगे नारियल फोड़ें तथा चारों पहियों के नीचे नीम्बू रखकर वाहन चलाएं।</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Default Guidance
  return (
    <div className="space-y-4 text-stone-800">
      <p className="text-xs sm:text-sm leading-relaxed">
        वैदिक शास्त्रों एवं मुहूर्त चिंतामणि के अनुसार <b>{ceremony}</b> हेतु शुभ वार (सोमवार, बुधवार, गुरुवार, शुक्रवार), पंच पंचांग शुद्धि (तिथि, वार, नक्षत्र, योग, करण) तथा लग्न की शुद्धता अत्यंत अनिवार्य है।
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4 space-y-2">
          <h3 className="text-xs sm:text-sm font-black text-red-950 font-cinzel flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-800" />
            <span>शास्त्रीय नियम व शुद्धि</span>
          </h3>
          <ul className="text-xs space-y-1.5 list-disc list-inside text-stone-700">
            <li><b>शुभ नक्षत्र व तारा बल:</b> जातक के जन्म नक्षत्र से अनुकूल तारा (संपत, साधक, मित्र, परम मित्र) होना चाहिए।</li>
            <li><b>चन्द्र बल:</b> जातक की जन्म राशि से चन्द्रमा शुभ भावों में स्थित होना चाहिए।</li>
            <li><b>रिक्ता तिथियां त्यागें:</b> चतुर्थी, नवमी व चतुर्दशी को मांगलिक कार्य सामान्यतः त्याज्य होते हैं।</li>
          </ul>
        </div>

        <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4 space-y-2">
          <h3 className="text-xs sm:text-sm font-black text-red-950 font-cinzel flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-800" />
            <span>वर्जित एवं त्याज्य योग</span>
          </h3>
          <ul className="text-xs space-y-1.5 list-disc list-inside text-stone-700">
            <li><b>राहुकाल व यमघंट:</b> दैनिक राहुकाल के समय कोई भी मुख्य संकल्प न लें।</li>
            <li><b>भद्रा काल:</b> विष्टि करण (भद्रा) में मांगलिक कर्म वर्जित माने जाते हैं।</li>
            <li><b>चौघड़िया योग:</b> 'अमृत', 'शुभ' व 'लाभ' चौघड़िया को प्राथमिकता दें।</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
