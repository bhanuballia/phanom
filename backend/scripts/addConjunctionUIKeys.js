const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const AstroTranslation = require('../models/AstroTranslation');
const seeder = require('../services/astroTranslationSeeder');

const conjunctionUIKeys = {
  hi: {
    conjunctionSectionTitle: "भाव युति विश्लेषण (ग्रह युति प्रभाव)",
    conjunctionSectionSubtitle: "द्वादश भाव ग्रह युति निदान एवं फलकथन (Conjunction Insights)",
    conjunctionActive: "सक्रिय युति",
    conjunctionsActive: "सक्रिय युतियां",
    planetYuti: "ग्रह युति",
    bhavaResonance: "द्वादश भाव संयोग",
    coreOverviewTitle: "मुख्य सिद्धांत एवं अवलोकन (Core Overview)",
    theGoodTitle: "युति के सकारात्मक फल एवं शुभ प्रभाव",
    theBadTitle: "युति की चुनौतियां, सावधानियां एवं उपाय",
    exploringConjunctions: "D1 लग्न कुंडली में भाव युतियों का विश्लेषण किया जा रहा है...",
    labelStrength: "सकारात्मक शक्ति",
    labelChallenge: "चुनौती"
  },
  ta: {
    conjunctionSectionTitle: "பாவக கிரக சேர்க்கை ஆய்வு (யுதி பலன்)",
    conjunctionSectionSubtitle: "கிரக சேர்க்கை நோயறிதல் மற்றும் பன்முக பலன்கள் (Conjunction Insights)",
    conjunctionActive: "சேர்க்கை இயங்குகிறது",
    conjunctionsActive: "சேர்க்கைகள் இயங்குகின்றன",
    planetYuti: "கிரக யுதி சேர்க்கை",
    bhavaResonance: "பாவக சேர்க்கை பொருத்தம்",
    coreOverviewTitle: "முக்கிய கண்ணோட்டம் மற்றும் தத்துவம்",
    theGoodTitle: "கிரக சேர்க்கையின் சுப பலன்கள் (நன்மைகள்)",
    theBadTitle: "கிரக சேர்க்கையின் சவால்கள் மற்றும் எச்சரிக்கைகள்",
    exploringConjunctions: "D1 லக்ன ஜாதகத்தில் கிரக சேர்க்கைகள் ஆராயப்படுகின்றன...",
    labelStrength: "சுப பலம்",
    labelChallenge: "சவால்"
  },
  te: {
    conjunctionSectionTitle: "భావ గ్రహ కలయిక విశ్లేషణ (యుతి ఫలితాలు)",
    conjunctionSectionSubtitle: "గ్రహ సంయోగ విశ్లేషణ మరియు నివారణా ఫలితాలు (Conjunction Insights)",
    conjunctionActive: "కలయిక సక్రియం",
    conjunctionsActive: "కలయికలు సక్రియం",
    planetYuti: "గ్రహ యుతి",
    bhavaResonance: "భావ సంయోగ ప్రభావం",
    coreOverviewTitle: "ప్రధాన అవలోకనం మరియు సూత్రం",
    theGoodTitle: "గ్రహ కలయిక యొక్క శుభ ఫలితాలు (మంచి ప్రభావం)",
    theBadTitle: "గ్రహ కలయిక యొక్క సవాళ్లు మరియు జాగ్రత్తలు",
    exploringConjunctions: "D1 లగ్న కుండలిలో గ్రహ కలయికల పరిశీలన జరుగుతోంది...",
    labelStrength: "శుభ బలం",
    labelChallenge: "సవాలు"
  },
  mr: {
    conjunctionSectionTitle: "भाव युती विश्लेषण (ग्रह युती प्रभाव)",
    conjunctionSectionSubtitle: "ग्रह संयोग फलादेश व सविस्तर निदान (Conjunction Insights)",
    conjunctionActive: "सक्रिय युती",
    conjunctionsActive: "सक्रिय युती",
    planetYuti: "ग्रह युती",
    bhavaResonance: "भाव संयोग",
    coreOverviewTitle: "मुख्य सिद्धांत व विहंगावलोकन",
    theGoodTitle: "ग्रह युतीचे सकारात्मक परिणाम व शुभ फल",
    theBadTitle: "ग्रह युतीची आव्हाने व घ्यावयाची काळजी",
    exploringConjunctions: "D1 लग्न कुंडलीतील ग्रह युतींचे विश्लेषण होत आहे...",
    labelStrength: "सकारात्मक शक्ती",
    labelChallenge: "आव्हान"
  },
  gu: {
    conjunctionSectionTitle: "ભાવ યુતિ વિશ્લેષણ (ગ્રહ યુતિ પ્રભાવ)",
    conjunctionSectionSubtitle: "ગ્રહ સંયોગ નિદાન અને પરિણામો (Conjunction Insights)",
    conjunctionActive: "સક્રિય યુતિ",
    conjunctionsActive: "સક્રિય યુતિઓ",
    planetYuti: "ગ્રહ યુતિ",
    bhavaResonance: "ભાવ સંયોગ પ્રભાવ",
    coreOverviewTitle: "મુખ્ય સિદ્ધાંત અને અવલોકન",
    theGoodTitle: "ગ્રહ યુતિના સકારાત્મક ફળ અને શુભ પ્રભાવ",
    theBadTitle: "ગ્રહ યુતિના પડકારો અને સાવચેતીઓ",
    exploringConjunctions: "D1 લગ્ન કુંડળીમાં ગ્રહ યુતિઓનું વિશ્લેષણ ચાલુ છે...",
    labelStrength: "સકારાત્મક બળ",
    labelChallenge: "પડકાર"
  },
  bn: {
    conjunctionSectionTitle: "ভাব যুতি বিশ্লেষণ (গ্রহ সংযোগ ফলাফল)",
    conjunctionSectionSubtitle: "গ্রহ সংযোগ বিশ্লেষণ ও বিস্তারিত প্রভাব (Conjunction Insights)",
    conjunctionActive: "সক্রিয় যুতি",
    conjunctionsActive: "সক্রিয় যুতিসমূহ",
    planetYuti: "গ্রহ যুতি",
    bhavaResonance: "ভাব সংযোগ",
    coreOverviewTitle: "মূল দৃষ্টিভঙ্গি ও তত্ত্ব",
    theGoodTitle: "গ্রহ যুতির ইতিবাচক ও শুভ ফলাফল",
    theBadTitle: "গ্রহ যুতির চ্যালেঞ্জ ও সতর্কতা",
    exploringConjunctions: "D1 লগ্ন কুন্ডলীতে গ্রহ যুতি বিশ্লেষণ করা হচ্ছে...",
    labelStrength: "ইতিবাচক শক্তি",
    labelChallenge: "চ্যালেঞ্জ"
  },
  kn: {
    conjunctionSectionTitle: "ಭಾವ ಗ್ರಹ ಸಂಯೋಗ ವಿಶ್ಲೇಷಣೆ (ಯುತಿ ಫಲಗಳು)",
    conjunctionSectionSubtitle: "ಗ್ರಹ ಸಂಯೋಗ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಒಳನೋಟಗಳು (Conjunction Insights)",
    conjunctionActive: "ಸಕ್ರಿಯ ಯುತಿ",
    conjunctionsActive: "ಸಕ್ರಿಯ ಯುತಿಗಳು",
    planetYuti: "ಗ್ರಹ ಯುತಿ",
    bhavaResonance: "ಭಾವ ಸಂಯೋಗ ಹೊಂದಾಣಿಕೆ",
    coreOverviewTitle: "ಮುಖ್ಯ ಅವಲೋಕನ ಮತ್ತು ತತ್ವ",
    theGoodTitle: "ಗ್ರಹ ಸಂಯೋಗದ ಶುಭ ಫಲಗಳು (ಸಕಾರಾತ್ಮಕ ಪ್ರಭಾವ)",
    theBadTitle: "ಗ್ರಹ ಸಂಯೋಗದ ಸವಾಲುಗಳು ಮತ್ತು ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು",
    exploringConjunctions: "D1 ಲಗ್ನ ಕುಂಡಲಿಯಲ್ಲಿ ಗ್ರಹ ಯುತಿಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
    labelStrength: "ಶುಭ ಶಕ್ತಿ",
    labelChallenge: "ಸವಾಲು"
  },
  ml: {
    conjunctionSectionTitle: "ഭാവ ഗ്രഹ സംയോഗ വിശകലനം (യുതി ഫലങ്ങൾ)",
    conjunctionSectionSubtitle: "ഗ്രഹ സംയോഗ പരിശോധനയും ഫലങ്ങളും (Conjunction Insights)",
    conjunctionActive: "സജീവ യുതി",
    conjunctionsActive: "സജീവ യുതികൾ",
    planetYuti: "ഗ്രഹ യുതി",
    bhavaResonance: "ഭാവ സംയോഗ സ്വാധീനം",
    coreOverviewTitle: "പ്രധാന തത്വവും കാഴ്ചപ്പാടും",
    theGoodTitle: "ഗ്രഹ സംയോഗത്തിന്റെ ശുഭ ഫലങ്ങൾ (അനുകൂല സ്വാധീനം)",
    theBadTitle: "ഗ്രഹ സംയോഗത്തിന്റെ വെല്ലുവിളികളും മുൻകരുതലുകളും",
    exploringConjunctions: "D1 ലഗ്ന ജാതകത്തിൽ ഗ്രഹ സംയോഗങ്ങൾ പരിശോധിക്കുന്നു...",
    labelStrength: "ശുഭ ബലം",
    labelChallenge: "വെല്ലുവിളി"
  }
};

// 1. Update seeder array in memory
for (const [lang, keys] of Object.entries(conjunctionUIKeys)) {
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
console.log('✅ Updated astroTranslationSeeder.js with conjunction UI keys!');

// 3. Update MongoDB directly
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/astro_consult').then(async () => {
  for (const [lang, keys] of Object.entries(conjunctionUIKeys)) {
    const updateObj = {};
    for (const [k, v] of Object.entries(keys)) {
      updateObj[`ui.${k}`] = v;
    }
    await AstroTranslation.findOneAndUpdate({ lang }, { $set: updateObj });
  }
  console.log('✅ Successfully updated MongoDB with conjunction UI keys for all 8 Indian languages!');
  process.exit(0);
}).catch(err => {
  console.error('❌ MongoDB update failed:', err);
  process.exit(1);
});
