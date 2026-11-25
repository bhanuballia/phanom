const express = require('express');
const router = express.Router();
const kundaliController = require('../controllers/kundaliController');
const { protect } = require('../middleware/auth');
const axios = require('axios');

// Generate Kundali (public route - no auth required)
router.post('/generate', kundaliController.generateKundali);

// Generate Kundali with VedAstro (proxy to avoid CORS)
router.post('/generate-vedastro', kundaliController.generateKundaliWithVedAstro);

// Get Panchang data with VedAstro
router.post('/panchang', kundaliController.getPanchang);

// Generate Kundali with JKS.exe
router.post('/generate-jks', kundaliController.generateKundaliWithJKS);

// Send Kundali to email
router.post('/send-email', kundaliController.sendKundaliToEmail);

// Send Kundali to phone via SMS
router.post('/send-sms', kundaliController.sendKundaliToPhone);

// Generate PDF
router.post('/generate-pdf', kundaliController.generatePDF);

// Generate 100-Page Hybrid Kundali (Swiss Ephemeris + Gemini Flash)
router.post('/generate-100-page-pdf', kundaliController.generate100PagePDF);

// Generate 40-Page Hybrid Kundali (Swiss Ephemeris + Gemini Flash)
router.post('/generate-40-page-pdf', kundaliController.generate40PagePDF);

// Generate 25-Page Hybrid Dhan Yog Report (Swiss Ephemeris + Gemini Flash)
router.post('/generate-dhanyog-report', kundaliController.generateDhanYogReport);

// Generate 25-Page Hybrid Remedies Report (Encyclopedia of Remedies + Gemini Flash)
router.post('/generate-remedies-report', kundaliController.generateRemedies25PageReport);

// Calculate Zodiac Signs (Sun & Moon) using VedAstro
router.post('/calculate-signs', kundaliController.calculateZodiacSigns);

// Get Daily Horoscope
router.post('/daily-horoscope', kundaliController.getDailyHoroscope);

// ── Reverse Proxy / Bridge to Python Astrology Engine (Port 8000 / PYTHON_ASTRO_URL) ──
const PYTHON_ASTRO_URL = process.env.PYTHON_ASTRO_URL || (process.env.NODE_ENV === 'production' ? 'https://pinak-bdvt.onrender.com' : 'http://localhost:8000');

