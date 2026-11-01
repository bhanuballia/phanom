import { PYTHON_ASTRO_URL } from '../services/api';
import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { Calendar, RefreshCw, Printer, Sparkles, ChevronLeft, ChevronRight, Compass, ShieldAlert, Award } from 'lucide-react';
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
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(10); // Default October
  const [selectedRashi, setSelectedRashi] = useState('मकर');
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#f7f3eb] text-gray-900 pb-16 font-sans">
      <Navigation />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        {/* Controls Bar */}
        <div className="no-print bg-white/90 backdrop-blur-md rounded-2xl p-4 mb-6 border border-amber-900/10 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-800 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-cinzel text-amber-950">मासिक वैदिक पंचांग पत्रक</h2>
              <p className="text-xs text-amber-900/70">पारंपरिक हिंदू पंचांग एवं ग्रह गोचर गणना</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Year Selector */}
            <div className="flex items-center gap-1 bg-amber-50/80 px-2 py-1 rounded-xl border border-amber-200">
              <button
                onClick={() => setYear(y => y - 1)}
                className="p-1 hover:bg-amber-200/50 rounded text-amber-900"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-sm px-2 text-amber-950">{year}</span>
              <button
                onClick={() => setYear(y => y + 1)}
                className="p-1 hover:bg-amber-200/50 rounded text-amber-900"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Month Dropdown */}
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="bg-amber-50/80 border border-amber-200 text-amber-950 text-sm font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {monthsList.map(m => (
                <option key={m.num} value={m.num}>{m.name}</option>
              ))}
            </select>

            {/* Rashi Selector */}
            <select
              value={selectedRashi}
              onChange={(e) => setSelectedRashi(e.target.value)}
              className="bg-amber-50/80 border border-amber-200 text-amber-950 text-sm font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {RASHI_OPTIONS.map(r => (
                <option key={r} value={r}>{r} राशि फल</option>
              ))}
            </select>

            {/* Google / Drik Panchang Standard Dates Badge */}
            <div className="flex items-center gap-1.5 bg-blue-50/90 text-blue-900 border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span>Astroo Consult प्रमाणित</span>
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-amber-700 hover:bg-amber-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              प्रिंट पंचांग
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

        {/* The Authentic 3-Column Panchang Sheet */}
        {!loading && panchangData && (
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
                <div className="bg-amber-50/60 border border-amber-900/20 rounded-2xl p-3.5">
                  <div className="bg-red-900 text-white text-center py-1 rounded-lg text-xs font-bold mb-3">
                    {panchangData.month_name} में विभिन्न मुहूर्त
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="font-bold text-amber-950 text-[11px]">विपणि/व्यापार मुहूर्त:</div>
                      <div className="text-[11px] text-gray-700 pl-2">
                        {panchangData.muhurats?.vyapar_muhurat?.join(' • ') || 'शुभ मुहूर्त उपलब्ध हैं'}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-amber-950 text-[11px] flex items-center justify-between">
                        <span>विवाह मुहूर्त:</span>
                        {panchangData.muhurats?.vivah_details?.has_muhurat && (
                          <span className="text-[10px] text-red-700 bg-red-100/80 px-1.5 py-0.5 rounded font-normal">
                            {panchangData.month_name} {panchangData.year}
                          </span>
                        )}
                      </div>

                      {/* Detailed Vivah Muhurat Cards formatted as requested */}
                      {panchangData.muhurats?.vivah_details?.has_muhurat && panchangData.muhurats?.vivah_details?.dates?.length > 0 ? (
                        <div className="mt-1.5 space-y-2 pl-1">
                          <div className="font-semibold text-red-900 text-[11px] pb-0.5 border-b border-amber-200">
                            {panchangData.muhurats.vivah_details.title || `${panchangData.month_name} ${panchangData.year} Shubh Vivah Dates & Timings`}
                          </div>
                          <div className="space-y-2">
                            {panchangData.muhurats.vivah_details.dates.map((item, idx) => (
                              <div key={idx} className="bg-white/90 border border-amber-200/80 rounded-lg p-2 shadow-2xs">
                                <div className="font-bold text-red-950 text-[11.5px] flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block"></span>
                                  {item.date_str}
                                </div>
                                <div className="text-[11px] text-gray-800 font-medium pl-2.5 mt-0.5">
                                  <span className="text-amber-950 font-semibold">Timing: </span>
                                  {item.timing}
                                </div>
                                {item.nakshatra && (
                                  <div className="text-[10.5px] text-gray-600 pl-2.5">
                                    <span className="text-amber-900 font-medium">Nakshatra: </span>
                                    {item.nakshatra}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-gray-700 pl-2 mt-0.5 italic">
                          {panchangData.muhurats?.vivah_details?.summary || panchangData.muhurats?.vivah_muhurat?.join(' • ') || 'माह अनुसार'}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-amber-950 text-[11px]">वाहन / मशीनरी क्रय:</div>
                      <div className="text-[11px] text-gray-700 pl-2">
                        {panchangData.muhurats?.vahan_machinery_muhurat?.join(' • ') || 'नक्षत्र अनुकूल'}
                      </div>
                    </div>
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
        )}

      </div>
    </div>
  );
};

export default MonthlyPanchang;
