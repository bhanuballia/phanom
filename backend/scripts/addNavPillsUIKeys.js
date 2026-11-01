const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const AstroTranslation = require('../models/AstroTranslation');
const seeder = require('../services/astroTranslationSeeder');

const pillNavUIKeys = {
  hi: {
    jumpTo: "अनुभाग पर जाएं:",
    closeWindow: "विंडो बंद करें",
    navD1Chart: "लग्न कुंडली (D1)",
    nav12Bhavas: "12 भाव",
    navDrishti: "दृष्टि (Drishti)",
    navHouseAnalysis: "भाव फलादेश",
    navConjunctions: "युति विचार",
    navYamakantaka: "यमकंटक",
    navMandiGulika: "मांदि-गुलिका",
    navUpaketu: "उपकेतु",
    navIndrachapa: "इंद्रचाप"
  },
  ta: {
    jumpTo: "செல்லவும்:",
    closeWindow: "சாளரத்தை மூடு",
    navD1Chart: "ராசி கட்டம் (D1)",
    nav12Bhavas: "12 பாவகங்கள்",
    navDrishti: "கிரக பார்வை (Drishti)",
    navHouseAnalysis: "பாவக பலன்கள்",
    navConjunctions: "கிரக சேர்க்கை",
    navYamakantaka: "எமகண்டகன்",
    navMandiGulika: "மாந்தி-குளிகன்",
    navUpaketu: "உபகேது",
    navIndrachapa: "இந்திரசாபம்"
  },
  te: {
    jumpTo: "విభాగానికి వెళ్లండి:",
    closeWindow: "కిటికీ మూసివేయి",
    navD1Chart: "లగ్న కుండలి (D1)",
    nav12Bhavas: "12 భావాలు",
    navDrishti: "గ్రహ దృష్టి (Drishti)",
    navHouseAnalysis: "భావ ఫలితాలు",
    navConjunctions: "గ్రహ కలయిక (యుతి)",
    navYamakantaka: "యమకంటక",
    navMandiGulika: "మాంది-గుళిక",
    navUpaketu: "ఉపకేతు",
    navIndrachapa: "ఇంద్రచాప"
  },
  mr: {
    jumpTo: "येथे जा:",
    closeWindow: "खिडकी बंद करा",
    navD1Chart: "लग्न कुंडली (D1)",
    nav12Bhavas: "12 भाव",
    navDrishti: "दृष्टी (Drishti)",
    navHouseAnalysis: "भाव फलादेश",
    navConjunctions: "युती विचार",
    navYamakantaka: "यमकंटक",
    navMandiGulika: "मांदि-गुलिका",
    navUpaketu: "उपकेतू",
    navIndrachapa: "इंद्रचाप"
  },
  gu: {
    jumpTo: "અહીં જાઓ:",
    closeWindow: "વિન્ડો બંધ કરો",
    navD1Chart: "લગ્ન કુંડળી (D1)",
    nav12Bhavas: "12 ભાવો",
    navDrishti: "ગ્રહ દ્રષ્ટિ (Drishti)",
    navHouseAnalysis: "ભાવ ફલાદેશ",
    navConjunctions: "યુતિ વિચાર",
    navYamakantaka: "યમકંટક",
    navMandiGulika: "માંદિ-ગુલિકા",
    navUpaketu: "ઉપકેતુ",
    navIndrachapa: "ઇન્દ્રચાપ"
  },
  bn: {
    jumpTo: "বিভাগে যান:",
    closeWindow: "উইন্ডো বন্ধ করুন",
    navD1Chart: "লগ্ন কুষ্ঠি (D1)",
    nav12Bhavas: "১২ ভাব",
    navDrishti: "গ্রহ দৃষ্টি (Drishti)",
    navHouseAnalysis: "ভাব বিচার",
    navConjunctions: "যুতি বিচার",
    navYamakantaka: "যমকণ্টক",
    navMandiGulika: "মান্দি-গুলিকা",
    navUpaketu: "উপকেতু",
    navIndrachapa: "ইন্দ্রচাপ"
  },
  kn: {
    jumpTo: "ಇಲ್ಲಿಗೆ ಹೋಗಿ:",
    closeWindow: "ವಿಂಡೋ ಮುಚ್ಚಿ",
    navD1Chart: "ಲಗ್ನ ಕುಂಡಲಿ (D1)",
    nav12Bhavas: "12 ಭಾವಗಳು",
    navDrishti: "ಗ್ರಹ ದೃಷ್ಟಿ (Drishti)",
    navHouseAnalysis: "ಭಾವ ಫಲಗಳು",
    navConjunctions: "ಗ್ರಹ ಸಂಯೋಗ (ಯುತಿ)",
    navYamakantaka: "ಯಮಕಂಟಕ",
    navMandiGulika: "ಮಾಂದಿ-ಗುಳಿಕ",
    navUpaketu: "ಉಪಕೇತು",
    navIndrachapa: "ಇಂದ್ರಚಾಪ"
  },
  ml: {
    jumpTo: "ഇതിലേക്ക് പോവുക:",
    closeWindow: "വിൻഡോ അടയ്ക്കുക",
    navD1Chart: "ലഗ്ന ജാതകം (D1)",
    nav12Bhavas: "12 ഭാവങ്ങൾ",
    navDrishti: "ഗ്രഹ ദൃഷ്ടി (Drishti)",
    navHouseAnalysis: "ഭാവ ഫലങ്ങൾ",
    navConjunctions: "ഗ്രഹ സംയോഗം (യുതി)",
    navYamakantaka: "യമകണ്ടകൻ",
    navMandiGulika: "മാന്ദി-ഗുളികൻ",
    navUpaketu: "ഉപകേതു",
    navIndrachapa: "ഇന്ദ്രചാപം"
  }
};

// 1. Update seeder in memory
for (const [lang, keys] of Object.entries(pillNavUIKeys)) {
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
console.log('✅ Updated astroTranslationSeeder.js with Nav Pill UI keys!');

// 3. Update MongoDB directly
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/astro_consult').then(async () => {
  for (const [lang, keys] of Object.entries(pillNavUIKeys)) {
    const updateObj = {};
    for (const [k, v] of Object.entries(keys)) {
      updateObj[`ui.${k}`] = v;
    }
    await AstroTranslation.findOneAndUpdate({ lang }, { $set: updateObj });
  }
  console.log('✅ Successfully updated MongoDB with Nav Pill UI keys for all 8 Indian languages!');
  process.exit(0);
}).catch(err => {
  console.error('❌ MongoDB update failed:', err);
  process.exit(1);
});
