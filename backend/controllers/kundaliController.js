// Load environment variables first (before any initialization)
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const nodemailer = require('nodemailer');
const axios = require('axios');
const PDFDocument = require('pdfkit');
const SVGtoPDF = require('svg-to-pdfkit');
const twilio = require('twilio');
const { execFile } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const execFileAsync = promisify(execFile);

// Initialize Gemini AI
let genAI = null;
let aiModel = null;

// Log environment check
console.log('\n🔍 Gemini AI Initialization Check:');
console.log(`  - GEMINI_API_KEY in env: ${process.env.GEMINI_API_KEY ? `YES (length: ${process.env.GEMINI_API_KEY.length})` : 'NO'}`);

if (process.env.GEMINI_API_KEY) {
  try {
    console.log('✅ GEMINI_API_KEY found - Initializing Gemini AI model');
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use gemini-1.5-flash as the default standard model
    aiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('✅ Gemini AI model initialized successfully');
  } catch (initError) {
    console.error('❌ Failed to initialize Gemini AI:', initError.message);
    console.error('   This may indicate an invalid API key format');
  }
} else {
  console.warn('⚠️ GEMINI_API_KEY not found in environment variables');
  console.warn('   Expected location: backend/.env');
  console.warn('   Current process.env.GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'EXISTS' : 'MISSING');
  console.warn('   Make sure to restart the server after adding/updating .env file');
}

// Initialize Twilio client only if credentials are provided
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

// Email transporter setup (optional)
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

// Hindu astrology calculation functions
const RASHIS = [
  'मेष (Aries)', 'वृषभ (Taurus)', 'मिथुन (Gemini)', 'कर्क (Cancer)',
  'सिंह (Leo)', 'कन्या (Virgo)', 'तुला (Libra)', 'वृश्चिक (Scorpio)',
  'धनु (Sagittarius)', 'मकर (Capricorn)', 'कुम्भ (Aquarius)', 'मीन (Pisces)'
];

const NAKSHATRAS = [
  'अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशिरा', 'आर्द्रा', 'पुनर्वसु',
  'पुष्य', 'आश्लेषा', 'मघा', 'पूर्वा फाल्गुनी', 'उत्तरा फाल्गुनी', 'हस्त',
  'चित्रा', 'स्वाती', 'विशाखा', 'अनुराधा', 'ज्येष्ठा', 'मूल', 'पूर्वाषाढ़ा',
  'उत्तराषाढ़ा', 'श्रवण', 'धनिष्ठा', 'शतभिषा', 'पूर्वभाद्रपद', 'उत्तरभाद्रपद', 'रेवती'
];

const PLANETS = [
  'Surya (Sun)', 'Chandra (Moon)', 'Mangal (Mars)', 'Budh (Mercury)',
  'Guru (Jupiter)', 'Shukra (Venus)', 'Shani (Saturn)', 'Rahu', 'Ketu'
];

const calculateRashi = (dateOfBirth) => {
  // Simplified rashi calculation based on date
  const date = new Date(dateOfBirth);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Simplified calculation - in real implementation, you'd use complex astronomical calculations
  const rashiIndex = ((month + day) % 12);
  return RASHIS[rashiIndex];
};

const calculateNakshatra = (dateOfBirth) => {
  const nakshatraIndex = (new Date(dateOfBirth).getDate() + new Date(dateOfBirth).getMonth()) % 27;
  return NAKSHATRAS[nakshatraIndex];
};

const generateSeedFromBirthDetails = (dateOfBirth, timeOfBirth) => {
  const date = new Date(dateOfBirth);
  if (timeOfBirth) {
    const [hours = 0, minutes = 0] = timeOfBirth.split(':').map(Number);
    date.setHours(hours);
    date.setMinutes(minutes);
  }
  return date.getTime() / (1000 * 60 * 60);
};

const pseudoRandom = (seed, offset = 0) => {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
};

const calculatePlanetaryPositions = (dateOfBirth, timeOfBirth) => {
  const seed = generateSeedFromBirthDetails(dateOfBirth, timeOfBirth);
  return PLANETS.map((planet, index) => {
    const degree = (pseudoRandom(seed, index) * 30).toFixed(2);
    const signIndex = Math.floor(pseudoRandom(seed, index + 20) * 12) % 12;
    const house = (Math.floor(pseudoRandom(seed, index + 40) * 12) % 12) + 1;
    const motion = pseudoRandom(seed, index + 60) > 0.85 ? 'Retrograde' : 'Direct';
    return {
      planet,
      degree: parseFloat(degree),
      sign: RASHIS[signIndex],
      house,
      motion,
      nakshatra: NAKSHATRAS[(signIndex * 2 + index) % NAKSHATRAS.length]
    };
  });
};

const generateLagnaChartData = (lagnaSign, planetaryPositions) => {
  const lagnaShort = lagnaSign.split(' ')[0];
  const lagnaIndex = Math.max(
    RASHIS.findIndex(r => r.includes(lagnaShort)),
    0
  );
  const chart = Array.from({ length: 12 }, (_, idx) => ({
    house: idx + 1,
    sign: RASHIS[(lagnaIndex + idx) % 12],
    planets: []
  }));
  planetaryPositions.forEach((position) => {
    const targetIndex = ((position.house - 1) + 12) % 12;
    chart[targetIndex].planets.push({
      name: position.planet,
      sign: position.sign
    });
  });
  return chart;
};

const generatePredictions = (rashi, nakshatra) => {
  return {
    personality: `आपकी राशि ${rashi} के अनुसार आपका व्यक्तित्व मजबूत और दृढ़संकल्पित है। आप में नेतृत्व के गुण हैं और आप अपने लक्ष्यों को प्राप्त करने में सफल होते हैं।`,
    career: `व्यावसायिक क्षेत्र में आपके लिए अच्छे अवसर हैं। ${nakshatra} नक्षत्र के प्रभाव से आपको व्यापार और सेवा क्षेत्र में सफलता मिल सकती है।`,
    health: `स्वास्थ्य की दृष्टि से आपको अपने खान-पान पर विशेष ध्यान देना चाहिए। नियमित व्यायाम और योग आपके लिए लाभकारी है।`,
    marriage: `वैवाहिक जीवन में खुशियां होंगी। आपका जीवनसाथी आपके साथ मिलकर जीवन की सभी चुनौतियों का सामना करेगा।`,
    finance: `धन संबंधी मामलों में सावधानी बरतें। निवेश से पहले उचित सलाह लें और अनावश्यक खर्च से बचें।`,
    lucky: {
      color: 'लाल और सुनहरा (Red and Golden)',
      number: '3, 7, 21',
      day: 'मंगलवार और गुरुवार (Tuesday and Thursday)',
      stone: 'मूंगा या पुखराज (Coral or Yellow Sapphire)'
    }
  };
};

const generateDetailedKundali = (formData) => {
  const { name, dateOfBirth, placeOfBirth, timeOfBirth } = formData;
  const rashi = calculateRashi(dateOfBirth);
  const nakshatra = calculateNakshatra(dateOfBirth);
  const predictions = generatePredictions(rashi, nakshatra);

  return `
🕉 जन्म कुंडली - ${name} 🕉

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 जन्म विवरण:
• नाम: ${name}
• जन्म तिथि: ${new Date(dateOfBirth).toLocaleDateString('hi-IN')}
• जन्म स्थान: ${placeOfBirth}
${timeOfBirth ? `• जन्म समय: ${timeOfBirth}` : '• जन्म समय: उपलब्ध नहीं'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌟 ज्योतिषीय विवरण:
• राशि: ${rashi}
• नक्षत्र: ${nakshatra}
• लग्न: ${rashi.split(' ')[0]} लग्न

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔮 व्यक्तित्व विश्लेषण:
${predictions.personality}

💼 करियर और व्यवसाय:
${predictions.career}

💚 स्वास्थ्य:
${predictions.health}

💕 विवाह और संबंध:
${predictions.marriage}

💰 धन और वित्त:
${predictions.finance}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🍀 शुभ तत्व:
• शुभ रंग: ${predictions.lucky.color}
• शुभ अंक: ${predictions.lucky.number}
• शुभ दिन: ${predictions.lucky.day}
• रत्न: ${predictions.lucky.stone}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🙏 मंत्र सुझाव:
"ॐ गं गणपतये नमः" - दैनिक 108 बार जाप करें
"ॐ नमः शिवाय" - कठिनाइयों से मुक्ति के लिए

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ उपाय:
• नियमित पूजा-पाठ करें
• दान-धर्म में भाग लें
• वृक्षारोपण करें
• जरूरतमंदों की सहायता करें

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🕉 हमारे ज्योतिषाचार्यों से व्यक्तिगत परामर्श के लिए संपर्क करें 🕉

सादर,
ज्योतिष शास्त्र - AstroConsult
  `;
};

exports.generateKundali = async (req, res) => {
  try {
    const { name, dateOfBirth, placeOfBirth, timeOfBirth, email, phoneNumber } = req.body;

    // Validate required fields
    if (!name || !dateOfBirth || !placeOfBirth) {
      return res.status(400).json({
        message: 'कृपया सभी आवश्यक फील्ड भरें (Please fill all mandatory fields)'
      });
    }

    // Generate detailed Kundali and chart data
    const kundaliText = generateDetailedKundali(req.body);
    const lagnaSign = calculateRashi(dateOfBirth);
    const planetaryPositions = calculatePlanetaryPositions(dateOfBirth, timeOfBirth);
    const lagnaChart = generateLagnaChartData(lagnaSign, planetaryPositions);

    // For the new feature, we'll just return the kundali text without sending it
    // The frontend will handle the delivery options
    res.status(200).json({
      message: 'कुंडली सफलतापूर्वक बनाई गई',
      success: true,
      kundali: kundaliText,
      lagnaChart,
      planetaryPositions
    });

  } catch (error) {
    console.error('Error generating Kundali:', error);
    res.status(500).json({
      message: 'कुंडली बनाने में त्रुटि हुई (Error generating Kundali)',
      error: error.message
    });
  }
};

// VedAstro API proxy to avoid CORS issues
exports.generateKundaliWithVedAstro = async (req, res) => {
  try {
    const axios = require('axios');
    const { name, dateOfBirth, timeOfBirth, coordinates, timezone } = req.body;

    console.log('Received request body:', req.body);

    // Validate required fields
    if (!name || !dateOfBirth || !coordinates || !timezone) {
      return res.status(400).json({
        message: 'कृपया सभी आवश्यक फील्ड भरें (Please fill all mandatory fields including coordinates and timezone)',
        received: { name, dateOfBirth, coordinates, timezone }
      });
    }

    const VEDASTRO_API = process.env.VEDASTRO_API_URL || 'https://api.vedastro.org';

    // Parse coordinates with validation
    let lat, lon;
    try {
      const coords = coordinates.split(',').map(c => parseFloat(c.trim()));
      lat = coords[0];
      lon = coords[1];

      if (isNaN(lat) || isNaN(lon)) {
        throw new Error('Invalid coordinates format');
      }
    } catch (coordError) {
      console.error('Coordinate parsing error:', coordError);
      return res.status(400).json({
        message: 'Invalid coordinates format. Expected format: "latitude,longitude"',
        error: coordError.message
      });
    }

    // Format time for VedAstro API
    const date = new Date(dateOfBirth);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    // Get timezone offset
    const getTimezoneOffset = (tz) => {
      const timezoneMap = {
        'Asia/Kolkata': '+05:30',
        'Asia/Calcutta': '+05:30',
        'America/New_York': '-05:00',
        'America/Los_Angeles': '-08:00',
        'Europe/London': '+00:00',
        'Asia/Dubai': '+04:00',
        'Asia/Singapore': '+08:00',
        'Australia/Sydney': '+10:00',
      };

      if (timezoneMap[tz]) return timezoneMap[tz];
      if (/^[+-]\d{2}:\d{2}$/.test(tz)) return tz;
      return '+05:30'; // Default to IST
    };

    const timezoneOffset = getTimezoneOffset(timezone);
    const time = timeOfBirth || '12:00';

    // Build time string: HH:MM/DD/MM/YYYY/±HH:MM
    const timeString = `${time}/${day}/${month}/${year}/${timezoneOffset}`;
    const locationString = `${lat},${lon}`; // Comma-separated for VedAstro API
    const ayanamsa = 'LAHIRI'; // Using Lahiri Ayanamsa (most common in Vedic astrology)

    console.log('VedAstro API Request:', { timeString, locationString, ayanamsa });

    // Make parallel requests to VedAstro API with error handling
    let planetsResponse, moonSignResponse, nakshatraResponse;

    try {
      // Construct proper VedAstro API URLs
      const planetUrl = `${VEDASTRO_API}/api/Calculate/AllPlanetData/PlanetName/All/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}`;
      const moonSignUrl = `${VEDASTRO_API}/api/Calculate/MoonSign/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}`;
      const nakshatraUrl = `${VEDASTRO_API}/api/Calculate/MoonConstellation/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}`;

      console.log('Calling VedAstro APIs...');

      console.log('Calling VedAstro APIs sequentially for debugging...');

      // 1. Call Planets (Critical)
      try {
        planetsResponse = await axios.get(planetUrl, { timeout: 120000 });
        console.log('✅ AllPlanetData: Success');

        // Validation check
        if (typeof planetsResponse.data === 'string' && planetsResponse.data.includes('free limit')) {
          throw new Error('Rate limit reached on Planets API');
        }
      } catch (e) {
        console.error('❌ AllPlanetData: Failed', e.message);
        throw new Error(`Critical VedAstro API error: ${e.message}`);
      }

      // 2. Call MoonSign (Optional Fallback)
      try {
        moonSignResponse = await axios.get(moonSignUrl, { timeout: 120000 });

        // Check if the response indicates method not found
        if (moonSignResponse.data &&
          (moonSignResponse.data.Status === 'Fail' ||
            String(moonSignResponse.data.Payload).includes('not found') ||
            String(moonSignResponse.data.Payload).includes('Calculator method'))) {
          console.warn('⚠️ MoonSign method not available in local API, will extract from Planet Data.');
          moonSignResponse = { data: { Payload: null } };
        } else {
          console.log('✅ MoonSign: Success');
        }
      } catch (e) {
        console.warn('⚠️ MoonSign API failed, will extract from Planet Data if possible.');
        moonSignResponse = { data: { Payload: null } };
      }

      // 3. Call Nakshatra (Optional Fallback)
      try {
        nakshatraResponse = await axios.get(nakshatraUrl, { timeout: 120000 });
        console.log('✅ MoonConstellation: Success');
      } catch (e) {
        console.warn('⚠️ MoonConstellation API failed, will extract from Planet Data if possible.');
        nakshatraResponse = { data: { Payload: null } };
      }

    } catch (apiError) {
      console.error('=== VedAstro API Error Summary ===');
      console.error('Error Message:', apiError.message);

      return res.status(500).json({
        message: 'VedAstro API से कनेक्शन में त्रुटि (Error connecting to VedAstro API)',
        error: apiError.message,
        details: 'VedAstro API methods might be temporarily unavailable or rate limited.'
      });
    }


    // Extract data Safely
    const planetsData = planetsResponse.data || {};
    let payload = planetsData.Payload || {};

    // 🛠️ FIX for Local VedAstro: Convert Array Payload to Object
    // Local API returns: [{"Sun": {...}}, {"Moon": {...}}]
    // Code expects: {"Sun": {...}, "Moon": {...}}
    if (Array.isArray(payload)) {
      console.log('ℹ️ Detected Array Payload from VedAstro (Local Mode)');
      const payloadObj = {};
      payload.forEach(item => {
        const keys = Object.keys(item);
        if (keys.length > 0) {
          const key = keys[0];
          payloadObj[key] = item[key];
        }
      });
      payload = payloadObj;
    }

    // Fallback Moon Sign/Nakshatra from Planet Data if dedicated API calls failed
    let moonSign = (moonSignResponse.data && moonSignResponse.data.Payload && !String(moonSignResponse.data.Payload).includes("not found")) ? String(moonSignResponse.data.Payload) : null;
    let nakshatra = (nakshatraResponse.data && nakshatraResponse.data.Payload && !String(nakshatraResponse.data.Payload).includes("not found")) ? String(nakshatraResponse.data.Payload) : null;

    if (!moonSign && payload.Moon) {
      moonSign = payload.Moon.Sign?.Name || payload.Moon.Sign || 'N/A';
      console.log('🔄 Extracted Moon Sign from Planet Data:', moonSign);
    }

    if (!nakshatra && payload.Moon) {
      nakshatra = payload.Moon.Nakshatra?.Name || payload.Moon.Nakshatra || 'N/A';
      console.log('🔄 Extracted Nakshatra from Planet Data:', nakshatra);
    }

    moonSign = moonSign || 'N/A';
    nakshatra = nakshatra || 'N/A';

    // Use Moon sign as ascendant for now (simplified approach)
    const ascendant = moonSign;

    // Extract planet positions
    const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    const planetaryPositions = [];

    planetNames.forEach(planetName => {
      try {
        const planetData = payload[planetName];
        if (planetData) {
          // Deep property access for Nirayana Longitude
          const totalDegrees = Number(planetData.NirayanaLongitude?.TotalDegrees);
          const formattedDegree = (!isNaN(totalDegrees)) ? totalDegrees.toFixed(2) : '0.00';

          // Sign handling
          const signName = planetData.Sign?.Name || (typeof planetData.Sign === 'string' ? planetData.Sign : 'N/A');

          // Nakshatra handling
          const nName = planetData.Nakshatra?.Name || (typeof planetData.Nakshatra === 'string' ? planetData.Nakshatra : 'N/A');

          // Motion handling (can be string or object)
          let motion = 'Direct';
          if (typeof planetData.Motion === 'string') {
            motion = planetData.Motion;
          } else if (planetData.Motion && planetData.Motion.Name) {
            motion = planetData.Motion.Name;
          }

          planetaryPositions.push({
            planet: planetName,
            sign: signName,
            nakshatra: nName,
            degree: formattedDegree,
            house: Number(planetData.HousePlanetIsIn) || 0,
            motion: motion
          });
        }
      } catch (extractErr) {
        console.warn(`Could not extract data for planet ${planetName}:`, extractErr.message);
      }
    });

    // Generate house chart from planetary positions
    const lagnaChart = [];
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

    for (let i = 1; i <= 12; i++) {
      const planetsInHouse = planetaryPositions.filter(p => p.house === i);
      lagnaChart.push({
        house: i,
        sign: signs[(i - 1) % 12],
        planets: planetsInHouse.map(p => ({ name: p.planet, sign: p.sign }))
      });
    }


    // Helper function to get nakshatra pada
    const getNakshatraPada = (nakshatra) => {
      // Simplified pada calculation (in real implementation, this would be calculated from moon's position)
      return Math.floor(Math.random() * 4) + 1;
    };

    // Helper function to get planet strength
    const getPlanetStrength = (planet) => {
      const strengths = ['Exalted', 'Own Sign', 'Friendly', 'Neutral', 'Debilitated'];
      return strengths[Math.floor(Math.random() * strengths.length)];
    };

    // Generate professional Kundali text
    let kundaliText = `
╔════════════════════════════════════════════════════════════════════════════╗
║                         वैदिक जन्म कुंडली                                  ║
║                      VEDIC BIRTH CHART (KUNDALI)                            ║
║                    Powered by VedAstro Engine                               ║
╚════════════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                            📋 PERSONAL DETAILS
                            व्यक्तिगत विवरण

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  👤 Name (नाम)                    : ${name}
  📅 Date of Birth (जन्म तिथि)     : ${(() => {
        try {
          const d = new Date(dateOfBirth);
          if (isNaN(d.getTime())) return dateOfBirth || 'N/A';
          return d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        } catch (e) {
          return dateOfBirth || 'N/A';
        }
      })()}
  ⏰ Time of Birth (जन्म समय)      : ${timeOfBirth || 'Not Provided (12:00 PM assumed)'}
  📍 Coordinates (निर्देशांक)       : ${coordinates || 'N/A'}
  🌍 Timezone (समय क्षेत्र)         : ${timezone || 'N/A'}
  🕉️  Ayanamsa (अयनांश)            : Lahiri (Chitrapaksha)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                        🌟 FUNDAMENTAL CHART DETAILS
                        मूल कुंडली विवरण

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  🔸 Ascendant (लग्न)              : ${ascendant}
  🌙 Moon Sign (चंद्र राशि)        : ${moonSign}
  ⭐ Birth Star (जन्म नक्षत्र)     : ${nakshatra} - Pada ${getNakshatraPada(nakshatra)}
  ☀️  Sun Sign (सूर्य राशि)         : ${planetaryPositions.find(p => p.planet === 'Sun')?.sign || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                        🪐 PLANETARY POSITIONS (ग्रह स्थिति)
                    Nirayana (Sidereal) Zodiac - Lahiri Ayanamsa

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Planet        Sign            Degree      House   Motion      Strength
  ──────────────────────────────────────────────────────────────────────────
${planetaryPositions.map(p => {
        const pName = String(p.planet || '').padEnd(12);
        const pSign = String(p.sign || '').padEnd(14);
        const pDeg = String(p.degree || '0.00').padStart(6);
        const pHouse = String(p.house || '').padStart(3);
        const pMotion = String(p.motion || 'Direct').padEnd(10);
        const pStrength = getPlanetStrength(p.planet);
        return `  ${pName}  ${pSign}  ${pDeg}°   ${pHouse}     ${pMotion}  ${pStrength}`;
      }).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                        🏠 HOUSE CHART (भाव चक्र)
                        Lagna Kundali (लग्न कुंडली)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  House   Sign            Lord        Planets Placed
  ────────────────────────────────────────────────────────────────────────
${lagnaChart.map(h => {
        const signLords = {
          'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury', 'Cancer': 'Moon',
          'Leo': 'Sun', 'Virgo': 'Mercury', 'Libra': 'Venus', 'Scorpio': 'Mars',
          'Sagittarius': 'Jupiter', 'Capricorn': 'Saturn', 'Aquarius': 'Saturn', 'Pisces': 'Jupiter'
        };
        const lord = signLords[h.sign] || 'N/A';
        const planetsStr = h.planets.length > 0 ? h.planets.map(p => p.name).join(', ') : '—';
        return `  ${String(h.house).padStart(2)}      ${h.sign.padEnd(14)}  ${lord.padEnd(10)}  ${planetsStr}`;
      }).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                        📊 NAKSHATRA ANALYSIS (नक्षत्र विश्लेषण)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Birth Nakshatra (जन्म नक्षत्र)   : ${nakshatra}
  Nakshatra Lord (नक्षत्र स्वामी)   : ${(() => {
        const nakshatraLords = {
          'Ashwini': 'Ketu', 'Bharani': 'Venus', 'Krittika': 'Sun', 'Rohini': 'Moon',
          'Mrigashira': 'Mars', 'Ardra': 'Rahu', 'Punarvasu': 'Jupiter', 'Pushya': 'Saturn',
          'Ashlesha': 'Mercury', 'Magha': 'Ketu', 'Purva Phalguni': 'Venus', 'Uttara Phalguni': 'Sun',
          'Hasta': 'Moon', 'Chitra': 'Mars', 'Swati': 'Rahu', 'Vishakha': 'Jupiter',
          'Anuradha': 'Saturn', 'Jyeshtha': 'Mercury', 'Mula': 'Ketu', 'Purva Ashadha': 'Venus',
          'Uttara Ashadha': 'Sun', 'Shravana': 'Moon', 'Dhanishta': 'Mars', 'Shatabhisha': 'Rahu',
          'Purva Bhadrapada': 'Jupiter', 'Uttara Bhadrapada': 'Saturn', 'Revati': 'Mercury'
        };
        return nakshatraLords[nakshatra] || 'N/A';
      })()}
  Pada (पाद)                        : ${getNakshatraPada(nakshatra)}
  Gana (गण)                         : Deva/Manushya/Rakshasa
  Animal Symbol (पशु)               : Varies by Nakshatra

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                        🔮 ASTROLOGICAL INSIGHTS (ज्योतिषीय विश्लेषण)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  📌 PERSONALITY TRAITS (व्यक्तित्व लक्षण):
  
  Based on your Moon Sign (${moonSign}) and Ascendant (${ascendant}), you possess
  a unique blend of characteristics. Your birth star ${nakshatra} influences
  your emotional nature and instinctive responses to life situations.

  📌 LIFE PATH (जीवन पथ):
  
  The planetary positions at your birth indicate specific karmic patterns and
  life lessons. Your chart suggests areas of natural talent and potential
  challenges that will shape your journey.

  📌 CAREER & PROFESSION (करियर और व्यवसाय):
  
  The 10th house (House of Career) and its lord play a crucial role in
  determining professional success. Planetary aspects to this house indicate
  favorable periods for career advancement.

  📌 RELATIONSHIPS (संबंध):
  
  The 7th house governs partnerships and marriage. The position of Venus and
  the 7th house lord provide insights into relationship dynamics and
  compatibility factors.

  📌 HEALTH (स्वास्थ्य):
  
  The 6th house and its planetary influences indicate health tendencies.
  Regular attention to wellness practices aligned with your chart can
  promote vitality and longevity.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                        🌺 REMEDIAL MEASURES (उपाय)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  🙏 MANTRAS (मंत्र):
  
  • Gayatri Mantra: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्"
  • Moon Sign Mantra: Chant the mantra for ${moonSign} sign
  • Nakshatra Mantra: Specific to ${nakshatra}

  💎 GEMSTONES (रत्न):
  
  • Primary: Based on Ascendant lord
  • Secondary: Based on Moon sign
  • Consult an astrologer before wearing gemstones

  🕉️  SPIRITUAL PRACTICES (आध्यात्मिक अभ्यास):
  
  • Daily meditation during sunrise
  • Worship of planetary deities on specific days
  • Charity and service to others
  • Fasting on auspicious days

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                        📝 IMPORTANT NOTES (महत्वपूर्ण नोट)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✓ This Kundali has been generated using VedAstro Engine
  ✓ Calculations based on Vedic Astrology principles
  ✓ Swiss Ephemeris used for accurate planetary positions
  ✓ Lahiri Ayanamsa (Chitrapaksha) system applied
  ✓ All times are in ${timezone} timezone
  
  ⚠️  DISCLAIMER:
  This chart provides general astrological insights. For detailed analysis,
  personal consultation with a qualified Vedic astrologer is recommended.
  Astrology is a guide, not a determinant of destiny. Free will and personal
  effort play crucial roles in shaping one's life.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                        🕉️  ॐ शांति शांति शांतिः 🕉️
                        
                    Generated on: ${new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'full',
        timeStyle: 'long'
      })}
                    
                    © VedAstro Engine - Vedic Astrology Calculations
                    
╚════════════════════════════════════════════════════════════════════════════╝
`;

    // Fetch Chart SVG (South/North Indian Style)
    const chartStyle = req.body.chartStyle || 'SouthIndian';
    const divisionalChartType = req.body.divisionalChartType || 'BhavaChalit'; // Default to BhavaChalit
    const chartTypeParam = chartStyle === 'NorthIndian' ? 'NorthIndianChart' : 'SouthIndianChart';
    const chartDisplayName = `${chartStyle === 'NorthIndian' ? 'NORTH INDIAN' : 'SOUTH INDIAN'} ${divisionalChartType.toUpperCase()} CHART`;

    let chartSvg = null;
    try {
      // NOTE: Local VedAstro requires Ayanamsa/LAHIRI (or RAMAN) but does not default well.
      // Using LAHIRI as consistent with other calculations.
      // API call returns raw SVG with Content-Type: image/svg+xml
      const chartApiUrl = `${VEDASTRO_API}/api/Calculate/${chartTypeParam}/Location/${locationString}/Time/${timeString}/ChartType/${divisionalChartType}/Ayanamsa/LAHIRI`;
      console.log('Fetching Chart SVG:', chartApiUrl);

      // Request as text to ensure we get the raw SVG string
      // Using shorter timeout (30s) for chart as it's optional and can be slow
      const chartRes = await axios.get(chartApiUrl, { responseType: 'text', timeout: 30000 });

      if (chartRes.data) {
        // Check if data is JSON (External API wrapper)
        if (typeof chartRes.data === 'object' && chartRes.data.Payload) {
          chartSvg = chartRes.data.Payload;
        }
        // Check if data is raw SVG string (Local API)
        else if (typeof chartRes.data === 'string' && chartRes.data.includes('<svg')) {
          chartSvg = chartRes.data;
        }
      }
    } catch (chartError) {
      console.warn(`Could not fetch ${chartStyle} ${divisionalChartType} Chart SVG:`, chartError.message);
    }

    // Add Chart SVG section to the text report if available
    if (chartSvg) {
      kundaliText += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                        📊 ${chartDisplayName}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  (Chart visual is available in the 'Chart' tab)
  
`;
    }

    // Final validation of collected data
    if (!planetaryPositions.length) {
      console.warn('⚠️ No planetary positions were successfully extracted from VedAstro response.');
    }

    res.status(200).json({
      message: 'कुंडली सफलतापूर्वक बनाई गई',
      success: true,
      kundali: kundaliText,
      lagnaChart,
      chartSvg,
      planetaryPositions,
      ascendant,
      moonSign,
      nakshatra
    });

  } catch (error) {
    console.error('=== FATAL VedAstro Controller Error ===');
    console.error('Stack:', error.stack);
    console.error('Message:', error.message);
    if (error.response) {
      console.error('API Response Data:', JSON.stringify(error.response.data));
      console.error('API Response Status:', error.response.status);
    }

    res.status(500).json({
      message: 'VedAstro API से कुंडली बनाने में त्रुटि हुई (Internal Server Error during Kundali generation)',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      details: error.response?.data
    });
  }
};

// In-memory cache for Panchang data (to reduce API calls)
const panchangCache = new Map();
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

// Panchang data from VedAstro
exports.getPanchang = async (req, res) => {
  try {
    const axios = require('axios');
    const { date, coordinates, timezone } = req.body;

    if (!date || !coordinates) {
      return res.status(400).json({ message: 'Date and coordinates are required' });
    }

    // Create cache key based on date and location
    const dateObj = new Date(date);
    const dateKey = `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}`;
    const cacheKey = `${dateKey}-${coordinates}`;

    // Check cache first
    const cached = panchangCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
      console.log('✅ Returning cached Panchang data for:', cacheKey);
      return res.json(cached.data);
    }

    const VEDASTRO_API = process.env.VEDASTRO_API_URL || 'https://api.vedastro.org';
    const coords = coordinates.split(',').map(c => parseFloat(c.trim()));
    const lat = coords[0];
    const lon = coords[1];
    const locationString = `${lat},${lon}`;

    // Reuse dateObj from line 672
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();

    // Default time to 06:00 AM for Panchang (Sunrise time is ideal)
    const time = '06:00';

    const getTimezoneOffset = (tz) => {
      const timezoneMap = {
        'Asia/Kolkata': '+05:30',
        'Asia/Calcutta': '+05:30',
        'America/New_York': '-05:00',
        'America/Los_Angeles': '-08:00',
        'Europe/London': '+00:00',
        'Asia/Dubai': '+04:00',
        'Asia/Singapore': '+08:00',
        'Australia/Sydney': '+10:00',
      };
      if (timezoneMap[tz]) return timezoneMap[tz];
      if (/^[+-]\d{2}:\d{2}$/.test(tz)) return tz;
      return '+05:30';
    };

    const timezoneOffset = getTimezoneOffset(timezone || 'Asia/Kolkata');
    const timeString = `${time}/${day}/${month}/${year}/${timezoneOffset}`;
    const ayanamsa = 'LAHIRI';

    console.log('Fetching Panchang from VedAstro for:', timeString);

    const [tithiRes, nakshatraRes, yogaRes, karanaRes, moonSignRes, sunSignRes, transitRes] = await Promise.all([
      axios.get(`${VEDASTRO_API}/api/Calculate/Tithi/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}`),
      axios.get(`${VEDASTRO_API}/api/Calculate/MoonConstellation/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}`),
      axios.get(`${VEDASTRO_API}/api/Calculate/Yoga/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}`),
      axios.get(`${VEDASTRO_API}/api/Calculate/Karana/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}`),
      axios.get(`${VEDASTRO_API}/api/Calculate/MoonSign/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}`),
      axios.get(`${VEDASTRO_API}/api/Calculate/SunSign/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}`),
      axios.get(`${VEDASTRO_API}/api/Calculate/AllPlanetData/PlanetName/All/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}`)
    ]);

    // Check for rate limit message in successful responses
    const responses = [tithiRes, nakshatraRes, yogaRes, karanaRes, moonSignRes, sunSignRes, transitRes];
    for (const res of responses) {
      if (typeof res.data === 'string' && (res.data.includes('free limit') || res.data.includes('We are happy'))) {
        throw new Error('VedAstro API rate limit reached (in response body)');
      }
      if (res.data.Payload && typeof res.data.Payload === 'string' && (res.data.Payload.includes('free limit') || res.data.Payload.includes('We are happy'))) {
        throw new Error('VedAstro API rate limit reached (in Payload)');
      }
    }

    const tithiData = tithiRes.data.Payload || {};
    const nakshatraData = nakshatraRes.data.Payload || 'N/A';

    // Tithi typically returns an object with Name and Number
    const tithiName = tithiData.Name || 'N/A';
    const tithiNumber = tithiData.Number || 0;
    const paksh = tithiNumber <= 15 ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष';

    // Format transit data
    const transitData = [];
    if (transitRes.data.Payload) {
      const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
      planetNames.forEach(pName => {
        const pData = transitRes.data.Payload[pName];
        if (pData) {
          transitData.push({
            planet: pName,
            sign: pData.Sign?.Name || 'N/A',
            degree: pData.NirayanaLongitude?.TotalDegrees?.toFixed(2) || '0.00',
            house: pData.HousePlanetIsIn || 'N/A'
          });
        }
      });
    }

    const responseData = {
      success: true,
      panchang: {
        tithi: tithiName,
        tithiNumber,
        paksh,
        nakshatra: nakshatraData,
        yoga: yogaRes.data.Payload || 'N/A',
        karana: karanaRes.data.Payload || 'N/A',
        moonSign: moonSignRes.data.Payload || 'N/A',
        sunSign: sunSignRes.data.Payload || 'N/A',
        transits: transitData
      }
    };

    // Cache the result
    panchangCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });

    // Log cache statistics
    console.log(`📊 Panchang cache size: ${panchangCache.size} entries`);

    res.json(responseData);

  } catch (error) {
    console.error('Panchang API Error:', error.message);

    // Check if it's a rate limit error from VedAstro
    const errorMessage = error.response?.data?.message || error.message || '';
    if (errorMessage.includes('free limit') || errorMessage.includes('rate limit')) {
      console.warn('⚠️ VedAstro API rate limit reached. Consider upgrading or implementing better caching.');
      return res.status(429).json({
        message: 'API rate limit reached. Please try again later or contact support.',
        error: 'Rate limit exceeded',
        suggestion: 'The free tier of VedAstro API has been exhausted. Consider caching or upgrading.'
      });
    }

    res.status(500).json({
      message: 'Error fetching Panchang data from VedAstro',
      error: error.message
    });
  }
};

// New function to execute JKS.exe for kundali generation
exports.generateKundaliWithJKS = async (req, res) => {
  try {
    const { name, dateOfBirth, placeOfBirth, timeOfBirth, coordinates, timezone } = req.body;

    if (!name || !dateOfBirth || !placeOfBirth) {
      return res.status(400).json({
        message: 'कृपया सभी आवश्यक फील्ड भरें (Please fill all mandatory fields)'
      });
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const jksPath = path.join(__dirname, '..', '..', 'JKS.exe');

    // ALWAYS FALLBACK for now or if in production/missing
    if (isProduction || !fs.existsSync(jksPath)) {
      console.log('Falling back to regular Kundali generation...');
      const kundaliText = generateDetailedKundali(req.body);
      const lagnaSign = calculateRashi(dateOfBirth);
      const planetaryPositions = calculatePlanetaryPositions(dateOfBirth, timeOfBirth);
      const lagnaChart = generateLagnaChartData(lagnaSign, planetaryPositions);

      return res.status(200).json({
        message: 'कुंडली सफलतापूर्वक बनाई गई (JKS.exe not available, using standard calculation)',
        success: true,
        kundali: kundaliText,
        lagnaChart,
        planetaryPositions,
        warning: 'JKS.exe not found, using standard calculation method'
      });
    }

    const args = ['--name', name, '--dob', dateOfBirth, '--place', placeOfBirth];
    if (timeOfBirth) args.push('--time', timeOfBirth);
    if (coordinates) args.push('--coordinates', coordinates);
    if (timezone) args.push('--timezone', timezone);

    try {
      const { stdout, stderr } = await execFileAsync(jksPath, args, { timeout: 30000 });
      if (stderr) console.warn('JKS.exe stderr:', stderr);

      const kundaliText = stdout || generateDetailedKundali(req.body);
      const lagnaSign = calculateRashi(dateOfBirth);
      const planetaryPositions = calculatePlanetaryPositions(dateOfBirth, timeOfBirth);
      const lagnaChart = generateLagnaChartData(lagnaSign, planetaryPositions);

      res.status(200).json({
        message: 'कुंडली सफलतापूर्वक बनाई गई',
        success: true,
        kundali: kundaliText,
        lagnaChart,
        planetaryPositions
      });
    } catch (execError) {
      console.error('JKS.exe execution error:', execError);
      const kundaliText = generateDetailedKundali(req.body);
      const lagnaSign = calculateRashi(dateOfBirth);
      const planetaryPositions = calculatePlanetaryPositions(dateOfBirth, timeOfBirth);
      const lagnaChart = generateLagnaChartData(lagnaSign, planetaryPositions);

      res.status(200).json({
        message: 'कुंडली सफलतापूर्वक बनाई गई (JKS.exe error, using standard calculation)',
        success: true,
        kundali: kundaliText,
        lagnaChart,
        planetaryPositions,
        warning: `JKS.exe execution failed: ${execError.message}. Using standard calculation method.`
      });
    }
  } catch (error) {
    console.error('Error generating Kundali with JKS:', error);
    res.status(500).json({
      message: 'कुंडली बनाने में त्रुटि हुई (Error generating Kundali with JKS)',
      error: error.message
    });
  }
};

// New endpoint to send kundali to email
exports.sendKundaliToEmail = async (req, res) => {
  try {
    const { name, email, kundaliText } = req.body;
    if (!email || !kundaliText) {
      return res.status(400).json({ message: 'ईमेल और कुंडली पाठ आवश्यक है (Email and Kundali text are required)' });
    }

    if (transporter) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `🕉 ${name} की जन्म कुंडली - Birth Kundali`,
        text: kundaliText,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px;">
            <div style="background: white; padding: 30px; border-radius: 15px; max-width: 600px; margin: 0 auto;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #D4AF37; font-size: 28px; margin-bottom: 10px;">🕉 जन्म कुंडली 🕉</h1>
                <h2 style="color: #9333EA; font-size: 24px;">${name}</h2>
              </div>
              <pre style="white-space: pre-wrap; font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.6; background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #D4AF37;">${kundaliText}</pre>
              <div style="text-align: center; margin-top: 30px; padding: 20px; background: linear-gradient(45deg, #D4AF37, #F59E0B); border-radius: 10px;">
                <p style="color: white; margin: 0; font-weight: bold;">व्यक्तिगत परामर्श के लिए हमारी वेबसाइट पर जाएं</p>
                <p style="color: white; margin: 5px 0 0 0;">Visit our website for personal consultation</p>
              </div>
            </div>
          </div>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: 'कुंडली ईमेल पर सफलतापूर्वक भेज दी गई (Kundali successfully sent to email)' });
      } catch (emailError) {
        return res.status(500).json({ message: 'ईमेल भेजने में त्रुटि हुई (Error sending email)' });
      }
    } else {
      return res.status(500).json({ message: 'ईमेल सेवा उपलब्ध नहीं है (Email service not available)' });
    }
  } catch (error) {
    console.error('Error sending Kundali to email:', error);
    res.status(500).json({ message: 'ईमेल भेजने में त्रुटि हुई (Error sending Kundali to email)', error: error.message });
  }
};

// New endpoint to send kundali to phone via SMS
exports.sendKundaliToPhone = async (req, res) => {
  try {
    const { name, phoneNumber, kundaliText } = req.body;
    if (!phoneNumber || !kundaliText) {
      return res.status(400).json({ message: 'फोन नंबर और कुंडली पाठ आवश्यक है (Phone number and Kundali text are required)' });
    }

    if (twilioClient) {
      const rashi = calculateRashi(req.body.dateOfBirth || new Date());
      const nakshatra = calculateNakshatra(req.body.dateOfBirth || new Date());
      const smsMessage = `🕉 नमस्ते ${name}!\n\nआपकी जन्म कुंडली तैयार हो गई है।\n\nआपकी राशि: ${rashi}\nआपका नक्षत्र: ${nakshatra}\n\nविस्तृत कुंडली आपके ईमेल पर भेज दी गई है।\n\nधन्यवाद!\nज्योतिष शास्त्र - AstroConsult`;

      try {
        await twilioClient.messages.create({ body: smsMessage, from: process.env.TWILIO_PHONE_NUMBER, to: phoneNumber });
        return res.status(200).json({ message: 'कुंडली SMS के माध्यम से सफलतापूर्वक भेज दी गई (Kundali successfully sent via SMS)' });
      } catch (smsError) {
        return res.status(500).json({ message: 'SMS भेजने में त्रुटि हुई (Error sending SMS)' });
      }
    } else {
      return res.status(500).json({ message: 'SMS सेवा उपलब्ध नहीं है (SMS service not available)' });
    }
  } catch (error) {
    console.error('Error sending Kundali to phone:', error);
    res.status(500).json({ message: 'SMS भेजने में त्रुटि हुई (Error sending Kundali to phone)', error: error.message });
  }
};

// Helper to draw a table in PDFKit
const drawAstrologyTable = (doc, headers, rows, options = {}) => {
  const {
    startX = 50,
    startY = doc.y + 10,
    columnWidth = 80, // Default or array of widths
    rowHeight = 25,
    fontSize = 10,
    headerBG = '#1a237e',
    headerTextColor = '#ffffff',
    borderColor = '#e0e0e0',
    zebraColor = '#f5f5f5'
  } = options;

  doc.fontSize(fontSize);
  let currentY = startY;

  // Helper to get column width
  const getColWidth = (index) => Array.isArray(columnWidth) ? columnWidth[index] : columnWidth;

  const drawHeaders = (y) => {
    let x = startX;
    doc.fillColor(headerBG).rect(startX, y, headers.reduce((acc, _, i) => acc + getColWidth(i), 0), rowHeight).fill();
    doc.fillColor(headerTextColor);
    headers.forEach((header, i) => {
      const w = getColWidth(i);
      doc.text(header, x + 5, y + 7, { width: w - 10, align: 'center' });
      x += w;
    });
    return y + rowHeight;
  };

  currentY = drawHeaders(currentY);

  // Draw Rows
  rows.forEach((row, i) => {
    if (currentY + rowHeight > doc.page.height - 70) {
      doc.addPage();
      currentY = 50;
      currentY = drawHeaders(currentY);
    }

    // Zebra striping
    if (i % 2 === 0) {
      doc.fillColor(zebraColor).rect(startX, currentY, headers.reduce((acc, _, i) => acc + getColWidth(i), 0), rowHeight).fill();
    }

    let x = startX;
    doc.fillColor('black');
    row.forEach((cell, j) => {
      const w = getColWidth(j);
      doc.rect(x, currentY, w, rowHeight).stroke(borderColor);
      doc.text(cell.toString(), x + 5, currentY + 7, { width: w - 10, align: 'center' });
      x += w;
    });
    currentY += rowHeight;
  });

  doc.y = currentY + 15;
};

// --- NEW HELPERS FOR PDF REPORTS ---

const getOrdinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const analyzeMangalDosha = (planets) => {
  const manglikHouses = [1, 4, 7, 8, 12];
  const mars = planets['Mars'] || planets['Surya (Mars)']; // Support different naming conventions

  // Find Mars in the list if keys are different
  let marsData = mars;
  if (!marsData) {
    const key = Object.keys(planets).find(k => k.toLowerCase().includes('mars'));
    marsData = planets[key];
  }

  const marsHouseLagna = marsData ? (marsData.HousePlanetIsIn || marsData.house) : null;

  const moon = planets['Moon'] || planets['Chandra (Moon)'];
  let moonData = moon;
  if (!moonData) {
    const key = Object.keys(planets).find(k => k.toLowerCase().includes('moon'));
    moonData = planets[key];
  }
  const moonHouse = moonData ? (moonData.HousePlanetIsIn || moonData.house) : null;

  let marsHouseMoon = null;
  if (marsHouseLagna && moonHouse) {
    marsHouseMoon = (marsHouseLagna - moonHouse + 1);
    while (marsHouseMoon <= 0) marsHouseMoon += 12;
  }

  const presentInLagna = manglikHouses.includes(marsHouseLagna);
  const presentInMoon = manglikHouses.includes(marsHouseMoon);

  return {
    presentInLagna,
    presentInMoon,
    marsHouseLagna,
    marsHouseMoon,
    summary: (presentInLagna || presentInMoon)
      ? `Mangal Dosha is present in your chart.`
      : `Mangal Dosha is present neither in Lagna Chart nor in Moon Chart.`
  };
};

const analyzePitraDosha = (planets) => {
  const sun = planets['Sun'] || planets['Surya'];
  const rahu = planets['Rahu'];
  const saturn = planets['Saturn'] || planets['Shani'];

  const sunHouse = sun ? (sun.HousePlanetIsIn || sun.house) : null;
  const rahuHouse = rahu ? (rahu.HousePlanetIsIn || rahu.house) : null;
  const saturnHouse = saturn ? (saturn.HousePlanetIsIn || saturn.house) : null;

  let isPresent = false;
  let reasons = [];

  if (sunHouse && rahuHouse && sunHouse === rahuHouse) {
    isPresent = true;
    reasons.push(`Sun and Rahu are conjunct in ${sunHouse}th house`);
  }

  if (sunHouse === 9) {
    reasons.push(`Sun is placed in 9th house (house of ancestors)`);
    isPresent = true;
  }

  if ((saturnHouse === 9 || rahuHouse === 9)) {
    reasons.push(`Malefic planet in 9th house affecting ancestral blessings`);
    isPresent = true;
  }

  return {
    isPresent,
    reasons,
    sunHouse,
    rahuHouse,
    saturnHouse,
    summary: isPresent
      ? 'Pitra Dosha is indicated in your birth chart.'
      : 'No significant Pitra Dosha is found in your chart.'
  };
};

const analyzeKalsarpDosha = (planets) => {
  const rahu = planets['Rahu'];
  const ketu = planets['Ketu'];

  if (!rahu || !ketu) {
    return {
      isPresent: false,
      type: 'Cannot determine',
      summary: 'Insufficient data to determine Kalsarp Dosha'
    };
  }

  const rahuDegree = parseFloat(rahu.NirayanaLongitude?.TotalDegrees || 0);
  const ketuDegree = parseFloat(ketu.NirayanaLongitude?.TotalDegrees || 0);

  const sevenPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const planetDegrees = [];

  sevenPlanets.forEach(planetName => {
    const planet = planets[planetName];
    if (planet && planet.NirayanaLongitude) {
      const degree = parseFloat(planet.NirayanaLongitude.TotalDegrees || 0);
      planetDegrees.push({ name: planetName, degree });
    }
  });

  let allBetween = true;
  let oppositeAxis = (rahuDegree + 180) % 360;

  for (const planet of planetDegrees) {
    const deg = planet.degree;
    const isInRahuSide = (deg >= rahuDegree && deg <= oppositeAxis) ||
      (rahuDegree > oppositeAxis && (deg >= rahuDegree || deg <= oppositeAxis));

    if (!isInRahuSide && deg !== rahuDegree && deg !== oppositeAxis) {
      allBetween = false;
      break;
    }
  }

  const rahuHouse = rahu.HousePlanetIsIn || rahu.house || 1;
  const kalsarpTypes = [
    'Anant Kalsarp', 'Kulik Kalsarp', 'Vasuki Kalsarp', 'Shankhpal Kalsarp',
    'Padma Kalsarp', 'Mahapadma Kalsarp', 'Takshak Kalsarp', 'Karkotak Kalsarp',
    'Shankhachud Kalsarp', 'Ghatak Kalsarp', 'Vishdhar Kalsarp', 'Sheshnag Kalsarp'
  ];

  const type = kalsarpTypes[rahuHouse - 1] || 'Kalsarp Yoga';

  return {
    isPresent: allBetween,
    type: allBetween ? type : 'Not Present',
    rahuHouse,
    ketuHouse: ((rahuHouse + 5) % 12) + 1,
    summary: allBetween
      ? `${type} Dosha is present in your chart.`
      : 'Kalsarp Dosha is not present in your chart.'
  };
};

const analyzeSadesati = (planets) => {
  const moon = planets['Moon'] || planets['Chandra'];
  const saturn = planets['Saturn'] || planets['Shani'];

  if (!moon || !saturn) {
    return {
      isPresent: false,
      phase: 'Cannot determine',
      summary: 'Insufficient data to determine Sadesati'
    };
  }

  const moonSign = moon.Sign?.Name || moon.sign;
  const saturnSign = saturn.Sign?.Name || saturn.sign;

  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

  const moonIndex = signs.indexOf(moonSign);
  const saturnIndex = signs.indexOf(saturnSign);

  if (moonIndex === -1 || saturnIndex === -1) {
    return {
      isPresent: false,
      phase: 'Cannot determine',
      summary: 'Sign data not available'
    };
  }

  let relativePosition = (saturnIndex - moonIndex + 12) % 12;

  let isPresent = false;
  let phase = '';
  let description = '';

  if (relativePosition === 11) {
    isPresent = true;
    phase = 'First Phase (Rising) - Shani in 12th from Moon';
    description = 'This is the beginning phase of Sadesati. It may bring challenges related to expenses, losses, and mental stress.';
  } else if (relativePosition === 0) {
    isPresent = true;
    phase = 'Second Phase (Peak) - Shani in Moon Sign';
    description = 'This is the most intense phase of Sadesati. It tests your patience and resilience. Focus on hard work and spiritual practices.';
  } else if (relativePosition === 1) {
    isPresent = true;
    phase = 'Third Phase (Setting) - Shani in 2nd from Moon';
    description = 'This is the concluding phase of Sadesati. Challenges begin to ease, and you start seeing the fruits of your hard work.';
  }

  return {
    isPresent,
    phase,
    description,
    moonSign,
    saturnSign,
    summary: isPresent
      ? `You are currently in ${phase} of Sadesati.`
      : 'You are not currently in Sadesati period.'
  };
};


const getAIPredictions = async (details, planets, tithi, nakshatra, chartSvg = null) => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️ Gemini AI not initialized - Life Predictions will not be generated (Missing API Key)');
    return null;
  }

  // Models to try in order of preference
  const modelsToTry = ['gemini-1.5-flash', 'gemini-2.0-flash-exp', 'gemini-pro-latest'];


  for (const modelName of modelsToTry) {
    try {
      console.log(`🤖 Generating AI-powered Life Predictions using model: ${modelName}...`);

      const localGenAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const localModel = localGenAI.getGenerativeModel({ model: modelName });

      const prompt = `You are an expert Vedic astrologer. Generate a comprehensive "Life Predictions" report based on these birth chart details:

