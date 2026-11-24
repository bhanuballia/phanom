import React, { useState } from 'react';
import {
  TAMIL_MONTHS_INFO,
  TAMIL_WEEKDAYS,
  GOWRI_NALLA_NERAM,
  getTamilYear
} from '../data/tamilCalendarData';
import { getTamilFestivalsForYear } from '../data/tamilFestivalsEngine';
import { FESTIVAL_IMAGE_MAP } from '../data/festivalImageMap';
import { Calendar, Sun, Moon, Clock, ShieldAlert, Award, Star, Compass, Sparkles, Filter, ChevronRight } from 'lucide-react';

export const TamilCalendarView = ({ year, month }) => {
  // Filter for festivals: 'current' (active month) or 'all' (all 12 months like image)
  const [festivalViewMode, setFestivalViewMode] = useState('all');

  const monthMap = {
    1: { primary: 9, secondary: 10, transitDate: 14, primaryName: "மார்கழி (Margazhi)", secondaryName: "தை (Thai)", festival: "தைப்பொங்கல் (Pongal / Makar Sankranti)" },
    2: { primary: 10, secondary: 11, transitDate: 13, primaryName: "தை (Thai)", secondaryName: "மாசி (Maasi)", festival: "தைப்பூசம் (Thaipusam), மாசி மகம்" },
    3: { primary: 11, secondary: 12, transitDate: 14, primaryName: "மாசி (Maasi)", secondaryName: "பங்குனி (Panguni)", festival: "மகா சிவராத்திரி, பங்குனி உத்திரம்" },
    4: { primary: 12, secondary: 1, transitDate: 14, primaryName: "பங்குனி (Panguni)", secondaryName: "சித்திரை (Chithirai)", festival: "சித்திரை விஷு / தமிழ் புத்தாண்டு (Tamil New Year)" },
    5: { primary: 1, secondary: 2, transitDate: 15, primaryName: "சித்திரை (Chithirai)", secondaryName: "வைகாசி (Vaikasi)", festival: "சித்திரா பௌர்ணமி, வைகாசி விசாகம்" },
    6: { primary: 2, secondary: 3, transitDate: 15, primaryName: "வைகாசி (Vaikasi)", secondaryName: "ஆனி (Aani)", festival: "ஆனி திருமஞ்சனம் (Nataraja Abhishekam)" },
    7: { primary: 3, secondary: 4, transitDate: 16, primaryName: "ஆனி (Aani)", secondaryName: "ஆடி (Aadi)", festival: "தட்சிணாயன புண்ணியகாலம், ஆடி பெருக்கு, ஆடி அமாவாசை" },
    8: { primary: 4, secondary: 5, transitDate: 17, primaryName: "ஆடி (Aadi)", secondaryName: "ஆவணி (Aavani)", festival: "ஆவணி அவிட்டம், கிருஷ்ண ஜெயந்தி, விநாயகர் சதுர்த்தி" },
    9: { primary: 5, secondary: 6, transitDate: 17, primaryName: "ஆவணி (Aavani)", secondaryName: "புரட்டாசி (Purattasi)", festival: "புரட்டாசி சனிக்கிழமைகள் (Perumal worship), நவராத்திரி ஆரம்பம்" },
    10: { primary: 6, secondary: 7, transitDate: 17, primaryName: "புரட்டாசி (Purattasi)", secondaryName: "ஐப்பசி (Aippasi)", festival: "விஜயதசமி, தீபாவளி பண்டிகை, கந்த சஷ்டி விரதம்" },
    11: { primary: 7, secondary: 8, transitDate: 16, primaryName: "ஐப்பசி (Aippasi)", secondaryName: "கார்த்திகை (Karthigai)", festival: "கார்த்திகை தீபம் (Thiruvannamalai Deepam), சூரசம்ஹாரம்" },
    12: { primary: 8, secondary: 9, transitDate: 16, primaryName: "கார்த்திகை (Karthigai)", secondaryName: "மார்கழி (Margazhi)", festival: "வைகுண்ட ஏகாதசி, மார்கழி திருப்பாவை, ஆருத்ரா தரிசனம்" }
  };

  const currTamilInfo = monthMap[month] || monthMap[10];
  const tamilYearName = getTamilYear(year, month);
  const primaryMeta = TAMIL_MONTHS_INFO[currTamilInfo.primary - 1];
  const secondaryMeta = TAMIL_MONTHS_INFO[currTamilInfo.secondary - 1];

  // Dynamically compute the exact festival dates for the selected year
  const allYearFestivals = getTamilFestivalsForYear(year);

  // Filter festivals based on view mode
  const displayedMonths = festivalViewMode === 'current'
    ? allYearFestivals.filter(m => m.monthNum === month)
    : allYearFestivals;

  return (
    <div className="tamil-calendar-container bg-[#fffefc] border-2 border-orange-950/30 rounded-3xl p-4 sm:p-7 shadow-xl space-y-6">
      {/* Tamil Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-orange-900 to-red-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-amber-500/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full mb-2 border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>தமிழ் நாட்காட்டி • Sidereal Solar Tamil Calendar</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-cinzel text-amber-100 tracking-wide">
              {currTamilInfo.primaryName} – {currTamilInfo.secondaryName}
            </h2>
            <p className="text-sm font-semibold text-amber-200/90 mt-1">
              தமிழ் வருடம்: <span className="font-bold text-amber-300">{tamilYearName}</span> [1947 - 1948] Shaka Samvata
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-xs text-amber-100 text-center max-w-xs">
            <div className="font-bold text-amber-300 text-sm mb-1">மாதப் பிறப்பு (Solar Transit)</div>
            <div>{currTamilInfo.transitDate} {month}/{year} அன்று சூரியன் {secondaryMeta.rasi} பிரவேசம் செய்து {currTamilInfo.secondaryName} மாதம் துவங்குகிறது.</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PREMIUM MODERN REDESIGNED TAMIL FESTIVALS SECTION                         */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-amber-900/15 overflow-hidden shadow-lg transition-all">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-amber-950 text-white p-5 sm:p-6 border-b border-amber-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-amber-400/15 text-amber-300 text-[11px] font-bold px-3 py-0.5 rounded-full mb-1.5 border border-amber-400/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{year} முக்கிய தமிழ் பண்டிகைகள் & விரத நாட்கள்</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-cinzel text-amber-50 tracking-wide">
                {year} Tamil Festivals Calendar
              </h3>
              <p className="text-xs text-amber-200/80 mt-0.5 font-sans">
                [1947 - 1948] Shaka Samvata • Drik Siddhanta / Solar Transit Calculations
              </p>
            </div>

            {/* View Mode Toggle Controls */}
            <div className="flex items-center bg-black/25 backdrop-blur-md p-1 rounded-2xl border border-white/10 self-start sm:self-auto shadow-inner">
              <button
                onClick={() => setFestivalViewMode('current')}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                  festivalViewMode === 'current'
                    ? 'bg-amber-500 text-amber-950 shadow-sm'
                    : 'text-amber-200/90 hover:text-white'
                }`}
              >
                நடப்பு மாதம் ({new Date(year, month - 1).toLocaleString('en-US', { month: 'short' })})
              </button>
              <button
                onClick={() => setFestivalViewMode('all')}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                  festivalViewMode === 'all'
                    ? 'bg-amber-500 text-amber-950 shadow-sm'
                    : 'text-amber-200/90 hover:text-white'
                }`}
              >
                அனைத்து 12 மாதங்கள் (All 12)
              </button>
            </div>
          </div>
        </div>

        {/* Month by Month Grid */}
        <div className="p-4 sm:p-6 space-y-6 bg-[#faf7f2]">
          {displayedMonths.map((mObj) => (
            <div key={mObj.monthNum} className="space-y-3">
              {/* Month Header Pill */}
              <div className="flex items-center gap-2">
                <div className="bg-red-900 text-white font-bold text-xs sm:text-sm px-3.5 py-1 rounded-xl shadow-xs flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-amber-300" />
                  <span>{new Date(year, mObj.monthNum - 1).toLocaleString('en-US', { month: 'long' })} {year}</span>
                </div>
                <div className="h-px bg-amber-900/15 flex-1"></div>
                <span className="text-[11px] text-amber-900/70 font-semibold hidden sm:inline">
                  {mObj.festivals.length} விசேஷங்கள் (Festivals)
                </span>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3.5">
                {mObj.festivals.map((fest, idx) => {
                  const imgData = FESTIVAL_IMAGE_MAP[fest.name] || {};
                  const initialSrc = imgData.primary || fest.imageUrl;
                  const fallbackSrc = imgData.localFallback || "/yantra/Sri yantra.jpg";
                  const accentGradient = imgData.accent || "from-amber-700 to-red-900";

                  return (
                    <div
                      key={idx}
                      className="group bg-white rounded-2xl p-3.5 border border-amber-900/10 hover:border-amber-500/50 shadow-xs hover:shadow-md transition-all duration-200 flex items-center gap-3.5 relative overflow-hidden"
                    >
                      {/* Left Subtle Accent Line */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-600 to-amber-500 group-hover:w-1.5 transition-all"></div>

                      {/* Image Thumbnail Container */}
                      <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-amber-900/15 shadow-2xs shrink-0 bg-amber-50 relative group-hover:scale-105 transition-transform duration-300">
                        <img
                          src={initialSrc}
                          alt={fest.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            if (e.target.src !== fallbackSrc) {
                              e.target.onerror = null;
                              e.target.src = fallbackSrc;
                            }
                          }}
                        />
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-sm font-bold text-gray-900 group-hover:text-red-900 transition-colors leading-tight truncate">
                            {fest.name}
                          </h4>
                          <span className="text-[10px] bg-red-50 text-red-800 font-bold px-1.5 py-0.5 rounded shrink-0">
                            {fest.day} {new Date(year, mObj.monthNum - 1).toLocaleString('en-US', { month: 'short' })}
                          </span>
                        </div>

                        {fest.tamilName && (
                          <div className="text-[11.5px] font-semibold text-amber-900/90 mt-0.5 truncate">
                            {fest.tamilName}
                          </div>
                        )}

                        <div className="text-[11.5px] text-gray-700 font-medium mt-1 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-amber-700 shrink-0" />
                          <span className="truncate">{fest.dateStr}</span>
                        </div>

                        <div className="text-[10.5px] text-gray-500 italic mt-0.5 line-clamp-1">
                          {fest.basis}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Tamil Gowri Nalla Neram, Rahu Kalam & Kuligai Chart */}
      <div className="bg-white rounded-2xl border border-amber-900/20 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-amber-100 gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-800" />
            <h3 className="font-bold text-amber-950 text-sm sm:text-base">
              வார நாட்காட்டி நேர அட்டவணை (Tamil Nalla Neram & Rahu Kalam)
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-full border border-amber-200 w-fit">
            கௌரி பஞ்சாங்கம் & நிரந்தர அட்டவணை
          </span>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-amber-100/60 text-amber-950 font-bold border-b border-amber-200">
                <th className="py-2 px-3">கிழமை (Day)</th>
                <th className="py-2 px-3">கிரகம் (Lord)</th>
                <th className="py-2 px-3">நல்ல நேரம் (Nalla Neram)</th>
                <th className="py-2 px-3">இராகு காலம் (Rahu)</th>
                <th className="py-2 px-3">எமகண்டம் (Yama)</th>
                <th className="py-2 px-3 text-emerald-900">குளிகை (Kuligai)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {TAMIL_WEEKDAYS.map((w, idx) => {
                const timings = GOWRI_NALLA_NERAM[idx];
                return (
                  <tr key={idx} className="hover:bg-amber-50/50">
                    <td className="py-2.5 px-3 font-bold text-red-950">{w.name} ({w.en})</td>
                    <td className="py-2.5 px-3 font-medium text-amber-900">{w.planet}</td>
                    <td className="py-2.5 px-3 text-emerald-800 font-semibold">{timings.day}</td>
                    <td className="py-2.5 px-3 text-red-700 font-medium">{timings.rahu}</td>
                    <td className="py-2.5 px-3 text-gray-700 font-medium">{timings.yama}</td>
                    <td className="py-2.5 px-3 text-blue-900 font-bold">{timings.kuligai}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 12 Tamil Months Complete Reference Grid */}
      <div className="bg-amber-50/40 rounded-2xl border border-amber-900/15 p-4 sm:p-5 shadow-xs">
        <h4 className="font-bold text-amber-950 text-xs sm:text-sm mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-800" />
          <span>வருடத்தின் 12 தமிழ் மாதங்கள் முழு விபரம் (12 Tamil Solar Months)</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
          {TAMIL_MONTHS_INFO.map(m => {
            const isCurrent = m.id === currTamilInfo.primary || m.id === currTamilInfo.secondary;
            return (
              <div
                key={m.id}
                className={`p-3 rounded-xl border transition-all ${isCurrent
                  ? 'bg-amber-100/90 border-amber-600 shadow-xs ring-1 ring-amber-500/30'
                  : 'bg-white/80 border-amber-200/70 hover:bg-amber-50/70'
                  }`}
              >
                <div className="flex items-center justify-between font-bold text-red-950 text-xs">
                  <span>{m.id}. {m.tamil} ({m.en})</span>
                  {isCurrent && (
                    <span className="text-[9px] bg-red-700 text-white px-1.5 py-0.2 rounded-full font-bold">
                      தற்போது
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-amber-900 font-semibold mt-1">
                  {m.rasi}
                </div>
                <div className="text-[10px] text-gray-600 mt-0.5">
                  {m.startMidMonth}
                </div>
                <div className="text-[10.5px] text-gray-700 mt-1 line-clamp-1 italic">
                  {m.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
