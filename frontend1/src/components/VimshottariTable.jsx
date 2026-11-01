import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const TARA_COLORS = {
  'जन्म': { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-200' },
  'सम्पद': { bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-200' },
  'विपद': { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-200' },
  'क्षेम': { bg: 'bg-teal-50', text: 'text-teal-700', badge: 'bg-teal-200' },
  'प्रत्यरि': { bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-orange-200' },
  'साधक': { bg: 'bg-indigo-50', text: 'text-indigo-700', badge: 'bg-indigo-200' },
  'वध': { bg: 'bg-rose-50', text: 'text-rose-800', badge: 'bg-rose-200' },
  'मित्र': { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-200' },
  'परम मित्र': { bg: 'bg-purple-50', text: 'text-purple-700', badge: 'bg-purple-200' },
};

const PLANET_COLORS = {
  Sun: '#f59e0b',
  Moon: '#6366f1',
  Mars: '#ef4444',
  Mercury: '#10b981',
  Jupiter: '#f97316',
  Venus: '#ec4899',
  Saturn: '#64748b',
  Rahu: '#0ea5e9',
  Ketu: '#8b5cf6',
};

export default function VimshottariTable({
  birthData,
  levels: initialLevels = 5,
  hideMarriageDasha = false,
  transitDate = null,
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [levels, setLevels] = useState(initialLevels);
  const [showWindowsModal, setShowWindowsModal] = useState(false);
  const PAGE_SIZE = 12;
  const currentRowRef = useRef(null);

  // Sync active row to localStorage & window events
  useEffect(() => {
    if (rows[selectedIdx]) {
      try {
        localStorage.setItem('activeVimshottariDasha', JSON.stringify(rows[selectedIdx]));
        window.dispatchEvent(new CustomEvent('activeDashaChanged', { detail: rows[selectedIdx] }));
      } catch (e) {}
    }
  }, [selectedIdx, rows]);

  useEffect(() => {
    if (!birthData) return;

    // Parse coordinates and parameters
    const latLon = birthData.coordinates ? birthData.coordinates.split(',') : ['28.6139', '77.2090'];
    const lat = parseFloat(birthData.lat ?? latLon[0] ?? 28.6139);
    const lon = parseFloat(birthData.lon ?? latLon[1] ?? 77.2090);

    const date = birthData.dateOfBirth || birthData.date || '1990-10-01';
    let time = birthData.timeOfBirth || birthData.time || '12:00:00';
    if (time && time.split(':').length === 2) time = time + ':00';

    const getTzOffset = (timezoneName) => {
      try {
        const d = new Date();
        const tzString = d.toLocaleString('en-US', { timeZone: timezoneName });
        const localString = d.toLocaleString('en-US');
        const diff = (Date.parse(tzString) - Date.parse(localString)) / 3600000;
        const localOffset = -d.getTimezoneOffset() / 60;
        return localOffset + diff;
      } catch (err) {
        return 5.5;
      }
    };

    const tz = typeof birthData.tz_offset === 'number'
      ? birthData.tz_offset
      : getTzOffset(birthData.timezone || 'Asia/Kolkata');

    const moon_lon = birthData.moon_lon ?? -1;

    setLoading(true);
    setError(null);

    axios.post('http://localhost:8000/api/vimshottari-table', {
      date,
      time,
      tz,
      lat,
      lon,
      moon_lon,
      levels,
      transit_date: transitDate ? (typeof transitDate === 'string' ? transitDate : transitDate.toISOString()) : null,
    })
      .then(res => {
        const fetchedRows = res.data?.rows || [];
        setRows(fetchedRows);
        const idx = fetchedRows.findIndex(r => r.is_current);
        const ci = idx >= 0 ? idx : 0;
        setCurrentIdx(ci);
        setSelectedIdx(ci);
        setPage(Math.floor(ci / PAGE_SIZE));
        setLoading(false);
      })
      .catch(err => {
        console.error('Vimshottari fetch error:', err);
        setError('दशा डेटा लोड करने में असमर्थ। कृपया सुनिश्चित करें कि बैकएंड सेवा (पोर्ट 8000) चालू है।');
        setLoading(false);
      });
  }, [birthData, levels, transitDate]);

  useEffect(() => {
    if (currentRowRef.current) {
      currentRowRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [rows, page]);

  const totalPages = Math.ceil(rows.length / PAGE_SIZE);
  const pageRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const goToCurrent = () => {
    const newPage = Math.floor(currentIdx / PAGE_SIZE);
    setPage(newPage);
    setSelectedIdx(currentIdx);
  };

  const jumpTime = (yearsToAdd) => {
    if (rows.length === 0) return;
    const currentFirstRow = rows[page * PAGE_SIZE] || rows[0];
    const currentDate = new Date(currentFirstRow.start_date);

    if (isNaN(currentDate.getTime())) {
      const newPage = Math.max(0, Math.min(totalPages - 1, page + Math.sign(yearsToAdd) * 5));
      setPage(newPage);
      setSelectedIdx(newPage * PAGE_SIZE);
      return;
    }

    currentDate.setFullYear(currentDate.getFullYear() + yearsToAdd);
    const targetTime = currentDate.getTime();

    let closestIdx = 0;
    let minDiff = Infinity;

    for (let i = 0; i < rows.length; i++) {
      const d = new Date(rows[i].start_date);
      if (!isNaN(d.getTime())) {
        const diff = Math.abs(d.getTime() - targetTime);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      }
    }

    const newPage = Math.floor(closestIdx / PAGE_SIZE);
    setPage(newPage);
    setSelectedIdx(closestIdx);
  };

  const nextMarriageRow = rows.slice(currentIdx).find(r => r.marriage_favorable);
  const getUpcomingWindows = () => {
    const list = [];
    const seenChains = new Set();
    for (let i = currentIdx; i < rows.length; i++) {
      const r = rows[i];
      if (r.marriage_favorable) {
        const key = `${r.md}-${r.ad}`;
        if (!seenChains.has(key)) {
          seenChains.add(key);
          list.push({ ...r, index: i });
          if (list.length >= 3) break;
        }
      }
    }
    return list;
  };
  const upcomingWindows = getUpcomingWindows();

  const handlePageChange = (updater) => {
    setPage(prev => {
      const newPage = typeof updater === 'function' ? updater(prev) : updater;
      if (newPage !== prev) {
        setSelectedIdx(newPage * PAGE_SIZE);
      }
      return newPage;
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-rose-50/50 font-sans min-h-[350px]">
        <Header page={page} totalPages={totalPages} onPrev={() => {}} onNext={() => {}} onCurrent={() => {}} levels={levels} onLevelsChange={setLevels} />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            <p className="text-sm text-slate-600 font-serif italic">दशा गणना हो रही है...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-white font-sans min-h-[350px]">
        <Header page={page} totalPages={totalPages} onPrev={() => {}} onNext={() => {}} onCurrent={() => {}} levels={levels} onLevelsChange={setLevels} />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col h-full bg-white font-serif overflow-hidden select-none"
      style={{ fontFamily: "'Times New Roman', Times, serif" }}
    >
      <Header
        page={page}
        totalPages={totalPages}
        onPrev={() => handlePageChange(p => Math.max(0, p - 1))}
        onNext={() => handlePageChange(p => Math.min(totalPages - 1, p + 1))}
        onFirst={() => jumpTime(-1)}
        onLast={() => jumpTime(1)}
        onCurrent={goToCurrent}
        rowCount={rows.length}
        levels={levels}
        onLevelsChange={setLevels}
      />

      {!hideMarriageDasha && nextMarriageRow && (
        <div className="shrink-0 bg-pink-50 border-b border-pink-100 px-3 py-2 flex items-center justify-between text-xs text-pink-900 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="text-sm">💍</span>
            <span>
              {nextMarriageRow.is_current
                ? <strong>Active Marriage Dasha!</strong>
                : <span>Next Marriage Dasha:</span>}
              {' '}{nextMarriageRow.dasha_chain} starting at age <strong>{nextMarriageRow.age}</strong> ({nextMarriageRow.start_date})
            </span>
          </span>
          <button
            onClick={() => setShowWindowsModal(true)}
            className="text-[10px] font-black uppercase tracking-wider text-pink-700 bg-pink-200/70 hover:bg-pink-200 px-2.5 py-1 rounded-lg transition border border-pink-300"
          >
            Show Windows
          </button>
        </div>
      )}

      {/* Column Headers */}
      <div className="shrink-0 grid grid-cols-[2.0fr_0.35fr_0.9fr_0.5fr_0.8fr_0.75fr_1.5fr] bg-indigo-100 text-slate-900 text-[11px] font-black uppercase whitespace-nowrap border-b border-slate-700">
        <div className="px-2 py-1.5 border-r border-slate-400">दशाएँ</div>
        <div className="px-1 py-1.5 border-r border-slate-400 text-center">उम्र</div>
        <div className="px-1.5 py-1.5 border-r border-slate-400 text-center">आरम्भ दिनांक</div>
        <div className="px-1 py-1.5 border-r border-slate-400 text-center">समय</div>
        <div className="px-1.5 py-1.5 border-r border-slate-400 text-center">नक्षत्र दूरी</div>
        <div className="px-1 py-1.5 border-r border-slate-400 text-center">राशि दूरी</div>
        <div className="px-1.5 py-1.5 text-center">गोचर में दशा स्वामी</div>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {pageRows.map((row, i) => {
          const globalIdx = page * PAGE_SIZE + i;
          const isCurrent = row.is_current;
          const isSelected = globalIdx === selectedIdx;
          const tColors = TARA_COLORS[row.tara_name] || { bg: '', text: 'text-slate-600', badge: 'bg-slate-100' };
          const mdColor = PLANET_COLORS[row.md] || '#666';

          return (
            <div
              key={globalIdx}
              ref={isCurrent ? currentRowRef : null}
              onClick={() => setSelectedIdx(globalIdx)}
              className={`grid grid-cols-[2.0fr_0.35fr_0.9fr_0.5fr_0.8fr_0.75fr_1.5fr] text-[13px] sm:text-[14px] border-b border-slate-200 transition-colors cursor-pointer
                ${isSelected
                  ? 'bg-blue-100/90 font-medium'
                  : isCurrent
                    ? 'bg-amber-100/90 font-medium'
                    : i % 2 === 0 ? 'bg-rose-50/40 hover:bg-indigo-50/50' : 'bg-white hover:bg-indigo-50/50'
                }`}
            >
              {/* Dasha Chain */}
              <div className="px-2 py-1.5 flex items-center gap-1.5 border-r border-slate-200 overflow-hidden">
                <div className="w-1.5 h-full min-h-[14px] rounded-full shrink-0" style={{ backgroundColor: mdColor }}></div>
                <span className="font-bold text-slate-800 truncate tracking-tight leading-tight" title={row.dasha_chain}>
                  {row.dasha_chain}
                </span>
                {row.marriage_favorable && (
                  <span className="shrink-0 text-[10px]" title="Favorable Marriage Period">💍</span>
                )}
                {isCurrent && (
                  <span className="ml-auto shrink-0 text-[10px] bg-amber-500 text-white px-1.5 py-0.2 rounded-full font-black">वर्तमान</span>
                )}
              </div>
              {/* Age */}
              <div className="px-1 py-1.5 text-center font-bold text-slate-900 border-r border-slate-200">{row.age}</div>
              {/* Start Date */}
              <div className="px-1.5 py-1.5 font-mono text-indigo-900 font-semibold text-center whitespace-nowrap border-r border-slate-200">{row.start_date}</div>
              {/* Time */}
              <div className="px-1 py-1.5 text-center font-mono text-slate-800 border-r border-slate-200 text-xs">{row.start_time}</div>
              {/* Nakshatra Distance */}
              <div className="px-1 py-1.5 border-r border-slate-200 flex flex-row items-center justify-center gap-1.5">
                <span className={`text-[13px] font-black ${tColors.text}`}>{row.nak_distance ?? row.tara_num}</span>
                <span className={`text-[11px] font-bold leading-none ${tColors.text} opacity-90 truncate max-w-full`}>{row.tara_name}</span>
              </div>
              {/* Rashi Distance */}
              <div className="px-1 py-1.5 text-center font-black text-slate-700 border-r border-slate-200">{row.rashi_distance}</div>
              {/* Gochar */}
              <div className="px-1.5 py-1.5 text-center text-slate-800 font-mono text-[11px] leading-tight whitespace-nowrap overflow-hidden text-ellipsis">{row.gochar}</div>
            </div>
          );
        })}

        {pageRows.length === 0 && (
          <div className="flex items-center justify-center h-28 text-xs text-slate-400 italic">
            इस समय के आसपास कोई दशा पंक्ति नहीं मिली।
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 px-3 py-1.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
        <p className="text-[10px] sm:text-[11px] text-slate-600 italic font-serif">
          {levels === 1 ? `एकस्तरीय विंशोत्तरी दशा · महादशा स्तर · ${rows.length} पंक्तियाँ` :
            levels === 2 ? `द्विस्तरीय विंशोत्तरी दशा · महादशा - अंतरदशा स्तर · ${rows.length} पंक्तियाँ` :
              levels === 3 ? `त्रिस्तरीय विंशोत्तरी दशा · प्रत्यंतर दशा स्तर · ${rows.length} पंक्तियाँ` :
                levels === 4 ? `चतुःस्तरीय विंशोत्तरी दशा · सूक्ष्म दशा स्तर · ${rows.length} पंक्तियाँ` :
                  `पंचस्तरीय विंशोत्तरी दशा · प्राण दशा स्तर · ${rows.length} पंक्तियाँ`}
        </p>
        <p className="text-[11px] text-slate-700 font-mono font-bold">
          पृष्ठ {page + 1} / {totalPages || 1}
        </p>
      </div>

      {showWindowsModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative border border-slate-200">
            <button
              onClick={() => setShowWindowsModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition text-lg"
            >
              ✕
            </button>
            <h4 className="text-lg font-serif italic font-bold text-slate-900 mb-2 flex items-center gap-2">
              <span>💍</span> Favorable Marriage Windows
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Next upcoming favorable Vimshottari dasha periods for marriage:
            </p>

            <div className="space-y-2.5 mb-4 max-h-60 overflow-y-auto pr-1">
              {upcomingWindows.map((win, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 flex items-center justify-between hover:border-pink-200 hover:bg-pink-50/20 transition">
                  <div>
                    <span className="text-[10px] font-black text-pink-600 uppercase tracking-wider block mb-0.5">
                      Window #{idx + 1} {win.is_current && "(Active)"}
                    </span>
                    <span className="text-sm font-bold text-slate-800 block">
                      {win.dasha_chain}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Age {win.age} · {win.start_date}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setPage(Math.floor(win.index / PAGE_SIZE));
                      setShowWindowsModal(false);
                    }}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-pink-600 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    Jump
                  </button>
                </div>
              ))}
              {upcomingWindows.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-4">No upcoming favorable marriage windows found in this sequence.</p>
              )}
            </div>

            <button
              onClick={() => setShowWindowsModal(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Header({ page, totalPages, onPrev, onNext, onFirst, onLast, rowCount, levels, onLevelsChange, onCurrent }) {
  const levelNames = {
    1: "महादशा",
    2: "महादशा - अंतरदशा",
    3: "त्रिस्तरीय · Dasha",
    4: "चतुःस्तरीय · Dasha",
    5: "पंचस्तरीय · Dasha"
  };

  return (
    <div className="shrink-0 flex items-center justify-between px-3 py-2 bg-indigo-100/90 border-b border-slate-400 flex-wrap gap-2">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center text-white text-[10px] font-black shadow-xs">⏳</div>
        <span className="text-black text-sm font-bold font-serif tracking-wider uppercase">विंशोत्तरी</span>
        {rowCount > 0 && (
          <span className="text-xs text-indigo-900 font-bold bg-white/80 px-2 py-0.5 rounded-full border border-indigo-200">
            {levelNames[levels]}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Levels Selector Switch */}
        <div className="flex items-center rounded-lg border border-indigo-300 overflow-hidden bg-white shadow-xs">
          <button
            onClick={() => onLevelsChange && onLevelsChange(Math.max(1, levels - 1))}
            disabled={levels <= 1}
            className="px-2.5 py-0.5 text-slate-700 hover:bg-slate-100 disabled:opacity-30 border-r border-indigo-200 text-sm font-bold"
            title="Decrease Depth"
          >
            -
          </button>
          <span className="px-2 text-xs font-bold text-slate-700 select-none">L{levels}</span>
          <button
            onClick={() => onLevelsChange && onLevelsChange(Math.min(5, levels + 1))}
            disabled={levels >= 5}
            className="px-2.5 py-0.5 text-slate-700 hover:bg-slate-100 disabled:opacity-30 border-l border-indigo-200 text-sm font-bold"
            title="Increase Depth"
          >
            +
          </button>
        </div>

        {/* Current Button */}
        {onCurrent && (
          <button
            onClick={onCurrent}
            className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-bold shadow-xs transition"
            title="वर्तमान दशा पर जाएं"
          >
            वर्तमान
          </button>
        )}

        <div className="flex items-center gap-1">
          <NavBtn onClick={onFirst} title="-1 वर्ष" disabled={page === 0}>⟪</NavBtn>
          <NavBtn onClick={onPrev} title="पिछला" disabled={page === 0}>◀</NavBtn>
          <NavBtn onClick={onNext} title="अगला" disabled={page >= totalPages - 1}>▶</NavBtn>
          <NavBtn onClick={onLast} title="+1 वर्ष" disabled={page >= totalPages - 1}>⟫</NavBtn>
        </div>
      </div>
    </div>
  );
}

function NavBtn({ onClick, children, disabled, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black transition shadow-xs
        ${disabled
          ? 'bg-white/50 text-slate-300 cursor-not-allowed'
          : 'bg-white text-slate-800 hover:bg-indigo-600 hover:text-white active:scale-95 border border-slate-200'
        }`}
    >
      {children}
    </button>
  );
}
