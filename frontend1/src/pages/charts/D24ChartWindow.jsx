import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  GraduationCap,
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
  BookOpen
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../utils/kundaliHubStrings';
import { API_BASE_URL } from '../../services/api';
import StandaloneD1Chart from '../../components/StandaloneD1Chart';
import SouthIndianD1Chart from '../../components/SouthIndianD1Chart';
import DynamicVargaAnalysis from '../../components/DynamicVargaAnalysis';
import { D24_INTERPRETATIONS } from '../../data/d24HouseInterpretations';
import { D24_INTRO, D24_PLANET_DESCRIPTIONS } from '../../data/d24ChaturvimshamshaData';

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

// 24 Deities of Chaturvimshamsha (D24 / Siddhamsa) - Skanda & Parashara traditional cycles
const D24_DEITIES = [
  "Skanda (स्कन्द - Valor & Higher Mind)",
  "Parashudhara (परशुधर - Sharp Intellect)",
  "Anala (अनल - Divine Fire of Intelligence)",
  "Vishwakarma (विश्वकर्मा - Master of Craft & Technology)",
  "Bhaga (भग - Fortune & Sacred Inheritance)",
  "Mitra (मित्र - Universal Harmony & Science)",
  "Varuna (वरुण - Deep Ocean of Wisdom)",
  "Aryama (अर्यमा - Nobility & Tradition)",
  "Vayu (वायु - Swift Thought & Movement)",
  "Surya (सूर्य - Direct Illumination & Truth)",
  "Indra (इन्द्र - Mastery & Sovereign Knowledge)",
  "Vaishvanara (वैश्वानर - Cosmic Consciousness)",
  "Skanda (स्कन्द - Valor & Higher Mind)",
  "Parashudhara (परशुधर - Sharp Intellect)",
  "Anala (अनल - Divine Fire of Intelligence)",
  "Vishwakarma (विश्वकर्मा - Master of Craft & Technology)",
  "Bhaga (भग - Fortune & Sacred Inheritance)",
  "Mitra (मित्र - Universal Harmony & Science)",
  "Varuna (वरुण - Deep Ocean of Wisdom)",
  "Aryama (अर्यमा - Nobility & Tradition)",
  "Vayu (वायु - Swift Thought & Movement)",
  "Surya (सूर्य - Direct Illumination & Truth)",
  "Indra (इन्द्र - Mastery & Sovereign Knowledge)",
  "Vaishvanara (वैश्वानर - Cosmic Consciousness)"
];

