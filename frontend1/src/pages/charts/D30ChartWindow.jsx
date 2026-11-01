import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Printer,
  X,
  Compass,
  AlertTriangle,
  Info,
  Activity,
  Flame,
  Award
} from 'lucide-react';

import StandaloneD1Chart from '../../components/StandaloneD1Chart';
import SouthIndianD1Chart from '../../components/SouthIndianD1Chart';
import DynamicVargaAnalysis from '../../components/DynamicVargaAnalysis';

import { D30_INTERPRETATIONS } from '../../data/d30HouseInterpretations';
import { D30_INTRO, D30_PLANET_DESCRIPTIONS } from '../../data/d30TrimshamshaData';

const API_BASE_URL = 'http://localhost:5000/api';

// Helper component for bullet interpretation points
const BulletInterpretation = ({ text, colorClass = "text-slate-600" }) => {
  if (!text) return null;
  const points = text.split(/(?<=\.)\s+|\n+/).filter(p => p.trim());
  return (
    <ul className="space-y-3 relative z-10">
      {points.map((point, i) => (
        <li key={i} className="flex gap-3 items-start group/point">
          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${colorClass.replace('text-', 'bg-')} opacity-40 group-hover/point:opacity-100 transition-opacity`}></span>
          <span className="text-base text-black text-opacity-100 leading-relaxed font-medium font-serif">{point.trim()}</span>
        </li>
      ))}
    </ul>
  );
};

// Multilingual Signs
const SIGN_NAMES_EN = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const MULTILINGUAL_SIGNS = {
  en: SIGN_NAMES_EN,
  hi: ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"],
  ta: ["மேஷம்", "ரிஷபம்", "மிதுனம்", "கடகம்", "சிம்மம்", "கன்னி", "துலாம்", "விருச்சிகம்", "தனுசு", "மகரம்", "கும்பம்", "மீனம்"],
  te: ["మేషం", "వృషభం", "మిథునం", "కర్కాటకం", "సింహం", "కన్య", "తుల", "వృశ్చికం", "ధనుస్సు", "మకరం", "కుంభం", "మీనం"],
  kn: ["ಮೇಷ", "ವೃಷಭ", "ಮಿಥುನ", "ಕರ್ಕಾಟಕ", "ಸಿಂಹ", "ಕನ್ಯಾ", "ತುಲಾ", "ವೃಶ್ಚಿಕ", "ಧನು", "ಮಕರ", "ಕುಂಭ", "ಮೀನ"],
  gu: ["મેષ", "વૃષભ", "મિથુન", "કર્ક", "સિંહ", "કન્યા", "તુલા", "વૃશ્ચિક", "ધન", "મકર", "કુંભ", "મીન"],
  mr: ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तूळ", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"],
  bn: ["মেষ", "বৃষ", "মিথুন", "কর্কট", "সিংহ", "কন্যা", "তুলা", "বৃশ্চিক", "ধনু", "মকর", "কুম্ভ", "মীন"],
  ml: ["മേടം", "ഇടവം", "മിഥുനം", "കർക്കിടകം", "ചിങ്ങം", "കന്നി", "തുലാം", "വൃശ്ചികം", "ധനു", "മകരം", "കുംഭം", "മീനം"],
  pa: ["ਮੇਖ", "ਬ੍ਰਿਖ", "ਮਿਥੁਨ", "ਕਰਕ", "ਸਿੰਘ", "ਕੰਨਿਆ", "ਤੁਲਾ", "ਬ੍ਰਿਸ਼ਚਕ", "ਧਨੁ", "ਮਕਰ", "ਕੁੰਭ", "ਮੀਨ"],
  sa: ["मेषः", "वृषभः", "मिथुनम्", "कर्कटः", "सिंहः", "कन्या", "तुला", "वृश्चिकः", "धनुः", "मकरः", "कुम्भः", "मीनः"]
};

// Multilingual Sign Lords
const MULTILINGUAL_LORDS = {
  en: ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"],
  hi: ["मंगल (Mars)", "शुक्र (Venus)", "बुध (Mercury)", "चंद्र (Moon)", "सूर्य (Sun)", "बुध (Mercury)", "शुक्र (Venus)", "मंगल (Mars)", "गुरु (Jupiter)", "शनि (Saturn)", "शनि (Saturn)", "गुरु (Jupiter)"],
  ta: ["செவ்வாய் (Mars)", "சுக்கிரன் (Venus)", "புதன் (Mercury)", "சந்திரன் (Moon)", "சூரியன் (Sun)", "புதன் (Mercury)", "சுக்கிரன் (Venus)", "செவ்வாய் (Mars)", "குரு (Jupiter)", "சனி (Saturn)", "சனி (Saturn)", "குரு (Jupiter)"],
  te: ["కుజుడు (Mars)", "శుక్రుడు (Venus)", "బుధుడు (Mercury)", "చంద్రుడు (Moon)", "సూర్యుడు (Sun)", "బుధుడు (Mercury)", "శుక్రుడు (Venus)", "కుజుడు (Mars)", "గురుడు (Jupiter)", "శని (Saturn)", "శని (Saturn)", "గురుడు (Jupiter)"],
  kn: ["ಮಂಗಳ (Mars)", "ಶುಕ್ರ (Venus)", "ಬುಧ (Mercury)", "ಚಂದ್ರ (Moon)", "ಸೂರ್ಯ (Sun)", "ಬುಧ (Mercury)", "ಶುಕ್ರ (Venus)", "ಮಂಗಳ (Mars)", "ಗುರು (Jupiter)", "ಶನಿ (Saturn)", "ಶನಿ (Saturn)", "ಗುರು (Jupiter)"],
  gu: ["મંગળ (Mars)", "શુક્ર (Venus)", "બુધ (Mercury)", "ચંદ્ર (Moon)", "સૂર્ય (Sun)", "બુધ (Mercury)", "શુક્ર (Venus)", "મંગળ (Mars)", "ગુરુ (Jupiter)", "શનિ (Saturn)", "શનિ (Saturn)", "ગુરુ (Jupiter)"],
  mr: ["मंगळ (Mars)", "शुक्र (Venus)", "बुध (Mercury)", "चंद्र (Moon)", "सूर्य (Sun)", "बुध (Mercury)", "शुक्र (Venus)", "मंगळ (Mars)", "गुरू (Jupiter)", "शनि (Saturn)", "शनि (Saturn)", "गुरू (Jupiter)"],
  bn: ["মঙ্গল (Mars)", "শুক্র (Venus)", "বুধ (Mercury)", "চন্দ্র (Moon)", "সূর্য (Sun)", "বুধ (Mercury)", "শুক্র (Venus)", "মঙ্গল (Mars)", "বৃহস্পতি (Jupiter)", "শনি (Saturn)", "শনি (Saturn)", "বৃহস্পতি (Jupiter)"],
  ml: ["ചൊവ്വ (Mars)", "ശുക്രൻ (Venus)", "ബുധൻ (Mercury)", "ചന്ദ്രൻ (Moon)", "സൂര്യൻ (Sun)", "ബുധൻ (Mercury)", "ശുക്രൻ (Venus)", "ചൊവ്വ (Mars)", "വ്യാഴം (Jupiter)", "ശനി (Saturn)", "ശനി (Saturn)", "വ്യാഴം (Jupiter)"],
  pa: ["ਮੰਗਲ (Mars)", "ਸ਼ੁੱਕਰ (Venus)", "ਬੁੱਧ (Mercury)", "ਚੰਦਰਮਾ (Moon)", "ਸੂਰਜ (Sun)", "ਬੁੱਧ (Mercury)", "ਸ਼ੁੱਕਰ (Venus)", "ਮੰਗਲ (Mars)", "ਗੁਰੂ (Jupiter)", "ਸ਼ਨੀਚਰ (Saturn)", "ਸ਼ਨੀਚਰ (Saturn)", "ਗੁਰੂ (Jupiter)"],
  sa: ["मङ्गलः (Mars)", "शुक्रः (Venus)", "बुधः (Mercury)", "चन्द्रः (Moon)", "सूर्यः (Sun)", "बुधः (Mercury)", "शुक्रः (Venus)", "मङ्गलः (Mars)", "गुरुः (Jupiter)", "शनिः (Saturn)", "शनिः (Saturn)", "गुरुः (Jupiter)"]
};

// Five Elemental Deities (Tatwas) of Trimshamsha D30
// Agni (Fire/Mars), Vayu (Air/Saturn), Indra/Akasha (Ether/Jupiter), Varuna/Apas (Water/Venus), Prithvi/Yama (Earth/Mercury)
const D30_DEITIES = {
  Mars: "Agni (अग्नि - Fire & Acute Force)",
  Saturn: "Vayu (वायु - Air & Chronic Endurance)",
  Jupiter: "Indra / Isha (इन्द्र - Divine Protection & Ether)",
  Mercury: "Prithvi / Yama (पृथ्वी - Earth & Discernment)",
  Venus: "Varuna (वरुण - Water & Subconscious Flow)"
};

// Multilingual Table Headers
const D30_TABLE_I18N = {
  en: {
    heading: "D30 Trimshamsha Planetary Status",
    subtitle: "Misfortunes · Health Risks · Hidden Adversities · Karmic Resilience",
    colPlanet: "Graha (Planet)",
    colLord: "D30 Lord",
    colDeity: "Tatwa Deity",
    colD30Sign: "D30 Rashi (Sign)",
    colHouse: "D30 Bhava",
    footerText: "Calculated with classical Brihat Parashara Hora Shastra rules (Odd signs: Mars 0-5°, Saturn 5-10°, Jupiter 10-18°, Mercury 18-25°, Venus 25-30°; Even signs reversed)."
  },
  hi: {
    heading: "D30 त्रिंशांश ग्रह स्थिति",
    subtitle: "अरिष्ट · रोग भय · गुप्त बाधाएं · कार्मिक सहनशीलता",
    colPlanet: "ग्रह",
    colLord: "D30 स्वामी",
    colDeity: "तत्व अधिष्ठाता",
    colD30Sign: "D30 राशि",
    colHouse: "D30 भाव",
    footerText: "बृहत् पराशर होरा शास्त्र के शास्त्रीय त्रिंशांश नियमों द्वारा गणना (विषम राशि: मंगल ०-५°, शनि ५-१०°, गुरु १०-१८°, बुध १८-२५°, शुक्र २५-३०°; सम राशि व्युत्क्रम)।"
  },
  ta: {
    heading: "D30 திரிம்சாம்ச கிரக நிலை",
    subtitle: "இடர்கள் · நோய்கள் · மறைமுக தடைகள் · கர்ம சகிப்புத்தன்மை",
    colPlanet: "கிரகம்",
    colLord: "D30 அதிபதி",
    colDeity: "தத்துவ தெய்வம்",
    colD30Sign: "D30 ராசி",
    colHouse: "D30 பாவம்",
    footerText: "பராசர ஹோரா சாஸ்திர பாரம்பரிய விதிகளின்படி கணக்கிடப்பட்டது."
  },
  te: {
    heading: "D30 త్రింశాంశ గ్రహ స్థితి",
    subtitle: "అరిష్టాలు · రోగ భయాలు · గూఢ అవరోధాలు · కర్మ సహనశక్తి",
    colPlanet: "గ్రహం",
    colLord: "D30 అధిపతి",
    colDeity: "తత్వ దేవత",
    colD30Sign: "D30 రాశి",
    colHouse: "D30 భావం",
    footerText: "బృహత్ పరాశర హోరా శాస్త్ర సంప్రదాయ గణన."
  },
  kn: {
    heading: "D30 ತ್ರಿಂಶಾಂಶ ಗ್ರಹ ಸ್ಥಿತಿ",
    subtitle: "ಅನಿಷ್ಟಗಳು · ರೋಗ ಬಾಧೆ · ಗೂಢ ಅಡೆತಡೆಗಳು · ಕರ್ಮ ಸಹಿಷ್ಣುತೆ",
    colPlanet: "ಗ್ರಹ",
    colLord: "D30 ಅಧಿಪತಿ",
    colDeity: "ತತ್ವ ದೇವತೆ",
    colD30Sign: "D30 ರಾಶಿ",
    colHouse: "D30 ಭಾವ",
    footerText: "ಬೃಹತ್ ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರದ ಶಾಸ್ತ್ರೀಯ ನಿಯಮಗಳ ಪ್ರಕಾರ ಲೆಕ್ಕಹಾಕಲಾಗಿದೆ."
  },
  gu: {
    heading: "D30 ત્રિંશાંશ ગ્રહ સ્થિતિ",
    subtitle: "અરિષ્ટ · રોગ ભય · ગુપ્ત વિઘ્નો · કાર્મિક સહનશીલતા",
    colPlanet: "ગ્રહ",
    colLord: "D30 સ્વામી",
    colDeity: "તત્ત્વ અધિષ્ઠાતા",
    colD30Sign: "D30 રાશિ",
    colHouse: "D30 ભાવ",
    footerText: "બૃહત્ પરાશર હોરા શાસ્ત્રના શાસ્ત્રીય નિયમો અનુસાર ગણતરી."
  },
  mr: {
    heading: "D30 त्रिंशांश ग्रह स्थिती",
    subtitle: "अरिष्ट · रोग भय · गुप्त अडथळे · कार्मिक सहनशीलता",
    colPlanet: "ग्रह",
    colLord: "D30 स्वामी",
    colDeity: "तत्त्व अधिष्ठाता",
    colD30Sign: "D30 राशी",
    colHouse: "D30 भाव",
    footerText: "बृहत् पराशर होरा शास्त्राच्या शास्त्रीय नियमांनुसार गणना."
  },
  bn: {
    heading: "D30 ত্রিংশাংশ গ্রহ স্থিতি",
    subtitle: "অরিষ্ট · রোগ ভয় · গুপ্ত বাধা · কর্ম সহনশীলতা",
    colPlanet: "গ্রহ",
    colLord: "D30 অধিপতি",
    colDeity: "তত্ত্ব দেবতা",
    colD30Sign: "D30 রাশি",
    colHouse: "D30 ভাব",
    footerText: "বৃহৎ পরাশর হোরা শাস্ত্রের নিয়ম অনুযায়ী গণিত।"
  },
  ml: {
    heading: "D30 ത്രിംശാംശ ഗ്രഹനില",
    subtitle: "അരിഷ്ടതകൾ · രോഗഭയം · പ്രതിസന്ധികൾ · കർമ്മ സഹിഷ്ണുത",
    colPlanet: "ഗ്രഹം",
    colLord: "D30 അധിപൻ",
    colDeity: "തത്വ ദേവത",
    colD30Sign: "D30 രാശി",
    colHouse: "D30 ഭാവം",
    footerText: "ബൃഹത് പരാശര ഹോരാ ശാസ്ത്ര വിധിപ്രകാരം കണക്കാക്കിയത്."
  },
  pa: {
    heading: "D30 ਤ੍ਰਿੰਸ਼ਾਂਸ਼ ਗ੍ਰਹਿ ਸਥਿਤੀ",
    subtitle: "ਸੰਕਟ · ਰੋਗ ਭੈਅ · ਗੁਪਤ ਰੁਕਾਵਟਾਂ · ਕਰਮ ਸਹਿਣਸ਼ੀਲਤਾ",
    colPlanet: "ਗ੍ਰਹਿ",
    colLord: "D30 ਸੁਆਮੀ",
    colDeity: "ਤੱਤ ਦੇਵਤਾ",
    colD30Sign: "D30 ਰਾਸ਼ੀ",
    colHouse: "D30 ਭਾਵ",
    footerText: "ਬ੍ਰਿਹਤ ਪਰਾਸ਼ਰ ਹੋਰਾ ਸ਼ਾਸਤਰ ਦੇ ਨਿਯਮਾਂ ਅਨੁਸਾਰ ਗਣਨਾ।"
  },
  sa: {
    heading: "D30 त्रिंशांश ग्रहस्थितिः",
    subtitle: "अरिष्टम् · रोगभयम् · गुप्तविघ्नाः · कार्मिकसहनशीलता",
    colPlanet: "ग्रहः",
    colLord: "D30 स्वामी",
    colDeity: "तत्त्वाधिष्ठाता",
    colD30Sign: "D30 राशिः",
    colHouse: "D30 भावः",
    footerText: "बृहत्पराशरहोराशास्त्रस्य शास्त्रीयनियमानुसारेण गणितम्।"
  }
};

const D30_HEADER_I18N = {
  en: {
    title: "Trimshamsa Analysis (D30)",
    subtitle: "Misfortunes · Health Risks · Hidden Adversities · Karmic Resilience",
    houseLabel: "House"
  },
  hi: {
    title: "त्रिंशांश विश्लेषण (D30)",
    subtitle: "अरिष्ट · रोग भय · गुप्त बाधाएं एवं संकट निवारण विश्लेषण",
    houseLabel: "भाव"
  },
  ta: {
    title: "திரிம்சாம்ச பகுப்பாய்வு (D30)",
    subtitle: "இடர்கள் · நோய்கள் · மறைமுக தடைகள் மற்றும் சகிப்புத்தன்மை",
    houseLabel: "பாவம்"
  },
  te: {
    title: "త్రింశాంశ విశ్లేషణ (D30)",
    subtitle: "అరిష్టాలు · రోగ భయాలు · గూఢ అవరోధాలు & కర్మ విశ్లేషణ",
    houseLabel: "భావం"
  },
  kn: {
    title: "ತ್ರಿಂಶಾಂಶ ವಿಶ್ಲೇಷಣೆ (D30)",
    subtitle: "ಅನಿಷ್ಟಗಳು · ರೋಗ ಬಾಧೆ · ಗೂಢ ಅಡೆತಡೆಗಳು ಮತ್ತು ಪರಿಹಾರ",
    houseLabel: "ಭಾವ"
  },
  gu: {
    title: "ત્રિંશાંશ વિશ્લેષણ (D30)",
    subtitle: "અરિષ્ટ · રોગ ભય · ગુપ્ત વિઘ્નો અને સહનશીલતા",
    houseLabel: "ભાવ"
  },
  mr: {
    title: "त्रिंशांश विश्लेषण (D30)",
    subtitle: "अरिष्ट · रोग भय · गुप्त अडथळे व कार्मिक सहनशीलता",
    houseLabel: "भाव"
  },
  bn: {
    title: "ত্রিংশাংশ বিশ্লেষণ (D30)",
    subtitle: "অরিষ্ট · রোগ ভয় · গুপ্ত বাধা ও কর্ম সহনশীলতা",
    houseLabel: "ভাব"
  },
  ml: {
    title: "ത്രിംശാംശ വിശകലനം (D30)",
    subtitle: "അരിഷ്ടതകൾ · രോഗഭയം · പ്രതിസന്ധികൾ & പരിഹാരങ്ങൾ",
    houseLabel: "ഭാവം"
  },
  pa: {
    title: "ਤ੍ਰਿੰਸ਼ਾਂਸ਼ ਵਿਸ਼ਲੇਸ਼ਣ (D30)",
    subtitle: "ਸੰਕਟ · ਰੋਗ ਭੈਅ · ਗੁਪਤ ਰੁਕਾਵਟਾਂ ਅਤੇ ਕਰਮ ਸਹਿਣਸ਼ੀਲਤਾ",
    houseLabel: "ਭਾਵ"
  },
  sa: {
    title: "त्रिंशांश विश्लेषणम् (D30)",
    subtitle: "अरिष्टम् · रोगभयम् · गुप्तविघ्नाः · कार्मिकसहनशीलता",
    houseLabel: "भावः"
  }
};

/**
 * Parashari D30 Trimshamsha Calculation:
 * - Odd Signs (1, 3, 5, 7, 9, 11 -> idx 0, 2, 4, 6, 8, 10):
 *   00° - 05°: Mars (Aries, idx 0)
 *   05° - 10°: Saturn (Aquarius, idx 10)
 *   10° - 18°: Jupiter (Sagittarius, idx 8)
 *   18° - 25°: Mercury (Gemini, idx 2)
 *   25° - 30°: Venus (Libra, idx 6)
 *
 * - Even Signs (2, 4, 6, 8, 10, 12 -> idx 1, 3, 5, 7, 9, 11):
 *   00° - 05°: Venus (Taurus, idx 1)
 *   05° - 12°: Mercury (Virgo, idx 5)
 *   12° - 20°: Jupiter (Pisces, idx 11)
 *   20° - 25°: Saturn (Capricorn, idx 9)
 *   25° - 30°: Mars (Scorpio, idx 7)
 */
function calculateD30Trimshamsha(basePlanets = [], baseAscDeg = 0, lang = 'en') {
  const lords = MULTILINGUAL_LORDS[lang] || MULTILINGUAL_LORDS['hi'] || MULTILINGUAL_LORDS['en'];
  const signNames = MULTILINGUAL_SIGNS[lang] || MULTILINGUAL_SIGNS['hi'] || MULTILINGUAL_SIGNS['en'];

  const getD30Info = (totalDeg) => {
    const normDeg = ((totalDeg % 360) + 360) % 360;
    const baseSignIdx = Math.floor(normDeg / 30);
    const degInSign = normDeg % 30;

    const isOdd = baseSignIdx % 2 === 0; // Aries=0 (odd), Taurus=1 (even), etc.

    let d30SignIdx = 0;
    let rulerName = 'Mars';

    if (isOdd) {
      if (degInSign < 5.0) {
        d30SignIdx = 0; // Aries
        rulerName = 'Mars';
      } else if (degInSign < 10.0) {
        d30SignIdx = 10; // Aquarius
        rulerName = 'Saturn';
      } else if (degInSign < 18.0) {
        d30SignIdx = 8; // Sagittarius
        rulerName = 'Jupiter';
      } else if (degInSign < 25.0) {
        d30SignIdx = 2; // Gemini
        rulerName = 'Mercury';
      } else {
        d30SignIdx = 6; // Libra
        rulerName = 'Venus';
      }
    } else {
      if (degInSign < 5.0) {
        d30SignIdx = 1; // Taurus
        rulerName = 'Venus';
      } else if (degInSign < 12.0) {
        d30SignIdx = 5; // Virgo
        rulerName = 'Mercury';
      } else if (degInSign < 20.0) {
        d30SignIdx = 11; // Pisces
        rulerName = 'Jupiter';
      } else if (degInSign < 25.0) {
        d30SignIdx = 9; // Capricorn
        rulerName = 'Saturn';
      } else {
        d30SignIdx = 7; // Scorpio
        rulerName = 'Mars';
      }
    }

    const deity = D30_DEITIES[rulerName] || 'Agni';

    return {
      d30SignIdx,
      rulerName,
      deity
    };
  };

  // 1. Calculate D30 Ascendant
  const ascInfo = getD30Info(baseAscDeg);
  const ascD30SignIdx = ascInfo.d30SignIdx;

  // 2. Initialize 12 Houses from D30 Ascendant
  const d30Houses = {};
  for (let h = 1; h <= 12; h++) {
    const sIdx = (ascD30SignIdx + (h - 1)) % 12;
    d30Houses[h] = {
      sign_index: sIdx,
      sign_name: SIGN_NAMES_EN[sIdx],
      planets: []
    };
  }

  // 3. Map Each Planet into D30 Houses
  const d30PlanetPositions = [];
  basePlanets.forEach((p) => {
    const pDeg = p.total_degree !== undefined ? p.total_degree : ((p.sign_index || 0) * 30 + (p.degree || 0));
    const pInfo = getD30Info(pDeg);
    const pD30SignIdx = pInfo.d30SignIdx;

    // House calculation from D30 Ascendant
    const houseNum = (((pD30SignIdx - ascD30SignIdx) % 12) + 12) % 12 + 1;

    d30Houses[houseNum].planets.push(p.planet);

    d30PlanetPositions.push({
      planet: p.planet,
      sign_index: pD30SignIdx,
      sign: signNames[pD30SignIdx],
      house: houseNum,
      deity: pInfo.deity,
      d30Lord: lords[pD30SignIdx],
      is_retrograde: p.is_retrograde || false,
      is_combust: p.is_combust || false
    });
  });

  return { d30Houses, d30PlanetPositions };
}

// Calculate Dignities & Functional Benefic Effects
const calculatePlanetEffects = (reportData) => {
  const effects = {};
  const planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];

  let lagnaSignIndex = 0;
  if (reportData?.vargas?.d30?.houses?.[1]?.sign_index !== undefined) {
    lagnaSignIndex = reportData.vargas.d30.houses[1].sign_index;
  } else if (reportData?.charts?.ascendant_deg !== undefined) {
    const norm = ((reportData.charts.ascendant_deg % 360) + 360) % 360;
    lagnaSignIndex = Math.floor(norm / 30);
  }

  const functionalBenefics = {
    0: ["Sun", "Jupiter", "Mars", "Moon"],
    1: ["Saturn", "Mercury", "Venus"],
    2: ["Venus", "Mercury"],
    3: ["Moon", "Mars", "Jupiter"],
    4: ["Sun", "Mars", "Jupiter"],
    5: ["Mercury", "Venus"],
    6: ["Saturn", "Mercury", "Venus"],
    7: ["Jupiter", "Moon", "Sun"],
    8: ["Sun", "Mars", "Jupiter"],
    9: ["Venus", "Mercury", "Saturn"],
    10: ["Venus", "Saturn"],
    11: ["Moon", "Jupiter", "Mars"]
  };

  const beneficList = functionalBenefics[lagnaSignIndex] || ["Jupiter", "Venus"];

  const exaltationSigns = {
    Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6, Rahu: 1, Ketu: 7
  };
  const debilitationSigns = {
    Sun: 6, Moon: 7, Mars: 3, Mercury: 11, Jupiter: 9, Venus: 5, Saturn: 0, Rahu: 7, Ketu: 1
  };

  planets.forEach(p => {
    const pos = reportData?.planet_positions?.find(pl => pl.planet === p);
    let signIdx = pos?.sign_index;

    if (reportData?.vargas?.d30?.houses) {
      for (const [hNum, hData] of Object.entries(reportData.vargas.d30.houses)) {
        const pList = Array.isArray(hData.planets) ? hData.planets : [];
        if (pList.some(item => (typeof item === 'string' ? item : item.planet || item.name) === p)) {
          signIdx = hData.sign_index;
          break;
        }
      }
    }

    if (signIdx !== undefined) {
      if (signIdx === exaltationSigns[p]) {
        effects[p] = "positive";
      } else if (signIdx === debilitationSigns[p]) {
        effects[p] = "negative";
      } else if (beneficList.includes(p)) {
        effects[p] = "positive";
      } else {
        effects[p] = "neutral";
      }
    } else {
      effects[p] = "neutral";
    }
  });

  return effects;
};

export default function D30ChartWindow() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartStyle, setChartStyle] = useState('north');
  const [selectedPlanet, setSelectedPlanet] = useState(null);

  // Extract query params
  const name = searchParams.get('name') || 'Native';
  const date = searchParams.get('date') || '1990-01-01';
  const time = searchParams.get('time') || '12:00';
  const lat = parseFloat(searchParams.get('lat') || '28.6139');
  const lon = parseFloat(searchParams.get('lon') || '77.2090');
  const tzOffset = parseFloat(searchParams.get('tz_offset') || '5.5');
  const locationName = searchParams.get('location_name') || 'New Delhi, India';

  const urlLang = searchParams.get('lang');
  const savedLang = localStorage.getItem('kundali_hub_lang') || 'en';
  const initialLang = urlLang || savedLang;

  const [currentLang, setCurrentLang] = useState(initialLang);
  const [translations, setTranslations] = useState(null);
  const [d30Translations, setD30Translations] = useState(null);
  const [isLangLoading, setIsLangLoading] = useState(false);

  // Switch Language
  const handleLanguageChange = async (newLang) => {
    if (newLang === currentLang) return;
    setIsLangLoading(true);
    setCurrentLang(newLang);
    localStorage.setItem('kundali_hub_lang', newLang);

    const newParams = new URLSearchParams(searchParams);
    newParams.set('lang', newLang);
    setSearchParams(newParams);

    try {
      const res = await axios.get(`${API_BASE_URL}/translate/kundali-hub/${newLang}`);
      if (res.data) setTranslations(res.data);

      if (newLang !== 'en') {
        const d30Res = await axios.get(`${API_BASE_URL}/translate/d30-trimshamsha/${newLang}`);
        if (d30Res.data?.success && d30Res.data?.data) {
          setD30Translations(d30Res.data.data);
          localStorage.setItem(`d30_trimshamsha_trans_${newLang}`, JSON.stringify(d30Res.data.data));
        }
      } else {
        setD30Translations(null);
      }
    } catch (e) {
      console.warn('Could not fetch language translations for D30:', e);
    } finally {
      setIsLangLoading(false);
    }
  };

  useEffect(() => {
    if (currentLang && currentLang !== 'en') {
      axios.get(`${API_BASE_URL}/translate/kundali-hub/${currentLang}`)
        .then(res => { if (res.data) setTranslations(res.data); })
        .catch(e => console.warn('Language preload error:', e));

      const cacheKey = `d30_trimshamsha_trans_${currentLang}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          setD30Translations(JSON.parse(cached));
        } catch (e) { }
      } else {
        axios.get(`${API_BASE_URL}/translate/d30-trimshamsha/${currentLang}`)
          .then(res => {
            if (res.data?.success && res.data?.data) {
              setD30Translations(res.data.data);
              localStorage.setItem(cacheKey, JSON.stringify(res.data.data));
            }
          })
          .catch(e => console.warn('D30 DB translation error:', e));
      }
    } else {
      setD30Translations(null);
    }
  }, [currentLang]);

  // Fetch Chart Data
  useEffect(() => {
    fetchData();
  }, [date, time, lat, lon, tzOffset]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    // 1. Try reading cached data from sessionStorage / localStorage
    try {
      const cached = sessionStorage.getItem('lastGeneratedKundali') || localStorage.getItem('worksheetData');
      if (cached) {
        const parsed = JSON.parse(cached);
        const candidate = parsed.reportData || parsed;
        if (candidate && (candidate.charts || candidate.vargas?.d30)) {
          setReportData(candidate);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not read cached reportData', e);
    }

    // 2. Fetch from Vedic backend
    try {
      const response = await axios.post('http://localhost:8000/api/report/data', {
        name,
        date,
        time,
        lat,
        lon,
        tz_offset: tzOffset,
      }, { timeout: 15000 });

      if (response.data && (response.data.charts || response.data.vargas)) {
        setReportData(response.data);
      } else {
        throw new Error('No chart data received from astrology engine.');
      }
    } catch (err) {
      console.warn('Failed primary report/data endpoint, trying fallback /api/kundali...', err);
      try {
        const fallbackRes = await axios.post('http://localhost:8000/api/kundali', {
          date,
          time,
          lat,
          lon,
          tz_offset: tzOffset,
        });

        if (fallbackRes.data && fallbackRes.data.houses) {
          const formatted = {
            basic_details: { name, date, time, lat, lon, tz_offset: tzOffset, place: locationName },
            charts: fallbackRes.data,
            planet_positions: Object.entries(fallbackRes.data.planet_positions || {}).map(([pName, pObj]) => {
              if (typeof pObj === 'object') {
                return {
                  planet: pName,
                  degree: pObj.sidereal?.lon || pObj.lon || 0,
                  nakshatra: pObj.sidereal?.nakshatra || pObj.nakshatra || 'Ashwini',
                  nakshatra_pada: pObj.nakshatra_pada || pObj.pada || 1,
                  sign_lord: pObj.sidereal?.sign_lord || pObj.sign_lord || 'Mars',
                  is_retrograde: pObj.is_retrograde,
                  is_combust: pObj.is_combust,
                  house: pObj.house || 1,
                };
              }
              return {
                planet: pName,
                degree: Number(pObj),
                nakshatra: 'Ashwini',
                nakshatra_pada: 1,
                sign_lord: 'Mars',
                house: 1
              };
            })
          };
          setReportData(formatted);
        } else {
          throw new Error('Kundali calculation failed.');
        }
      } catch (fallbackErr) {
        console.error('All chart data endpoints failed:', fallbackErr);
        setError('Failed to compute D30 Trimshamsha Chart data. Please verify your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getPlanetColor = (planet) => {
    const colors = {
      Sun: '#ea580c',
      Moon: '#0284c7',
      Mars: '#dc2626',
      Mercury: '#16a34a',
      Jupiter: '#ca8a04',
      Venus: '#db2777',
      Saturn: '#475569',
      Rahu: '#0d9488',
      Ketu: '#7c3aed'
    };
    return colors[planet] || '#64748b';
  };

  const basePlanets = reportData?.planet_positions || [];
  const baseAscDeg = reportData?.charts?.ascendant_deg !== undefined
    ? reportData.charts.ascendant_deg
    : (reportData?.charts?.houses?.[1]?.cusp_deg || 0);

  const calculatedD30 = calculateD30Trimshamsha(basePlanets, baseAscDeg, currentLang);

  let d30Houses = calculatedD30.d30Houses;
  let d30PlanetPositions = calculatedD30.d30PlanetPositions;

  // If backend provided pre-computed vargas.d30 houses
  if (reportData?.vargas?.d30?.houses) {
    const backendHouses = reportData.vargas.d30.houses;
    d30Houses = backendHouses;

    const mapped = [];
    Object.entries(backendHouses).forEach(([hNum, hData]) => {
      const pList = Array.isArray(hData.planets) ? hData.planets : [];
      pList.forEach(p => {
        const pName = typeof p === 'string' ? p : p.planet || p.name;
        const originalInfo = calculatedD30.d30PlanetPositions.find(x => x.planet === pName);
        mapped.push({
          planet: pName,
          house: parseInt(hNum, 10),
          sign_index: hData.sign_index,
          sign: MULTILINGUAL_SIGNS[currentLang]?.[hData.sign_index] || SIGN_NAMES_EN[hData.sign_index],
          deity: originalInfo?.deity || 'Agni',
          d30Lord: MULTILINGUAL_LORDS[currentLang]?.[hData.sign_index] || MULTILINGUAL_LORDS['en'][hData.sign_index],
          is_retrograde: originalInfo?.is_retrograde || false,
          is_combust: originalInfo?.is_combust || false
        });
      });
    });

    if (mapped.length > 0) {
      d30PlanetPositions = mapped;
    }
  }

  // Planet Dignity & Functional Benefic Effects
  const effects = calculatePlanetEffects(reportData);

  // i18n Table & Header strings
  const tableI18n = D30_TABLE_I18N[currentLang] || D30_TABLE_I18N['hi'] || D30_TABLE_I18N['en'];
  const analysisHeaderI18n = D30_HEADER_I18N[currentLang] || D30_HEADER_I18N['hi'] || D30_HEADER_I18N['en'];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-rose-400 p-6">
        <RefreshCw className="w-12 h-12 animate-spin mb-4" />
        <h2 className="text-xl font-bold font-serif tracking-widest uppercase">Calculating D30 Trimshamsha Kundali...</h2>
        <p className="text-xs text-rose-200/60 mt-2">Computing Parashari Trimshamsha degrees, Tatwas, and karmic resilience...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6">
        <AlertTriangle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-rose-400">Unable to Load D30 Chart</h2>
        <p className="text-slate-400 text-sm mt-2 max-w-md text-center">{error}</p>
        <button
          onClick={fetchData}
          className="mt-6 px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfaf7] text-slate-800 flex flex-col selection:bg-rose-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-200/80 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-700 to-red-500 flex items-center justify-center text-white shadow-md shadow-rose-200">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-serif">
              <span>{analysisHeaderI18n.title}</span>
              <span className="text-xs font-sans font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-300">
                D30
              </span>
            </h1>
            <p className="text-[14px] text-amber-900">
              {name} · {date} · {time} · {locationName}
            </p>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-amber-300 rounded-xl p-1 border border-slate-200">
            <select
              value={currentLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
              disabled={isLangLoading}
              className="bg-transparent text-[14px] font-bold text-slate-700 px-2 py-1 outline-hidden cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="gu">ગુજરાતી (Gujarati)</option>
              <option value="mr">मराठी (Marathi)</option>
              <option value="bn">বাংলা (Bengali)</option>
              <option value="ml">മലയാളം (Malayalam)</option>
              <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
              <option value="sa">संस्कृतम् (Sanskrit)</option>
            </select>
          </div>

          {/* Chart Style Toggle */}
          <div className="flex items-center bg-emerald-200 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setChartStyle('north')}
              className={`px-3 py-1 rounded-lg text-[14px] font-bold transition ${chartStyle === 'north'
                ? 'bg-white text-rose-900 shadow-xs'
                : 'text-slate-700 hover:text-black'
                }`}
            >
              North
            </button>
            <button
              onClick={() => setChartStyle('south')}
              className={`px-3 py-1 rounded-lg text-[14px] font-bold transition ${chartStyle === 'south'
                ? 'bg-white text-rose-900 shadow-xs'
                : 'text-slate-700 hover:text-black'
                }`}
            >
              South
            </button>
          </div>

          <button
            onClick={() => window.print()}
            title="Print Chart Window"
            className="p-2 rounded-xl bg-yellow-200 hover:bg-slate-200 text-black transition"
          >
            <Printer className="w-6 h-6" />
          </button>

          <button
            onClick={() => window.close()}
            title="Close Window"
            className="p-2 rounded-xl bg-red-300 hover:bg-red-50 hover:text-red-600 text-black transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* ROW 1: Chart & Planet Positions Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* D30 Chart Container */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center">
            {chartStyle === 'north' ? (
              <StandaloneD1Chart
                houses={d30Houses}
                planetPositions={d30PlanetPositions}
                title="D30 Trimshamsha Chart (त्रिंशांश कुंडली - अरिष्ट व संकटनाशन)"
                lang={currentLang}
                hideTransitToggle={true}
              />
            ) : (
              <SouthIndianD1Chart
                houses={d30Houses}
                planetPositions={d30PlanetPositions}
                title="D30 Trimshamsha Chart (திரிம்சாம்ச சக்கரம்)"
                lang={currentLang}
                hideTransitToggle={true}
              />
            )}
          </div>

          {/* D30 Planetary Status Table */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-xl font-bold font-serif text-slate-900 mb-1">
                {tableI18n.heading}
              </h3>
              <p className="text-xs text-rose-700 font-medium">
                {tableI18n.subtitle}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-900 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-3">{tableI18n.colPlanet}</th>
                    <th className="py-2.5 px-3">{tableI18n.colLord}</th>
                    <th className="py-2.5 px-3">{tableI18n.colDeity}</th>
                    <th className="py-2.5 px-3">{tableI18n.colD30Sign}</th>
                    <th className="py-2.5 px-3 text-right">{tableI18n.colHouse}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {d30PlanetPositions.map((p) => {
                    const color = getPlanetColor(p.planet);
                    const translatedPlanet = translations?.planets?.[p.planet] || p.planet;
                    const isSelected = selectedPlanet === p.planet;

                    return (
                      <tr
                        key={p.planet}
                        onClick={() => setSelectedPlanet(p.planet)}
                        className={`hover:bg-rose-50/60 transition cursor-pointer ${isSelected ? 'bg-rose-50 font-bold' : ''
                          }`}
                      >
                        <td className="py-3 px-3 font-sans font-bold flex items-center gap-2 text-base" style={{ color }}>
                          <span>{translatedPlanet}</span>
                        </td>
                        <td className="py-3 px-3 font-sans font-semibold text-slate-800 text-xs">
                          {p.d30Lord}
                        </td>
                        <td className="py-3 px-3 font-sans font-bold text-rose-800 text-xs">
                          <span className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                            {p.deity}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-sans font-semibold text-black">
                          {p.sign}
                        </td>
                        <td className="py-3 px-3 font-black text-rose-900 text-base text-right">
                          H{p.house || 1}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-600 font-medium">
              <span>{tableI18n.footerText}</span>
            </div>
          </div>
        </div>

        {/* Dynamic AI Assessment (Deity & Vargottama Analysis) */}
        {reportData && (
          <DynamicVargaAnalysis
            data={reportData}
            cid="d30"
            lang={currentLang}
          />
        )}

        {/* ROW 2: Trimshamsha Analysis (D30) Interpretations matching Interactive Worksheet */}
        <section id="section-d30-interpretations" className="w-full max-w-full mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-red-200 shadow-xl space-y-6">
          <div className="border-b border-red-200 pb-4">
            <h3 className="text-3xl font-serif italic uppercase mb-2 text-slate-900">
              {d30Translations?.ui?.sectionTitle || analysisHeaderI18n.title}
            </h3>
            <p className="text-xs text-rose-600 font-bold uppercase tracking-widest mb-4">
              {d30Translations?.ui?.sectionSubtitle || analysisHeaderI18n.subtitle}
            </p>
          </div>

          <p className="text-[15px] text-red-900 italic mb-8 whitespace-pre-line leading-relaxed">
            {d30Translations?.intro || "The D-30 (Trimshamsa) chart reveals your subconscious fears, psychological shadows, hidden enemies, and susceptibility to misfortunes or diseases. It exposes how you handle deep adversity and karmic punishments."}
          </p>

          <div className="space-y-6">
            {d30PlanetPositions.map((p) => {
              const status = effects && effects[p.planet] ? effects[p.planet] : "neutral";
              const statusKey = status === "positive" ? "positive" : status === "negative" ? "negative" : "neutral";
              const interpretation = d30Translations?.interpretations?.[p.planet]?.[p.house]?.[statusKey] ||
                D30_INTERPRETATIONS[p.planet]?.[p.house]?.[statusKey];
              if (!interpretation) return null;

              const isSelected = selectedPlanet === p.planet;
              const translatedPlanetName = translations?.planets?.[p.planet] || p.planet;

              return (
                <section
                  key={p.planet}
                  onClick={() => setSelectedPlanet(p.planet)}
                  className={`rounded-2xl p-6 border transition cursor-pointer relative ${statusKey === 'positive'
                    ? 'bg-green-50/80 border-green-200'
                    : statusKey === 'negative'
                      ? 'bg-red-50/80 border-red-200'
                      : 'bg-blue-50/80 border-blue-200'
                    } ${isSelected ? 'ring-2 ring-rose-500 shadow-md' : 'hover:border-rose-400'}`}
                >
                  {p.deity && (
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <span className="text-[9px] font-black text-rose-700 uppercase tracking-widest">
                        {p.sign} · {d30Translations?.ui?.houseBadge || analysisHeaderI18n.houseLabel} {p.house}
                      </span>
                      <span className="px-3 py-1 bg-rose-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-sm">
                        {p.deity}
                      </span>
                    </div>
                  )}

                  <h4
                    className={`text-lg font-black uppercase mb-3 ${statusKey === 'positive'
                      ? 'text-green-900'
                      : statusKey === 'negative'
                        ? 'text-red-900'
                        : 'text-blue-900'
                      }`}
                  >
                    {translatedPlanetName} · {d30Translations?.ui?.houseBadge || analysisHeaderI18n.houseLabel} {p.house}{' '}
                    <span className="text-xs ml-2 opacity-60">({statusKey})</span>
                  </h4>
                  <BulletInterpretation text={interpretation} colorClass="text-slate-900" />
                </section>
              );
            })}
          </div>
        </section>

        {/* Detailed Planetary Study in Trimshamsha Section */}
        <section className="w-full max-w-full mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-rose-200 shadow-xl space-y-6">
          <div className="border-b border-rose-200 pb-4">
            <h3 className="text-2xl font-serif italic uppercase mb-1 text-slate-900">
              Planetary Significators in Trimshamsha (D30)
            </h3>
            <p className="text-xs text-rose-600 font-bold uppercase tracking-widest">
              Classical Impact of Each Planet on Karmic Cushion, Health Risks & Adversity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(D30_PLANET_DESCRIPTIONS).map(([planet, pDesc]) => {
              const transDesc = d30Translations?.planetDescriptions?.[planet];
              return (
                <div
                  key={planet}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-rose-300 transition-all shadow-xs"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{pDesc.icon}</span>
                    <h4 className="font-bold text-slate-900 text-base">{transDesc?.title || pDesc.title}</h4>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed font-sans">{transDesc?.description || pDesc.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

