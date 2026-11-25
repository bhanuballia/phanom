import React, { useState, useEffect, useMemo, useRef } from 'react';
import Navigation from '../components/Navigation';
import { PYTHON_ASTRO_URL, VEDIC_ASTROLOGY_BASE_URL } from '../services/api';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Clock,
  Compass,
  Star,
  CheckCircle2,
  X,
  Layers,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  List,
  Grid,
  Download,
  Printer,
  ChevronDown,
  Info,
  ShieldAlert,
  Flame,
  MapPin,
  Search,
  Navigation as NavigationIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Days & Months Localization
const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS_HI = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const MONTHS_HI = [
  "जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून",
  "जुलाई", "अगस्त", "सितम्बर", "अक्टूबर", "नवम्बर", "दिसम्बर"
];

const POPULAR_CITIES = [
  { name: "New Delhi, India", lat: 28.6139, lon: 77.2090, tz: 5.5 },
  { name: "Mumbai, India", lat: 19.0760, lon: 72.8777, tz: 5.5 },
  { name: "Varanasi (Kashi), India", lat: 25.3176, lon: 82.9739, tz: 5.5 },
  { name: "Ujjain, India", lat: 23.1765, lon: 75.7885, tz: 5.5 },
  { name: "Bengaluru, India", lat: 12.9716, lon: 77.5946, tz: 5.5 },
  { name: "Chennai, India", lat: 13.0827, lon: 80.2707, tz: 5.5 },
  { name: "Kolkata, India", lat: 22.5726, lon: 88.3639, tz: 5.5 },
  { name: "Hyderabad, India", lat: 17.3850, lon: 78.4867, tz: 5.5 },
  { name: "London, UK", lat: 51.5074, lon: -0.1278, tz: 0.0 },
  { name: "New York, USA", lat: 40.7128, lon: -74.0060, tz: -5.0 }
];

const EKADASHI_NAMES = {
  "Chaitra": { Krishna: "Papmochani", Shukla: "Kamada" },
  "Vaishakha": { Krishna: "Varuthini", Shukla: "Mohini" },
  "Jyeshtha": { Krishna: "Apara", Shukla: "Nirjala" },
  "Ashadha": { Krishna: "Yogini", Shukla: "Devshayani" },
  "Shravana": { Krishna: "Kamika", Shukla: "Shravana Putrada" },
  "Bhadrapada": { Krishna: "Aja", Shukla: "Parivartini" },
  "Ashvina": { Krishna: "Indira", Shukla: "Papankusha" },
  "Kartika": { Krishna: "Rama", Shukla: "Prabodhini" },
  "Margashirsha": { Krishna: "Utpanna", Shukla: "Mokshada" },
  "Pausha": { Krishna: "Saphala", Shukla: "Pausha Putrada" },
  "Magha": { Krishna: "Shattila", Shukla: "Jaya" },
  "Phalguna": { Krishna: "Vijaya", Shukla: "Amalaki" },
  "Adhik": { Krishna: "Parama", Shukla: "Padmini" }
};

const calculateHinduYears = (gregorianYear, gregorianMonthIndex) => {
  const isNewYearStarted = gregorianMonthIndex >= 3;
  return {
    vikramSamvat: isNewYearStarted ? gregorianYear + 57 : gregorianYear + 56,
    shakaSamvat: isNewYearStarted ? gregorianYear - 78 : gregorianYear - 79
  };
};

const getHinduMonthFromNakshatra = (nakshatraName) => {
  if (!nakshatraName) return "Unknown";
  const name = nakshatraName.toLowerCase();
  if (name.includes("chitra") || name.includes("swati")) return "Chaitra";
  if (name.includes("vishakha") || name.includes("anuradha")) return "Vaishakha";
  if (name.includes("jyeshtha") || name.includes("mula")) return "Jyeshtha";
  if (name.includes("ashadha")) return "Ashadha";
  if (name.includes("shravana") || name.includes("dhanishta") || name.includes("shatabhisha")) return "Shravana";
  if (name.includes("bhadrapada")) return "Bhadrapada";
  if (name.includes("revati") || name.includes("ashwini") || name.includes("bharani")) return "Ashvina";
  if (name.includes("krittika") || name.includes("rohini")) return "Kartika";
  if (name.includes("mrigashira") || name.includes("ardra")) return "Margashirsha";
  if (name.includes("punarvasu") || name.includes("pushya")) return "Pausha";
  if (name.includes("ashlesha") || name.includes("magha")) return "Magha";
  if (name.includes("phalguni") || name.includes("hasta")) return "Phalguna";
  return "Unknown";
};

const FESTIVALS = [
  { name: "Bhogi / Lohri", hindiName: "भोगी / लोहड़ी", match: (d, m) => m === 0 && d === 13, month: 0 },
  { name: "Makar Sankranti / Pongal", hindiName: "मकर संक्रांति / पोंगल", match: (d, m) => m === 0 && (d === 14 || d === 15), month: 0 },
  { name: "Vasant Panchami", hindiName: "वसंत पंचमी", match: (d, m, y, data, hm) => (m === 0 || m === 1) && data?.tithi?.tithi_index === 4 && String(hm).includes("Magha"), month: 1 },
  { name: "Maha Shivratri", hindiName: "महाशिवरात्रि", match: (d, m, y, data) => (m === 1 || m === 2) && data?.tithi?.tithi_index === 28, month: 1 },
  { name: "Holi", hindiName: "होली", match: (d, m, y, data, hm) => (m === 2 || m === 3) && data?.tithi?.tithi_index === 14 && String(hm).includes("Phalguna"), month: 2 },
  { name: "Chaitra Navratri / Ugadi", hindiName: "चैत्र नवरात्रि / उगादि", match: (d, m, y, data, hm) => (m === 2 || m === 3) && data?.tithi?.tithi_index === 0 && String(hm).includes("Chaitra"), month: 2 },
  { name: "Ram Navami", hindiName: "राम नवमी", match: (d, m, y, data, hm) => (m === 2 || m === 3) && data?.tithi?.tithi_index === 8 && String(hm).includes("Chaitra"), month: 3 },
  { name: "Hanuman Jayanti", hindiName: "हनुमान जयंती", match: (d, m, y, data, hm) => (m === 2 || m === 3) && data?.tithi?.tithi_index === 14 && String(hm).includes("Chaitra"), month: 3 },
  { name: "Akshaya Tritiya", hindiName: "अक्षय तृतीया", match: (d, m, y, data, hm) => (m === 3 || m === 4) && data?.tithi?.tithi_index === 2 && String(hm).includes("Vaishakha"), month: 3 },
  { name: "Nirjala Ekadashi", hindiName: "निर्जला एकादशी", match: (d, m, y, data, hm) => (m === 4 || m === 5) && data?.tithi?.tithi_index === 10 && String(hm).includes("Jyeshtha"), month: 5 },
  { name: "Guru Purnima", hindiName: "गुरु पूर्णिमा", match: (d, m, y, data, hm) => (m === 5 || m === 6) && data?.tithi?.tithi_index === 14 && String(hm).includes("Ashadha"), month: 6 },
  { name: "Nag Panchami", hindiName: "नाग पंचमी", match: (d, m, y, data, hm) => (m === 6 || m === 7) && data?.tithi?.tithi_index === 4 && String(hm).includes("Shravana"), month: 7 },
  { name: "Raksha Bandhan", hindiName: "रक्षा बंधन", match: (d, m, y, data, hm) => (m === 6 || m === 7) && data?.tithi?.tithi_index === 14 && String(hm).includes("Shravana"), month: 7 },
  { name: "Krishna Janmashtami", hindiName: "कृष्ण जन्माष्टमी", match: (d, m, y, data, hm) => (m === 7 || m === 8) && data?.tithi?.tithi_index === 22 && (String(hm).includes("Bhadrapada") || String(hm).includes("Shravana")), month: 7 },
  { name: "Ganesh Chaturthi", hindiName: "गणेश चतुर्थी", match: (d, m, y, data, hm) => (m === 7 || m === 8) && data?.tithi?.tithi_index === 3 && String(hm).includes("Bhadrapada"), month: 8 },
  { name: "Shardiya Navratri Starts", hindiName: "शारदीय नवरात्रि प्रारंभ", match: (d, m, y, data, hm) => (m === 8 || m === 9) && data?.tithi?.tithi_index === 0 && String(hm).includes("Ashvina"), month: 9 },
  { name: "Dussehra / Vijayadashami", hindiName: "दशहरा / विजयादशमी", match: (d, m, y, data, hm) => (m === 8 || m === 9 || m === 10) && data?.tithi?.tithi_index === 9 && String(hm).includes("Ashvina"), month: 9 },
  { name: "Karwa Chauth", hindiName: "करवा चौथ", match: (d, m, y, data, hm) => (m === 9 || m === 10) && data?.tithi?.tithi_index === 18 && (String(hm).includes("Ashvina") || String(hm).includes("Kartika")), month: 9 },
  { name: "Dhanteras", hindiName: "धनतेरस", match: (d, m, y, data, hm) => (m === 9 || m === 10) && data?.tithi?.tithi_index === 27 && (String(hm).includes("Ashvina") || String(hm).includes("Kartika")), month: 9 },
  { name: "Diwali / Deepavali", hindiName: "दिवाली / दीपावली", match: (d, m, y, data, hm) => (m === 9 || m === 10) && data?.tithi?.tithi_index === 29 && String(hm).includes("Kartika"), month: 9 },
  { name: "Govardhan Puja / Bhai Dooj", hindiName: "गोवर्धन पूजा / भाई दूज", match: (d, m, y, data, hm) => (m === 9 || m === 10) && (data?.tithi?.tithi_index === 0 || data?.tithi?.tithi_index === 1) && String(hm).includes("Kartika"), month: 10 },
  { name: "Chhath Puja", hindiName: "छठ पूजा", match: (d, m, y, data, hm) => (m === 9 || m === 10) && data?.tithi?.tithi_index === 5 && String(hm).includes("Kartika"), month: 10 },
  { name: "Kartik Purnima / Dev Diwali", hindiName: "कार्तिक पूर्णिमा / देव दीपावली", match: (d, m, y, data, hm) => (m === 10 || m === 11) && data?.tithi?.tithi_index === 14 && String(hm).includes("Kartika"), month: 10 },
  { name: "Mokshada Ekadashi / Gita Jayanti", hindiName: "मोक्षदा एकादशी / गीता जयंती", match: (d, m, y, data, hm) => (m === 10 || m === 11) && data?.tithi?.tithi_index === 10 && String(hm).includes("Margashirsha"), month: 11 }
];