// Multilingual Table Headers
const D24_TABLE_I18N = {
  en: {
    heading: "D24 Chaturvimshamsha Planetary Status",
    subtitle: "Higher Education · Academic Learning · Intellectual Mastery · Siddhi",
    colPlanet: "Graha (Planet)",
    colLord: "D24 Lord",
    colDeity: "Deity (Shakti)",
    colD24Sign: "D24 Rashi (Sign)",
    colHouse: "D24 Bhava",
    footerText: "Calculated with classical Brihat Parashara Hora Shastra rules (each sign divided into 24 parts of 1°15')."
  },
  hi: {
    heading: "D24 चतुर्विंशांश ग्रह स्थिति",
    subtitle: "उच्च शिक्षा · विद्या प्राप्ति · बौद्धिक ज्ञान · सिद्धि",
    colPlanet: "ग्रह",
    colLord: "D24 स्वामी",
    colDeity: "अधिष्ठाता देवता",
    colD24Sign: "D24 राशि",
    colHouse: "D24 भाव",
    footerText: "बृहत्पाराशर होराशास्त्र नियमानुसार प्रत्येक राशि के 24 समान भाग (1°15' प्रत्येक) की गणना।"
  },
  ta: {
    heading: "D24 சதுர்விம்சாம்ச கிரக நிலைகள்",
    subtitle: "உயர் கல்வி · கல்வி ஞானம் · அறிவு மேதமை",
    colPlanet: "கிரகம்",
    colLord: "D24 அதிபதி",
    colDeity: "அதிதேவதை",
    colD24Sign: "D24 ராசி",
    colHouse: "D24 பாவம்",
    footerText: "பராசர ஹோரா சாஸ்திர முறைப்படி கணக்கிடப்பட்ட D24 சதுர்விம்சாம்சம்."
  },
  te: {
    heading: "D24 చతుర్వింశాంశ గ్రహ స్థితి",
    subtitle: "ఉన్నత విద్య · విద్యా ప్రాప్తి · పాండిత్యం · జ్ఞాన వికాసం",
    colPlanet: "గ్రహం",
    colLord: "D24 అధిపతి",
    colDeity: "అధిష్టాన దేవత",
    colD24Sign: "D24 రాశి",
    colHouse: "D24 భావం",
    footerText: "బృహత్ పరాశర హోరా శాస్త్రం ప్రకారం లెక్కించబడిన D24 చతుర్వింశాంశ చక్రం."
  },
  kn: {
    heading: "D24 ಚತುರ್ವಿಂಶಾಂಶ ಗ್ರಹ ಸ್ಥಿತಿ",
    subtitle: "ಉನ್ನತ ಶಿಕ್ಷಣ · ವಿದ್ಯಾ ಪ್ರಾಪ್ತಿ · ಜ್ಞಾನ ಸಿದ್ಧಿ",
    colPlanet: "ಗ್ರಹ",
    colLord: "D24 ಅಧಿಪತಿ",
    colDeity: "ಅಧಿದೇವತೆ",
    colD24Sign: "D24 ರಾಶಿ",
    colHouse: "D24 ಭಾವ",
    footerText: "ಬೃಹತ್ ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರ ನಿಯಮದಂತೆ ಲೆಕ್ಕಿಸಲಾದ D24 ಚತುರ್ವಿಂಶಾಂಶ."
  },
  gu: {
    heading: "D24 ચતુર્વિંશાંશ ગ્રહ સ્થિતિ",
    subtitle: "ઉચ્ચ શિક્ષણ · વિદ્યા પ્રાપ્તિ · બૌદ્ધિક જ્ઞાન · સિદ્ધિ",
    colPlanet: "ગ્રહ",
    colLord: "D24 સ્વામી",
    colDeity: "અધિષ્ઠાતા દેવતા",
    colD24Sign: "D24 રાશિ",
    colHouse: "D24 ભાવ",
    footerText: "બૃહત્ પરાશર હોરાશાસ્ત્ર નિયમ અનુસાર D24 ગણતરી."
  },
  mr: {
    heading: "D24 चतुर्विंशांश ग्रह स्थिती",
    subtitle: "उच्च शिक्षण · विद्या प्राप्ती · बौद्धिक कौशल्य · ज्ञान सिद्धी",
    colPlanet: "ग्रह",
    colLord: "D24 स्वामी",
    colDeity: "अधिष्ठाता देवता",
    colD24Sign: "D24 राशी",
    colHouse: "D24 भाव",
    footerText: "बृहत्पाराशर होराशास्त्र नियमानुसार D24 चतुर्विंशांश गणना."
  },
  bn: {
    heading: "D24 চতুর্বিংশাংশ গ্রহ স্থিতি",
    subtitle: "উচ্চ শিক্ষা · বিদ্যা লাভ · বৌদ্ধিক জ্ঞান · সিদ্ধি",
    colPlanet: "গ্রহ",
    colLord: "D24 অধিপতি",
    colDeity: "অধিষ্ঠাতা দেবতা",
    colD24Sign: "D24 রাশি",
    colHouse: "D24 ভাব",
    footerText: "বৃহৎপরাশরোক্ত পদ্ধতি অনুসারে নির্ণীত D24 চতুর্বিংশাংশ ছক।"
  },
  ml: {
    heading: "D24 ചതുർവിംശാംശ ഗ്രഹനില",
    subtitle: "ഉന്നത വിദ്യാഭ്യാസം · പാണ്ഡിത്യം · വിജ്ഞാനം",
    colPlanet: "ഗ്രഹം",
    colLord: "D24 അധിപൻ",
    colDeity: "അധിദേവത",
    colD24Sign: "D24 രാശി",
    colHouse: "D24 ഭാവം",
    footerText: "ബൃഹത് പരാശര ഹോരാ ശാസ്ത്ര വിധിപ്രകാരം കണക്കാക്കിയ D24 ചതുർവിംശാംശം."
  },
  pa: {
    heading: "D24 ਚਤੁਰਵਿੰਸ਼ਾਂਸ਼ ਗ੍ਰਹਿ ਸਥਿਤੀ",
    subtitle: "ਉੱਚ ਸਿੱਖਿਆ · ਵਿੱਦਿਆ ਪ੍ਰਾਪਤੀ · ਬੌਧਿਕ ਗਿਆਨ",
    colPlanet: "ਗ੍ਰਹਿ",
    colLord: "D24 ਸੁਆਮੀ",
    colDeity: "ਅਧਿਸ਼ਠਾਤਾ ਦੇਵਤਾ",
    colD24Sign: "D24 ਰਾਸ਼ੀ",
    colHouse: "D24 ਭਾਵ",
    footerText: "ਬ੍ਰਿਹਤ ਪਰਾਸ਼ਰ ਹੋਰਾ ਸ਼ਾਸਤਰ ਅਨੁਸਾਰ D24 ਚਤੁਰਵਿੰਸ਼ਾਂਸ਼ ਗਣਨਾ।"
  },
  sa: {
    heading: "D24 चतुर्विंशांश ग्रह स्थितिः",
    subtitle: "उच्च शिक्षा · विद्या प्राप्तिः · पाण्डित्यम् · ज्ञान सिद्धिः",
    colPlanet: "ग्रहः",
    colLord: "D24 स्वामी",
    colDeity: "अधिष्ठाता देवता",
    colD24Sign: "D24 राशिः",
    colHouse: "D24 भावः",
    footerText: "बृहत्पाराशरहोराशास्त्रोक्त नियमानुसारं D24 चतुर्विंशांश चक्र गणना।"
  }
};

