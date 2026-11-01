const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const D10DashamshaTranslation = require('../models/D10DashamshaTranslation');
const { D10_INTERPRETATIONS } = require('../../frontend1/src/data/d10HouseInterpretations');

async function fixBengaliMercury() {
  await mongoose.connect(process.env.MONGODB_URI);
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_FLASH_MODEL || 'gemini-3.5-flash-lite'
  });

  const merged = {};

  // Translate in batches of 4 houses to ensure small, error-free JSON responses
  const batches = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12]
  ];

  for (const batch of batches) {
    const subset = {};
    batch.forEach(h => { subset[h] = D10_INTERPRETATIONS.Mercury[h]; });

    const prompt = `Translate these D10 Dashamsha interpretations for Mercury (houses ${batch.join(', ')}) into Bengali.
Respond with ONLY a raw JSON object (keys: "${batch.join('", "')}", each containing "positive", "neutral", "negative").
No markdown tags, no explanation:

${JSON.stringify(subset, null, 2)}`;

    const res = await model.generateContent(prompt);
    let raw = res.response.text().trim();
    if (raw.startsWith('```json')) raw = raw.replace(/^```json/, '').replace(/```$/, '').trim();
    else if (raw.startsWith('```')) raw = raw.replace(/^```/, '').replace(/```$/, '').trim();

    const parsed = JSON.parse(raw);
    Object.assign(merged, parsed);
    console.log(`Houses ${batch.join(', ')} parsed ok.`);
  }

  await D10DashamshaTranslation.updateOne(
    { lang: 'bn' },
    { $set: { 'interpretations.Mercury': merged } }
  );

  const diskPath = path.join(__dirname, '../data/locales/bn_d10_dashamsha.json');
  if (fs.existsSync(diskPath)) {
    const data = JSON.parse(fs.readFileSync(diskPath, 'utf8'));
    data.interpretations.Mercury = merged;
    fs.writeFileSync(diskPath, JSON.stringify(data, null, 2), 'utf8');
  }

  console.log('Successfully updated Bengali Mercury translations in DB and disk!');
  await mongoose.disconnect();
  process.exit(0);
}

fixBengaliMercury();
