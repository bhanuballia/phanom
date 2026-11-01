/**
 * Script to seed Dynamic AI Assessment into MongoDB for D9NavamshaTranslation
 * across all 10 Indian Languages.
 */
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const D9NavamshaTranslation = require('../models/D9NavamshaTranslation');
const { D9_DYNAMIC_AI_TRANSLATIONS } = require('./d9DynamicAiAllLangs');

async function seedD9DynamicAi() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('No MONGODB_URI found');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected.');

    const cacheDir = path.join(__dirname, '../data/locales');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    for (const [langCode, aiData] of Object.entries(D9_DYNAMIC_AI_TRANSLATIONS)) {
      console.log(`Updating D9 Dynamic AI Assessment for [${langCode}] (${aiData.langName})...`);

      const updated = await D9NavamshaTranslation.findOneAndUpdate(
        { lang: langCode },
        {
          $set: {
            dynamicAi: aiData
          }
        },
        { new: true, upsert: true }
      );

      // Also persist to disk cache
      const diskPath = path.join(cacheDir, `${langCode}_d9_navamsha.json`);
      if (fs.existsSync(diskPath)) {
        try {
          const cachedJson = JSON.parse(fs.readFileSync(diskPath, 'utf8'));
          cachedJson.dynamicAi = aiData;
          fs.writeFileSync(diskPath, JSON.stringify(cachedJson, null, 2), 'utf8');
        } catch (e) {
          console.warn(`Could not update disk cache for ${langCode}:`, e.message);
        }
      }

      console.log(`✓ Saved dynamicAi for [${langCode}] in MongoDB.`);
    }

    console.log('\n🎉 Successfully updated Dynamic AI Assessment in MongoDB for all 10 Indian Languages!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Fatal error seeding D9 dynamic AI:', err);
    process.exit(1);
  }
}

seedD9DynamicAi();