// Analysis Header Translations
const D24_HEADER_I18N = {
  en: {
    title: "Chaturvimshamsa Analysis (D24)",
    subtitle: "Deep House-by-House Higher Education & Intellectual Specialization Interpretations",
    houseLabel: "House"
  },
  hi: {
    title: "चतुर्विंशांश विश्लेषण (D24 - उच्च शिक्षा एवं विद्या)",
    subtitle: "उच्च शिक्षा, बौद्धिक क्षमता, परीक्षा सफलता एवं ज्ञान सिद्धि का भाववार विश्लेषण",
    houseLabel: "भाव"
  },
  ta: {
    title: "சதுர்விம்சாம்ச பகுப்பாய்வு (D24 - உயர் கல்வி மற்றும் அறிவு)",
    subtitle: "உயர் கல்வி மற்றும் புத்திக்கூர்மை பற்றிய விரிவான பலன்கள்",
    houseLabel: "பாவம்"
  },
  te: {
    title: "చతుర్వింశాంశ విశ్లేషణ (D24 - ఉన్నత విద్య & జ్ఞానం)",
    subtitle: "ఉన్నత విద్య, విద్యా ప్రతిభ మరియు పరీక్షా విజయాల విశేష విశ్లేషణ",
    houseLabel: "భావం"
  },
  kn: {
    title: "ಚತುರ್ವಿಂಶಾಂಶ ವಿಶ್ಲೇಷಣೆ (D24 - ಉನ್ನತ ಶಿಕ್ಷಣ ಮತ್ತು ಜ್ಞಾನ)",
    subtitle: "ಉನ್ನತ ವಿದ್ಯಾಭ್ಯಾಸ ಮತ್ತು ಬೌದ್ಧಿಕ ಸಾಮರ್ಥ್ಯದ ವಿವರವಾದ ಫಲಗಳು",
    houseLabel: "ಭಾವ"
  },
  gu: {
    title: "ચતુર્વિંશાંશ વિશ્લેષણ (D24 - ઉચ્ચ શિક્ષણ અને જ્ઞાન)",
    subtitle: "ઉચ્ચ વિદ્યાભ્યાસ, બૌદ્ધિક પ્રગતિ અને વિદ્યા સિદ્ધિનું વિસ્તૃત વિશ્લેષણ",
    houseLabel: "ભાવ"
  },
  mr: {
    title: "चतुर्विंशांश विश्लेषण (D24 - उच्च शिक्षण आणि ज्ञान)",
    subtitle: "उच्च शिक्षण, बौद्धिक प्रज्ञा आणि शैक्षणिक यशाचे सखोल विश्लेषण",
    houseLabel: "भाव"
  },
  bn: {
    title: "চতুর্বিংশাংশ বিশ্লেষণ (D24 - উচ্চ শিক্ষা ও বিদ্যা)",
    subtitle: "ডি-২৪ ছক আপনার উচ্চ শিক্ষা, পাণ্ডিত্য এবং জ্ঞান লাভের পূর্ণ চিত্র প্রকাশ করে।",
    houseLabel: "ভাব"
  },
  ml: {
    title: "ചതുർവിംശാംശ വിശകലനം (D24 - ഉന്നത വിദ്യാഭ്യാസം)",
    subtitle: "ഉന്നത വിദ്യാഭ്യാസം, വിജ്ഞാനം, പരീക്ഷാ വിജയം എന്നിവയുടെ സമഗ്ര വിശകലനം.",
    houseLabel: "ഭാവം"
  },
  pa: {
    title: "ਚਤੁਰਵਿੰਸ਼ਾਂਸ਼ ਵਿਸ਼ਲੇਸ਼ਣ (D24 - ਉੱਚ ਸਿੱਖਿਆ ਅਤੇ ਗਿਆਨ)",
    subtitle: "ਉੱਚ ਵਿੱਦਿਆ, ਬੌਧਿਕ ਯੋਗਤਾ ਅਤੇ ਪ੍ਰੀਖਿਆਵਾਂ ਵਿੱਚ ਸਫਲਤਾ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ।",
    houseLabel: "ਘਰ"
  },
  sa: {
    title: "चतुर्विंशांश विश्लेषणम् (D24 - उच्च शिक्षा, विद्या, ज्ञानम् च)",
    subtitle: "डी-२४ चक्रं भवतः उच्चशिक्षायाः, पाण्डित्यस्य, मेधायाश्च गूढरहस्यं प्रकाशयति।",
    houseLabel: "भावः"
  }
};

