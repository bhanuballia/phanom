const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const AstroTranslation = require('../models/AstroTranslation');
const seeder = require('../services/astroTranslationSeeder');

const indrachapaUIKeys = {
  hi: {
    indrachapaTitle: "इंद्रचाप (कोदंड) विश्लेषण",
    indrachapaBadge: "अप्रकाश ग्रह (इंद्रचाप कोदंड)",
    indrachapaSubtitle: "रहस्यमयी इंद्रधनुषीय धनु ग्रह: भ्रम, माया एवं आकस्मिक आघात विचार (इंद्रधनुष विचार)",
    indrachapaClassicalRule: "शास्त्रीय पराशर: इंद्रचाप (कोदंड) दैविय धनुष सदृश कार्य कर प्रारब्ध में आकस्मिक चमक एवं अप्रत्याशित प्रभाव उत्पन्न करता है।",
    indrachapaUpachayaHeader: "आकस्मिक उत्थान एवं कूटनीतिक प्रभाव",
    indrachapaNonUpachayaHeader: "रहस्यमयी घटनाएं एवं मायाजाल",
    indrachapaUpachayaGuidance: "कूटनीतिक सूझबूझ और आकस्मिक अवसरों का लाभ उठाकर विपरीत परिस्थितियों पर विजय और उच्च पद की प्राप्ति होती है।",
    indrachapaNonUpachayaGuidance: "यथार्थवादी दृष्टिकोण रखें, सट्टेबाजी व शीघ्र अमीर बनने वाले प्रलोभनों से बचें; पूर्ण जांच-पड़ताल के बाद ही विश्वास करें।"
  },
  ta: {
    indrachapaTitle: "இந்திரசாபம் (கோதண்டம்) ஆய்வு",
    indrachapaBadge: "அப்ரகாச கிரகம் (இந்திரசாபம் கோதண்டம்)",
    indrachapaSubtitle: "மர்மமான வானவில் வில் கிரகம்: மாயை, பிரமைகள் மற்றும் திடீர் தாக்குதல்கள் (இந்திரதனுசு பலன்)",
    indrachapaClassicalRule: "பாரंबकीय பராசரர் விதி: இந்திரசாபம் (கோதண்டம்) தெய்வீக வில்லாக செயல்பட்டு விதியில் திடீர் மின்னல் போன்ற தாக்கங்களை உருவாக்குகிறது.",
    indrachapaUpachayaHeader: "திடீர் எழுச்சி & ராஜதந்திர ஆற்றல்",
    indrachapaNonUpachayaHeader: "மர்மமான நிகழ்வுகள் & மாயை பிரமைகள்",
    indrachapaUpachayaGuidance: "ராஜதந்திர நுண்ணறிவு மற்றும் திடீர் முன்னேற்றங்களைப் பயன்படுத்தி தடைகளை வென்று உயர்ந்த பதவிகளை அடைகிறார்கள்.",
    indrachapaNonUpachayaGuidance: "நடைமுறை உண்மைகளைக் கவனியுங்கள்; பேராசை மற்றும் குறுக்குவழி முதலீடுகளைத் தவிர்த்து, ஆராய்ந்த பின்னரே முடிவெடுக்கவும்."
  },
  te: {
    indrachapaTitle: "ఇంద్రచాప (కోదండ) విశ్లేషణ",
    indrachapaBadge: "అప్రకాశ గ్రహం (ఇంద్రచాప కోదండ)",
    indrachapaSubtitle: "రహస్యమయ ఇంద్రధనుస్సు ధను గ్రహం: భ్రమలు, మాయ మరియు ఆకస్మిక ఘాతాలు (ఇంద్రధనుస్సు వివేచన)",
    indrachapaClassicalRule: "పరాశర శాస్త్రం: ఇంద్రచాపం (కోదండం) దివ్య ధనుస్సులా పనిచేసి విధిలో ఆకస్మిక మెరుపుల వంటి పరిణామాలను సృష్టిస్తుంది.",
    indrachapaUpachayaHeader: "ఆకస్మిక ఎదుగుదల & వ్యూహాత్మక ప్రభావం",
    indrachapaNonUpachayaHeader: "రహస్యమయ సంఘటనలు & మాయా భ్రమలు",
    indrachapaUpachayaGuidance: "వ్యూహాత్మక ప్రతిభ మరియు ఆకస్మిక అవకాశాలతో ప్రతికూలతలను జయించి ఉన్నత హోదాలను సాధిస్తారు.",
    indrachapaNonUpachayaGuidance: "వాస్తవికంగా ఉండండి, అత్యాశ మరియు ఊహాగాన ప్రలోభాలకు గురికాకండి; సత్యం ధృవీకరించిన తర్వాతే నమ్మండి."
  },
  mr: {
    indrachapaTitle: "इंद्रचाप (कोदंड) विश्लेषण",
    indrachapaBadge: "अप्रकाश ग्रह (इंद्रचाप कोदंड)",
    indrachapaSubtitle: "रहस्यमयी इंद्रधनुषी धनु ग्रह: भ्रम, माया व आकस्मिक आघात विचार (इंद्रधनुष विचार)",
    indrachapaClassicalRule: "शास्त्रीय पराशर: इंद्रचाप (कोदंड) दैवी धनुष्याप्रमाणे कार्य करून प्रारब्धात अचानक चमत्कारी बदल घडवून आणतो.",
    indrachapaUpachayaHeader: "आकस्मिक उत्कर्ष व रणनीतिक प्रभाव",
    indrachapaNonUpachayaHeader: "रहस्यमयी घटना व मायावी भ्रम",
    indrachapaUpachayaGuidance: "रणनीतिक बुद्धिमत्ता व अचानक मिळणाऱ्या संधींचा लाभ घेऊन संकटांवर मात करत उच्च पद गाठता येते.",
    indrachapaNonUpachayaGuidance: "वास्तववादी राहा, फसव्या योजना व मृगजळासारख्या लोभांपासून दूर राहा; सत्य पडताळूनच निर्णय घ्या."
  },
  gu: {
    indrachapaTitle: "ઇન્દ્રચાપ (કોદંડ) વિશ્લેષણ",
    indrachapaBadge: "અપ્રકાશ ગ્રહ (ઇન્દ્રચાપ કોદંડ)",
    indrachapaSubtitle: "રહસ્યમય મેઘધનુષી ધનુ ગ્રહ: ભ્રમ, માયા અને આકસ્મિક આઘાત વિચાર (મેઘધનુષ વિચાર)",
    indrachapaClassicalRule: "શાસ્ત્રીય પરાશર: ઇન્દ્રચાપ (કોદંડ) દિવ્ય ધનુષ જેવું કાર્ય કરીને ભાગ્યમાં આકસ્મિક ચમકારો લાવે છે.",
    indrachapaUpachayaHeader: "આકસ્મિક પ્રગતિ અને વ્યુહાત્મક પ્રભાવ",
    indrachapaNonUpachayaHeader: "રહસ્યમય ઘટનાઓ અને માયાવી ભ્રમ",
    indrachapaUpachayaGuidance: "વ્યુહાત્મક બુદ્ધિ અને આકસ્મિક તકોનો લાભ લઈને વિપરીત સંજોગો પર વિજય અને ઉચ્ચ હોદ્દો પ્રાપ્ત થાય છે.",
    indrachapaNonUpachayaGuidance: "વાસ્તવિકતામાં રહો, સટ્ટાબાજી અને લાલચુ યોજનાઓથી બચો; સત્ય ચકાસ્યા પછી જ વિશ્વાસ કરો."
  },
  bn: {
    indrachapaTitle: "ইন্দ্রচাপ (কোদণ্ড) বিশ্লেষণ",
    indrachapaBadge: "অপ্রকাশ গ্রহ (ইন্দ্রচাপ কোদণ্ড)",
    indrachapaSubtitle: "রহস্যময় রংধনু ধনুক গ্রহ: বিভ্রান্তি, মায়া ও আকস্মিক আঘাতের বিচার (ইন্দ্রধনু বিচার)",
    indrachapaClassicalRule: "শাস্ত্রীয় পরাশর: ইন্দ্রচাপ (কোদণ্ড) দৈব ধনুকের মতো কাজ করে ভাগ্যে আকস্মিক তীব্র রূপান্তর সৃষ্টি করে।",
    indrachapaUpachayaHeader: "আকস্মিক উত্থান ও কৌশলগত প্রভাব",
    indrachapaNonUpachayaHeader: "রহস্যজনক ঘটনা ও দৃষ্টিভ্রম",
    indrachapaUpachayaGuidance: "কৌশলগত দূরদর্শিতা এবং আকস্মিক সুযোগের সদ্ব্যবহার করে প্রতিকূলতা জয় ও উচ্চ পদে আরোহণ সম্ভব।",
    indrachapaNonUpachayaGuidance: "বাস্তববাদী থাকুন, প্রলোভন ও দ্রুত ধনী হওয়ার মোহ থেকে দূরে থাকুন; যাচাই করে বিশ্বাস স্থাপন করুন।"
  },
  kn: {
    indrachapaTitle: "ಇಂದ್ರಚಾಪ (ಕೋದಂಡ) ವಿಶ್ಲೇಷಣೆ",
    indrachapaBadge: "ಅಪ್ರಕಾಶ ಗ್ರಹ (ಇಂದ್ರಚಾಪ ಕೋದಂಡ)",
    indrachapaSubtitle: "ನಿಗೂಢ ಕಾಮನಬಿಲ್ಲು ಧನು ಗ್ರಹ: ಭ್ರಮೆ, ಮಾಯೆ ಮತ್ತು ಹಠಾತ್ ಹೊಡೆತಗಳ ವಿಚಾರ (ಕಾಮನಬಿಲ್ಲು ವಿವೇಚನೆ)",
    indrachapaClassicalRule: "ಶಾಸ್ತ್ರೀಯ ಪರಾಶರ: ಇಂದ್ರಚಾಪ (ಕೋದಂಡ) ದೈವೀ ಧನುಸ್ಸಿನಂತೆ ಕಾರ್ಯನಿರ್ವಹಿಸಿ ವಿಧಿಯಲ್ಲಿ ಮಿಂಚಿನಂತಹ ಆಕಸ್ಮಿಕ ಬದಲಾವಣೆಗಳನ್ನು ಉಂಟುಮಾಡುತ್ತದೆ.",
    indrachapaUpachayaHeader: "ಆಕಸ್ಮಿಕ ಏಳಿಗೆ ಮತ್ತು ಯುಕ್ತಿಪೂರ್ಣ ಪ್ರಭಾವ",
    indrachapaNonUpachayaHeader: "ನಿಗೂಢ ಘಟನೆಗಳು ಮತ್ತು ಮಾಯಾ ಭ್ರಮೆಗಳು",
    indrachapaUpachayaGuidance: "ಕಾರ್ಯತಂತ್ರದ ಬುದ್ಧಿವಂತಿಕೆ ಮತ್ತು ಆಕಸ್ಮಿಕ ಅವಕಾಶಗಳನ್ನು ಬಳಸಿಕೊಂಡು ವಿಪತ್ತುಗಳನ್ನು ಜಯಿಸಿ ಉನ್ನತ ಸ್ಥಾನ ಗಳಿಸುತ್ತಾರೆ.",
    indrachapaNonUpachayaGuidance: "ವಾಸ್ತವದಲ್ಲಿರಿ, ಭ್ರಮೆಗಳು ಮತ್ತು ಸುಲಭವಾಗಿ ಲಾಭ ಪಡೆಯುವ ಆಮಿಷಗಳಿಗೆ ಒಳಗಾಗಬೇಡಿ; ಸತ್ಯವನ್ನು ಪರಿಶೀಲಿಸಿ."
  },
  ml: {
    indrachapaTitle: "ഇന്ദ്രചാപ (കോദണ്ഡ) വിശകലനം",
    indrachapaBadge: "അപ്രകാശ ഗ്രഹം (ഇന്ദ്രചാപ കോദണ്ഡ)",
    indrachapaSubtitle: "രഹസ്യാത്മക മഴവില്ല് വില്ല് ഗ്രഹം: ഭ്രമം, മായ, പെട്ടെന്നുള്ള ആഘാതങ്ങൾ (ഇന്ദ്രധനുസ്സ് നിരൂപണം)",
    indrachapaClassicalRule: "പരാശര ശാസ്ത്രം: ഇന്ദ്രചാപം (കോദണ്ഡം) ദൈവിക വില്ലുപോലെ പ്രവർത്തിച്ച് വിധിയിൽ മിന്നൽ പോലെയുള്ള മാറ്റങ്ങൾ ഉണ്ടാക്കുന്നു.",
    indrachapaUpachayaHeader: "പെട്ടെന്നുള്ള ഉയർച്ചയും തന്ത്രപരമായ പ്രഭാവവും",
    indrachapaNonUpachayaHeader: "നിഗൂഢ സംഭവങ്ങളും മായാഭ്രമങ്ങളും",
    indrachapaUpachayaGuidance: "തന്ത്രപരമായ ചാതുര്യവും പെട്ടെന്നുള്ള അവസരങ്ങളും പ്രയോജനപ്പെടുത്തി പ്രതിസന്ധികളെ മറികടന്ന് ഉയർന്ന സ്ഥാനങ്ങളിൽ എത്തുന്നു.",
    indrachapaNonUpachayaGuidance: "യാഥാർത്ഥ്യബോധം പുലർത്തുക, വ്യാമോഹങ്ങളിലും ലാഭപ്രലോഭനങ്ങളിലും വീഴാതെ സത്യം തിരിച്ചറിഞ്ഞ് പ്രവർത്തിക്കുക."
  }
};

// 1. Update seeder in memory
for (const [lang, keys] of Object.entries(indrachapaUIKeys)) {
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
console.log('✅ Updated astroTranslationSeeder.js with Indrachapa UI keys!');

// 3. Update MongoDB directly
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/astro_consult').then(async () => {
  for (const [lang, keys] of Object.entries(indrachapaUIKeys)) {
    const updateObj = {};
    for (const [k, v] of Object.entries(keys)) {
      updateObj[`ui.${k}`] = v;
    }
    await AstroTranslation.findOneAndUpdate({ lang }, { $set: updateObj });
  }
  console.log('✅ Successfully updated MongoDB with Indrachapa UI keys for all 8 Indian languages!');
  process.exit(0);
}).catch(err => {
  console.error('❌ MongoDB update failed:', err);
  process.exit(1);
});
