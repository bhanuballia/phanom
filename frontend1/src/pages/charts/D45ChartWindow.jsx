import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  Sparkles,
  RefreshCw,
  Printer,
  X,
  Compass,
  AlertTriangle,
  Info,
  Activity,
  Award,
  Crown
} from 'lucide-react';

import StandaloneD1Chart from '../../components/StandaloneD1Chart';
import SouthIndianD1Chart from '../../components/SouthIndianD1Chart';
import DynamicVargaAnalysis from '../../components/DynamicVargaAnalysis';

import { D45_INTERPRETATIONS } from '../../data/d45HouseInterpretations';
import { D45_INTRO, D45_PLANET_DESCRIPTIONS } from '../../data/d45AkshavedamshaData';

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

// 3 Cyclic Deities of Akshavedamsha: Brahma, Shiva, Vishnu (Trinity / Trimurti cycle)
const D45_DEITIES = [
  "Brahma (ब्रह्मा - Creation & Ancestral Origin)",
  "Shiva (शिव - Moral Dissolution & Purity)",
  "Vishnu (विष्णु - Righteous Preservation & Sustenance)"
];

// Multilingual Table Headers
const D45_TABLE_I18N = {
  en: {
    heading: "D45 Akshavedamsha Planetary Status",
    subtitle: "Character · Conduct · Paternal Heritage · Moral Fortitude · Destiny",
    colPlanet: "Graha (Planet)",
    colLord: "D45 Lord",
    colDeity: "Trinity Deity",
    colD45Sign: "D45 Rashi (Sign)",
    colHouse: "D45 Bhava",
    footerText: "Calculated with classical Brihat Parashara Hora Shastra rules (each sign divided into 45 parts of 0°40'). Movable signs start from Aries, Fixed signs from Leo, Dual signs from Sagittarius."
  },
  hi: {
    heading: "D45 अक्षवेदांश ग्रह स्थिति",
    subtitle: "चारित्रिक निष्ठा · आचरण शुद्धि · पितृ कुल प्रभाव · सर्वतोमुखी समृद्धि",
    colPlanet: "ग्रह",
    colLord: "D45 स्वामी",
    colDeity: "त्रिदेव अधिष्ठाता",
    colD45Sign: "D45 राशि",
    colHouse: "D45 भाव",
    footerText: "बृहत् पराशर होरा शास्त्र के शास्त्रीय अक्षवेदांश नियमों द्वारा गणना (प्रत्येक राशि ४५ भागों में, प्रत्येक ४० कला; चर राशि मेष से, स्थिर राशि सिंह से, द्विस्वभाव राशि धनु से)।"
  },
  ta: {
    heading: "D45 அக்ஷவேதாம்ச கிரக நிலை",
    subtitle: "குணம் · ஒழுக்கம் · தந்தை வழி மரபு · ஆன்ம வலிமை · விதி",
    colPlanet: "கிரகம்",
    colLord: "D45 அதிபதி",
    colDeity: "மும்மூர்த்தி தெய்வம்",
    colD45Sign: "D45 ராசி",
    colHouse: "D45 பாவம்",
    footerText: "பராசர ஹோரா சாஸ்திர பாரம்பரிய விதிகளின்படி கணக்கிடப்பட்டது (ஒவ்வொரு ராசியும் 45 பிரிவுகள்)."
  },
  te: {
    heading: "D45 అక్షవేదాంశ గ్రహ స్థితి",
    subtitle: "శీల ప్రవర్తన · పితృ వంశం · నైతిక నిబద్ధత · సర్వతోముఖ సమృద్ధి",
    colPlanet: "గ్రహం",
    colLord: "D45 అధిపతి",
    colDeity: "త్రిమూర్తి దేవత",
    colD45Sign: "D45 రాశి",
    colHouse: "D45 భావం",
    footerText: "బృహత్ పరాశర హోరా శాస్త్ర సంప్రదాయ గణన (ప్రతి రాశి 45 విభాగాలు, 40 కళలు)."
  },
  kn: {
    heading: "D45 ಅಕ್ಷವೇದಾಂಶ ಗ್ರಹ ಸ್ಥಿತಿ",
    subtitle: "ಚಾರಿತ್ರ್ಯ · ನಡವಳಿಕೆ · ಪಿತೃ ವಂಶ · ನೈತಿಕ ಶಕ್ತಿ ಮತ್ತು ಭಾಗ್ಯ",
    colPlanet: "ಗ್ರಹ",
    colLord: "D45 ಅಧಿಪತಿ",
    colDeity: "ತ್ರಿಮೂರ್ತಿ ದೇವತೆ",
    colD45Sign: "D45 ರಾಶಿ",
    colHouse: "D45 ಭಾವ",
    footerText: "ಬೃಹತ್ ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರದ ಶಾಸ್ತ್ರೀಯ ನಿಯಮಗಳ ಪ್ರಕಾರ ಲೆಕ್ಕಹಾಕಲಾಗಿದೆ."
  },
  gu: {
    heading: "D45 અક્ષવેદાંશ ગ્રહ સ્થિતિ",
    subtitle: "ચારિત્રિક શુદ્ધિ · આચરણ · પિતૃ પક્ષ સંસ્કાર · સર્વાંગી સમૃદ્ધિ",
    colPlanet: "ગ્રહ",
    colLord: "D45 સ્વામી",
    colDeity: "ત્રિદેવ અધિષ્ઠાતા",
    colD45Sign: "D45 રાશિ",
    colHouse: "D45 ભાવ",
    footerText: "બૃહત્ પરાશર હોરા શાસ્ત્રના શાસ્ત્રીય નિયમો અનુસાર ગણતરી (પ્રત્યેક રાશિ 45 ભાગોમાં)."
  },
  mr: {
    heading: "D45 अक्षवेदांश ग्रह स्थिती",
    subtitle: "चारित्र्य निष्ठा · आचरण · पितृ कुळ प्रभाव · सर्वतोपरी समृद्धी",
    colPlanet: "ग्रह",
    colLord: "D45 स्वामी",
    colDeity: "त्रिदेव अधिष्ठाता",
    colD45Sign: "D45 राशी",
    colHouse: "D45 भाव",
    footerText: "बृहत् पराशर होरा शास्त्राच्या शास्त्रीय नियमांनुसार अक्षवेदांश गणना."
  },
  bn: {
    heading: "D45 অক্ষবেদಾಂಶ গ্রহ স্থিতি",
    subtitle: "চরিত্র · আচার-ব্যবহার · পিতৃ বংশের প্রভাব · সর্বাঙ্গীণ সমৃদ্ধি",
    colPlanet: "গ্রহ",
    colLord: "D45 অধিপতি",
    colDeity: "ত্রিমূর্তি দেবতা",
    colD45Sign: "D45 রাশি",
    colHouse: "D45 ভাব",
    footerText: "বৃহৎ পরাশর হোরা শাস্ত্রের নিয়ম অনুযায়ী গণিত (প্রতি রাশি ৪৫ অংশে বিভক্ত)।"
  },
  ml: {
    heading: "D45 അക്ഷവേദാംശ ഗ്രഹനില",
    subtitle: "സ്വഭാവശുദ്ധി · ധാർമ്മികത · പിതൃ പരമ്പര · സർവ്വതോന്മുഖ സമൃദ്ധി",
    colPlanet: "ഗ്രഹം",
    colLord: "D45 അധിപൻ",
    colDeity: "ത്രിമൂർത്തി ദേവത",
    colD45Sign: "D45 രാശി",
    colHouse: "D45 ഭാവം",
    footerText: "ബൃഹത് പരാശര ഹോരാ ശാസ്ത്ര വിധിപ്രകാരം കണക്കാക്കിയത്."
  },
  pa: {
    heading: "D45 ਅਕਸ਼ਵੇਦਾਂਸ਼ ਗ੍ਰਹਿ ਸਥਿਤੀ",
    subtitle: "ਚਰਿੱਤਰ · ਆਚਰਣ · ਪਿਤਾ ਦੇ ਪਰਿਵਾਰ ਦਾ ਪ੍ਰਭਾਵ · ਸਮੁੱਚੀ ਖੁਸ਼ਹਾਲੀ",
    colPlanet: "ਗ੍ਰਹਿ",
    colLord: "D45 ਸੁਆਮੀ",
    colDeity: "ਤ੍ਰਿਦੇਵ ਦੇਵਤਾ",
    colD45Sign: "D45 ਰਾਸ਼ੀ",
    colHouse: "D45 ਭਾਵ",
    footerText: "ਬ੍ਰਿਹਤ ਪਰਾਸ਼ਰ ਹੋਰਾ ਸ਼ਾਸਤਰ ਦੇ ਨਿਯਮਾਂ ਅਨੁਸਾਰ ਗਣਨਾ।"
  },
  sa: {
    heading: "D45 अक्षवेदांश ग्रहस्थितिः",
    subtitle: "चारित्रिकनिष्ठा · आचारशुद्धिः · पितृकुलपरम्परा · सर्वतोमुखी समृद्धिः",
    colPlanet: "ग्रहः",
    colLord: "D45 स्वामी",
    colDeity: "त्रिदेवाधिष्ठाता",
    colD45Sign: "D45 राशिः",
    colHouse: "D45 भावः",
    footerText: "बृहत्पराशरहोराशास्त्रस्य शास्त्रीयनियमानुसारेण अक्षवेदांशगणना (प्रतिराशिं पञ्चचत्वारिंशद्भागाः)।"
  }
};