/**
 * Parashari D24 Chaturvimshamsha (Siddhamsa) Calculation
 * Each sign (30°) is divided into 24 equal parts of 1°15' (1.25 degrees) each.
 * - Odd signs (1, 3, 5, 7, 9, 11 -> idx 0, 2, 4, 6, 8, 10): count starts from Leo (sign index 4)
 * - Even signs (2, 4, 6, 8, 10, 12 -> idx 1, 3, 5, 7, 9, 11): count starts from Cancer (sign index 3)
 */
function calculateD24Chaturvimshamsha(basePlanets = [], baseAscDeg = 0, lang = 'en') {
  const lords = MULTILINGUAL_LORDS[lang] || MULTILINGUAL_LORDS['hi'] || MULTILINGUAL_LORDS['en'];
  const signNames = MULTILINGUAL_SIGNS[lang] || MULTILINGUAL_SIGNS['hi'] || MULTILINGUAL_SIGNS['en'];

  const getD24Info = (totalDeg) => {
    const normDeg = ((totalDeg % 360) + 360) % 360;
    const baseSignIdx = Math.floor(normDeg / 30);
    const degInSign = normDeg % 30;

    // Division part 0..23 (1.25 degrees each)
    const divisionPart = Math.min(Math.floor(degInSign / 1.25), 23);

    // Odd sign: start from Leo (4); Even sign: start from Cancer (3)
    const startSign = (baseSignIdx % 2 === 0) ? 4 : 3;
    const d24SignIndex = (startSign + divisionPart) % 12;
    const deity = D24_DEITIES[divisionPart];

    return {
      d24SignIndex,
      divisionPart: divisionPart + 1,
      deity
    };
  };

  const ascD24 = getD24Info(baseAscDeg);
  const ascD24Sign = ascD24.d24SignIndex;

  const d24Houses = {};
  for (let h = 1; h <= 12; h++) {
    const sIdx = (ascD24Sign + (h - 1)) % 12;
    d24Houses[h] = {
      sign_index: sIdx,
      sign: signNames[sIdx],
      lord: lords[sIdx],
      planets: []
    };
  }

  const d24PlanetPositions = [];
  basePlanets.forEach((p) => {
    const pD24 = getD24Info(p.degree);
    const houseNum = ((pD24.d24SignIndex - ascD24Sign + 12) % 12) + 1;

    if (d24Houses[houseNum]) {
      d24Houses[houseNum].planets.push(p.planet);
    }

    d24PlanetPositions.push({
      planet: p.planet,
      house: houseNum,
      sign_index: pD24.d24SignIndex,
      sign: signNames[pD24.d24SignIndex],
      d24Part: pD24.divisionPart,
      deity: pD24.deity,
      d24Lord: lords[pD24.d24SignIndex],
      is_retrograde: p.is_retrograde,
      is_combust: p.is_combust
    });
  });

  return { d24Houses, d24PlanetPositions, ascD24Sign };
}