const detectTransitYogas = (planets) => {
  if (!planets || !Array.isArray(planets)) return [];
  const zodiacOrder = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  const planetSigns = {};
  planets.forEach(p => {
    if (!p.zodiac) return;
    const sIdx = zodiacOrder.findIndex(z => z.toLowerCase().startsWith(p.zodiac.toLowerCase().slice(0, 3)));
    if (sIdx !== -1) planetSigns[p.name] = sIdx;
  });

  const activeYogas = [];
  const planetsList = ["Sun", "Mars", "Mercury", "Venus", "Jupiter", "Saturn", "Rahu", "Ketu", "Moon"];

  for (let i = 0; i < planetsList.length; i++) {
    for (let j = i + 1; j < planetsList.length; j++) {
      const p1 = planetsList[i];
      const p2 = planetsList[j];
      if (planetSigns[p1] === undefined || planetSigns[p2] === undefined) continue;

      const s1 = planetSigns[p1];
      const s2 = planetSigns[p2];
      const diff = (s2 - s1 + 12) % 12;

      // Shadashtak Yoga (6/8)
      if ((diff === 5 || diff === 7) && p1 !== "Moon" && p2 !== "Moon") {
        activeYogas.push({
          name: `षडाष्टक योग / Shadashtak (${p1}-${p2})`,
          desc: `${p1} & ${p2} in 6/8 axis; handle communication & negotiations mindfully.`,
          isBenefic: false
        });
      }
      // Dwidwadash (2/12)
      else if ((diff === 1 || diff === 11) && p1 !== "Moon" && p2 !== "Moon") {
        activeYogas.push({
          name: `द्विद्वादश योग / Dwidwadash (${p1}-${p2})`,
          desc: `${p1} & ${p2} form 2/12 relationship; plan expenses & schedule shifts carefully.`,
          isBenefic: false
        });
      }
      // Conjunctions
      else if (diff === 0) {
        if ((p1 === "Jupiter" && p2 === "Rahu") || (p1 === "Rahu" && p2 === "Jupiter")) {
          activeYogas.push({
            name: "गुरु चांडाल योग / Guru Chandal Yoga",
            desc: "Jupiter & Rahu conjoined; adhere to ethics & discernment.",
            isBenefic: false
          });
        } else if ((p1 === "Mars" && p2 === "Rahu") || (p1 === "Rahu" && p2 === "Mars") || (p1 === "Mars" && p2 === "Ketu") || (p1 === "Ketu" && p2 === "Mars")) {
          activeYogas.push({
            name: "अंगारक योग / Angarak Yoga",
            desc: "Mars with Node; channel high energy calmly & avoid rash actions.",
            isBenefic: false
          });
        } else if ((p1 === "Mercury" && p2 === "Venus") || (p1 === "Venus" && p2 === "Mercury")) {
          activeYogas.push({
            name: "लक्ष्मी नारायण योग / Lakshmi Narayan Yoga",
            desc: "Mercury & Venus united; fosters creative grace, trade acumen & harmony.",
            isBenefic: true
          });
        } else if ((p1 === "Sun" && p2 === "Mercury") || (p1 === "Mercury" && p2 === "Sun")) {
          activeYogas.push({
            name: "बुधादित्य योग / Budhaditya Yoga",
            desc: "Sun & Mercury conjunction; enhances intellect, eloquence & leadership.",
            isBenefic: true
          });
        } else if ((p1 === "Mars" && p2 === "Jupiter") || (p1 === "Jupiter" && p2 === "Mars")) {
          activeYogas.push({
            name: "गुरु-मंगल योग / Guru-Mangal Yoga",
            desc: "Jupiter & Mars in conjunction; fuels righteous ambition, energy & leadership.",
            isBenefic: true
          });
        } else if ((p1 === "Saturn" && p2 === "Rahu") || (p1 === "Rahu" && p2 === "Saturn")) {
          activeYogas.push({
            name: "श्रापित योग / Shrapit Yoga",
            desc: "Saturn & Rahu conjoined; requires patience, persistence & discipline.",
            isBenefic: false
          });
        }
      }

      // Gaja Kesari (Jupiter - Moon Kendra)
      if ((p1 === "Moon" && p2 === "Jupiter") || (p1 === "Jupiter" && p2 === "Moon")) {
        if (diff === 0 || diff === 3 || diff === 6 || diff === 9) {
          activeYogas.push({
            name: "गजकेसरी योग / Gaja Kesari Yoga",
            desc: "Moon & Jupiter in Kendra (1/4/7/10); brings auspicious blessings & wisdom.",
            isBenefic: true
          });
        }
      }
    }
  }
  return activeYogas;
};

