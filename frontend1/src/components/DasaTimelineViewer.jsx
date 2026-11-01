import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapPin, Calendar, Clock, Plus, Trash2, List, Layout, Target, Sparkles } from 'lucide-react';

// Planet metadata with colors matching classical chart rendering from the user's reference image
const PLANET_META = {
  Sun: { years: 6, color: '#d92121' },
  Moon: { years: 10, color: '#111827' },
  Mars: { years: 7, color: '#ef4444' },
  Rahu: { years: 18, color: '#4b5563' },
  Jupiter: { years: 16, color: '#d97706' },
  Saturn: { years: 19, color: '#2563eb' },
  Mercury: { years: 17, color: '#16a34a' },
  Ketu: { years: 7, color: '#92400e' },
  Venus: { years: 20, color: '#db2777' },
};

const PLANET_COLORS = {
  Sun: 'bg-orange-500 hover:bg-orange-400 text-white',
  Moon: 'bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border border-indigo-200',
  Mars: 'bg-red-600 hover:bg-red-500 text-white',
  Rahu: 'bg-slate-800 hover:bg-slate-700 text-white',
  Jupiter: 'bg-amber-500 hover:bg-amber-400 text-white',
  Saturn: 'bg-blue-800 hover:bg-blue-700 text-white',
  Mercury: 'bg-emerald-600 hover:bg-emerald-500 text-white',
  Ketu: 'bg-stone-700 hover:bg-stone-600 text-white',
  Venus: 'bg-pink-500 hover:bg-pink-400 text-white',
};

const TOTAL_YEARS = 120;

// Helper to format Julian Date to DD-MM-YYYY (matching the user's reference image)
const jdToFmtDate = (jd) => {
  if (!jd) return "";
  const ts = (jd - 2440587.5) * 86400000;
  const d = new Date(ts);
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = d.getUTCFullYear();
  return `${day}-${month}-${year}`;
};

// Compute age string from birth date and target Julian Date (e.g., 'From 0 yrs. to 0y10m')
function computeAgeFromJD(birthDateStr, targetJD) {
  if (!birthDateStr || !targetJD) return null;
  try {
    let birthY, birthM, birthD;
    if (birthDateStr.includes('/')) {
      [birthD, birthM, birthY] = birthDateStr.split('/').map(Number);
    } else {
      [birthY, birthM, birthD] = birthDateStr.split('-').map(Number);
    }

    const ts = (targetJD - 2440587.5) * 86400000;
    const d = new Date(ts);
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const day = d.getUTCDate();

    let ageY = y - birthY;
    let ageM = m - birthM;
    if (ageM < 0 || (ageM === 0 && day < birthD)) {
      ageY--;
      ageM += 12;
    }
    if (day < birthD) {
      ageM--;
      if (ageM < 0) {
        ageM += 12;
      }
    }
    if (ageY < 0) return '0 yrs.';
    return ageM === 0 ? `${ageY} yrs.` : `${ageY}y${ageM}m`;
  } catch {
    return null;
  }
}

// Helper to convert standard date string YYYY-MM-DD to Julian Date
const dateToJD = (dateStr) => {
  const d = new Date(dateStr);
  return (d.getTime() / 86400000) + 2440587.5;
};

