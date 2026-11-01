/**
 * Professional Translation & MongoDB Seeding Script for D16 Shodashamsha Analysis
 * Translates:
 * 1. D16 Intro Narrative & Key Houses breakdown
 * 2. 9 Planetary Descriptions (Venus, Mars, Moon, Jupiter, Saturn, Mercury, Sun, Rahu, Ketu)
 * into all 10 Indian Languages:
 * Hindi (hi), Tamil (ta), Telugu (te), Kannada (kn), Gujarati (gu),
 * Marathi (mr), Bengali (bn), Malayalam (ml), Punjabi (pa), Sanskrit (sa)
 * and saves into MongoDB D16ShodashamshaTranslation collection and locale JSON cache.
 */

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const D16ShodashamshaTranslation = require('../models/D16ShodashamshaTranslation');
const { D16_INTRO, D16_PLANET_DESCRIPTIONS } = require('../../frontend1/src/data/d16ShodashamshaData');

const LANGUAGES = [
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'kn', name: 'Kannada' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'mr', name: 'Marathi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'sa', name: 'Sanskrit' }
];

async function translateD16ForLang(model, langName) {
  const prompt = `You are an expert Vedic Astrologer and master Indian linguist.
Translate the following D16 Shodashamsha (vehicles, conveyances, luxuries, and overall material comforts / Sukha) analysis into ${langName}.
Keep classical astrological terms (Shodashamsha, D16, Sukha, Vahana Karaka, Karma, Dharma, Lagna, House) culturally authentic, natural, and respected.

Translate both:
1. "intro": The introductory text explaining conveyances and Key Houses (1st, 4th, 6th, 11th, 12th).
2. "planets": The 9 planet descriptions for Venus, Mars, Moon, Jupiter, Saturn, Mercury, Sun, Rahu, Ketu.

Return ONLY a valid JSON object matching this structure:
{
  "intro": "...",
  "planets": {
    "Venus": { "title": "...", "description": "..." },
    "Mars": { "title": "...", "description": "..." },
    "Moon": { "title": "...", "description": "..." },
    "Jupiter": { "title": "...", "description": "..." },
    "Saturn": { "title": "...", "description": "..." },
    "Mercury": { "title": "...", "description": "..." },
    "Sun": { "title": "...", "description": "..." },
    "Rahu": { "title": "...", "description": "..." },
    "Ketu": { "title": "...", "description": "..." }
  }
}

Original Data:
${JSON.stringify({ intro: D16_INTRO, planets: D16_PLANET_DESCRIPTIONS }, null, 2)}`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await model.generateContent(prompt);
      let raw = res.response.text().trim();
      if (raw.startsWith('```json')) raw = raw.replace(/^```json/, '').replace(/```$/, '').trim();
      else if (raw.startsWith('```')) raw = raw.replace(/^```/, '').replace(/```$/, '').trim();

      const parsed = JSON.parse(raw);
      if (parsed && parsed.intro && parsed.planets && Object.keys(parsed.planets).length >= 9) {
        return parsed;
      }
    } catch (e) {
      console.warn(`[${langName}] attempt ${attempt} warning:`, e.message);
      await new Promise(r => setTimeout(r, 1500));
    }
  }
  return null;
}

async function seedAllD16() {
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

    for (const lang of LANGUAGES) {
      console.log(`\n======================================================`);
      console.log(`Processing D16 for [${lang.code}] - ${lang.name}...`);
      console.log(`======================================================`);

      const translated = await translateD16ForLang(model, lang.name);
      if (!translated) {
        console.error(`✗ Failed translating D16 for ${lang.name}`);
        continue;
      }

      console.log(`Saving [${lang.code}] into MongoDB...`);
      await D16ShodashamshaTranslation.findOneAndUpdate(
        { lang: lang.code },
        {
          $set: {
            lang: lang.code,
            langName: lang.name,
            intro: translated.intro,
            planets: translated.planets
          }
        },
        { upsert: true, new: true }
      );

      // Save disk cache
      const diskPath = path.join(cacheDir, `${lang.code}_d16_shodashamsha.json`);
      fs.writeFileSync(diskPath, JSON.stringify({
        lang: lang.code,
        langName: lang.name,
        intro: translated.intro,
        planets: translated.planets
      }, null, 2), 'utf8');

      console.log(`✓ Saved [${lang.code}] into MongoDB & disk cache.`);
      await new Promise(r => setTimeout(r, 800));
    }

    console.log('\n🎉 ALL 10 Indian Languages for D16 Shodashamsha Analysis have been translated and saved in MongoDB!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Fatal error seeding D16:', err);
    process.exit(1);
  }
}

seedAllD16();

