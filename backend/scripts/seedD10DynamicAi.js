/**
 * Script to seed Dynamic AI Assessment into MongoDB for D10DashamshaTranslation
 * across all 10 Indian Languages:
 * Hindi (hi), Tamil (ta), Telugu (te), Kannada (kn), Gujarati (gu),
 * Marathi (mr), Bengali (bn), Malayalam (ml), Punjabi (pa), Sanskrit (sa).
 */
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const D10DashamshaTranslation = require('../models/D10DashamshaTranslation');
const { D10_DYNAMIC_AI_TRANSLATIONS } = require('./d10DynamicAiAllLangs');

async function seedD10DynamicAi() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('No MONGODB_URI found');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully.');

    const cacheDir = path.join(__dirname, '../data/locales');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    for (const [langCode, aiData] of Object.entries(D10_DYNAMIC_AI_TRANSLATIONS)) {
      console.log(`Updating D10 Dynamic AI Assessment for [${langCode}] (${aiData.langName})...`);

      const updated = await D10DashamshaTranslation.findOneAndUpdate(
        { lang: langCode },
        {
          $set: {
            lang: langCode,
            langName: aiData.langName,
            dynamicAi: {
              heading: aiData.heading,
              subheading: aiData.subheading,
              sourceBadge: aiData.sourceBadge,
              defaultAssessment: aiData.defaultAssessment
            }
          }
        },
        { new: true, upsert: true }
      );

      // Also persist to disk cache for fast offline / local access
      const diskPath = path.join(cacheDir, `${langCode}_d10_dashamsha.json`);
      let cachedJson = {};
      if (fs.existsSync(diskPath)) {
        try {
          cachedJson = JSON.parse(fs.readFileSync(diskPath, 'utf8'));
        } catch (e) {}
      }
      cachedJson.lang = langCode;
      cachedJson.langName = aiData.langName;
      cachedJson.dynamicAi = aiData;
      fs.writeFileSync(diskPath, JSON.stringify(cachedJson, null, 2), 'utf8');

      console.log(`✓ Saved dynamicAi for [${langCode}] in MongoDB & disk cache.`);
    }

    console.log('\n🎉 Successfully updated Dynamic AI Assessment in MongoDB for all 10 Indian Languages!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Fatal error seeding D10 dynamic AI:', err);
    process.exit(1);
  }
}

seedD10DynamicAi();

