const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const AstroTranslation = require('../models/AstroTranslation');
const seeder = require('../services/astroTranslationSeeder');

const updatedKeys = {
  hi: {
    positiveManifest: "सकारात्मक प्रभाव",
    negativeManifest: "चुनौतीपूर्ण प्रभाव",
    neutralManifest: "सामान्य प्रभाव",
    positiveManifestAnalysis: "सकारात्मक प्रभाव विश्लेषण",
    negativeManifestAnalysis: "चुनौतीपूर्ण प्रभाव विश्लेषण",
    neutralManifestAnalysis: "सामान्य प्रभाव विश्लेषण"
  },
  ta: {
    positiveManifest: "சுப பலன்",
    negativeManifest: "சவால் / அசுப பலன்",
    neutralManifest: "சம பலன்",
    positiveManifestAnalysis: "சுப பலன் ஆய்வு",
    negativeManifestAnalysis: "சவால் / அசுப பலன் ஆய்வு",
    neutralManifestAnalysis: "சம பலன் ஆய்வு"
  },
  te: {
    positiveManifest: "శుభ ఫలితం",
    negativeManifest: "సవాలు ఫలితం",
    neutralManifest: "సమ ఫలితం",
    positiveManifestAnalysis: "శుభ ఫలితాల విశ్లేషణ",
    negativeManifestAnalysis: "సవాలు ఫలితాల విశ్లేషణ",
    neutralManifestAnalysis: "సమ ఫలితాల విశ్లేషణ"
  },
  mr: {
    positiveManifest: "सकारात्मक प्रभाव",
    negativeManifest: "आव्हानात्मक प्रभाव",
    neutralManifest: "मध्यम प्रभाव",
    positiveManifestAnalysis: "सकारात्मक प्रभाव विश्लेषण",
    negativeManifestAnalysis: "आव्हानात्मक प्रभाव विश्लेषण",
    neutralManifestAnalysis: "मध्यम प्रभाव विश्लेषण"
  },
  gu: {
    positiveManifest: "સકારાત્મક પ્રભાવ",
    negativeManifest: "પડકારજનક પ્રભાવ",
    neutralManifest: "સામાન્ય પ્રભાવ",
    positiveManifestAnalysis: "સકારાત્મક પ્રભાવ વિશ્લેષણ",
    negativeManifestAnalysis: "પડકારજનક પ્રભાવ વિશ્લેષણ",
    neutralManifestAnalysis: "સામાન્ય પ્રભાવ વિશ્લેષણ"
  },
  bn: {
    positiveManifest: "ইতিবাচক প্রভাব",
    negativeManifest: "প্রতিকূল প্রভাব",
    neutralManifest: "সাধারণ প্রভাব",
    positiveManifestAnalysis: "ইতিবাচক প্রভাব বিশ্লেষণ",
    negativeManifestAnalysis: "প্রতিকূল প্রভাব বিশ্লেষণ",
    neutralManifestAnalysis: "সাধারণ প্রভাব বিশ্লেষণ"
  },
  kn: {
    positiveManifest: "ಶುಭ ಫಲ",
    negativeManifest: "ಪ್ರತಿಕೂಲ ಫಲ",
    neutralManifest: "ಸಾಮಾನ್ಯ ಫಲ",
    positiveManifestAnalysis: "ಶುಭ ಫಲ ವಿಶ್ಲೇಷಣೆ",
    negativeManifestAnalysis: "ಪ್ರತಿಕೂಲ ಫಲ ವಿಶ್ಲೇಷಣೆ",
    neutralManifestAnalysis: "ಸಾಮಾನ್ಯ ಫಲ ವಿಶ್ಲೇಷಣೆ"
  },
  ml: {
    positiveManifest: "ശുഭ ഫലം",
    negativeManifest: "പ്രതികൂല ഫലം",
    neutralManifest: "സാധാരണ ഫലം",
    positiveManifestAnalysis: "ശുഭ ഫല വിശകലനം",
    negativeManifestAnalysis: "പ്രതികൂല ഫല വിശകലനം",
    neutralManifestAnalysis: "സാധാരണ ഫല വിശകലനം"
  }
};

// 1. Update seeder array in memory
for (const [lang, keys] of Object.entries(updatedKeys)) {
  const item = seeder.defaultTranslations.find(t => t.lang === lang);
  if (item && item.ui) {
    Object.assign(item.ui, keys);
  }
}

// 2. Persist to astroTranslationSeeder.js
const seederFile = path.join(__dirname, '../services/astroTranslationSeeder.js');
const fileContent = `const mongoose = require("mongoose");
const AstroTranslation = require("../models/AstroTranslation");

const defaultTranslations = ${JSON.stringify(seeder.defaultTranslations, null, 2)};

async function seedAstroTranslations() {
  try {
    for (const item of defaultTranslations) {
      await AstroTranslation.findOneAndUpdate(
        { lang: item.lang },
        { $set: item },
        { upsert: true, new: true }
      );
    }
    console.log(\`✅ Seeded \${defaultTranslations.length} astrological language dictionaries into MongoDB.\`);
  } catch (err) {
    console.error("❌ Failed seeding translations into DB:", err.message);
  }
}

module.exports = { seedAstroTranslations, defaultTranslations };
`;

fs.writeFileSync(seederFile, fileContent, 'utf8');
console.log('✅ Updated astroTranslationSeeder.js with exact manifestation analysis titles!');

// 3. Update MongoDB directly
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/astro_consult').then(async () => {
  for (const [lang, keys] of Object.entries(updatedKeys)) {
    const updateObj = {};
    for (const [k, v] of Object.entries(keys)) {
      updateObj[`ui.${k}`] = v;
    }
    await AstroTranslation.findOneAndUpdate({ lang }, { $set: updateObj });
  }
  console.log('✅ Successfully updated MongoDB with exact manifestation analysis titles for all 8 Indian languages!');
  process.exit(0);
}).catch(err => {
  console.error('❌ MongoDB update failed:', err);
  process.exit(1);
});