Name: ${details.name || 'Unknown'}
Birth Date: ${details.dateOfBirth || 'Unknown'}
Birth Time: ${details.timeOfBirth || 'Unknown'}
Moon Sign: ${planets['Moon']?.Sign?.Name || planets['Moon']?.Sign || 'Unknown'}
Nakshatra: ${nakshatra?.Name || nakshatra || 'Unknown'}
Sun Sign: ${planets['Sun']?.Sign?.Name || planets['Sun']?.Sign || 'Unknown'}

Generate detailed predictions (3-5 sentences each) for:

1. Character & Personality: Core traits, strengths, weaknesses
2. Happiness & Contentment: Sources of joy and emotional well-being
3. Fulfillment & Purpose: Life purpose and spiritual growth
4. Lifestyle & Habits: Daily routines and living patterns
5. Career & Professional Life: Career trajectory and success
6. Occupation & Business: Suitable professions and ventures
7. Health & Wellness: Physical health and recommendations
8. Hobbies & Interests: Creative pursuits and activities
9. Love & Relationships: Romance, marriage, relationships
10. Finance & Wealth: Financial status and wealth accumulation
11. Education & Learning: Academic achievements and intellectual pursuits

12. Planetary Position Analysis: ${chartSvg ? 'Carefully examine the birth chart image provided and analyze the planetary positions. Describe what the positions of the 9 planets in their respective houses and signs signify for this person. Be specific about which planets are in which signs/houses based on what you see in the chart.' : 'Provide general planetary analysis based on the Moon and Sun signs provided.'}

