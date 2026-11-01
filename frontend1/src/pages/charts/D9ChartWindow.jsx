import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  Sparkles,
  Printer,
  Compass,
  Heart,
  Shield,
  Layers,
  Info,
  Calendar,
  Clock,
  MapPin,
  RefreshCw,
  X,
  PhoneCall,
  Globe,
  Award,
  Zap,
  CheckCircle2,
  AlertTriangle,
  BookOpen
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../utils/kundaliHubStrings';
import { API_BASE_URL, PYTHON_ASTRO_URL } from '../../services/api';
import StandaloneD1Chart from '../../components/StandaloneD1Chart';
import SouthIndianD1Chart from '../../components/SouthIndianD1Chart';
import DynamicVargaAnalysis from '../../components/DynamicVargaAnalysis';
import { D9_INTERPRETATIONS } from '../../data/d9HouseInterpretations';

const PLANET_COLORS = {
  Sun: "#dc2626",
  Moon: "#0284c7",
  Mars: "#ea580c",
  Mercury: "#16a34a",
  Jupiter: "#d97706",
  Venus: "#db2777",
  Saturn: "#475569",
  Rahu: "#4f46e5",
  Ketu: "#7c3aed",
  Ascendant: "#000000",
};

// Sign Names
const SIGN_NAMES_EN = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

// Multilingual Signs
const MULTILINGUAL_SIGNS = {
  en: ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"],
  hi: ["मेष (Aries)", "वृषभ (Taurus)", "मिथुन (Gemini)", "कर्क (Cancer)", "सिंह (Leo)", "कन्या (Virgo)", "तुला (Libra)", "वृश्चिक (Scorpio)", "धनु (Sagittarius)", "मकर (Capricorn)", "कुंभ (Aquarius)", "मीन (Pisces)"],
  ta: ["மேஷம் (Aries)", "ரிஷபம் (Taurus)", "மிதுனம் (Gemini)", "கடகம் (Cancer)", "சிம்மம் (Leo)", "கன்னி (Virgo)", "துலாம் (Libra)", "விருச்சிகம் (Scorpio)", "தனுசு (Sagittarius)", "மகரம் (Capricorn)", "கும்பம் (Aquarius)", "மீனம் (Pisces)"],
  te: ["మేషం (Aries)", "వృషభం (Taurus)", "మిథునం (Gemini)", "కర్కాటకం (Cancer)", "సింహం (Leo)", "కన్య (Virgo)", "తుల (Libra)", "వృశ్చికం (Scorpio)", "ధనుస్సు (Sagittarius)", "మకరం (Capricorn)", "కుంభం (Aquarius)", "మీనం (Pisces)"],
  kn: ["ಮೇಷ (Aries)", "ವೃಷಭ (Taurus)", "ಮಿಥುನ (Gemini)", "ಕರ್ಕಾಟಕ (Cancer)", "ಸಿಂಹ (Leo)", "ಕನ್ಯಾ (Virgo)", "ತುಲಾ (Libra)", "ವೃಶ್ಚಿಕ (Scorpio)", "ಧನು (Sagittarius)", "ಮಕರ (Capricorn)", "ಕುಂಭ (Aquarius)", "ಮೀನ (Pisces)"],
  gu: ["મેષ (Aries)", "વૃષભ (Taurus)", "મિથુન (Gemini)", "કર્ક (Cancer)", "સિંહ (Leo)", "કન્યા (Virgo)", "તુલા (Libra)", "વૃશ્ચિક (Scorpio)", "ધન (Sagittarius)", "મકર (Capricorn)", "કુંભ (Aquarius)", "મીન (Pisces)"],
  mr: ["मेष (Aries)", "वृषभ (Taurus)", "मिथुन (Gemini)", "कर्क (Cancer)", "सिंह (Leo)", "कन्या (Virgo)", "तूळ (Libra)", "वृश्चिक (Scorpio)", "धनु (Sagittarius)", "मकर (Capricorn)", "कुंभ (Aquarius)", "मीन (Pisces)"],
  bn: ["মেষ (Aries)", "বৃষ (Taurus)", "মিথুন (Gemini)", "কর্কট (Cancer)", "সিংহ (Leo)", "কন্যা (Virgo)", "তুলা (Libra)", "বৃশ্চিক (Scorpio)", "ধনু (Sagittarius)", "মকর (Capricorn)", "কুম্ভ (Aquarius)", "মীন (Pisces)"],
  ml: ["മേടം (Aries)", "ഇടവം (Taurus)", "മിഥുനം (Gemini)", "കർക്കടകം (Cancer)", "ചിങ്ങം (Leo)", "കന്നി (Virgo)", "തുലാം (Libra)", "വൃശ്ചികം (Scorpio)", "ധനു (Sagittarius)", "മകരം (Capricorn)", "കുംഭം (Aquarius)", "മീനം (Pisces)"],
  pa: ["ਮੇਖ (Aries)", "ਬ੍ਰਿਖ (Taurus)", "ਮਿਥੁਨ (Gemini)", "ਕਰਕ (Cancer)", "ਸਿੰਘ (Leo)", "ਕੰਨਿਆ (Virgo)", "ਤੁਲਾ (Libra)", "ਬ੍ਰਿਸ਼ਚਕ (Scorpio)", "ਧਨੁ (Sagittarius)", "ਮਕਰ (Capricorn)", "ਕੁੰਭ (Aquarius)", "ਮੀਨ (Pisces)"],
  sa: ["मेषः (Aries)", "वृषभः (Taurus)", "मिथुनम् (Gemini)", "कर्कः (Cancer)", "सिंहः (Leo)", "कन्या (Virgo)", "तुला (Libra)", "वृश्चिकः (Scorpio)", "धनुः (Sagittarius)", "मकरः (Capricorn)", "कुम्भः (Aquarius)", "मीनः (Pisces)"]
};

