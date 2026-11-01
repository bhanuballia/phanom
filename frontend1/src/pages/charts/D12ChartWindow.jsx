import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  Sparkles,
  Printer,
  Compass,
  Users,
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
import { API_BASE_URL } from '../../services/api';
import StandaloneD1Chart from '../../components/StandaloneD1Chart';
import SouthIndianD1Chart from '../../components/SouthIndianD1Chart';
import DynamicVargaAnalysis from '../../components/DynamicVargaAnalysis';
import { D12_INTRO, D12_PLANET_DESCRIPTIONS } from '../../data/d12DwadashamshaData';

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

// Multilingual Sign Lords
const MULTILINGUAL_LORDS = {
  en: ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"],
  hi: ["मंगल (Mars)", "शुक्र (Venus)", "बुध (Mercury)", "चंद्र (Moon)", "सूर्य (Sun)", "बुध (Mercury)", "शुक्र (Venus)", "मंगल (Mars)", "गुरु (Jupiter)", "शनि (Saturn)", "शनि (Saturn)", "गुरु (Jupiter)"],
  ta: ["செவ்வாய் (Mars)", "சுக்கிரன் (Venus)", "புதன் (Mercury)", "சந்திரன் (Moon)", "சூரியன் (Sun)", "புதன் (Mercury)", "சுக்கிரன் (Venus)", "செவ்வாய் (Mars)", "குரு (Jupiter)", "சனி (Saturn)", "சனி (Saturn)", "குரு (Jupiter)"],
  te: ["కుజుడు (Mars)", "శుక్రుడు (Venus)", "బుధుడు (Mercury)", "చంద్రుడు (Moon)", "సూర్యుడు (Sun)", "బుధుడు (Mercury)", "శుక్రుడు (Venus)", "కుజుడు (Mars)", "గురుడు (Jupiter)", "శని (Saturn)", "శని (Saturn)", "గురుడు (Jupiter)"],
  kn: ["ಮಂಗಳ (Mars)", "ಶುಕ್ರ (Venus)", "ಬುಧ (Mercury)", "ಚಂದ್ರ (Moon)", "ಸೂರ್ಯ (Sun)", "ಬುಧ (Mercury)", "ಶುಕ್ರ (Venus)", "ಮಂಗಳ (Mars)", "ಗುರು (Jupiter)", "ಶನಿ (Saturn)", "ಶನಿ (Saturn)", "ಗುರು (Jupiter)"],
  gu: ["મંગળ (Mars)", "શુક્ર (Venus)", "બુધ (Mercury)", "ચંદ્ર (Moon)", "સૂર્ય (Sun)", "બુધ (Mercury)", "શુક્ર (Venus)", "મંગળ (Mars)", "ગુરુ (Jupiter)", "શનિ (Saturn)", "શનિ (Saturn)", "ગુરુ (Jupiter)"],
  mr: ["मंगळ (Mars)", "शुक्र (Venus)", "बुध (Mercury)", "चंद्र (Moon)", "सूर्य (Sun)", "बुध (Mercury)", "शुक्र (Venus)", "मंगळ (Mars)", "गुरु (Jupiter)", "शनी (Saturn)", "शनी (Saturn)", "गुरु (Jupiter)"],
  bn: ["মঙ্গল (Mars)", "শুক্র (Venus)", "বুধ (Mercury)", "চন্দ্র (Moon)", "সূর্য (Sun)", "বুধ (Mercury)", "শুক্র (Venus)", "মঙ্গল (Mars)", "বৃহস্পতি (Jupiter)", "শনি (Saturn)", "শনি (Saturn)", "বৃহস্পতি (Jupiter)"],
  ml: ["ചൊവ്വ (Mars)", "ശുക്രൻ (Venus)", "ബുധൻ (Mercury)", "ചന്ദ്രൻ (Moon)", "സൂര്യൻ (Sun)", "ബുധൻ (Mercury)", "ശുക്രൻ (Venus)", "ചൊവ്വ (Mars)", "വ്യാഴം (Jupiter)", "ശനി (Saturn)", "ശനി (Saturn)", "വ്യാഴം (Jupiter)"],
  pa: ["ਮੰਗਲ (Mars)", "ਸ਼ੁੱਕਰ (Venus)", "ਬੁੱਧ (Mercury)", "ਚੰਦਰਮਾ (Moon)", "ਸੂਰਜ (Sun)", "ਬੁੱਧ (Mercury)", "ਸ਼ੁੱਕਰ (Venus)", "ਮੰਗਲ (Mars)", "ਗੁਰੂ (Jupiter)", "ਸ਼ਨੀ (Saturn)", "ਸ਼ਨੀ (Saturn)", "ਗੁਰੂ (Jupiter)"],
  sa: ["मङ्गलः (Mars)", "शुक्रः (Venus)", "बुधः (Mercury)", "चन्द्रः (Moon)", "सूर्यः (Sun)", "बुधः (Mercury)", "शुक्रः (Venus)", "मङ्गलः (Mars)", "गुरुः (Jupiter)", "शनिः (Saturn)", "शनिः (Saturn)", "गुरुः (Jupiter)"]
};

