const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const AstroTranslation = require('../models/AstroTranslation');
const seeder = require('../services/astroTranslationSeeder');

const mandiGulikaUIKeys = {
  hi: {
    mandiGulikaTitle: "मांदि एवं गुलिका विश्लेषण",
    mandiGulikaSubtitle: "शनि के छाया ग्रह: विलंब, विघ्न एवं संचित कर्म विचार (मांदि एवं गुलिका)",
    saturnSonsTag: "शनि-पुत्र (छाया ग्रह)",
    houseTypeLabel: "भाव प्रकार",
    upachayaGrowth: "उपाचय वृद्धि (Upachaya Growth)",
    standardBhava: "सामान्य भाव (Standard Bhava)",
    classicalUpachayaRule: "शास्त्रीय नियम: उपाचय भावों (3, 6, 10, 11) में मांदि एवं गुलिका भौतिक विजय व दृढ़ सफलता के प्रबल कारक बनते हैं।",
    upachayaHeader: "भौतिक सफलता एवं कर्म विजय",
    nonUpachayaHeader: "कर्म संबंधी चुनौतियां एवं सावधानियां",
    karmicNoteLabel: "कर्म विचार",
    upachayaNote: "इस भाव की ऊर्जाओं पर नियंत्रण पाकर जातक समय के साथ दृढ़ महत्वाकांक्षा व सांसारिक उपलब्धियां अर्जित करता है।",
    nonUpachayaNote: "विलंब और बाधाओं के शमन के लिए संयम, सतर्कता, धैर्यपूर्ण अनुशासन तथा वैदिक शांति उपायों की आवश्यकता है।"
  },
  ta: {
    mandiGulikaTitle: "மாந்தி & குளிகன் ஆய்வு",
    mandiGulikaSubtitle: "சனியின் நிழல் கிரகங்கள்: தாமதம், தடைகள் மற்றும் கர்ம வினைகள் (மாந்தி & குளிகை பலன்)",
    saturnSonsTag: "சனியின் புதல்வர்கள் (சாயா கிரகம்)",
    houseTypeLabel: "பாவக வகை",
    upachayaGrowth: "உபசய வளர்ச்சி (Upachaya)",
    standardBhava: "சாதாரண பாவகம் (Standard)",
    classicalUpachayaRule: "பாரம்பரிய விதி: உபசய ஸ்தானங்களில் (3, 6, 10, 11) மாந்தியும் குளிகனும் லௌகீக வெற்றிக்கு வலிமையான உந்துசக்தியாக மாறுகிறார்கள்.",
    upachayaHeader: "லௌகீக வெற்றி & கர்ம சாதனை",
    nonUpachayaHeader: "கர்ம சவால்கள் & எச்சரிக்கைகள்",
    karmicNoteLabel: "கர்ம குறிப்பு",
    upachayaNote: "இந்த பாவகத்தின் சவால்களை வென்று காலப்போக்கில் தீவிர உழைப்பு மற்றும் உலகியல் வெற்றிகளாக மாற்றப்படுகிறது.",
    nonUpachayaNote: "தாமதங்கள் மற்றும் சிக்கல்களைக் குறைக்க பொறுமை, விழிப்புணர்வு, ஆன்மீக பரிகாரங்கள் அவசியம்."
  },
  te: {
    mandiGulikaTitle: "మాంది & గుళిక విశ్లేషణ",
    mandiGulikaSubtitle: "శని ఛాయా గ్రహాలు: ఆలస్యాలు, ఆటంకాలు మరియు ప్రారబ్ధ కర్మ వివేచన (మాంది & గుళిక)",
    saturnSonsTag: "శని పుత్రులు (ఛాయా గ్రహాలు)",
    houseTypeLabel: "భావ రకం",
    upachayaGrowth: "ఉపచయ వృద్ధి (Upachaya)",
    standardBhava: "సాధారణ భావం (Standard)",
    classicalUpachayaRule: "శాస్త్రీయ నియమం: ఉపచయ స్థానాలలో (3, 6, 10, 11) మాంది, గుళికలు లౌకిక విజయానికి బలమైన సాధనాలుగా మారతాయి.",
    upachayaHeader: "భౌతిక విజయం & కర్మానుభవ సాఫల్యం",
    nonUpachayaHeader: "కర్మ సవాళ్లు & జాగ్రత్తలు",
    karmicNoteLabel: "కర్మ సూచన",
    upachayaNote: "ఈ భావంలోని శక్తులను అధిగమించి, కాలక్రమేణా పట్టుదలతో కూడిన విజయం మరియు సంపదను సాధిస్తారు.",
    nonUpachayaNote: "ఆలస్యాలు మరియు అడ్డంకులను తగ్గించడానికి సంయమనం, క్రమశిక్షణ మరియు పరిహారాలు అవసరం."
  },
  mr: {
    mandiGulikaTitle: "मांदि व गुलिका विश्लेषण",
    mandiGulikaSubtitle: "शनीचे छाया ग्रह: विलंब, अडथळे व संचित कर्म विचार (मांदि व गुलिका)",
    saturnSonsTag: "शनी-पुत्र (छाया ग्रह)",
    houseTypeLabel: "भाव प्रकार",
    upachayaGrowth: "उपाचय वृद्धी (Upachaya)",
    standardBhava: "सामान्य भाव (Standard)",
    classicalUpachayaRule: "शास्त्रीय नियम: उपाचय भावात (3, 6, 10, 11) मांदि व गुलिका भौतिक विजयाचे प्रबळ कारक ठरतात.",
    upachayaHeader: "भौतिक यश व कर्म विजय",
    nonUpachayaHeader: "कर्म आव्हाने व घ्यावयाची काळजी",
    karmicNoteLabel: "कर्म नोंद",
    upachayaNote: "या भावातील ऊर्जांवर मात करून जातक कालांतराने प्रबळ महत्त्वाकांक्षा व सांसारिक लाभ मिळवतो.",
    nonUpachayaNote: "विलंब व अडथळे कमी करण्यासाठी संयम, शिस्त व आध्यात्मिक उपायांची आवश्यकता असते."
  },
  gu: {
    mandiGulikaTitle: "માંદિ અને ગુલિકા વિશ્લેષણ",
    mandiGulikaSubtitle: "શનિના છાયા ગ્રહો: વિલંબ, અવરોધો અને સંચિત કર્મ વિચાર (માંદિ અને ગુલિકા)",
    saturnSonsTag: "શનિ-પુત્ર (છાયા ગ્રહ)",
    houseTypeLabel: "ભાવ પ્રકાર",
    upachayaGrowth: "ઉપચય વૃદ્ધિ (Upachaya)",
    standardBhava: "સામાન્ય ભાવ (Standard)",
    classicalUpachayaRule: "શાસ્ત્રીય નિયમ: ઉપચય ભાવોમાં (3, 6, 10, 11) માંદિ અને ગુલિકા ભૌતિક વિજયના પ્રબળ સાધન બને છે.",
    upachayaHeader: "ભૌતિક સફળતા અને કર્મ વિજય",
    nonUpachayaHeader: "કર્મ પડકારો અને સાવચેતીઓ",
    karmicNoteLabel: "કર્મ નોંધ",
    upachayaNote: "આ ભાવની ઊર્જા પર વિજય મેળવીને જાતક સમય જતાં દ્રઢ મહત્વાકાંક્ષા અને સાંસારિક લાભ પ્રાપ્ત કરે છે.",
    nonUpachayaNote: "વિલંબ અને અવરોધો નિવારવા માટે સંયમ, શિસ્ત અને શાંતિ ઉપાયોની આવશ્યકતા છે."
  },
  bn: {
    mandiGulikaTitle: "মান্দি ও গুলিকা বিশ্লেষণ",
    mandiGulikaSubtitle: "শনির ছায়া গ্রহ: বিলম্ব, বাধা ও সঞ্চিত কর্ম বিচার (মান্দি ও গুলিকা)",
    saturnSonsTag: "শনি-পুত্র (ছায়া গ্রহ)",
    houseTypeLabel: "ভাব প্রকার",
    upachayaGrowth: "উপচয় বৃদ্ধি (Upachaya)",
    standardBhava: "সাধারণ ভাব (Standard)",
    classicalUpachayaRule: "শাস্ত্রীয় নিয়ম: উপচয় ভাবগুলিতে (৩, ৬, ১০, ১১) মান্দি ও গুলিকা পার্থিব বিজয়ের শক্তিশালী চালিকাশক্তি হয়ে ওঠে।",
    upachayaHeader: "পার্থিব সাফল্য ও কর্ম বিজয়",
    nonUpachayaHeader: "কর্ম সংক্রান্ত চ্যালেঞ্জ ও সতর্কতা",
    karmicNoteLabel: "কর্ম মূল্যায়ন",
    upachayaNote: "এই ভাবের বাধা অতিক্রম করে জাতক সময়ের সাথে সাথে দৃঢ় উচ্চাকাঙ্ক্ষা ও জাগতিক সাফল্য অর্জন করে।",
    nonUpachayaNote: "বিলম্ব ও সমস্যা প্রশমনের জন্য ধৈর্য, সচেতনতা ও উপযুক্ত প্রতিকার আবশ্যক।"
  },
  kn: {
    mandiGulikaTitle: "ಮಾಂದಿ ಮತ್ತು ಗುಳಿಕ ವಿಶ್ಲೇಷಣೆ",
    mandiGulikaSubtitle: "ಶನಿಯ ಛಾಯಾ ಗ್ರಹಗಳು: ವಿಳಂಬ, ಅಡೆತಡೆಗಳು ಮತ್ತು ಕರ್ಮ ವಿಚಾರ (ಮಾಂದಿ ಮತ್ತು ಗುಳಿಕ)",
    saturnSonsTag: "ಶನಿ ಪುತ್ರರು (ಛಾಯಾ ಗ್ರಹಗಳು)",
    houseTypeLabel: "ಭಾವ ಪ್ರಕಾರ",
    upachayaGrowth: "ಉಪಚಯ ವೃದ್ಧಿ (Upachaya)",
    standardBhava: "ಸಾಮಾನ್ಯ ಭಾವ (Standard)",
    classicalUpachayaRule: "ಶಾಸ್ತ್ರೀಯ ನಿಯಮ: ಉಪಚಯ ಸ್ಥಾನಗಳಲ್ಲಿ (3, 6, 10, 11) ಮಾಂದಿ ಮತ್ತು ಗುಳಿಕ ಲೌಕಿಕ ವಿಜಯದ ಪ್ರಬಲ ಶಕ್ತಿಗಳಾಗುತ್ತಾರೆ.",
    upachayaHeader: "ಲೌಕಿಕ ಯಶಸ್ಸು ಮತ್ತು ಕರ್ಮ ವಿಜಯ",
    nonUpachayaHeader: "ಕರ್ಮ ಸವಾಲುಗಳು ಮತ್ತು ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು",
    karmicNoteLabel: "ಕರ್ಮ ಟಿಪ್ಪಣಿ",
    upachayaNote: "ಈ ಭಾವದ ಶಕ್ತಿಗಳನ್ನು ಮೆಟ್ಟಿ ನಿಂತು ಕಾಲಕ್ರಮೇಣ ದೃಢ ಪರಿಶ್ರಮದಿಂದ ಭೌತಿಕ ಲಾಭಗಳನ್ನು ಪಡೆಯುತ್ತಾರೆ.",
    nonUpachayaNote: "ವಿಳಂಬ ಮತ್ತು ತೊಡಕುಗಳನ್ನು ಶಮನಗೊಳಿಸಲು ತಾಳ್ಮೆ, ಶಿಸ್ತು ಮತ್ತು ಪರಿಹಾರಗಳು ಅಗತ್ಯ."
  },
  ml: {
    mandiGulikaTitle: "മാന്ദി & ഗുളികൻ വിശകലനം",
    mandiGulikaSubtitle: "ശനിയുടെ ഛായാ ഗ്രഹങ്ങൾ: കാലതാമസം, തടസ്സങ്ങൾ, കർമ്മഫല നിരൂപണം (മാന്ദി & ഗുളികൻ)",
    saturnSonsTag: "ശനി പുത്രന്മാർ (ഛായാ ഗ്രഹം)",
    houseTypeLabel: "ഭാവ തരം",
    upachayaGrowth: "ഉപചയ വളർച്ച (Upachaya)",
    standardBhava: "സാധാരണ ഭാവം (Standard)",
    classicalUpachayaRule: "ശാസ്ത്രീയ നിയമം: ഉപചയ സ്ഥാനങ്ങളിൽ (3, 6, 10, 11) മാന്ദിയും ഗുളികനും ലൗകിക വിജയത്തിന് ശക്തമായ കാരണമാകുന്നു.",
    upachayaHeader: "ഭൗതിക വിജയവും കർമ്മ നേട്ടവും",
    nonUpachayaHeader: "കർമ്മ വെല്ലുവിളികളും മുൻകരുതലുകളും",
    karmicNoteLabel: "കർമ്മ കുറിപ്പ്",
    upachayaNote: "ഈ ഭാവത്തിലെ പ്രതിസന്ധികളെ മറികടന്ന് കാലക്രമേണ ദൃഢനിശ്ചയത്തോടെ ലൗകിക വിജയങ്ങൾ കൈവരിക്കുന്നു.",
    nonUpachayaNote: "കാലതാമസവും തടസ്സങ്ങളും കുറയ്ക്കുന്നതിന് ക്ഷമയും മുൻകരുതലുകളും പ്രാർത്ഥനകളും ആവശ്യമാണ്."
  }
};

// 1. Update seeder array in memory
for (const [lang, keys] of Object.entries(mandiGulikaUIKeys)) {
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
console.log('✅ Updated astroTranslationSeeder.js with Mandi & Gulika UI keys!');

// 3. Update MongoDB directly
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/astro_consult').then(async () => {
  for (const [lang, keys] of Object.entries(mandiGulikaUIKeys)) {
    const updateObj = {};
    for (const [k, v] of Object.entries(keys)) {
      updateObj[`ui.${k}`] = v;
    }
    await AstroTranslation.findOneAndUpdate({ lang }, { $set: updateObj });
  }
  console.log('✅ Successfully updated MongoDB with Mandi & Gulika UI keys for all 8 Indian languages!');
  process.exit(0);
}).catch(err => {
  console.error('❌ MongoDB update failed:', err);
  process.exit(1);
});
