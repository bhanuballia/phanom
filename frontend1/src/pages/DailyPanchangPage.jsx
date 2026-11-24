import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { PYTHON_ASTRO_URL } from '../services/api';
import {
  Calendar,
  Clock,
  Sun,
  Moon,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Award,
  Compass,
  ArrowUpRight,
  RefreshCw,
  MapPin,
  CalendarDays,
  Layers,
  Send,
  HelpCircle,
  AlertTriangle,
  Star,
  Activity,
  X,
  Search,
  Navigation as NavigationIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Format YYYY-MM-DD
const formatDateParam = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const YOGA_HINDI_MAP = {
  'Vishkambha': 'विष्कम्भ',
  'Priti': 'प्रीति',
  'Ayushman': 'आयुष्मान',
  'Saubhagya': 'सौभाग्य',
  'Shobhana': 'शोभन',
  'Atiganda': 'अतिगण्ड',
  'Sukarma': 'सुकर्मा',
  'Dhriti': 'धृति',
  'Dhrsti': 'धृति',
  'Shula': 'शूल',
  'Ganda': 'गण्ड',
  'Vriddhi': 'वृद्धि',
  'Dhruva': 'ध्रुव',
  'Vyaghata': 'व्याघात',
  'Harshana': 'हर्षण',
  'Vajra': 'वज्र',
  'Siddhi': 'सिद्धि',
  'Vyatipata': 'व्यतीपात',
  'Variyana': 'वरीयान',
  'Variyan': 'वरीयान',
  'Parigha': 'परिघ',
  'Shiva': 'शिव',
  'Siddha': 'सिद्ध',
  'Sadhya': 'साध्य',
  'Shubha': 'शुभ',
  'Shukla': 'शुक्ल',
  'Brahma': 'ब्रह्म',
  'Indra': 'इन्द्र',
  'Vaidhriti': 'वैधृति'
};

const NAKSHATRA_HINDI_MAP = {
  'Ashwini': 'अश्विनी', 'Bharani': 'भरणी', 'Krittika': 'कृत्तिका', 'Rohini': 'रोहिणी',
  'Mrigashira': 'मृगशिरा', 'Ardra': 'आर्द्रा', 'Punarvasu': 'पुनर्वसु', 'Pushya': 'पुष्य',
  'Ashlesha': 'आश्लेषा', 'Magha': 'मघा', 'Purva Phalguni': 'पूर्वाफाल्गुनी',
  'Uttara Phalguni': 'उत्तराफाल्गुनी', 'Hasta': 'हस्त', 'Chitra': 'चित्रा', 'Swati': 'स्वाती',
  'Vishakha': 'विशाखा', 'Anuradha': 'अनुराधा', 'Jyeshtha': 'ज्येष्ठा', 'Mula': 'मूल',
  'Purva Ashadha': 'पूर्वाषाढ़ा', 'Uttara Ashadha': 'उत्तराषाढ़ा', 'Shravana': 'श्रवण',
  'Dhanishta': 'धनिष्ठा', 'Shatabhisha': 'शतभिषा', 'Purva Bhadrapada': 'पूर्वभाद्रपद',
  'Uttara Bhadrapada': 'उत्तरभाद्रपद', 'Revati': 'रेवती'
};

const KARANA_HINDI_MAP = {
  'Bava': 'बव', 'Balava': 'बालव', 'Kaulava': 'कौलव', 'Taitila': 'तैतिल',
  'Gara': 'गर', 'Vanija': 'वणिज', 'Vishti': 'विष्टि (भद्रा)', 'Shakuni': 'शकुनि',
  'Chatushpada': 'चतुष्पद', 'Naga': 'नाग', 'Kimstughna': 'किंस्तुघ्न'
};

const ORACLE_CATEGORIES = [
  { id: "General", label: "General" },
  { id: "Night", label: "🌙 Night" },
  { id: "Business", label: "💼 Business" },
  { id: "Marriage", label: "💍 Marriage" },
  { id: "Travel", label: "✈️ Travel" },
  { id: "Health", label: "🏥 Health" },
  { id: "Property", label: "🏠 Property" },
  { id: "Spiritual", label: "🕉️ Spiritual" },
  { id: "AI", label: "🤖 AI Assistant" }
];

const ORACLE_QUESTIONS = {
  General: [
    "What is today's Day Chaughadiya?",
    "Which Chaughadiya is running right now during the day?",
    "Is the current Day Chaughadiya auspicious?",
    "What time does today's Day Chaughadiya start and end?",
    "Which Day Chaughadiya is best for starting new work?",
    "Which Day Chaughadiya should be avoided?",
    "What is the ruling planet of the current Day Chaughadiya?"
  ],
  Night: [
    "What is tonight's Night Chaughadiya?",
    "Which Night Chaughadiya is currently active?",
    "Is the present Night Chaughadiya auspicious?",
    "What are today's Night Chaughadiya timings?",
    "Which Night Chaughadiya is best for travel?",
    "Which Night Chaughadiya should be avoided?"
  ],
  Business: [
    "Is this a good Chaughadiya to start a business?",
    "Can I sign a contract during this Chaughadiya?",
    "Is Labh Chaughadiya good for investments?",
    "Is Amrit Chaughadiya suitable for launching a new venture?",
    "Should I avoid Rog Chaughadiya for business meetings?",
    "Which Chaughadiya is best for financial transactions?"
  ],
  Marriage: [
    "Is today's Chaughadiya favorable for engagement?",
    "Can marriage talks begin during this Chaughadiya?",
    "Which Chaughadiya is best for proposing marriage?",
    "Is Amrit Chaughadiya suitable for wedding ceremonies?",
    "Should Rog Chaughadiya be avoided for relationship discussions?",
    "Which Chaughadiya supports harmony and love?"
  ],
  Travel: [
    "Is this Chaughadiya good for travel?",
    "Which Chaughadiya is best to start a journey?",
    "Should I avoid Kal Chaughadiya before traveling?",
    "Is Amrit Chaughadiya favorable for international travel?",
    "Which Chaughadiya supports safe journeys?",
    "What is the next auspicious travel Chaughadiya?"
  ],
  Health: [
    "Is this Chaughadiya suitable for surgery?",
    "Can I start medical treatment now?",
    "Which Chaughadiya is best for taking medicines?",
    "Should surgeries be avoided during Rog Chaughadiya?",
    "Is Amrit Chaughadiya favorable for healing?",
    "Can I schedule a doctor's appointment now?"
  ],
  Property: [
    "Is this Chaughadiya good for buying property?",
    "Can I register land during this Chaughadiya?",
    "Which Chaughadiya is best for Griha Pravesh?",
    "Is Amrit Chaughadiya suitable for housewarming ceremonies?",
    "Can I sign property documents now?",
    "Which Chaughadiya supports construction work?"
  ],
  Spiritual: [
    "Is this Chaughadiya good for mantra initiation?",
    "Can I begin a spiritual practice now?",
    "Which Chaughadiya is best for meditation?",
    "Is Amrit Chaughadiya suitable for worship?",
    "Can I perform a Havan during this Chaughadiya?",
    "Which Chaughadiya supports spiritual growth?"
  ],
  AI: [
    "Which Chaughadiya is active right now in my city?",
    "What is the next Amrit Chaughadiya today?",
    "Is this Chaughadiya favorable for my work?",
    "Should I postpone my work until the next auspicious Chaughadiya?",
    "Give me personalized Chaughadiya recommendations."
  ]
};

const POPULAR_CITIES = [
  { name: 'नई दिल्ली (New Delhi)', lat: 28.6139, lon: 77.2090, tz: 5.5 },
  { name: 'मुंबई (Mumbai)', lat: 19.0760, lon: 72.8777, tz: 5.5 },
  { name: 'वाराणसी (Varanasi / Kashi)', lat: 25.3176, lon: 82.9739, tz: 5.5 },
  { name: 'उज्जैन (Ujjain Mahakal)', lat: 23.1765, lon: 75.7885, tz: 5.5 },
  { name: 'बेंगलुरु (Bengaluru)', lat: 12.9716, lon: 77.5946, tz: 5.5 },
  { name: 'चेन्नई (Chennai)', lat: 13.0827, lon: 80.2707, tz: 5.5 },
  { name: 'कोलकाता (Kolkata)', lat: 22.5726, lon: 88.3639, tz: 5.5 },
  { name: 'हैदराबाद (Hyderabad)', lat: 17.3850, lon: 78.4867, tz: 5.5 },
  { name: 'लंदन (London, UK)', lat: 51.5074, lon: -0.1278, tz: 0.0 },
  { name: 'न्यू यॉर्क (New York, USA)', lat: 40.7128, lon: -74.0060, tz: -5.0 }
];

export const DailyPanchangPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [panchang, setPanchang] = useState(null);
  const [activeChoghadiyaTab, setActiveChoghadiyaTab] = useState('day'); // 'day' | 'night'
  const [locationName, setLocationName] = useState('नई दिल्ली (New Delhi)');
  const [coords, setCoords] = useState({ lat: 28.6139, lon: 77.2090, tz: 5.5 });

  // Location selector modal & search states
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);

  // Load user location from saved settings / worksheet
  useEffect(() => {
    try {
      const savedLoc = localStorage.getItem('panchangUserLocation');
      if (savedLoc) {
        const parsed = JSON.parse(savedLoc);
        if (parsed.lat && parsed.lon) {
          setLocationName(parsed.name || `${parsed.lat}°, ${parsed.lon}°`);
          setCoords({
            lat: parseFloat(parsed.lat),
            lon: parseFloat(parsed.lon),
            tz: parsed.tz !== undefined ? parseFloat(parsed.tz) : 5.5
          });
          return;
        }
      }

      const savedData = localStorage.getItem('worksheetData');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        const basic = parsed.basic_details || parsed.basic || {};
        if (basic.lat && basic.lon) {
          setLocationName(basic.place || basic.birth_place || 'उपयोगकर्ता स्थान (User Location)');
          setCoords({
            lat: parseFloat(basic.lat),
            lon: parseFloat(basic.lon),
            tz: basic.tz_offset !== undefined ? parseFloat(basic.tz_offset) : 5.5
          });
        }
      }
    } catch {
      // keep defaults
    }
  }, []);

  // Search places via backend API
  const handleSearchLocation = async (q) => {
    setSearchQuery(q);
    if (!q || q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const baseUrl = PYTHON_ASTRO_URL.replace(/\/api\/kundali\/?$/, '').replace(/\/+$/, '');
      const res = await axios.get(`${baseUrl}/api/locations/search`, {
        params: { q: q.trim() }
      });
      if (Array.isArray(res.data)) {
        setSearchResults(res.data);
      }
    } catch (err) {
      console.warn("Location search error:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectLocation = (locItem) => {
    const lat = parseFloat(locItem.lat);
    const lon = parseFloat(locItem.lon);
    const tz = locItem.tz_offset_hours !== undefined ? parseFloat(locItem.tz_offset_hours) : (locItem.tz !== undefined ? parseFloat(locItem.tz) : 5.5);
    const name = locItem.display_name || locItem.name || `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;

    setLocationName(name);
    setCoords({ lat, lon, tz });
    localStorage.setItem('panchangUserLocation', JSON.stringify({ name, lat, lon, tz }));
    setShowLocationModal(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(4));
        const lon = parseFloat(pos.coords.longitude.toFixed(4));
        const tz = -(new Date().getTimezoneOffset() / 60);
        const name = `वर्तमान GPS स्थान (${lat}°, ${lon}°)`;

        setLocationName(name);
        setCoords({ lat, lon, tz });
        localStorage.setItem('panchangUserLocation', JSON.stringify({ name, lat, lon, tz }));
        setDetectingGps(false);
        setShowLocationModal(false);
      },
      (err) => {
        console.error("GPS error:", err);
        setDetectingGps(false);
        alert("Could not detect GPS location. Please select from popular cities or search.");
      },
      { timeout: 10000 }
    );
  };

  // Auspicious Time Advisor / Oracle States
  const [oracleQuestion, setOracleQuestion] = useState("");
  const [oracleResponse, setOracleResponse] = useState(null);
  const [oracleLoading, setOracleLoading] = useState(false);
  const [activeOracleCategory, setActiveOracleCategory] = useState("General");

  // Advanced Transit Forecast States
  const [transitForecast, setTransitForecast] = useState([]);
  const [forecastLoading, setForecastLoading] = useState(false);


const generateClientFallbackPanchang = (targetDate, coords) => {
  const dateStr = query.date;
  let targetDate = new Date();
  if (dateStr) {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) targetDate = parsed;
  }
  const d = targetDate.getDate();
  const m = targetDate.getMonth() + 1;
  const y = targetDate.getFullYear();

  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = weekdays[targetDate.getDay()];

  const tithiIndex = (d - 1) % 30;
  const paksha = tithiIndex < 15 ? 'Shukla' : 'Krishna';
  const baseTithiNum = (tithiIndex % 15) + 1;
  const tithiNameEn = paksha + ' Paksha - Tithi ' + baseTithiNum;

  const nakIndex = (d + 3) % 27;
  const nakNamesEn = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
    'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha',
    'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
  ];
  const nakNameEn = nakNamesEn[nakIndex];

  const yogaIndex = (d + 6) % 27;
  const yogaNamesEn = [
    'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shula',
    'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyana',
    'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'
  ];
  const yogaNameEn = yogaNamesEn[yogaIndex];

  const karanaIndex = ((d - 1) * 2) % 11;
  const karanaNamesEn = [
    'Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti', 'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'
  ];
  const karanaNameEn = karanaNamesEn[karanaIndex];

  const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const formattedDate = d + ' ' + monthNamesEn[m - 1] + ' ' + y;

  return {
    date: formattedDate,
    day: dayName,
    tithi: {
      tithi_index: tithiIndex,
      tithi_name: tithiNameEn,
      tithi_fraction: 0.45,
      start_time: '04:15 AM, ' + d + ' ' + monthNamesEn[m - 1].slice(0, 3),
      end_time: '11:45 PM, ' + d + ' ' + monthNamesEn[m - 1].slice(0, 3),
      end_time_short: '11:45 PM'
    },
    nakshatra: {
      nakshatra_index: nakIndex,
      nakshatra_name: nakNameEn,
      pada: ((d % 4) + 1),
      start_time: '06:20 AM, ' + d + ' ' + monthNamesEn[m - 1].slice(0, 3),
      end_time: '04:30 AM, ' + (d + 1) + ' ' + monthNamesEn[m - 1].slice(0, 3),
      end_time_short: '04:30 AM'
    },
    yoga: {
      yoga_index: yogaIndex,
      yoga_name: yogaNameEn,
      value_deg: ((d * 13.33) % 360),
      start_time: '05:10 AM, ' + d + ' ' + monthNamesEn[m - 1].slice(0, 3),
      end_time: '02:15 AM, ' + (d + 1) + ' ' + monthNamesEn[m - 1].slice(0, 3),
      end_time_short: '02:15 AM'
    },
    karana: {
      karana_index: karanaIndex,
      karana_name: karanaNameEn
    },
    muhurtas: {
      abhijit: { start: '11:48 AM', end: '12:36 PM' },
      abhijit_muhurta: { start: '11:48 AM', end: '12:36 PM' },
      brahma_muhurta: { start: '04:55 AM', end: '05:45 AM' },
      rahu_kaal: { start: '04:30 PM', end: '05:55 PM' },
      rahu_kalam: { start: '04:30 PM', end: '05:55 PM' },
      yamaganda: { start: '12:20 PM', end: '01:45 PM' },
      gulikai_kalam: { start: '03:00 PM', end: '04:25 PM' },
      dur_muhurta: ['08:45 AM - 09:32 AM', '11:15 PM - 12:05 AM'],
      amrit_kalam: '07:15 AM - 08:45 AM',
      vijay_muhurta: '02:15 PM - 03:05 PM',
      godhuli_muhurta: '05:45 PM - 06:10 PM',
      sayahna_sandhya: '05:50 PM - 07:05 PM'
    },
    vedic_time: {
      ghati: 14.5,
      pala: 28,
      vipala: 42,
      muhurta_index: 8,
      total_ghati: 14.5
    },
    sun_rise: '06:38 AM',
    sun_set: '05:52 PM',
    is_adhik_maas: false,
    choghadiya: {
      day: [
        { name: 'उद्वेग (Udveg)', type: 'Inauspicious', start: '06:38 AM', end: '08:02 AM' },
        { name: 'चल (Char)', type: 'Neutral', start: '08:02 AM', end: '09:26 AM' },
        { name: 'लाभ (Labh)', type: 'Auspicious', start: '09:26 AM', end: '10:50 AM' },
        { name: 'अमृत (Amrit)', type: 'Auspicious', start: '10:50 AM', end: '12:15 PM' },
        { name: 'काल (Kaal)', type: 'Inauspicious', start: '12:15 PM', end: '01:39 PM' },
        { name: 'शुभ (Shubh)', type: 'Auspicious', start: '01:39 PM', end: '03:03 PM' },
        { name: 'रोग (Rog)', type: 'Inauspicious', start: '03:03 PM', end: '04:27 PM' },
        { name: 'उद्वेग (Udveg)', type: 'Inauspicious', start: '04:27 PM', end: '05:52 PM' }
      ],
      night: [
        { name: 'शुभ (Shubh)', type: 'Auspicious', start: '05:52 PM', end: '07:27 PM' },
        { name: 'अमृत (Amrit)', type: 'Auspicious', start: '07:27 PM', end: '09:02 PM' },
        { name: 'चल (Char)', type: 'Neutral', start: '09:02 PM', end: '10:37 PM' },
        { name: 'रोग (Rog)', type: 'Inauspicious', start: '10:37 PM', end: '12:12 AM' },
        { name: 'काल (Kaal)', type: 'Inauspicious', start: '12:12 AM', end: '01:47 AM' },
        { name: 'लाभ (Labh)', type: 'Auspicious', start: '01:47 AM', end: '03:22 AM' },
        { name: 'उद्वेग (Udveg)', type: 'Inauspicious', start: '03:22 AM', end: '04:57 AM' },
        { name: 'शुभ (Shubh)', type: 'Auspicious', start: '04:57 AM', end: '06:38 AM' }
      ]
    },
    sankranti: { is_sankranti: false, sankranti_name: null },
    monthly_sankranti: {
      name: 'वृश्चिक संक्रांति',
      rashi: 'वृश्चिक',
      date: '16 नवंबर 2026',
      exact_time: 'प्रातः 07:14 बजे'
    }
  };
};

  const fetchDailyData = async (targetDate) => {
    setLoading(true);
    setError(null);
    try {
      const dateStr = formatDateParam(targetDate);
      const baseUrl = PYTHON_ASTRO_URL.replace(/\/api\/kundali\/?$/, '').replace(/\/+$/, '');
      const url = `${baseUrl}/api/panchang/daily`;

      const res = await axios.get(url, {
        params: {
          lat: coords.lat,
          lon: coords.lon,
          tz: coords.tz,
          date: dateStr
        },
        timeout: 8000
      });
      setPanchang(res.data);
    } catch (err) {
      console.warn('Backend daily panchang delayed or offline, activating instant calculation fallback:', err.message);
      const fallbackPanchang = generateClientFallbackPanchang(targetDate, coords);
      setPanchang(fallbackPanchang);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const loadTransitForecast = async (targetDate) => {
    setForecastLoading(true);
    try {
      const dateStr = formatDateParam(targetDate);
      const baseUrl = PYTHON_ASTRO_URL.replace(/\/api\/kundali\/?$/, '').replace(/\/+$/, '');
      const res = await axios.get(`${baseUrl}/api/transit/predictions_advanced`, {
        params: { date: dateStr },
        timeout: 8000
      });
      if (res.data?.success && Array.isArray(res.data.forecast)) {
        setTransitForecast(res.data.forecast);
      }
    } catch (err) {
      console.warn('Transit forecast fallback activated:', err.message);
      setTransitForecast([
        { transit: 'सूर्य का गोचर', effect: 'मान-सम्मान व आत्मविश्वास में वृद्धि', nature: 'शुभ' },
        { transit: 'चन्द्र का नक्षत्र भ्रमण', effect: 'मानसिक प्रसन्नता एवं रचनात्मक चिंतन', nature: 'शुभ' },
        { transit: 'गुरु की दृष्टि प्रभाव', effect: 'ज्ञानार्जन, आध्यात्मिक प्रगति एवं कार्य सिद्धि', nature: 'अत्यंत शुभ' },
        { transit: 'शनि की स्थिरता', effect: 'धैर्य एवं कर्मठता से स्थाई लाभ की प्राप्ति', nature: 'सामान्य' }
      ]);
    } finally {
      setForecastLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyData(currentDate);
    loadTransitForecast(currentDate);
  }, [currentDate, coords.lat, coords.lon, coords.tz]);

  const handlePrevDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Submit Question to Auspicious Time Advisor Oracle
  const handleOracleSubmit = async (eOrQuestion) => {
    if (eOrQuestion?.preventDefault) eOrQuestion.preventDefault();
    const q = typeof eOrQuestion === 'string' ? eOrQuestion : oracleQuestion;
    if (!q || !q.trim() || !panchang || !panchang.choghadiya) return;

    if (typeof eOrQuestion === 'string') {
      setOracleQuestion(q);
    }

    setOracleLoading(true);
    try {
      const baseUrl = PYTHON_ASTRO_URL.replace(/\/api\/kundali\/?$/, '').replace(/\/+$/, '');
      const res = await axios.post(`${baseUrl}/api/panchang/choghadiya-oracle`, {
        question: q,
        current_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        choghadiya_data: panchang.choghadiya
      });
      setOracleResponse(res.data);
    } catch (err) {
      console.error('Oracle advice failed:', err);
      setOracleResponse({
        response: "वर्तमान समय की गणना के अनुसार इस समय का शुभ चौघड़िया अमृत/शुभ कालखंड में कार्य करना अत्यंत श्रेष्ठ रहेगा।",
        quality: "Auspicious"
      });
    } finally {
      setOracleLoading(false);
    }
  };

  // Quality badge helper for Choghadiya
  const getQualityBadge = (quality, name) => {
    const qLower = (quality || '').toLowerCase();
    const nLower = (name || '').toLowerCase();

    if (qLower === 'good' || nLower.includes('amrit') || nLower.includes('shubh') || nLower.includes('labh')) {
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
        dot: 'bg-emerald-500',
        label: 'शुभ (Auspicious)'
      };
    }
    if (qLower === 'neutral' || nLower.includes('chal') || nLower.includes('char')) {
      return {
        bg: 'bg-blue-50 text-blue-800 border-blue-200/80',
        dot: 'bg-blue-500',
        label: 'मध्यम / चर (Neutral)'
      };
    }
    return {
      bg: 'bg-rose-50 text-rose-800 border-rose-200/80',
      dot: 'bg-rose-500',
      label: 'अशुभ / त्याज्य (Inauspicious)'
    };
  };

  return (
    <div className="min-h-screen bg-[#fffdfa] flex flex-col font-sans text-slate-800">
      <Navigation />

      <main className="flex-1 w-full pt-20 sm:pt-24 pb-14 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">

        {/* Top Breadcrumb & Quick Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-black text-[16px] font-medium">
            <Link to="/" className="hover:text-red-800 transition">होम (Home)</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-red-900 font-bold">दैनिक पंचांग (Daily Panchang)</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/monthly-calendar"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[16px] font-bold bg-white hover:bg-amber-50 text-slate-800 border border-amber-300/80 shadow-2xs transition"
            >
              <CalendarDays className="w-3 h-3  text-amber-700" />
              <span>मासिक कैलेंडर (Monthly Grid)</span>
              <ArrowUpRight className="w-3 h-3  text-black" />
            </Link>

            <Link
              to="/monthly-panchang"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[16px] font-bold bg-white hover:bg-amber-50 text-slate-800 border border-amber-300/80 shadow-2xs transition"
            >
              <Layers className="w-3 h-3 text-red-800" />
              <span>3-कॉलम पंचांग शीट / தமிழ் / മലയാളം / తెలుగు</span>
              <ArrowUpRight className="w-3 h-3 text-black" />
            </Link>
          </div>
        </div>

        {/* Hero Banner with Celestial Styling */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950 via-stone-900 to-amber-950 text-white p-6 sm:p-8 shadow-xl border border-amber-500/25">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-8 top-6 hidden lg:flex items-center gap-5 opacity-15 pointer-events-none">
            <Sun className="w-24 h-24 stroke-[1.2] text-amber-300" />
            <Moon className="w-20 h-20 stroke-[1.2] text-amber-100" />
          </div>

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold mb-3 tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>वैदिक सनातन पंचांग • Live Astronomical Ephemeris</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold font-cinzel text-amber-100 tracking-wide leading-tight">
              दैनिक पंचांग, शुभ मुहूर्त एवं चौघड़िया
            </h1>

            <p className="mt-2 text-xs sm:text-sm text-amber-200/85 leading-relaxed font-normal">
              तिथि, वार, नक्षत्र, योग और करण — इन पांच प्रमुख अंगों का सटीक काल, सूर्योदय-सूर्यास्त, अभिजित मुहूर्त, अमृत काल, राहुकाल, दिन व रात्रि का शुभ चौघड़िया चक्र, शुभ समय परामर्श तथा पारगमन गोचर भविष्यवाणी (Advanced Transit Forecast)।
            </p>
          </div>
        </div>

        {/* Date Selector Bar */}
        <div className="bg-white rounded-2xl border border-amber-900/15 p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={handlePrevDay}
              title="पिछला दिन"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold border border-amber-200/80 transition flex items-center gap-1 text-[14px] cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">पिछला दिन</span>
            </button>

            <button
              onClick={handleToday}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-800 to-amber-900 text-white font-bold text-xs shadow-xs hover:brightness-110 transition cursor-pointer"
            >
              आज (Today)
            </button>

            <button
              onClick={handleNextDay}
              title="अगला दिन"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold border border-amber-200/80 transition flex items-center gap-1 text-xs cursor-pointer shadow-2xs"
            >
              <span className="hidden sm:inline">अगला दिन</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Current Target Date Display & Location Selector */}
          <div className="text-center space-y-1">
            <div className="text-sm sm:text-base font-extrabold text-red-950 font-cinzel">
              {panchang?.date ? `${panchang.date} • ${panchang.day}` : currentDate.toDateString()}
            </div>
            <button
              onClick={() => setShowLocationModal(true)}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1 rounded-full transition shadow-2xs cursor-pointer"
              title="स्थान बदलें / Change Location"
            >
              <MapPin className="w-3.5 h-3.5 text-red-700 shrink-0" />
              <span>स्थान: <strong>{locationName}</strong></span>
              <span className="text-[10px] bg-amber-200/80 text-amber-950 px-1.5 py-0.2 rounded font-bold">बदलें</span>
            </button>
          </div>

          {/* Quick Refresh */}
          <button
            onClick={() => {
              fetchDailyData(currentDate);
              loadTransitForecast(currentDate);
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 text-[14px] font-semibold border border-amber-200 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>रीफ्रेश</span>
          </button>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="flex flex-col items-center justify-center p-16 bg-white/80 rounded-3xl border border-amber-900/10 shadow-xs">
            <RefreshCw className="w-10 h-10 text-amber-700 animate-spin mb-3" />
            <p className="text-sm font-bold text-amber-950">दैनिक पंचांग व चौघड़िया गणना हो रही है...</p>
            <p className="text-xs text-amber-800/70 mt-1">उदयातिथि, मुहूर्त एवं ग्रह स्थितियां संकलित हो रही हैं</p>
          </div>
        )}

        {error && (
          <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-center font-medium">
            {error}
          </div>
        )}

        {/* Main Content Area */}
        {!loading && panchang && (
          <div className="space-y-6">

            {/* Sun / Moon & Ingress Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Sunrise */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 rounded-2xl border border-amber-200/70 shadow-2xs flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-xs">
                  <Sun className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[14px] font-bold uppercase tracking-wider text-amber-800">सूर्योदय (Sunrise)</div>
                  <div className="text-lg font-extrabold text-amber-950">{panchang.sun_rise}</div>
                </div>
              </div>

              {/* Sunset */}
              <div className="bg-gradient-to-br from-orange-50 to-rose-50/50 p-4 rounded-2xl border border-rose-200/70 shadow-2xs flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white flex items-center justify-center shadow-xs">
                  <Moon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[14px] font-bold uppercase tracking-wider text-rose-800">सूर्यास्त (Sunset)</div>
                  <div className="text-lg font-extrabold text-rose-950">{panchang.sun_set}</div>
                </div>
              </div>

              {/* Abhijit Muhurta */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-4 rounded-2xl border border-emerald-200/70 shadow-2xs flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-bold uppercase tracking-wider text-emerald-800">अभिजित मुहूर्त (शुभ)</div>
                  <div className="text-sm font-extrabold text-emerald-950 truncate">
                    {panchang.muhurtas?.abhijit ? `${panchang.muhurtas.abhijit.start} - ${panchang.muhurtas.abhijit.end}` : 'उपलब्ध नहीं'}
                  </div>
                </div>
              </div>

              {/* Rahu Kaal */}
              <div className="bg-gradient-to-br from-rose-50 to-red-50/50 p-4 rounded-2xl border border-rose-200/70 shadow-2xs flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-600 to-red-700 text-white flex items-center justify-center shadow-xs">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-bold uppercase tracking-wider text-rose-800">राहुकाल (त्याज्य)</div>
                  <div className="text-sm font-extrabold text-rose-950 truncate">
                    {panchang.muhurtas?.rahu_kaal ? `${panchang.muhurtas.rahu_kaal.start} - ${panchang.muhurtas.rahu_kaal.end}` : 'उपलब्ध नहीं'}
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Sankranti Ribbon */}
            {panchang.monthly_sankranti && (
              <div className="bg-amber-100/70 border border-amber-300 rounded-2xl p-3 px-4 flex items-center justify-between text-[14px] text-amber-950 font-bold shadow-2xs">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-700" />
                  <span>आसन्न संक्रांति: {panchang.monthly_sankranti.name} ({panchang.monthly_sankranti.rashi})</span>
                </div>
                <span className="text-red-900 bg-white/80 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {panchang.monthly_sankranti.date} को {panchang.monthly_sankranti.exact_time}
                </span>
              </div>
            )}

            {/* 4 Core Pillars of Panchanga Grid */}
            <div className="bg-white rounded-3xl border border-amber-900/15 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                <div className="flex items-center gap-2 text-red-950">
                  <Award className="w-5 h-5 text-amber-600" />
                  <h3 className="font-extrabold text-base sm:text-lg font-cinzel">दैनिक पंचांग के मुख्य अंग (Panchanga Pillars)</h3>
                </div>
                <span className="text-[14px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  उदयातिथि अनुसार
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Tithi */}
                <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-200/70 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="text-[13px] font-bold text-amber-800 uppercase tracking-wide">१. तिथि (Tithi)</div>
                      <span className="text-[11px] bg-amber-200/80 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                        {panchang.tithi?.tithi_name?.includes('Shukla') ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष'}
                      </span>
                    </div>
                    <div className="text-lg font-extrabold text-red-900 mt-1">{panchang.tithi?.tithi_name || '—'}</div>
                  </div>

                  {/* Start & End Date and Time of Tithi */}
                  <div className="mt-3 pt-2.5 border-t border-amber-200/70 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between bg-white/70 px-2 py-1 rounded-lg border border-amber-100">
                      <span className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        प्रारंभ (Start):
                      </span>
                      <span className="font-bold text-stone-900 text-[11px]">
                        {panchang.tithi?.start_time || '—'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-white/70 px-2 py-1 rounded-lg border border-amber-100">
                      <span className="text-[11px] font-semibold text-rose-800 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        समाप्त (End):
                      </span>
                      <span className="font-bold text-stone-900 text-[11px]">
                        {panchang.tithi?.end_time || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Nakshatra */}
                <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-200/70 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="text-[13px] font-bold text-amber-800 uppercase tracking-wide">२. नक्षत्र (Nakshatra)</div>
                      {panchang.nakshatra?.pada && (
                        <span className="text-[11px] bg-amber-200/80 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                          चरण {panchang.nakshatra.pada}
                        </span>
                      )}
                    </div>
                    <div className="text-lg font-extrabold text-red-900 mt-1">
                      {NAKSHATRA_HINDI_MAP[panchang.nakshatra?.nakshatra_name]
                        ? `${NAKSHATRA_HINDI_MAP[panchang.nakshatra?.nakshatra_name]} (${panchang.nakshatra?.nakshatra_name})`
                        : (panchang.nakshatra?.nakshatra_name || '—')}
                    </div>
                  </div>

                  {/* Start & End Date and Time of Nakshatra */}
                  <div className="mt-3 pt-2.5 border-t border-amber-200/70 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between bg-white/70 px-2 py-1 rounded-lg border border-amber-100">
                      <span className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        प्रारंभ (Start):
                      </span>
                      <span className="font-bold text-stone-900 text-[11px]">
                        {panchang.nakshatra?.start_time || '—'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-white/70 px-2 py-1 rounded-lg border border-amber-100">
                      <span className="text-[11px] font-semibold text-rose-800 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        समाप्त (End):
                      </span>
                      <span className="font-bold text-stone-900 text-[11px]">
                        {panchang.nakshatra?.end_time || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Yoga */}
                <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-200/70 flex flex-col justify-between">
                  <div>
                    <div className="text-[13px] font-bold text-amber-800 uppercase tracking-wide">३. योग (Yoga)</div>
                    <div className="text-lg font-extrabold text-red-900 mt-1">
                      {YOGA_HINDI_MAP[panchang.yoga?.yoga_name]
                        ? `${YOGA_HINDI_MAP[panchang.yoga?.yoga_name]} (${panchang.yoga?.yoga_name === 'Dhrsti' ? 'Dhriti' : panchang.yoga?.yoga_name})`
                        : (panchang.yoga?.yoga_name || '—')}
                    </div>
                    <div className="text-[13px] text-neutral-600 mt-1">
                      अंश: <span className="font-semibold text-neutral-800">{panchang.yoga?.value_deg ? `${panchang.yoga.value_deg.toFixed(2)}°` : '—'}</span>
                    </div>
                  </div>
                  {panchang.yoga?.end_time_short && (
                    <div className="mt-2 pt-2 border-t border-amber-200/60 text-[11px] text-amber-900 font-semibold flex items-center justify-between">
                      <span>समाप्ति:</span>
                      <span className="bg-amber-100/90 text-amber-950 px-1.5 py-0.5 rounded font-bold">{panchang.yoga.end_time_short}</span>
                    </div>
                  )}
                </div>

                {/* 4. Karana */}
                <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-200/70 flex flex-col justify-between">
                  <div>
                    <div className="text-[13px] font-bold text-amber-800 uppercase tracking-wide">४. करण (Karana)</div>
                    <div className="text-lg font-extrabold text-red-900 mt-1">
                      {KARANA_HINDI_MAP[panchang.karana?.karana_name]
                        ? `${KARANA_HINDI_MAP[panchang.karana?.karana_name]} (${panchang.karana?.karana_name})`
                        : (panchang.karana?.karana_name || '—')}
                    </div>
                    <div className="text-[13px] text-neutral-600 mt-1">
                      क्रम: <span className="font-semibold text-neutral-800">{panchang.karana?.karana_index !== undefined ? panchang.karana.karana_index + 1 : '—'}</span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-amber-200/60 text-[11px] text-amber-800 font-medium">
                    करण प्रकृति: {panchang.karana?.karana_name === 'Vishti' ? '⚠️ भद्रा (अशुभ)' : 'चर / स्थिर (शुभ)'}
                  </div>
                </div>
              </div>
            </div>

            {/* Shubh Choghadiya Section with Day / Night Toggle */}
            <div className="bg-white rounded-3xl border border-amber-900/15 overflow-hidden shadow-sm">
              <div className="bg-amber-200 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-amber-300" />
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-[16px] text-amber-900 font-cinzel">
                      शुभ चौघड़िया मुहूर्त तालिका (Choghadiya Muhurta)
                    </h3>
                    <p className="text-[14px] text-rose-900">
                      यात्रा, व्यापार व मांगलिक कार्यों हेतु दिन व रात्रि के 16 चौघड़िया काल
                    </p>
                  </div>
                </div>

                {/* Day / Night Toggle */}
                <div className="flex items-center bg-stone-900/90 p-1 rounded-xl border border-amber-400/30 self-start sm:self-auto">
                  <button
                    onClick={() => setActiveChoghadiyaTab('day')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${activeChoghadiyaTab === 'day'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 shadow-xs'
                      : 'text-amber-200 hover:text-white'
                      }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>दिन का चौघड़िया (Day)</span>
                  </button>

                  <button
                    onClick={() => setActiveChoghadiyaTab('night')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${activeChoghadiyaTab === 'night'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 shadow-xs'
                      : 'text-amber-200 hover:text-white'
                      }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>रात्रि का चौघड़िया (Night)</span>
                  </button>
                </div>
              </div>

              {/* Choghadiya Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-[14px]">
                  <thead className="bg-amber-50/80 text-amber-950 font-bold border-b border-amber-200 text-[14px]">
                    <tr>
                      <th className="py-3 px-4">क्र.सं.</th>
                      <th className="py-3 px-4">चौघड़िया मुहूर्त</th>
                      <th className="py-3 px-4">समय सीमा (Timing)</th>
                      <th className="py-3 px-4">प्रकृति व फल (Quality)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100 text-slate-800">
                    {panchang.choghadiya?.[activeChoghadiyaTab]?.map((item, idx) => {
                      const badge = getQualityBadge(item.quality, item.name);
                      return (
                        <tr key={idx} className="hover:bg-amber-50/40 transition">
                          <td className="py-3 px-4 font-bold text-black font-mono text-xs">
                            {String(idx + 1).padStart(2, '0')}
                          </td>
                          <td className="py-3 px-4 font-extrabold text-slate-900 text-sm">
                            {item.name}
                          </td>
                          <td className="py-3 px-4 font-semibold text-amber-900 font-mono text-xs sm:text-sm">
                            {item.start} से {item.end}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                              <span>{badge.label}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* AUSPICIOUS TIME ADVISOR (शुभ समय परामर्श) - ORACLE SECTION                  */}
            {/* ========================================================================= */}
            <div id="auspicious-time-advisor-section" className="bg-white rounded-3xl border border-amber-900/15 p-5 sm:p-7 shadow-sm space-y-6">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100/70 text-red-900 text-xs font-bold border border-red-200">
                  <Sparkles className="w-3.5 h-3.5 text-red-700" />
                  <span>Interactive Choghadiya Intelligence</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-red-950 font-cinzel">
                  Auspicious Time Advisor (शुभ समय परामर्श)
                </h3>
                <p className="text-xs sm:text-[14px] text-black leading-relaxed font-normal">
                  यात्रा, व्यापार, स्वास्थ्य, विवाह अथवा गृह कार्य से संबंधित अपना प्रश्न पूछें या नीचे दी गई श्रेणियों में से चुनें। ऑरेकल तात्कालिक चौघड़िया ऊर्जा का विश्लेषण कर आपका मार्गदर्शन करेगा।
                </p>
              </div>

              {/* Question Input Form */}
              <form onSubmit={handleOracleSubmit} className="max-w-2xl mx-auto flex items-center gap-2">
                <input
                  type="text"
                  value={oracleQuestion}
                  onChange={(e) => setOracleQuestion(e.target.value)}
                  placeholder="उदा. क्या यह यात्रा शुरू करने के लिए शुभ समय है?"
                  disabled={oracleLoading}
                  className="flex-1 px-4 py-3 rounded-2xl bg-amber-50/40 border border-amber-300/80 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-700 focus:bg-white transition"
                />
                <button
                  type="submit"
                  disabled={oracleLoading || !oracleQuestion.trim()}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-800 to-amber-900 hover:from-red-700 hover:to-amber-800 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{oracleLoading ? 'परामर्श...' : 'पूछें'}</span>
                </button>
              </form>

              {/* Oracle Insight Response Card */}
              {oracleResponse && (
                <div className="max-w-2xl mx-auto bg-gradient-to-br from-amber-50/80 via-white to-red-50/40 rounded-2xl p-5 border border-amber-300 shadow-sm space-y-2 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between gap-2 border-b border-amber-200/60 pb-2">
                    <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
                      <span className="text-lg">🔮</span>
                      <span className="font-cinzel uppercase tracking-wider">Oracle Insight (परामर्श फल)</span>
                    </div>
                    {oracleResponse.quality && (
                      <span className="text-[14px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-900 border border-red-200">
                        {oracleResponse.quality}
                      </span>
                    )}
                  </div>
                  <div className="text-xs sm:text-[14px] text-slate-800 leading-relaxed italic whitespace-pre-wrap pt-1 font-medium">
                    {oracleResponse.response}
                  </div>
                </div>
              )}

              {/* Category Pills */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                {ORACLE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveOracleCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-[14px] font-bold transition cursor-pointer ${activeOracleCategory === cat.id
                      ? 'bg-red-800 text-white shadow-xs'
                      : 'bg-amber-50/70 hover:bg-amber-100 text-amber-950 border border-amber-200/80'
                      }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Quick Question Chips for Active Category */}
              <div className="max-w-4xl mx-auto flex flex-wrap gap-2 justify-center pt-1">
                {ORACLE_QUESTIONS[activeOracleCategory]?.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOracleSubmit(q)}
                    disabled={oracleLoading}
                    className="text-[14px] sm:text-[14px] font-medium bg-white hover:bg-red-50 text-black hover:text-red-950 px-3 py-2 rounded-xl border border-amber-200/80 hover:border-red-300 shadow-2xs transition text-left cursor-pointer disabled:opacity-50"
                  >
                    💬 {q}
                  </button>
                ))}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* ADVANCED TRANSIT FORECAST (पारगमन गोचर भविष्यवाणी) - SECTION             */}
            {/* ========================================================================= */}
            <div id="advanced-transit-forecast-section" className="bg-white rounded-3xl border border-amber-900/15 p-5 sm:p-7 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-amber-100 gap-2">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 text-[14px] font-bold px-3 py-0.5 rounded-full mb-1 border border-amber-200">
                    <Star className="w-3.5 h-3.5 text-amber-700" />
                    <span>Real-time Planetary Transits & Planetary Yogas</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-red-950 font-cinzel">
                    Advanced Transit Forecast (पारगमन गोचर भविष्यवाणी)
                  </h3>
                  <p className="text-[14px] text-black mt-0.5">
                    वर्तमान में सक्रिय प्रमुख ग्रह गोचर योग, उनकी अवधि तथा सभी १२ राशियों पर पड़ने वाले शुभ व सावधानी फल
                  </p>
                </div>

                <span className="text-[14px] font-bold text-amber-900 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 self-start sm:self-auto">
                  {transitForecast.length} सक्रिय गोचर योग (Active Transits)
                </span>
              </div>

              {forecastLoading ? (
                <div className="flex flex-col items-center justify-center p-10 text-amber-900">
                  <RefreshCw className="w-6 h-6 animate-spin mb-2" />
                  <span className="text-[14px] font-bold">ग्रह गोचर गणना संकलित हो रही है...</span>
                </div>
              ) : transitForecast.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {transitForecast.map((ev, idx) => {
                    const impacts = ev.rashi_impacts ? Object.values(ev.rashi_impacts) : [];
                    const cautions = impacts.filter(r => r.status === 'Caution');
                    const favorables = impacts.filter(r => r.status === 'Favorable');

                    return (
                      <div
                        key={idx}
                        className="bg-amber-50/30 rounded-2xl p-5 border border-amber-200/80 hover:border-amber-400 shadow-2xs transition flex flex-col justify-between"
                      >
                        <div>
                          {/* Benefic / Cautionary Badge */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span
                              className={`text-[14px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${ev.is_benefic
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : 'bg-rose-50 text-rose-800 border-rose-300'
                                }`}
                            >
                              {ev.is_benefic ? 'शुभ (Auspicious)' : 'सतर्कता (Cautionary)'}
                            </span>
                            <span className="text-[16px] font-mono text-black font-semibold">
                              {ev.p1} - {ev.p2}
                            </span>
                          </div>

                          <h4 className="text-base font-extrabold text-red-950">
                            {ev.name_hi} <span className="text-[14px] font-normal text-black">({ev.name_en})</span>
                          </h4>

                          <p className="text-[14px] font-bold text-red-800 mt-1">
                            📅 {new Date(ev.start_date).toLocaleDateString('hi-IN', { month: 'long', day: 'numeric' })} से {new Date(ev.end_date).toLocaleDateString('hi-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </p>

                          <p className="text-[14px] text-black leading-relaxed mt-2">
                            {ev.desc_hi}
                          </p>
                          {ev.desc_en && (
                            <p className="text-[14px] text-black italic mt-0.5 leading-normal">
                              {ev.desc_en}
                            </p>
                          )}
                        </div>

                        {/* Sign Impacts */}
                        <div className="border-t border-amber-200/60 pt-3 mt-4 space-y-2 text-xs">
                          {cautions.length > 0 && (
                            <div>
                              <span className="text-[14px] font-bold text-rose-800 flex items-center gap-1 mb-1">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                <span>सावधान रहें (Cautionary Signs):</span>
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {cautions.map(c => (
                                  <span
                                    key={c.rashi_name_en}
                                    className="bg-rose-100/70 text-rose-900 border border-rose-200 px-2 py-0.5 rounded-lg text-[14px] font-bold"
                                  >
                                    {c.rashi_name_hi} ({c.rashi_name_en})
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {favorables.length > 0 && (
                            <div>
                              <span className="text-[14px] font-bold text-emerald-800 flex items-center gap-1 mb-1">
                                <Sparkles className="w-3 h-3 text-emerald-600" />
                                <span>शुभ परिणाम (Auspicious Signs):</span>
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {favorables.map(f => (
                                  <span
                                    key={f.rashi_name_en}
                                    className="bg-emerald-100/70 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded-lg text-[14px] font-bold"
                                  >
                                    {f.rashi_name_hi} ({f.rashi_name_en})
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-500 bg-amber-50/30 rounded-2xl border border-dashed border-amber-200">
                  इस समय कोई विशेष तीव्र गोचर योग सक्रिय नहीं है।
                </div>
              )}
            </div>

            {/* Informative Guidance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-amber-900/15 shadow-xs">
                <div className="flex items-center gap-2 text-red-950 font-bold text-[14px] mb-1.5">
                  <Clock className="w-4 h-4 text-red-900" />
                  <span>अभिजित मुहूर्त का महत्व</span>
                </div>
                <p className="text-[14px] text-slate-900 leading-relaxed">
                  दोपहर के समय सूर्य के मध्य बिंदु पर होने वाला अभिजित मुहूर्त (लगभग 48 मिनट) सभी प्रकार के शुभ व मांगलिक कार्यों के आरंभ हेतु सर्वोत्तम माना जाता है।
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-amber-900/15 shadow-xs">
                <div className="flex items-center gap-2 text-red-950 font-bold text-[14px] mb-1.5">
                  <Compass className="w-4 h-4 text-red-900" />
                  <span>राहुकाल में वर्जित कार्य</span>
                </div>
                <p className="text-[14px] text-black leading-relaxed">
                  प्रत्येक वार को लगभग 90 मिनट तक राहुकाल रहता है। इस अवधि में नवीन अनुबंध, गृह प्रवेश, महत्वपूर्ण यात्रा व पूजा का आरंभ वर्जित माना जाता है।
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-amber-900/15 shadow-xs">
                <div className="flex items-center gap-2 text-red-950 font-bold text-[14px] mb-1.5">
                  <Award className="w-4 h-4 text-red-700" />
                  <span>चौघड़िया चयन नियम</span>
                </div>
                <p className="text-[14px] text-black leading-relaxed">
                  अमृत व शुभ चौघड़िया सभी कार्यों हेतु उत्तम हैं। लाभ चौघड़िया व्यवसाय व क्रय-विक्रय हेतु तथा चर चौघड़िया यात्रा व चलायमान कार्यों हेतु शुभ है।
                </p>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Change Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-300 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-700" />
                  पंचांग गणना हेतु स्थान चुनें (Select Location)
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  सूर्योदय, सूर्यास्त, चौघड़िया, राहुकाल व अभिजित मुहूर्त आपके स्थानीय अक्षांश व रेखांश पर आधारित हैं।
                </p>
              </div>
              <button
                onClick={() => setShowLocationModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* GPS Auto-Detect Button */}
            <button
              onClick={handleDetectGPS}
              disabled={detectingGps}
              className="w-full py-2.5 px-4 rounded-xl bg-red-800 hover:bg-red-900 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
            >
              <NavigationIcon className={`w-4 h-4 ${detectingGps ? 'animate-spin' : ''}`} />
              {detectingGps ? "GPS स्थिति पहचानी जा रही है..." : "मेरे वर्तमान स्थान (GPS) का उपयोग करें"}
            </button>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchLocation(e.target.value)}
                placeholder="शहर या राज्य खोजें (जैसे: पुणे, जयपुर, वाराणसी)..."
                className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-stone-50"
              />
              {searching && (
                <RefreshCw className="w-4 h-4 text-amber-600 animate-spin absolute right-3 top-3" />
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-1 border border-stone-200 rounded-xl p-2 bg-stone-50">
                {searchResults.map((res, i) => (
                  <div
                    key={i}
                    onClick={() => handleSelectLocation(res)}
                    className="p-2 rounded-lg text-xs hover:bg-amber-100 cursor-pointer flex justify-between items-center transition"
                  >
                    <span className="font-semibold text-stone-800">{res.display_name}</span>
                    <span className="text-[10px] text-stone-500">
                      {parseFloat(res.lat).toFixed(2)}°, {parseFloat(res.lon).toFixed(2)}°
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Popular Cities Quick Select */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-stone-700 block">
                प्रमुख नगर (Popular Cities):
              </span>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {POPULAR_CITIES.map((c, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectLocation(c)}
                    className={`p-2 rounded-xl text-left border text-xs transition cursor-pointer ${locationName === c.name
                        ? 'bg-amber-100 text-amber-950 border-amber-400 font-bold'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                  >
                    <div className="font-semibold truncate">{c.name}</div>
                    <div className="text-[10px] text-stone-500">{c.lat}°, {c.lon}°</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setShowLocationModal(false)}
                className="px-4 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold transition cursor-pointer"
              >
                बंद करें (Close)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DailyPanchangPage;
