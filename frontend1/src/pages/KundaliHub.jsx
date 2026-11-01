import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import VimshottariTable from '../components/VimshottariTable';
import DasaTimelineViewer from '../components/DasaTimelineViewer';
import YoginiTable from '../components/YoginiTable';
import CharaTable from '../components/CharaTable';
import {
  Compass,
  Briefcase,
  BookOpen,
  DollarSign,
  Heart,
  TrendingUp,
  Activity,
  Users,
  Grid,
  Sparkles,
  ArrowLeft,
  Calendar,
  Globe,
  MapPin,
  Clock,
  LayoutGrid,
  Star,
  Sun,
  FileText,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  User,
  X,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Shield,
  Phone,
  Mail,
  Award,
  Globe2,
  Languages,
  Wallet,
  Video,
  MessageSquare,
  CalendarClock,
  Calculator,
  HeartHandshake,
  ScrollText,
  Volume2,
  VolumeX
} from 'lucide-react';
import { VEDIC_ASTROLOGY_BASE_URL, API_BASE_URL, walletAPI, authAPI, buildAssetUrl } from '../services/api';
import { DEFAULT_STRINGS, SUPPORTED_LANGUAGES } from '../utils/kundaliHubStrings';
import { useLanguage } from '../context/LanguageContext';

const cleanAstrologerName = (rawName = '') => {
  return rawName.replace(/^Astrologer\s+/i, '').trim() || rawName;
};

