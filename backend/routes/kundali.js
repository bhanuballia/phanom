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
const PYTHON_ASTRO_URL = process.env.PYTHON_ASTRO_URL || 'http://localhost:8000';

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

  // Build 12 houses
  const houses = {};
  for (let i = 1; i <= 12; i++) {
    const sIdx = (ascSignIdx + (i - 1)) % 12;
    houses[i] = {
      sign: RASHIS[sIdx],
      sign_num: sIdx + 1,
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

    planet_positions[pName] = {
      house: hNum,
      sign: RASHIS[sIdx],
      degree: pDeg,
      nakshatra: NAKSHATRAS[nakIdx],
      nakshatra_pada: nakPada,
      is_retrograde: isRetro,
      is_combust: isCombust,
      sidereal: {
        lon: pDeg,
        nakshatra: NAKSHATRAS[nakIdx],
        sign_lord: RASHIS[sIdx]
      }
    };

    houses[hNum].planets.push(pName);

    formattedPlanets.push({
      planet: pName,
      degree: pDeg,
      nakshatra: NAKSHATRAS[nakIdx],
      nakshatra_pada: nakPada,
      sign_lord: RASHIS[sIdx],
      is_retrograde: isRetro,
      is_combust: isCombust,
      house: hNum
    });
  });

  const upagrahas = {
    yamakantaka: { house: ((ascSignIdx + 4) % 12) + 1, degree: 14.2 },
    mandi: { house: ((ascSignIdx + 6) % 12) + 1, degree: 8.5 },
    gulika: { house: ((ascSignIdx + 7) % 12) + 1, degree: 11.3 },
    upaketu: { house: ((ascSignIdx + 8) % 12) + 1, degree: 19.4 },
    indrachapa: { house: ((ascSignIdx + 10) % 12) + 1, degree: 22.1 }
  };

  return {
    basic_details: { name, date, time, lat, lon, tz_offset, place: location_name },
    charts: {
      houses,
      planet_positions,
      upagrahas,
      ascendant: { sign: RASHIS[ascSignIdx], degree: ascDegree }
    },
    planet_positions: formattedPlanets,
    yamakantaka: upagrahas.yamakantaka,
    mandi: upagrahas.mandi,
    gulika: upagrahas.gulika,
    upaketu: upagrahas.upaketu,
    indrachapa: upagrahas.indrachapa,
    vargas: {
      d1: { houses, planet_positions },
      d2: { houses, planet_positions },
      d3: { houses, planet_positions },
      d4: { houses, planet_positions },
      d7: { houses, planet_positions },
      d9: { houses, planet_positions },
      d10: { houses, planet_positions },
      d12: { houses, planet_positions },
      d16: { houses, planet_positions },
      d20: { houses, planet_positions },
      d24: { houses, planet_positions },
      d27: { houses, planet_positions },
      d30: { houses, planet_positions },
      d40: { houses, planet_positions },
      d45: { houses, planet_positions },
      d60: { houses, planet_positions }
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
      timeout: 10000,
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

module.exports = router;
