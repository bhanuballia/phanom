const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const AstroTranslation = require('../models/AstroTranslation');
const seeder = require('../services/astroTranslationSeeder');

const yamakantakaUIKeys = {
  hi: {
    yamakantakaTitle: "यमकंटक विश्लेषण",
    yamakantakaSubtitle: "रक्षात्मक कृपा एवं शुभ उपग्रह कवच (यमकंटक विचार)",
    jupiterUpagraha: "गुरु का उपग्रह (शुभ)",
    residingBhava: "स्थित भाव",
    riseTime: "उदय काल",
    natureLabel: "प्रकृति",
    natureAuspicious: "शुभ उपग्रह (Auspicious)",
    classicalParasharaRef: "बृहत्पाराशर होरा शास्त्र: देवगुरु बृहस्पति के दैवीय रश्मियों से युक्त अत्यंत शुभ उपग्रह।",
    protectiveEffectsTitle: "सुरक्षात्मक प्रभाव एवं शास्त्रीय शुभ फल",
    bhavaResonanceTag: "भाव संयोग",
    divineShieldLabel: "दैवीय रक्षा कवच",
    divineShieldDesc: "यह निर्दिष्ट भाव को क्रूर पाप प्रभावों से सुरक्षित रखता है तथा कल्याणकारी उन्नति प्रदान करता है।"
  },
  ta: {
    yamakantakaTitle: "யமகண்டகன் ஆய்வு",
    yamakantakaSubtitle: "தெய்வீக அருள் மற்றும் சுப உபகிரக பாதுகாப்பு (யமகண்டக பலன்)",
    jupiterUpagraha: "குருவின் உபகிரகம் (சுபம்)",
    residingBhava: "இருக்கும் பாவகம்",
    riseTime: "உதய நேரம்",
    natureLabel: "இயற்கை குணம்",
    natureAuspicious: "சுப உபகிரகம் (Auspicious)",
    classicalParasharaRef: "பராசர ஹோரா சாஸ்திரம்: குரு பகவானின் மங்கள கதிர்களுடன் இணைந்த அதிசுப உபகிரகம்.",
    protectiveEffectsTitle: "பாதுகாப்பு பலன்கள் & பாரம்பரிய சுப ஆசிகள்",
    bhavaResonanceTag: "பாவகப் பொருத்தம்",
    divineShieldLabel: "தெய்வீக கவசம்",
    divineShieldDesc: "குறிப்பிட்ட பாவகத்தை கடுமையான பாப தாக்கங்களிலிருந்து பாதுகாத்து மங்களகரமான வளர்ச்சியை அளிக்கிறது."
  },
  te: {
    yamakantakaTitle: "యమకంటక విశ్లేషణ",
    yamakantakaSubtitle: "రక్షణాత్మక దివ్య కృప మరియు శుభ ఉపగ్రహ కవచం (యమకంటక వివేచన)",
    jupiterUpagraha: "గురు ఉపగ్రహం (శుభం)",
    residingBhava: "ఉన్న భావం",
    riseTime: "ఉదయ సమయం",
    natureLabel: "స్వభావం",
    natureAuspicious: "శుభ ఉపగ్రహం (Auspicious)",
    classicalParasharaRef: "బృహత్పరాశర హోరా శాస్త్రం: దేవగురు బృహస్పతి యొక్క దివ్య కిరణాలతో కూడిన శుభ ఉపగ్రహం.",
    protectiveEffectsTitle: "రక్షణాత్మక ప్రభావాలు & శాస్త్రీయ ఆశీస్సులు",
    bhavaResonanceTag: "భావ సంయోగం",
    divineShieldLabel: "దివ్య రక్షణ కవచం",
    divineShieldDesc: "ఈ భావాన్ని తీవ్ర పాప దోషాల నుండి రక్షించి, సమృద్ధి మరియు శుభకరమైన పురోగతిని ప్రసాదిస్తుంది."
  },
  mr: {
    yamakantakaTitle: "यमकंटक विश्लेषण",
    yamakantakaSubtitle: "संरक्षक कृपा व शुभ उपग्रह कवच (यमकंटक विचार)",
    jupiterUpagraha: "गुरूचा उपग्रह (शुभ)",
    residingBhava: "स्थित भाव",
    riseTime: "उदय वेळ",
    natureLabel: "प्रकृती",
    natureAuspicious: "शुभ उपग्रह (Auspicious)",
    classicalParasharaRef: "बृहत्पाराशर होरा शास्त्र: देवगुरू बृहस्पतींच्या दैवी किरणांशी जोडलेला अत्यंत शुभ उपग्रह.",
    protectiveEffectsTitle: "संरक्षक प्रभाव व शास्त्रीय शुभ फल",
    bhavaResonanceTag: "भाव संयोग",
    divineShieldLabel: "दैवी सुरक्षा कवच",
    divineShieldDesc: "संबंधित भावाचे तीव्र पाप प्रभावांपासून रक्षण करतो आणि कल्याणकारी विस्तार प्रदान करतो."
  },
  gu: {
    yamakantakaTitle: "યમકંટક વિશ્લેષણ",
    yamakantakaSubtitle: "રક્ષણાત્મક કૃપા અને શુભ ઉપગ્રહ કવચ (યમકંટક વિચાર)",
    jupiterUpagraha: "ગુરુનો ઉપગ્રહ (શુભ)",
    residingBhava: "સ્થિત ભાવ",
    riseTime: "ઉદય સમય",
    natureLabel: "પ્રકૃતિ",
    natureAuspicious: "શુભ ઉપગ્રહ (Auspicious)",
    classicalParasharaRef: "બૃહત્પારાશર હોરા શાસ્ત્ર: દેવગુરુ બૃહસ્પતિના દૈવી કિરણો સાથે સંકળાયેલ અતિ શુભ ઉપગ્રહ.",
    protectiveEffectsTitle: "રક્ષણાત્મક પ્રભાવ અને શાસ્ત્રીય શુભ આશીર્વાદ",
    bhavaResonanceTag: "ભાવ સંયોગ",
    divineShieldLabel: "દૈવી રક્ષા કવચ",
    divineShieldDesc: "આ ભાવને તીવ્ર પાપ પ્રભાવોથી સુરક્ષિત રાખે છે અને શુભ ઉન્નતિ પ્રદાન કરે છે."
  },
  bn: {
    yamakantakaTitle: "যমকণ্টক বিশ্লেষণ",
    yamakantakaSubtitle: "সুরক্ষামূলক কৃপা ও শুভ উপগ্রহ কবচ (যমকণ্টক বিচার)",
    jupiterUpagraha: "গুরুর উপগ্রহ (শুভ)",
    residingBhava: "অবস্থিত ভাব",
    riseTime: "উদয় সময়",
    natureLabel: "প্রকৃতি",
    natureAuspicious: "শুভ উপগ্রহ (Auspicious)",
    classicalParasharaRef: "বৃহৎপরাশরা হোরা শাস্ত্র: দেবগুরু বৃহস্পতির দৈব রশ্মির সাথে সংযুক্ত পরম শুভ উপগ্রহ।",
    protectiveEffectsTitle: "সুরক্ষামূলক প্রভাব ও শাস্ত্রীয় আশীর্বাদ",
    bhavaResonanceTag: "ভাব সংযোগ",
    divineShieldLabel: "ঐশ্বরিক সুরক্ষা কবচ",
    divineShieldDesc: "এটি উদ্দিষ্ট ভাবকে অশুভ পাপ প্রভাব থেকে রক্ষা করে এবং শুভ সমৃদ্ধি প্রদান করে।"
  },
  kn: {
    yamakantakaTitle: "ಯಮಕಂಟಕ ವಿಶ್ಲೇಷಣೆ",
    yamakantakaSubtitle: "ರಕ್ಷಣಾತ್ಮಕ ಕೃಪೆ ಮತ್ತು ಶುಭ ಉಪಗ್ರಹ ಕವಚ (ಯಮಕಂಟಕ ವಿಚಾರ)",
    jupiterUpagraha: "ಗುರುವಿನ ಉಪಗ್ರಹ (ಶುಭ)",
    residingBhava: "ಸ್ಥಿತ ಭಾವ",
    riseTime: "ಉದಯ ಸಮಯ",
    natureLabel: "ಸ್ವಭಾವ",
    natureAuspicious: "ಶುಭ ಉಪಗ್ರಹ (Auspicious)",
    classicalParasharaRef: "ಬೃಹತ್ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರ: ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ದೈವಿಕ ಕಿರಣಗಳೊಂದಿಗೆ ಹೊಂದಿಕೊಂಡಿರುವ ಅತ್ಯಂತ ಶುಭ ಉಪಗ್ರಹ.",
    protectiveEffectsTitle: "ರಕ್ಷಣಾತ್ಮಕ ಪ್ರಭಾವಗಳು ಮತ್ತು ಶಾಸ್ತ್ರೀಯ ಆಶೀರ್ವಾದಗಳು",
    bhavaResonanceTag: "ಭಾವ ಸಂಯೋಗ",
    divineShieldLabel: "ದೈವಿಕ ರಕ್ಷಣಾ ಕವಚ",
    divineShieldDesc: "ಈ ನಿರ್ದಿಷ್ಟ ಭಾವವನ್ನು ತೀವ್ರ ಪಾಪ ದೋಷಗಳಿಂದ ರಕ್ಷಿಸಿ ಶುಭಕರವಾದ ಅಭಿವೃದ್ಧಿಯನ್ನು ನೀಡುತ್ತದೆ."
  },
  ml: {
    yamakantakaTitle: "യമകണ്ടക വിശകലനം",
    yamakantakaSubtitle: "സംരക്ഷണ കൃപയും ശുഭ ഉപഗ്രഹ കവചവും (യമകണ്ടക വിചാരം)",
    jupiterUpagraha: "വ്യാഴത്തിന്റെ ഉപഗ്രഹം (ശുഭം)",
    residingBhava: "സ്ഥിതിചെയ്യുന്ന ഭാവം",
    riseTime: "ഉദയ സമയം",
    natureLabel: "സ്വഭാവം",
    natureAuspicious: "ശുഭ ഉപഗ്രഹം (Auspicious)",
    classicalParasharaRef: "ബൃഹത്പരാശര ഹോരാ ശാസ്ത്രം: ദേവഗുരു വ്യാഴത്തിന്റെ ദിവ്യ പ്രകാശവുമായി ബന്ധപ്പെട്ട അതിശുഭ ഉപഗ്രഹം.",
    protectiveEffectsTitle: "സംരക്ഷണ ഫലങ്ങളും ശാസ്ത്രീയ അനുഗ്രഹങ്ങളും",
    bhavaResonanceTag: "ഭാവ സംയോഗം",
    divineShieldLabel: "ദിവ്യ സംരക്ഷണ കവചം",
    divineShieldDesc: "ഈ ഭാവത്തെ കഠിന പാപ ദോഷങ്ങളിൽ നിന്ന് സംരക്ഷിക്കുകയും ഐശ്വര്യപൂർണ്ണമായ അഭിവൃദ്ധി നൽകുകയും ചെയ്യുന്നു."
  }
};

// 1. Update seeder array in memory
for (const [lang, keys] of Object.entries(yamakantakaUIKeys)) {
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
console.log('✅ Updated astroTranslationSeeder.js with Yamakantaka UI keys!');

// 3. Update MongoDB directly
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/astro_consult').then(async () => {
  for (const [lang, keys] of Object.entries(yamakantakaUIKeys)) {
    const updateObj = {};
    for (const [k, v] of Object.entries(keys)) {
      updateObj[`ui.${k}`] = v;
    }
    await AstroTranslation.findOneAndUpdate({ lang }, { $set: updateObj });
  }
  console.log('✅ Successfully updated MongoDB with Yamakantaka UI keys for all 8 Indian languages!');
  process.exit(0);
}).catch(err => {
  console.error('❌ MongoDB update failed:', err);
  process.exit(1);
});