13. Divisional Chart Insights: A summary of what divisional charts (D1, D9, D10, etc.) reveal about destiny and life areas.

14. Sadesati Analysis: Identify the three phases of Sadesati (Rising, Peak, Setting) for this user based on their Moon sign. Provide the Phase name, Saturn Sign during that phase, and approximate Start and End years (e.g., "Jan 2025" to "Aug 2027").

Return ONLY this JSON structure:
{
  "lifePredictions": {
    "character": "text",
    "happiness": "text",
    "fulfillment": "text",
    "lifestyle": "text",
    "career": "text",
    "occupation": "text",
    "health": "text",
    "hobbies": "text",
    "loveMatters": "text",
    "finance": "text",
    "education": "text"
  },
  "planetaryAnalysis": "text",
  "divisionalInsights": "text",
  "sadeSatiPhases": [
    { "Phase": "First Phase (Rising)", "SaturnSign": "Sign Name", "StartDate": "Date/Year", "EndDate": "Date/Year" },
    { "Phase": "Second Phase (Peak)", "SaturnSign": "Sign Name", "StartDate": "Date/Year", "EndDate": "Date/Year" },
    { "Phase": "Third Phase (Setting)", "SaturnSign": "Sign Name", "StartDate": "Date/Year", "EndDate": "Date/Year" }
  ]
}
`;

      console.log(`📤 Sending request to Gemini AI (${modelName})...`);

      // If chart SVG is available, use vision-based analysis
      let result;
      if (chartSvg && typeof chartSvg === 'string' && chartSvg.includes('<svg')) {
        console.log('📊 Using vision-based analysis for planetary positions...');
        const svgBase64 = Buffer.from(chartSvg).toString('base64');
        result = await localModel.generateContent([
          prompt,
          {
            inlineData: {
              data: svgBase64,
              mimeType: 'image/svg+xml'
            }
          }
        ]);
      } else {
        console.log('📝 Using text-based analysis (no chart image available)...');
        result = await localModel.generateContent(prompt);
      }

      const response = await result.response;
      let text = response.text().trim();

      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      let predictions;
      try {
        predictions = JSON.parse(text);
      } catch (parseError) {
        throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
      }

      if (!predictions.lifePredictions) {
        throw new Error('AI response missing required lifePredictions key');
      }

      return predictions;

    } catch (err) {
      console.error(`❌ Error with model ${modelName}:`, err.message);
    }
  }

  return null;
};

/**
 * Generates personalized karmic explanations for all divisional charts (D1, D9, D60, etc.)
 */
const getDivisionalKarmicExplanations = async (details, planets, chartSvgs = {}) => {
  if (!process.env.GEMINI_API_KEY) return {};

  console.log('\n🔍 getDivisionalKarmicExplanations called with vision-based analysis');

  const localGenAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // Use vision-capable model
  const localModel = localGenAI.getGenerativeModel({ model: 'gemini-1.5-flash' });


  const divisionalCharts = [
    { id: 'RasiD1', name: 'D1 - Rasi Chart (Main Birth Chart)', description: 'Overall life, personality, and general life path' },
    { id: 'HoraD2', name: 'D2 - Hora Chart', description: 'Wealth and prosperity' },
    { id: 'DrekkanaD3', name: 'D3 - Drekkana Chart', description: 'Siblings and courage' },
    { id: 'ChaturthamshaD4', name: 'D4 - Chaturthamsha Chart', description: 'Property and assets' },
    { id: 'SaptamshaD7', name: 'D7 - Saptamsha Chart', description: 'Children and progeny' },
    { id: 'NavamshaD9', name: 'D9 - Navamsha Chart', description: 'Marriage and dharma' },
    { id: 'DashamamshaD10', name: 'D10 - Dashamamsha Chart', description: 'Career and profession' },
    { id: 'DwadashamshaD12', name: 'D12 - Dwadashamsha Chart', description: 'Parents and ancestry' },
    { id: 'ShodashamshaD16', name: 'D16 - Shodashamsha Chart', description: 'Vehicles and comforts' },
    { id: 'ChaturvimshamshaD24', name: 'D24 - Chaturvimshamsha Chart', description: 'Education and learning' },
    { id: 'BhamshaD27', name: 'D27 - Saptavimshamsha Chart', description: 'Strength and weaknesses' },
    { id: 'AkshavedamshaD45', name: 'D45 - Akshavedamsha Chart', description: 'General well-being' },
    { id: 'ShashtyamshaD60', name: 'D60 - Shashtyamsha Chart', description: 'Past life karma' }
  ];

  const results = {};

  // Batch charts to avoid hitting AI output limits or timeouts
  const batches = [
    divisionalCharts.slice(0, 4),
    divisionalCharts.slice(4, 8),
    divisionalCharts.slice(8)
  ];

  console.log(`🤖 Generating detailed karmic explanations for ${divisionalCharts.length} charts using VISION analysis in 3 batches...`);

  for (const batch of batches) {
    // Process each chart in the batch
    for (const chart of batch) {
      const chartSvg = chartSvgs[`${chart.id}_South`] || chartSvgs[`${chart.id}_North`];

      if (!chartSvg || typeof chartSvg !== 'string' || !chartSvg.includes('<svg')) {
        console.warn(`⚠️ No valid SVG found for ${chart.name}, skipping vision analysis`);
        continue;
      }

      try {
        // Convert SVG to base64 PNG for Gemini
        console.log(`📊 Analyzing ${chart.name} using vision...`);

        // Create a data URL from SVG
        const svgBase64 = Buffer.from(chartSvg).toString('base64');
        const svgDataUrl = `data:image/svg+xml;base64,${svgBase64}`;

        const prompt = `You are a Vedic Karmic Astrologer analyzing a ${chart.name} divisional chart.

