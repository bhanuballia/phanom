/**
 * Seed D4 Chaturthamsha interpretations into MongoDB for all Indian languages
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const D4ChaturthamshaTranslation = require('../models/D4ChaturthamshaTranslation');
const { D4_INTERPRETATIONS_ALL_LANGS } = require('./d4InterpretationsAllIndianLangs');

async function seedD4() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('No MONGODB_URI found in .env');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB.');

    for (const [langCode, langData] of Object.entries(D4_INTERPRETATIONS_ALL_LANGS)) {
      console.log(`Seeding D4 Chaturthamsha interpretations for [${langCode}] (${langData.langName})...`);
      await D4ChaturthamshaTranslation.findOneAndUpdate(
        { lang: langCode },
        {
          $set: {
            lang: langCode,
            langName: langData.langName,
            ui: langData.ui,
            interpretations: langData.interpretations
          }
        },
        { upsert: true, new: true }
      );
    }

    console.log('✅ Successfully seeded D4 Chaturthamsha interpretations into MongoDB for ALL Indian languages!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding D4 interpretations:', err);
    process.exit(1);
  }
}

seedD4();
