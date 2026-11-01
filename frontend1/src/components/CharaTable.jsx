import { PYTHON_ASTRO_URL } from '../services/api';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, Calendar, Clock, LayoutGrid } from 'lucide-react';

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const SIGN_META = {
  Aries: { hi: 'मेष', symbol: '♈', color: '#ef4444', ruler: 'Mars' },
  Taurus: { hi: 'वृषभ', symbol: '♉', color: '#d97706', ruler: 'Venus' },
  Gemini: { hi: 'मिथुन', symbol: '♊', color: '#16a34a', ruler: 'Mercury' },
  Cancer: { hi: 'कर्क', symbol: '♋', color: '#4f46e5', ruler: 'Moon' },
  Leo: { hi: 'सिंह', symbol: '♌', color: '#ea580c', ruler: 'Sun' },
  Virgo: { hi: 'कन्या', symbol: '♍', color: '#059669', ruler: 'Mercury' },
  Libra: { hi: 'तुला', symbol: '♎', color: '#db2777', ruler: 'Venus' },
  Scorpio: { hi: 'वृश्चिक', symbol: '♏', color: '#dc2626', ruler: 'Mars' },
  Sagittarius: { hi: 'धनु', symbol: '♐', color: '#ca8a04', ruler: 'Jupiter' },
  Capricorn: { hi: 'मकर', symbol: '♑', color: '#475569', ruler: 'Saturn' },
  Aquarius: { hi: 'कुम्भ', symbol: '♒', color: '#0284c7', ruler: 'Saturn' },
  Pisces: { hi: 'मीन', symbol: '♓', color: '#7c3aed', ruler: 'Jupiter' },
};

