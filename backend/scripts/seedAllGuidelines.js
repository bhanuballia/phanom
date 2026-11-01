/**
 * Seed all guidelines into MongoDB for all 10 languages
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const D2HoraTranslation = require('../models/D2HoraTranslation');
const { ALL_GUIDELINES } = require('./d2GuidelinesAllIndianLangs');

async function seedGuidelines() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) return;

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB.');

    for (const [langCode, guidelinesArr] of Object.entries(ALL_GUIDELINES)) {
      console.log(`Seeding guidelines for [${langCode}] (${guidelinesArr.length} rules)...`);
      await D2HoraTranslation.findOneAndUpdate(
        { lang: langCode },
        { $set: { guidelines: guidelinesArr } },
        { upsert: true, new: true }
      );
    }

    console.log('✅ Successfully seeded guidelines array into MongoDB for ALL languages!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding guidelines:', err);
    process.exit(1);
  }
}

seedGuidelines();
