/**
 * Seed D2 Planetary Hora Interpretations into MongoDB across all requested Indian languages:
 * Tamil (ta), Telugu (te), Bengali (bn), Gujarati (gu), Marathi (mr), Malayalam (ml), Punjabi (pa)
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const D2HoraTranslation = require('../models/D2HoraTranslation');

const { TAMIL_PLANETS, TELUGU_PLANETS } = require('./d2PlanetsTamilTelugu');
const { BENGALI_PLANETS, GUJARATI_PLANETS, MARATHI_PLANETS } = require('./d2PlanetsBengaliGujaratiMarathi');
const { MALAYALAM_PLANETS, PUNJABI_PLANETS } = require('./d2PlanetsMalayalamPunjabi');

const PLANETS_BY_LANG = {
  ta: {
    langName: 'Tamil',
    planets: TAMIL_PLANETS,
    ui: {
      sectionTitle: "D2 கிரக-ஹோரா பலன்கள் (D2 Planetary Hora Interpretations)",
      sectionSubtitle: "சூரியனின் சூரிய ஹோரை (சிம்மம்) அல்லது சந்திரனின் சௌமிய ஹோரை (கடகம்) ஆகியவற்றில் அமர்ந்த கிரகங்களின் சாஸ்திர பலன்கள்",
      wealthChannels: "முக்கிய செல்வ ஆதாரங்கள் & திறன்கள்:",
      cautionDisciplines: "நிதி ஒழுக்கம் & எச்சரிக்கைகள்:",
      activePlanetsCount: "செயலில் உள்ள கிரகங்கள்"
    }
  },
  te: {
    langName: 'Telugu',
    planets: TELUGU_PLANETS,
    ui: {
      sectionTitle: "D2 గ్రహ-హోరా ఫలిత విశ్లేషణ (D2 Planetary Hora Interpretations)",
      sectionSubtitle: "సూర్యుని సౌర హోరా (సింహం) లేదా చంద్రుని సౌమ్య హోరా (కర్కాటకం)లో ఉన్న గ్రహాల శాస్త్రీయ ఫలితాలు",
      wealthChannels: "ప్రధాన ధన మార్గాలు & సామర్థ్యాలు:",
      cautionDisciplines: "ఆర్థిక క్రమశిక్షణ & జాగ్రత్తలు:",
      activePlanetsCount: "సక్రియ గ్రహాలు"
    }
  },
  bn: {
    langName: 'Bengali',
    planets: BENGALI_PLANETS,
    ui: {
      sectionTitle: "D2 গ্রহ-হোরা ফল বিশ্লেষণ (D2 Planetary Hora Interpretations)",
      sectionSubtitle: "সূর্যের সৌর হোরা (সিংহ) অথবা চন্দ্রের সৌম্য হোরায় (কর্কট) অবস্থিত গ্রহসমূহের শাস্ত্রীয় ফলাফল",
      wealthChannels: "প্রধান ধন প্রাপ্তির উৎস ও সামর্থ্য:",
      cautionDisciplines: "আর্থিক শৃঙ্খলা ও সতর্কবার্তা:",
      activePlanetsCount: "সক্রিয় গ্রহ প্রভাব"
    }
  },
  gu: {
    langName: 'Gujarati',
    planets: GUJARATI_PLANETS,
    ui: {
      sectionTitle: "D2 ગ્રહ-હોરા ફળ વિશ્લેષણ (D2 Planetary Hora Interpretations)",
      sectionSubtitle: "સૂર્યની સૌર હોરા (સિંહ) અથવા ચંદ્રની સૌમ્ય હોરા (કર્ક) માં સ્થિત ગ્રહોનું શાસ્ત્રીય ફળાદેશ",
      wealthChannels: "મુખ્ય ધન સ્ત્રોત અને ક્ષમતાઓ:",
      cautionDisciplines: "નાણાકીય શિસ્ત અને સાવચેતીઓ:",
      activePlanetsCount: "સક્રિય ગ્રહ પ્રભાવ"
    }
  },
  mr: {
    langName: 'Marathi',
    planets: MARATHI_PLANETS,
    ui: {
      sectionTitle: "D2 ग्रह-होरा फळ विश्लेषण (D2 Planetary Hora Interpretations)",
      sectionSubtitle: "सूर्याच्या सौर होरात (सिंह) किंवा चंद्राच्या सौम्य होरात (कर्क) स्थित ग्रहांचे शास्त्रीय फलादेश",
      wealthChannels: "प्रमुख धन स्रोत व क्षमता:",
      cautionDisciplines: "आर्थिक शिस्त व खबरदारी:",
      activePlanetsCount: "सक्रिय ग्रह प्रभाव"
    }
  },
  ml: {
    langName: 'Malayalam',
    planets: MALAYALAM_PLANETS,
    ui: {
      sectionTitle: "D2 ഗ്രഹ-ഹോരാ ഫല വിശകലനം (D2 Planetary Hora Interpretations)",
      sectionSubtitle: "സൂര്യന്റെ സൗര ഹോരയിലോ (ചിങ്ങം) ചന്ദ്രന്റെ സൗമ്യ ഹോരയിലോ (കർക്കിടകം) സ്ഥിതി ചെയ്യുന്ന ഗ്രഹങ്ങളുടെ ശാസ്ത്രീയ ഫലം",
      wealthChannels: "പ്രധാന ധന സ്രോതസ്സുകളും ശേഷികളും:",
      cautionDisciplines: "സാമ്പത്തിക അച്ചടക്കവും ജാഗ്രതകളും:",
      activePlanetsCount: "സജീവ ഗ്രഹങ്ങൾ"
    }
  },
  pa: {
    langName: 'Punjabi',
    planets: PUNJABI_PLANETS,
    ui: {
      sectionTitle: "D2 ਗ੍ਰਹਿ-ਹੋਰਾ ਫਲ ਵਿਸ਼ਲੇਸ਼ਣ (D2 Planetary Hora Interpretations)",
      sectionSubtitle: "ਸੂਰਜ ਦੀ ਸੂਰਜੀ ਹੋਰਾ (ਸਿੰਘ) ਜਾਂ ਚੰਦਰਮਾ ਦੀ ਸੌਮਯ ਹੋਰਾ (ਕਰਕ) ਵਿੱਚ ਸਥਿਤ ਗ੍ਰਹਿਆਂ ਦੇ ਸ਼ਾਸਤਰੀ ਫਲ",
      wealthChannels: "ਮੁੱਖ ਧਨ ਸਰੋਤ ਅਤੇ ਸਮਰੱਥਾਵਾਂ:",
      cautionDisciplines: "ਵਿੱਤੀ ਅਨੁਸ਼ਾਸਨ ਅਤੇ ਸਾਵਧਾਨੀਆਂ:",
      activePlanetsCount: "ਸਰਗਰਮ ਗ੍ਰਹਿ"
    }
  }
};

async function seedPlanetaryTranslations() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI not found');
      return;
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB successfully.');

    for (const [langCode, item] of Object.entries(PLANETS_BY_LANG)) {
      console.log(`Updating D2 Hora Planetary Interpretations in MongoDB for [${langCode}] - ${item.langName}...`);
      await D2HoraTranslation.findOneAndUpdate(
        { lang: langCode },
        {
          $set: {
            lang: langCode,
            langName: item.langName,
            planets: item.planets,
            'ui.sectionTitle': item.ui.sectionTitle,
            'ui.sectionSubtitle': item.ui.sectionSubtitle,
            'ui.wealthChannels': item.ui.wealthChannels,
            'ui.cautionDisciplines': item.ui.cautionDisciplines,
            'ui.activePlanetsCount': item.ui.activePlanetsCount
          }
        },
        { upsert: true, new: true }
      );
      console.log(`✅ Saved ${item.langName} (${langCode})`);
    }

    console.log('🎉 Successfully saved D2 Planetary Hora Interpretations for all requested Indian languages!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding planetary translations:', err);
    process.exit(1);
  }
}

seedPlanetaryTranslations();
