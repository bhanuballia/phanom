import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  Sparkles,
  Printer,
  Compass,
  Briefcase,
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
import { D10_INTERPRETATIONS } from '../../data/d10HouseInterpretations';

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
  pa: ["ਮੰਗਲ (Mars)", "ਸ਼ੁੱਕਰ (Venus)", "ਬੁੱਧ (Mercury)", "ਚੰਦਰਮਾ (Moon)", "ਸੂਰਜ (Sun)", "ਬੁੱਧ (Mercury)", "ਸ਼ੁੱਕਰ (Venus)", "ਮੰਗਲ (Mars)", "ਗੁਰੂ (Jupiter)", "ਸ਼ਨਿੱਚਰ (Saturn)", "ਸ਼ਨਿੱਚਰ (Saturn)", "ਗੁਰੂ (Jupiter)"],
  sa: ["मङ्गलः (Mars)", "शुक्रः (Venus)", "बुधः (Mercury)", "चन्द्रः (Moon)", "सूर्यः (Sun)", "बुधः (Mercury)", "शुक्रः (Venus)", "मङ्गलः (Mars)", "गुरुः (Jupiter)", "शनिः (Saturn)", "शनिः (Saturn)", "गुरुः (Jupiter)"]
};

// 10 Digpalas (Deities) of Dashamsha
const D10_DEITIES = [
  "Indra (इन्द्र - पूर्व / Leadership)",
  "Agni (अग्नि - आग्नेय / Energy)",
  "Yama (यम - दक्षिण / Discipline)",
  "Rakshasa / Nirriti (निरृति - नैऋत्य / Power)",
  "Varuna (वरुण - पश्चिम / Strategy)",
  "Vayu (वायु - वायव्य / Movement)",
  "Kubera (कुबेर - उत्तर / Wealth)",
  "Ishana (ईशान - ईशान / Vision)",
  "Brahma (ब्रह्मा - ऊर्ध्व / Creation)",
  "Ananta (अनन्त - अधः / Foundation)"
];

