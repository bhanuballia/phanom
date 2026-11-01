const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const LOCALES_DIR = path.join(__dirname, '../data/locales');
if (!fs.existsSync(LOCALES_DIR)) {
  fs.mkdirSync(LOCALES_DIR, { recursive: true });
}

const AstroTranslation = require('../models/AstroTranslation');
const D2HoraTranslation = require('../models/D2HoraTranslation');
const D3DrekkanaTranslation = require('../models/D3DrekkanaTranslation');
const D4ChaturthamshaTranslation = require('../models/D4ChaturthamshaTranslation');
const D7SaptamshaTranslation = require('../models/D7SaptamshaTranslation');
const D9NavamshaTranslation = require('../models/D9NavamshaTranslation');
const D10DashamshaTranslation = require('../models/D10DashamshaTranslation');
const D12DwadashamshaTranslation = require('../models/D12DwadashamshaTranslation');
const D16ShodashamshaTranslation = require('../models/D16ShodashamshaTranslation');
const D24ChaturvimshamshaTranslation = require('../models/D24ChaturvimshamshaTranslation');
const D27BhamsaTranslation = require('../models/D27BhamsaTranslation');
const D30TrimshamshaTranslation = require('../models/D30TrimshamshaTranslation');
const D40KhavedamshaTranslation = require('../models/D40KhavedamshaTranslation');
const D45AkshavedamshaTranslation = require('../models/D45AkshavedamshaTranslation');
const D60ShashtiamshaTranslation = require('../models/D60ShashtiamshaTranslation');
const { defaultTranslations } = require('../services/astroTranslationSeeder');
const https = require('https');

// Highly resilient Google Translate fallback when Gemini free tier quota (429) is exhausted
const translateFallback = (text, targetLang) => {
  return new Promise((resolve) => {
    if (!text || typeof text !== 'string') return resolve(text);
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=' + encodeURIComponent(targetLang) + '&dt=t&q=' + encodeURIComponent(text);
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const translated = (parsed[0] || []).map(p => p[0]).join('');
          resolve(translated || text);
        } catch (e) {
          resolve(text);
        }
      });
    }).on('error', () => resolve(text));
  });
};

