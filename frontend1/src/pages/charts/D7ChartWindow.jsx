import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  Sparkles,
  Printer,
  Compass,
  Baby,
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
  BookOpen,
  Heart
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../utils/kundaliHubStrings';
import { API_BASE_URL } from '../../services/api';
import StandaloneD1Chart from '../../components/StandaloneD1Chart';
import SouthIndianD1Chart from '../../components/SouthIndianD1Chart';
import DynamicVargaAnalysis from '../../components/DynamicVargaAnalysis';
import { D7_INTERPRETATIONS } from '../../data/d7HouseInterpretations';

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
  bn: ["মঙ্গল (Mars)", "শুক্র (Venus)", "বুধ (Mercury)", "চন্দ্র (Moon)", "সূর্য (Sun)", "বুध (Mercury)", "শুক্র (Venus)", "মঙ্গল (Mars)", "বৃহস্পতি (Jupiter)", "শনি (Saturn)", "শনি (Saturn)", "বৃহস্পতি (Jupiter)"],
  ml: ["ചൊവ്വ (Mars)", "ശുക്രൻ (Venus)", "ബുധൻ (Mercury)", "ചന്ദ്രൻ (Moon)", "സൂര്യൻ (Sun)", "ബുധൻ (Mercury)", "ശുക്രൻ (Venus)", "ചൊവ്വ (Mars)", "വ്യാഴം (Jupiter)", "ശനി (Saturn)", "ശനി (Saturn)", "വ്യാഴം (Jupiter)"],
  pa: ["ਮੰਗਲ (Mars)", "ਸ਼ੁੱਕਰ (Venus)", "ਬੁੱਧ (Mercury)", "ਚੰਦਰਮਾ (Moon)", "ਸੂਰਜ (Sun)", "ਬੁੱਧ (Mercury)", "ਸ਼ੁੱਕਰ (Venus)", "ਮੰਗਲ (Mars)", "ਗੁਰੂ (Jupiter)", "ਸ਼ਨੀ (Saturn)", "ਸ਼ਨੀ (Saturn)", "ਗੁਰੂ (Jupiter)"],
  sa: ["मङ्गलः (Mars)", "शुक्रः (Venus)", "बुधः (Mercury)", "चन्द्रः (Moon)", "सूर्यः (Sun)", "बुधः (Mercury)", "शुक्रः (Venus)", "मङ्गलः (Mars)", "गुरुः (Jupiter)", "शनिः (Saturn)", "शनिः (Saturn)", "गुरुः (Jupiter)"]
};

// Saptamsha Deities:
// Odd signs: Kshara, Ksheera, Dadhi, Ajya (Ghrita), Ikshu, Madhya, Shuddhajala
// Even signs: In reverse order: Shuddhajala, Madhya, Ikshu, Ajya, Dadhi, Ksheera, Kshara
const D7_DEITIES_ODD = ["Kshara", "Ksheera", "Dadhi", "Ajya", "Ikshurasa", "Madya", "Shuddhajala"];
const D7_DEITIES_EVEN = ["Shuddhajala", "Madya", "Ikshurasa", "Ajya", "Dadhi", "Ksheera", "Kshara"];

// Multilingual translations for D7 Table & UI
const D7_TABLE_I18N = {
  en: {
    heading: "D7 Saptamsha Planetary Status",
    subtitle: "Planetary distribution across 7 divisions (4°17'08.57\" each) representing Children, Progeny & Creative Lineage",
    colPlanet: "Planet",
    colLord: "Saptamsha Lord",
    colDeity: "Vedic Deity",
    colSign: "D7 Sign",
    colHouse: "D7 House",
    footerText: "Click on any planet row or chart element to highlight its progeny and creative potential."
  },
  hi: {
    heading: "सप्तांश कुंडली (D7) ग्रहीय स्थिति",
    subtitle: "प्रत्येक 4°17'08.57\" भाग में ग्रहों का वितरण - संतान, संतति सुख एवं रचनात्मक क्षमता का सूक्ष्म विश्लेषण",
    colPlanet: "ग्रह",
    colLord: "सप्तांश स्वामी",
    colDeity: "वैदिक देवता",
    colSign: "D7 राशि",
    colHouse: "D7 भाव",
    footerText: "किसी भी ग्रह पर क्लिक करके उसकी संतान सुख एवं रचनात्मकता का फल देखें।"
  }
};