// Multilingual Table Headers for D10
const D10_TABLE_I18N = {
  en: {
    heading: "Dashamsha (D10) Planetary Positions",
    subtitle: "Parashari Seshadri Iyer Style - Career, Karma, Authority, and Professional Status",
    colPlanet: "Planet",
    colLord: "D10 Lord",
    colDeity: "Dashamsha Digpala",
    colSign: "D10 Sign",
    colHouse: "D10 House",
    footerText: "Click on any planet row or chart element to highlight its career karma and professional impact."
  },
  hi: {
    heading: "दशांश कुंडली (D10) ग्रहीय स्थिति",
    subtitle: "पराशरी अय्यर पद्धति - कर्म, आजीविका, अधिकार, पद-प्रतिष्ठा एवं सफलता का सूक्ष्म विश्लेषण",
    colPlanet: "ग्रह",
    colLord: "D10 स्वामी",
    colDeity: "दशांश दिक्पाल (देवता)",
    colSign: "D10 राशि",
    colHouse: "D10 भाव",
    footerText: "किसी भी ग्रह पर क्लिक करके उसकी आजीविका, पदोन्नति एवं कर्म फल का विवरण देखें।"
  },
  ta: {
    heading: "தசாம்ச சக்கரம் (D10) கிரக நிலைகள்",
    subtitle: "பராசர அய்யர் முறை - தொழில், அதிகாரம், கர்ம வினைகள் மற்றும் சமூக அந்தஸ்து பகுப்பாய்வு",
    colPlanet: "கிரகம்",
    colLord: "D10 அதிபதி",
    colDeity: "தசாம்ச திக்பாலர்",
    colSign: "D10 ராசி",
    colHouse: "D10 பாவம்",
    footerText: "எந்தவொரு கிரகத்தின் மீதும் கிளிக் செய்து அதன் தொழில் யோக பலன்களைக் காண்க."
  },
  te: {
    heading: "దశాంశ చక్రం (D10) గ్రహ స్థితులు",
    subtitle: "పరాశరి అయ్యర్ విధానం - వృత్తి, అధికారం, కర్మ విధి మరియు సామాజిక హోదా విశ్లేషణ",
    colPlanet: "గ్రహం",
    colLord: "D10 అధిపతి",
    colDeity: "దశాంశ దిక్పాలకుడు",
    colSign: "D10 రాశి",
    colHouse: "D10 భావం",
    footerText: "ఏదైనా గ్రహంపై క్లిక్ చేసి దాని వృత్తి ఫలితాలు మరియు అభివృద్ధి వివరాలు చూడండి."
  },
  kn: {
    heading: "ದಶಾಂಶ ಕುಂಡಲಿ (D10) ಗ್ರಹ ಸ್ಥಿತಿ",
    subtitle: "ಪರಾಶರಿ ಅಯ್ಯರ್ ಪದ್ಧತಿ - ಉದ್ಯೋಗ, ಅಧಿಕಾರ, ಕರ್ಮ ಮತ್ತು ವೃತ್ತಿಪರ ಯಶಸ್ಸಿನ ಸೂಕ್ಷ್ಮ ವಿಶ್ಲೇಷಣೆ",
    colPlanet: "ಗ್ರಹ",
    colLord: "D10 ಅಧಿಪತಿ",
    colDeity: "ದಶಾಂಶ ದಿಕ್ಪಾಲಕ",
    colSign: "D10 ರಾಶಿ",
    colHouse: "D10 ಭಾವ",
    footerText: "ಯಾವುದೇ ಗ್ರಹದ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ ಅದರ ಉದ್ಯೋಗ ಭಾಗ್ಯ ಮತ್ತು ಪ್ರಭಾವವನ್ನು ವೀಕ್ಷಿಸಿ."
  },
  gu: {
    heading: "દશાંશ કુંડળી (D10) ગ્રહ સ્થિતિ",
    subtitle: "પારાશરી ઐયર પદ્ધતિ - કારકિર્દી, પદ-પ્રતિષ્ઠા, અધિકાર અને વ્યાવસાયિક ઉન્નતિનું ફળકથન",
    colPlanet: "ગ્રહ",
    colLord: "D10 સ્વામી",
    colDeity: "દશાંશ દિક્પાલ",
    colSign: "D10 રાશિ",
    colHouse: "D10 ભાવ",
    footerText: "કોઈપણ ગ્રહ પર ક્લિક કરીને કારકિર્દી અને પ્રમોશન સંબંધી સૂક્ષ્મ વિશ્લેષણ જુઓ."
  },
  mr: {
    heading: "दशांश कुंडली (D10) ग्रहांची स्थिती",
    subtitle: "पराशरी अय्यर पद्धत - व्यवसाय, नोकरी, अधिकार, पद व सामाजिक प्रतिष्ठेचे सखोल मार्गदर्शन",
    colPlanet: "ग्रह",
    colLord: "D10 स्वामी",
    colDeity: "दशांश दिक्पाल",
    colSign: "D10 राशी",
    colHouse: "D10 भाव",
    footerText: "कोणत्याही ग्रहावर क्लिक करून त्याचे करिअर व व्यावसायिक प्रगतीचे फळ पाहा."
  },
  bn: {
    heading: "দশাংশ কুন্ডলী (D10) গ্রহের স্থিতি",
    subtitle: "পরাশরীয় আইয়ার পদ্ধতি - কর্মজীবন, পেশা, কর্তৃত্ব ও সামাজিক খ্যাতির গভীর বিশ্লেষণ",
    colPlanet: "গ্রহ",
    colLord: "D10 অধিপতি",
    colDeity: "দশাংশ দিকপাল",
    colSign: "D10 রাশি",
    colHouse: "D10 ভাব",
    footerText: "যে কোনো গ্রহের উপর ক্লিক করে তার কর্মজীবন ও উন্নতির বিবরণ দেখুন।"
  },
  ml: {
    heading: "ദശാംശ ചാർട്ട് (D10) ഗ്രഹനില",
    subtitle: "പരാശര അയ്യർ ശൈലി - കരിയർ, കർമ്മഫലം, അധികാരം, പ്രശസ്തി എന്നിവയുടെ സൂക്ഷ്മ വിശകലനം",
    colPlanet: "ഗ്രഹം",
    colLord: "D10 അധിപൻ",
    colDeity: "ദശാംശ ദിക്പാലകൻ",
    colSign: "D10 രാശി",
    colHouse: "D10 ഭാവം",
    footerText: "ഏതെങ്കിലും ഗ്രഹത്തിൽ ക്ലിക്ക് ചെയ്ത് അതിന്റെ തൊഴിൽ വിജയ വിവരങ്ങൾ കാണുക."
  },
  pa: {
    heading: "ਦਸ਼ਾਂਸ਼ ਕੁੰਡਲੀ (D10) ਗ੍ਰਹਿ ਸਥਿਤੀ",
    subtitle: "ਪਰਾਸ਼ਰੀ ਅਈਅਰ ਪੱਧਤੀ - ਕਰੀਅਰ, ਅਹੁਦਾ, ਅਧਿਕਾਰ ਅਤੇ ਸਮਾਜਿਕ ਰੁਤਬੇ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ",
    colPlanet: "ਗ੍ਰਹਿ",
    colLord: "D10 ਸੁਆਮੀ",
    colDeity: "ਦਸ਼ਾਂਸ਼ ਦਿਗਪਾਲ",
    colSign: "D10 ਰਾਸ਼ੀ",
    colHouse: "D10 ਭਾਵ",
    footerText: "ਕਿਸੇ ਵੀ ਗ੍ਰਹਿ 'ਤੇ ਕਲਿੱਕ ਕਰਕੇ ਉਸਦੇ ਕੰਮ-ਕਾਜ ਅਤੇ ਤਰੱਕੀ ਬਾਰੇ ਵੇਰਵੇ ਦੇਖੋ।"
  },
  sa: {
    heading: "दशांश चक्रम् (D10) ग्रहाणां स्थितिः",
    subtitle: "पाराशरीय अय्यर् पद्धतिः - कर्म, अधिकारः, पदप्रतिष्ठा तथा वृत्तिसामर्थ्यस्य सूक्ष्मकथनम्",
    colPlanet: "ग्रहः",
    colLord: "D10 स्वामी",
    colDeity: "दशांशदिक्पालः",
    colSign: "D10 राशिः",
    colHouse: "D10 भावः",
    footerText: "कस्मिश्चिदपि ग्रहे क्लिक् कृत्वा तस्य कर्मफलस्य अधिकारसामर्थ्यस्य च विवरणं पश्यन्तु।"
  }
};

