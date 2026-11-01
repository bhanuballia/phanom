import { PYTHON_ASTRO_URL } from '../services/api';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, Calendar, Clock, LayoutGrid, CheckCircle2 } from 'lucide-react';

const YOGINI_METADATA = {
  Mangala: {
    planet: 'Moon (चन्द्र)',
    planetShort: 'Mo',
    duration: 1,
    color: '#dc2626',
    border: 'border-red-300',
    bgLight: 'bg-red-50/70',
    badge: 'bg-red-100 text-red-800 border-red-200'
  },
  Pingala: {
    planet: 'Sun (सूर्य)',
    planetShort: 'Su',
    duration: 2,
    color: '#ea580c',
    border: 'border-orange-300',
    bgLight: 'bg-orange-50/70',
    badge: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  Dhanya: {
    planet: 'Jupiter (गुरु)',
    planetShort: 'Ju',
    duration: 3,
    color: '#d97706',
    border: 'border-amber-300',
    bgLight: 'bg-amber-50/70',
    badge: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  Bhramari: {
    planet: 'Mars (मंगल)',
    planetShort: 'Ma',
    duration: 4,
    color: '#e11d48',
    border: 'border-rose-300',
    bgLight: 'bg-rose-50/70',
    badge: 'bg-rose-100 text-rose-800 border-rose-200'
  },
  Bhadrika: {
    planet: 'Mercury (बुध)',
    planetShort: 'Me',
    duration: 5,
    color: '#059669',
    border: 'border-emerald-300',
    bgLight: 'bg-emerald-50/70',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  Ulka: {
    planet: 'Saturn (शनि)',
    planetShort: 'Sa',
    duration: 6,
    color: '#2563eb',
    border: 'border-blue-300',
    bgLight: 'bg-blue-50/70',
    badge: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  Siddha: {
    planet: 'Venus (शुक्र)',
    planetShort: 'Ve',
    duration: 7,
    color: '#7c3aed',
    border: 'border-purple-300',
    bgLight: 'bg-purple-50/70',
    badge: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  Sankata: {
    planet: 'Rahu (राहु)',
    planetShort: 'Ra',
    duration: 8,
    color: '#475569',
    border: 'border-slate-300',
    bgLight: 'bg-slate-50/70',
    badge: 'bg-slate-100 text-slate-800 border-slate-200'
  },
};

// Helper: Julian Date to DD-MM-YYYY
const jdToFmtDate = (jd) => {
  if (!jd) return '';
  const ts = (jd - 2440587.5) * 86400000;
  const d = new Date(ts);
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = d.getUTCFullYear();
  return `${day}-${month}-${year}`;
};

// Compute age string from birth date and target Julian Date (e.g., 'From 0 yrs. to 0y10m')
const computeAge = (birthDateStr, targetJD) => {
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
};

// Helper to convert standard date string YYYY-MM-DD to Julian Date
const dateToJD = (dateStr) => {
  const d = new Date(dateStr);
  return (d.getTime() / 86400000) + 2440587.5;
};

export default function YoginiTable({ birthData }) {
  const [yoginiList, setYoginiList] = useState([]);
  const [selectedCycle, setSelectedCycle] = useState(0); // 0 = Cycle 1, 1 = Cycle 2, 2 = Cycle 3
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const nowJD = dateToJD(new Date().toISOString().split('T')[0]);
  const birthDateStr = birthData?.dateOfBirth || birthData?.date || null;

  useEffect(() => {
    if (!birthData) return;

    setLoading(true);
    setError(null);

    const dateStr = birthData.dateOfBirth || birthData.date || '1990-10-01';
    let timeStr = birthData.timeOfBirth || birthData.time || '12:00:00';
    if (timeStr && timeStr.split(':').length === 2) timeStr = timeStr + ':00';
    const tz = parseFloat(birthData.tz_offset ?? 5.5);

    axios.post((PYTHON_ASTRO_URL.includes('/api/kundali') ? `${PYTHON_ASTRO_URL}/dasha/all-nakshatra` : `${PYTHON_ASTRO_URL}/api/dasha/all-nakshatra`), {
      date: dateStr,
      time: timeStr,
      tz_offset: tz
    })
      .then(res => {
        const rawYogini = res.data?.yogini || [];
        setYoginiList(rawYogini);

        // Auto-select cycle that includes today's date
        const activeIdx = rawYogini.findIndex(m => nowJD >= m.start_jd && nowJD <= m.end_jd);
        if (activeIdx >= 0) {
          setSelectedCycle(Math.floor(activeIdx / 8));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load Yogini Dasha:', err);
        setError('योगिनी दशा लोड करने में असमर्थ। कृपया सुनिश्चित करें कि बैकएंड सेवा सक्रिय है।');
        setLoading(false);
      });
  }, [birthData]);

  // Find currently active Mahadasha & Antardasha
  const currentMaha = yoginiList.find(m => nowJD >= m.start_jd && nowJD <= m.end_jd);
  const currentAntar = currentMaha?.antardashas?.find(a => nowJD >= a.start_jd && nowJD <= a.end_jd);

  // Group into 36-year cycles (each cycle is 8 Mahadashas)
  const cycles = [];
  for (let i = 0; i < yoginiList.length; i += 8) {
    cycles.push(yoginiList.slice(i, i + 8));
  }

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-600 font-serif min-h-[350px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-600"></div>
        <p className="text-sm">Calculating Yogini Dasha Cycles (36y / 72y / 108y)...</p>
      </div>
    );
  }

  if (error || !yoginiList.length) {
    return (
      <div className="p-8 text-center text-red-600 font-serif italic">
        {error || 'No Yogini Dasha data available.'}
      </div>
    );
  }

  const activeCycleList = cycles[selectedCycle] || cycles[0] || [];

  return (
    <div className="p-4 sm:p-6 bg-[#fcfaf7] flex flex-col h-full overflow-y-auto custom-scrollbar font-sans">
      {/* 🌟 Top Live Active Yogini Banner */}
      <div className="mb-5 p-4 rounded-2xl bg-white text-black shadow-md flex flex-wrap items-center justify-between gap-3 border border-rose-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            ॐ
          </div>
          <div>
            <div className="text-[12px] uppercase font-bold tracking-widest text-rose-900 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>Current Active Yogini Period (वर्तमान योगिनी दशा)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-slate-900 flex items-center gap-2">
              <span style={{ color: YOGINI_METADATA[currentMaha?.lord]?.color || '#991b1b' }}>
                {currentMaha?.lord || 'Unknown'} ({YOGINI_METADATA[currentMaha?.lord]?.planetShort})
              </span>
              <span className="text-slate-400 font-normal">→</span>
              <span style={{ color: YOGINI_METADATA[currentAntar?.lord]?.color || '#be123c' }}>
                {currentAntar?.lord || 'Unknown'} ({YOGINI_METADATA[currentAntar?.lord]?.planetShort})
              </span>
            </h2>
          </div>
        </div>

        {currentAntar && (
          <div className="text-[14px] bg-rose-50/80 border border-rose-200 rounded-xl px-4 py-2">
            <span className="text-rose-900 block text-[11px] uppercase font-bold tracking-wide">Active Window</span>
            <span className="font-mono text-slate-900 font-bold">
              {jdToFmtDate(currentAntar.start_jd)} — {jdToFmtDate(currentAntar.end_jd)}
            </span>
          </div>
        )}
      </div>

      {/* Cycle Selector Bar */}
      <div className="mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-700 uppercase tracking-wider mr-1">Select Cycle:</span>
          {cycles.map((_, idx) => {
            const cycleYears = `${idx * 36} - ${(idx + 1) * 36} yrs`;
            const isSelected = selectedCycle === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedCycle(idx)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-rose-700 text-white shadow-sm ring-2 ring-rose-400/40'
                    : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-50'
                }`}
              >
                <span>Cycle {idx + 1}</span>
                <span className={`text-[10px] ${isSelected ? 'text-rose-100' : 'text-stone-500'}`}>({cycleYears})</span>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-stone-600 font-serif italic">
          Total 8 Yoginis: Mangala, Pingala, Dhanya, Bhramari, Bhadrika, Ulka, Siddha, Sankata (36 Years/Cycle)
        </div>
      </div>

      {/* 3-Column Classical Grid Display (Same as Dasha Timeline Image Layout) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm font-serif">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 lg:gap-x-12 gap-y-10">
          {activeCycleList.map((md, i) => {
            const meta = YOGINI_METADATA[md.lord] || {
              planet: 'Planet',
              planetShort: 'Pl',
              duration: md.duration_years,
              color: '#334155',
              border: 'border-stone-300',
              bgLight: 'bg-stone-50'
            };

            const startAge = computeAge(birthDateStr, md.start_jd) || '0 yrs.';
            const endAge = computeAge(birthDateStr, md.end_jd) || '';
            const isMahaCurrent = nowJD >= md.start_jd && nowJD <= md.end_jd;

            return (
              <div
                key={i}
                className={`flex flex-col rounded-xl p-3 sm:p-3.5 transition-all ${
                  isMahaCurrent ? 'bg-rose-50/40 ring-2 ring-rose-500/60 shadow-sm' : 'bg-transparent'
                }`}
              >
                {/* Mahadasha Title & Age Range */}
                <div className="mb-2.5">
                  <h3 className="font-bold text-base sm:text-[17px] leading-tight flex items-center gap-1.5">
                    <span className="text-black font-serif font-black">{md.lord}</span>
                    <span className="font-semibold" style={{ color: meta.color }}>
                      ({meta.duration}y · {meta.planetShort})
                    </span>
                    {isMahaCurrent && (
                      <span className="ml-1 px-1.5 py-0.2 bg-rose-600 text-white rounded text-[10px] font-sans font-bold tracking-tight uppercase">
                        Active
                      </span>
                    )}
                  </h3>
                  <p className="text-[13px] text-red-700 mt-1 font-serif">
                    From {startAge} to {endAge}
                  </p>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px] border-collapse font-serif">
                    <thead>
                      <tr className="border-t-2 border-b-2 border-red-600 bg-[#fff9e6]">
                        <th className="text-left py-1.5 px-1 font-bold text-black w-[32%]">Antar</th>
                        <th className="text-left py-1.5 px-1 font-bold text-black w-[34%]">Beginning</th>
                        <th className="text-left py-1.5 px-1 font-bold text-black w-[34%]">Ending</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(md.antardashas || []).map((ad, j) => {
                        const adMeta = YOGINI_METADATA[ad.lord] || { color: '#000', planetShort: '' };
                        const adStart = jdToFmtDate(ad.start_jd);
                        const adEnd = jdToFmtDate(ad.end_jd);
                        const isAntarCurrent = nowJD >= ad.start_jd && nowJD <= ad.end_jd;

                        return (
                          <tr
                            key={j}
                            className={`border-b border-stone-100 last:border-b-2 last:border-red-600 transition-colors ${
                              isAntarCurrent ? 'bg-amber-100/70 font-semibold' : 'hover:bg-amber-50/40'
                            }`}
                          >
                            <td className="py-1 px-1 font-semibold flex items-center gap-1" style={{ color: adMeta.color }}>
                              <span>{ad.lord}</span>
                              <span className="text-[11px] opacity-75 font-sans">({adMeta.planetShort})</span>
                              {isAntarCurrent && (
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
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
    </div>
  );
}