// GET /api/translate/astro-dictionary/:lang
router.get('/astro-dictionary/:lang', async (req, res) => {
  try {
    const lang = (req.params.lang || 'en').toLowerCase().trim();

    if (lang === 'en') {
      return res.json({ success: true, lang: 'en', data: null });
    }

    // 1. Try finding in MongoDB
    let translation = await AstroTranslation.findOne({ lang }).lean();

    // 2. If not found in DB, fallback to seed array and save into DB
    if (!translation) {
      const fallback = defaultTranslations.find(t => t.lang === lang);
      if (fallback) {
        translation = fallback;
        // Asynchronously save to DB
        AstroTranslation.findOneAndUpdate({ lang }, fallback, { upsert: true }).catch(() => {});
      }
    }

    if (!translation) {
      return res.status(404).json({ success: false, message: `No translations found for language: ${lang}` });
    }

    return res.json({
      success: true,
      lang,
      data: translation
    });
  } catch (error) {
    console.error('Error fetching astro dictionary from DB:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/translate/house-interpretations
// Accepts { targetLang, targetLangName, items: [{ key: 'Sun_1', text: '...' }] }
// Returns { success: true, translations: { 'Sun_1': '...' } }
router.post('/house-interpretations', async (req, res) => {
  try {
    const { targetLang, targetLangName, items } = req.body;

    if (!targetLang || targetLang === 'en' || !Array.isArray(items) || items.length === 0) {
      const fallback = {};
      (items || []).forEach(it => { fallback[it.key] = it.text; });
      return res.json({ success: true, fromCache: true, translations: fallback });
    }

    const cacheFile = path.join(LOCALES_DIR, `${targetLang}_house_interpretations.json`);
    let cachedMap = {};
    if (fs.existsSync(cacheFile)) {
      try {
        cachedMap = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      } catch (e) {
        cachedMap = {};
      }
    }

    // Determine missing items that need translation
    const missingItems = items.filter(it => !cachedMap[it.key]);

    if (missingItems.length === 0) {
      const result = {};
      items.forEach(it => { result[it.key] = cachedMap[it.key] || it.text; });
      return res.json({ success: true, fromCache: true, translations: result });
    }

    // Call Gemini to translate missing items
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const result = {};
      items.forEach(it => { result[it.key] = cachedMap[it.key] || it.text; });
      return res.json({ success: true, fromCache: false, translations: result });
    }

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const candidateModels = [
      process.env.GEMINI_FLASH_MODEL || 'gemini-2.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.8-flash'
    ];

    const promptObj = {};
    missingItems.forEach(it => { promptObj[it.key] = it.text; });

    const langDisplayName = targetLangName || targetLang;
    const prompt = `
You are an authentic classical Vedic Astrologer and expert Indian linguist.
Translate each astrological placement interpretation into fluent, natural ${langDisplayName}.

CRITICAL RULES:
1. Preserve Vedic astrology technical terms (e.g., Bhav/House, Lagna, Rasi, Rashi, Yoga, Karak, Shubha/Ashubha, Drishti, Combust, Retrograde).
2. Keep the meaning accurate, auspicious, and fluent for native readers.
3. Keep English proper names like celebrities intact or phonetically transliterated.
4. Output ONLY a valid JSON object matching the input keys.

INPUT JSON:
${JSON.stringify(promptObj, null, 2)}
`;

    let translatedBatch = null;
    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: 'application/json' }
        });
        const resp = await model.generateContent(prompt);
        translatedBatch = JSON.parse(resp.response.text());
        if (translatedBatch && typeof translatedBatch === 'object') break;
      } catch (err) {
        console.warn(`[House Interp Translate] Model ${modelName} error:`, err.message);
      }
    }

    if (translatedBatch) {
      Object.assign(cachedMap, translatedBatch);
      try {
        fs.writeFileSync(cacheFile, JSON.stringify(cachedMap, null, 2), 'utf8');
      } catch (saveErr) {
        console.warn('Failed writing house_interpretations cache:', saveErr.message);
      }
    } else {
      // Fallback translation for missing items when Gemini is unavailable / quota exhausted
      console.log(`[House Interp Translate] Utilizing fallback translation engine for ${targetLang}...`);
      const fallbackBatch = {};
      await Promise.all(
        missingItems.map(async (it) => {
          fallbackBatch[it.key] = await translateFallback(it.text, targetLang);
        })
      );
      Object.assign(cachedMap, fallbackBatch);
      try {
        fs.writeFileSync(cacheFile, JSON.stringify(cachedMap, null, 2), 'utf8');
      } catch (saveErr) {
        console.warn('Failed writing fallback house_interpretations cache:', saveErr.message);
      }
    }

    const finalResult = {};
    items.forEach(it => {
      finalResult[it.key] = cachedMap[it.key] || translatedBatch?.[it.key] || it.text;
    });

    return res.json({ success: true, fromCache: false, translations: finalResult });
  } catch (err) {
    console.error('❌ House interpretation translation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/translate/conjunction-interpretations
// Accepts { targetLang, targetLangName, items: [{ key: 'Sun-Mercury-good-0', text: '...' }] }
// Returns { success: true, translations: { 'Sun-Mercury-good-0': '...' } }
router.post('/conjunction-interpretations', async (req, res) => {
  try {
    const { targetLang, targetLangName, items } = req.body;

    if (!targetLang || targetLang === 'en' || !Array.isArray(items) || items.length === 0) {
      const fallback = {};
      (items || []).forEach(it => { fallback[it.key] = it.text; });
      return res.json({ success: true, fromCache: true, translations: fallback });
    }

    const cacheFile = path.join(LOCALES_DIR, `${targetLang}_conjunction_interpretations.json`);
    let cachedMap = {};
    if (fs.existsSync(cacheFile)) {
      try {
        cachedMap = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      } catch (e) {
        cachedMap = {};
      }
    }

    // Determine missing items that need translation
    const missingItems = items.filter(it => !cachedMap[it.key]);

    if (missingItems.length === 0) {
      const result = {};
      items.forEach(it => { result[it.key] = cachedMap[it.key] || it.text; });
      return res.json({ success: true, fromCache: true, translations: result });
    }

    // Call Gemini to translate missing items
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const result = {};
      items.forEach(it => { result[it.key] = cachedMap[it.key] || it.text; });
      return res.json({ success: true, fromCache: false, translations: result });
    }

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const candidateModels = [
      process.env.GEMINI_FLASH_MODEL || 'gemini-2.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.8-flash'
    ];

    const promptObj = {};
    missingItems.forEach(it => { promptObj[it.key] = it.text; });

    const langDisplayName = targetLangName || targetLang;
    const prompt = `
You are an authentic classical Vedic Astrologer and expert Indian linguist.
Translate each planetary conjunction analysis, title, and bullet point into fluent, natural ${langDisplayName}.

CRITICAL RULES:
1. Preserve authentic Vedic astrology technical terms (e.g., Yuti, Conjunction, Bhava, House, Lagna, Rasi, Yoga, Budhaditya, Shubha, Ashubha, Karak).
2. Keep short tags and headers concise and punchy in ${langDisplayName}.
3. Keep the meaning accurate, insightful, and fluent for native readers.
4. Output ONLY a valid JSON object matching the input keys.

INPUT JSON:
${JSON.stringify(promptObj, null, 2)}
`;

    let translatedBatch = null;
    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: 'application/json' }
        });
        const resp = await model.generateContent(prompt);
        translatedBatch = JSON.parse(resp.response.text());
        if (translatedBatch && typeof translatedBatch === 'object') break;
      } catch (err) {
        console.warn(`[Conjunction Interp Translate] Model ${modelName} error:`, err.message);
      }
    }

    if (translatedBatch) {
      Object.assign(cachedMap, translatedBatch);
      try {
        fs.writeFileSync(cacheFile, JSON.stringify(cachedMap, null, 2), 'utf8');
      } catch (saveErr) {
        console.warn('Failed writing conjunction_interpretations cache:', saveErr.message);
      }
    } else {
      // Fallback translation for missing items when Gemini is unavailable / quota exhausted
      console.log(`[Conjunction Interp Translate] Utilizing fallback translation engine for ${targetLang}...`);
      const fallbackBatch = {};
      await Promise.all(
        missingItems.map(async (it) => {
          fallbackBatch[it.key] = await translateFallback(it.text, targetLang);
        })
      );
      Object.assign(cachedMap, fallbackBatch);
      try {
        fs.writeFileSync(cacheFile, JSON.stringify(cachedMap, null, 2), 'utf8');
      } catch (saveErr) {
        console.warn('Failed writing fallback conjunction_interpretations cache:', saveErr.message);
      }
    }

    const finalResult = {};
    items.forEach(it => {
      finalResult[it.key] = cachedMap[it.key] || translatedBatch?.[it.key] || it.text;
    });

    return res.json({ success: true, fromCache: false, translations: finalResult });
  } catch (err) {
    console.error('❌ Conjunction interpretation translation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/translate/yamakantaka-interpretations
// Accepts { targetLang, targetLangName, items: [{ key: '1', title: '...', effect: '...' }] }
// Returns { success: true, translations: { '1': { title: '...', effect: '...' } } }
router.post('/yamakantaka-interpretations', async (req, res) => {
  try {
    const { targetLang, targetLangName, items } = req.body;

    if (!targetLang || targetLang === 'en' || !Array.isArray(items) || items.length === 0) {
      const fallback = {};
      (items || []).forEach(it => { fallback[it.key] = { title: it.title, effect: it.effect }; });
      return res.json({ success: true, fromCache: true, translations: fallback });
    }

    const cacheFile = path.join(LOCALES_DIR, `${targetLang}_yamakantaka_interpretations.json`);
    let cachedMap = {};
    if (fs.existsSync(cacheFile)) {
      try {
        cachedMap = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      } catch (e) {
        cachedMap = {};
      }
    }

    // Determine missing items that need translation
    const missingItems = items.filter(it => !cachedMap[it.key]);

    if (missingItems.length === 0) {
      const result = {};
      items.forEach(it => { result[it.key] = cachedMap[it.key] || { title: it.title, effect: it.effect }; });
      return res.json({ success: true, fromCache: true, translations: result });
    }

    // Call Gemini to translate missing items
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const result = {};
      items.forEach(it => { result[it.key] = cachedMap[it.key] || { title: it.title, effect: it.effect }; });
      return res.json({ success: true, fromCache: false, translations: result });
    }

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const candidateModels = [
      process.env.GEMINI_FLASH_MODEL || 'gemini-2.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.8-flash'
    ];

    const promptObj = {};
    missingItems.forEach(it => { promptObj[it.key] = { title: it.title, effect: it.effect }; });

    const langDisplayName = targetLangName || targetLang;
    const prompt = `
You are an authentic classical Vedic Astrologer and expert Indian linguist.
Translate each Yamakantaka (Jupiter's Upagraha) house placement title and benevolent effect description into fluent, natural ${langDisplayName}.

CRITICAL RULES:
1. Preserve authentic Vedic astrology technical terms (e.g., Yamakantaka, Upagraha, Guru/Jupiter, Bhava, House, Lagna, Rasi, Moksha, Parashara).
2. Keep the auspicious, protective tone authentic and inspiring.
3. Return ONLY a valid JSON object matching the input keys with the exact { "title": "...", "effect": "..." } schema for each house key.

INPUT JSON:
${JSON.stringify(promptObj, null, 2)}
`;

    let translatedBatch = null;
    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: 'application/json' }
        });
        const resp = await model.generateContent(prompt);
        translatedBatch = JSON.parse(resp.response.text());
        if (translatedBatch && typeof translatedBatch === 'object') break;
      } catch (err) {
        console.warn(`[Yamakantaka Interp Translate] Model ${modelName} error:`, err.message);
      }
    }

    if (translatedBatch) {
      Object.assign(cachedMap, translatedBatch);
      try {
        fs.writeFileSync(cacheFile, JSON.stringify(cachedMap, null, 2), 'utf8');
      } catch (saveErr) {
        console.warn('Failed writing yamakantaka_interpretations cache:', saveErr.message);
      }
    }

    const finalResult = {};
    items.forEach(it => {
      finalResult[it.key] = cachedMap[it.key] || translatedBatch?.[it.key] || { title: it.title, effect: it.effect };
    });

    return res.json({ success: true, fromCache: false, translations: finalResult });
  } catch (err) {
    console.error('❌ Yamakantaka interpretation translation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/translate/mandi-gulika-interpretations
// Accepts { targetLang, targetLangName, items: [{ key: '1', title: '...', effect: '...' }] }
// Returns { success: true, translations: { '1': { title: '...', effect: '...' } } }
router.post('/mandi-gulika-interpretations', async (req, res) => {
  try {
    const { targetLang, targetLangName, items } = req.body;

    if (!targetLang || targetLang === 'en' || !Array.isArray(items) || items.length === 0) {
      const fallback = {};
      (items || []).forEach(it => { fallback[it.key] = { title: it.title, effect: it.effect }; });
      return res.json({ success: true, fromCache: true, translations: fallback });
    }

    const cacheFile = path.join(LOCALES_DIR, `${targetLang}_mandi_gulika_interpretations.json`);
    let cachedMap = {};
    if (fs.existsSync(cacheFile)) {
      try {
        cachedMap = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      } catch (e) {
        cachedMap = {};
      }
    }

    // Determine missing items that need translation
    const missingItems = items.filter(it => !cachedMap[it.key]);

    if (missingItems.length === 0) {
      const result = {};
      items.forEach(it => { result[it.key] = cachedMap[it.key] || { title: it.title, effect: it.effect }; });
      return res.json({ success: true, fromCache: true, translations: result });
    }

    // Call Gemini to translate missing items
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const result = {};
      items.forEach(it => { result[it.key] = cachedMap[it.key] || { title: it.title, effect: it.effect }; });
      return res.json({ success: true, fromCache: false, translations: result });
    }

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const candidateModels = [
      process.env.GEMINI_FLASH_MODEL || 'gemini-2.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.8-flash'
    ];

    const promptObj = {};
    missingItems.forEach(it => { promptObj[it.key] = { title: it.title, effect: it.effect }; });

    const langDisplayName = targetLangName || targetLang;
    const prompt = `
You are an authentic classical Vedic Astrologer and expert Indian linguist.
Translate each Mandi and Gulika (Saturn's sons / Upagraha) house placement title and karmic effect description into fluent, natural ${langDisplayName}.

CRITICAL RULES:
1. Preserve authentic Vedic astrology technical terms (e.g., Mandi, Gulika, Upagraha, Shani, Saturn, Upachaya, Bhava, House, Lagna, Rasi, Karma).
2. Keep the classical, diagnostic, and remediable tone authentic and fluent for native readers.
3. Return ONLY a valid JSON object matching the input keys with the exact { "title": "...", "effect": "..." } schema for each house key.

INPUT JSON:
${JSON.stringify(promptObj, null, 2)}
`;

    let translatedBatch = null;
    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: 'application/json' }
        });
        const resp = await model.generateContent(prompt);
        translatedBatch = JSON.parse(resp.response.text());
        if (translatedBatch && typeof translatedBatch === 'object') break;
      } catch (err) {
        console.warn(`[Mandi Gulika Interp Translate] Model ${modelName} error:`, err.message);
      }
    }

    if (translatedBatch) {
      Object.assign(cachedMap, translatedBatch);
      try {
        fs.writeFileSync(cacheFile, JSON.stringify(cachedMap, null, 2), 'utf8');
      } catch (saveErr) {
        console.warn('Failed writing mandi_gulika_interpretations cache:', saveErr.message);
      }
    }

    const finalResult = {};
    items.forEach(it => {
      finalResult[it.key] = cachedMap[it.key] || translatedBatch?.[it.key] || { title: it.title, effect: it.effect };
    });

    return res.json({ success: true, fromCache: false, translations: finalResult });
  } catch (err) {
    console.error('❌ Mandi Gulika interpretation translation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/translate/upaketu-interpretations
// Accepts { targetLang, targetLangName, items: [{ key: '1', title: '...', effect: '...' }] }
// Returns { success: true, translations: { '1': { title: '...', effect: '...' } } }
router.post('/upaketu-interpretations', async (req, res) => {
  try {
    const { targetLang, targetLangName, items } = req.body;

    if (!targetLang || targetLang === 'en' || !Array.isArray(items) || items.length === 0) {
      const fallback = {};
      (items || []).forEach(it => { fallback[it.key] = { title: it.title, effect: it.effect }; });
      return res.json({ success: true, fromCache: true, translations: fallback });
    }

    const cacheFile = path.join(LOCALES_DIR, `${targetLang}_upaketu_interpretations.json`);
    let cachedMap = {};
    if (fs.existsSync(cacheFile)) {
      try {
        cachedMap = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      } catch (e) {
        cachedMap = {};
      }
    }

    // Determine missing items that need translation
    const missingItems = items.filter(it => !cachedMap[it.key]);

    if (missingItems.length === 0) {
      const result = {};
      items.forEach(it => { result[it.key] = cachedMap[it.key] || { title: it.title, effect: it.effect }; });
      return res.json({ success: true, fromCache: true, translations: result });
    }

    // Call Gemini to translate missing items
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const result = {};
      items.forEach(it => { result[it.key] = cachedMap[it.key] || { title: it.title, effect: it.effect }; });
      return res.json({ success: true, fromCache: false, translations: result });
    }

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const candidateModels = [
      process.env.GEMINI_FLASH_MODEL || 'gemini-2.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.8-flash'
    ];

    const promptObj = {};
    missingItems.forEach(it => { promptObj[it.key] = { title: it.title, effect: it.effect }; });

    const langDisplayName = targetLangName || targetLang;
    const prompt = `
You are an authentic classical Vedic Astrologer and expert Indian linguist.
Translate each Upaketu (Sikhi / Aprakasha Graha) house placement title and karmic effect description into fluent, natural ${langDisplayName}.

CRITICAL RULES:
1. Preserve authentic Vedic astrology technical terms (e.g., Upaketu, Sikhi, Aprakasha Graha, Mars, Ketu, Upachaya, Bhava, House, Lagna, Rasi, Karma).
2. Keep the classical, diagnostic, and remediable tone authentic, cautionary, and fluent for native readers.
3. Return ONLY a valid JSON object matching the input keys with the exact { "title": "...", "effect": "..." } schema for each house key.

INPUT JSON:
${JSON.stringify(promptObj, null, 2)}
`;

    let translatedBatch = null;
    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: 'application/json' }
        });
        const resp = await model.generateContent(prompt);
        translatedBatch = JSON.parse(resp.response.text());
        if (translatedBatch && typeof translatedBatch === 'object') break;
      } catch (err) {
        console.warn(`[Upaketu Interp Translate] Model ${modelName} error:`, err.message);
      }
    }

    if (translatedBatch) {
      Object.assign(cachedMap, translatedBatch);
      try {
        fs.writeFileSync(cacheFile, JSON.stringify(cachedMap, null, 2), 'utf8');
      } catch (saveErr) {
        console.warn('Failed writing upaketu_interpretations cache:', saveErr.message);
      }
    }

    const finalResult = {};
    items.forEach(it => {
      finalResult[it.key] = cachedMap[it.key] || translatedBatch?.[it.key] || { title: it.title, effect: it.effect };
    });

    return res.json({ success: true, fromCache: false, translations: finalResult });
  } catch (err) {
    console.error('❌ Upaketu interpretation translation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/translate/indrachapa-interpretations
// Accepts { targetLang, targetLangName, items: [{ key: '1', title: '...', effect: '...' }] }
// Returns { success: true, translations: { '1': { title: '...', effect: '...' } } }
router.post('/indrachapa-interpretations', async (req, res) => {
  try {
    const { targetLang, targetLangName, items } = req.body;

    if (!targetLang || targetLang === 'en' || !Array.isArray(items) || items.length === 0) {
      const fallback = {};
      (items || []).forEach(it => { fallback[it.key] = { title: it.title, effect: it.effect }; });
      return res.json({ success: true, fromCache: true, translations: fallback });
    }

    const cacheFile = path.join(LOCALES_DIR, `${targetLang}_indrachapa_interpretations.json`);
    let cachedMap = {};
    if (fs.existsSync(cacheFile)) {
      try {
        cachedMap = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      } catch (e) {
        cachedMap = {};
      }
    }

    // Determine missing items that need translation
    const missingItems = items.filter(it => !cachedMap[it.key]);

    if (missingItems.length === 0) {
      const result = {};
      items.forEach(it => { result[it.key] = cachedMap[it.key] || { title: it.title, effect: it.effect }; });
      return res.json({ success: true, fromCache: true, translations: result });
    }

    // Call Gemini to translate missing items
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const result = {};
      items.forEach(it => { result[it.key] = cachedMap[it.key] || { title: it.title, effect: it.effect }; });
      return res.json({ success: true, fromCache: false, translations: result });
    }

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const candidateModels = [
      process.env.GEMINI_FLASH_MODEL || 'gemini-2.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.8-flash'
    ];

    const promptObj = {};
    missingItems.forEach(it => { promptObj[it.key] = { title: it.title, effect: it.effect }; });

    const langDisplayName = targetLangName || targetLang;
    const prompt = `
You are an authentic classical Vedic Astrologer and expert Indian linguist.
Translate each Indrachapa / Kodanda (Aprakasha Graha / Indra's Rainbow Bow) house placement title and karmic effect description into fluent, natural ${langDisplayName}.

CRITICAL RULES:
1. Preserve authentic Vedic astrology technical terms (e.g., Indrachapa, Kodanda, Aprakasha Graha, Indra, Upachaya, Bhava, House, Lagna, Rasi, Karma, Maya).
2. Keep the classical, diagnostic, and remediable tone authentic, cautionary, and fluent for native readers.
3. Return ONLY a valid JSON object matching the input keys with the exact { "title": "...", "effect": "..." } schema for each house key.

INPUT JSON:
${JSON.stringify(promptObj, null, 2)}
`;

    let translatedBatch = null;
    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: 'application/json' }
        });
        const resp = await model.generateContent(prompt);
        translatedBatch = JSON.parse(resp.response.text());
        if (translatedBatch && typeof translatedBatch === 'object') break;
      } catch (err) {
        console.warn(`[Indrachapa Interp Translate] Model ${modelName} error:`, err.message);
      }
    }

    if (translatedBatch) {
      Object.assign(cachedMap, translatedBatch);
      try {
        fs.writeFileSync(cacheFile, JSON.stringify(cachedMap, null, 2), 'utf8');
      } catch (saveErr) {
        console.warn('Failed writing indrachapa_interpretations cache:', saveErr.message);
      }
    }

    const finalResult = {};
    items.forEach(it => {
      finalResult[it.key] = cachedMap[it.key] || translatedBatch?.[it.key] || { title: it.title, effect: it.effect };
    });

    return res.json({ success: true, fromCache: false, translations: finalResult });
  } catch (err) {
    console.error('❌ Indrachapa interpretation translation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// POST /api/translate/ui
router.post('/ui', async (req, res) => {
  try {
    const { targetLang, targetLangName, strings } = req.body;

    if (!targetLang || targetLang === 'en') {
      return res.json({ success: true, fromCache: true, translations: strings });
    }

    if (!strings || typeof strings !== 'object') {
      return res.status(400).json({ success: false, error: 'Strings object is required' });
    }

    // 1. Check server-side disk cache first (Zero cost & instant response)
    const crypto = require('crypto');
    const stringsHash = crypto.createHash('md5').update(JSON.stringify(Object.keys(strings).sort())).digest('hex').slice(0, 10);
    const namespace = req.body.namespace || 'general';
    const cacheFile = path.join(LOCALES_DIR, `${targetLang}_${namespace}_${stringsHash}.json`);
    
    // Also support fallback to existing kundali_hub file if namespace is kundali_hub
    const legacyCacheFile = path.join(LOCALES_DIR, `${targetLang}_kundali_hub.json`);

    if (fs.existsSync(cacheFile)) {
      try {
        const cachedData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        return res.json({ success: true, fromCache: true, translations: cachedData });
      } catch (readErr) {
        console.warn(`Failed reading locale cache for ${targetLang}:`, readErr);
      }
    } else if (namespace === 'kundali_hub' && fs.existsSync(legacyCacheFile)) {
      try {
        const cachedData = JSON.parse(fs.readFileSync(legacyCacheFile, 'utf8'));
        return res.json({ success: true, fromCache: true, translations: cachedData });
      } catch (readErr) { }
    }

    // 2. Call Gemini to translate strings with automatic fallback & retry on 503 / high demand
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not configured. Returning original strings.');
      return res.json({ success: true, fromCache: false, translations: strings });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const candidateModels = [
      process.env.GEMINI_FLASH_MODEL || 'gemini-2.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.8-flash'
    ];

    const langDisplayName = targetLangName || targetLang;
    const prompt = `
You are a classical Vedic Astrologer and expert Indian Linguist translating UI text for a Vedic Astrology platform.
Translate all JSON string values into ${langDisplayName}.

CRITICAL RULES:
1. Preserve authentic Vedic/Jyotish terms accurately (e.g., Kundali, Lagna, Rasi, Nakshatra, Dasha, Mahadasha, Vimshottari, Shodashvarga, Dhan Yog, Sadesati, Upay, Totke, Rudraksha, Ratna). Use traditional authentic vocabulary or native script transliteration.
2. Maintain English symbols and punctuation intact like "↗", "•", "↓", "D1-D60", and numeric indicators.
3. Keep English proper names like "Swiss Ephemeris" or "Gemini Flash" appropriately transliterated or intact if standard.
4. Return ONLY a valid JSON object matching the exact keys of the input.

INPUT JSON:
${JSON.stringify(strings, null, 2)}
`;

    let translatedJson = null;
    let lastError = null;

    for (const modelName of candidateModels) {
      // Try up to 2 attempts per candidate model with delay
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: { responseMimeType: 'application/json' }
          });
          const result = await model.generateContent(prompt);
          translatedJson = JSON.parse(result.response.text());
          break;
        } catch (err) {
          lastError = err;
          console.warn(`[Translation Warning] Attempt ${attempt} failed with ${modelName}:`, err.message || err);
          // Wait 1.2s before retry or fallback
          await new Promise(r => setTimeout(r, 1200));
        }
      }
      if (translatedJson) break;
    }

    if (!translatedJson) {
      throw lastError || new Error('All translation models exhausted or unavailable');
    }

    // 3. Save to server cache file so subsequent requests are free & instantaneous
    try {
      fs.writeFileSync(cacheFile, JSON.stringify(translatedJson, null, 2), 'utf8');
    } catch (saveErr) {
      console.warn(`Failed saving locale cache for ${targetLang}:`, saveErr);
    }

    return res.json({ success: true, fromCache: false, translations: translatedJson });
  } catch (error) {
    console.error('❌ Translation API error:', error);
  }
});

