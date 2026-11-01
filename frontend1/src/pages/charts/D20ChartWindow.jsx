import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  Sparkles,
  Printer,
  Compass,
  Layers,
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
  Flame
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../utils/kundaliHubStrings';
import { API_BASE_URL } from '../../services/api';
import StandaloneD1Chart from '../../components/StandaloneD1Chart';
import SouthIndianD1Chart from '../../components/SouthIndianD1Chart';
import DynamicVargaAnalysis from '../../components/DynamicVargaAnalysis';
import { D20_INTERPRETATIONS } from '../../data/d20HouseInterpretations';

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
  ml: ["മേടം (Aries)", "ഇടവം (Taurus)", "മിഥുനം (Gemini)", "കർക്കിടകം (Cancer)", "ചിങ്ങം (Leo)", "കന്നി (Virgo)", "തുലാം (Libra)", "വൃശ്ചികം (Scorpio)", "ധനു (Sagittarius)", "മകരം (Capricorn)", "കുംഭം (Aquarius)", "മീനം (Pisces)"],
  pa: ["ਮੇਖ (Aries)", "ਬ੍ਰਿਖ (Taurus)", "ਮਿਥੁਨ (Gemini)", "ਕਰਕ (Cancer)", "ਸਿੰਘ (Leo)", "ਕੰਨਿਆ (Virgo)", "ਤੁਲਾ (Libra)", "ਬ੍ਰਿਸ਼ਚਕ (Scorpio)", "ਧਨੁ (Sagittarius)", "ਮਕਰ (Capricorn)", "ਕੁੰਭ (Aquarius)", "ਮੀਨ (Pisces)"],
  sa: ["मेषः (Aries)", "वृषभः (Taurus)", "मिथुनम् (Gemini)", "कर्कः (Cancer)", "सिंहः (Leo)", "कन्या (Virgo)", "तुला (Libra)", "वृश्चिकः (Scorpio)", "धनुः (Sagittarius)", "मकरः (Capricorn)", "कुम्भः (Aquarius)", "मीनः (Pisces)"]
};

