/**
 * Professional Translation & MongoDB Seeding Script for D10 Dashamsha Interpretations
 * Translates all 9 planets x 12 houses x 3 states (positive, neutral, negative)
 * into Hindi, Tamil, Telugu, Kannada, Gujarati, Marathi, Bengali, Malayalam, Punjabi, Sanskrit
 * and saves into MongoDB D10DashamshaTranslation collection.
 */
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const D10DashamshaTranslation = require('../models/D10DashamshaTranslation');
const { D10_LANG_METADATA } = require('./d10Metadata');
const { D10_INTERPRETATIONS } = require('../../frontend1/src/data/d10HouseInterpretations');

const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

async function translatePlanetForLang(model, planetName, planetData, langName) {
  const prompt = `You are an expert classical Vedic Astrologer and master Indian linguist.
Translate these D10 Dashamsha (career, status, power, professional wealth, fame & karma) interpretations for ${planetName} (houses 1 to 12) into ${langName}.
Keep core astrological terms (Dashamsha, Lagna, House, Karma, Authority, Executive Power, Raja Yoga, Dignity) culturally authentic, natural, and respected in ${langName}.
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

async function seedAllD10Dashamsha() {
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

    for (const [langCode, meta] of Object.entries(D10_LANG_METADATA)) {
      console.log(`\n======================================================`);
      console.log(`Processing [${langCode}] - ${meta.langName}...`);
      console.log(`======================================================`);

      let existing = await D10DashamshaTranslation.findOne({ lang: langCode }).lean();
      const currentInterps = existing?.interpretations || {};

      let hasNewTranslations = false;

      for (const planet of PLANETS) {
        if (currentInterps[planet] && Object.keys(currentInterps[planet]).length >= 12) {
          console.log(`  ✓ ${planet} already complete in DB for [${langCode}].`);
          continue;
        }

        console.log(`  ⏳ Translating ${planet} into ${meta.langName}...`);
        const originalData = D10_INTERPRETATIONS[planet];
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
      await D10DashamshaTranslation.findOneAndUpdate(
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

      // Also persist to disk cache in data/locales/${langCode}_d10_dashamsha.json
      const diskPath = path.join(cacheDir, `${langCode}_d10_dashamsha.json`);
      let existingDisk = {};
      if (fs.existsSync(diskPath)) {
        try {
          existingDisk = JSON.parse(fs.readFileSync(diskPath, 'utf8'));
        } catch (e) {}
      }
      existingDisk.lang = langCode;
      existingDisk.langName = meta.langName;
      existingDisk.ui = meta.ui;
      existingDisk.interpretations = currentInterps;
      fs.writeFileSync(diskPath, JSON.stringify(existingDisk, null, 2), 'utf8');

      console.log(`✓ Saved [${langCode}] to MongoDB & disk successfully.`);
    }

    console.log('\n🎉 ALL 10 Indian Languages for D10 Dashamsha have been translated and saved in MongoDB!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Fatal seeding error:', err);
    process.exit(1);
  }
}

seedAllD10Dashamsha();