// Multilingual Sign Lords (0: Mars to 11: Jupiter)
const MULTILINGUAL_LORDS = {
  en: ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"],
  hi: ["मंगल (Mars)", "शुक्र (Venus)", "बुध (Mercury)", "चंद्र (Moon)", "सूर्य (Sun)", "बुध (Mercury)", "शुक्र (Venus)", "मंगल (Mars)", "गुरु (Jupiter)", "शनि (Saturn)", "शनि (Saturn)", "गुरु (Jupiter)"],
  ta: ["செவ்வாய் (Mars)", "சுக்கிரன் (Venus)", "புதன் (Mercury)", "சந்திரன் (Moon)", "சூரியன் (Sun)", "புதன் (Mercury)", "சுக்கிரன் (Venus)", "செவ்வாய் (Mars)", "குரு (Jupiter)", "சனி (Saturn)", "சனி (Saturn)", "குரு (Jupiter)"],
  te: ["కుజుడు (Mars)", "శుక్రుడు (Venus)", "బుధుడు (Mercury)", "చంద్రుడు (Moon)", "సూర్యుడు (Sun)", "బుధుడు (Mercury)", "శుక్రుడు (Venus)", "కుజుడు (Mars)", "గురుడు (Jupiter)", "శని (Saturn)", "శని (Saturn)", "గురుడు (Jupiter)"],
  kn: ["ಮಂಗಳ (Mars)", "ಶುಕ್ರ (Venus)", "ಬುಧ (Mercury)", "ಚಂದ್ರ (Moon)", "ಸೂರ್ಯ (Sun)", "ಬುಧ (Mercury)", "ಶುಕ್ರ (Venus)", "ಮಂಗಳ (Mars)", "ಗುರು (Jupiter)", "ಶನಿ (Saturn)", "ಶನಿ (Saturn)", "ಗುರು (Jupiter)"],
  gu: ["મંગળ (Mars)", "શુક્ર (Venus)", "બુધ (Mercury)", "ચંદ્ર (Moon)", "સૂર્ય (Sun)", "બુધ (Mercury)", "શુક્ર (Venus)", "મંગળ (Mars)", "ગુરુ (Jupiter)", "શનિ (Saturn)", "શનિ (Saturn)", "ગુરુ (Jupiter)"],
  mr: ["मंगळ (Mars)", "शुक्र (Venus)", "बुध (Mercury)", "चंद्र (Moon)", "सूर्य (Sun)", "बुध (Mercury)", "शुक्र (Venus)", "मंगळ (Mars)", "गुरू (Jupiter)", "शनी (Saturn)", "शनी (Saturn)", "गुरू (Jupiter)"],
  bn: ["মঙ্গল (Mars)", "শুক্র (Venus)", "বুধ (Mercury)", "চন্দ্র (Moon)", "সূর্য (Sun)", "বুধ (Mercury)", "শুক্র (Venus)", "মঙ্গল (Mars)", "বৃহস্পতি (Jupiter)", "শনি (Saturn)", "শনি (Saturn)", "বৃহস্পতি (Jupiter)"],
  ml: ["ചൊവ്വ (Mars)", "ശുക്രൻ (Venus)", "ബുധൻ (Mercury)", "ചന്ദ്രൻ (Moon)", "സൂര്യൻ (Sun)", "ബുധൻ (Mercury)", "ശുക്രൻ (Venus)", "ചൊവ്വ (Mars)", "വ്യാഴം (Jupiter)", "ശനി (Saturn)", "ശനി (Saturn)", "വ്യാഴം (Jupiter)"],
  pa: ["ਮੰਗਲ (Mars)", "ਸ਼ੁੱਕਰ (Venus)", "ਬੁੱਧ (Mercury)", "ਚੰਦਰਮਾ (Moon)", "ਸੂਰਜ (Sun)", "ਬੁੱਧ (Mercury)", "ਸ਼ੁੱਕਰ (Venus)", "ਮੰਗਲ (Mars)", "ਗੁਰੂ (Jupiter)", "ਸ਼ਨੀ (Saturn)", "ਸ਼ਨੀ (Saturn)", "ਗੁਰੂ (Jupiter)"],
  sa: ["मङ्गलः (Mars)", "शुक्रः (Venus)", "बुधः (Mercury)", "चन्द्रः (Moon)", "सूर्यः (Sun)", "बुधः (Mercury)", "शुक्रः (Venus)", "मङ्गलः (Mars)", "गुरुः (Jupiter)", "शनिः (Saturn)", "शनिः (Saturn)", "गुरुः (Jupiter)"]
};