const D45_HEADER_I18N = {
  en: {
    title: "Akshavedamsa Analysis (D45)",
    subtitle: "Character · Destiny · Paternal Lineage · All-around Prosperity",
    houseLabel: "House"
  },
  hi: {
    title: "अक्षवेदांश विश्लेषण (D45)",
    subtitle: "चारित्रिक निष्ठा · आचरण शुद्धि · पितृ कुल प्रभाव · सर्वतोमुखी समृद्धि",
    houseLabel: "भाव"
  },
  ta: {
    title: "அக்ஷவேதாம்ச பகுப்பாய்வு (D45)",
    subtitle: "குணம் · ஒழுக்கம் · தந்தை வழி மரபு · ஆன்ம வலிமை · விதி",
    houseLabel: "பாவம்"
  },
  te: {
    title: "అక్షవేదాంశ విశ్లేషణ (D45)",
    subtitle: "శీల ప్రవర్తన · పితృ వంశం · నైతిక నిబద్ధత · సర్వతోముఖ సమృద్ధి",
    houseLabel: "భావం"
  },
  kn: {
    title: "ಅಕ್ಷವೇದಾಂಶ ವಿಶ್ಲೇಷಣೆ (D45)",
    subtitle: "ಚಾರಿತ್ರ್ಯ · ನಡವಳಿಕೆ · ಪಿತೃ ವಂಶ · ನೈತಿಕ ಶಕ್ತಿ ಮತ್ತು ಭಾಗ್ಯ",
    houseLabel: "ಭಾವ"
  },
  gu: {
    title: "અક્ષવેદાંશ વિશ્લેષણ (D45)",
    subtitle: "ચારિત્રિક શુદ્ધિ · આચરણ · પિતૃ પક્ષ સંસ્કાર · સર્વાંગી સમૃદ્ધિ",
    houseLabel: "ભાવ"
  },
  mr: {
    title: "अक्षवेदांश विश्लेषण (D45)",
    subtitle: "चारित्र्य निष्ठा · आचरण · पितृ कुळ प्रभाव · सर्वतोपरी समृद्धी",
    houseLabel: "भाव"
  },
  bn: {
    title: "অক্ষবেদংশ বিশ্লেষণ (D45)",
    subtitle: "চরিত্র · আচার-ব্যবহার · পিতৃ বংশের প্রভাব · সর্বাঙ্গীণ সমৃদ্ধি",
    houseLabel: "ভাব"
  },
  ml: {
    title: "അക്ഷവേദാംശ വിശകലനം (D45)",
    subtitle: "സ്വഭാവശുദ്ധി · ധാർമ്മികത · പിതൃ പരമ്പര · സർവ്വതോന്മുഖ സമൃദ്ധി",
    houseLabel: "ഭാവം"
  },
  pa: {
    title: "ਅਕਸ਼ਵੇਦਾਂਸ਼ ਵਿਸ਼ਲੇਸ਼ਣ (D45)",
    subtitle: "ਚਰਿੱਤਰ · ਆਚਰਣ · ਪਿਤਾ ਦੇ ਪਰਿਵਾਰ ਦਾ ਪ੍ਰਭਾਵ · ਸਮੁੱਚੀ ਖੁਸ਼ਹਾਲੀ",
    houseLabel: "ਭਾਵ"
  },
  sa: {
    title: "अक्षवेदांश विश्लेषणम् (D45)",
    subtitle: "चारित्रिकनिष्ठा · आचारशुद्धिः · पितृकुलपरम्परा · सर्वतोमुखी समृद्धिः",
    houseLabel: "भावः"
  }
};

