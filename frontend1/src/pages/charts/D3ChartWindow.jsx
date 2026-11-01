import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  Sparkles,
  Printer,
  Compass,
  Eye,
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
  Swords,
  Users,
  Award,
  Zap,
  Flame,
  CheckCircle2,
  AlertTriangle,
  BookOpen
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../utils/kundaliHubStrings';
import { API_BASE_URL } from '../../services/api';
import StandaloneD1Chart from '../../components/StandaloneD1Chart';
import SouthIndianD1Chart from '../../components/SouthIndianD1Chart';
import { D3_INTERPRETATIONS } from '../../data/d3HouseInterpretations';

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
const SIGN_NAMES_HI = ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"];

// Multilingual translations for D3 Table & UI
const D3_TABLE_I18N = {
  en: {
    heading: "D3 Drekkana Planetary Status",
    subtitle: "Planetary distribution across 1st (0°-10°), 2nd (10°-20°), & 3rd (20°-30°) Drekkana",
    colPlanet: "Planet",
    colDrekkanaLord: "Drekkana Lord",
    colDeity: "Drekkana Deity",
    colDrekkanaSign: "Drekkana Sign",
    colD3House: "D3 House",
    footerText: "D3 reveals physical vitality, valor, brotherly relations, and personal initiative.",
  },
  hi: {
    heading: "डी3 द्रेष्काण ग्रह स्थिति (D3 Drekkana Planetary Status)",
    subtitle: "प्रथम (0°-10°), द्वितीय (10°-20°), एवं तृतीय (20°-30°) द्रेष्काण में ग्रहों का विभाजन",
    colPlanet: "ग्रह (Planet)",
    colDrekkanaLord: "द्रेष्काण स्वामी (Lord)",
    colDeity: "द्रेष्काण देवता (Deity)",
    colDrekkanaSign: "द्रेष्काण राशि (Sign)",
    colD3House: "डी3 भाव (House)",
    footerText: "डी3 द्रेष्काण कुंडली पराक्रम, शारीरिक ऊर्जा, सहोदर सुख एवं उद्यमशीलता का दिग्दर्शन कराती है।",
  },
  ta: {
    heading: "டி3 திரேக்காணம் கிரக நிலை (D3 Drekkana Planetary Status)",
    subtitle: "1-ம் (0°-10°), 2-ம் (10°-20°), மற்றும் 3-ம் (20°-30°) திரேக்காண கிரகப் பகிர்வு",
    colPlanet: "கிரகம் (Planet)",
    colDrekkanaLord: "திரேக்காண அதிபதி",
    colDeity: "திரேக்காண தெய்வம்",
    colDrekkanaSign: "திரேக்காண ராசி",
    colD3House: "டி3 பாவம்",
    footerText: "டி3 திரேக்காணம் வீரம், சகோதரர் நலம், விடாமுயற்சி மற்றும் ஆற்றலை விளக்குகிறது.",
  },
  te: {
    heading: "డి3 ద్రేక్కాణ గ్రహ స్థితి (D3 Drekkana Planetary Status)",
    subtitle: "మొదటి (0°-10°), రెండవ (10°-20°), మూడవ (20°-30°) ద్రేక్కాణంలో గ్రహాల విభజన",
    colPlanet: "గ్రహం (Planet)",
    colDrekkanaLord: "ద్రేక్కాణ అధిపతి",
    colDeity: "ద్రేక్కాణ దేవత",
    colDrekkanaSign: "ద్రేక్కాణ రాశి",
    colD3House: "డి3 భావం",
    footerText: "డి3 ద్రేక్కాణ చక్రం ధైర్యం, తోబుట్టువుల సంబంధాలు, శారీరక శక్తిని తెలుపుతుంది.",
  },
  kn: {
    heading: "ಡಿ3 ದ್ರೇಕಾಣ ಗ್ರಹ ಸ್ಥಿತಿ (D3 Drekkana Planetary Status)",
    subtitle: "1ನೇ (0°-10°), 2ನೇ (10°-20°), ಮತ್ತು 3ನೇ (20°-30°) ದ್ರೇಕಾಣ ಗ್ರಹ ವಿತರಣೆ",
    colPlanet: "ಗ್ರಹ (Planet)",
    colDrekkanaLord: "ದ್ರೇಕಾಣ ಅಧಿಪತಿ",
    colDeity: "ದ್ರೇಕಾಣ ದೇವತೆ",
    colDrekkanaSign: "ದ್ರೇಕಾಣ ರಾಶಿ",
    colD3House: "ಡಿ3 ಭಾವ",
    footerText: "ಡಿ3 ದ್ರೇಕಾಣವು ಧೈರ್ಯ, ಸೋದರ ಸಂಬಂಧಗಳು ಹಾಗೂ ಕಾರ್ಯ ಸಾಮರ್ಥ್ಯವನ್ನು ವಿವರಿಸುತ್ತದೆ.",
  },
  gu: {
    heading: "ડી3 દ્રેષ્કાણ ગ્રહ સ્થિતિ (D3 Drekkana Planetary Status)",
    subtitle: "પ્રથમ (0°-10°), દ્વિતીય (10°-20°), અને તૃતીય (20°-30°) દ્રેષ્કાણમાં ગ્રહોનું વિભાજન",
    colPlanet: "ગ્રહ (Planet)",
    colDrekkanaLord: "દ્રેષ્કાણ સ્વામી",
    colDeity: "દ્રેષ્કાણ દેવતા",
    colDrekkanaSign: "દ્રેષ્કાણ રાશિ",
    colD3House: "ડી3 ભાવ",
    footerText: "ડી3 દ્રેષ્કાણ કુંડળી સાહસ, સહાયક બંધુઓ અને શારીરિક ઊર્જાનું વિશ્લેષણ કરે છે.",
  },
  mr: {
    heading: "डी3 द्रेष्काण ग्रह स्थिती (D3 Drekkana Planetary Status)",
    subtitle: "प्रथम (0°-10°), द्वितीय (10°-20°), व तृतीय (20°-30°) द्रेष्काणातील ग्रहांचे विभाजन",
    colPlanet: "ग्रह (Planet)",
    colDrekkanaLord: "द्रेष्काण स्वामी",
    colDeity: "द्रेष्काण देवता",
    colDrekkanaSign: "द्रेष्काण राशी",
    colD3House: "डी3 भाव",
    footerText: "डी3 द्रेष्काण कुंडली पराक्रम, बंधू-भगिनी सुख व उद्यमशीलतेचे दिग्दर्शन करते.",
  },
  bn: {
    heading: "ডি৩ দ্রেষ্কাণ গ্রহ অবস্থান (D3 Drekkana Planetary Status)",
    subtitle: "১ম (০°-১০°), ২য় (১০°-২০°), ও ৩য় (২০°-৩০°) দ্রেষ্কাণে গ্রহ বণ্টন",
    colPlanet: "গ্রহ (Planet)",
    colDrekkanaLord: "দ্রেষ্কাণ অধিপতি",
    colDeity: "দ্রেষ্কাণ দেবতা",
    colDrekkanaSign: "দ্রেষ্কাণ রাশি",
    colD3House: "ডি৩ ভাব",
    footerText: "ডি৩ দ্রেষ্কাণ পরাক্রম, ভ্রাতৃসুখ এবং অন্তর্নিহিত আত্মশক্তির নির্দেশক।",
  },
  ml: {
    heading: "ഡി3 ദ്രേക്കാണ ഗ്രഹനില (D3 Drekkana Planetary Status)",
    subtitle: "1-ാം (0°-10°), 2-ാം (10°-20°), 3-ാം (20°-30°) ദ്രേക്കാണ ഗ്രഹ വിന്യാസം",
    colPlanet: "ഗ്രഹം (Planet)",
    colDrekkanaLord: "ദ്രേക്കാണ നാഥൻ",
    colDeity: "ദ്രേക്കാണ ദേവത",
    colDrekkanaSign: "ദ്രേക്കാണ രാശി",
    colD3House: "ഡി3 ഭാവം",
    footerText: "ഡി3 ദ്രേക്കാണം ധൈര്യം, സഹോദര ബന്ധങ്ങൾ, കായിക ശക്തി എന്നിവ വെളിപ്പെടുത്തുന്നു.",
  },
  pa: {
    heading: "ਡੀ3 ਦ੍ਰੇਸ਼ਕਾਣ ਗ੍ਰਹਿ ਸਥਿਤੀ (D3 Drekkana Planetary Status)",
    subtitle: "ਪਹਿਲੇ (0°-10°), ਦੂਜੇ (10°-20°), ਅਤੇ ਤੀਜੇ (20°-30°) ਦ੍ਰੇਸ਼ਕਾਣ ਵਿੱਚ ਗ੍ਰਹਿਆਂ ਦੀ ਵੰਡ",
    colPlanet: "ਗ੍ਰਹਿ (Planet)",
    colDrekkanaLord: "ਦ੍ਰੇਸ਼ਕਾਣ ਸੁਆਮੀ",
    colDeity: "ਦ੍ਰੇਸ਼ਕਾਣ ਦੇਵਤਾ",
    colDrekkanaSign: "ਦ੍ਰੇਸ਼ਕਾਣ ਰਾਸ਼ੀ",
    colD3House: "ਡੀ3 ਭਾਵ",
    footerText: "ਡੀ3 ਦ੍ਰੇਸ਼ਕਾਣ ਕੁੰਡਲੀ ਹਿੰਮਤ, ਭੈਣ-ਭਰਾਵਾਂ ਅਤੇ ਊਰਜਾ ਦੀ ਅਗਵਾਈ ਕਰਦੀ ਹੈ।",
  },
  sa: {
    heading: "डी३ द्रेष्काण ग्रह स्थितिः (D3 Drekkana Planetary Status)",
    subtitle: "प्रथम (०°-१०°), द्वितीय (१०°-२०°), तृतीय (२०°-३०°) द्रेष्काणे ग्रहविभागः",
    colPlanet: "ग्रहः (Planet)",
    colDrekkanaLord: "द्रेष्काणेशः",
    colDeity: "द्रेष्काणदेवता",
    colDrekkanaSign: "द्रेष्काणराशिः",
    colD3House: "डी३ भावः",
    footerText: "डी३ द्रेष्काणकुण्डली पराक्रमं, भ्रातृसौख्यं, आभ्यन्तरीं शक्तिं च प्रकाशयति।",
  }
};