// Navamsha Deities (Deva, Nara / Manushya, Rakshasa cycling in 1st, 2nd, 3rd padas)
const D9_DEITIES = ["Deva (दैव)", "Manushya (मानव)", "Rakshasa (राक्षस)"];

// Multilingual translations for D9 Table & UI
const D9_TABLE_I18N = {
  en: {
    heading: "D9 Navamsha Planetary Status",
    subtitle: "Planetary distribution across 9 divisions (3°20' each) representing Soul Destiny, Dharma & Marriage",
    colPlanet: "Planet",
    colLord: "Navamsha Lord",
    colDeity: "Navamsha Deity",
    colSign: "D9 Sign",
    colHouse: "D9 House",
    footerText: "Click on any planet row or chart element to highlight its marriage and soul destiny potential."
  },
  hi: {
    heading: "नवांश कुंडली (D9) ग्रहीय स्थिति",
    subtitle: "प्रत्येक 3°20' भाग में ग्रहों का वितरण - आत्मा की क्षमता, वैवाहिक जीवन एवं भाग्य का सूक्ष्म विश्लेषण",
    colPlanet: "ग्रह",
    colLord: "नवांश स्वामी",
    colDeity: "नवांश प्रकृति/देवता",
    colSign: "D9 राशि",
    colHouse: "D9 भाव",
    footerText: "किसी भी ग्रह पर क्लिक करके उसके वैवाहिक जीवन एवं आत्मिक फल का विवरण देखें।"
  }
};

// Multilingual translations for Navamsha Analysis (D9) section header
const D9_ANALYSIS_HEADER_I18N = {
  en: {
    title: "Navamsha Analysis (D9)",
    subtitle: "The D-9 (Navamsha) chart is the most important divisional chart, representing the soul's true potential, destiny, marriage, and the second half of life. It acts as the microscopic view of the birth chart, revealing the ultimate strength or weakness of planets.",
    houseLabel: "House"
  },
  hi: {
    title: "नवांश विश्लेषण (D9 - विवाह, जीवनसाथी व आत्मिक भाग्य)",
    subtitle: "डी-9 (नवांश) कुंडली सर्वाधिक महत्वपूर्ण वर्ग कुंडली है, जो आत्मा की वास्तविक क्षमता, विवाह, जीवनसाथी का स्वभाव और उत्तरार्ध जीवन का दिग्दर्शन कराती है। यह जन्मकुंडली का सूक्ष्मदर्शी विश्लेषण है।",
    houseLabel: "भाव"
  },
  ta: {
    title: "நவாம்ச பகுப்பாய்வு (D9 - திருமணம் மற்றும் ஆன்ம விதி)",
    subtitle: "டி-9 (நவாம்சம்) சக்கரம் மிக முக்கியமான வர்க்க சக்கரமாகும், இது ஆன்மாவின் உண்மையான ஆற்றல், திருமணம், வாழ்க்கைத் துணை மற்றும் வாழ்வின் இரண்டாம் பாதியை விவரிக்கிறது.",
    houseLabel: "பாவம்"
  },
  te: {
    title: "నవాంశ విశ్లేషణ (D9 - వివాహం, జీవిత భాగస్వామి & ఆత్మ విధి)",
    subtitle: "డి-9 (నవాంశ) చక్రం అత్యంత కీలకమైన వర్గ చక్రం, ఇది ఆత్మ యొక్క వాస్తవ శక్తిని, వైవాహిక జీవితాన్ని, భాగస్వామి స్వభావాన్ని మరియు జీవన ప్రయాణాన్ని వివరిస్తుంది.",
    houseLabel: "భావం"
  },
  kn: {
    title: "ನವಾಂಶ ವಿಶ್ಲೇಷಣೆ (D9 - ವಿವಾಹ, ಸಂಗಾತಿ ಮತ್ತು ಆತ್ಮ ವಿಧಿ)",
    subtitle: "ಡಿ-9 (ನವಾಂಶ) ಕುಂಡಲಿಯು ಅತ್ಯಂತ ಪ್ರಮುಖ ವರ್ಗ ಚಾರ್ಟ್ ಆಗಿದ್ದು, ಆತ್ಮದ ನೈಜ ಸಾಮರ್ಥ್ಯ, ವಿವಾಹ ಜೀವನ, ಸಂಗಾತಿ ಮತ್ತು ಜೀವನದ ಎರಡನೇ ಭಾಗದ ಸ್ಥಿತಿಯನ್ನು ತಿಳಿಸುತ್ತದೆ.",
    houseLabel: "ಭಾವ"
  },
  gu: {
    title: "નવાંશ વિશ્લેષણ (D9 - લગ્નજીવન, જીવનસાથી અને આત્મિક પ્રગતિ)",
    subtitle: "ડી-9 (નવાંશ) કુંડળી સૌથી મહત્વપૂર્ણ વર્ગ કુંડળી છે, જે આત્માની સાચી ક્ષમતા, લગ્નસુખ, જીવનસાથી અને ઉત્તરાર્ધ જીવનનું સૂક્ષ્મ દર્શન કરાવે છે.",
    houseLabel: "ભાવ"
  },
  mr: {
    title: "नवांश विश्लेषण (D9 - विवाह, जोडीदार व आत्मिक भाग्य)",
    subtitle: "डी-9 (नवांश) कुंडली ही अत्यंत महत्त्वाची वर्ग कुंडली असून आत्म्याची खरी क्षमता, वैवाहिक जीवन, जोडीदाराचा स्वभाव आणि उत्तरार्ध आयुष्याचे मार्गदर्शन करते.",
    houseLabel: "भाव"
  },
  bn: {
    title: "নবাংশ বিশ্লেষণ (D9 - বিবাহ, জীবনসঙ্গী ও আত্মিক ভাগ্য)",
    subtitle: "ডি-৯ (নবাংশ) কুন্ডলী সবচেয়ে গুরুত্বপূর্ণ বিভাগীয় চার্ট, যা আত্মার প্রকৃত শক্তি, বিবাহ, দাম্পত্য সুখ এবং জীবনের দ্বিতীয়ার্ধের ভাগ্য নির্দেশ করে।",
    houseLabel: "ভাব"
  },
  ml: {
    title: "നവാംശ വിശകലനം (D9 - വിവാഹം, പങ്കാളി, ആത്മാവിന്റെ വിധി)",
    subtitle: "ഡി-9 (നവാംശം) ചാർട്ട് ഏറ്റവും പ്രധാനപ്പെട്ട വർഗ്ഗ ചാർട്ടാണ്, ഇത് ആത്മാവിന്റെ യഥാർത്ഥ ശക്തി, വിവാഹം, പങ്കാളിയുടെ സ്വഭാവം എന്നിവ വെളിപ്പെടുത്തുന്നു.",
    houseLabel: "ഭാവം"
  },
  pa: {
    title: "ਨਵਾਂਸ਼ ਵਿਸ਼ਲੇਸ਼ਣ (D9 - ਵਿਆਹ, ਜੀਵਨ ਸਾਥੀ ਅਤੇ ਆਤਮਿਕ ਭਾਗ)",
    subtitle: "ਡੀ-9 (ਨਵਾਂਸ਼) ਕੁੰਡਲੀ ਸਭ ਤੋਂ ਮਹੱਤਵਪੂਰਨ ਵਰਗ ਕੁੰਡਲੀ ਹੈ, ਜੋ ਆਤਮਾ ਦੀ ਅਸਲ ਸਮਰੱਥਾ, ਵਿਆਹ, ਜੀਵਨ ਸਾਥੀ ਅਤੇ ਜੀਵਨ ਦੇ ਦੂਜੇ ਪੜਾਅ ਨੂੰ ਪ੍ਰਗਟ ਕਰਦੀ ਹੈ।",
    houseLabel: "ਭਾਵ"
  },
  sa: {
    title: "नवांश विश्लेषणम् (D9 - विवाहः, जीवनसहचरी तथा आत्मिकभाग्यम्)",
    subtitle: "डी-९ (नवांश) चक्रम् आत्मनः वास्तविकसामर्थ्यस्य, विवाहस्य, सहचरीस्वभावस्य तथा उत्तरार्धजीवनस्य सूक्ष्मदिग्दर्शनं कारयति।",
    houseLabel: "भावः"
  }
};

