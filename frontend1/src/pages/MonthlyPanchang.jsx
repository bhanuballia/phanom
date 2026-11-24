import { PYTHON_ASTRO_URL } from '../services/api';
import React, { useState, useEffect, useRef } from 'react';
import Navigation from '../components/Navigation';
import { TamilCalendarView } from '../components/TamilCalendarView';
import { MalayalamCalendarView } from '../components/MalayalamCalendarView';
import { TeluguCalendarView } from '../components/TeluguCalendarView';
import { Calendar, RefreshCw, Printer, Sparkles, ChevronLeft, ChevronRight, ChevronDown, Compass, ShieldAlert, Award, Heart, Home, Car, Briefcase, Baby, Scissors, Clock, BookOpen } from 'lucide-react';
import axios from 'axios';

// Vedic Astrology Python backend port is 8000
const PYTHON_BACKEND_URL = PYTHON_ASTRO_URL.includes('/api/kundali') ? `${PYTHON_ASTRO_URL}/panchang/monthly-sheet` : `${PYTHON_ASTRO_URL}/api/panchang/monthly-sheet`;

const RASHI_OPTIONS = [
  'मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या',
  'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'
];

// Component to render North Indian Diamond Kundali SVG
const NorthIndianDiamondChart = ({ chartData, title }) => {
  if (!chartData || !chartData.houses) return null;

  // Diamond chart helper - Houses 1 to 12 coordinates in North Indian format
  const getHouseTextPos = (hNum) => {
    switch (hNum) {
      case 1: return { x: 150, y: 80 };
      case 2: return { x: 75, y: 40 };
      case 3: return { x: 38, y: 75 };
      case 4: return { x: 80, y: 150 };
      case 5: return { x: 38, y: 225 };
      case 6: return { x: 75, y: 260 };
      case 7: return { x: 150, y: 220 };
      case 8: return { x: 225, y: 260 };
      case 9: return { x: 262, y: 225 };
      case 10: return { x: 220, y: 150 };
      case 11: return { x: 262, y: 75 };
      case 12: return { x: 225, y: 40 };
      default: return { x: 150, y: 150 };
    }
  };

  return (
    <div className="flex flex-col items-center bg-white/95 p-2.5 rounded-xl border border-amber-900/20 shadow-xs w-full overflow-hidden">
      <h4 className="text-xs font-bold text-amber-950 mb-1.5 text-center truncate max-w-full">{title}</h4>
      <div className="w-full max-w-[240px] aspect-square relative">
        <svg viewBox="0 0 300 300" className="w-full h-full stroke-amber-900" strokeWidth="1.5" fill="none">
          {/* Outer Border */}
          <rect x="2" y="2" width="296" height="296" className="stroke-amber-900" strokeWidth="2" fill="#fffdfa" />
          {/* Diagonal Cross */}
          <line x1="2" y1="2" x2="298" y2="298" />
          <line x1="298" y1="2" x2="2" y2="298" />
          {/* Inner Diamond */}
          <polygon points="150,2 298,150 150,298 2,150" />

          {/* Render Houses Labels & Planets */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => {
            const hData = chartData.houses[String(h)] || {};
            const pos = getHouseTextPos(h);
            return (
              <g key={h}>
                {/* Sign Index Number */}
                <text
                  x={pos.x}
                  y={pos.y - 12}
                  textAnchor="middle"
                  className="text-[13px] font-semibold fill-amber-700/80 select-none"
                  stroke="none"
                >
                  {hData.sign_index || h}
                </text>
                {/* Planets in house */}
                {hData.planets && hData.planets.map((planet, idx) => (
                  <text
                    key={idx}
                    x={pos.x}
                    y={pos.y + 4 + idx * 13}
                    textAnchor="middle"
                    className="text-[14px] font-extrabold fill-red-800 select-none"
                    stroke="none"
                  >
                    {planet}
                  </text>
                ))}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="text-[11px] text-amber-900/90 font-medium mt-1 text-center">
        लग्न: <span className="font-bold text-red-700 text-xs">{chartData.ascendant_sign || 'कन्या'}</span> | सूर्योदय: {chartData.sunrise}
      </div>
    </div>
  );
};

const MonthlyPanchang = () => {
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1); // 1-12 based current month
  const [selectedRashi, setSelectedRashi] = useState('मकर');
  const [selectedOccasion, setSelectedOccasion] = useState('all');
  const [activeCalendarView, setActiveCalendarView] = useState('vedic'); // 'vedic' | 'tamil' | 'malayalam' | 'telugu'
  const [calendarDropdownOpen, setCalendarDropdownOpen] = useState(false);
  const calendarDropdownRef = useRef(null);
  const [muhurtDropdownOpen, setMuhurtDropdownOpen] = useState(false);
  const muhurtDropdownRef = useRef(null);
  const muhurtSectionRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [panchangData, setPanchangData] = useState(null);

  const monthsList = [
    { num: 1, name: 'जनवरी (January)' },
    { num: 2, name: 'फरवरी (February)' },
    { num: 3, name: 'मार्च (March)' },
    { num: 4, name: 'अप्रैल (April)' },
    { num: 5, name: 'मई (May)' },
    { num: 6, name: 'जून (June)' },
    { num: 7, name: 'जुलाई (July)' },
    { num: 8, name: 'अगस्त (August)' },
    { num: 9, name: 'सितंबर (September)' },
    { num: 10, name: 'अक्टूबर (October)' },
    { num: 11, name: 'नवंबर (November)' },
    { num: 12, name: 'दिसंबर (December)' }
  ];

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.get(PYTHON_BACKEND_URL, {
        params: {
          year,
          month,
          rashi: selectedRashi,
          lat: 28.6139,
          lon: 77.2090
        }
      });
      setPanchangData(resp.data);
    } catch (err) {
      console.error('Failed to load monthly panchang sheet:', err);
      setError('पंचांग डेटा लोड करने में असमर्थ। कृपया सुनिश्चित करें कि बैकएंड सर्वर सक्रिय है।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [year, month, selectedRashi]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (muhurtDropdownRef.current && !muhurtDropdownRef.current.contains(e.target)) {
        setMuhurtDropdownOpen(false);
      }
      if (calendarDropdownRef.current && !calendarDropdownRef.current.contains(e.target)) {
        setCalendarDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectMuhurt = (occasionId) => {
    setSelectedOccasion(occasionId);
    setMuhurtDropdownOpen(false);
    if (muhurtSectionRef.current) {
      muhurtSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#f7f3eb] text-gray-900 pb-16 font-sans">
      <Navigation />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        {/* Controls Bar */}
        <div className="no-print bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 mb-6 border border-amber-900/10 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-800 rounded-xl shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-cinzel text-amber-950 leading-tight">मासिक वैदिक पंचांग पत्रक</h2>
              <p className="text-[11px] sm:text-xs text-amber-900/70">पारंपरिक हिंदू पंचांग एवं ग्रह गोचर गणना</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Year Selector */}
            <div className="flex items-center gap-1 bg-amber-50/90 px-2 py-1.5 rounded-xl border border-amber-200 shadow-2xs">
              <button
                onClick={() => setYear(y => y - 1)}
                className="p-1 hover:bg-amber-200/60 rounded-lg text-amber-900 transition-colors"
                title="पिछला वर्ष"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-xs sm:text-sm px-2 text-amber-950 min-w-[42px] text-center">{year}</span>
              <button
                onClick={() => setYear(y => y + 1)}
                className="p-1 hover:bg-amber-200/60 rounded-lg text-amber-900 transition-colors"
                title="अगला वर्ष"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Month Dropdown */}
            <div className="relative">
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="appearance-none bg-amber-50/90 border border-amber-200 text-amber-950 text-xs sm:text-sm font-semibold rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs cursor-pointer hover:bg-amber-100/60 transition-colors"
              >
                {monthsList.map(m => (
                  <option key={m.num} value={m.num}>{m.name}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-amber-800 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Rashi Selector */}
            <div className="relative">
              <select
                value={selectedRashi}
                onChange={(e) => setSelectedRashi(e.target.value)}
                className="appearance-none bg-amber-50/90 border border-amber-200 text-amber-950 text-xs sm:text-sm font-semibold rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs cursor-pointer hover:bg-amber-100/60 transition-colors"
              >
                {RASHI_OPTIONS.map(r => (
                  <option key={r} value={r}>{r} राशि फल</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-amber-800 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Muhurt Dropdown Tab */}
            <div className="relative" ref={muhurtDropdownRef}>
              <button
                type="button"
                onClick={() => setMuhurtDropdownOpen(prev => !prev)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-2xs border ${muhurtDropdownOpen || selectedOccasion !== 'all'
                    ? 'bg-red-800 text-white border-red-900 shadow-xs ring-2 ring-red-400/40'
                    : 'bg-amber-100/90 hover:bg-amber-200 text-amber-950 border-amber-300'
                  }`}
              >
                <Clock className="w-4 h-4 text-amber-300" />
                <span>
                  {selectedOccasion === 'all'
                    ? 'मुहूर्त (Muhurt)'
                    : selectedOccasion === 'vivah'
                      ? 'विवाह'
                      : selectedOccasion === 'griha'
                        ? 'गृह प्रवेश'
                        : selectedOccasion === 'vahan'
                          ? 'वाहन क्रय'
                          : selectedOccasion === 'vyapar'
                            ? 'व्यापार'
                            : selectedOccasion === 'namakaran'
                              ? 'नामकरण'
                              : selectedOccasion === 'mundan'
                                ? 'मुंडन'
                                : 'मुहूर्त'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${muhurtDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {muhurtDropdownOpen && (
                <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-72 max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-amber-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3.5 py-2 border-b border-amber-100 flex items-center justify-between bg-amber-50/50 rounded-t-xl">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      शुभ मुहूर्त अवसर
                    </span>
                    <span className="text-[10px] text-red-800 bg-red-100/80 px-2 py-0.5 rounded-full font-bold">
                      {panchangData ? `${panchangData.month_name} ${panchangData.year}` : ''}
                    </span>
                  </div>

                  <div className="py-1 max-h-[360px] overflow-y-auto">
                    {[
                      { id: 'all', label: 'सभी मुहूर्त (All Muhurats)', icon: Sparkles, count: null, color: 'text-amber-800' },
                      {
                        id: 'vivah',
                        label: 'विवाह मुहूर्त (Marriage)',
                        icon: Heart,
                        count: panchangData?.muhurats?.vivah_details?.dates?.length ?? 0,
                        color: 'text-rose-600'
                      },
                      {
                        id: 'griha',
                        label: 'गृह प्रवेश (Griha Pravesh)',
                        icon: Home,
                        count: panchangData?.muhurats?.griha_pravesh_details?.dates?.length ?? 0,
                        color: 'text-amber-700'
                      },
                      {
                        id: 'vahan',
                        label: 'वाहन क्रय (Vehicle Purchase)',
                        icon: Car,
                        count: panchangData?.muhurats?.vahan_details?.dates?.length ?? 0,
                        color: 'text-blue-600'
                      },
                      {
                        id: 'vyapar',
                        label: 'व्यापार आरम्भ (Business / Shop)',
                        icon: Briefcase,
                        count: panchangData?.muhurats?.vyapar_details?.dates?.length ?? 0,
                        color: 'text-emerald-600'
                      },
                      {
                        id: 'namakaran',
                        label: 'नामकरण संस्कार (Naming)',
                        icon: Baby,
                        count: panchangData?.muhurats?.namakaran_details?.dates?.length ?? 0,
                        color: 'text-purple-600'
                      },
                      {
                        id: 'mundan',
                        label: 'मुंडन संस्कार (Tonsure)',
                        icon: Scissors,
                        count: panchangData?.muhurats?.mundan_details?.dates?.length ?? 0,
                        color: 'text-orange-600'
                      }
                    ].map(item => {
                      const Icon = item.icon;
                      const isSelected = selectedOccasion === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectMuhurt(item.id)}
                          className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-amber-50/80 transition-colors text-xs font-semibold ${isSelected ? 'bg-amber-100/80 text-red-950 font-bold border-l-4 border-red-700 pl-2.5' : 'text-gray-700'
                            }`}
                        >
                          <span className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 shrink-0 ${item.color}`} />
                            <span className="truncate">{item.label}</span>
                          </span>
                          {item.count !== null && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${item.count > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-400'
                              }`}>
                              {item.count > 0 ? `${item.count} दिन` : '—'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Calendar View Dropdown (Vedic / Tamil / Malayalam) */}
            <div className="relative" ref={calendarDropdownRef}>
              <button
                type="button"
                onClick={() => setCalendarDropdownOpen(prev => !prev)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-2xs border ${activeCalendarView === 'tamil'
                    ? 'bg-orange-700 text-white border-orange-800 shadow-xs ring-2 ring-orange-400/40'
                    : activeCalendarView === 'malayalam'
                      ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs ring-2 ring-emerald-400/40'
                      : 'bg-amber-50/90 hover:bg-amber-100/90 text-amber-950 border-amber-200'
                  }`}
              >
                <BookOpen className={`w-4 h-4 ${activeCalendarView === 'malayalam' ? 'text-emerald-300' : 'text-orange-600'}`} />
                <span>
                  {activeCalendarView === 'tamil'
                    ? 'தமிழ் நாட்காட்டி (Tamil)'
                    : activeCalendarView === 'malayalam'
                      ? 'മലയാളം കലണ്ടർ (Malayalam)'
                      : activeCalendarView === 'telugu'
                        ? 'తెలుగు క్యాలెండర్ (Telugu)'
                        : 'वैदिक पंचांग (Vedic)'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${calendarDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {calendarDropdownOpen && (
                <div className="absolute right-0 sm:left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-amber-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3.5 py-1.5 border-b border-amber-100 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    పంచాంగం / പഞ്ചാംഗം / நாட்காட்டி / पंचांग தேர்வு
                  </div>
                  <button
                    onClick={() => {
                      setActiveCalendarView('vedic');
                      setCalendarDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold hover:bg-amber-50 transition-colors ${activeCalendarView === 'vedic' ? 'bg-amber-100/70 text-red-950 font-bold border-l-4 border-red-700' : 'text-gray-700'
                      }`}
                  >
                    <div>
                      <div className="font-bold">वैदिक मासिक पंचांग (Vedic)</div>
                      <div className="text-[10px] text-gray-500 font-normal">उत्तर एवं मध्य भारतीय संवत पद्धति</div>
                    </div>
                    {activeCalendarView === 'vedic' && <Sparkles className="w-4 h-4 text-amber-600" />}
                  </button>

                  <button
                    onClick={() => {
                      setActiveCalendarView('tamil');
                      setCalendarDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold hover:bg-orange-50 transition-colors ${activeCalendarView === 'tamil' ? 'bg-orange-100/80 text-orange-950 font-bold border-l-4 border-orange-700' : 'text-gray-700'
                      }`}
                  >
                    <div>
                      <div className="font-bold text-orange-950">தமிழ் நாட்காட்டி (Tamil Calendar)</div>
                      <div className="text-[10px] text-orange-800/80 font-normal">சித்திரை முதல் பங்குனி வரை, நல்ல நேரம்</div>
                    </div>
                    {activeCalendarView === 'tamil' && <Sparkles className="w-4 h-4 text-orange-600" />}
                  </button>

                  <button
                    onClick={() => {
                      setActiveCalendarView('malayalam');
                      setCalendarDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold hover:bg-emerald-50 transition-colors ${activeCalendarView === 'malayalam' ? 'bg-emerald-100/80 text-emerald-950 font-bold border-l-4 border-emerald-700' : 'text-gray-700'
                      }`}
                  >
                    <div>
                      <div className="font-bold text-emerald-950">മലയാളം കലണ്ടർ (Malayalam Calendar)</div>
                      <div className="text-[10px] text-emerald-800/80 font-normal">കൊല്ലവർഷം, ചിങ്ങം മുതൽ കർക്കടകം, വിഷു, ഓണം</div>
                    </div>
                    {activeCalendarView === 'malayalam' && <Sparkles className="w-4 h-4 text-emerald-600" />}
                  </button>

                  <button
                    onClick={() => {
                      setActiveCalendarView('telugu');
                      setCalendarDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold hover:bg-purple-50 transition-colors ${activeCalendarView === 'telugu' ? 'bg-purple-100/80 text-purple-950 font-bold border-l-4 border-purple-700' : 'text-gray-700'
                      }`}
                  >
                    <div>
                      <div className="font-bold text-purple-950">తెలుగు క్యాలెండర్ (Telugu Calendar)</div>
                      <div className="text-[10px] text-purple-800/80 font-normal">చాంద్రమానం, ఉగాది, బోనాలు, బతుకమ్మ, సంక్రాంతి</div>
                    </div>
                    {activeCalendarView === 'telugu' && <Sparkles className="w-4 h-4 text-purple-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* Google / Drik Panchang Standard Dates Badge */}
            <div className="hidden sm:flex items-center gap-1.5 bg-blue-50/90 text-blue-900 border border-blue-200 px-3 py-2 rounded-xl text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span>Astroo Consult प्रमाणित</span>
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-amber-700 hover:bg-amber-800 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow transition"
              title="पंचांग प्रिंट करें"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden xs:inline">प्रिंट</span>
            </button>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="flex flex-col items-center justify-center p-20 bg-white/60 rounded-3xl border border-amber-900/10">
            <RefreshCw className="w-10 h-10 text-amber-700 animate-spin mb-4" />
            <p className="text-base font-semibold text-amber-950">वैदिक पंचांग एवं गोचर कुंडली तैयार हो रही है...</p>
            <p className="text-xs text-amber-800/70 mt-1">ग्रह गणना एवं शुभ मुहूर्त संकलित हो रहे हैं</p>
          </div>
        )}

        {error && (
          <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-center font-medium">
            {error}
          </div>
        )}

        {/* The Authentic 3-Column Panchang Sheet OR Tamil / Malayalam / Telugu Calendar View */}
        {!loading && (
          activeCalendarView === 'tamil' ? (
            <TamilCalendarView year={year} month={month} />
          ) : activeCalendarView === 'malayalam' ? (
            <MalayalamCalendarView year={year} month={month} />
          ) : activeCalendarView === 'telugu' ? (
            <TeluguCalendarView year={year} month={month} />
          ) : (
            panchangData && (
              <div className="panchang-sheet-root bg-[#fffefb] border-2 border-amber-950/40 rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8">

                {/* Top Sheet Header */}
                <div className="border-b-2 border-red-800/30 pb-5 mb-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-center md:text-left">
                      <div className="inline-block bg-red-800 text-white text-[11px] font-bold px-3 py-0.5 rounded-full mb-1">
                        श्री शुभ संवत
                      </div>
                      <h1 className="text-3xl md:text-4xl font-extrabold text-red-900 tracking-wide font-cinzel">
                        {panchangData.sheet_title || `पंचांग ${year}`}
                      </h1>
                      <p className="text-sm font-bold text-amber-950 mt-1">
                        {panchangData.month_hindi || `${panchangData.month_name} ${year}`}
                      </p>
                    </div>

                    {/* Top Banner: Rashi Phal */}
                    <div className="flex-1 max-w-2xl bg-amber-50/90 border border-amber-900/25 rounded-2xl p-4 shadow-xs">
                      <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-red-800 text-white text-xs font-bold px-2.5 py-0.5 rounded-md shadow-2xs">
                            {panchangData.rashi_phal?.rashi || selectedRashi} में मासिक राशिफल
                          </span>
                          <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
                        </div>
                        <span className="text-[11px] font-semibold text-amber-900/80 bg-amber-100/70 px-2 py-0.5 rounded-full border border-amber-200">
                          ग्रह गोचर आधारित विश्लेषण
                        </span>
                      </div>
                      <p className="text-xs sm:text-[13px] text-gray-900 leading-relaxed font-normal">
                        {panchangData.rashi_phal?.forecast}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3-Column Grid Layout Matching The Printed Sheet */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

                  {/* Column 1 (Left): व्रत, पर्व एवं त्यौहार (Width: 3.5 cols) */}
                  <div className="lg:col-span-3 xl:col-span-3 bg-amber-50/40 border border-amber-900/20 rounded-2xl p-3 shadow-xs">
                    <div className="bg-red-800 text-white text-center py-1.5 px-3 rounded-xl font-bold text-xs tracking-wide shadow-sm mb-2.5">
                      व्रत पर्व एवं त्यौहार
                    </div>

                    <div className="space-y-2 max-h-[950px] overflow-y-auto pr-1 text-xs">
                      {panchangData.vrat_parva_tyohar?.map((item, idx) => (
                        <div key={idx} className="p-2 bg-white rounded-lg border border-amber-900/15 shadow-2xs hover:border-amber-600 transition">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <h1 className="font-bold text-red-900 text-[12px] bg-red-100/70 px-1.5 py-0.2 rounded font-mono">
                              {item.day_num ? String(item.day_num).padStart(2, '0') : item.date}
                            </h1>
                            {item.day && (
                              <span className="text-[12px] text-amber-900 font-bold">
                                {item.day}
                              </span>
                            )}
                            {item.tithi && (
                              <span className="text-[12px] text-red-700 font-medium ml-auto">
                                {item.tithi}
                              </span>
                            )}
                          </div>
                          <div className="font-bold text-gray-900 text-[11.5px] leading-snug">
                            {item.title}
                          </div>
                          {item.description && (
                            <p className="text-[10.5px] text-gray-900 mt-0.5 leading-tight font-normal">
                              {item.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 2 (Center): Kundali Charts + Graha Sthiti + Muhurats (Width: 5.5 cols) */}
                  <div className="lg:col-span-5 xl:col-span-5 space-y-4">
                    {/* 1st & 15th Sunrise Gochar Kundalis */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <NorthIndianDiamondChart
                        chartData={panchangData.kundali_charts?.chart_01}
                        title="01 तारीख को सूर्योदयकालीन कुंडली"
                      />
                      <NorthIndianDiamondChart
                        chartData={panchangData.kundali_charts?.chart_15}
                        title="15 तारीख को सूर्योदयकालीन कुंडली"
                      />
                    </div>

                    {/* Graha Sthiti Table */}
                    <div className="bg-white rounded-2xl border border-amber-900/20 p-3.5 shadow-xs overflow-hidden">
                      <h4 className="text-center font-bold text-sm text-red-900 mb-2.5">
                        ग्रह स्थिति सारणी
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs sm:text-[12.5px] text-left">
                          <thead>
                            <tr className="border-b border-amber-900/20 text-amber-950 font-bold bg-amber-50/70">
                              <th className="py-1.5 px-2">ग्रह</th>
                              <th className="py-1.5 px-2">राशि</th>
                              <th className="py-1.5 px-2">अंश</th>
                              <th className="py-1.5 px-2">गति</th>
                              <th className="py-1.5 px-2">अवस्था</th>
                            </tr>
                          </thead>
                          <tbody>
                            {panchangData.graha_sthiti_table?.map((g, idx) => (
                              <tr key={idx} className="border-b border-gray-100 hover:bg-amber-50/30">
                                <td className="py-1.5 px-2 font-extrabold text-red-900">{g.graha}</td>
                                <td className="py-1.5 px-2 font-medium text-gray-800">{g.rashi}</td>
                                <td className="py-1.5 px-2 font-mono text-gray-700 font-semibold">{g.degrees}</td>
                                <td className="py-1.5 px-2">
                                  <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${g.gati === 'वक्री' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {g.gati}
                                  </span>
                                </td>
                                <td className="py-1.5 px-2 font-medium text-gray-700">{g.avastha}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Muhurats Section */}
                    <div ref={muhurtSectionRef} className="bg-amber-50/60 border border-amber-900/20 rounded-2xl p-3.5 shadow-xs scroll-mt-28">
                      <div className="bg-red-900 text-white text-center py-1.5 rounded-lg text-xs font-bold mb-2.5 shadow-sm">
                        {panchangData.month_name} {panchangData.year} विभिन्न शुभ मुहूर्त
                      </div>

                      {/* Occasion Switcher Tabs */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {[
                          { id: 'all', label: 'सभी (All)', icon: Sparkles },
                          { id: 'vivah', label: 'विवाह', icon: Heart },
                          { id: 'griha', label: 'गृह प्रवेश', icon: Home },
                          { id: 'vahan', label: 'वाहन क्रय', icon: Car },
                          { id: 'vyapar', label: 'व्यापार', icon: Briefcase },
                          { id: 'namakaran', label: 'नामकरण', icon: Baby },
                          { id: 'mundan', label: 'मुंडन', icon: Scissors }
                        ].map(tab => {
                          const Icon = tab.icon;
                          const isActive = selectedOccasion === tab.id;
                          return (
                            <button
                              key={tab.id}
                              onClick={() => setSelectedOccasion(tab.id)}
                              className={`text-[10px] px-2 py-1 rounded-full font-semibold transition-all flex items-center gap-1 border ${isActive
                                  ? 'bg-red-800 text-white border-red-900 shadow-xs'
                                  : 'bg-white/90 text-amber-900 border-amber-300/80 hover:bg-amber-100/70'
                                }`}
                            >
                              <Icon className="w-2.5 h-2.5" />
                              {tab.label}
                            </button>
                          );
                        })}
                      </div>

                      <div className="space-y-3 text-xs max-h-[500px] overflow-y-auto pr-0.5">
                        {/* 1. विवाह मुहूर्त (Vivah) */}
                        {(selectedOccasion === 'all' || selectedOccasion === 'vivah') && (
                          <div className="bg-white/80 p-2.5 rounded-xl border border-rose-200/90 shadow-2xs">
                            <div className="font-bold text-red-950 text-[11.5px] flex items-center justify-between pb-1 border-b border-rose-100">
                              <span className="flex items-center gap-1 text-red-900">
                                <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-500" />
                                विवाह मुहूर्त (Marriage)
                              </span>
                              <span className="text-[10px] text-red-700 bg-rose-50 px-1.5 py-0.5 rounded font-medium">
                                {panchangData.muhurats?.vivah_details?.dates?.length || 0} दिन
                              </span>
                            </div>

                            {panchangData.muhurats?.vivah_details?.has_muhurat && panchangData.muhurats?.vivah_details?.dates?.length > 0 ? (
                              <div className="mt-1.5 space-y-1.5">
                                {panchangData.muhurats.vivah_details.dates.map((item, idx) => (
                                  <div key={idx} className="bg-rose-50/40 border border-rose-200/60 rounded-lg p-2 text-[11px]">
                                    <div className="font-bold text-red-950 flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 inline-block"></span>
                                      {item.date_str}
                                    </div>
                                    <div className="text-gray-800 font-medium pl-2.5 mt-0.5">
                                      <span className="text-amber-950 font-semibold">Timing: </span>
                                      {item.timing}
                                    </div>
                                    {item.nakshatra && (
                                      <div className="text-[10.5px] text-gray-600 pl-2.5">
                                        <span className="text-rose-900 font-medium">नक्षत्र/तिथि: </span>
                                        {item.nakshatra}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-[11px] text-gray-700 pl-2 mt-1.5 italic">
                                {panchangData.muhurats?.vivah_details?.summary || 'इस माह विवाह मुहूर्त शास्त्रानुसार उपलब्ध नहीं हैं।'}
                              </div>
                            )}
                          </div>
                        )}

                        {/* 2. गृह प्रवेश (Griha Pravesh) */}
                        {(selectedOccasion === 'all' || selectedOccasion === 'griha') && (
                          <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/90 shadow-2xs">
                            <div className="font-bold text-amber-950 text-[11.5px] flex items-center justify-between pb-1 border-b border-amber-100">
                              <span className="flex items-center gap-1 text-amber-900">
                                <Home className="w-3.5 h-3.5 text-amber-700" />
                                गृह प्रवेश मुहूर्त (House Warming)
                              </span>
                              <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded font-medium">
                                {panchangData.muhurats?.griha_pravesh_details?.dates?.length || 0} दिन
                              </span>
                            </div>

                            {panchangData.muhurats?.griha_pravesh_details?.has_muhurat && panchangData.muhurats?.griha_pravesh_details?.dates?.length > 0 ? (
                              <div className="mt-1.5 space-y-1.5">
                                {panchangData.muhurats.griha_pravesh_details.dates.map((item, idx) => (
                                  <div key={idx} className="bg-amber-50/50 border border-amber-200/60 rounded-lg p-2 text-[11px]">
                                    <div className="font-bold text-amber-950 flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-700 inline-block"></span>
                                      {item.date_str}
                                    </div>
                                    <div className="text-gray-800 font-medium pl-2.5 mt-0.5">
                                      <span className="text-amber-950 font-semibold">Timing: </span>
                                      {item.timing}
                                    </div>
                                    {item.nakshatra && (
                                      <div className="text-[10.5px] text-gray-600 pl-2.5">
                                        <span className="text-amber-900 font-medium">नक्षत्र/तिथि: </span>
                                        {item.nakshatra}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-[11px] text-gray-700 pl-2 mt-1.5 italic">
                                {panchangData.muhurats?.griha_pravesh_details?.summary || 'इस माह गृह प्रवेश मुहूर्त उपलब्ध नहीं हैं।'}
                              </div>
                            )}
                          </div>
                        )}

                        {/* 3. वाहन / मशीनरी क्रय (Vahan Kharid) */}
                        {(selectedOccasion === 'all' || selectedOccasion === 'vahan') && (
                          <div className="bg-white/80 p-2.5 rounded-xl border border-blue-200/90 shadow-2xs">
                            <div className="font-bold text-blue-950 text-[11.5px] flex items-center justify-between pb-1 border-b border-blue-100">
                              <span className="flex items-center gap-1 text-blue-900">
                                <Car className="w-3.5 h-3.5 text-blue-600" />
                                वाहन / मशीनरी क्रय मुहूर्त
                              </span>
                              <span className="text-[10px] text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded font-medium">
                                {panchangData.muhurats?.vahan_details?.dates?.length || 0} दिन
                              </span>
                            </div>

                            {panchangData.muhurats?.vahan_details?.dates?.length > 0 ? (
                              <div className="mt-1.5 space-y-1.5">
                                {panchangData.muhurats.vahan_details.dates.map((item, idx) => (
                                  <div key={idx} className="bg-blue-50/40 border border-blue-200/60 rounded-lg p-2 text-[11px]">
                                    <div className="font-bold text-blue-950 flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block"></span>
                                      {item.date_str}
                                    </div>
                                    <div className="text-gray-800 font-medium pl-2.5 mt-0.5">
                                      <span className="text-blue-950 font-semibold">Timing: </span>
                                      {item.timing}
                                    </div>
                                    {item.nakshatra && (
                                      <div className="text-[10.5px] text-gray-600 pl-2.5">
                                        <span className="text-blue-900 font-medium">नक्षत्र/तिथि: </span>
                                        {item.nakshatra}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-[11px] text-gray-700 pl-2 mt-1.5 italic">
                                {panchangData.muhurats?.vahan_details?.summary || panchangData.muhurats?.vahan_machinery_muhurat?.join(' • ') || 'शुभ नक्षत्र अनुकूल'}
                              </div>
                            )}
                          </div>
                        )}

                        {/* 4. व्यापार / प्रतिष्ठान आरम्भ (Vyapar) */}
                        {(selectedOccasion === 'all' || selectedOccasion === 'vyapar') && (
                          <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200/90 shadow-2xs">
                            <div className="font-bold text-emerald-950 text-[11.5px] flex items-center justify-between pb-1 border-b border-emerald-100">
                              <span className="flex items-center gap-1 text-emerald-900">
                                <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                                विपणि / व्यापार आरम्भ मुहूर्त
                              </span>
                              <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                                {panchangData.muhurats?.vyapar_details?.dates?.length || 0} दिन
                              </span>
                            </div>

                            {panchangData.muhurats?.vyapar_details?.dates?.length > 0 ? (
                              <div className="mt-1.5 space-y-1.5">
                                {panchangData.muhurats.vyapar_details.dates.map((item, idx) => (
                                  <div key={idx} className="bg-emerald-50/40 border border-emerald-200/60 rounded-lg p-2 text-[11px]">
                                    <div className="font-bold text-emerald-950 flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block"></span>
                                      {item.date_str}
                                    </div>
                                    <div className="text-gray-800 font-medium pl-2.5 mt-0.5">
                                      <span className="text-emerald-950 font-semibold">Timing: </span>
                                      {item.timing}
                                    </div>
                                    {item.nakshatra && (
                                      <div className="text-[10.5px] text-gray-600 pl-2.5">
                                        <span className="text-emerald-900 font-medium">नक्षत्र/तिथि: </span>
                                        {item.nakshatra}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-[11px] text-gray-700 pl-2 mt-1.5 italic">
                                {panchangData.muhurats?.vyapar_details?.summary || panchangData.muhurats?.vyapar_muhurat?.join(' • ') || 'शुभ चौघड़िया मुहूर्त में'}
                              </div>
                            )}
                          </div>
                        )}

                        {/* 5. नामकरण संस्कार (Namakaran) */}
                        {(selectedOccasion === 'all' || selectedOccasion === 'namakaran') && panchangData.muhurats?.namakaran_details && (
                          <div className="bg-white/80 p-2.5 rounded-xl border border-purple-200/90 shadow-2xs">
                            <div className="font-bold text-purple-950 text-[11.5px] flex items-center justify-between pb-1 border-b border-purple-100">
                              <span className="flex items-center gap-1 text-purple-900">
                                <Baby className="w-3.5 h-3.5 text-purple-600" />
                                नामकरण संस्कार मुहूर्त
                              </span>
                              <span className="text-[10px] text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded font-medium">
                                {panchangData.muhurats?.namakaran_details?.dates?.length || 0} दिन
                              </span>
                            </div>

                            {panchangData.muhurats.namakaran_details.dates?.length > 0 ? (
                              <div className="mt-1.5 space-y-1.5">
                                {panchangData.muhurats.namakaran_details.dates.map((item, idx) => (
                                  <div key={idx} className="bg-purple-50/40 border border-purple-200/60 rounded-lg p-2 text-[11px]">
                                    <div className="font-bold text-purple-950 flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-purple-600 inline-block"></span>
                                      {item.date_str}
                                    </div>
                                    <div className="text-gray-800 font-medium pl-2.5 mt-0.5">
                                      <span className="text-purple-950 font-semibold">Timing: </span>
                                      {item.timing}
                                    </div>
                                    {item.nakshatra && (
                                      <div className="text-[10.5px] text-gray-600 pl-2.5">
                                        <span className="text-purple-900 font-medium">नक्षत्र/तिथि: </span>
                                        {item.nakshatra}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-[11px] text-gray-700 pl-2 mt-1.5 italic">
                                {panchangData.muhurats?.namakaran_details?.summary || 'अनुकूल तिथि उपलब्ध नहीं'}
                              </div>
                            )}
                          </div>
                        )}

                        {/* 6. मुंडन संस्कार (Mundan) */}
                        {(selectedOccasion === 'all' || selectedOccasion === 'mundan') && panchangData.muhurats?.mundan_details && (
                          <div className="bg-white/80 p-2.5 rounded-xl border border-orange-200/90 shadow-2xs">
                            <div className="font-bold text-orange-950 text-[11.5px] flex items-center justify-between pb-1 border-b border-orange-100">
                              <span className="flex items-center gap-1 text-orange-900">
                                <Scissors className="w-3.5 h-3.5 text-orange-600" />
                                मुंडन (चूड़ाकर्म) संस्कार मुहूर्त
                              </span>
                              <span className="text-[10px] text-orange-800 bg-orange-50 px-1.5 py-0.5 rounded font-medium">
                                {panchangData.muhurats?.mundan_details?.dates?.length || 0} दिन
                              </span>
                            </div>

                            {panchangData.muhurats.mundan_details.dates?.length > 0 ? (
                              <div className="mt-1.5 space-y-1.5">
                                {panchangData.muhurats.mundan_details.dates.map((item, idx) => (
                                  <div key={idx} className="bg-orange-50/40 border border-orange-200/60 rounded-lg p-2 text-[11px]">
                                    <div className="font-bold text-orange-950 flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-orange-600 inline-block"></span>
                                      {item.date_str}
                                    </div>
                                    <div className="text-gray-800 font-medium pl-2.5 mt-0.5">
                                      <span className="text-orange-950 font-semibold">Timing: </span>
                                      {item.timing}
                                    </div>
                                    {item.nakshatra && (
                                      <div className="text-[10.5px] text-gray-600 pl-2.5">
                                        <span className="text-orange-900 font-medium">नक्षत्र/तिथि: </span>
                                        {item.nakshatra}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-[11px] text-gray-700 pl-2 mt-1.5 italic">
                                {panchangData.muhurats?.mundan_details?.summary || 'इस माह मुंडन संस्कार उपलब्ध नहीं हैं।'}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Column 3 (Right): काल - गणना (Width: 4 cols) */}
                  <div className="lg:col-span-4 xl:col-span-4 bg-amber-50/40 border border-amber-900/20 rounded-2xl p-3.5 space-y-3.5 shadow-xs">
                    <div className="bg-red-800 text-white text-center py-1.5 px-3 rounded-xl font-bold text-xs tracking-wide shadow-sm">
                      काल - गणना
                    </div>

                    {/* Karya & Amrit Siddhi Yoga */}
                    <div className="bg-white p-3 rounded-xl border border-amber-900/10 text-xs">
                      <div className="font-bold text-red-900 mb-1 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-900" />
                        कार्य-सिद्धि एवं अमृत सिद्धि योग
                      </div>
                      <ul className="list-disc list-inside text-[12px] text-gray-900 space-y-1">
                        {panchangData.kaal_ganana?.amrit_siddhi_yoga?.map((y, i) => (
                          <li key={i}>{y}</li>
                        ))}
                        {panchangData.kaal_ganana?.karya_siddhi_yoga?.map((y, i) => (
                          <li key={i}>{y}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Ravi Yoga */}
                    <div className="bg-white p-3 rounded-xl border border-amber-900/10 text-xs">
                      <div className="font-bold text-amber-900 mb-1">सर्वदोषनाशक रवि योग</div>
                      <div className="text-[12px] text-gray-900 space-y-0.5">
                        {panchangData.kaal_ganana?.ravi_yoga?.map((r, i) => (
                          <div key={i}>• {r}</div>
                        ))}
                      </div>
                    </div>

                    {/* Bhadra / Vishti */}
                    <div className="bg-white p-3 rounded-xl border border-amber-900/10 text-xs">
                      <div className="font-bold text-red-900 mb-1 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        विष्टि भद्रा (अशुभ समय)
                      </div>
                      <div className="text-[12px] text-gray-900 space-y-0.5">
                        {panchangData.kaal_ganana?.bhadra_vishti?.map((b, i) => (
                          <div key={i}>• {b}</div>
                        ))}
                      </div>
                    </div>

                    {/* Panchak */}
                    {panchangData.kaal_ganana?.panchak && (
                      <div className="bg-amber-100/50 p-2.5 rounded-xl border border-amber-300 text-xs">
                        <span className="font-bold text-amber-950">पंचक अवधि: </span>
                        <span className="text-[12px] text-gray-900">
                          {panchangData.kaal_ganana.panchak.start} से {panchangData.kaal_ganana.panchak.end}
                        </span>
                      </div>
                    )}

                    {/* Moon Sign Ingress (चन्द्रमा का राशि प्रवेश) */}
                    <div className="bg-white p-3 rounded-xl border border-amber-900/10 text-xs">
                      <div className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5" />
                        चन्द्रमा का राशि प्रवेश
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[12px] text-gray-700">
                        {panchangData.kaal_ganana?.chandra_rashi_pravesh?.map((c, i) => (
                          <div key={i} className="bg-gray-50 px-1.5 py-0.5 rounded">
                            <span className="font-bold text-red-900">{c.date} को </span>
                            <span>{c.time} {c.rashi}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            )
          )
        )}

      </div>
    </div>
  );
};

export default MonthlyPanchang;