// Multilingual Sign Names (0: Aries to 11: Pisces)
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

// Multilingual Drekkana Deities: [0: Narada, 1: Agastya, 2: Durvasa]
const MULTILINGUAL_DEITIES = {
  en: ["Narada", "Agastya", "Durvasa"],
  hi: ["नारद (Narada)", "अगस्त्य (Agastya)", "दुर्वासा (Durvasa)"],
  ta: ["நாரதர் (Narada)", "அகஸ்தியர் (Agastya)", "துர்வாசர் (Durvasa)"],
  te: ["నారదుడు (Narada)", "అగస్త్యుడు (Agastya)", "దుర్వాసుడు (Durvasa)"],
  kn: ["ನಾರದ (Narada)", "ಅಗಸ್ತ್ಯ (Agastya)", "ದುರ್ವಾಸ (Durvasa)"],
  gu: ["નારદ (Narada)", "અગસ્ત્ય (Agastya)", "દુર્વાસા (Durvasa)"],
  mr: ["नारद (Narada)", "अगस्ती (Agastya)", "दुर्वासा (Durvasa)"],
  bn: ["নারদ (Narada)", "অগস্ত্য (Agastya)", "দুর্বাসা (Durvasa)"],
  ml: ["നാരദൻ (Narada)", "അഗസ്ത്യൻ (Agastya)", "ദുർവാസാവ് (Durvasa)"],
  pa: ["ਨਾਰਦ (Narada)", "ਅਗਸਤ (Agastya)", "ਦੁਰਵਾਸਾ (Durvasa)"],
  sa: ["नारदः (Narada)", "अगस्त्यः (Agastya)", "दुर्वासाः (Durvasa)"]
};