// D12 Dwadashamsha Deities (4 repeating sets of Ganesha, Ashvini Kumars, Yama, Sarpa)
const D12_DEITIES = [
  "Ganesha (गणेश)",
  "Ashvini Kumars (अश्विनी कुमार)",
  "Yama (यम)",
  "Sarpa (सर्प)",
  "Ganesha (गणेश)",
  "Ashvini Kumars (अश्विनी कुमार)",
  "Yama (यम)",
  "Sarpa (सर्प)",
  "Ganesha (गणेश)",
  "Ashvini Kumars (अश्विनी कुमार)",
  "Yama (यम)",
  "Sarpa (सर्प)"
];

// Multilingual Table Headers
const D12_TABLE_I18N = {
  en: {
    heading: "D12 Dwadashamsha Planetary Status",
    colPlanet: "Planet",
    colD12Sign: "D12 Sign",
    colHouse: "D12 House",
    colPart: "D12 Part",
    colLord: "D12 Lord",
    colDeity: "Deity (देवता)",
    footerText: "Calculated with classical Brihat Parashara Hora Shastra rules (each sign divided into 12 parts of 2°30' starting from the same sign)."
  },
  hi: {
    heading: "डी12 द्वादशांश ग्रह स्थिति",
    colPlanet: "ग्रह",
    colD12Sign: "डी12 राशि",
    colHouse: "डी12 भाव",
    colPart: "द्वादशांश भाग",
    colLord: "राशि स्वामी",
    colDeity: "देवता",
    footerText: "वृहत् पराशर होरा शास्त्र के शास्त्रीय नियमों द्वारा प्रत्येक राशि को 2°30' के 12 भागों में विभाजित कर गणना की गई है।"
  },
  ta: {
    heading: "டி12 துவாதசாம்ச கிரக நிலை",
    colPlanet: "கிரகம்",
    colD12Sign: "டி12 ராசி",
    colHouse: "டி12 பாவம்",
    colPart: "பகுதி",
    colLord: "ராசி அதிபதி",
    colDeity: "தெய்வம்",
    footerText: "பராசர ஹோரா சாஸ்திர முறைப்படி ஒவ்வொரு ராசியும் 2°30' அளவில் 12 பகுதிகளாகப் பிரிக்கப்பட்டு கணக்கிடப்பட்டது."
  },
  te: {
    heading: "డి12 ద్వాదశాంశ గ్రహ స్థితి",
    colPlanet: "గ్రహం",
    colD12Sign: "డి12 రాశి",
    colHouse: "డి12 భావం",
    colPart: "భాగం",
    colLord: "రాశ్యాధిపతి",
    colDeity: "దేవత",
    footerText: "పరాశర హోరా శాస్త్రం ప్రకారం ప్రతి రాశి 2°30' చొప్పున 12 భాగాలుగా విభజించి లెక్కించబడింది."
  },
  kn: {
    heading: "ಡಿ12 ದ್ವಾದಶಾಂಶ ಗ್ರಹ ಸ್ಥಿತಿ",
    colPlanet: "ಗ್ರಹ",
    colD12Sign: "ಡಿ12 ರಾಶಿ",
    colHouse: "ಡಿ12 ಭಾವ",
    colPart: "ಭಾಗ",
    colLord: "ರಾಶ್ಯಾಧಿಪತಿ",
    colDeity: "ದೇವತೆ",
    footerText: "ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರದ ನಿಯಮಗಳ ಪ್ರಕಾರ ಪ್ರತಿ ರಾಶಿಯನ್ನು 2°30' ರಂತೆ 12 ಭಾಗಗಳಾಗಿ ವಿಂಗಡಿಸಿ ಲೆಕ್ಕಹಾಕಲಾಗಿದೆ."
  },
  gu: {
    heading: "ડી12 દ્વાદશાંશ ગ્રહ સ્થિતિ",
    colPlanet: "ગ્રહ",
    colD12Sign: "ડી12 રાશિ",
    colHouse: "ડી12 ભાવ",
    colPart: "દ્વાદશાંશ ભાગ",
    colLord: "રાશિ સ્વામી",
    colDeity: "દેવતા",
    footerText: "બૃહત પરાશર હોરા શાસ્ત્ર અનુસાર દરેક રાશિને 2°30' ના 12 ભાગોમાં વિભાજીત કરી ગણતરી કરવામાં આવી છે."
  },
  mr: {
    heading: "डी12 द्वादशांश ग्रह स्थिती",
    colPlanet: "ग्रह",
    colD12Sign: "डी12 राशी",
    colHouse: "डी12 भाव",
    colPart: "भाग",
    colLord: "राशी स्वामी",
    colDeity: "देवता",
    footerText: "बृहत् पराशर होरा शास्त्रानुसार प्रत्येक राशीचे 2°30' चे 12 भाग करून अचूक गणना केली आहे."
  },
  bn: {
    heading: "ডি১২ দ্বাদশাংশ গ্রহ অবস্থান",
    colPlanet: "গ্রহ",
    colD12Sign: "ডি১২ রাশি",
    colHouse: "ডি১২ ভাব",
    colPart: "অংশ",
    colLord: "রাশি অধিপতি",
    colDeity: "দেবতা",
    footerText: "বৃহৎ পরাশর হোরা শাস্ত্র অনুসারে প্রতিটি রাশিকে ২°৩০' করে ১২টি অংশে ভাগ করে গণনা করা হয়েছে।"
  },
  ml: {
    heading: "ഡി12 ദ്വാദശാംശ ഗ്രഹനില",
    colPlanet: "ഗ്രഹം",
    colD12Sign: "ഡി12 രാശി",
    colHouse: "ഡി12 ഭാവം",
    colPart: "ഭാഗം",
    colLord: "രാശ്യാധിപൻ",
    colDeity: "ദേവത",
    footerText: "പരാശര ഹോരാ ശാസ്ത്ര നിയമപ്രകാരം ഓരോ രാശിയെയും 2°30' വീതമുള്ള 12 ഭാഗങ്ങളാക്കി തിരിച്ച് കണക്കാക്കിയത്."
  },
  pa: {
    heading: "ਡੀ12 ਦਵਾਦਸ਼ਾਂਸ਼ ਗ੍ਰਹਿ ਸਥਿਤੀ",
    colPlanet: "ਗ੍ਰਹਿ",
    colD12Sign: "ਡੀ12 ਰਾਸ਼ੀ",
    colHouse: "ਡੀ12 ਘਰ",
    colPart: "ਭਾਗ",
    colLord: "ਰਾਸ਼ੀ ਸੁਆਮੀ",
    colDeity: "ਦੇਵਤਾ",
    footerText: "ਪਰਾਸ਼ਰ ਹੋਰਾ ਸ਼ਾਸਤਰ ਦੇ ਨਿਯਮਾਂ ਅਨੁਸਾਰ ਹਰੇਕ ਰਾਸ਼ੀ ਨੂੰ 2°30' ਦੇ 12 ਹਿੱਸਿਆਂ ਵਿੱਚ ਵੰਡ ਕੇ ਗਣਨਾ ਕੀਤੀ ਗਈ ਹੈ।"
  },
  sa: {
    heading: "डी12 द्वादशांशग्रहस्थितिः",
    colPlanet: "ग्रहः",
    colD12Sign: "डी12 राशिः",
    colHouse: "डी12 भावः",
    colPart: "द्वादशांशभागः",
    colLord: "राशिस्वामी",
    colDeity: "देवता",
    footerText: "बृहत्पाराशरहोराशास्त्रनियमानुसारेण प्रतिराशिः २°३०' परिमितेषु द्वादशभागेषु विभज्य गणितम्।"
  }
};