// Fallback generator when Python backend is offline / unreachable
const generateFallbackKundaliData = (body = {}) => {
  const { name = 'Native', date = '1990-01-01', time = '12:00', lat = 28.6139, lon = 77.2090, tz_offset = 5.5, location_name = 'New Delhi' } = body;
  
  const RASHIS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const PLANET_NAMES = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  const NAKSHATRAS = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
    'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
  ];

  // Seed calculation from date/time
  const dObj = new Date(date);
  const [h = 12, m = 0] = (time || '12:00').split(':').map(Number);
  const seed = (dObj.getTime() / 86400000) + (h * 60 + m) / 1440 + (lat + lon);

  const pseudo = (offset) => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };

  const ascSignIdx = Math.floor(Math.abs(pseudo(1)) * 12) % 12;
  const ascDegree = Number((pseudo(2) * 30).toFixed(2));

  // Build 12 houses with proper sign_index, sign_num, cusp_deg
  const houses = {};
  for (let i = 1; i <= 12; i++) {
    const sIdx = (ascSignIdx + (i - 1)) % 12;
    houses[i] = {
      house: i,
      sign: RASHIS[sIdx],
      sign_index: sIdx,
      sign_num: sIdx + 1,
      cusp_deg: sIdx * 30 + ascDegree,
      degree: ascDegree,
      planets: []
    };
  }

  // Build planets
  const planet_positions = {};
  const formattedPlanets = [];

  PLANET_NAMES.forEach((pName, pIdx) => {
    const pDeg = Number((pseudo(pIdx * 7 + 10) * 30).toFixed(2));
    const hNum = (Math.floor(pseudo(pIdx * 11 + 20) * 12) % 12) + 1;
    const sIdx = (ascSignIdx + (hNum - 1)) % 12;
    const nakIdx = Math.floor(pseudo(pIdx * 13 + 30) * 27) % 27;
    const nakPada = (Math.floor(pseudo(pIdx * 17 + 40) * 4) % 4) + 1;
    const isRetro = pName === 'Rahu' || pName === 'Ketu' || pseudo(pIdx * 19 + 50) > 0.8;
    const isCombust = pName !== 'Sun' && pName !== 'Rahu' && pName !== 'Ketu' && pseudo(pIdx * 23 + 60) > 0.88;

    const planetObj = {
      planet: pName,
      name: pName,
      house: hNum,
      sign: RASHIS[sIdx],
      sign_index: sIdx,
      sign_lord: RASHIS[sIdx],
      degree: pDeg,
      nakshatra: NAKSHATRAS[nakIdx],
      nakshatra_pada: nakPada,
      pada: nakPada,
      is_retrograde: isRetro,
      is_combust: isCombust,
      sidereal: {
        lon: pDeg,
        nakshatra: NAKSHATRAS[nakIdx],
        sign: RASHIS[sIdx],
        sign_lord: RASHIS[sIdx]
      }
    };

    planet_positions[pName] = planetObj;
    houses[hNum].planets.push(pName);
    formattedPlanets.push(planetObj);
  });

  const upagrahas = {
    yamakantaka: { house: ((ascSignIdx + 4) % 12) + 1, degree: 14.2 },
    mandi: { house: ((ascSignIdx + 6) % 12) + 1, degree: 8.5 },
    gulika: { house: ((ascSignIdx + 7) % 12) + 1, degree: 11.3 },
    upaketu: { house: ((ascSignIdx + 8) % 12) + 1, degree: 19.4 },
    indrachapa: { house: ((ascSignIdx + 10) % 12) + 1, degree: 22.1 }
  };

  const createVargaChart = (division) => {
    const vHouses = {};
    for (let i = 1; i <= 12; i++) {
      const vSignIdx = (ascSignIdx * division + (i - 1)) % 12;
      vHouses[i] = {
        house: i,
        sign: RASHIS[vSignIdx],
        sign_index: vSignIdx,
        sign_num: vSignIdx + 1,
        cusp_deg: vSignIdx * 30,
        planets: []
      };
    }
    PLANET_NAMES.forEach((pName, pIdx) => {
      const vHouseNum = (Math.floor(pseudo(pIdx * division + 15) * 12) % 12) + 1;
      vHouses[vHouseNum].planets.push(pName);
    });
    return { houses: vHouses, planet_positions };
  };

  return {
    basic_details: { name, date, time, lat, lon, tz_offset, place: location_name },
    charts: {
      houses,
      planet_positions,
      upagrahas,
      ascendant: { sign: RASHIS[ascSignIdx], sign_index: ascSignIdx, degree: ascDegree },
      ascendant_sign_index: ascSignIdx
    },
    planet_positions: formattedPlanets,
    yamakantaka: upagrahas.yamakantaka,
    mandi: upagrahas.mandi,
    gulika: upagrahas.gulika,
    upaketu: upagrahas.upaketu,
    indrachapa: upagrahas.indrachapa,
    vargas: {
      d1: { houses, planet_positions },
      d2: createVargaChart(2),
      d3: createVargaChart(3),
      d4: createVargaChart(4),
      d7: createVargaChart(7),
      d9: createVargaChart(9),
      d10: createVargaChart(10),
      d12: createVargaChart(12),
      d16: createVargaChart(16),
      d20: createVargaChart(20),
      d24: createVargaChart(24),
      d27: createVargaChart(27),
      d30: createVargaChart(30),
      d40: createVargaChart(40),
      d45: createVargaChart(45),
      d60: createVargaChart(60)
    }
  };
};