/**
 * Calculates D3 Drekkana chart based on classical Parashara rule:
 * Each 30° sign is divided into three 10° segments:
 * - 0° to 10°: 1st Drekkana -> Same sign (signIdx + 0)
 * - 10° to 20°: 2nd Drekkana -> 5th sign from itself (signIdx + 4)
 * - 20° to 30°: 3rd Drekkana -> 9th sign from itself (signIdx + 8)
 */
function calculateD3Drekkana(basePlanets = [], baseAscDeg = 0, lang = 'en') {
  const deities = MULTILINGUAL_DEITIES[lang] || MULTILINGUAL_DEITIES['en'];
  const lords = MULTILINGUAL_LORDS[lang] || MULTILINGUAL_LORDS['en'];
  const signNames = MULTILINGUAL_SIGNS[lang] || MULTILINGUAL_SIGNS['en'];

  const getDrekkanaInfo = (totalDeg) => {
    const normDeg = ((totalDeg % 360) + 360) % 360;
    const baseSignIdx = Math.floor(normDeg / 30);
    const degInSign = normDeg % 30;

    let part = 0; // 0 = 1st (0-10), 1 = 2nd (10-20), 2 = 3rd (20-30)
    let signOffset = 0;

    if (degInSign < 10) {
      part = 0;
      signOffset = 0;
    } else if (degInSign < 20) {
      part = 1;
      signOffset = 4; // 5th sign from itself
    } else {
      part = 2;
      signOffset = 8; // 9th sign from itself
    }

    const d3SignIndex = (baseSignIdx + signOffset) % 12;
    return {
      d3SignIndex,
      part,
      deity: deities[part] || deities[0],
      lord: lords[d3SignIndex] || lords[0],
      translatedSign: signNames[d3SignIndex] || SIGN_NAMES_EN[d3SignIndex]
    };
  };

  const ascDrekkana = getDrekkanaInfo(baseAscDeg);
  const ascD3Sign = ascDrekkana.d3SignIndex;

  // Initialize 12 houses starting from Ascendant's D3 sign
  const d3Houses = {};
  for (let h = 1; h <= 12; h++) {
    const signIndex = (ascD3Sign + (h - 1)) % 12;
    d3Houses[h] = {
      sign_index: signIndex,
      planets: []
    };
  }

  const d3PlanetPositions = [];

  basePlanets.forEach((p) => {
    const pDeg = Number(p.degree !== undefined ? p.degree : p.lon || 0);
    const dInfo = getDrekkanaInfo(pDeg);

    // Calculate house offset from Ascendant's D3 sign (1-indexed)
    const houseNum = ((dInfo.d3SignIndex - ascD3Sign + 12) % 12) + 1;

    const pCopy = {
      ...p,
      house: houseNum,
      sign_index: dInfo.d3SignIndex,
      sign: dInfo.translatedSign,
      drekkanaPart: dInfo.part + 1,
      deity: dInfo.deity,
      drekkanaLord: dInfo.lord
    };

    d3PlanetPositions.push(pCopy);

    if (d3Houses[houseNum]) {
      d3Houses[houseNum].planets.push(pCopy);
    }
  });

  return {
    d3Houses,
    d3PlanetPositions,
    ascD3Sign,
    ascDrekkana
  };
}