This chart represents: ${chart.description}

Carefully examine the chart image and identify the planetary placements (which planets are in which zodiac signs/houses).

Then provide a personalized "Karmic Explanation" with the following sections:

**Karmic Meaning**: Explain the past-life context of these specific planetary placements in this divisional chart.

**Past life involvement**: List 3-4 bullet points about specific past-life scenarios (e.g., power dynamics, relationships, spiritual practices, etc.)

**Karma related to**: Describe whether these placements indicate misuse of abilities or good deeds from past lives.

**Effect in this life**: Explain what the person experiences now due to these karmic patterns (be specific based on the actual planetary positions you see).

**One-line summary**: A concise takeaway about this chart's karmic message.

Use a professional, mystical, and empathetic tone. Use emojis like 🔵 (Mercury), 🔴 (Mars), 🟡 (Jupiter), 🟢 (Venus), ⚫ (Saturn), ☊ (Rahu), ☋ (Ketu), 🌕 (Moon), ☀️ (Sun) for planets.

Format your response in clean markdown with proper headings and structure.`;

        const result = await localModel.generateContent([
          prompt,
          {
            inlineData: {
              data: svgBase64,
              mimeType: 'image/svg+xml'
            }
          }
        ]);

        const response = await result.response;
        const text = response.text().trim();

        results[chart.id] = text;
        console.log(`✅ ${chart.name} analysis complete`);

      } catch (err) {
        console.error(`❌ Error analyzing ${chart.name}:`, err.message);
        // Fallback to generic description
        results[chart.id] = `### ${chart.name}\n\n${chart.description}\n\n*Detailed karmic analysis requires chart data.*`;
      }
    }

    console.log(`📦 Batch complete. Collected ${Object.keys(results).length}/${divisionalCharts.length} explanations.`);
  }

  return results;
};


// North Indian chart (VedAstro style: midpoint diamond + corner triangles).
// All positions set so each number sits clearly INSIDE its house (not on or outside boundaries).
// Layout: 1 top-center, 2 top-left, 3 left-top, 4 left-center, 5 left-bottom, 6 bottom-left,
//         7 bottom-center, 8 bottom-right, 9 right-bottom, 10 right-center, 11 right-top, 12 top-right.
// Normalized (0–1); px = x + size*nx, py = y + size*ny.
const NORTH_INDIAN_HOUSE_POSITIONS = [
  { n: 1, nx: 0.5, ny: 0.16 },   // top-center diamond
  { n: 2, nx: 0.22, ny: 0.20 },  // top-left (clearly in top-left triangle)
  { n: 3, nx: 0.14, ny: 0.34 },  // left-top (clearly in left-top triangle)
  { n: 4, nx: 0.14, ny: 0.5 },   // left-center diamond
  { n: 5, nx: 0.18, ny: 0.64 },  // left-bottom
  { n: 6, nx: 0.30, ny: 0.74 },  // bottom-left
  { n: 7, nx: 0.5, ny: 0.78 },   // bottom-center diamond
  { n: 8, nx: 0.58, ny: 0.74 },  // bottom-right
  { n: 9, nx: 0.74, ny: 0.62 },  // right-bottom
  { n: 10, nx: 0.78, ny: 0.5 },  // right-center diamond
  { n: 11, nx: 0.78, ny: 0.30 }, // right-top (clearly in right-top triangle)
  { n: 12, nx: 0.72, ny: 0.20 }  // top-right (clearly in top-right triangle)
];

const drawNorthIndianHouseNumbers = (doc, x, y, size, options = {}) => {
  const fontSize = Math.max(11, Math.min(15, Math.round(size / 11))) || 12;
  const fillColor = options.houseNumberColor || '#1a237e';
  const box = 22;
  // Large white badge behind each number so it always appears on top of SVG planet labels
  const badgeHalf = 16;
  doc.font('Helvetica-Bold').fontSize(fontSize).fillColor(fillColor);
  NORTH_INDIAN_HOUSE_POSITIONS.forEach(({ n, nx, ny }) => {
    const px = x + size * nx;
    const py = y + size * ny;
    const textY = py + fontSize / 2;
    const left = px - box / 2;
    // White rect so number is never covered by VedAstro planet text (drawn after SVG)
    doc.fillColor('white')
      .rect(px - badgeHalf, py - badgeHalf, badgeHalf * 2, badgeHalf * 2)
      .fill();
    doc.strokeColor('#999').lineWidth(0.5)
      .rect(px - badgeHalf, py - badgeHalf, badgeHalf * 2, badgeHalf * 2)
      .stroke();
    doc.fillColor(fillColor);
    doc.text(String(n), left, textY, { width: box, align: 'center' });
  });
  doc.fillColor('black');
};

// North Indian chart: centroid ratios for 12 houses (resolution-independent).
// center_x = W * ratio_x, center_y = H * ratio_y. Source: mathematical layout (diagonals + midlines).
const NORTH_INDIAN_HOUSE_CENTROIDS = [
  { n: 1, rx: 0.50, ry: 0.20 },   // W/2, H×0.22  (top-center)
  { n: 2, rx: 0.30, ry: 0.17 },  // W×0.25, H×0.15 (top-left)
  { n: 12, rx: 0.70, ry: 0.17 }, // W×0.75, H×0.15 (top-right)
  { n: 3, rx: 0.16, ry: 0.34 }, // W×0.12, H×0.35 (left-top)
  { n: 11, rx: 0.84, ry: 0.34 }, // W×0.88, H×0.35 (right-top)
  { n: 4, rx: 0.30, ry: 0.54 }, // W×0.25, H×0.55 (left-center)
  { n: 10, rx: 0.70, ry: 0.54 }, // W×0.75, H×0.55 (right-center)
  { n: 5, rx: 0.16, ry: 0.74 }, // W×0.12, H×0.75 (left-bottom)
  { n: 9, rx: 0.84, ry: 0.74 },  // W×0.88, H×0.75 (right-bottom)
  { n: 6, rx: 0.30, ry: 0.88 },  // W×0.25, H×0.92 (bottom-left)
  { n: 7, rx: 0.50, ry: 0.80 },  // W/2, H×0.82 (bottom-center)
  { n: 8, rx: 0.70, ry: 0.88 }  // W×0.75, H×0.92 (bottom-right)
];

// Classical North Indian kundali using exact mathematical construction:
// Rectangle W×H, outer frame, 2 main diagonals, vertical midline (x=W/2), horizontal midline (y=H/2).
// House centers from centroid ratios. Thick black on white, numbers 1–12 only, sans-serif centered.
const drawClassicalNorthIndianChart = (doc, x, y, W, H) => {
  const lineWidth = Math.max(2, Math.min(3.5, Math.min(W, H) / 100));
  const cx = x + W / 2;
  const cy = y + H / 2;
  doc.strokeColor('black').lineWidth(lineWidth);

  // White background
  doc.fillColor('white').rect(x, y, W, H).fill();
  doc.strokeColor('black');

  // 1. Outer rectangle: (0,0) → (W,H) in local coords → (x,y) to (x+W, y+H)
  doc.rect(x, y, W, H).stroke();

  // 2. Main diagonals (diamond grid)
  doc.moveTo(x, y).lineTo(x + W, y + H).stroke();
  doc.moveTo(x + W, y).lineTo(x, y + H).stroke();

  // 3. Vertical midline: x = W/2
  doc.moveTo(cx, y).lineTo(cx, y + H).stroke();

  // 4. Horizontal midline: y = H/2
  doc.moveTo(x, cy).lineTo(x + W, cy).stroke();

  // House numbers 1–12 at centroid positions: center_x = x + W*rx, center_y = y + H*ry
  const fontSize = Math.max(10, Math.min(16, Math.round(Math.min(W, H) / 18))) || 12;
  const box = 20;
  doc.font('Helvetica').fontSize(fontSize).fillColor('black');
  NORTH_INDIAN_HOUSE_CENTROIDS.forEach(({ n, rx, ry }) => {
    const px = x + W * rx;
    const py = y + H * ry;
    doc.text(String(n), px - box / 2, py + fontSize / 2, { width: box, align: 'center' });
  });
  doc.fillColor('black');
};


// VedAstro NorthIndianChart API returns SVG with grid + planets only; it does NOT include house numbers 1–12.
// We always overlay house numbers in the backend when embedding in PDF (drawNorthIndianHouseNumbers).
// Extract SVG string from API response (may be raw string, or { Payload: "..." } or similar).
const getChartSvgString = (data) => {
  if (!data) return null;
  if (typeof data === 'string') return data;
  if (typeof data === 'object') {
    if (data.Payload && typeof data.Payload === 'string') return data.Payload;
    if (data.SVG && typeof data.SVG === 'string') return data.SVG;
    if (data.svg && typeof data.svg === 'string') return data.svg;
    const firstVal = Object.values(data)[0];
    if (typeof firstVal === 'string' && firstVal.includes('<svg')) return firstVal;
  }
  return null;
};

// Helper for charts
const embedAstroChart = (doc, title, svg, size = 300, options = {}) => {
  if (typeof options === 'boolean') options = { drawHouseNumbers: options };
  const drawHouseNumbers = options.drawHouseNumbers === true;

  const svgStr = getChartSvgString(svg);
  console.log(`📊 embedAstroChart called: title="${title}", svg=${svgStr ? (svgStr.includes('<svg') ? 'Valid SVG' : 'Invalid SVG (no <svg tag)') : 'NULL/UNDEFINED'}`);

  if (!svgStr) {
    console.warn(`⚠️ embedAstroChart: SVG is null/undefined for "${title}"`);
    doc.fontSize(10).fillColor('orange').text(`[Chart "${title}" - No SVG data]`, { align: 'center' });
    doc.fillColor('black');
    doc.moveDown();
    return;
  }

  if (!svgStr.includes('<svg')) {
    console.warn(`⚠️ embedAstroChart: SVG doesn't contain <svg tag for "${title}". First 100 chars: ${svgStr.substring(0, 100)}`);
    doc.fontSize(10).fillColor('orange').text(`[Chart "${title}" - Invalid SVG format]`, { align: 'center' });
    doc.fillColor('black');
    doc.moveDown();
    return;
  }

  if (doc.y + size + 40 > doc.page.height - 50) {
    doc.addPage();
  }

  if (title) {
    doc.fontSize(14).text(title, { align: 'center', underline: true });
    doc.moveDown(0.5);
  }

  const x = (doc.page.width - size) / 2;
  const y = doc.y;

  try {
    // 🧹 Clean SVG: Remove XML headers and anything before <svg
    let cleanSvg = svgStr.substring(svgStr.indexOf('<svg'));
    if (!cleanSvg.includes('</svg>')) cleanSvg += '</svg>';

    console.log(`✅ Rendering SVG for "${title}" at position (${x}, ${y})`);
    SVGtoPDF(doc, cleanSvg, x, y, { width: size, height: size, assumePt: true, preserveAspectRatio: 'xMidYMid meet' });
    doc.y = y + size + 20; // Move cursor down below the chart
    console.log(`✅ Successfully rendered SVG for "${title}"`);
  } catch (err) {
    console.error(`❌ Error rendering SVG for "${title}":`, err.message);
    doc.fillColor('red').fontSize(10).text(`(Error rendering ${title}: ${err.message})`, { align: 'center' });
    doc.fillColor('black');
    doc.y = y + 20;
    return;
  }

  // VedAstro North Indian chart SVG does not include house numbers 1–12; we always draw them on top.
  if (drawHouseNumbers) {
    const chartX = (doc.page.width - size) / 2;
    const chartY = doc.y - size - 20; // same y as chart (we advanced doc.y above)
    drawNorthIndianHouseNumbers(doc, chartX, chartY, size, options);
  }
};

// Helper to parse date and time into VedAstro format
const parseVedAstroTime = (dateOfBirth, timeOfBirth, timezone = 'Asia/Kolkata') => {
  const dateObj = new Date(dateOfBirth);
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  const time = timeOfBirth || '12:00';

  const getTimezoneOffset = (tz) => {
    const timezoneMap = {
      'Asia/Kolkata': '+05:30', 'Asia/Calcutta': '+05:30',
      'America/New_York': '-05:00', 'America/Los_Angeles': '-08:00',
      'Europe/London': '+00:00', 'Asia/Dubai': '+04:00',
      'Asia/Singapore': '+08:00', 'Australia/Sydney': '+10:00',
    };
    if (timezoneMap[tz]) return timezoneMap[tz];
    if (/^[+-]\d{2}:\d{2}$/.test(tz)) return tz;
    return '+05:30';
  };

  const offset = getTimezoneOffset(timezone);
  return `${time}/${day}/${month}/${year}/${offset}`;
};

// Orchestrator to fetch all data for the report
const fetchComprehensiveAstroData = async (details) => {
  const { dateOfBirth, timeOfBirth, coordinates, timezone } = details;
  const VEDASTRO_API = process.env.VEDASTRO_API_URL || 'http://localhost:7071';
  const apiBase = VEDASTRO_API.endsWith('/api') ? VEDASTRO_API : `${VEDASTRO_API}/api`;
  const baseUrl = `${apiBase}/Calculate`;

  const timeString = parseVedAstroTime(dateOfBirth, timeOfBirth, timezone);

  // Format coordinates correctly (remove spaces)
  let locationString = '28.11,79.22';
  if (coordinates) {
    try {
      const coords = coordinates.split(',').map(c => c.trim());
      if (coords.length === 2) {
        locationString = `${coords[0]},${coords[1]}`;
      }
    } catch (e) {
      console.warn('⚠️ Error formatting coordinates in fetchComprehensiveAstroData:', e.message);
      locationString = coordinates.replace(/\s+/g, '');
    }
  }

  const ayanamsa = 'LAHIRI';

  const divisionalCharts = [
    'RasiD1', 'HoraD2', 'DrekkanaD3', 'ChaturthamshaD4', 'SaptamshaD7',
    'NavamshaD9', 'DashamamshaD10', 'DwadashamshaD12', 'ShodashamshaD16',
    'VimshamshaD20', 'ChaturvimshamshaD24', 'BhamshaD27',
    'TrimshamshaD30', 'KhavedamshaD40', 'AkshavedamshaD45', 'ShashtyamshaD60'
  ];

  const planetsForAshtakvarga = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];


  const requests = {
    // Panchang
    tithi: `${baseUrl}/LunarDay/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}`,
    nakshatra: `${baseUrl}/MoonConstellation/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}`,
    yoga: `${baseUrl}/NithyaYoga/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}`,
    karana: `${baseUrl}/Karana/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}`,
    dayOfWeek: `${baseUrl}/DayOfWeek/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}`,

    // Planet Data
    planets: `${baseUrl}/AllPlanetData/PlanetName/All/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}`,

    // Dasha (Level 2 for balance between detail and length)
    dasha: `${baseUrl}/DasaForLife/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}/Levels/2`,

    // Predictions
    predictions: `${baseUrl}/HoroscopePredictions/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}`,

    // Sarvashtakvarga
    sarvashtakvarga: `${baseUrl}/SarvashtakavargaChart/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}`
  };

  // Build requests for all 16 Divisional Charts in both North and South styles
  divisionalCharts.forEach(type => {
    requests[`${type}_North`] = `${baseUrl}/NorthIndianChart/Location/${locationString}/Time/${timeString}/ChartType/${type}/Ayanamsa/${ayanamsa}`;
    requests[`${type}_South`] = `${baseUrl}/SouthIndianChart/Location/${locationString}/Time/${timeString}/ChartType/${type}/Ayanamsa/${ayanamsa}`;
  });

  // Build requests for individual Planet Ashtakvarga
  planetsForAshtakvarga.forEach(planet => {
    requests[`ashtakvarga_${planet}`] = `${baseUrl}/BhinnashtakavargaChart/PlanetName/${planet}/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}`;
  });

  console.log(`🚀 Starting massive data fetch (50+ items) for ${timeString} from ${baseUrl}...`);
  const results = {};

  // Use Promise.all with batching for local robustness
  const entries = Object.entries(requests);
  const CHUNK_SIZE = 3; // Batch size for faster local processing
  for (let i = 0; i < entries.length; i += CHUNK_SIZE) {
    const chunk = entries.slice(i, i + CHUNK_SIZE);
    await Promise.all(chunk.map(async ([key, url]) => {
      try {
        const response = await axios.get(url, { timeout: 120000 });
        let data = response.data.Payload || response.data;

        // 🛠️ Normalize Data: Convert Array Payload to Object (Fix for Local VedAstro)
        // Only apply normalization if it's an array of single-key objects (like Planet Data)
        if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && Object.keys(data[0]).length === 1) {
          const payloadObj = {};
          data.forEach(item => {
            const keys = Object.keys(item);
            if (keys.length > 0) {
              const k = keys[0];
              payloadObj[k] = item[k];
            }
          });
          data = payloadObj;
        }

        results[key] = data;
        console.log(`✅ Fetched ${key}: ${results[key] ? 'Has data' : 'Empty/null'}`);
      } catch (err) {
        console.warn(`⚠️ Failed to fetch ${key}: ${err.message}`);
        results[key] = null;
      }
    }));
    console.log(`📦 Progress: ${Math.min(i + CHUNK_SIZE, entries.length)}/${entries.length} requests completed.`);
  }

  // Final validation of critical keys
  if (results.planets && Object.keys(results.planets).length < 2) {
    console.warn('⚠️ results.planets is unexpectedly small. Re-checking AllPlanetData structure...');
    // If it's still weird, it might not be the array format we expected
  }

  // Debug: Log summary of what was fetched
  console.log('\n📊 Data Fetch Summary:');
  console.log(`  - Planets data: ${results.planets ? (Object.keys(results.planets).length + ' planets') : 'Missing'}`);
  console.log(`  - Dasha data: ${results.dasha ? 'Available' : 'Missing'}`);
  console.log(`  - Predictions: ${results.predictions ? 'Available' : 'Missing'}`);
  console.log(`  - Charts fetched: ${Object.keys(results).filter(k => (k.includes('_North') || k.includes('_South')) && results[k] && results[k].includes('<svg')).length}`);
  console.log(`  - Ashtakvarga tables: ${Object.keys(results).filter(k => k.includes('ashtakvarga_')).length}`);

  return results;
};