// GET /api/translate/d2-hora/:lang
router.get('/d2-hora/:lang', async (req, res) => {
  try {
    const lang = (req.params.lang || 'en').toLowerCase().trim();
    if (lang === 'en') {
      return res.json({ success: true, lang: 'en', data: null });
    }

    // 1. Try finding in MongoDB
    const translation = await D2HoraTranslation.findOne({ lang }).lean();
    if (translation) {
      return res.json({ success: true, fromDB: true, lang, data: translation });
    }

    return res.json({ success: true, fromDB: false, lang, data: null });
  } catch (error) {
    console.error('Error fetching D2 Hora translation from DB:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/translate/d3-drekkana/:lang
router.get('/d3-drekkana/:lang', async (req, res) => {
  try {
    const lang = (req.params.lang || 'en').toLowerCase().trim();
    if (lang === 'en') {
      return res.json({ success: true, lang: 'en', data: null });
    }

    // 1. Try finding in MongoDB
    const translation = await D3DrekkanaTranslation.findOne({ lang }).lean();
    if (translation) {
      return res.json({ success: true, fromDB: true, lang, data: translation });
    }

    return res.json({ success: true, fromDB: false, lang, data: null });
  } catch (error) {
    console.error('Error fetching D3 Drekkana translation from DB:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/translate/d3-drekkana
router.post('/d3-drekkana', async (req, res) => {
  try {
    const { targetLang, targetLangName, interpretations, ui } = req.body;
    if (!targetLang || targetLang === 'en') {
      return res.json({ success: true, lang: 'en', data: null });
    }

    const saved = await D3DrekkanaTranslation.findOneAndUpdate(
      { lang: targetLang },
      {
        $set: {
          lang: targetLang,
          langName: targetLangName || targetLang,
          interpretations: interpretations || {},
          ui: ui || {}
        }
      },
      { upsert: true, new: true }
    );

    return res.json({ success: true, data: saved });
  } catch (error) {
    console.error('Error saving D3 Drekkana translation in DB:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/translate/d4-chaturthamsha/:lang
router.get('/d4-chaturthamsha/:lang', async (req, res) => {
  try {
    const lang = (req.params.lang || 'en').toLowerCase().trim();
    if (lang === 'en') {
      return res.json({ success: true, lang: 'en', data: null });
    }

    // Try finding in MongoDB
    const translation = await D4ChaturthamshaTranslation.findOne({ lang }).lean();
    if (translation) {
      return res.json({ success: true, fromDB: true, lang, data: translation });
    }

    return res.json({ success: true, fromDB: false, lang, data: null });
  } catch (error) {
    console.error('Error fetching D4 Chaturthamsha translation from DB:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/translate/d4-chaturthamsha
router.post('/d4-chaturthamsha', async (req, res) => {
  try {
    const { targetLang, targetLangName, interpretations, ui } = req.body;
    if (!targetLang || targetLang === 'en') {
      return res.json({ success: true, lang: 'en', data: null });
    }

    const saved = await D4ChaturthamshaTranslation.findOneAndUpdate(
      { lang: targetLang },
      {
        $set: {
          lang: targetLang,
          langName: targetLangName || targetLang,
          interpretations: interpretations || {},
          ui: ui || {}
        }
      },
      { upsert: true, new: true }
    );

    return res.json({ success: true, data: saved });
  } catch (error) {
    console.error('Error saving D4 Chaturthamsha translation in DB:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/translate/d7-interpretations
// Accepts { targetLang, targetLangName, items: [{ key: 'Sun_1_positive', text: '...' }] }
// Returns { success: true, translations: { 'Sun_1_positive': '...' } }
router.post('/d7-interpretations', async (req, res) => {
  try {
    const { targetLang, targetLangName, items } = req.body;

    if (!targetLang || targetLang === 'en' || !Array.isArray(items) || items.length === 0) {
      const fallback = {};
      (items || []).forEach(it => { fallback[it.key] = it.text; });
      return res.json({ success: true, fromCache: true, translations: fallback });
    }

    const cacheFile = path.join(LOCALES_DIR, `${targetLang}_d7_interpretations.json`);
    let cachedMap = {};
    if (fs.existsSync(cacheFile)) {
      try {
        cachedMap = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      } catch (e) {
        cachedMap = {};
      }
    }

    // Determine missing items that need translation
    const missingItems = items.filter(it => !cachedMap[it.key]);

    if (missingItems.length === 0) {
      const result = {};
      items.forEach(it => { result[it.key] = cachedMap[it.key] || it.text; });
      return res.json({ success: true, fromCache: true, translations: result });
    }

    // Call Gemini to translate missing items
    const apiKey = process.env.GEMINI_API_KEY;
    let translatedBatch = null;

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: process.env.GEMINI_FLASH_MODEL || 'gemini-3.5-flash-lite',
          generationConfig: { responseMimeType: 'application/json' }
        });

        const langDisplayName = targetLangName || targetLang;
        const inputMap = {};
        missingItems.forEach(it => { inputMap[it.key] = it.text; });

        const prompt = `You are a Vedic Astrologer and linguistic expert.
Translate each astrological D7 Saptamsha (children, progeny & creativity) interpretation into ${langDisplayName}.
Preserve astrological terminology (Sun, Moon, Jupiter, Santana Karaka, Saptamsha, Lagna, House, Karma) with cultural accuracy.
Return a single JSON object where each key matches the input key and the value is the natural, fluent translation in ${langDisplayName}.

INPUT JSON:
${JSON.stringify(inputMap, null, 2)}`;

        const result = await model.generateContent(prompt);
        translatedBatch = JSON.parse(result.response.text());
        if (translatedBatch && typeof translatedBatch === 'object') {
          Object.assign(cachedMap, translatedBatch);
        }
      } catch (geminiErr) {
        console.warn('[D7 Saptamsha Gemini Translation Warning]:', geminiErr.message);
      }
    }

    // Fallback translation for remaining missing items
    const stillMissing = items.filter(it => !cachedMap[it.key]);
    if (stillMissing.length > 0) {
      const fallbackBatch = {};
      await Promise.all(
        stillMissing.map(async (it) => {
          fallbackBatch[it.key] = await translateFallback(it.text, targetLang);
        })
      );
      Object.assign(cachedMap, fallbackBatch);
    }

    // Write cache to disk
    try {
      fs.writeFileSync(cacheFile, JSON.stringify(cachedMap, null, 2), 'utf8');
    } catch (saveErr) {
      console.warn('Failed writing d7_interpretations cache:', saveErr.message);
    }

    const finalResult = {};
    items.forEach(it => {
      finalResult[it.key] = cachedMap[it.key] || it.text;
    });

    return res.json({ success: true, fromCache: false, translations: finalResult });
  } catch (err) {
    console.error('D7 interpretation translation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/translate/d7-saptamsha/:lang
router.get('/d7-saptamsha/:lang', async (req, res) => {
  try {
    const lang = (req.params.lang || 'en').toLowerCase().trim();
    if (lang === 'en') {
      return res.json({ success: true, lang: 'en', data: null });
    }

    // Try finding in MongoDB
    const translation = await D7SaptamshaTranslation.findOne({ lang }).lean();
    if (translation) {
      return res.json({ success: true, fromDB: true, lang, data: translation });
    }

    return res.json({ success: true, fromDB: false, lang, data: null });
  } catch (error) {
    console.error('Error fetching D7 Saptamsha translation from DB:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/translate/d7-saptamsha
router.post('/d7-saptamsha', async (req, res) => {
  try {
    const { targetLang, targetLangName, interpretations, ui } = req.body;
    if (!targetLang || targetLang === 'en') {
      return res.json({ success: true, lang: 'en', data: null });
    }

    const saved = await D7SaptamshaTranslation.findOneAndUpdate(
      { lang: targetLang },
      {
        $set: {
          lang: targetLang,
          langName: targetLangName || targetLang,
          interpretations: interpretations || {},
          ui: ui || {}
        }
      },
      { upsert: true, new: true }
    );

    return res.json({ success: true, data: saved });
  } catch (error) {
    console.error('Error saving D7 Saptamsha translation in DB:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/translate/d9-interpretations
// Accepts { targetLang, targetLangName, items: [{ key: 'Sun_1_positive', text: '...' }] }
// Returns { success: true, translations: { 'Sun_1_positive': '...' } }
router.post('/d9-interpretations', async (req, res) => {
  try {
    const { targetLang, targetLangName, items } = req.body;

    if (!targetLang || targetLang === 'en' || !Array.isArray(items) || items.length === 0) {
      const fallback = {};
      (items || []).forEach(it => { fallback[it.key] = it.text; });
      return res.json({ success: true, fromCache: true, translations: fallback });
    }

    const cacheFile = path.join(LOCALES_DIR, `${targetLang}_d9_interpretations.json`);
    let cachedMap = {};
    if (fs.existsSync(cacheFile)) {
      try {
        cachedMap = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      } catch (e) {
        cachedMap = {};
      }
    }

    const missingItems = items.filter(it => !cachedMap[it.key]);

    if (missingItems.length === 0) {
      const result = {};
      items.forEach(it => { result[it.key] = cachedMap[it.key] || it.text; });
      return res.json({ success: true, fromCache: true, translations: result });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let translatedBatch = null;

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: process.env.GEMINI_FLASH_MODEL || 'gemini-3.5-flash-lite',
          generationConfig: { responseMimeType: 'application/json' }
        });

        const langDisplayName = targetLangName || targetLang;
        const inputMap = {};
        missingItems.forEach(it => { inputMap[it.key] = it.text; });

        const prompt = `You are an expert Vedic Astrologer and linguist.
Translate each astrological D9 Navamsha (marriage, spouse, soul destiny & dharma) interpretation into ${langDisplayName}.
Preserve authentic astrological terms (Sun, Moon, Lagna, Navamsha, Dharma, Karaka, House, Karma) with cultural fidelity.
Return a valid JSON object matching the exact input keys with natural fluent translations in ${langDisplayName}.

INPUT JSON:
${JSON.stringify(inputMap, null, 2)}`;

        const result = await model.generateContent(prompt);
        translatedBatch = JSON.parse(result.response.text());
        if (translatedBatch && typeof translatedBatch === 'object') {
          Object.assign(cachedMap, translatedBatch);
        }
      } catch (geminiErr) {
        console.warn('[D9 Navamsha Gemini Translation Warning]:', geminiErr.message);
      }
    }

    const stillMissing = items.filter(it => !cachedMap[it.key]);
    if (stillMissing.length > 0) {
      const fallbackBatch = {};
      await Promise.all(
        stillMissing.map(async (it) => {
          fallbackBatch[it.key] = await translateFallback(it.text, targetLang);
        })
      );
      Object.assign(cachedMap, fallbackBatch);
    }

    try {
      fs.writeFileSync(cacheFile, JSON.stringify(cachedMap, null, 2), 'utf8');
    } catch (saveErr) {
      console.warn('Failed writing d9_interpretations cache:', saveErr.message);
    }

    const finalResult = {};
    items.forEach(it => {
      finalResult[it.key] = cachedMap[it.key] || it.text;
    });

    return res.json({ success: true, fromCache: false, translations: finalResult });
  } catch (err) {
    console.error('D9 interpretation translation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/translate/d9-navamsha/:lang
router.get('/d9-navamsha/:lang', async (req, res) => {
  try {
    const lang = (req.params.lang || 'en').toLowerCase().trim();
    if (lang === 'en') {
      return res.json({ success: true, lang: 'en', data: null });
    }

    const translation = await D9NavamshaTranslation.findOne({ lang }).lean();
    if (translation) {
      return res.json({ success: true, fromDB: true, lang, data: translation });
    }

    return res.json({ success: true, fromDB: false, lang, data: null });
  } catch (error) {
    console.error('Error fetching D9 Navamsha translation from DB:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/translate/d9-navamsha
router.post('/d9-navamsha', async (req, res) => {
  try {
    const { targetLang, targetLangName, interpretations, ui } = req.body;
    if (!targetLang || targetLang === 'en') {
      return res.json({ success: true, lang: 'en', data: null });
    }

    const saved = await D9NavamshaTranslation.findOneAndUpdate(
      { lang: targetLang },
      {
        $set: {
          lang: targetLang,
          langName: targetLangName || targetLang,
          interpretations: interpretations || {},
          ui: ui || {}
        }
      },
      { upsert: true, new: true }
    );

    return res.json({ success: true, data: saved });
  } catch (error) {
    console.error('Error saving D9 Navamsha translation in DB:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/translate/d10-dashamsha/:lang
router.get('/d10-dashamsha/:lang', async (req, res) => {
  try {
    const lang = (req.params.lang || 'en').toLowerCase().trim();
    if (lang === 'en') {
      return res.json({ success: true, lang: 'en', data: null });
    }

    const translation = await D10DashamshaTranslation.findOne({ lang }).lean();
    if (translation) {
      return res.json({ success: true, fromDB: true, lang, data: translation });
    }

    // Fallback to disk cache if available
    const cacheFile = path.join(LOCALES_DIR, `${lang}_d10_dashamsha.json`);
    if (fs.existsSync(cacheFile)) {
      try {
        const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        return res.json({ success: true, fromDB: false, fromDisk: true, lang, data: cached });
      } catch (e) {}
    }

    return res.json({ success: true, fromDB: false, lang, data: null });
  } catch (error) {
    console.error('Error fetching D10 Dashamsha translation from DB:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/translate/d10-dashamsha
router.post('/d10-dashamsha', async (req, res) => {
  try {
    const { targetLang, targetLangName, interpretations, ui, dynamicAi } = req.body;
    if (!targetLang || targetLang === 'en') {
      return res.json({ success: true, lang: 'en', data: null });
    }

    const updateDoc = {
      lang: targetLang,
      langName: targetLangName || targetLang
    };
    if (interpretations) updateDoc.interpretations = interpretations;
    if (ui) updateDoc.ui = ui;
    if (dynamicAi) updateDoc.dynamicAi = dynamicAi;

    const saved = await D10DashamshaTranslation.findOneAndUpdate(
      { lang: targetLang },
      { $set: updateDoc },
      { upsert: true, new: true }
    );

    return res.json({ success: true, data: saved });
  } catch (error) {
    console.error('Error saving D10 Dashamsha translation in DB:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/translate/d12-dwadashamsha/:lang
router.get('/d12-dwadashamsha/:lang', async (req, res) => {
  try {
    const lang = (req.params.lang || 'en').toLowerCase().trim();
    if (lang === 'en') {
      return res.json({ success: true, lang: 'en', data: null });
    }

    const translation = await D12DwadashamshaTranslation.findOne({ lang }).lean();
    if (translation) {
      return res.json({ success: true, fromDB: true, lang, data: translation });
    }

    // Fallback to disk cache if available
    const cacheFile = path.join(LOCALES_DIR, `${lang}_d12_dwadashamsha.json`);
    if (fs.existsSync(cacheFile)) {
      try {
        const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        return res.json({ success: true, fromDB: false, fromDisk: true, lang, data: cached });
      } catch (e) {}
    }

    return res.json({ success: true, fromDB: false, lang, data: null });
  } catch (error) {
    console.error('Error fetching D12 Dwadashamsha translation from DB:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/translate/d12-dwadashamsha
router.post('/d12-dwadashamsha', async (req, res) => {
  try {
    const { targetLang, targetLangName, intro, planets, ui } = req.body;
    if (!targetLang || targetLang === 'en') {
      return res.json({ success: true, lang: 'en', data: null });
    }

    const updateDoc = {
      lang: targetLang,
      langName: targetLangName || targetLang
    };
    if (intro) updateDoc.intro = intro;
    if (planets) updateDoc.planets = planets;
    if (ui) updateDoc.ui = ui;

    const saved = await D12DwadashamshaTranslation.findOneAndUpdate(
      { lang: targetLang },
      { $set: updateDoc },
      { upsert: true, new: true }
    );

    return res.json({ success: true, data: saved });
  } catch (error) {
    console.error('Error saving D12 Dwadashamsha translation in DB:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/translate/d16-shodashamsha/:lang
router.get('/d16-shodashamsha/:lang', async (req, res) => {
  try {
    const lang = (req.params.lang || 'en').toLowerCase().trim();
    if (lang === 'en') {
      return res.json({ success: true, lang: 'en', data: null });
    }

    const translation = await D16ShodashamshaTranslation.findOne({ lang }).lean();
    if (translation) {
      return res.json({ success: true, fromDB: true, lang, data: translation });
    }

    // Fallback to disk cache if available
    const cacheFile = path.join(LOCALES_DIR, `${lang}_d16_shodashamsha.json`);
    if (fs.existsSync(cacheFile)) {
      try {
        const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        return res.json({ success: true, fromDB: false, fromDisk: true, lang, data: cached });
      } catch (e) {}
    }

    return res.json({ success: true, fromDB: false, lang, data: null });
  } catch (error) {
    console.error('Error fetching D16 Shodashamsha translation from DB:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/translate/d16-shodashamsha
router.post('/d16-shodashamsha', async (req, res) => {
  try {
    const { targetLang, targetLangName, intro, planets, ui } = req.body;
    if (!targetLang || targetLang === 'en') {
      return res.json({ success: true, lang: 'en', data: null });
    }

    const updateDoc = {
      lang: targetLang,
      langName: targetLangName || targetLang
    };
    if (intro) updateDoc.intro = intro;
    if (planets) updateDoc.planets = planets;
    if (ui) updateDoc.ui = ui;

    const saved = await D16ShodashamshaTranslation.findOneAndUpdate(
      { lang: targetLang },
      { $set: updateDoc },
      { upsert: true, new: true }
    );

    return res.json({ success: true, data: saved });
  } catch (error) {
    console.error('Error saving D16 Shodashamsha translation in DB:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/translate/d24-chaturvimshamsha/:lang
router.get('/d24-chaturvimshamsha/:lang', async (req, res) => {
  try {
    const lang = (req.params.lang || 'en').toLowerCase().trim();
    if (lang === 'en') {
      return res.json({ success: true, lang: 'en', data: null });
    }

    const translation = await D24ChaturvimshamshaTranslation.findOne({ lang }).lean();
    if (translation) {
      return res.json({ success: true, fromDB: true, lang, data: translation });
    }

    // Fallback to disk cache if available
    const cacheFile = path.join(LOCALES_DIR, `${lang}_d24_chaturvimshamsha.json`);
    if (fs.existsSync(cacheFile)) {
      try {
        const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        return res.json({ success: true, fromDB: false, fromDisk: true, lang, data: cached });
      } catch (e) {}
    }

    return res.json({ success: true, fromDB: false, lang, data: null });
  } catch (error) {
    console.error('Error fetching D24 Chaturvimshamsha translation from DB:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/translate/d24-chaturvimshamsha
router.post('/d24-chaturvimshamsha', async (req, res) => {
  try {
    const { targetLang, targetLangName, intro, interpretations, ui } = req.body;
    if (!targetLang || targetLang === 'en') {
      return res.json({ success: true, lang: 'en', data: null });
    }

    const updateDoc = {
      lang: targetLang,
      langName: targetLangName || targetLang
    };
    if (intro) updateDoc.intro = intro;
    if (interpretations) updateDoc.interpretations = interpretations;
    if (ui) updateDoc.ui = ui;

    const saved = await D24ChaturvimshamshaTranslation.findOneAndUpdate(
      { lang: targetLang },
      { $set: updateDoc },
      { upsert: true, new: true }
    );

    return res.json({ success: true, data: saved });
  } catch (error) {
    console.error('Error saving D24 Chaturvimshamsha translation in DB:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/translate/d27-bhamsa/:lang
router.get('/d27-bhamsa/:lang', async (req, res) => {
  try {
    const lang = (req.params.lang || 'en').toLowerCase().trim();
    if (lang === 'en') {
      return res.json({ success: true, lang: 'en', data: null });
    }

    const translation = await D27BhamsaTranslation.findOne({ lang }).lean();
    if (translation) {
      return res.json({ success: true, fromDB: true, lang, data: translation });
    }

    // Fallback to disk cache if available
    const cacheFile = path.join(LOCALES_DIR, `${lang}_d27_bhamsa.json`);
    if (fs.existsSync(cacheFile)) {
      try {
        const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        return res.json({ success: true, fromDB: false, fromDisk: true, lang, data: cached });
      } catch (e) {}
    }

    return res.json({ success: true, fromDB: false, lang, data: null });
  } catch (error) {
    console.error('Error fetching D27 Bhamsa translation from DB:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/translate/d27-bhamsa
router.post('/d27-bhamsa', async (req, res) => {
  try {
    const { targetLang, targetLangName, intro, interpretations, planetDescriptions, ui } = req.body;
    if (!targetLang || targetLang === 'en') {
      return res.json({ success: true, lang: 'en', data: null });
    }

    const updateDoc = {
      lang: targetLang,
      langName: targetLangName || targetLang
    };
    if (intro) updateDoc.intro = intro;
    if (interpretations) updateDoc.interpretations = interpretations;
    if (planetDescriptions) updateDoc.planetDescriptions = planetDescriptions;
    if (ui) updateDoc.ui = ui;

    const saved = await D27BhamsaTranslation.findOneAndUpdate(
      { lang: targetLang },
      { $set: updateDoc },
      { upsert: true, new: true }
    );

    return res.json({ success: true, data: saved });
  } catch (error) {
    console.error('Error saving D27 Bhamsa translation in DB:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/translate/d30-trimshamsha/:lang
router.get('/d30-trimshamsha/:lang', async (req, res) => {
  try {
    const lang = (req.params.lang || 'en').toLowerCase().trim();
    if (lang === 'en') {
      return res.json({ success: true, lang: 'en', data: null });
    }

    const translation = await D30TrimshamshaTranslation.findOne({ lang }).lean();
    if (translation) {
      return res.json({ success: true, fromDB: true, lang, data: translation });
    }

    // Fallback to disk cache if available
    const cacheFile = path.join(LOCALES_DIR, `${lang}_d30_trimshamsha.json`);
    if (fs.existsSync(cacheFile)) {
      try {
        const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        return res.json({ success: true, fromDB: false, fromDisk: true, lang, data: cached });
      } catch (e) {}
    }

    return res.json({ success: true, fromDB: false, lang, data: null });
  } catch (error) {
    console.error('Error fetching D30 Trimshamsha translation from DB:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/translate/d30-trimshamsha
router.post('/d30-trimshamsha', async (req, res) => {
  try {
    const { targetLang, targetLangName, intro, interpretations, planetDescriptions, ui } = req.body;
    if (!targetLang || targetLang === 'en') {
      return res.json({ success: true, lang: 'en', data: null });
    }

    const updateDoc = {
      lang: targetLang,
      langName: targetLangName || targetLang
    };
    if (intro) updateDoc.intro = intro;
    if (interpretations) updateDoc.interpretations = interpretations;
    if (planetDescriptions) updateDoc.planetDescriptions = planetDescriptions;
    if (ui) updateDoc.ui = ui;

    const saved = await D30TrimshamshaTranslation.findOneAndUpdate(
      { lang: targetLang },
      { $set: updateDoc },
      { upsert: true, new: true }
    );

    return res.json({ success: true, data: saved });
  } catch (error) {
    console.error('Error saving D30 Trimshamsha translation in DB:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/translate/d40-khavedamsha/:lang
router.get('/d40-khavedamsha/:lang', async (req, res) => {
  try {
    const lang = (req.params.lang || 'en').toLowerCase().trim();
    if (lang === 'en') {
      return res.json({ success: true, lang: 'en', data: null });
    }

    const translation = await D40KhavedamshaTranslation.findOne({ lang }).lean();
    if (translation) {
      return res.json({ success: true, fromDB: true, lang, data: translation });
    }

    // Fallback to disk cache if available
    const cacheFile = path.join(LOCALES_DIR, `${lang}_d40_khavedamsha.json`);
    if (fs.existsSync(cacheFile)) {
      try {
        const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        return res.json({ success: true, fromDB: false, fromDisk: true, lang, data: cached });
      } catch (e) {}
    }

    return res.json({ success: true, fromDB: false, lang, data: null });
  } catch (error) {
    console.error('Error fetching D40 Khavedamsha translation from DB:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/translate/d40-khavedamsha
router.post('/d40-khavedamsha', async (req, res) => {
  try {
    const { targetLang, targetLangName, intro, interpretations, planetDescriptions, ui } = req.body;
    if (!targetLang || targetLang === 'en') {
      return res.json({ success: true, lang: 'en', data: null });
    }

    const updateDoc = {
      lang: targetLang,
      langName: targetLangName || targetLang
    };
    if (intro) updateDoc.intro = intro;
    if (interpretations) updateDoc.interpretations = interpretations;
    if (planetDescriptions) updateDoc.planetDescriptions = planetDescriptions;
    if (ui) updateDoc.ui = ui;

    const saved = await D40KhavedamshaTranslation.findOneAndUpdate(
      { lang: targetLang },
      { $set: updateDoc },
      { upsert: true, new: true }
    );

    return res.json({ success: true, data: saved });
  } catch (error) {
    console.error('Error saving D40 Khavedamsha translation in DB:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/translate/d45-akshavedamsha/:lang
router.get('/d45-akshavedamsha/:lang', async (req, res) => {
  try {
    const lang = (req.params.lang || 'en').toLowerCase().trim();
    if (lang === 'en') {
      return res.json({ success: true, lang: 'en', data: null });
    }

    const translation = await D45AkshavedamshaTranslation.findOne({ lang }).lean();
    if (translation) {
      return res.json({ success: true, fromDB: true, lang, data: translation });
    }

    // Fallback to disk cache if available
    const cacheFile = path.join(LOCALES_DIR, `${lang}_d45_akshavedamsha.json`);
    if (fs.existsSync(cacheFile)) {
      try {
        const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        return res.json({ success: true, fromDB: false, fromDisk: true, lang, data: cached });
      } catch (e) {}
    }

    return res.json({ success: true, fromDB: false, lang, data: null });
  } catch (error) {
    console.error('Error fetching D45 Akshavedamsha translation from DB:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/translate/d45-akshavedamsha
router.post('/d45-akshavedamsha', async (req, res) => {
  try {
    const { targetLang, targetLangName, intro, interpretations, planetDescriptions, ui } = req.body;
    if (!targetLang || targetLang === 'en') {
      return res.json({ success: true, lang: 'en', data: null });
    }

    const updateDoc = {
      lang: targetLang,
      langName: targetLangName || targetLang
    };
    if (intro) updateDoc.intro = intro;
    if (interpretations) updateDoc.interpretations = interpretations;
    if (planetDescriptions) updateDoc.planetDescriptions = planetDescriptions;
    if (ui) updateDoc.ui = ui;

    const saved = await D45AkshavedamshaTranslation.findOneAndUpdate(
      { lang: targetLang },
      { $set: updateDoc },
      { upsert: true, new: true }
    );

    return res.json({ success: true, data: saved });
  } catch (error) {
    console.error('Error saving D45 Akshavedamsha translation in DB:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/translate/d60-shashtiamsha/:lang
router.get('/d60-shashtiamsha/:lang', async (req, res) => {
  try {
    const lang = (req.params.lang || 'en').toLowerCase().trim();
    if (lang === 'en') {
      return res.json({ success: true, lang: 'en', data: null });
    }

    const translation = await D60ShashtiamshaTranslation.findOne({ lang }).lean();
    if (translation) {
      return res.json({ success: true, fromDB: true, lang, data: translation });
    }

    // Fallback to disk cache if available
    const cacheFile = path.join(LOCALES_DIR, `${lang}_d60_shashtiamsha.json`);
    if (fs.existsSync(cacheFile)) {
      try {
        const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        return res.json({ success: true, fromDB: false, fromDisk: true, lang, data: cached });
      } catch (e) {}
    }

    return res.json({ success: true, fromDB: false, lang, data: null });
  } catch (error) {
    console.error('Error fetching D60 Shashtiamsha translation from DB:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/translate/d60-shashtiamsha
router.post('/d60-shashtiamsha', async (req, res) => {
  try {
    const { targetLang, targetLangName, intro, interpretations, planetDescriptions, ui } = req.body;
    if (!targetLang || targetLang === 'en') {
      return res.json({ success: true, lang: 'en', data: null });
    }

    const updateDoc = {
      lang: targetLang,
      langName: targetLangName || targetLang
    };
    if (intro) updateDoc.intro = intro;
    if (interpretations) updateDoc.interpretations = interpretations;
    if (planetDescriptions) updateDoc.planetDescriptions = planetDescriptions;
    if (ui) updateDoc.ui = ui;

    const saved = await D60ShashtiamshaTranslation.findOneAndUpdate(
      { lang: targetLang },
      { $set: updateDoc },
      { upsert: true, new: true }
    );

    return res.json({ success: true, data: saved });
  } catch (error) {
    console.error('Error saving D60 Shashtiamsha translation in DB:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/translate/d2-hora
// Translates and permanently stores D2 Hora planet & house interpretations into MongoDB
router.post('/d2-hora', async (req, res) => {
  try {
    const { targetLang, targetLangName, planets, houses, ui } = req.body;

    if (!targetLang || targetLang === 'en') {
      return res.json({ success: true, lang: 'en', data: null });
    }

    // 1. Check if already in MongoDB
    let existing = await D2HoraTranslation.findOne({ lang: targetLang }).lean();
    if (existing && existing.planets && Object.keys(existing.planets).length >= 9) {
      return res.json({ success: true, fromDB: true, data: existing });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
    const candidateModels = [
      process.env.GEMINI_FLASH_MODEL || 'gemini-2.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.8-flash'
    ];

    const langDisplayName = targetLangName || targetLang;

    let translatedPlanets = null;
    let translatedHouses = null;
    let translatedUI = null;

    if (genAI && planets) {
      const promptPlanets = `
You are a master Vedic Astrologer and linguist.
Translate this D2 Hora planetary interpretation dictionary into natural, authentic, grammatically flawless ${langDisplayName}.
CRITICAL RULES:
1. Translate all titles, summaries, readings, strengths, and challenges into ${langDisplayName}.
2. Keep technical terms intact (e.g., Hora, Surya, Chandra, Dhan Yoga, Raja Yoga, Leo, Cancer).
3. Output ONLY a valid JSON object matching the exact structure of the input.

INPUT JSON:
${JSON.stringify(planets, null, 2)}
`;
      for (const modelName of candidateModels) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: { responseMimeType: 'application/json' }
          });
          const resp = await model.generateContent(promptPlanets);
          translatedPlanets = JSON.parse(resp.response.text());
          if (translatedPlanets) break;
        } catch (e) {
          console.warn(`[D2 Hora Translate Planets] ${modelName} error:`, e.message);
        }
      }
    }

    if (genAI && houses) {
      const promptHouses = `
You are a master Vedic Astrologer and linguist.
Translate this D2 Hora 12-house interpretation dictionary into natural, authentic ${langDisplayName}.
CRITICAL RULES:
1. Translate title, core, favorable, and challenging into ${langDisplayName}.
2. Keep technical Vedic words (Bhav, Kendra, Trikona, Dhan) intact.
3. Output ONLY a valid JSON matching the exact structure of the input.

INPUT JSON:
${JSON.stringify(houses, null, 2)}
`;
      for (const modelName of candidateModels) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: { responseMimeType: 'application/json' }
          });
          const resp = await model.generateContent(promptHouses);
          translatedHouses = JSON.parse(resp.response.text());
          if (translatedHouses) break;
        } catch (e) {
          console.warn(`[D2 Hora Translate Houses] ${modelName} error:`, e.message);
        }
      }
    }

    let translatedGuidelines = null;
    if (genAI && req.body.guidelines) {
      const promptGuidelines = `
You are a master Vedic Astrologer and linguist.
Translate these Classical Parashari Hora guidelines into authentic, natural ${langDisplayName}.
CRITICAL RULES:
1. Translate title, ruleHindi, and content into ${langDisplayName}.
2. Keep technical words intact (e.g. Hora, Surya, Chandra, Parashara, Rasi).
3. Output ONLY a valid JSON array matching the exact structure of the input.

INPUT JSON:
${JSON.stringify(req.body.guidelines, null, 2)}
`;
      for (const modelName of candidateModels) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: { responseMimeType: 'application/json' }
          });
          const resp = await model.generateContent(promptGuidelines);
          translatedGuidelines = JSON.parse(resp.response.text());
          if (translatedGuidelines) break;
        } catch (e) {
          console.warn(`[D2 Hora Translate Guidelines] ${modelName} error:`, e.message);
        }
      }
    }

    // Fallback if Gemini failed
    if (!translatedPlanets && planets) {
      translatedPlanets = planets;
    }
    if (!translatedHouses && houses) {
      translatedHouses = houses;
    }
    if (!translatedGuidelines && req.body.guidelines) {
      translatedGuidelines = req.body.guidelines;
    }

    // Save directly to MongoDB
    const doc = await D2HoraTranslation.findOneAndUpdate(
      { lang: targetLang },
      {
        lang: targetLang,
        langName: langDisplayName,
        ui: ui || {},
        planets: translatedPlanets,
        houses: translatedHouses,
        guidelines: translatedGuidelines
      },
      { upsert: true, new: true }
    );

    return res.json({ success: true, fromDB: false, data: doc });
  } catch (error) {
    console.error('Error in D2 Hora translation pipeline:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/translate/dynamic-text
// Translates dynamic text (e.g., Dynamic AI Assessment) to any target Indian language
router.post('/dynamic-text', async (req, res) => {
  try {
    const { text, targetLang, targetLangName } = req.body;
    if (!text || !targetLang || targetLang === 'en') {
      return res.json({ success: true, translatedText: text });
    }

    // Try Gemini if API key is present
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const modelName = process.env.GEMINI_FLASH_MODEL || 'gemini-3.5-flash-lite';
        const model = genAI.getGenerativeModel({ model: modelName });
        const langDisplayName = targetLangName || targetLang;

        const prompt = `You are an expert Vedic Astrologer and linguist translating astrological analysis into ${langDisplayName}.
Translate the following Vedic Astrology text accurately, naturally and fluently into ${langDisplayName}.
Keep astrological terms (Lagna, Rasi, Nakshatra, Graha, Vargottama, Saptamsha, Deities, etc.) authentic.
Return ONLY the translated text without extra formatting or explanation.

Text to translate:
${text}`;

        const result = await model.generateContent(prompt);
        const translated = result.response.text().trim();
        if (translated) {
          return res.json({ success: true, translatedText: translated, source: 'gemini' });
        }
      } catch (geminiErr) {
        console.warn('[Dynamic Text Translation] Gemini translation fallback:', geminiErr.message);
      }
    }

    // Fallback to Google Translate API
    const fallbackTranslation = await translateFallback(text, targetLang);
    return res.json({ success: true, translatedText: fallbackTranslation, source: 'fallback' });
  } catch (err) {
    console.error('Error translating dynamic text:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

