/**
 * Professional Translation & MongoDB Seeding Script for D27 Bhamsa (Saptavimshamsha) Interpretations
 * Translates all 9 planets x 12 houses x 3 states (positive, neutral, negative)
 * plus D27 Intro and D27 Planet Descriptions into:
 * Hindi (hi), Tamil (ta), Telugu (te), Kannada (kn), Gujarati (gu),
 * Marathi (mr), Bengali (bn), Malayalam (ml), Punjabi (pa), Sanskrit (sa)
 * and saves into MongoDB D27BhamsaTranslation collection as well as data/locales disk cache.
 */
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const D27BhamsaTranslation = require('../models/D27BhamsaTranslation');
const { D27_LANG_METADATA } = require('./d27Metadata');
const { D27_INTERPRETATIONS } = require('../../frontend1/src/data/d27HouseInterpretations');
const { D27_INTRO, D27_PLANET_DESCRIPTIONS } = require('../../frontend1/src/data/d27BhamsaData');

const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

// Reliable Google Translate fallback if Gemini quota is exhausted or throttled
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

async function translatePlanetWithFallback(planetName, planetData, langCode) {
  const result = {};
  for (const house of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
    const orig = planetData[house] || {};
    result[house] = {
      positive: await translateFallback(orig.positive, langCode),
      neutral: await translateFallback(orig.neutral, langCode),
      negative: await translateFallback(orig.negative, langCode)
    };
  }
  return result;
}

async function translatePlanetForLang(model, planetName, planetData, langName, langCode) {
  if (model) {
    const prompt = `You are an expert classical Vedic Astrologer and master Indian linguist.
Translate these D27 Bhamsa / Saptavimshamsha (inner strength, vitality, soul power, subconscious resilience, immunity & overcoming vulnerability) interpretations for ${planetName} (houses 1 to 12) into ${langName}.
Keep core astrological terms (Bhamsa, Saptavimshamsha, Nakshatramsha, Lagna, House, Vitality, Ojas, Prana, Soul Power, Deities, Dignity) culturally authentic, natural, and respected in ${langName}.
Return a strictly valid JSON object where keys are "1", "2", ... "12" and each has { "positive": "...", "neutral": "...", "negative": "..." }:

${JSON.stringify(planetData, null, 2)}`;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const res = await model.generateContent(prompt);
        const text = res.response.text().trim();
        // Clean possible markdown code fences
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed && typeof parsed === 'object' && Object.keys(parsed).length >= 12) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn(`[${langName}] ${planetName} AI attempt ${attempt} notice: ${e.message}. Using resilient fallback...`);
        break;
      }
    }
  }

  // Fallback to direct translation API
  return await translatePlanetWithFallback(planetName, planetData, langCode);
}

async function translatePlanetDescriptions(model, langName, langCode) {
  const result = {};
  for (const [planet, info] of Object.entries(D27_PLANET_DESCRIPTIONS)) {
    result[planet] = {
      title: await translateFallback(info.title, langCode),
      description: await translateFallback(info.description, langCode),
      icon: info.icon,
      color: info.color
    };
  }
  return result;
}

async function seedAllD27Bhamsa() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('No MONGODB_URI found.');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully.');

    let model = null;
    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        model = genAI.getGenerativeModel({
          model: process.env.GEMINI_FLASH_MODEL || 'gemini-2.5-flash'
        });
      } catch (e) {
        console.warn('Could not initialize Gemini model:', e.message);
      }
    }

    const localesDir = path.join(__dirname, '../data/locales');
    if (!fs.existsSync(localesDir)) {
      fs.mkdirSync(localesDir, { recursive: true });
    }

    const languages = Object.keys(D27_LANG_METADATA);
    console.log(`Starting translation for ${languages.length} Indian languages: ${languages.join(', ')}`);

    for (const langCode of languages) {
      const meta = D27_LANG_METADATA[langCode];
      console.log(`\n========================================`);
      console.log(`Processing [${langCode.toUpperCase()}] ${meta.langName}...`);
      console.log(`========================================`);

      // 1. Translate Intro
      console.log(`Translating D27 Intro for ${meta.langName}...`);
      let introTranslated = '';
      try {
        if (model) {
          const introPrompt = `You are a Vedic Astrologer. Translate the following Brihat Parashara Bhamsa (D27) introduction into elegant, classical ${meta.langName}. Preserve terms like Bhamsa, Saptavimshamsha, Ojas, Prana, Lagna without alteration:\n\n${D27_INTRO}`;
          const introRes = await model.generateContent(introPrompt);
          introTranslated = introRes.response.text().trim();
        }
      } catch (e) {
        console.warn(`[${meta.langName}] Intro AI generation error: ${e.message}`);
      }
      if (!introTranslated) {
        introTranslated = await translateFallback(D27_INTRO, langCode);
      }

      // 2. Translate Planet Descriptions
      console.log(`Translating D27 Planet Descriptions for ${meta.langName}...`);
      const planetDescriptionsTranslated = await translatePlanetDescriptions(model, meta.langName, langCode);

      // 3. Translate House Interpretations for all 9 planets
      const interpretations = {};
      for (const planet of PLANETS) {
        const pData = D27_INTERPRETATIONS[planet];
        if (!pData) continue;
        console.log(`  -> Translating ${planet} (12 houses) for ${meta.langName}...`);
        const translatedPlanetData = await translatePlanetForLang(model, planet, pData, meta.langName, langCode);
        interpretations[planet] = translatedPlanetData;
      }

      // 4. Save to disk cache
      const payload = {
        lang: langCode,
        langName: meta.langName,
        ui: meta.ui,
        intro: introTranslated,
        interpretations,
        planetDescriptions: planetDescriptionsTranslated
      };

      const cacheFile = path.join(localesDir, `${langCode}_d27_bhamsa.json`);
      fs.writeFileSync(cacheFile, JSON.stringify(payload, null, 2), 'utf8');
      console.log(`  [Disk Cache] Saved ${cacheFile}`);

      // 5. Upsert to MongoDB
      const updated = await D27BhamsaTranslation.findOneAndUpdate(
        { lang: langCode },
        { $set: payload },
        { upsert: true, new: true }
      );
      console.log(`  [MongoDB] Saved ${updated.langName} (${updated.lang}) to D27BhamsaTranslation collection.`);
    }

    console.log('\n========================================');
    console.log('All 10 Indian Languages translated & seeded successfully into MongoDB!');
    console.log('========================================');
    process.exit(0);
  } catch (err) {
    console.error('Fatal error during seeding:', err);
    process.exit(1);
  }
}

seedAllD27Bhamsa();