/**
 * Parashari D45 (Akshavedamsha / Panchachatvarimshamsha) Calculation:
 * - Each sign is divided into 45 equal parts of 0°40' (40 arcminutes = 2/3 degree = 0.666667°).
 * - Movable Signs (Aries, Cancer, Libra, Capricorn -> 0, 3, 6, 9): Counting begins from Aries (0).
 * - Fixed Signs (Taurus, Leo, Scorpio, Aquarius -> 1, 4, 7, 10): Counting begins from Leo (4).
 * - Dual Signs (Gemini, Virgo, Sagittarius, Pisces -> 2, 5, 8, 11): Counting begins from Sagittarius (8).
 */
function calculateD45Akshavedamsha(basePlanets = [], baseAscDeg = 0, lang = 'en') {
  const lords = MULTILINGUAL_LORDS[lang] || MULTILINGUAL_LORDS['hi'] || MULTILINGUAL_LORDS['en'];
  const signNames = MULTILINGUAL_SIGNS[lang] || MULTILINGUAL_SIGNS['hi'] || MULTILINGUAL_SIGNS['en'];

  const getD45Info = (totalDeg) => {
    const normDeg = ((totalDeg % 360) + 360) % 360;
    const baseSignIdx = Math.floor(normDeg / 30);
    const degInSign = normDeg % 30;

    const partSize = 30.0 / 45.0; // 0.666666667 degrees = 40 minutes
    const divisionPart = Math.min(Math.floor(degInSign / partSize), 44); // 0..44

    let startSign;
    const modality = baseSignIdx % 3; // 0 = Movable, 1 = Fixed, 2 = Dual
    if (modality === 0) {
      startSign = 0; // Aries
    } else if (modality === 1) {
      startSign = 4; // Leo
    } else {
      startSign = 8; // Sagittarius
    }

    const d45SignIdx = (startSign + divisionPart) % 12;
    const deity = D45_DEITIES[divisionPart % 3];

    return {
      d45SignIdx,
      divisionPart: divisionPart + 1,
      deity
    };
  };

  // 1. Calculate D45 Ascendant
  const ascInfo = getD45Info(baseAscDeg);
  const ascD45SignIdx = ascInfo.d45SignIdx;

  // 2. Initialize 12 Houses from D45 Ascendant
  const d45Houses = {};
  for (let h = 1; h <= 12; h++) {
    const sIdx = (ascD45SignIdx + (h - 1)) % 12;
    d45Houses[h] = {
      sign_index: sIdx,
      sign_name: SIGN_NAMES_EN[sIdx],
      planets: []
    };
  }

  // 3. Map Each Planet into D45 Houses
  const d45PlanetPositions = [];
  basePlanets.forEach((p) => {
    const pDeg = p.total_degree !== undefined ? p.total_degree : ((p.sign_index || 0) * 30 + (p.degree || 0));
    const pInfo = getD45Info(pDeg);
    const pD45SignIdx = pInfo.d45SignIdx;

    // House calculation from D45 Ascendant
    const houseNum = (((pD45SignIdx - ascD45SignIdx) % 12) + 12) % 12 + 1;

    d45Houses[houseNum].planets.push(p.planet);

    d45PlanetPositions.push({
      planet: p.planet,
      sign_index: pD45SignIdx,
      sign: signNames[pD45SignIdx],
      house: houseNum,
      divisionPart: pInfo.divisionPart,
      deity: pInfo.deity,
      d45Lord: lords[pD45SignIdx],
      is_retrograde: p.is_retrograde || false,
      is_combust: p.is_combust || false
    });
  });

  return { d45Houses, d45PlanetPositions };
}

