/**
 * Astrology - run/backend/services/hybridRemediesService.js
 * 
 * Orchestrator for 25-Page Hybrid Remedies Report:
 * 1. Reads encyclopediaRemedies.json rules (Gems, Rudraksha, Yantras, Lal Kitab, Deities).
 * 2. Fetches exact Swiss Ephemeris astronomical math from Python engine (FastAPI:8000).
 * 3. Synthesizes deep, customized remedial chapters using Gemini Flash.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const {
  buildLagnaRemediesPrompt,
  buildRudrakshaYantraPrompt,
  buildLalKitabTotkePrompt
} = require('./geminiRemediesPrompts');

const PYTHON_ASTRO_URL = process.env.PYTHON_ASTRO_URL || 'http://localhost:8000';

// Path to encyclopediaRemedies.json in Vedic Astrology frontend
const ENCYCLOPEDIA_PATH = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'Vedic Astrology',
  'frontend',
  'src',
  'data',
  'encyclopediaRemedies.json'
);

function loadEncyclopediaData() {
  try {
    if (fs.existsSync(ENCYCLOPEDIA_PATH)) {
      const raw = fs.readFileSync(ENCYCLOPEDIA_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn(`⚠️ [HybridRemedies] Failed to load encyclopediaRemedies.json (${err.message}). Using built-in baseline.`);
  }
  return {
    bookTitle: "Encyclopedia of Astrological Remedies",
    author: "Yashkaran Sharma",
    editor: "Arun Kumar Bansal",
    generalPrinciples: { durationDays: 43 },
    ninePrimaryGems: [],
    lagnaGemMatrix: {},
    rudrakshaDetails: [],
    yantraDetails: []
  };
}

async function generateRemedies25PageData(birthDetails) {
  console.log(`\n🪔 [HybridRemedies] Step 1: Loading Encyclopedia of Remedies & Astronomical data...`);
  const encyclopedia = loadEncyclopediaData();

  let raw_astronomical_data = {};
  let ai_synthesis_context = {};

  try {
    const pythonResponse = await axios.post(
      `${PYTHON_ASTRO_URL}/api/kundali-100/full-calculation`,
      birthDetails,
      { headers: { 'Content-Type': 'application/json' }, timeout: 45000 }
    );
    raw_astronomical_data = pythonResponse.data.raw_astronomical_data || {};
    ai_synthesis_context = pythonResponse.data.ai_synthesis_context || {};
    console.log(`✅ [HybridRemedies] Astronomical calculations retrieved successfully.`);
  } catch (err) {
    console.warn(`⚠️ [HybridRemedies] Python engine call failed (${err.message}). Using fallback context.`);
    ai_synthesis_context = {
      native: {
        name: birthDetails.name || 'Seeker',
        gender: birthDetails.gender || 'male',
        dob: birthDetails.dateOfBirth,
        tob: birthDetails.timeOfBirth,
        place: birthDetails.placeOfBirth,
        ascendant_sign: 'Aries',
        moon_sign: 'Taurus',
        sun_sign: 'Leo',
        nakshatra: 'Rohini'
      },
      current_dasha: { active_mahadasha: 'Jupiter', active_antardasha: 'Mercury' }
    };
  }

  const ascendant = ai_synthesis_context.native?.ascendant_sign || 'Aries';
  const lagnaSpecificGems = (encyclopedia.lagnaGemMatrix && encyclopedia.lagnaGemMatrix[ascendant]) || {
    lifeStone: 'Red Coral',
    karakaStone: 'Yellow Sapphire',
    luckyStone: 'Ruby',
    incompatible: ['Emerald', 'Blue Sapphire', 'Diamond']
  };

  // Step 2: Initialize Gemini Flash
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ [HybridRemedies] GEMINI_API_KEY not configured. Returning rulebase chapters.');
    return {
      success: true,
      bookTitle: encyclopedia.bookTitle || 'Encyclopedia of Astrological Remedies',
      author: encyclopedia.author || 'Yashkaran Sharma (AIFAS)',
      ai_synthesis_context,
      lagnaSpecificGems,
      chapters: {
        gemstones: `Based on your ${ascendant} Ascendant, your Life Stone is ${lagnaSpecificGems.lifeStone}, Karaka Stone is ${lagnaSpecificGems.karakaStone}, and Lucky Stone is ${lagnaSpecificGems.luckyStone}. In accordance with the 43-day shastric rule, activate with authentic panchamrit ritual.`,
        rudraksha_yantra: `Prescribed Rudraksha beads for ${ascendant} native: 3-Mukhi and 5-Mukhi with sacred Beej Mantras. Sri Yantra placed in the North-East zone brings divine planetary harmony.`,
        lalkitab_totke: `Lal Kitab Daytime Principle: Perform all charitable offerings (daan) between sunrise and sunset. Avoid donating articles of functional benefic planets.`
      }
    };
  }

  console.log('🤖 [HybridRemedies] Step 2: Synthesizing chapters in parallel with Gemini Flash...');
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.GEMINI_FLASH_MODEL || 'gemini-1.5-flash';
  const model = genAI.getGenerativeModel({ model: modelName });

  const p1 = buildLagnaRemediesPrompt(ai_synthesis_context, encyclopedia);
  const p2 = buildRudrakshaYantraPrompt(ai_synthesis_context, encyclopedia);
  const p3 = buildLalKitabTotkePrompt(ai_synthesis_context, encyclopedia);

  try {
    const [res1, res2, res3] = await Promise.all([
      model.generateContent(p1),
      model.generateContent(p2),
      model.generateContent(p3)
    ]);

    console.log(`✅ [HybridRemedies] 25-Page Remedial Chapters synthesized successfully.`);

    return {
      success: true,
      bookTitle: encyclopedia.bookTitle || 'Encyclopedia of Astrological Remedies',
      author: encyclopedia.author || 'Yashkaran Sharma (AIFAS)',
      ai_synthesis_context,
      lagnaSpecificGems,
      chapters: {
        gemstones: res1.response.text(),
        rudraksha_yantra: res2.response.text(),
        lalkitab_totke: res3.response.text()
      }
    };
  } catch (aiErr) {
    console.error(`⚠️ [HybridRemedies] AI Generation error: ${aiErr.message}. Falling back to baseline.`);
    return {
      success: true,
      bookTitle: encyclopedia.bookTitle || 'Encyclopedia of Astrological Remedies',
      author: encyclopedia.author || 'Yashkaran Sharma (AIFAS)',
      ai_synthesis_context,
      lagnaSpecificGems,
      chapters: {
        gemstones: `Your ${ascendant} Ascendant requires ${lagnaSpecificGems.lifeStone} for vitality, ${lagnaSpecificGems.karakaStone} for intelligence, and ${lagnaSpecificGems.luckyStone} for destiny. All stones must follow the 43-day continuous contact rule.`,
        rudraksha_yantra: `Consecrated Rudraksha and Yantras should be energized on Mondays or Shukla Paksha mornings with authentic Vedic Beej Mantras.`,
        lalkitab_totke: `Strictly adhere to Lal Kitab daytime remedies: feed cows, avoid alcohol and tamasic food, and practice morning water offerings to the Sun.`
      }
    };
  }
}

module.exports = {
  generateRemedies25PageData,
  loadEncyclopediaData
};