const BulletInterpretation = ({ text, colorClass = "text-slate-600" }) => {
  if (!text) return null;
  const points = text.split(/(?<=\.)\s+|\n+/).filter(p => p.trim());
  return (
    <ul className="space-y-2 relative z-10">
      {points.map((point, i) => (
        <li key={i} className="flex gap-2.5 items-start">
          <span className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${colorClass.replace('text-', 'bg-')} opacity-60`}></span>
          <span className="text-[15px] sm:text-[16px] text-slate-800 leading-relaxed font-serif">{point.trim()}</span>
        </li>
      ))}
    </ul>
  );
};

const calculatePlanetEffects = (reportData) => {
  const effects = {};
  const planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];

  let lagnaSignIndex = 0;
  const lagnaHouse = reportData?.charts?.houses?.[1] || reportData?.charts?.houses?.["1"];
  if (lagnaHouse) {
    lagnaSignIndex = lagnaHouse.sign_index !== undefined ? lagnaHouse.sign_index : Math.floor(lagnaHouse.cusp_deg / 30);
  } else if (reportData?.charts?.ascendant_sign_index !== undefined) {
    lagnaSignIndex = reportData.charts.ascendant_sign_index;
  }

  const lagnaMap = {
    0: { benefic: ["Sun", "Moon", "Mars", "Jupiter"], malefic: ["Mercury", "Venus", "Saturn"] },
    1: { benefic: ["Sun", "Mercury", "Saturn", "Mars"], malefic: ["Moon", "Jupiter", "Venus"] },
    2: { benefic: ["Venus"], malefic: ["Sun", "Mars", "Jupiter"] },
    3: { benefic: ["Moon", "Mars", "Jupiter"], malefic: ["Mercury", "Venus", "Saturn"] },
    4: { benefic: ["Sun", "Mars", "Jupiter"], malefic: ["Moon", "Mercury", "Venus", "Saturn"] },
    5: { benefic: ["Venus"], malefic: ["Moon", "Mars", "Jupiter"] },
    6: { benefic: ["Mercury", "Saturn", "Venus"], malefic: ["Sun", "Moon", "Mars", "Jupiter"] },
    7: { benefic: ["Moon", "Sun", "Jupiter"], malefic: ["Mercury", "Venus", "Saturn"] },
    8: { benefic: ["Sun", "Mars"], malefic: ["Venus", "Saturn", "Mercury"] },
    9: { benefic: ["Mercury", "Venus", "Saturn"], malefic: ["Moon", "Mars", "Jupiter"] },
    10: { benefic: ["Venus", "Saturn", "Mars"], malefic: ["Moon", "Jupiter"] },
    11: { benefic: ["Moon", "Mars", "Jupiter"], malefic: ["Sun", "Venus", "Saturn"] }
  };
  const lagnaData = lagnaMap[lagnaSignIndex] || { benefic: [], malefic: [] };

  planets.forEach(p => {
    if (p === "Rahu" || p === "Ketu") {
      effects[p] = "negative";
    } else if (lagnaData.benefic.includes(p)) {
      effects[p] = "positive";
    } else if (lagnaData.malefic.includes(p)) {
      effects[p] = "negative";
    } else {
      effects[p] = "neutral";
    }
  });

  effects["Ascendant"] = "neutral";
  return effects;
};

/**
 * Calculates D9 Navamsha chart based on classical Parashara rule:
 * - Movable signs (Aries, Cancer, Libra, Capricorn): start from sign itself
 * - Fixed signs (Taurus, Leo, Scorpio, Aquarius): start from 9th sign from itself (signIdx + 8)
 * - Dual signs (Gemini, Virgo, Sagittarius, Pisces): start from 5th sign from itself (signIdx + 4)
 * Segment = 30° / 9 = 3°20' = 3.333333°
 */
function calculateD9Navamsha(basePlanets = [], baseAscDeg = 0, lang = 'en') {
  const lords = MULTILINGUAL_LORDS[lang] || MULTILINGUAL_LORDS['hi'] || MULTILINGUAL_LORDS['en'];
  const signNames = MULTILINGUAL_SIGNS[lang] || MULTILINGUAL_SIGNS['hi'] || MULTILINGUAL_SIGNS['en'];

  const MOVABLE = [0, 3, 6, 9];
  const FIXED = [1, 4, 7, 10];

  const getD9Info = (totalDeg) => {
    const normDeg = ((totalDeg % 360) + 360) % 360;
    const baseSignIdx = Math.floor(normDeg / 30);
    const degInSign = normDeg % 30;

    const navamsaPart = Math.min(Math.floor(degInSign / (30.0 / 9.0)), 8);

    let startSign;
    if (MOVABLE.includes(baseSignIdx)) {
      startSign = baseSignIdx;
    } else if (FIXED.includes(baseSignIdx)) {
      startSign = (baseSignIdx + 8) % 12;
    } else {
      startSign = (baseSignIdx + 4) % 12;
    }

    const d9SignIndex = (startSign + navamsaPart) % 12;
    const deity = D9_DEITIES[navamsaPart % 3];

    return {
      d9SignIndex,
      part: navamsaPart,
      deity,
      lord: lords[d9SignIndex] || lords[0],
      translatedSign: signNames[d9SignIndex] || SIGN_NAMES_EN[d9SignIndex]
    };
  };

  const ascD9 = getD9Info(baseAscDeg);
  const ascD9Sign = ascD9.d9SignIndex;

  const d9Houses = {};
  for (let h = 1; h <= 12; h++) {
    const signIndex = (ascD9Sign + (h - 1)) % 12;
    d9Houses[h] = {
      sign_index: signIndex,
      planets: []
    };
  }

  const d9PlanetPositions = [];

  basePlanets.forEach((p) => {
    const pDeg = Number(p.degree !== undefined ? p.degree : p.lon || 0);
    const dInfo = getD9Info(pDeg);

    const houseNum = ((dInfo.d9SignIndex - ascD9Sign + 12) % 12) + 1;

    const pCopy = {
      ...p,
      house: houseNum,
      sign_index: dInfo.d9SignIndex,
      sign: dInfo.translatedSign,
      d9Part: dInfo.part + 1,
      deity: dInfo.deity,
      d9Lord: dInfo.lord
    };

    d9PlanetPositions.push(pCopy);

    if (d9Houses[houseNum]) {
      d9Houses[houseNum].planets.push(pCopy);
    }
  });

  return {
    d9Houses,
    d9PlanetPositions,
    ascD9Sign,
    ascD9
  };
}

export default function D9ChartWindow() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [chartStyle, setChartStyle] = useState('north');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const audioRef = useRef(null);

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
  const [d9Translations, setD9Translations] = useState(null);
  const [d9InterpretationsMap, setD9InterpretationsMap] = useState({});
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
      if (res.data?.success && res.data?.data) {
        setTranslations(res.data.data);
      }
    } catch (e) {
      console.warn("Language load failed:", e);
    } finally {
      setIsLangLoading(false);
    }
  };

  // Load General UI Dictionary & D9 Navamsha Database Interpretations
  useEffect(() => {
    if (!currentLang || currentLang === 'en') {
      setTranslations(null);
      setD9Translations(null);
      return;
    }

    const loadDictionaryAndD9 = async () => {
      setIsLangLoading(true);
      try {
        // 1. Astro Dictionary
        const localCacheKey = `astro_dict_${currentLang}`;
        const cached = localStorage.getItem(localCacheKey);
        if (cached) {
          setTranslations(JSON.parse(cached));
        } else {
          const res = await axios.get(`${API_BASE_URL}/translate/astro-dictionary/${currentLang}`);
          if (res.data?.success && res.data?.data) {
            setTranslations(res.data.data);
            localStorage.setItem(localCacheKey, JSON.stringify(res.data.data));
          }
        }

        // 2. D9 Navamsha Database Interpretations
        const d9CacheKey = `d9_navamsha_trans_${currentLang}`;
        const cachedD9 = localStorage.getItem(d9CacheKey);
        if (cachedD9) {
          setD9Translations(JSON.parse(cachedD9));
        } else {
          const d9Res = await axios.get(`${API_BASE_URL}/translate/d9-navamsha/${currentLang}`);
          if (d9Res.data?.success && d9Res.data?.data) {
            setD9Translations(d9Res.data.data);
            localStorage.setItem(d9CacheKey, JSON.stringify(d9Res.data.data));
          }
        }
      } catch (err) {
        console.warn(`Could not load translations for ${currentLang}:`, err.message);
      } finally {
        setIsLangLoading(false);
      }
    };

    loadDictionaryAndD9();
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
        if (candidate && (candidate.charts || candidate.vargas?.d9)) {
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
      const response = await axios.post((PYTHON_ASTRO_URL.includes('/api/kundali') ? `${PYTHON_ASTRO_URL}/report/data` : `${PYTHON_ASTRO_URL}/api/report/data`), {
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
        const fallbackRes = await axios.post((PYTHON_ASTRO_URL.includes('/api/kundali') ? `${PYTHON_ASTRO_URL}/calc` : `${PYTHON_ASTRO_URL}/api/kundali`), {
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
          throw new Error('Both calculation endpoints failed.');
        }
      } catch (fErr) {
        setError('Failed to compute D9 Navamsha Kundali. Please make sure the astrology backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Audio Playback
  useEffect(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('/sounds/swasti_vachan_mantra.mp3');
        audioRef.current.loop = true;
      }
      audioRef.current.volume = 0.65;
      audioRef.current.play().catch(e => console.log('Audio autoplay prevented:', e));
    } catch (err) {
      console.log('Audio error:', err);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isAudioMuted) {
      audioRef.current.play().catch(() => { });
      setIsAudioMuted(false);
    } else {
      audioRef.current.pause();
      setIsAudioMuted(true);
    }
  };

  const basePlanets = reportData?.planet_positions || [];
  const baseAscDeg = reportData?.charts?.ascendant_deg !== undefined
    ? reportData.charts.ascendant_deg
    : (reportData?.charts?.houses?.[1]?.cusp_deg || 0);

  const calculatedD9 = calculateD9Navamsha(basePlanets, baseAscDeg, currentLang);

  let d9Houses = calculatedD9.d9Houses;
  let d9PlanetPositions = calculatedD9.d9PlanetPositions;

  if (reportData?.vargas?.d9?.houses) {
    const backendHouses = reportData.vargas.d9.houses;
    d9Houses = backendHouses;

    const positions = [];
    Object.entries(backendHouses).forEach(([hNum, hData]) => {
      (hData.planets || []).forEach(p => {
        const pName = typeof p === 'string' ? p : (p.planet || p.name);
        if (pName === 'Ascendant' || pName === 'Lagna') return;
        const matchingBase = calculatedD9.d9PlanetPositions.find(x => x.planet === pName);
        positions.push({
          planet: pName,
          house: parseInt(hNum),
          sign_index: hData.sign_index,
          sign: MULTILINGUAL_SIGNS[currentLang]?.[hData.sign_index] || SIGN_NAMES_EN[hData.sign_index],
          d9Part: matchingBase?.d9Part || 1,
          deity: matchingBase?.deity || D9_DEITIES[0],
          d9Lord: matchingBase?.d9Lord || MULTILINGUAL_LORDS[currentLang]?.[hData.sign_index] || 'Mars',
          is_retrograde: typeof p === 'object' ? p.is_retrograde : false,
          is_combust: typeof p === 'object' ? p.is_combust : false
        });
      });
    });

    if (positions.length > 0) {
      d9PlanetPositions = positions;
    }
  }

  const effects = calculatePlanetEffects(reportData);
  const tableI18n = D9_TABLE_I18N[currentLang] || D9_TABLE_I18N['hi'] || D9_TABLE_I18N['en'];
  const analysisHeaderI18n = D9_ANALYSIS_HEADER_I18N[currentLang] || D9_ANALYSIS_HEADER_I18N['hi'] || D9_ANALYSIS_HEADER_I18N['en'];

  // Translate D9 interpretations when language changes
  useEffect(() => {
    if (!currentLang || currentLang === 'en' || !d9PlanetPositions.length) {
      setD9InterpretationsMap({});
      return;
    }

    const localCacheKey = `d9_interp_${currentLang}`;
    let cachedMap = {};
    try {
      const stored = localStorage.getItem(localCacheKey);
      if (stored) cachedMap = JSON.parse(stored);
    } catch (e) { }

    const itemsToTranslate = [];
    d9PlanetPositions.forEach(p => {
      const status = effects && effects[p.planet] ? effects[p.planet] : "neutral";
      const statusKey = status === "positive" ? "positive" : status === "negative" ? "negative" : "neutral";
      const rawText = D9_INTERPRETATIONS[p.planet]?.[p.house]?.[statusKey];
      if (rawText) {
        const key = `${p.planet}_${p.house}_${statusKey}`;
        if (!cachedMap[key]) {
          itemsToTranslate.push({ key, text: rawText });
        }
      }
    });

    if (itemsToTranslate.length === 0) {
      setD9InterpretationsMap(cachedMap);
      return;
    }

    if (Object.keys(cachedMap).length > 0) {
      setD9InterpretationsMap(cachedMap);
    }

    const langName = SUPPORTED_LANGUAGES.find(l => l.code === currentLang)?.name || currentLang;
    axios.post(`${API_BASE_URL}/translate/d9-interpretations`, {
      targetLang: currentLang,
      targetLangName: langName,
      items: itemsToTranslate
    })
      .then(res => {
        if (res.data?.success && res.data?.translations) {
          const merged = { ...cachedMap, ...res.data.translations };
          setD9InterpretationsMap(merged);
          try {
            localStorage.setItem(localCacheKey, JSON.stringify(merged));
          } catch (e) { }
        }
      })
      .catch(err => {
        console.warn('D9 interpretation translation request failed:', err.message);
      });
  }, [currentLang, d9PlanetPositions.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white px-4">
        <div className="relative mb-6">
          <div className="w-20 h-20 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
          <Heart className="w-8 h-8 text-amber-400 absolute inset-0 m-auto animate-pulse" />
        </div>
        <h2 className="text-xl md:text-2xl font-serif font-black tracking-wide text-amber-200">
          Synthesizing D9 Navamsha (नवांश कुंडली)...
        </h2>
        <p className="text-sm text-slate-400 mt-2">Computing Parashara 9-fold divisions, deities, soul destiny & marriage potential</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4">
        <div className="p-4 bg-red-950/50 border border-red-500/40 rounded-2xl max-w-md text-center">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-red-200">Calculation Error</h3>
          <p className="text-sm text-red-300 mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition"
          >
            Retry Calculation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-sm shadow-amber-500/30">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif font-black text-slate-900 text-base md:text-lg flex items-center gap-2">
                D9 Navamsha Chart
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  विवाह, जीवनसाथी व आत्मिक भाग्य
                </span>
              </h1>
              <p className="text-[16px] text-slate-900 font-medium hidden sm:block">
                {name} • {date} • {time} • {locationName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={toggleAudio}
              className={`p-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${!isAudioMuted
                ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/60'
                }`}
              title={isAudioMuted ? 'Play Swasti Vachan Mantra' : 'Mute Mantra'}
            >
              <Zap className="w-4 h-4 text-amber-600" />
              <span className="hidden md:inline">{isAudioMuted ? 'Play Audio' : 'Mute Audio'}</span>
            </button>

            {/* Language Selector */}
            <div className="relative">
              <select
                value={currentLang}
                onChange={(e) => handleLanguageChange(e.target.value)}
                disabled={isLangLoading}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 px-3 rounded-xl border border-slate-300 cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.native} ({l.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
              title="Print D9 Chart"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Close Window */}
            <button
              onClick={() => window.close()}
              className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition"
              title="Close Tab"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 md:px-6 py-6 space-y-6 flex-grow">
        {/* ROW 1: D9 Chart Visual + D9 Planetary Distribution Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* D9 Chart Container */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center">
            {chartStyle === 'north' ? (
              <StandaloneD1Chart
                houses={d9Houses}
                planetPositions={d9PlanetPositions}
                title="D9 Navamsha Chart (नवांश कुंडली - विवाह, जीवनसाथी एवं आत्मिक भाग्य)"
                lang={currentLang}
                onPlanetClick={(pName) => setSelectedPlanet(pName)}
                headerExtra={
                  <div className="inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200/90 shadow-2xs items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setChartStyle('north')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${chartStyle === 'north'
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-black'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                    >
                      <span className="text-blue-600 text-[13px] leading-none">🔷</span>
                      <span>North Indian (उत्तर)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartStyle('south')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${chartStyle === 'south'
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-black'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                    >
                      <span className="text-orange-600 text-[13px] leading-none">🔶</span>
                      <span>South Indian (दक्षिण)</span>
                    </button>
                  </div>
                }
              />
            ) : (
              <SouthIndianD1Chart
                houses={d9Houses}
                planetPositions={d9PlanetPositions}
                title="D9 Navamsha Chart (नवांश कुंडली - विवाह, जीवनसाथी एवं आत्मिक भाग्य)"
                lang={currentLang}
                onPlanetClick={(pName) => setSelectedPlanet(pName)}
                headerExtra={
                  <div className="inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200/90 shadow-2xs items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setChartStyle('north')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${chartStyle === 'north'
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-black'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                    >
                      <span className="text-blue-600 text-[13px] leading-none">🔷</span>
                      <span>North Indian (उत्तर)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartStyle('south')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${chartStyle === 'south'
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-black'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                        }`}
                    >
                      <span className="text-orange-600 text-[13px] leading-none">🔶</span>
                      <span>South Indian (दक्षिण)</span>
                    </button>
                  </div>
                }
              />
            )}
          </div>

          {/* D9 Planetary Positions Table Card */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col h-full">
            <div className="flex justify-between items-center bg-amber-50 border border-amber-200/80 p-3.5 rounded-2xl mb-4">
              <div>
                <h2 className="text-base font-black font-serif text-slate-900 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-amber-600" />
                  {tableI18n.heading}
                </h2>
                <p className="text-xs font-bold text-amber-900 mt-0.5">
                  {tableI18n.subtitle}
                </p>
              </div>
              <span className="text-xs font-black text-amber-950 bg-white px-2.5 py-1 rounded-full border border-amber-300">
                16-Varga D9
              </span>
            </div>

            <div className="overflow-x-auto flex-grow max-h-[480px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[14px] font-bold uppercase tracking-wider text-black bg-slate-50/90">
                    <th className="py-3 px-3">{tableI18n.colPlanet}</th>
                    <th className="py-3 px-3">{tableI18n.colLord}</th>
                    <th className="py-3 px-3">{tableI18n.colDeity}</th>
                    <th className="py-3 px-3">{tableI18n.colSign}</th>
                    <th className="py-3 px-3">{tableI18n.colHouse}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-sm">
                  {d9PlanetPositions.map((p) => {
                    const color = PLANET_COLORS[p.planet] || "#0f172a";
                    const isSelected = selectedPlanet === p.planet;
                    const translatedPlanet = translations?.planets?.[p.planet] || p.planet;

                    return (
                      <tr
                        key={p.planet}
                        onClick={() => setSelectedPlanet(p.planet)}
                        className={`hover:bg-amber-50/60 cursor-pointer transition ${isSelected ? "bg-amber-100/70 font-bold" : ""}`}
                      >
                        <td className="py-3 px-3 font-sans font-bold flex items-center gap-2 text-base" style={{ color }}>
                          <span>{translatedPlanet}</span>
                        </td>
                        <td className="py-3 px-3 font-sans font-semibold text-slate-800 text-xs">
                          {p.d9Lord}
                        </td>
                        <td className="py-3 px-3 font-sans font-bold text-amber-800 text-xs">
                          <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            {p.deity}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-sans font-semibold text-black">
                          {p.sign}
                        </td>
                        <td className="py-3 px-3 font-black text-amber-900 text-base">
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

        {/* Dynamic AI Assessment (Deity & Vargottama Analysis) if available in reportData */}
        {reportData && <DynamicVargaAnalysis data={reportData} cid="d9" lang={currentLang} dbDynamicAi={d9Translations?.dynamicAi} />}

        {/* ROW 2: Navamsha Analysis (D9) - Matching Interactive Worksheet with Multi-Language Support */}
        <section id="section-d9-interpretations" className="bg-white p-6 md:p-8 rounded-3xl border border-amber-200 shadow-xl space-y-6">
          <div className="border-b border-amber-200/80 pb-4">
            <h3 className="text-3xl font-serif italic uppercase mb-2 text-slate-900">
              {d9Translations?.ui?.sectionTitle || analysisHeaderI18n.title}
            </h3>
            <p className="text-[15px] text-amber-900 italic">
              {d9Translations?.ui?.sectionSubtitle || analysisHeaderI18n.subtitle}
            </p>
          </div>

          <div className="space-y-6">
            {d9PlanetPositions.map((p) => {
              const status = effects && effects[p.planet] ? effects[p.planet] : "neutral";
              const statusKey = status === "positive" ? "positive" : status === "negative" ? "negative" : "neutral";
              const key = `${p.planet}_${p.house}_${statusKey}`;
              const rawInterpretation = D9_INTERPRETATIONS[p.planet]?.[p.house]?.[statusKey];
              if (!rawInterpretation) return null;

              // Priority: 1. DB D9 Translation, 2. Dynamic translations map, 3. Raw English
              const dbInterp = d9Translations?.interpretations?.[p.planet]?.[p.house]?.[statusKey];
              const displayText = dbInterp || d9InterpretationsMap[key] || rawInterpretation;
              const translatedPlanetName = translations?.planets?.[p.planet] || p.planet;
              const houseLabel = d9Translations?.ui?.houseBadge || analysisHeaderI18n.houseLabel;

              const isSelected = selectedPlanet === p.planet;

              return (
                <section
                  key={p.planet}
                  onClick={() => setSelectedPlanet(p.planet)}
                  className={`rounded-2xl p-6 border transition cursor-pointer ${statusKey === 'positive'
                    ? 'bg-green-50 border-green-200 hover:border-green-400'
                    : statusKey === 'negative'
                      ? 'bg-red-50 border-red-200 hover:border-red-400'
                      : 'bg-blue-50 border-blue-200 hover:border-blue-400'
                    } ${isSelected ? 'ring-2 ring-amber-400 shadow-md' : ''}`}
                >
                  <h4
                    className={`text-lg font-black uppercase mb-2 ${statusKey === 'positive'
                      ? 'text-green-900'
                      : statusKey === 'negative'
                        ? 'text-red-900'
                        : 'text-blue-900'
                      }`}
                  >
                    {translatedPlanetName} · {houseLabel} {p.house} <span className="text-xs ml-2 opacity-60">({statusKey})</span>
                  </h4>
                  <BulletInterpretation text={displayText} colorClass="text-slate-900" />
                </section>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

