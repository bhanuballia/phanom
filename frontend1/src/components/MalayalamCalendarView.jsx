import React, { useState } from 'react';
import {
  MALAYALAM_MONTHS_INFO,
  MALAYALAM_WEEKDAYS,
  KERALA_DAILY_TIMINGS,
  getKollamYear
} from '../data/malayalamCalendarData';
import { getMalayalamFestivalsForYear } from '../data/malayalamFestivalsEngine';
import { FESTIVAL_IMAGE_MAP } from '../data/festivalImageMap';
import { Calendar, Clock, Award, Sparkles, Filter, Sun, ShieldAlert } from 'lucide-react';

export const MalayalamCalendarView = ({ year, month }) => {
  const [festivalViewMode, setFestivalViewMode] = useState('all');

  // Month mapping to dominant Malayalam months (Sankramam happens around 16th/17th)
  // Jan: Dhanu - Makaram
  // Feb: Makaram - Kumbham
  // Mar: Kumbham - Meenam
  // Apr: Meenam - Medam (Vishu)
  // May: Medam - Edavam
  // Jun: Edavam - Mithunam
  // Jul: Mithunam - Karkidakam
  // Aug: Karkidakam - Chingam (New Year & Onam)
  // Sep: Chingam - Kanni
  // Oct: Kanni - Thulam
  // Nov: Thulam - Vrischikam (Mandala Kalam)
  // Dec: Vrischikam - Dhanu
  const monthMap = {
    1: { primary: "ധനു (Dhanu)", secondary: "മകരം (Makaram)", transitDate: 14, festival: "മകരവിളക്ക് (Makaravilakku Sabarimala), തൈപ്പൂയം" },
    2: { primary: "മകരം (Makaram)", secondary: "കുംഭം (Kumbham)", transitDate: 13, festival: "ആലുവ ശിവരാത്രി, ആറ്റുകാൽ പൊങ്കാല" },
    3: { primary: "കുംഭം (Kumbham)", secondary: "മീനം (Meenam)", transitDate: 14, festival: "കൊടുങ്ങല്ലൂർ ഭരണി, മീനപ്പൂരം" },
    4: { primary: "മീനം (Meenam)", secondary: "മേടം (Medam)", transitDate: 14, festival: "വിഷുക്കണി (Vishu), തൃശ്ശൂർ പൂരം (Thrissur Pooram)" },
    5: { primary: "മേടം (Medam)", secondary: "ഇടവം (Edavam)", transitDate: 15, festival: "ഇടവപ്പാതി (മഴക്കാലം), പ്രതിഷ്ഠാ ദിനങ്ങൾ" },
    6: { primary: "ഇടവം (Edavam)", secondary: "മിഥുനം (Mithunam)", transitDate: 15, festival: "ഓച്ചിറക്കളി, ചമ്പക്കുളം മൂലം വള്ളംകളി" },
    7: { primary: "മിഥുനം (Mithunam)", secondary: "കർക്കടകം (Karkidakam)", transitDate: 16, festival: "കർക്കടക രാമായണ മാസം ആരംഭം" },
    8: { primary: "കർക്കടകം (Karkidakam)", secondary: "ചിങ്ങം (Chingam)", transitDate: 17, festival: "കർക്കടക വാവുബലി, ചിങ്ങം 1 (പുതുവർഷം), തിരുവോണം (Onam)" },
    9: { primary: "ചിങ്ങം (Chingam)", secondary: "കന്നി (Kanni)", transitDate: 17, festival: "ശ്രീകൃഷ്ണ ജയന്തി (അഷ്ടമിരോഹിണി), കന്നി ആയില്യം" },
    10: { primary: "കന്നി (Kanni)", secondary: "തുലാം (Thulam)", transitDate: 17, festival: "ആയുധപൂജ, വിദ്യാരംഭം (എഴുത്തിനിരുത്ത്), ദീപാവലി" },
    11: { primary: "തുലാം (Thulam)", secondary: "വൃശ്ചികം (Vrischikam)", transitDate: 16, festival: "മണ്ഡലകാലാരംഭം (ശബരിമല ദീക്ഷ), ഗുരുവായൂർ ഏകാദശി" },
    12: { primary: "വൃശ്ചികം (Vrischikam)", secondary: "ധനു (Dhanu)", transitDate: 16, festival: "ധനു തിരുവാതിര (പാതിരാപ്പൂചൂടൽ), വൈകുണ്ഠ ഏകാദശി" }
  };

  const currMalInfo = monthMap[month] || monthMap[1];
  const kollamYear = getKollamYear(year, month);
  const allYearFestivals = getMalayalamFestivalsForYear(year);

  const displayedMonths = festivalViewMode === 'current'
    ? allYearFestivals.filter(m => m.monthNum === month)
    : allYearFestivals;

  return (
    <div className="malayalam-calendar-container bg-[#fffefc] border-2 border-emerald-950/30 rounded-3xl p-4 sm:p-7 shadow-xl space-y-6">
      {/* Malayalam Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-green-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-emerald-500/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full mb-2 border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>മലയാളം കലണ്ടർ • Kollam Era (കൊല്ലവർഷം)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-cinzel text-emerald-100 tracking-wide">
              {currMalInfo.primary} – {currMalInfo.secondary}
            </h2>
            <p className="text-sm font-semibold text-emerald-200/90 mt-1">
              കൊല്ലവർഷം: <span className="font-bold text-amber-300">{kollamYear}</span> (Gregorian Year: {year})
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-xs text-emerald-100 text-center max-w-xs">
            <div className="font-bold text-amber-300 text-sm mb-1">സൗര സംക്രമം (Solar Ingress)</div>
            <div>{currMalInfo.transitDate} {new Date(year, month - 1).toLocaleString('en-US', { month: 'short' })} அன்று സൂര്യൻ സംക്രമിച്ച് {currMalInfo.secondary} ആരംഭിക്കുന്നു.</div>
          </div>
        </div>
      </div>

      {/* Highlights & Festivals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Festival */}
        <div className="bg-emerald-50/80 border border-emerald-900/15 rounded-2xl p-4 shadow-2xs">
          <div className="font-bold text-emerald-950 text-xs flex items-center gap-2 mb-2 pb-1.5 border-b border-emerald-200">
            <Award className="w-4 h-4 text-emerald-700" />
            <span>ഈ മാസത്തെ പ്രധാന ആഘോഷങ്ങൾ</span>
          </div>
          <div className="text-xs text-gray-800 leading-relaxed font-semibold">
            {currMalInfo.festival}
          </div>
          <p className="text-[11px] text-emerald-900/80 mt-2 font-medium">
            പരമ്പരാഗത ക്ഷേത്രോത്സവങ്ങൾ & വ്രതങ്ങൾ
          </p>
        </div>

        {/* Njaattuvela / Season */}
        <div className="bg-teal-50/70 border border-teal-900/15 rounded-2xl p-4 shadow-2xs">
          <div className="font-bold text-teal-950 text-xs flex items-center gap-2 mb-2 pb-1.5 border-b border-teal-200">
            <Sun className="w-4 h-4 text-teal-700" />
            <span>ഞാറ്റുവേല & പ്രകൃതി</span>
          </div>
          <div className="text-xs text-gray-800 space-y-1">
            <div><span className="font-bold text-teal-950">മാസം:</span> {currMalInfo.primary} - {currMalInfo.secondary}</div>
            <div className="text-[11px] text-gray-600 pt-1 font-medium">കേരളീയ കൃഷി സംസ്കാരവുമായി ഇഴചേർന്ന 27 ഞാറ്റുവേലകൾ പ്രകാരം അനുകൂല കാലാവസ്ഥ.</div>
          </div>
        </div>

        {/* Inauspicious times caution */}
        <div className="bg-rose-50/70 border border-rose-900/15 rounded-2xl p-4 shadow-2xs">
          <div className="font-bold text-rose-950 text-xs flex items-center gap-2 mb-2 pb-1.5 border-b border-rose-200">
            <ShieldAlert className="w-4 h-4 text-rose-700" />
            <span>രാഹുകാലവും ഗുളികകാലവും</span>
          </div>
          <div className="text-xs text-gray-700 leading-relaxed">
            ശുഭകാര്യങ്ങൾ ആരംഭിക്കുമ്പോൾ രാഹുകാലം, യമകണ്ടം എന്നിവ ഒഴിവാക്കുക. ഗുളികകാലം പുനരാവർത്തന സ്വഭാവമുള്ള കാര്യങ്ങൾക്ക് ഉത്തമം.
          </div>
        </div>
      </div>

      {/* Redesigned Malayalam Festivals Section */}
      <div className="bg-white rounded-3xl border border-emerald-900/15 overflow-hidden shadow-lg transition-all">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-950 text-white p-5 sm:p-6 border-b border-emerald-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-400/15 text-emerald-300 text-[11px] font-bold px-3 py-0.5 rounded-full mb-1.5 border border-emerald-400/30">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span>{year} കേരളീയ ഉത്സവങ്ങളും പ്രധാന വിശേഷദിവസങ്ങളും</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-cinzel text-emerald-50 tracking-wide">
                {year} Kerala Malayalam Festivals
              </h3>
              <p className="text-xs text-emerald-200/80 mt-0.5 font-sans">
                Kollavarsham {kollamYear} • സൗരമാന പഞ്ചാംഗ ഗണന
              </p>
            </div>

            {/* View Mode Toggle Controls */}
            <div className="flex items-center bg-black/25 backdrop-blur-md p-1 rounded-2xl border border-white/10 self-start sm:self-auto shadow-inner">
              <button
                onClick={() => setFestivalViewMode('current')}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all ${festivalViewMode === 'current'
                  ? 'bg-amber-400 text-amber-950 shadow-sm'
                  : 'text-emerald-200/90 hover:text-white'
                  }`}
              >
                ഈ മാസം ({new Date(year, month - 1).toLocaleString('en-US', { month: 'short' })})
              </button>
              <button
                onClick={() => setFestivalViewMode('all')}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all ${festivalViewMode === 'all'
                  ? 'bg-amber-400 text-amber-950 shadow-sm'
                  : 'text-emerald-200/90 hover:text-white'
                  }`}
              >
                എല്ലാ മാസങ്ങളും (All 12)
              </button>
            </div>
          </div>
        </div>

        {/* Month by Month Grid */}
        <div className="p-4 sm:p-6 space-y-6 bg-[#f4f8f5]">
          {displayedMonths.map((mObj) => (
            <div key={mObj.monthNum} className="space-y-3">
              {/* Month Header Pill */}
              <div className="flex items-center gap-2">
                <div className="bg-emerald-900 text-white font-bold text-xs sm:text-sm px-3.5 py-1 rounded-xl shadow-xs flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-amber-300" />
                  <span>{new Date(year, mObj.monthNum - 1).toLocaleString('en-US', { month: 'long' })} {year}</span>
                </div>
                <div className="h-px bg-emerald-900/15 flex-1"></div>
                <span className="text-[11px] text-emerald-900/70 font-semibold hidden sm:inline">
                  {mObj.festivals.length} വിശേഷങ്ങൾ (Festivals)
                </span>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3.5">
                {mObj.festivals.map((fest, idx) => {
                  const imgData = FESTIVAL_IMAGE_MAP[fest.name] || {};
                  const initialSrc = imgData.primary || fest.imageUrl;
                  const fallbackSrc = imgData.localFallback || "/yantra/Sri yantra.jpg";

                  return (
                    <div
                      key={idx}
                      className="group bg-white rounded-2xl p-3.5 border border-emerald-900/10 hover:border-emerald-500/50 shadow-xs hover:shadow-md transition-all duration-200 flex items-center gap-3.5 relative overflow-hidden"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-600 to-amber-500 group-hover:w-1.5 transition-all"></div>

                      <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-emerald-900/15 shadow-2xs shrink-0 bg-emerald-50 relative group-hover:scale-105 transition-transform duration-300">
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

                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-sm font-bold text-gray-900 group-hover:text-emerald-900 transition-colors leading-tight truncate">
                            {fest.name}
                          </h4>
                          <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded shrink-0">
                            {fest.day} {new Date(year, mObj.monthNum - 1).toLocaleString('en-US', { month: 'short' })}
                          </span>
                        </div>

                        {fest.malName && (
                          <div className="text-[11.5px] font-semibold text-emerald-900/90 mt-0.5 truncate">
                            {fest.malName}
                          </div>
                        )}

                        <div className="text-[11.5px] text-gray-700 font-medium mt-1 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-emerald-700 shrink-0" />
                          <span className="truncate">{fest.dateStr}</span>
                        </div>

                        <div className="text-[12px] text-amber-900 italic mt-1 line-clamp-1">
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

      {/* Daily Kerala Nalla Samayam, Rahu Kalam, Gulika & Yamagandam */}
      <div className="bg-white rounded-2xl border border-emerald-900/20 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-emerald-100 gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-800" />
            <h3 className="font-bold text-emerald-950 text-sm sm:text-base">
              ആഴ്ചവട്ട സമയക്രമം (Kerala Rahu Kalam, Gulika & Nalla Samayam)
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-200 w-fit">
            കേരള പഞ്ചാംഗ സ്ഥിരപ്പട്ടിക
          </span>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-emerald-100/60 text-emerald-950 font-bold border-b border-emerald-200">
                <th className="py-2 px-3">ദിവസം (Day)</th>
                <th className="py-2 px-3">ഗ്രഹം (Planet)</th>
                <th className="py-2 px-3">നല്ല സമയം (Auspicious)</th>
                <th className="py-2 px-3">രാഹുകാലം (Rahu)</th>
                <th className="py-2 px-3">യമകണ്ടം (Yama)</th>
                <th className="py-2 px-3 text-teal-900">ഗുളികകാലം (Gulika)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100">
              {MALAYALAM_WEEKDAYS.map((w, idx) => {
                const timings = KERALA_DAILY_TIMINGS[idx];
                return (
                  <tr key={idx} className="hover:bg-emerald-50/50">
                    <td className="py-2.5 px-3 font-bold text-emerald-950">{w.name} ({w.en})</td>
                    <td className="py-2.5 px-3 font-medium text-emerald-900">{w.planet}</td>
                    <td className="py-2.5 px-3 text-emerald-800 font-semibold">{timings.nallaNeram}</td>
                    <td className="py-2.5 px-3 text-red-700 font-medium">{timings.rahu}</td>
                    <td className="py-2.5 px-3 text-gray-700 font-medium">{timings.yama}</td>
                    <td className="py-2.5 px-3 text-teal-900 font-bold">{timings.gulika}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 12 Malayalam Months Reference Grid */}
      <div className="bg-emerald-50/40 rounded-2xl border border-emerald-900/15 p-4 sm:p-5 shadow-xs">
        <h4 className="font-bold text-emerald-950 text-xs sm:text-sm mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-800" />
          <span>കൊല്ലവർഷത്തിലെ 12 മലയാള മാസങ്ങൾ (12 Malayalam Solar Months)</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
          {MALAYALAM_MONTHS_INFO.map(m => {
            return (
              <div
                key={m.id}
                className="p-3 rounded-xl border border-emerald-200/70 bg-white/80 hover:bg-emerald-50/70 transition-all"
              >
                <div className="flex items-center justify-between font-bold text-emerald-950 text-xs">
                  <span>{m.id}. {m.name} ({m.en})</span>
                </div>
                <div className="text-[11px] text-emerald-900 font-semibold mt-1">
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