// Analysis Header Translations
const D12_HEADER_I18N = {
  en: {
    title: "Dwadasamsa Analysis (D12)",
    subtitle: "The D12 (Dwadasamsa) chart reveals parents, maternal & paternal lineages, and inherited ancestral karma.",
    houseLabel: "House"
  },
  hi: {
    title: "द्वादशांश विश्लेषण (D12 - माता-पिता, कुल व पूर्वज कर्म)",
    subtitle: "डी12 (द्वादशांश) कुंडली माता-पिता, मातृ व पितृ कुल तथा पीढ़ियों से मिले पैतृक व पूर्वज कर्मों को प्रकट करती है।",
    houseLabel: "भाव"
  },
  ta: {
    title: "துவாதசாம்ச பகுப்பாய்வு (D12 - பெற்றோர் & முன்னோர்களின் கர்ம பலன்)",
    subtitle: "டி12 சக்கரம் பெற்றோரின் தன்மை, தாய்-தந்தை வழி பரம்பரை மற்றும் மூதாதையர் ஆசிகளை விளக்குகிறது.",
    houseLabel: "பாவம்"
  },
  te: {
    title: "ద్వాదశాంశ విశ్లేషణ (D12 - తల్లిదండ్రులు & పితృ పరంపర)",
    subtitle: "డి12 చక్రం తల్లిదండ్రుల స్వభావం, మాతృ-పితృ వంశాలు మరియు పూర్వీకుల కర్మలను వివరిస్తుంది.",
    houseLabel: "భావం"
  },
  kn: {
    title: "ದ್ವಾದಶಾಂಶ ವಿಶ್ಲೇಷಣೆ (D12 - ತಂದೆ-ತಾಯಿ & ಪೂರ್ವಜರ ಕರ್ಮ)",
    subtitle: "ಡಿ12 ಕುಂಡಲಿಯು ಪೋಷಕರು, ಮಾತೃ-ಪಿತೃ ವಂಶಸ್ಥರು ಮತ್ತು ಪರಂಪರೆಯಿಂದ ಬಂದ ಕರ್ಮಗಳನ್ನು ವಿವರಿಸುತ್ತದೆ.",
    houseLabel: "ಭಾವ"
  },
  gu: {
    title: "દ્વાદશાંશ વિશ્લેષણ (D12 - માતા-પિતા અને પિતૃ કર્મ)",
    subtitle: "ડી12 કુંડળી માતા-પિતા, માતૃ અને પિતૃ પક્ષ તથા પૂર્વજો પાસેથી મળેલા સંસ્કારોનું દર્શન કરાવે છે.",
    houseLabel: "ભાવ"
  },
  mr: {
    title: "द्वादशांश विश्लेषण (D12 - आई-वडील व पूर्वज कर्म)",
    subtitle: "डी12 कुंडली माता-पिता, मातृ-पितृ घराणे आणि पूर्वजांकडून मिळालेल्या कर्माचे सखोल मार्गदर्शन करते.",
    houseLabel: "भाव"
  },
  bn: {
    title: "দ্বাদশাংশ বিশ্লেষণ (D12 - পিতামাতা ও পূর্বপুরুষের কর্ম)",
    subtitle: "ডি১২ ছক পিতামাতা, মাতৃ ও পিতৃ বংশ এবং বংশানুক্রমিক পূর্বপুরুষের কর্মের গভীর অন্তর্দৃষ্টি প্রদান করে।",
    houseLabel: "ভাব"
  },
  ml: {
    title: "ദ്വാദശാംശ വിശകലനം (D12 - മാതാപിതാക്കൾ, പൂർവ്വിക കർമ്മങ്ങൾ)",
    subtitle: "ഡി12 ചാർട്ട് മാതാപിതാക്കൾ, വംശപരമ്പര, പൂർവ്വികരിൽ നിന്ന് ലഭിച്ച കർമ്മഫലങ്ങൾ എന്നിവ വ്യക്തമാക്കുന്നു.",
    houseLabel: "ഭാവം"
  },
  pa: {
    title: "ਦਵਾਦਸ਼ਾਂਸ਼ ਵਿਸ਼ਲੇਸ਼ਣ (D12 - ਮਾਤਾ-ਪਿਤਾ ਅਤੇ ਪੁਰਖਿਆਂ ਦਾ ਕਰਮ)",
    subtitle: "ਡੀ12 ਕੁੰਡਲੀ ਮਾਤਾ-ਪਿਤਾ, ਨਾਨਕੇ-ਦਾਦਕੇ ਪਰਿਵਾਰ ਅਤੇ ਪੁਰਖਿਆਂ ਦੇ ਕਰਮਾਂ ਦਾ ਗਹਿਰਾ ਵਿਸ਼ਲੇਸ਼ਣ ਪੇਸ਼ ਕਰਦੀ ਹੈ।",
    houseLabel: "ਘਰ"
  },
  sa: {
    title: "द्वादशांश विश्लेषणम् (D12 - मातापितरौ, पितृकुलम् पूर्वजकर्म च)",
    subtitle: "डी12 चक्रं मातापित्रोः प्रभावं, मातृपितृवंशपरम्पराम् तथा पूर्वजकर्मणां फलं प्रकाशयति।",
    houseLabel: "भावः"
  }
};

