const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const AstroTranslation = require('../models/AstroTranslation');
const seeder = require('../services/astroTranslationSeeder');

const houseUIKeys = {
  hi: {
    houseInterpTitle: "भावगत ग्रह फल एवं विस्तृत विवेचन",
    houseInterpSubtitle: "लग्न कुंडली भाव विश्लेषण एवं फलकथन (भावगत ग्रह फल)",
    housePlacement: "भाव स्थिति / फल",
    houseAnalysis: "भाव विश्लेषण",
    positiveManifest: "सकारात्मक प्रभाव (Benefic)",
    negativeManifest: "चुनौतीपूर्ण प्रभाव (Malefic)",
    neutralManifest: "सामान्य प्रभाव (Neutral)",
    manifestationSuffix: "प्रभाव",
    manifestationAnalysis: "प्रभाव व फलकथन विश्लेषण"
  },
  ta: {
    houseInterpTitle: "பாவக ரீதியான கிரகப் பலன்கள்",
    houseInterpSubtitle: "லக்ன ஜாதக பாவப் பலன்கள் மற்றும் நல்வாழ்வு முடிவுகள்",
    housePlacement: "பாவக நிலை / பலன்",
    houseAnalysis: "பாவக ஆய்வு",
    positiveManifest: "சுப பலன் (Benefic)",
    negativeManifest: "சவால் / அசுப பலன் (Malefic)",
    neutralManifest: "சம பலன் (Neutral)",
    manifestationSuffix: "பலன்",
    manifestationAnalysis: "வெளிப்பாடு மற்றும் பலன் ஆய்வு"
  },
  te: {
    houseInterpTitle: "భావాల వారీగా గ్రహ ఫలితాలు",
    houseInterpSubtitle: "లగ్న కుండలి భావ విశ్లేషణ మరియు ఫలితాల వివేచన",
    housePlacement: "స్థితి / భావ ఫలితం",
    houseAnalysis: "భావ విశ్లేషణ",
    positiveManifest: "శుభ ఫలితం (Benefic)",
    negativeManifest: "సవాలు / ప్రతికూల ఫలితం (Malefic)",
    neutralManifest: "మధ్యమ / సమ ఫలితం (Neutral)",
    manifestationSuffix: "ఫలితం",
    manifestationAnalysis: "ప్రభావ ఫలితాల విశ్లేషణ"
  },
  mr: {
    houseInterpTitle: "भावगत ग्रह फल व सविस्तर विवेचन",
    houseInterpSubtitle: "लग्न कुंडली भाव विश्लेषण व परिणाम (भावगत ग्रह फल)",
    housePlacement: "स्थिती / भाव फल",
    houseAnalysis: "भाव विश्लेषण",
    positiveManifest: "सकारात्मक प्रभाव (Benefic)",
    negativeManifest: "आव्हानात्मक प्रभाव (Malefic)",
    neutralManifest: "मध्यम प्रभाव (Neutral)",
    manifestationSuffix: "प्रभाव",
    manifestationAnalysis: "फलादेश व परिणाम विश्लेषण"
  },
  gu: {
    houseInterpTitle: "ભાવગત ગ્રહ ફળ અને વિસ્તૃત વિવેચન",
    houseInterpSubtitle: "લગ્ન કુંડળી ભાવ વિશ્લેષણ અને પરિણામો (ભાવગત ગ્રહ ફળ)",
    housePlacement: "સ્થિતિ / ભાવ ફળ",
    houseAnalysis: "ભાવ વિશ્લેષણ",
    positiveManifest: "સકારાત્મક પ્રભાવ (Benefic)",
    negativeManifest: "પડકારજનક પ્રભાવ (Malefic)",
    neutralManifest: "સામાન્ય પ્રભાવ (Neutral)",
    manifestationSuffix: "પ્રભાવ",
    manifestationAnalysis: "ફળકથન અને પરિણામ વિશ્લેષણ"
  },
  bn: {
    houseInterpTitle: "ভাবানুসারে গ্রহের ফলাফল ও বিস্তারিত বিশ্লেষণ",
    houseInterpSubtitle: "লগ্ন কুন্ডলী ভাব বিশ্লেষণ ও ফলাফল (ভাবগত গ্রহ ফল)",
    housePlacement: "অবস্থান / ভাব ফল",
    houseAnalysis: "ভাব বিশ্লেষণ",
    positiveManifest: "ইতিবাচক প্রভাব (Benefic)",
    negativeManifest: "প্রতিকূল প্রভাব (Malefic)",
    neutralManifest: "সাধারণ প্রভাব (Neutral)",
    manifestationSuffix: "প্রভাব",
    manifestationAnalysis: "ফলাফল ও প্রভাব বিশ্লেষণ"
  },
  kn: {
    houseInterpTitle: "ಭಾವಾನುಸಾರ ಗ್ರಹ ಫಲಗಳು ಮತ್ತು ವಿವರವಾದ ವಿಶ್ಲೇಷಣೆ",
    houseInterpSubtitle: "ಲಗ್ನ ಕುಂಡಲಿ ಭಾವ ಫಲಗಳು ಮತ್ತು ಜಾತಕ ವಿಶ್ಲೇಷಣೆ",
    housePlacement: "ಸ್ಥಿತಿ / ಭಾವ ಫಲ",
    houseAnalysis: "ಭಾವ ವಿಶ್ಲೇಷಣೆ",
    positiveManifest: "ಶುಭ ಫಲ (Benefic)",
    negativeManifest: "ಪ್ರತಿಕೂಲ ಫಲ (Malefic)",
    neutralManifest: "ಸಾಮಾನ್ಯ ಫಲ (Neutral)",
    manifestationSuffix: "ಫಲ",
    manifestationAnalysis: "ಫಲಾನುಭವ ವಿಶ್ಲೇಷಣೆ"
  },
  ml: {
    houseInterpTitle: "ഭാവങ്ങൾ തിരിച്ചുള്ള ഗ്രഹഫലങ്ങൾ",
    houseInterpSubtitle: "ലഗ്ന ജാതക ഭാവ ഫലങ്ങളും വിശദമായ പരിശോധനയും",
    housePlacement: "സ്ഥിതി / ഭാവ ഫലം",
    houseAnalysis: "ഭാവ പരിശോധന",
    positiveManifest: "ശുഭ ഫലം (Benefic)",
    negativeManifest: "പ്രതികൂല ഫലം (Malefic)",
    neutralManifest: "സാധാരണ ഫലം (Neutral)",
    manifestationSuffix: "ഫലം",
    manifestationAnalysis: "ഫല നിരൂപണ വിശകലനം"
  }
};

// 1. Update seeder array in memory
for (const [lang, keys] of Object.entries(houseUIKeys)) {
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
console.log('✅ Updated astroTranslationSeeder.js with house interpretation UI keys!');

// 3. Update MongoDB directly
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/astro_consult').then(async () => {
  for (const [lang, keys] of Object.entries(houseUIKeys)) {
    const updateObj = {};
    for (const [k, v] of Object.entries(keys)) {
      updateObj[`ui.${k}`] = v;
    }
    await AstroTranslation.findOneAndUpdate({ lang }, { $set: updateObj });
  }
  console.log('✅ Successfully updated MongoDB with house interpretation UI keys for all 8 Indian languages!');
  process.exit(0);
}).catch(err => {
  console.error('❌ MongoDB update failed:', err);
  process.exit(1);
});