// Calculate Dignities & Functional Benefic Effects
const calculatePlanetEffects = (reportData) => {
  const effects = {};
  const planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];

  let lagnaSignIndex = 0;
  if (reportData?.vargas?.d45?.houses?.[1]?.sign_index !== undefined) {
    lagnaSignIndex = reportData.vargas.d45.houses[1].sign_index;
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

    if (reportData?.vargas?.d45?.houses) {
      for (const [hNum, hData] of Object.entries(reportData.vargas.d45.houses)) {
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

export default function D45ChartWindow() {
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
  const [d45Translations, setD45Translations] = useState(null);
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
        const d45Res = await axios.get(`${API_BASE_URL}/translate/d45-akshavedamsha/${newLang}`);
        if (d45Res.data?.success && d45Res.data?.data) {
          setD45Translations(d45Res.data.data);
          localStorage.setItem(`d45_akshavedamsha_trans_${newLang}`, JSON.stringify(d45Res.data.data));
        }
      } else {
        setD45Translations(null);
      }
    } catch (e) {
      console.warn('Could not fetch language translations for D45:', e);
    } finally {
      setIsLangLoading(false);
    }
  };

  useEffect(() => {
    if (currentLang && currentLang !== 'en') {
      axios.get(`${API_BASE_URL}/translate/kundali-hub/${currentLang}`)
        .then(res => { if (res.data) setTranslations(res.data); })
        .catch(e => console.warn('Language preload error:', e));

      const cacheKey = `d45_akshavedamsha_trans_${currentLang}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          setD45Translations(JSON.parse(cached));
        } catch (e) { }
      } else {
        axios.get(`${API_BASE_URL}/translate/d45-akshavedamsha/${currentLang}`)
          .then(res => {
            if (res.data?.success && res.data?.data) {
              setD45Translations(res.data.data);
              localStorage.setItem(cacheKey, JSON.stringify(res.data.data));
            }
          })
          .catch(e => console.warn('D45 DB translation error:', e));
      }
    } else {
      setD45Translations(null);
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
        if (candidate && (candidate.charts || candidate.vargas?.d45)) {
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
        setError('Failed to compute D45 Akshavedamsha Chart data. Please verify your connection.');
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

  const calculatedD45 = calculateD45Akshavedamsha(basePlanets, baseAscDeg, currentLang);

  let d45Houses = calculatedD45.d45Houses;
  let d45PlanetPositions = calculatedD45.d45PlanetPositions;

  // If backend provided pre-computed vargas.d45 houses
  if (reportData?.vargas?.d45?.houses) {
    const backendHouses = reportData.vargas.d45.houses;
    d45Houses = backendHouses;

    const mapped = [];
    Object.entries(backendHouses).forEach(([hNum, hData]) => {
      const pList = Array.isArray(hData.planets) ? hData.planets : [];
      pList.forEach(p => {
        const pName = typeof p === 'string' ? p : p.planet || p.name;
        const originalInfo = calculatedD45.d45PlanetPositions.find(x => x.planet === pName);
        mapped.push({
          planet: pName,
          house: parseInt(hNum, 10),
          sign_index: hData.sign_index,
          sign: MULTILINGUAL_SIGNS[currentLang]?.[hData.sign_index] || SIGN_NAMES_EN[hData.sign_index],
          divisionPart: originalInfo?.divisionPart || 1,
          deity: originalInfo?.deity || D45_DEITIES[0],
          d45Lord: MULTILINGUAL_LORDS[currentLang]?.[hData.sign_index] || MULTILINGUAL_LORDS['en'][hData.sign_index],
          is_retrograde: originalInfo?.is_retrograde || false,
          is_combust: originalInfo?.is_combust || false
        });
      });
    });

    if (mapped.length > 0) {
      d45PlanetPositions = mapped;
    }
  }

  // Planet Dignity & Functional Benefic Effects
  const effects = calculatePlanetEffects(reportData);

  // i18n Table & Header strings
  const tableI18n = D45_TABLE_I18N[currentLang] || D45_TABLE_I18N['hi'] || D45_TABLE_I18N['en'];
  const analysisHeaderI18n = D45_HEADER_I18N[currentLang] || D45_HEADER_I18N['hi'] || D45_HEADER_I18N['en'];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-cyan-400 p-6">
        <RefreshCw className="w-12 h-12 animate-spin mb-4" />
        <h2 className="text-xl font-bold font-serif tracking-widest uppercase">Calculating D45 Akshavedamsha Kundali...</h2>
        <p className="text-xs text-cyan-200/60 mt-2">Computing Parashari 45-fold divisions (0°40'), paternal roots & character ethics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6">
        <AlertTriangle className="w-12 h-12 text-cyan-500 mb-4" />
        <h2 className="text-xl font-bold text-cyan-400">Unable to Load D45 Chart</h2>
        <p className="text-slate-400 text-sm mt-2 max-w-md text-center">{error}</p>
        <button
          onClick={fetchData}
          className="mt-6 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-cyan-200/80 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-700 to-sky-500 flex items-center justify-center text-white shadow-md shadow-cyan-200">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-serif">
              <span>{analysisHeaderI18n.title}</span>
              <span className="text-xs font-sans font-bold bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full border border-cyan-300">
                D45
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
          <div className="flex items-center gap-1.5 bg-amber-200 rounded-xl p-1 border border-slate-200">
            <select
              value={currentLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
              disabled={isLangLoading}
              className="bg-transparent text-[14px] font-bold text-black px-2 py-1 outline-hidden cursor-pointer"
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
                ? 'bg-white text-cyan-900 shadow-xs'
                : 'text-slate-700 hover:text-black'
                }`}
            >
              North
            </button>
            <button
              onClick={() => setChartStyle('south')}
              className={`px-3 py-1 rounded-lg text-[14px] font-bold transition ${chartStyle === 'south'
                ? 'bg-white text-cyan-900 shadow-xs'
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
            className="p-2 rounded-xl bg-red-200 hover:bg-red-50 hover:text-red-600 text-black transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* ROW 1: Chart & Planet Positions Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* D45 Chart Container */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center">
            {chartStyle === 'north' ? (
              <StandaloneD1Chart
                houses={d45Houses}
                planetPositions={d45PlanetPositions}
                title="D45 Akshavedamsha Chart (अक्षवेदांश कुंडली - आचरण व पितृ पुण्य)"
                lang={currentLang}
                hideTransitToggle={true}
              />
            ) : (
              <SouthIndianD1Chart
                houses={d45Houses}
                planetPositions={d45PlanetPositions}
                title="D45 Akshavedamsha Chart (அக்ஷவேதாம்ச சக்கரம்)"
                lang={currentLang}
                hideTransitToggle={true}
              />
            )}
          </div>

          {/* D45 Planetary Status Table */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-xl font-bold font-serif text-slate-900 mb-1">
                {tableI18n.heading}
              </h3>
              <p className="text-xs text-cyan-700 font-medium">
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
                    <th className="py-2.5 px-3">{tableI18n.colD45Sign}</th>
                    <th className="py-2.5 px-3 text-right">{tableI18n.colHouse}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {d45PlanetPositions.map((p) => {
                    const color = getPlanetColor(p.planet);
                    const translatedPlanet = translations?.planets?.[p.planet] || p.planet;
                    const isSelected = selectedPlanet === p.planet;

                    return (
                      <tr
                        key={p.planet}
                        onClick={() => setSelectedPlanet(p.planet)}
                        className={`hover:bg-cyan-50/60 transition cursor-pointer ${isSelected ? 'bg-cyan-50 font-bold' : ''
                          }`}
                      >
                        <td className="py-3 px-3 font-sans font-bold flex items-center gap-2 text-base" style={{ color }}>
                          <span>{translatedPlanet}</span>
                        </td>
                        <td className="py-3 px-3 font-sans font-semibold text-slate-800 text-xs">
                          {p.d45Lord}
                        </td>
                        <td className="py-3 px-3 font-sans font-bold text-cyan-800 text-xs">
                          <span className="inline-flex items-center gap-1 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-full">
                            {p.deity}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-sans font-semibold text-black">
                          {p.sign}
                        </td>
                        <td className="py-3 px-3 font-black text-cyan-900 text-base text-right">
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
            cid="d45"
            lang={currentLang}
          />
        )}

        {/* ROW 2: Akshavedamsa Analysis (D45) Interpretations matching Interactive Worksheet */}
        <section id="section-d45-interpretations" className="w-full max-w-full mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-slate-300 shadow-xl space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-3xl font-serif italic uppercase mb-2 text-slate-900">
              {d45Translations?.ui?.sectionTitle || analysisHeaderI18n.title}
            </h3>
            <p className="text-xs text-slate-600 font-bold uppercase tracking-widest mb-4">
              {d45Translations?.ui?.sectionSubtitle || analysisHeaderI18n.subtitle}
            </p>
          </div>

          <p className="text-[15px] text-amber-900 italic mb-8 whitespace-pre-line leading-relaxed">
            {d45Translations?.intro || D45_INTRO}
          </p>

          <div className="space-y-6">
            {d45PlanetPositions.map((p) => {
              const status = effects && effects[p.planet] ? effects[p.planet] : "neutral";
              const statusKey = status === "positive" ? "positive" : status === "negative" ? "negative" : "neutral";
              const interpretation = d45Translations?.interpretations?.[p.planet]?.[p.house]?.[statusKey] ||
                D45_INTERPRETATIONS[p.planet]?.[p.house]?.[statusKey];
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
                    } ${isSelected ? 'ring-2 ring-cyan-500 shadow-md' : 'hover:border-cyan-400'}`}
                >
                  {p.deity && (
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">
                        {p.sign} · {d45Translations?.ui?.houseBadge || analysisHeaderI18n.houseLabel} {p.house}
                      </span>
                      <span className="px-3 py-1 bg-cyan-700 text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-sm">
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
                    {translatedPlanetName} · {d45Translations?.ui?.houseBadge || analysisHeaderI18n.houseLabel} {p.house}{' '}
                    <span className="text-xs ml-2 opacity-60">({statusKey})</span>
                  </h4>
                  <BulletInterpretation text={interpretation} colorClass="text-slate-900" />
                </section>
              );
            })}
          </div>
        </section>

        {/* Detailed Planetary Study in Akshavedamsha Section */}
        <section className="w-full max-w-full mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-cyan-200 shadow-xl space-y-6">
          <div className="border-b border-cyan-200 pb-4">
            <h3 className="text-2xl font-serif italic uppercase mb-1 text-slate-900">
              Planetary Significators in Akshavedamsha (D45)
            </h3>
            <p className="text-xs text-cyan-600 font-bold uppercase tracking-widest">
              Classical Impact of Each Planet on Moral Character, Ethical Conscience & Paternal Lineage
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(D45_PLANET_DESCRIPTIONS).map(([planet, pDesc]) => {
              const transDesc = d45Translations?.planetDescriptions?.[planet];
              return (
                <div
                  key={planet}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-cyan-300 transition-all shadow-xs"
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