const checkAuspiciousCeremonies = (dayData, dateStr) => {
  if (!dayData) return [];
  const nakName = dayData.nakshatra?.nakshatra_name || "";
  const tithiVal = dayData.tithi ? (dayData.tithi.tithi_index % 15) + 1 : 0;
  const dateObj = new Date(dateStr);
  const jsDay = dateObj.getDay();

  const ceremonies = [
    {
      id: "vivah",
      name: "विवाह संस्कार (Vivah Muhurt)",
      category: "Marriage",
      icon: "💍",
      nakshatras: ["Rohini", "Mrigashira", "Magha", "Hasta", "Swati", "Anuradha", "Mool", "Uttara Phalguni", "Uttara Ashadha", "Uttara Bhadrapada", "Revati"],
      tithis: [2, 3, 5, 7, 11, 13],
      days: [1, 3, 4, 5],
      desc: "Rohini/Uttara/Revati with Shubh Tithis on auspicious weekdays."
    },
    {
      id: "griha_pravesh",
      name: "गृह प्रवेश (Griha Pravesh)",
      category: "Home & Property",
      icon: "🏠",
      nakshatras: ["Rohini", "Uttara Phalguni", "Uttara Ashadha", "Uttara Bhadrapada", "Dhanishta", "Mrigashira", "Anuradha"],
      tithis: [2, 3, 5, 7, 10, 11, 12, 13],
      days: [1, 3, 4, 5],
      desc: "Fixed & gentle nakshatras suitable for housewarming & peace."
    },
    {
      id: "mundan",
      name: "मुंडन संस्कार (Mundan Muhurt)",
      category: "Sanskars",
      icon: "✂️",
      nakshatras: ["Ashwini", "Mrigashira", "Pushya", "Hasta", "Punarvasu", "Chitra", "Swati", "Jyeshtha"],
      tithis: [2, 3, 5, 7, 10, 11, 13],
      days: [1, 3, 4, 5],
      desc: "Auspicious tonsure for child vitality & sacred purification."
    },
    {
      id: "vehicle",
      name: "वाहन क्रय (Vehicle Purchase)",
      category: "Purchase & Asset",
      icon: "🚗",
      nakshatras: ["Pushya", "Punarvasu", "Swati", "Shravana", "Ashwini", "Revati", "Dhanishta", "Hasta"],
      tithis: [2, 3, 5, 7, 8, 10, 11, 12, 13],
      days: [1, 3, 4, 5],
      desc: "Chara & Kshipra nakshatras promoting speed, safety & longevity."
    },
    {
      id: "bhoomi_poojan",
      name: "भूमि पूजन व शिलान्यास (Bhoomi Poojan)",
      category: "Construction",
      icon: "🧱",
      nakshatras: ["Rohini", "Uttara Phalguni", "Uttara Ashadha", "Uttara Bhadrapada", "Hasta", "Chitra", "Swati", "Anuradha", "Shatabhisha"],
      tithis: [2, 3, 5, 7, 10, 11, 12, 13],
      days: [1, 3, 4, 5],
      desc: "Foundation laying & earth consecration for lasting stability."
    },
    {
      id: "new_shop",
      name: "दुकान व व्यापार उद्घाटन (New Shop / Business Opening)",
      category: "Business & Commerce",
      icon: "🏪",
      nakshatras: ["Pushya", "Ashwini", "Rohini", "Hasta", "Chitra", "Swati", "Anuradha", "Revati", "Shravana"],
      tithis: [2, 3, 5, 7, 10, 11, 12, 13],
      days: [1, 3, 4, 5],
      desc: "Labh & Vriddhi alignments for trade, commerce & customer growth."
    },
    {
      id: "roka",
      name: "सगाई व रोका (Roka & Sagai)",
      category: "Marriage",
      icon: "🤝",
      nakshatras: ["Ashwini", "Rohini", "Mrigashira", "Uttara Phalguni", "Hasta", "Swati", "Anuradha", "Pushya", "Shravana", "Revati"],
      tithis: [2, 3, 5, 7, 10, 11, 12, 13, 15],
      days: [1, 3, 4, 5],
      desc: "Promotes mutual agreement, harmony & prosperous union."
    },
    {
      id: "upnayan",
      name: "उपनयन / जनेऊ संस्कार (Upnayan / Sacred Thread)",
      category: "Sanskars",
      icon: "🕉️",
      nakshatras: ["Hasta", "Chitra", "Swati", "Anuradha", "Shravana", "Dhanishta", "Revati", "Pushya"],
      tithis: [2, 3, 5, 10, 11, 12],
      days: [0, 1, 3, 4, 5],
      desc: "Vedic spiritual initiation & pursuit of higher knowledge."
    },
    {
      id: "property",
      name: "संपत्ति व रजिस्ट्री क्रय (Property Registry)",
      category: "Purchase & Asset",
      icon: "📜",
      nakshatras: ["Mrigashira", "Punarvasu", "Magha", "Purva Phalguni", "Vishakha", "Mool", "Revati"],
      tithis: [2, 3, 5, 7, 10, 11, 12, 13],
      days: [1, 4, 5],
      desc: "Legal signing, deed registrations & permanent land purchases."
    }
  ];

  const results = [];
  ceremonies.forEach(c => {
    const hasNak = c.nakshatras.some(n => nakName.toLowerCase().includes(n.toLowerCase()));
    const hasTithi = c.tithis.includes(tithiVal);
    const hasDay = c.days.includes(jsDay);
    if (hasNak && hasTithi && hasDay) {
      results.push(c);
    }
  });
  return results;
};

const MonthlyCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextAdhik, setNextAdhik] = useState(null);
  const [selectedFestival, setSelectedFestival] = useState("");

  // View Mode: 'grid' vs 'list'
  const [viewMode, setViewMode] = useState('grid');

  // Side Inspector Selection (defaults to today or 1st day of month)
  const [selectedDayNumber, setSelectedDayNumber] = useState(new Date().getDate());
  const [dayTransitData, setDayTransitData] = useState(null);
  const [transitLoading, setTransitLoading] = useState(false);
  const [transitError, setTransitError] = useState(null);

  // User location states
  const [location, setLocation] = useState({
    name: "New Delhi, India",
    lat: 28.6139,
    lon: 77.2090,
    tz: 5.5
  });

  // Location selector dropdown / modal states
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);

  // Load location from saved worksheetData or localStorage if present
  useEffect(() => {
    try {
      const savedLoc = localStorage.getItem('panchangUserLocation');
      if (savedLoc) {
        const parsedLoc = JSON.parse(savedLoc);
        if (parsedLoc.lat && parsedLoc.lon) {
          setLocation(parsedLoc);
          return;
        }
      }

      const saved = localStorage.getItem('worksheetData');
      if (saved) {
        const parsed = JSON.parse(saved);
        const basic = parsed.basic_details || parsed.basic || {};
        if (basic.lat && basic.lon) {
          const loadedLoc = {
            name: basic.place || basic.birth_place || "User Worksheet Location",
            lat: parseFloat(basic.lat),
            lon: parseFloat(basic.lon),
            tz: basic.tz_offset !== undefined ? parseFloat(basic.tz_offset) : 5.5
          };
          setLocation(loadedLoc);
        }
      }
    } catch {
      // Keep default
    }
  }, []);

  // Location search helper
  const handleSearchLocation = async (q) => {
    setSearchQuery(q);
    if (!q || q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await axios.get(`${PYTHON_ASTRO_URL}/api/locations/search`, {
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
    const newLoc = {
      name: locItem.display_name || locItem.name || "Selected Location",
      lat: parseFloat(locItem.lat),
      lon: parseFloat(locItem.lon),
      tz: locItem.tz_offset_hours !== undefined ? parseFloat(locItem.tz_offset_hours) : (locItem.tz || 5.5)
    };
    setLocation(newLoc);
    localStorage.setItem('panchangUserLocation', JSON.stringify(newLoc));
    setShowLocationModal(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Browser GPS auto-detection
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
        const newLoc = {
          name: `My GPS Location (${lat}°, ${lon}°)`,
          lat,
          lon,
          tz
        };
        setLocation(newLoc);
        localStorage.setItem('panchangUserLocation', JSON.stringify(newLoc));
        setDetectingGps(false);
        setShowLocationModal(false);
      },
      (err) => {
        console.error("GPS error:", err);
        setDetectingGps(false);
        alert("Could not retrieve GPS location. Please choose from popular cities or search.");
      },
      { timeout: 10000 }
    );
  };

  // Fetch monthly Panchang as per selected location
  const loadPanchang = async () => {
    try {
      setLoading(true);
      setError(null);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1; // 1-12
      const url = `${PYTHON_ASTRO_URL}/api/panchang/monthly?lat=${location.lat}&lon=${location.lon}&tz=${location.tz}&year=${year}&month=${month}`;
      const res = await axios.get(url);
      setData(res.data);
    } catch (err) {
      console.error("Failed to load monthly panchang:", err);
      setError(err?.response?.data?.detail || err.message || "Failed to load monthly calendar data.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch next Adhik Maas
  useEffect(() => {
    const loadNextAdhikMaas = async () => {
      try {
        const res = await axios.get(`${PYTHON_ASTRO_URL}/api/panchang/next-adhik-maas`);
        if (res.data && res.data.found) {
          setNextAdhik(res.data);
        }
      } catch (err) {
        console.warn("Could not fetch next Adhik Maas:", err);
      }
    };
    loadNextAdhikMaas();
  }, []);

  // Reload when date or location changes
  useEffect(() => {
    loadPanchang();
  }, [currentDate, location.lat, location.lon, location.tz]);

  // Hindu month and metadata calculations
  const monthInfo = useMemo(() => {
    if (!data || !data.data) return null;
    const amavasyaDay = data.data.find(d => d.tithi?.tithi_index === 29);
    const purnimaDay = data.data.find(d => d.tithi?.tithi_index === 14);
    const { vikramSamvat, shakaSamvat } = calculateHinduYears(currentDate.getFullYear(), currentDate.getMonth());

    let hinduMonth = "N/A";
    if (purnimaDay && purnimaDay.nakshatra) {
      hinduMonth = getHinduMonthFromNakshatra(purnimaDay.nakshatra.nakshatra_name);
      if (purnimaDay.is_adhik_maas) {
        hinduMonth += " (Adhik)";
      }
    } else {
      const gregorianMonth = currentDate.getMonth();
      const fallbackMonths = [
        "Pausha / Magha", "Magha / Phalguna", "Phalguna / Chaitra", "Chaitra / Vaishakha",
        "Vaishakha / Jyeshtha", "Jyeshtha / Ashadha", "Ashadha / Shravana", "Shravana / Bhadrapada",
        "Bhadrapada / Ashvina", "Ashvina / Kartika", "Kartika / Margashirsha", "Margashirsha / Pausha"
      ];
      hinduMonth = fallbackMonths[gregorianMonth];
      if (data.data[0] && data.data[0].is_adhik_maas) {
        hinduMonth += " (Adhik)";
      }
    }

    return {
      vikramSamvat,
      shakaSamvat,
      hinduMonth,
      amavasyaDate: amavasyaDay ? `${amavasyaDay.day_number} ${MONTHS[currentDate.getMonth()]}` : 'N/A',
      purnimaDate: purnimaDay ? `${purnimaDay.day_number} ${MONTHS[currentDate.getMonth()]}` : 'N/A',
      boundaries: data.boundaries
    };
  }, [data, currentDate]);

  // Ekadashi list for this month
  const ekadashisList = useMemo(() => {
    if (!data || !data.data) return [];
    const baseMonth = monthInfo?.hinduMonth ? monthInfo.hinduMonth.replace(" (Adhik)", "").replace(" (Approx)", "").split(" / ")[0] : "Unknown";
    const isAdhik = monthInfo?.hinduMonth ? monthInfo.hinduMonth.includes("(Adhik)") : false;

    const list = [];
    data.data.forEach(d => {
      if (d.ekadashi_vrat_type) {
        let eName = isAdhik ? EKADASHI_NAMES["Adhik"]?.[d.ekadashi_vrat_type] : EKADASHI_NAMES[baseMonth]?.[d.ekadashi_vrat_type];
        eName = eName ? `${eName} Ekadashi` : `${d.ekadashi_vrat_type} Ekadashi`;

        const dateParts = d.date ? d.date.split('-') : [];
        const formattedDate = dateParts.length === 3
          ? `${parseInt(dateParts[2])} ${MONTHS[parseInt(dateParts[1]) - 1]} ${dateParts[0]} (${d.day})`
          : d.date;

        list.push({
          dateString: formattedDate,
          name: eName,
          timing: d.ekadashi_start && d.ekadashi_end ? `${d.ekadashi_start} – ${d.ekadashi_end}` : "Udaya Tithi Vrat"
        });
      }
    });
    return list;
  }, [data, monthInfo]);

  // Fetch Gochar Planetary Transits for the selected day in Side Inspector
  const fetchDayTransit = async (dayNumber) => {
    if (!data || !data.data) return;
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
    const dayData = data.data.find(d => d.day_number === dayNumber);

    setSelectedDayNumber(dayNumber);
    setTransitLoading(true);
    setTransitError(null);

    try {
      let bDate = "1990-01-01";
      let bTime = "12:00:00";
      let lat = location.lat;
      let lon = location.lon;
      let tz = location.tz;

      const savedData = localStorage.getItem('worksheetData');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        const basic = parsed.basic_details || parsed.basic || {};
        bDate = basic.date || basic.birth_date || bDate;
        bTime = basic.time || basic.birth_time || bTime;
      }
      if (bTime && bTime.split(':').length === 2) {
        bTime = `${bTime}:00`;
      }

      const payload = {
        birth_date: bDate,
        birth_time: bTime,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        tz_offset: parseFloat(tz),
        transit_date: dateStr,
        transit_time: "12:00:00",
        transit_tz_offset: parseFloat(tz)
      };

      const cleanBase = PYTHON_ASTRO_URL.replace(/\/api\/kundali\/?$/, '').replace(/\/+$/, '');
      const candidateUrls = [
        PYTHON_ASTRO_URL + '/api/transit/animated',
        cleanBase + '/api/transit/animated',
        'https://pinak-bdvt.onrender.com/api/transit/animated'
      ];

      let res = null;
      let lastTransitErr = null;
      for (const targetUrl of candidateUrls) {
        try {
          const attempt = await axios.post(targetUrl, payload, { timeout: 12000 });
          if (attempt?.data && (attempt.data.transit_chart || attempt.data.planets)) {
            res = attempt;
            break;
          }
        } catch (e) {
          lastTransitErr = e;
        }
      }
      if (!res) {
        throw lastTransitErr || new Error('Failed to fetch transit chart');
      }

      let lagnaName = "Aries";
      if (savedData) {
        const parsed = JSON.parse(savedData);
        lagnaName = parsed.chart?.ascendant_sign || parsed.basic?.ascendant || parsed.ascendant || "Aries";
      }

      const zodiacOrder = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
      const lagnaIndex = zodiacOrder.findIndex(z => z.toLowerCase().startsWith(lagnaName.toLowerCase().slice(0, 3))) !== -1
        ? zodiacOrder.findIndex(z => z.toLowerCase().startsWith(lagnaName.toLowerCase().slice(0, 3)))
        : 0;

      const sunData = res.data?.transit_chart?.find(p => p.planet === "Su");
      const sunLon = sunData ? sunData.absolute_degree : 0;

      const planetFullNames = {
        "Su": "Sun", "Mo": "Moon", "Ma": "Mars", "Me": "Mercury",
        "Ju": "Jupiter", "Ve": "Venus", "Sa": "Saturn", "Ra": "Rahu", "Ke": "Ketu", "Asc": "Ascendant"
      };

      const mappedPlanets = (res.data?.transit_chart || []).map(p => {
        const planetName = planetFullNames[p.planet] || p.planet;
        const planetSignIndex = zodiacOrder.findIndex(z => z.toLowerCase().startsWith((p.rashi || '').toLowerCase().slice(0, 3)));
        const transitHouse = planetSignIndex !== -1
          ? ((planetSignIndex - lagnaIndex + 12) % 12) + 1
          : "N/A";

        const isRahuKetu = p.planet === "Ra" || p.planet === "Ke";
        const motion = isRahuKetu ? "Vakri" : (p.rc === "R" ? "Vakri" : "Margi");

        let combustionState = "Uday";
        if (p.planet !== "Su" && p.planet !== "Asc" && !isRahuKetu) {
          const limits = { "Mo": 12, "Ma": 17, "Me": 14, "Ju": 11, "Ve": 10, "Sa": 15 };
          const limit = limits[p.planet] || 15;
          let diff = Math.abs(p.absolute_degree - sunLon) % 360;
          if (diff > 180) diff = 360 - diff;
          if (diff <= limit) combustionState = "Asth";
        } else if (p.planet === "Su") {
          combustionState = "Self";
        } else if (isRahuKetu) {
          combustionState = "N/A";
        }

        return {
          code: p.planet,
          name: planetName,
          house: transitHouse,
          zodiac: p.rashi,
          nakshatra: p.nakshatra,
          pada: p.pada,
          degree: parseFloat(p.degree || 0).toFixed(2),
          motion,
          combustion: combustionState
        };
      });

      setDayTransitData({
        dayNumber,
        dateStr,
        dayData,
        planets: mappedPlanets
      });
    } catch (err) {
      console.error("Error fetching transit chart:", err);
      setTransitError(err?.response?.data?.detail || err.message || "Failed to load transit data.");
    } finally {
      setTransitLoading(false);
    }
  };

  // Automatically fetch transit when calendar data is loaded or selectedDayNumber changes
  useEffect(() => {
    if (data && data.data && data.data.length > 0) {
      const validDay = data.data.some(d => d.day_number === selectedDayNumber)
        ? selectedDayNumber
        : data.data[0].day_number;
      fetchDayTransit(validDay);
    }
  }, [data, currentDate.getMonth()]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleCurrentMonth = () => {
    setCurrentDate(new Date());
    setSelectedDayNumber(new Date().getDate());
  };

  const handlePrint = () => {
    window.print();
  };

  // Render 7-Col Month Grid
  const renderGrid = () => {
    if (!data || !data.data) return null;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const gridCells = [];
    const baseMonth = monthInfo?.hinduMonth ? monthInfo.hinduMonth.replace(" (Adhik)", "").replace(" (Approx)", "").split(" / ")[0] : "Unknown";
    const isAdhik = monthInfo?.hinduMonth ? monthInfo.hinduMonth.includes("(Adhik)") : false;

    // Offset cells
    for (let i = 0; i < firstDayOfMonth; i++) {
      gridCells.push(
        <div
          key={`empty-${i}`}
          className="bg-stone-50/60 border border-stone-200/50 rounded-xl min-h-[110px] sm:min-h-[125px] opacity-40"
        />
      );
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = data.data.find(d => d.day_number === day);
      const isToday =
        year === new Date().getFullYear() &&
        month === new Date().getMonth() &&
        day === new Date().getDate();

      const isSelected = selectedDayNumber === day;
      const isAmavasya = dayData && dayData.tithi?.tithi_index === 29;
      const isPurnima = dayData && dayData.tithi?.tithi_index === 14;
      const isShuklaEkadashi = dayData && dayData.ekadashi_vrat_type === "Shukla";
      const isKrishnaEkadashi = dayData && dayData.ekadashi_vrat_type === "Krishna";

      let ekadashiName = null;
      if (isShuklaEkadashi) {
        ekadashiName = isAdhik ? EKADASHI_NAMES["Adhik"]?.Shukla : EKADASHI_NAMES[baseMonth]?.Shukla;
        ekadashiName = ekadashiName ? `${ekadashiName}` : "Ekadashi";
      } else if (isKrishnaEkadashi) {
        ekadashiName = isAdhik ? EKADASHI_NAMES["Adhik"]?.Krishna : EKADASHI_NAMES[baseMonth]?.Krishna;
        ekadashiName = ekadashiName ? `${ekadashiName}` : "Ekadashi";
      }

      let majorFestival = null;
      if (dayData) {
        const matchedFest = FESTIVALS.find(f => f.match(day, month, year, dayData, baseMonth));
        if (matchedFest) majorFestival = matchedFest.name;
      }

      gridCells.push(
        <div
          key={day}
          onClick={() => fetchDayTransit(day)}
          className={`relative p-2 rounded-xl border min-h-[110px] sm:min-h-[125px] flex flex-col justify-between transition-all duration-150 cursor-pointer ${isSelected
            ? 'bg-amber-50/90 border-amber-600 shadow-md ring-2 ring-amber-400'
            : isToday
              ? 'bg-gradient-to-b from-stone-50 to-amber-50/40 border-orange-400 shadow-xs'
              : 'bg-amber-200 hover:bg-stone-50/80 border-stone-900 hover:border-amber-400'
            }`}
        >
          {/* Day & Sun/Moon Badge */}
          <div className="flex items-start justify-between">
            <span
              className={`text-sm sm:text-[16px] font-bold font-serif px-1.5 py-0.5 rounded-md ${isToday
                ? 'bg-amber-600 text-white'
                : isSelected
                  ? 'bg-amber-900 text-amber-50'
                  : 'text-stone-900'
                }`}
            >
              {day}
            </span>

            <div className="flex items-center gap-0.5 text-[12px]">
              {isAmavasya && <span title="Amavasya (🌑)">🌑</span>}
              {isPurnima && <span title="Purnima (🌕)">🌕</span>}
              {dayData?.sun_rise && (
                <span className="text-[14px] text-amber-800 hidden sm:inline ml-0.5 font-medium">
                  {dayData.sun_rise.slice(0, 5)}
                </span>
              )}
            </div>
          </div>

          {/* Festival / Ekadashi Tag */}
          <div className="space-y-0.5 my-1">
            {majorFestival && (
              <div className="bg-red-50 text-red-700 border border-red-200 rounded px-1 py-0.5 text-[12px] font-bold truncate">
                🪔 {majorFestival}
              </div>
            )}
            {ekadashiName && (
              <div className="bg-amber-100 text-amber-900 border border-amber-300 rounded px-1 py-0.5 text-[12px] font-bold truncate">
                🌾 {ekadashiName}
              </div>
            )}
          </div>

          {/* Tithi & Nakshatra */}
          {dayData ? (
            <div className="text-[12px] text-black border-t border-stone-100 pt-1 leading-tight">
              <div className="font-semibold text-black truncate">
                {dayData.tithi?.tithi_name || "—"}
              </div>
              <div className="text-black truncate">
                {dayData.nakshatra?.nakshatra_name || "—"}
              </div>
            </div>
          ) : (
            <div className="text-[9px] text-stone-400">Loading...</div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {DAYS_OF_WEEK.map((day, idx) => (
            <div
              key={day}
              className="bg-stone-100 text-stone-900 rounded-lg py-1.5 text-center font-bold text-xs border border-orange-400"
            >
              <span className="hidden md:inline">{day}</span>
              <span className="md:hidden">{day.slice(0, 3)}</span>
              <span className="block text-[14px] text-black font-normal">
                {DAYS_HI[idx].slice(0, 3)}
              </span>
            </div>
          ))}
        </div>

        {/* 7-Col Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {gridCells}
        </div>
      </div>
    );
  };

  // Render Agenda / List View
  const renderList = () => {
    if (!data || !data.data) return null;
    const baseMonth = monthInfo?.hinduMonth ? monthInfo.hinduMonth.replace(" (Adhik)", "").replace(" (Approx)", "").split(" / ")[0] : "Unknown";

    return (
      <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
        {data.data.map(d => {
          const isSelected = selectedDayNumber === d.day_number;
          const matchedFest = FESTIVALS.find(f => f.match(d.day_number, currentDate.getMonth(), currentDate.getFullYear(), d, baseMonth));

          return (
            <div
              key={d.day_number}
              onClick={() => fetchDayTransit(d.day_number)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isSelected
                ? 'bg-amber-50/90 border-amber-600 shadow-sm ring-2 ring-amber-400'
                : 'bg-white hover:bg-stone-50 border-stone-200/90'
                }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-serif font-bold text-lg shrink-0 ${isSelected ? 'bg-amber-800 text-white' : 'bg-stone-100 text-stone-900 border border-stone-200'
                    }`}
                >
                  <span>{d.day_number}</span>
                  <span className="text-[9px] uppercase font-sans font-medium text-stone-400">
                    {d.day ? d.day.slice(0, 3) : ''}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900 text-sm">
                      {d.tithi?.tithi_name}
                    </span>
                    {d.tithi?.tithi_index === 29 && <span className="text-xs">🌑 Amavasya</span>}
                    {d.tithi?.tithi_index === 14 && <span className="text-xs">🌕 Purnima</span>}
                    {matchedFest && (
                      <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        🪔 {matchedFest.name}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-stone-500 flex flex-wrap gap-x-3 gap-y-0.5">
                    <span><strong>Nakshatra:</strong> {d.nakshatra?.nakshatra_name}</span>
                    <span><strong>Yoga:</strong> {d.yoga?.yoga_name}</span>
                    <span><strong>Karana:</strong> {d.karana?.karana_name}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center text-xs">
                {d.muhurtas?.abhijit && (
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg font-medium">
                    ✓ Abhijit: {d.muhurtas.abhijit.start}
                  </span>
                )}
                {d.muhurtas?.rahu_kaal && (
                  <span className="text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg font-medium">
                    ⚠️ Rahu: {d.muhurtas.rahu_kaal.start}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col font-sans pt-16 text-stone-900 selection:bg-amber-100 selection:text-amber-900">
      <Navigation />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-2.5">

        {/* Unified Top Control Bar */}
        <div className="bg-white rounded-2xl p-3 border border-stone-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Left: Title & Subtitle */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-300 flex items-center justify-center shrink-0">
              <CalendarIcon className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-serif font-black text-stone-950 leading-tight">
                  मासिक पंचांग व ग्रह गोचर कैलेंडर
                </h1>
                <span className="hidden sm:inline-block text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded font-semibold uppercase">
                  Almanac
                </span>
              </div>
              <p className="text-[14px] text-900 hidden sm:block">
                Sidereal Lahiri ephemeris with Tithi, Nakshatras, Ekadashi vrata & daily Gochar.
              </p>
            </div>
          </div>

          {/* Right: Actions (Daily View & Print) */}
          <div className="flex items-center gap-1.5 self-end md:self-auto shrink-0">
            <Link
              to="/daily-panchang"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-[14px] font-semibold border border-stone-300 transition"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Daily Panchang</span>
            </Link>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-2xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Compact Navigation & Filter Bar */}
        <div className="bg-orange-400 border border-amber-300/80 rounded-2xl p-2 sm:px-3 sm:py-2 flex flex-col md:flex-row items-center justify-between gap-2">
          {/* Month & Year Selectors */}
          <div className="flex items-center gap-1.5 w-full md:w-auto justify-between md:justify-start">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 px-2 rounded-lg bg-white hover:bg-stone-100 text-stone-900 border border-stone-300 transition text-xs font-bold flex items-center gap-0.5 shadow-2xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            <div className="flex items-center gap-1.5">
              <select
                value={currentDate.getMonth()}
                onChange={(e) => setCurrentDate(new Date(currentDate.getFullYear(), parseInt(e.target.value), 1))}
                className="bg-white text-stone-950 border border-stone-300 rounded-lg px-2.5 py-1 text-xs sm:text-sm font-serif font-bold focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-2xs"
              >
                {MONTHS.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m} ({MONTHS_HI[idx]})
                  </option>
                ))}
              </select>

              <select
                value={currentDate.getFullYear()}
                onChange={(e) => {
                  setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth(), 1));
                  setSelectedFestival("");
                }}
                className="bg-white text-stone-950 border border-stone-300 rounded-lg px-2 py-1 text-xs sm:text-sm font-serif font-bold focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-2xs"
              >
                {Array.from({ length: 151 }, (_, i) => 1950 + i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-1.5 px-2 rounded-lg bg-white hover:bg-stone-100 text-stone-900 border border-stone-300 transition text-xs font-bold flex items-center gap-0.5 shadow-2xs"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Location, Today, Jump Festival & Grid/List */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto justify-end">
            <button
              onClick={() => setShowLocationModal(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-stone-50 text-amber-950 border border-amber-300 transition text-xs font-semibold max-w-[170px] truncate shadow-2xs"
              title="Change Panchang Calculation Location"
            >
              <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
              <span className="truncate">{location.name}</span>
            </button>

            <button
              onClick={handleCurrentMonth}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-stone-100 text-stone-800 text-xs font-bold transition border border-stone-300 shadow-2xs"
            >
              Today
            </button>

            <select
              value={selectedFestival}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedFestival(val);
                if (val) {
                  const fest = FESTIVALS.find(f => f.name === val);
                  if (fest) {
                    setCurrentDate(new Date(currentDate.getFullYear(), fest.month, 1));
                  }
                }
              }}
              className="bg-white text-stone-900 border border-stone-300 rounded-lg px-2 py-1 text-xs font-medium focus:ring-2 focus:ring-amber-500 cursor-pointer max-w-[150px] truncate shadow-2xs"
            >
              <option value="">-- Jump Festival --</option>
              {FESTIVALS.map(f => (
                <option key={f.name} value={f.name}>
                  {f.name}
                </option>
              ))}
            </select>

            {/* Grid / List Switcher */}
            <div className="bg-white p-0.5 rounded-lg flex items-center border border-stone-300 text-xs font-semibold shadow-2xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 px-2 rounded-md transition flex items-center gap-1 ${viewMode === 'grid'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'text-stone-600 hover:text-stone-900'
                  }`}
              >
                <Grid className="w-3 h-3" />
                <span className="text-[11px]">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 px-2 rounded-md transition flex items-center gap-1 ${viewMode === 'list'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'text-stone-600 hover:text-stone-900'
                  }`}
              >

              </button>
            </div>
          </div>
        </div>

        {/* Compact Hindu Month Metadata Bar */}
        {monthInfo && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <div className="bg-yellow-300 rounded-xl p-2 border border-stone-200 text-center shadow-2xs">
              <span className="text-[12px] font-bold text-black uppercase tracking-wider block">Hindu Month</span>
              <div className="text-xs sm:text-sm font-serif font-bold text-amber-900 truncate mt-0.5">{monthInfo.hinduMonth}</div>
            </div>
            <div className="bg-rose-300 rounded-xl p-2 border border-stone-200 text-center shadow-2xs">
              <span className="text-[12px] font-bold text-black uppercase tracking-wider block">Vikram Samvat</span>
              <div className="text-xs sm:text-sm font-serif font-bold text-stone-900 mt-0.5">{monthInfo.vikramSamvat}</div>
            </div>
            <div className="bg-emerald-300 rounded-xl p-2 border border-stone-200 text-center shadow-2xs">
              <span className="text-[12px] font-bold text-black uppercase tracking-wider block">Shaka Samvat</span>
              <div className="text-xs sm:text-sm font-serif font-bold text-stone-900 mt-0.5">{monthInfo.shakaSamvat}</div>
            </div>
            <div className="bg-amber-300 rounded-xl p-2 border border-stone-200 text-center shadow-2xs">
              <span className="text-[12px] font-bold text-black uppercase tracking-wider block">Amavasya (🌑)</span>
              <div className="text-xs sm:text-sm font-serif font-bold text-stone-900 mt-0.5">{monthInfo.amavasyaDate}</div>
            </div>
            <div className="bg-purple-300 rounded-xl p-2 border border-stone-200 text-center shadow-2xs col-span-2 sm:col-span-1">
              <span className="text-[12px] font-bold text-black uppercase tracking-wider block">Purnima (🌕)</span>
              <div className="text-xs sm:text-sm font-serif font-bold text-amber-700 mt-0.5">{monthInfo.purnimaDate}</div>
            </div>
          </div>
        )}

        {/* Compact Adhik Maas Notification */}
        {nextAdhik && (
          <div className="bg-amber-500/10 border border-amber-300 rounded-xl px-3 py-1.5 text-xs text-amber-900 flex items-center gap-2 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span>
              <strong>Upcoming Adhik Maas:</strong> {getHinduMonthFromNakshatra(nextAdhik.nakshatra_name)} ({nextAdhik.date})
            </span>
          </div>
        )}

        {/* MAIN TWO-COLUMN CONTENT AREA (Grid/List Left + Side Inspector Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column (Calendar Grid or List) */}
          <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-3xl p-4 sm:p-6 border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between text-[14px] text-black pb-2 border-b border-stone-100">
              <span className="font-semibold text-orange-900">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()} &bull; Calculated for <strong className="text-amber-900">{location.name}</strong>
              </span>
              <span>Click any date to inspect details on the side &rarr;</span>
            </div>

            {loading ? (
              <div className="py-24 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
                <p className="text-sm font-semibold text-stone-800">Calculating Vedic Panchang Data for {location.name}...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-700 bg-red-50 rounded-2xl border border-red-200 text-xs">
                {error}
              </div>
            ) : viewMode === 'grid' ? (
              renderGrid()
            ) : (
              renderList()
            )}
          </div>

          {/* Right Column (Live Side Inspector) */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-20 space-y-4">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-300 shadow-md space-y-5">

              {/* Inspector Header */}
              <div className="border-b border-stone-200 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Day Inspector (दैनिक विश्लेषण)
                  </span>
                  <span className="text-[14px] text-black font-semibold font-mono">
                    {(() => {
                      if (!dayTransitData?.dateStr) return "";
                      const parts = dayTransitData.dateStr.split('-');
                      if (parts.length === 3) {
                        return `${parts[2]}-${parts[1]}-${parts[0]}`;
                      }
                      return dayTransitData.dateStr;
                    })()}
                  </span>
                </div>
                <h3 className="text-xl font-serif font-black text-stone-900 mt-2">
                  Day {selectedDayNumber} &bull; {dayTransitData?.dayData?.day || ""}
                  {dayTransitData?.dateStr && (
                    <span className="text-sm font-sans font-normal text-stone-600 ml-2">
                      ({(() => {
                        const parts = dayTransitData.dateStr.split('-');
                        return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : dayTransitData.dateStr;
                      })()})
                    </span>
                  )}
                </h3>
                <p className="text-[16px] text-black mt-0.5">
                  {dayTransitData?.dayData?.tithi?.tithi_name || "—"} &bull; {dayTransitData?.dayData?.nakshatra?.nakshatra_name || "—"}
                </p>

                {/* Nakshatra Duration (Start & End Date, Time) */}
                {dayTransitData?.dayData && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 via-indigo-50/60 to-purple-50 border border-purple-200 rounded-2xl shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-purple-950 uppercase tracking-wider">
                        <Star className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>नक्षत्र अवधि (Nakshatra Duration)</span>
                      </div>
                      <span className="text-[12px] bg-purple-200/80 text-purple-900 font-bold px-2 py-0.5 rounded-full">
                        {dayTransitData.dayData.nakshatra?.nakshatra_name || "—"}
                        {dayTransitData.dayData.nakshatra?.pada ? ` (Pada ${dayTransitData.dayData.nakshatra.pada})` : ""}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-0.5">
                      <div className="bg-white/80 border border-purple-200/70 p-2 rounded-xl">
                        <div className="text-[11px] font-semibold text-purple-700 flex items-center gap-1">
                          <span>🟢</span>
                          <span>प्रारंभ (Starts)</span>
                        </div>
                        <div className="font-bold text-stone-900 text-sm mt-0.5">
                          {dayTransitData.dayData.nakshatra_start || "—"}
                        </div>
                      </div>

                      <div className="bg-white/80 border border-purple-200/70 p-2 rounded-xl">
                        <div className="text-[11px] font-semibold text-purple-700 flex items-center gap-1">
                          <span>🔴</span>
                          <span>समाप्त (Ends)</span>
                        </div>
                        <div className="font-bold text-stone-900 text-sm mt-0.5">
                          {dayTransitData.dayData.nakshatra_end || "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Yoga & Karana of the Day */}
                {dayTransitData?.dayData && (dayTransitData.dayData.yoga || dayTransitData.dayData.karana) && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {/* Yoga Card */}
                    <div className="p-2.5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl shadow-2xs">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                        <span>🕉️</span>
                        <span>योग (Yoga)</span>
                      </div>
                      <div className="text-sm font-bold text-stone-900 mt-1 truncate">
                        {dayTransitData.dayData.yoga?.yoga_name || "—"}
                      </div>
                      <div className="text-[10px] text-amber-800/80 font-medium mt-0.5">
                        {dayTransitData.dayData.yoga?.yoga_index !== undefined ? `Index ${dayTransitData.dayData.yoga.yoga_index + 1} of 27` : "Panchang Yoga"}
                      </div>
                    </div>

                    {/* Karana Card */}
                    <div className="p-2.5 bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 rounded-2xl shadow-2xs">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-sky-900 uppercase tracking-wider">
                        <span>⚖️</span>
                        <span>करण (Karana)</span>
                      </div>
                      <div className="text-sm font-bold text-stone-900 mt-1 truncate">
                        {dayTransitData.dayData.karana?.karana_name || "—"}
                      </div>
                      <div className="text-[10px] text-sky-800/80 font-medium mt-0.5">
                        {dayTransitData.dayData.karana?.karana_index !== undefined ? `Index ${dayTransitData.dayData.karana.karana_index + 1} of 60` : "Half Tithi"}
                      </div>
                    </div>
                  </div>
                )}

                {/* Festival of Selected Date */}
                {(() => {
                  const baseMonth = monthInfo?.hinduMonth ? monthInfo.hinduMonth.replace(" (Adhik)", "").replace(" (Approx)", "").split(" / ")[0] : "Unknown";
                  const isAdhik = monthInfo?.hinduMonth ? monthInfo.hinduMonth.includes("(Adhik)") : false;
                  const dayData = dayTransitData?.dayData;

                  // 1. Ekadashi
                  let ekadashiName = null;
                  if (dayData?.ekadashi_vrat_type === "Shukla") {
                    ekadashiName = isAdhik ? EKADASHI_NAMES["Adhik"]?.Shukla : EKADASHI_NAMES[baseMonth]?.Shukla;
                    ekadashiName = ekadashiName ? `${ekadashiName} Ekadashi` : "Shukla Ekadashi";
                  } else if (dayData?.ekadashi_vrat_type === "Krishna") {
                    ekadashiName = isAdhik ? EKADASHI_NAMES["Adhik"]?.Krishna : EKADASHI_NAMES[baseMonth]?.Krishna;
                    ekadashiName = ekadashiName ? `${ekadashiName} Ekadashi` : "Krishna Ekadashi";
                  }

                  // 2. Major Hindu Festival
                  let majorFest = null;
                  if (dayData) {
                    const matched = FESTIVALS.find(f => f.match(selectedDayNumber, currentDate.getMonth(), currentDate.getFullYear(), dayData, baseMonth));
                    if (matched) majorFest = matched;
                  }

                  // 3. Moon Phase Festivals
                  const isAmavasya = dayData?.tithi?.tithi_index === 29;
                  const isPurnima = dayData?.tithi?.tithi_index === 14;

                  if (!majorFest && !ekadashiName && !isAmavasya && !isPurnima) return null;

                  return (
                    <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl shadow-2xs space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                        <span>🪔</span>
                        <span>त्यौहार व व्रत (Festival & Vrata)</span>
                      </div>

                      {majorFest && (
                        <div className="bg-red-600 text-white p-2.5 rounded-xl shadow-xs">
                          <div className="text-sm font-bold flex items-center gap-1.5">
                            <span>✨</span>
                            <span>{majorFest.name}</span>
                          </div>
                          {majorFest.hindiName && (
                            <div className="text-xs text-amber-100 font-medium mt-0.5">
                              {majorFest.hindiName}
                            </div>
                          )}
                        </div>
                      )}

                      {ekadashiName && (
                        <div className="bg-amber-100 text-amber-950 border border-amber-300 p-2 rounded-xl flex items-center justify-between text-xs font-bold">
                          <span className="flex items-center gap-1.5">
                            <span>🌾</span>
                            <span>{ekadashiName}</span>
                          </span>
                          <span className="text-[11px] bg-amber-200/80 px-2 py-0.5 rounded text-amber-900 font-semibold">
                            उदया तिथि व्रत
                          </span>
                        </div>
                      )}

                      {isPurnima && !majorFest && (
                        <div className="bg-purple-100 text-purple-950 border border-purple-300 p-2 rounded-xl flex items-center justify-between text-xs font-bold">
                          <span className="flex items-center gap-1.5">
                            <span>🌕</span>
                            <span>पूर्णिमा व्रत (Purnima Vrat / Snan)</span>
                          </span>
                          <span className="text-[11px] bg-purple-200 px-2 py-0.5 rounded text-purple-900 font-semibold">
                            Full Moon
                          </span>
                        </div>
                      )}

                      {isAmavasya && !majorFest && (
                        <div className="bg-stone-100 text-stone-900 border border-stone-300 p-2 rounded-xl flex items-center justify-between text-xs font-bold">
                          <span className="flex items-center gap-1.5">
                            <span>🌑</span>
                            <span>अमावस्या (Amavasya Snan / Pitru Tarpan)</span>
                          </span>
                          <span className="text-[11px] bg-stone-200 px-2 py-0.5 rounded text-stone-800 font-semibold">
                            New Moon
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Location indicator for timings */}
                <div className="mt-2.5 flex items-center justify-between text-[14px] bg-amber-50/70 border border-amber-200/80 rounded-xl px-2.5 py-1.5 text-amber-900">
                  <span className="flex items-center gap-1 font-medium truncate">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Location: <strong>{location.name}</strong></span>
                  </span>
                  <button
                    onClick={() => setShowLocationModal(true)}
                    className="text-amber-800 underline hover:text-amber-950 font-bold shrink-0 ml-2"
                  >
                    Change
                  </button>
                </div>
              </div>

              {transitLoading ? (
                <div className="py-12 text-center space-y-2">
                  <RefreshCw className="w-6 h-6 text-amber-600 animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-stone-700">Loading Planetary Transits...</p>
                </div>
              ) : transitError ? (
                <div className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                  {transitError}
                </div>
              ) : dayTransitData ? (
                <>
                  {/* Daily Muhurtas Timings - Fully Calculated for User Location */}
                  <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200 space-y-2 text-[14px]">
                    <div className="flex justify-between py-1 border-b border-stone-200/70">
                      <span className="text-black flex items-center gap-1">
                        <Sun className="w-3.5 h-3.5 text-amber-600" /> Sunrise (सूर्योदय):
                      </span>
                      <span className="font-semibold text-stone-900">
                        {dayTransitData.dayData?.sun_rise || "—"}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-stone-200/70">
                      <span className="text-black flex items-center gap-1">
                        <Moon className="w-3.5 h-3.5 text-purple-600" /> Sunset (सूर्यास्त):
                      </span>
                      <span className="font-semibold text-stone-900">
                        {dayTransitData.dayData?.sun_set || "—"}
                      </span>
                    </div>

                    {dayTransitData.dayData?.muhurtas?.abhijit && (
                      <div className="flex justify-between py-1 border-b border-stone-200/70">
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Abhijit Muhurta (अभिजित):
                        </span>
                        <span className="font-bold text-emerald-800">
                          {dayTransitData.dayData.muhurtas.abhijit.start} - {dayTransitData.dayData.muhurtas.abhijit.end}
                        </span>
                      </div>
                    )}

                    {dayTransitData.dayData?.muhurtas?.rahu_kaal && (
                      <div className="flex justify-between py-1">
                        <span className="text-red-600 font-semibold flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" /> Rahu Kaal (राहु काल):
                        </span>
                        <span className="font-bold text-red-700">
                          {dayTransitData.dayData.muhurtas.rahu_kaal.start} - {dayTransitData.dayData.muhurtas.rahu_kaal.end}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Auspicious Muhurtas of the Day (शुभ मुहूर्त) */}
                  {(() => {
                    const auspicious = checkAuspiciousCeremonies(
                      dayTransitData.dayData,
                      dayTransitData.dateStr
                    );

                    return (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-serif font-bold text-stone-800 flex items-center gap-1.5">
                            <span>✨</span>
                            <span>Auspicious Muhurtas of the Day (शुभ मुहूर्त)</span>
                          </span>
                          {auspicious.length > 0 && (
                            <span className="text-[11px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-2 py-0.5 rounded-full">
                              {auspicious.length} Favorable
                            </span>
                          )}
                        </div>

                        {auspicious.length === 0 ? (
                          <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-500 text-center">
                            No general major ceremony alignments (Vivah, Griha Pravesh, etc.) meeting primary panchang criteria on this date.
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                            {auspicious.map((c, i) => (
                              <div
                                key={i}
                                className="p-2.5 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50/80 to-orange-50/60 shadow-2xs hover:shadow-xs transition space-y-1"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 truncate">
                                    <span>{c.icon}</span>
                                    <span className="truncate">{c.name}</span>
                                  </div>
                                  <span className="text-[10px] font-bold text-amber-900 bg-amber-200/70 border border-amber-300 px-1.5 py-0.2 rounded shrink-0">
                                    {c.category}
                                  </span>
                                </div>
                                <p className="text-[11px] text-stone-600 leading-tight">
                                  {c.desc}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Active Transit Yogas Formed */}
                  {(() => {
                    const yogas = detectTransitYogas(dayTransitData.planets);
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-serif font-bold text-stone-800 flex items-center gap-1.5">
                            <span>🪐</span>
                            <span>Active Transit Yogas (गोचर योग)</span>
                          </span>
                          {yogas.length > 0 && (
                            <span className="text-[11px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-full">
                              {yogas.length} Formed
                            </span>
                          )}
                        </div>

                        {yogas.length === 0 ? (
                          <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-500 text-center">
                            No major conjunction, kendra, or shadashtak yogas active among transit planets on this date.
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                            {yogas.map((y, idx) => (
                              <div
                                key={idx}
                                className={`p-2.5 rounded-xl border text-xs leading-relaxed transition ${y.isBenefic
                                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 hover:bg-emerald-50'
                                  : 'bg-rose-50/70 border-rose-300 text-rose-950 hover:bg-rose-50'
                                  }`}
                              >
                                <div className="font-bold mb-0.5 flex items-center justify-between gap-1.5">
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span className={`w-2 h-2 rounded-full shrink-0 ${y.isBenefic ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                                    <span className="truncate">{y.name}</span>
                                  </div>
                                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0 ${y.isBenefic ? 'bg-emerald-200/80 text-emerald-900' : 'bg-rose-200/80 text-rose-900'}`}>
                                    {y.isBenefic ? 'शुभ' : 'अशुभ / सतर्कता'}
                                  </span>
                                </div>
                                <p className="text-[12px] opacity-90 mt-0.5">{y.desc}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Planetary Positions Table */}
                  {dayTransitData.planets && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-serif font-bold text-stone-800">
                          Planetary Positions (Gochar)
                        </span>
                        <span className="text-[13px] text-stone-900">Sidereal Lahiri</span>
                      </div>

                      <div className="max-h-60 overflow-y-auto border border-stone-200 rounded-xl bg-stone-50/50">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-stone-100 text-stone-600 font-medium text-[11px] border-b border-stone-200">
                            <tr>
                              <th className="py-1.5 px-2.5">Planet</th>
                              <th className="py-1.5 px-2">Sign</th>
                              <th className="py-1.5 px-2">Deg</th>
                              <th className="py-1.5 px-2">Motion</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-200 text-stone-800">
                            {dayTransitData.planets.map((p, idx) => (
                              <tr key={idx} className="hover:bg-amber-50/40">
                                <td className="py-1.5 px-2.5 font-semibold text-amber-950">
                                  {p.name}
                                </td>
                                <td className="py-1.5 px-2 text-black">{p.zodiac}</td>
                                <td className="py-1.5 px-2 font-mono text-[11px] text-black">{p.degree}°</td>
                                <td className="py-1.5 px-2">
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${p.motion === 'Vakri'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                      }`}
                                  >
                                    {p.motion}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-xs text-stone-400 py-6 text-center">
                  Select any date in the calendar to inspect day details.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Change Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-300 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-600" />
                  Select Location for Calculations
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Sunrise, Sunset, Rahu Kaal & Abhijit Muhurta depend on exact latitude & longitude.
                </p>
              </div>
              <button
                onClick={() => setShowLocationModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* GPS Auto-Detect Button */}
            <button
              onClick={handleDetectGPS}
              disabled={detectingGps}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition"
            >
              <NavigationIcon className={`w-4 h-4 ${detectingGps ? 'animate-spin' : ''}`} />
              {detectingGps ? "Detecting GPS Position..." : "Use My Current Device Location (GPS)"}
            </button>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchLocation(e.target.value)}
                placeholder="Search city, town, or state (e.g. Pune, Jaipur)..."
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
                Popular Cities:
              </span>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {POPULAR_CITIES.map((c, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectLocation(c)}
                    className={`p-2 rounded-xl text-left border text-xs transition ${location.name === c.name
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
                className="px-4 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyCalendar;