// Multilingual translations for Saptamsa Analysis (D7) section header
const D7_ANALYSIS_HEADER_I18N = {
  en: {
    title: "Saptamsa Analysis (D7)",
    subtitle: "The D7 (Saptamsha) chart is the primary divisional chart for analyzing progeny (children), creativity, and the legacy you leave behind. It reveals your nurturing capacity and creative intelligence.",
    houseLabel: "House"
  },
  hi: {
    title: "सप्तांश विश्लेषण (D7 - संतान, संतति एवं रचनात्मकता)",
    subtitle: "सप्तांश (D7) कुंडली संतान सुख, वंश वृद्धि, रचनात्मकता और भावी पीढ़ी की विरासत का मुख्य आधार है। यह आपकी संतति-पालन क्षमता एवं अंतर्निहित रचनात्मक बुद्धिमत्ता को प्रकट करती है।",
    houseLabel: "भाव"
  },
  ta: {
    title: "சப்தாம்ச பகுப்பாய்வு (D7 - புத்திர பாக்கியம் & படைப்பாற்றல்)",
    subtitle: "டி7 (சப்தாம்சம்) சக்கரம் புத்திர பாக்கியம் (குழந்தைகள்), சந்ததி வளர்ச்சி, படைப்பாற்றல் மற்றும் தலைமுறை நன்மைகளை ஆராய்வதற்கான முதன்மை வர்க்க சக்கரமாகும்.",
    houseLabel: "பாவம்"
  },
  te: {
    title: "సప్తాంశ విశ్లేషణ (D7 - సంతాన భాగ్యం & సృజనాత్మకత)",
    subtitle: "డి7 (సప్తాంశ) చక్రం సంతానం, పిల్లల యోగం, సృజనాత్మక ప్రతిభ మరియు వంశాభివృద్ధిని విశ్లేషించే ప్రధాన వర్గ చక్రం.",
    houseLabel: "భావం"
  },
  kn: {
    title: "ಸಪ್ತಾಂಶ ವಿಶ್ಲೇಷಣೆ (D7 - ಸಂತಾನ ಸುಖ ಮತ್ತು ಸೃಜನಶೀಲತೆ)",
    subtitle: "ಡಿ7 (ಸಪ್ತಾಂಶ) ಕುಂಡಲಿಯು ಸಂತಾನ ಭಾಗ್ಯ, ಮಕ್ಕಳ ಶ್ರೇಯಸ್ಸು, ಸೃಜನಶೀಲತೆ ಮತ್ತು ವಂಶ ವೃದ್ಧಿಯನ್ನು ತಿಳಿಸುವ ಪ್ರಮುಖ ವರ್ಗ ಚಾರ್ಟ್ ಆಗಿದೆ.",
    houseLabel: "ಭಾವ"
  },
  gu: {
    title: "સપ્તાંશ વિશ્લેષણ (D7 - સંતાન સુખ અને સર્જનાત્મકતા)",
    subtitle: "ડી7 (સપ્તાંશ) કુંડળી સંતાન પ્રાપ્તિ, બાળકોનું સુખ, સર્જનાત્મક ક્ષમતા અને વંશ વૃદ્ધિનું વિશ્લેષણ કરવા માટેની મુખ્ય કુંડળી છે.",
    houseLabel: "ભાવ"
  },
  mr: {
    title: "सप्तांश विश्लेषण (D7 - संतती सुख व सर्जनशीलता)",
    subtitle: "सप्तांश (D7) कुंडली ही संतती सुख, अपत्य प्राप्ती, सर्जनशीलता आणि वंशवृद्धीचे विश्लेषण करणारी प्रमुख वर्ग कुंडली आहे.",
    houseLabel: "भाव"
  },
  bn: {
    title: "সপ্তাংশ বিশ্লেষণ (D7 - সন্তান ভাগ্য ও সৃজনশীলতা)",
    subtitle: "ডি৭ (সপ্তাংশ) কুন্ডলী সন্তান সন্ততি, সন্তান সুখ, বংশবৃদ্ধি এবং সৃজনশীল প্রতিভার গভীর পর্যালোচনার প্রধান চার্ট।",
    houseLabel: "ভাব"
  },
  ml: {
    title: "സപ്താംശ വിശകലനം (D7 - സന്താന ഭാഗ്യവും സർഗ്ഗാത്മകതയും)",
    subtitle: "ഡി7 (സപ്താംശം) ചാർട്ട് സന്താനങ്ങൾ, സന്താന സുഖം, സർഗ്ഗാത്മക കഴിവുകൾ, വംശ പരമ്പര എന്നിവ മനസ്സിലാക്കുന്നതിനുള്ള പ്രധാന വർഗ്ഗ ചാർട്ടാണ്.",
    houseLabel: "ഭാവം"
  },
  pa: {
    title: "ਸਪਤਾਂਸ਼ ਵਿਸ਼ਲੇਸ਼ਣ (D7 - ਸੰਤਾਨ ਸੁੱਖ ਅਤੇ ਸਿਰਜਣਾਤਮਕਤਾ)",
    subtitle: "ਡੀ7 (ਸਪਤਾਂਸ਼) ਕੁੰਡਲੀ ਸੰਤਾਨ ਸੁੱਖ, ਬੱਚਿਆਂ ਦੀ ਤਰੱਕੀ, ਵੰਸ਼ ਵਾਧੇ ਅਤੇ ਰਚਨਾਤਮਕ ਸਮਰੱਥਾ ਦਾ ਮੁਲਾਂਕਣ ਕਰਨ ਵਾਲਾ ਮੁੱਖ ਚਾਰਟ ਹੈ।",
    houseLabel: "ਭਾਵ"
  },
  sa: {
    title: "सप्तांश विश्लेषणम् (D7 - संतानसुखं तथा सृजनशीलता)",
    subtitle: "सप्तांश (D7) चक्रं संततिसुखस्य, वंशपरंपरायाः, सृजनशीलतायाश्च सूक्ष्मविश्लेषणार्थं प्रमुखं वर्गचक्रमस्ति।",
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

/**
 * Calculates planet benefic/malefic/neutral functional effects matching InteractiveWorksheet
 */
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
 * Calculates D7 Saptamsha chart based on classical Parashara rule:
 * - Odd sign (Aries, Gemini, Leo, Libra, Sagittarius, Aquarius):
 *   Count from the sign itself (start_sign = signIdx).
 * - Even sign (Taurus, Cancer, Virgo, Scorpio, Capricorn, Pisces):
 *   Count from the 7th sign from itself (start_sign = signIdx + 6).
 * Segment = 30° / 7 = 4.2857142857° (4°17'08.57")
 */
function calculateD7Saptamsha(basePlanets = [], baseAscDeg = 0, lang = 'en') {
  const lords = MULTILINGUAL_LORDS[lang] || MULTILINGUAL_LORDS['hi'] || MULTILINGUAL_LORDS['en'];
  const signNames = MULTILINGUAL_SIGNS[lang] || MULTILINGUAL_SIGNS['hi'] || MULTILINGUAL_SIGNS['en'];

  const getD7Info = (totalDeg) => {
    const normDeg = ((totalDeg % 360) + 360) % 360;
    const baseSignIdx = Math.floor(normDeg / 30);
    const degInSign = normDeg % 30;

    const div = Math.floor(degInSign / (30 / 7));
    const clampedDiv = Math.min(6, Math.max(0, div));

    const isOddSign = (baseSignIdx % 2 === 0); // 0=Aries (odd in astrology), 1=Taurus (even), etc.
    const startSign = isOddSign ? baseSignIdx : (baseSignIdx + 6);
    const d7SignIndex = (startSign + clampedDiv) % 12;

    const deity = isOddSign ? D7_DEITIES_ODD[clampedDiv] : D7_DEITIES_EVEN[clampedDiv];

    return {
      d7SignIndex,
      part: clampedDiv,
      deity,
      lord: lords[d7SignIndex] || lords[0],
      translatedSign: signNames[d7SignIndex] || SIGN_NAMES_EN[d7SignIndex]
    };
  };

  const ascD7 = getD7Info(baseAscDeg);
  const ascD7Sign = ascD7.d7SignIndex;

  // Initialize 12 houses starting from Ascendant's D7 sign
  const d7Houses = {};
  for (let h = 1; h <= 12; h++) {
    const signIndex = (ascD7Sign + (h - 1)) % 12;
    d7Houses[h] = {
      sign_index: signIndex,
      planets: []
    };
  }

  const d7PlanetPositions = [];

  basePlanets.forEach((p) => {
    const pDeg = Number(p.degree !== undefined ? p.degree : p.lon || 0);
    const dInfo = getD7Info(pDeg);

    // Calculate house offset from Ascendant's D7 sign (1-indexed)
    const houseNum = ((dInfo.d7SignIndex - ascD7Sign + 12) % 12) + 1;

    const pCopy = {
      ...p,
      house: houseNum,
      sign_index: dInfo.d7SignIndex,
      sign: dInfo.translatedSign,
      d7Part: dInfo.part + 1,
      deity: dInfo.deity,
      d7Lord: dInfo.lord
    };

    d7PlanetPositions.push(pCopy);

    if (d7Houses[houseNum]) {
      d7Houses[houseNum].planets.push(pCopy);
    }
  });

  return {
    d7Houses,
    d7PlanetPositions,
    ascD7Sign,
    ascD7
  };
}

export default function D7ChartWindow() {
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
  const [d7InterpretationsMap, setD7InterpretationsMap] = useState({});
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

  // Load General UI Dictionary & Planet Translations
  useEffect(() => {
    if (!currentLang || currentLang === 'en') {
      setTranslations(null);
      return;
    }

    const loadDictionary = async () => {
      setIsLangLoading(true);
      try {
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
      } catch (err) {
        console.warn(`Could not load translations for ${currentLang}:`, err.message);
      } finally {
        setIsLangLoading(false);
      }
    };

    loadDictionary();
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
        if (candidate && (candidate.charts || candidate.vargas?.d7)) {
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
          throw new Error('Both calculation endpoints failed.');
        }
      } catch (fErr) {
        setError('Failed to compute D7 Saptamsha Kundali. Please make sure the astrology backend is running.');
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

  // Prefer backend calculated D7 varga houses if available, otherwise compute with Parashara classical rule
  const basePlanets = reportData?.planet_positions || [];
  const baseAscDeg = reportData?.charts?.ascendant_deg !== undefined
    ? reportData.charts.ascendant_deg
    : (reportData?.charts?.houses?.[1]?.cusp_deg || 0);

  const calculatedD7 = calculateD7Saptamsha(basePlanets, baseAscDeg, currentLang);

  // If backend provided pre-computed vargas.d7, use its house structures
  let d7Houses = calculatedD7.d7Houses;
  let d7PlanetPositions = calculatedD7.d7PlanetPositions;

  if (reportData?.vargas?.d7?.houses) {
    const backendHouses = reportData.vargas.d7.houses;
    d7Houses = backendHouses;

    // Map planet positions with houses from backend D7
    const positions = [];
    Object.entries(backendHouses).forEach(([hNum, hData]) => {
      (hData.planets || []).forEach(p => {
        const pName = typeof p === 'string' ? p : (p.planet || p.name);
        if (pName === 'Ascendant' || pName === 'Lagna') return;
        const matchingBase = calculatedD7.d7PlanetPositions.find(x => x.planet === pName);
        positions.push({
          planet: pName,
          house: parseInt(hNum),
          sign_index: hData.sign_index,
          sign: MULTILINGUAL_SIGNS[currentLang]?.[hData.sign_index] || SIGN_NAMES_EN[hData.sign_index],
          d7Part: matchingBase?.d7Part || 1,
          deity: matchingBase?.deity || D7_DEITIES_ODD[0],
          d7Lord: matchingBase?.d7Lord || MULTILINGUAL_LORDS[currentLang]?.[hData.sign_index] || 'Mars',
          is_retrograde: typeof p === 'object' ? p.is_retrograde : false,
          is_combust: typeof p === 'object' ? p.is_combust : false
        });
      });
    });

    if (positions.length > 0) {
      d7PlanetPositions = positions;
    }
  }

  const effects = calculatePlanetEffects(reportData);
  const tableI18n = D7_TABLE_I18N[currentLang] || D7_TABLE_I18N['hi'] || D7_TABLE_I18N['en'];
  const analysisHeaderI18n = D7_ANALYSIS_HEADER_I18N[currentLang] || D7_ANALYSIS_HEADER_I18N['hi'] || D7_ANALYSIS_HEADER_I18N['en'];

  // Translate D7 interpretations when language changes
  useEffect(() => {
    if (!currentLang || currentLang === 'en' || !d7PlanetPositions.length) {
      setD7InterpretationsMap({});
      return;
    }

    const localCacheKey = `d7_interp_${currentLang}`;
    let cachedMap = {};
    try {
      const stored = localStorage.getItem(localCacheKey);
      if (stored) cachedMap = JSON.parse(stored);
    } catch (e) {}

    const itemsToTranslate = [];
    d7PlanetPositions.forEach(p => {
      const status = effects && effects[p.planet] ? effects[p.planet] : "neutral";
      const statusKey = status === "positive" ? "positive" : status === "negative" ? "negative" : "neutral";
      const rawText = D7_INTERPRETATIONS[p.planet]?.[p.house]?.[statusKey];
      if (rawText) {
        const key = `${p.planet}_${p.house}_${statusKey}`;
        if (!cachedMap[key]) {
          itemsToTranslate.push({ key, text: rawText });
        }
      }
    });

    if (itemsToTranslate.length === 0) {
      setD7InterpretationsMap(cachedMap);
      return;
    }

    // Set existing cached translations first
    if (Object.keys(cachedMap).length > 0) {
      setD7InterpretationsMap(cachedMap);
    }

    const langName = SUPPORTED_LANGUAGES.find(l => l.code === currentLang)?.name || currentLang;
    axios.post(`${API_BASE_URL}/translate/d7-interpretations`, {
      targetLang: currentLang,
      targetLangName: langName,
      items: itemsToTranslate
    })
      .then(res => {
        if (res.data?.success && res.data?.translations) {
          const merged = { ...cachedMap, ...res.data.translations };
          setD7InterpretationsMap(merged);
          try {
            localStorage.setItem(localCacheKey, JSON.stringify(merged));
          } catch (e) {}
        }
      })
      .catch(err => {
        console.warn('D7 interpretation translation request failed:', err.message);
      });
  }, [currentLang, d7PlanetPositions.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white px-4">
        <div className="relative mb-6">
          <div className="w-20 h-20 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
          <Baby className="w-8 h-8 text-rose-400 absolute inset-0 m-auto animate-pulse" />
        </div>
        <h2 className="text-xl md:text-2xl font-serif font-black tracking-wide text-rose-200">
          Synthesizing D7 Saptamsha (सप्तांश कुंडली)...
        </h2>
        <p className="text-sm text-slate-400 mt-2">Computing Parashara 7-fold divisions, deities, children & progeny karma</p>
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
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white shadow-sm shadow-rose-500/30">
              <Baby className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif font-black text-slate-900 text-base md:text-lg flex items-center gap-2">
                D7 Saptamsha Chart
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                  संतान, संतति व रचनात्मकता
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
                ? 'bg-rose-50 text-rose-900 border-rose-300 shadow-2xs'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/60'
                }`}
              title={isAudioMuted ? 'Play Swasti Vachan Mantra' : 'Mute Mantra'}
            >
              <Zap className="w-4 h-4 text-rose-600" />
              <span className="hidden md:inline">{isAudioMuted ? 'Play Audio' : 'Mute Audio'}</span>
            </button>

            {/* Language Selector */}
            <div className="relative">
              <select
                value={currentLang}
                onChange={(e) => handleLanguageChange(e.target.value)}
                disabled={isLangLoading}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 px-3 rounded-xl border border-slate-300 cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-rose-500"
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
              title="Print D7 Chart"
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
        {/* ROW 1: D7 Chart Visual + D7 Planetary Distribution Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* D7 Chart Container */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center">
            {chartStyle === 'north' ? (
              <StandaloneD1Chart
                houses={d7Houses}
                planetPositions={d7PlanetPositions}
                title="D7 Saptamsha Chart (सप्तांश कुंडली - संतान, संतति सुख एवं रचनात्मकता)"
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
                houses={d7Houses}
                planetPositions={d7PlanetPositions}
                title="D7 Saptamsha Chart (सप्तांश कुंडली - संतान, संतति सुख एवं रचनात्मकता)"
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

          {/* D7 Planetary Positions Table Card */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col h-full">
            <div className="flex justify-between items-center bg-rose-50 border border-rose-200/80 p-3.5 rounded-2xl mb-4">
              <div>
                <h2 className="text-base font-black font-serif text-slate-900 flex items-center gap-2">
                  <Baby className="w-4 h-4 text-rose-600" />
                  {tableI18n.heading}
                </h2>
                <p className="text-xs font-bold text-rose-900 mt-0.5">
                  {tableI18n.subtitle}
                </p>
              </div>
              <span className="text-xs font-black text-rose-950 bg-white px-2.5 py-1 rounded-full border border-rose-300">
                16-Varga D7
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
                  {d7PlanetPositions.map((p) => {
                    const color = PLANET_COLORS[p.planet] || "#0f172a";
                    const isSelected = selectedPlanet === p.planet;
                    const translatedPlanet = translations?.planets?.[p.planet] || p.planet;

                    return (
                      <tr
                        key={p.planet}
                        onClick={() => setSelectedPlanet(p.planet)}
                        className={`hover:bg-rose-50/60 cursor-pointer transition ${isSelected ? "bg-rose-100/70 font-bold" : ""}`}
                      >
                        <td className="py-3 px-3 font-sans font-bold flex items-center gap-2 text-base" style={{ color }}>
                          <span>{translatedPlanet}</span>
                        </td>
                        <td className="py-3 px-3 font-sans font-semibold text-slate-800 text-xs">
                          {p.d7Lord}
                        </td>
                        <td className="py-3 px-3 font-sans font-bold text-rose-800 text-xs">
                          <span className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                            {p.deity}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-sans font-semibold text-black">
                          {p.sign}
                        </td>
                        <td className="py-3 px-3 font-black text-rose-900 text-base">
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
        {reportData && <DynamicVargaAnalysis data={reportData} cid="d7" lang={currentLang} />}

        {/* ROW 2: Saptamsa Analysis (D7) - Matching Interactive Worksheet with Multi-Language Support */}
        <section id="section-d7-interpretations" className="bg-white p-6 md:p-8 rounded-3xl border border-rose-200 shadow-xl space-y-6">
          <div className="border-b border-rose-200/80 pb-4">
            <h3 className="text-3xl font-serif italic uppercase mb-2 text-slate-900">
              {analysisHeaderI18n.title}
            </h3>
            <p className="text-sm text-rose-900 italic">
              {analysisHeaderI18n.subtitle}
            </p>
          </div>

          <div className="space-y-6">
            {d7PlanetPositions.map((p) => {
              const status = effects && effects[p.planet] ? effects[p.planet] : "neutral";
              const statusKey = status === "positive" ? "positive" : status === "negative" ? "negative" : "neutral";
              const key = `${p.planet}_${p.house}_${statusKey}`;
              const rawInterpretation = D7_INTERPRETATIONS[p.planet]?.[p.house]?.[statusKey];
              if (!rawInterpretation) return null;

              // Use translated text if available, otherwise raw interpretation
              const displayText = d7InterpretationsMap[key] || rawInterpretation;
              const translatedPlanetName = translations?.planets?.[p.planet] || p.planet;

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
                    } ${isSelected ? 'ring-2 ring-rose-400 shadow-md' : ''}`}
                >
                  <h4
                    className={`text-lg font-black uppercase mb-2 ${statusKey === 'positive'
                      ? 'text-green-900'
                      : statusKey === 'negative'
                        ? 'text-red-900'
                        : 'text-blue-900'
                      }`}
                  >
                    {translatedPlanetName} · {analysisHeaderI18n.houseLabel} {p.house} <span className="text-xs ml-2 opacity-60">({statusKey})</span>
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