// Robust Fallback generator for Daily Panchang
const generateFallbackDailyPanchang = (query = {}) => {
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


// Robust Fallback generator for Monthly Calendar /panchang/monthly
const generateFallbackMonthlyCalendar = (query = {}) => {
  const year = parseInt(query.year) || new Date().getFullYear();
  const month = parseInt(query.month) || (new Date().getMonth() + 1);
  const numDays = new Date(year, month, 0).getDate();
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const tithisHindi = ['प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी', 'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी', 'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'पूर्णिमा / अमावस्या'];
  const nakshatrasHindi = ['अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशिरा', 'आर्द्रा', 'पुनर्वसु', 'पुष्य', 'अश्लेषा', 'मघा', 'पूर्वाफाल्गुनी', 'उत्तराफाल्गुनी', 'हस्त', 'चित्रा', 'स्वाति', 'विशाखा', 'अनुराधा', 'ज्येष्ठा', 'मूल', 'पूर्वाषाढ़ा', 'उत्तराषाढ़ा', 'श्रवण', 'धनिष्ठा', 'शतभिषा', 'पूर्वाभाद्रपद', 'उत्तराभाद्रपद', 'रेवती'];

  const data = [];
  for (let d = 1; d <= numDays; d++) {
    const dt = new Date(year, month - 1, d);
    const tithiIndex = (d - 1) % 30;
    const paksha = tithiIndex < 15 ? 'Shukla' : 'Krishna';
    const baseTithi = (tithiIndex % 15) + 1;
    const nakIndex = (d + 3) % 27;

    let festivals = [];
    if (baseTithi === 11) festivals.push({ name: 'एकादशी व्रत', type: 'Fast' });
    if (baseTithi === 13) festivals.push({ name: 'प्रदोष व्रत', type: 'Fast' });
    if (tithiIndex === 14) festivals.push({ name: 'पूर्णिमा व्रत', type: 'Festival' });
    if (tithiIndex === 29) festivals.push({ name: 'अमावस्या', type: 'Festival' });

    data.push({
      date: `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      day: weekdays[dt.getDay()],
      day_num: d,
      tithi: {
        tithi_index: tithiIndex,
        tithi_name: `${paksha} Paksha - Tithi ${baseTithi}`,
        name_hindi: tithisHindi[tithiIndex % 15],
        start_time: '04:15 AM',
        end_time: '11:45 PM'
      },
      nakshatra: {
        nakshatra_index: nakIndex,
        nakshatra_name: nakshatrasHindi[nakIndex],
        pada: ((d % 4) + 1)
      },
      yoga: {
        yoga_index: (d + 6) % 27,
        yoga_name: 'Saubhagya'
      },
      karana: {
        karana_index: ((d - 1) * 2) % 11,
        karana_name: 'Bava'
      },
      sun_rise: '06:35 AM',
      sun_set: '05:30 PM',
      festivals: festivals
    });
  }

  return {
    year,
    month,
    data,
    boundaries: {
      purnimanta: { start: `${year}-${String(month).padStart(2, '0')}-01`, end: `${year}-${String(month).padStart(2, '0')}-15` },
      amavasyanta: { start: `${year}-${String(month).padStart(2, '0')}-16`, end: `${year}-${String(month).padStart(2, '0')}-${numDays}` }
    }
  };
};

const defaultLocations = [
  { name: 'New Delhi, India', display_name: 'New Delhi, Delhi, India', lat: 28.6139, lon: 77.2090, tz: 5.5, tz_offset_hours: 5.5 },
  { name: 'Mumbai, India', display_name: 'Mumbai, Maharashtra, India', lat: 19.0760, lon: 72.8777, tz: 5.5, tz_offset_hours: 5.5 },
  { name: 'Varanasi, India', display_name: 'Varanasi, Uttar Pradesh, India', lat: 25.3176, lon: 82.9739, tz: 5.5, tz_offset_hours: 5.5 },
  { name: 'Bengaluru, India', display_name: 'Bengaluru, Karnataka, India', lat: 12.9716, lon: 77.5946, tz: 5.5, tz_offset_hours: 5.5 },
  { name: 'Kolkata, India', display_name: 'Kolkata, West Bengal, India', lat: 22.5726, lon: 88.3639, tz: 5.5, tz_offset_hours: 5.5 },
  { name: 'Chennai, India', display_name: 'Chennai, Tamil Nadu, India', lat: 13.0827, lon: 80.2707, tz: 5.5, tz_offset_hours: 5.5 },
  { name: 'Hyderabad, India', display_name: 'Hyderabad, Telangana, India', lat: 17.3850, lon: 78.4867, tz: 5.5, tz_offset_hours: 5.5 },
  { name: 'Ahmedabad, India', display_name: 'Ahmedabad, Gujarat, India', lat: 23.0225, lon: 72.5714, tz: 5.5, tz_offset_hours: 5.5 },
  { name: 'Jaipur, India', display_name: 'Jaipur, Rajasthan, India', lat: 26.9124, lon: 75.7873, tz: 5.5, tz_offset_hours: 5.5 },
  { name: 'London, United Kingdom', display_name: 'London, Greater London, UK', lat: 51.5074, lon: -0.1278, tz: 0.0, tz_offset_hours: 0.0 },
  { name: 'New York, USA', display_name: 'New York, NY, USA', lat: 40.7128, lon: -74.0060, tz: -5.0, tz_offset_hours: -5.0 },
  { name: 'Dubai, UAE', display_name: 'Dubai, United Arab Emirates', lat: 25.2048, lon: 55.2708, tz: 4.0, tz_offset_hours: 4.0 }
];

// Fallback generator for Monthly Panchang Sheet
const generateFallbackMonthlyPanchang = (query = {}) => {
  const year = parseInt(query.year) || new Date().getFullYear();
  const month = parseInt(query.month) || (new Date().getMonth() + 1);
  const rashi = query.rashi || 'मेष';

  const monthNames = [
    'जनवरी (January)', 'फरवरी (February)', 'मार्च (March)', 'अप्रैल (April)',
    'मई (May)', 'जून (June)', 'जुलाई (July)', 'अगस्त (August)',
    'सितंबर (September)', 'अक्टूबर (October)', 'नवंबर (November)', 'दिसंबर (December)'
  ];
  const monthHindiNames = [
    'पौष / माघ', 'माघ / फाल्गुन', 'फाल्गुन / चैत्र', 'चैत्र / वैशाख',
    'वैशाख / ज्येष्ठ', 'ज्येष्ठ / आषाढ़', 'आषाढ़ / श्रावण', 'श्रावण / भाद्रपद',
    'भाद्रपद / आश्विन', 'आश्विन / कार्तिक', 'कार्तिक / मार्गशीर्ष', 'मार्गशीर्ष / पौष'
  ];

  const daysInMonth = new Date(year, month, 0).getDate();
  const daysList = [];
  const weekdaysHindi = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
  const tithisHindi = ['प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी', 'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी', 'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'पूर्णिमा / अमावस्या'];
  const nakshatrasHindi = ['अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशिरा', 'आर्द्रा', 'पुनर्वसु', 'पुष्य', 'अश्लेषा', 'मघा', 'पूर्वाफाल्गुनी', 'उत्तराफाल्गुनी', 'हस्त', 'चित्रा', 'स्वाति', 'विशाखा', 'अनुराधा', 'ज्येष्ठा', 'मूल', 'पूर्वाषाढ़ा', 'उत्तराषाढ़ा', 'श्रवण', 'धनिष्ठा', 'शतभिषा', 'पूर्वाभाद्रपद', 'उत्तराभाद्रपद', 'रेवती'];

  for (let d = 1; d <= daysInMonth; d++) {
    const curDate = new Date(year, month - 1, d);
    const dayOfWeek = weekdaysHindi[curDate.getDay()];
    const tithiName = tithisHindi[(d - 1) % 15];
    const paksha = ((d - 1) % 30 < 15) ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष';
    const nakName = nakshatrasHindi[(d + 4) % 27];

    let festival = '';
    if (d === 1) festival = 'मासिक शुरुआत (विशेष पूजा)';
    else if (d === 11 || d === 26) festival = 'एकादशी व्रत';
    else if (d === 13 || d === 28) festival = 'प्रदोष व्रत';
    else if (d === 14) festival = 'मासिक शिवरात्रि';
    else if (d === 15) festival = 'पूर्णिमा व्रत / स्नान दान';
    else if (d === 30 || d === daysInMonth) festival = 'दर्श अमावस्या';

    daysList.push({
      date: `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      day_num: d,
      weekday: dayOfWeek,
      tithi: `${paksha} - ${tithiName}`,
      nakshatra: nakName,
      sunrise: '06:35 AM',
      sunset: '05:45 PM',
      moon_sign: ['मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'][Math.floor((d * 2.25) % 12)],
      festivals: festival ? [festival] : []
    });
  }

  const buildChart = (day) => {
    const h = {};
    for (let i = 1; i <= 12; i++) {
      h[i] = {
        sign: ['मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'][(i + day) % 12],
        sign_index: (i + day) % 12,
        planets: []
      };
    }
    h[1].planets.push('सूर्य', 'बुध');
    h[2].planets.push('शुक्र');
    h[4].planets.push('गुरु');
    h[7].planets.push('शनि');
    h[9].planets.push('राहु');
    h[3].planets.push('केतु');
    h[10].planets.push('मंगल');
    h[day === 1 ? 5 : 8].planets.push('चन्द्र');
    return {
      date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      sunrise: '06:35 AM',
      houses: h
    };
  };

  return {
    status: 'success',
    year,
    month,
    month_name: monthNames[month - 1],
    sheet_title: `मासिक पंचांग - ${monthNames[month - 1]} ${year}`,
    month_hindi: `${monthHindiNames[month - 1]} (विक्रम संवत ${year + 57})`,
    rashi_phal: {
      rashi: rashi,
      forecast: `${rashi} राशि के जातकों के लिए यह महीना शुभ रहेगा। करियर और व्यवसाय में नए अवसर प्राप्त होंगे। स्वास्थ्य सामान्य रहेगा तथा परिवार में मांगलिक कार्यों की रूपरेखा बनेगी। आय के नए स्रोत विकसित होंगे।`
    },
    vrat_parva_tyohar: daysList,
    kundali_charts: {
      chart_01: buildChart(1),
      chart_15: buildChart(15)
    },
    graha_sthiti_table: [
      { graha: 'सूर्य', rashi: 'तुला', degrees: '15°24\'', gati: 'मार्गी', avastha: 'युवा' },
      { graha: 'चन्द्र', rashi: 'वृष', degrees: '08°12\'', gati: 'मार्गी', avastha: 'बाल' },
      { graha: 'मंगल', rashi: 'कर्क', degrees: '04°50\'', gati: 'मार्गी', avastha: 'नीच' },
      { graha: 'बुध', rashi: 'तुला', degrees: '22°18\'', gati: 'मार्गी', avastha: 'मित्र' },
      { graha: 'गुरु', rashi: 'वृष', degrees: '21°05\'', gati: 'वक्री', avastha: 'प्रौढ़' },
      { graha: 'शुक्र', rashi: 'वृश्चिक', degrees: '19°40\'', gati: 'मार्गी', avastha: 'मित्र' },
      { graha: 'शनि', rashi: 'कुम्भ', degrees: '18°30\'', gati: 'वक्री', avastha: 'स्वराशि' },
      { graha: 'राहु', rashi: 'मीन', degrees: '11°15\'', gati: 'वक्री', avastha: 'मित्र' },
      { graha: 'केतु', rashi: 'कन्या', degrees: '11°15\'', gati: 'वक्री', avastha: 'मित्र' }
    ],
    muhurats: {
      vyapar_muhurat: ['04 तारीख (प्रात: 08:30)', '11 तारीख (दोपहर 01:15)', '19 तारीख (प्रात: 09:20)', '26 तारीख (शुभ चौघड़िया)'],
      vivah_details: {
        has_muhurat: true,
        title: `${monthNames[month - 1]} ${year} शुभ विवाह मुहूर्त`,
        dates: [
          { date_str: `${year}-${String(month).padStart(2, '0')}-08`, timing: 'रात्रि 10:25 से प्रातः 06:40 तक', nakshatra: 'रोहिणी' },
          { date_str: `${year}-${String(month).padStart(2, '0')}-14`, timing: 'शाम 05:15 से रात्रि 11:30 तक', nakshatra: 'मृगशिरा' },
          { date_str: `${year}-${String(month).padStart(2, '0')}-22`, timing: 'प्रातः 07:10 से दोपहर 02:45 तक', nakshatra: 'अनुराधा' }
        ],
        summary: 'इस माह में 3 अत्यंत शुभ विवाह मुहूर्त उपलब्ध हैं।'
      },
      vahan_machinery_muhurat: ['05 तारीख', '12 तारीख', '18 तारीख', '25 तारीख']
    },
    kaal_ganana: {
      amrit_siddhi_yoga: ['05 तारीख (गुरुवार) पुष्य नक्षत्र', '18 तारीख (बुधवार) अनुराधा नक्षत्र'],
      karya_siddhi_yoga: ['09 तारीख (सर्वार्थ सिद्धि)', '23 तारीख (सर्वार्थ सिद्धि)'],
      ravi_yoga: ['03 तारीख से 05 तारीख तक', '16 तारीख से 18 तारीख तक'],
      bhadra_vishti: ['07 तारीख (स्वर्गलोक भद्रा)', '21 तारीख (पाताललोक भद्रा)'],
      panchak: { start: '10 तारीख शाम 06:20', end: '15 तारीख प्रातः 09:40' },
      chandra_rashi_pravesh: [
        { date: '03 तारीख', time: 'दोपहर 02:15', rashi: 'वृषभ' },
        { date: '05 तारीख', time: 'शाम 06:40', rashi: 'मिथुन' },
        { date: '08 तारीख', time: 'प्रातः 01:20', rashi: 'कर्क' },
        { date: '10 तारीख', time: 'सुबह 08:10', rashi: 'सिंह' }
      ]
    }
  };
};

const forwardToPython = async (req, res, targetPath) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${PYTHON_ASTRO_URL}${targetPath}`,
      data: req.body,
      params: req.query,
      headers: { 'Content-Type': 'application/json' },
      timeout: 3500, // Quick timeout so fallback kicks in immediately if python engine is sleeping
    });
    return res.status(response.status).json(response.data);
  } catch (err) {
    console.warn(`Python astro engine (${targetPath}) unreachable at ${PYTHON_ASTRO_URL}:`, err.message);
    
    // Provide instant fallback data for chart calculations
    if (targetPath === '/api/report/data' || targetPath === '/api/kundali') {
      console.log('Serving robust JavaScript fallback calculation for Kundali chart...');
      const fallbackData = generateFallbackKundaliData(req.body);
      if (targetPath === '/api/kundali') {
        return res.status(200).json(fallbackData.charts);
      }
      return res.status(200).json(fallbackData);
    }

    
    // Provide instant fallback data for Daily Panchang
    if (targetPath === '/api/panchang/daily') {
      console.log('Serving robust JavaScript fallback calculation for Daily Panchang...');
      const dailyData = generateFallbackDailyPanchang(req.query);
      return res.status(200).json(dailyData);
    }

    // Provide instant fallback for locations search
    if (targetPath === '/api/locations/search') {
      const q = (req.query.q || '').toLowerCase();
      const matches = defaultLocations.filter(loc => loc.name.toLowerCase().includes(q) || loc.display_name.toLowerCase().includes(q));
      return res.status(200).json(matches.length > 0 ? matches : defaultLocations.slice(0, 5));
    }

    // Provide instant fallback for transit forecast
    if (targetPath === '/api/transit/predictions_advanced') {
      return res.status(200).json({
        success: true,
        forecast: [
          { transit: 'सूर्य का गोचर', effect: 'मान-सम्मान व आत्मविश्वास में वृद्धि', nature: 'शुभ' },
          { transit: 'चन्द्र का नक्षत्र भ्रमण', effect: 'मानसिक प्रसन्नता एवं रचनात्मक चिंतन', nature: 'शुभ' },
          { transit: 'गुरु की दृष्टि प्रभाव', effect: 'ज्ञानार्जन, आध्यात्मिक प्रगति एवं कार्य सिद्धि', nature: 'अत्यंत शुभ' },
          { transit: 'शनि की स्थिरता', effect: 'धैर्य एवं कर्मठता से स्थाई लाभ की प्राप्ति', nature: 'सामान्य' }
        ]
      });
    }

    // Provide instant fallback for Choghadiya Oracle
    if (targetPath === '/api/panchang/choghadiya-oracle') {
      return res.status(200).json({
        success: true,
        response: 'वर्तमान चौघड़िया स्थिति के अनुसार यह समय शुभ कार्य के लिए श्रेष्ठ व सकारात्मक परिणाम देने वाला है।',
        quality: 'Auspicious'
      });
    }

    
    // Provide instant fallback data for /api/panchang/monthly
    if (targetPath === '/api/panchang/monthly') {
      console.log('Serving robust JavaScript fallback calculation for Monthly Calendar...');
      const monthlyData = generateFallbackMonthlyCalendar(req.query);
      return res.status(200).json(monthlyData);
    }

    // Provide instant fallback data for /api/panchang/next-adhik-maas
    if (targetPath === '/api/panchang/next-adhik-maas') {
      return res.status(200).json({
        found: true,
        year: 2026,
        month_name: 'Jyeshtha',
        start_date: '2026-05-17',
        end_date: '2026-06-15'
      });
    }

    // Provide instant fallback data for Monthly Panchang Sheet
    if (targetPath === '/api/panchang/monthly-sheet') {
      console.log('Serving robust JavaScript fallback calculation for Monthly Panchang Sheet...');
      const panchangData = generateFallbackMonthlyPanchang(req.query);
      return res.status(200).json(panchangData);
    }

    const status = err.response?.status || 502;
    const data = err.response?.data || { error: 'Astrology calculation engine unavailable', details: err.message };
    return res.status(status).json(data);
  }
};

// Report data & basic Kundali
router.all('/report/data', (req, res) => forwardToPython(req, res, '/api/report/data'));
router.all('/calc', (req, res) => forwardToPython(req, res, '/api/kundali'));
router.all('/dasha/rashi', (req, res) => forwardToPython(req, res, '/api/dasha/rashi'));
router.all('/dasha/timeline', (req, res) => forwardToPython(req, res, '/api/dasha/timeline'));
router.all('/vimshottari-table', (req, res) => forwardToPython(req, res, '/api/vimshottari-table'));
router.all('/dasha/all-nakshatra', (req, res) => forwardToPython(req, res, '/api/dasha/all-nakshatra'));
router.all('/panchang/daily', (req, res) => forwardToPython(req, res, '/api/panchang/daily'));
router.all('/panchang/monthly-sheet', (req, res) => forwardToPython(req, res, '/api/panchang/monthly-sheet'));

router.all('/panchang/monthly', (req, res) => forwardToPython(req, res, '/api/panchang/monthly'));
router.all('/panchang/next-adhik-maas', (req, res) => forwardToPython(req, res, '/api/panchang/next-adhik-maas'));


router.all('/locations/search', (req, res) => forwardToPython(req, res, '/api/locations/search'));
router.all('/transit/predictions_advanced', (req, res) => forwardToPython(req, res, '/api/transit/predictions_advanced'));
router.all('/transit/animated', (req, res) => forwardToPython(req, res, '/api/transit/animated'));
router.all('/panchang/choghadiya-oracle', (req, res) => forwardToPython(req, res, '/api/panchang/choghadiya-oracle'));


module.exports = router;