// Helper: Julian Date or Date String to DD-MM-YYYY
const fmtDate = (dObj) => {
  if (!dObj) return '';
  const d = new Date(dObj);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

// Compute age string from birth date and target date
const computeAge = (birthDateStr, targetDate) => {
  if (!birthDateStr || !targetDate) return null;
  try {
    let birthY, birthM, birthD;
    if (birthDateStr.includes('/')) {
      [birthD, birthM, birthY] = birthDateStr.split('/').map(Number);
    } else {
      [birthY, birthM, birthD] = birthDateStr.split('-').map(Number);
    }

    const d = new Date(targetDate);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();

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

export default function CharaTable({ birthData }) {
  const [charaList, setCharaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const now = new Date();
  const birthDateStr = birthData?.dateOfBirth || birthData?.date || null;

  useEffect(() => {
    if (!birthData) return;

    setLoading(true);
    setError(null);

    const dateStr = birthData.dateOfBirth || birthData.date || '1995-01-01';
    let timeStr = birthData.timeOfBirth || birthData.time || '12:00:00';
    if (timeStr && timeStr.split(':').length === 2) timeStr = timeStr + ':00';
    const tz = parseFloat(birthData.tz_offset ?? 5.5);

    axios.post((PYTHON_ASTRO_URL.includes('/api/kundali') ? `${PYTHON_ASTRO_URL}/dasha/rashi` : `${PYTHON_ASTRO_URL}/api/dasha/rashi`), {
      date: dateStr,
      time: timeStr,
      tz_offset: tz,
      offsets: {}
    })
      .then(res => {
        const rawChara = res.data?.charaData || [];

        // Build 12 Antardashas for each Chara Mahadasha
        let birthObj = new Date(`${dateStr}T${timeStr}`);
        if (isNaN(birthObj.getTime())) {
          birthObj = new Date(dateStr);
        }

        const enrichedList = rawChara.map((md, idx) => {
          const mdSign = md.d || 'Aries';
          const durYears = Number(md.duration) || 1;
          const mdStart = new Date(birthObj.getTime() + (Number(md.start) || 0) * 365.2425 * 86400000);
          const mdEnd = new Date(mdStart.getTime() + durYears * 365.2425 * 86400000);

          // Antardashas sequence starting from the Mahadasha sign
          const signIdx = ZODIAC_SIGNS.indexOf(mdSign);
          const startIndex = signIdx >= 0 ? signIdx : 0;
          const antarDurYears = durYears / 12.0;

          const antardashas = [];
          let curStart = new Date(mdStart.getTime());
          for (let j = 0; j < 12; j++) {
            const adSign = ZODIAC_SIGNS[(startIndex + j) % 12];
            const curEnd = new Date(curStart.getTime() + antarDurYears * 365.2425 * 86400000);
            antardashas.push({
              sign: adSign,
              startDate: new Date(curStart),
              endDate: new Date(curEnd),
              durationYears: antarDurYears
            });
            curStart = new Date(curEnd);
          }

          return {
            ...md,
            sign: mdSign,
            durationYears: durYears,
            startDate: mdStart,
            endDate: mdEnd,
            antardashas
          };
        });

        setCharaList(enrichedList);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load Chara Dasha:', err);
        setError('चर दशा लोड करने में असमर्थ। कृपया सुनिश्चित करें कि बैकएंड सेवा सक्रिय है।');
        setLoading(false);
      });
  }, [birthData]);

  // Find currently active Chara Mahadasha & Antardasha
  const currentMaha = charaList.find(m => now >= m.startDate && now <= m.endDate);
  const currentAntar = currentMaha?.antardashas?.find(a => now >= a.startDate && now <= a.endDate);

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-600 font-serif min-h-[350px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600"></div>
        <p className="text-sm">Calculating Jaimini Chara Dasha Periods & Antardashas...</p>
      </div>
    );
  }

  if (error || !charaList.length) {
    return (
      <div className="p-8 text-center text-red-600 font-serif italic">
        {error || 'No Chara Dasha data available.'}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-[#fcfaf7] flex flex-col h-full overflow-y-auto custom-scrollbar font-sans">
      {/* 🌟 Top Live Active Chara Dasha Banner */}
      <div className="mb-5 p-4 rounded-2xl bg-white text-black shadow-md flex flex-wrap items-center justify-between gap-3 border border-amber-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xl shadow-sm">
            ♈
          </div>
          <div>
            <div className="text-[12px] uppercase font-bold tracking-widest text-amber-900 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Current Active Chara Dasha (वर्तमान चर दशा)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-slate-900 flex items-center gap-2">
              <span style={{ color: SIGN_META[currentMaha?.sign]?.color || '#b45309' }}>
                {SIGN_META[currentMaha?.sign]?.symbol} {currentMaha?.sign || 'Unknown'} ({SIGN_META[currentMaha?.sign]?.hi})
              </span>
              <span className="text-slate-400 font-normal">→</span>
              <span style={{ color: SIGN_META[currentAntar?.sign]?.color || '#d97706' }}>
                {SIGN_META[currentAntar?.sign]?.symbol} {currentAntar?.sign || 'Unknown'} ({SIGN_META[currentAntar?.sign]?.hi})
              </span>
            </h2>
          </div>
        </div>

        {currentAntar && (
          <div className="text-[14px] bg-amber-50/80 border border-amber-200 rounded-xl px-4 py-2">
            <span className="text-amber-900 block text-[11px] uppercase font-bold tracking-wide">Active Window</span>
            <span className="font-mono text-slate-900 font-bold">
              {fmtDate(currentAntar.startDate)} — {fmtDate(currentAntar.endDate)}
            </span>
          </div>
        )}
      </div>

      {/* Header Info */}
      <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-2">
        <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider font-serif">
          12 Rashi Mahadashas & Antardashas (जैमिनी चर दशा)
        </h3>
        <p className="text-xs text-stone-600 font-serif italic">
          Sign-Based Rashi System · 12 Sub-periods per Mahadasha
        </p>
      </div>

      {/* 3-Column Classical Grid Display (Matching user reference layout) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm font-serif">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 lg:gap-x-12 gap-y-10">
          {charaList.map((md, i) => {
            const meta = SIGN_META[md.sign] || {
              hi: md.sign,
              symbol: '♈',
              color: '#b45309',
              ruler: ''
            };

            const startAge = computeAge(birthDateStr, md.startDate) || '0 yrs.';
            const endAge = computeAge(birthDateStr, md.endDate) || '';
            const isMahaCurrent = now >= md.startDate && now <= md.endDate;

            return (
              <div
                key={i}
                className={`flex flex-col rounded-xl p-3 sm:p-3.5 transition-all ${
                  isMahaCurrent ? 'bg-amber-50/50 ring-2 ring-amber-500/60 shadow-sm' : 'bg-transparent'
                }`}
              >
                {/* Mahadasha Title & Age Range */}
                <div className="mb-2.5">
                  <h3 className="font-bold text-base sm:text-[17px] leading-tight flex items-center gap-1.5">
                    <span className="text-black font-serif font-black flex items-center gap-1">
                      <span className="text-base">{meta.symbol}</span>
                      <span>{md.sign}</span>
                    </span>
                    <span className="font-semibold" style={{ color: meta.color }}>
                      ({md.durationYears}y · {meta.hi})
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
                        const adMeta = SIGN_META[ad.sign] || { color: '#000', symbol: '', hi: '' };
                        const adStart = fmtDate(ad.startDate);
                        const adEnd = fmtDate(ad.endDate);
                        const isAntarCurrent = now >= ad.startDate && now <= ad.endDate;

                        return (
                          <tr
                            key={j}
                            className={`border-b border-stone-100 last:border-b-2 last:border-red-600 transition-colors ${
                              isAntarCurrent ? 'bg-amber-100/70 font-semibold' : 'hover:bg-amber-50/40'
                            }`}
                          >
                            <td className="py-1 px-1 font-semibold flex items-center gap-1" style={{ color: adMeta.color }}>
                              <span>{adMeta.symbol} {ad.sign}</span>
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
    </div>
  );
}