const KundaliHub = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, currentLang: globalLang, changeLanguage: setGlobalLang } = useLanguage();
  const [birthData, setBirthData] = useState(null);
  const [activeNav, setActiveNav] = useState('vargas');
  const [showUserModal, setShowUserModal] = useState(false);
  const [isGenerating100Page, setIsGenerating100Page] = useState(false);
  const [reportSuccessModal, setReportSuccessModal] = useState(null);
  const [isGenerating40Page, setIsGenerating40Page] = useState(false);
  const [report40PageModal, setReport40PageModal] = useState(null);
  const [isGeneratingDhanYog, setIsGeneratingDhanYog] = useState(false);
  const [dhanYogSuccessModal, setDhanYogSuccessModal] = useState(null);
  const [isGeneratingRemedies, setIsGeneratingRemedies] = useState(false);
  const [remediesSuccessModal, setRemediesSuccessModal] = useState(null);
  const [selectedCategoryModal, setSelectedCategoryModal] = useState(null);
  const [selectedAstroModal, setSelectedAstroModal] = useState(null);
  const [showScrollBottom, setShowScrollBottom] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [d1LoadingModal, setD1LoadingModal] = useState(null); // { d1Url }
  const [showVimshottariModal, setShowVimshottariModal] = useState(false);
  const [showDasaTimelineModal, setShowDasaTimelineModal] = useState(false);
  const [showYoginiModal, setShowYoginiModal] = useState(false);
  const [showCharaModal, setShowCharaModal] = useState(false);
  const [isDashaExpanded, setIsDashaExpanded] = useState(false);
  const [isMantraMuted, setIsMantraMuted] = useState(false);
  const d1AudioRef = React.useRef(null);

  // Stop Swasti Vachan Mantra helper
  const stopD1Mantra = React.useCallback(() => {
    if (d1AudioRef.current) {
      d1AudioRef.current.pause();
      d1AudioRef.current.currentTime = 0;
    }
    setD1LoadingModal(null);
  }, []);

  // Listen for Kundali generated events (BroadcastChannel + postMessage) to immediately stop Mantra
  useEffect(() => {
    let bc;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('kundali_generation_channel');
        bc.onmessage = (event) => {
          if (event.data === 'KUNDALI_GENERATED' || event.data?.type === 'KUNDALI_GENERATED') {
            stopD1Mantra();
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel error:', e);
    }

    const handleWindowMsg = (e) => {
      if (e.data === 'KUNDALI_GENERATED' || e.data?.type === 'KUNDALI_GENERATED') {
        stopD1Mantra();
      }
    };
    window.addEventListener('message', handleWindowMsg);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('message', handleWindowMsg);
      if (d1AudioRef.current) {
        d1AudioRef.current.pause();
        d1AudioRef.current.currentTime = 0;
      }
    };
  }, [stopD1Mantra]);

  // Live Astrologers State (5 astrologers, rotating every 5s)
  const [availableAstrologers, setAvailableAstrologers] = useState([]);
  const [liveAstroStartIndex, setLiveAstroStartIndex] = useState(0);

  // 🌐 Multilingual State (Method B: Smart Cached Translation)
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('kundali_hub_lang') || 'en';
  });
  const [uiText, setUiText] = useState(() => {
    const savedLang = localStorage.getItem('kundali_hub_lang') || 'en';
    if (savedLang !== 'en') {
      const cached = localStorage.getItem(`kundali_hub_ui_${savedLang}`);
      if (cached) {
        try {
          return { ...DEFAULT_STRINGS, ...JSON.parse(cached) };
        } catch (e) { }
      }
    }
    return DEFAULT_STRINGS;
  });
  const [isTranslating, setIsTranslating] = useState(false);

  // Sync with global language changes when user switches language in the top navbar
  useEffect(() => {
    if (globalLang && globalLang !== currentLang) {
      handleLanguageChange(globalLang, false);
    }
  }, [globalLang]);

  const handleLanguageChange = async (targetLangCode, syncGlobal = true) => {
    if (syncGlobal && setGlobalLang) {
      setGlobalLang(targetLangCode);
    }

    if (targetLangCode === 'en') {
      setCurrentLang('en');
      setUiText(DEFAULT_STRINGS);
      localStorage.setItem('kundali_hub_lang', 'en');
      return;
    }

    // 1. Instant check: Browser localStorage cache (0ms latency, zero API call)
    const localCacheKey = `kundali_hub_ui_${targetLangCode}`;
    const localCached = localStorage.getItem(localCacheKey);
    if (localCached) {
      try {
        const parsed = JSON.parse(localCached);
        // Ensure new sidebar menu keys are present, else re-fetch
        if (parsed.catDivisionalCharts) {
          setUiText({ ...DEFAULT_STRINGS, ...parsed });
          setCurrentLang(targetLangCode);
          localStorage.setItem('kundali_hub_lang', targetLangCode);
          return;
        }
      } catch (e) { }
    }

    // 2. Fetch from backend with Gemini Flash translation & server disk caching
    try {
      setIsTranslating(true);
      const langObj = SUPPORTED_LANGUAGES.find(l => l.code === targetLangCode);
      const res = await fetch(`${API_BASE_URL}/translate/ui`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetLang: targetLangCode,
          targetLangName: langObj?.name || 'Hindi',
          namespace: 'kundali_hub',
          strings: DEFAULT_STRINGS
        })
      });

      const data = await res.json();
      if (data.success && data.translations) {
        const merged = { ...DEFAULT_STRINGS, ...data.translations };
        setUiText(merged);
        setCurrentLang(targetLangCode);
        localStorage.setItem('kundali_hub_lang', targetLangCode);
        localStorage.setItem(localCacheKey, JSON.stringify(data.translations));
      } else {
        throw new Error(data.error || 'Failed to translate');
      }
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  // 💰 User Wallet Balance State
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await walletAPI.getBalance();
          if (res?.data?.balance !== undefined) {
            setWalletBalance(res.data.balance);
          }
        }
      } catch (err) {
        // Silently handle guest / unauthenticated users
      }
    };
    fetchWallet();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      // Show scroll-to-bottom if not near the bottom
      if (scrollHeight - scrollY - clientHeight > 250) {
        setShowScrollBottom(true);
      } else {
        setShowScrollBottom(false);
      }

      // Show scroll-to-top if scrolled down a bit
      if (scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleDownload100PageReport = async () => {
    if (!birthData) return;
    try {
      setIsGenerating100Page(true);
      const coords = birthData.coordinates || '28.6139,77.2090';

      const payload = {
        name: birthData.name || 'User',
        dateOfBirth: birthData.dateOfBirth,
        timeOfBirth: birthData.timeOfBirth || '12:00',
        placeOfBirth: birthData.placeOfBirth || 'New Delhi, India',
        gender: birthData.gender || 'male',
        coordinates: coords,
        timezone: birthData.timezone || 'Asia/Kolkata'
      };

      const res = await fetch('http://localhost:5000/api/kundali/generate-100-page-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setReportSuccessModal(data);
      } else {
        throw new Error(data.error || 'Failed to generate report');
      }
    } catch (err) {
      console.error('Error generating 100-page Kundali:', err);
      alert('कुंडली तैयार करने में समस्या आई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsGenerating100Page(false);
    }
  };

  const handleDownload40PageReport = async () => {
    if (!birthData) return;
    try {
      setIsGenerating40Page(true);
      const coords = birthData.coordinates || '28.6139,77.2090';

      const payload = {
        name: birthData.name || 'User',
        dateOfBirth: birthData.dateOfBirth,
        timeOfBirth: birthData.timeOfBirth || '12:00',
        placeOfBirth: birthData.placeOfBirth || 'New Delhi, India',
        gender: birthData.gender || 'male',
        coordinates: coords,
        timezone: birthData.timezone || 'Asia/Kolkata'
      };

      const res = await fetch('http://localhost:5000/api/kundali/generate-40-page-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setReport40PageModal(data);
      } else {
        throw new Error(data.error || 'Failed to generate 40-page Kundali report');
      }
    } catch (err) {
      console.error('Error generating 40-page Kundali:', err);
      alert('40-पेज संपूर्ण कुंडली रिपोर्ट तैयार करने में समस्या आई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsGenerating40Page(false);
    }
  };

  const handleDownloadDhanYogReport = async () => {
    if (!birthData) return;
    try {
      setIsGeneratingDhanYog(true);
      const coords = birthData.coordinates || '28.6139,77.2090';

      const payload = {
        name: birthData.name || 'User',
        dateOfBirth: birthData.dateOfBirth,
        timeOfBirth: birthData.timeOfBirth || '12:00',
        placeOfBirth: birthData.placeOfBirth || 'New Delhi, India',
        gender: birthData.gender || 'male',
        coordinates: coords,
        timezone: birthData.timezone || 'Asia/Kolkata'
      };

      const res = await fetch('http://localhost:5000/api/kundali/generate-dhanyog-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setDhanYogSuccessModal(data);
      } else {
        throw new Error(data.error || 'Failed to generate Dhan Yog report');
      }
    } catch (err) {
      console.error('Error generating Dhan Yog report:', err);
      alert('धन योग रिपोर्ट तैयार करने में समस्या आई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsGeneratingDhanYog(false);
    }
  };

  const handleDownloadRemediesReport = async () => {
    if (!birthData) return;
    try {
      setIsGeneratingRemedies(true);
      const coords = birthData.coordinates || '28.6139,77.2090';

      const payload = {
        name: birthData.name || 'User',
        dateOfBirth: birthData.dateOfBirth,
        timeOfBirth: birthData.timeOfBirth || '12:00',
        placeOfBirth: birthData.placeOfBirth || 'New Delhi, India',
        gender: birthData.gender || 'male',
        coordinates: coords,
        timezone: birthData.timezone || 'Asia/Kolkata'
      };

      const res = await fetch('http://localhost:5000/api/kundali/generate-remedies-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setRemediesSuccessModal(data);
      } else {
        throw new Error(data.error || 'Failed to generate remedies report');
      }
    } catch (err) {
      console.error('Error generating Remedies report:', err);
      alert('उपाय रिपोर्ट तैयार करने में समस्या आई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsGeneratingRemedies(false);
    }
  };

  useEffect(() => {
    // Attempt to load birth data from router state, fallback to localStorage/sessionStorage
    if (location.state && location.state.birthData) {
      setBirthData(location.state.birthData);
      sessionStorage.setItem('lastGeneratedKundali', JSON.stringify(location.state.birthData));
    } else {
      const saved = sessionStorage.getItem('lastGeneratedKundali');
      if (saved) {
        try {
          setBirthData(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse birth data from session storage', e);
        }
      }
    }
  }, [location.state]);

  // Load Astrologers and set up 5-second automatic rotation
  useEffect(() => {
    const loadAstrologers = async () => {
      try {
        const response = await authAPI.getAstrologers();
        const all = response.data?.astrologers || [];
        if (all.length >= 9) {
          setAvailableAstrologers(all);
        } else {
          // Pre-populate with verified astrologers from image if fewer than 9
          const defaults = [
            { _id: 'mock-1', name: 'Hony Singh K...', pricing: 16, isAvailable: true, profilePicture: '/images/hero1.png' },
            { _id: 'mock-2', name: 'Kamal', pricing: 9, isAvailable: true },
            { _id: 'mock-3', name: 'Krishana', pricing: 9, isAvailable: true },
            { _id: 'mock-4', name: 'Monika Tyagi', pricing: 14, isAvailable: true },
            { _id: 'mock-5', name: 'Poonam', pricing: 9, isAvailable: true },
            { _id: 'mock-6', name: 'PreetPal', pricing: 9, isAvailable: true },
            { _id: 'mock-7', name: 'Ravi Jhangra', pricing: 9, isAvailable: true },
            { _id: 'mock-8', name: 'Ritu Saini', pricing: 12, isAvailable: true },
            { _id: 'mock-9', name: 'Sarika', pricing: 9, isAvailable: true },
            { _id: 'mock-10', name: 'Sonakshi', pricing: 9, isAvailable: true },
            { _id: 'mock-11', name: 'Swati Panwar', pricing: 12, isAvailable: true },
            { _id: 'mock-12', name: 'Tushar Naigu...', pricing: 9, isAvailable: true }
          ];
          const merged = [...all];
          defaults.forEach((def) => {
            if (!merged.some(a => a.name?.toLowerCase().includes(def.name.toLowerCase()))) {
              merged.push(def);
            }
          });
          setAvailableAstrologers(merged);
        }
      } catch (e) {
        setAvailableAstrologers([
          { _id: 'mock-1', name: 'Hony Singh K...', pricing: 16, isAvailable: true, profilePicture: '/images/hero1.png' },
          { _id: 'mock-2', name: 'Kamal', pricing: 9, isAvailable: true },
          { _id: 'mock-3', name: 'Krishana', pricing: 9, isAvailable: true },
          { _id: 'mock-4', name: 'Monika Tyagi', pricing: 14, isAvailable: true },
          { _id: 'mock-5', name: 'Poonam', pricing: 9, isAvailable: true },
          { _id: 'mock-6', name: 'PreetPal', pricing: 9, isAvailable: true },
          { _id: 'mock-7', name: 'Ravi Jhangra', pricing: 9, isAvailable: true },
          { _id: 'mock-8', name: 'Ritu Saini', pricing: 12, isAvailable: true },
          { _id: 'mock-9', name: 'Sarika', pricing: 9, isAvailable: true },
          { _id: 'mock-10', name: 'Sonakshi', pricing: 9, isAvailable: true },
          { _id: 'mock-11', name: 'Swati Panwar', pricing: 12, isAvailable: true },
          { _id: 'mock-12', name: 'Tushar Naigu...', pricing: 9, isAvailable: true }
        ]);
      }
    };
    loadAstrologers();
  }, []);

  // Cycle 1 by 1 every 5 seconds to display a sliding window of 9 astrologers
  useEffect(() => {
    if (!availableAstrologers || availableAstrologers.length <= 9) return;
    const timer = setInterval(() => {
      setLiveAstroStartIndex((prev) => (prev + 1) % availableAstrologers.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [availableAstrologers.length]);

  // Derived 9 visible astrologers for current 5-second interval
  const visibleNineAstrologers = React.useMemo(() => {
    if (!availableAstrologers || availableAstrologers.length === 0) return [];
    if (availableAstrologers.length <= 9) return availableAstrologers;
    const list = [];
    for (let i = 0; i < 9; i++) {
      list.push(availableAstrologers[(liveAstroStartIndex + i) % availableAstrologers.length]);
    }
    return list;
  }, [availableAstrologers, liveAstroStartIndex]);

  const handleRedirect = (type, value) => {
    if (!birthData) return;

    const basePortUrl = VEDIC_ASTROLOGY_BASE_URL;
    let targetParams = '';

    // Map parameters based on type
    if (type === 'varga') {
      targetParams = `worksheet=true&fullScreen=${value}`;
    } else if (type === 'oracle') {
      targetParams = value === 'lalkitab' ? `lalkitab=true` : `oracle=${value}`;
    } else if (type === 'simple') {
      targetParams = `${value}=true`;
    } else if (type === 'deep_horoscope') {
      targetParams = `deep_horoscope=${value}`;
    } else if (type === 'html_report') {
      targetParams = `html_report=true&hide_customization=true`;
    }

    // Build common parameters
    const latLon = birthData.coordinates ? birthData.coordinates.split(',') : ['28.6139', '77.2090'];
    const lat = latLon[0]?.trim() || '28.6139';
    const lon = latLon[1]?.trim() || '77.2090';

    const getTzOffset = (timezoneName) => {
      try {
        const date = new Date();
        const tzString = date.toLocaleString('en-US', { timeZone: timezoneName });
        const localString = date.toLocaleString('en-US');
        const diff = (Date.parse(tzString) - Date.parse(localString)) / 3600000;
        const localOffset = -date.getTimezoneOffset() / 60;
        return localOffset + diff;
      } catch (err) {
        return 5.5; // fallback
      }
    };

    const tzOffset = getTzOffset(birthData.timezone || 'Asia/Kolkata');

    // If user clicked D1 chart, play Swasti Vachan Mantra and show graceful loading modal with option to close
    if (type === 'varga' && (value === 'd1' || value === 'D1')) {
      const d1Url = `/chart/d1?name=${encodeURIComponent(birthData.name || 'User')}&date=${encodeURIComponent(birthData.dateOfBirth)}&time=${encodeURIComponent(birthData.timeOfBirth || '12:00')}&lat=${lat}&lon=${lon}&tz_offset=${tzOffset}&location_name=${encodeURIComponent(birthData.placeOfBirth || 'Birth Place')}&lang=${encodeURIComponent(currentLang || 'en')}`;

      // Start Swasti Vachan Mantra and show full Vedic loading modal
      setD1LoadingModal({ d1Url, title: 'Generating D1 Rasi Kundali' });
      setIsMantraMuted(false);

      // Play audio gracefully
      try {
        if (!d1AudioRef.current) {
          d1AudioRef.current = new Audio('/sounds/swasti_vachan_mantra.mp3');
          d1AudioRef.current.loop = true;
        }
        d1AudioRef.current.currentTime = 0;
        d1AudioRef.current.volume = 0.85;
        d1AudioRef.current.play().catch((err) => {
          console.warn('Audio autoplay requires user interaction:', err.message);
        });
      } catch (err) {
        console.warn('Could not initialize audio:', err);
      }

      // Pre-warm / fetch calculations, then launch window and stop mantra
      setTimeout(() => {
        window.open(d1Url, '_blank', 'width=1280,height=900,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes');
        stopD1Mantra();
      }, 3500);

      return;
    }

    // If user clicked D2 Hora chart, open dedicated in-app /chart/d2 window
    if (type === 'varga' && (value === 'd2' || value === 'D2')) {
      const d2Url = `/chart/d2?name=${encodeURIComponent(birthData.name || 'User')}&date=${encodeURIComponent(birthData.dateOfBirth)}&time=${encodeURIComponent(birthData.timeOfBirth || '12:00')}&lat=${lat}&lon=${lon}&tz_offset=${tzOffset}&location_name=${encodeURIComponent(birthData.placeOfBirth || 'Birth Place')}&lang=${encodeURIComponent(currentLang || 'en')}`;

      // Start Swasti Vachan Mantra and show full Vedic loading modal
      setD1LoadingModal({ d1Url: d2Url, title: 'Generating D2 Hora (Wealth) Kundali' });
      setIsMantraMuted(false);

      try {
        if (!d1AudioRef.current) {
          d1AudioRef.current = new Audio('/sounds/swasti_vachan_mantra.mp3');
          d1AudioRef.current.loop = true;
        }
        d1AudioRef.current.currentTime = 0;
        d1AudioRef.current.volume = 0.85;
        d1AudioRef.current.play().catch((err) => {
          console.warn('Audio autoplay requires user interaction:', err.message);
        });
      } catch (err) {
        console.warn('Could not initialize audio:', err);
      }

      setTimeout(() => {
        window.open(d2Url, '_blank', 'width=1280,height=900,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes');
        stopD1Mantra();
      }, 3500);

      return;
    }

    // If user clicked D3 Drekkana chart, open dedicated in-app /chart/d3 window
    if (type === 'varga' && (value === 'd3' || value === 'D3')) {
      const d3Url = `/chart/d3?name=${encodeURIComponent(birthData.name || 'User')}&date=${encodeURIComponent(birthData.dateOfBirth)}&time=${encodeURIComponent(birthData.timeOfBirth || '12:00')}&lat=${lat}&lon=${lon}&tz_offset=${tzOffset}&location_name=${encodeURIComponent(birthData.placeOfBirth || 'Birth Place')}&lang=${encodeURIComponent(currentLang || 'en')}`;

      // Start Swasti Vachan Mantra and show full Vedic loading modal
      setD1LoadingModal({ d1Url: d3Url, title: 'Generating D3 Drekkana (Courage & Siblings) Kundali' });
      setIsMantraMuted(false);

      try {
        if (!d1AudioRef.current) {
          d1AudioRef.current = new Audio('/sounds/swasti_vachan_mantra.mp3');
          d1AudioRef.current.loop = true;
        }
        d1AudioRef.current.currentTime = 0;
        d1AudioRef.current.volume = 0.85;
        d1AudioRef.current.play().catch((err) => {
          console.warn('Audio autoplay requires user interaction:', err.message);
        });
      } catch (err) {
        console.warn('Could not initialize audio:', err);
      }

      setTimeout(() => {
        window.open(d3Url, '_blank', 'width=1280,height=900,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes');
        stopD1Mantra();
      }, 3500);

      return;
    }

    // If user clicked D4 Chaturthamsha chart, open dedicated in-app /chart/d4 window
    if (type === 'varga' && (value === 'd4' || value === 'D4' || value === 'ChaturthamshaD4')) {
      const d4Url = `/chart/d4?name=${encodeURIComponent(birthData.name || 'User')}&date=${encodeURIComponent(birthData.dateOfBirth)}&time=${encodeURIComponent(birthData.timeOfBirth || '12:00')}&lat=${lat}&lon=${lon}&tz_offset=${tzOffset}&location_name=${encodeURIComponent(birthData.placeOfBirth || 'Birth Place')}&lang=${encodeURIComponent(currentLang || 'en')}`;

      // Start Swasti Vachan Mantra and show full Vedic loading modal
      setD1LoadingModal({ d4Url, title: 'Generating D4 Chaturthamsha (Property & Fortune) Kundali' });
      setIsMantraMuted(false);

      try {
        if (!d1AudioRef.current) {
          d1AudioRef.current = new Audio('/sounds/swasti_vachan_mantra.mp3');
          d1AudioRef.current.loop = true;
        }
        d1AudioRef.current.currentTime = 0;
        d1AudioRef.current.volume = 0.85;
        d1AudioRef.current.play().catch((err) => {
          console.warn('Audio autoplay requires user interaction:', err.message);
        });
      } catch (err) {
        console.warn('Could not initialize audio:', err);
      }

      setTimeout(() => {
        window.open(d4Url, '_blank', 'width=1280,height=900,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes');
        stopD1Mantra();
      }, 3500);

      return;
    }

    // If user clicked D7 Saptamsha chart, open dedicated in-app /chart/d7 window
    if (type === 'varga' && (value === 'd7' || value === 'D7' || value === 'SaptamshaD7')) {
      const d7Url = `/chart/d7?name=${encodeURIComponent(birthData.name || 'User')}&date=${encodeURIComponent(birthData.dateOfBirth)}&time=${encodeURIComponent(birthData.timeOfBirth || '12:00')}&lat=${lat}&lon=${lon}&tz_offset=${tzOffset}&location_name=${encodeURIComponent(birthData.placeOfBirth || 'Birth Place')}&lang=${encodeURIComponent(currentLang || 'en')}`;

      // Start Swasti Vachan Mantra and show full Vedic loading modal
      setD1LoadingModal({ d7Url, title: 'Generating D7 Saptamsha (Children & Progeny) Kundali' });
      setIsMantraMuted(false);

      try {
        if (!d1AudioRef.current) {
          d1AudioRef.current = new Audio('/sounds/swasti_vachan_mantra.mp3');
          d1AudioRef.current.loop = true;
        }
        d1AudioRef.current.currentTime = 0;
        d1AudioRef.current.volume = 0.85;
        d1AudioRef.current.play().catch((err) => {
          console.warn('Audio autoplay requires user interaction:', err.message);
        });
      } catch (err) {
        console.warn('Could not initialize audio:', err);
      }

      setTimeout(() => {
        window.open(d7Url, '_blank', 'width=1280,height=900,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes');
        stopD1Mantra();
      }, 3500);

      return;
    }

    // If user clicked D9 Navamsha chart, open dedicated in-app /chart/d9 window
    if (type === 'varga' && (value === 'd9' || value === 'D9' || value === 'NavamshaD9')) {
      const d9Url = `/chart/d9?name=${encodeURIComponent(birthData.name || 'User')}&date=${encodeURIComponent(birthData.dateOfBirth)}&time=${encodeURIComponent(birthData.timeOfBirth || '12:00')}&lat=${lat}&lon=${lon}&tz_offset=${tzOffset}&location_name=${encodeURIComponent(birthData.placeOfBirth || 'Birth Place')}&lang=${encodeURIComponent(currentLang || 'en')}`;

      // Start Swasti Vachan Mantra and show full Vedic loading modal
      setD1LoadingModal({ d9Url, title: 'Generating D9 Navamsha (Marriage & Soul Destiny) Kundali' });
      setIsMantraMuted(false);

      try {
        if (!d1AudioRef.current) {
          d1AudioRef.current = new Audio('/sounds/swasti_vachan_mantra.mp3');
          d1AudioRef.current.loop = true;
        }
        d1AudioRef.current.currentTime = 0;
        d1AudioRef.current.volume = 0.85;
        d1AudioRef.current.play().catch((err) => {
          console.warn('Audio autoplay requires user interaction:', err.message);
        });
      } catch (err) {
        console.warn('Could not initialize audio:', err);
      }

      setTimeout(() => {
        window.open(d9Url, '_blank', 'width=1280,height=900,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes');
        stopD1Mantra();
      }, 3500);

      return;
    }

    // If user clicked D10 Dashamsha chart, open dedicated in-app /chart/d10 window
    if (type === 'varga' && (value === 'd10' || value === 'D10' || value === 'DashamamshaD10')) {
      const d10Url = `/chart/d10?name=${encodeURIComponent(birthData.name || 'User')}&date=${encodeURIComponent(birthData.dateOfBirth)}&time=${encodeURIComponent(birthData.timeOfBirth || '12:00')}&lat=${lat}&lon=${lon}&tz_offset=${tzOffset}&location_name=${encodeURIComponent(birthData.placeOfBirth || 'Birth Place')}&lang=${encodeURIComponent(currentLang || 'en')}`;

      // Start Swasti Vachan Mantra and show full Vedic loading modal
      setD1LoadingModal({ d10Url, title: 'Generating D10 Dashamsha (Career, Karma & Authority) Kundali' });
      setIsMantraMuted(false);

      try {
        if (!d1AudioRef.current) {
          d1AudioRef.current = new Audio('/sounds/swasti_vachan_mantra.mp3');
          d1AudioRef.current.loop = true;
        }
        d1AudioRef.current.currentTime = 0;
        d1AudioRef.current.volume = 0.85;
        d1AudioRef.current.play().catch((err) => {
          console.warn('Audio autoplay requires user interaction:', err.message);
        });
      } catch (err) {
        console.warn('Could not initialize audio:', err);
      }

      setTimeout(() => {
        window.open(d10Url, '_blank', 'width=1280,height=900,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes');
        stopD1Mantra();
      }, 3500);

      return;
    }

    // If user clicked D12 Dwadashamsha chart, open dedicated in-app /chart/d12 window
    if (type === 'varga' && (value === 'd12' || value === 'D12' || value === 'DwadashamshaD12')) {
      const d12Url = `/chart/d12?name=${encodeURIComponent(birthData.name || 'User')}&date=${encodeURIComponent(birthData.dateOfBirth)}&time=${encodeURIComponent(birthData.timeOfBirth || '12:00')}&lat=${lat}&lon=${lon}&tz_offset=${tzOffset}&location_name=${encodeURIComponent(birthData.placeOfBirth || 'Birth Place')}&lang=${encodeURIComponent(currentLang || 'en')}`;

      // Start Swasti Vachan Mantra and show full Vedic loading modal
      setD1LoadingModal({ d12Url, title: 'Generating D12 Dwadashamsha (Parents, Lineage & Ancestral Karma) Kundali' });
      setIsMantraMuted(false);

      try {
        if (!d1AudioRef.current) {
          d1AudioRef.current = new Audio('/sounds/swasti_vachan_mantra.mp3');
          d1AudioRef.current.loop = true;
        }
        d1AudioRef.current.currentTime = 0;
        d1AudioRef.current.volume = 0.85;
        d1AudioRef.current.play().catch((err) => {
          console.warn('Audio autoplay requires user interaction:', err.message);
        });
      } catch (err) {
        console.warn('Could not initialize audio:', err);
      }

      setTimeout(() => {
        window.open(d12Url, '_blank', 'width=1280,height=900,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes');
        stopD1Mantra();
      }, 3500);

      return;
    }

    // If user clicked D16 Shodashamsha chart, open dedicated in-app /chart/d16 window
    if (type === 'varga' && (value === 'd16' || value === 'D16' || value === 'ShodashamshaD16')) {
      const d16Url = `/chart/d16?name=${encodeURIComponent(birthData.name || 'User')}&date=${encodeURIComponent(birthData.dateOfBirth)}&time=${encodeURIComponent(birthData.timeOfBirth || '12:00')}&lat=${lat}&lon=${lon}&tz_offset=${tzOffset}&location_name=${encodeURIComponent(birthData.placeOfBirth || 'Birth Place')}&lang=${encodeURIComponent(currentLang || 'en')}`;

      // Start Swasti Vachan Mantra and show full Vedic loading modal
      setD1LoadingModal({ d16Url, title: 'Generating D16 Shodashamsha (Vehicles, Luxuries & Material Comforts) Kundali' });
      setIsMantraMuted(false);

      try {
        if (!d1AudioRef.current) {
          d1AudioRef.current = new Audio('/sounds/swasti_vachan_mantra.mp3');
          d1AudioRef.current.loop = true;
        }
        d1AudioRef.current.currentTime = 0;
        d1AudioRef.current.volume = 0.85;
        d1AudioRef.current.play().catch((err) => {
          console.warn('Audio autoplay requires user interaction:', err.message);
        });
      } catch (err) {
        console.warn('Could not initialize audio:', err);
      }

      setTimeout(() => {
        window.open(d16Url, '_blank', 'width=1280,height=900,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes');
        stopD1Mantra();
      }, 3500);

      return;
    }

    // If user clicked D20 Vimshamsha chart, open dedicated in-app /chart/d20 window
    if (type === 'varga' && (value === 'd20' || value === 'D20' || value === 'VimshamshaD20')) {
      const d20Url = `/chart/d20?name=${encodeURIComponent(birthData.name || 'User')}&date=${encodeURIComponent(birthData.dateOfBirth)}&time=${encodeURIComponent(birthData.timeOfBirth || '12:00')}&lat=${lat}&lon=${lon}&tz_offset=${tzOffset}&location_name=${encodeURIComponent(birthData.placeOfBirth || 'Birth Place')}&lang=${encodeURIComponent(currentLang || 'en')}`;

      // Start Swasti Vachan Mantra and show full Vedic loading modal
      setD1LoadingModal({ d1Url: d20Url, title: 'Generating D20 Vimshamsha (Spirituality, Meditation & Worship) Kundali' });
      setIsMantraMuted(false);

      try {
        if (!d1AudioRef.current) {
          d1AudioRef.current = new Audio('/sounds/swasti_vachan_mantra.mp3');
          d1AudioRef.current.loop = true;
        }
        d1AudioRef.current.currentTime = 0;
        d1AudioRef.current.volume = 0.85;
        d1AudioRef.current.play().catch((err) => {
          console.warn('Audio autoplay requires user interaction:', err.message);
        });
      } catch (err) {
        console.warn('Could not initialize audio:', err);
      }

      setTimeout(() => {
        window.open(d20Url, '_blank', 'width=1280,height=900,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes');
        stopD1Mantra();
      }, 3500);

      return;
    }

    // If user clicked D24 Chaturvimshamsha chart, open dedicated in-app /chart/d24 window
    if (type === 'varga' && (value === 'd24' || value === 'D24' || value === 'ChaturvimshamshaD24')) {
      const d24Url = `/chart/d24?name=${encodeURIComponent(birthData.name || 'User')}&date=${encodeURIComponent(birthData.dateOfBirth)}&time=${encodeURIComponent(birthData.timeOfBirth || '12:00')}&lat=${lat}&lon=${lon}&tz_offset=${tzOffset}&location_name=${encodeURIComponent(birthData.placeOfBirth || 'Birth Place')}&lang=${encodeURIComponent(currentLang || 'en')}`;

      // Start Swasti Vachan Mantra and show full Vedic loading modal
      setD1LoadingModal({ d1Url: d24Url, title: 'Generating D24 Chaturvimshamsha (Higher Education & Wisdom) Kundali' });
      setIsMantraMuted(false);

      try {
        if (!d1AudioRef.current) {
          d1AudioRef.current = new Audio('/sounds/swasti_vachan_mantra.mp3');
          d1AudioRef.current.loop = true;
        }
        d1AudioRef.current.currentTime = 0;
        d1AudioRef.current.volume = 0.85;
        d1AudioRef.current.play().catch((err) => {
          console.warn('Audio autoplay requires user interaction:', err.message);
        });
      } catch (err) {
        console.warn('Could not initialize audio:', err);
      }

      setTimeout(() => {
        window.open(d24Url, '_blank', 'width=1280,height=900,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes');
        stopD1Mantra();
      }, 3500);

      return;
    }

    // If user clicked D27 Bhamsa / Saptavimshamsha chart, open dedicated in-app /chart/d27 window
    if (type === 'varga' && (value === 'd27' || value === 'D27' || value === 'BhamsaD27' || value === 'SaptavimshamshaD27')) {
      const d27Url = `/chart/d27?name=${encodeURIComponent(birthData.name || 'User')}&date=${encodeURIComponent(birthData.dateOfBirth)}&time=${encodeURIComponent(birthData.timeOfBirth || '12:00')}&lat=${lat}&lon=${lon}&tz_offset=${tzOffset}&location_name=${encodeURIComponent(birthData.placeOfBirth || 'Birth Place')}&lang=${encodeURIComponent(currentLang || 'en')}`;

      // Start Swasti Vachan Mantra and show full Vedic loading modal
      setD1LoadingModal({ d1Url: d27Url, title: 'Generating D27 Bhamsa (Inner Strength & Soul Power) Kundali' });
      setIsMantraMuted(false);

      try {
        if (!d1AudioRef.current) {
          d1AudioRef.current = new Audio('/sounds/swasti_vachan_mantra.mp3');
          d1AudioRef.current.loop = true;
        }
        d1AudioRef.current.currentTime = 0;
        d1AudioRef.current.volume = 0.85;
        d1AudioRef.current.play().catch((err) => {
          console.warn('Audio autoplay requires user interaction:', err.message);
        });
      } catch (err) {
        console.warn('Could not initialize audio:', err);
      }

      setTimeout(() => {
        window.open(d27Url, '_blank', 'width=1280,height=900,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes');
        stopD1Mantra();
      }, 3500);

      return;
    }

    // If user clicked D30 Trimshamsha chart, open dedicated in-app /chart/d30 window
    if (type === 'varga' && (value === 'd30' || value === 'D30' || value === 'TrimshamshaD30' || value === 'TrishamshaD30')) {
      const d30Url = `/chart/d30?name=${encodeURIComponent(birthData.name || 'User')}&date=${encodeURIComponent(birthData.dateOfBirth)}&time=${encodeURIComponent(birthData.timeOfBirth || '12:00')}&lat=${lat}&lon=${lon}&tz_offset=${tzOffset}&location_name=${encodeURIComponent(birthData.placeOfBirth || 'Birth Place')}&lang=${encodeURIComponent(currentLang || 'en')}`;

      // Start Swasti Vachan Mantra and show full Vedic loading modal
      setD1LoadingModal({ d1Url: d30Url, title: 'Generating D30 Trimshamsha (Misfortunes & Resilience) Kundali' });
      setIsMantraMuted(false);

      try {
        if (!d1AudioRef.current) {
          d1AudioRef.current = new Audio('/sounds/swasti_vachan_mantra.mp3');
          d1AudioRef.current.loop = true;
        }
        d1AudioRef.current.currentTime = 0;
        d1AudioRef.current.volume = 0.85;
        d1AudioRef.current.play().catch((err) => {
          console.warn('Audio autoplay requires user interaction:', err.message);
        });
      } catch (err) {
        console.warn('Could not initialize audio:', err);
      }

      setTimeout(() => {
        window.open(d30Url, '_blank', 'width=1280,height=900,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes');
        stopD1Mantra();
      }, 3500);

      return;
    }

    // If user clicked D40 Khavedamsha chart, open dedicated in-app /chart/d40 window
    if (type === 'varga' && (value === 'd40' || value === 'D40' || value === 'KhavedamshaD40' || value === 'ChatvarimshamshaD40')) {
      const d40Url = `/chart/d40?name=${encodeURIComponent(birthData.name || 'User')}&date=${encodeURIComponent(birthData.dateOfBirth)}&time=${encodeURIComponent(birthData.timeOfBirth || '12:00')}&lat=${lat}&lon=${lon}&tz_offset=${tzOffset}&location_name=${encodeURIComponent(birthData.placeOfBirth || 'Birth Place')}&lang=${encodeURIComponent(currentLang || 'en')}`;

      // Start Swasti Vachan Mantra and show full Vedic loading modal
      setD1LoadingModal({ d1Url: d40Url, title: 'Generating D40 Khavedamsha (Maternal Heritage & Auspicious Fruits) Kundali' });
      setIsMantraMuted(false);

      try {
        if (!d1AudioRef.current) {
          d1AudioRef.current = new Audio('/sounds/swasti_vachan_mantra.mp3');
          d1AudioRef.current.loop = true;
        }
        d1AudioRef.current.currentTime = 0;
        d1AudioRef.current.volume = 0.85;
        d1AudioRef.current.play().catch((err) => {
          console.warn('Audio autoplay requires user interaction:', err.message);
        });
      } catch (err) {
        console.warn('Could not initialize audio:', err);
      }

      setTimeout(() => {
        window.open(d40Url, '_blank', 'width=1280,height=900,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes');
        stopD1Mantra();
      }, 3500);

      return;
    }

    // If user clicked D45 Akshavedamsha chart, open dedicated in-app /chart/d45 window
    if (type === 'varga' && (value === 'd45' || value === 'D45' || value === 'AkshavedamshaD45' || value === 'PanchachatvarimshamshaD45')) {
      const d45Url = `/chart/d45?name=${encodeURIComponent(birthData.name || 'User')}&date=${encodeURIComponent(birthData.dateOfBirth)}&time=${encodeURIComponent(birthData.timeOfBirth || '12:00')}&lat=${lat}&lon=${lon}&tz_offset=${tzOffset}&location_name=${encodeURIComponent(birthData.placeOfBirth || 'Birth Place')}&lang=${encodeURIComponent(currentLang || 'en')}`;

      // Start Swasti Vachan Mantra and show full Vedic loading modal
      setD1LoadingModal({ d1Url: d45Url, title: 'Generating D45 Akshavedamsha (Character & Paternal Heritage) Kundali' });
      setIsMantraMuted(false);

      try {
        if (!d1AudioRef.current) {
          d1AudioRef.current = new Audio('/sounds/swasti_vachan_mantra.mp3');
          d1AudioRef.current.loop = true;
        }
        d1AudioRef.current.currentTime = 0;
        d1AudioRef.current.volume = 0.85;
        d1AudioRef.current.play().catch((err) => {
          console.warn('Audio autoplay requires user interaction:', err.message);
        });
      } catch (err) {
        console.warn('Could not initialize audio:', err);
      }

      setTimeout(() => {
        window.open(d45Url, '_blank', 'width=1280,height=900,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes');
        stopD1Mantra();
      }, 3500);

      return;
    }

    // If user clicked D60 Shashtiamsha chart, open dedicated in-app /chart/d60 window
    if (type === 'varga' && (value === 'd60' || value === 'D60' || value === 'ShashtiamshaD60' || value === 'ShashtyamshaD60')) {
      const d60Url = `/chart/d60?name=${encodeURIComponent(birthData.name || 'User')}&date=${encodeURIComponent(birthData.dateOfBirth)}&time=${encodeURIComponent(birthData.timeOfBirth || '12:00')}&lat=${lat}&lon=${lon}&tz_offset=${tzOffset}&location_name=${encodeURIComponent(birthData.placeOfBirth || 'Birth Place')}&lang=${encodeURIComponent(currentLang || 'en')}`;

      // Start Swasti Vachan Mantra and show full Vedic loading modal
      setD1LoadingModal({ d1Url: d60Url, title: 'Generating D60 Shashtiamsha (Past Life Karma & Destiny) Kundali' });
      setIsMantraMuted(false);

      try {
        if (!d1AudioRef.current) {
          d1AudioRef.current = new Audio('/sounds/swasti_vachan_mantra.mp3');
          d1AudioRef.current.loop = true;
        }
        d1AudioRef.current.currentTime = 0;
        d1AudioRef.current.volume = 0.85;
        d1AudioRef.current.play().catch((err) => {
          console.warn('Audio autoplay requires user interaction:', err.message);
        });
      } catch (err) {
        console.warn('Could not initialize audio:', err);
      }

      setTimeout(() => {
        window.open(d60Url, '_blank', 'width=1280,height=900,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes');
        stopD1Mantra();
      }, 3500);

      return;
    }

    const redirectUrl = `${basePortUrl}/?${targetParams}&hide_search=true&from_app=frontend1&name=${encodeURIComponent(birthData.name || 'User')}&date=${encodeURIComponent(birthData.dateOfBirth)}&time=${encodeURIComponent(birthData.timeOfBirth || '12:00')}&lat=${lat}&lon=${lon}&tz_offset=${tzOffset}&location_name=${encodeURIComponent(birthData.placeOfBirth || 'Birth Place')}&gender=Male`;

    window.open(redirectUrl, '_blank');
  };

  const scrollToSection = (id) => {
    setActiveNav(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const deepHoroscopes = [
    { key: 'daily', name: 'Daily Horoscope', desc: 'Hour-by-hour planetary insights & predictions', icon: Sun },
    { key: 'monthly', name: 'Monthly Horoscope', desc: 'Detailed transit forecasts & lunar cycles', icon: Calendar },
    { key: 'yearly', name: 'Yearly Horoscope', desc: 'Solar return & major yearly trends', icon: Globe }
  ];

  const vargaCharts = [
    { code: 'd1', name: 'D1 Rasi', desc: 'Natal / Baseline Chart' },
    { code: 'd2', name: 'D2 Hora', desc: 'Wealth & Assets' },
    { code: 'd3', name: 'D3 Drekkana', desc: 'Siblings & Courage' },
    { code: 'd4', name: 'D4 Chaturthamsha', desc: 'Property & Fortune' },
    { code: 'd7', name: 'D7 Saptamsha', desc: 'Children & Progeny' },
    { code: 'd9', name: 'D9 Navamsha', desc: 'Marriage & Soul Destiny' },
    { code: 'd10', name: 'D10 Dashamamsha', desc: 'Career & Authority' },
    { code: 'd12', name: 'D12 Dwadashamsha', desc: 'Parents & Lineage' },
    { code: 'd16', name: 'D16 Shodashamsha', desc: 'Vehicles & Happiness' },
    { code: 'd20', name: 'D20 Vimshamsha', desc: 'Spirituality & Devotion' },
    { code: 'd24', name: 'D24 Chaturvimshamsha', desc: 'Learning & Wisdom' },
    { code: 'd27', name: 'D27 Bhamsha', desc: 'Strengths & Weaknesses' },
    { code: 'd30', name: 'D30 Trimshamsha', desc: 'Evils & Afflictions' },
    { code: 'd40', name: 'D40 Khavedamsha', desc: 'Auspicious Fruits' },
    { code: 'd45', name: 'D45 Akshavedamsha', desc: 'Character & Integrity' },
    { code: 'd60', name: 'D60 Shashtyamsha', desc: 'Past Karma & Roots' }
  ];

  const lifeThemes = [
    { key: 'study', name: 'Study Analysis', icon: BookOpen, desc: 'Education, Academics & Exams' },
    { key: 'career', name: 'Career Analysis', icon: Briefcase, desc: 'Profession, Status & Growth' },
    { key: 'finance', name: 'Finance Analysis', icon: DollarSign, desc: 'Wealth, Savings & Cashflow' },
    { key: 'marriage', name: 'Marriage Analysis', icon: Heart, desc: 'Partnerships & Spouse Dynamics' },
    { key: 'business', name: 'Business Analysis', icon: TrendingUp, desc: 'Commercial Ventures & Trade' },
    { key: 'business_naming', name: 'Business Naming', icon: Sparkles, desc: 'Auspicious Brand Syllables', isOracle: true, oracleKey: 'business_naming' }
  ];

  const healthThemes = [
    { key: 'health', name: 'General Health', icon: Activity, desc: 'Physical Vitality & Stamina' },
    { key: 'parents_health', name: 'Parents Health', icon: Users, desc: 'Paternal & Maternal Well-being' },
    { key: 'spouse_health', name: 'Spouse Health', icon: Heart, desc: 'Partner Well-being & Longevity' },
    { key: 'children_health', name: 'Children Health', icon: Users, desc: 'Offspring Vitality Indicators' }
  ];

  const oracleTools = [
    { key: 'manglik', name: 'Manglik Dosha', desc: 'Mars Affliction & Marriage Match', icon: ShieldAlert },
    { key: 'kalsarp', name: 'Kalsarp Dosha', desc: 'Rahu-Ketu Nodal Axis Confinement', icon: Sparkles },
    { key: 'pitra', name: 'Pitra Dosha', desc: 'Ancestral Debt & Karmic Obstacles', icon: Sparkles },
    { key: 'sadesati', name: 'Sadesati Analysis', desc: 'Saturn 7.5 Year Transit Cycle', icon: Sparkles },
    { key: 'rahu', name: 'Rahu Dosha', desc: 'North Node Remedies & Material Trials', icon: Sparkles },
    { key: 'ketu', name: 'Ketu Dosha', desc: 'South Node Spiritual Detachment', icon: Sparkles },
    { key: 'loshu', name: 'Lo Shu Grid', desc: 'Chinese Numerology Missing Numbers', icon: Grid },
    { key: 'lalkitab', name: 'Lal Kitab', desc: 'Lal Kitab Kundli & Wonder Remedies', icon: BookOpen }
  ];

  const specialtyRemedies = [
    { key: 'advanced_nakshatra', name: 'Adv. Nakshatra', desc: 'Deity, Pada traits & attributes', icon: Star, type: 'simple', value: 'advanced_nakshatra' },
    { key: 'ishtaDev', name: 'Know Your Ishta Dev', desc: 'Personal protective deity & sacred mantras', icon: Sparkles, type: 'simple', value: 'ishtaDev' },
    { key: 'lalkitab', name: 'Lal Kitab Remedies', desc: 'Custom astrological prescriptions', icon: BookOpen, type: 'simple', value: 'lalkitab' },
    { key: 'dosha', name: 'Advance Dosha & Exception', desc: 'Detailed planetary exceptions & cancellations', icon: Sparkles, type: 'simple', value: 'dosha' },
    { key: 'digbala', name: 'Digbala Compass', desc: 'Directional strengths & architectural alignment', icon: Compass, type: 'simple', value: 'digbala' },
    { key: 'yantra', name: 'Yantra Suggestion', desc: 'Protective geometric sigils & talismans', icon: LayoutGrid, type: 'simple', value: 'yantra' },
    { key: 'ascendant', name: 'Ascendant Analysis', desc: 'Lagna traits, vitality & physical persona', icon: Compass, type: 'simple', value: 'ascendant' },
    { key: 'medical_astrology', name: 'Ayur Jyotish', desc: 'Medical Astrology & constitution (Doshas)', icon: Activity, type: 'simple', value: 'medical_astrology' },
    { key: 'naming', name: 'Auspicious Naming', desc: 'Auspicious syllables based on Nakshatra pada', icon: Sparkles, type: 'simple', value: 'naming' },
    { key: 'sadesati_report', name: 'Sade Sati Status', desc: 'Real-time Saturn transit phase status', icon: Sparkles, type: 'simple', value: 'sadesati_report' },
    { key: 'tithi', name: 'Tithi Pravesha', desc: 'Annual Solar-Lunar return chart analysis', icon: Calendar, type: 'simple', value: 'tithi' }
  ];

  const navCategories = [
    {
      id: 'sec-vargas',
      label: t(uiText.catDivisionalCharts || '1. Divisional Charts'),
      desc: t(uiText.catDivisionalChartsDesc || 'Harmonic natal charts calculated from D1 to D60'),
      count: 16,
      bg: 'bg-indigo-50 hover:bg-indigo-100/80 border-indigo-200 text-indigo-950',
      activeBg: 'bg-indigo-600 text-white border-indigo-700 shadow-md',
      badge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      activeBadge: 'bg-white/20 text-white',
      themeColor: 'indigo',
      type: 'varga',
      items: vargaCharts
    },
    {
      id: 'sec-horoscopes',
      label: t(uiText.catHoroscopeForecasts || '2. Horoscope Forecasts'),
      desc: t(uiText.catHoroscopeForecastsDesc || 'High-precision transit timelines & forecasts'),
      count: 3,
      bg: 'bg-amber-50 hover:bg-amber-100/80 border-amber-200 text-amber-950',
      activeBg: 'bg-amber-500 text-black border-amber-600 shadow-md',
      badge: 'bg-amber-100 text-amber-900 border-amber-300',
      activeBadge: 'bg-black/20 text-black',
      themeColor: 'amber',
      type: 'deep_horoscope',
      items: deepHoroscopes
    },
    {
      id: 'sec-life',
      label: t(uiText.catLifeThemes || '3. Life & Career'),
      desc: t(uiText.catLifeThemesDesc || 'Domain-specific planetary evaluations'),
      count: 6,
      bg: 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200 text-emerald-950',
      activeBg: 'bg-emerald-600 text-white border-emerald-700 shadow-md',
      badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      activeBadge: 'bg-white/20 text-white',
      themeColor: 'emerald',
      type: 'oracle',
      items: lifeThemes
    },
    {
      id: 'sec-health',
      label: t(uiText.catHealthThemes || '4. Health Diagnostics'),
      desc: t(uiText.catHealthThemesDesc || 'Constitutional wellness & lineage health'),
      count: 4,
      bg: 'bg-rose-50 hover:bg-rose-100/80 border-rose-200 text-rose-950',
      activeBg: 'bg-rose-600 text-white border-rose-700 shadow-md',
      badge: 'bg-rose-100 text-rose-900 border-rose-300',
      activeBadge: 'bg-white/20 text-white',
      themeColor: 'rose',
      type: 'oracle',
      items: healthThemes
    },
    {
      id: 'sec-doshas',
      label: t(uiText.catDoshasOracles || '5. Doshas & Oracles'),
      desc: t(uiText.catDoshasOraclesDesc || 'Critical afflictions, nodal axes & karmic debts'),
      count: 8,
      bg: 'bg-purple-50 hover:bg-purple-100/80 border-purple-200 text-purple-950',
      activeBg: 'bg-purple-600 text-white border-purple-700 shadow-md',
      badge: 'bg-purple-100 text-purple-900 border-purple-300',
      activeBadge: 'bg-white/20 text-white',
      themeColor: 'purple',
      type: 'oracle',
      items: oracleTools
    },
    {
      id: 'sec-remedies',
      label: t(uiText.catSpecialtyRemedies || '6. Specialty & Remedies'),
      desc: t(uiText.catSpecialtyRemediesDesc || 'Esoteric calculations, alignments & Vedic solutions'),
      count: 11,
      bg: 'bg-teal-50 hover:bg-teal-100/80 border-teal-200 text-teal-950',
      activeBg: 'bg-teal-600 text-white border-teal-700 shadow-md',
      badge: 'bg-teal-100 text-teal-900 border-teal-300',
      activeBadge: 'bg-white/20 text-white',
      themeColor: 'teal',
      type: 'simple',
      items: specialtyRemedies
    }
  ];

  if (!birthData) {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col justify-between">
        <Navigation />
        <div className="flex-grow flex items-center justify-center p-6 pt-28">
          <div className="max-w-md w-full bg-white rounded-2xl border border-neutral-300 shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-black mb-3 font-serif">No Birth Details Found</h2>
            <p className="text-neutral-700 text-sm mb-6 leading-relaxed">
              Please enter your birth parameters first to generate your specialized charts and planetary hub.
            </p>
            <button
              onClick={() => navigate('/kundali')}
              className="w-full px-6 py-3 bg-black hover:bg-neutral-800 text-white rounded-xl font-medium transition duration-200 shadow-sm"
            >
              Go to Kundali Form
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col justify-between selection:bg-neutral-900 selection:text-white">
      <div>
        <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-16">

          {/* MAIN 3-COLUMN LAYOUT: Left Navigator + Center Modules + Right Promotion Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* 1. Slim Sticky Left Command Directory Sidebar (lg:col-span-3) */}
            <aside className="lg:col-span-3 border border-neutral-300 rounded-2xl p-4 bg-neutral-50 lg:sticky lg:top-2 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[18px] font-bold uppercase tracking-wider text-amber-900">{uiText.brandTitle || 'Astroo Consult'}</span>
              </div>

              <nav className="space-y-2">
                {/* User Kundali Button with User's Name (Above Divisional Charts) */}
                <button
                  onClick={() => setShowUserModal(true)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-50 hover:from-amber-200 hover:to-orange-100 text-amber-950 text-left transition-all duration-150 shadow-sm group"
                  title="Click to view full birth details"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 bg-amber-500 text-white rounded-lg group-hover:scale-105 transition flex-shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 leading-none">
                        {uiText.userKundali || 'User Kundali'}
                      </div>
                      <div className="text-sm font-extrabold text-black truncate mt-0.5 font-serif">
                        {birthData.name || 'User'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 border border-amber-400 px-2 py-0.5 rounded-full flex-shrink-0">
                    {uiText.viewInfo || 'View Info'}
                  </span>
                </button>

                {navCategories.map((cat) => {
                  const isActive = activeNav === cat.id;
                  const isHoroscope = cat.id === 'sec-horoscopes';

                  return (
                    <React.Fragment key={cat.id}>
                      <button
                        onClick={() => setSelectedCategoryModal(cat)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left transition-all duration-150 cursor-pointer ${isActive ? cat.activeBg : cat.bg
                          }`}
                        title={`Click to open ${cat.label} popup`}
                      >
                        <span className="text-[16px] font-bold tracking-tight truncate pr-2">
                          {cat.label}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0 border ${isActive ? cat.activeBadge : cat.badge
                            }`}
                        >
                          {cat.count}
                        </span>
                      </button>

                      {/* 🌟 Dasha Section below Horoscope Forecasts (Click to toggle flex box) */}
                      {isHoroscope && (
                        <div className="space-y-1.5">
                          <button
                            type="button"
                            onClick={() => setIsDashaExpanded(!isDashaExpanded)}
                            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-purple-300 bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-100/80 hover:from-purple-100 hover:to-indigo-100 text-purple-950 text-left transition-all duration-150 cursor-pointer shadow-xs group"
                            title="Click to toggle Dasha options"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Clock className="w-4 h-4 text-purple-700 flex-shrink-0" />
                              <span className="text-[16px] font-bold tracking-tight truncate">
                                {t('Dasha') || 'Dasha'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold border bg-purple-100 text-purple-900 border-purple-300">
                                4
                              </span>
                              <ChevronDown className={`w-4 h-4 text-purple-800 transition-transform duration-200 ${isDashaExpanded ? 'rotate-180' : ''}`} />
                            </div>
                          </button>

                          {/* Expandable Flex Box */}
                          {isDashaExpanded && (
                            <div className="flex flex-col gap-1.5 p-2 bg-purple-50/70 border border-purple-200 rounded-xl animate-in fade-in slide-in-from-top-1 duration-200 shadow-2xs">
                              {/* Option 1: विंशोत्तरी पंचस्तरीय · Dasha Table */}
                              <button
                                type="button"
                                onClick={() => setShowVimshottariModal(true)}
                                className="w-full flex items-center justify-between px-3 py-2 bg-white hover:bg-purple-600 hover:text-white text-purple-950 rounded-lg border border-purple-300 text-left transition-all duration-150 cursor-pointer shadow-2xs group"
                                title="Click to view विंशोत्तरी पंचस्तरीय · Dasha Table"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="w-2 h-2 rounded-full bg-purple-500 group-hover:bg-white flex-shrink-0"></span>
                                  <span className="text-[14px] font-bold truncate">
                                    विंशोत्तरी पंचस्तरीय · Dasha Table
                                  </span>
                                </div>
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200 group-hover:bg-white/20 group-hover:text-white transition-colors flex-shrink-0">
                                  Open ↗
                                </span>
                              </button>

                              {/* Option 2: Dasha Timeline */}
                              <button
                                type="button"
                                onClick={() => setShowDasaTimelineModal(true)}
                                className="w-full flex items-center justify-between px-3 py-2 bg-white hover:bg-emerald-600 hover:text-white text-emerald-950 rounded-lg border border-emerald-300 text-left transition-all duration-150 cursor-pointer shadow-2xs group"
                                title="Click to view Dasha Timeline"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 group-hover:bg-white flex-shrink-0"></span>
                                  <span className="text-[14px] font-bold truncate">
                                    Dasha Timeline (दशा टाइमलाइन)
                                  </span>
                                </div>
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200 group-hover:bg-white/20 group-hover:text-white transition-colors flex-shrink-0">
                                  Open ↗
                                </span>
                              </button>

                              {/* Option 3: Yogini Dasha */}
                              <button
                                type="button"
                                onClick={() => setShowYoginiModal(true)}
                                className="w-full flex items-center justify-between px-3 py-2 bg-white hover:bg-rose-600 hover:text-white text-rose-950 rounded-lg border border-rose-300 text-left transition-all duration-150 cursor-pointer shadow-2xs group"
                                title="Click to view योगिनी दशा (Yogini Dasha)"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="w-2 h-2 rounded-full bg-rose-500 group-hover:bg-white flex-shrink-0"></span>
                                  <span className="text-[14px] font-bold truncate">
                                    योगिनी दशा · Yogini Dasha
                                  </span>
                                </div>
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-200 group-hover:bg-white/20 group-hover:text-white transition-colors flex-shrink-0">
                                  Open ↗
                                </span>
                              </button>

                              {/* Option 4: Chara Dasha */}
                              <button
                                type="button"
                                onClick={() => setShowCharaModal(true)}
                                className="w-full flex items-center justify-between px-3 py-2 bg-white hover:bg-amber-600 hover:text-white text-amber-950 rounded-lg border border-amber-300 text-left transition-all duration-150 cursor-pointer shadow-2xs group"
                                title="Click to view चर दशा (Jaimini Chara Dasha)"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="w-2 h-2 rounded-full bg-amber-500 group-hover:bg-white flex-shrink-0"></span>
                                  <span className="text-[14px] font-bold truncate">
                                    चर दशा · Chara Dasha
                                  </span>
                                </div>
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 group-hover:bg-white/20 group-hover:text-white transition-colors flex-shrink-0">
                                  Open ↗
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}

                {/* 7. Numerology Button */}
                <button
                  type="button"
                  onClick={() => navigate('/numerology')}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-cyan-200 bg-gradient-to-r from-teal-50 via-cyan-50 to-teal-100/70 hover:from-teal-100 hover:to-cyan-100 text-teal-950 text-left transition-all duration-150 cursor-pointer shadow-xs group"
                  title="Click to open Numerology Calculator & Analysis"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[16px] font-bold tracking-tight truncate">
                      {t('7. Numerology') || '7. Numerology'}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0 border bg-teal-100 text-teal-900 border-teal-300 group-hover:bg-teal-200 transition-colors">
                    {t('Open ↗') || 'Open ↗'}
                  </span>
                </button>

                {/* 8. Tarot Card Reading Button */}
                <button
                  type="button"
                  onClick={() => navigate('/tarot-reading')}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 via-fuchsia-50 to-purple-100/70 hover:from-purple-100 hover:to-fuchsia-100 text-purple-950 text-left transition-all duration-150 cursor-pointer shadow-xs group"
                  title="Click to open Tarot Card Reading"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[16px] font-bold tracking-tight truncate">
                      {t('8. Tarot Card Reading') || '8. Tarot Card Reading'}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0 border bg-purple-100 text-purple-900 border-purple-300 group-hover:bg-purple-200 transition-colors">
                    {t('Open ↗') || 'Open ↗'}
                  </span>
                </button>

                {/* 9. Palmistry Button */}
                <button
                  type="button"
                  onClick={() => navigate('/palmistry')}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 via-pink-50 to-fuchsia-100/70 hover:from-rose-100 hover:to-pink-100 text-rose-950 text-left transition-all duration-150 cursor-pointer shadow-xs group"
                  title="Click to open Palmistry Reading & Analysis"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[16px] font-bold tracking-tight truncate">
                      {t('9. Palmistry') || '9. Palmistry'}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0 border bg-rose-100 text-rose-900 border-rose-300 group-hover:bg-rose-200 transition-colors">
                    {t('Open ↗') || 'Open ↗'}
                  </span>
                </button>

                {/* 10. Face Reading Button */}
                <a
                  href={`${VEDIC_ASTROLOGY_BASE_URL}/?face_reading=true&hide_search=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-pink-200 bg-gradient-to-r from-pink-50 via-rose-50 to-orange-100/70 hover:from-pink-100 hover:to-rose-100 text-pink-950 text-left transition-all duration-150 cursor-pointer shadow-xs group"
                  title="Click to open Face Reading in Vedic Astrology Dashboard"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[16px] font-bold tracking-tight truncate">
                      {t('10. Face Reading') || '10. Face Reading'}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0 border bg-pink-100 text-pink-900 border-pink-300 group-hover:bg-pink-200 transition-colors">
                    {t('Open ↗') || 'Open ↗'}
                  </span>
                </a>

                {/* 11. KP Astrology Button */}
                <a
                  href={`${VEDIC_ASTROLOGY_BASE_URL}/?kp_astrology=true&hide_search=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-100/70 hover:from-blue-100 hover:to-indigo-100 text-blue-950 text-left transition-all duration-150 cursor-pointer shadow-xs group"
                  title="Click to open KP Astrology in Vedic Astrology Dashboard"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[16px] font-bold tracking-tight truncate">
                      {t('11. KP Astrology') || '11. KP Astrology'}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0 border bg-blue-100 text-blue-900 border-blue-300 group-hover:bg-blue-200 transition-colors">
                    {t('Open ↗') || 'Open ↗'}
                  </span>
                </a>

                {/* 12. Ask Prashna Button */}
                <a
                  href={`${VEDIC_ASTROLOGY_BASE_URL}/?prashna=true&hide_search=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-100/70 hover:from-violet-100 hover:to-purple-100 text-violet-950 text-left transition-all duration-150 cursor-pointer shadow-xs group"
                  title="Click to open Ask Prashna in Vedic Astrology Dashboard"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[16px] font-bold tracking-tight truncate">
                      {t('12. Ask Prashna') || '12. Ask Prashna'}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0 border bg-violet-100 text-violet-900 border-violet-300 group-hover:bg-violet-200 transition-colors">
                    {t('Open ↗') || 'Open ↗'}
                  </span>
                </a>

                {/* 13. Ashtamangala Prasna Button */}
                <a
                  href={`${VEDIC_ASTROLOGY_BASE_URL}/?ashtamangala=true&hide_search=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-red-100/70 hover:from-amber-100 hover:to-orange-100 text-amber-950 text-left transition-all duration-150 cursor-pointer shadow-xs group"
                  title="Click to open Ashtamangala Prasna in Vedic Astrology Dashboard"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[16px] font-bold tracking-tight truncate">
                      {t('13. Ashtamangala Prasna') || '13. Ashtamangala Prasna'}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0 border bg-amber-100 text-amber-900 border-amber-300 group-hover:bg-amber-200 transition-colors">
                    {t('Open ↗') || 'Open ↗'}
                  </span>
                </a>

                {/* 14. Garg Shutra Button */}
                <a
                  href={`${VEDIC_ASTROLOGY_BASE_URL}/?garga=true&hide_search=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-100/70 hover:from-indigo-100 hover:to-purple-100 text-indigo-950 text-left transition-all duration-150 cursor-pointer shadow-xs group"
                  title="Click to open Garg Shutra in Vedic Astrology Dashboard"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[16px] font-bold tracking-tight truncate">
                      {t('14. Garg Shutra') || '14. Garg Shutra'}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0 border bg-indigo-100 text-indigo-900 border-indigo-300 group-hover:bg-indigo-200 transition-colors">
                    {t('Open ↗') || 'Open ↗'}
                  </span>
                </a>

              </nav>

              <div className="pt-2.5 border-t border-neutral-200 space-y-2">
                <button
                  onClick={() => handleRedirect('html_report')}
                  className="w-full py-2 px-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{uiText.webKundaliReport}</span>
                </button>

                <button
                  onClick={handleDownload100PageReport}
                  disabled={isGenerating100Page}
                  className="w-full py-2 px-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm border border-amber-400/50 disabled:opacity-60 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 flex-shrink-0 text-yellow-200" />
                  <span className="truncate">{isGenerating100Page ? uiText.generating100PageBtn : uiText.hundredPageKundaliPdf}</span>
                </button>

                <button
                  onClick={scrollToBottom}
                  className="w-full py-1.5 px-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 border border-neutral-300 shadow-xs cursor-pointer"
                  title="Quickly jump to the bottom of the page"
                >
                  <ArrowDown className="h-3.5 w-3.5 text-neutral-600" />
                  <span>{uiText.scrollToBottom}</span>
                </button>
              </div>
            </aside>


            {/* 2. Middle Content Column: Modules & Top Banners (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-5">

              {/* 🌟 Top Language Buttons Toolbar (In One Row) + User Wallet Badge */}
              <div className="bg-amber-400 p-2 sm:p-2.5 rounded-2xl border border-amber-500 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                {/* Language Buttons in Single Flowing Row */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  <div className="flex items-center gap-1 text-amber-950 font-extrabold text-[11px] uppercase tracking-wider mr-1 flex-shrink-0">
                    <Languages className="h-4 w-4" />
                    <span className="hidden md:inline">Lang:</span>
                  </div>
                  {SUPPORTED_LANGUAGES.map((lang) => {
                    const isSelected = currentLang === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleLanguageChange(lang.code)}
                        disabled={isTranslating}
                        title={`${lang.native} (${lang.name})`}
                        className={`min-w-[34px] h-[34px] px-2 flex items-center justify-center rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer shadow-xs flex-shrink-0 ${isSelected
                          ? 'bg-black text-white shadow-md scale-105 ring-2 ring-black/40'
                          : 'bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-200/80 hover:border-neutral-400 active:scale-95'
                          }`}
                      >
                        {lang.shortCode || lang.code.toUpperCase()}
                      </button>
                    );
                  })}
                  {isTranslating && (
                    <span className="text-[10px] font-extrabold text-amber-900 animate-pulse bg-white/80 px-2 py-1 rounded-md flex-shrink-0 ml-1">
                      Translating... ⏳
                    </span>
                  )}
                </div>

                {/* User Wallet Balance Badge */}
                <div
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center justify-between sm:justify-start gap-2 bg-white hover:bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-500/50 shadow-xs cursor-pointer transition flex-shrink-0 group"
                  title="Click to view Wallet & Recharge"
                >
                  <div className="p-1 bg-amber-100 text-amber-900 rounded-lg group-hover:scale-105 transition">
                    <Wallet className="h-4 w-4 text-amber-800" />
                  </div>
                  <div className="text-left">
                    <div className="text-[9px] uppercase tracking-wider text-neutral-500 font-bold leading-none">
                      Wallet
                    </div>
                    <div className="text-xs font-extrabold text-black mt-0.5">
                      ₹{Number(walletBalance || 0).toFixed(2)}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100/70 hover:bg-amber-200 px-1.5 py-0.5 rounded transition ml-1">
                    + Add
                  </span>
                </div>
              </div>

              {/* 🌟 Live Astrologers Display (Ultra-Compact Narrow Single-Row Flex Format) */}
              <div className="bg-white/95 rounded-xl border border-slate-200/90 py-1.5 px-3 shadow-2xs">
                <div className="flex items-center justify-between mb-1 px-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <h3 className="text-xs sm:text-sm font-serif font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                      <span>{t('Live Astrologers') || 'Live Astrologers'}</span>
                      <span className="text-[16px] font-sans font-semibold text-red-900">
                        ({t('Connect with Expert Astrologers') || 'Connect with Expert Astrologers'})
                      </span>
                    </h3>
                  </div>
                  <Link
                    to="/live-astrologers"
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-0.5 transition"
                  >
                    <span>{t('View All') || 'View All'}</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>

                {/* Ultra-Compact Horizontal Flex Row displaying 9 Astrologers */}
                <div
                  className="flex items-center justify-between gap-1.5 sm:gap-2.5 overflow-x-auto scrollbar-hide py-0.5 px-0.5"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {visibleNineAstrologers.map((astrologer, idx) => {
                    const displayName = cleanAstrologerName(astrologer.name);
                    const rate = astrologer.pricing || 16;
                    const rawImage = astrologer.profilePicture || astrologer.image || astrologer.imageUrl || astrologer.photo;
                    const imageSrc = rawImage ? buildAssetUrl(rawImage) : null;

                    return (
                      <button
                        type="button"
                        key={`${astrologer._id || idx}-${liveAstroStartIndex}`}
                        onClick={() => setSelectedAstroModal(astrologer)}
                        className="group shrink-0 flex flex-col items-center text-center hover:-translate-y-0.5 transition-transform duration-150 cursor-pointer focus:outline-none"
                        style={{ width: '74px' }}
                      >
                        {/* Astrologer Circular Avatar (Compact ~44px-48px) */}
                        <div className="relative mb-0.5">
                          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-amber-400 group-hover:border-amber-500 shadow-2xs bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center ring-1 ring-amber-100 group-hover:ring-amber-300 transition-all">
                            {imageSrc ? (
                              <img
                                src={imageSrc}
                                alt={displayName}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                onError={(e) => {
                                  e.target.src = '/images/AstroIcon.jpg';
                                }}
                              />
                            ) : (
                              <span className="text-xs font-bold text-amber-900">
                                {displayName.charAt(0) || 'A'}
                              </span>
                            )}
                          </div>
                          {/* Compact Green availability dot */}
                          <span
                            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white shadow-2xs ${astrologer.isAvailable !== false ? 'bg-emerald-500' : 'bg-red-500'
                              }`}
                            title={astrologer.isAvailable !== false ? 'Available' : 'Unavailable'}
                          ></span>
                        </div>

                        {/* Astrologer Name */}
                        <h4 className="font-semibold text-[12px] text-black group-hover:text-amber-600 transition-colors truncate w-full leading-tight">
                          {displayName}
                        </h4>

                        {/* Rate */}
                        <p className="text-[9.5px] font-bold text-emerald-900 group-hover:text-amber-700 leading-tight">
                          ₹{rate}/min
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 🌟 Quick Chart Actions: Lagna Chart, Free Kundali Analysis, Dhan Yog Report & Vimshottari Dasha Side-by-Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* 1. Lagna Chart (D1) Action Card */}
                <div className="p-4 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/60 shadow-sm flex flex-col justify-between group">
                  <div className="flex items-start gap-3 mb-3">

                    <div>
                      <h3 className="text-[22px] font-bold font-serif text-black leading-tight">
                        {uiText.lagnaChartTitle}
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRedirect('varga', 'd1')}
                    className="w-full py-2.5 px-4 bg-white hover:bg-amber-500 text-black rounded-xl font-medium text-[14px] shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >

                    <span>{t('Click Here ↗') || 'Click Here ↗'}</span>
                  </button>
                </div>

                {/* 2. Free Kundali Analysis Action Card */}
                <div className="p-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/60 shadow-sm flex flex-col justify-between group">
                  <div className="flex items-start gap-3 mb-3">

                    <div>

                      <h3 className="text-[22px] font-bold font-serif text-black leading-tight">
                        {uiText.freeKundaliTitle}
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={handleDownload40PageReport}
                    disabled={isGenerating40Page}
                    className="w-full py-2.5 px-4 bg-white hover:bg-emerald-600 hover:text-white text-black rounded-xl font-medium text-[14px] shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >

                    <span>
                      {isGenerating40Page
                        ? (uiText.generating40PageKundaliBtn || 'Synthesizing 40-Page Report...')
                        : (t('Click Here ↗') || 'Click Here ↗')}
                    </span>
                  </button>
                </div>

                {/* 3. Dhan Yog Report Action Card */}
                <div className="p-4 rounded-2xl border border-amber-300 bg-gradient-to-br from-amber-50/80 via-yellow-50/50 to-orange-50/60 shadow-sm flex flex-col justify-between group">
                  <div className="flex items-start gap-3 mb-3">

                    <div>

                      <h3 className="text-[22px] font-bold font-serif text-black leading-tight">
                        {uiText.dhanYogTitle}
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadDhanYogReport}
                    disabled={isGeneratingDhanYog}
                    className="w-full py-2.5 px-4 bg-white hover:bg-amber-500 text-black rounded-xl font-medium text-[14px] shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >

                    <span>{isGeneratingDhanYog ? uiText.generatingDhanYogBtn : (t('Click Here ↗') || 'Click Here ↗')}</span>
                  </button>
                </div>

                {/* 4. Yearly Horoscope Action Card */}
                <div className="p-4 rounded-2xl border border-sky-300 bg-gradient-to-br from-sky-50/80 via-white to-blue-50/60 shadow-sm flex flex-col justify-between group">
                  <div className="flex items-start gap-3 mb-3">
                    <div>
                      <h3 className="text-[22px] font-bold font-serif text-black leading-tight">
                        {t('Yearly Horoscope')}
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRedirect('deep_horoscope', 'yearly')}
                    className="w-full py-2.5 px-4 bg-white hover:bg-sky-600 hover:text-white text-black rounded-xl font-medium text-[14px] shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >

                    <span>{t('Click Here ↗') || 'Click Here ↗'}</span>
                  </button>
                </div>
              </div>

              {/* 🌟 Love, Relationship & Compatibility: Love Calculator, Kundali Matching, Relationship Horoscope & Chat Now (4-column grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* 1. Love Calculator Action Card */}
                <div className="p-4 rounded-2xl border border-rose-300 bg-gradient-to-br from-rose-50/80 via-white to-red-50/60 shadow-sm flex flex-col justify-between group">
                  <div className="flex items-start gap-3 mb-3">

                    <div>
                      <div className="inline-block px-1.5 py-0.2 bg-rose-100 text-rose-900 border border-rose-300 rounded text-[9px] font-bold uppercase tracking-wider mb-0.5">
                        {t('Compatibility & Love') || 'Compatibility & Love'}
                      </div>
                      <h3 className="text-[22px] font-bold font-serif text-black leading-tight">
                        {t('Love Calculator') || 'Love Calculator'}
                      </h3>
                    </div>
                  </div>

                  <a
                    href={`${VEDIC_ASTROLOGY_BASE_URL}/?compatibility-hub=true&hide_search=true`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 bg-white hover:bg-amber-500 text-black rounded-xl font-medium text-[14px] shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >

                    <span>{t('Click Here ↗') || 'Click Here ↗'}</span>
                  </a>
                </div>

                {/* 2. Kundali Matching Action Card */}
                <div className="p-4 rounded-2xl border border-pink-300 bg-gradient-to-br from-pink-50/80 via-white to-rose-50/60 shadow-sm flex flex-col justify-between group">
                  <div className="flex items-start gap-3 mb-3">

                    <div>
                      <div className="inline-block px-1.5 py-0.2 bg-pink-100 text-pink-900 border border-pink-300 rounded text-[9px] font-bold uppercase tracking-wider mb-0.5">
                        {t('Gun Milan & Compatibility') || 'Gun Milan & Compatibility'}
                      </div>
                      <h3 className="text-[22px] font-bold font-serif text-black leading-tight">
                        {t('Kundali Matching') || 'Kundali Matching'}
                      </h3>
                    </div>
                  </div>

                  <a
                    href={`${VEDIC_ASTROLOGY_BASE_URL}/?matchmaking=true&hide_search=true`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 bg-white hover:bg-amber-500 text-black rounded-xl font-medium text-[14px] shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >

                    <span>{t('Click Here ↗') || 'Click Here ↗'}</span>
                  </a>
                </div>

                {/* 3. Relationship Horoscope Action Card */}
                <div className="p-4 rounded-2xl border border-fuchsia-300 bg-gradient-to-br from-fuchsia-50/80 via-white to-pink-50/60 shadow-sm flex flex-col justify-between group">
                  <div className="flex items-start gap-3 mb-3">

                    <div>
                      <div className="inline-block px-1.5 py-0.2 bg-fuchsia-100 text-fuchsia-900 border border-fuchsia-300 rounded text-[9px] font-bold uppercase tracking-wider mb-0.5">
                        {t('Transit & Synergy') || 'Transit & Synergy'}
                      </div>
                      <h3 className="text-[22px] font-bold font-serif text-black leading-tight">
                        {t('Relationship Horoscope') || 'Relationship Horoscope'}
                      </h3>
                    </div>
                  </div>

                  <a
                    href={`${VEDIC_ASTROLOGY_BASE_URL}/?compatibility-hub=true&calculator=weekly-relationship&hide_search=true`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 bg-white hover:from-fuchsia-600 hover:to-pink-700 text-black font-medium text-[14px] rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >

                    <span>{t('Click Here ↗') || 'Click Here ↗'}</span>
                  </a>
                </div>

                {/* 4. Chat Now Action Card */}
                <div className="p-4 rounded-2xl border border-purple-300 bg-gradient-to-br from-purple-50/80 via-white to-indigo-50/60 shadow-sm flex flex-col justify-between group">
                  <div className="flex items-start gap-3 mb-3">

                    <div>
                      <div className="inline-block px-1.5 py-0.2 bg-purple-100 text-purple-900 border border-purple-300 rounded text-[9px] font-bold uppercase tracking-wider mb-0.5">
                        {t('Live Consultation') || 'Live Consultation'}
                      </div>
                      <h3 className="text-[22px] font-bold font-serif text-black leading-tight">
                        {t('Chat Now') || 'Chat Now'}
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/live-chat')}
                    className="w-full py-2.5 px-4 bg-white hover:bg-purple-600 hover:text-white text-black font-medium text-[14px] rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >

                    <span>{t('Click Here ↗') || 'Click Here ↗'}</span>
                  </button>
                </div>
              </div>

              {/* 🌟 Wealth, Relationships, Upay & Business: Finance Analysis, Marriage Analysis, Remedies Report & Business Naming Side-by-Side (4-column grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* 1. Finance Analysis Action Card */}
                <div className="p-4 rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-50/80 via-white to-green-50/60 shadow-sm flex flex-col justify-between group">
                  <div className="flex items-start gap-3 mb-3">

                    <div>

                      <h3 className="text-[22px] font-bold font-serif text-black leading-tight">
                        {uiText.financeTitle}
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRedirect('simple', 'finance')}
                    className="w-full py-2.5 px-4 bg-white hover:from-fuchsia-600 hover:to-pink-700 text-black font-medium text-[14px] rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >

                    <span>{t('Click Here ↗') || 'Click Here ↗'}</span>
                  </button>
                </div>

                {/* 2. Marriage Analysis Action Card */}
                <div className="p-4 rounded-2xl border border-rose-300 bg-gradient-to-br from-rose-50/80 via-white to-pink-50/60 shadow-sm flex flex-col justify-between group">
                  <div className="flex items-start gap-3 mb-3">

                    <div>

                      <h3 className="text-[22px] font-bold font-serif text-black leading-tight">
                        {uiText.marriageTitle}
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRedirect('simple', 'marriage')}
                    className="w-full py-2.5 px-4 bg-white hover:bg-rose-700 text-blacks font-bold text-[14px] rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >

                    <span>{t('Click Here ↗') || 'Click Here ↗'}</span>
                  </button>
                </div>

                {/* 3. Remedies Report Action Card (Adjacent to Marriage Analysis) */}
                <div className="p-4 rounded-2xl border border-teal-300 bg-gradient-to-br from-teal-50/80 via-emerald-50/50 to-cyan-50/60 shadow-sm flex flex-col justify-between group">
                  <div className="flex items-start gap-3 mb-3">

                    <div>

                      <h3 className="text-[22px] font-bold font-serif text-black leading-tight">
                        {uiText.remediesTitle}
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadRemediesReport}
                    disabled={isGeneratingRemedies}
                    className="w-full py-2.5 px-4 bg-white hover:bg-teal-700 text-black font-bold text-[14px] rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >

                    <span>{isGeneratingRemedies ? uiText.generatingRemediesBtn : (t('Click Here ↗') || 'Click Here ↗')}</span>
                  </button>
                </div>

                {/* 4. Business Naming Action Card (Adjacent to Remedies Report) */}
                <div className="p-4 rounded-2xl border border-cyan-300 bg-gradient-to-br from-cyan-50/80 via-white to-sky-50/60 shadow-sm flex flex-col justify-between group">
                  <div className="flex items-start gap-3 mb-3">

                    <div>

                      <h3 className="text-[22px] font-bold font-serif text-black leading-tight">
                        {t('Business Naming')}
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRedirect('oracle', 'business_naming')}
                    className="w-full py-2.5 px-4 bg-white hover:bg-cyan-600 hover:text-white text-black font-medium text-[14px] rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >

                    <span>{t('Click Here ↗') || 'Click Here ↗'}</span>
                  </button>
                </div>
              </div>

              {/* 🌟 Vitality, Saturn Transit, Nadi & Pitra Dosha: Ascendant Analysis, Sadesati Report, Nadi Astrology & Pitra Dosha (4-column grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* 1. Ascendant Analysis Action Card */}
                <div className="p-4 rounded-2xl border border-sky-300 bg-gradient-to-br from-sky-50/80 via-white to-cyan-50/60 shadow-sm flex flex-col justify-between group">
                  <div className="flex items-start gap-3 mb-3">

                    <div>

                      <h3 className="text-[22px] font-bold font-serif text-black leading-tight">
                        {uiText.ascendantTitle}
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRedirect('simple', 'ascendant')}
                    className="w-full py-2.5 px-4 bg-white hover:bg-sky-700 text-black font-medium text-[14px] rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >

                    <span>{t('Click Here ↗') || 'Click Here ↗'}</span>
                  </button>
                </div>

                {/* 2. Sadesati Report Action Card */}
                <div className="p-4 rounded-2xl border border-purple-300 bg-gradient-to-br from-purple-50/80 via-indigo-50/50 to-violet-50/60 shadow-sm flex flex-col justify-between group">
                  <div className="flex items-start gap-3 mb-3">

                    <div>

                      <h3 className="text-[22px] font-bold font-serif text-black leading-tight">
                        {uiText.sadesatiTitle}
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRedirect('oracle', 'sadesati')}
                    className="w-full py-2.5 px-4 bg-white hover:bg-purple-700 text-black font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >

                    <span>{t('Click Here ↗') || 'Click Here ↗'}</span>
                  </button>
                </div>

                {/* 3. Nadi Astrology Action Card (Adjacent to Sadesati Report) */}
                <div className="p-4 rounded-2xl border border-amber-300 bg-gradient-to-br from-amber-50/80 via-yellow-50/50 to-orange-50/60 shadow-sm flex flex-col justify-between group">
                  <div className="flex items-start gap-3 mb-3">

                    <div>

                      <h3 className="text-[22px] font-bold font-serif text-black leading-tight">
                        {t('Nadi Astrology') || 'Nadi Astrology'}
                      </h3>
                    </div>
                  </div>

                  <a
                    href={`${VEDIC_ASTROLOGY_BASE_URL}/?nadi=true&hide_search=true`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 bg-white hover:bg-amber-600 hover:to-orange-600 text-black font-bold text-[14px] rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >

                    <span>{t('Click Here ↗') || 'Click Here ↗'}</span>
                  </a>
                </div>

                {/* 4. Pitra Dosha Action Card (Adjacent to Nadi Astrology) */}
                <div className="p-4 rounded-2xl border border-orange-300 bg-gradient-to-br from-orange-50/80 via-white to-amber-50/60 shadow-sm flex flex-col justify-between group">
                  <div className="flex items-start gap-3 mb-3">

                    <div>

                      <h3 className="text-[22px] font-bold font-serif text-black leading-tight">
                        {t('Pitra Dosha')}
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRedirect('oracle', 'pitra')}
                    className="w-full py-2.5 px-4 bg-white hover:bg-orange-600 hover:text-white text-black font-medium text-[14px] rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >

                    <span>{t('Click Here ↗') || 'Click Here ↗'}</span>
                  </button>
                </div>
              </div>

              {/* 🌟 100-Page Detailed Kundali Action Banner (Using report.png) */}
              <div className="relative group overflow-hidden rounded-2xl border-2 border-amber-400 shadow-xl min-h-[140px] sm:min-h-[160px] flex items-center bg-neutral-950">
                <img
                  src="/images/report.png"
                  alt="Complete 100-Page Mahakundali Report"
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
                {/* Gradient Overlay for high text contrast */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30 sm:to-transparent" />

                <div className="relative z-10 w-full p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="max-w-xl">
                  </div>

                  <button
                    onClick={handleDownload100PageReport}
                    disabled={isGenerating100Page}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-amber-500/25 transition-all duration-200 flex items-center gap-2 flex-shrink-0 cursor-pointer disabled:opacity-60 border border-amber-300 group-hover:scale-105"
                  >
                    <FileText className="h-4 w-4 text-black" />
                    <span>{isGenerating100Page ? uiText.generating100PageBtn : uiText.hundredPageBtn}</span>
                  </button>
                </div>
              </div>

              {/* 🌟 Narrow Adv. Nakshatra Action Bar (From Specialty & Remedies) */}
              <div className="py-2.5 px-4 rounded-xl border border-teal-300 bg-gradient-to-r from-teal-50 via-emerald-50/60 to-cyan-50/70 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Star className="h-4 w-4 text-yellow-200" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-1.5 py-0.2 bg-teal-100 text-teal-900 border border-teal-300 rounded text-[9px] font-bold uppercase tracking-wider">
                        {uiText.advNakshatraTag}
                      </span>
                      <h4 className="text-sm font-bold font-serif text-black truncate leading-tight">
                        {uiText.advNakshatraTitle}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-700 truncate mt-0.5">
                      {uiText.advNakshatraDesc}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleRedirect('simple', 'advanced_nakshatra')}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer whitespace-nowrap"
                >
                  <Star className="h-3.5 w-3.5 text-yellow-200" />
                  <span>{uiText.advNakshatraBtn}</span>
                </button>
              </div>

              {/* 🌟 Narrow Study Analysis Action Bar (From Life & Career) */}
              <div className="py-2.5 px-4 rounded-xl border border-blue-300 bg-gradient-to-r from-blue-50 via-sky-50/60 to-indigo-50/70 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-1.5 py-0.2 bg-blue-100 text-blue-900 border border-blue-300 rounded text-[9px] font-bold uppercase tracking-wider">
                        {uiText.studyAnalysisTag}
                      </span>
                      <h4 className="text-sm font-bold font-serif text-black truncate leading-tight">
                        {uiText.studyAnalysisTitle}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-700 truncate mt-0.5">
                      {uiText.studyAnalysisDesc}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleRedirect('oracle', 'study')}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer whitespace-nowrap"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{uiText.studyAnalysisBtn}</span>
                </button>
              </div>

              {/* 🌟 Narrow Business Naming Action Bar (From Life & Career) */}
              <div className="py-2.5 px-4 rounded-xl border border-cyan-300 bg-gradient-to-r from-cyan-50 via-teal-50/60 to-sky-50/70 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-1.5 py-0.2 bg-cyan-100 text-cyan-900 border border-cyan-300 rounded text-[9px] font-bold uppercase tracking-wider">
                        {t('Life & Career')}
                      </span>
                      <h4 className="text-sm font-bold font-serif text-black truncate leading-tight">
                        {t('Business Naming (व्यवसाय नामकरण)')}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-700 truncate mt-0.5">
                      {t('Numerological & Nakshatra-aligned auspicious brand syllables for commercial ventures & enterprise success')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleRedirect('oracle', 'business_naming')}
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{t('Business Naming ↗')}</span>
                </button>
              </div>

              {/* 🌟 Narrow Know Your Ishta Dev Action Bar (From Specialty & Remedies) */}
              <div className="py-2.5 px-4 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50/60 to-yellow-50/70 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Sparkles className="h-4 w-4 text-yellow-200" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-1.5 py-0.2 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[9px] font-bold uppercase tracking-wider">
                        {t('Specialty & Remedies')}
                      </span>
                      <h4 className="text-sm font-bold font-serif text-black truncate leading-tight">
                        {t('Know Your Ishta Dev (इष्ट देवता)')}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-700 truncate mt-0.5">
                      {t('Protective lineage deity calculation, 12th from Karakamsa, auspicious mantras & spiritual guide')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleRedirect('simple', 'ishtaDev')}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="h-3.5 w-3.5 text-yellow-200" />
                  <span>{t('Know Ishta Dev ↗')}</span>
                </button>
              </div>

              {/* 🌟 Narrow Yantra Suggestion Action Bar (From Specialty & Remedies) */}
              <div className="py-2.5 px-4 rounded-xl border border-indigo-300 bg-gradient-to-r from-indigo-50 via-blue-50/60 to-violet-50/70 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <LayoutGrid className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-1.5 py-0.2 bg-indigo-100 text-indigo-900 border border-indigo-300 rounded text-[9px] font-bold uppercase tracking-wider">
                        {t('Specialty & Remedies')}
                      </span>
                      <h4 className="text-sm font-bold font-serif text-black truncate leading-tight">
                        {t('Yantra Suggestion (यंत्र सुझाव)')}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-700 truncate mt-0.5">
                      {t('Personalized sacred sacred geometric talismans, consecration rituals & protective cosmic sigils')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleRedirect('simple', 'yantra')}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer whitespace-nowrap"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span>{t('Yantra Suggestion ↗')}</span>
                </button>
              </div>

              {/* 🌟 Narrow Ayur Jyotish Action Bar (From Specialty & Remedies) */}
              <div className="py-2.5 px-4 rounded-xl border border-rose-300 bg-gradient-to-r from-rose-50 via-pink-50/60 to-red-50/70 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-1.5 py-0.2 bg-rose-100 text-rose-900 border border-rose-300 rounded text-[9px] font-bold uppercase tracking-wider">
                        {t('Specialty & Remedies')}
                      </span>
                      <h4 className="text-sm font-bold font-serif text-black truncate leading-tight">
                        {t('Ayur Jyotish (आयुर्वेदिक ज्योतिष)')}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-700 truncate mt-0.5">
                      {t('Medical astrology, Vata-Pitta-Kapha bio-energetic imbalances, vital organs & constitutional wellness')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleRedirect('simple', 'medical_astrology')}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer whitespace-nowrap"
                >
                  <Activity className="h-3.5 w-3.5" />
                  <span>{t('Ayur Jyotish ↗')}</span>
                </button>
              </div>

              {/* 🌟 Narrow Auspicious Naming Action Bar (From Specialty & Remedies) */}
              <div className="py-2.5 px-4 rounded-xl border border-emerald-300 bg-gradient-to-r from-emerald-50 via-teal-50/60 to-cyan-50/70 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <Sparkles className="h-4 w-4 text-yellow-200" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-1.5 py-0.2 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded text-[9px] font-bold uppercase tracking-wider">
                        {t('Specialty & Remedies')}
                      </span>
                      <h4 className="text-sm font-bold font-serif text-black truncate leading-tight">
                        {t('Auspicious Naming (शुभ नामकरण)')}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-700 truncate mt-0.5">
                      {t('Vedic syllables & sound vibrations based on Moon Nakshatra Charana / Pada alignment')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleRedirect('simple', 'naming')}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="h-3.5 w-3.5 text-yellow-200" />
                  <span>{t('Auspicious Naming ↗')}</span>
                </button>
              </div>

            </div>






            {/* 3. Sticky Right Promotion Sidebar (lg:col-span-2) */}
            <aside className="hidden lg:flex lg:col-span-2 flex-col space-y-4 lg:sticky lg:top-8">


              {/* Millionaire Kundali Yoga Card */}
              <div
                onClick={() => handleRedirect('simple', 'finance')}
                className="group relative overflow-hidden rounded-2xl border border-neutral-300 bg-neutral-900 shadow-md hover:shadow-xl cursor-pointer transition-all duration-300 flex flex-col"
              >
                <div className="relative h-74 sm:h-84 w-full overflow-hidden">
                  <img
                    src="/images/Millionaire.jpg"
                    alt="Millionaire Yoga"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                  {/* Floating Badge */}
                  <div className="absolute top-3 left-3">

                  </div>

                  {/* Bottom Text Content */}
                  <div className="absolute bottom-3 inset-x-3 text-white space-y-2">
                    <div>


                    </div>

                    <button className="w-full py-2 px-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5">
                      <span>Explore Analysis</span>
                      <span>↗</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Consultation Helper Card */}
              <div className="p-3.5 rounded-2xl border border-neutral-200 bg-neutral-50 shadow-sm text-center space-y-2">
                <span className="text-[14px] font-bold uppercase tracking-wider text-emerald-900">Need Guidance?</span>
                <p className="text-[14px] text-amber-900 leading-snug font-medium">
                  Connect with Vedic experts to decode your chart yogas.
                </p>
                <button
                  onClick={() => navigate('/astrologers')}
                  className="w-full py-1.5 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-bold transition shadow-sm"
                >
                  Ask Astrologer
                </button>
              </div>

            </aside>
          </div>
        </main>
      </div>

      {/* Modern Vedic Astrological Footer */}
      <footer className="w-full bg-neutral-900 text-neutral-300 border-t border-neutral-800 mt-16 transition-colors">
        {/* Top Feature Bar */}
        <div className="border-b border-neutral-800/80 bg-neutral-950/60 py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1600px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-neutral-300">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{t('Swiss Ephemeris Precision')}</h4>
                <p className="text-xs text-neutral-400">{t('Accurate degrees & planetary positions')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{t('Brihat Parashara Classical')}</h4>
                <p className="text-xs text-neutral-400">{t('Authentic Shastric principles & yogas')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{t('100% Confidential & Secure')}</h4>
                <p className="text-xs text-neutral-400">{t('Private birth charts & consultations')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{t('Verified Astrologers')}</h4>
                <p className="text-xs text-neutral-400">{t('Live chat & personalized remedies')}</p>
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
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-md">
                {t('Empowering your spiritual and worldly path through high-precision Vedic calculations, comprehensive 16-Varga divisional charts, Dasha analysis, and live consultation with certified astrologers.')}
              </p>
              <div className="flex items-center gap-4 text-xs text-neutral-400 pt-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>{t('Active Calculation Engine:')} <strong>Swiss Ephemeris 2.10</strong></span>
                </div>
              </div>
            </div>

            {/* Column 2: Kundali & Calculators */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-neutral-800 pb-2">
                {t('Astrology Hub')}
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/kundali" className="text-neutral-400 hover:text-amber-400 transition">
                    {t('Kundali Generation')}
                  </Link>
                </li>
                <li>
                  <Link to="/kundali-matching" className="text-neutral-400 hover:text-amber-400 transition">
                    {t('Kundali Matching (Gun Milan)')}
                  </Link>
                </li>
                <li>
                  <Link to="/daily-calendar" className="text-neutral-400 hover:text-amber-400 transition">
                    {t('Panchang & Daily Muhurta')}
                  </Link>
                </li>
                <li>
                  <Link to="/numerology" className="text-neutral-400 hover:text-amber-400 transition">
                    {t('Vedic Numerology')}
                  </Link>
                </li>
                <li>
                  <Link to="/lal-kitab" className="text-neutral-400 hover:text-amber-400 transition">
                    {t('Lal Kitab Remedies')}
                  </Link>
                </li>
                <li>
                  <Link to="/tarot-reading" className="text-neutral-400 hover:text-amber-400 transition">
                    {t('Tarot Card Insights')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Consultations & Services */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-neutral-800 pb-2">
                {t('Consultations')}
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/astrologers" className="text-neutral-400 hover:text-amber-400 transition">
                    {t('Our Astrologers')}
                  </Link>
                </li>
                <li>
                  <Link to="/live-astrologers" className="text-neutral-400 hover:text-amber-400 transition">
                    {t('Live Video Consultation')}
                  </Link>
                </li>
                <li>
                  <Link to="/live-chat" className="text-neutral-400 hover:text-amber-400 transition">
                    {t('Live Chat with Astrologer')}
                  </Link>
                </li>
                <li>
                  <Link to="/ai-astrologer" className="text-neutral-400 hover:text-amber-400 transition">
                    {t('AI Vedic Astrologer 24/7')}
                  </Link>
                </li>
                <li>
                  <Link to="/vastu-shastra" className="text-neutral-400 hover:text-amber-400 transition">
                    {t('Vastu Shastra Consultation')}
                  </Link>
                </li>
                <li>
                  <Link to="/shop" className="text-neutral-400 hover:text-amber-400 transition">
                    {t('Astro Shop & Gemstones')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Quick Links & Support */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-neutral-800 pb-2">
                {t('Support & Company')}
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/about" className="text-neutral-400 hover:text-amber-400 transition">
                    {t('About Us')}
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-neutral-400 hover:text-amber-400 transition">
                    {t('Contact & Support')}
                  </Link>
                </li>
                <li>
                  <Link to="/zodiac" className="text-neutral-400 hover:text-amber-400 transition">
                    {t('Zodiac Signs & Forecasts')}
                  </Link>
                </li>
                <li>
                  <Link to="/community-videos" className="text-neutral-400 hover:text-amber-400 transition">
                    {t('Community Videos')}
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="text-neutral-400 hover:text-amber-400 transition">
                    {t('My Account / Dashboard')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="border-t border-neutral-800 py-6 px-4 sm:px-6 lg:px-8 bg-black/40">
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500 text-center md:text-left">
            <p>
              {t('Disclaimer: Vedic astrology provides guidance based on planetary positions and Shastric principles. It is intended for advisory and personal growth purposes.')}
            </p>
            <p className="whitespace-nowrap">
              {t('Copyright © 2026 Phanom Technologies. All Rights Reserved.')}
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Scroll Navigation Controls */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-2.5">
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="p-3 bg-white hover:bg-neutral-100 text-black rounded-full shadow-lg border border-neutral-300 transition-all duration-200 hover:scale-110 cursor-pointer group flex items-center justify-center"
            title="Scroll to Top"
            aria-label="Scroll to Top"
          >
            <ArrowUp className="h-5 w-5 text-neutral-800 group-hover:text-amber-600 transition" />
          </button>
        )}

        {showScrollBottom && (
          <button
            onClick={scrollToBottom}
            className="p-3 bg-black hover:bg-neutral-800 text-white rounded-full shadow-xl border border-neutral-800 transition-all duration-200 hover:scale-110 cursor-pointer group flex items-center justify-center animate-bounce"
            title="Scroll to Bottom"
            aria-label="Scroll to Bottom"
          >
            <ArrowDown className="h-5 w-5 text-white group-hover:text-yellow-300 transition" />
          </button>
        )}
      </div>

      {/* User Kundali Details Modal Popup */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-neutral-300 shadow-2xl max-w-lg w-full overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500 text-white rounded-xl shadow-sm">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif text-black leading-tight">
                    {birthData.name}'s Birth Details
                  </h3>
                  <span className="text-xs text-neutral-500">Header Profile Information</span>
                </div>
              </div>

              <button
                onClick={() => setShowUserModal(false)}
                className="p-2 rounded-xl text-neutral-500 hover:text-black hover:bg-neutral-200 transition"
                title="Close Window"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">

              {/* Profile Card */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Kundali Holder</span>
                  <div className="text-xl font-bold font-serif text-black mt-0.5">{birthData.name}</div>
                  <div className="text-xs text-neutral-600 mt-0.5">Vedic Astronomical Diagnostic Portal</div>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-amber-200 shadow-sm">
                  <Compass className="h-6 w-6 text-amber-600" />
                </div>
              </div>

              {/* Details Matrix */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                  <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
                    <Calendar className="h-4 w-4 text-neutral-700" />
                    <span>Date of Birth</span>
                  </div>
                  <div className="text-sm font-bold text-black">{birthData.dateOfBirth}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                  <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
                    <Clock className="h-4 w-4 text-neutral-700" />
                    <span>Time of Birth</span>
                  </div>
                  <div className="text-sm font-bold text-black">{birthData.timeOfBirth || 'Not specified'}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                  <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
                    <MapPin className="h-4 w-4 text-neutral-700" />
                    <span>Place of Birth</span>
                  </div>
                  <div className="text-sm font-bold text-black truncate" title={birthData.placeOfBirth}>
                    {birthData.placeOfBirth || 'Standard Location'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                  <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
                    <Globe className="h-4 w-4 text-neutral-700" />
                    <span>Timezone</span>
                  </div>
                  <div className="text-sm font-bold text-black truncate" title={birthData.timezone}>
                    {birthData.timezone || 'Asia/Kolkata'}
                  </div>
                </div>
              </div>

              {/* Action Buttons inside popup */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    handleRedirect('html_report');
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  <FileText className="h-4 w-4" />
                  <span>Full Kundali Report</span>
                  <ExternalLink className="h-3.5 w-3.5 text-neutral-400" />
                </button>

                <button
                  onClick={() => {
                    setShowUserModal(false);
                    handleRedirect('simple', 'tithi');
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-neutral-100 text-black border border-neutral-300 font-bold text-xs rounded-xl shadow-sm transition"
                >
                  <Calendar className="h-4 w-4 text-black" />
                  <span>Tithi Pravesh</span>
                  <ExternalLink className="h-3.5 w-3.5 text-neutral-500" />
                </button>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex justify-end">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-5 py-2 bg-neutral-200 hover:bg-neutral-300 text-black text-xs font-bold rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 🌟 100-Page Kundali Success & Preview Modal */}
      {reportSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-neutral-300 shadow-2xl overflow-hidden text-black animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-200 bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Sparkles className="h-5 w-5 text-yellow-200" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif leading-tight">100-Page Mahakundali Ready!</h3>
                  <p className="text-[11px] text-amber-100">Swiss Ephemeris Precision & Gemini Flash Analysis</p>
                </div>
              </div>
              <button
                onClick={() => setReportSuccessModal(null)}
                className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
                <div className="font-bold text-sm text-black mb-1">
                  Client: {reportSuccessModal.raw_astronomical_summary?.ascendant} Lagna • {reportSuccessModal.raw_astronomical_summary?.moon_sign} Moon
                </div>
                <div><strong>Nakshatra:</strong> {reportSuccessModal.raw_astronomical_summary?.nakshatra}</div>
                <div><strong>Engine:</strong> Swiss Ephemeris + Gemini Flash</div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">100-Page Blueprint Breakdown:</h4>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  {Object.entries(reportSuccessModal.pageAllocation || {}).map(([range, desc]) => (
                    <div key={range} className="p-2.5 rounded-xl border border-neutral-200 bg-neutral-50 flex items-start gap-2">
                      <span className="font-mono font-bold text-amber-700 whitespace-nowrap bg-amber-100/80 px-1.5 py-0.5 rounded text-[10px]">
                        {range.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className="text-neutral-700 leading-snug">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex justify-end gap-2">
              <button
                onClick={() => setReportSuccessModal(null)}
                className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 40-Page Hybrid Kundali Success & Interactive Preview Modal */}
      {report40PageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-emerald-300 shadow-2xl overflow-hidden text-black animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-emerald-200 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  <FileText className="h-6 w-6 text-emerald-100" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif leading-tight">40-Page Hybrid Kundali Report Ready!</h3>
                  <p className="text-[12px] text-emerald-100">Swiss Ephemeris Precision + Gemini Flash Narrative Synthesis</p>
                </div>
              </div>
              <button
                onClick={() => setReport40PageModal(null)}
                className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[68vh]">
              {/* Native Astrological Summary */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1.5">
                <div className="font-bold text-sm text-emerald-900 mb-1 flex items-center justify-between">
                  <span>Client: {report40PageModal.raw_astronomical_summary?.ascendant} Lagna • {report40PageModal.raw_astronomical_summary?.moon_sign} Moon</span>
                  <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full font-mono font-bold">40 PAGES COMPLETE</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><strong>Nakshatra:</strong> {report40PageModal.raw_astronomical_summary?.nakshatra}</div>
                  <div><strong>Sun Sign:</strong> {report40PageModal.raw_astronomical_summary?.sun_sign}</div>
                  <div><strong>Active Dasha:</strong> {report40PageModal.raw_astronomical_summary?.active_dasha?.active_mahadasha || 'Vimshottari'}</div>
                  <div><strong>Engine:</strong> Swiss Ephemeris (Exact) + Gemini Flash</div>
                </div>
              </div>

              {/* 40-Page Blueprint Allocation */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  40-Page Comprehensive Section Blueprint:
                </h4>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  {Object.entries(report40PageModal.pageAllocation || {}).map(([range, desc]) => (
                    <div key={range} className="p-2.5 rounded-xl border border-neutral-200 bg-neutral-50 flex items-start gap-2.5 hover:bg-emerald-50/40 transition">
                      <span className="font-mono font-bold text-emerald-800 whitespace-nowrap bg-emerald-100/90 px-2 py-0.5 rounded text-[10px]">
                        {range.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className="text-neutral-700 leading-snug">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Narrative Preview Chapters */}
              {report40PageModal.aiSections && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    AI Deep-Dive Insights Preview:
                  </h4>
                  {report40PageModal.aiSections.personality && (
                    <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs space-y-1">
                      <strong className="text-emerald-800 font-bold block">Pages 24-27: Personality, Temperament & Core Strengths</strong>
                      <p className="text-neutral-700 whitespace-pre-line line-clamp-4">
                        {report40PageModal.aiSections.personality}
                      </p>
                    </div>
                  )}
                  {report40PageModal.aiSections.career && (
                    <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs space-y-1">
                      <strong className="text-amber-800 font-bold block">Pages 28-31: Career, Wealth & Dhana Yogas Outlook</strong>
                      <p className="text-neutral-700 whitespace-pre-line line-clamp-4">
                        {report40PageModal.aiSections.career}
                      </p>
                    </div>
                  )}
                  {report40PageModal.aiSections.marriage && (
                    <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs space-y-1">
                      <strong className="text-rose-800 font-bold block">Pages 32-34: Love, Marriage & Spouse Profile</strong>
                      <p className="text-neutral-700 whitespace-pre-line line-clamp-4">
                        {report40PageModal.aiSections.marriage}
                      </p>
                    </div>
                  )}
                  {report40PageModal.aiSections.health && (
                    <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs space-y-1">
                      <strong className="text-blue-800 font-bold block">Pages 35-37: Health, Vitality & Dosha Vulnerabilities</strong>
                      <p className="text-neutral-700 whitespace-pre-line line-clamp-4">
                        {report40PageModal.aiSections.health}
                      </p>
                    </div>
                  )}
                  {report40PageModal.aiSections.remedies && (
                    <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs space-y-1">
                      <strong className="text-purple-800 font-bold block">Pages 38-40: Sacred Vedic Remedies & Gemstone Prescriptions</strong>
                      <p className="text-neutral-700 whitespace-pre-line line-clamp-4">
                        {report40PageModal.aiSections.remedies}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between gap-3">
              <span className="text-[11px] text-neutral-500 font-medium">
                Complete 40-page Hybrid Kundali generated & ready
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setReport40PageModal(null)}
                  className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 25-Page Dhan Yog Wealth Report Success / Interactive Preview Modal */}
      {dhanYogSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-amber-300 shadow-2xl overflow-hidden text-black animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-amber-200 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <DollarSign className="h-6 w-6 text-yellow-200" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif leading-tight">
                    25-Page Master Dhan Yog Wealth Report
                  </h3>
                  <span className="text-xs text-amber-100 font-medium">
                    Synthesized with Swiss Ephemeris + Gemini Flash
                  </span>
                </div>
              </div>
              <button
                onClick={() => setDhanYogSuccessModal(null)}
                className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
                <div className="font-bold text-sm text-black mb-1">
                  Client: {dhanYogSuccessModal.raw_astronomical_summary?.ascendant} Lagna • {dhanYogSuccessModal.raw_astronomical_summary?.moon_sign} Moon
                </div>
                <div><strong>Nakshatra:</strong> {dhanYogSuccessModal.raw_astronomical_summary?.nakshatra}</div>
                <div><strong>Active Dasha Cycle:</strong> {dhanYogSuccessModal.raw_astronomical_summary?.active_dasha?.active_mahadasha || 'Jupiter'} Mahadasha</div>
                <div><strong>Engine:</strong> Swiss Ephemeris 2.10 + Gemini Flash (Hybrid Model)</div>
              </div>

              {/* 25-Page Blueprint Allocation */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">25-Page Wealth Blueprint Breakdown:</h4>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  {Object.entries(dhanYogSuccessModal.pageAllocation || {}).map(([range, desc]) => (
                    <div key={range} className="p-2.5 rounded-xl border border-amber-200/80 bg-amber-50/50 flex items-start gap-2">
                      <span className="font-mono font-bold text-amber-800 whitespace-nowrap bg-amber-200/80 px-2 py-0.5 rounded text-[10px]">
                        {range.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className="text-neutral-800 leading-snug">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Sample Chapter Excerpts */}
              {dhanYogSuccessModal.chapters && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">AI Synthesized Chapters:</h4>
                  {dhanYogSuccessModal.chapters.dhan_yogas && (
                    <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs space-y-1">
                      <strong className="text-amber-800 font-bold block">Chapter 1: Classical Dhan Yogas & Combinations</strong>
                      <p className="text-neutral-700 whitespace-pre-line line-clamp-4">
                        {dhanYogSuccessModal.chapters.dhan_yogas}
                      </p>
                    </div>
                  )}
                  {dhanYogSuccessModal.chapters.investment_avenues && (
                    <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs space-y-1">
                      <strong className="text-emerald-800 font-bold block">Chapter 2: Investment & Asset Growth Avenues</strong>
                      <p className="text-neutral-700 whitespace-pre-line line-clamp-4">
                        {dhanYogSuccessModal.chapters.investment_avenues}
                      </p>
                    </div>
                  )}
                  {dhanYogSuccessModal.chapters.wealth_timeline && (
                    <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs space-y-1">
                      <strong className="text-indigo-800 font-bold block">Chapter 3: 10-Year Dasha Wealth Timeline</strong>
                      <p className="text-neutral-700 whitespace-pre-line line-clamp-4">
                        {dhanYogSuccessModal.chapters.wealth_timeline}
                      </p>
                    </div>
                  )}
                  {dhanYogSuccessModal.chapters.remedies && (
                    <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs space-y-1">
                      <strong className="text-purple-800 font-bold block">Chapter 4: Sacred Wealth Remedies & Yantras</strong>
                      <p className="text-neutral-700 whitespace-pre-line line-clamp-4">
                        {dhanYogSuccessModal.chapters.remedies}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between gap-3">
              <span className="text-[11px] text-neutral-500 font-medium">
                Complete 25-page PDF compiled & ready
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setDhanYogSuccessModal(null)}
                  className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 25-Page Comprehensive Remedies Report Success / Interactive Preview Modal */}
      {remediesSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-teal-300 shadow-2xl overflow-hidden text-black animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-teal-200 bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Sparkles className="h-6 w-6 text-yellow-200" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif leading-tight">
                    25-Page Encyclopedia of Astrological Remedies
                  </h3>
                  <span className="text-xs text-teal-100 font-medium">
                    AIFAS Shastric Rules + Gemini Flash Hybrid Engine
                  </span>
                </div>
              </div>
              <button
                onClick={() => setRemediesSuccessModal(null)}
                className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-950 space-y-1">
                <div className="font-bold text-sm text-black mb-1">
                  Client: {remediesSuccessModal.raw_astronomical_summary?.ascendant} Lagna • {remediesSuccessModal.raw_astronomical_summary?.moon_sign} Moon
                </div>
                <div><strong>Authoritative Source:</strong> {remediesSuccessModal.bookSource}</div>
                <div><strong>Classical 43-Day Rule:</strong> All Gems, Mantras, and Rudraksha activate within 40 to 43 continuous days of practice.</div>
                <div><strong>Engine:</strong> Swiss Ephemeris + Encyclopedia Dataset + Gemini Flash</div>
              </div>

              {/* Lagna Specific Gemstone Matrix */}
              {remediesSuccessModal.lagnaSpecificGems && (
                <div className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/60 text-xs space-y-2">
                  <span className="font-bold uppercase tracking-wider text-emerald-900 block">
                    Prescribed Gemstone Matrix ({remediesSuccessModal.raw_astronomical_summary?.ascendant} Lagna)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="p-2 bg-white rounded-xl border border-emerald-100">
                      <span className="text-[10px] text-neutral-500 font-bold block uppercase">Life Stone (Lagna)</span>
                      <strong className="text-emerald-800 text-sm">{remediesSuccessModal.lagnaSpecificGems.lifeStone}</strong>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-emerald-100">
                      <span className="text-[10px] text-neutral-500 font-bold block uppercase">Karaka Stone (5th)</span>
                      <strong className="text-amber-800 text-sm">{remediesSuccessModal.lagnaSpecificGems.karakaStone}</strong>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-emerald-100">
                      <span className="text-[10px] text-neutral-500 font-bold block uppercase">Lucky Stone (9th)</span>
                      <strong className="text-blue-800 text-sm">{remediesSuccessModal.lagnaSpecificGems.luckyStone}</strong>
                    </div>
                  </div>
                  {remediesSuccessModal.lagnaSpecificGems.incompatible?.length > 0 && (
                    <p className="text-[11px] text-red-700 font-medium">
                      ⚠️ Strictly Incompatible Gems (Avoid Wearing): {remediesSuccessModal.lagnaSpecificGems.incompatible.join(', ')}
                    </p>
                  )}
                </div>
              )}

              {/* 25-Page Blueprint Allocation */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">25-Page Remedial Allocation Breakdown:</h4>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  {Object.entries(remediesSuccessModal.pageAllocation || {}).map(([range, desc]) => (
                    <div key={range} className="p-2.5 rounded-xl border border-teal-200/80 bg-teal-50/50 flex items-start gap-2">
                      <span className="font-mono font-bold text-teal-800 whitespace-nowrap bg-teal-200/80 px-2 py-0.5 rounded text-[10px]">
                        {range.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className="text-neutral-800 leading-snug">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Synthesized Chapters */}
              {remediesSuccessModal.chapters && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">AI Synthesized Chapters:</h4>
                  {remediesSuccessModal.chapters.gemstones && (
                    <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs space-y-1">
                      <strong className="text-teal-800 font-bold block">Chapters 4-11: Gemstone Science & 43-Day Rituals</strong>
                      <p className="text-neutral-700 whitespace-pre-line line-clamp-4">
                        {remediesSuccessModal.chapters.gemstones}
                      </p>
                    </div>
                  )}
                  {remediesSuccessModal.chapters.rudraksha_yantra && (
                    <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs space-y-1">
                      <strong className="text-indigo-800 font-bold block">Chapters 12-18: Mukhi Rudraksha Therapy & Yantra Consecration</strong>
                      <p className="text-neutral-700 whitespace-pre-line line-clamp-4">
                        {remediesSuccessModal.chapters.rudraksha_yantra}
                      </p>
                    </div>
                  )}
                  {remediesSuccessModal.chapters.lalkitab_totke && (
                    <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs space-y-1">
                      <strong className="text-purple-800 font-bold block">Chapters 19-23: Lal Kitab Totke, Daan & Water Immersion</strong>
                      <p className="text-neutral-700 whitespace-pre-line line-clamp-4">
                        {remediesSuccessModal.chapters.lalkitab_totke}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between gap-3">
              <span className="text-[11px] text-neutral-500 font-medium">
                Complete 25-page remedial blueprint compiled
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRedirect('simple', 'remedy')}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Interactive Remedies Viewer ↗</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Download / Print PDF</span>
                </button>
                <button
                  onClick={() => setRemediesSuccessModal(null)}
                  className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 Category Pop-up Window for Sidebar Buttons */}
      {selectedCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-5xl w-full border border-neutral-300 shadow-2xl overflow-hidden text-black animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">

            {/* Modal Header */}
            <div className={`px-4 py-3 sm:px-5 sm:py-3.5 border-b border-neutral-200 ${selectedCategoryModal.activeBg || 'bg-black text-white'} flex items-center justify-between`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm flex-shrink-0">
                  <Grid className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold font-serif leading-tight truncate">
                    {selectedCategoryModal.label}
                  </h3>
                  <p className="text-[11px] sm:text-xs opacity-90 truncate">
                    {selectedCategoryModal.desc} ({selectedCategoryModal.count} items)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCategoryModal(null)}
                className="p-1.5 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex-shrink-0 cursor-pointer ml-3"
                title="Close Window"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body: Cards Grid */}
            <div className="p-3 sm:p-4 overflow-y-auto flex-grow">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2.5">
                {(selectedCategoryModal.items || []).map((item, idx) => {
                  const ItemIcon = item.icon || ExternalLink;
                  const itemCode = item.code || item.key || item.value;
                  const rawTitle = item.name || item.code?.toUpperCase();
                  const rawDesc = item.desc || '';
                  const itemTitle = t(rawTitle);
                  const itemDesc = t(rawDesc);

                  // Distinctive harmonious color schemes for each card
                  const cardColorPalettes = [
                    { bg: 'bg-amber-50/80 hover:bg-amber-100/90 border-amber-200/90 hover:border-amber-400', badge: 'bg-amber-100 text-amber-900 border-amber-300', text: 'text-amber-950', hoverText: 'group-hover:text-amber-700', icon: 'text-amber-600', borderBottom: 'border-amber-200' },
                    { bg: 'bg-blue-50/80 hover:bg-blue-100/90 border-blue-200/90 hover:border-blue-400', badge: 'bg-blue-100 text-blue-900 border-blue-300', text: 'text-blue-950', hoverText: 'group-hover:text-blue-700', icon: 'text-blue-600', borderBottom: 'border-blue-200' },
                    { bg: 'bg-emerald-50/80 hover:bg-emerald-100/90 border-emerald-200/90 hover:border-emerald-400', badge: 'bg-emerald-100 text-emerald-900 border-emerald-300', text: 'text-emerald-950', hoverText: 'group-hover:text-emerald-700', icon: 'text-emerald-600', borderBottom: 'border-emerald-200' },
                    { bg: 'bg-purple-50/80 hover:bg-purple-100/90 border-purple-200/90 hover:border-purple-400', badge: 'bg-purple-100 text-purple-900 border-purple-300', text: 'text-purple-950', hoverText: 'group-hover:text-purple-700', icon: 'text-purple-600', borderBottom: 'border-purple-200' },
                    { bg: 'bg-rose-50/80 hover:bg-rose-100/90 border-rose-200/90 hover:border-rose-400', badge: 'bg-rose-100 text-rose-900 border-rose-300', text: 'text-rose-950', hoverText: 'group-hover:text-rose-700', icon: 'text-rose-600', borderBottom: 'border-rose-200' },
                    { bg: 'bg-indigo-50/80 hover:bg-indigo-100/90 border-indigo-200/90 hover:border-indigo-400', badge: 'bg-indigo-100 text-indigo-900 border-indigo-300', text: 'text-indigo-950', hoverText: 'group-hover:text-indigo-700', icon: 'text-indigo-600', borderBottom: 'border-indigo-200' },
                    { bg: 'bg-teal-50/80 hover:bg-teal-100/90 border-teal-200/90 hover:border-teal-400', badge: 'bg-teal-100 text-teal-900 border-teal-300', text: 'text-teal-950', hoverText: 'group-hover:text-teal-700', icon: 'text-teal-600', borderBottom: 'border-teal-200' },
                    { bg: 'bg-orange-50/80 hover:bg-orange-100/90 border-orange-200/90 hover:border-orange-400', badge: 'bg-orange-100 text-orange-900 border-orange-300', text: 'text-orange-950', hoverText: 'group-hover:text-orange-700', icon: 'text-orange-600', borderBottom: 'border-orange-200' },
                    { bg: 'bg-cyan-50/80 hover:bg-cyan-100/90 border-cyan-200/90 hover:border-cyan-400', badge: 'bg-cyan-100 text-cyan-900 border-cyan-300', text: 'text-cyan-950', hoverText: 'group-hover:text-cyan-700', icon: 'text-cyan-600', borderBottom: 'border-cyan-200' },
                    { bg: 'bg-fuchsia-50/80 hover:bg-fuchsia-100/90 border-fuchsia-200/90 hover:border-fuchsia-400', badge: 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300', text: 'text-fuchsia-950', hoverText: 'group-hover:text-fuchsia-700', icon: 'text-fuchsia-600', borderBottom: 'border-fuchsia-200' },
                    { bg: 'bg-lime-50/80 hover:bg-lime-100/90 border-lime-200/90 hover:border-lime-400', badge: 'bg-lime-100 text-lime-900 border-lime-300', text: 'text-lime-950', hoverText: 'group-hover:text-lime-700', icon: 'text-lime-600', borderBottom: 'border-lime-200' },
                    { bg: 'bg-violet-50/80 hover:bg-violet-100/90 border-violet-200/90 hover:border-violet-400', badge: 'bg-violet-100 text-violet-900 border-violet-300', text: 'text-violet-950', hoverText: 'group-hover:text-violet-700', icon: 'text-violet-600', borderBottom: 'border-violet-200' }
                  ];

                  const palette = cardColorPalettes[idx % cardColorPalettes.length];

                  return (
                    <div
                      key={itemCode || idx}
                      onClick={() => {
                        const targetType = item.type || selectedCategoryModal.type || 'simple';
                        const targetVal = item.value || itemCode;
                        setSelectedCategoryModal(null);
                        handleRedirect(targetType, targetVal);
                      }}
                      className={`p-2.5 sm:p-3 rounded-xl border transition-all text-left flex flex-col justify-between group cursor-pointer shadow-2xs hover:shadow-md hover:-translate-y-0.5 ${palette.bg}`}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-1.5">


                        </div>
                        <h4 className={`text-[13px] sm:text-[14px] font-bold ${palette.text} mb-0.5 ${palette.hoverText} transition line-clamp-1`}>
                          {itemTitle}
                        </h4>

                      </div>

                      <div className={`mt-2 pt-1.5 border-t ${palette.borderBottom} flex items-center justify-between text-[11px] sm:text-[12px] font-bold ${palette.text} ${palette.hoverText}`}>
                        <span>{t('Click Here For Details') || t('Open')}</span>
                        <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
              <span className="text-[11px] sm:text-[14px] text-black font-medium">
                {t('Click any card to open detailed Vedic analysis window')}
              </span>
              <button
                onClick={() => setSelectedCategoryModal(null)}
                className="px-4 py-1.5 sm:px-5 sm:py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                {t('Close Window')}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 🌟 3-Option Astrologer Action Modal: Live Astrologers | Chat Now | Book Appointment */}
      {selectedAstroModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity"
          onClick={() => setSelectedAstroModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-amber-200/80 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Header banner with warm celestial gradient */}
            <div className="relative bg-amber-100 px-6 py-5 text-white">
              <button
                type="button"
                onClick={() => setSelectedAstroModal(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-amber-400 hover:bg-yellow-200 text-red-900 transition cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md bg-white flex items-center justify-center">
                    {(() => {
                      const rawImg = selectedAstroModal.profilePicture || selectedAstroModal.image || selectedAstroModal.imageUrl || selectedAstroModal.photo;
                      const imgSrc = rawImg ? buildAssetUrl(rawImg) : null;
                      const astroDisplayName = cleanAstrologerName(selectedAstroModal.name);
                      return imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={astroDisplayName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/images/AstroIcon.jpg';
                          }}
                        />
                      ) : (
                        <span className="text-xl font-bold text-amber-700">
                          {astroDisplayName.charAt(0) || 'A'}
                        </span>
                      );
                    })()}
                  </div>
                  {/* Availability badge */}
                  <span
                    className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${selectedAstroModal.isAvailable !== false ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                    title={selectedAstroModal.isAvailable !== false ? 'Available' : 'Unavailable'}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[20px] font-serif font-bold text-black truncate">
                      {cleanAstrologerName(selectedAstroModal.name)}
                    </h3>
                    {selectedAstroModal.isLive && (
                      <span className="inline-flex items-center gap-1 bg-red-600 text-emerald-600 text-[14px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                        LIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[14px] text-amber-900 font-medium truncate mt-0.5">
                    {Array.isArray(selectedAstroModal.specialization) && selectedAstroModal.specialization.length > 0
                      ? selectedAstroModal.specialization.join(', ')
                      : 'Vedic Astrologer • Kundali Expert'}
                  </p>
                  <p className="text-[16px] font-bold text-amber-900 mt-1">
                    Rate: ₹{selectedAstroModal.pricing || selectedAstroModal.callRate || 16}/min
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body: Three Explicit Consultation Options */}
            <div className="p-5 space-y-3 bg-gradient-to-b from-amber-50/40 via-white to-white">
              <p className="text-[14px] font-semibold text-orange-900 mb-1">
                {t('Select an option to connect with this astrologer:') || 'Select an option to connect with this astrologer:'}
              </p>

              {/* Option 1: Live Astrologers */}
              <button
                type="button"
                onClick={() => {
                  const astro = selectedAstroModal;
                  setSelectedAstroModal(null);
                  if (astro.isLive) {
                    navigate(`/live/${astro._id}`, { state: { astrologer: astro } });
                  } else {
                    navigate('/live-astrologers', { state: { selectedAstro: astro } });
                  }
                }}
                className="w-full p-3.5 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 hover:from-red-100 to-rose-50 text-left flex items-center justify-between group transition-all duration-200 hover:shadow-md hover:border-red-300 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <Video className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-red-700 transition-colors">
                        {t('Live Astrologers') || 'Live Astrologers'}
                      </h4>
                      {selectedAstroModal.isLive && (
                        <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded">
                          Streaming Now
                        </span>
                      )}
                    </div>
                    <p className="text-[14px] text-black leading-tight mt-0.5">
                      {t('Watch live session & ask questions in real-time stream') || 'Watch live session & ask questions in real-time stream'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-red-400 group-hover:text-red-600 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Option 2: Chat Now */}
              <button
                type="button"
                onClick={() => {
                  const astro = selectedAstroModal;
                  setSelectedAstroModal(null);
                  navigate('/live-chat', {
                    state: {
                      autoSelectAstroId: astro._id,
                      astrologer: astro
                    }
                  });
                }}
                className="w-full p-3.5 rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 hover:from-teal-100 to-emerald-50 text-left flex items-center justify-between group transition-all duration-200 hover:shadow-md hover:border-teal-300 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-teal-700 transition-colors">
                      {t('Chat Now') || 'Chat Now'}
                    </h4>
                    <p className="text-[14px] text-black leading-tight mt-0.5">
                      {t('Start instant 1-on-1 private live chat consultation') || 'Start instant 1-on-1 private live chat consultation'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-teal-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Option 3: Book an Appointment */}
              <button
                type="button"
                onClick={() => {
                  const astro = selectedAstroModal;
                  setSelectedAstroModal(null);
                  navigate('/booking', {
                    state: {
                      astrologerId: astro._id,
                      selectedAstrologer: astro,
                      astrologer: astro
                    }
                  });
                }}
                className="w-full p-3.5 rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 hover:from-purple-100 to-indigo-50 text-left flex items-center justify-between group transition-all duration-200 hover:shadow-md hover:border-purple-300 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <CalendarClock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-purple-700 transition-colors">
                      {t('Book an Appointment') || 'Book an Appointment'}
                    </h4>
                    <p className="text-[14px] text-black leading-tight mt-0.5">
                      {t('Schedule a private video call consultation for your convenient slot') || 'Schedule a private video call consultation for your convenient slot'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-purple-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Footer with close button */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[14px] text-slate-900">
                100% Secure & Confidential Consultation
              </span>
              <button
                type="button"
                onClick={() => setSelectedAstroModal(null)}
                className="px-4 py-1.5 text-[16px] font-bold text-black hover:text-slate-900 bg-amber-400 border border-amber-200 hover:bg-amber-100 rounded-lg transition cursor-pointer"
              >
                {t('Cancel') || 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🕉️ D1 Vedic Kundali Generation Modal with Swasti Vachan Mantra Audio */}
      {d1LoadingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 rounded-3xl border border-amber-400/40 shadow-2xl p-6 md:p-8 text-center text-white overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

            {/* Top Bar with Mute & Close */}
            <div className="flex items-center justify-between mb-4 relative z-10">
              {/* Mute / Unmute Button */}
              <button
                type="button"
                onClick={() => {
                  if (d1AudioRef.current) {
                    if (isMantraMuted) {
                      d1AudioRef.current.muted = false;
                      setIsMantraMuted(false);
                    } else {
                      d1AudioRef.current.muted = true;
                      setIsMantraMuted(true);
                    }
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition ${isMantraMuted
                  ? 'bg-rose-500/20 border-rose-400/50 text-rose-300'
                  : 'bg-amber-500/20 border-amber-400/50 text-amber-300 animate-pulse'
                  }`}
                title={isMantraMuted ? 'Unmute Mantra' : 'Mute Mantra'}
              >
                {isMantraMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isMantraMuted ? 'Muted' : 'Playing Mantra'}</span>
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  if (d1AudioRef.current) {
                    d1AudioRef.current.pause();
                    d1AudioRef.current.currentTime = 0;
                  }
                  setD1LoadingModal(null);
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition"
                title="Cancel & Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Center Sacred Symbol Animation */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-2 border-amber-400/30 flex items-center justify-center animate-[spin_12s_linear_infinite]">
                <div className="w-20 h-20 rounded-full border-2 border-amber-400/60 flex items-center justify-center"></div>
              </div>
              <div className="absolute text-4xl animate-bounce">
                🕉️
              </div>
            </div>

            {/* Title & Vedic Shloka */}
            <h3 className="text-xl md:text-2xl font-serif font-black tracking-wide text-amber-300 mb-2">
              {d1LoadingModal?.title || 'Generating D1 Rasi Kundali'}
            </h3>
            <p className="text-xs text-amber-200/80 font-serif italic mb-4 max-w-sm mx-auto leading-relaxed">
              "ॐ स्वस्ति न इन्द्रो वृद्धश्रवाः स्वस्ति नः पूषा विश्ववेदाः..."
            </p>

            {/* Progress Status */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 mb-5 text-xs text-slate-300 flex items-center justify-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-amber-400 border-t-transparent animate-spin"></div>
              <span>Invoking Vedic Ephemeris & Precise Planetary Degrees</span>
            </div>

            {/* Actions: Open Immediately or Cancel */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (d1LoadingModal?.d1Url) {
                    window.open(d1LoadingModal.d1Url, '_blank', 'width=1280,height=900,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes');
                  }
                  if (d1AudioRef.current) {
                    d1AudioRef.current.pause();
                    d1AudioRef.current.currentTime = 0;
                  }
                  setD1LoadingModal(null);
                }}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition"
              >
                Open Kundali Window ↗
              </button>
              <button
                type="button"
                onClick={() => {
                  if (d1AudioRef.current) {
                    d1AudioRef.current.pause();
                    d1AudioRef.current.currentTime = 0;
                  }
                  setD1LoadingModal(null);
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white font-medium text-xs rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 Vimshottari Panchastariya Dasha Modal */}
      {showVimshottariModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl h-[88vh] bg-white rounded-3xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-white tracking-wide">
                    विंशोत्तरी पंचस्तरीय · Dasha Table
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {birthData?.name || 'User'} · {birthData?.dateOfBirth} {birthData?.timeOfBirth}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const latLon = birthData.coordinates ? birthData.coordinates.split(',') : ['28.6139', '77.2090'];
                    const lat = latLon[0]?.trim() || '28.6139';
                    const lon = latLon[1]?.trim() || '77.2090';
                    const targetUrl = `/chart/vimshottari?name=${encodeURIComponent(birthData.name || 'User')}&date=${encodeURIComponent(birthData.dateOfBirth)}&time=${encodeURIComponent(birthData.timeOfBirth || '12:00')}&lat=${lat}&lon=${lon}&tz_offset=5.5&location_name=${encodeURIComponent(birthData.placeOfBirth || 'Birth Place')}`;
                    window.open(targetUrl, '_blank', 'width=1320,height=920,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes');
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl flex items-center gap-1.5 border border-slate-700 transition"
                  title="Open in new window"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New Window</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowVimshottariModal(false)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: VimshottariTable */}
            <div className="flex-1 overflow-hidden flex flex-col bg-slate-50">
              <VimshottariTable birthData={birthData} initialLevels={5} />
            </div>
          </div>
        </div>
      )}

      {/* 🌟 Interactive Dasha Timeline Modal (with Current Dasha Indicator) */}
      {showDasaTimelineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-white tracking-wide">
                    120-Year Dasha Timeline & Current Period
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {birthData?.name || 'User'} · {birthData?.dateOfBirth} {birthData?.timeOfBirth} ({birthData?.placeOfBirth})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const latLon = birthData.coordinates ? birthData.coordinates.split(',') : ['28.6139', '77.2090'];
                    const lat = latLon[0]?.trim() || '28.6139';
                    const lon = latLon[1]?.trim() || '77.2090';
                    const timelineUrl = `${VEDIC_ASTROLOGY_BASE_URL}/?dasha_timeline=true&hide_search=true&name=${encodeURIComponent(birthData.name || 'User')}&date=${encodeURIComponent(birthData.dateOfBirth)}&time=${encodeURIComponent(birthData.timeOfBirth || '12:00')}&lat=${lat}&lon=${lon}&tz_offset=5.5&location_name=${encodeURIComponent(birthData.placeOfBirth || 'Birth Place')}&gender=Male`;
                    window.open(timelineUrl, 'DashaTimeline', 'width=1280,height=900,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes');
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
                  title="Open in new window"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New Window</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowDasaTimelineModal(false)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: DasaTimelineViewer */}
            <div className="flex-1 overflow-hidden flex flex-col bg-slate-50">
              <DasaTimelineViewer birthData={birthData} />
            </div>
          </div>
        </div>
      )}

      {/* 🌟 Interactive Yogini Dasha Modal */}
      {showYoginiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-600/30 border border-rose-400/40 flex items-center justify-center text-rose-300 font-bold">
                  ॐ
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-white tracking-wide">
                    योगिनी दशा · Yogini Dasha (36-Year Cycles)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {birthData?.name || 'User'} · {birthData?.dateOfBirth} {birthData?.timeOfBirth} ({birthData?.placeOfBirth})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const latLon = birthData.coordinates ? birthData.coordinates.split(',') : ['28.6139', '77.2090'];
                    const lat = latLon[0]?.trim() || '28.6139';
                    const lon = latLon[1]?.trim() || '77.2090';
                    const yoginiUrl = `${VEDIC_ASTROLOGY_BASE_URL}/?worksheet=true&fullScreen=yogini&hide_search=true&name=${encodeURIComponent(birthData.name || 'User')}&date=${encodeURIComponent(birthData.dateOfBirth)}&time=${encodeURIComponent(birthData.timeOfBirth || '12:00')}&lat=${lat}&lon=${lon}&tz_offset=5.5&location_name=${encodeURIComponent(birthData.placeOfBirth || 'Birth Place')}&gender=Male`;
                    window.open(yoginiUrl, 'YoginiDasha', 'width=1280,height=900,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes');
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
                  title="Open in new window"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New Window</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowYoginiModal(false)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: YoginiTable */}
            <div className="flex-1 overflow-hidden flex flex-col bg-slate-50">
              <YoginiTable birthData={birthData} />
            </div>
          </div>
        </div>
      )}

      {/* 🌟 Interactive Chara Dasha Modal */}
      {showCharaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-600/30 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold text-base">
                  ♈
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-white tracking-wide">
                    चर दशा · Jaimini Chara Dasha (Sign Periods)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {birthData?.name || 'User'} · {birthData?.dateOfBirth} {birthData?.timeOfBirth} ({birthData?.placeOfBirth})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const latLon = birthData.coordinates ? birthData.coordinates.split(',') : ['28.6139', '77.2090'];
                    const lat = latLon[0]?.trim() || '28.6139';
                    const lon = latLon[1]?.trim() || '77.2090';
                    const charaUrl = `${VEDIC_ASTROLOGY_BASE_URL}/?worksheet=true&fullScreen=chara&hide_search=true&name=${encodeURIComponent(birthData.name || 'User')}&date=${encodeURIComponent(birthData.dateOfBirth)}&time=${encodeURIComponent(birthData.timeOfBirth || '12:00')}&lat=${lat}&lon=${lon}&tz_offset=5.5&location_name=${encodeURIComponent(birthData.placeOfBirth || 'Birth Place')}&gender=Male`;
                    window.open(charaUrl, 'CharaDasha', 'width=1280,height=900,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes');
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
                  title="Open in new window"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New Window</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCharaModal(false)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: CharaTable */}
            <div className="flex-1 overflow-hidden flex flex-col bg-slate-50">
              <CharaTable birthData={birthData} />
            </div>
          </div>
        </div>
      )}
    </div>

  );
};



export default KundaliHub;
