/**
 * Seed Classical Parashari Hora Guidelines into MongoDB
 * for Hindi, Tamil, Telugu, and ensure auto-persistence across Indian languages
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const D2HoraTranslation = require('../models/D2HoraTranslation');

const HINDI_GUIDELINES = [
  {
    id: 1,
    title: "१. चंद्र होरा में नैसर्गिक शुभ ग्रह",
    ruleHindi: "चंद्र होरा में शुभ ग्रह (बृहस्पति, शुक्र, चंद्र)",
    content: "बृहस्पति, शुक्र एवं शुक्ल पक्ष का चंद्रमा जब चंद्र की होरा (कर्क) में स्थित होते हैं, तो वे सहज धन लाभ, निर्बाध नकद प्रवाह, वित्तीय मामलों में मानसिक शांति और प्रचुर स्थायी संपदा प्रदान करते हैं।"
  },
  {
    id: 2,
    title: "२. सूर्य होरा में नैसर्गिक क्रूर ग्रह",
    ruleHindi: "सूर्य होरा में क्रूर ग्रह (सूर्य, मंगल, शनि)",
    content: "सूर्य, मंगल एवं शनि जब सूर्य की होरा (सिंह) में स्थित होते हैं, तो वे दरिद्रता को परास्त करने की अदम्य सहनशक्ति, आक्रामक व्यापारिक सूझबूझ, साहसिक निवेश क्षमता और राजकीय/प्रशासनिक समर्थन प्रदान करते हैं।"
  },
  {
    id: 3,
    title: "३. D1 एवं D2 द्वितीयेश सामंजस्य",
    ruleHindi: "लग्न एवं होरा द्वितीयेश संबंध",
    content: "जब D1 लग्न कुंडली का द्वितीयेश (धन भाव का स्वामी) D2 होरा कुंडली के १, २, ९ अथवा ११वें भाव में बलवान होकर स्थित होता है, तो जातक जीवनपर्यंत अटूट धन योग और अकूत संचित संपत्ति का उपभोग करता है।"
  }
];

const TAMIL_GUIDELINES = [
  {
    id: 1,
    title: "1. சந்திர ஹோরায়ில் இயற்கை சுப கிரகங்கள்",
    ruleHindi: "சந்திர ஹோரை சுபர்கள்",
    content: "குரு, சுக்கிரன் மற்றும் வளர்பிறை சந்திரன் ஆகியவை சந்திரனின் ஹோরায়ில் (கடகம்) அமைந்திருப்பது வசதியான செல்வம், சீரான பணப்புழக்கம், அமைதியான மனநிலை மற்றும் தாராளமான வருவாயைக் குறிக்கிறது."
  },
  {
    id: 2,
    title: "2. சூரிய ஹோরায়ில் இயற்கை அசுப கிரகங்கள்",
    ruleHindi: "சூரிய ஹோரை அசுபர்கள்",
    content: "சூரியன், செவ்வாய் மற்றும் சனி ஆகியவை சூரியனின் ஹோরায়ில் (சிம்மம்) அமைந்திருப்பது தடைகளைத் தகர்த்து வெல்லும் மன உறுதி, துணிச்சலான முதலீடு, வணிக சாமர்த்தியம் மற்றும் அரசாங்க ஆதரவை அளிக்கும்."
  },
  {
    id: 3,
    title: "3. D1 மற்றும் D2 இரண்டாம் அதிபதி பொருத்தம்",
    ruleHindi: "லக்ன மற்றும் ஹோரா 2-ம் அதிபதி யோகம்",
    content: "D1 ராசி சக்கரத்தின் 2-ம் அதிபதி D2 ஹோரா சக்கரத்தின் 1, 2, 9 அல்லது 11-ம் வீடுகளில் சுப பலத்துடன் அமையும் போது, ஜாதகருக்கு வாழ்நாள் முழுவதும் அழியாத தன யோகமும் நிரந்தர சேமிப்பும் கிட்டும்."
  }
];

const TELUGU_GUIDELINES = [
  {
    id: 1,
    title: "1. చంద్ర హోరాలో నైసర్గిక శుభ గ్రహాలు",
    ruleHindi: "చంద్ర హోరాలో శుభులు",
    content: "గురువు, శుక్రుడు మరియు శుక్లపక్ష చంద్రుడు చంద్రుని హోరాలో (కర్కాటకం) ఉన్నప్పుడు సుఖవంతమైన సంపద, నిరంతర నగదు ప్రవాహం, ఆర్థిక మానసిక ప్రశాంతత మరియు విశేష ఆదాయాన్ని ప్రసాదిస్తారు."
  },
  {
    id: 2,
    title: "2. సూర్య హోరాలో నైసర్గిక పాప గ్రహాలు",
    ruleHindi: "సూర్య హోరాలో పాపులు",
    content: "సూర్యుడు, కుజుడు మరియు శని సూర్యుని హోరాలో (సింహం) ఉన్నప్పుడు కష్టాలను జయించే అపారమైన మనోధైర్యం, వ్యాపార దక్షత, సాహసోపేత పెట్టుబడులు మరియు ప్రభుత్వ మద్దతు లభిస్తాయి."
  },
  {
    id: 3,
    title: "3. D1 & D2 ద్వితీయాధిపతి సమన్వయం",
    ruleHindi: "రాశి & హోరా 2వ అధిపతి సంబంధం",
    content: "D1 రాశి చక్రంలోని 2వ అధిపతి D2 హోరా చక్రంలోని 1, 2, 9 లేదా 11వ భావాలలో బలంగా స్థిరపడినప్పుడు, జాతకుడు జీవితాంతం స్థిరమైన ధన యోగాన్ని మరియు శాశ్వత పొదుపును అనుభవిస్తాడు."
  }
];

async function seedGuidelines() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) return;

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected.');

    // Update Hindi
    console.log('Saving Hindi Guidelines to MongoDB...');
    await D2HoraTranslation.findOneAndUpdate(
      { lang: 'hi' },
      {
        $set: {
          guidelines: HINDI_GUIDELINES,
          'ui.guidelinesTitle': 'शास्त्रीय पाराशरी होरा नियम (बृहत्पाराशर होरा शास्त्र)',
          'ui.guidelinesSubtitle': 'वित्तीय समृद्धि, पूंजी संचय एवं धन सुरक्षा के मूलभूत वैदिक सिद्धांत',
          'ui.rulesBadge': 'वैदिक नियम'
        }
      },
      { upsert: true, new: true }
    );

    // Update Tamil
    console.log('Saving Tamil Guidelines to MongoDB...');
    await D2HoraTranslation.findOneAndUpdate(
      { lang: 'ta' },
      {
        $set: {
          guidelines: TAMIL_GUIDELINES,
          'ui.guidelinesTitle': 'பாரம்பரிய பராசர ஹோரா விதிகள் (பிருஹத் பராசர ஹோரா சாஸ்திரம்)',
          'ui.guidelinesSubtitle': 'தன யோகம், செல்வப் பாதுகாப்பு மற்றும் வருவாய் பெருக்கத்திற்கான வேத தத்துவங்கள்',
          'ui.rulesBadge': 'வேத விதிகள்'
        }
      },
      { upsert: true, new: true }
    );

    // Update Telugu
    console.log('Saving Telugu Guidelines to MongoDB...');
    await D2HoraTranslation.findOneAndUpdate(
      { lang: 'te' },
      {
        $set: {
          guidelines: TELUGU_GUIDELINES,
          'ui.guidelinesTitle': 'ప్రాచీన పరాశర హోరా నియమాలు (బృహత్పరాశర హోరా శాస్త్రం)',
          'ui.guidelinesSubtitle': 'ఆర్థిక సమృద్ధి, సంపద భద్రత మరియు శాశ్వత నిల్వల ప్రాథమిక వేద సూత్రాలు',
          'ui.rulesBadge': 'వేద నియమాలు'
        }
      },
      { upsert: true, new: true }
    );

    console.log('✅ Classical Parashari Hora Guidelines seeded into MongoDB successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding guidelines:', err);
    process.exit(1);
  }
}

seedGuidelines();