export default function DasaTimelineViewer({ birthData }) {
  const [dasaData, setDasaData] = useState([]);
  const [birthJD, setBirthJD] = useState(null);
  const [selectedMahaDasa, setSelectedMahaDasa] = useState(null);
  const [hoveredBlock, setHoveredBlock] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic Events State
  const [events, setEvents] = useState([]);
  const [newEventName, setNewEventName] = useState("");
  const [newEventDate, setNewEventDate] = useState("");

  // View State: 'grid' matches classical reference image, 'timeline' is continuous bar, 'table' is tabular
  const [viewMode, setViewMode] = useState('grid');
  const timelineRef = useRef(null);

  const getDasaForJD = (jd) => {
    const maha = dasaData.find(d => jd >= d.start_jd && jd <= d.end_jd);
    if (!maha) return { maha: null, antar: null };
    const antar = maha.antardashas?.find(a => jd >= a.start_jd && jd <= a.end_jd);
    return { maha, antar };
  };

  // Find Current Dasha
  const nowJD = dateToJD(new Date().toISOString().split('T')[0]);
  const currentDasha = getDasaForJD(nowJD);

  const birthDateStr = birthData?.dateOfBirth || birthData?.date || null;

  const handleJumpToToday = () => {
    const todayJD = nowJD;
    if (birthJD && todayJD >= birthJD && todayJD <= birthJD + (120 * 365.2425)) {
      const { maha } = getDasaForJD(todayJD);
      if (maha && maha.antardashas?.length > 0) {
        setSelectedMahaDasa(maha);
      }
      if (viewMode === 'timeline') {
        setTimeout(() => {
          if (timelineRef.current) {
            const totalDays = 120 * 365.2425;
            const daysSinceBirth = todayJD - birthJD;
            const positionPercent = (daysSinceBirth / totalDays);
            const scrollAmount = (timelineRef.current.scrollWidth * positionPercent) - (timelineRef.current.clientWidth / 2);
            timelineRef.current.scrollTo({ left: scrollAmount, behavior: 'smooth' });
          }
        }, 100);
      }
    } else {
      alert("Today's date is outside the 120-year timeline.");
    }
  };

  useEffect(() => {
    if (!birthData) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const dateStr = birthData.dateOfBirth || birthData.date || '1990-10-01';
    let timeStr = birthData.timeOfBirth || birthData.time || '12:00:00';
    if (timeStr && timeStr.split(':').length === 2) timeStr = timeStr + ':00';
    const tz = parseFloat(birthData.tz_offset ?? 5.5);

    axios.post("http://localhost:8000/api/dasha/timeline", {
      date: dateStr,
      time: timeStr,
      tz_offset: tz
    })
      .then(res => {
        if (res.data?.vimshottari) {
          const list = res.data.vimshottari;
          setDasaData(list);
          setBirthJD(res.data.jd_ut);
          // Auto select current or first
          const curr = list.find(d => nowJD >= d.start_jd && nowJD <= d.end_jd) || list[0];
          setSelectedMahaDasa(curr);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch timeline data:", err);
        setError("दशा टाइमलाइन लोड करने में असमर्थ। कृपया सुनिश्चित करें कि बैकएंड सेवा सक्रिय है।");
        setIsLoading(false);
      });
  }, [birthData]);

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newEventName || !newEventDate || !birthJD) return;

    const eventJD = dateToJD(newEventDate);
    const totalDays = 120 * 365.2425;
    const daysSinceBirth = eventJD - birthJD;
    const positionPercent = (daysSinceBirth / totalDays) * 100;

    if (positionPercent >= 0 && positionPercent <= 100) {
      setEvents([...events, {
        id: Date.now(),
        name: newEventName,
        date: newEventDate,
        positionPercent,
        jd: eventJD
      }]);
      setNewEventName("");
      setNewEventDate("");

      const { maha } = getDasaForJD(eventJD);
      if (maha && maha.antardashas?.length > 0) {
        setSelectedMahaDasa(maha);
      }
    } else {
      alert("Event date falls outside the 120-year lifespan of this chart.");
    }
  };

  const removeEvent = (id) => {
    setEvents(events.filter(ev => ev.id !== id));
  };

  const getClampedDuration = (startJd, endJd, birthJd) => {
    const minJd = birthJd;
    const maxJd = birthJd + (TOTAL_YEARS * 365.2425);
    const actualStart = Math.max(startJd, minJd);
    const actualEnd = Math.min(endJd, maxJd);
    if (actualStart >= actualEnd) return 0;
    return (actualEnd - actualStart) / 365.2425;
  };

  const getWidthPercent = (durationYears) => (durationYears / TOTAL_YEARS) * 100;

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-600 font-serif min-h-[350px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600"></div>
        <p className="text-sm">Calculating 120-Year Vimshottari Timeline...</p>
      </div>
    );
  }

  if (error || !dasaData.length) {
    return (
      <div className="p-8 text-center text-red-600 italic">
        {error || "No Dasha timeline data found."}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-[#fcfaf7] flex flex-col h-full overflow-y-auto custom-scrollbar font-sans">
      {/* 🌟 Top Live Active Dasha Banner */}
      <div className="mb-5 p-4 rounded-2xl bg-white text-black shadow-md flex flex-wrap items-center justify-between gap-3 border border-amber-900/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-lg shadow-sm">
            ✦
          </div>
          <div>
            <div className="text-[12px] uppercase font-bold tracking-widest text-amber-900 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Current Active Dasha Period (वर्तमान दशा)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-black flex items-center gap-2">
              <span style={{ color: PLANET_META[currentDasha.maha?.lord]?.color || 'rgba(5, 4, 2, 1)' }}>{currentDasha.maha?.lord || 'Unknown'}</span>
              <span className="text-black font-normal">→</span>
              <span style={{ color: PLANET_META[currentDasha.antar?.lord]?.color || '#93c5fd' }}>{currentDasha.antar?.lord || 'Unknown'}</span>
            </h2>
          </div>
        </div>

        {currentDasha.antar && (
          <div className="text-[18px] bg-white/10 border border-white/20 rounded-xl px-3.5 py-2">
            <span className="text-black block text-[14px] uppercase font-semibold">Active Window</span>
            <span className="font-mono text-black font-bold">
              {jdToFmtDate(currentDasha.antar.start_jd)} — {jdToFmtDate(currentDasha.antar.end_jd)}
            </span>
          </div>
        )}
      </div>

      {/* Controller Top Bar */}
      <div className="mb-5 flex justify-between items-start md:items-center flex-col md:flex-row gap-3">
        <div className="flex items-center gap-2 flex-wrap">


          {/* View Mode Toggle: Classical Grid (Image format), Timeline Track, Table */}
          <div className="flex bg-stone-200 p-0.5 rounded-xl border border-stone-300">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${viewMode === 'grid' ? 'bg-white shadow text-amber-900 font-serif' : 'text-stone-700 hover:text-stone-900'}`}
              title="Classical 3-Column Dasha Grid"
            >
              <Layout className="w-3.5 h-3.5" /> Classical Grid
            </button>


          </div>
        </div>

        {/* Hover / Status Info */}
        <div className="text-left md:text-right min-h-[34px]">
          {hoveredBlock ? (
            <div className="bg-white px-3 py-1 rounded-xl border border-amber-300 shadow-sm inline-block">
              <p className="font-bold text-xs text-stone-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PLANET_META[hoveredBlock.lord]?.color || '#f59e0b' }}></span>
                {hoveredBlock.lord} ({hoveredBlock.type || 'Period'})
              </p>
              <p className="text-[11px] font-mono text-stone-600">
                {jdToFmtDate(hoveredBlock.start_jd)} to {jdToFmtDate(hoveredBlock.end_jd)}
              </p>
            </div>
          ) : (
            <p className="text-[14px] text-stone-900 font-bold font-serif italic">
              Showing 120-Year Vimshottari Mahadasha & Antardashas
            </p>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. CLASSICAL 3-COLUMN GRID VIEW (EXACT FORMAT IN USER IMAGE)        */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {viewMode === 'grid' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm font-serif">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 lg:gap-x-12 gap-y-10">
            {dasaData.map((md, i) => {
              const metaInfo = PLANET_META[md.lord] || { color: '#b45309', years: Math.round(md.duration_years) };
              const startAge = computeAgeFromJD(birthDateStr, md.start_jd) || '0 yrs.';
              const endAge = computeAgeFromJD(birthDateStr, md.end_jd) || '';

              const isMahaCurrent = nowJD >= md.start_jd && nowJD <= md.end_jd;

              return (
                <div
                  key={i}
                  className={`flex flex-col rounded-xl p-3 sm:p-3.5 transition-all ${isMahaCurrent ? 'bg-amber-50/50 ring-2 ring-amber-500/60 shadow-sm' : 'bg-transparent'
                    }`}
                >
                  {/* Mahadasha Title & Age Range */}
                  <div className="mb-2.5">
                    <h3 className="font-bold text-base sm:text-[17px] leading-tight flex items-center gap-1.5">
                      <span className="text-black font-serif font-black">{md.lord}</span>
                      <span className="font-semibold" style={{ color: metaInfo.color }}>
                        ({metaInfo.years || Math.round(md.duration_years)}y)
                      </span>
                      {isMahaCurrent && (
                        <span className="ml-1 px-1.5 py-0.2 bg-amber-600 text-white rounded text-[10px] font-sans font-bold tracking-tight uppercase">
                          Active
                        </span>
                      )}
                    </h3>
                    <p className="text-[13px] text-red-700 mt-1 font-serif">
                      From {startAge} to {endAge}
                    </p>
                  </div>

                  {/* Classical Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-[13px] border-collapse font-serif">
                      <thead>
                        <tr className="border-t-2 border-b-2 border-red-600 bg-[#fff9e6]">
                          <th className="text-left py-1.5 px-1 font-bold text-black w-[28%]">Antar</th>
                          <th className="text-left py-1.5 px-1 font-bold text-black w-[36%]">Beginning</th>
                          <th className="text-left py-1.5 px-1 font-bold text-black w-[36%]">Ending</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(md.antardashas || []).map((ad, j) => {
                          const adMetaInfo = PLANET_META[ad.lord] || { color: '#000' };
                          const adStart = jdToFmtDate(ad.start_jd);
                          const adEnd = jdToFmtDate(ad.end_jd);
                          const isAntarCurrent = nowJD >= ad.start_jd && nowJD <= ad.end_jd;

                          return (
                            <tr
                              key={j}
                              className={`border-b border-stone-100 last:border-b-2 last:border-red-600 transition-colors ${isAntarCurrent ? 'bg-amber-100/70 font-semibold' : 'hover:bg-amber-50/40'
                                }`}
                            >
                              <td className="py-1 px-1 font-semibold flex items-center gap-1" style={{ color: adMetaInfo.color }}>
                                <span>{ad.lord}</span>
                                {isAntarCurrent && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                                )}
                              </td>
                              <td className="py-1 px-1 text-black font-mono text-[12px] sm:text-[13px]">{adStart}</td>
                              <td className="py-1 px-1 text-black font-mono text-[12px] sm:text-[13px]">{adEnd}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. CONTINUOUS 120-YEAR HORIZONTAL TRACK VIEW                       */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {viewMode === 'timeline' && (
        <div className="relative w-full overflow-x-auto pb-6 custom-scrollbar bg-white p-4 rounded-2xl border border-slate-200 shadow-sm" ref={timelineRef}>
          <div className="min-w-[1100px]">

            {/* Event Markers Track */}
            <div className="relative h-10 w-full mb-1 border-b border-dashed border-slate-300">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="absolute flex flex-col items-center group -translate-x-1/2 cursor-pointer z-10 hover:z-20"
                  style={{ left: `${event.positionPercent}%`, bottom: 0 }}
                >
                  <div className="absolute bottom-full mb-1 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap shadow-lg pointer-events-none flex flex-col gap-0.5 items-center">
                    <p className="font-bold">{event.name}</p>
                    <p className="text-[9px] text-slate-300 font-mono">{jdToFmtDate(event.jd)}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeEvent(event.id); }}
                      className="pointer-events-auto mt-1 flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded text-[9px]"
                    >
                      <Trash2 className="w-2.5 h-2.5" /> Remove
                    </button>
                  </div>
                  <MapPin className="w-4 h-4 text-indigo-600 drop-shadow-sm group-hover:scale-125 transition" />
                  <div className="w-0.5 h-2.5 bg-indigo-400"></div>
                </div>
              ))}
            </div>

            {/* Mahadasha Track */}
            <div className="flex h-14 w-full rounded-xl shadow-inner overflow-hidden border border-slate-300">
              {dasaData.map((dasa, idx) => {
                const clampedYears = getClampedDuration(dasa.start_jd, dasa.end_jd, birthJD);
                if (clampedYears <= 0) return null;

                const isCurrent = nowJD >= dasa.start_jd && nowJD <= dasa.end_jd;
                const isSelected = selectedMahaDasa?.lord === dasa.lord;
                const colorClasses = PLANET_COLORS[dasa.lord] || 'bg-slate-600 text-white';

                return (
                  <div
                    key={idx}
                    onClick={() => dasa.antardashas?.length > 0 && setSelectedMahaDasa(dasa)}
                    onMouseEnter={() => setHoveredBlock({ ...dasa, type: 'Mahadasha' })}
                    onMouseLeave={() => setHoveredBlock(null)}
                    className={`
                      ${colorClasses}
                      h-full flex items-center justify-center relative cursor-pointer
                      transition-all duration-150 select-none border-r border-white/20
                      ${isSelected ? 'ring-4 ring-amber-400 z-10' : 'hover:brightness-110'}
                    `}
                    style={{ width: `${getWidthPercent(clampedYears)}%` }}
                    title={`${dasa.lord} Mahadasha (${clampedYears.toFixed(1)} yrs)`}
                  >
                    <span className="text-xs font-black truncate px-1 drop-shadow-xs">
                      {dasa.lord}
                    </span>
                    {isCurrent && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-300 rounded-full animate-ping"></span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Antardasha Expansion Track */}
            {selectedMahaDasa && selectedMahaDasa.antardashas?.length > 0 && (
              <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-700">
                    {selectedMahaDasa.lord} Antardashas ({jdToFmtDate(selectedMahaDasa.start_jd)} – {jdToFmtDate(selectedMahaDasa.end_jd)})
                  </span>
                  <span className="text-[10px] text-slate-500 italic">Click any Antardasha block to inspect</span>
                </div>
                <div className="flex h-10 w-full rounded-lg overflow-hidden border border-slate-300 shadow-inner">
                  {selectedMahaDasa.antardashas.map((antar, idx) => {
                    const dur = (antar.end_jd - antar.start_jd) / 365.2425;
                    const mahaDur = (selectedMahaDasa.end_jd - selectedMahaDasa.start_jd) / 365.2425;
                    const wPercent = (dur / mahaDur) * 100;
                    const isNow = nowJD >= antar.start_jd && nowJD <= antar.end_jd;

                    return (
                      <div
                        key={idx}
                        onMouseEnter={() => setHoveredBlock({ ...antar, type: `Antar of ${selectedMahaDasa.lord}` })}
                        onMouseLeave={() => setHoveredBlock(null)}
                        className={`
                          h-full flex items-center justify-center relative border-r border-white/30 text-white font-medium text-[11px]
                          ${PLANET_COLORS[antar.lord] || 'bg-slate-500'}
                          ${isNow ? 'ring-2 ring-amber-400 z-10' : 'hover:brightness-110'}
                        `}
                        style={{ width: `${wPercent}%` }}
                        title={`${antar.lord} (${jdToFmtDate(antar.start_jd)} - ${jdToFmtDate(antar.end_jd)})`}
                      >
                        <span className="truncate px-0.5">{antar.lord}</span>
                        {isNow && (
                          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-amber-300 rounded-full animate-ping"></span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Timeline Axis Labels */}
            <div className="flex justify-between mt-2 text-[10px] font-mono text-slate-500 px-1">
              {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120].map(age => (
                <span key={age}>Age {age}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 3. FULL TABULAR VIEW                                                */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {viewMode === 'table' && (
        <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm custom-scrollbar max-h-[460px]">
          <table className="w-full text-[14px] text-left text-slate-600">
            <thead className="text-[14px] text-slate-900 uppercase bg-slate-100 sticky top-0 z-10 shadow-xs border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Mahadasha</th>
                <th className="px-4 py-2.5">Antardasha</th>
                <th className="px-4 py-2.5">Start Date</th>
                <th className="px-4 py-2.5">End Date</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {dasaData.map((maha, i) => (
                <React.Fragment key={i}>
                  <tr className="border-b bg-slate-50/80 font-bold text-slate-900">
                    <td className="px-4 py-2.5 flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${PLANET_COLORS[maha.lord]?.split(' ')[0] || 'bg-slate-400'}`}></span>
                      {maha.lord} ({maha.duration_years.toFixed(0)} yrs)
                    </td>
                    <td className="px-4 py-2.5">Full Period</td>
                    <td className="px-4 py-2.5 font-mono">{jdToFmtDate(maha.start_jd)}</td>
                    <td className="px-4 py-2.5 font-mono">{jdToFmtDate(maha.end_jd)}</td>
                    <td className="px-4 py-2.5">
                      {nowJD >= maha.start_jd && nowJD <= maha.end_jd && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[12px]">
                          CURRENT
                        </span>
                      )}
                    </td>
                  </tr>
                  {maha.antardashas?.map((antar, j) => {
                    const isNow = nowJD >= antar.start_jd && nowJD <= antar.end_jd;
                    return (
                      <tr key={`${i}-${j}`} className={`border-b border-slate-100 hover:bg-slate-50 ${isNow ? 'bg-amber-50 font-semibold' : ''}`}>
                        <td className="px-4 py-1.5 border-r border-slate-100"></td>
                        <td className="px-4 py-1.5 font-medium" style={{ color: PLANET_META[antar.lord]?.color || '#000000ff' }}>
                          {antar.lord}
                        </td>
                        <td className="px-4 py-1.5 font-mono text-[14px]">{jdToFmtDate(antar.start_jd)}</td>
                        <td className="px-4 py-1.5 font-mono text-[14px]">{jdToFmtDate(antar.end_jd)}</td>
                        <td className="px-4 py-1.5">
                          {isNow && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-black text-[12px]">
                              ● ACTIVE NOW
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Custom Life Event Marker (Available in all views) */}

    </div>
  );
}
