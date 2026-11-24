import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PYTHON_ASTRO_URL } from '../services/api';
import {
  CalendarDays,
  Clock,
  Sun,
  Moon,
  Sparkles,
  RefreshCw,
  Award,
  ShieldCheck,
  CheckCircle2,
  Info,
  ChevronLeft,
  ChevronRight,
  Flame,
  Star
} from 'lucide-react';

export default function MuhurtHeatmap({
  ceremony = "Marriage",
  startDate = new Date().toISOString().split('T')[0],
  days = 30,
  lat = 28.6139,
  lon = 77.2090,
  tz = 5.5,
  data = null
}) {
  const [selectedCeremony, setSelectedCeremony] = useState(ceremony);
  const [selectedStartDate, setSelectedStartDate] = useState(startDate);
  const [selectedDays, setSelectedDays] = useState(days);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Selected day detail view state
  const [selectedDayIdx, setSelectedDayIdx] = useState(null);
  const [detailTab, setDetailTab] = useState('choghadiya'); // 'choghadiya' or 'horas'
  const [filterScore, setFilterScore] = useState('all'); // 'all' | 'high' | 'mid'

  const ceremonies = [
    { id: "Marriage", label: "विवाह (Marriage)" },
    { id: "Grih Pravesh", label: "गृह प्रवेश (Grih Pravesh)" },
    { id: "Bhoomi Pujan", label: "भूमि पूजन (Bhoomi Pujan)" },
    { id: "Vehicle Purchase", label: "वाहन क्रय (Vehicle Purchase)" },
    { id: "Namkaran", label: "नामकरण (Namkaran)" },
    { id: "Anna Prashan", label: "अन्नप्राशन (Anna Prashan)" },
    { id: "Mundan", label: "मुंडन (Mundan)" },
    { id: "Upnayan", label: "उपनयन (Upnayan)" },
    { id: "Sagai", label: "सगाई (Sagai)" },
    { id: "Tilak", label: "तिलक (Tilak)" },
    { id: "Vadhu Pravesh", label: "वधू प्रवेश (Vadhu Pravesh)" }
  ];

  // Extract natal Moon parameters if worksheetData is provided
  let natalMoonLon = null;
  if (data?.planet_positions) {
    const moonObj = data.planet_positions.find(p => p.planet === "Moon" || p.name === "Moon");
    if (moonObj) natalMoonLon = moonObj.degree;
  }
  if (natalMoonLon === null && data?.meta?.moon_lon !== undefined) {
    natalMoonLon = data.meta.moon_lon;
  }

  const fetchHeatmap = async () => {
    setLoading(true);
    setError(null);
    setSelectedDayIdx(null);
    try {
      const baseUrl = PYTHON_ASTRO_URL.replace(/\/api\/kundali\/?$/, '').replace(/\/+$/, '');
      const payload = {
        start_date: selectedStartDate,
        days: parseInt(selectedDays, 10),
        tz: tz,
        lat: lat,
        lon: lon,
        ceremony: selectedCeremony,
        user_profile: natalMoonLon !== null ? { moon_lon: natalMoonLon } : {}
      };

      const res = await axios.post(`${baseUrl}/api/muhurt/heatmap`, payload);
      const list = res.data?.heatmap || [];
      setHeatmapData(list);
      if (list.length > 0) {
        setSelectedDayIdx(0); // auto-select first day
      }
    } catch (err) {
      console.error(err);
      setError("मुहूर्त हीटमैप तालिका लोड करने में त्रुटि हुई।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedCeremony(ceremony);
  }, [ceremony]);

  useEffect(() => {
    setSelectedStartDate(startDate);
  }, [startDate]);

  useEffect(() => {
    fetchHeatmap();
  }, [selectedCeremony, selectedStartDate, selectedDays, lat, lon, tz]);

  // Color mapping functions matching Vedic editorial palette
  const getStatusBadge = (status, score) => {
    if (score >= 70 || status === "Highly Auspicious") {
      return {
        cardClass: "bg-emerald-50/70 border-emerald-400 hover:border-emerald-500 text-emerald-950",
        badge: "bg-emerald-100 text-emerald-900 border border-emerald-300",
        indicator: "bg-emerald-500",
        label: "अत्यंत शुभ (Highly Auspicious)",
        stars: "⭐⭐⭐"
      };
    }
    if (score >= 45 || status === "Auspicious") {
      return {
        cardClass: "bg-amber-50/70 border-amber-300 hover:border-amber-400 text-amber-950",
        badge: "bg-amber-100 text-amber-900 border border-amber-300",
        indicator: "bg-amber-500",
        label: "शुभ / मध्यम (Moderate)",
        stars: "⭐⭐"
      };
    }
    return {
      cardClass: "bg-rose-50/60 border-rose-300 hover:border-rose-400 text-rose-950",
      badge: "bg-rose-100 text-rose-900 border border-rose-300",
      indicator: "bg-rose-500",
      label: "अशुभ / त्याज्य (Inauspicious)",
      stars: "⭐"
    };
  };

  const getChoghadiyaQualityColor = (quality) => {
    switch (quality) {
      case "Good":
        return "bg-emerald-50 border border-emerald-300 text-emerald-950";
      case "Neutral":
        return "bg-amber-50 border border-amber-300 text-amber-950";
      default:
        return "bg-rose-50 border border-rose-300 text-rose-950";
    }
  };

  const isAuspiciousHoraLord = (lord) => {
    return ["Jupiter", "Venus", "Mercury", "Moon"].includes(lord);
  };

  const filteredDays = heatmapData.filter(d => {
    if (filterScore === 'high') return d.score >= 70;
    if (filterScore === 'mid') return d.score >= 45 && d.score < 70;
    return true;
  });

  const selectedDay = selectedDayIdx !== null ? heatmapData[selectedDayIdx] : null;

  return (
    <div className="w-full flex flex-col gap-6 bg-white border border-amber-900/15 p-5 sm:p-7 rounded-3xl shadow-sm text-stone-900 font-sans">
      {/* Editorial Header Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-100 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-950 text-xs font-bold px-3 py-0.5 rounded-full border border-amber-300">
            <CalendarDays className="w-3.5 h-3.5 text-amber-800" />
            <span>Interactive Auspiciousness Heatmap Calendar</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-red-950 font-cinzel">
            मुहूर्त शुभता हीटमैप व दिनमान तालिका
          </h2>
          <p className="text-[14px] text-black max-w-2xl leading-relaxed">
            कैलेंडर के प्रत्येक दिन पर क्लिक करें और उस दिन के <strong>तिथि, नक्षत्र, तारा बल, चंद्र बल</strong> एवं <strong>चौघड़िया व वैदिक होरा</strong> के सटीक कालखण्ड का निरीक्षण करें।
          </p>
        </div>

        {/* Controls: Filter & Days */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Quick Filter Buttons */}
          <div className="inline-flex p-0.5 bg-amber-50 rounded-xl border border-amber-200">
            <button
              onClick={() => setFilterScore('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${filterScore === 'all'
                ? 'bg-red-950 text-white shadow-2xs'
                : 'text-amber-950 hover:bg-amber-100/60'
                }`}
            >
              सभी ({heatmapData.length})
            </button>
            <button
              onClick={() => setFilterScore('high')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${filterScore === 'high'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'text-emerald-950 hover:bg-emerald-100/60'
                }`}
            >
              शुभ (70%+)
            </button>
          </div>

          {/* Days Select */}
          <select
            value={selectedDays}
            onChange={(e) => setSelectedDays(e.target.value)}
            className="bg-amber-50/70 border border-amber-300 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer shadow-2xs"
          >
            <option value={15}>15 दिन (15 Days)</option>
            <option value={30}>30 दिन (30 Days - Recommended)</option>
            <option value={45}>45 दिन (45 Days)</option>
            <option value={60}>60 दिन (60 Days)</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-300 text-rose-900 p-3.5 rounded-xl text-xs sm:text-sm font-semibold">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-amber-800 animate-spin" />
          <p className="text-xs sm:text-sm font-bold text-stone-700">
            तिथि, नक्षत्र, तारा बल व होरा-चौघड़िया चक्र का विश्लेषण हो रहा है...
          </p>
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row gap-6 items-start">
          {/* Left Column: Heatmap Calendar Grid (55%) */}
          <div className="w-full xl:w-[55%] flex flex-col gap-4">
            <div className="flex items-center justify-between text-[14px] font-bold text-stone-900 px-1">
              <span>📅 {selectedDays}-दिवसीय कैलेंडर ग्रिड (दिन पर क्लिक करें)</span>
              <span className="text-amber-950">
                चयनित: <strong>{selectedDay?.weekday}, {selectedDay?.date}</strong>
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2">
              {filteredDays.map((d, index) => {
                const globalIdx = heatmapData.findIndex(item => item.date === d.date);
                const dateObj = new Date(d.date);
                const dayNum = dateObj.getDate();
                const monthShort = dateObj.toLocaleDateString([], { month: 'short' });
                const isSelected = selectedDayIdx === globalIdx;
                const statusInfo = getStatusBadge(d.status, d.score);

                return (
                  <button
                    key={d.date}
                    onClick={() => setSelectedDayIdx(globalIdx)}
                    className={`cursor-pointer p-2.5 rounded-xl border flex flex-col items-center justify-between text-center transition-all min-h-[92px] ${statusInfo.cardClass
                      } ${isSelected
                        ? 'ring-2 ring-red-900 ring-offset-2 ring-offset-white shadow-md transform -translate-y-0.5 bg-amber-100/90 font-black'
                        : 'hover:shadow-xs'
                      }`}
                  >
                    <div className="w-full flex items-center justify-between">
                      <span className="text-[10px] font-bold text-stone-900 uppercase">
                        {d.weekday?.slice(0, 3)}
                      </span>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.indicator}`}></span>
                    </div>

                    <div className="my-0.5">
                      <span className="text-xl sm:text-2xl font-black font-cinzel text-red-950 block leading-tight">
                        {dayNum}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-black block">
                        {monthShort}
                      </span>
                    </div>

                    <div className="w-full flex items-center justify-center">
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded font-mono bg-white/90 text-stone-900 border border-amber-200">
                        {d.score}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Heatmap Legend */}
            <div className="bg-amber-50/40 p-3 sm:p-3.5 border border-amber-200/80 rounded-2xl flex flex-wrap justify-between items-center gap-2.5 shadow-2xs text-xs">
              <span className="font-bold text-amber-950">संकेत सूची (Heatmap Legend):</span>
              <div className="flex flex-wrap gap-3 font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-900">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-emerald-500 bg-emerald-100" />
                  अत्यंत शुभ (70%+)
                </span>
                <span className="flex items-center gap-1.5 text-amber-900">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 bg-amber-100" />
                  मध्यम (45-69%)
                </span>
                <span className="flex items-center gap-1.5 text-rose-900">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-rose-400 bg-rose-100" />
                  अशुभ / त्याज्य (&lt;45%)
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Selected Day Breakdown Inspector (45%) */}
          <div className="w-full xl:w-[45%] bg-gradient-to-b from-amber-50/40 via-white to-white border border-amber-900 p-5 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col gap-4 shadow-sm">
            {selectedDay ? (
              <div className="flex flex-col gap-4">
                {/* Day Header Card */}
                <div className="border-b border-amber-200/80 pb-3.5 flex justify-between items-start gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                      चयनित दिवस विवरण (Day Inspector)
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-red-950 font-cinzel">
                      {new Date(selectedDay.date).toLocaleDateString('hi-IN', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </h3>

                    <div className="flex flex-wrap gap-1.5 pt-1 text-xs font-semibold">
                      <span className="bg-amber-100 text-amber-950 px-2.5 py-0.5 rounded-lg border border-amber-200 flex items-center gap-1">
                        <span>📅 तिथि:</span>
                        <strong>{selectedDay.tithi || '—'}</strong>
                      </span>
                      <span className="bg-rose-50 text-rose-950 px-2.5 py-0.5 rounded-lg border border-rose-200 flex items-center gap-1">
                        <span>🌙 नक्षत्र:</span>
                        <strong>{selectedDay.nakshatra || '—'}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Kaala Score Box */}
                  <div className="text-right shrink-0 bg-white p-3 rounded-2xl border border-amber-300 shadow-2xs min-w-[125px]">
                    <span className="text-[14px] uppercase font-bold text-stone-900 tracking-wider block">
                      काल शुभता स्कोर
                    </span>
                    <span className="text-3xl font-black font-cinzel text-red-950 block">
                      {selectedDay.score}
                      <span className="text-xs font-normal text-stone-700">/100</span>
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${getStatusBadge(selectedDay.status, selectedDay.score).badge}`}>
                      {getStatusBadge(selectedDay.status, selectedDay.score).label.split(' ')[0]}
                    </span>
                  </div>
                </div>

                {/* Astrometric Calculations / Reasons */}
                {selectedDay.reasons && selectedDay.reasons.length > 0 && (
                  <div className="bg-white p-3.5 rounded-2xl border border-amber-200/80 space-y-1.5 shadow-2xs">
                    <h4 className="text-[14px] uppercase font-bold tracking-wider text-amber-950 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />
                      <span>ज्योतिषीय गणना व बल (Astrometric Calculations)</span>
                    </h4>
                    <ul className="space-y-1 pt-0.5">
                      {selectedDay.reasons.map((r, idx) => (
                        <li key={idx} className="text-[14px] text-stone-800 flex items-start gap-2 leading-relaxed">
                          <span className={`text-[11px] mt-0.5 shrink-0 ${r.toLowerCase().includes('inauspicious') ||
                            r.toLowerCase().includes('combustion') ||
                            r.toLowerCase().includes('mismatch') ||
                            r.toLowerCase().includes('bad')
                            ? 'text-rose-500'
                            : 'text-emerald-600'
                            }`}>
                            ●
                          </span>
                          <span className="font-medium">{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Segment Tabs: Choghadiya vs Horas */}
                <div className="flex border-b border-amber-200">
                  <button
                    onClick={() => setDetailTab('choghadiya')}
                    className={`flex-1 text-center py-2 text-xs font-bold font-cinzel uppercase border-b-2 transition-all cursor-pointer ${detailTab === 'choghadiya'
                      ? 'border-red-900 text-red-950 font-black bg-amber-50/60 rounded-t-lg'
                      : 'border-transparent text-stone-900 hover:text-stone-900'
                      }`}
                  >
                    ⏰ शुभ चौघड़िया मुहूर्त (Choghadiya)
                  </button>
                  <button
                    onClick={() => setDetailTab('horas')}
                    className={`flex-1 text-center py-2 text-xs font-bold font-cinzel uppercase border-b-2 transition-all cursor-pointer ${detailTab === 'horas'
                      ? 'border-red-900 text-red-950 font-black bg-amber-50/60 rounded-t-lg'
                      : 'border-transparent text-stone-900 hover:text-stone-900'
                      }`}
                  >
                    🪐 वैदिक होरा चक्र (Vedic Horas)
                  </button>
                </div>

                {/* Tab 1: Choghadiya */}
                {detailTab === 'choghadiya' && (
                  <div className="space-y-3.5">
                    {/* Day Choghadiya */}
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                        <Sun className="w-3.5 h-3.5 text-amber-600" />
                        <span>दिन का चौघड़िया (Day Choghadiya)</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedDay.choghadiya?.day?.map((ch, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded-xl flex items-center justify-between text-xs transition ${getChoghadiyaQualityColor(ch.quality)}`}
                          >
                            <div>
                              <div className="font-black text-[14px] text-stone-900">{ch.name}</div>
                              <div className="text-[13px] text-black font-mono mt-0.5">
                                {ch.start} - {ch.end}
                              </div>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/70">
                              {ch.quality}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Night Choghadiya */}
                    <div className="space-y-1.5 pt-2 border-t border-amber-100">
                      <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                        <Moon className="w-3.5 h-3.5 text-indigo-600" />
                        <span>रात्रि का चौघड़िया (Night Choghadiya)</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedDay.choghadiya?.night?.map((ch, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded-xl flex items-center justify-between text-xs transition ${getChoghadiyaQualityColor(ch.quality)}`}
                          >
                            <div>
                              <div className="font-black text-[14px] text-stone-900">{ch.name}</div>
                              <div className="text-[13px] text-black font-mono mt-0.5">
                                {ch.start} - {ch.end}
                              </div>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/70">
                              {ch.quality}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Vedic Horas */}
                {detailTab === 'horas' && (
                  <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                    {/* Day Horas */}
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1 border-b border-amber-100 pb-1">
                        <Sun className="w-3.5 h-3.5 text-amber-600" />
                        <span>दिन की होरा (Day Horas)</span>
                      </h4>
                      <div className="space-y-1">
                        {selectedDay.horas?.day?.map((hr, idx) => {
                          const isAuspicious = isAuspiciousHoraLord(hr.lord);
                          return (
                            <div
                              key={idx}
                              className="flex justify-between items-center text-xs p-2 rounded-xl bg-white border border-stone-200 hover:bg-amber-50/50 transition shadow-2xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-stone-900 text-[12px]">
                                  {hr.index.toString().padStart(2, '0')}.
                                </span>
                                <span className={`font-black ${isAuspicious ? 'text-emerald-800' : 'text-stone-800'}`}>
                                  {hr.lord} होरा ({hr.lord} Hora)
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[12px] text-black">
                                  {hr.start} - {hr.end}
                                </span>
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${isAuspicious
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                    : 'bg-red-300 text-stone-900 border border-stone-200'
                                    }`}
                                >
                                  {isAuspicious ? 'शुभ (Good)' : 'मध्यम/अशुभ'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Night Horas */}
                    <div className="space-y-1.5 pt-2 border-t border-amber-100">
                      <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1 border-b border-amber-100 pb-1">
                        <Moon className="w-3.5 h-3.5 text-indigo-600" />
                        <span>रात्रि की होरा (Night Horas)</span>
                      </h4>
                      <div className="space-y-1">
                        {selectedDay.horas?.night?.map((hr, idx) => {
                          const isAuspicious = isAuspiciousHoraLord(hr.lord);
                          return (
                            <div
                              key={idx}
                              className="flex justify-between items-center text-xs p-2 rounded-xl bg-white border border-stone-200 hover:bg-amber-50/50 transition shadow-2xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-stone-900 text-[12px]">
                                  {hr.index.toString().padStart(2, '0')}.
                                </span>
                                <span className={`font-black ${isAuspicious ? 'text-emerald-800' : 'text-stone-800'}`}>
                                  {hr.lord} होरा ({hr.lord} Hora)
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[12px] text-black">
                                  {hr.start} - {hr.end}
                                </span>
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${isAuspicious
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                    : 'bg-red-300 text-stone-900 border border-stone-200'
                                    }`}
                                >
                                  {isAuspicious ? 'शुभ (Good)' : 'मध्यम/अशुभ'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 text-stone-500 font-medium">
                बाएं कैलेंडर ग्रिड में से किसी भी दिन पर क्लिक करके चौघड़िया व होरा विवरण देखें।
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
