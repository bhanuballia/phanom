/**
 * Seed D3 Drekkana interpretations into MongoDB for all Indian languages
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const D3DrekkanaTranslation = require('../models/D3DrekkanaTranslation');
const { D3_INTERPRETATIONS_ALL_LANGS } = require('./d3InterpretationsAllIndianLangs');

async function seedD3() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('No MONGODB_URI found in .env');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB.');

    for (const [langCode, langData] of Object.entries(D3_INTERPRETATIONS_ALL_LANGS)) {
      console.log(`Seeding D3 Drekkana interpretations for [${langCode}] (${langData.langName})...`);
      await D3DrekkanaTranslation.findOneAndUpdate(
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

    console.log('✅ Successfully seeded D3 Drekkana interpretations into MongoDB for ALL Indian languages!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding D3 interpretations:', err);
    process.exit(1);
  }
}

seedD3();