// Section Header I18n
const D10_ANALYSIS_HEADER_I18N = {
  en: {
    title: "Dashamsha Analysis (D10)",
    subtitle: "The D-10 (Dashamsha) chart reveals your karma, career trajectory, power, and professional reputation. It acts as the microscopic view of the 10th house of your birth chart, detailing what you will achieve in the world and how you handle authority.",
    houseLabel: "House",
    introText: "The Dashamsha (D10) chart is the ultimate engine for Professional Career Karma and Success analysis. Our system uses the authentic \"Iyer Method\" (Seshadri Iyer style) where counting for even signs starts from the 9th house, providing high-precision Parashari results. Dashamsha reveals not just your job title, but your authority, reputation, and professional destiny. Whether you are built for Corporate Leadership (Job) or Entrepreneurship (Business), D10 uncovers the \"Natal Promise\" that transits and dashas then activate."
  },
  hi: {
    title: "दशांश विश्लेषण (D10 - कर्म, आजीविका, पद व अधिकार)",
    subtitle: "डी-10 (दशांश) कुंडली जीवन में कर्म, आजीविका की दिशा, अधिकार और पेशेवर प्रतिष्ठा को दर्शाती है। यह जन्मकुंडली के दशम भाव का सूक्ष्म विश्लेषण है, जो यह स्पष्ट करता है कि संसार में आप क्या उपलब्धियां प्राप्त करेंगे।",
    houseLabel: "भाव",
    introText: "दशांश (D10) कुंडली पेशेवर करियर, कर्म एवं सफलता का सर्वोच्च दर्पण है। हमारी प्रणाली प्रामाणिक 'अय्यर पद्धति' (शेषाद्रि अय्यर शैली) का उपयोग करती है, जहां सम राशियों की गणना नवम भाव से आरंभ होती है। दशांश केवल आपकी पदवी ही नहीं, बल्कि आपके अधिकार, मान-प्रतिष्ठा और व्यावसायिक भाग्य को प्रकट करता है।"
  },
  ta: {
    title: "தசாம்ச பகுப்பாய்வு (D10 - தொழில், அதிகாரம் & கர்ம வினை)",
    subtitle: "டி-10 (தசாம்சம்) சக்கரம் உங்கள் தொழில் பாதை, அதிகாரம் மற்றும் சமூக அந்தஸ்தை விவரிக்கிறது. இது ராசி சக்கரத்தின் 10-ஆம் பாவத்தின் நுணுக்கமான பார்வையாகும்.",
    houseLabel: "பாவம்",
    introText: "தசாம்ச (D10) சக்கரம் உங்கள் தொழில் வெற்றி மற்றும் கர்ம வினைகளின் ஆழமான பகுப்பாய்வு சக்கரமாகும். நமது அமைப்பு பிரமாணமான 'அய்யர் முறையை' பயன்படுத்தி துல்லியமான பராசர பலன்களை வழங்குகிறது."
  },
  te: {
    title: "దశాంశ విశ్లేషణ (D10 - వృత్తి, అధికారం & కర్మ ఫలం)",
    subtitle: "డి-10 (దశాంశ) చక్రం మీ వృత్తి పురోగతి, అధికారం మరియు సామాజిక గౌరవాన్ని సూచిస్తుంది. ఇది జన్మకుండలిలోని 10వ భావానికి సంబంధించిన సూక్ష్మ విశ్లేషణ.",
    houseLabel: "భావం",
    introText: "దశాంశ (D10) చక్రం వృత్తిపరమైన కర్మ మరియు విజయాన్ని విశ్లేషించే ప్రధాన సాధనం. మన వ్యవస్థ ప్రామాణిక 'అయ్యర్ పద్ధతి'ని అనుసరించి అత్యంత ఖచ్చితమైన పరాశరి ఫలితాలను అందిస్తుంది."
  },
  kn: {
    title: "ದಶಾಂಶ ವಿಶ್ಲೇಷಣೆ (D10 - ವೃತ್ತಿ, ಅಧಿಕಾರ ಮತ್ತು ಕರ್ಮ ಫಲ)",
    subtitle: "ಡಿ-10 (ದಶಾಂಶ) ಕುಂಡಲಿಯು ನಿಮ್ಮ ಉದ್ಯೋಗ ಪಥ, ಅಧಿಕಾರ ಮತ್ತು ವೃತ್ತಿಪರ ಯಶಸ್ಸನ್ನು ತಿಳಿಸುತ್ತದೆ. ಇದು ಜನ್ಮ ಕುಂಡಲಿಯ ಹತ್ತನೇ ಭಾವದ ಸೂಕ್ಷ್ಮ ನೋಟವಾಗಿದೆ.",
    houseLabel: "ಭಾವ",
    introText: "ದಶಾಂಶ (D10) ಕುಂಡಲಿಯು ವೃತ್ತಿಪರ ಕರ್ಮ ಮತ್ತು ಯಶಸ್ಸನ್ನು ವಿಶ್ಲೇಷಿಸುವ ಅತ್ಯುನ್ನತ ಸಾಧನವಾಗಿದೆ. ನಮ್ಮ ವ್ಯವಸ್ಥೆಯು ಸಾಂಪ್ರದಾಯಿಕ 'ಅಯ್ಯರ್ ಪದ್ಧತಿ'ಯನ್ನು ಅನುಸರಿಸಿ ನಿಖರ ಫಲಿತಾಂಶ ನೀಡುತ್ತದೆ."
  },
  gu: {
    title: "દશાંશ વિશ્લેષણ (D10 - કારકિર્દી, અધિકાર અને પદ-પ્રતિષ્ઠા)",
    subtitle: "ડી-10 (દશાંશ) કુંડળી તમારી કારકિર્દીની દિશા, સત્તા અને વ્યાવસાયિક માન-સન્માનનું સૂક્ષ્મ દર્શન કરાવે છે. આ જન્મકુંડળીના 10મા ભાવનું સૂક્ષ્મ સ્વરૂપ છે.",
    houseLabel: "ભાવ",
    introText: "દશાંશ (D10) કુંડળી વ્યાવસાયિક સફળતા અને કર્મ ફળનું સર્વોચ્ચ દર્પણ છે. અમારી પ્રણાલી પ્રમાણિક 'ઐયર પદ્ધતિ'નો ઉપયોગ કરે છે, જે પારાશરી નિયમો અનુસાર ઉચ્ચ ચોકસાઈ આપે છે."
  },
  mr: {
    title: "दशांश विश्लेषण (D10 - करिअर, अधिकार व व्यावसायिक यश)",
    subtitle: "डी-१० (दशांश) कुंडली तुमच्या कर्माची दिशा, नोकरी-व्यवसाय, अधिकार आणि सामाजिक प्रतिष्ठा स्पष्ट करते. हा जन्मकुंडलीतील दहाव्या भावाचा सूक्ष्म आरसा आहे.",
    houseLabel: "भाव",
    introText: "दशांश (D10) कुंडली ही व्यावसायिक यशाची आणि करिअर कर्माची अत्यंत महत्त्वाची वर्ग कुंडली आहे. आमची प्रणाली शेषाद्री अय्यर यांच्या पारंपरिक व अचूक पद्धतीचा वापर करते."
  },
  bn: {
    title: "দশাংশ বিশ্লেষণ (D10 - কর্মজীবন, পেশা ও সামাজিক মর্যাদা)",
    subtitle: "ডি-১০ (দশাংশ) কুন্ডলী আপনার কর্মজীবনের গতিপ্রকৃতি, পদমর্যাদা এবং পেশাগত খ্যাতি প্রকাশ করে। এটি জন্মছকের দশম ভাবের একটি গভীর অনুবীক্ষণমূলক বিশ্লেষণ।",
    houseLabel: "ভাব",
    introText: "দশাংশ (D10) কুন্ডলী পেশাগত সাফল্য ও কর্মফলের চূড়ান্ত নির্দেশক। আমাদের ব্যবস্থা খাঁটি 'আইয়ার পদ্ধতি' ব্যবহার করে অত্যন্ত নির্ভুল পরাশরীয় ফলাফল প্রদান করে।"
  },
  ml: {
    title: "ദശാംശ വിശകലനം (D10 - തൊഴിൽ, അധികാരം, കരിയർ)",
    subtitle: "ഡി-10 (ദശാംശം) ചാർട്ട് നിങ്ങളുടെ കരിയർ പാത, അധികാരം, സാമൂഹിക പ്രശസ്തി എന്നിവ വ്യക്തമാക്കുന്നു. ഇത് ജാതകത്തിലെ പത്താം ഭാവത്തിന്റെ സൂക്ഷ്മ രൂപമാണ്.",
    houseLabel: "ഭാവം",
    introText: "ദശാംശ (D10) ചാർട്ട് തൊഴിൽപരമായ കർമ്മത്തിന്റെയും വിജയത്തിന്റെയും പൂർണ്ണ ചിത്രമാണ്. അയ്യർ ശൈലിയിലുള്ള ആധികാരിക കണക്കുകൂട്ടലുകൾ ഇവിടെ ഉപയോഗിക്കുന്നു."
  },
  pa: {
    title: "ਦਸ਼ਾਂਸ਼ ਵਿਸ਼ਲੇਸ਼ਣ (D10 - ਕਾਰੋਬਾਰ, ਅਹੁਦਾ ਅਤੇ ਅਧਿਕਾਰ)",
    subtitle: "ਡੀ-10 (ਦਸ਼ਾਂਸ਼) ਕੁੰਡਲੀ ਕਰੀਅਰ ਦੀ ਤਰੱਕੀ, ਤਾਕਤ ਅਤੇ ਸਮਾਜਿਕ ਰੁਤਬੇ ਨੂੰ ਦਰਸਾਉਂਦੀ ਹੈ। ਇਹ ਜਨਮ ਕੁੰਡਲੀ ਦੇ 10ਵੇਂ ਘਰ ਦਾ ਸੂਖਮ ਅਧਿਐਨ ਹੈ।",
    houseLabel: "ਭਾਵ",
    introText: "ਦਸ਼ਾਂਸ਼ (D10) ਕੁੰਡਲੀ ਪੇਸ਼ੇਵਰ ਕਾਮਯਾਬੀ ਦਾ ਸਭ ਤੋਂ ਵੱਡਾ ਸ਼ੀਸ਼ਾ ਹੈ। ਸਾਡੀ ਪ੍ਰਣਾਲੀ ਪਰਾਸ਼ਰੀ ਅਈਅਰ ਪੱਧਤੀ ਅਨੁਸਾਰ ਸਟੀਕ ਨਤੀਜੇ ਪੇਸ਼ ਕਰਦੀ ਹੈ।"
  },
  sa: {
    title: "दशांश विश्लेषणम् (D10 - कर्म, अधिकारः तथा वृत्तिसामर्थ्यम्)",
    subtitle: "डी-१० (दशांश) चक्रं जातकस्य कर्मक्षेत्रं, प्रभुत्वम्, यशः तथा सामाजिकप्रतिष्ठां प्रकटयति। एतत् लग्नकुण्डल्याः दशमभावस्य सूक्ष्मदर्शी विश्लेषणम् अस्ति।",
    houseLabel: "भावः",
    introText: "दशांश (D10) चक्रं वृत्तिसफलतायाः कर्मणश्च परमं प्रमाणम्। अत्र शेषाद्रि-अय्यर्-पद्धत्या विशुद्धपाराशरीयगणना क्रियते येन उच्चकोटिशुद्धिफलं लभ्यते।"
  }
};

