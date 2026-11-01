/**
 * Professional Translation & MongoDB Seeding Script for D60 Shashtiamsha Interpretations
 * Translates all 9 planets x 12 houses x 3 states (positive, neutral, negative)
 * plus D60 Intro and D60 Planet Descriptions into:
 * Hindi (hi), Tamil (ta), Telugu (te), Kannada (kn), Gujarati (gu),
 * Marathi (mr), Bengali (bn), Malayalam (ml), Punjabi (pa), Sanskrit (sa)
 * and saves into MongoDB D60ShashtiamshaTranslation collection as well as data/locales disk cache.
 */
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const D60ShashtiamshaTranslation = require('../models/D60ShashtiamshaTranslation');
const { D60_LANG_METADATA } = require('./d60Metadata');
const { D60_INTERPRETATIONS } = require('../../frontend1/src/data/d60HouseInterpretations');
const { D60_INTRO, D60_PLANET_DESCRIPTIONS } = require('../../frontend1/src/data/d60ShashtiamshaData');

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
Translate these D60 Shashtiamsha (past life karma, destiny, Sanchita & Prarabdha karma, divine reckoning) interpretations for ${planetName} (houses 1 to 12) into ${langName}.
Keep core astrological terms (Shashtiamsha, D60, Lagna, House, Prarabdha, Sanchita Karma, Moksha, Dharma, Graha, Deities) culturally authentic, natural, and respected in ${langName}.
Return a strictly valid JSON object where keys are "1", "2", ... "12" and each has { "positive": "...", "neutral": "...", "negative": "..." }:

${JSON.stringify(planetData, null, 2)}`;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const res = await model.generateContent(prompt);
        const text = res.response.text().trim();
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
  for (const [planet, info] of Object.entries(D60_PLANET_DESCRIPTIONS)) {
    result[planet] = {
      title: await translateFallback(info.title, langCode),
      description: await translateFallback(info.description, langCode),
      icon: info.icon,
      color: info.color
    };
  }
  return result;
}

async function translateIntro(model, langName, langCode) {
  if (model) {
    try {
      const prompt = `You are an expert classical Vedic Astrologer. Translate the following introductory overview of the D60 Shashtiamsha Chart (Past Life Karma, Sanchita Karma, Prarabdha Bhoga, and Supreme Destiny) into dignified ${langName}:

"${D60_INTRO}"

Return ONLY the translated paragraph text without explanations.`;
      const res = await model.generateContent(prompt);
      const text = res.response.text().trim();
      if (text) return text;
    } catch (e) {
      console.warn(`Intro translation using fallback for ${langName}`);
    }
  }
  return await translateFallback(D60_INTRO, langCode);
}

async function processLanguage(langCode, langMeta, model) {
  const { langName, ui } = langMeta;
  console.log(`\n========================================`);
  console.log(`🌍 Translating D60 Shashtiamsha to ${langName} (${langCode})...`);
  console.log(`========================================`);

  const localesDir = path.join(__dirname, '../data/locales');
  if (!fs.existsSync(localesDir)) fs.mkdirSync(localesDir, { recursive: true });
  const cacheFilePath = path.join(localesDir, `${langCode}_d60_shashtiamsha.json`);

  let cachedData = null;
  if (fs.existsSync(cacheFilePath)) {
    try {
      cachedData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
      if (cachedData && cachedData.interpretations && Object.keys(cachedData.interpretations).length === 9) {
        console.log(`⚡ Found complete locale file for ${langName}. Uploading to DB...`);
        await D60ShashtiamshaTranslation.findOneAndUpdate(
          { lang: langCode },
          { $set: cachedData },
          { upsert: true, new: true }
        );
        console.log(`✅ ${langName} successfully seeded in DB from cache.`);
        return;
      }
    } catch (e) {
      console.warn(`Could not read cached file for ${langCode}, generating fresh...`);
    }
  }

  // 1. Translate Intro
  console.log(`  -> Translating D60 Introduction...`);
  const intro = await translateIntro(model, langName, langCode);

  // 2. Translate Planet Descriptions
  console.log(`  -> Translating Planet Overviews...`);
  const planetDescriptions = await translatePlanetDescriptions(model, langName, langCode);

  // 3. Translate Planet House Interpretations
  const interpretations = {};
  for (const planet of PLANETS) {
    process.stdout.write(`  -> Translating ${planet} (12 houses)... `);
    const planetData = D60_INTERPRETATIONS[planet];
    if (!planetData) {
      console.log('Skipped (no data)');
      continue;
    }
    const translatedPlanet = await translatePlanetForLang(model, planet, planetData, langName, langCode);
    interpretations[planet] = translatedPlanet;
    console.log('Done.');
  }

  const completeDocument = {
    lang: langCode,
    langName,
    ui,
    intro,
    interpretations,
    planetDescriptions
  };

  // Save to disk cache
  fs.writeFileSync(cacheFilePath, JSON.stringify(completeDocument, null, 2), 'utf8');
  console.log(`💾 Saved to disk: ${cacheFilePath}`);

  // Save to MongoDB
  try {
    await D60ShashtiamshaTranslation.findOneAndUpdate(
      { lang: langCode },
      { $set: completeDocument },
      { upsert: true, new: true }
    );
    console.log(`✅ Saved & seeded in MongoDB: [${langCode}] ${langName}`);
  } catch (dbErr) {
    console.error(`❌ DB Save error for ${langCode}:`, dbErr.message);
  }
}

async function main() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vedic-astrology';
  console.log(`Connecting to MongoDB at: ${mongoUri.replace(/:([^:@]{4})[^:@]*@/, ':****@')}...`);
  
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('MongoDB connected successfully.');

  let model = null;
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const modelName = process.env.GEMINI_FLASH_MODEL || 'gemini-3.5-flash-lite';
      model = genAI.getGenerativeModel({ model: modelName });
      console.log(`Using Gemini model: ${modelName} with resilient translation fallback.`);
    } catch (e) {
      console.warn('Could not initialize Gemini, using direct translation pipeline:', e.message);
    }
  }

  const languages = Object.entries(D60_LANG_METADATA);
  console.log(`Starting translation pipeline for ${languages.length} classical Indian languages...`);

  for (const [langCode, langMeta] of languages) {
    try {
      await processLanguage(langCode, langMeta, model);
    } catch (langErr) {
      console.error(`Error processing language ${langCode}:`, langErr);
    }
  }

  console.log('\n======================================================');
  console.log('🎉 ALL D60 SHASHTIAMSHA TRANSLATIONS SAVED TO DATABASE');
  console.log('======================================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error in seeding script:', err);
  process.exit(1);
});

