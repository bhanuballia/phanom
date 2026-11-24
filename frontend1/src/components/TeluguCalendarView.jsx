import React, { useState } from 'react';
import {
  TELUGU_MONTHS_INFO,
  TELUGU_WEEKDAYS,
  TELUGU_DAILY_TIMINGS,
  getTeluguYear
} from '../data/teluguCalendarData';
import { getTeluguFestivalsForYear } from '../data/teluguFestivalsEngine';
import { Calendar, Clock, Award, Sparkles, Filter, Sun, ShieldAlert, Star } from 'lucide-react';

export const TeluguCalendarView = ({ year, month }) => {
  const [festivalViewMode, setFestivalViewMode] = useState('all');

  // Month mapping to dominant Telugu lunar months across the Gregorian year
  // Ugadi (Chaitra Shuddha Padyami) marks the Telugu New Year in March / April
  const monthMap = {
    1: { primary: "పుష్యము (Pushyamu)", secondary: "మాఘము (Maghamu)", festival: "భోగి, మకర సంక్రాంతి, కనుమ, ముక్కనుమ, రథ సప్తమి" },
    2: { primary: "మాఘము (Maghamu)", secondary: "ఫాల్గుణము (Phalgunamu)", festival: "మహా శివరాత్రి, భీష్మ ఏకాదశి" },
    3: { primary: "ఫాల్గుణము (Phalgunamu)", secondary: "చైత్రము (Chaitramu)", festival: "హోలీ (కామదహనం), ఉగాది (తెలుగు సంవత్సరాది)" },
    4: { primary: "చైత్రము (Chaitramu)", secondary: "వైశాఖము (Vaishakhamu)", festival: "శ్రీ రామ నవమి, హనుమాన్ జయంతి, అక్షయ తృతీయ" },
    5: { primary: "వైశాఖము (Vaishakhamu)", secondary: "జ్యేష్ఠము (Jyeshthamu)", festival: "నరసింహ జయంతి, మోహినీ ఏకాదశి, వైశాఖ పౌర్ణమి" },
    6: { primary: "జ్యేష్ఠము (Jyeshthamu)", secondary: "ఆషాఢము (Ashadhamu)", festival: "ఏరువాక పున్నమి, నిర్జల ఏకాదశి, ఆషాఢ మాసారంభం" },
    7: { primary: "ఆషాఢము (Ashadhamu)", secondary: "శ్రావణము (Shravanamu)", festival: "తొలి ఏకాదశి, గురు పౌర్ణమి, బోనాలు (గోల్కొండ, సికింద్రాబాద్)" },
    8: { primary: "శ్రావణము (Shravanamu)", secondary: "భాద్రపదము (Bhadrapadamu)", festival: "శ్రావణ మంగళ గౌరీ వ్రతం, వరలక్ష్మీ వ్రతం, కృష్ణాష్టమి, రాఖీ పూర్ణిమ" },
    9: { primary: "భాద్రపదము (Bhadrapadamu)", secondary: "ఆశ్వయుజము (Ashwayujamu)", festival: "వినాయక చవితి (గణేష్ నవరాత్రులు), మహాలయ అమావాస్య, బతుకమ్మ ప్రారంభం" },
    10: { primary: "ఆశ్వయుజము (Ashwayujamu)", secondary: "కార్తీకము (Karthikamu)", festival: "సద్దుల బతుకమ్మ, దుర్గాష్టమి, విజయదశమి (దసరా), దీపావళి" },
    11: { primary: "కార్తీకము (Karthikamu)", secondary: "మార్గశిరము (Margashiramu)", festival: "నాగుల చవితి, క్షీరాబ్ది ద్వాదశి, కార్తీక పౌర్ణమి (జ్వాలాతోరణం)" },
    12: { primary: "మార్గశిరము (Margashiramu)", secondary: "పుష్యము (Pushyamu)", festival: "సుబ్రహ్మణ్య షష్ఠి, గీతా జయంతి, ముక్కోటి వైకుంఠ ఏకాదశి" }
  };

  const currTelInfo = monthMap[month] || monthMap[1];
  const teluguYear = getTeluguYear(year, month);
  const allYearFestivals = getTeluguFestivalsForYear(year);

  const displayedMonths = festivalViewMode === 'current'
    ? allYearFestivals.filter(m => m.monthNum === month)
    : allYearFestivals;

  return (
    <div className="telugu-calendar-container bg-[#fffefc] border-2 border-purple-950/30 rounded-3xl p-4 sm:p-7 shadow-xl space-y-6">
      {/* Telugu Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-amber-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-purple-500/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-purple-500/20 text-purple-200 text-xs font-bold px-3 py-1 rounded-full mb-2 border border-purple-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>తెలుగు క్యాలెండర్ • చాంద్రమాన పంచాంగం (Amanta Lunisolar)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-cinzel text-purple-100 tracking-wide">
              {currTelInfo.primary} – {currTelInfo.secondary}
            </h2>
            <p className="text-sm font-semibold text-purple-200/90 mt-1">
              తెలుగు సంవత్సరం: <span className="font-bold text-amber-300">{teluguYear.name} నామ సంవత్సరం</span> ({teluguYear.shaka} శాలివాహన శక)
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-xs text-purple-100 text-center max-w-xs">
            <div className="font-bold text-amber-300 text-sm mb-1">ప్రధాన పండుగలు & విశేషాలు</div>
            <div className="line-clamp-2">{currTelInfo.festival}</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TELUGU FESTIVALS SECTION WITH CARD GRID                                   */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-purple-900/15 overflow-hidden shadow-lg transition-all">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-purple-950 via-indigo-900 to-purple-900 text-white p-5 sm:p-6 border-b border-purple-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-amber-400/15 text-amber-300 text-[11px] font-bold px-3 py-0.5 rounded-full mb-1.5 border border-amber-400/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{year} ముఖ్యమైన తెలుగు పండుగలు & వ్రతాలు</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black font-cinzel tracking-wide text-amber-100">
                {year} Telugu Festivals & Vratams
              </h3>
              <p className="text-xs text-purple-200/90 mt-0.5">
                శ్రీ {teluguYear.name} నామ సంవత్సరం • తిథి, పౌర్ణమి & అమావాస్య ఆధారిత పండుగల జాబితా
              </p>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center bg-purple-950/80 p-1.5 rounded-2xl border border-purple-400/30 self-start sm:self-auto shadow-inner">
              <button
                type="button"
                onClick={() => setFestivalViewMode('current')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  festivalViewMode === 'current'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 shadow-md scale-[1.02]'
                    : 'text-purple-200 hover:text-white hover:bg-white/5'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>ప్రస్తుత మాసం (Month {month})</span>
              </button>
              <button
                type="button"
                onClick={() => setFestivalViewMode('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  festivalViewMode === 'all'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 shadow-md scale-[1.02]'
                    : 'text-purple-200 hover:text-white hover:bg-white/5'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>అన్ని మాసాలు (All 12 Months)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Festival Cards Content */}
        <div className="p-4 sm:p-6 bg-gradient-to-b from-purple-50/20 via-white to-amber-50/15 space-y-8">
          {displayedMonths.map((monthGroup) => {
            const hasFestivals = monthGroup.festivals && monthGroup.festivals.length > 0;
            return (
              <div key={monthGroup.monthNum} className="space-y-3">
                {/* Month Separator Ribbon */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-purple-900 to-indigo-900 text-white px-4 py-1.5 rounded-xl shadow-xs border border-purple-800">
                    <Calendar className="w-3.5 h-3.5 text-amber-300" />
                    <span className="font-bold text-xs sm:text-sm tracking-wide">{monthGroup.monthName}</span>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-purple-300/60 via-purple-200/30 to-transparent" />
                  <span className="text-[11px] font-semibold text-purple-900/70 bg-purple-100/60 px-2.5 py-0.5 rounded-full border border-purple-200/50">
                    {monthGroup.festivals.length} {monthGroup.festivals.length === 1 ? 'Festival' : 'Festivals'}
                  </span>
                </div>

                {/* Grid of Cards */}
                {hasFestivals ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {monthGroup.festivals.map((fest, idx) => (
                      <div
                        key={idx}
                        className="group relative bg-white hover:bg-gradient-to-br hover:from-purple-50/40 hover:to-amber-50/40 rounded-2xl border border-purple-900/10 hover:border-purple-600/40 p-3.5 shadow-xs hover:shadow-md transition-all duration-300 flex items-start gap-3.5 overflow-hidden"
                      >
                        {/* Thumbnail Image */}
                        <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden shrink-0 border border-purple-900/15 shadow-2xs group-hover:scale-105 transition-transform duration-300 bg-amber-50">
                          <img
                            src={fest.imageUrl}
                            alt={fest.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/yantra/Sri yantra.jpg";
                            }}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                          <div className="absolute bottom-1 right-1 bg-amber-500 text-amber-950 font-black text-[9px] px-1.5 py-0.2 rounded shadow">
                            {fest.day}
                          </div>
                        </div>

                        {/* Text info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-extrabold text-sm sm:text-[15px] text-gray-900 group-hover:text-purple-950 transition-colors truncate">
                            {fest.name}
                          </h4>
                          <div className="text-xs font-bold text-purple-900 line-clamp-1 mt-0.5">
                            {fest.teluguName}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 mt-1">
                            <Clock className="w-3 h-3 text-purple-700 shrink-0" />
                            <span className="truncate">{fest.dateStr}</span>
                          </div>
                          {fest.basis && (
                            <div className="mt-1 text-[10px] text-purple-900/70 font-medium italic line-clamp-1">
                              {fest.basis}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-purple-50/30 rounded-2xl border border-dashed border-purple-200 text-purple-900/60 text-xs font-medium">
                    ఈ నెలలో ప్రధాన పండుగలు లేవు (No major regional festivals recorded for this month)
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TELUGU DAILY TIMINGS (వారములు & రాహుకాలం, యమగండం, దుర్ముహూర్తం)            */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-purple-900/20 overflow-hidden shadow-md">
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white px-5 py-3 font-bold text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-300" />
            <span>వార ఫలములు & రోజువారీ ముహూర్త కాలములు (Telugu Daily Muhurtham Timings)</span>
          </div>
          <span className="text-xs text-amber-200 hidden sm:inline">రాహుకాలం • యమగండం • దుర్ముహూర్తం • అమృత కాలం</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-purple-100/60 text-purple-950 font-bold border-b border-purple-200 text-[11px]">
              <tr>
                <th className="py-2.5 px-3">వారము (Day)</th>
                <th className="py-2.5 px-3">అధిపతి (Lord)</th>
                <th className="py-2.5 px-3 text-red-900">రాహు కాలం</th>
                <th className="py-2.5 px-3 text-purple-900">యమగండం</th>
                <th className="py-2.5 px-3 text-rose-900">దుర్ముహూర్తం</th>
                <th className="py-2.5 px-3 text-emerald-800">అమృత కాలం</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100 text-gray-800">
              {TELUGU_DAILY_TIMINGS.map((d, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-purple-50/30'}>
                  <td className="py-2.5 px-3 font-bold text-purple-950">
                    <div>{d.telugu}</div>
                    <div className="text-[10px] text-gray-500 font-normal">{d.day}</div>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-purple-900">{d.lord}</td>
                  <td className="py-2.5 px-3 font-semibold text-red-800 bg-red-50/40">{d.rahuKalam}</td>
                  <td className="py-2.5 px-3 font-medium text-purple-800">{d.yamagandam}</td>
                  <td className="py-2.5 px-3 font-medium text-rose-900 bg-rose-50/30">{d.durmuhurtham}</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-800 bg-emerald-50/40">{d.amruthaKalam}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 12 TELUGU LUNAR MONTHS (చైత్రం నుండి ఫాల్గుణం వరకు 12 మాసాల వివరాలు)       */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-purple-900/20 p-5 shadow-md space-y-4">
        <div className="flex items-center gap-2 text-purple-950 border-b border-purple-100 pb-3">
          <Award className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-base">తెలుగు సంవత్సర 12 చాంద్రమాసాలు (12 Telugu Lunar Months)</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {TELUGU_MONTHS_INFO.map((m) => (
            <div
              key={m.id}
              className="bg-purple-50/50 hover:bg-purple-100/50 border border-purple-200/60 rounded-xl p-3 text-center transition-all group"
            >
              <div className="text-[11px] font-bold text-purple-700 bg-white inline-block px-2 py-0.5 rounded-full border border-purple-200 mb-1">
                మాసం {m.id}
              </div>
              <div className="font-extrabold text-sm text-purple-950 group-hover:text-purple-700">{m.name}</div>
              <div className="text-[11px] font-medium text-gray-600">{m.en}</div>
              <div className="text-[10px] text-amber-900/80 font-semibold mt-1 truncate">{m.deity}</div>
              <div className="text-[10px] text-gray-500 mt-0.5 line-clamp-2 italic">{m.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