export default function D3ChartWindow() {
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
  const [d3Translations, setD3Translations] = useState(null);
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

  // Load General UI Dictionary & Planet Translations & D3 Drekkana DB Translations
  useEffect(() => {
    if (!currentLang || currentLang === 'en') {
      setTranslations(null);
      setD3Translations(null);
      return;
    }

    const loadDictionaryAndD3 = async () => {
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

        // 2. D3 Drekkana Database Interpretations
        const d3CacheKey = `d3_drekkana_trans_${currentLang}`;
        const cachedD3 = localStorage.getItem(d3CacheKey);
        if (cachedD3) {
          setD3Translations(JSON.parse(cachedD3));
        } else {
          const d3Res = await axios.get(`${API_BASE_URL}/translate/d3-drekkana/${currentLang}`);
          if (d3Res.data?.success && d3Res.data?.data) {
            setD3Translations(d3Res.data.data);
            localStorage.setItem(d3CacheKey, JSON.stringify(d3Res.data.data));
          }
        }
      } catch (err) {
        console.warn(`Could not load translations for ${currentLang}:`, err.message);
      } finally {
        setIsLangLoading(false);
      }
    };

    loadDictionaryAndD3();
  }, [currentLang]);

  // Fetch Chart Data
  useEffect(() => {
    fetchData();
  }, [date, time, lat, lon, tzOffset]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    // 1. Try reading cached data from sessionStorage
    try {
      const cached = sessionStorage.getItem('lastGeneratedKundali');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.reportData && parsed.reportData.charts) {
          setReportData(parsed.reportData);
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

      if (response.data && response.data.charts) {
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
        setError('Failed to compute D3 Drekkana Kundali. Please make sure the astrology backend is running.');
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

  // Compute D3 Drekkana
  const basePlanets = reportData?.planet_positions || [];
  const baseAscDeg = reportData?.charts?.ascendant_deg !== undefined
    ? reportData.charts.ascendant_deg
    : (reportData?.charts?.houses?.[1]?.cusp_deg || 0);

  const {
    d3Houses,
    d3PlanetPositions
  } = calculateD3Drekkana(basePlanets, baseAscDeg, currentLang);

  const tableI18n = D3_TABLE_I18N[currentLang] || D3_TABLE_I18N['hi'] || D3_TABLE_I18N['en'];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white px-4">
        <div className="relative mb-6">
          <div className="w-20 h-20 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
          <Swords className="w-8 h-8 text-amber-400 absolute inset-0 m-auto animate-pulse" />
        </div>
        <h2 className="text-xl md:text-2xl font-serif font-black tracking-wide text-amber-200">
          Synthesizing D3 Drekkana (द्रेष्काण कुंडली)...
        </h2>
        <p className="text-sm text-slate-400 mt-2">Computing Parashara 3-fold divisions, deities & vital houses</p>
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
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif font-black text-slate-900 text-base md:text-lg flex items-center gap-2">
                D3 Drekkana Chart
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  पराक्रम व सहोदर
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
            <select
              value={currentLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 shadow-2xs focus:ring-2 focus:ring-amber-500 outline-none"
            >
              {SUPPORTED_LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
              title="Print Chart Window"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={() => window.close()}
              className="p-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition"
              title="Close Window"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area: Chart on Left, Planetary Table on Right */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 pt-4 pb-8 space-y-6 bg-white text-black">
        {/* ROW 1: Chart & Planetary Table */}
        <div id="section-d3-chart" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* D3 SVG Chart Card */}
          <div className="lg:col-span-7 bg-white p-4 md:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center">
            {chartStyle === 'north' ? (
              <StandaloneD1Chart
                houses={d3Houses}
                planetPositions={d3PlanetPositions}
                title="D3 Drekkana Chart (द्रेष्काण कुंडली - पराक्रम व सहोदर)"
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
                houses={d3Houses}
                planetPositions={d3PlanetPositions}
                title="D3 Drekkana Chart (द्रेष्काण कुंडली - पराक्रम व सहोदर)"
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

          {/* D3 Planetary Positions Table Card */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col h-full">
            <div className="flex justify-between items-center bg-amber-50 border border-amber-200/80 p-3.5 rounded-2xl mb-4">
              <div>
                <h2 className="text-base font-black font-serif text-slate-900 flex items-center gap-2">
                  <Swords className="w-4 h-4 text-amber-600" />
                  {tableI18n.heading}
                </h2>
                <p className="text-xs font-bold text-amber-900 mt-0.5">
                  {tableI18n.subtitle}
                </p>
              </div>
              <span className="text-xs font-black text-amber-950 bg-white px-2.5 py-1 rounded-full border border-amber-300">
                16-Varga D3
              </span>
            </div>

            <div className="overflow-x-auto flex-grow max-h-[480px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[14px] font-bold uppercase tracking-wider text-black bg-slate-50/90">
                    <th className="py-3 px-3">{tableI18n.colPlanet}</th>
                    <th className="py-3 px-3">{tableI18n.colDrekkanaLord}</th>
                    <th className="py-3 px-3">{tableI18n.colDeity}</th>
                    <th className="py-3 px-3">{tableI18n.colDrekkanaSign}</th>
                    <th className="py-3 px-3">{tableI18n.colD3House}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-sm">
                  {d3PlanetPositions.map((p) => {
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
                          {p.drekkanaLord}
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

        {/* ROW 2: D3 Courage & Sibling Interpretations */}
        <section id="section-d3-interpretations" className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/90 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium font-serif text-slate-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-600" />
                {d3Translations?.ui?.sectionTitle || "D3 Drekkana Interpretations (सहोदर, पराक्रम व जीवन ऊर्जा विश्लेषण)"}
              </h2>
              <p className="text-[15px] font-bold text-amber-900 mt-1">
                {d3Translations?.ui?.sectionSubtitle || "Detailed Parashari reading for all 9 planets in their respective D3 Drekkana houses"}
              </p>
            </div>
            <span className="text-[15px] font-bold  text-amber-950 bg-white px-3 py-1 rounded-full border border-amber-300 shadow-2xs">
              9 Planets Analyzed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {d3PlanetPositions.map((p) => {
              const color = PLANET_COLORS[p.planet] || "#0f172a";
              const isSelected = selectedPlanet === p.planet;
              const translatedPlanetName = translations?.planets?.[p.planet] || p.planet;
              const houseBadgeLabel = d3Translations?.ui?.houseBadge || "House";
              const deityBadgeLabel = d3Translations?.ui?.deityLabel || "Deity";
              const partBadgeLabel = d3Translations?.ui?.partLabel || "Part";
              const impactBadgeLabel = d3Translations?.ui?.impactLabel || "D3 Impact";

              // 1. Check translated interpretations from database
              const dbPlanetInterps = d3Translations?.interpretations?.[p.planet]?.[p.house];
              // 2. Fallback to local default interpretations
              const fallbackInterps = D3_INTERPRETATIONS[p.planet]?.[p.house] || {};
              const activeInterps = dbPlanetInterps || fallbackInterps;
              const interpText = activeInterps.positive || activeInterps.neutral || activeInterps.negative || "Provides courage and dynamic focus in this domain.";

              return (
                <div
                  key={p.planet}
                  onClick={() => setSelectedPlanet(p.planet)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${isSelected
                    ? 'border-amber-400 bg-amber-50/60 shadow-md ring-2 ring-amber-300'
                    : 'border-slate-200/90 bg-slate-50/50 hover:bg-slate-100/70 hover:border-slate-300'
                    }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 border-b border-slate-200/70 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
                        <h3 className="font-serif font-black text-slate-900 text-[16px]" style={{ color }}>
                          {translatedPlanetName}
                        </h3>
                      </div>
                      <span className="text-[15px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                        {houseBadgeLabel} {p.house} ({p.sign})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[15px] font-bold text-black mb-2.5">
                      <span>{deityBadgeLabel}: {p.deity}</span>
                      <span>•</span>
                      <span>{partBadgeLabel}: {p.drekkanaPart}/3</span>
                    </div>

                    <p className="text-[16px] font-medium text-black leading-relaxed">
                      {interpText}
                    </p>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[14px] font-bold text-slate-900">
                    <span>{tableI18n.colDrekkanaLord || "Drekkana Lord"}: {p.drekkanaLord}</span>
                    <span className="text-amber-900 font-semibold">{impactBadgeLabel}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
