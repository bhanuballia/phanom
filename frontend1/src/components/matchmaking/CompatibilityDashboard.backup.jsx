import React, { useState } from 'react';
import ZodiacChart from '../ZodiacChart';
import MarriageDashboard from '../relationship/MarriageDashboard';
import SynastryDashboard from '../SynastryDashboard';
import ComprehensiveSummaryTable from './ComprehensiveSummaryTable';
import VimshottariDashaDisplay from './VimshottariDashaDisplay.jsx';

const CompatibilityDashboard = ({ bride, groom, brideFullData, groomFullData, report, bride_vimshottari, groom_vimshottari }) => {
   const brideVim = bride_vimshottari || report?.bride_vimshottari;
   const groomVim = groom_vimshottari || report?.groom_vimshottari;
   const [language, setLanguage] = useState('en');
   const [activationAnalysis, setActivationAnalysis] = useState(null);
   const [isAnalyzingActivation, setIsAnalyzingActivation] = useState(false);
   const [groomActivationAnalysis, setGroomActivationAnalysis] = useState(null);
   const [isAnalyzingGroomActivation, setIsAnalyzingGroomActivation] = useState(false);
   const [aiDeepReport, setAiDeepReport] = useState(null);
   const [isGeneratingAiDeepReport, setIsGeneratingAiDeepReport] = useState(false);

   // Combined Marriage Favorable Windows helpers
   const getFavorablePlanets = (chart) => {
      if (!chart) return ['Venus', 'Jupiter'];
      const favorable = new Set(['Venus', 'Jupiter']);
      const seventhHouse = chart.houses?.['7'] || chart.houses?.[7];
      if (seventhHouse) {
         const sign = seventhHouse.sign;
         const SIGN_LORDS = {
            "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury", "Cancer": "Moon",
            "Leo": "Sun", "Virgo": "Mercury", "Libra": "Venus", "Scorpio": "Mars",
            "Sagittarius": "Jupiter", "Capricorn": "Saturn", "Aquarius": "Saturn", "Pisces": "Jupiter"
         };
         const lord = SIGN_LORDS[sign];
         if (lord) favorable.add(lord);
         const planets = seventhHouse.planets || [];
         planets.forEach(p => {
            const name = typeof p === 'string' ? p : p.name;
            if (name) favorable.add(name);
         });
      }
      return Array.from(favorable);
   };

   const getFavorableIntervals = (dashaData, favorablePlanets) => {
      const intervals = [];
      const list = Array.isArray(dashaData) ? dashaData : dashaData?.list || [];
      list.forEach(md => {
         const mdLord = md.lord;
         const ads = md.antardashas || [];
         ads.forEach(ad => {
            const adLord = ad.lord;
            const isFavorable = favorablePlanets.includes(mdLord) || favorablePlanets.includes(adLord);
            if (isFavorable) {
               intervals.push({
                  md: mdLord,
                  ad: adLord,
                  start_jd: ad.start_jd,
                  end_jd: ad.end_jd
               });
            }
         });
      });
      return intervals;
   };

   const getOverlappingWindows = (brideIntervals, groomIntervals) => {
      const overlaps = [];
      brideIntervals.forEach(b => {
         groomIntervals.forEach(g => {
            const start = Math.max(b.start_jd, g.start_jd);
            const end = Math.min(b.end_jd, g.end_jd);
            if (start < end) {
               overlaps.push({
                  start_jd: start,
                  end_jd: end,
                  bride_dasha: `${b.md}-${b.ad}`,
                  groom_dasha: `${g.md}-${g.ad}`
               });
            }
         });
      });
      overlaps.sort((a, b) => a.start_jd - b.start_jd);
      const currentJd = 2440587.5 + (new Date().getTime() / 86400000);
      const futureOverlaps = overlaps.filter(o => o.end_jd >= currentJd);
      return futureOverlaps.slice(0, 3);
   };

   const jdToDateString = (jd) => {
      const date = new Date((jd - 2440587.5) * 86400000);
      return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
   };

   const getAgeAtJd = (birthDateStr, jd) => {
      if (!birthDateStr) return '';
      const birthDate = new Date(birthDateStr);
      const targetDate = new Date((jd - 2440587.5) * 86400000);
      let age = targetDate.getFullYear() - birthDate.getFullYear();
      const m = targetDate.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && targetDate.getDate() < birthDate.getDate())) {
         age--;
      }
      return age >= 0 ? age : 0;
   };

   // Combined Marriage Muhurtas State & Hook
   const [muhurtaDates, setMuhurtaDates] = useState({});
   React.useEffect(() => {
      if (!brideVim || !groomVim) return;

      const brideFavs = getFavorablePlanets(report.bride_chart);
      const groomFavs = getFavorablePlanets(report.groom_chart);
      const brideIntervals = getFavorableIntervals(brideVim, brideFavs);
      const groomIntervals = getFavorableIntervals(groomVim, groomFavs);
      const overlaps = getOverlappingWindows(brideIntervals, groomIntervals);

      overlaps.forEach(async (overlap, idx) => {
         const startDate = new Date((overlap.start_jd - 2440587.5) * 86400000);
         const startDateStr = startDate.toISOString().split('T')[0];

         try {
            const response = await fetch('/api/muhurt/search_advanced', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                  start_date: startDateStr,
                  days: 60,
                  tz: brideFullData?.tz_offset || 5.5,
                  lat: brideFullData?.lat || 28.6,
                  lon: brideFullData?.lon || 77.2,
                  ceremony: "Marriage"
               })
            });
            if (response.ok) {
               const data = await response.json();
               setMuhurtaDates(prev => ({
                  ...prev,
                  [idx]: data.top_muhurtas || []
               }));
            }
         } catch (e) {
            console.error("Failed to fetch muhurta for overlap", idx, e);
         }
      });
   }, [brideVim, groomVim]);

   // Garbhadhana State
   const [garbhadhanaCycleStart, setGarbhadhanaCycleStart] = useState("");
   const [garbhadhanaResults, setGarbhadhanaResults] = useState(null);
   const [isCalculatingGarbhadhana, setIsCalculatingGarbhadhana] = useState(false);
   const [garbhadhanaError, setGarbhadhanaError] = useState("");

   const handleCalculateGarbhadhana = async () => {
      if (!garbhadhanaCycleStart) {
         setGarbhadhanaError("Please enter the start date of Ritu Kaal (Cycle).");
         return;
      }
      setIsCalculatingGarbhadhana(true);
      setGarbhadhanaError("");
      try {
         const response = await fetch('/api/muhurt/garbhadhana', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               cycle_start_date: garbhadhanaCycleStart,
               boy_nakshatra: groomFullData?.panchang?.nakshatra?.nakshatra_name || "Ashwini",
               girl_nakshatra: brideFullData?.panchang?.nakshatra?.nakshatra_name || "Ashwini"
            })
         });
         const data = await response.json();
         if (response.ok) {
            setGarbhadhanaResults(data.results);
         } else {
            setGarbhadhanaError(data.detail || "Calculation failed.");
         }
      } catch (e) {
         console.error(e);
         setGarbhadhanaError("Error connecting to server for Garbhadhana calculation.");
      } finally {
         setIsCalculatingGarbhadhana(false);
      }
   };

   // Vivah Muhurta Planner State
   const [vivahStartDate, setVivahStartDate] = useState(new Date().toISOString().split('T')[0]);
   const [vivahDays, setVivahDays] = useState(90);
   const [vivahResults, setVivahResults] = useState([]);
   const [isCalculatingVivah, setIsCalculatingVivah] = useState(false);
   const [vivahError, setVivahError] = useState("");
   const [selectedVivahDate, setSelectedVivahDate] = useState(null);

   const handleCalculateVivah = async (customStart = null, customDays = null) => {
      const start = customStart || vivahStartDate;
      const daysVal = customDays || vivahDays;
      setIsCalculatingVivah(true);
      setVivahError("");
      try {
         const response = await fetch('/api/muhurt/vivah', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               bride_moon_lon: report?.bride_chart?.planet_positions?.Moon?.sidereal?.lon,
               groom_moon_lon: report?.groom_chart?.planet_positions?.Moon?.sidereal?.lon,
               start_date: start,
               days: parseInt(daysVal),
               tz: brideFullData?.tz_offset || 5.5,
               lat: brideFullData?.lat || 28.6,
               lon: brideFullData?.lon || 77.2
            })
         });
         const data = await response.json();
         if (response.ok) {
            setVivahResults(data.dates || []);
            if (data.dates && data.dates.length > 0) {
               const firstAusp = data.dates.find(d => d.is_auspicious) || data.dates[0];
               setSelectedVivahDate(firstAusp);
            }
         } else {
            setVivahError(data.detail || "Vivah Muhurta calculation failed.");
         }
      } catch (e) {
         console.error(e);
         setVivahError("Error connecting to server for Vivah Muhurta calculation.");
      } finally {
         setIsCalculatingVivah(false);
      }
   };

   React.useEffect(() => {
      if (report?.bride_chart?.planet_positions?.Moon?.sidereal?.lon && report?.groom_chart?.planet_positions?.Moon?.sidereal?.lon) {
         handleCalculateVivah();
      }
   }, [report]);


   const handleGenerateAiDeepReport = async () => {
      setIsGeneratingAiDeepReport(true);
      try {
         const response = await fetch('/api/matchmaking/ai-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bride: brideFullData, groom: groomFullData })
         });
         const data = await response.json();
         setAiDeepReport(data.report);
         // Scroll to the bottom to see it
         setTimeout(() => {
            const el = document.getElementById("ai-deep-report-section");
            if (el) el.scrollIntoView({ behavior: 'smooth' });
         }, 500);
      } catch (e) {
         console.error(e);
         setAiDeepReport("<div class='text-rose-500 font-bold'>Error fetching AI report. Ensure backend is running.</div>");
      } finally {
         setIsGeneratingAiDeepReport(false);
      }
   };

   const handleActivationAnalysis = async () => {
      setIsAnalyzingActivation(true);
      try {
         const response = await fetch('/api/matchmaking/marriage-activation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bride: brideFullData })
         });
         const data = await response.json();
         setActivationAnalysis(data.analysis);
      } catch (e) {
         console.error(e);
         setActivationAnalysis("<div class='text-rose-500 font-bold'>Error fetching analysis. Ensure backend is running.</div>");
      } finally {
         setIsAnalyzingActivation(false);
      }
   };

   const handleGroomActivationAnalysis = async () => {
      setIsAnalyzingGroomActivation(true);
      try {
         const response = await fetch('/api/matchmaking/marriage-activation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ groom: groomFullData })
         });
         const data = await response.json();
         setGroomActivationAnalysis(data.analysis);
      } catch (e) {
         console.error(e);
         setGroomActivationAnalysis("<div class='text-rose-500 font-bold'>Error fetching analysis. Ensure backend is running.</div>");
      } finally {
         setIsAnalyzingGroomActivation(false);
      }
   };

   if (!report) return <div className="p-8 text-slate-500 font-serif italic text-center">Awaiting birth data for final compatibility synthesis...</div>;

   // Defensive destructuring with fallbacks
   const guna_milan = report.guna_milan || { total_score: 0, interpretation: "N/A", scores: {} };
   const manglik = report.manglik || { bride: {}, groom: {}, analysis: {} };
   const success_probability = report.success_probability ?? 0;
   const summary = report.summary || { recommendation: "Analysis Pending" };
   const navamsa = report.navamsa || { spiritual_bond: "N/A", long_term_prospect: "N/A", description: "" };
   const risk = report.risk_analysis || { divorce: { risk_level: "Low", risk_score: 0 }, toxic_warnings: [] };
   const timing = report.timing || { favorable_years: [] };
   const remedies = report.remedies || [];
   const ai = report.ai_narrative || { summary: "", strengths: [], weaknesses: [] };

   const ent = report.enterprise_analysis || {};
   const entScore = ent.final_score ? Math.round(ent.final_score) : 0;
   const aiForecast = ent.ai_prediction || { prediction: "Awaiting Analysis", risk: "UNKNOWN" };
   const longevity = ent.longevity || { longevity: 0, stability: "UNKNOWN" };
   const divorceRisk = ent.divorce_risk || { risk_score: 0, risk_level: "UNKNOWN" };
   const financial = ent.financial || { score: 0, description: "" };
   const intimacy = ent.intimacy || { score: 0, description: "" };
   const familyHarmony = ent.family || { score: 0, description: "" };
   const bride_kundali = report.bride_kundali_analysis || null;
   const groom_kundali = report.groom_kundali_analysis || null;
   const jaimini = ent.jaimini || null;

   const ZODIAC_SIGNS = [
      "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
      "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
   ];

   const gunaTotal = guna_milan.total_score || 0;
   const hasNadiDosha = guna_milan.scores?.["Nadi"] === 0;
   const hasBhakootDosha = guna_milan.scores?.["Bhakoot"] === 0;

   const getStatusColor = (status) => {
      if (status.includes("Excellent")) return "text-emerald-600";
      if (status.includes("Very Good")) return "text-emerald-500";
      if (status.includes("Acceptable")) return "text-amber-500";
      if (status.includes("Not Compatible")) return "text-rose-500";
      return "text-slate-500";
   };

   const KOOTA_DESCRIPTIONS = {
      "Varna": "Represents spiritual compatibility. It exhibits the ego level and personalities. Matching ensures mutual love and comfort.",
      "Vashya": "Measures mutual attraction and influence. It calculates the power equation between the two partners.",
      "Tara": "Indicates wellbeing and longevity. Ensures the couple remains disease-free and enjoys a happy conjugal life.",
      "Yoni": "Measures intimacy levels and sexual compatibility. Matches the sensuous nature and characteristics of both.",
      "Graha Maitri": "Reflects mental compatibility and natural friendship. Denotes how inimical or friendly the partners are.",
      "Gana": "Indicates mutual behaviors and temperaments. A vital factor impacting overall compatibility levels.",
      "Bhakoot": "Represents emotional compatibility. Shows relative influence and capability of mutual understanding.",
      "Nadi": "Measures Vata, Pitta, and Kapha levels. Impacts progeny, child-birth, and general health metabolism."
   };

   return (
      <div className="bg-[#f8fafc] min-h-screen p-4 md:p-12 font-sans pb-32">
         <div className="max-w-7xl mx-auto space-y-12">



            {/* Step 1: Royal Header */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-12 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
               <div className="text-center md:text-left flex-1">
                  <h1 className="text-5xl font-serif italic tracking-tight text-slate-900 mb-3">Divine Compatibility</h1>
                  <p className="text-[12px] font-black uppercase tracking-[0.5em] text-amber-600 bg-indigo-50 px-4 py-2 rounded-full inline-block">Advanced Synthesis</p>
               </div>

               {/* Center Image */}
               <div className="shrink-0 z-10 flex justify-center hidden md:block">
                  <img src="/deities/match1.jpg" alt="Divine Match" className="w-32 h-32 rounded-full shadow-2xl object-cover border-4 border-amber-100" />
               </div>

               <div className="flex items-center gap-16 shrink-0">
                  <div className="text-center group">
                     <div className="w-24 h-24 rounded-full bg-slate-50 border-4 border-white shadow-xl flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform shadow-indigo-100">👰</div>
                     <div className="text-[11px] font-black uppercase text-slate-500 tracking-widest">{bride || 'Bride'}</div>
                  </div>
                  <div className="text-5xl font-serif italic text-slate-200">vs</div>
                  <div className="text-center group">
                     <div className="w-24 h-24 rounded-full bg-slate-50 border-4 border-white shadow-xl flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform shadow-indigo-100">🤵</div>
                     <div className="text-[11px] font-black uppercase text-slate-500 tracking-widest">{groom || 'Groom'}</div>
                  </div>
               </div>
            </div>

            {/* Step 2: AI Narrative Summary */}
            <section className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full -mr-32 -mt-32"></div>
               <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div>
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-white m-0">Detailed Compatibility Report</h3>
                        <button
                           onClick={handleGenerateAiDeepReport}
                           disabled={isGeneratingAiDeepReport}
                           className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 text-[16px] flex items-center gap-2"
                        >
                           {isGeneratingAiDeepReport ? (
                              <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Generating...</>
                           ) : "✨ Generate Deep Analysis Report"}
                        </button>
                     </div>
                     <p className="text-3xl md:text-4xl font-serif italic leading-tight text-indigo-50 mb-8">"{ai.summary || summary.recommendation}"</p>
                     <div className="flex gap-4">
                        <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                           <div className="text-[9px] font-black uppercase text-indigo-300 mb-1">Success Probability</div>
                           <div className="text-2xl font-bold">{Math.round(success_probability)}%</div>
                        </div>
                        <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                           <div className="text-[9px] font-black uppercase text-indigo-300 mb-1">Guna Score</div>
                           <div className="text-2xl font-bold">{gunaTotal}/36</div>
                        </div>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div className="bg-emerald-500/10 p-6 rounded-3xl border border-emerald-500/20">
                        <h4 className="text-[14px] font-black uppercase text-emerald-400 mb-4 tracking-widest">Core Strengths</h4>
                        <ul className="space-y-3">
                           {ai.strengths.map((s, i) => <li key={i} className="text-[16px] flex gap-2"><span className="text-emerald-400">✓</span> {s}</li>)}
                        </ul>
                     </div>
                     <div className="bg-rose-500/10 p-6 rounded-3xl border border-rose-500/20">
                        <h4 className="text-[14spx] font-black uppercase text-rose-400 mb-4 tracking-widest">Primary Challenges</h4>
                        <ul className="space-y-3">
                           {ai.weaknesses.map((w, i) => <li key={i} className="text-[16px] flex gap-2"><span className="text-rose-400">!</span> {w}</li>)}
                        </ul>
                     </div>
                  </div>
               </div>
            </section>

            {/* Step 3: Celestial Map Synchronization (Lagna Charts) */}
            <section className="bg-white rounded-[2.5rem] p-12 shadow-xl border border-slate-100 relative">
               <button
                  onClick={() => setLanguage(l => l === 'en' ? 'hi' : 'en')}
                  className="absolute top-6 right-8 z-50 px-4 py-2 bg-amber-500 text-slate-900 font-bold rounded-xl shadow-md hover:bg-amber-400 transition text-xs uppercase tracking-wide"
               >
                  {language === 'en' ? 'A → अ (Translate to Hindi)' : 'अ → A (Translate to English)'}
               </button>
               <div className="text-center mb-10">
                  <h3 className="text-[14px] font-black uppercase tracking-[0.5em] text-indigo-500 mb-2">Destiny Blueprint Visualization</h3>
                  <h2 className="text-3xl font-serif italic text-slate-800">Lagna Chart Synchronization</h2>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  {/* Bride Chart Column */}
                  <div className="space-y-6">
                     <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                        <div className="text-[14px] font-black uppercase tracking-widest text-indigo-500 mb-4 text-center">Bride's Birth Profile</div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                           <div>
                              <div className="text-[12px] font-bold text-slate-900 uppercase">Full Name</div>
                              <div className="text-[18px] font-serif italic text-amber-600">{brideFullData?.title} {brideFullData?.name}</div>
                           </div>
                           <div>
                              <div className="text-[12px] font-bold text-slate-900 uppercase">Birth Date</div>
                              <div className="text-[14px] font-bold text-amber-600">{brideFullData?.birth_date}</div>
                           </div>
                           <div>
                              <div className="text-[12px] font-bold text-slate-900 uppercase">Birth Time</div>
                              <div className="text-[14px] font-bold text-amber-600">{brideFullData?.birth_time}</div>
                           </div>
                           <div>
                              <div className="text-[12px] font-bold text-slate-900 uppercase">Location</div>
                              <div className="text-[14px] font-bold text-amber-600 truncate" title={brideFullData?.location_name}>{brideFullData?.location_name}</div>
                           </div>
                        </div>
                     </div>
                     <div className="aspect-square bg-slate-50 rounded-3xl p-6 border border-slate-100 shadow-inner">
                        <ZodiacChart houses={report.bride_chart?.houses} title={`${bride}'s Lagna`} variant="modern" defaultLang={language} key={`bride-lagna-${language}`} hideOuterRect={false} stackLayout={true} scaleText={1.3} />
                     </div>
                     <div className="aspect-square bg-slate-50 rounded-3xl p-6 border border-slate-100 shadow-inner">
                        <ZodiacChart houses={report.bride_d9_chart?.houses} title={`${bride}'s Navamsha (D9)`} variant="modern" defaultLang={language} key={`bride-d9-${language}`} hideOuterRect={false} stackLayout={true} />
                     </div>
                  </div>

                  {/* Groom Chart Column */}
                  <div className="space-y-6">
                     <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                        <div className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-4 text-center">Groom's Birth Profile</div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                           <div>
                              <div className="text-[12px] font-bold text-slate-900 uppercase">Full Name</div>
                              <div className="text-[18px] font-serif italic text-amber-600">{groomFullData?.title} {groomFullData?.name}</div>
                           </div>
                           <div>
                              <div className="text-[12px] font-bold text-slate-900 uppercase">Birth Date</div>
                              <div className="text-[14px] font-bold text-amber-600">{groomFullData?.birth_date}</div>
                           </div>
                           <div>
                              <div className="text-[12px] font-bold text-slate-900 uppercase">Birth Time</div>
                              <div className="text-[14px] font-bold text-amber-600">{groomFullData?.birth_time}</div>
                           </div>
                           <div>
                              <div className="text-[12px] font-bold text-slate-900 uppercase">Location</div>
                              <div className="text-[14px] font-bold text-amber-600 truncate" title={groomFullData?.location_name}>{groomFullData?.location_name}</div>
                           </div>
                        </div>
                     </div>
                     <div className="aspect-square bg-slate-50 rounded-3xl p-6 border border-slate-100 shadow-inner">
                        <ZodiacChart houses={report.groom_chart?.houses} title={`${groom}'s Lagna`} variant="modern" defaultLang={language} key={`groom-lagna-${language}`} hideOuterRect={false} stackLayout={true} />
                     </div>
                     <div className="aspect-square bg-slate-50 rounded-3xl p-6 border border-slate-100 shadow-inner">
                        <ZodiacChart houses={report.groom_d9_chart?.houses} title={`${groom}'s Navamsha (D9)`} variant="modern" defaultLang={language} key={`groom-d9-${language}`} hideOuterRect={false} stackLayout={true} />
                     </div>
                  </div>
               </div>
            </section>

            {/* Combined Divine Timing Alignment (Favorable Marriage Windows) */}
            {brideVim && groomVim && (
               <section className="bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 rounded-[2.5rem] p-12 shadow-xl border border-pink-100/50">
                  <div className="text-center mb-10">
                     <h3 className="text-[14px] font-black uppercase tracking-[0.5em] text-pink-600 mb-2">Cosmic Sync Timing</h3>
                     <h2 className="text-3xl font-serif italic text-slate-800">Combined Favorable Marriage Windows</h2>
                     <p className="text-sm text-slate-500 mt-2 max-w-xl mx-auto">
                        These are the top 3 upcoming periods where both partners' astrological charts simultaneously support marriage activation.
                     </p>
                  </div>

                  {(() => {
                     const brideFavs = getFavorablePlanets(report.bride_chart);
                     const groomFavs = getFavorablePlanets(report.groom_chart);
                     const brideIntervals = getFavorableIntervals(brideVim, brideFavs);
                     const groomIntervals = getFavorableIntervals(groomVim, groomFavs);
                     const overlaps = getOverlappingWindows(brideIntervals, groomIntervals);

                     if (overlaps.length === 0) {
                        return (
                           <div className="text-center py-8 text-slate-900 italic">
                              No overlapping favorable marriage windows found in the upcoming periods.
                           </div>
                        );
                     }

                     return (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           {overlaps.map((overlap, idx) => {
                              const bAgeStart = getAgeAtJd(brideFullData?.birth_date, overlap.start_jd);
                              const bAgeEnd = getAgeAtJd(brideFullData?.birth_date, overlap.end_jd);
                              const gAgeStart = getAgeAtJd(groomFullData?.birth_date, overlap.start_jd);
                              const gAgeEnd = getAgeAtJd(groomFullData?.birth_date, overlap.end_jd);

                              return (
                                 <div key={idx} className="bg-white rounded-3xl p-6 shadow-md border border-pink-100 hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-indigo-500"></div>
                                    <div>
                                       <span className="text-[9px] font-black uppercase tracking-widest text-pink-500 bg-pink-50 px-3 py-1 rounded-full inline-block mb-4">
                                          Alignment Window #{idx + 1}
                                       </span>
                                       <div className="text-xl font-bold text-slate-800 mb-1">
                                          {jdToDateString(overlap.start_jd)} – {jdToDateString(overlap.end_jd)}
                                       </div>
                                       <div className="text-xs text-slate-500 mb-6">
                                          Combined Activation Duration
                                       </div>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-slate-100">
                                       <div className="flex justify-between items-center text-xs">
                                          <span className=" text-[12px] text-slate-900 font-medium">👰 {brideFullData?.name || 'Bride'}:</span>
                                          <span className="font-bold text-indigo-950">
                                             {overlap.bride_dasha} <span className="text-slate-400 font-normal">(Age {bAgeStart}-{bAgeEnd})</span>
                                          </span>
                                       </div>
                                       <div className="flex justify-between items-center text-xs">
                                          <span className="text-[12px] text-slate-900 font-medium">🤵 {groomFullData?.name || 'Groom'}:</span>
                                          <span className="font-bold text-indigo-950">
                                             {overlap.groom_dasha} <span className="text-slate-900 font-normal">(Age {gAgeStart}-{gAgeEnd})</span>
                                          </span>
                                       </div>
                                    </div>

                                    {/* Auspicious Muhurta Dates */}
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                       <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2 flex items-center gap-1">
                                          <span>📅</span> Auspicious Marriage Dates
                                       </div>
                                       {muhurtaDates[idx] && muhurtaDates[idx].length > 0 ? (
                                          <div className="space-y-2">
                                             {muhurtaDates[idx].slice(0, 3).map((m, mIdx) => {
                                                const mDate = new Date(m.start_time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                                                const startTime = new Date(m.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                                                const endTime = new Date(m.end_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                                                return (
                                                   <div key={mIdx} className="bg-slate-50 border border-slate-100 p-2 rounded-xl text-[10px] space-y-1 hover:border-pink-200 transition-colors">
                                                      <div className="flex justify-between items-center">
                                                         <span className="font-bold text-[12px">{mDate}</span>
                                                         <span className="font-bold text-[12px] text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded-md border border-pink-100/50">✨ {m.nakshatra}</span>
                                                      </div>
                                                      <div className="flex justify-between items-center text-[12px] text-slate-900 font-bold">
                                                         <span>Time: {startTime} – {endTime}</span>
                                                         <span className="text-[12px] opacity-75">{m.tithi}</span>
                                                      </div>
                                                   </div>
                                                );
                                             })}
                                          </div>
                                       ) : (
                                          <div className="text-[10px] text-slate-400 italic">
                                             {muhurtaDates[idx] ? "No auspicious dates found in this range" : "Calculating Muhurtas..."}
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     );
                  })()}
               </section>
            )}

            {/* Strī Jātak (Female Horoscopy) Insights */}
            {report.stri_jatak_insights && (
               <section className="bg-white rounded-[2.5rem] p-12 shadow-xl border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/5 rounded-full blur-[80px] -mr-10 -mt-10"></div>
                  <div className="text-center mb-10">
                     <h3 className="text-[14px] font-black uppercase tracking-[0.5em] text-pink-600 mb-2">Strī Jātak (स्त्री जातक)</h3>
                     <h2 className="text-3xl font-serif italic text-slate-800">Female Horoscopy Compatibility Insights</h2>
                     <p className="text-sm text-slate-500 mt-2 max-w-xl mx-auto">
                        Classical astrological assessments for the bride based on Maharishi Parasara's rules for temperament, character, longevity, and marital harmony.
                     </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {/* Temperament Sign Polarity */}
                     {report.stri_jatak_insights.temperament && (
                        <div className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between">
                           <div>
                              <div className="flex justify-between items-start mb-4">
                                 <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-2xl">🌸</div>
                                 <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${report.stri_jatak_insights.temperament.status === 'Truly Feminine'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-indigo-100 text-indigo-800'
                                    }`}>
                                    {report.stri_jatak_insights.temperament.status}
                                 </span>
                              </div>
                              <h4 className="text-lg font-bold text-slate-800 mb-2">Temperament & Polarities</h4>
                              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                 {report.stri_jatak_insights.temperament.description}
                              </p>
                              {report.stri_jatak_insights.temperament.simple_explanation && (
                                 <div className="mt-auto pt-3 border-t border-slate-200/50">
                                    <div className="text-[10px] font-black uppercase text-indigo-500 mb-1 tracking-wider">🌱 Simple Meaning</div>
                                    <div className="text-[12px] text-slate-700 font-medium italic">
                                       "{report.stri_jatak_insights.temperament.simple_explanation}"
                                    </div>
                                 </div>
                              )}
                           </div>
                        </div>
                     )}

                     {/* Trimsamsa Character Profile */}
                     {report.stri_jatak_insights.trimsamsa && (
                        <div className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between">
                           <div>
                              <div className="flex justify-between items-start mb-4">
                                 <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-2xl">💎</div>
                                 <span className="text-[10px] font-black uppercase px-3 py-1.5 rounded-full bg-amber-100 text-amber-800">
                                    {report.stri_jatak_insights.trimsamsa.trimsamsa_lord} Trimsamsa
                                 </span>
                              </div>
                              <h4 className="text-lg font-bold text-slate-800 mb-2">Character & Virtues (Trimsamsa)</h4>
                              <p className="text-slate-600 text-sm leading-relaxed mb-1">
                                 {report.stri_jatak_insights.trimsamsa.outcome}
                              </p>
                              <div className="text-[10px] text-slate-400 font-semibold mb-4">
                                 Moon Owner: {report.stri_jatak_insights.trimsamsa.moon_sign_owner} | Trimsamsa Lord: {report.stri_jatak_insights.trimsamsa.trimsamsa_lord}
                              </div>
                              {report.stri_jatak_insights.trimsamsa.simple_explanation && (
                                 <div className="mt-auto pt-3 border-t border-slate-200/50">
                                    <div className="text-[10px] font-black uppercase text-amber-600 mb-1 tracking-wider">🌱 Simple Meaning</div>
                                    <div className="text-[12px] text-slate-700 font-medium italic">
                                       "{report.stri_jatak_insights.trimsamsa.simple_explanation}"
                                    </div>
                                 </div>
                              )}
                           </div>
                        </div>
                     )}

                     {/* Visha Kanya Yoga */}
                     {report.stri_jatak_insights.visha_kanya && (
                        <div className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between">
                           <div>
                              <div className="flex justify-between items-start mb-4">
                                 <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-2xl">🐍</div>
                                 <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${report.stri_jatak_insights.visha_kanya.present
                                    ? (report.stri_jatak_insights.visha_kanya.cancelled ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800')
                                    : 'bg-emerald-100 text-emerald-800'
                                    }`}>
                                    {report.stri_jatak_insights.visha_kanya.present
                                       ? (report.stri_jatak_insights.visha_kanya.cancelled ? 'Cancelled' : 'Dosha Present')
                                       : 'Clear'}
                                 </span>
                              </div>
                              <h4 className="text-lg font-bold text-slate-800 mb-2">Visha Kanya (विषकन्या) Analysis</h4>
                              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                 {report.stri_jatak_insights.visha_kanya.present
                                    ? report.stri_jatak_insights.visha_kanya.details
                                    : "No Visha Kanya configurations detected in the birth profile."}
                              </p>
                              {report.stri_jatak_insights.visha_kanya.cancelled && (
                                 <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] text-emerald-800 font-bold">
                                    ✨ {report.stri_jatak_insights.visha_kanya.cancellation_reason}
                                 </div>
                              )}
                              {report.stri_jatak_insights.visha_kanya.simple_explanation && (
                                 <div className="mt-auto pt-3 border-t border-slate-200/50">
                                    <div className="text-[10px] font-black uppercase text-rose-500 mb-1 tracking-wider">🌱 Simple Meaning</div>
                                    <div className="text-[12px] text-slate-700 font-medium italic">
                                       "{report.stri_jatak_insights.visha_kanya.simple_explanation}"
                                    </div>
                                 </div>
                              )}
                           </div>
                        </div>
                     )}

                     {/* 7th House */}
                     {report.stri_jatak_insights.seventh_house && (
                        <div className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between">
                           <div>
                              <div className="flex justify-between items-start mb-4">
                                 <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-2xl">🏰</div>
                                 <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${report.stri_jatak_insights.seventh_house.status.includes('Malefic')
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                    }`}>
                                    {report.stri_jatak_insights.seventh_house.status}
                                 </span>
                              </div>
                              <h4 className="text-lg font-bold text-slate-800 mb-2">7th House (Marital Happiness)</h4>
                              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                 {report.stri_jatak_insights.seventh_house.description}
                              </p>
                              {report.stri_jatak_insights.seventh_house.simple_explanation && (
                                 <div className="mt-auto pt-3 border-t border-slate-200/50">
                                    <div className="text-[10px] font-black uppercase text-indigo-500 mb-1 tracking-wider">🌱 Simple Meaning</div>
                                    <div className="text-[12px] text-slate-700 font-medium italic">
                                       "{report.stri_jatak_insights.seventh_house.simple_explanation}"
                                    </div>
                                 </div>
                              )}
                           </div>
                        </div>
                     )}

                     {/* 8th House */}
                     {report.stri_jatak_insights.eighth_house && (
                        <div className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between">
                           <div>
                              <div className="flex justify-between items-start mb-4">
                                 <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-2xl">⏳</div>
                                 <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${report.stri_jatak_insights.eighth_house.status.includes('Malefic')
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                    }`}>
                                    {report.stri_jatak_insights.eighth_house.status}
                                 </span>
                              </div>
                              <h4 className="text-lg font-bold text-slate-800 mb-2">8th House (Spouse's Longevity)</h4>
                              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                 {report.stri_jatak_insights.eighth_house.description}
                              </p>
                              {report.stri_jatak_insights.eighth_house.simple_explanation && (
                                 <div className="mt-auto pt-3 border-t border-slate-200/50">
                                    <div className="text-[10px] font-black uppercase text-indigo-500 mb-1 tracking-wider">🌱 Simple Meaning</div>
                                    <div className="text-[12px] text-slate-700 font-medium italic">
                                       "{report.stri_jatak_insights.eighth_house.simple_explanation}"
                                    </div>
                                 </div>
                              )}
                           </div>
                        </div>
                     )}

                     {/* Mangal Matching */}
                     {report.stri_jatak_insights.mangal_matching && (
                        <div className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between">
                           <div>
                              <div className="flex justify-between items-start mb-4">
                                 <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-2xl">🔥</div>
                                 <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${report.stri_jatak_insights.mangal_matching.status.includes('Perfect')
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : (report.stri_jatak_insights.mangal_matching.status.includes('Afflicted') ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800')
                                    }`}>
                                    {report.stri_jatak_insights.mangal_matching.status}
                                 </span>
                              </div>
                              <h4 className="text-lg font-bold text-slate-800 mb-2">Manglik Dosha Matching</h4>
                              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                 {report.stri_jatak_insights.mangal_matching.description}
                              </p>
                              {report.stri_jatak_insights.mangal_matching.simple_explanation && (
                                 <div className="mt-auto pt-3 border-t border-slate-200/50">
                                    <div className="text-[10px] font-black uppercase text-red-500 mb-1 tracking-wider">🌱 Simple Meaning</div>
                                    <div className="text-[12px] text-slate-700 font-medium italic">
                                       "{report.stri_jatak_insights.mangal_matching.simple_explanation}"
                                    </div>
                                 </div>
                              )}
                           </div>
                        </div>
                     )}
                  </div>
               </section>
            )}

            {/* Step 2.5: Vivah Muhurta Planner Section */}
            {report && (
               <section className="bg-white rounded-[2.5rem] p-12 shadow-xl border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"></div>

                  <div className="text-center mb-10">
                     <h3 className="text-[14px] font-black uppercase tracking-[0.5em] text-orange-600 mb-2">Vivah Muhurta</h3>
                     <h2 className="text-3xl font-serif italic text-slate-800">Auspicious Marriage Planner (विवाह मुहूर्त)</h2>
                     <p className="text-sm text-slate-500 mt-2 max-w-2xl mx-auto">
                        A precise step-by-step mathematical check based on both bride's and groom's birth stars (Janma Nakshatras) and transit planetary strengths.
                     </p>
                  </div>

                  <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 shadow-inner mb-8">
                     <div className="flex flex-col md:flex-row items-end gap-6">
                        <div className="flex-1 w-full">
                           <label className="block text-slate-900 text-xs font-bold uppercase tracking-wider mb-2">Muhurta Search Start Date</label>
                           <input
                              type="date"
                              value={vivahStartDate}
                              onChange={(e) => setVivahStartDate(e.target.value)}
                              className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all font-semibold"
                           />
                        </div>
                        <div className="w-full md:w-48">
                           <label className="block text-slate-900 text-xs font-bold uppercase tracking-wider mb-2">Scan Range</label>
                           <select
                              value={vivahDays}
                              onChange={(e) => setVivahDays(parseInt(e.target.value))}
                              className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all font-semibold"
                           >
                              <option value={30}>30 Days</option>
                              <option value={60}>60 Days</option>
                              <option value={90}>90 Days</option>
                              <option value={120}>120 Days</option>
                           </select>
                        </div>
                        <button
                           onClick={() => handleCalculateVivah()}
                           disabled={isCalculatingVivah}
                           className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all uppercase tracking-widest text-xs disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                           {isCalculatingVivah ? (
                              <>
                                 <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                 Calculating...
                              </>
                           ) : "Find Muhurtas"}
                        </button>
                     </div>
                  </div>

                  {vivahError && (
                     <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 mb-6 font-semibold text-sm">
                        ⚠️ {vivahError}
                     </div>
                  )}

                  {vivahResults && vivahResults.length > 0 && (
                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left column: List of dates */}
                        <div className="lg:col-span-5 space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                           <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Dates Heatmap</h3>
                           {vivahResults.map((item, idx) => (
                              <div
                                 key={idx}
                                 onClick={() => setSelectedVivahDate(item)}
                                 className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${selectedVivahDate?.date === item.date
                                    ? 'bg-orange-50 border-orange-300 shadow-md scale-[1.01]'
                                    : 'bg-white border-slate-100 hover:border-slate-300'
                                    }`}
                              >
                                 <div>
                                    <div className="flex items-center gap-2">
                                       <span className="font-bold text-slate-900 text-sm">
                                          {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                       </span>
                                       <span className="text-[12px] text-slate-800 font-medium">({item.weekday})</span>
                                    </div>
                                    <div className="text-[12px] text-slate-800 font-medium mt-1">
                                       {item.tithi} • {item.nakshatra}
                                    </div>
                                 </div>
                                 <div>
                                    {item.is_auspicious ? (
                                       <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                                          🌟 Auspicious
                                       </span>
                                    ) : (
                                       <span className="bg-rose-50 text-rose-500 border border-rose-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                          Inauspicious
                                       </span>
                                    )}
                                 </div>
                              </div>
                           ))}
                        </div>

                        {/* Right column: Step-by-Step Mathematical Checker */}
                        <div className="lg:col-span-7 bg-slate-50 border border-slate-100 p-8 rounded-[2rem] shadow-sm">
                           {selectedVivahDate ? (
                              <div className="space-y-6">
                                 <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                                    <div>
                                       <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">Selected Date Analysis</span>
                                       <h4 className="text-xl font-bold text-slate-800 mt-1">
                                          {new Date(selectedVivahDate.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                       </h4>
                                       <p className="text-xs text-slate-400 mt-0.5">{selectedVivahDate.weekday}</p>
                                    </div>
                                    <div>
                                       {selectedVivahDate.is_auspicious ? (
                                          <div className="bg-emerald-500 text-white font-bold py-2 px-4 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                                             Passed All Steps
                                          </div>
                                       ) : (
                                          <div className="bg-rose-500 text-white font-bold py-2 px-4 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-rose-500/20">
                                             Failed Checks
                                          </div>
                                       )}
                                    </div>
                                 </div>

                                 {/* 6-step display */}
                                 <div className="space-y-4">
                                    {/* Step 1 */}
                                    <div className="flex items-start gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                       <div className="text-2xl mt-0.5">ℹ️</div>
                                       <div className="flex-1">
                                          <h5 className="font-bold text-slate-800 text-sm">Step 1: Janma Nakshatra & Moon Sign</h5>
                                          <p className="text-xs text-slate-900 mt-1">Birth profiles retrieved from charts:</p>
                                          <div className="grid grid-cols-2 gap-4 mt-2">
                                             <div className="bg-pink-50/50 p-2.5 rounded-xl border border-pink-100 text-center">
                                                <div className="text-[9px] font-black uppercase text-pink-600">Bride's Birth Star</div>
                                                <div className="text-xs font-bold text-slate-800 mt-0.5">{selectedVivahDate.steps.step1.bride_nak}</div>
                                             </div>
                                             <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 text-center">
                                                <div className="text-[9px] font-black uppercase text-blue-600">Groom's Birth Star</div>
                                                <div className="text-xs font-bold text-slate-800 mt-0.5">{selectedVivahDate.steps.step1.groom_nak}</div>
                                             </div>
                                          </div>
                                       </div>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="flex items-start gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                       <div className="text-2xl mt-0.5">{selectedVivahDate.steps.step2.pass ? "✅" : "❌"}</div>
                                       <div className="flex-1">
                                          <h5 className="font-bold text-slate-800 text-sm">Step 2: Auspicious Marriage Nakshatras</h5>
                                          <p className="text-xs text-slate-800 mt-1">
                                             Transit Nakshatra is <strong className="text-slate-700">{selectedVivahDate.steps.step2.nakshatra}</strong>.
                                          </p>
                                          <div className="text-[10px] text-slate-800 mt-1">
                                             {selectedVivahDate.steps.step2.pass
                                                ? "Passed: This Nakshatra is traditionally auspicious for marriages."
                                                : "Failed: This Nakshatra is not in the list of 11 traditional wedding stars."}
                                          </div>
                                       </div>
                                    </div>

                                    {/* Step 3 */}
                                    <div className="flex items-start gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                       <div className="text-2xl mt-0.5">{selectedVivahDate.steps.step3.pass ? "✅" : "❌"}</div>
                                       <div className="flex-1">
                                          <h5 className="font-bold text-slate-800 text-sm">Step 3: Dual Tara Bala (Strength of Stars)</h5>
                                          <div className="grid grid-cols-2 gap-4 mt-2">
                                             <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                <div className="text-[9px] font-black uppercase text-slate-500">Bride Tara</div>
                                                <div className="text-xs font-bold text-slate-800 mt-0.5">{selectedVivahDate.steps.step3.bride_tara}</div>
                                                <div className="text-[9px] font-medium text-slate-400">Remainder {selectedVivahDate.steps.step3.bride_remainder}</div>
                                             </div>
                                             <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                <div className="text-[9px] font-black uppercase text-slate-800">Groom Tara</div>
                                                <div className="text-xs font-bold text-slate-800 mt-0.5">{selectedVivahDate.steps.step3.groom_tara}</div>
                                                <div className="text-[9px] font-medium text-slate-800">Remainder {selectedVivahDate.steps.step3.groom_remainder}</div>
                                             </div>
                                          </div>
                                          <div className="text-[10px] text-slate-800 mt-2">
                                             {selectedVivahDate.steps.step3.pass
                                                ? "Passed: Both partners have auspicious Tara Bala remainders (2, 4, 6, 8, or 9)."
                                                : "Failed: One or both partners have inauspicious Tara Bala (remainder 3, 5, or 7)."}
                                          </div>
                                       </div>
                                    </div>

                                    {/* Step 4 */}
                                    <div className="flex items-start gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                       <div className="text-2xl mt-0.5">{selectedVivahDate.steps.step4.pass ? "✅" : "❌"}</div>
                                       <div className="flex-1">
                                          <h5 className="font-bold text-slate-800 text-sm">Step 4: Chandra Bala (Moon Strength)</h5>
                                          <div className="grid grid-cols-2 gap-4 mt-2">
                                             <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                <div className="text-[9px] font-black uppercase text-slate-800">Bride Transit House</div>
                                                <div className="text-xs font-bold text-slate-800 mt-0.5">{selectedVivahDate.steps.step4.bride_house}th House</div>
                                                <div className={`text-[9px] font-bold mt-0.5 ${[4, 8, 12].includes(selectedVivahDate.steps.step4.bride_house) ? 'text-red-500' : 'text-emerald-500'}`}>
                                                   {[4, 8, 12].includes(selectedVivahDate.steps.step4.bride_house) ? 'Unfavorable' : 'Favorable'}
                                                </div>
                                             </div>
                                             <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                <div className="text-[9px] font-black uppercase text-slate-800">Groom Transit House</div>
                                                <div className="text-xs font-bold text-slate-800 mt-0.5">{selectedVivahDate.steps.step4.groom_house}th House</div>
                                                <div className={`text-[9px] font-bold mt-0.5 ${[4, 8, 12].includes(selectedVivahDate.steps.step4.groom_house) ? 'text-red-500' : 'text-emerald-500'}`}>
                                                   {[4, 8, 12].includes(selectedVivahDate.steps.step4.groom_house) ? 'Unfavorable' : 'Favorable'}
                                                </div>
                                             </div>
                                          </div>
                                          <div className="text-[10px] text-slate-400 mt-2">
                                             Avoids transit Moon positioned in 4th, 8th, and 12th houses from natal Moon signs.
                                          </div>
                                       </div>
                                    </div>

                                    {/* Step 5 */}
                                    <div className="flex items-start gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                       <div className="text-2xl mt-0.5">{selectedVivahDate.steps.step5.pass ? "✅" : "❌"}</div>
                                       <div className="flex-1">
                                          <h5 className="font-bold text-slate-800 text-sm">Step 5: Planetary Combustions</h5>
                                          <div className="flex flex-col gap-2 mt-2">
                                             <div className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-xl border border-slate-100">
                                                <span className="font-semibold text-slate-800">Bride's Guru Shuddhi (Jupiter):</span>
                                                <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${selectedVivahDate.steps.step5.jupiter_combust ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                                   {selectedVivahDate.steps.step5.jupiter_combust ? 'Combust (Asta)' : 'Pure (Udaya)'}
                                                </span>
                                             </div>
                                             <div className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-xl border border-slate-100">
                                                <span className="font-semibold text-slate-800">Groom's Shukra Shuddhi (Venus):</span>
                                                <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${selectedVivahDate.steps.step5.venus_combust ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                                   {selectedVivahDate.steps.step5.venus_combust ? 'Combust (Asta)' : 'Pure (Udaya)'}
                                                </span>
                                             </div>
                                          </div>
                                       </div>
                                    </div>

                                    {/* Step 6 */}
                                    <div className="flex items-start gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                       <div className="text-2xl mt-0.5">{selectedVivahDate.steps.step6.pass ? "✅" : "❌"}</div>
                                       <div className="flex-1">
                                          <h5 className="font-bold text-slate-800 text-sm">Step 6: Auspicious Tithi & Weekday</h5>
                                          <div className="grid grid-cols-2 gap-4 mt-2">
                                             <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                <div className="text-[9px] font-black uppercase text-slate-800">Tithi</div>
                                                <div className="text-xs font-bold text-slate-800 mt-0.5">{selectedVivahDate.tithi}</div>
                                             </div>
                                             <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                <div className="text-[9px] font-black uppercase text-slate-800">Weekday</div>
                                                <div className="text-xs font-bold text-slate-800 mt-0.5">{selectedVivahDate.weekday}</div>
                                             </div>
                                          </div>
                                          <div className="text-[10px] text-slate-800 mt-2">
                                             Requires Dwitiya, Tritiya, Panchami, Saptami, Dashami, Ekadashi, or Trayodashi. Rejects Rikta Tithis (4, 9, 14), Amavasya, and Eclipses.
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           ) : (
                              <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-50">
                                 <span className="text-4xl">📅</span>
                                 <h4 className="font-bold text-slate-700 mt-3">Select a date from list</h4>
                                 <p className="text-xs text-slate-500 mt-1">Select any date on the left to inspect its astrological parameters.</p>
                              </div>
                           )}
                        </div>
                     </div>
                  )}
               </section>
            )}

            {/* Girl Kundali Analysis */}

            {bride_kundali && (
               <section className="bg-white rounded-[2.5rem] p-12 shadow-xl border border-slate-100">
                  <div className="text-center mb-10">
                     <h3 className="text-[14px] font-black uppercase tracking-[0.5em] text-pink-500 mb-2">Individual Destiny Assessment</h3>
                     <h2 className="text-3xl font-serif italic text-slate-800">Bride's Kundali Deep Dive</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {[
                        { title: 'Marriage Promise', value: bride_kundali.marriage_promise, icon: '🌟' },
                        { title: 'Marriage Quality', value: bride_kundali.marriage_quality, icon: '✨' },
                        { title: 'Spouse Nature', value: bride_kundali.spouse_nature, icon: '🤵' },
                        { title: 'Longevity of Relationship', value: bride_kundali.longevity, icon: '♾️' },
                        { title: 'Emotional Harmony', value: bride_kundali.emotional_harmony, icon: '❤️' },
                        { title: 'Children', value: bride_kundali.children, icon: '👶' },
                        { title: 'Divorce Possibility', value: bride_kundali.divorce_possibility, icon: '⚖️' },
                        { title: 'Timing of Marriage', value: bride_kundali.timing_of_marriage, icon: '⏳' },
                        { title: 'Family Life', value: bride_kundali.family_life, icon: '👨‍👩‍👧‍👦' },
                        { title: 'Financial Stability', value: bride_kundali.financial_stability, icon: '💰' },
                        { title: 'Health of Spouse', value: bride_kundali.health_of_spouse, icon: '⚕️' },
                     ].map((item, idx) => (
                        <div key={idx} className="bg-pink-50/30 p-6 rounded-2xl border border-pink-100 hover:border-pink-300 transition-colors">
                           <div className="flex items-center gap-3 mb-3">
                              <div className="text-2xl">{item.icon}</div>
                              <h4 className="text-[14px] font-black uppercase tracking-widest text-slate-600">{item.title}</h4>
                           </div>
                           <p className="text-[16px] text-slate-900 font-medium leading-relaxed">{item.value}</p>
                        </div>
                     ))}
                  </div>
               </section>
            )}

            {/* Boy Kundali Analysis */}
            {groom_kundali && (
               <section className="bg-white rounded-[2.5rem] p-12 shadow-xl border border-slate-100">
                  <div className="text-center mb-10">
                     <h3 className="text-[14px] font-black uppercase tracking-[0.5em] text-blue-500 mb-2">Individual Destiny Assessment</h3>
                     <h2 className="text-3xl font-serif italic text-slate-800">Groom's Kundali Deep Dive</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {[
                        { title: 'Marriage Promise', value: groom_kundali.marriage_promise, icon: '🚀' },
                        { title: 'Wife Quality', value: groom_kundali.wife_quality, icon: '👰' },
                        { title: 'Relationship Stability', value: groom_kundali.relationship_stability, icon: '🏛️' },
                        { title: 'Family Life', value: groom_kundali.family_life, icon: '👨‍👩‍👧‍👦' },
                        { title: 'Financial Responsibility', value: groom_kundali.financial_responsibility, icon: '💰' },
                        { title: 'Emotional Maturity', value: groom_kundali.emotional_maturity, icon: '🧠' },
                        { title: 'Sexual Compatibility', value: groom_kundali.sexual_compatibility, icon: '🔥' },
                        { title: 'Children', value: groom_kundali.children, icon: '👶' },
                        { title: 'Longevity of Marriage', value: groom_kundali.longevity_of_marriage, icon: '♾️' },
                        { title: 'Divorce Possibility', value: groom_kundali.divorce_possibility, icon: '⚖️' },
                        { title: 'Timing of Marriage', value: groom_kundali.timing_of_marriage, icon: '⏳' },
                     ].map((item, idx) => (
                        <div key={idx} className="bg-blue-50/30 p-6 rounded-2xl border border-blue-100 hover:border-blue-300 transition-colors">
                           <div className="flex items-center gap-3 mb-3">
                              <div className="text-2xl">{item.icon}</div>
                              <h4 className="text-[14px] font-black uppercase tracking-widest text-slate-600">{item.title}</h4>
                           </div>
                           <p className="text-[16px] text-slate-900 font-medium leading-relaxed">{item.value}</p>
                        </div>
                     ))}
                  </div>
               </section>
            )}

            {/* Step 4: Ashta Koota Intelligence */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 bg-white rounded-[2rem] p-10 shadow-lg border border-slate-100">
                  <div className="flex justify-between items-end mb-10">
                     <div>
                        <h3 className="text-[16px] font-black uppercase tracking-widest text-slate-900 mb-1">Ashta Koota Scoring</h3>
                        <div className={`text-[36px] text-slate-900 font-serif italic ${getStatusColor(guna_milan.interpretation)}`}>
                           {gunaTotal} <span className="text-[20px] text-slate-900 font-sans not-italic">/ 36 Gunas</span>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-[16px] font-black uppercase text-amber-600 mb-1">Status</div>
                        <div className={`text-[20px] text-slate-900 font-bold uppercase tracking-widest ${getStatusColor(guna_milan.interpretation)}`}>{guna_milan.interpretation}</div>
                     </div>
                  </div>
                  {/* Professional Ashta Koota Matrix Table */}
                  <div className="overflow-x-auto mt-8">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="border-b-2 border-amber-100 bg-amber-50/20">
                              <th className="py-4 px-4 text-[14px] font-black uppercase tracking-widest text-amber-800">Guna</th>
                              <th className="py-4 px-4 text-[14px] font-black uppercase tracking-widest text-amber-800">Boy</th>
                              <th className="py-4 px-4 text-[14px] font-black uppercase tracking-widest text-amber-800">Girl</th>
                              <th className="py-4 px-4 text-[14px] font-black uppercase tracking-widest text-amber-800 text-center">Maximum Obtained</th>
                              <th className="py-4 px-4 text-[14px] font-black uppercase tracking-widest text-amber-800 text-center">Obtained Point</th>
                              <th className="py-4 px-4 text-[14px] font-black uppercase tracking-widest text-amber-800">Area Of Life</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {[
                              { name: "Varna", max: 1 },
                              { name: "Vashya", max: 2 },
                              { name: "Tara", max: 3 },
                              { name: "Yoni", max: 4 },
                              { name: "Graha Maitri", max: 5 },
                              { name: "Gana", max: 6 },
                              { name: "Bhakoot", max: 7 },
                              { name: "Nadi", max: 8 }
                           ].map((koota) => {
                              const score = guna_milan.scores?.[koota.name] || 0;
                              const detail = guna_milan.details?.[koota.name] || {};
                              return (
                                 <tr key={koota.name} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-5 px-4 text-[16px] font-bold text-red-500 font-serif italic">{koota.name}</td>
                                    <td className="py-5 px-4 text-[16px] text-slate-900 font-medium">{detail.boy || "—"}</td>
                                    <td className="py-5 px-4 text-[16px] text-slate-900 font-medium">{detail.girl || "—"}</td>
                                    <td className="py-5 px-4 text-[20px] text-slate-900 font-mono text-center font-bold">{koota.max}</td>
                                    <td className="py-5 px-4 text-[16px] font-black text-slate-900 text-center">{score}</td>
                                    <td className="py-5 px-4 text-[14px] font-bold text-slate-900 uppercase tracking-tighter">{detail.area}</td>
                                 </tr>
                              );
                           })}
                        </tbody>
                     </table>
                  </div>
               </div>

               {/* Planetary Afflictions Card */}
               <div className="bg-white rounded-[2rem] p-10 shadow-lg border border-slate-100 flex flex-col">
                  <h3 className="text-[18px] font-black uppercase tracking-[0.3em] text-slate-900 mb-8">Planetary Afflictions</h3>
                  <div className="space-y-6 flex-1">
                     {risk.afflictions?.length > 0 ? (
                        risk.afflictions.map((a, i) => (
                           <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
                              <div className="flex justify-between items-center mb-2">
                                 <h4 className="text-[14px] font-bold text-slate-900 uppercase tracking-tight">{a.title}</h4>
                                 <span className={`text-[14px] font-black px-2 py-0.5 rounded-md uppercase ${a.impact === 'Severe' ? 'bg-rose-100 text-rose-600' : a.impact === 'High' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {a.impact} Impact
                                 </span>
                              </div>
                              <p className="text-[16px] leading-relaxed text-slate-900">{a.description}</p>
                           </div>
                        ))
                     ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                           <div className="text-4xl mb-2">✨</div>
                           <p className="text-[10px] font-black uppercase tracking-widest">No Major Afflictions</p>
                        </div>
                     )}
                  </div>
               </div>

               {/* Divorce Risk Diagnostic Card */}

            </div>

            {/* Core Relationship & Family Dynamics Table */}
            {report.custom_matchmaking_topics && (
               <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100 relative overflow-hidden mt-12 mb-12">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-500"></div>
                  <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none"></div>

                  <div className="text-center mb-10">
                     <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-teal-600 mb-2">Bhava &amp; Grah Milan</h3>
                     <h2 className="text-4xl font-serif italic text-slate-900">  Married life &amp; family compatibility (दाम्पत्य जीवन और पारिवारिक मैत्री) </h2>
                     <p className="text-slate-500 mt-3 max-w-2xl mx-auto text-base">
                        A detailed breakdown of key domestic, emotional, and social parameters governing the marital bond, based on Vedic astrological principles.
                     </p>
                  </div>

                  <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-sm bg-slate-50/50 backdrop-blur-md">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="bg-slate-100 text-slate-800 text-sm uppercase tracking-widest border-b border-slate-200">
                              <th className="px-6 py-4 font-semibold w-1/3">Topic / Dimension</th>
                              <th className="px-6 py-4 font-semibold w-1/4">Category</th>
                              <th className="px-6 py-4 font-semibold text-center w-1/6">Verdict</th>
                              <th className="px-6 py-4 font-semibold w-2/5">Astrological Explanation</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                           {report.custom_matchmaking_topics.map((item, idx) => {
                              let verdictColor = "text-amber-700 bg-amber-50 border-amber-200";
                              if (item.verdict === "Good") verdictColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
                              if (item.verdict === "Bad") verdictColor = "text-rose-700 bg-rose-50 border-rose-200";

                              // Simple icon mapper based on keyword
                              let icon = "🔮";
                              const lowerTopic = item.topic.toLowerCase();
                              if (lowerTopic.includes("girl") || lowerTopic.includes("family")) icon = "👨‍👩‍👧‍👦";
                              if (lowerTopic.includes("live independently")) icon = "🏡";
                              if (lowerTopic.includes("emotional") || lowerTopic.includes("resonance")) icon = "❤️";
                              if (lowerTopic.includes("ego") || lowerTopic.includes("clashes")) icon = "⚖️";
                              if (lowerTopic.includes("fortune") || lowerTopic.includes("financial")) icon = "💰";
                              if (lowerTopic.includes("career")) icon = "💼";
                              if (lowerTopic.includes("progeny") || lowerTopic.includes("legacy")) icon = "👶";
                              if (lowerTopic.includes("health") || lowerTopic.includes("longevity")) icon = "❇️";
                              if (lowerTopic.includes("arguments") || lowerTopic.includes("disputes")) icon = "💬";
                              if (lowerTopic.includes("manglik")) icon = "🔥";

                              return (
                                 <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-5 font-bold text-slate-800 text-[15px] flex items-center gap-3">
                                       <span className="text-xl shrink-0">{icon}</span>
                                       <span>{item.topic}</span>
                                    </td>
                                    <td className="px-6 py-5 text-sm text-slate-500 font-medium">{item.category}</td>
                                    <td className="px-6 py-5 text-center">
                                       <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${verdictColor}`}>
                                          {item.verdict}
                                       </span>
                                    </td>
                                    <td className="px-6 py-5 text-[16px] leading-relaxed text-slate-900 font-medium">
                                       {item.explanation}
                                    </td>
                                 </tr>
                              );
                           })}
                        </tbody>
                     </table>
                  </div>
               </section>
            )}

            {/* Knowledge Base Section */}
            <section className="bg-slate-50 rounded-[2.5rem] p-12 border border-slate-100 shadow-inner">
               <h3 className="text-[14px] font-black uppercase tracking-[0.5em] text-slate-900 mb-10 text-center">Vedic Compatibility Encyclopedia</h3>
               <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {Object.entries(KOOTA_DESCRIPTIONS).map(([name, desc]) => (
                     <div key={name} className="space-y-2">
                        <h4 className="text-[16px] font-black uppercase text-indigo-600 tracking-widest">{name}</h4>
                        <p className="text-[16px] leading-relaxed text-slate-900">{desc}</p>
                     </div>
                  ))}
               </div>

               <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                     <h4 className="text-[16px] font-black uppercase tracking-widest text-slate-900 mb-4">Scoring Interpretation Scale</h4>
                     <div className="space-y-3">
                        <div className="flex justify-between items-center text-[16px] p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                           <span className="font-bold text-emerald-700">33 to 36 Points</span>
                           <span className="uppercase font-black text-[16px] text-emerald-500">Excellent Match</span>
                        </div>
                        <div className="flex justify-between items-center text-xs p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                           <span className="font-bold text-emerald-600">25 to 32 Points</span>
                           <span className="uppercase font-black text-[10px] text-emerald-500">Very Good Match</span>
                        </div>
                        <div className="flex justify-between items-center text-xs p-3 bg-amber-50 rounded-xl border border-amber-100">
                           <span className="font-bold text-amber-700">18 to 24 Points</span>
                           <span className="uppercase font-black text-[10px] text-amber-500 text-right leading-tight max-w-[150px]">Acceptable; but need to consider other factors minutely</span>
                        </div>
                        <div className="flex justify-between items-center text-xs p-3 bg-rose-50 rounded-xl border border-rose-100">
                           <span className="font-bold text-rose-700">Below 18 Points</span>
                           <span className="uppercase font-black text-[10px] text-rose-500">Not Compatible Match</span>
                        </div>
                     </div>
                  </div>
                  <div className="flex flex-col justify-center bg-rose-100 rounded-[2rem] p-8 text-black relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -mr-16 -mt-16 rounded-full blur-2xl"></div>
                     <h4 className="text-[18px] font-serif italic mb-4">A Note on Compatibility</h4>
                     <p className="text-[18px] leading-relaxed text-black opacity-80">
                        While Ashta Koota is the primary metric for Vedic matching, a high score alone does not guarantee success. Our ULTRA PRO engine also considers Manglik Dosha, Navamsa Stability, and Planetary Afflictions to provide this synthesized Success Probability.
                     </p>
                  </div>
               </div>
            </section>

            {/* Step 4: Timing & Stability */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {/* Timing Card */}
               <div className="bg-white rounded-[2rem] p-10 shadow-lg border border-slate-100">
                  <h3 className="text-[14px] font-black uppercase tracking-[0.3em] text-slate-900 mb-8">Marriage Timing</h3>
                  <div className="space-y-6">
                     {timing.favorable_years.map(year => (
                        <div key={year} className="flex justify-between items-center p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                           <span className="text-lg font-bold text-indigo-900">{year}</span>
                           <span className="text-[12px] font-black uppercase text-indigo-900 bg-white px-3 py-1 rounded-full shadow-sm">High Probability</span>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Manglik Section */}
               <div className="bg-white rounded-[2rem] p-10 shadow-lg border border-slate-100">
                  <h3 className="text-[14px] font-black uppercase tracking-[0.3em] text-slate-900 mb-8">Manglik Sync</h3>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                        <span className="text-[12px] font-bold text-slate-900 uppercase">Bride</span>
                        <span className={`text-[12px] font-black px-3 py-1 rounded-full ${manglik.bride?.is_manglik ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>{manglik.bride?.is_manglik ? 'Manglik' : 'Clear'}</span>
                     </div>
                     <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                        <span className="text-[12px] font-bold text-slate-900 uppercase">Groom</span>
                        <span className={`text-[12px] font-black px-3 py-1 rounded-full ${manglik.groom?.is_manglik ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>{manglik.groom?.is_manglik ? 'Manglik' : 'Clear'}</span>
                     </div>
                     <p className="text-[16px] text-slate-900 italic mt-4 pt-4 border-t border-slate-100 text-center leading-relaxed">"{manglik.analysis?.reason}"</p>
                  </div>
               </div>

               {/* Nadi Dosha Section */}
               <div className="bg-white rounded-[2rem] p-10 shadow-lg border border-slate-100">
                  <h3 className="text-[14px] font-black uppercase tracking-[0.3em] text-slate-900 mb-8">Nadi Dosha</h3>
                  <div className="flex flex-col items-center justify-center space-y-4">
                     <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-sm ${hasNadiDosha ? 'bg-rose-50 border-2 border-rose-100' : 'bg-emerald-50 border-2 border-emerald-100'}`}>
                        {hasNadiDosha ? '⚠️' : '✅'}
                     </div>
                     <div className="text-center">
                        <div className="text-lg font-bold text-slate-800">{hasNadiDosha ? 'Dosha Present' : 'Clear'}</div>
                        <div className={`text-[14px] font-black uppercase mt-1 ${hasNadiDosha ? 'text-rose-600' : 'text-emerald-600'}`}>Health & Genetics</div>
                     </div>
                     <p className="text-[16px] text-slate-900 italic text-center leading-relaxed mt-2 pt-4 border-t border-slate-100">
                        {hasNadiDosha ? '"0/8 points. Strict medical and genetic compatibility screening advised."' : '"Excellent Nadi compatibility. Genetic flow is harmonious."'}
                     </p>
                  </div>
               </div>

               {/* Bhakoot Dosha Section */}
               <div className="bg-white rounded-[2rem] p-10 shadow-lg border border-slate-100">
                  <h3 className="text-[14px] font-black uppercase tracking-[0.3em] text-slate-900 mb-8">Bhakoot Dosha</h3>
                  <div className="flex flex-col items-center justify-center space-y-4">
                     <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-sm ${hasBhakootDosha ? 'bg-rose-50 border-2 border-rose-100' : 'bg-emerald-50 border-2 border-emerald-100'}`}>
                        {hasBhakootDosha ? '⚠️' : '✅'}
                     </div>
                     <div className="text-center">
                        <div className="text-lg font-bold text-slate-800">{hasBhakootDosha ? 'Dosha Present' : 'Clear'}</div>
                        <div className={`text-[14px] font-black uppercase mt-1 ${hasBhakootDosha ? 'text-rose-600' : 'text-emerald-600'}`}>Emotional Resonance</div>
                     </div>
                     <p className="text-[16px] text-slate-900 italic text-center leading-relaxed mt-2 pt-4 border-t border-slate-100">
                        {hasBhakootDosha ? '"0/7 points. Indicates potential emotional friction or misunderstandings."' : '"Excellent Bhakoot compatibility. Emotional alignment is strong."'}
                     </p>
                  </div>
               </div>

               {/* Navamsa D9 Section */}
               <div className="bg-white rounded-[2rem] p-10 shadow-lg border border-slate-100">
                  <h3 className="text-[14px] font-black uppercase tracking-[0.3em] text-slate-900 mb-8">Spiritual Stability (D9)</h3>
                  <div className="flex items-center gap-6 mb-8">
                     <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-3xl shadow-sm">🧘</div>
                     <div>
                        <div className="text-lg font-bold text-slate-800">{navamsa.spiritual_bond} Bond</div>
                        <div className="text-[14px] font-black uppercase text-purple-600">{navamsa.long_term_prospect} Prospect</div>
                     </div>
                  </div>
                  <p className="text-[16px] text-slate-900 italic leading-relaxed">"{navamsa.description}"</p>
               </div>
            </div>

            {/* Step 5: Professional Remedies Panel */}
            <section className="bg-white rounded-[2.5rem] p-12 shadow-xl border border-slate-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-full bg-slate-50/50 -skew-x-12"></div>
               <h3 className="text-[18px] font-black uppercase tracking-[0.5em] text-slate-900 mb-10 text-center">Destiny Balancing Protocol</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                  {remedies.map((r, i) => (
                     <div key={i} className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all group hover:shadow-md">
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform">
                           {r.type === "Gemstone" ? "💎" : r.type === "Mantra" ? "📿" : "🔥"}
                        </div>
                        <h4 className="text-[16px] font-black uppercase tracking-widest text-slate-900 mb-2">{r.type}</h4>
                        <h5 className="text-[18px] font-serif italic text-amber-800 mb-3">{r.title}</h5>
                        <p className="text-[16px] leading-relaxed text-slate-900">{r.description}</p>
                     </div>
                  ))}
               </div>
            </section>

            {/* Step 5.5: Garbhadhana Muhurta Section */}
            <div className="mb-12">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-600 to-purple-800 flex items-center justify-center shadow-lg border border-fuchsia-500/30">
                     <span className="text-2xl text-white">🌸</span>
                  </div>
                  <div>
                     <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-600 uppercase tracking-tight">Garbhadhana Muhurta</h2>
                     <p className="text-slate-900 text-[18px] mt-1">Conception Timing based on both partners' Tara Bala & Ritu Kaal</p>
                  </div>
               </div>

               <div className="bg-slate-800/10 rounded-2xl border border-slate-700 p-8 shadow-xl">
                  <div className="flex flex-col md:flex-row items-end gap-4 mb-8">
                     <div className="flex-1 w-full">
                        <label className="block text-slate-900 text-[16px] font-bold uppercase tracking-wider mb-2">Cycle Start Date (Ritu Kaal)</label>
                        <input
                           type="date"
                           value={garbhadhanaCycleStart}
                           onChange={(e) => setGarbhadhanaCycleStart(e.target.value)}
                           className="w-full bg-slate-900 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-fuchsia-500 transition-colors"
                        />
                     </div>
                     <button
                        onClick={handleCalculateGarbhadhana}
                        disabled={isCalculatingGarbhadhana}
                        className="w-full md:w-auto bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg border border-fuchsia-500/30 transition-all uppercase tracking-widest text-sm disabled:opacity-50"
                     >
                        {isCalculatingGarbhadhana ? "Calculating..." : "Find Muhurtas"}
                     </button>
                  </div>

                  {garbhadhanaError && (
                     <div className="p-4 rounded-xl bg-red-900/30 border border-red-500/50 text-red-400 mb-6 font-medium text-sm">
                        {garbhadhanaError}
                     </div>
                  )}

                  {garbhadhanaResults && (
                     <div>
                        <h3 className="text-lg font-bold text-slate-200 mb-4 border-b border-slate-700 pb-2">Auspicious Conception Nights</h3>
                        {garbhadhanaResults.length === 0 ? (
                           <div className="text-slate-400 italic text-center p-6 bg-slate-900/50 rounded-xl border border-slate-800">
                              No highly auspicious dates found in the 16-day window matching both partners' charts.
                           </div>
                        ) : (
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {garbhadhanaResults.map((res, i) => (
                                 <div key={i} className="bg-slate-900 rounded-xl p-5 border border-fuchsia-900/30 shadow-inner relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                       <span className="text-4xl text-fuchsia-500">🌸</span>
                                    </div>
                                    <div className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest mb-1">Cycle Night {res.cycle_day}</div>
                                    <div className="text-xl font-black text-white mb-3">{res.date}</div>

                                    <div className="space-y-1.5 text-sm">
                                       <div className="flex justify-between items-center bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                                          <span className="text-slate-400">Prediction</span>
                                          <span className="font-bold text-emerald-400">{res.gender_prediction}</span>
                                       </div>
                                       <div className="flex justify-between items-center bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                                          <span className="text-slate-400">Nakshatra</span>
                                          <span className="text-slate-200 font-medium">{res.nakshatra}</span>
                                       </div>
                                       <div className="flex justify-between items-center bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                                          <span className="text-slate-400">Tithi</span>
                                          <span className="text-slate-200 font-medium">Day {res.tithi}</span>
                                       </div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        )}
                        <p className="text-xs text-slate-500 mt-6 text-center italic">
                           Note: Results automatically filter out forbidden days (1-4, 11, 13) and verify Dual Tara Bala for both partners.
                        </p>
                     </div>
                  )}
               </div>
            </div>

            {/* Step 6: Enterprise Matchmaking Intelligence */}
            {report.enterprise_analysis && (
               <section className="bg-white rounded-[2.5rem] p-12 text-white shadow-2xl relative overflow-hidden border border-slate-700">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full -mr-32 -mt-32"></div>
                  <div className="text-center mb-12">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400 mb-2">Sookshma Vivechan (सूक्ष्म विवेचन)</h3>
                     <h2 className="text-4xl font-serif italic text-slate-900">Artha & Karma Samiksha (अर्थ एवं कर्म समीक्षा)</h2>
                  </div>

                  {/* Professional Scoring Model */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                     <div className="bg-slate-900 rounded-3xl p-8 border border-white/10 backdrop-blur-sm flex flex-col justify-center">
                        <h4 className="text-[18px] font-black uppercase tracking-[0.3em] text-indigo-300 mb-6 text-center">Professional Final Score</h4>
                        <div className="text-center">
                           <div className="text-7xl font-serif italic font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400 mb-2">
                              {entScore}
                              <span className="text-2xl text-slate-400 not-italic font-sans">/100</span>
                           </div>
                           <p className="text-[14px] text-slate-400 uppercase tracking-widest">Master Compatibility Index</p>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <h4 className="text-[14px] font-black uppercase tracking-[0.3em] text-black mb-6">AI Relationship Forecasting</h4>
                        <div className="bg-slate-900 p-6 rounded-2xl border border-indigo-500/30">
                           <div className="flex justify-between items-center mb-2">
                              <span className="text-[14px] font-bold uppercase tracking-wider">Prediction</span>
                              <span className={`text-[14px] font-black px-3 py-1 rounded-full ${aiForecast.risk === 'LOW' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>{aiForecast.risk} RISK</span>
                           </div>
                           <p className="text-[16px] font-serif italic">{aiForecast.prediction}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-slate-900 p-4 rounded-2xl border border-white/10">
                              <div className="text-[14px] font-black uppercase text-slate-400 mb-1">Longevity Score</div>
                              <div className="text-2xl font-bold">{longevity.longevity}</div>
                           </div>
                           <div className="bg-slate-900 p-4 rounded-2xl border border-white/10">
                              <div className="text-[14px] font-black uppercase text-slate-400 mb-1">Divorce Risk</div>
                              <div className="text-2xl font-bold text-rose-400">{divorceRisk.risk_score}%</div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Component Scores */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                     <div className="bg-slate-900 p-5 rounded-2xl border border-white/10 text-center hover:bg-white/10 transition">
                        <div className="text-3xl mb-2">❤️</div>
                        <div className="text-[14px] font-black uppercase text-slate-400 tracking-widest">Intimacy</div>
                        <div className="text-[18px] font-bold">{intimacy.score}</div>
                     </div>
                     <div className="bg-slate-900 p-5 rounded-2xl border border-white/10 text-center hover:bg-white/10 transition">
                        <div className="text-3xl mb-2">💰</div>
                        <div className="text-[14px] font-black uppercase text-slate-400 tracking-widest">Financial Harmony</div>
                        <div className="text-[18px] font-bold">{financial.score}</div>
                     </div>
                     <div className="bg-slate-900 p-5 rounded-2xl border border-white/10 text-center hover:bg-white/10 transition">
                        <div className="text-3xl mb-2">👨‍👩‍👧‍👦</div>
                        <div className="text-[14px] font-black uppercase text-slate-400 tracking-widest">Family Harmony</div>
                        <div className="text-[18px] font-bold">{familyHarmony.score}</div>
                     </div>
                     <div className="bg-slate-900 p-5 rounded-2xl border border-white/10 text-center hover:bg-white/10 transition">
                        <div className="text-3xl mb-2">⚖️</div>
                        <div className="text-[14px] font-black uppercase text-slate-400 tracking-widest">Stability</div>
                        <div className="text-xl font-bold">{longevity.stability}</div>
                     </div>
                  </div>

                  {/* Master Relationship Flow Pipeline */}
                  <div>
                     <h4 className="text-[16px] font-black uppercase tracking-[0.3em] text-black mb-6 text-center">Master Relationship Flow</h4>
                     <div className="flex flex-wrap justify-center gap-3">
                        {['Birth Charts', 'Compatibility Analysis', 'Marriage Promise', 'Emotional Matching', 'Navamsha Analysis', 'Dasha Synchronization', 'Transit Activation', 'Marriage Timing', 'Marriage Quality', 'Children', 'Longevity', 'Divorce Risk', 'AI Prediction'].map((step, i) => (
                           <React.Fragment key={step}>
                              <div className="px-4 py-2 bg-rose-50 rounded-full border border-indigo-700/50 text-[12px] font-bold uppercase tracking-widest text-slate-900">
                                 {step}
                              </div>
                              {i < 12 && <div className="text-black self-center">→</div>}
                           </React.Fragment>
                        ))}
                     </div>
                  </div>

                  {/* Newly integrated modular frontend components */}
                  <MarriageDashboard report={report} />

               </section>
            )}

            {/* Flex Estimation for Girl */}
            <section className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-[2.5rem] p-12 shadow-xl border border-pink-100 flex flex-col lg:flex-row gap-12 items-center">
               <div className="flex-1 space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-pink-500 mb-2">Advanced Past Timeline</h3>
                  <h2 className="text-3xl font-serif italic text-slate-800">Flex Estimation for Girl</h2>
                  <p className="text-slate-600 font-medium tracking-wide">Astrology CAN estimate:</p>
                  <ul className="space-y-4">
                     <li className="flex items-center gap-3 text-sm text-slate-700 font-medium"><span className="text-emerald-500 text-lg">✅</span> whether marriage yogas were strongly activated</li>
                     <li className="flex items-center gap-3 text-sm text-slate-700 font-medium"><span className="text-emerald-500 text-lg">✅</span> whether marriage likely occurred in past dashas</li>
                     <li className="flex items-center gap-3 text-sm text-slate-700 font-medium"><span className="text-emerald-500 text-lg">✅</span> possibility of prior serious relationships</li>
                     <li className="flex items-center gap-3 text-sm text-slate-700 font-medium"><span className="text-emerald-500 text-lg">✅</span> divorce/remarriage potential</li>
                     <li className="flex items-center gap-3 text-sm text-slate-700 font-medium"><span className="text-emerald-500 text-lg">✅</span> hidden relationship tendencies</li>
                     <li className="flex items-center gap-3 text-sm text-slate-700 font-medium"><span className="text-emerald-500 text-lg">✅</span> timing windows of marriage manifestation</li>
                  </ul>
               </div>

               <div className="flex-1 w-full bg-white rounded-3xl p-8 shadow-lg border border-pink-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-500 mb-6 flex items-center gap-2">
                     <span className="text-xl">🚀</span> COMPLETE MARRIAGE ACTIVATION ANALYSIS
                  </h4>
                  <div className="flex flex-wrap gap-3 items-center mb-6">
                     {['7th house', '7th lord', 'Venus', 'Jupiter', 'D9', 'Dasha', 'Transit', 'Upapada', 'Darakaraka', 'Marriage yogas'].map((item, i, arr) => (
                        <React.Fragment key={item}>
                           <div className="px-4 py-2 bg-pink-50 text-pink-700 rounded-xl text-xs font-bold border border-pink-200 shadow-sm hover:scale-105 transition-transform cursor-default">
                              {item}
                           </div>
                           {i < arr.length - 1 && <div className="text-pink-300 font-black text-lg">+</div>}
                        </React.Fragment>
                     ))}
                  </div>

                  {!activationAnalysis && (
                     <button
                        onClick={handleActivationAnalysis}
                        disabled={isAnalyzingActivation}
                        className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-pink-500/30 transition-all active:scale-95 disabled:opacity-50"
                     >
                        {isAnalyzingActivation ? 'Analyzing Cosmic Data...' : 'Run Activation Analysis'}
                     </button>
                  )}

                  {activationAnalysis && (
                     <div className="mt-6 p-6 bg-pink-50/50 rounded-2xl border border-pink-100/50 prose prose-sm prose-pink max-w-none max-h-[500px] overflow-y-auto custom-scrollbar" dangerouslySetInnerHTML={{ __html: activationAnalysis }}>
                     </div>
                  )}
               </div>
            </section>

            {/* Flex Estimation for Boy */}
            <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[2.5rem] p-12 shadow-xl border border-blue-100 flex flex-col lg:flex-row gap-12 items-center">
               <div className="flex-1 space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 mb-2">Advanced Past Timeline</h3>
                  <h2 className="text-3xl font-serif italic text-slate-800">Flex Estimation for Boy</h2>
                  <p className="text-slate-600 font-medium tracking-wide">Astrology CAN estimate:</p>
                  <ul className="space-y-4">
                     <li className="flex items-center gap-3 text-sm text-slate-700 font-medium"><span className="text-emerald-500 text-lg">✅</span> whether marriage yogas were strongly activated</li>
                     <li className="flex items-center gap-3 text-sm text-slate-700 font-medium"><span className="text-emerald-500 text-lg">✅</span> whether marriage likely occurred in past dashas</li>
                     <li className="flex items-center gap-3 text-sm text-slate-700 font-medium"><span className="text-emerald-500 text-lg">✅</span> possibility of prior serious relationships</li>
                     <li className="flex items-center gap-3 text-sm text-slate-700 font-medium"><span className="text-emerald-500 text-lg">✅</span> divorce/remarriage potential</li>
                     <li className="flex items-center gap-3 text-sm text-slate-700 font-medium"><span className="text-emerald-500 text-lg">✅</span> hidden relationship tendencies</li>
                     <li className="flex items-center gap-3 text-sm text-slate-700 font-medium"><span className="text-emerald-500 text-lg">✅</span> timing windows of marriage manifestation</li>
                  </ul>
               </div>

               <div className="flex-1 w-full bg-white rounded-3xl p-8 shadow-lg border border-blue-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-6 flex items-center gap-2">
                     <span className="text-xl">🚀</span> COMPLETE MARRIAGE ACTIVATION ANALYSIS
                  </h4>
                  <div className="flex flex-wrap gap-3 items-center mb-6">
                     {['7th house', '7th lord', 'Venus', 'Jupiter', 'D9', 'Dasha', 'Transit', 'Upapada', 'Darakaraka', 'Marriage yogas'].map((item, i, arr) => (
                        <React.Fragment key={item}>
                           <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold border border-blue-200 shadow-sm hover:scale-105 transition-transform cursor-default">
                              {item}
                           </div>
                           {i < arr.length - 1 && <div className="text-blue-300 font-black text-lg">+</div>}
                        </React.Fragment>
                     ))}
                  </div>

                  {!groomActivationAnalysis && (
                     <button
                        onClick={handleGroomActivationAnalysis}
                        disabled={isAnalyzingGroomActivation}
                        className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50"
                     >
                        {isAnalyzingGroomActivation ? 'Analyzing Cosmic Data...' : 'Run Activation Analysis'}
                     </button>
                  )}

                  {groomActivationAnalysis && (
                     <div className="mt-6 p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50 prose prose-sm prose-blue max-w-none max-h-[500px] overflow-y-auto custom-scrollbar" dangerouslySetInnerHTML={{ __html: groomActivationAnalysis }}>
                     </div>
                  )}
               </div>
            </section>

            {/* Embedded Synastry Matrix */}


            {/* AI Deep Report Section */}
            {(aiDeepReport || isGeneratingAiDeepReport) && (
               <section id="ai-deep-report-section" className="bg-white rounded-[2.5rem] p-12 shadow-xl border border-slate-100">
                  <div className="text-center mb-10">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-purple-500 mb-2">Divine AI Generation</h3>
                     <h2 className="text-3xl font-serif italic text-slate-800"> Compatibility Report</h2>
                  </div>
                  {isGeneratingAiDeepReport ? (
                     <div className="flex flex-col items-center justify-center p-12 space-y-4">
                        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-purple-600 font-serif italic">Synthesizing Planetary Matrices & Ultra PRO Data...</p>
                     </div>
                  ) : (
                     <div className="prose prose-purple max-w-none prose-h3:text-purple-600 prose-h3:font-serif prose-h3:text-2xl prose-h4:text-pink-500 bg-slate-50 p-8 rounded-3xl" dangerouslySetInnerHTML={{ __html: aiDeepReport }}>
                     </div>
                  )}
               </section>
            )}



            <footer className="w-full text-center py-8 text-slate-500 text-xs font-semibold mt-12 border-t border-slate-100">
               Copyright © 2026 Phanom Technologies. All Rights Reserved
            </footer>

         </div>

      </div>
   );
};

export default CompatibilityDashboard;
