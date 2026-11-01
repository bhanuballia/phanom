/**
 * Comprehensive generator & database seeder for D9 Navamsha Interpretations in all Indian languages:
 * Hindi (hi), Tamil (ta), Telugu (te), Kannada (kn), Gujarati (gu),
 * Marathi (mr), Bengali (bn), Malayalam (ml), Punjabi (pa), Sanskrit (sa).
 */
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const D9NavamshaTranslation = require('../models/D9NavamshaTranslation');
const { D9_INTERPRETATIONS } = require('../../frontend1/src/data/d9HouseInterpretations');

// Classical Indian language UI titles and metadata for Navamsha D9
const D9_LANG_METADATA = {
  hi: {
    langName: "Hindi",
    ui: {
      sectionTitle: "नवांश कुंडली विश्लेषण (D9 - विवाह, जीवनसाथी व आत्मिक भाग्य)",
      sectionSubtitle: "नवांश कुंडली के प्रत्येक भाव में स्थित सभी 9 ग्रहों का वैवाहिक जीवन, स्वभाव एवं आत्मा की क्षमता का सूक्ष्म फलादेश",
      houseBadge: "भाव",
      deityLabel: "नवांश प्रकृति",
      partLabel: "नवांश भाग",
      impactLabel: "D9 वैवाहिक फल"
    }
  },
  ta: {
    langName: "Tamil",
    ui: {
      sectionTitle: "நவாம்ச பலன்கள் (D9 - திருமணம், வாழ்க்கைத் துணை & ஆன்ம விதி)",
      sectionSubtitle: "டி9 நவாம்ச கட்டத்தில் உள்ள 9 கிரகங்களின் மூலமான திருமண வாழ்க்கை, துணைவரின் குணம் மற்றும் ஆன்ம ஆற்றல் பகுப்பாய்வு",
      houseBadge: "பாவம்",
      deityLabel: "நவாம்ச தெய்வம்",
      partLabel: "நவாம்ச பகுதி",
      impactLabel: "D9 திருமண பலன்"
    }
  },
  te: {
    langName: "Telugu",
    ui: {
      sectionTitle: "నవాంశ విశ్లేషణ (D9 - వివాహం, భాగస్వామి & ఆత్మ విధి)",
      sectionSubtitle: "నవాంశ చక్రంలోని ప్రతి భావంలో 9 గ్రహాల స్థితి ఆధారంగా వైవాహిక జీవితం, భాగస్వామి స్వభావం మరియు ఆత్మ శక్తి విశ్లేషణ",
      houseBadge: "భావం",
      deityLabel: "నవాంశ దేవత",
      partLabel: "నవాంశ భాగం",
      impactLabel: "D9 వైవాహిక ఫలితం"
    }
  },
  kn: {
    langName: "Kannada",
    ui: {
      sectionTitle: "ನವಾಂಶ ಕುಂಡಲಿ ವಿಶ್ಲೇಷಣೆ (D9 - ವಿವಾಹ, ಸಂಗಾತಿ ಮತ್ತು ಆತ್ಮ ಭಾಗ್ಯ)",
      sectionSubtitle: "ನವಾಂಶ ಚಾರ್ಟ್‌ನ ಪ್ರತಿಯೊಂದು ಭಾವದಲ್ಲಿರುವ 9 ಗ್ರಹಗಳ ಸ್ಥಾನದಿಂದ ವೈವಾಹಿಕ ಜೀವನ, ಸಂಗಾತಿಯ ಗುಣ ಮತ್ತು ಆತ್ಮ ಶಕ್ತಿಯ ಸೂಕ್ಷ್ಮ ಫಲಿತಾಂಶ",
      houseBadge: "ಭಾವ",
      deityLabel: "ನವಾಂಶ ದೇವತೆ",
      partLabel: "ನವಾಂಶ ಭಾಗ",
      impactLabel: "D9 ವೈವಾಹಿಕ ಫಲ"
    }
  },
  gu: {
    langName: "Gujarati",
    ui: {
      sectionTitle: "નવાંશ કુંડળી વિશ્લેષણ (D9 - લગ્નજીવન, જીવનસાથી અને આત્મિક ઉન્નતિ)",
      sectionSubtitle: "નવાંશ કુંડળીના દરેક ભાવમાં રહેલા 9 ગ્રહોનું લગ્નસુખ, જીવનસાથીનો સ્વભાવ અને આત્માની વાસ્તવિક ક્ષમતાનું સૂક્ષ્મ ફળકથન",
      houseBadge: "ભાવ",
      deityLabel: "નવાંશ પ્રકૃતિ",
      partLabel: "નવાંશ ભાગ",
      impactLabel: "D9 લગ્ન પ્રભાવ"
    }
  },
  mr: {
    langName: "Marathi",
    ui: {
      sectionTitle: "नवांश कुंडली विश्लेषण (D9 - विवाह, जोडीदार व आत्मिक भाग्य)",
      sectionSubtitle: "नवांश कुंडलीतील प्रत्येक भावातील 9 ग्रहांच्या स्थितीवरून वैवाहिक जीवन, जोडीदाराचा स्वभाव व आत्मिक क्षमतेचे सखोल मार्गदर्शन",
      houseBadge: "भाव",
      deityLabel: "नवांश प्रकृती",
      partLabel: "नवांश भाग",
      impactLabel: "D9 वैवाहिक फळ"
    }
  },
  bn: {
    langName: "Bengali",
    ui: {
      sectionTitle: "নবাংশ কুন্ডলী বিশ্লেষণ (D9 - বিবাহ, জীবনসঙ্গী ও আত্মিক পরিণতি)",
      sectionSubtitle: "নবাংশ চার্টের প্রতিটি ভাবে অবস্থানরত ৯টি গ্রহের মাধ্যমে দাম্পত্য জীবন, জীবনসঙ্গীর প্রকৃতি ও আত্মিক শক্তির গভীর বিশ্লেষণ",
      houseBadge: "ভাব",
      deityLabel: "নবাংশ দেবতা",
      partLabel: "নবাংশ অংশ",
      impactLabel: "D9 দাম্পত্য প্রভাব"
    }
  },
  ml: {
    langName: "Malayalam",
    ui: {
      sectionTitle: "നവാംശ വിശകലനം (D9 - വിവാഹം, പങ്കാളി, ആത്മാവിന്റെ യഥാർത്ഥ വിധി)",
      sectionSubtitle: "നവാംശ ചാർട്ടിലെ ഭാവങ്ങളിൽ സ്ഥിതിചെയ്യുന്ന 9 ഗ്രഹങ്ങളിലൂടെയുള്ള ദാമ്പത്യ ജീവിതം, പങ്കാളിയുടെ സ്വഭావം, ആത്മീയ ശക്തി എന്നിവയുടെ വിശകലനം",
      houseBadge: "ഭാവം",
      deityLabel: "നവാംശ ദേവത",
      partLabel: "നവാംശ ഭാഗം",
      impactLabel: "D9 വിവാഹ ഫലം"
    }
  },
  pa: {
    langName: "Punjabi",
    ui: {
      sectionTitle: "ਨਵਾਂਸ਼ ਕੁੰਡਲੀ ਵਿਸ਼ਲੇਸ਼ਣ (D9 - ਵਿਆਹ, ਜੀਵਨ ਸਾਥੀ ਅਤੇ ਆਤਮਿਕ ਭਾਗ)",
      sectionSubtitle: "ਨਵਾਂਸ਼ ਕੁੰਡਲੀ ਦੇ ਹਰੇਕ ਘਰ ਵਿੱਚ 9 ਗ੍ਰਹਿਆਂ ਦੀ ਸਥਿਤੀ ਅਨੁਸਾਰ ਵਿਆਹੁਤਾ ਜੀਵਨ, ਜੀਵਨ ਸਾਥੀ ਦਾ ਸੁਭਾਅ ਅਤੇ ਆਤਮਿਕ ਤਾਕਤ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ",
      houseBadge: "ਭਾਵ",
      deityLabel: "ਨਵਾਂਸ਼ ਦੇਵਤਾ",
      partLabel: "ਨਵਾਂਸ਼ ਭਾਗ",
      impactLabel: "D9 ਵਿਆਹ ਪ੍ਰਭਾਵ"
    }
  },
  sa: {
    langName: "Sanskrit",
    ui: {
      sectionTitle: "नवांश चक्र विश्लेषणम् (D9 - विवाहः, जीवनसहचरी तथा आत्मिकसामर्थ्यम्)",
      sectionSubtitle: "नवांशचक्रे द्वादशभावेषु नवग्रहाणां स्थित्या वैवाहिकजीवनस्य, सहचरीस्वभावस्य तथा आत्मनः सूक्ष्मफलकथनम्",
      houseBadge: "भावः",
      deityLabel: "नवांशप्रकृतिः",
      partLabel: "नवांशभागः",
      impactLabel: "D9 वैवाहिकफलम्"
    }
  }
};

module.exports = { D9_LANG_METADATA };

