const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');

const { 
  SUN_HOUSE_INTERPRETATIONS, 
  MOON_HOUSE_INTERPRETATIONS, 
  MARS_HOUSE_INTERPRETATIONS, 
  MERCURY_HOUSE_INTERPRETATIONS, 
  JUPITER_HOUSE_INTERPRETATIONS, 
  VENUS_HOUSE_INTERPRETATIONS, 
  SATURN_HOUSE_INTERPRETATIONS, 
  RAHU_HOUSE_INTERPRETATIONS, 
  KETU_HOUSE_INTERPRETATIONS 
} = require('../../frontend1/src/data/houseInterpretations.js');

const interpMap = {
  Sun: SUN_HOUSE_INTERPRETATIONS,
  Moon: MOON_HOUSE_INTERPRETATIONS,
  Mars: MARS_HOUSE_INTERPRETATIONS,
  Mercury: MERCURY_HOUSE_INTERPRETATIONS,
  Jupiter: JUPITER_HOUSE_INTERPRETATIONS,
  Venus: VENUS_HOUSE_INTERPRETATIONS,
  Saturn: SATURN_HOUSE_INTERPRETATIONS,
  Rahu: RAHU_HOUSE_INTERPRETATIONS,
  Ketu: KETU_HOUSE_INTERPRETATIONS,
};

const activePlacements = [
  { planet: 'Sun', house: 9 },
  { planet: 'Moon', house: 2 },
  { planet: 'Mars', house: 8 },
  { planet: 'Mercury', house: 10 },
  { planet: 'Jupiter', house: 5 },
  { planet: 'Venus', house: 10 },
  { planet: 'Saturn', house: 5 },
  { planet: 'Rahu', house: 6 },
  { planet: 'Ketu', house: 12 },
];

const promptObj = {};
activePlacements.forEach(p => {
  promptObj[p.planet + '_' + p.house] = interpMap[p.planet][p.house];
});

const languages = [
  { code: 'kn', name: 'Kannada' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'mr', name: 'Marathi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'sa', name: 'Sanskrit' }
];

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("No GEMINI_API_KEY found!");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: process.env.GEMINI_FLASH_MODEL || 'gemini-2.5-flash',
  generationConfig: { responseMimeType: 'application/json' }
});

const LOCALES_DIR = path.join(__dirname, '../data/locales');

async function directTranslate() {
  for (const l of languages) {
    const cacheFile = path.join(LOCALES_DIR, `${l.code}_house_interpretations.json`);
    if (fs.existsSync(cacheFile)) {
      try {
        const existing = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        if (existing.Sun_9 && Object.keys(existing).length >= 9) {
          console.log(`Skipping ${l.name} (already complete with ${Object.keys(existing).length} keys).`);
          continue;
        }
      } catch (e) {}
    }

    console.log(`Generating translations for ${l.name} (${l.code})...`);
    const prompt = `
You are an authentic classical Vedic Astrologer and expert Indian linguist.
Translate each astrological placement interpretation into fluent, natural ${l.name}.

CRITICAL RULES:
1. Preserve Vedic astrology technical terms (e.g., Bhav/House, Lagna, Rasi, Rashi, Yoga, Karak, Shubha/Ashubha, Drishti, Combust, Retrograde).
2. Keep the meaning accurate, auspicious, and fluent for native readers.
3. Keep English proper names like celebrities intact or phonetically transliterated.
4. Output ONLY a valid JSON object matching the input keys.

INPUT JSON:
${JSON.stringify(promptObj, null, 2)}
`;

    try {
      const resp = await model.generateContent(prompt);
      const parsed = JSON.parse(resp.response.text());
      fs.writeFileSync(cacheFile, JSON.stringify(parsed, null, 2), 'utf8');
      console.log(`✓ Successfully generated and wrote ${l.name} (${Object.keys(parsed).length} keys)`);
    } catch (err) {
      console.error(`✗ Failed ${l.name}:`, err.message);
    }
  }
  console.log("ALL LANGUAGES PROCESSED!");
}

directTranslate();