/**
 * Parashari Seshadri Iyer D10 Calculation
 * Odd Signs: Start from same sign
 * Even Signs: Start from 9th sign (Sign + 8)
 */
function calculateD10Dashamsha(basePlanets = [], baseAscDeg = 0, lang = 'en') {
  const lords = MULTILINGUAL_LORDS[lang] || MULTILINGUAL_LORDS['hi'] || MULTILINGUAL_LORDS['en'];
  const signNames = MULTILINGUAL_SIGNS[lang] || MULTILINGUAL_SIGNS['hi'] || MULTILINGUAL_SIGNS['en'];

  const getD10Info = (totalDeg) => {
    const normDeg = ((totalDeg % 360) + 360) % 360;
    const baseSignIdx = Math.floor(normDeg / 30);
    const degInSign = normDeg % 30;

    // Division part 0..9 (3 degrees each)
    const divisionPart = Math.min(Math.floor(degInSign / 3.0), 9);

    let startSign;
    // ODD signs (1, 3, 5, 7, 9, 11 -> idx 0, 2, 4, 6, 8, 10): start from same sign
    if (baseSignIdx % 2 === 0) {
      startSign = baseSignIdx;
    } else {
      // EVEN signs: start from 9th sign (baseSignIdx + 8) % 12
      startSign = (baseSignIdx + 8) % 12;
    }

    const d10SignIndex = (startSign + divisionPart) % 12;
    const deity = D10_DEITIES[divisionPart];

    return {
      d10SignIndex,
      divisionPart: divisionPart + 1,
      deity
    };
  };

  const ascD10 = getD10Info(baseAscDeg);
  const ascD10Sign = ascD10.d10SignIndex;

  const d10Houses = {};
  for (let h = 1; h <= 12; h++) {
    const sIdx = (ascD10Sign + (h - 1)) % 12;
    d10Houses[h] = {
      sign_index: sIdx,
      sign_name: SIGN_NAMES_EN[sIdx],
      planets: []
    };
  }

  const d10PlanetPositions = [];

  basePlanets.forEach((p) => {
    if (p.planet === 'Ascendant' || p.planet === 'Lagna') return;
    const pD10 = getD10Info(p.degree);
    const houseNum = ((pD10.d10SignIndex - ascD10Sign + 12) % 12) + 1;

    d10Houses[houseNum].planets.push({
      planet: p.planet,
      is_retrograde: p.is_retrograde,
      is_combust: p.is_combust
    });

    d10PlanetPositions.push({
      planet: p.planet,
      house: houseNum,
      sign_index: pD10.d10SignIndex,
      sign: signNames[pD10.d10SignIndex],
      d10Part: pD10.divisionPart,
      deity: pD10.deity,
      d10Lord: lords[pD10.d10SignIndex],
      is_retrograde: p.is_retrograde,
      is_combust: p.is_combust
    });
  });

  return { d10Houses, d10PlanetPositions, ascD10Sign };
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

export default function D10ChartWindow() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartStyle, setChartStyle] = useState('north');
  const [selectedPlanet, setSelectedPlanet] = useState(null);
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
  const [d10Translations, setD10Translations] = useState(null);
  const [d10InterpretationsMap, setD10InterpretationsMap] = useState({});
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

      // Also proactively fetch D10 interpretations on dropdown switch
      if (newLang !== 'en') {
        const d10Res = await axios.get(`${API_BASE_URL}/translate/d10-dashamsha/${newLang}`);
        if (d10Res.data?.success && d10Res.data?.data) {
          setD10Translations(d10Res.data.data);
          localStorage.setItem(`d10_dashamsha_trans_${newLang}`, JSON.stringify(d10Res.data.data));
        }
      } else {
        setD10Translations(null);
      }
    } catch (e) {
      console.warn("Language load failed:", e);
    } finally {
      setIsLangLoading(false);
    }
  };

  // Load General UI Dictionary & D10 Database Translations (including Dynamic AI)
  useEffect(() => {
    if (!currentLang || currentLang === 'en') {
      setTranslations(null);
      setD10Translations(null);
      return;
    }

    const loadDictionaryAndD10 = async () => {
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

        // 2. D10 Dashamsha Database Translations (Dynamic AI & Interpretations)
        const d10CacheKey = `d10_dashamsha_trans_${currentLang}`;
        const cachedD10 = localStorage.getItem(d10CacheKey);
        if (cachedD10) {
          setD10Translations(JSON.parse(cachedD10));
        } else {
          const d10Res = await axios.get(`${API_BASE_URL}/translate/d10-dashamsha/${currentLang}`);
          if (d10Res.data?.success && d10Res.data?.data) {
            setD10Translations(d10Res.data.data);
            localStorage.setItem(d10CacheKey, JSON.stringify(d10Res.data.data));
          }
        }
      } catch (err) {
        console.warn(`Could not load translations for ${currentLang}:`, err.message);
      } finally {
        setIsLangLoading(false);
      }
    };

    loadDictionaryAndD10();
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
        if (candidate && (candidate.charts || candidate.vargas?.d10)) {
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
        setError('Failed to compute D10 Dashamsha Kundali. Please make sure the astrology backend is running.');
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

  const calculatedD10 = calculateD10Dashamsha(basePlanets, baseAscDeg, currentLang);

  let d10Houses = calculatedD10.d10Houses;
  let d10PlanetPositions = calculatedD10.d10PlanetPositions;

  if (reportData?.vargas?.d10?.houses) {
    const backendHouses = reportData.vargas.d10.houses;
    d10Houses = backendHouses;

    const positions = [];
    Object.entries(backendHouses).forEach(([hNum, hData]) => {
      (hData.planets || []).forEach(p => {
        const pName = typeof p === 'string' ? p : (p.planet || p.name);
        if (pName === 'Ascendant' || pName === 'Lagna') return;
        const matchingBase = calculatedD10.d10PlanetPositions.find(x => x.planet === pName);
        positions.push({
          planet: pName,
          house: parseInt(hNum),
          sign_index: hData.sign_index,
          sign: MULTILINGUAL_SIGNS[currentLang]?.[hData.sign_index] || SIGN_NAMES_EN[hData.sign_index],
          d10Part: matchingBase?.d10Part || 1,
          deity: matchingBase?.deity || D10_DEITIES[0],
          d10Lord: matchingBase?.d10Lord || MULTILINGUAL_LORDS[currentLang]?.[hData.sign_index] || 'Mars',
          is_retrograde: typeof p === 'object' ? p.is_retrograde : false,
          is_combust: typeof p === 'object' ? p.is_combust : false
        });
      });
    });

    if (positions.length > 0) {
      d10PlanetPositions = positions;
    }
  }

  const effects = calculatePlanetEffects(reportData);
  const tableI18n = D10_TABLE_I18N[currentLang] || D10_TABLE_I18N['hi'] || D10_TABLE_I18N['en'];
  const analysisHeaderI18n = D10_ANALYSIS_HEADER_I18N[currentLang] || D10_ANALYSIS_HEADER_I18N['hi'] || D10_ANALYSIS_HEADER_I18N['en'];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white px-4">
        <div className="relative mb-6">
          <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <Briefcase className="w-8 h-8 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
        </div>
        <h2 className="text-xl md:text-2xl font-serif font-black tracking-wide text-indigo-200">
          Synthesizing D10 Dashamsha (दशांश कुंडली)...
        </h2>
        <p className="text-sm text-slate-400 mt-2">Computing Parashari Iyer Method, Career Karma, Dignities & Power</p>
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
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
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
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/30">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif font-black text-slate-900 text-base md:text-lg flex items-center gap-2">
                D10 Dashamsha Chart
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300">
                  कर्म, अधिकार व आजीविका
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
                ? 'bg-indigo-50 text-indigo-900 border-indigo-300 shadow-2xs'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/60'
                }`}
              title={isAudioMuted ? 'Play Swasti Vachan Mantra' : 'Mute Mantra'}
            >
              <Zap className="w-4 h-4 text-indigo-600" />
              <span className="hidden md:inline">{isAudioMuted ? 'Play Audio' : 'Mute Audio'}</span>
            </button>

            {/* Language Selector */}
            <div className="relative">
              <select
                value={currentLang}
                onChange={(e) => handleLanguageChange(e.target.value)}
                disabled={isLangLoading}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 px-3 rounded-xl border border-slate-300 cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              title="Print Chart Window"
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
      <main className="max-w-7xl w-full mx-auto px-4 md:px-6 py-6 space-y-8 flex-grow">
        {/* ROW 1: D10 Chart Visual + Planetary Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* D10 Chart Container */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center">
            {chartStyle === 'north' ? (
              <StandaloneD1Chart
                houses={d10Houses}
                planetPositions={d10PlanetPositions}
                title="D10 Dashamsha Chart (दशांश कुंडली - कर्म, अधिकार एवं यश)"
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
                houses={d10Houses}
                planetPositions={d10PlanetPositions}
                title="D10 Dashamsha Chart (दशांश कुंडली - कर्म, अधिकार एवं यश)"
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

          {/* D10 Planetary Positions Table Card */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col h-full">
            <div className="flex justify-between items-center bg-indigo-50 border border-indigo-200/80 p-3.5 rounded-2xl mb-4">
              <div>
                <h2 className="text-base font-black font-serif text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  {tableI18n.heading}
                </h2>
                <p className="text-xs font-bold text-indigo-900 mt-0.5">
                  {tableI18n.subtitle}
                </p>
              </div>
              <span className="text-xs font-black text-indigo-950 bg-white px-2.5 py-1 rounded-full border border-indigo-300">
                16-Varga D10
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
                  {d10PlanetPositions.map((p) => {
                    const color = PLANET_COLORS[p.planet] || "#0f172a";
                    const isSelected = selectedPlanet === p.planet;
                    const translatedPlanet = translations?.planets?.[p.planet] || p.planet;

                    return (
                      <tr
                        key={p.planet}
                        onClick={() => setSelectedPlanet(p.planet)}
                        className={`hover:bg-indigo-50/60 cursor-pointer transition ${isSelected ? "bg-indigo-100/70 font-bold" : ""}`}
                      >
                        <td className="py-3 px-3 font-sans font-bold flex items-center gap-2 text-base" style={{ color }}>
                          <span>{translatedPlanet}</span>
                        </td>
                        <td className="py-3 px-3 font-sans font-semibold text-slate-800 text-xs">
                          {p.d10Lord}
                        </td>
                        <td className="py-3 px-3 font-sans font-bold text-indigo-800 text-xs">
                          <span className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                            {p.deity}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-sans font-semibold text-black">
                          {p.sign}
                        </td>
                        <td className="py-3 px-3 font-black text-indigo-900 text-base">
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
            cid="d10"
            lang={currentLang}
            dbDynamicAi={d10Translations?.dynamicAi}
          />
        )}

        {/* ROW 3: Dashamsha Analysis (D10) Interpretations */}
        <section id="section-d10-interpretations" className="bg-white p-6 md:p-8 rounded-3xl border border-indigo-200 shadow-xl space-y-6">
          <div className="border-b border-indigo-200/80 pb-4">
            <h3 className="text-3xl font-serif italic uppercase mb-2 text-slate-900">
              {d10Translations?.ui?.sectionTitle || analysisHeaderI18n.title}
            </h3>
            <p className="text-[15px] text-indigo-900 italic">
              {d10Translations?.ui?.sectionSubtitle || analysisHeaderI18n.subtitle}
            </p>
          </div>

          <div className="space-y-6">
            {d10PlanetPositions.map((p) => {
              const status = effects && effects[p.planet] ? effects[p.planet] : "neutral";
              const statusKey = status === "positive" ? "positive" : status === "negative" ? "negative" : "neutral";

              // Check if translated interpretation is available in MongoDB d10Translations
              const dbInterp = d10Translations?.interpretations?.[p.planet]?.[p.house]?.[statusKey];
              const rawInterpretation = dbInterp || D10_INTERPRETATIONS[p.planet]?.[p.house]?.[statusKey];
              if (!rawInterpretation) return null;

              const translatedPlanetName = translations?.planets?.[p.planet] || p.planet;
              const houseLabel = d10Translations?.ui?.houseBadge || analysisHeaderI18n.houseLabel;
              const deityLabel = d10Translations?.ui?.deityLabel || "Dashamsha Deity";
              const isSelected = selectedPlanet === p.planet;

              return (
                <section
                  key={p.planet}
                  onClick={() => setSelectedPlanet(p.planet)}
                  className={`bg-indigo-50/70 rounded-2xl p-6 border border-indigo-200 transition cursor-pointer relative ${isSelected ? 'ring-2 ring-indigo-500 shadow-md bg-indigo-100/60' : 'hover:border-indigo-400'
                    }`}
                >
                  {p.deity && (
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                        {deityLabel}
                      </span>
                      <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-md">
                        {p.deity}
                      </span>
                    </div>
                  )}
                  <h4 className="text-lg font-black uppercase text-indigo-900 mb-2">
                    {translatedPlanetName} · {houseLabel} {p.house}{' '}
                    <span className="text-xs ml-2 opacity-60">({statusKey})</span>
                  </h4>
                  <BulletInterpretation text={rawInterpretation} colorClass="text-indigo-800" />
                </section>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