/**
 * Classical Parashari D12 Dwadashamsha Calculation
 * Each sign (30°) is divided into 12 equal parts of 2°30' (2.5°).
 * Rule: Count starts from the same sign (Sign + part).
 */
function calculateD12Dwadashamsha(basePlanets = [], baseAscDeg = 0, lang = 'en') {
  const lords = MULTILINGUAL_LORDS[lang] || MULTILINGUAL_LORDS['hi'] || MULTILINGUAL_LORDS['en'];
  const signNames = MULTILINGUAL_SIGNS[lang] || MULTILINGUAL_SIGNS['hi'] || MULTILINGUAL_SIGNS['en'];

  const getD12Info = (totalDeg) => {
    const normDeg = ((totalDeg % 360) + 360) % 360;
    const baseSignIdx = Math.floor(normDeg / 30);
    const degInSign = normDeg % 30;

    // Division part 0..11 (2.5 degrees each)
    const divisionPart = Math.min(Math.floor(degInSign / 2.5), 11);
    const d12SignIndex = (baseSignIdx + divisionPart) % 12;
    const deity = D12_DEITIES[divisionPart];

    return {
      d12SignIndex,
      divisionPart: divisionPart + 1,
      deity
    };
  };

  const ascD12 = getD12Info(baseAscDeg);
  const ascD12Sign = ascD12.d12SignIndex;

  const d12Houses = {};
  for (let h = 1; h <= 12; h++) {
    const sIdx = (ascD12Sign + (h - 1)) % 12;
    d12Houses[h] = {
      sign_index: sIdx,
      sign_name: SIGN_NAMES_EN[sIdx],
      planets: []
    };
  }

  const d12PlanetPositions = [];

  basePlanets.forEach((p) => {
    if (p.planet === 'Ascendant' || p.planet === 'Lagna') return;
    const pD12 = getD12Info(p.degree);
    const houseNum = ((pD12.d12SignIndex - ascD12Sign + 12) % 12) + 1;

    d12Houses[houseNum].planets.push({
      planet: p.planet,
      is_retrograde: p.is_retrograde,
      is_combust: p.is_combust
    });

    d12PlanetPositions.push({
      planet: p.planet,
      house: houseNum,
      sign_index: pD12.d12SignIndex,
      sign: signNames[pD12.d12SignIndex],
      d12Part: pD12.divisionPart,
      deity: pD12.deity,
      d12Lord: lords[pD12.d12SignIndex],
      is_retrograde: p.is_retrograde,
      is_combust: p.is_combust
    });
  });

  return { d12Houses, d12PlanetPositions, ascD12Sign };
}