// Multilingual Sign Lords
const MULTILINGUAL_LORDS = {
  en: ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"],
  hi: ["मंगल (Mars)", "शुक्र (Venus)", "बुध (Mercury)", "चंद्रमा (Moon)", "सूर्य (Sun)", "बुध (Mercury)", "शुक्र (Venus)", "मंगल (Mars)", "गुरु (Jupiter)", "शनि (Saturn)", "शनि (Saturn)", "गुरु (Jupiter)"],
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

// 20 Sacred Deities (Shaktis / Upasanas) of Vimshamsha (D20)
const D20_DEITIES = [
  "Kanya (कन्या - Divine Maiden / Pure Devotion)",
  "Kali (काली - Time & Spiritual Transformation)",
  "Tara (तारा - Guiding Star / Compassion)",
  "Vidya (विद्या - Sacred Knowledge & Wisdom)",
  "Matangi (मातंगी - Arts, Music & Speech)",
  "Bhairavi (भैरवी - Kundalini & Inner Fire)",
  "Chhinnamasta (छिन्नमस्ता - Ego Dissolution)",
  "Dhumavati (धूमावती - Void & Renunciation)",
  "Bagalamukhi (बगलामुखी - Silencing the Mind)",
  "Kamala (कमला - Lotus of Consciousness)",
  "Gauri (गौरी - Purity & Grace)",
  "Durga (दुर्गा - Fortress & Protection)",
  "Shakti (शक्ति - Primal Cosmic Energy)",
  "Tripurasundari (त्रिपुरसुन्दरी - Divine Beauty & Harmony)",
  "Bhuvaneshwari (भुवनेश्वरी - Cosmic Mother / Space)",
  "Mahavidya (महाविद्या - Supreme Transcendent Knowledge)",
  "Ambika (अम्बिका - Compassionate Mother)",
  "Vagdevi (वाग्देवी - Goddess of Sacred Speech)",
  "Gayatri (गायत्री - Solar Spiritual Illumination)",
  "Kundalini (कुण्डलिनी - Serpent Power / Spiritual Awakening)"
];

// Multilingual Table Headers
const D20_TABLE_I18N = {
  en: {
    heading: "D20 Vimshamsha Planetary Status",
    colPlanet: "Planet",
    colD20Sign: "D20 Sign",
    colHouse: "D20 House",
    colPart: "D20 Part",
    colLord: "D20 Lord",
    colDeity: "Spiritual Deity (उपासना देवता)",
    footerText: "Calculated with classical Brihat Parashara Hora Shastra rules (each sign divided into 20 parts of 1°30'). Movable signs start from Aries, Fixed signs from Sagittarius, Dual signs from Leo."
  },
  hi: {
    heading: "डी20 विंशांश ग्रह स्थिति",
    colPlanet: "ग्रह",
    colD20Sign: "डी20 राशि",
    colHouse: "डी20 भाव",
    colPart: "डी20 भाग",
    colLord: "डी20 स्वामी",
    colDeity: "उपासना देवता",
    footerText: "बृहत् पराशर होरा शास्त्र के शास्त्रीय नियमानुसार गणना (प्रत्येक राशि 1°30' के 20 भागों में विभक्त)। चर राशियाँ मेष से, स्थिर राशियाँ धनु से, द्विस्वभाव राशियाँ सिंह से प्रारंभ होती हैं।"
  },
  ta: {
    heading: "டி20 விம்சாம்ச கிரக நிலை",
    colPlanet: "கிரகம்",
    colD20Sign: "டி20 ராசி",
    colHouse: "டி20 பாவம்",
    colPart: "டி20 பகுதி",
    colLord: "டி20 அதிபதி",
    colDeity: "வழிபாட்டு தெய்வம்",
    footerText: "பராசர ஹோரா சாஸ்திர முறைப்படி கணக்கிடப்பட்டது (ஒவ்வொரு ராசியும் 1°30' கொண்ட 20 பகுதிகளாகப் பிரிக்கப்படுகிறது)."
  },
  te: {
    heading: "డి20 వింశాంశ గ్రహ స్థితి",
    colPlanet: "గ్రహం",
    colD20Sign: "డి20 రాశి",
    colHouse: "డి20 భావం",
    colPart: "డి20 భాగం",
    colLord: "డి20 అధిపతి",
    colDeity: "ఉపాసనా దేవత",
    footerText: "బృహత్ పరాశర హోరా శాస్త్ర ప్రామాణిక నియమాల ప్రకారం గణించబడింది (ప్రతి రాశి 1°30' యొక్క 20 విభాగాలుగా విభజించబడింది)."
  },
  kn: {
    heading: "ಡಿ20 ವಿಂಶಾಂಶ ಗ್ರಹ ಸ್ಥಿತಿ",
    colPlanet: "ಗ್ರಹ",
    colD20Sign: "ಡಿ20 ರಾಶಿ",
    colHouse: "ಡಿ20 ಭಾವ",
    colPart: "ಡಿ20 ಭಾಗ",
    colLord: "ಡಿ20 ಅಧಿಪತಿ",
    colDeity: "ಉಪಾಸನಾ ದೇವತೆ",
    footerText: "ಬೃಹತ್ ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರ ನಿಯಮಗಳ ಪ್ರಕಾರ ಲೆಕ್ಕಹಾಕಲಾಗಿದೆ (ಪ್ರತಿ ರಾಶಿಯನ್ನು 1°30' ನ 20 ಭಾಗಗಳಾಗಿ ವಿಂಗಡಿಸಲಾಗಿದೆ)."
  },
  gu: {
    heading: "ડી20 વિંશાંશ ગ્રહ સ્થિતિ",
    colPlanet: "ગ્રહ",
    colD20Sign: "ડી20 રાશિ",
    colHouse: "ડી20 ભાવ",
    colPart: "ડી20 ભાગ",
    colLord: "ડી20 સ્વામી",
    colDeity: "ઉપાસના દેવતા",
    footerText: "બૃહત્ પરાશર હોરા શાસ્ત્ર નિયમો અનુસાર ગણતરી (દરેક રાશિ 1°30' ના 20 ભાગોમાં વિભાજીત)."
  },
  mr: {
    heading: "डी20 विंशांश ग्रह स्थिती",
    colPlanet: "ग्रह",
    colD20Sign: "डी20 राशी",
    colHouse: "डी20 भाव",
    colPart: "डी20 भाग",
    colLord: "डी20 स्वामी",
    colDeity: "उपासना देवता",
    footerText: "बृहत् पराशर होरा शास्त्र नियमांनुसार गणना (प्रत्येक राशी 1°30' च्या 20 भागांमध्ये विभागलेली)."
  },
  bn: {
    heading: "ডি২০ বিংশাংশ গ্রহের অবস্থান",
    colPlanet: "গ্রহ",
    colD20Sign: "ডি২০ রাশি",
    colHouse: "ডি২০ ভাব",
    colPart: "ডি২০ ভাগ",
    colLord: "ডি২০ অধিপতি",
    colDeity: "উপাসনা দেবতা",
    footerText: "বৃহৎ পরাশর হোরা শাস্ত্র নিয়ম অনুযায়ী গণনা (প্রতিটি রাশি ১°৩০' এর ২০টি ভাগে বিভক্ত)।"
  },
  ml: {
    heading: "ഡി20 വിംശാംശ ഗ്രഹനില",
    colPlanet: "ഗ്രഹം",
    colD20Sign: "ഡി20 രാശി",
    colHouse: "ഡി20 ഭാവം",
    colPart: "ഡി20 ഭാഗം",
    colLord: "ഡി20 നാഥൻ",
    colDeity: "ഉപാസനാ ദേവത",
    footerText: "ബൃഹത് പരാശര ഹോരാ ശാസ്ത്ര നിയമങ്ങൾ പ്രകാരം കണക്കാക്കിയത് (ഓരോ രാശിയും 1°30' വീതമുള്ള 20 ഭാഗങ്ങളായി തിരിച്ചിരിക്കുന്നു)."
  },
  pa: {
    heading: "ਡੀ20 ਵਿੰਸ਼ਾਂਸ਼ ਗ੍ਰਹਿ ਸਥਿਤੀ",
    colPlanet: "ਗ੍ਰਹਿ",
    colD20Sign: "ਡੀ20 ਰਾਸ਼ੀ",
    colHouse: "ਡੀ20 ਘਰ",
    colPart: "ਡੀ20 ਭਾਗ",
    colLord: "ਡੀ20 ਸੁਆਮੀ",
    colDeity: "ਉਪਾਸਨਾ ਦੇਵਤਾ",
    footerText: "ਬ੍ਰਿਹਤ ਪਰਾਸ਼ਰ ਹੋਰਾ ਸ਼ਾਸਤਰ ਦੇ ਨਿਯਮਾਂ ਅਨੁਸਾਰ ਗਣਨਾ (ਹਰੇਕ ਰਾਸ਼ੀ 1°30' ਦੇ 20 ਭਾਗਾਂ ਵਿੱਚ ਵੰਡੀ ਹੋਈ)।"
  },
  sa: {
    heading: "डी20 विंशांश ग्रह स्थितिः",
    colPlanet: "ग्रहः",
    colD20Sign: "डी20 राशिः",
    colHouse: "डी20 भावः",
    colPart: "डी20 भागः",
    colLord: "डी20 स्वामी",
    colDeity: "उपासना देवता",
    footerText: "बृहत्पाराशरहोराशास्त्र नियमानुसारं गणना (प्रत्येकराशिः 1°30' परिमितेषु 20 भागेषु विभक्ता)।"
  }
};

// Analysis Header Translations
const D20_HEADER_I18N = {
  en: {
    title: "Vimsamsa Analysis (D20)",
    subtitle: "Spiritual Growth · Meditation · Worship · Religious Merit",
    houseLabel: "House"
  },
  hi: {
    title: "विंशांश विश्लेषण (D20 - आध्यात्मिक उन्नति, ध्यान, उपासना व पुण्य)",
    subtitle: "डी-20 (विंशांश) कुंडली आपकी आध्यात्मिक प्रगति, धार्मिक भक्ति, ध्यान क्षमता और गूढ़ ज्ञान का मानचित्र है।",
    houseLabel: "भाव"
  },
  ta: {
    title: "விம்சாம்ச பகுப்பாய்வு (D20 - ஆன்மீக வளர்ச்சி & வழிபாடு)",
    subtitle: "டி-20 (விம்சாம்ச) விளக்கப்படம் உங்கள் ஆன்மீக வளர்ச்சி, பக்தி மற்றும் தியான திறனை வெளிப்படுத்துகிறது.",
    houseLabel: "பாவம்"
  },
  te: {
    title: "వింశాంశ విశ్లేషణ (D20 - ఆధ్యాత్మిక ప్రగతి & ఉపాసన)",
    subtitle: "డి-20 (వింశాంశ) చక్రం మీ ఆధ్యాత్మిక ఎదుగుదల, దైవ భక్తి మరియు ధ్యాన సామర్థ్యాన్ని సూచిస్తుంది.",
    houseLabel: "భావం"
  },
  kn: {
    title: "ವಿಂಶಾಂಶ ವಿಶ್ಲೇಷಣೆ (D20 - ಆಧ್ಯಾತ್ಮಿಕ ಬೆಳವಣಿಗೆ & ಧ್ಯಾನ)",
    subtitle: "ಡಿ-20 (ವಿಂಶಾಂಶ) ಕುಂಡಲಿಯು ನಿಮ್ಮ ಆಧ್ಯಾತ್ಮಿಕ ಪ್ರಗತಿ, ಭಕ್ತಿ ಮತ್ತು ಧ್ಯಾನ ಶಕ್ತಿಯನ್ನು ವಿವರಿಸುತ್ತದೆ.",
    houseLabel: "ಭಾವ"
  },
  gu: {
    title: "વિંશાંશ વિશ્લેષણ (D20 - આધ્યાત્મિક પ્રગતિ અને ઉપાસના)",
    subtitle: "ડી-20 (વિંશાંશ) કુંડળી આધ્યાત્મિક પ્રગતિ, ધાર્મિક ભક્તિ, ધ્યાન ક્ષમતા અને ગૂઢ જ્ઞાન દર્શાવે છે.",
    houseLabel: "ભાવ"
  },
  mr: {
    title: "विंशांश विश्लेषण (D20 - आध्यात्मिक प्रगती, ध्यान व उपासना)",
    subtitle: "डी-२० (विंशांश) कुंडली ही तुमच्या आध्यात्मिक प्रगतीची, धार्मिक भक्तीची व ध्यान क्षमतेची दर्शक आहे.",
    houseLabel: "भाव"
  },
  bn: {
    title: "বিংশাংশ বিশ্লেষণ (D20 - আধ্যাত্মিক উন্নতি ও সাধনা)",
    subtitle: "ডি-২০ (বিংশাংশ) ছক আপনার আধ্যাত্মিক অগ্রগতি, ভক্তি এবং ধ্যানের ক্ষমতার গভীর রহস্য উন্মোচন করে।",
    houseLabel: "ভাব"
  },
  ml: {
    title: "വിംശാംശ വിശകലനം (D20 - ആദ്ധ്യാത്മിക പുരോഗതിയും ഉപാസനയും)",
    subtitle: "ഡി-20 (വിംശാംശ) ചാർട്ട് നിങ്ങളുടെ ആദ്ധ്യാത്മിക വളർച്ചയും ഈശ്വര ഭക്തിയും വ്യക്തമാക്കുന്നു.",
    houseLabel: "ഭാവം"
  },
  pa: {
    title: "ਵਿੰਸ਼ਾਂਸ਼ ਵਿਸ਼ਲੇਸ਼ਣ (D20 - ਆਤਮਿਕ ਤਰੱਕੀ, ਧਿਆਨ ਅਤੇ ਭਗਤੀ)",
    subtitle: "ਡੀ-20 (ਵਿੰਸ਼ਾਂਸ਼) ਕੁੰਡਲੀ ਤੁਹਾਡੀ ਅਧਿਆਤਮਿਕ ਤਰੱਕੀ, ਧਾਰਮਿਕ ਭਗਤੀ ਅਤੇ ਧਿਆਨ ਸਮਰੱਥਾ ਨੂੰ ਦਰਸਾਉਂਦੀ ਹੈ।",
    houseLabel: "ਘਰ"
  },
  sa: {
    title: "विंशांश विश्लेषणम् (D20 - आध्यात्मिक साधना, ध्यानम्, उपासना च)",
    subtitle: "डी-20 (विंशांश) चक्रं भवतः आध्यात्मिकप्रगतेः, ईश्वरभक्तेः, ध्यानशक्तेश्च गूढरहस्यं प्रकाशयति।",
    houseLabel: "भावः"
  }
};

const D20_INTRO_TEXT = `The D-20 (Vimshamsha) chart is the ultimate map of your spiritual progress, religious devotion, meditative capacity, and esoteric knowledge. It reveals your soul's capacity for true enlightenment and deep worship.`;

/**
 * Parashari D20 Vimshamsha Calculation
 * Each sign (30°) is divided into 20 equal parts of 1°30' (1.5 degrees) each.
 * - Movable signs (1, 4, 7, 10): count starts from Aries (sign 0)
 * - Fixed signs (2, 5, 8, 11): count starts from Sagittarius (sign 8)
 * - Dual signs (3, 6, 9, 12): count starts from Leo (sign 4)
 */
function calculateD20Vimshamsha(basePlanets = [], baseAscDeg = 0, lang = 'en') {
  const lords = MULTILINGUAL_LORDS[lang] || MULTILINGUAL_LORDS['hi'] || MULTILINGUAL_LORDS['en'];
  const signNames = MULTILINGUAL_SIGNS[lang] || MULTILINGUAL_SIGNS['hi'] || MULTILINGUAL_SIGNS['en'];

  const getD20Info = (totalDeg) => {
    const normDeg = ((totalDeg % 360) + 360) % 360;
    const baseSignIdx = Math.floor(normDeg / 30);
    const degInSign = normDeg % 30;

    // Division part 0..19 (1.5 degrees each)
    const divisionPart = Math.min(Math.floor(degInSign / 1.5), 19);

    let startSign;
    if (baseSignIdx % 3 === 0) {
      // Movable Signs: Aries, Cancer, Libra, Capricorn (idx 0, 3, 6, 9) -> Start from Aries (0)
      startSign = 0;
    } else if (baseSignIdx % 3 === 1) {
      // Fixed Signs: Taurus, Leo, Scorpio, Aquarius (idx 1, 4, 7, 10) -> Start from Sagittarius (8)
      startSign = 8;
    } else {
      // Dual Signs: Gemini, Virgo, Sagittarius, Pisces (idx 2, 5, 8, 11) -> Start from Leo (4)
      startSign = 4;
    }

    const d20SignIndex = (startSign + divisionPart) % 12;
    const deity = D20_DEITIES[divisionPart];

    return {
      d20SignIndex,
      divisionPart: divisionPart + 1,
      deity
    };
  };

  const ascD20 = getD20Info(baseAscDeg);
  const ascD20Sign = ascD20.d20SignIndex;

  const d20Houses = {};
  for (let h = 1; h <= 12; h++) {
    const sIdx = (ascD20Sign + (h - 1)) % 12;
    d20Houses[h] = {
      sign_index: sIdx,
      sign: signNames[sIdx],
      lord: lords[sIdx],
      planets: []
    };
  }

  const d20PlanetPositions = [];
  basePlanets.forEach((p) => {
    const pD20 = getD20Info(p.degree);
    const houseNum = ((pD20.d20SignIndex - ascD20Sign + 12) % 12) + 1;

    if (d20Houses[houseNum]) {
      d20Houses[houseNum].planets.push(p.planet);
    }

    d20PlanetPositions.push({
      planet: p.planet,
      house: houseNum,
      sign_index: pD20.d20SignIndex,
      sign: signNames[pD20.d20SignIndex],
      d20Part: pD20.divisionPart,
      deity: pD20.deity,
      d20Lord: lords[pD20.d20SignIndex],
      is_retrograde: p.is_retrograde,
      is_combust: p.is_combust
    });
  });

  return { d20Houses, d20PlanetPositions, ascD20Sign };
}

// Calculate Dignities & Functional Benefic Effects
const calculatePlanetEffects = (reportData) => {
  const effects = {};
  const planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];

  let lagnaSignIndex = 0;
  if (reportData?.vargas?.d20?.houses?.[1]?.sign_index !== undefined) {
    lagnaSignIndex = reportData.vargas.d20.houses[1].sign_index;
  } else if (reportData?.charts?.ascendant_deg !== undefined) {
    const norm = ((reportData.charts.ascendant_deg % 360) + 360) % 360;
    lagnaSignIndex = Math.floor(norm / 30);
  }

  const functionalBenefics = {
    0: ["Sun", "Jupiter", "Mars", "Moon"],
    1: ["Saturn", "Mercury", "Venus"],
    2: ["Venus", "Mercury"],
    3: ["Mars", "Jupiter", "Moon"],
    4: ["Sun", "Mars", "Jupiter"],
    5: ["Venus", "Mercury"],
    6: ["Saturn", "Mercury", "Venus"],
    7: ["Jupiter", "Sun", "Moon"],
    8: ["Sun", "Mars", "Jupiter"],
    9: ["Venus", "Mercury", "Saturn"],
    10: ["Venus", "Saturn"],
    11: ["Moon", "Mars", "Jupiter"]
  };

  const benefics = functionalBenefics[lagnaSignIndex] || ["Jupiter", "Venus", "Mercury", "Moon"];

  planets.forEach((p) => {
    if (benefics.includes(p)) {
      effects[p] = "positive";
    } else if (["Saturn", "Mars", "Rahu", "Ketu"].includes(p)) {
      effects[p] = "negative";
    } else {
      effects[p] = "neutral";
    }
  });

  return effects;
};

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

