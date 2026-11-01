const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const AstroTranslation = require('../models/AstroTranslation');
const seeder = require('../services/astroTranslationSeeder');

const upaketuUIKeys = {
  hi: {
    upaketuTitle: "उपकेतु (शिखी) विश्लेषण",
    upaketuBadge: "अप्रकाश ग्रह (उपकेतु शिखी)",
    upaketuSubtitle: "अग्नि तत्वीय अप्रकाश ग्रह: आकस्मिक घटनाएं एवं आक्रामक कर्म विचार",
    upaketuRasi: "राशि",
    upaketuLongitude: "भोगांश",
    upaketuUpachayaType: "उपाचय पराक्रम (Upachaya)",
    upaketuClassicalRule: "शास्त्रीय पराशर: उपकेतु में मंगल-केतु सदृश तीक्ष्ण अग्नितत्व होता है, जो जीवन में आकस्मिक परिवर्तन लाता है।",
    upaketuUpachayaHeader: "प्रचंड सफलता एवं आक्रामक वृद्धि",
    upaketuNonUpachayaHeader: "आकस्मिक घटनाएं एवं तीव्र ऊर्जा",
    upaketuClassicalGuidance: "शास्त्रीय मार्गदर्शन",
    upaketuUpachayaGuidance: "अनुशासन और दृढ़ संकल्प से इस उग्र ऊर्जा को सही दिशा में लगाने पर यह शत्रुओं व प्रतिस्पर्धा पर पूर्ण विजय दिलाती है।",
    upaketuNonUpachayaGuidance: "आकस्मिक विवाद, जल्दबाजी और अग्नि दुर्घटनाओं से सावधान रहें; अतिरिक्त ऊर्जा को खेलकूद व व्यायाम में लगाएं।"
  },
  ta: {
    upaketuTitle: "உபகேது (சிகீ) ஆய்வு",
    upaketuBadge: "அப்ரகாச கிரகம் (உபகேது சிகீ)",
    upaketuSubtitle: "நெருப்புத் தத்துவ மறைமுக கிரகம்: திடீர் நிகழ்வுகள் மற்றும் தீவிர கர்ம வினைகள்",
    upaketuRasi: "ராசி",
    upaketuLongitude: "பாகை (Longitude)",
    upaketuUpachayaType: "உபசய வீரியம் (Upachaya)",
    upaketuClassicalRule: "பாரம்பரிய பராசரர் விதி: உபகேது செவ்வாய்-கேதுவின் தீவிர அக்னி தாக்கத்தைக் கொண்டு திடீர் மாற்றங்களை ஏற்படுத்துகிறது.",
    upaketuUpachayaHeader: "தீவிர வெற்றி & அசுர வளர்ச்சி",
    upaketuNonUpachayaHeader: "திடீர் நிகழ்வுகள் & தீவிர ஆற்றல்",
    upaketuClassicalGuidance: "பாரம்பரிய வழிகாட்டல்",
    upaketuUpachayaGuidance: "ஒழுக்கம் மற்றும் மன உறுதியுடன் நேர்மறையாக செலுத்தப்படும் போது, இந்த அக்னி ஆற்றல் எதிரிகளை வென்று முழு வெற்றியைத் தருகிறது.",
    upaketuNonUpachayaGuidance: "திடீர் வாக்குவாதங்கள், அவசர முடிவுகள் மற்றும் நெருப்பு விபத்துகளில் எச்சரிக்கை தேவை; ஆற்றலை உடற்பயிற்சியில் செலுத்துங்கள்."
  },
  te: {
    upaketuTitle: "ఉపకేతు (శిఖి) విశ్లేషణ",
    upaketuBadge: "అప్రకాశ గ్రహం (ఉపకేతు శిఖి)",
    upaketuSubtitle: "అగ్ని తత్వ అప్రకాశ గ్రహం: ఆకస్మిక సంఘటనలు మరియు తీవ్ర కర్మానుభవం",
    upaketuRasi: "రాశి",
    upaketuLongitude: "రేఖాంశం (Longitude)",
    upaketuUpachayaType: "ఉపచయ పరాక్రమం (Upachaya)",
    upaketuClassicalRule: "పరాశర శాస్త్రం: ఉపకేతు కుజ-కేతువుల వంటి తీక్షణ అగ్ని ప్రభావాన్ని కలిగి ఆకస్మిక మార్పులను కలిగిస్తుంది.",
    upaketuUpachayaHeader: "తీవ్ర విజయం & వేగవంతమైన వృద్ధి",
    upaketuNonUpachayaHeader: "ఆకస్మిక సంఘటనలు & చంచల శక్తి",
    upaketuClassicalGuidance: "శాస్త్రీయ మార్గదర్శనం",
    upaketuUpachayaGuidance: "క్రమశిక్షణ మరియు పట్టుదలతో సరైన మార్గంలో మళ్లిస్తే, ఈ అగ్ని శక్తి పోటీదారులపై సంపూర్ణ విజయాన్ని అందిస్తుంది.",
    upaketuNonUpachayaGuidance: "ఆకస్మిక వాదనలు, తొందరపాటు మరియు అగ్ని ప్రమాదాల విషయంలో జాగ్రత్త వహించండి; శారీరక వ్యాయామంపై దృష్టి పెట్టండి."
  },
  mr: {
    upaketuTitle: "उपकेतु (शिखी) विश्लेषण",
    upaketuBadge: "अप्रकाश ग्रह (उपकेतु शिखी)",
    upaketuSubtitle: "अग्नि तत्त्वाचा अप्रकाश ग्रह: आकस्मिक घटना व आक्रमक कर्म विचार",
    upaketuRasi: "राशी",
    upaketuLongitude: "अंशात्मक स्थिती",
    upaketuUpachayaType: "उपाचय पराक्रम (Upachaya)",
    upaketuClassicalRule: "शास्त्रीय पराशर: उपकेतूमध्ये मंगळ-केतू सदृश तीक्ष्ण अग्नितत्त्व असते, जे अचानक मोठे बदल घडवून आणते.",
    upaketuUpachayaHeader: "प्रचंड यश व आक्रमक वृद्धी",
    upaketuNonUpachayaHeader: "आकस्मिक घटना व तीव्र ऊर्जा",
    upaketuClassicalGuidance: "शास्त्रीय मार्गदर्शन",
    upaketuUpachayaGuidance: "शिस्त आणि दृढनिश्चयाने या उग्र ऊर्जेला योग्य दिशा दिल्यास स्पर्धा व शत्रूंवर संपूर्ण विजय प्राप्त होतो.",
    upaketuNonUpachayaGuidance: "अचानक वादविवाद, घाईगडबड व आगीच्या धोक्यांपासून सावध राहा; अतिरिक्त ऊर्जा व्यायामात लावा."
  },
  gu: {
    upaketuTitle: "ઉપકેતુ (શિખી) વિશ્લેષણ",
    upaketuBadge: "અપ્રકાશ ગ્રહ (ઉપકેતુ શિખી)",
    upaketuSubtitle: "અગ્નિ તત્વનો અપ્રકાશ ગ્રહ: આકસ્મિક ઘટનાઓ અને આક્રમક કર્મ વિચાર",
    upaketuRasi: "રાશિ",
    upaketuLongitude: "રેખાંશ",
    upaketuUpachayaType: "ઉપચય પરાક્રમ (Upachaya)",
    upaketuClassicalRule: "શાસ્ત્રીય પરાશર: ઉપકેતુ મંગળ-કેતુ જેવી તીક્ષ્ણ અગ્નિ ઊર્જા ધરાવે છે, જે આકસ્મિક પરિવર્તનો લાવે છે.",
    upaketuUpachayaHeader: "પ્રચંડ સફળતા અને આક્રમક વૃદ્ધિ",
    upaketuNonUpachayaHeader: "આકસ્મિક ઘટનાઓ અને તીવ્ર ઊર્જા",
    upaketuClassicalGuidance: "શાસ્ત્રીય માર્ગદર્શન",
    upaketuUpachayaGuidance: "શિસ્ત અને દ્રઢ નિશ્ચય સાથે યોગ્ય દિશા આપતાં આ અગ્નિ ઊર્જા હરીફો પર પૂર્ણ વિજય અપાવે છે.",
    upaketuNonUpachayaGuidance: "આકસ્મિક વિવાદો, ઉતાવળિયા નિર્ણયો અને અગ્નિ અકસ્માતોથી સાવધ રહો; વધારાની ઊર્જા ફિટનેસમાં લગાવો."
  },
  bn: {
    upaketuTitle: "উপকেতু (শিখী) বিশ্লেষণ",
    upaketuBadge: "অপ্রকাশ গ্রহ (উপকেতু শিখী)",
    upaketuSubtitle: "অগ্নি তত্ত্বের অপ্রকাশ গ্রহ: আকস্মিক ঘটনা ও আক্রমণাত্মক কর্ম বিচার",
    upaketuRasi: "রাশি",
    upaketuLongitude: "দ্রাঘিমাংশ",
    upaketuUpachayaType: "উপচয় পরাক্রম (Upachaya)",
    upaketuClassicalRule: "শাস্ত্রীয় পরাশর: উপকেতু মঙ্গল-কেতুর তীব্র অগ্নিতত্ত্ব বহন করে যা জীবনে আকস্মিক রূপান্তর ঘটায়।",
    upaketuUpachayaHeader: "তীব্র সাফল্য ও আক্রমণাত্মক বিকাশ",
    upaketuNonUpachayaHeader: "আকস্মিক ঘটনা ও অস্থির শক্তি",
    upaketuClassicalGuidance: "শাস্ত্রীয় নির্দেশনা",
    upaketuUpachayaGuidance: "শৃঙ্খলা ও দৃঢ়তার সাথে পরিচালনা করলে এই অগ্নিশক্তি প্রতিযোগিতায় চূড়ান্ত বিজয় নিশ্চিত করে।",
    upaketuNonUpachayaGuidance: "আকস্মিক বিবাদ, হঠকারিতা এবং অগ্নি বিপদ থেকে সতর্ক থাকুন; অতিরিক্ত শক্তি শরীরচর্চায় ব্যয় করুন।"
  },
  kn: {
    upaketuTitle: "ಉಪಕೇತು (ಶಿಖಿ) ವಿಶ್ಲೇಷಣೆ",
    upaketuBadge: "ಅಪ್ರಕಾಶ ಗ್ರಹ (ಉಪಕೇತು ಶಿಖಿ)",
    upaketuSubtitle: "ಅಗ್ನಿ ತತ್ವದ ಅಪ್ರಕಾಶ ಗ್ರಹ: ಹಠಾತ್ ಘಟನೆಗಳು ಮತ್ತು ತೀವ್ರ ಕರ್ಮ ವಿಚಾರ",
    upaketuRasi: "ರಾಶಿ",
    upaketuLongitude: "ರೇಖಾಂಶ",
    upaketuUpachayaType: "ಉಪಚಯ ಪರಾಕ್ರಮ (Upachaya)",
    upaketuClassicalRule: "ಶಾಸ್ತ್ರೀಯ ಪರಾಶರ: ಉಪಕೇತು ಕುಜ-ಕೇತು ತರಹದ ತೀಕ್ಷ್ಣ ಅಗ್ನಿ ಪ್ರಭಾವ ಹೊಂದಿದ್ದು ಆಕಸ್ಮಿಕ ಬದಲಾವಣೆಗಳನ್ನು ತರುತ್ತದೆ.",
    upaketuUpachayaHeader: "ಪ್ರಚಂಡ ಯಶಸ್ಸು ಮತ್ತು ತೀವ್ರ ಪ್ರಗತಿ",
    upaketuNonUpachayaHeader: "ಆಕಸ್ಮಿಕ ಘಟನೆಗಳು ಮತ್ತು ಚಂಚಲ ಶಕ್ತಿ",
    upaketuClassicalGuidance: "ಶಾಸ್ತ್ರೀಯ ಮಾರ್ಗದರ್ಶನ",
    upaketuUpachayaGuidance: "ಶಿಸ್ತು ಮತ್ತು ದೃಢ ಸಂಕಲ್ಪದಿಂದ ಸಕಾರಾತ್ಮಕವಾಗಿ ಬಳಸಿಕೊಂಡಾಗ ಈ ಅಗ್ನಿ ಶಕ್ತಿಯು ಸ್ಪರ್ಧೆಯಲ್ಲಿ ಪೂರ್ಣ ಜಯವನ್ನು ನೀಡುತ್ತದೆ.",
    upaketuNonUpachayaGuidance: "ಆಕಸ್ಮಿಕ ವಾದಗಳು, ಆತುರದ ತೀರ್ಮಾನಗಳು ಮತ್ತು ಅಗ್ನಿ ಅಪಾಯಗಳಿಂದ ಎಚ್ಚರವಿರಲಿ; ಶಕ್ತಿಯನ್ನು ವ್ಯಾಯಾಮದಲ್ಲಿ ವಿನಿಯೋಗಿಸಿ."
  },
  ml: {
    upaketuTitle: "ഉപകേതു (ശിഖി) വിശകലനം",
    upaketuBadge: "അപ്രകാശ ഗ്രഹം (ഉപകേതു ശിഖി)",
    upaketuSubtitle: "അഗ്നി തത്വമുള്ള അപ്രകാശ ഗ്രഹം: ആകസ്മിക സംഭവങ്ങളും കഠിന കർമ്മഫലങ്ങളും",
    upaketuRasi: "രാശി",
    upaketuLongitude: "രേഖാംശം",
    upaketuUpachayaType: "ഉപചയ വീര്യം (Upachaya)",
    upaketuClassicalRule: "പരാശര ശാസ്ത്രം: ചൊവ്വ-കേതു തുല്യമായ തീക്ഷ്ണ അഗ്നി സ്വാധീനം ചെലുത്തി പെട്ടെന്നുള്ള പരിവർത്തനങ്ങൾക്ക് ഉപകേതു കാരണമാകുന്നു.",
    upaketuUpachayaHeader: "തീവ്ര വിജയവും ദ്രുതഗതിയിലുള്ള വളർച്ചയും",
    upaketuNonUpachayaHeader: "പെട്ടെന്നുള്ള സംഭവങ്ങളും പ്രക്ഷുബ്ധ ഊർജ്ജവും",
    upaketuClassicalGuidance: "ശാസ്ത്രീയ മാർഗ്ഗനിർദ്ദേശം",
    upaketuUpachayaGuidance: "അച്ചടക്കത്തോടെയും ദൃഢനിശ്ചയത്തോടെയും ലക്ഷ്യത്തിലേക്ക് നയിക്കുമ്പോൾ ഈ അഗ്നി ഊർജ്ജം എതിരാളികൾക്കുമേൽ സമ്പൂർണ്ണ വിജയം നൽകുന്നു.",
    upaketuNonUpachayaGuidance: "പെട്ടെന്നുള്ള തർക്കങ്ങൾ, എടുത്തുചാട്ടം, അഗ്നി ബാധകൾ എന്നിവയിൽ മുൻകരുതൽ പാലിക്കുക; ഊർജ്ജം വ്യായാമത്തിലേക്ക് തിരിച്ചുവിടുക."
  }
};

// 1. Update seeder in memory
for (const [lang, keys] of Object.entries(upaketuUIKeys)) {
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
console.log('✅ Updated astroTranslationSeeder.js with Upaketu UI keys!');

// 3. Update MongoDB directly
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/astro_consult').then(async () => {
  for (const [lang, keys] of Object.entries(upaketuUIKeys)) {
    const updateObj = {};
    for (const [k, v] of Object.entries(keys)) {
      updateObj[`ui.${k}`] = v;
    }
    await AstroTranslation.findOneAndUpdate({ lang }, { $set: updateObj });
  }
  console.log('✅ Successfully updated MongoDB with Upaketu UI keys for all 8 Indian languages!');
  process.exit(0);
}).catch(err => {
  console.error('❌ MongoDB update failed:', err);
  process.exit(1);
});