// Calculate Dignities & Functional Benefic Effects
const calculatePlanetEffects = (reportData) => {
  const effects = {};
  const planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];

  let lagnaSignIndex = 0;
  if (reportData?.vargas?.d24?.houses?.[1]?.sign_index !== undefined) {
    lagnaSignIndex = reportData.vargas.d24.houses[1].sign_index;
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

export default function D24ChartWindow() {
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
  const [d24Translations, setD24Translations] = useState(null);
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
        const d24Res = await axios.get(`${API_BASE_URL}/translate/d24-chaturvimshamsha/${newLang}`);
        if (d24Res.data?.success && d24Res.data?.data) {
          setD24Translations(d24Res.data.data);
          localStorage.setItem(`d24_chaturvimshamsha_trans_${newLang}`, JSON.stringify(d24Res.data.data));
        }
      } else {
        setD24Translations(null);
      }
    } catch (e) {
      console.warn('Could not fetch language translations for D24:', e);
    } finally {
      setIsLangLoading(false);
    }
  };

  useEffect(() => {
    if (currentLang && currentLang !== 'en') {
      axios.get(`${API_BASE_URL}/translate/kundali-hub/${currentLang}`)
        .then(res => { if (res.data) setTranslations(res.data); })
        .catch(e => console.warn('Language preload error:', e));

      // Fetch D24 translations from cache or database
      const cacheKey = `d24_chaturvimshamsha_trans_${currentLang}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          setD24Translations(JSON.parse(cached));
        } catch (e) { }
      } else {
        axios.get(`${API_BASE_URL}/translate/d24-chaturvimshamsha/${currentLang}`)
          .then(res => {
            if (res.data?.success && res.data?.data) {
              setD24Translations(res.data.data);
              localStorage.setItem(cacheKey, JSON.stringify(res.data.data));
            }
          })
          .catch(e => console.warn('D24 DB translation error:', e));
      }
    } else {
      setD24Translations(null);
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
        if (candidate && (candidate.charts || candidate.vargas?.d24)) {
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
        setError('Failed to compute D24 Chaturvimshamsha Chart data. Please verify your connection.');
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

  const calculatedD24 = calculateD24Chaturvimshamsha(basePlanets, baseAscDeg, currentLang);

  let d24Houses = calculatedD24.d24Houses;
  let d24PlanetPositions = calculatedD24.d24PlanetPositions;

  // If backend provided pre-computed vargas.d24 houses
  if (reportData?.vargas?.d24?.houses) {
    const backendHouses = reportData.vargas.d24.houses;
    d24Houses = backendHouses;

    const mapped = [];
    Object.entries(backendHouses).forEach(([hNum, hData]) => {
      const pList = Array.isArray(hData.planets) ? hData.planets : [];
      pList.forEach(p => {
        const pName = typeof p === 'string' ? p : p.planet || p.name;
        const originalInfo = calculatedD24.d24PlanetPositions.find(x => x.planet === pName);
        mapped.push({
          planet: pName,
          house: parseInt(hNum, 10),
          sign_index: hData.sign_index,
          sign: MULTILINGUAL_SIGNS[currentLang]?.[hData.sign_index] || SIGN_NAMES_EN[hData.sign_index],
          d24Part: originalInfo?.d24Part || 1,
          deity: originalInfo?.deity || D24_DEITIES[0],
          d24Lord: MULTILINGUAL_LORDS[currentLang]?.[hData.sign_index] || MULTILINGUAL_LORDS['en'][hData.sign_index],
          is_retrograde: originalInfo?.is_retrograde || false,
          is_combust: originalInfo?.is_combust || false
        });
      });
    });
    if (mapped.length > 0) {
      d24PlanetPositions = mapped;
    }
  }

  // Planet Dignity & Functional Benefic Effects
  const effects = calculatePlanetEffects(reportData);

  // i18n Table & Header strings
  const tableI18n = D24_TABLE_I18N[currentLang] || D24_TABLE_I18N['hi'] || D24_TABLE_I18N['en'];
  const analysisHeaderI18n = D24_HEADER_I18N[currentLang] || D24_HEADER_I18N['hi'] || D24_HEADER_I18N['en'];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-indigo-400 p-6">
        <RefreshCw className="w-12 h-12 animate-spin mb-4" />
        <h2 className="text-xl font-bold font-serif tracking-widest uppercase">Calculating D24 Chaturvimshamsha Kundali...</h2>
        <p className="text-sm text-slate-400 mt-2 font-mono">Analyzing Higher Education, Wisdom, Intellect & Vedic Deities</p>
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
            <GraduationCap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-wide text-slate-900 font-serif">
                D24 Chaturvimshamsha Chart
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                Higher Education · Learning · Wisdom
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
          {/* D24 Chart Container */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center">
            {chartStyle === 'north' ? (
              <StandaloneD1Chart
                houses={d24Houses}
                planetPositions={d24PlanetPositions}
                title="D24 Chaturvimshamsha Chart (चतुर्विंशांश कुंडली - विद्या व सिद्धि)"
                lang={currentLang}
                hideTransitToggle={true}
              />
            ) : (
              <SouthIndianD1Chart
                houses={d24Houses}
                planetPositions={d24PlanetPositions}
                title="D24 Chaturvimshamsha Chart (சதுர்விம்சாம்ச சக்கரம்)"
                lang={currentLang}
                hideTransitToggle={true}
              />
            )}
          </div>

          {/* D24 Planetary Positions Table */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 font-serif">
                    {tableI18n.heading}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    {tableI18n.subtitle || "Higher Education · Learning · Wisdom · Intellectual Mastery"}
                  </p>
                </div>
                <span className="p-2 bg-purple-50 text-purple-700 rounded-xl">
                  <BookOpen className="w-5 h-5" />
                </span>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-600">
                    <th className="py-2.5 px-3">{tableI18n.colPlanet}</th>
                    <th className="py-2.5 px-3">{tableI18n.colLord}</th>
                    <th className="py-2.5 px-3">{tableI18n.colDeity}</th>
                    <th className="py-2.5 px-3">{tableI18n.colD24Sign}</th>
                    <th className="py-2.5 px-3 text-right">{tableI18n.colHouse}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {d24PlanetPositions.map((p) => {
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
                          {p.d24Lord}
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
            cid="d24"
            lang={currentLang}
          />
        )}

        {/* ROW 2: Chaturvimshamsa Analysis (D24) Interpretations matching Interactive Worksheet */}
        <section id="section-d24-interpretations" className="w-full max-w-full mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-indigo-200 shadow-xl space-y-6">
          <div className="border-b border-indigo-200 pb-4">
            <h3 className="text-3xl font-serif italic uppercase mb-2 text-slate-900">
              {d24Translations?.ui?.sectionTitle || analysisHeaderI18n.title}
            </h3>
            <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest mb-4">
              {d24Translations?.ui?.sectionSubtitle || analysisHeaderI18n.subtitle}
            </p>
          </div>

          <p className="text-[15px] text-indigo-900 italic mb-8 whitespace-pre-line leading-relaxed">
            {d24Translations?.intro || D24_INTRO}
          </p>

          <div className="space-y-6">
            {d24PlanetPositions.map((p) => {
              const status = effects && effects[p.planet] ? effects[p.planet] : "neutral";
              const statusKey = status === "positive" ? "positive" : status === "negative" ? "negative" : "neutral";

              // Prefer translated interpretation from DB, fallback to English
              const dbInterp = d24Translations?.interpretations?.[p.planet]?.[p.house]?.[statusKey];
              const interpretation = dbInterp || D24_INTERPRETATIONS[p.planet]?.[p.house]?.[statusKey];
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
                        {p.sign} · {d24Translations?.ui?.houseBadge || analysisHeaderI18n.houseLabel} {p.house}
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
                    {translatedPlanetName} · {d24Translations?.ui?.houseBadge || analysisHeaderI18n.houseLabel} {p.house}{' '}
                    <span className="text-xs ml-2 opacity-60">({statusKey})</span>
                  </h4>
                  <BulletInterpretation text={interpretation} colorClass="text-slate-900" />
                </section>
              );
            })}
          </div>
        </section>

        {/* Detailed Planetary Study in Siddhamsa Section */}
        <section className="w-full max-w-full mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-indigo-200 shadow-xl space-y-6">
          <div className="border-b border-indigo-200 pb-4">
            <h3 className="text-2xl font-serif italic uppercase mb-1 text-slate-900">
              Planetary Significators in Chaturvimshamsha (D24)
            </h3>
            <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest">
              Classical Impact of Each Planet on Intellectual Accomplishment and Learning Focus
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(D24_PLANET_DESCRIPTIONS).map(([planet, pDesc]) => (
              <div
                key={planet}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-indigo-300 transition-all shadow-xs"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{pDesc.icon}</span>
                  <h4 className="font-bold text-slate-900 text-base">{pDesc.title}</h4>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed font-sans">{pDesc.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

