const fs = require('fs');
const mongoose = require('mongoose');

const drishtiKeys = {
  ta: {
    drishtiTitle: 'கிரக மற்றும் ராசி திருஷ்டி (Planetary Aspects)',
    drishtiSubtitle: 'கர்ம மற்றும் ஆதிக்கப் பார்வை (Sight of Influence & Karma)',
    grahaDrishtiTab: 'கிரக திருஷ்டி (Planetary)',
    jaiminiDrishtiTab: 'ஜெயமினி ராசி திருஷ்டி (Sign)',
    occupiedHouse: 'நின்ற பாவகம்',
    aspectLabel: 'பார்வை',
    aspectHouse: 'பார்க்கும் பாவகம்',
    occupyingPlanets: 'நின்ற கிரகங்கள்',
    drishtiQuality: 'திருஷ்டி பலன்',
    interpretation: 'ஜோதிடப் பலன் / விளக்கம்',
    thAspect: 'ஆம் பார்வை',
    emptyHouse: 'வெற்று பாவகம்',
    houseAndSign: 'பாவகம் & ராசி',
    signNature: 'ராசி குணம்',
    aspectedSignsHouses: 'பார்க்கப்படும் ராசிகள் & பாவகங்கள்',
    positiveBenefic: '🟢 சுப பார்வை (Benefic)',
    challengingMalefic: '🔴 அசுப / சவால் பார்வை (Malefic)',
    mixedBenefic: '🟡 கலப்பு சுபம்',
    highlyPositive: '🟢 மிகச் சிறந்த சுபம் (நட்பு பார்வை)',
    weakenedBenefic: '🟡 குறைந்த சுபம் (பகை பார்வை)',
    softenedMalefic: '🟡 தணிந்த அசுபம் (நட்பு பாவகம்)',
    highlyChallenging: '🔴 மிகக் கடுமையான அசுபம் (பகை பாவகம்)',
    friendly: 'நட்பு (Friendly)',
    inimical: 'பகை (Inimical)',
    neutral: 'சமம் (Neutral)',
    friendStatus: 'நட்பு',
    enemyStatus: 'பகை',
    neutralStatus: 'சமம்'
  },
  te: {
    drishtiTitle: 'గ్రహ మరియు రాశి దృష్టి (Planetary Aspects)',
    drishtiSubtitle: 'కర్మ మరియు ప్రభావ దృష్టి (Sight of Influence & Karma)',
    grahaDrishtiTab: 'గ్రహ దృష్టి (Planetary)',
    jaiminiDrishtiTab: 'జైమిని రాశి దృష్టి (Sign)',
    occupiedHouse: 'ఉన్న భావం',
    aspectLabel: 'దృష్టి',
    aspectHouse: 'దృష్టి పడే భావం',
    occupyingPlanets: 'ఉన్న గ్రహాలు',
    drishtiQuality: 'దృష్టి ఫలితం',
    interpretation: 'జ్యోతిష్య ఫలితం / విశ్లేషణ',
    thAspect: 'వ దృష్టి',
    emptyHouse: 'శూన్య భావం',
    houseAndSign: 'భావం & రాశి',
    signNature: 'రాశి స్వభావం',
    aspectedSignsHouses: 'దృష్టి పడే రాశులు & భావాలు',
    positiveBenefic: '🟢 శుభ దృష్టి (Benefic)',
    challengingMalefic: '🔴 పాప / కష్ట దృష్టి (Malefic)',
    mixedBenefic: '🟡 మిశ్రమ శుభం',
    highlyPositive: '🟢 అత్యంత శుభం (మిత్ర దృష్టి)',
    weakenedBenefic: '🟡 బలహీన శుభం (శత్రు దృష్టి)',
    softenedMalefic: '🟡 నెమ్మదించిన పాప దృష్టి (మిత్ర భావం)',
    highlyChallenging: '🔴 అత్యంత తీవ్ర పాప దృష్టి (శత్రు భావం)',
    friendly: 'మిత్ర (Friendly)',
    inimical: 'శత్రు (Inimical)',
    neutral: 'సమ (Neutral)',
    friendStatus: 'మిత్ర',
    enemyStatus: 'శత్రు',
    neutralStatus: 'సమ'
  },
  mr: {
    drishtiTitle: 'ग्रह व राशी दृष्टी (Planetary Aspects)',
    drishtiSubtitle: 'कर्म व प्रभाव दृष्टी (Sight of Influence & Karma)',
    grahaDrishtiTab: 'ग्रह दृष्टी (Planetary)',
    jaiminiDrishtiTab: 'जैमिनी राशी दृष्टी (Sign)',
    occupiedHouse: 'स्थित भाव',
    aspectLabel: 'दृष्टी',
    aspectHouse: 'दृष्ट भाव',
    occupyingPlanets: 'स्थित ग्रह',
    drishtiQuality: 'दृष्टी प्रभाव',
    interpretation: 'ज्योतिषीय फल / विवेचन',
    thAspect: 'वी दृष्टी',
    emptyHouse: 'रिक्त भाव',
    houseAndSign: 'भाव व राशी',
    signNature: 'राशी स्वभाव',
    aspectedSignsHouses: 'दृष्ट राशी व भाव',
    positiveBenefic: '🟢 शुभ (Benefic)',
    challengingMalefic: '🔴 क्रूर / कष्टप्रद (Malefic)',
    mixedBenefic: '🟡 मिश्र शुभ',
    highlyPositive: '🟢 परम शुभ (मित्र दृष्टी)',
    weakenedBenefic: '🟡 मध्यम शुभ (शत्रू दृष्टी)',
    softenedMalefic: '🟡 सौम्य क्रूर (मित्र भाव)',
    highlyChallenging: '🔴 अत्यंत प्रतिकूल (शत्रू भाव)',
    friendly: 'मित्र (Friendly)',
    inimical: 'शत्रू (Inimical)',
    neutral: 'सम (Neutral)',
    friendStatus: 'मित्र',
    enemyStatus: 'शत्रू',
    neutralStatus: 'सम'
  },
  gu: {
    drishtiTitle: 'ગ્રહ અને રાશિ દ્રષ્ટિ (Planetary Aspects)',
    drishtiSubtitle: 'કર્મ અને પ્રભાવની દ્રષ્ટિ (Sight of Influence & Karma)',
    grahaDrishtiTab: 'ગ્રહ દ્રષ્ટિ (Planetary)',
    jaiminiDrishtiTab: 'જૈમિની રાશિ દ્રષ્ટિ (Sign)',
    occupiedHouse: 'સ્થિત ભાવ',
    aspectLabel: 'દ્રષ્ટિ',
    aspectHouse: 'દ્રષ્ટ ભાવ',
    occupyingPlanets: 'સ્થિત ગ્રહો',
    drishtiQuality: 'દ્રષ્ટિ પ્રભાવ',
    interpretation: 'જ્યોતિષીય ફળ / વિશ્લેષણ',
    thAspect: 'મી દ્રષ્ટિ',
    emptyHouse: 'ખાલી ભાવ',
    houseAndSign: 'ભાવ અને રાશિ',
    signNature: 'રાશિ સ્વભાવ',
    aspectedSignsHouses: 'દ્રષ્ટ રાશિઓ અને ભાવો',
    positiveBenefic: '🟢 શુભ (Benefic)',
    challengingMalefic: '🔴 ક્રૂર / કષ્ટપ્રદ (Malefic)',
    mixedBenefic: '🟡 મિશ્ર શુભ',
    highlyPositive: '🟢 પરમ શુભ (મિત્ર દ્રષ્ટિ)',
    weakenedBenefic: '🟡 મધ્યમ શુભ (શત્રુ દ્રષ્ટિ)',
    softenedMalefic: '🟡 સૌમ્ય ક્રૂર (મિત્ર ભાવ)',
    highlyChallenging: '🔴 અત્યંત પ્રતિકૂળ (શત્રુ ભાવ)',
    friendly: 'મિત્ર (Friendly)',
    inimical: 'શત્રુ (Inimical)',
    neutral: 'સમ (Neutral)',
    friendStatus: 'મિત્ર',
    enemyStatus: 'શત્રુ',
    neutralStatus: 'સમ'
  },
  bn: {
    drishtiTitle: 'গ্রহ ও রাশি দৃষ্টি (Planetary Aspects)',
    drishtiSubtitle: 'কর্ম ও প্রভাব দৃষ্টি (Sight of Influence & Karma)',
    grahaDrishtiTab: 'গ্রহ দৃষ্টি (Planetary)',
    jaiminiDrishtiTab: 'জৈমিনী রাশি দৃষ্টি (Sign)',
    occupiedHouse: 'অবস্থিত ভাব',
    aspectLabel: 'দৃষ্টি',
    aspectHouse: 'দৃষ্ট ভাব',
    occupyingPlanets: 'অবস্থিত গ্রহ',
    drishtiQuality: 'দৃষ্টি প্রভাব',
    interpretation: 'জ্যোতিষীয় ফলাফল / ব্যাখ্যা',
    thAspect: 'ম দৃষ্টি',
    emptyHouse: 'শূন্য ভাব',
    houseAndSign: 'ভাব ও রাশি',
    signNature: 'রাশি স্বভাব',
    aspectedSignsHouses: 'দৃষ্ট রাশি ও ভাবসমূহ',
    positiveBenefic: '🟢 শুভ (Benefic)',
    challengingMalefic: '🔴 অশুভ / কষ্টদায়ক (Malefic)',
    mixedBenefic: '🟡 মিশ্র শুভ',
    highlyPositive: '🟢 পরম শুভ (মিত্র দৃষ্টি)',
    weakenedBenefic: '🟡 দুর্বল শুভ (শত্রু দৃষ্টি)',
    softenedMalefic: '🟡 কোমল অশুভ (মিত্র ভাব)',
    highlyChallenging: '🔴 অত্যন্ত প্রতিকূল (শত্রু ভাব)',
    friendly: 'মিত্র (Friendly)',
    inimical: 'শত্রু (Inimical)',
    neutral: 'সম (Neutral)',
    friendStatus: 'মিত্র',
    enemyStatus: 'শত্রু',
    neutralStatus: 'সম'
  },
  kn: {
    drishtiTitle: 'ಗ್ರಹ ಮತ್ತು ರಾಶಿ ದೃಷ್ಟಿ (Planetary Aspects)',
    drishtiSubtitle: 'ಕರ್ಮ ಮತ್ತು ಪ್ರಭಾವ ದೃಷ್ಟಿ (Sight of Influence & Karma)',
    grahaDrishtiTab: 'ಗ್ರಹ ದೃಷ್ಟಿ (Planetary)',
    jaiminiDrishtiTab: 'ಜೈಮಿನಿ ರಾಶಿ ದೃಷ್ಟಿ (Sign)',
    occupiedHouse: 'ಇರುವ ಭಾವ',
    aspectLabel: 'ದೃಷ್ಟಿ',
    aspectHouse: 'ದೃಷ್ಟಿ ಬೀಳುವ ಭಾವ',
    occupyingPlanets: 'ಇರುವ ಗ್ರಹಗಳು',
    drishtiQuality: 'ದೃಷ್ಟಿ ಪ್ರಭಾವ',
    interpretation: 'ಜ್ಯೋತಿಷ್ಯ ಫಲ / ವಿವರಣೆ',
    thAspect: 'ನೇ ದೃಷ್ಟಿ',
    emptyHouse: 'ಖಾಲಿ ಭಾವ',
    houseAndSign: 'ಭಾವ ಮತ್ತು ರಾಶಿ',
    signNature: 'ರಾಶಿ ಸ್ವಭಾವ',
    aspectedSignsHouses: 'ದೃಷ್ಟಿ ಬೀಳುವ ರಾಶಿ ಮತ್ತು ಭಾವಗಳು',
    positiveBenefic: '🟢 ಶುಭ ದೃಷ್ಟಿ (Benefic)',
    challengingMalefic: '🔴 ಪಾಪ / ಕಷ್ಟದಾಯಕ ದೃಷ್ಟಿ (Malefic)',
    mixedBenefic: '🟡 ಮಿಶ್ರ ಶುಭ',
    highlyPositive: '🟢 ಪರಮ ಶುಭ (ಮಿತ್ರ ದೃಷ್ಟಿ)',
    weakenedBenefic: '🟡 ಸಾಧಾರಣ ಶುಭ (ಶತ್ರು ದೃಷ್ಟಿ)',
    softenedMalefic: '🟡 ಸೌಮ್ಯ ಪಾಪ (ಮಿತ್ರ ಭಾವ)',
    highlyChallenging: '🔴 ಅತ್ಯಂತ ಪ್ರತಿಕೂಲ (ಶತ್ರು ಭಾವ)',
    friendly: 'ಮಿತ್ರ (Friendly)',
    inimical: 'ಶತ್ರು (Inimical)',
    neutral: 'ಸಮ (Neutral)',
    friendStatus: 'ಮಿತ್ರ',
    enemyStatus: 'ಶತ್ರು',
    neutralStatus: 'ಸಮ'
  },
  ml: {
    drishtiTitle: 'ഗ്രഹ രാശി ദൃഷ്ടി (Planetary Aspects)',
    drishtiSubtitle: 'കർമ്മ സ്വാധീന ദൃഷ്ടി (Sight of Influence & Karma)',
    grahaDrishtiTab: 'ഗ്രഹ ദൃഷ്ടി (Planetary)',
    jaiminiDrishtiTab: 'ജൈമിനി രാശി ദൃഷ്ടി (Sign)',
    occupiedHouse: 'സ്ഥിതിചെയ്യുന്ന ഭാവം',
    aspectLabel: 'ദൃഷ്ടി',
    aspectHouse: 'ദൃഷ്ടി പതിക്കുന്ന ഭാവം',
    occupyingPlanets: 'സ്ഥിതിചെയ്യുന്ന ഗ്രഹങ്ങൾ',
    drishtiQuality: 'ദൃഷ്ടി ഫലം',
    interpretation: 'ജ്യോതിഷ ഫലം / വിവരണം',
    thAspect: '-ാം ദൃഷ്ടി',
    emptyHouse: 'ശൂന്യ ഭാവം',
    houseAndSign: 'ഭാവവും രാശിയും',
    signNature: 'രാശി സ്വഭാവം',
    aspectedSignsHouses: 'ദൃഷ്ടി പതിക്കുന്ന രാശികളും ഭാവങ്ങളും',
    positiveBenefic: '🟢 ശുഭ ദൃഷ്ടി (Benefic)',
    challengingMalefic: '🔴 പാപ / പ്രതികൂല ദൃഷ്ടി (Malefic)',
    mixedBenefic: '🟡 മിശ്ര ശുഭം',
    highlyPositive: '🟢 അതി ശുഭം (മിത്ര ദൃഷ്ടി)',
    weakenedBenefic: '🟡 കുറഞ്ഞ ശുഭം (ശത്രു ദൃഷ്ടി)',
    softenedMalefic: '🟡 ലഘു പാപം (മിത്ര ഭാവം)',
    highlyChallenging: '🔴 അതി തീവ്ര പ്രതികൂലം (ശത്രു ഭാവം)',
    friendly: 'മിത്ര (Friendly)',
    inimical: 'ശത്രു (Inimical)',
    neutral: 'സമ (Neutral)',
    friendStatus: 'മിത്ര',
    enemyStatus: 'ശത്രു',
    neutralStatus: 'സമ'
  }
};

const seeder = require('../services/astroTranslationSeeder');
for (const [lang, keys] of Object.entries(drishtiKeys)) {
  const item = seeder.defaultTranslations.find(t => t.lang === lang);
  if (item && item.ui) {
    Object.assign(item.ui, keys);
  }
}

const fileText = `const mongoose = require("mongoose");
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

fs.writeFileSync(require('path').join(__dirname, '../services/astroTranslationSeeder.js'), fileText, 'utf8');
console.log('Successfully wrote astroTranslationSeeder.js with all 8 Indian languages!');