// Function to calculate planet effects
const calculatePlanetEffects = (data) => {
  const effects = {};
  const planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];

  let lagnaSignIndex = 0;
  const lagnaHouse = data?.charts?.houses?.[1] || data?.charts?.houses?.["1"];
  if (lagnaHouse) {
    lagnaSignIndex = lagnaHouse.sign_index !== undefined ? lagnaHouse.sign_index : Math.floor((lagnaHouse.cusp_deg || 0) / 30);
  } else if (data?.charts?.ascendant_sign_index !== undefined) {
    lagnaSignIndex = data.charts.ascendant_sign_index;
  }

  const functionalBenefics = {
    0: ["Sun", "Jupiter", "Mars"],
    1: ["Saturn", "Mercury", "Venus"],
    2: ["Venus", "Saturn"],
    3: ["Mars", "Jupiter", "Moon"],
    4: ["Mars", "Jupiter", "Sun"],
    5: ["Venus", "Mercury"],
    6: ["Saturn", "Mercury"],
    7: ["Jupiter", "Sun", "Moon"],
    8: ["Sun", "Mars"],
    9: ["Venus", "Saturn", "Mercury"],
    10: ["Venus", "Saturn"],
    11: ["Moon", "Mars", "Jupiter"]
  };

  const naturalBenefics = ["Jupiter", "Venus", "Mercury", "Moon"];
  const beneficsForLagna = functionalBenefics[lagnaSignIndex] || [];

  planets.forEach(p => {
    if (beneficsForLagna.includes(p)) {
      effects[p] = "positive";
    } else if (naturalBenefics.includes(p)) {
      effects[p] = "neutral";
    } else {
      effects[p] = "negative";
    }
  });

  return effects;
};

