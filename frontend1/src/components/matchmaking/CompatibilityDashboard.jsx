import React, { useState, useEffect } from 'react';
import ZodiacChart from '../ZodiacChart';
import MarriageDashboard from '../relationship/MarriageDashboard';
import SynastryDashboard from '../SynastryDashboard';
import ComprehensiveSummaryTable from './ComprehensiveSummaryTable';
import VimshottariDashaDisplay from './VimshottariDashaDisplay.jsx';
import DeepAnalysisReportModal from './DeepAnalysisReportModal';
import { Link } from 'react-router-dom';
import { Compass, BookOpen, Shield, Award, X } from 'lucide-react';
import { API_BASE_URL, PYTHON_ASTRO_URL, authAPI, buildAssetUrl } from '../../services/api';

const LANGUAGE_OPTIONS = [
   { code: 'en', label: 'English', native: 'English' },
   { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
   { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
   { code: 'te', label: 'Telugu', native: 'తెలుగు' },
   { code: 'mr', label: 'Marathi', native: 'मराठी' },
   { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
];

const CompatibilityDashboard = ({ bride, groom, brideFullData, groomFullData, report, bride_vimshottari, groom_vimshottari }) => {
   const brideVim = bride_vimshottari || report?.bride_vimshottari;
   const groomVim = groom_vimshottari || report?.groom_vimshottari;
   const [language, setLanguage] = useState('en');
   const [translations, setTranslations] = useState(null);
   const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);
   const [activationAnalysis, setActivationAnalysis] = useState(null);
   const [isAnalyzingActivation, setIsAnalyzingActivation] = useState(false);
   const [groomActivationAnalysis, setGroomActivationAnalysis] = useState(null);
   const [isAnalyzingGroomActivation, setIsAnalyzingGroomActivation] = useState(false);
   const [aiDeepReport, setAiDeepReport] = useState(null);
   const [isGeneratingAiDeepReport, setIsGeneratingAiDeepReport] = useState(false);
   const [isDeepReportModalOpen, setIsDeepReportModalOpen] = useState(false);
   const [selectedTab, setSelectedTab] = useState('overview');
   const [carouselIndex, setCarouselIndex] = useState(0);
   const [sloganIndex, setSloganIndex] = useState(0);
   const [liveAstrologers, setLiveAstrologers] = useState([]);
   const [isLoadingLiveAstrologers, setIsLoadingLiveAstrologers] = useState(false);
   const [liveAstroOffset, setLiveAstroOffset] = useState(0);

   // Pop-up modal state & rotating slogans & rotating astrologers
   const [isPopupOpen, setIsPopupOpen] = useState(false);
   const [popupSloganIndex, setPopupSloganIndex] = useState(0);
   const [popupAstroIndex, setPopupAstroIndex] = useState(0);

   const POPUP_SLOGANS = [
      "जानिए आपकी Love Marriage होगी या Arranged Marriage",
      "केवल गुण नहीं, ग्रहों की स्थिति भी देखें। सफल विवाह के लिए संपूर्ण कुंडली विश्लेषण करवाएं।",
      "विवाह कोई संयोग नहीं, जन्मों का बंधन है। वैदिक ज्योतिष से जानें अपने जीवनसाथी के साथ आपका तालमेल।",
      "क्या विवाह में अनावश्यक देरी हो रही है? वैदिक ज्योतिष के अचूक उपायों से दूर करें हर बाधा।",
      "मनचाहा जीवनसाथी पाने और विवाह के योग जानने के लिए आज ही अपनी जन्मपत्री दिखाएं।",
      "मांगलिक दोष या ग्रहों की रुकावट से न घबराएं, सही ज्योतिषीय मार्गदर्शन से समाधान पाएं।",
      "आपके विवाह का शुभ समय कब है? जानें अपनी कुंडली के सप्तम भाव का रहस्य।",
      "वैदिक ज्योतिष की सलाह से चुनें विवाह का सर्वश्रेष्ठ मुहूर्त और शुरू करें एक खुशहाल जीवन।"
   ];

   // Show popup after 15 seconds (or on page refresh)
   useEffect(() => {
      const popupTimer = setTimeout(() => {
         setIsPopupOpen(true);
      }, 15000);
      return () => clearTimeout(popupTimer);
   }, []);

   // Rotate popup slogans one by one each for 3 seconds
   useEffect(() => {
      if (!isPopupOpen) return;
      const sloganCycle = setInterval(() => {
         setPopupSloganIndex((prev) => (prev + 1) % POPUP_SLOGANS.length);
      }, 3000);
      return () => clearInterval(sloganCycle);
   }, [isPopupOpen, POPUP_SLOGANS.length]);

   // Rotate popup astrologers one by one each for 5 seconds
   useEffect(() => {
      if (!isPopupOpen || !liveAstrologers || liveAstrologers.length === 0) return;
      const astroCycle = setInterval(() => {
         setPopupAstroIndex((prev) => (prev + 1) % liveAstrologers.length);
      }, 5000);
      return () => clearInterval(astroCycle);
   }, [isPopupOpen, liveAstrologers?.length]);

   // Fetch Live / Active Astrologers
   useEffect(() => {
      let isMounted = true;
      const fetchLive = async () => {
         setIsLoadingLiveAstrologers(true);
         try {
            const response = await authAPI.getAstrologers();
            const all = response?.data?.astrologers || [];
            const live = all.filter(a => a.isLive || a.status === 'live');
            if (isMounted) {
               setLiveAstrologers(live.length > 0 ? live : all);
            }
         } catch (e) {
            console.error('Failed to fetch live astrologers:', e);
         } finally {
            if (isMounted) setIsLoadingLiveAstrologers(false);
         }
      };
      fetchLive();
      return () => { isMounted = false; };
   }, []);

   // Rotate 5 Live Astrologers every 4 seconds
   useEffect(() => {
      if (!liveAstrologers || liveAstrologers.length <= 5) return;
      const astroTimer = setInterval(() => {
         setLiveAstroOffset(prev => (prev + 5) % liveAstrologers.length);
      }, 4000);
      return () => clearInterval(astroTimer);
   }, [liveAstrologers]);

   const BANNER_IMAGES = [
      '/images/MK3.jpg',
      '/images/MK2.jpg',
      '/images/MK1.jpg',
      '/images/astrobanner6.jpg'
   ];

   const SLOGANS = [
      { text: "Know Your Exact Marriage Age", icon: "💍", tag: "Vivah Timing" },
      { text: "कैसा होगा आपका जीवनसाथी?", icon: "💑", tag: "Life Partner" },
      { text: "शादी में देरी क्यों?", icon: "⏳", tag: "Delay Diagnosis" },
      { text: "जानिए कैसा होगा आप का होने वाला जीवन साथी?", icon: "✨", tag: "Nature & Bond" }
   ];

   useEffect(() => {
      const timer = setInterval(() => {
         setCarouselIndex((prev) => (prev + 1) % BANNER_IMAGES.length);
      }, 3000);
      return () => clearInterval(timer);
   }, [BANNER_IMAGES.length]);

   useEffect(() => {
      const sloganTimer = setInterval(() => {
         setSloganIndex((prev) => (prev + 1) % SLOGANS.length);
      }, 5000);
      return () => clearInterval(sloganTimer);
   }, [SLOGANS.length]);

   // Fetch Indian Language translations from MongoDB database backend
   useEffect(() => {
      if (language === 'en') {
         setTranslations(null);
         return;
      }
      let isMounted = true;
      setIsLoadingTranslation(true);
      fetch(`${API_BASE_URL}/translate/matchmaking/${language}`)
         .then((res) => res.json())
         .then((resData) => {
            if (isMounted && resData?.success && resData?.data) {
               setTranslations(resData.data);
            }
         })
         .catch((err) => {
            console.error('Failed to load matchmaking translation:', err);
         })
         .finally(() => {
            if (isMounted) setIsLoadingTranslation(false);
         });

      return () => {
         isMounted = false;
      };
   }, [language]);

   // Translation helper function
   const t = (key, fallback) => {
      if (translations?.ui && translations.ui[key]) {
         return translations.ui[key];
      }
      return fallback;
   };

   // Koota localized info helper
   const getKootaInfo = (kootaKey, originalName) => {
      const sanitizedKey = kootaKey.replace(/\s+/g, '');
      const kData = translations?.kootas?.[sanitizedKey] || translations?.kootas?.[kootaKey];
      return {
         name: kData?.name || originalName,
         area: kData?.area || null,
         desc: kData?.desc || null
      };
   };

   const TABS = [
      { id: 'overview', label: t('tabOverview', 'Overview & Score'), icon: '✨' },
      { id: 'gunamilan', label: t('tabGunaMilan', 'Ashta Koota Milan'), icon: '💍' },
      { id: 'charts', label: t('tabCharts', 'Lagna & Navamsha Charts'), icon: '🪐' },
      { id: 'analysis', label: t('tabAnalysis', 'Deep Kundali Assessment'), icon: '🔍' },
      { id: 'muhurta', label: t('tabMuhurta', 'Vivah Muhurta & Timing'), icon: '📅' },
      { id: 'remedies', label: t('tabRemedies', 'Doshas & Remedies'), icon: '🌿' }
   ];

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
            const muhurtApiBase = (PYTHON_ASTRO_URL || '').replace(/\/api\/kundali\/?$/, '').replace(/\/+$/, '') || '';
            const response = await fetch((muhurtApiBase ? `${muhurtApiBase}/api/muhurt/search_advanced` : '/api/muhurt/search_advanced'), {
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
         const muhurtApiBase = (PYTHON_ASTRO_URL || '').replace(/\/api\/kundali\/?$/, '').replace(/\/+$/, '') || '';
         const response = await fetch((muhurtApiBase ? `${muhurtApiBase}/api/muhurt/garbhadhana` : '/api/muhurt/garbhadhana'), {
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
         const muhurtApiBase = (PYTHON_ASTRO_URL || '').replace(/\/api\/kundali\/?$/, '').replace(/\/+$/, '') || '';
         const response = await fetch((muhurtApiBase ? `${muhurtApiBase}/api/muhurt/vivah` : '/api/muhurt/vivah'), {
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
      setIsDeepReportModalOpen(true);
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
      <div className="bg-[#f8fafc] min-h-screen p-1 md:px-12 md:pb-32 pt-28 md:pt-32 font-sans">
         <div className="max-w-7xl mx-auto space-y-6">

            {/* Sacred Matchmaking Dual Banner Showcase - Left Carousel (3s interval) & Right MK1 */}
            <div className="w-full">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                  {/* Left Side: Dynamic Rotating Banner (All BANNER_IMAGES one by one for 3 seconds) */}
                  <div className="relative group overflow-hidden rounded-2xl border border-amber-900/20 shadow-md bg-neutral-900 aspect-16/6 sm:aspect-16/5 md:aspect-16/6">
                     {BANNER_IMAGES.map((imgUrl, idx) => (
                        <img
                           key={idx}
                           src={imgUrl}
                           alt={`Vedic Matchmaking Banner ${idx + 1}`}
                           className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-1000 ease-in-out ${carouselIndex === idx
                              ? 'opacity-100 scale-100 z-10'
                              : 'opacity-0 scale-105 z-0 pointer-events-none'
                              }`}
                           loading={idx === 0 ? "eager" : "lazy"}
                        />
                     ))}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none z-20"></div>
                     <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-none z-30">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/40 text-[11px] font-bold text-amber-300 uppercase tracking-widest">
                           💍 {t('sacredVivahBond', 'Sacred Vivah Sanskar')}
                        </span>
                        {/* Slide dots indicator */}
                        <div className="flex items-center gap-1.5">
                           {BANNER_IMAGES.map((_, idx) => (
                              <button
                                 key={idx}
                                 onClick={() => setCarouselIndex(idx)}
                                 className={`h-1.5 rounded-full transition-all cursor-pointer pointer-events-auto ${carouselIndex === idx ? 'w-4 bg-amber-400' : 'w-1.5 bg-white/40 hover:bg-white/70'
                                    }`}
                                 aria-label={`Banner ${idx + 1}`}
                              />
                           ))}
                        </div>
                     </div>
                  </div>

                  {/* Right Side: Live Astrologers Banner (5 Astrologers displayed at a time, rotated every 4 seconds) */}
                  <div className="relative group overflow-hidden rounded-2xl border border-amber-900/20 shadow-md bg-white aspect-16/6 sm:aspect-16/5 md:aspect-16/6 flex flex-col justify-between p-3.5 sm:p-4">
                     {/* Background decorative cosmic glow */}
                     <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
                     <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>

                     {/* Header: Live Badge, Title, and Action Link */}
                     <div className="flex items-center justify-between gap-2 relative z-10">
                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                           <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                           </span>
                           <span className="text-[14px] sm:text-[16px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-600/90 text-white shadow-xs">
                              LIVE
                           </span>
                           <span className="text-xs sm:text-[12px] font-bold text-amber-900">
                              {t('liveAstrologersHeading', 'Verified Vedic Astrologers')}
                           </span>
                           {/* Small Flex Pill: FIRST CHAT FREE */}
                           <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-orange-900 text-[11px] sm:text-[20px] font-black tracking-wider uppercase shadow-xs animate-pulse border border-emerald-400/50">
                              FIRST CHAT FREE
                           </span>
                        </div>

                        <Link
                           to="/live-astrologers"
                           className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[16px] font-bold shadow-xs hover:from-amber-600 hover:to-orange-600 transition shrink-0"
                        >
                           <span>{t('consultNow', 'Consult')}</span>
                           <span className="text-[16px]">→</span>
                        </Link>
                     </div>

                     {/* Center: 5 Rotating Astrologers */}
                     <div className="relative z-10 py-1">
                        <div className="grid grid-cols-5 gap-2 sm:gap-3 items-center justify-items-center">
                           {(() => {
                              const total = liveAstrologers.length;
                              const currentBatch = total > 0
                                 ? Array.from({ length: Math.min(5, total) }, (_, i) => liveAstrologers[(liveAstroOffset + i) % total])
                                 : [];

                              return currentBatch.map((astro, idx) => {
                                 const rawImage = astro.profilePicture || astro.image || astro.imageUrl || astro.photo;
                                 const imageSrc = rawImage ? buildAssetUrl(rawImage) : null;
                                 const rawName = (astro.name || 'Astrologer').trim();
                                 const cleanFullName = rawName.replace(/^astrologer\s+/i, '').trim() || rawName;
                                 const displayName = cleanFullName.split(' ')[0];

                                 return (
                                    <Link
                                       key={`${astro._id || astro.id || idx}-${liveAstroOffset}`}
                                       to="/live-astrologers"
                                       title={`${cleanFullName} - Online`}
                                       className="flex flex-col items-center gap-1 group/item text-center w-full transition-all duration-500 animate-fadeIn"
                                    >
                                       <div className="relative">
                                          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-22 md:h-22 rounded-full overflow-hidden border-2 border-amber-400/80 shadow-md bg-neutral-800 flex items-center justify-center group-hover/item:scale-110 group-hover/item:border-amber-300 transition-all duration-300">
                                             {imageSrc ? (
                                                <img
                                                   src={imageSrc}
                                                   alt={cleanFullName}
                                                   className="w-full h-full object-cover"
                                                />
                                             ) : (
                                                <span className="font-bold text-[14px] text-amber-200">
                                                   {cleanFullName.charAt(0) || 'A'}
                                                </span>
                                             )}
                                          </div>
                                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-neutral-900 shadow-xs"></span>
                                       </div>
                                       <span className="text-[10px] sm:text-[14px] font-semibold text-black truncate max-w-[58px] sm:max-w-[70px] group-hover/item:text-amber-300 transition-colors">
                                          {displayName}
                                       </span>
                                    </Link>
                                 );
                              });
                           })()}
                        </div>
                     </div>

                     {/* Footer: Live Consultation Status & Rotating Pips */}
                     <div className="flex items-center justify-between text-[16px] text-orange-900 relative z-10 pt-1 border-t border-neutral-800/80">
                        <span className="truncate flex items-center gap-1">
                           <span className="text-black">●</span> {t('instantConsultNotice', 'Ready for Match Kundali & Gun Milan')}
                        </span>
                        {/* Paging indicator for batches */}
                        {liveAstrologers.length > 5 && (
                           <div className="flex items-center gap-1 shrink-0">
                              {Array.from({ length: Math.ceil(liveAstrologers.length / 5) }).map((_, pIdx) => {
                                 const activePIdx = Math.floor(liveAstroOffset / 5);
                                 return (
                                    <button
                                       key={pIdx}
                                       onClick={() => setLiveAstroOffset(pIdx * 5)}
                                       className={`h-1 rounded-full transition-all cursor-pointer ${activePIdx === pIdx ? 'w-3 bg-amber-400' : 'w-1 bg-white/30 hover:bg-white/60'
                                          }`}
                                       aria-label={`Page ${pIdx + 1}`}
                                    />
                                 );
                              })}
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>

            {/* Top Header Dual Section: Left Slogan Flex Bar + Right Live Astrologers */}

            {/* Main Layout: Left Sidebar Navigation + Right Content (Starting below Top Navbar) */}
            <div className="flex flex-col lg:flex-row gap-8 items-start relative">

               {/* Left Sidebar Navigation */}
               <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-28 z-30">
                  <div className="bg-white/95 backdrop-blur-md rounded-[2rem] p-4 shadow-xl border border-slate-900">
                     <div className="px-4 py-3 mb-2 border-b border-slate-900 flex items-center justify-between">
                        <span className="text-[14px] font-black uppercase tracking-[0.25em] text-slate-900">Navigation</span>
                        <span className="text-amber-900 text-[12px] font-bold">6 Sections</span>
                     </div>
                     <nav className="flex flex-col gap-1.5">
                        {TABS.map((tab) => {
                           const isActive = selectedTab === tab.id;
                           return (
                              <button
                                 key={tab.id}
                                 onClick={() => setSelectedTab(tab.id)}
                                 className={`w-full text-left py-3.5 px-4 rounded-xl font-bold text-[16px] tracking-wide transition-all flex items-center gap-3.5 cursor-pointer ${isActive
                                    ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg shadow-amber-500/25 scale-[1.02]'
                                    : 'text-slate-900 hover:text-amber-900 hover:bg-amber-100'
                                    }`}
                              >
                                 <span className="text-xl shrink-0 p-1 rounded-lg bg-amber-300 backdrop-blur-sm">{tab.icon}</span>
                                 <span className="leading-snug">{tab.label}</span>
                              </button>
                           );
                        })}
                     </nav>
                  </div>
               </aside>

               {/* Right Main Content (Royal Header + Active Tab Content) */}
               <main className="flex-1 min-w-0 w-full space-y-12">

                  {/* Step 1: Royal Header (Compact by ~40%) */}
                  <div className="bg-white rounded-[1.75rem] p-4 md:p-6 shadow-[0_10px_25px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500"></div>
                     <div className="text-center md:text-left flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 mb-1">
                           <span className="text-amber-600 font-bold text-sm">ॐ</span>
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full inline-block">
                              {t('brand', 'Vedic Kundali Matching')}
                           </p>
                        </div>
                        <h1 className="text-xl md:text-2xl font-serif italic tracking-tight text-slate-900 mb-1 leading-tight">
                           {t('divineTitle', 'Divine Compatibility Synthesis')}
                        </h1>
                        <p className="text-slate-900 text-[14px] max-w-2xl line-clamp-1">
                           {t('divineSubtitle', 'Comprehensive Ashtakoota Guna Milan, Dosha Assessment & Astrological Synergy')}
                        </p>

                        {/* Multi-Language Indian Selector Pills */}
                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 justify-center md:justify-start">
                           <span className="text-[14px] font-bold text-slate-900 mr-1 uppercase tracking-wider flex items-center gap-1">
                              🌐 {isLoadingTranslation && <span className="inline-block w-2 h-2 border-2 border-amber-900 border-t-transparent rounded-full animate-spin"></span>} Language:
                           </span>
                           {LANGUAGE_OPTIONS.map((langOpt) => {
                              const isSelected = language === langOpt.code;
                              return (
                                 <button
                                    key={langOpt.code}
                                    onClick={() => setLanguage(langOpt.code)}
                                    className={`px-2.5 py-0.5 rounded-full text-[12px] font-semibold transition-all border ${isSelected
                                       ? 'bg-amber-600 text-white border-amber-600 shadow-xs shadow-amber-600/30 font-bold scale-105'
                                       : 'bg-slate-40 text-slate-900 border-slate-900 hover:bg-amber-50 hover:border-amber-300'
                                       }`}
                                 >
                                    {langOpt.native}
                                 </button>
                              );
                           })}
                        </div>
                     </div>

                     {/* Center Image */}
                     <div className="shrink-0 z-10 flex justify-center hidden md:block">
                        <img src="/deities/match1.jpg" alt="Divine Match" className="w-16 h-16 rounded-full shadow-md object-cover border-2 border-amber-100/90" />
                     </div>

                     <div className="flex items-center gap-4 md:gap-6 shrink-0">
                        <div className="text-center group">
                           <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-50 to-rose-100 border-2 border-white shadow-md flex items-center justify-center text-xl mb-1 group-hover:scale-105 transition-transform shadow-rose-100">👰</div>
                           <div className="text-[14px] font-black uppercase text-slate-800 tracking-wider">{bride || t('bride', 'Bride')}</div>
                        </div>
                        <div className="text-xl md:text-2xl font-serif italic text-amber-400">♥</div>
                        <div className="text-center group">
                           <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-white shadow-md flex items-center justify-center text-xl mb-1 group-hover:scale-105 transition-transform shadow-indigo-100">🤵</div>
                           <div className="text-[14px] font-black uppercase text-slate-800 tracking-wider">{groom || t('groom', 'Groom')}</div>
                        </div>
                     </div>
                  </div>

                  {/* TAB 1: OVERVIEW & SYNTHESIS */}
                  {selectedTab === 'overview' && (
                     <div className="space-y-12">
                        <section className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full -mr-32 -mt-32"></div>
                           <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                              <div>
                                 <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-white m-0">
                                       {t('detailedCompatibilityReport', 'Detailed Compatibility Report')}
                                    </h3>
                                    <button
                                       onClick={handleGenerateAiDeepReport}
                                       disabled={isGeneratingAiDeepReport}
                                       className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 text-[16px] flex items-center gap-2"
                                    >
                                       {isGeneratingAiDeepReport ? (
                                          <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div> {t('generatingReport', 'Generating...')}</>
                                       ) : t('generateDeepReport', '✨ Generate Deep Analysis Report')}
                                    </button>
                                 </div>
                                 <p className="text-3xl md:text-4xl font-serif italic leading-tight text-indigo-50 mb-8">"{ai.summary || summary.recommendation}"</p>
                                 <div className="flex gap-4">
                                    <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                                       <div className="text-[9px] font-black uppercase text-indigo-300 mb-1">{t('successProb', 'Success Probability')}</div>
                                       <div className="text-2xl font-bold">{Math.round(success_probability)}%</div>
                                    </div>
                                    <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                                       <div className="text-[9px] font-black uppercase text-indigo-300 mb-1">{t('gunaScore', 'Guna Score')}</div>
                                       <div className="text-2xl font-bold">{gunaTotal}/36</div>
                                    </div>
                                 </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                 <div className="bg-emerald-500/10 p-6 rounded-3xl border border-emerald-500/20">
                                    <h4 className="text-[14px] font-black uppercase text-emerald-400 mb-4 tracking-widest">{t('coreStrengths', 'Core Strengths')}</h4>
                                    <ul className="space-y-3">
                                       {ai.strengths.map((s, i) => <li key={i} className="text-[16px] flex gap-2"><span className="text-emerald-400">✓</span> {s}</li>)}
                                    </ul>
                                 </div>
                                 <div className="bg-rose-500/10 p-6 rounded-3xl border border-rose-500/20">
                                    <h4 className="text-[14spx] font-black uppercase text-rose-400 mb-4 tracking-widest">{t('primaryChallenges', 'Primary Challenges')}</h4>
                                    <ul className="space-y-3">
                                       {ai.weaknesses.map((w, i) => <li key={i} className="text-[16px] flex gap-2"><span className="text-rose-400">!</span> {w}</li>)}
                                    </ul>
                                 </div>
                              </div>
                           </div>
                        </section>

                        {/* Step 6: Enterprise Matchmaking Intelligence (Redesigned Royal Vedic Aesthetic) */}
                        {report.enterprise_analysis && (
                           <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden border border-amber-500/20">
                              {/* Background Glowing Nebulas */}
                              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-indigo-500/10 blur-[130px] rounded-full pointer-events-none -mr-40 -mt-40"></div>
                              <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none -ml-40 -mb-40"></div>

                              {/* Section Header */}
                              <div className="relative z-10 text-center mb-10">
                                 <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-[0.3em] mb-3">
                                    <span>✨</span>
                                    <span>{t('sookshmaVivechan', 'Sookshma Vivechan (सूक्ष्म विवेचन)')}</span>
                                 </div>
                                 <h2 className="text-3xl md:text-5xl font-serif italic text-white tracking-tight drop-shadow-sm">
                                    {t('arthaKarmaSamiksha', 'Artha & Karma Samiksha (अर्थ एवं कर्म समीक्षा)')}
                                 </h2>
                                 <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-2xl mx-auto">
                                    Comprehensive algorithmic analysis of financial harmony, emotional bonding, longevity, and destiny synchronization.
                                 </p>
                              </div>

                              {/* Top Key Metrics: Master Index Gauge + AI Forecast + Quick Risk Gauges */}
                              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

                                 {/* Master Index Hero Card */}
                                 <div className="lg:col-span-5 bg-gradient-to-b from-slate-800/80 to-slate-900/90 rounded-3xl p-6 md:p-8 border border-white/10 backdrop-blur-md flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                       <span className="text-[11px] font-black uppercase tracking-[0.25em] text-amber-400">
                                          {t('professionalFinalScore', 'Professional Final Score')}
                                       </span>
                                       <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                                          Verified
                                       </span>
                                    </div>

                                    <div className="text-center my-4">
                                       <div className="inline-block relative">
                                          <div className="text-6xl md:text-7xl font-serif italic font-bold bg-gradient-to-r from-amber-300 via-rose-300 to-indigo-300 bg-clip-text text-transparent">
                                             {entScore}
                                             <span className="text-2xl font-sans not-italic text-slate-500 ml-1">/100</span>
                                          </div>
                                       </div>
                                       <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-2">
                                          {t('masterCompatibilityIndex', 'Master Compatibility Index')}
                                       </p>
                                    </div>

                                    {/* Score Progress Bar */}
                                    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-white/5 mt-2">
                                       <div
                                          className="h-full rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500 transition-all duration-1000"
                                          style={{ width: `${Math.min(Math.max(entScore, 5), 100)}%` }}
                                       ></div>
                                    </div>
                                 </div>

                                 {/* AI Relationship Forecast & Risk Matrix */}
                                 <div className="lg:col-span-7 flex flex-col justify-between gap-4">

                                    {/* AI Prediction Card */}
                                    <div className="bg-gradient-to-br from-indigo-950/60 to-slate-900/80 rounded-3xl p-6 border border-indigo-500/30 backdrop-blur-md shadow-lg">
                                       <div className="flex items-center justify-between mb-3">
                                          <div className="flex items-center gap-2">
                                             <span className="text-xl">🔮</span>
                                             <h4 className="text-xs font-black uppercase tracking-[0.25em] text-indigo-300">
                                                {t('aiRelationshipForecasting', 'AI Relationship Forecasting')}
                                             </h4>
                                          </div>
                                          <span className={`text-xs font-black px-3 py-1 rounded-full border ${aiForecast.risk === 'LOW'
                                             ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                             : aiForecast.risk === 'HIGH'
                                                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                                                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                             }`}>
                                             {aiForecast.risk === 'LOW' ? t('lowRisk', 'LOW RISK') : aiForecast.risk === 'HIGH' ? t('highRisk', 'HIGH RISK') : `${aiForecast.risk} ${t('risk', 'RISK')}`}
                                          </span>
                                       </div>
                                       <p className="text-sm md:text-base font-serif italic text-slate-200 leading-relaxed bg-black/20 p-3.5 rounded-xl border border-white/5">
                                          "{aiForecast.prediction}"
                                       </p>
                                    </div>

                                    {/* Longevity & Divorce Risk Dual Badges */}
                                    <div className="grid grid-cols-2 gap-4">
                                       <div className="bg-slate-900/80 rounded-2xl p-4 border border-white/10 backdrop-blur-md flex items-center justify-between">
                                          <div>
                                             <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                                {t('longevityScore', 'Longevity Score')}
                                             </span>
                                             <span className="text-2xl font-bold text-white">
                                                {longevity.longevity} <span className="text-xs text-slate-400 font-normal">pts</span>
                                             </span>
                                          </div>
                                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl">
                                             🌱
                                          </div>
                                       </div>

                                       <div className="bg-slate-900/80 rounded-2xl p-4 border border-white/10 backdrop-blur-md flex items-center justify-between">
                                          <div>
                                             <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                                {t('divorceRisk', 'Divorce Risk')}
                                             </span>
                                             <span className="text-2xl font-bold text-rose-400">
                                                {divorceRisk.risk_score}%
                                             </span>
                                          </div>
                                          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-xl">
                                             ⚠️
                                          </div>
                                       </div>
                                    </div>

                                 </div>

                              </div>

                              {/* 4 Pillars of Matrimonial Synergy */}
                              <div className="relative z-10 mb-10">
                                 <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-4 text-center">
                                    Core Matrimonial Dimensions
                                 </h4>
                                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

                                    {/* Intimacy */}
                                    <div className="bg-gradient-to-b from-slate-800/80 to-slate-900/90 p-5 rounded-2xl border border-white/10 backdrop-blur-sm hover:border-pink-500/40 hover:-translate-y-0.5 transition-all duration-300">
                                       <div className="flex items-center justify-between mb-3">
                                          <span className="text-2xl p-2 rounded-xl bg-pink-500/10 border border-pink-500/20">❤️</span>
                                          <span className="text-xl font-black text-pink-300">{intimacy.score}</span>
                                       </div>
                                       <div className="text-xs font-black uppercase text-slate-200 tracking-wider">
                                          {t('intimacy', 'Intimacy')}
                                       </div>
                                       <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                                          {intimacy.description || 'Emotional depth and romantic attachment quotient.'}
                                       </p>
                                    </div>

                                    {/* Financial Harmony */}
                                    <div className="bg-gradient-to-b from-slate-800/80 to-slate-900/90 p-5 rounded-2xl border border-white/10 backdrop-blur-sm hover:border-amber-500/40 hover:-translate-y-0.5 transition-all duration-300">
                                       <div className="flex items-center justify-between mb-3">
                                          <span className="text-2xl p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">💰</span>
                                          <span className="text-xl font-black text-amber-300">{financial.score}</span>
                                       </div>
                                       <div className="text-xs font-black uppercase text-slate-200 tracking-wider">
                                          {t('financialHarmony', 'Financial Harmony')}
                                       </div>
                                       <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                                          {financial.description || 'Joint wealth accumulation and economic stability.'}
                                       </p>
                                    </div>

                                    {/* Family Harmony */}
                                    <div className="bg-gradient-to-b from-slate-800/80 to-slate-900/90 p-5 rounded-2xl border border-white/10 backdrop-blur-sm hover:border-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300">
                                       <div className="flex items-center justify-between mb-3">
                                          <span className="text-2xl p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">👨‍👩‍👧‍👦</span>
                                          <span className="text-xl font-black text-indigo-300">{familyHarmony.score}</span>
                                       </div>
                                       <div className="text-xs font-black uppercase text-slate-200 tracking-wider">
                                          {t('familyHarmony', 'Family Harmony')}
                                       </div>
                                       <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                                          {familyHarmony.description || 'Integration with in-laws and domestic peace.'}
                                       </p>
                                    </div>

                                    {/* Stability */}
                                    <div className="bg-gradient-to-b from-slate-800/80 to-slate-900/90 p-5 rounded-2xl border border-white/10 backdrop-blur-sm hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all duration-300">
                                       <div className="flex items-center justify-between mb-3">
                                          <span className="text-2xl p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">⚖️</span>
                                          <span className="text-sm font-black text-emerald-300 uppercase">{longevity.stability}</span>
                                       </div>
                                       <div className="text-xs font-black uppercase text-slate-200 tracking-wider">
                                          {t('stability', 'Stability')}
                                       </div>
                                       <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                                          Overall longevity equilibrium & resilience against disruptions.
                                       </p>
                                    </div>

                                 </div>
                              </div>

                              {/* Master Relationship Flow Pipeline (Interactive Step Badges) */}
                              <div className="relative z-10 bg-slate-950/60 p-6 md:p-8 rounded-3xl border border-white/10">
                                 <div className="text-center mb-6">
                                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-amber-400">
                                       {t('masterRelationshipFlow', 'Master Relationship Flow Pipeline')}
                                    </h4>
                                    <p className="text-slate-400 text-xs mt-1">
                                       13-Stage Classical Astrological Verification Matrix
                                    </p>
                                 </div>
                                 <div className="flex flex-wrap justify-center items-center gap-2">
                                    {[
                                       { key: 'flowBirthCharts', label: 'Birth Charts', num: '1' },
                                       { key: 'flowCompatibilityAnalysis', label: 'Compatibility Analysis', num: '2' },
                                       { key: 'flowMarriagePromise', label: 'Marriage Promise', num: '3' },
                                       { key: 'flowEmotionalMatching', label: 'Emotional Matching', num: '4' },
                                       { key: 'flowNavamshaAnalysis', label: 'Navamsha Analysis', num: '5' },
                                       { key: 'flowDashaSynchronization', label: 'Dasha Synchronization', num: '6' },
                                       { key: 'flowTransitActivation', label: 'Transit Activation', num: '7' },
                                       { key: 'flowMarriageTiming', label: 'Marriage Timing', num: '8' },
                                       { key: 'flowMarriageQuality', label: 'Marriage Quality', num: '9' },
                                       { key: 'flowChildren', label: 'Children', num: '10' },
                                       { key: 'flowLongevity', label: 'Longevity', num: '11' },
                                       { key: 'flowDivorceRisk', label: 'Divorce Risk', num: '12' },
                                       { key: 'flowAiPrediction', label: 'AI Prediction', num: '13' }
                                    ].map((stepObj, i) => (
                                       <React.Fragment key={stepObj.key}>
                                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 hover:bg-amber-950/40 rounded-xl border border-white/10 hover:border-amber-400/50 text-xs font-bold uppercase tracking-wider text-slate-200 transition-all duration-200 shadow-sm cursor-default">
                                             <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 text-[10px] flex items-center justify-center font-black">
                                                {stepObj.num}
                                             </span>
                                             <span>{t(stepObj.key, stepObj.label)}</span>
                                          </div>
                                          {i < 12 && (
                                             <span className="text-amber-500/60 font-bold hidden sm:inline-block">→</span>
                                          )}
                                       </React.Fragment>
                                    ))}
                                 </div>
                              </div>

                              {/* Newly integrated modular frontend components */}
                              <MarriageDashboard report={report} translations={translations} t={t} />

                           </section>
                        )}

                        {/* AI Deep Report Section */}
                        {(aiDeepReport || isGeneratingAiDeepReport) && (
                           <section id="ai-deep-report-section" className="bg-white rounded-[2.5rem] p-12 shadow-xl border border-slate-100">
                              <div className="text-center mb-10">
                                 <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-purple-500 mb-2">
                                    {t('divineAiGeneration', 'Divine AI Generation')}
                                 </h3>
                                 <h2 className="text-3xl font-serif italic text-slate-800">
                                    {t('aiCompatibilityReport', 'Compatibility Report')}
                                 </h2>
                              </div>
                              {isGeneratingAiDeepReport ? (
                                 <div className="flex flex-col items-center justify-center p-12 space-y-4">
                                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-purple-600 font-serif italic">
                                       {t('synthesizingMatrices', 'Synthesizing Planetary Matrices & Ultra PRO Data...')}
                                    </p>
                                 </div>
                              ) : (
                                 <div className="prose prose-purple max-w-none prose-h3:text-purple-600 prose-h3:font-serif prose-h3:text-2xl prose-h4:text-pink-500 bg-slate-50 p-8 rounded-3xl" dangerouslySetInnerHTML={{ __html: aiDeepReport }}>
                                 </div>
                              )}
                           </section>
                        )}


                     </div>
                  )}

                  {/* TAB 2: ASHTA KOOTA MILAN */}
                  {selectedTab === 'gunamilan' && (
                     <div className="space-y-12">
                        {/* Step 4: Ashta Koota Intelligence */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                           <div className="lg:col-span-2 bg-white rounded-[2rem] p-10 shadow-lg border border-slate-900">
                              <div className="flex justify-between items-end mb-10">
                                 <div>
                                    <h3 className="text-[16px] font-black uppercase tracking-widest text-slate-900 mb-1">
                                       {t('ashtaKootaScoring', 'Ashta Koota Scoring')}
                                    </h3>
                                    <div className={`text-[36px] text-slate-900 font-serif italic ${getStatusColor(guna_milan.interpretation)}`}>
                                       {gunaTotal} <span className="text-[20px] text-slate-900 font-sans not-italic">/ 36 {t('gunasUnit', 'Gunas')}</span>
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <div className="text-[16px] font-black uppercase text-amber-600 mb-1">{t('status', 'Status')}</div>
                                    <div className={`text-[20px] text-slate-900 font-bold uppercase tracking-widest ${getStatusColor(guna_milan.interpretation)}`}>
                                       {guna_milan.interpretation}
                                    </div>
                                 </div>
                              </div>
                              {/* Professional Ashta Koota Matrix Table */}
                              <div className="overflow-x-auto mt-8">
                                 <table className="w-full text-left border-collapse">
                                    <thead>
                                       <tr className="border-b-2 border-amber-100 bg-amber-50/20">
                                          <th className="py-4 px-4 text-[14px] font-black uppercase tracking-widest text-amber-800">{t('gunaColHeader', 'Guna')}</th>
                                          <th className="py-4 px-4 text-[14px] font-black uppercase tracking-widest text-amber-800">{t('boyColHeader', 'Boy')}</th>
                                          <th className="py-4 px-4 text-[14px] font-black uppercase tracking-widest text-amber-800">{t('girlColHeader', 'Girl')}</th>
                                          <th className="py-4 px-4 text-[14px] font-black uppercase tracking-widest text-amber-800 text-center">{t('maxColHeader', 'Maximum')}</th>
                                          <th className="py-4 px-4 text-[14px] font-black uppercase tracking-widest text-amber-800 text-center">{t('obtainedColHeader', 'Obtained')}</th>
                                          <th className="py-4 px-4 text-[14px] font-black uppercase tracking-widest text-amber-800">{t('areaOfLifeHeader', 'Area Of Life')}</th>
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
                                          const kInfo = getKootaInfo(koota.name, koota.name);
                                          return (
                                             <tr key={koota.name} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-5 px-4 text-[16px] font-bold text-red-500 font-serif italic">
                                                   {kInfo.name}
                                                   {kInfo.name !== koota.name && <span className="block text-xs font-sans text-slate-400 not-italic font-normal">{koota.name}</span>}
                                                </td>
                                                <td className="py-5 px-4 text-[16px] text-slate-900 font-medium">{detail.boy || "—"}</td>
                                                <td className="py-5 px-4 text-[16px] text-slate-900 font-medium">{detail.girl || "—"}</td>
                                                <td className="py-5 px-4 text-[20px] text-slate-900 font-mono text-center font-bold">{koota.max}</td>
                                                <td className="py-5 px-4 text-[16px] font-black text-slate-900 text-center">{score}</td>
                                                <td className="py-5 px-4 text-[14px] font-bold text-slate-900 tracking-tight">
                                                   {kInfo.area || detail.area}
                                                </td>
                                             </tr>
                                          );
                                       })}
                                    </tbody>
                                 </table>
                              </div>
                           </div>

                           {/* Planetary Afflictions Card */}
                           <div className="bg-white rounded-[2rem] p-10 shadow-lg border border-amber-900 flex flex-col">
                              <h3 className="text-[18px] font-black uppercase tracking-[0.3em] text-slate-900 mb-8">
                                 {t('planetaryAfflictions', 'Planetary Afflictions')}
                              </h3>
                              <div className="space-y-6 flex-1">
                                 {risk.afflictions?.length > 0 ? (
                                    risk.afflictions.map((a, i) => (
                                       <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
                                          <div className="flex justify-between items-center mb-2">
                                             <h4 className="text-[14px] font-bold text-slate-900 uppercase tracking-tight">{a.title}</h4>
                                             <span className={`text-[14px] font-black px-2 py-0.5 rounded-md uppercase ${a.impact === 'Severe' ? 'bg-rose-100 text-rose-600' : a.impact === 'High' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {a.impact === 'Severe' ? t('severeImpact', 'Severe Impact') : a.impact === 'High' ? t('highImpact', 'High Impact') : `${a.impact} ${t('moderateImpact', 'Impact')}`}
                                             </span>
                                          </div>
                                          <p className="text-[16px] leading-relaxed text-slate-900">{a.description}</p>
                                       </div>
                                    ))
                                 ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                       <div className="text-4xl mb-2">✨</div>
                                       <p className="text-[10px] font-black uppercase tracking-widest">
                                          {t('noMajorAfflictions', 'No Major Afflictions')}
                                       </p>
                                    </div>
                                 )}
                              </div>
                           </div>

                           {/* Divorce Risk Diagnostic Card */}

                        </div>

                        {/* Knowledge Base Section */}
                        <section className="bg-slate-50 rounded-[2.5rem] p-12 border border-slate-900 shadow-inner">
                           <h3 className="text-[14px] font-black uppercase tracking-[0.5em] text-slate-900 mb-10 text-center">
                              {t('vedicEncyclopedia', 'Vedic Compatibility Encyclopedia')}
                           </h3>
                           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                              {Object.entries(KOOTA_DESCRIPTIONS).map(([name, desc]) => {
                                 const kInfo = getKootaInfo(name, name);
                                 return (
                                    <div key={name} className="space-y-2">
                                       <h4 className="text-[16px] font-black uppercase text-indigo-600 tracking-widest">
                                          {kInfo.name}
                                          {kInfo.name !== name && <span className="block text-xs font-sans text-slate-400 not-italic font-normal">{name}</span>}
                                       </h4>
                                       <p className="text-[15px] leading-relaxed text-slate-900">
                                          {kInfo.desc || desc}
                                       </p>
                                    </div>
                                 );
                              })}
                           </div>

                           <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-12">
                              <div>
                                 <h4 className="text-[16px] font-black uppercase tracking-widest text-slate-900 mb-4">
                                    {t('scoringInterpretationScale', 'Scoring Interpretation Scale')}
                                 </h4>
                                 <div className="space-y-3">
                                    <div className="flex justify-between items-center text-[16px] p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                       <span className="font-bold text-emerald-700">{t('pts33to36', '33 to 36 Points')}</span>
                                       <span className="uppercase font-black text-[16px] text-emerald-500">{t('matchExcellent', 'Excellent Match')}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                                       <span className="font-bold text-emerald-600">{t('pts25to32', '25 to 32 Points')}</span>
                                       <span className="uppercase font-black text-[11px] text-emerald-500">{t('matchVeryGood', 'Very Good Match')}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs p-3 bg-amber-50 rounded-xl border border-amber-100">
                                       <span className="font-bold text-amber-700">{t('pts18to24', '18 to 24 Points')}</span>
                                       <span className="uppercase font-black text-[11px] text-amber-500 text-right leading-tight max-w-[200px]">
                                          {t('matchAcceptable', 'Acceptable; but need to consider other factors minutely')}
                                       </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs p-3 bg-rose-50 rounded-xl border border-rose-100">
                                       <span className="font-bold text-rose-700">{t('ptsBelow18', 'Below 18 Points')}</span>
                                       <span className="uppercase font-black text-[11px] text-rose-500">{t('matchNotCompatible', 'Not Compatible Match')}</span>
                                    </div>
                                 </div>
                              </div>
                              <div className="flex flex-col justify-center bg-rose-100 rounded-[2rem] p-8 text-black relative overflow-hidden">
                                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -mr-16 -mt-16 rounded-full blur-2xl"></div>
                                 <h4 className="text-[18px] font-serif italic mb-4">
                                    {t('noteOnCompatibility', 'A Note on Compatibility')}
                                 </h4>
                                 <p className="text-[16px] leading-relaxed text-black opacity-85">
                                    {t('noteCompatibilityText', 'While Ashta Koota is the primary metric for Vedic matching, a high score alone does not guarantee success. Our ULTRA PRO engine also considers Manglik Dosha, Navamsa Stability, and Planetary Afflictions to provide this synthesized Success Probability.')}
                                 </p>
                              </div>
                           </div>
                        </section>

                     </div>
                  )}

                  {/* TAB 3: CHARTS SYNCHRONIZATION */}
                  {selectedTab === 'charts' && (
                     <div className="space-y-12">
                        {/* Step 3: Celestial Map Synchronization (Lagna Charts) */}
                        <section className="bg-white rounded-[2.5rem] p-12 shadow-xl border border-slate-100 relative">
                           <div className="text-center mb-10">
                              <h3 className="text-[14px] font-black uppercase tracking-[0.5em] text-indigo-500 mb-2">
                                 {t('destinyBlueprint', 'Destiny Blueprint Visualization')}
                              </h3>
                              <h2 className="text-3xl font-serif italic text-slate-800">
                                 {t('lagnaChartSync', 'Lagna Chart Synchronization')}
                              </h2>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                              {/* Bride Chart Column */}
                              <div className="space-y-6">
                                 <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                                    <div className="text-[14px] font-black uppercase tracking-widest text-indigo-500 mb-4 text-center">
                                       {t('brideBirthProfile', "Bride's Birth Profile")}
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                                       <div>
                                          <div className="text-[12px] font-bold text-slate-900 uppercase">{t('fullName', 'Full Name')}</div>
                                          <div className="text-[18px] font-serif italic text-amber-600">{brideFullData?.title} {brideFullData?.name}</div>
                                       </div>
                                       <div>
                                          <div className="text-[12px] font-bold text-slate-900 uppercase">{t('birthDate', 'Birth Date')}</div>
                                          <div className="text-[14px] font-bold text-amber-600">{brideFullData?.birth_date}</div>
                                       </div>
                                       <div>
                                          <div className="text-[12px] font-bold text-slate-900 uppercase">{t('birthTime', 'Birth Time')}</div>
                                          <div className="text-[14px] font-bold text-amber-600">{brideFullData?.birth_time}</div>
                                       </div>
                                       <div>
                                          <div className="text-[12px] font-bold text-slate-900 uppercase">{t('birthLocation', 'Location')}</div>
                                          <div className="text-[14px] font-bold text-amber-600 truncate" title={brideFullData?.location_name}>{brideFullData?.location_name}</div>
                                       </div>
                                    </div>
                                 </div>
                                 <div className="aspect-square bg-slate-50 rounded-3xl p-6 border border-slate-100 shadow-inner">
                                    <ZodiacChart
                                       houses={report.bride_chart?.houses}
                                       title={t('brideLagnaTitle', `${bride}'s Lagna`)}
                                       variant="modern"
                                       defaultLang={language}
                                       key={`bride-lagna-${language}`}
                                       hideOuterRect={false}
                                       stackLayout={true}
                                       scaleText={1.5}
                                    />
                                 </div>
                                 <div className="aspect-square bg-slate-50 rounded-3xl p-6 border border-slate-100 shadow-inner">
                                    <ZodiacChart
                                       houses={report.bride_d9_chart?.houses}
                                       title={t('brideNavamshaTitle', `${bride}'s Navamsha (D9)`)}
                                       variant="modern"
                                       defaultLang={language}
                                       key={`bride-d9-${language}`}
                                       hideOuterRect={false}
                                       stackLayout={true}
                                       scaleText={1.5}
                                    />
                                 </div>
                              </div>

                              {/* Groom Chart Column */}
                              <div className="space-y-6">
                                 <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-4 text-center">
                                       {t('groomBirthProfile', "Groom's Birth Profile")}
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                                       <div>
                                          <div className="text-[12px] font-bold text-slate-900 uppercase">{t('fullName', 'Full Name')}</div>
                                          <div className="text-[18px] font-serif italic text-amber-600">{groomFullData?.title} {groomFullData?.name}</div>
                                       </div>
                                       <div>
                                          <div className="text-[12px] font-bold text-slate-900 uppercase">{t('birthDate', 'Birth Date')}</div>
                                          <div className="text-[14px] font-bold text-amber-600">{groomFullData?.birth_date}</div>
                                       </div>
                                       <div>
                                          <div className="text-[12px] font-bold text-slate-900 uppercase">{t('birthTime', 'Birth Time')}</div>
                                          <div className="text-[14px] font-bold text-amber-600">{groomFullData?.birth_time}</div>
                                       </div>
                                       <div>
                                          <div className="text-[12px] font-bold text-slate-900 uppercase">{t('birthLocation', 'Location')}</div>
                                          <div className="text-[14px] font-bold text-amber-600 truncate" title={groomFullData?.location_name}>{groomFullData?.location_name}</div>
                                       </div>
                                    </div>
                                 </div>
                                 <div className="aspect-square bg-slate-50 rounded-3xl p-6 border border-slate-100 shadow-inner">
                                    <ZodiacChart
                                       houses={report.groom_chart?.houses}
                                       title={t('groomLagnaTitle', `${groom}'s Lagna`)}
                                       variant="modern"
                                       defaultLang={language}
                                       key={`groom-lagna-${language}`}
                                       hideOuterRect={false}
                                       stackLayout={true}
                                       scaleText={1.5}
                                    />
                                 </div>
                                 <div className="aspect-square bg-slate-50 rounded-3xl p-6 border border-slate-100 shadow-inner">
                                    <ZodiacChart
                                       houses={report.groom_d9_chart?.houses}
                                       title={t('groomNavamshaTitle', `${groom}'s Navamsha (D9)`)}
                                       variant="modern"
                                       defaultLang={language}
                                       key={`groom-d9-${language}`}
                                       hideOuterRect={false}
                                       stackLayout={true}
                                       scaleText={1.5}
                                    />
                                 </div>
                              </div>
                           </div>
                        </section>

                     </div>
                  )}

                  {/* TAB 4: DEEP KUNDALI ASSESSMENT */}
                  {selectedTab === 'analysis' && (
                     <div className="space-y-12">
                        {/* Core Relationship & Family Dynamics Table */}
                        {report.custom_matchmaking_topics && (
                           <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100 relative overflow-hidden mt-12 mb-12">
                              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-500"></div>
                              <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none"></div>

                              <div className="text-center mb-10">
                                 <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-teal-600 mb-2">
                                    {t('bhavaGrahMilan', 'Bhava & Grah Milan')}
                                 </h3>
                                 <h2 className="text-3xl md:text-4xl font-serif italic text-slate-900">
                                    {t('marriedLifeCompatibility', 'Married life & family compatibility (दाम्पत्य जीवन और पारिवारिक मैत्री)')}
                                 </h2>
                                 <p className="text-slate-900 mt-3 max-w-2xl mx-auto text-base">
                                    {t('marriedLifeSub', 'A detailed breakdown of key domestic, emotional, and social parameters governing the marital bond, based on Vedic astrological principles.')}
                                 </p>
                              </div>

                              <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-sm bg-slate-50/50 backdrop-blur-md">
                                 <table className="w-full text-left border-collapse">
                                    <thead>
                                       <tr className="bg-indigo-300 text-bold text-sm uppercase tracking-widest border-b border-slate-200">
                                          <th className="px-6 py-4 font-semibold w-1/3">{t('colTopicDimension', 'Topic / Dimension')}</th>
                                          <th className="px-6 py-4 font-semibold w-1/4">{t('colCategory', 'Category')}</th>
                                          <th className="px-6 py-4 font-semibold text-center w-1/6">{t('colVerdict', 'Verdict')}</th>
                                          <th className="px-6 py-4 font-semibold w-2/5">{t('colAstrologicalExplanation', 'Astrological Explanation')}</th>
                                       </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-900 text-slate-900">
                                       {report.custom_matchmaking_topics.map((item, idx) => {
                                          let verdictColor = "text-amber-700 bg-amber-50 border-amber-200";
                                          let localizedVerdict = item.verdict;
                                          if (item.verdict === "Good") {
                                             verdictColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
                                             localizedVerdict = t('verdictGood', 'Good');
                                          } else if (item.verdict === "Bad") {
                                             verdictColor = "text-rose-700 bg-rose-50 border-rose-200";
                                             localizedVerdict = t('verdictBad', 'Bad');
                                          }

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
                                                <td className="px-6 py-5 text-[18px] text-lime-900 font-medium">{item.category}</td>
                                                <td className="px-6 py-5 text-center">
                                                   <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${verdictColor}`}>
                                                      {localizedVerdict}
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

                        {/* Girl Kundali Analysis */}
                        {bride_kundali && (
                           <section className="bg-white rounded-[2.5rem] p-12 shadow-xl border border-slate-100">
                              <div className="text-center mb-10">
                                 <h3 className="text-[14px] font-black uppercase tracking-[0.5em] text-pink-500 mb-2">
                                    {t('individualDestinyAssessment', 'Individual Destiny Assessment')}
                                 </h3>
                                 <h2 className="text-3xl font-serif italic text-slate-800">
                                    {t('brideKundaliDeepDive', "Bride's Kundali Deep Dive")}
                                 </h2>
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
                                 <h3 className="text-[14px] font-black uppercase tracking-[0.5em] text-blue-500 mb-2">
                                    {t('individualDestinyAssessment', 'Individual Destiny Assessment')}
                                 </h3>
                                 <h2 className="text-3xl font-serif italic text-slate-800">
                                    {t('groomKundaliDeepDive', "Groom's Kundali Deep Dive")}
                                 </h2>
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

                        {/* Strī Jātak (Female Horoscopy) Insights */}
                        {report.stri_jatak_insights && (
                           <section className="bg-white rounded-[2.5rem] p-12 shadow-xl border border-slate-100 relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/5 rounded-full blur-[80px] -mr-10 -mt-10"></div>
                              <div className="text-center mb-10">
                                 <h3 className="text-[14px] font-black uppercase tracking-[0.5em] text-pink-600 mb-2">
                                    {t('striJatakTitle', 'Strī Jātak (स्त्री जातक)')}
                                 </h3>
                                 <h2 className="text-3xl font-serif italic text-slate-800">
                                    {t('femaleHoroscopyInsights', 'Female Horoscopy Compatibility Insights')}
                                 </h2>
                                 <p className="text-sm text-slate-500 mt-2 max-w-xl mx-auto">
                                    {t('striJatakSub', "Classical astrological assessments for the bride based on Maharishi Parasara's rules for temperament, character, longevity, and marital harmony.")}
                                 </p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                 {/* Temperament Sign Polarity */}
                                 {report.stri_jatak_insights.temperament && (
                                    <div className="p-6 rounded-3xl border border-slate-900 bg-slate-50/50 flex flex-col justify-between">
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
                                          <h4 className="text-lg font-bold text-slate-800 mb-2">
                                             {t('temperamentSignPolarity', 'Temperament & Polarities')}
                                          </h4>
                                          <p className="text-slate-900 text-[14px] leading-relaxed mb-4">
                                             {report.stri_jatak_insights.temperament.description}
                                          </p>
                                          {report.stri_jatak_insights.temperament.simple_explanation && (
                                             <div className="mt-auto pt-3 border-t border-slate-200/50">
                                                <div className="text-[12px] font-black uppercase text-indigo-500 mb-1 tracking-wider">
                                                   🌱 {t('simpleMeaning', 'Simple Meaning')}
                                                </div>
                                                <div className="text-[14px] text-slate-900 font-medium italic">
                                                   "{report.stri_jatak_insights.temperament.simple_explanation}"
                                                </div>
                                             </div>
                                          )}
                                       </div>
                                    </div>
                                 )}

                                 {/* Trimsamsa Character Profile */}
                                 {report.stri_jatak_insights.trimsamsa && (
                                    <div className="p-6 rounded-3xl border border-slate-900 bg-slate-50/50 flex flex-col justify-between">
                                       <div>
                                          <div className="flex justify-between items-start mb-4">
                                             <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-2xl">💎</div>
                                             <span className="text-[10px] font-black uppercase px-3 py-1.5 rounded-full bg-amber-100 text-amber-800">
                                                {report.stri_jatak_insights.trimsamsa.trimsamsa_lord} Trimsamsa
                                             </span>
                                          </div>
                                          <h4 className="text-lg font-bold text-slate-800 mb-2">
                                             {t('characterVirtuesTrimsamsa', 'Character & Virtues (Trimsamsa)')}
                                          </h4>
                                          <p className="text-slate-900 text-[14px] leading-relaxed mb-1">
                                             {report.stri_jatak_insights.trimsamsa.outcome}
                                          </p>
                                          <div className="text-[12px] text-slate-900 font-semibold mb-4">
                                             Moon Owner: {report.stri_jatak_insights.trimsamsa.moon_sign_owner} | Trimsamsa Lord: {report.stri_jatak_insights.trimsamsa.trimsamsa_lord}
                                          </div>
                                          {report.stri_jatak_insights.trimsamsa.simple_explanation && (
                                             <div className="mt-auto pt-3 border-t border-slate-200/50">
                                                <div className="text-[12px] font-black uppercase text-amber-600 mb-1 tracking-wider">
                                                   🌱 {t('simpleMeaning', 'Simple Meaning')}
                                                </div>
                                                <div className="text-[14px] text-slate-900 font-medium italic">
                                                   "{report.stri_jatak_insights.trimsamsa.simple_explanation}"
                                                </div>
                                             </div>
                                          )}
                                       </div>
                                    </div>
                                 )}

                                 {/* Visha Kanya Yoga */}
                                 {report.stri_jatak_insights.visha_kanya && (
                                    <div className="p-6 rounded-3xl border border-slate-900 bg-slate-50/50 flex flex-col justify-between">
                                       <div>
                                          <div className="flex justify-between items-start mb-4">
                                             <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-2xl">🐍</div>
                                             <span className={`text-[12px] font-black uppercase px-3 py-1.5 rounded-full ${report.stri_jatak_insights.visha_kanya.present
                                                ? (report.stri_jatak_insights.visha_kanya.cancelled ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800')
                                                : 'bg-emerald-100 text-emerald-800'
                                                }`}>
                                                {report.stri_jatak_insights.visha_kanya.present
                                                   ? (report.stri_jatak_insights.visha_kanya.cancelled ? 'Cancelled' : 'Dosha Present')
                                                   : 'Clear'}
                                             </span>
                                          </div>
                                          <h4 className="text-lg font-bold text-slate-900 mb-2">
                                             {t('vishaKanyaAnalysis', 'Visha Kanya (विषकन्या) Analysis')}
                                          </h4>
                                          <p className="text-slate-900 text-[14px] leading-relaxed mb-4">
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
                                                <div className="text-[12px] font-black uppercase text-rose-900 mb-1 tracking-wider">
                                                   🌱 {t('simpleMeaning', 'Simple Meaning')}
                                                </div>
                                                <div className="text-[14px] text-slate-900 font-medium italic">
                                                   "{report.stri_jatak_insights.visha_kanya.simple_explanation}"
                                                </div>
                                             </div>
                                          )}
                                       </div>
                                    </div>
                                 )}

                                 {/* 7th House */}
                                 {report.stri_jatak_insights.seventh_house && (
                                    <div className="p-6 rounded-3xl border border-slate-900 bg-slate-50/50 flex flex-col justify-between">
                                       <div>
                                          <div className="flex justify-between items-start mb-4">
                                             <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-2xl">🏰</div>
                                             <span className={`text-[12px] font-black uppercase px-3 py-1.5 rounded-full ${report.stri_jatak_insights.seventh_house.status.includes('Malefic')
                                                ? 'bg-rose-100 text-rose-800'
                                                : 'bg-emerald-100 text-emerald-800'
                                                }`}>
                                                {report.stri_jatak_insights.seventh_house.status}
                                             </span>
                                          </div>
                                          <h4 className="text-lg font-bold text-slate-800 mb-2">
                                             {t('seventhHouseMarital', '7th House (Marital Happiness)')}
                                          </h4>
                                          <p className="text-slate-900 text-[14px] leading-relaxed mb-4">
                                             {report.stri_jatak_insights.seventh_house.description}
                                          </p>
                                          {report.stri_jatak_insights.seventh_house.simple_explanation && (
                                             <div className="mt-auto pt-3 border-t border-slate-200/50">
                                                <div className="text-[14px] font-black uppercase text-indigo-500 mb-1 tracking-wider">
                                                   🌱 {t('simpleMeaning', 'Simple Meaning')}
                                                </div>
                                                <div className="text-[14px] text-slate-700 font-medium italic">
                                                   "{report.stri_jatak_insights.seventh_house.simple_explanation}"
                                                </div>
                                             </div>
                                          )}
                                       </div>
                                    </div>
                                 )}

                                 {/* 8th House */}
                                 {report.stri_jatak_insights.eighth_house && (
                                    <div className="p-6 rounded-3xl border border-slate-900 bg-slate-50/50 flex flex-col justify-between">
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
                                          <h4 className="text-lg font-bold text-slate-800 mb-2">
                                             {t('eighthHouseLongevity', "8th House (Spouse's Longevity)")}
                                          </h4>
                                          <p className="text-slate-900 text-[14px] leading-relaxed mb-4">
                                             {report.stri_jatak_insights.eighth_house.description}
                                          </p>
                                          {report.stri_jatak_insights.eighth_house.simple_explanation && (
                                             <div className="mt-auto pt-3 border-t border-slate-200/50">
                                                <div className="text-[14px] font-black uppercase text-indigo-500 mb-1 tracking-wider">
                                                   🌱 {t('simpleMeaning', 'Simple Meaning')}
                                                </div>
                                                <div className="text-[14px] text-slate-900 font-medium italic">
                                                   "{report.stri_jatak_insights.eighth_house.simple_explanation}"
                                                </div>
                                             </div>
                                          )}
                                       </div>
                                    </div>
                                 )}

                                 {/* Mangal Matching */}
                                 {report.stri_jatak_insights.mangal_matching && (
                                    <div className="p-6 rounded-3xl border border-slate-900 bg-slate-50/50 flex flex-col justify-between">
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
                                          <h4 className="text-lg font-bold text-slate-800 mb-2">
                                             {t('mangalMatchingStri', 'Manglik Dosha Matching')}
                                          </h4>
                                          <p className="text-slate-900 text-sm leading-relaxed mb-4">
                                             {report.stri_jatak_insights.mangal_matching.description}
                                          </p>
                                          {report.stri_jatak_insights.mangal_matching.simple_explanation && (
                                             <div className="mt-auto pt-3 border-t border-slate-200/50">
                                                <div className="text-[14px] font-black uppercase text-red-500 mb-1 tracking-wider">
                                                   🌱 {t('simpleMeaning', 'Simple Meaning')}
                                                </div>
                                                <div className="text-[14px] text-slate-900 font-medium italic">
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

                        {/* Flex Estimation for Girl */}
                        <section className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-[2.5rem] p-12 shadow-xl border border-pink-100 flex flex-col lg:flex-row gap-12 items-center">
                           <div className="flex-1 space-y-6">
                              <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-pink-500 mb-2">
                                 {t('advancedPastTimeline', 'Advanced Past Timeline')}
                              </h3>
                              <h2 className="text-3xl font-serif italic text-slate-800">
                                 {t('flexEstimationGirl', 'Flex Estimation for Girl')}
                              </h2>
                              <p className="text-slate-600 font-medium tracking-wide">
                                 {t('astrologyCanEstimate', 'Astrology CAN estimate:')}
                              </p>
                              <ul className="space-y-4">
                                 <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                                    <span className="text-emerald-500 text-lg">✅</span> {t('canEstimate1', 'whether marriage yogas were strongly activated')}
                                 </li>
                                 <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                                    <span className="text-emerald-500 text-lg">✅</span> {t('canEstimate2', 'whether marriage likely occurred in past dashas')}
                                 </li>
                                 <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                                    <span className="text-emerald-500 text-lg">✅</span> {t('canEstimate3', 'possibility of prior serious relationships')}
                                 </li>
                                 <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                                    <span className="text-emerald-500 text-lg">✅</span> {t('canEstimate4', 'divorce/remarriage potential')}
                                 </li>
                                 <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                                    <span className="text-emerald-500 text-lg">✅</span> {t('canEstimate5', 'hidden relationship tendencies')}
                                 </li>
                                 <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                                    <span className="text-emerald-500 text-lg">✅</span> {t('canEstimate6', 'timing windows of marriage manifestation')}
                                 </li>
                              </ul>
                           </div>

                           <div className="flex-1 w-full bg-white rounded-3xl p-8 shadow-lg border border-pink-100 relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-500 mb-6 flex items-center gap-2">
                                 <span className="text-xl">🚀</span> {t('completeMarriageActivation', 'COMPLETE MARRIAGE ACTIVATION ANALYSIS')}
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
                                    {isAnalyzingActivation ? t('analyzingCosmicData', 'Analyzing Cosmic Data...') : t('runActivationAnalysis', 'Run Activation Analysis')}
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
                              <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 mb-2">
                                 {t('advancedPastTimeline', 'Advanced Past Timeline')}
                              </h3>
                              <h2 className="text-3xl font-serif italic text-slate-800">
                                 {t('flexEstimationBoy', 'Flex Estimation for Boy')}
                              </h2>
                              <p className="text-slate-600 font-medium tracking-wide">
                                 {t('astrologyCanEstimate', 'Astrology CAN estimate:')}
                              </p>
                              <ul className="space-y-4">
                                 <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                                    <span className="text-emerald-500 text-lg">✅</span> {t('canEstimate1', 'whether marriage yogas were strongly activated')}
                                 </li>
                                 <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                                    <span className="text-emerald-500 text-lg">✅</span> {t('canEstimate2', 'whether marriage likely occurred in past dashas')}
                                 </li>
                                 <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                                    <span className="text-emerald-500 text-lg">✅</span> {t('canEstimate3', 'possibility of prior serious relationships')}
                                 </li>
                                 <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                                    <span className="text-emerald-500 text-lg">✅</span> {t('canEstimate4', 'divorce/remarriage potential')}
                                 </li>
                                 <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                                    <span className="text-emerald-500 text-lg">✅</span> {t('canEstimate5', 'hidden relationship tendencies')}
                                 </li>
                                 <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                                    <span className="text-emerald-500 text-lg">✅</span> {t('canEstimate6', 'timing windows of marriage manifestation')}
                                 </li>
                              </ul>
                           </div>

                           <div className="flex-1 w-full bg-white rounded-3xl p-8 shadow-lg border border-blue-100 relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-6 flex items-center gap-2">
                                 <span className="text-xl">🚀</span> {t('completeMarriageActivation', 'COMPLETE MARRIAGE ACTIVATION ANALYSIS')}
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
                                    {isAnalyzingGroomActivation ? t('analyzingCosmicData', 'Analyzing Cosmic Data...') : t('runActivationAnalysis', 'Run Activation Analysis')}
                                 </button>
                              )}

                              {groomActivationAnalysis && (
                                 <div className="mt-6 p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50 prose prose-sm prose-blue max-w-none max-h-[500px] overflow-y-auto custom-scrollbar" dangerouslySetInnerHTML={{ __html: groomActivationAnalysis }}>
                                 </div>
                              )}
                           </div>
                        </section>

                     </div>
                  )}

                  {/* TAB 5: VIVAH MUHURTA & TIMING */}
                  {selectedTab === 'muhurta' && (
                     <div className="space-y-12">
                        {/* Combined Divine Timing Alignment (Favorable Marriage Windows) */}
                        {brideVim && groomVim && (
                           <section className="bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 rounded-[2.5rem] p-12 shadow-xl border border-pink-100/50">
                              <div className="text-center mb-10">
                                 <h3 className="text-[14px] font-black uppercase tracking-[0.5em] text-pink-600 mb-2">
                                    {t('cosmicSyncTiming', 'Cosmic Sync Timing')}
                                 </h3>
                                 <h2 className="text-3xl font-serif italic text-slate-800">
                                    {t('combinedFavorableMarriageWindows', 'Combined Favorable Marriage Windows')}
                                 </h2>
                                 <p className="text-[16px] text-slate-900 mt-2 max-w-xl mx-auto">
                                    {t('favorableMarriageWindowsSub', "These are the top 3 upcoming periods where both partners' astrological charts simultaneously support marriage activation.")}
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
                                          {t('noOverlappingWindows', 'No overlapping favorable marriage windows found in the upcoming periods.')}
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
                                                      {t('alignmentWindow', 'Alignment Window')} #{idx + 1}
                                                   </span>
                                                   <div className="text-xl font-bold text-slate-800 mb-1">
                                                      {jdToDateString(overlap.start_jd)} – {jdToDateString(overlap.end_jd)}
                                                   </div>
                                                   <div className="text-[14px] text-slate-900 mb-6">
                                                      {t('combinedActivationDuration', 'Combined Activation Duration')}
                                                   </div>
                                                </div>

                                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                                   <div className="flex justify-between items-center text-xs">
                                                      <span className=" text-[12px] text-slate-900 font-medium">👰 {brideFullData?.name || t('bride', 'Bride')}:</span>
                                                      <span className="font-bold text-indigo-950">
                                                         {overlap.bride_dasha} <span className="text-slate-900 font-normal">({t('age', 'Age')} {bAgeStart}-{bAgeEnd})</span>
                                                      </span>
                                                   </div>
                                                   <div className="flex justify-between items-center text-xs">
                                                      <span className="text-[12px] text-slate-900 font-medium">🤵 {groomFullData?.name || t('groom', 'Groom')}:</span>
                                                      <span className="font-bold text-indigo-950">
                                                         {overlap.groom_dasha} <span className="text-slate-900 font-normal">({t('age', 'Age')} {gAgeStart}-{gAgeEnd})</span>
                                                      </span>
                                                   </div>
                                                </div>

                                                {/* Auspicious Muhurta Dates */}
                                                <div className="mt-4 pt-4 border-t border-slate-100">
                                                   <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2 flex items-center gap-1">
                                                      <span>📅</span> {t('auspiciousMarriageDates', 'Auspicious Marriage Dates')}
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
                                                                     <span className="font-bold text-[12px]">{mDate}</span>
                                                                     <span className="font-bold text-[12px] text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded-md border border-pink-100/50">✨ {m.nakshatra}</span>
                                                                  </div>
                                                                  <div className="flex justify-between items-center text-[12px] text-slate-900 font-bold">
                                                                     <span>{t('time', 'Time')}: {startTime} – {endTime}</span>
                                                                     <span className="text-[12px] opacity-75">{m.tithi}</span>
                                                                  </div>
                                                               </div>
                                                            );
                                                         })}
                                                      </div>
                                                   ) : (
                                                      <div className="text-[10px] text-slate-400 italic">
                                                         {muhurtaDates[idx] ? t('noAuspiciousDatesInRange', "No auspicious dates found in this range") : t('calculatingMuhurtas', "Calculating Muhurtas...")}
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

                        {/* Step 2.5: Vivah Muhurta Planner Section */}
                        {report && (
                           <section className="bg-white rounded-[2.5rem] p-12 shadow-xl border border-slate-100 relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"></div>

                              <div className="text-center mb-10">
                                 <h3 className="text-[14px] font-black uppercase tracking-[0.5em] text-orange-600 mb-2">
                                    {t('vivahMuhurtaTag', 'Vivah Muhurta')}
                                 </h3>
                                 <h2 className="text-3xl font-serif italic text-slate-800">
                                    {t('auspiciousMarriagePlanner', 'Auspicious Marriage Planner (विवाह मुहूर्त)')}
                                 </h2>
                                 <p className="text-[16px] text-slate-900 mt-2 max-w-2xl mx-auto">
                                    {t('vivahPlannerSub', "A precise step-by-step mathematical check based on both bride's and groom's birth stars (Janma Nakshatras) and transit planetary strengths.")}
                                 </p>
                              </div>

                              <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 shadow-inner mb-8">
                                 <div className="flex flex-col md:flex-row items-end gap-6">
                                    <div className="flex-1 w-full">
                                       <label className="block text-slate-900 text-xs font-bold uppercase tracking-wider mb-2">
                                          {t('searchStartDate', 'Muhurta Search Start Date')}
                                       </label>
                                       <input
                                          type="date"
                                          value={vivahStartDate}
                                          onChange={(e) => setVivahStartDate(e.target.value)}
                                          className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all font-semibold"
                                       />
                                    </div>
                                    <div className="w-full md:w-48">
                                       <label className="block text-slate-900 text-xs font-bold uppercase tracking-wider mb-2">
                                          {t('scanRange', 'Scan Range')}
                                       </label>
                                       <select
                                          value={vivahDays}
                                          onChange={(e) => setVivahDays(parseInt(e.target.value))}
                                          className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all font-semibold"
                                       >
                                          <option value={30}>30 {t('daysUnit', 'Days')}</option>
                                          <option value={60}>60 {t('daysUnit', 'Days')}</option>
                                          <option value={90}>90 {t('daysUnit', 'Days')}</option>
                                          <option value={120}>120 {t('daysUnit', 'Days')}</option>
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
                                             {t('calculatingMuhurtas', 'Calculating...')}
                                          </>
                                       ) : t('findMuhurtas', 'Find Muhurtas')}
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
                                       <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">
                                          {t('datesHeatmap', 'Dates Heatmap')}
                                       </h3>
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
                                                      🌟 {t('auspiciousBadge', 'Auspicious')}
                                                   </span>
                                                ) : (
                                                   <span className="bg-rose-50 text-rose-500 border border-rose-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                                      {t('inauspiciousBadge', 'Inauspicious')}
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
                                                   <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">
                                                      {t('selectedDateAnalysis', 'Selected Date Analysis')}
                                                   </span>
                                                   <h4 className="text-xl font-bold text-slate-800 mt-1">
                                                      {new Date(selectedVivahDate.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                   </h4>
                                                   <p className="text-xs text-slate-400 mt-0.5">{selectedVivahDate.weekday}</p>
                                                </div>
                                                <div>
                                                   {selectedVivahDate.is_auspicious ? (
                                                      <div className="bg-emerald-500 text-white font-bold py-2 px-4 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                                                         {t('passedAllSteps', 'Passed All Steps')}
                                                      </div>
                                                   ) : (
                                                      <div className="bg-rose-500 text-white font-bold py-2 px-4 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-rose-500/20">
                                                         {t('failedChecks', 'Failed Checks')}
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
                                                      <h5 className="font-bold text-slate-800 text-sm">
                                                         {t('step1Title', 'Step 1: Janma Nakshatra & Moon Sign')}
                                                      </h5>
                                                      <p className="text-xs text-slate-900 mt-1">
                                                         {t('birthProfilesRetrieved', 'Birth profiles retrieved from charts:')}
                                                      </p>
                                                      <div className="grid grid-cols-2 gap-4 mt-2">
                                                         <div className="bg-pink-50/50 p-2.5 rounded-xl border border-pink-100 text-center">
                                                            <div className="text-[9px] font-black uppercase text-pink-600">
                                                               {t('brideBirthStar', "Bride's Birth Star")}
                                                            </div>
                                                            <div className="text-xs font-bold text-slate-800 mt-0.5">{selectedVivahDate.steps.step1.bride_nak}</div>
                                                         </div>
                                                         <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 text-center">
                                                            <div className="text-[9px] font-black uppercase text-blue-600">
                                                               {t('groomBirthStar', "Groom's Birth Star")}
                                                            </div>
                                                            <div className="text-xs font-bold text-slate-800 mt-0.5">{selectedVivahDate.steps.step1.groom_nak}</div>
                                                         </div>
                                                      </div>
                                                   </div>
                                                </div>

                                                {/* Step 2 */}
                                                <div className="flex items-start gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                                   <div className="text-2xl mt-0.5">{selectedVivahDate.steps.step2.pass ? "✅" : "❌"}</div>
                                                   <div className="flex-1">
                                                      <h5 className="font-bold text-slate-800 text-sm">
                                                         {t('step2Title', 'Step 2: Auspicious Marriage Nakshatras')}
                                                      </h5>
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
                                                      <h5 className="font-bold text-slate-800 text-sm">
                                                         {t('step3Title', 'Step 3: Dual Tara Bala (Strength of Stars)')}
                                                      </h5>
                                                      <div className="grid grid-cols-2 gap-4 mt-2">
                                                         <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                            <div className="text-[9px] font-black uppercase text-slate-500">
                                                               {t('bride', 'Bride')} Tara
                                                            </div>
                                                            <div className="text-xs font-bold text-slate-800 mt-0.5">{selectedVivahDate.steps.step3.bride_tara}</div>
                                                            <div className="text-[9px] font-medium text-slate-400">Remainder {selectedVivahDate.steps.step3.bride_remainder}</div>
                                                         </div>
                                                         <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                            <div className="text-[9px] font-black uppercase text-slate-800">
                                                               {t('groom', 'Groom')} Tara
                                                            </div>
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
                                                      <h5 className="font-bold text-slate-800 text-sm">
                                                         {t('step4Title', 'Step 4: Chandra Bala (Moon Strength)')}
                                                      </h5>
                                                      <div className="grid grid-cols-2 gap-4 mt-2">
                                                         <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                            <div className="text-[9px] font-black uppercase text-slate-800">
                                                               {t('bride', 'Bride')} Transit House
                                                            </div>
                                                            <div className="text-xs font-bold text-slate-800 mt-0.5">{selectedVivahDate.steps.step4.bride_house}th House</div>
                                                            <div className={`text-[9px] font-bold mt-0.5 ${[4, 8, 12].includes(selectedVivahDate.steps.step4.bride_house) ? 'text-red-500' : 'text-emerald-500'}`}>
                                                               {[4, 8, 12].includes(selectedVivahDate.steps.step4.bride_house) ? t('unfavorableStatus', 'Unfavorable') : t('favorableStatus', 'Favorable')}
                                                            </div>
                                                         </div>
                                                         <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                            <div className="text-[9px] font-black uppercase text-slate-800">
                                                               {t('groom', 'Groom')} Transit House
                                                            </div>
                                                            <div className="text-xs font-bold text-slate-800 mt-0.5">{selectedVivahDate.steps.step4.groom_house}th House</div>
                                                            <div className={`text-[9px] font-bold mt-0.5 ${[4, 8, 12].includes(selectedVivahDate.steps.step4.groom_house) ? 'text-red-500' : 'text-emerald-500'}`}>
                                                               {[4, 8, 12].includes(selectedVivahDate.steps.step4.groom_house) ? t('unfavorableStatus', 'Unfavorable') : t('favorableStatus', 'Favorable')}
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
                                                      <h5 className="font-bold text-slate-800 text-sm">
                                                         {t('step5Title', 'Step 5: Planetary Combustions')}
                                                      </h5>
                                                      <div className="flex flex-col gap-2 mt-2">
                                                         <div className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-xl border border-slate-100">
                                                            <span className="font-semibold text-slate-800">Bride's Guru Shuddhi (Jupiter):</span>
                                                            <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${selectedVivahDate.steps.step5.jupiter_combust ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                                               {selectedVivahDate.steps.step5.jupiter_combust ? t('combustStatus', 'Combust (Asta)') : t('pureStatus', 'Pure (Udaya)')}
                                                            </span>
                                                         </div>
                                                         <div className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-xl border border-slate-100">
                                                            <span className="font-semibold text-slate-800">Groom's Shukra Shuddhi (Venus):</span>
                                                            <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${selectedVivahDate.steps.step5.venus_combust ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                                               {selectedVivahDate.steps.step5.venus_combust ? t('combustStatus', 'Combust (Asta)') : t('pureStatus', 'Pure (Udaya)')}
                                                            </span>
                                                         </div>
                                                      </div>
                                                   </div>
                                                </div>

                                                {/* Step 6 */}
                                                <div className="flex items-start gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                                   <div className="text-2xl mt-0.5">{selectedVivahDate.steps.step6.pass ? "✅" : "❌"}</div>
                                                   <div className="flex-1">
                                                      <h5 className="font-bold text-slate-800 text-sm">
                                                         {t('step6Title', 'Step 6: Auspicious Tithi & Weekday')}
                                                      </h5>
                                                      <div className="grid grid-cols-2 gap-4 mt-2">
                                                         <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                            <div className="text-[9px] font-black uppercase text-slate-800">{t('tithiCol', 'Tithi')}</div>
                                                            <div className="text-xs font-bold text-slate-800 mt-0.5">{selectedVivahDate.tithi}</div>
                                                         </div>
                                                         <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                            <div className="text-[9px] font-black uppercase text-slate-800">Weekday</div>
                                                            <div className="text-xs font-bold text-slate-800 mt-0.5">{selectedVivahDate.weekday}</div>
                                                         </div>
                                                      </div>
                                                      <div className="text-[14px] text-slate-900 mt-2">
                                                         Requires Dwitiya, Tritiya, Panchami, Saptami, Dashami, Ekadashi, or Trayodashi. Rejects Rikta Tithis (4, 9, 14), Amavasya, and Eclipses.
                                                      </div>
                                                   </div>
                                                </div>
                                             </div>
                                          </div>
                                       ) : (
                                          <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-50">
                                             <span className="text-4xl">📅</span>
                                             <h4 className="font-bold text-slate-700 mt-3">{t('selectDatePrompt', 'Select a date from list')}</h4>
                                             <p className="text-xs text-slate-500 mt-1">{t('selectDatePromptSub', 'Select any date on the left to inspect its astrological parameters.')}</p>
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              )}
                           </section>
                        )}

                        {/* Step 5.5: Garbhadhana Muhurta Section */}
                        <div className="mb-12">
                           <div className="flex items-center gap-3 mb-6">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-600 to-purple-800 flex items-center justify-center shadow-lg border border-fuchsia-500/30">
                                 <span className="text-2xl text-white">🌸</span>
                              </div>
                              <div>
                                 <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-600 uppercase tracking-tight">
                                    {t('garbhadhanaMuhurtaTitle', 'Garbhadhana Muhurta')}
                                 </h2>
                                 <p className="text-slate-900 text-[18px] mt-1">
                                    {t('garbhadhanaSub', "Conception Timing based on both partners' Tara Bala & Ritu Kaal")}
                                 </p>
                              </div>
                           </div>

                           <div className="bg-slate-800/10 rounded-2xl border border-slate-700 p-8 shadow-xl">
                              <div className="flex flex-col md:flex-row items-end gap-4 mb-8">
                                 <div className="flex-1 w-full">
                                    <label className="block text-slate-900 text-[16px] font-bold uppercase tracking-wider mb-2">
                                       {t('cycleStartDate', 'Cycle Start Date (Ritu Kaal)')}
                                    </label>
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
                                    {isCalculatingGarbhadhana ? t('calculatingMuhurtas', 'Calculating...') : t('findMuhurtas', 'Find Muhurtas')}
                                 </button>
                              </div>

                              {garbhadhanaError && (
                                 <div className="p-4 rounded-xl bg-red-900/30 border border-red-500/50 text-red-400 mb-6 font-medium text-sm">
                                    {garbhadhanaError}
                                 </div>
                              )}

                              {garbhadhanaResults && (
                                 <div>
                                    <h3 className="text-lg font-bold text-slate-200 mb-4 border-b border-slate-700 pb-2">
                                       {t('auspiciousConceptionNights', 'Auspicious Conception Nights')}
                                    </h3>
                                    {garbhadhanaResults.length === 0 ? (
                                       <div className="text-slate-400 italic text-center p-6 bg-slate-900/50 rounded-xl border border-slate-800">
                                          {t('noAuspiciousConceptionDates', "No highly auspicious dates found in the 16-day window matching both partners' charts.")}
                                       </div>
                                    ) : (
                                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                          {garbhadhanaResults.map((res, i) => (
                                             <div key={i} className="bg-slate-900 rounded-xl p-5 border border-fuchsia-900/30 shadow-inner relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                                   <span className="text-4xl text-fuchsia-500">🌸</span>
                                                </div>
                                                <div className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest mb-1">
                                                   {t('cycleNight', 'Cycle Night')} {res.cycle_day}
                                                </div>
                                                <div className="text-xl font-black text-white mb-3">{res.date}</div>

                                                <div className="space-y-1.5 text-sm">
                                                   <div className="flex justify-between items-center bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                                                      <span className="text-slate-400">{t('genderPrediction', 'Prediction')}</span>
                                                      <span className="font-bold text-emerald-400">{res.gender_prediction}</span>
                                                   </div>
                                                   <div className="flex justify-between items-center bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                                                      <span className="text-slate-400">{t('nakshatraCol', 'Nakshatra')}</span>
                                                      <span className="text-slate-200 font-medium">{res.nakshatra}</span>
                                                   </div>
                                                   <div className="flex justify-between items-center bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                                                      <span className="text-slate-400">{t('tithiCol', 'Tithi')}</span>
                                                      <span className="text-slate-200 font-medium">Day {res.tithi}</span>
                                                   </div>
                                                </div>
                                             </div>
                                          ))}
                                       </div>
                                    )}
                                    <p className="text-xs text-slate-500 mt-6 text-center italic">
                                       {t('garbhadhanaNote', 'Note: Results automatically filter out forbidden days (1-4, 11, 13) and verify Dual Tara Bala for both partners.')}
                                    </p>
                                 </div>
                              )}
                           </div>
                        </div>

                     </div>
                  )}

                  {/* TAB 6: DOSHAS & REMEDIES */}
                  {selectedTab === 'remedies' && (
                     <div className="space-y-12">
                        {/* Step 4: Timing & Stability */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                           {/* Timing Card */}
                           <div className="bg-white rounded-[2rem] p-10 shadow-lg border border-slate-100">
                              <h3 className="text-[14px] font-black uppercase tracking-[0.3em] text-slate-900 mb-8">{t('marriageTiming', 'Marriage Timing')}</h3>
                              <div className="space-y-6">
                                 {timing.favorable_years.map(year => (
                                    <div key={year} className="flex justify-between items-center p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                       <span className="text-lg font-bold text-indigo-900">{year}</span>
                                       <span className="text-[12px] font-black uppercase text-indigo-900 bg-white px-3 py-1 rounded-full shadow-sm">{t('highProbability', 'High Probability')}</span>
                                    </div>
                                 ))}
                              </div>
                           </div>

                           {/* Manglik Section */}
                           <div className="bg-white rounded-[2rem] p-10 shadow-lg border border-slate-900">
                              <h3 className="text-[14px] font-black uppercase tracking-[0.3em] text-slate-900 mb-8">{t('manglikSync', 'Manglik Sync')}</h3>
                              <div className="space-y-4">
                                 <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                                    <span className="text-[12px] font-bold text-slate-900 uppercase">{t('bride', 'Bride')}</span>
                                    <span className={`text-[12px] font-black px-3 py-1 rounded-full ${manglik.bride?.is_manglik ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>{manglik.bride?.is_manglik ? t('manglikPresent', 'Manglik') : t('manglikClear', 'Clear')}</span>
                                 </div>
                                 <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                                    <span className="text-[12px] font-bold text-slate-900 uppercase">{t('groom', 'Groom')}</span>
                                    <span className={`text-[12px] font-black px-3 py-1 rounded-full ${manglik.groom?.is_manglik ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>{manglik.groom?.is_manglik ? t('manglikPresent', 'Manglik') : t('manglikClear', 'Clear')}</span>
                                 </div>
                                 <p className="text-[16px] text-slate-900 italic mt-4 pt-4 border-t border-slate-100 text-center leading-relaxed">"{manglik.analysis?.reason}"</p>
                              </div>
                           </div>

                           {/* Nadi Dosha Section */}
                           <div className="bg-white rounded-[2rem] p-10 shadow-lg border border-slate-900">
                              <h3 className="text-[14px] font-black uppercase tracking-[0.3em] text-slate-900 mb-8">{t('nadiDosha', 'Nadi Dosha')}</h3>
                              <div className="flex flex-col items-center justify-center space-y-4">
                                 <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-sm ${hasNadiDosha ? 'bg-rose-50 border-2 border-rose-100' : 'bg-emerald-50 border-2 border-emerald-100'}`}>
                                    {hasNadiDosha ? '⚠️' : '✅'}
                                 </div>
                                 <div className="text-center">
                                    <div className="text-lg font-bold text-slate-800">{hasNadiDosha ? t('doshaPresent', 'Dosha Present') : t('clear', 'Clear')}</div>
                                    <div className={`text-[14px] font-black uppercase mt-1 ${hasNadiDosha ? 'text-rose-600' : 'text-emerald-600'}`}>{t('healthGenetics', 'Health & Genetics')}</div>
                                 </div>
                                 <p className="text-[16px] text-slate-900 italic text-center leading-relaxed mt-2 pt-4 border-t border-slate-100">
                                    {hasNadiDosha ? `"${t('nadiDoshaWarning', '0/8 points. Strict medical and genetic compatibility screening advised.')}"` : `"${t('nadiDoshaClear', 'Excellent Nadi compatibility. Genetic flow is harmonious.')}"`}
                                 </p>
                              </div>
                           </div>

                           {/* Bhakoot Dosha Section */}
                           <div className="bg-white rounded-[2rem] p-10 shadow-lg border border-slate-900">
                              <h3 className="text-[14px] font-black uppercase tracking-[0.3em] text-slate-900 mb-8">{t('bhakootDosha', 'Bhakoot Dosha')}</h3>
                              <div className="flex flex-col items-center justify-center space-y-4">
                                 <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-sm ${hasBhakootDosha ? 'bg-rose-50 border-2 border-rose-100' : 'bg-emerald-50 border-2 border-emerald-100'}`}>
                                    {hasBhakootDosha ? '⚠️' : '✅'}
                                 </div>
                                 <div className="text-center">
                                    <div className="text-lg font-bold text-slate-800">{hasBhakootDosha ? t('doshaPresent', 'Dosha Present') : t('clear', 'Clear')}</div>
                                    <div className={`text-[14px] font-black uppercase mt-1 ${hasBhakootDosha ? 'text-rose-600' : 'text-emerald-600'}`}>{t('emotionalResonance', 'Emotional Resonance')}</div>
                                 </div>
                                 <p className="text-[16px] text-slate-900 italic text-center leading-relaxed mt-2 pt-4 border-t border-slate-100">
                                    {hasBhakootDosha ? `"${t('bhakootDoshaWarning', '0/7 points. Indicates potential emotional friction or misunderstandings.')}"` : `"${t('bhakootDoshaClear', 'Excellent Bhakoot compatibility. Emotional alignment is strong.')}"`}
                                 </p>
                              </div>
                           </div>

                           {/* Navamsa D9 Section */}
                           <div className="bg-white rounded-[2rem] p-10 shadow-lg border border-slate-900">
                              <h3 className="text-[14px] font-black uppercase tracking-[0.3em] text-slate-900 mb-8">{t('spiritualStabilityD9', 'Spiritual Stability (D9)')}</h3>
                              <div className="flex items-center gap-6 mb-8">
                                 <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-3xl shadow-sm">🧘</div>
                                 <div>
                                    <div className="text-lg font-bold text-slate-800">{navamsa.spiritual_bond} {t('spiritualBond', 'Bond')}</div>
                                    <div className="text-[14px] font-black uppercase text-purple-600">{navamsa.long_term_prospect} {t('longTermProspect', 'Prospect')}</div>
                                 </div>
                              </div>
                              <p className="text-[16px] text-slate-900 italic leading-relaxed">"{navamsa.description}"</p>
                           </div>
                        </div>

                        {/* Step 5: Professional Remedies Panel */}
                        <section className="bg-white rounded-[2.5rem] p-12 shadow-xl border border-slate-900 relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-32 h-full bg-slate-50/50 -skew-x-12"></div>
                           <h3 className="text-[18px] font-black uppercase tracking-[0.5em] text-slate-900 mb-10 text-center">
                              {t('remediesTitle', 'Destiny Balancing Protocol')}
                           </h3>
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

                     </div>
                  )}

               </main>
            </div>

            {/* Sacred Matchmaking Dual Banner Showcase - MK3 & MK1 */}
            <div className="w-full mt-14 mb-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                  <div className="relative group overflow-hidden rounded-3xl border border-amber-900/20 shadow-xl bg-neutral-900 aspect-16/7 sm:aspect-16/6 md:aspect-16/7 lg:aspect-16/6">
                     <img
                        src="/images/MK6.jpg"
                        alt="Vedic Matchmaking Sacred Banner 1"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>
                     <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between pointer-events-none">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/40 text-[11px] font-bold text-amber-300 uppercase tracking-widest">
                           💍 {t('sacredVivahBond', 'Sacred Vivah Sanskar')}
                        </span>
                     </div>
                  </div>

                  <div className="relative group overflow-hidden rounded-3xl border border-amber-900/20 shadow-xl bg-neutral-900 aspect-16/7 sm:aspect-16/6 md:aspect-16/7 lg:aspect-16/6">
                     <img
                        src="/images/MK5.jpg"
                        alt="Vedic Matchmaking Sacred Banner 2"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>
                     <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between pointer-events-none">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/40 text-[11px] font-bold text-amber-300 uppercase tracking-widest">
                           ✨ {t('vedicKundaliMilan', 'Vedic Kundali Milan')}
                        </span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Modern Vedic Astrological Footer */}
            <footer className="w-full bg-neutral-900 text-neutral-300 border-t border-neutral-800 mt-16 transition-colors rounded-3xl overflow-hidden shadow-2xl">
               {/* Top Feature Bar */}
               <div className="border-b border-neutral-800/80 bg-neutral-950/60 py-6 px-4 sm:px-6 lg:px-8">
                  <div className="max-w-[1600px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-neutral-300">
                     <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                           <Compass className="h-5 w-5" />
                        </div>
                        <div>
                           <h4 className="text-[16px] font-medium text-white">{t('Expert Precision', 'Expert Precision')}</h4>
                           <p className="text-[14px] text-orange-400">{t('Accurate degrees & planetary positions', 'Accurate degrees & planetary positions')}</p>
                        </div>
                     </div>

                     <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                           <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                           <h4 className="text-[16px] font-medium text-white">{t('Brihat Parashara Classical', 'Brihat Parashara Classical')}</h4>
                           <p className="text-[14px] text-orange-400">{t('Authentic Shastric principles & yogas', 'Authentic Shastric principles & yogas')}</p>
                        </div>
                     </div>

                     <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                           <Shield className="h-5 w-5" />
                        </div>
                        <div>
                           <h4 className="text-[16px] font-medium text-white">{t('100% Confidential & Secure', '100% Confidential & Secure')}</h4>
                           <p className="text-[14px] text-orange-400">{t('Private birth charts & consultations', 'Private birth charts & consultations')}</p>
                        </div>
                     </div>

                     <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                           <Award className="h-5 w-5" />
                        </div>
                        <div>
                           <h4 className="text-[16px] font-medium text-white">{t('Verified Astrologers', 'Verified Astrologers')}</h4>
                           <p className="text-[14px] text-orange-400">{t('Live chat & personalized remedies', 'Live chat & personalized remedies')}</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Main Footer Links */}
               <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                     {/* Column 1: Brand Info */}
                     <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center gap-2">
                           <span className="text-2xl font-bold font-serif bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                              AstroConsult
                           </span>
                           <span className="text-[10px] font-bold tracking-widest uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                              Vedic Astrology
                           </span>
                        </div>
                        <p className="text-xs sm:text-[16px] text-lime-400 leading-relaxed max-w-md">
                           {t('footerBrandDesc', 'Empowering your spiritual and worldly path through high-precision Vedic calculations, comprehensive 16-Varga divisional charts, Dasha analysis, and live consultation with certified astrologers.')}
                        </p>
                        <div className="flex items-center gap-4 text-[14px] text-amber-400 pt-2">
                           <div className="flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                              <span>{t('Active Calculation Engine:', 'Active Calculation Engine:')} <strong>Bhrigu Software 1.0</strong></span>
                           </div>
                        </div>
                     </div>

                     {/* Column 2: Kundali & Calculators */}
                     <div>
                        <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-4 border-b border-neutral-800 pb-2">
                           {t('Astrology Hub', 'Astrology Hub')}
                        </h4>
                        <ul className="space-y-2 text-[16px]">
                           <li>
                              <Link to="/kundali" className="text-indigo-400 hover:text-amber-400 transition">
                                 {t('Kundali Generation', 'Kundali Generation')}
                              </Link>
                           </li>
                           <li>
                              <Link to="/kundali-matching" className="text-indigo-400 hover:text-amber-400 transition">
                                 {t('Kundali Matching (Gun Milan)', 'Kundali Matching (Gun Milan)')}
                              </Link>
                           </li>
                           <li>
                              <Link to="/daily-calendar" className="text-indigo-400 hover:text-amber-400 transition">
                                 {t('Panchang & Daily Muhurta', 'Panchang & Daily Muhurta')}
                              </Link>
                           </li>
                           <li>
                              <Link to="/numerology" className="text-indigo-400 hover:text-amber-400 transition">
                                 {t('Vedic Numerology', 'Vedic Numerology')}
                              </Link>
                           </li>
                           <li>
                              <Link to="/lal-kitab" className="text-indigo-400 hover:text-amber-400 transition">
                                 {t('Lal Kitab Remedies', 'Lal Kitab Remedies')}
                              </Link>
                           </li>
                           <li>
                              <Link to="/tarot-reading" className="text-indigo-400 hover:text-amber-400 transition">
                                 {t('Tarot Card Insights', 'Tarot Card Insights')}
                              </Link>
                           </li>
                        </ul>
                     </div>

                     {/* Column 3: Consultations & Services */}
                     <div>
                        <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-4 border-b border-neutral-800 pb-2">
                           {t('Consultations', 'Consultations')}
                        </h4>
                        <ul className="space-y-2 text-[16px]">
                           <li>
                              <Link to="/astrologers" className="text-indigo-400 hover:text-amber-400 transition">
                                 {t('Our Astrologers', 'Our Astrologers')}
                              </Link>
                           </li>
                           <li>
                              <Link to="/live-astrologers" className="text-indigo-400 hover:text-amber-400 transition">
                                 {t('Live Video Consultation', 'Live Video Consultation')}
                              </Link>
                           </li>
                           <li>
                              <Link to="/live-chat" className="text-indigo-400 hover:text-amber-400 transition">
                                 {t('Live Chat with Astrologer', 'Live Chat with Astrologer')}
                              </Link>
                           </li>
                           <li>
                              <Link to="/ai-astrologer" className="text-indigo-400 hover:text-amber-400 transition">
                                 {t('AI Vedic Astrologer 24/7', 'AI Vedic Astrologer 24/7')}
                              </Link>
                           </li>
                           <li>
                              <Link to="/vastu-shastra" className="text-indigo-400 hover:text-amber-400 transition">
                                 {t('Vastu Shastra Consultation', 'Vastu Shastra Consultation')}
                              </Link>
                           </li>
                           <li>
                              <Link to="/shop" className="text-indigo-400 hover:text-amber-400 transition">
                                 {t('Astro Shop & Gemstones', 'Astro Shop & Gemstones')}
                              </Link>
                           </li>
                        </ul>
                     </div>

                     {/* Column 4: Quick Links & Support */}
                     <div>
                        <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-4 border-b border-neutral-800 pb-2">
                           {t('Support & Company', 'Support & Company')}
                        </h4>
                        <ul className="space-y-2 text-[16px]">
                           <li>
                              <Link to="/about" className="text-indigo-400 hover:text-amber-400 transition">
                                 {t('About Us', 'About Us')}
                              </Link>
                           </li>
                           <li>
                              <Link to="/contact" className="text-indigo-400 hover:text-amber-400 transition">
                                 {t('Contact & Support', 'Contact & Support')}
                              </Link>
                           </li>
                           <li>
                              <Link to="/zodiac" className="text-indigo-400 hover:text-amber-400 transition">
                                 {t('Zodiac Signs & Forecasts', 'Zodiac Signs & Forecasts')}
                              </Link>
                           </li>
                           <li>
                              <Link to="/community-videos" className="text-indigo-400 hover:text-amber-400 transition">
                                 {t('Community Videos', 'Community Videos')}
                              </Link>
                           </li>
                           <li>
                              <Link to="/dashboard" className="text-indigo-400 hover:text-amber-400 transition">
                                 {t('My Account / Dashboard', 'My Account / Dashboard')}
                              </Link>
                           </li>
                        </ul>
                     </div>
                  </div>
               </div>

               {/* Bottom Disclaimer & Copyright */}
               <div className="border-t border-neutral-800 py-6 px-4 sm:px-6 lg:px-8 bg-black/40">
                  <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[16px] text-white text-center md:text-left">
                     <p>
                        {t('footerDisclaimer', 'Disclaimer: Vedic astrology provides guidance based on planetary positions and Shastric principles. It is intended for advisory and personal growth purposes.')}
                     </p>
                     <p className="whitespace-nowrap">
                        {t('footerCopyright', 'Copyright © 2026 Phanom Technologies. All Rights Reserved.')}
                     </p>
                  </div>
               </div>
            </footer>

            {/* 25-Page Deep Analysis Report Modal */}
            <DeepAnalysisReportModal
               isOpen={isDeepReportModalOpen}
               onClose={() => setIsDeepReportModalOpen(false)}
               brideFullData={brideFullData}
               groomFullData={groomFullData}
               report={report}
            />

            {/* Timed Astrological Consultation Popup Modal (after 15 seconds) */}
            {isPopupOpen && (
               <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                  <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-visible border border-amber-300">

                     {/* Top Golden Header with Circular Rishi & Ganesh Ji Avatar */}
                     <div className="relative bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 pt-7 pb-6 px-6 rounded-t-[2rem] flex flex-col items-center">

                        {/* Circular Deity Portrait Badge at top center (half overlapping outside modal) */}
                        <div className="absolute -top-12 w-32 h-32 rounded-full p-1 bg-amber-400 shadow-xl border-4 border-white overflow-hidden bg-white">
                           <img
                              src="/images/ganeshji.jpg"
                              alt="शुभ विवाह"
                              className="w-full h-full object-cover object-top"
                           />
                        </div>

                        {/* Close button in top-right corner */}
                        <button
                           type="button"
                           onClick={() => setIsPopupOpen(false)}
                           className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-amber-600/70 hover:bg-amber-700 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                           aria-label="Close"
                        >
                           <X className="w-4 h-4" />
                        </button>
                     </div>

                     {/* Modal Body */}
                     <div className="px-6 pt-6 pb-7 space-y-6 text-center">

                        {/* Rotating Slogans (One by one every 3 seconds) */}
                        <div className="min-h-[110px] flex items-center justify-center px-2">
                           <div className="relative w-full h-24 overflow-hidden flex items-center justify-center">
                              {POPUP_SLOGANS.map((slogan, idx) => (
                                 <div
                                    key={idx}
                                    className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out px-1 ${popupSloganIndex === idx
                                       ? 'opacity-100 translate-y-0 scale-100'
                                       : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
                                       }`}
                                 >
                                    <h3 className="text-base sm:text-[22px] font-bold text-amber-700 leading-snug tracking-wide font-sans">
                                       {slogan}
                                    </h3>
                                 </div>
                              ))}
                           </div>
                        </div>

                        {/* Horizontal thin divider */}
                        <div className="w-full h-px bg-neutral-200"></div>

                        {/* Expert Astrologers Showcase (Rotating one by one every 5 seconds) */}
                        <div className="space-y-3">
                           <div className="relative min-h-[140px] flex items-center justify-center">
                              {(() => {
                                 const allAstros = (liveAstrologers && liveAstrologers.length > 0)
                                    ? liveAstrologers
                                    : [
                                       { name: "Kamal", image: null },
                                       { name: "Poonam", image: null },
                                       { name: "Monika", image: null }
                                    ];
                                 const totalAstros = allAstros.length;
                                 const currentIdx = popupAstroIndex % totalAstros;
                                 const currentAstro = allAstros[currentIdx];

                                 const rawImg = currentAstro.profilePicture || currentAstro.image || currentAstro.imageUrl || currentAstro.photo;
                                 const imgUrl = rawImg ? buildAssetUrl(rawImg) : null;
                                 const cleanFullName = (currentAstro.name || 'Astrologer').replace(/^astrologer\s+/i, '').trim();

                                 return (
                                    <div
                                       key={currentIdx}
                                       className="flex flex-col items-center gap-2 transition-all duration-700 ease-in-out animate-fadeIn"
                                    >
                                       <div className="relative">
                                          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-amber-400 p-0.5 bg-white shadow-lg">
                                             {imgUrl ? (
                                                <img
                                                   src={imgUrl}
                                                   alt={cleanFullName}
                                                   className="w-full h-full object-cover rounded-full"
                                                />
                                             ) : (
                                                <div className="w-full h-full rounded-full bg-amber-100 flex items-center justify-center text-amber-900 font-bold text-2xl">
                                                   {cleanFullName.charAt(0) || 'A'}
                                                </div>
                                             )}
                                          </div>
                                          {/* Live pulse dot */}
                                          <span className="absolute bottom-1 right-1 flex h-4 w-4">
                                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                             <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white shadow-xs"></span>
                                          </span>
                                       </div>

                                       <div className="flex flex-col items-center">
                                          <span className="text-base sm:text-lg font-black text-neutral-900">
                                             {cleanFullName}
                                          </span>
                                          <span className="text-[16px] text-amber-700 font-semibold">
                                             Verified Vedic Astrologer • Online
                                          </span>
                                       </div>

                                       {/* Pager Dots Indicator for Astrologers */}
                                       <div className="flex items-center gap-1.5 pt-1">
                                          {allAstros.map((_, dotIdx) => (
                                             <button
                                                key={dotIdx}
                                                type="button"
                                                onClick={() => setPopupAstroIndex(dotIdx)}
                                                className={`h-1.5 rounded-full transition-all cursor-pointer ${dotIdx === currentIdx ? 'w-5 bg-amber-500' : 'w-1.5 bg-neutral-300 hover:bg-neutral-400'
                                                   }`}
                                                aria-label={`Astrologer ${dotIdx + 1}`}
                                             />
                                          ))}
                                       </div>
                                    </div>
                                 );
                              })()}
                           </div>

                           <div className="text-[14px] sm:text-[16px] font-black uppercase tracking-[0.2em] text-amber-900">
                              CONSULT EXPERT ASTROLOGERS
                           </div>
                        </div>

                        {/* Two Orange Action Buttons: Live Astrologers & Chat Now */}
                        <div className="grid grid-cols-2 gap-3.5 pt-1">
                           <Link
                              to="/live-astrologers"
                              onClick={() => setIsPopupOpen(false)}
                              className="w-full py-3.5 px-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-[18px] shadow-lg shadow-orange-500/25 transition-all text-center flex items-center justify-center"
                           >
                              Live
                           </Link>

                           <Link
                              to="/live-chat"
                              onClick={() => setIsPopupOpen(false)}
                              className="w-full py-3.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-[18px] shadow-lg shadow-amber-500/25 transition-all text-center flex items-center justify-center"
                           >
                              Chat Now
                           </Link>
                        </div>

                     </div>

                  </div>
               </div>
            )}

         </div>

      </div>
   );
};

export default CompatibilityDashboard;
