/**
 * Astrology - run/backend/services/hybridNumerologyService.js
 * 
 * Orchestrator for 25-Page Hybrid Numerology Life Book:
 * 1. Computes deterministic numerology math (Mulank, Bhagyank, Namank, Loshu Grid, Yogas, Cycles).
 * 2. Runs 6 parallelized Gemini calls for deep narrative synthesis.
 * 3. Returns a unified 25-page structured payload ready for on-screen viewing and PDF export.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const {
  buildCoreNumbersPrompt,
  buildLoshuYogasPrompt,
  buildCareerWealthPrompt,
  buildRelationshipHealthPrompt,
  buildPredictiveRoadmapPrompt,
  buildRemediesAffirmationsPrompt
} = require('./geminiNumerologyPrompts');

// Chaldean letter values
const CHALDEAN_MAP = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 8, G: 3,
  H: 5, I: 1, J: 1, K: 2, L: 3, M: 4, N: 5,
  O: 7, P: 8, Q: 1, R: 2, S: 3, T: 4, U: 6,
  V: 6, W: 6, X: 5, Y: 1, Z: 7
};

// Planetary rulers
const PLANET_MAP = {
  1: 'Sun (Surya)',
  2: 'Moon (Chandra)',
  3: 'Jupiter (Brihaspati / Guru)',
  4: 'Rahu (North Node)',
  5: 'Mercury (Budha)',
  6: 'Venus (Shukra)',
  7: 'Ketu (South Node)',
  8: 'Saturn (Shani)',
  9: 'Mars (Mangal)'
};

function reduceToSingleDigit(num, keepMaster = false) {
  let val = parseInt(num, 10);
  if (isNaN(val) || val <= 0) return 1;

  while (val > 9) {
    if (keepMaster && (val === 11 || val === 22 || val === 33)) {
      return val;
    }
    val = val.toString().split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }
  return val;
}

function calculateDeterministicNumerology(name = '', dob = '') {
  // DOB format: YYYY-MM-DD
  const parts = dob.split('-').map(p => parseInt(p, 10));
  const year = parts[0] || 1990;
  const month = parts[1] || 1;
  const day = parts[2] || 1;

  // 1. Mulank (Day of birth)
  const mulank = reduceToSingleDigit(day);

  // 2. Bhagyank (Sum of full date)
  const totalDobSum = day + month + year;
  const bhagyank = reduceToSingleDigit(totalDobSum);

  // 3. Namank (Pythagorean & Chaldean)
  const cleanName = (name || '').toUpperCase().replace(/[^A-Z]/g, '');
  
  let pythagoreanSum = 0;
  let chaldeanSum = 0;
  for (let i = 0; i < cleanName.length; i++) {
    const char = cleanName[i];
    const code = char.charCodeAt(0) - 64;
    pythagoreanSum += code;
    chaldeanSum += (CHALDEAN_MAP[char] || 0);
  }
  const namankPythagorean = reduceToSingleDigit(pythagoreanSum, true);
  const namankChaldean = reduceToSingleDigit(chaldeanSum, true);

  // 4. Loshu Grid (digits present in DOB)
  const dobDigits = `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`
    .split('')
    .map(Number)
    .filter(d => d >= 1 && d <= 9);

  const loshuGrid = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  dobDigits.forEach(d => { loshuGrid[d] = (loshuGrid[d] || 0) + 1; });

  const missingNumbers = Object.keys(loshuGrid).filter(k => loshuGrid[k] === 0).map(Number);

  // 5. Loshu Planes
  const activePlanes = [];
  if (loshuGrid[4] && loshuGrid[9] && loshuGrid[2]) activePlanes.push({ name: 'Mental Plane (4-9-2)', strength: '100%' });
  if (loshuGrid[3] && loshuGrid[5] && loshuGrid[7]) activePlanes.push({ name: 'Emotional Plane (3-5-7)', strength: '100%' });
  if (loshuGrid[8] && loshuGrid[1] && loshuGrid[6]) activePlanes.push({ name: 'Practical Plane (8-1-6)', strength: '100%' });
  if (loshuGrid[4] && loshuGrid[3] && loshuGrid[8]) activePlanes.push({ name: 'Thought Plane (4-3-8)', strength: '100%' });
  if (loshuGrid[9] && loshuGrid[5] && loshuGrid[1]) activePlanes.push({ name: 'Will Plane (9-5-1)', strength: '100%' });
  if (loshuGrid[2] && loshuGrid[7] && loshuGrid[6]) activePlanes.push({ name: 'Action Plane (2-7-6)', strength: '100%' });

  // 6. Raj Yogas
  const yogas = [];
  if (loshuGrid[4] && loshuGrid[5] && loshuGrid[6]) yogas.push('Golden Raj Yoga (4-5-6) - High Fame & Fortune');
  if (loshuGrid[2] && loshuGrid[5] && loshuGrid[8]) yogas.push('Silver Raj Yoga (2-5-8) - Real Estate & Earthly Abundance');

  // 7. Personal Year Calculation
  const currentYear = new Date().getFullYear();
  const personalYear = reduceToSingleDigit(day + month + currentYear);

  const upcomingYears = [];
  for (let offset = 0; offset < 5; offset++) {
    const yr = currentYear + offset;
    const pYear = reduceToSingleDigit(day + month + yr);
    upcomingYears.push({
      calendarYear: yr,
      personalYear: pYear,
      rulingPlanet: PLANET_MAP[pYear]
    });
  }

  return {
    numbers: {
      mulank,
      bhagyank,
      namank: namankPythagorean,
      namankChaldean
    },
    planetaryRulers: {
      mulank: PLANET_MAP[mulank] || 'Unknown',
      bhagyank: PLANET_MAP[bhagyank] || 'Unknown',
      namank: PLANET_MAP[namankPythagorean] || 'Unknown'
    },
    loshuGrid,
    missingNumbers,
    activePlanes,
    yogas,
    doshas: missingNumbers.map(n => `Missing ${n} (${PLANET_MAP[n]})`),
    currentYearCycle: {
      calendarYear: currentYear,
      personalYear
    },
    upcomingYears
  };
}

async function generate25PageNumerologyData({ name, dateOfBirth, language = 'en' }) {
  console.log(`\n🔮 [HybridNumerology] Step 1: Calculating deterministic math for ${name} (${dateOfBirth})...`);
  const mathData = calculateDeterministicNumerology(name, dateOfBirth);

  const context = {
    native: { name, dob: dateOfBirth },
    ...mathData
  };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ [HybridNumerology] GEMINI_API_KEY not configured. Returning deterministic math only.');
    return {
      success: true,
      mode: 'deterministic-only',
      meta: { name, dateOfBirth, pagesCount: 25, generatedAt: new Date() },
      mathData,
      aiChapters: null
    };
  }

  console.log('🤖 [HybridNumerology] Step 2: Generating 6 parallel AI chapters via Gemini Flash for 25-page synthesis...');
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.GEMINI_FLASH_MODEL || 'gemini-1.5-flash';
  const model = genAI.getGenerativeModel({ model: modelName });

  const startTime = Date.now();

  try {
    const [
      coreNumbersRes,
      loshuYogasRes,
      careerWealthRes,
      relationshipHealthRes,
      predictiveRoadmapRes,
      remediesAffirmationsRes
    ] = await Promise.all([
      model.generateContent(buildCoreNumbersPrompt(context, language)).catch(e => ({ error: e.message })),
      model.generateContent(buildLoshuYogasPrompt(context, language)).catch(e => ({ error: e.message })),
      model.generateContent(buildCareerWealthPrompt(context, language)).catch(e => ({ error: e.message })),
      model.generateContent(buildRelationshipHealthPrompt(context, language)).catch(e => ({ error: e.message })),
      model.generateContent(buildPredictiveRoadmapPrompt(context, language)).catch(e => ({ error: e.message })),
      model.generateContent(buildRemediesAffirmationsPrompt(context, language)).catch(e => ({ error: e.message }))
    ]);

    console.log(`✅ [HybridNumerology] 6 AI chapters completed in ${Date.now() - startTime}ms`);

    const extractText = (res) => {
      if (res && res.response && typeof res.response.text === 'function') {
        return res.response.text();
      }
      return res?.error || 'Analysis synthesis in progress.';
    };

    return {
      success: true,
      mode: 'hybrid-ai',
      meta: {
        name,
        dateOfBirth,
        pagesCount: 25,
        generatedAt: new Date(),
        language
      },
      mathData,
      aiChapters: {
        coreNumbersDeepDive: extractText(coreNumbersRes),
        loshuYogasPlanes: extractText(loshuYogasRes),
        careerWealthStrategic: extractText(careerWealthRes),
        relationshipHealthVitality: extractText(relationshipHealthRes),
        predictiveRoadmap5Years: extractText(predictiveRoadmapRes),
        remediesAffirmationsBlueprint: extractText(remediesAffirmationsRes)
      }
    };
  } catch (err) {
    console.error('❌ [HybridNumerology] AI synthesis error:', err);
    return {
      success: true,
      mode: 'deterministic-fallback',
      meta: { name, dateOfBirth, pagesCount: 25, generatedAt: new Date(), error: err.message },
      mathData,
      aiChapters: null
    };
  }
}

module.exports = {
  calculateDeterministicNumerology,
  generate25PageNumerologyData
};
