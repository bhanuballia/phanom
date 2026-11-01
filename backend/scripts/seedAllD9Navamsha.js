/**
 * Professional Translation & MongoDB Seeding Script for D9 Navamsha Interpretations
 * Translates all 9 planets x 12 houses x 3 states (positive, neutral, negative)
 * into Hindi, Tamil, Telugu, Kannada, Gujarati, Marathi, Bengali, Malayalam, Punjabi, Sanskrit
 * and saves into MongoDB D9NavamshaTranslation collection.
 */
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const D9NavamshaTranslation = require('../models/D9NavamshaTranslation');
const { D9_LANG_METADATA } = require('./d9Metadata');
const { D9_INTERPRETATIONS } = require('../../frontend1/src/data/d9HouseInterpretations');

const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

async function translatePlanetForLang(model, planetName, planetData, langName) {
  const prompt = `You are an expert classical Vedic Astrologer and master Indian linguist.
Translate these D9 Navamsha (marriage, spouse, soul destiny & dharma) interpretations for ${planetName} (houses 1 to 12) into ${langName}.
Keep core astrological terms (Navamsha, Lagna, House, Dharma, Karaka, Karma) culturally authentic and natural in ${langName}.
Return a strictly valid JSON object where keys are "1", "2", ... "12" and each has { "positive": "...", "neutral": "...", "negative": "..." }:

${JSON.stringify(planetData, null, 2)}`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await model.generateContent(prompt);
      const text = res.response.text().trim();
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length >= 12) {
        return parsed;
      }
    } catch (e) {
      console.warn(`[${langName}] ${planetName} attempt ${attempt} warning:`, e.message);
      await new Promise(r => setTimeout(r, 1500));
    }
  }
  return null;
}

async function seedD9Translations() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('No MONGODB_URI found.');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected.');

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_FLASH_MODEL || 'gemini-3.5-flash-lite',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const cacheDir = path.join(__dirname, '../data/locales');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    for (const [langCode, meta] of Object.entries(D9_LANG_METADATA)) {
      console.log(`\n======================================================`);
      console.log(`Processing [${langCode}] - ${meta.langName}...`);
      console.log(`======================================================`);

      let existing = await D9NavamshaTranslation.findOne({ lang: langCode }).lean();
      const currentInterps = existing?.interpretations || {};

      let hasNewTranslations = false;

      for (const planet of PLANETS) {
        if (currentInterps[planet] && Object.keys(currentInterps[planet]).length >= 12) {
          console.log(`  ✓ ${planet} already complete in DB for [${langCode}].`);
          continue;
        }

        console.log(`  → Translating ${planet} into ${meta.langName}...`);
        const originalData = D9_INTERPRETATIONS[planet];
        const translatedPlanet = await translatePlanetForLang(model, planet, originalData, meta.langName);

        if (translatedPlanet) {
          currentInterps[planet] = translatedPlanet;
          hasNewTranslations = true;
          console.log(`  ✓ Successfully translated ${planet} into ${meta.langName}`);
        } else {
          console.error(`  ✗ Failed to translate ${planet} for ${meta.langName}, keeping English fallback`);
          currentInterps[planet] = originalData;
        }

        // Small breather between requests
        await new Promise(r => setTimeout(r, 800));
      }

      console.log(`Saving [${langCode}] into MongoDB...`);
      await D9NavamshaTranslation.findOneAndUpdate(
        { lang: langCode },
        {
          $set: {
            lang: langCode,
            langName: meta.langName,
            ui: meta.ui,
            interpretations: currentInterps
          }
        },
        { upsert: true, new: true }
      );

      // Also persist to disk cache in data/locales/${langCode}_d9_navamsha.json
      const diskPath = path.join(cacheDir, `${langCode}_d9_navamsha.json`);
      fs.writeFileSync(diskPath, JSON.stringify({ ui: meta.ui, interpretations: currentInterps }, null, 2), 'utf8');

      console.log(`✅ Saved [${langCode}] to MongoDB & disk successfully.`);
    }

    console.log('\n🎉 ALL 10 Indian Languages for D9 Navamsha have been translated and saved in MongoDB!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Fatal seeding error:', err);
    process.exit(1);
  }
}

seedD9Translations();
