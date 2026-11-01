/**
 * Astrology - run/backend/services/hybridKundaliService.js
 * 
 * Orchestrator for the 100-Page Hybrid Kundali:
 * 1. Queries local Python Swiss Ephemeris engine (FastAPI:8000) for exact astronomical math.
 * 2. Runs 6 parallelized Gemini Flash prompt calls for Pages 66 to 100.
 * 3. Returns a unified payload ready for PDF compilation.
 */

const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const {
  buildPersonalityPrompt,
  buildCareerPrompt,
  buildMarriagePrompt,
  buildHealthPrompt,
  buildTransitPrompt,
  buildRemediesPrompt
} = require('./geminiKundaliPrompts');

const PYTHON_ASTRO_URL = process.env.PYTHON_ASTRO_URL || 'http://localhost:8000';

async function generate100PageData(birthDetails) {
  console.log(`\n🪐 [HybridKundali] Step 1: Requesting Swiss Ephemeris math from Python engine at ${PYTHON_ASTRO_URL}...`);
  
  const startTime = Date.now();
  const pythonResponse = await axios.post(
    `${PYTHON_ASTRO_URL}/api/kundali-100/full-calculation`,
    birthDetails,
    { headers: { 'Content-Type': 'application/json' }, timeout: 45000 }
  );

  const { raw_astronomical_data, ai_synthesis_context } = pythonResponse.data;
  console.log(`✅ [HybridKundali] Swiss Ephemeris calculations completed in ${Date.now() - startTime}ms`);

  // Step 2: Initialize Gemini Flash
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ [HybridKundali] GEMINI_API_KEY not configured. Skipping AI narrative chapters.');
    return {
      raw_astronomical_data,
      ai_synthesis_context,
      aiSections: null
    };
  }

  console.log('🤖 [HybridKundali] Step 2: Generating 6 AI narrative chapters in parallel with Gemini Flash...');
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Use gemini-1.5-flash or gemini-2.0-flash
  const modelName = process.env.GEMINI_FLASH_MODEL || 'gemini-1.5-flash';
  const model = genAI.getGenerativeModel({ model: modelName });

  const aiStartTime = Date.now();

  const [personalityRes, careerRes, marriageRes, healthRes, transitRes, remediesRes] = await Promise.all([
    model.generateContent(buildPersonalityPrompt(ai_synthesis_context)).catch(e => ({ error: e.message })),
    model.generateContent(buildCareerPrompt(ai_synthesis_context)).catch(e => ({ error: e.message })),
    model.generateContent(buildMarriagePrompt(ai_synthesis_context)).catch(e => ({ error: e.message })),
    model.generateContent(buildHealthPrompt(ai_synthesis_context)).catch(e => ({ error: e.message })),
    model.generateContent(buildTransitPrompt(ai_synthesis_context)).catch(e => ({ error: e.message })),
    model.generateContent(buildRemediesPrompt(ai_synthesis_context)).catch(e => ({ error: e.message }))
  ]);

  const extractText = (res) => (res && typeof res.response?.text === 'function' ? res.response.text() : res?.error || '');

  const aiSections = {
    personality: extractText(personalityRes),
    career: extractText(careerRes),
    marriage: extractText(marriageRes),
    health: extractText(healthRes),
    transits: extractText(transitRes),
    remedies: extractText(remediesRes)
  };

  console.log(`✅ [HybridKundali] 6 AI Chapters generated successfully in ${Date.now() - aiStartTime}ms`);

  return {
    raw_astronomical_data,
    ai_synthesis_context,
    aiSections
  };
}

async function generate40PageData(birthDetails) {
  console.log(`\n🪐 [HybridKundali40] Step 1: Requesting Swiss Ephemeris calculations from Python engine at ${PYTHON_ASTRO_URL}...`);
  
  const startTime = Date.now();
  const pythonResponse = await axios.post(
    `${PYTHON_ASTRO_URL}/api/kundali-100/full-calculation`,
    birthDetails,
    { headers: { 'Content-Type': 'application/json' }, timeout: 45000 }
  );

  const { raw_astronomical_data, ai_synthesis_context } = pythonResponse.data;
  console.log(`✅ [HybridKundali40] Swiss Ephemeris calculations completed in ${Date.now() - startTime}ms`);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ [HybridKundali40] GEMINI_API_KEY not configured. Skipping AI narrative synthesis.');
    return {
      raw_astronomical_data,
      ai_synthesis_context,
      aiSections: null
    };
  }

  console.log('🤖 [HybridKundali40] Step 2: Generating 40-Page core narrative chapters with Gemini Flash...');
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.GEMINI_FLASH_MODEL || 'gemini-1.5-flash';
  const model = genAI.getGenerativeModel({ model: modelName });

  const aiStartTime = Date.now();
  const [personalityRes, careerRes, marriageRes, healthRes, remediesRes] = await Promise.all([
    model.generateContent(buildPersonalityPrompt(ai_synthesis_context)).catch(e => ({ error: e.message })),
    model.generateContent(buildCareerPrompt(ai_synthesis_context)).catch(e => ({ error: e.message })),
    model.generateContent(buildMarriagePrompt(ai_synthesis_context)).catch(e => ({ error: e.message })),
    model.generateContent(buildHealthPrompt(ai_synthesis_context)).catch(e => ({ error: e.message })),
    model.generateContent(buildRemediesPrompt(ai_synthesis_context)).catch(e => ({ error: e.message }))
  ]);

  const extractText = (res) => (res && typeof res.response?.text === 'function' ? res.response.text() : res?.error || '');

  const aiSections = {
    personality: extractText(personalityRes),
    career: extractText(careerRes),
    marriage: extractText(marriageRes),
    health: extractText(healthRes),
    remedies: extractText(remediesRes)
  };

  console.log(`✅ [HybridKundali40] 40-Page AI Chapters generated successfully in ${Date.now() - aiStartTime}ms`);

  return {
    raw_astronomical_data,
    ai_synthesis_context,
    aiSections
  };
}

module.exports = {
  generate100PageData,
  generate40PageData
};