export default function D20ChartWindow() {
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

  // Load General UI Dictionary
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
        if (candidate && (candidate.charts || candidate.vargas?.d20)) {
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
        setError('Failed to compute D20 Vimshamsha Chart data. Please verify your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Base longitudes calculation
  const basePlanets = reportData?.planet_positions || [];
  const baseAscDeg = reportData?.charts?.ascendant_deg !== undefined
    ? reportData.charts.ascendant_deg
    : (reportData?.charts?.houses?.[1]?.cusp_deg || 0);

  const calculatedD20 = calculateD20Vimshamsha(basePlanets, baseAscDeg, currentLang);

  let d20Houses = calculatedD20.d20Houses;
  let d20PlanetPositions = calculatedD20.d20PlanetPositions;

  // If backend provided pre-computed vargas.d20 houses
  if (reportData?.vargas?.d20?.houses) {
    const backendHouses = reportData.vargas.d20.houses;
    d20Houses = backendHouses;

    const mapped = [];
    Object.entries(backendHouses).forEach(([hNum, hData]) => {
      const pList = Array.isArray(hData.planets) ? hData.planets : [];
      pList.forEach(p => {
        const pName = typeof p === 'string' ? p : p.planet || p.name;
        const originalInfo = calculatedD20.d20PlanetPositions.find(x => x.planet === pName);
        mapped.push({
          planet: pName,
          house: parseInt(hNum, 10),
          sign_index: hData.sign_index,
          sign: MULTILINGUAL_SIGNS[currentLang]?.[hData.sign_index] || SIGN_NAMES_EN[hData.sign_index],
          d20Part: originalInfo?.d20Part || 1,
          deity: originalInfo?.deity || D20_DEITIES[0],
          d20Lord: MULTILINGUAL_LORDS[currentLang]?.[hData.sign_index] || MULTILINGUAL_LORDS['en'][hData.sign_index],
          is_retrograde: originalInfo?.is_retrograde || false,
          is_combust: originalInfo?.is_combust || false
        });
      });
    });
    if (mapped.length > 0) {
      d20PlanetPositions = mapped;
    }
  }

  // Planet Dignity & Functional Benefic Effects
  const effects = calculatePlanetEffects(reportData);

  // i18n Table & Header strings
  const tableI18n = D20_TABLE_I18N[currentLang] || D20_TABLE_I18N['hi'] || D20_TABLE_I18N['en'];
  const analysisHeaderI18n = D20_HEADER_I18N[currentLang] || D20_HEADER_I18N['hi'] || D20_HEADER_I18N['en'];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-indigo-400 p-6">
        <RefreshCw className="w-12 h-12 animate-spin mb-4" />
        <h2 className="text-xl font-bold font-serif tracking-widest uppercase">Calculating D20 Vimshamsha Kundali...</h2>
        <p className="text-sm text-slate-400 mt-2 font-mono">Analyzing Spiritual Growth, Meditation, Worship & Vedic Deities</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-red-400 p-6">
        <X className="w-12 h-12 mb-4" />
        <h2 className="text-xl font-bold font-serif tracking-widest uppercase">Error Computing Chart</h2>
        <p className="text-sm text-slate-400 mt-2">{error}</p>
        <button
          onClick={fetchData}
          className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-indigo-100 px-6 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-wide text-slate-900 font-serif">
                D20 Vimshamsha Chart
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                Spiritual Growth · Meditation · Worship
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              {name} • {date} • {time} • {locationName}
            </p>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            <select
              value={currentLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
              disabled={isLangLoading}
              className="bg-transparent text-xs font-bold text-slate-700 outline-hidden cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.native} ({l.name})
                </option>
              ))}
            </select>
          </div>

          {/* Chart Style Switcher */}
          <div className="bg-slate-100 p-0.5 rounded-xl border border-slate-200 flex items-center">
            <button
              onClick={() => setChartStyle('north')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${chartStyle === 'north'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-700 hover:text-black'
                }`}
            >
              North
            </button>
            <button
              onClick={() => setChartStyle('south')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${chartStyle === 'south'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-700 hover:text-black'
                }`}
            >
              South
            </button>
          </div>

          <button
            onClick={() => window.print()}
            title="Print Chart Window"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={() => window.close()}
            title="Close Window"
            className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* ROW 1: Chart & Planet Positions Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* D20 Chart Container */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center">
            {chartStyle === 'north' ? (
              <StandaloneD1Chart
                houses={d20Houses}
                planetPositions={d20PlanetPositions}
                title="D20 Vimshamsha Chart (विंशांश कुंडली - आध्यात्मिकता व उपासना)"
                lang={currentLang}
                hideTransitToggle={true}
              />
            ) : (
              <SouthIndianD1Chart
                houses={d20Houses}
                planetPositions={d20PlanetPositions}
                title="D20 Vimshamsha Chart (விம்சாம்ச சக்கரம்)"
                lang={currentLang}
                hideTransitToggle={true}
              />
            )}
          </div>

          {/* D20 Planetary Positions Table */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 font-serif">
                    {tableI18n.heading}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    {tableI18n.subtitle || "Spiritual Growth · Meditation · Worship · Religious Merit"}
                  </p>
                </div>
                <span className="p-2 bg-purple-50 text-purple-700 rounded-xl">
                  <Flame className="w-5 h-5" />
                </span>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-600">
                    <th className="py-2.5 px-3">{tableI18n.colPlanet}</th>
                    <th className="py-2.5 px-3">{tableI18n.colLord}</th>
                    <th className="py-2.5 px-3">{tableI18n.colDeity}</th>
                    <th className="py-2.5 px-3">{tableI18n.colD20Sign}</th>
                    <th className="py-2.5 px-3 text-right">{tableI18n.colHouse}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {d20PlanetPositions.map((p) => {
                    const color = PLANET_COLORS[p.planet] || "#475569";
                    const isSelected = selectedPlanet === p.planet;
                    const translatedPlanet = translations?.planets?.[p.planet] || p.planet;

                    return (
                      <tr
                        key={p.planet}
                        onClick={() => setSelectedPlanet(p.planet)}
                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-purple-50' : 'hover:bg-slate-50'
                          }`}
                      >
                        <td className="py-3 px-3 font-sans font-bold flex items-center gap-2 text-base" style={{ color }}>
                          <span>{translatedPlanet}</span>
                        </td>
                        <td className="py-3 px-3 font-sans font-semibold text-slate-800 text-xs">
                          {p.d20Lord}
                        </td>
                        <td className="py-3 px-3 font-sans font-bold text-purple-800 text-xs">
                          <span className="inline-flex items-center gap-1 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                            {p.deity}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-sans font-semibold text-black">
                          {p.sign}
                        </td>
                        <td className="py-3 px-3 font-black text-purple-900 text-base text-right">
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
            cid="d20"
            lang={currentLang}
          />
        )}

        {/* ROW 2: Vimsamsa Analysis (D20) Interpretations matching Interactive Worksheet */}
        <section id="section-d20-interpretations" className="w-full max-w-full mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-indigo-200 shadow-xl space-y-6">
          <div className="border-b border-indigo-200 pb-4">
            <h3 className="text-3xl font-serif italic uppercase mb-2 text-slate-900">
              {analysisHeaderI18n.title}
            </h3>
            <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest mb-4">
              {analysisHeaderI18n.subtitle}
            </p>
          </div>

          <p className="text-[15px] text-indigo-900 italic mb-8 whitespace-pre-line leading-relaxed">
            {D20_INTRO_TEXT}
          </p>

          <div className="space-y-6">
            {d20PlanetPositions.map((p) => {
              const status = effects && effects[p.planet] ? effects[p.planet] : "neutral";
              const statusKey = status === "positive" ? "positive" : status === "negative" ? "negative" : "neutral";
              const interpretation = D20_INTERPRETATIONS[p.planet]?.[p.house]?.[statusKey];
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
                    } ${isSelected ? 'ring-2 ring-indigo-500 shadow-md' : 'hover:border-indigo-400'}`}
                >
                  {p.deity && (
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <span className="text-[9px] font-black text-indigo-700 uppercase tracking-widest">
                        {p.sign} · {analysisHeaderI18n.houseLabel} {p.house}
                      </span>
                      <span className="px-3 py-1 bg-purple-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-sm">
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
                    {translatedPlanetName} · {analysisHeaderI18n.houseLabel} {p.house}{' '}
                    <span className="text-xs ml-2 opacity-60">({statusKey})</span>
                  </h4>
                  <BulletInterpretation text={interpretation} colorClass="text-slate-900" />
                </section>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