// Bullet point renderer for interpretations
const BulletInterpretation = ({ text, colorClass = "text-amber-800" }) => {
  if (!text) return null;

  const points = text
    .split(/(?<=[.?!])\s+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  if (points.length <= 1) {
    return <p className={`text-[15px] ${colorClass} font-serif leading-relaxed`}>{text}</p>;
  }

  return (
    <ul className="space-y-2.5 mt-2">
      {points.map((pt, idx) => (
        <li key={idx} className="flex items-start gap-2.5 text-[15px] leading-relaxed">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0" />
          <span className={`${colorClass} font-serif`}>{pt}</span>
        </li>
      ))}
    </ul>
  );
};

export default function D12ChartWindow() {
  const [searchParams, setSearchParams] = useSearchParams();

  const name = searchParams.get('name') || 'Seeker';
  const date = searchParams.get('date') || '2000-01-01';
  const time = searchParams.get('time') || '12:00';
  const lat = searchParams.get('lat') || '28.6139';
  const lon = searchParams.get('lon') || '77.2090';
  const tzOffset = searchParams.get('tz_offset') || '5.5';
  const locationName = searchParams.get('location_name') || 'New Delhi, India';

  const urlLang = searchParams.get('lang');
  const savedLang = localStorage.getItem('kundali_hub_lang') || 'en';
  const initialLang = urlLang || savedLang;

  const [currentLang, setCurrentLang] = useState(initialLang);
  const [translations, setTranslations] = useState(null);
  const [d12Translations, setD12Translations] = useState(null);
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

      // Proactively load D12 Dwadashamsha translation
      if (newLang !== 'en') {
        const d12Res = await axios.get(`${API_BASE_URL}/translate/d12-dwadashamsha/${newLang}`);
        if (d12Res.data?.success && d12Res.data?.data) {
          setD12Translations(d12Res.data.data);
          localStorage.setItem(`d12_dwadashamsha_trans_${newLang}`, JSON.stringify(d12Res.data.data));
        }
      } else {
        setD12Translations(null);
      }
    } catch (e) {
      console.warn("Language load failed:", e);
    } finally {
      setIsLangLoading(false);
    }
  };

  // Load General UI Dictionary & D12 Translations
  useEffect(() => {
    if (!currentLang || currentLang === 'en') {
      setTranslations(null);
      setD12Translations(null);
      return;
    }

    const loadDictionaryAndD12 = async () => {
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

        // 2. D12 Translations
        const d12CacheKey = `d12_dwadashamsha_trans_${currentLang}`;
        const cachedD12 = localStorage.getItem(d12CacheKey);
        if (cachedD12) {
          setD12Translations(JSON.parse(cachedD12));
        } else {
          const d12Res = await axios.get(`${API_BASE_URL}/translate/d12-dwadashamsha/${currentLang}`);
          if (d12Res.data?.success && d12Res.data?.data) {
            setD12Translations(d12Res.data.data);
            localStorage.setItem(d12CacheKey, JSON.stringify(d12Res.data.data));
          }
        }
      } catch (err) {
        console.warn(`Could not load translations for ${currentLang}:`, err.message);
      } finally {
        setIsLangLoading(false);
      }
    };

    loadDictionaryAndD12();
  }, [currentLang]);

  // Fetch Chart Data
  useEffect(() => {
    fetchData();
  }, [date, time, lat, lon, tzOffset]);

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartStyle, setChartStyle] = useState('north');
  const [selectedPlanet, setSelectedPlanet] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    // 1. Try reading cached data from sessionStorage / localStorage
    try {
      const cached = sessionStorage.getItem('lastGeneratedKundali') || localStorage.getItem('worksheetData');
      if (cached) {
        const parsed = JSON.parse(cached);
        const candidate = parsed.reportData || parsed;
        if (candidate && (candidate.charts || candidate.vargas?.d12)) {
          setReportData(candidate);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not read cached reportData', e);
    }

    // 2. Fetch from Vedic backend (matches D10 and D9 chart windows)
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
        setError('Failed to compute D12 Dwadashamsha Kundali. Please make sure the astrology backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Base planets
  const basePlanets = reportData?.planet_positions || reportData?.charts?.planet_positions || [];
  const baseAscDeg = reportData?.charts?.ascendant_deg !== undefined
    ? reportData.charts.ascendant_deg
    : (reportData?.charts?.ascendant_degree !== undefined
      ? reportData.charts.ascendant_degree
      : (reportData?.charts?.houses?.[1]?.cusp_deg || 0));

  // Calculate D12 Dwadashamsha
  const calculatedD12 = calculateD12Dwadashamsha(basePlanets, baseAscDeg, currentLang);

  let d12Houses = calculatedD12.d12Houses;
  let d12PlanetPositions = calculatedD12.d12PlanetPositions;

  if (reportData?.vargas?.d12?.houses) {
    const backendHouses = reportData.vargas.d12.houses;
    d12Houses = backendHouses;

    const mapped = [];
    Object.entries(backendHouses).forEach(([hNum, hData]) => {
      (hData.planets || []).forEach(pName => {
        const originalInfo = d12PlanetPositions.find(x => x.planet === pName);
        mapped.push({
          planet: pName,
          house: parseInt(hNum),
          sign_index: hData.sign_index,
          sign: MULTILINGUAL_SIGNS[currentLang]?.[hData.sign_index] || SIGN_NAMES_EN[hData.sign_index],
          d12Part: originalInfo?.d12Part || 1,
          deity: originalInfo?.deity || D12_DEITIES[0],
          d12Lord: MULTILINGUAL_LORDS[currentLang]?.[hData.sign_index] || MULTILINGUAL_LORDS['en'][hData.sign_index],
          is_retrograde: originalInfo?.is_retrograde || false,
          is_combust: originalInfo?.is_combust || false
        });
      });
    });
    if (mapped.length > 0) {
      d12PlanetPositions = mapped;
    }
  }

  // Planet Dignity & Functional Benefic Effects
  const effects = calculatePlanetEffects(reportData);

  // i18n Table & Header strings
  const tableI18n = D12_TABLE_I18N[currentLang] || D12_TABLE_I18N['hi'] || D12_TABLE_I18N['en'];
  const analysisHeaderI18n = D12_HEADER_I18N[currentLang] || D12_HEADER_I18N['hi'] || D12_HEADER_I18N['en'];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-amber-400 p-6">
        <RefreshCw className="w-12 h-12 animate-spin mb-4" />
        <h2 className="text-xl font-bold font-serif tracking-widest uppercase">Calculating D12 Dwadashamsha Kundali...</h2>
        <p className="text-sm text-slate-400 mt-2 font-mono">Analyzing Parental Lineage, Ancestral Karma & Vedic Deities</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-red-400 p-6">
        <X className="w-12 h-12 mb-4" />
        <h2 className="text-xl font-bold">{error}</h2>
        <button
          onClick={fetchData}
          className="mt-4 px-6 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans print:bg-white print:p-0">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-amber-200 px-4 py-3 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-600 flex items-center justify-center text-white shadow-md">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-slate-900">
                  D12 Dwadashamsha Chart
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  माता-पिता, कुल व पूर्वज कर्म
                </span>
              </div>
              <p className="text-[14px] text-slate-900 font-medium">
                {name} • {date} • {time} • {locationName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Chart Style Toggle */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
              <button
                onClick={() => setChartStyle('north')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${chartStyle === 'north'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                North Indian
              </button>
              <button
                onClick={() => setChartStyle('south')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${chartStyle === 'south'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                South Indian
              </button>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1.5 rounded-xl border border-slate-200">
              <Globe className="w-4 h-4 text-amber-700" />
              <select
                value={currentLang}
                onChange={(e) => handleLanguageChange(e.target.value)}
                disabled={isLangLoading}
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.native} ({lang.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition border border-slate-200"
              title="Print Chart Window"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Close Window Button */}
            <button
              onClick={() => window.close()}
              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition border border-rose-200"
              title="Close Tab"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* ROW 1: D12 Chart Visual & Planetary Coordinates Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive D12 Chart */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-black uppercase text-slate-800">
                  D12 Dwadashamsha Visualizer
                </h3>
              </div>
              <span className="text-[11px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                {chartStyle === 'north' ? 'Diamond (North)' : 'Square (South)'}
              </span>
            </div>

            <div className="w-full flex items-center justify-center p-2 bg-slate-50/50 rounded-2xl border border-slate-100">
              {chartStyle === 'north' ? (
                <StandaloneD1Chart
                  houses={d12Houses}
                  planetPositions={d12PlanetPositions}
                  lang={currentLang}
                  activePlanet={selectedPlanet}
                  onPlanetClick={(p) => setSelectedPlanet(p)}
                />
              ) : (
                <SouthIndianD1Chart
                  houses={d12Houses}
                  planetPositions={d12PlanetPositions}
                  lang={currentLang}
                  activePlanet={selectedPlanet}
                  onPlanetClick={(p) => setSelectedPlanet(p)}
                />
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-2 px-1">
              <span>* Click on any planet node to highlight its ancestral readings</span>
              <span className="text-amber-700">Classical Parashari 12-Division</span>
            </div>
          </div>

          {/* Right Column: D12 Planetary Coordinates Table */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-black uppercase text-slate-800">
                  {tableI18n.heading}
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                12-Division Matrix
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-black">
                    <th className="py-3 px-3">{tableI18n.colPlanet}</th>
                    <th className="py-3 px-3">{tableI18n.colD12Sign}</th>
                    <th className="py-3 px-3">{tableI18n.colHouse}</th>
                    <th className="py-3 px-3">{tableI18n.colPart}</th>
                    <th className="py-3 px-3">{tableI18n.colLord}</th>
                    <th className="py-3 px-3">{tableI18n.colDeity}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {d12PlanetPositions.map((p) => {
                    const isSelected = selectedPlanet === p.planet;
                    const translatedPlanet = translations?.planets?.[p.planet] || p.planet;
                    const pColor = PLANET_COLORS[p.planet] || "#475569";

                    return (
                      <tr
                        key={p.planet}
                        onClick={() => setSelectedPlanet(p.planet)}
                        className={`cursor-pointer transition hover:bg-amber-50/60 ${isSelected ? 'bg-amber-100/70 font-bold' : ''
                          }`}
                      >
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: pColor }}
                            />
                            <span>{translatedPlanet}</span>
                            {p.is_retrograde && (
                              <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-1 rounded">R</span>
                            )}
                            {p.is_combust && (
                              <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-1 rounded">C</span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {p.sign}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-900">
                          H{p.house || 1}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-900">
                          {p.d12Part}/12
                        </td>
                        <td className="py-2.5 px-3 text-slate-900">
                          {p.d12Lord}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                            {p.deity}
                          </span>
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
            cid="d12"
            lang={currentLang}
          />
        )}

        {/* ROW 2: Dwadasamsa Analysis (D12) Interpretations matching Interactive Worksheet */}
        <section id="section-d12-interpretations" className="w-full max-w-full mx-auto bg-zinc-200 p-8 sm:p-10 rounded-3xl border border-slate-300 shadow-xl space-y-6">
          <div className="border-b border-slate-300 pb-4">
            <h3 className="text-3xl font-serif italic uppercase mb-2 text-slate-900">
              {analysisHeaderI18n.title}
            </h3>
            <p className="text-[15px] text-amber-900 italic">
              {analysisHeaderI18n.subtitle}
            </p>
          </div>

          <p className="text-[15px] text-amber-900 italic mb-8 whitespace-pre-line leading-relaxed">
            {d12Translations?.intro || D12_INTRO}
          </p>

          <div className="space-y-10">
            {Object.entries(D12_PLANET_DESCRIPTIONS).map(([planet, p_data]) => {
              const isSelected = selectedPlanet === planet;
              const translatedPlanetName = translations?.planets?.[planet] || planet;
              const pPos = d12PlanetPositions.find(p => p.planet === planet);
              const dbPlanet = d12Translations?.planets?.[planet];
              const cardTitle = dbPlanet?.title || `${translatedPlanetName} in Dwadasamsa (D12)`;
              const cardDesc = dbPlanet?.description || p_data.description;

              return (
                <section
                  key={planet}
                  onClick={() => setSelectedPlanet(planet)}
                  className={`bg-white rounded-2xl p-6 border border-slate-200 transition cursor-pointer relative shadow-sm ${isSelected ? 'ring-2 ring-amber-500 shadow-md bg-amber-50/40' : 'hover:border-amber-400'
                    }`}
                >
                  {pPos && (
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest">
                        {pPos.sign} · {analysisHeaderI18n.houseLabel} {pPos.house}
                      </span>
                      <span className="px-3 py-1 bg-amber-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-sm">
                        {pPos.deity}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-3xl">{p_data.icon}</div>
                    <h4 className="text-xl font-black uppercase text-slate-900">
                      {cardTitle}
                    </h4>
                  </div>
                  <BulletInterpretation text={cardDesc} colorClass="text-slate-700" />
                </section>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

