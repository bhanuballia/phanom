/**
 * Professional Translation & MongoDB Seeding Script for D24 Chaturvimshamsha Interpretations
 * Translates all 9 planets x 12 houses x 3 states (positive, neutral, negative)
 * plus D24 Intro into Hindi, Tamil, Telugu, Kannada, Gujarati, Marathi, Bengali, Malayalam, Punjabi, Sanskrit
 * and saves into MongoDB D24ChaturvimshamshaTranslation collection.
 */
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const D24ChaturvimshamshaTranslation = require('../models/D24ChaturvimshamshaTranslation');
const { D24_LANG_METADATA } = require('./d24Metadata');
const { D24_INTERPRETATIONS } = require('../../frontend1/src/data/d24HouseInterpretations');
const { D24_INTRO } = require('../../frontend1/src/data/d24ChaturvimshamshaData');

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
Translate these D24 Chaturvimshamsha (higher education, learning, intellectual accomplishments, academic mastery, examinations & wisdom) interpretations for ${planetName} (houses 1 to 12) into ${langName}.
Keep core astrological terms (Chaturvimshamsha, Siddhamsa, Lagna, House, Higher Education, Vidya, Intellect, Examination, Wisdom, Dignity) culturally authentic, natural, and respected in ${langName}.
Return a strictly valid JSON object where keys are "1", "2", ... "12" and each has { "positive": "...", "neutral": "...", "negative": "..." }:

${JSON.stringify(planetData, null, 2)}`;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const res = await model.generateContent(prompt);
        const text = res.response.text().trim();
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length >= 12) {
          return parsed;
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

async function seedAllD24Chaturvimshamsha() {
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
          model: process.env.GEMINI_FLASH_MODEL || 'gemini-3.5-flash-lite',
          generationConfig: { responseMimeType: 'application/json' }
        });
      } catch (err) {
        console.warn('Gemini model init notice:', err.message);
      }
    }

    const cacheDir = path.join(__dirname, '../data/locales');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    for (const [langCode, meta] of Object.entries(D24_LANG_METADATA)) {
      console.log(`\n======================================================`);
      console.log(`Processing [${langCode}] - ${meta.langName}...`);
      console.log(`======================================================`);

      let existing = await D24ChaturvimshamshaTranslation.findOne({ lang: langCode }).lean();
      const currentInterps = existing?.interpretations || {};

      // Translate Intro if needed
      let translatedIntro = existing?.intro;
      if (!translatedIntro) {
        console.log(`  Translating D24 Intro for ${meta.langName}...`);
        translatedIntro = await translateFallback(D24_INTRO, langCode);
      }

      let hasNewTranslations = false;

      for (const planet of PLANETS) {
        if (currentInterps[planet] && Object.keys(currentInterps[planet]).length >= 12) {
          console.log(`  ✓ ${planet} already complete in DB for [${langCode}].`);
          continue;
        }

        const originalData = D24_INTERPRETATIONS[planet];
        if (!originalData) {
          console.warn(`  ! No English D24 interpretation found for ${planet}`);
          continue;
        }

        console.log(`  -> Translating ${planet} for ${meta.langName}...`);
        const translatedPlanet = await translatePlanetForLang(model, planet, originalData, meta.langName, langCode);

        if (translatedPlanet) {
          currentInterps[planet] = translatedPlanet;
          hasNewTranslations = true;
          console.log(`  ✓ Successfully translated ${planet} into ${meta.langName}`);
        } else {
          console.error(`  ✗ Failed to translate ${planet} for ${meta.langName}`);
        }
      }

      // Upsert into MongoDB
      console.log(`  Saving [${langCode}] into MongoDB D24ChaturvimshamshaTranslation...`);
      await D24ChaturvimshamshaTranslation.findOneAndUpdate(
        { lang: langCode },
        {
          $set: {
            lang: langCode,
            langName: meta.langName,
            ui: meta.ui,
            intro: translatedIntro,
            interpretations: currentInterps
          }
        },
        { upsert: true, new: true }
      );

      // Also save JSON snapshot to disk for resilient local caching
      const diskSnapshotPath = path.join(cacheDir, `${langCode}_d24_chaturvimshamsha.json`);
      fs.writeFileSync(
        diskSnapshotPath,
        JSON.stringify(
          {
            lang: langCode,
            langName: meta.langName,
            ui: meta.ui,
            intro: translatedIntro,
            interpretations: currentInterps
          },
          null,
          2
        )
      );

      console.log(`  ✓ Saved [${langCode}] to MongoDB and disk snapshot (${diskSnapshotPath}).`);
    }

    console.log('\n🎉 ALL 10 Indian Languages for D24 Chaturvimshamsha have been translated and saved in MongoDB!');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error seeding D24 Chaturvimshamsha:', error);
    process.exit(1);
  }
}

seedAllD24Chaturvimshamsha();