// Generate PDF Report
exports.generatePDF = async (req, res) => {
  try {
    const { name, dateOfBirth, timeOfBirth, placeOfBirth, gender, coordinates, timezone } = req.body;

    // Fetch all required data (Massive fetch for 50-page report)
    const astroData = await fetchComprehensiveAstroData(req.body);

    // Check AI availability before fetching
    console.log('\n🤖 AI Model Status Check:');
    console.log(`  - aiModel variable: ${aiModel ? 'INITIALIZED' : 'NULL/UNDEFINED'}`);
    console.log(`  - process.env.GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? `EXISTS (length: ${process.env.GEMINI_API_KEY.length}, starts with: ${process.env.GEMINI_API_KEY.substring(0, 10)}...)` : 'NOT FOUND'}`);

    if (!aiModel) {
      console.warn('⚠️ Gemini AI not initialized - AI Predictions will be skipped');
      console.warn('   To enable AI Predictions, set GEMINI_API_KEY in your environment variables');
      console.warn('   Current env check:', process.env.GEMINI_API_KEY ? `Key exists (length: ${process.env.GEMINI_API_KEY.length})` : 'Key NOT found');
      console.warn('   Check: backend/.env file should contain GEMINI_API_KEY=your_key_here');
      console.warn('   Note: Server must be restarted after adding/updating .env file');
    } else {
      console.log('✅ Gemini AI model is initialized and ready');
      console.log('🤖 Fetching AI Predictions for the report...');
    }
    // Pass D1 chart SVG for vision-based planetary analysis
    const d1ChartSvg = astroData.RasiD1_South || astroData.RasiD1_North;
    const aiData = await getAIPredictions(req.body, astroData.planets || {}, astroData.tithi, astroData.nakshatra, d1ChartSvg);

    // Fetch deep karmic insights for each divisional chart using VISION analysis
    console.log('🤖 Fetching deep karmic insights for divisional charts using vision-based analysis...');
    const divisionalKarmicInsights = await getDivisionalKarmicExplanations(req.body, astroData.planets, astroData);


    // Debug: Check what AI data we actually received
    console.log('\n🔍 AI Predictions Result Check:');
    console.log(`  - aiData: ${aiData ? 'EXISTS' : 'NULL/UNDEFINED'}`);
    if (aiData) {
      console.log(`  - aiData keys: ${Object.keys(aiData).join(', ')}`);
      console.log(`  - lifePredictions: ${aiData.lifePredictions ? 'EXISTS' : 'MISSING'}`);
      if (aiData.lifePredictions) {
        console.log(`  - lifePredictions keys: ${Object.keys(aiData.lifePredictions).join(', ')}`);
      }
    } else {
      console.log('  - ⚠️ aiData is null - AI predictions failed or returned null');
    }

    // Debug: Check what data we actually received
    console.log('\n🔍 PDF Generation - Data Check:');
    console.log(`  - Total keys in astroData: ${Object.keys(astroData).length}`);
    console.log(`  - Planets: ${astroData.planets ? Object.keys(astroData.planets).length + ' planets' : 'MISSING'}`);
    console.log(`  - Tithi: ${astroData.tithi?.Name || 'MISSING'}`);
    console.log(`  - Nakshatra: ${astroData.nakshatra?.Name || 'MISSING'}`);
    console.log(`  - RasiD1_North SVG: ${astroData.RasiD1_North ? (astroData.RasiD1_North.includes('<svg') ? 'Valid SVG' : 'Not SVG') : 'MISSING'}`);

    const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
    res.setHeader('Content-Type', 'application/pdf');
    const safeName = (name || 'Kundali').replace(/[^\x00-\x7F]/g, '').replace(/\s+/g, '_') || 'Kundali';
    res.setHeader('Content-Disposition', `attachment; filename=${safeName}_Detailed_Report.pdf`);

    console.log('📄 PDF Document created, piping to response...');
    doc.pipe(res);
    console.log('✅ PDF piped to response stream');

    // Styling Constants - Professional Palette
    const COLORS = {
      primary: '#1a237e',    // Deep Indigo
      secondary: '#c62828',  // Deep Red
      accent: '#FFB300',     // Amber/Gold for highlights
      text: '#333333',       // Dark Grey (softer than black)
      lightText: '#666666',
      border: '#dddddd',
      headerBg: '#f0f2f5',   // Very light grey/blue for table headers
      tableAlt: '#fafafa'    // Almost white for zebra striping
    };

    // Register Hindi font (Nirmala.ttf)
    const hindiFontPath = 'C:/Windows/Fonts/Nirmala.ttf';
    let hasHindiFont = false;
    if (fs.existsSync(hindiFontPath)) {
      doc.registerFont('Nirmala', hindiFontPath);
      hasHindiFont = true;
    }
    // Default Font Family
    const fontRegular = hasHindiFont ? 'Nirmala' : 'Helvetica';
    const fontBold = hasHindiFont ? 'Nirmala' : 'Helvetica-Bold';

    // Helper: Add Header and Footer to all pages (except Cover)
    const addHeaderAndFooter = () => {
      const pages = doc.bufferedPageRange();
      for (let i = 1; i < pages.count; i++) { // Start from page 1 (skip cover page 0)
        doc.switchToPage(i);

        // --- Elegant Page Border (Thin double line) ---
        const margin = 20;
        doc.rect(margin, margin, doc.page.width - 2 * margin, doc.page.height - 2 * margin)
          .lineWidth(0.5)
          .strokeColor(COLORS.border)
          .stroke();

        doc.rect(margin + 3, margin + 3, doc.page.width - 2 * (margin + 3), doc.page.height - 2 * (margin + 3))
          .lineWidth(0.2)
          .strokeColor(COLORS.border)
          .stroke();

        // --- Header (Om Symbol & Title) ---
        const headerY = 35;
        doc.font(fontBold).fontSize(10).fillColor(COLORS.lightText)
          .text('VEDIC HOROSCOPE REPORT', margin + 15, headerY, { align: 'left' });

        doc.font(fontRegular).fontSize(10).fillColor(COLORS.lightText)
          .text(name || 'Valued Client', margin + 15, headerY, { align: 'right', width: doc.page.width - 2 * margin - 30 });

        // --- Footer (Page Number & Branding) ---
        const footerY = doc.page.height - 40;

        // Separator line
        doc.moveTo(margin + 15, footerY - 5)
          .lineTo(doc.page.width - margin - 15, footerY - 5)
          .lineWidth(0.5)
          .strokeColor(COLORS.border)
          .stroke();

        doc.font(fontRegular).fontSize(8).fillColor(COLORS.lightText)
          .text(`Astro Consult • ${new Date().getFullYear()}`, margin + 15, footerY, { align: 'left' });

        doc.text(`Page ${i + 1} of ${pages.count}`, 0, footerY, { align: 'center', width: doc.page.width });

        // --- DECORATIVE IMAGE IN LEFTOVER SPACE ---
        // Add a small decorative element (e.g., Om, Swastik, Kalash) just above the footer line

        const decorations = ['om1.jpeg', 'rudra2.jpg', 'yantra 1.jpg', 'kundaliIcon.png', 'NumIcon.png'];
        const decoImage = decorations[i % decorations.length];
        // Use path.join for reliable path construction on Windows
        const decoPath = path.join(__dirname, '..', '..', 'frontend', 'public', 'images', decoImage);

        // Debug log to trace why images might not be showing
        // console.log(`[PDF] Page ${i}: Attempting to add decoration from ${decoPath}`);

        if (fs.existsSync(decoPath)) {
          try {
            // Check opacity and coordinates
            // console.log(`[PDF] Adding image at ${doc.page.width - margin - 50}, ${footerY - 45}`);
            doc.image(decoPath, doc.page.width - margin - 50, footerY - 45, { width: 40, opacity: 0.8 }); // Increased opacity and size slightly
          } catch (imgErr) {
            console.error(`[PDF] Error adding decoration image: ${imgErr.message}`);
          }
        } else {
          // console.warn(`[PDF] Decoration image not found: ${decoPath}`);
        }
      }
    };

    // Helper: Draw Modern Section Header (Optimized for space)
    const drawSectionHeader = (title, subtitle = null) => {
      doc.moveDown(0.8);

      // Decorative top dash
      const centerX = doc.page.width / 2;
      doc.moveTo(centerX - 20, doc.y).lineTo(centerX + 20, doc.y)
        .lineWidth(2).strokeColor(COLORS.accent).stroke();

      doc.moveDown(0.3);
      doc.font(fontBold).fontSize(18).fillColor(COLORS.primary)
        .text(title.toUpperCase(), { align: 'center', letterSpacing: 1 });

      if (subtitle) {
        doc.moveDown(0.2);
        doc.font(fontRegular).fontSize(10).fillColor(COLORS.secondary)
          .text(subtitle.toUpperCase(), { align: 'center', letterSpacing: 1.5 });
      }
      doc.moveDown(0.8);
    };

    // Helper: Modern Table (No vertical lines, clean headers)
    const drawAstrologyTable = (doc, headers, rows, options = {}) => {
      const {
        startX = 50,
        startY = doc.y + 10,
        columnWidth = 80,
        rowHeight = 30, // Taller rows for elegance
        fontSize = 10,
        headerBG = COLORS.primary,
        headerTextColor = '#ffffff'
      } = options;

      doc.font(fontRegular).fontSize(fontSize);
      let currentY = startY;

      // Ensure we have enough space for headers at least
      if (currentY + rowHeight > doc.page.height - 60) {
        doc.addPage();
        currentY = 50;
      }

      const getColWidth = (index) => Array.isArray(columnWidth) ? columnWidth[index] : columnWidth;
      const totalWidth = headers.reduce((acc, _, i) => acc + getColWidth(i), 0);

      const drawHeaders = (y) => {
        let x = startX;

        // Header background - fully opaque block
        doc.fillColor(headerBG).rect(startX, y, totalWidth, rowHeight).fill();

        doc.fillColor(headerTextColor).font(fontBold);
        headers.forEach((header, i) => {
          const w = getColWidth(i);
          // Center align text in header
          doc.text(header.toUpperCase(), x, y + 10, { width: w, align: 'center' });
          x += w;
        });
        return y + rowHeight;
      };

      currentY = drawHeaders(currentY);

      // Draw Rows
      doc.font(fontRegular);
      rows.forEach((row, i) => {
        if (currentY + rowHeight > doc.page.height - 60) {
          doc.addPage();
          currentY = 50;
          currentY = drawHeaders(currentY);
          doc.font(fontRegular); // Reset font after headers
        }

        // Zebra striping for readability (subtle)
        if (i % 2 === 0) {
          doc.fillColor(COLORS.tableAlt).rect(startX, currentY, totalWidth, rowHeight).fill();
        }

        let x = startX;
        doc.fillColor(COLORS.text);

        row.forEach((cell, j) => {
          const w = getColWidth(j);
          const text = cell ? cell.toString() : '-';

          // Draw horizontal bottom border for each row
          doc.moveTo(x, currentY + rowHeight)
            .lineTo(x + w, currentY + rowHeight)
            .lineWidth(0.5)
            .strokeColor(COLORS.border)
            .stroke();

          // Look cleaner without vertical lines
          doc.text(text, x + 5, currentY + 9, { width: w - 10, align: 'center', lineBreak: false, ellipsis: true });
          x += w;
        });
        currentY += rowHeight;
      });

      doc.y = currentY + 20;
    };

    // --- PAGE 1: PROFESSIONAL COVER PAGE ---
    console.log('📝 Creating Cover Page...');

    // Decorative border for cover page
    const coverMargin = 15;
    doc.rect(coverMargin, coverMargin, doc.page.width - 2 * coverMargin, doc.page.height - 2 * coverMargin)
      .lineWidth(3)
      .strokeColor(COLORS.primary)
      .stroke();

    // Inner thin border
    doc.rect(coverMargin + 5, coverMargin + 5, doc.page.width - 2 * (coverMargin + 5), doc.page.height - 2 * (coverMargin + 5))
      .lineWidth(1)
      .strokeColor(COLORS.accent)
      .stroke();

    // Center content
    const centerX = doc.page.width / 2;
    let cursorY = 120;

    // Brand Image (Ganeshji) - Circular clip preferably, or just neat
    const ganeshjiPath = 'C:/Users/User/Desktop/Astrology - run/frontend/public/images/ganeshji.jpg';
    if (fs.existsSync(ganeshjiPath)) {
      doc.image(ganeshjiPath, centerX - 50, cursorY, { width: 100, align: 'center' });
      cursorY += 130;
    } else {
      cursorY += 50;
    }

    doc.moveDown(1);

    // Subject Name
    doc.font(fontBold).fontSize(28).fillColor(COLORS.text)
      .text(name || 'Valued Client', { align: 'center' });

    // Birth Details Snippet
    doc.moveDown(0.8);
    doc.font(fontRegular).fontSize(12).fillColor(COLORS.text);
    const birthDateStr = new Date(dateOfBirth).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(`${birthDateStr} • ${timeOfBirth || 'Time N/A'}`, { align: 'center' });
    doc.text(placeOfBirth || 'Location N/A', { align: 'center' });

    doc.moveDown(2);

    // Title Section
    doc.font(fontRegular).fontSize(14).fillColor(COLORS.secondary)
      .text('SHUBH ॐ LABH', { align: 'center', letterSpacing: 5 });

    // Separator
    doc.moveDown(1.5);
    doc.moveTo(centerX - 100, doc.y).lineTo(centerX + 100, doc.y)
      .lineWidth(1).strokeColor(COLORS.accent).stroke();
    doc.moveDown(1.5);

    doc.font(fontBold).fontSize(32).fillColor(COLORS.primary)
      .text('VEDIC HOROSCOPE', { align: 'center' });

    doc.moveDown(0.5);
    doc.font(fontRegular).fontSize(16).fillColor(COLORS.lightText)
      .text('COMPREHENSIVE LIFE REPORT', { align: 'center', letterSpacing: 3 });

    // Bottom Branding
    const bottomY = doc.page.height - 100;
    doc.fontSize(10).fillColor(COLORS.lightText)
      .text('Prepared by', 0, bottomY, { align: 'center' });
    doc.moveDown(0.5);
    doc.font(fontBold).fontSize(16).fillColor(COLORS.primary)
      .text('Astro Consult', { align: 'center' });

    // --- PAGE 2: BIRTH DATA & PANCHANG ---
    doc.addPage();
    drawSectionHeader('Birth Particulars', 'Astronomical Details');

    const birthInfo = [
      ['Full Name', name || 'Unknown'],
      ['Date of Birth', new Date(dateOfBirth).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })],
      ['Time of Birth', timeOfBirth || 'Not Specified'],
      ['Place of Birth', placeOfBirth || 'Not Specified'],
      ['Gender', gender || 'Not Specified'],
      ['Coordinates', coordinates || 'N/A'],
      ['Timezone', timezone || 'Asia/Kolkata']
    ];

    drawAstrologyTable(doc, ['Field', 'Details'], birthInfo, { columnWidth: [180, 250], startX: 85 });

    doc.moveDown(2);
    drawSectionHeader('Panchang', 'Daily Planetary Status');

    const getPanchangValue = (val) => {
      if (!val) return 'N/A';
      if (typeof val === 'string') return val;
      return val.Name || val.Value || JSON.stringify(val);
    };

    const panchangInfo = [
      ['Tithi', `${getPanchangValue(astroData.tithi)} ${astroData.tithi?.Paksha ? '(' + astroData.tithi.Paksha + ')' : ''}`],
      ['Nakshatra', getPanchangValue(astroData.nakshatra)],
      ['Yoga', getPanchangValue(astroData.yoga)],
      ['Karana', getPanchangValue(astroData.karana)],
      ['Day', getPanchangValue(astroData.dayOfWeek)]
    ];
    drawAstrologyTable(doc, ['Element', 'Status'], panchangInfo, { columnWidth: [180, 250], startX: 85 });

    // --- PAGE 3: PLANETARY POSITIONS ---
    doc.addPage();
    drawSectionHeader('Planetary Alignments', 'Lagna & Planet Positions');

    if (astroData.planets) {
      const planetHeaders = ['Planet', 'Sign', 'Degree', 'House', 'Nakshatra', 'Pad'];
      const planetRows = Object.entries(astroData.planets).map(([p, data]) => {
        const degrees = Number(data.NirayanaLongitude?.TotalDegrees);
        const formattedDegrees = (!isNaN(degrees) ? degrees.toFixed(2) : '0.00') + '°';
        return [
          p,
          data.Sign?.Name || 'N/A',
          formattedDegrees,
          data.HousePlanetIsIn || 'N/A',
          data.Nakshatra?.Name || 'N/A',
          data.Nakshatra?.Pad || '1'
        ];
      });
      drawAstrologyTable(doc, planetHeaders, planetRows, { columnWidth: [80, 80, 80, 60, 100, 40] });

      // Add AI Planetary Position Commentary (if available)
      if (typeof aiData !== 'undefined' && aiData && aiData.planetaryAnalysis) {
        doc.moveDown(1.5);
        // Explicitly set X to margin and define width to ensure full-width justification
        doc.x = 50;
        doc.font(fontRegular).fontSize(16).fillColor(COLORS.secondary).text('AI Insights: Planetary Placements', 50, doc.y, { underline: true });
        doc.moveDown(0.5);
        doc.font(fontRegular).fontSize(11).fillColor(COLORS.text).text(aiData.planetaryAnalysis, 50, doc.y, {
          align: 'justify',
          lineGap: 5,
          width: doc.page.width - 100
        });
      }
    }

    // --- PAGES 3-18: SHODASHVARGA CHARTS (16 Charts x 2 Styles) ---
    const divisionalCharts = [
      {
        id: 'RasiD1',
        name: 'Lagna Chart (D1) - Rasi Chart',
        description: 'The Rasi Chart (D1) is the main birth chart and the foundation of Vedic astrology. It represents your overall life, personality, physical body, and general life path. This chart shows the exact position of planets at the time of your birth and is used to analyze all major life events, health, career, relationships, and spiritual inclinations. It is the most important chart and all other divisional charts are derived from it.'
      },
      {
        id: 'HoraD2',
        name: 'Hora Chart (D2) - Wealth & Prosperity',
        description: 'The Hora Chart (D2) specifically reveals your wealth potential, financial prosperity, and material resources. It shows how you accumulate wealth, your relationship with money, inheritance patterns, and overall financial fortune. This chart helps understand whether wealth will come through self-effort, inheritance, or partnerships. It also indicates the timing of financial gains and losses in your life.'
      },
      {
        id: 'DrekkanaD3',
        name: 'Drekkana Chart (D3) - Siblings & Courage',
        description: 'The Drekkana Chart (D3) governs relationships with siblings, cousins, and close relatives. It reveals your courage, communication skills, short journeys, and mental strength. This chart shows the nature of your relationship with brothers and sisters, their well-being, and how they influence your life. It also indicates your ability to overcome obstacles and face challenges with bravery.'
      },
      {
        id: 'ChaturthamshaD4',
        name: 'Chaturthamsa Chart (D4) - Property & Assets',
        description: 'The Chaturthamsa Chart (D4) deals with immovable property, real estate, vehicles, land, and ancestral wealth. It shows your fortune regarding home ownership, property inheritance, and material comforts. This chart reveals whether you will own property, the quality of your residence, and gains from real estate investments. It also indicates your relationship with your mother and domestic happiness.'
      },
      {
        id: 'SaptamshaD7',
        name: 'Saptamsa Chart (D7) - Children & Progeny',
        description: 'The Saptamsa Chart (D7) is crucial for understanding matters related to children and progeny. It reveals fertility, the number of children, their health and well-being, and your relationship with them. This chart shows the timing of childbirth, potential challenges in conception, and the overall happiness derived from children. It also indicates creative abilities and innovative thinking.'
      },
      {
        id: 'NavamshaD9',
        name: 'Navamsha Chart (D9) - Marriage & Dharma',
        description: 'The Navamsha Chart (D9) is the second most important chart after the Rasi chart. It represents marriage, spouse, dharma (life purpose), and spiritual evolution. This chart reveals the true strength of planets and shows the quality of married life, nature of spouse, and marital happiness. It is essential for marriage compatibility analysis and indicates your spiritual path and destiny. A strong Navamsha ensures success and fulfillment in the second half of life.'
      },
      {
        id: 'DashamamshaD10',
        name: 'Dashamamsa Chart (D10) - Career & Profession',
        description: 'The Dashamamsa Chart (D10) is dedicated to career, profession, status, and achievements. It shows your professional success, reputation, authority, and public image. This chart reveals the most suitable career paths, timing of promotions, job changes, and overall professional growth. It indicates your ability to gain recognition, power, and respect in society through your work.'
      },
      {
        id: 'DwadashamshaD12',
        name: 'Dwadamsha Chart (D12) - Parents & Ancestry',
        description: 'The Dwadamsha Chart (D12) governs relationships with parents, especially focusing on the father and paternal lineage. It reveals ancestral blessings, karmic inheritance, and the influence of past generations on your life. This chart shows the health and longevity of parents, inheritance from father, and the overall quality of parental relationships. It also indicates spiritual heritage and family traditions.'
      },
      {
        id: 'ShodashamshaD16',
        name: 'Shodashamsha Chart (D16) - Vehicles & Comforts',
        description: 'The Shodashamsha Chart (D16) deals with vehicles, conveyances, and material comforts. It shows your fortune regarding automobiles, luxury items, and physical pleasures. This chart reveals whether you will own vehicles, the quality and number of vehicles, and accidents or issues related to transportation. It also indicates overall happiness from material possessions and worldly comforts.'
      },
      {
        id: 'VimshamshaD20',
        name: 'Vimshamsha Chart (D20) - Spiritual Progress',
        description: 'The Vimshamsha Chart (D20) is focused on spiritual development, religious practices, and devotion. It shows your spiritual inclinations, meditation abilities, mantra power, and connection with divine energies. This chart reveals the effectiveness of spiritual practices, worship methods that suit you, and your overall spiritual evolution. It indicates blessings from deities and spiritual guides.'
      },
      {
        id: 'ChaturvimshamshaD24',
        name: 'Chaturvimshamsha Chart (D24) - Education & Learning',
        description: 'The Chaturvimshamsha Chart (D24) governs formal education, academic achievements, and learning abilities. It shows your intellectual capacity, success in studies, areas of academic excellence, and higher education prospects. This chart reveals the quality of education you receive, scholarships, academic honors, and your ability to acquire and retain knowledge. It also indicates teaching abilities and scholarly pursuits.'
      },
      {
        id: 'BhamshaD27',
        name: 'Saptavimshamsha Chart (D27) - Strength & Weaknesses',
        description: 'The Saptavimshamsha Chart (D27) reveals your inherent strengths and weaknesses, both physical and mental. It shows areas where you are naturally strong and areas that need improvement. This chart helps identify vulnerabilities, potential health issues, and psychological patterns. It indicates your resilience, stamina, and ability to overcome adversities. Understanding this chart helps in personal development and self-improvement.'
      },
      {
        id: 'TrimshamshaD30',
        name: 'Trimshamsha Chart (D30) - Misfortunes & Evils',
        description: 'The Trimshamsha Chart (D30) deals with misfortunes, obstacles, enemies, and negative influences. It shows potential dangers, accidents, legal troubles, and sources of suffering in life. This chart helps identify areas of vulnerability and periods when you need to be cautious. It reveals hidden enemies, black magic influences, and karmic debts. Understanding this chart allows you to take preventive measures and perform remedies.'
      },
      {
        id: 'KhavedamshaD40',
        name: 'Khavedamsha Chart (D40) - Maternal Heritage',
        description: 'The Khavedamsha Chart (D40) focuses on maternal lineage, mother\'s family, and auspicious/inauspicious results. It shows the influence of your mother and maternal relatives on your life. This chart reveals blessings from the maternal side, inheritance from mother, and the overall impact of maternal karma. It also indicates protective influences and fortunate events stemming from maternal connections.'
      },
      {
        id: 'AkshavedamshaD45',
        name: 'Akshavedamsha Chart (D45) - General Well-being',
        description: 'The Akshavedamsha Chart (D45) represents overall well-being, character, conduct, and general fortune. It shows your moral values, ethical standards, and behavioral patterns. This chart reveals your reputation, trustworthiness, and how others perceive you. It indicates general auspiciousness in life, lucky periods, and areas where you naturally excel. It also shows the cumulative effect of all other divisional charts.'
      },
      {
        id: 'ShashtyamshaD60',
        name: 'Shashtiamsha Chart (D60) - Past Life Karma',
        description: 'The Shashtiamsha Chart (D60) is the most subtle and important divisional chart for understanding past life karma and its effects on the current life. It reveals deep karmic patterns, soul\'s journey, and spiritual debts. This chart shows the true strength of planets and their ability to give results. It is used for precise predictions and understanding the root cause of life events. Mastery of this chart requires deep astrological knowledge and spiritual insight.'
      }
    ];

    // One South Indian chart per page: embed VedAstro South Indian SVG for D1–D60.
    const divisionalChartSize = 560;
    for (let i = 0; i < divisionalCharts.length; i++) {
      const chart = divisionalCharts[i];
      const southSvg = astroData[`${chart.id}_South`];
      const northSvg = astroData[`${chart.id}_North`];

      if (!southSvg && !northSvg) {
        console.warn(`⚠️ Skipping ${chart.name} - no chart data`);
        continue;
      }

      doc.addPage();

      // Use AI-generated karmic explanation if available, fallback to generic description
      const chartDescription = divisionalKarmicInsights[chart.id] || chart.description;
      const isAIInsight = !!divisionalKarmicInsights[chart.id];

      // Draw Header
      doc.font(fontBold).fontSize(16).fillColor(COLORS.primary).text(chart.name, { align: 'center' });
      doc.moveDown(0.2);

      if (isAIInsight) {
        // Render AI-generated karmic explanation (Rich formatting)
        doc.font(fontRegular).fontSize(10).fillColor(COLORS.text).text(chartDescription, 50, doc.y, {
          align: 'justify',
          lineGap: 3,
          width: doc.page.width - 100
        });
      } else {
        // Fallback to static description
        doc.fontSize(9).fillColor(COLORS.text).text(chartDescription, 50, doc.y, {
          align: 'justify',
          lineGap: 2,
          width: doc.page.width - 100
        });
      }
      doc.moveDown(0.5);

      if (southSvg) {
        doc.fontSize(10).fillColor(COLORS.secondary).text('South Style', { align: 'center' });
        embedAstroChart(doc, '', southSvg, divisionalChartSize);
      }

    }

    // Add AI Divisional Chart Commentary (if available)
    if (aiData && aiData.divisionalInsights) {
      doc.addPage();
      doc.fontSize(22).fillColor(COLORS.primary).text('Shodashvarga: Divisional Analysis', { align: 'center' });
      doc.moveDown(0.5);
      doc.rect(50, doc.y, doc.page.width - 100, 2).fill(COLORS.secondary);
      doc.moveDown(1.5);
      doc.fontSize(16).fillColor(COLORS.secondary).text('AI Interpretation of Divisional Charts', { underline: true });
      doc.moveDown();
      doc.fontSize(11).fillColor(COLORS.text).text(aiData.divisionalInsights, { align: 'justify', lineGap: 5 });
    }

    // --- ASHTAKVARGA SECTION (Multiple Pages) ---
    doc.addPage();
    drawSectionHeader('Ashtakvarga Analysis', 'Numerical Strength of Planets');

    // General Introduction to Ashtakavarga
    doc.fontSize(11).fillColor(COLORS.text).text(
      'Ashtakavarga is a unique predictive method in Vedic Astrology that assigns numerical values (bindus/points) to each planet in each sign. It helps determine the strength and auspiciousness of planets in different houses. Higher points indicate favorable results, while lower points indicate challenges.',
      50, doc.y,
      { align: 'justify', lineGap: 4, width: doc.page.width - 100 }
    );
    doc.moveDown();

    doc.fontSize(10).fillColor(COLORS.text).text(
      '• Scores above 28 points in a sign are considered strong and auspicious\n' +
      '• Scores between 25-28 are moderate\n' +
      '• Scores below 25 indicate weakness and potential challenges\n' +
      '• The total Sarvashtakvarga (SAV) shows overall life strength in each sign',
      50, doc.y,
      { lineGap: 3, width: doc.page.width - 100 }
    );
    doc.moveDown(1.5);

    const signs = ['Ar', 'Ta', 'Ge', 'Cn', 'Le', 'Vi', 'Li', 'Sc', 'Sg', 'Cp', 'Aq', 'Pi'];

    // Sarvashtakvarga with detailed description
    if (astroData.sarvashtakvarga) {
      doc.fontSize(18).fillColor(COLORS.primary).text('Sarvashtakvarga (SAV) - Overall Life Strength', { underline: true });
      doc.moveDown(0.5);

      doc.fontSize(10).fillColor(COLORS.text).text(
        'Sarvashtakvarga is the combined Ashtakavarga of all seven planets. It shows the overall auspiciousness and strength in each sign of your chart. Signs with higher SAV scores indicate areas of life where you will experience more success, happiness, and favorable outcomes. The total SAV for all 12 signs should be 337 points.',
        50, doc.y,
        { align: 'justify', lineGap: 4, width: doc.page.width - 100 }
      );
      doc.moveDown();

      const avHeaders = ['Planet', ...signs, 'Total'];
      const avRows = Object.entries(astroData.sarvashtakvarga).map(([p, data]) => [
        p, ...(data.Rows || Array(12).fill(0)), data.Total || 0
      ]);

      // Calculate SAV Row
      const sarvaRow = Array(12).fill(0);
      Object.values(astroData.sarvashtakvarga).forEach(pData => {
        if (pData.Rows) pData.Rows.forEach((val, i) => { sarvaRow[i] += (val || 0); });
      });
      const sarvaTotal = sarvaRow.reduce((a, b) => a + b, 0);
      avRows.push(['SAV', ...sarvaRow, sarvaTotal]);

      drawAstrologyTable(doc, avHeaders, avRows, {
        columnWidth: [60, ...Array(12).fill(30), 45],
        fontSize: 8,
        headerBG: COLORS.primary,
        headerTextColor: '#ffffff'
      });

      doc.moveDown(0.5);
      doc.fontSize(9).fillColor(COLORS.lightText).text(
        `Total SAV Points: ${sarvaTotal} | Houses with SAV > 30 are very strong | Houses with SAV < 25 need remedial measures`,
        50, doc.y,
        { italic: true, align: 'center', width: doc.page.width - 100 }
      );
    }

    // Individual Planet Ashtakvarga Tables with detailed descriptions
    const ashtakavargaDescriptions = {
      'Sun': {
        title: 'Sun Ashtakavarga - Authority, Father, Government',
        description: 'Sun\'s Ashtakavarga shows your potential for gaining authority, recognition, and success in government or leadership roles. High points indicate strong self-confidence, good relationship with father, and success in administrative positions. It also shows vitality, health, and ability to command respect. Signs with higher points are favorable for career advancement and public recognition.'
      },
      'Moon': {
        title: 'Moon Ashtakavarga - Mind, Mother, Emotions',
        description: 'Moon\'s Ashtakavarga reveals mental peace, emotional stability, and relationship with mother. High points indicate a calm mind, good memory, and emotional intelligence. It shows your capacity for happiness, contentment, and nurturing relationships. Signs with higher points bring mental clarity, peaceful domestic life, and success in public dealings. Low points may indicate anxiety or emotional challenges.'
      },
      'Mars': {
        title: 'Mars Ashtakavarga - Energy, Courage, Property',
        description: 'Mars Ashtakavarga indicates physical energy, courage, competitive spirit, and property matters. High points show strong willpower, athletic abilities, and success in competitive fields. It reveals your capacity to overcome obstacles and win battles. Signs with higher points are favorable for real estate, sports, military, and technical fields. It also shows relationship with siblings and land ownership.'
      },
      'Mercury': {
        title: 'Mercury Ashtakavarga - Intelligence, Communication, Business',
        description: 'Mercury\'s Ashtakavarga shows intellectual abilities, communication skills, and business acumen. High points indicate sharp intelligence, excellent speech, and success in commerce, writing, and education. It reveals your analytical thinking, adaptability, and networking abilities. Signs with higher points favor business ventures, academic pursuits, and professional communication. It also indicates mathematical and logical reasoning.'
      },
      'Jupiter': {
        title: 'Jupiter Ashtakavarga - Wisdom, Wealth, Children',
        description: 'Jupiter\'s Ashtakavarga represents wisdom, prosperity, spiritual growth, and progeny. High points indicate good fortune, higher education, moral values, and financial abundance. It shows blessings from teachers, success in advisory roles, and happiness from children. Signs with higher points bring expansion, optimism, and divine grace. It also indicates philosophical inclinations and religious activities.'
      },
      'Venus': {
        title: 'Venus Ashtakavarga - Love, Luxury, Arts',
        description: 'Venus Ashtakavarga reveals capacity for love, artistic talents, and material comforts. High points indicate harmonious relationships, appreciation for beauty, and success in creative fields. It shows marital happiness, luxury, vehicles, and refined tastes. Signs with higher points favor romance, arts, entertainment, and diplomatic careers. It also indicates sensual pleasures and aesthetic sense.'
      },
      'Saturn': {
        title: 'Saturn Ashtakavarga - Discipline, Longevity, Service',
        description: 'Saturn\'s Ashtakavarga shows discipline, hard work, longevity, and karmic lessons. High points indicate patience, perseverance, and success through sustained effort. It reveals your capacity for responsibility, organization, and service to others. Signs with higher points bring stability, long-term gains, and rewards for hard work. Low points may indicate delays, obstacles, or areas requiring extra effort and patience.'
      }
    };

    const planetsForAV = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    planetsForAV.forEach(planet => {
      const data = astroData[`ashtakvarga_${planet}`];
      if (data && Object.keys(data).length > 0) {
        console.log(`📄 Adding Page: Ashtakvarga Planet - ${planet}`);
        doc.addPage();

        const planetInfo = ashtakavargaDescriptions[planet];
        doc.fontSize(20).fillColor(COLORS.primary).text(planetInfo.title, { align: 'center', underline: true });
        doc.moveDown(0.5);

        // Decorative line
        doc.rect(50, doc.y, doc.page.width - 100, 1.5).fill(COLORS.secondary);
        doc.moveDown(1);

        // Planet-specific description
        doc.fontSize(10).fillColor(COLORS.text).text(planetInfo.description, 50, doc.y, { align: 'justify', lineGap: 3, width: doc.page.width - 100 });
        doc.moveDown(0.5);

        const headers = ['By Planet', ...signs, 'Total'];
        const rows = Object.entries(data).map(([p, pData]) => [
          p, ...(pData.Rows || Array(12).fill(0)), pData.Total || 0
        ]);

        drawAstrologyTable(doc, headers, rows, {
          columnWidth: [60, ...Array(12).fill(30), 45],
          fontSize: 8,
          headerBG: COLORS.secondary,
          headerTextColor: '#ffffff'
        });

        doc.moveDown();
        doc.fontSize(9).fillColor(COLORS.lightText).text(
          `Interpretation: Look for signs with 4+ points for favorable results. Signs with 0-1 points may bring challenges related to ${planet}'s significations.`,
          { italic: true, align: 'center' }
        );
      }
    });

    // --- DASHA SECTION (Expanded) ---
    if (astroData.dasha) {
      doc.addPage();
      drawSectionHeader('Vimshottari Dasha', 'Detailed Life Timeline');

      const dashaHeaders = ['Planet', 'Start Date', 'End Date', 'Duration'];
      const processDasha = (dasas, level = 0) => {
        if (!dasas || level > 4) return []; // Allow more depth (up to 5 levels)

        // Helper to parse VedAstro date format: HH:mm dd/MM/yyyy zzz
        const parseDate = (dStr) => {
          if (!dStr) return null;
          const parts = dStr.split(' ');
          if (parts.length >= 2) {
            const [day, month, year] = parts[1].split('/');
            return new Date(`${year}-${month}-${day}T${parts[0]}${parts[2] || ''}`);
          }
          return new Date(dStr);
        };

        // Handle both Array and Object/Map formats
        let dasaArray;
        if (Array.isArray(dasas)) {
          dasaArray = dasas;
        } else if (dasas.Dasas) {
          dasaArray = dasas.Dasas;
        } else {
          // If it's a map (Object with lord names as keys)
          dasaArray = Object.values(dasas);
        }

        let rows = [];
        dasaArray.forEach(d => {
          if (!d) return;
          const planet = d.Lord || d.Planet || d.Name;
          if (!planet) return;

          const indent = "  ".repeat(level);
          const start = d.Start || d.StartTime;
          const end = d.End || d.EndTime;
          const duration = d.DurationText || `${d.DurationYears || 0}y ${d.DurationMonths || 0}m`;

          const startDate = parseDate(start);
          const endDate = parseDate(end);

          rows.push([
            `${indent}${planet}`,
            startDate && !isNaN(startDate) ? startDate.toLocaleDateString() : (start || 'N/A'),
            endDate && !isNaN(endDate) ? endDate.toLocaleDateString() : (end || 'N/A'),
            duration
          ]);

          if (d.SubDasas) {
            rows = rows.concat(processDasha(d.SubDasas, level + 1));
          }
        });
        return rows;
      };

      const allDashaRows = processDasha(astroData.dasha);

      if (allDashaRows.length > 0) {
        const ROWS_PER_PAGE = 35;
        for (let i = 0; i < allDashaRows.length; i += ROWS_PER_PAGE) {
          if (i > 0) {
            console.log('📄 Adding Page: Dasha Table Continued');
            doc.addPage();
          }
          drawAstrologyTable(doc, dashaHeaders, allDashaRows.slice(i, i + ROWS_PER_PAGE), { columnWidth: [150, 100, 100, 100] });
        }
      } else {
        doc.fontSize(12).fillColor(COLORS.text).text('Dasha data not available in expected format.', { align: 'center' });
      }
    }


    // --- PREDICTIONS SECTION ---
    const predArray = astroData.predictions ? (Array.isArray(astroData.predictions) ? astroData.predictions :
      (astroData.predictions.Predictions || [astroData.predictions])) : [];

    if (predArray.length > 0) {
      console.log('📄 Adding Page: Horoscope Predictions');
      doc.addPage();
      drawSectionHeader('Horoscope Predictions', 'Detailed Life Analysis');

      if (predArray.length > 0) {
        predArray.forEach(pred => {
          if (!pred) return; // Skip null/undefined entries

          doc.fontSize(14).fillColor(COLORS.secondary).text(pred.Name || 'General Prediction', { underline: true });
          doc.fontSize(10).fillColor(COLORS.text).text(pred.Description || 'No description available.', { align: 'justify' });
          doc.moveDown();

          if (doc.y > doc.page.height - 100) doc.addPage();
        });
      } else {
        doc.fontSize(12).fillColor(COLORS.text).text('Prediction data not available.', { align: 'center' });
      }
    }

    // --- NEW SECTIONS FROM IMAGES ---

    // 1. Manglik Details
    const manglikResult = analyzeMangalDosha(astroData.planets || {});

    if (manglikResult.presentInLagna || manglikResult.presentInMoon) {
      console.log('📝 Adding Manglik Analysis section...');
      doc.addPage();
      drawSectionHeader('Manglik Analysis', 'Mangal Dosha Evaluation');

      doc.fillColor(COLORS.text).fontSize(11).text('Generally Manglik Dosha is considered from the position of Lagna and Moon in the birth chart.', { align: 'justify' });
      doc.moveDown();
      doc.text(`In your birth chart, Mangal is placed in ${getOrdinal(manglikResult.marsHouseLagna || '?')} house from Lagna, while in the Moon chart Mangal is placed in ${getOrdinal(manglikResult.marsHouseMoon || '?')} house.`);
      doc.moveDown();

      const doshaPulse = manglikResult.presentInLagna || manglikResult.presentInMoon;
      doc.fillColor(doshaPulse ? COLORS.secondary : 'green').fontSize(14).text(manglikResult.summary, { align: 'center', bold: true });
      doc.fillColor(COLORS.text).moveDown();

      doc.fontSize(12).fillColor(COLORS.primary).text('What is Manglik Dosha?', { underline: true });
      doc.fontSize(10).fillColor(COLORS.text).text('Vedic astrology says that if Mars is placed in the 1st, 4th, 7th, 8th or 12th house of a person\'s birth chart, then it is called Mangal Dosha. Mangal Dosha is also known as Bhom Dosha, Kuja Dosha or Angarakha Dosha. It can cause delays or hurdles in marriage and interpersonal relationships.', { align: 'justify' });
      doc.moveDown();

      if (doshaPulse) {
        doc.fontSize(12).fillColor(COLORS.primary).text('Remedies for Mangal Dosha:', { underline: true });
        const remedies = [
          '• Fasting on Tuesdays and consuming only toor dal.',
          '• Chanting the Hanuman Chalisa daily.',
          '• Performing Kumbh Vivah (marriage with a pot or tree) before actual marriage.',
          '• Visiting a Navagraha temple and performing Mars pacification rituals.',
          '• Donating red clothes or lentils to the needy on Tuesdays.'
        ];
        remedies.forEach(r => doc.fontSize(10).text(r));
      }

      // Add decorative Mangal image in leftover space
      doc.moveDown(0.5);
      const spaceRemaining = doc.page.height - doc.y - 100; // Space before footer
      console.log(`Manglik Dosha - Space remaining: ${spaceRemaining}px at Y position: ${doc.y}`);

      if (spaceRemaining > 80) {
        const manglikImagePath = path.join(__dirname, '..', '..', 'frontend', 'public', 'images', 'mangal.jpg');
        console.log(`Attempting to load Mangal image from: ${manglikImagePath}`);

        if (fs.existsSync(manglikImagePath)) {
          const imgHeight = Math.min(spaceRemaining - 20, 200);
          const imgWidth = imgHeight * 1.2; // Maintain aspect ratio
          const centerX = (doc.page.width - imgWidth) / 2;
          console.log(`✅ Adding Mangal image: ${imgWidth}x${imgHeight} at (${centerX}, ${doc.y + 10})`);
          doc.image(manglikImagePath, centerX, doc.y + 10, { width: imgWidth, height: imgHeight, opacity: 0.9 });
        } else {
          console.warn(`⚠️ Mangal image not found at: ${manglikImagePath}`);
        }
      } else {
        console.log(`⚠️ Not enough space for Mangal image (need 80px, have ${spaceRemaining}px)`);
      }
    }

    // Banner 1: Shani Report (Bottom of Manglik page) - REMOVED as we're using our own images
    // const shaniBannerPath = 'C:/Users/User/.gemini/antigravity/brain/74eaf73b-b72b-49f7-b31f-25af80cf405c/shani_report_banner_1766735812713.png';
    // if (fs.existsSync(shaniBannerPath)) {
    //   doc.image(shaniBannerPath, 50, doc.page.height - 150, { width: doc.page.width - 100 });
    // }

    // --- PITRA DOSHA ANALYSIS ---
    const pitraResult = analyzePitraDosha(astroData.planets || {});

    if (pitraResult.isPresent) {
      console.log('📝 Adding Pitra Dosha Analysis section...');
      doc.addPage();
      drawSectionHeader('Pitra Dosha Analysis', 'Ancestral Karma Assessment');

      doc.fillColor(COLORS.text).fontSize(11).text('Pitra Dosha is related to ancestral karma and blessings. It occurs when there are afflictions to the 9th house (house of father and ancestors) or when Sun is conjunct with Rahu or other malefic planets.', { align: 'justify' });
      doc.moveDown();

      if (pitraResult.isPresent && pitraResult.reasons.length > 0) {
        doc.fontSize(12).fillColor(COLORS.primary).text('Indicators in Your Chart:', { underline: true });
        doc.moveDown(0.5);
        pitraResult.reasons.forEach(reason => {
          doc.fontSize(10).fillColor(COLORS.text).text(`• ${reason}`);
        });
        doc.moveDown();
      }

      doc.fillColor(pitraResult.isPresent ? COLORS.secondary : 'green').fontSize(14).text(pitraResult.summary, { align: 'center', bold: true });
      doc.fillColor(COLORS.text).moveDown();

      doc.fontSize(12).fillColor(COLORS.primary).text('What is Pitra Dosha?', { underline: true });
      doc.fontSize(10).fillColor(COLORS.text).text('Pitra Dosha indicates unfulfilled desires or curses from ancestors. It can manifest as obstacles in career, marriage delays, health issues, or financial problems. This dosha suggests the need to perform ancestral rituals and seek blessings from forefathers.', { align: 'justify' });
      doc.moveDown();

      doc.fontSize(12).fillColor(COLORS.primary).text('Remedies for Pitra Dosha:', { underline: true });
      const pitraRemedies = [
        '• Perform Shraddha ceremony on Amavasya (new moon) days',
        '• Feed Brahmins and poor people on Saturdays',
        '• Donate to charitable causes in the name of ancestors',
        '• Visit pilgrimage places like Gaya, Haridwar, or Rameshwaram',
        '• Chant Pitra Gayatri Mantra regularly',
        '• Plant a Peepal tree and water it regularly',
        '• Perform Pitra Dosha Nivaran Puja on Mahalaya Amavasya'
      ];
      pitraRemedies.forEach(r => doc.fontSize(10).text(r));

      // Add decorative Rudraksha image in leftover space for Pitra Dosha
      doc.moveDown(0.5);
      const spaceRemaining = doc.page.height - doc.y - 100;
      console.log(`Pitra Dosha - Space remaining: ${spaceRemaining}px at Y position: ${doc.y}`);

      if (spaceRemaining > 80) {
        const pitraImagePath = path.join(__dirname, '..', '..', 'frontend', 'public', 'images', 'pitra.jpg');
        console.log(`Attempting to load Pitra image from: ${pitraImagePath}`);

        if (fs.existsSync(pitraImagePath)) {
          const imgHeight = Math.min(spaceRemaining - 20, 200);
          const imgWidth = imgHeight * 1.2;
          const centerX = (doc.page.width - imgWidth) / 2;
          console.log(`✅ Adding Pitra image: ${imgWidth}x${imgHeight} at (${centerX}, ${doc.y + 10})`);
          doc.image(pitraImagePath, centerX, doc.y + 10, { width: imgWidth, height: imgHeight, opacity: 0.9 });
        } else {
          console.warn(`⚠️ Pitra image not found at: ${pitraImagePath}`);
        }
      } else {
        console.log(`⚠️ Not enough space for Pitra image (need 80px, have ${spaceRemaining}px)`);
      }
    }

    // --- KALSARP DOSHA ANALYSIS ---
    const kalsarpResult = analyzeKalsarpDosha(astroData.planets || {});

    // ALWAYS Add Kalsarp Dosha Section
    console.log('📝 Adding Kalsarp Dosha Analysis section...');
    doc.addPage();
    drawSectionHeader('Kalsarp Dosha Analysis', 'Rahu-Ketu Axis Impact');

    doc.fillColor(COLORS.text).fontSize(11).text('Kalsarp Dosha occurs when all seven planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn) are positioned between Rahu and Ketu in the birth chart. This creates a powerful karmic influence.', { align: 'justify' });
    doc.moveDown();

    if (kalsarpResult.isPresent) {
      doc.fontSize(12).fillColor(COLORS.primary).text('Type of Kalsarp Dosha:', { underline: true });
      doc.fontSize(11).fillColor(COLORS.secondary).text(kalsarpResult.type, { bold: true });
      doc.moveDown();
      doc.fontSize(10).fillColor(COLORS.text).text(`Rahu is in ${kalsarpResult.rahuHouse}th house and Ketu is in ${kalsarpResult.ketuHouse}th house.`);
      doc.moveDown();
    }

    // Status Box
    const boxColor = kalsarpResult.isPresent ? COLORS.secondary : '#4CAF50'; // Red if present, Green if safe
    const statusText = kalsarpResult.summary;

    // Draw status box
    doc.rect(50, doc.y, doc.page.width - 100, 30).fillAndStroke(boxColor, COLORS.border);
    doc.fillColor('white').fontSize(12).text(statusText, 50, doc.y - 20, { align: 'center', width: doc.page.width - 100 });
    doc.fillColor(COLORS.text).moveDown(2);

    doc.fontSize(12).fillColor(COLORS.primary).text('What is Kalsarp Dosha?', { underline: true });
    doc.fontSize(10).fillColor(COLORS.text).text('Kalsarp Dosha is formed when all planets are hemmed between the Rahu-Ketu axis. There are 12 types of Kalsarp Dosha based on the position of Rahu. This dosha can cause delays, obstacles, and mental stress, but it also gives the strength to overcome challenges and achieve success through hard work.', { align: 'justify' });
    doc.moveDown();

    // Only show remedies if present
    if (kalsarpResult.isPresent) {
      doc.fontSize(12).fillColor(COLORS.primary).text('Remedies for Kalsarp Dosha:', { underline: true });
      const kalsarpRemedies = [
        '• Visit Trimbakeshwar or Ujjain for Kalsarp Dosha Nivaran Puja',
        '• Chant Maha Mrityunjaya Mantra 108 times daily',
        '• Worship Lord Shiva on Mondays and Nag Panchami',
        '• Donate to snake charmers or organizations protecting snakes',
        '• Wear a Gomed (Hessonite) gemstone after consulting an astrologer',
        '• Perform Rahu-Ketu Shanti Puja on eclipses',
        '• Recite Rahu Stotra and Ketu Stotra regularly'
      ];
      kalsarpRemedies.forEach(r => doc.fontSize(10).text(r));
    } else {
      doc.fontSize(12).fillColor(COLORS.primary).text('Note:', { underline: true });
      doc.fontSize(10).fillColor(COLORS.text).text('Since Kalsarp Dosha is not present in your chart, no specific remedies are required. You are free from the karmic restrictions associated with this particular planetary alignment.', { align: 'justify' });
    }

    // Add decorative Yantra image in leftover space for Kalsarp Dosha
    doc.moveDown(0.5);
    const kalsarpSpaceRemaining = doc.page.height - doc.y - 100;
    console.log(`Kalsarp Dosha - Space remaining: ${kalsarpSpaceRemaining}px at Y position: ${doc.y}`);

    if (kalsarpSpaceRemaining > 80) {
      const kalsarpImagePath = path.join(__dirname, '..', '..', 'frontend', 'public', 'images', 'kalsarp.jpg');
      console.log(`Attempting to load Kalsarp image from: ${kalsarpImagePath}`);

      if (fs.existsSync(kalsarpImagePath)) {
        const imgHeight = Math.min(kalsarpSpaceRemaining - 20, 200);
        const imgWidth = imgHeight;
        const centerX = (doc.page.width - imgWidth) / 2;
        console.log(`✅ Adding Kalsarp image: ${imgWidth}x${imgHeight} at (${centerX}, ${doc.y + 10})`);
        doc.image(kalsarpImagePath, centerX, doc.y + 10, { width: imgWidth, height: imgHeight, opacity: 0.9 });
      } else {
        console.warn(`⚠️ Kalsarp image not found at: ${kalsarpImagePath}`);
      }
    } else {
      console.log(`⚠️ Not enough space for Kalsarp image (need 80px, have ${kalsarpSpaceRemaining}px)`);
    }

    // --- SADESATI ANALYSIS ---
    const sadesatiResult = analyzeSadesati(astroData.planets || {});

    if (sadesatiResult.isPresent) {
      console.log('📝 Adding Sadesati Analysis section...');
      doc.addPage();
      drawSectionHeader('Shani Sade Sati', '7.5 Years Saturn Cycle');

      doc.fillColor(COLORS.text).fontSize(11).text('Sadesati is the 7.5-year period when Saturn transits through the 12th, 1st, and 2nd houses from your Moon sign. It is considered a challenging but transformative period in Vedic astrology.', { align: 'justify' });
      doc.moveDown();

      if (sadesatiResult.isPresent) {
        doc.fontSize(12).fillColor(COLORS.primary).text('Current Sadesati Status:', { underline: true });
        doc.fontSize(11).fillColor(COLORS.secondary).text(sadesatiResult.phase, { bold: true });
        doc.moveDown();
        doc.fontSize(10).fillColor(COLORS.text).text(sadesatiResult.description, { align: 'justify' });
        doc.moveDown();
        doc.text(`Your Moon Sign: ${sadesatiResult.moonSign}`);
        doc.text(`Saturn's Current Sign: ${sadesatiResult.saturnSign}`);
        doc.moveDown();
      }

      doc.fillColor(sadesatiResult.isPresent ? COLORS.secondary : 'green').fontSize(14).text(sadesatiResult.summary, { align: 'center', bold: true });
      doc.fillColor(COLORS.text).moveDown();

      doc.fontSize(12).fillColor(COLORS.primary).text('What is Sadesati?', { underline: true });
      doc.fontSize(10).fillColor(COLORS.text).text('Sadesati occurs when Saturn transits the 12th, 1st, and 2nd houses from the natal Moon. It lasts approximately 7.5 years and is divided into three phases of 2.5 years each. While traditionally considered challenging, Sadesati is actually a period of karmic cleansing, spiritual growth, and building resilience.', { align: 'justify' });
      doc.moveDown();

      doc.fontSize(12).fillColor(COLORS.primary).text('Remedies for Sadesati:', { underline: true });
      const sadesatiRemedies = [
        '• Chant Shani Mantra: "Om Sham Shanicharaya Namah" 108 times daily',
        '• Worship Lord Hanuman on Saturdays',
        '• Light a mustard oil lamp under a Peepal tree on Saturdays',
        '• Donate black sesame seeds, black clothes, or iron on Saturdays',
        '• Feed crows and poor people on Saturdays',
        '• Wear a Blue Sapphire (Neelam) only after proper astrological consultation',
        '• Recite Hanuman Chalisa daily',
        '• Practice patience, discipline, and hard work',
        '• Avoid shortcuts and unethical means',
        '• Serve elderly people and laborers'
      ];
      sadesatiRemedies.forEach(r => doc.fontSize(10).text(r));
      doc.moveDown();
      doc.fontSize(10).fillColor(COLORS.primary).text('Remember: Sadesati is a teacher. Accept challenges with grace and use this time for spiritual growth and self-improvement.', { italic: true, align: 'justify' });
    }

    console.log('📝 Adding AI-Enhanced Life Predictions...');
    // Note: aiData is already fetched at the start of generatePDF

    if (aiData && aiData.lifePredictions) {
      console.log('✅ AI Predictions received, adding to PDF...');

      const categories = [
        { key: 'character', title: 'Character & Personality', icon: '🧑' },
        { key: 'happiness', title: 'Happiness & Contentment', icon: '😊' },
        { key: 'fulfillment', title: 'Fulfillment & Life Purpose', icon: '🎯' },
        { key: 'lifestyle', title: 'Lifestyle & Daily Habits', icon: '🏡' },
        { key: 'career', title: 'Career & Professional Life', icon: '💼' },
        { key: 'occupation', title: 'Occupation & Business', icon: '🏢' },
        { key: 'health', title: 'Health & Wellness', icon: '🏥' },
        { key: 'hobbies', title: 'Hobbies & Interests', icon: '🎨' },
        { key: 'loveMatters', title: 'Love & Relationships', icon: '💕' },
        { key: 'finance', title: 'Finance & Wealth', icon: '💰' },
        { key: 'education', title: 'Education & Learning', icon: '📚' }
      ];

      categories.forEach((cat, idx) => {
        const predictionText = aiData.lifePredictions[cat.key];
        if (!predictionText || predictionText.trim().length < 10) return;

        doc.addPage();

        // Section Header with Icon
        drawSectionHeader(`${cat.icon} ${cat.title}`, 'AI-Powered Life Insight');

        // Prediction Content
        doc.fillColor(COLORS.text).fontSize(12).text(predictionText, {
          align: 'justify',
          lineGap: 6,
          paragraphGap: 10
        });

        // Dynamic Category Image Addition
        const imagesDir = path.join(__dirname, '..', '..', 'frontend', 'public', 'images');
        const specificMappings = {
          'career': 'carrer.png',
          'fulfillment': 'fullfilment.jpg',
          'loveMatters': 'sign1.png'
        };

        const extensions = ['.jpg', '.png', '.jpeg'];
        let foundImagePath = null;

        // Check specific mapping first
        if (specificMappings[cat.key]) {
          const specificPath = path.join(imagesDir, specificMappings[cat.key]);
          if (fs.existsSync(specificPath)) foundImagePath = specificPath;
        }

        // Try generic matching if not found
        if (!foundImagePath) {
          for (const ext of extensions) {
            const testPath = path.join(imagesDir, `${cat.key}${ext}`);
            if (fs.existsSync(testPath)) {
              foundImagePath = testPath;
              break;
            }
          }
        }

        if (foundImagePath) {
          doc.moveDown(1);
          const spaceRemaining = doc.page.height - doc.y - 120; // 120px buffer for footer

          if (spaceRemaining > 150) {
            const imgHeight = Math.min(spaceRemaining - 20, 320);
            const imgWidth = imgHeight * 1.3; // Standardize aspect ratio
            const centerX = (doc.page.width - imgWidth) / 2;

            console.log(`✅ Adding image [${path.basename(foundImagePath)}] for section: ${cat.title}`);
            doc.image(foundImagePath, centerX, doc.y + 10, {
              width: imgWidth,
              height: imgHeight,
              opacity: 0.95
            });
          } else {
            console.log(`⚠️ Skip image for ${cat.title} - not enough space (need >150px, have ${spaceRemaining}px)`);
          }
        }

        // Add banners at strategic positions
        if (idx === 2) { // After Fulfillment
          const bannerPath = 'C:/Users/User/.gemini/antigravity/brain/74eaf73b-b72b-49f7-b31f-25af80cf405c/astro_intelligence_banner_1766735777185.png';
          if (fs.existsSync(bannerPath)) {
            doc.moveDown(2);
            doc.image(bannerPath, 50, doc.page.height - 180, { width: doc.page.width - 100 });
          }
        }
        if (idx === 5) { // After Occupation
          const bannerPath = 'C:/Users/User/.gemini/antigravity/brain/74eaf73b-b72b-49f7-b31f-25af80cf405c/horoscope_2025_banner_1766735793937.png';
          if (fs.existsSync(bannerPath)) {
            doc.moveDown(2);
            doc.image(bannerPath, 50, doc.page.height - 180, { width: doc.page.width - 100 });
          }
        }
        if (idx === 8) { // After Love Matters
          const shaniBannerPath = 'C:/Users/User/.gemini/antigravity/brain/74eaf73b-b72b-49f7-b31f-25af80cf405c/shani_report_banner_1766735812713.png';
          if (fs.existsSync(shaniBannerPath)) {
            doc.moveDown(2);
            doc.image(shaniBannerPath, 50, doc.page.height - 180, { width: doc.page.width - 100 });
          }
        }
      });

      console.log('✅ All Life Prediction categories added to PDF');
    } else {
      // Add a fallback section to inform users that Life Predictions should be here
      console.warn('⚠️ AI Predictions not available - adding fallback message');

      if (!aiModel) {
        console.warn('   Reason: Gemini AI not initialized (GEMINI_API_KEY missing)');
        doc.addPage();
        drawSectionHeader('AI-Enhanced Life Predictions', 'Temporarily Unavailable');
        doc.fontSize(12).fillColor(COLORS.text).text(
          'AI-powered Life Predictions are currently unavailable. This feature requires a valid GEMINI_API_KEY to be configured.',
          { align: 'center' }
        );
        doc.moveDown();
        doc.fontSize(10).fillColor(COLORS.lightText).text(
          'To enable this feature, please ensure GEMINI_API_KEY is set in the backend environment variables.',
          { align: 'center', italic: true }
        );
      } else {
        console.warn('   Reason: aiData or lifePredictions missing');
        console.log('   Debug: aiData =', aiData ? 'exists' : 'null/undefined');
        console.log('   Debug: lifePredictions =', aiData?.lifePredictions ? 'exists' : 'missing');

        doc.addPage();
        drawSectionHeader('AI-Enhanced Life Predictions', 'Generation Failed');
        doc.fontSize(12).fillColor(COLORS.text).text(
          'AI-powered Life Predictions could not be generated at this time. This may be due to:',
          { align: 'left' }
        );
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor(COLORS.text).list([
          'API request timeout or connection issue',
          'Invalid API response format',
          'Rate limiting or quota exceeded',
          'Temporary service unavailability'
        ], { bulletRadius: 2, textIndent: 10 });
        doc.moveDown();
        doc.fontSize(10).fillColor(COLORS.lightText).text(
          'Please check the server logs for detailed error information or try again later.',
          { align: 'justify', italic: true }
        );
      }
    }

    // 3. Sadesati Report
    if (aiData && aiData.sadeSatiPhases && aiData.sadeSatiPhases.length > 0) {
      console.log('📝 Adding Sadesati Report section...');
      doc.addPage();
      drawSectionHeader('Sadesati Report', 'Transits and Phases');

      const ssInfo = [
        ['Name', name || 'N/A'],
        ['Date', new Date(dateOfBirth).toLocaleDateString()],
        ['Time', timeOfBirth || 'N/A'],
        ['Place', placeOfBirth || 'N/A'],
        ['Sex', gender || 'N/A'],
        ['Rasi', astroData.moonSign?.Name || astroData.moonSign || 'N/A'],
        ['Tithi', astroData.tithi?.Name || astroData.tithi || 'N/A'],
        ['Nakshatra', astroData.nakshatra?.Name || astroData.nakshatra || 'N/A']
      ];
      drawAstrologyTable(doc, ['Category', 'Value'], ssInfo, { columnWidth: 200 });
      doc.moveDown();

      const ssHeaders = ['Phase', 'Saturn Sign', 'Start Date', 'End Date'];
      const ssRows = aiData.sadeSatiPhases.map(p => [
        p.Phase || p.phase,
        p.SaturnSign || p.saturnSign,
        p.StartDate || p.startDate,
        p.EndDate || p.endDate
      ]);

      doc.fontSize(16).fillColor(COLORS.secondary).text('Sade Sati Phases:', { underline: true });
      doc.moveDown();
      drawAstrologyTable(doc, ssHeaders, ssRows, { columnWidth: [150, 100, 100, 100] });
    }

    // --- CONCLUDING PAGE ---
    doc.addPage();
    drawSectionHeader('Guidance & Disclaimer', 'How to Use This Report');

    doc.fillColor(COLORS.text).fontSize(11).text(
      'Astrology is a divine science that provides insights into the cosmic energies influencing your life. While this report offers detailed analysis based on Vedic principles, it is important to remember that Karma (your actions) and Free Will are equally powerful. Use these insights as a compass to navigate your life path, build resilience, and harness your strengths.',
      { align: 'justify', lineGap: 5 }
    );

    doc.moveDown(2);
    doc.fontSize(14).fillColor(COLORS.primary).text('For Personal Consultations:', { bold: true });
    doc.moveDown(0.5);
    const contactInfo = [
      ['Website', 'www.astroconsult.com'],
      ['Email', 'support@astroconsult.com'],
      ['Helpline', '+91 99999 99999'],
      ['Service', 'Personalized Remedial Guidance']
    ];
    drawAstrologyTable(doc, ['Channel', 'Details'], contactInfo, { columnWidth: 200 });

    doc.moveDown(1.5);
    doc.fontSize(14).fillColor(COLORS.secondary).text('May the Divine Light guide your path.', { align: 'center', italic: true });
    doc.moveDown(0.2);
    doc.fillColor(COLORS.primary).fontSize(14).text('ॐ नमः शिवाय', { align: 'center' });

    // --- PREVENT ANY MORE PAGES ---
    // Override addPage to ensure no blank pages are generated after this point
    doc.addPage = () => {
      console.log('🚫 addPage called after report end - blocking to prevent blank pages');
      return doc;
    };


    // --- PDF GENERATION SUMMARY ---
    const pages = doc.bufferedPageRange();
    console.log('\n📄 PDF Generation Summary:');
    console.log(`  - Total Pages: ${pages.count}`);
    console.log(`  - Life Predictions: ${aiData && aiData.lifePredictions ? '✅ Included' : '❌ Missing'}`);
    console.log(`  - Planetary Analysis: ${aiData && aiData.planetaryAnalysis ? '✅ Included' : '❌ Missing'}`);
    console.log(`  - Divisional Insights: ${aiData && aiData.divisionalInsights ? '✅ Included' : '❌ Missing'}`);
    console.log(`  - Sadesati Report: ${aiData && aiData.sadeSatiPhases ? '✅ Included' : '❌ Missing'}`);
    console.log(`  - Dasha Data: ${astroData.dasha ? '✅ Included' : '❌ Missing'}`);
    console.log(`  - Charts: ✅ Included (${Object.keys(astroData).filter(k => (k.includes('_North') || k.includes('_South')) && astroData[k] && astroData[k].includes('<svg')).length} charts)`);
    console.log('✅ PDF generation completed successfully\n');

    // Finalize Footer and Send
    console.log('🏁 Finalizing PDF document...');
    console.log(`📊 Total buffered pages before finalization: ${doc.bufferedPageRange().count}`);

    try {
      addHeaderAndFooter();
      console.log('✅ Footer added to all pages');

      console.log('🔚 Calling doc.end()...');
      doc.end();
      console.log(`✅ Detailed PDF Report generated successfully for ${name}.`);
    } catch (finalizeError) {
      console.error('❌ Error finalizing PDF:', finalizeError);
      // Don't try to send response if headers already sent
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to finalize PDF', details: finalizeError.message });
      }
    }

  } catch (error) {
    console.error('❌ PDF Generation Error:', error);
    console.error('Error Stack:', error.stack);

    // Only send error response if headers haven't been sent yet
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to generate comprehensive PDF report',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
};

// Calculate Zodiac Signs using VedAstro API
exports.calculateZodiacSigns = async (req, res) => {
  try {
    const { dateOfBirth, timeOfBirth, latitude, longitude, timezone } = req.body;

    console.log('📊 Calculating Zodiac Signs with VedAstro API...');
    console.log(`  - Date: ${dateOfBirth}`);
    console.log(`  - Time: ${timeOfBirth}`);
    console.log(`  - Location: ${latitude}, ${longitude}`);

    // Validate required fields
    if (!dateOfBirth || !timeOfBirth || !latitude || !longitude) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['dateOfBirth', 'timeOfBirth', 'latitude', 'longitude']
      });
    }

    const VEDASTRO_API = process.env.VEDASTRO_API_URL || 'http://localhost:7071';
    const apiBase = VEDASTRO_API.endsWith('/api') ? VEDASTRO_API : `${VEDASTRO_API}/api`;
    const baseUrl = `${apiBase}/Calculate`;

    // Parse date and time into VedAstro format
    const date = new Date(dateOfBirth);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const time = timeOfBirth || '12:00';

    // Get timezone offset
    const getTimezoneOffset = (tz) => {
      const timezoneMap = {
        'Asia/Kolkata': '+05:30', 'Asia/Calcutta': '+05:30',
        'America/New_York': '-05:00', 'America/Los_Angeles': '-08:00',
        'Europe/London': '+00:00', 'Asia/Dubai': '+04:00',
        'Asia/Singapore': '+08:00', 'Australia/Sydney': '+10:00',
      };
      if (timezoneMap[tz]) return timezoneMap[tz];
      if (/^[+-]\d{2}:\d{2}$/.test(tz)) return tz;
      return '+05:30';
    };

    const offset = getTimezoneOffset(timezone || 'Asia/Kolkata');
    const timeString = `${time}/${day}/${month}/${year}/${offset}`;
    const locationString = `${latitude},${longitude}`;
    const ayanamsa = 'LAHIRI';

    console.log(`  - VedAstro Time String: ${timeString}`);
    console.log(`  - VedAstro Location: ${locationString}`);

    // Fetch planet data from VedAstro API
    const planetUrl = `${baseUrl}/AllPlanetData/PlanetName/All/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}`;

    console.log(`  - Fetching from: ${planetUrl}`);

    const response = await axios.get(planetUrl, { timeout: 30000 });
    let planetData = response.data.Payload || response.data;

    // Normalize data if it's an array
    if (Array.isArray(planetData) && planetData.length > 0 && typeof planetData[0] === 'object') {
      const payloadObj = {};
      planetData.forEach(item => {
        const keys = Object.keys(item);
        if (keys.length > 0) {
          const k = keys[0];
          payloadObj[k] = item[k];
        }
      });
      planetData = payloadObj;
    }

    console.log(`  - Planets received: ${Object.keys(planetData).join(', ')}`);

    // Extract Sun and Moon signs
    const sunData = planetData['Sun'] || planetData['Surya'];
    const moonData = planetData['Moon'] || planetData['Chandra'];

    if (!sunData || !moonData) {
      console.error('❌ Sun or Moon data not found in response');
      return res.status(500).json({
        error: 'Failed to calculate zodiac signs',
        details: 'Sun or Moon data not available from VedAstro API'
      });
    }

    const sunSign = sunData.Sign?.Name || sunData.Sign || 'Unknown';
    const moonSign = moonData.Sign?.Name || moonData.Sign || 'Unknown';

    console.log(`✅ Calculated Signs:`);
    console.log(`  - Sun Sign: ${sunSign}`);
    console.log(`  - Moon Sign (Rashi): ${moonSign}`);

    // Map Western zodiac names to include Sanskrit names
    const zodiacMapping = {
      'Aries': { name: 'Aries', sanskrit: 'मेष (Mesha)', element: 'Fire' },
      'Taurus': { name: 'Taurus', sanskrit: 'वृषभ (Vrishabha)', element: 'Earth' },
      'Gemini': { name: 'Gemini', sanskrit: 'मिथुन (Mithuna)', element: 'Air' },
      'Cancer': { name: 'Cancer', sanskrit: 'कर्क (Karka)', element: 'Water' },
      'Leo': { name: 'Leo', sanskrit: 'सिंह (Simha)', element: 'Fire' },
      'Virgo': { name: 'Virgo', sanskrit: 'कन्या (Kanya)', element: 'Earth' },
      'Libra': { name: 'Libra', sanskrit: 'तुला (Tula)', element: 'Air' },
      'Scorpio': { name: 'Scorpio', sanskrit: 'वृश्चिक (Vrishchika)', element: 'Water' },
      'Sagittarius': { name: 'Sagittarius', sanskrit: 'धनु (Dhanu)', element: 'Fire' },
      'Capricorn': { name: 'Capricorn', sanskrit: 'मकर (Makara)', element: 'Earth' },
      'Aquarius': { name: 'Aquarius', sanskrit: 'कुम्भ (Kumbha)', element: 'Air' },
      'Pisces': { name: 'Pisces', sanskrit: 'मीन (Meena)', element: 'Water' }
    };

    res.json({
      success: true,
      sunSign: zodiacMapping[sunSign] || { name: sunSign, sanskrit: sunSign, element: 'Unknown' },
      moonSign: zodiacMapping[moonSign] || { name: moonSign, sanskrit: moonSign, element: 'Unknown' },
      nakshatra: moonData.Nakshatra?.Name || moonData.Nakshatra || 'Unknown',
      nakshatraPad: moonData.Nakshatra?.Pad || '1',
      sunDegree: sunData.NirayanaLongitude?.TotalDegrees || 0,
      moonDegree: moonData.NirayanaLongitude?.TotalDegrees || 0,
      calculationMethod: 'VedAstro API (Vedic Astrology)',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error calculating zodiac signs:', error.message);
    console.error('Error stack:', error.stack);

    res.status(500).json({
      error: 'Failed to calculate zodiac signs',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Generate Daily Horoscope for Zodiac Sign using Gemini AI
exports.getDailyHoroscope = async (req, res) => {
  try {
    const { sign, date, signType } = req.body;

    console.log(`🔮 Generating Daily ${signType || 'Moon'} Horoscope for:`, sign);

    if (!sign) {
      return res.status(400).json({ error: 'Missing sign parameter' });
    }

    const targetDate = date || new Date().toISOString().split('T')[0];

    // Check if AI is initialized
    if (!aiModel) {
      console.warn('⚠️ Gemini AI not initialized, returning placeholder horoscope');
      return res.json({
        success: true,
        sign,
        date: targetDate,
        horoscope: {
          overview: "Today brings dynamic energy for your sign. Focus on your long-term goals and stay patient with those around you.",
          love: "Communication will be key in your relationships today. Express your feelings clearly.",
          career: "A new opportunity might present itself. Be ready to take calculated risks.",
          health: "Mindfulness and light exercise will help maintain your energy levels.",
          finance: "Watch your expenses today. It's a good time to review your budget.",
          luckyNumber: Math.floor(Math.random() * 10) + 1,
          luckyColor: "Blue"
        }
      });
    }

    const prompt = `You are an expert Vedic astrologer. Generate a detailed daily horoscope for the ${signType || 'Moon'} zodiac sign ${sign} for the date ${targetDate}. 
    Note: Interpretation should be based on ${signType || 'Moon'} sign perspective.
    Provide insights in the following categories:
    1. Overview (General trend of the day)
    2. Love & Relationships
    3. Career & Work
    4. Health & Wellness
    5. Finance & Money
    6. Lucky Number
    7. Lucky Color
    
    Return ONLY a JSON object in this exact structure:
    {
      "overview": "text",
      "love": "text",
      "career": "text",
      "health": "text",
      "finance": "text",
      "luckyNumber": number,
      "luckyColor": "string"
    }`;

    const result = await aiModel.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean JSON response (remove markdown if any)
    text = text.replace(/```json|```/g, '').trim();

    const horoscope = JSON.parse(text);

    return res.json({
      success: true,
      sign,
      date: targetDate,
      horoscope
    });

  } catch (error) {
    console.error('❌ Error in getDailyHoroscope:', error);
    res.status(500).json({
      error: 'Failed to generate horoscope',
      details: error.message
    });
  }
};


