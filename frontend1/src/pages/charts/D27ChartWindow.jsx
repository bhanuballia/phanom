import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  ShieldAlert,
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
  HeartPulse,
  Flame,
  Activity
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../utils/kundaliHubStrings';
import { API_BASE_URL } from '../../services/api';
import StandaloneD1Chart from '../../components/StandaloneD1Chart';
import SouthIndianD1Chart from '../../components/SouthIndianD1Chart';
import DynamicVargaAnalysis from '../../components/DynamicVargaAnalysis';
import { D27_INTERPRETATIONS } from '../../data/d27HouseInterpretations';
import { D27_INTRO, D27_PLANET_DESCRIPTIONS } from '../../data/d27BhamsaData';

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

// 27 Deities of Saptavimshamsha / Bhamsa (Nakshatra Presiding Deities)
const D27_DEITIES = [
  "Ashwini Kumaras (अश्विनीकुमार - Healing & Rejuvenation)",
  "Yama (यम - Dharma & Self-Discipline)",
  "Agni (अग्नि - Sacred Digestive & Vital Fire)",
  "Prajapati / Brahma (प्रजापति - Creative Potential)",
  "Soma (सोम - Nectar of Mind & Immortality)",
  "Rudra (रुद्र - Dissolution of Obstacles)",
  "Aditi (अदिति - Boundless Grace & Protection)",
  "Brihaspati (बृहस्पति - Divine Wisdom & Counsel)",
  "Sarpa (सर्प - Kundalini & Primal Energy)",
  "Pitris (पितृ - Ancestral Resilience & Lineage)",
  "Bhaga (भग - Prosperity & Vital Fortune)",
  "Aryama (अर्यमा - Enduring Bonds & Societal Duty)",
  "Savitar (सविता - Solar Awakening & Life Force)",
  "Tvashtar (त्वष्टा - Skillful Craft & Structure)",
  "Vayu (वायु - Swift Prana & Respiratory Power)",
  "Indragni (इन्द्राग्नि - Dual Force of Power & Focus)",
  "Mitra (मित्र - Compassion & Universal Amity)",
  "Indra (इन्द्र - Sovereign Courage & Supremacy)",
  "Nirriti (निरृति - Root Transformation & Release)",
  "Apas (आपः - Cleansing Elemental Waters)",
  "Vishwadevas (विश्वेदेवाः - Universal Virtues & Harmony)",
  "Vishnu (विष्णु - All-Pervasive Sustenance)",
  "Vasus (वसवः - Material Elements & Stability)",
  "Varuna (वरुण - Cosmic Order & Ocean of Subconscious)",
  "Aja Ekapada (अजैकपाद - Cosmic Pillar & Ascetic Fire)",
  "Ahirbudhnya (अहिर्बुध्न्य - Deep Oceanic Serpent of Kundalini)",
  "Pushan (पूषा - Nourishment & Safe Transition)"
];

// Multilingual Table Headers
const D27_TABLE_I18N = {
  en: {
    heading: "D27 Saptavimshamsha (Bhamsa) Planetary Status",
    subtitle: "Inner Strength · Subconscious Vitality · Soul Power · General Well-being",
    colPlanet: "Graha (Planet)",
    colLord: "D27 Lord",
    colDeity: "Deity (Devata)",
    colD27Sign: "D27 Rashi (Sign)",
    colHouse: "D27 Bhava",
    footerText: "Calculated with classical Brihat Parashara Hora Shastra rules (each sign divided into 27 parts of 1°06'40'')."
  },
  hi: {
    heading: "D27 सप्तविंशांश (भांश) ग्रह स्थिति",
    subtitle: "आत्मबल · आंतरिक ऊर्जा · प्राण शक्ति · सामान्य स्वास्थ्य व धैर्य",
    colPlanet: "ग्रह",
    colLord: "D27 स्वामी",
    colDeity: "अधिष्ठाता देवता",
    colD27Sign: "D27 राशि",
    colHouse: "D27 भाव",
    footerText: "बृहत्पाराशर होराशास्त्र नियमानुसार प्रत्येक राशि के 27 समान भाग (1°06'40\" प्रत्येक) की गणना।"
  },
  ta: {
    heading: "D27 சப்தவிம்சாம்ச (பாம்சம்) கிரக நிலைகள்",
    subtitle: "உள் வலிமை · உயிர் ஆற்றல் · ஆன்ம சக்தி · பொது நலன்",
    colPlanet: "கிரகம்",
    colLord: "D27 அதிபதி",
    colDeity: "அதிதேவதை",
    colD27Sign: "D27 ராசி",
    colHouse: "D27 பாவம்",
    footerText: "பராசர ஹோரா சாஸ்திர முறைப்படி கணக்கிடப்பட்ட D27 சப்தவிம்சாம்சம்."
  },
  te: {
    heading: "D27 సప్తవింశాంశ (భాంస) గ్రహ స్థితి",
    subtitle: "ఆత్మబలం · అంతర్గత శక్తి · ప్రాణశక్తి · సంపూర్ణ ఆరోగ్యం",
    colPlanet: "గ్రహం",
    colLord: "D27 అధిపతి",
    colDeity: "అధిష్టాన దేవత",
    colD27Sign: "D27 రాశి",
    colHouse: "D27 భావం",
    footerText: "బృహత్ పరాశర హోరా శాస్త్రం ప్రకారం లెక్కించబడిన D27 సప్తవింశాంశ చక్రం."
  },
  kn: {
    heading: "D27 ಸಪ್ತವಿಂಶಾಂಶ (ಭಾಂಶ) ಗ್ರಹ ಸ್ಥಿತಿ",
    subtitle: "ಆತ್ಮಬಲ · ಆಂತರಿಕ ಶಕ್ತಿ · ಪ್ರಾಣ ಶಕ್ತಿ · ದೃಢತೆ",
    colPlanet: "ಗ್ರಹ",
    colLord: "D27 ಅಧಿಪತಿ",
    colDeity: "ಅಧಿದೇವತೆ",
    colD27Sign: "D27 ರಾಶಿ",
    colHouse: "D27 ಭಾವ",
    footerText: "ಬೃಹತ್ ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರ ನಿಯಮದಂತೆ ಲೆಕ್ಕಿಸಲಾದ D27 ಸಪ್ತವಿಂಶಾಂಶ."
  },
  gu: {
    heading: "D27 સપ્તવિંશાંશ (ભાંશ) ગ્રહ સ્થિતિ",
    subtitle: "આત્મબળ · આંતરિક ઊર્જા · પ્રાણ શક્તિ · સહનશીલતા",
    colPlanet: "ગ્રહ",
    colLord: "D27 સ્વામી",
    colDeity: "અધિષ્ઠાતા દેવતા",
    colD27Sign: "D27 રાશિ",
    colHouse: "D27 ભાવ",
    footerText: "બૃહત્ પરાશર હોરાશાસ્ત્ર નિયમ અનુસાર D27 ગણતરી."
  },
  mr: {
    heading: "D27 सप्तविंशांश (भांश) ग्रह स्थिती",
    subtitle: "आत्मबळ · आंतरिक ऊर्जा · प्राण शक्ती · सहनशीलता व आरोग्य",
    colPlanet: "ग्रह",
    colLord: "D27 स्वामी",
    colDeity: "अधिष्ठाता देवता",
    colD27Sign: "D27 राशी",
    colHouse: "D27 भाव",
    footerText: "बृहत्पाराशर होराशास्त्र नियमानुसार D27 सप्तविंशांश गणना."
  },
  bn: {
    heading: "D27 সপ্তবিংশাংশ (ভাংশ) গ্রহ স্থিতি",
    subtitle: "আত্মবল · অভ্যন্তরীণ শক্তি · প্রাণ শক্তি · জীবনীশক্তি",
    colPlanet: "গ্রহ",
    colLord: "D27 অধিপতি",
    colDeity: "অধিষ্ঠাতা দেবতা",
    colD27Sign: "D27 রাশি",
    colHouse: "D27 ভাব",
    footerText: "বৃহৎপরাশরোক্ত পদ্ধতি অনুসারে নির্ণীত D27 সপ্তবিংশাংশ ছক।"
  },
  ml: {
    heading: "D27 സപ്തവിംശാംശ ഗ്രഹനില",
    subtitle: "ആത്മബലം · പ്രാണശക്തി · ആന്തരിക കരുത്ത്",
    colPlanet: "ഗ്രഹം",
    colLord: "D27 അധിപൻ",
    colDeity: "അധിദേവത",
    colD27Sign: "D27 രാശി",
    colHouse: "D27 ഭാവം",
    footerText: "ബൃഹത് പരാശര ഹോരാ ശാസ്ത്ര വിധിപ്രകാരം കണക്കാക്കിയ D27 സപ്തവിംശാംശം."
  },
  pa: {
    heading: "D27 ਸਪਤਵਿੰਸ਼ਾਂਸ਼ (ਭਾਂਸ਼) ਗ੍ਰਹਿ ਸਥਿਤੀ",
    subtitle: "ਆਤਮਬਲ · ਅੰਦਰੂਨੀ ਤਾਕਤ · ਪ੍ਰਾਣ ਸ਼ਕਤੀ · ਸਹਿਣਸ਼ੀਲਤਾ",
    colPlanet: "ਗ੍ਰਹਿ",
    colLord: "D27 ਸੁਆਮੀ",
    colDeity: "ਅਧਿਸ਼ਠਾਤਾ ਦੇਵਤਾ",
    colD27Sign: "D27 ਰਾਸ਼ੀ",
    colHouse: "D27 ਭਾਵ",
    footerText: "ਬ੍ਰਿਹਤ ਪਰਾਸ਼ਰ ਹੋਰਾ ਸ਼ਾਸਤਰ ਅਨੁਸਾਰ D27 ਸਪਤਵਿੰਸ਼ਾਂਸ਼ ਗਣਨਾ।"
  },
  sa: {
    heading: "D27 सप्तविंशांश (भांश) ग्रह स्थितिः",
    subtitle: "आत्मबलम् · आन्तरिक ऊर्जा · प्राणशक्तिः · धैर्यम् च",
    colPlanet: "ग्रहः",
    colLord: "D27 स्वामी",
    colDeity: "अधिष्ठाता देवता",
    colD27Sign: "D27 राशिः",
    colHouse: "D27 भावः",
    footerText: "बृहत्पाराशरहोराशास्त्रोक्त नियमानुसारं D27 सप्तविंशांश चक्र गणना।"
  }
};

// Analysis Header Translations
const D27_HEADER_I18N = {
  en: {
    title: "Bhamsa Analysis (D27)",
    subtitle: "Inner Strength · Vitality · Soul Power · General Well-being",
    houseLabel: "House"
  },
  hi: {
    title: "भांश कुंडली विश्लेषण (D27 - आत्मबल एवं प्राण शक्ति)",
    subtitle: "आंतरिक शक्ति, मानसिक सहनशीलता, जीवन शक्ति और आत्मा के बल का सूक्ष्म विश्लेषण",
    houseLabel: "भाव"
  },
  ta: {
    title: "பாம்ச பகுப்பாய்வு (D27 - உள் வலிமை மற்றும் ஆன்ம சக்தி)",
    subtitle: "உள் வலிமை, மன உறுதி மற்றும் உயிர் ஆற்றலின் ஆழமான பலன்கள்",
    houseLabel: "பாவம்"
  },
  te: {
    title: "భాంస విశ్లేషణ (D27 - ఆత్మబలం మరియు జీవశక్తి)",
    subtitle: "అంతర్గత శక్తి, సహనశీలత మరియు ప్రాణశక్తి యొక్క లోతైన విశ్లేషణ",
    houseLabel: "భావం"
  },
  kn: {
    title: "ಭಾಂಶ ವಿಶ್ಲೇಷಣೆ (D27 - ಆತ್ಮಬಲ ಮತ್ತು ಜೀವಶಕ್ತಿ)",
    subtitle: "ಆಂತರಿಕ ಶಕ್ತಿ, ಸಹನಶೀಲತೆ ಮತ್ತು ಪ್ರಾಣಶಕ್ತಿಯ ಆಳವಾದ ವಿಶ್ಲೇಷಣೆ",
    houseLabel: "ಭಾವ"
  },
  gu: {
    title: "ભાંશ વિશ્લેષણ (D27 - આત્મબળ અને પ્રાણ શક્તિ)",
    subtitle: "આંતરિક શક્તિ, માનસિક સ્થિરતા અને જીવન ઊર્જાનું વિગતવાર વિશ્લેષણ",
    houseLabel: "ભાવ"
  },
  mr: {
    title: "भांश विश्लेषण (D27 - आत्मबळ आणि प्राण शक्ती)",
    subtitle: "आंतरिक ऊर्जा, मानसिक प्रतिकारक्षमता आणि आत्मिक ताकदीचे सखोल विश्लेषण",
    houseLabel: "भाव"
  },
  bn: {
    title: "ভাংশ বিশ্লেষণ (D27 - আত্মবল ও প্রাণ শক্তি)",
    subtitle: "অভ্যন্তরীণ ক্ষমতা, জীবনীশক্তি এবং আত্মার শক্তির বিশদ বিশ্লেষণ",
    houseLabel: "ভাব"
  },
  ml: {
    title: "ഭാംശ വിശകലനം (D27 - ആത്മബലവും പ്രാണശക്തിയും)",
    subtitle: "ആന്തരിക കരുത്ത്, പ്രതിരോധ ശേഷി, പ്രാണശക്തി എന്നിവയുടെ സൂക്ഷ്മ വിശകലനം.",
    houseLabel: "ഭാവം"
  },
  pa: {
    title: "ਭਾਂਸ਼ ਵਿਸ਼ਲੇਸ਼ਣ (D27 - ਆਤਮਬਲ ਅਤੇ ਪ੍ਰਾਣ ਸ਼ਕਤੀ)",
    subtitle: "ਅੰਦਰੂਨੀ ਸਹਿਣਸ਼ੀਲਤਾ, ਆਤਮਿਕ ਤਾਕਤ ਅਤੇ ਪ੍ਰਾਣ ਸ਼ਕਤੀ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ।",
    houseLabel: "ਘਰ"
  },
  sa: {
    title: "भांश विश्लेषणम् (D27 - आत्मबलम्, प्राणशक्तिः, धैर्यम् च)",
    subtitle: "डी-२७ चक्रं भवतः आन्तरिकशक्तेः, प्राणबलस्य, सहनशीलतायाश्च गूढरहस्यं प्रकाशयति।",
    houseLabel: "भावः"
  }
};

/**
 * Parashari D27 Bhamsa (Nakshatramsha / Saptavimshamsha) Calculation
 * Each sign (30°) is divided into 27 equal parts of 1°06'40" (30/27 = 1.111111... degrees) each.
 * Grouped by element:
 * - Fire Signs (Aries, Leo, Sagittarius -> idx 0, 4, 8): start from Aries (0)
 * - Earth Signs (Taurus, Virgo, Capricorn -> idx 1, 5, 9): start from Cancer (3)
 * - Air Signs (Gemini, Libra, Aquarius -> idx 2, 6, 10): start from Libra (6)
 * - Water Signs (Cancer, Scorpio, Pisces -> idx 3, 7, 11): start from Capricorn (9)
 */
function calculateD27Bhamsa(basePlanets = [], baseAscDeg = 0, lang = 'en') {
  const lords = MULTILINGUAL_LORDS[lang] || MULTILINGUAL_LORDS['hi'] || MULTILINGUAL_LORDS['en'];
  const signNames = MULTILINGUAL_SIGNS[lang] || MULTILINGUAL_SIGNS['hi'] || MULTILINGUAL_SIGNS['en'];

  const getD27Info = (totalDeg) => {
    const normDeg = ((totalDeg % 360) + 360) % 360;
    const baseSignIdx = Math.floor(normDeg / 30);
    const degInSign = normDeg % 30;

    const partSize = 30.0 / 27.0; // 1.111111 degrees
    const divisionPart = Math.min(Math.floor(degInSign / partSize), 26);

    let startSign;
    if (baseSignIdx === 0 || baseSignIdx === 4 || baseSignIdx === 8) {
      // Fire -> Aries
      startSign = 0;
    } else if (baseSignIdx === 1 || baseSignIdx === 5 || baseSignIdx === 9) {
      // Earth -> Cancer
      startSign = 3;
    } else if (baseSignIdx === 2 || baseSignIdx === 6 || baseSignIdx === 10) {
      // Air -> Libra
      startSign = 6;
    } else {
      // Water -> Capricorn
      startSign = 9;
    }

    const d27SignIndex = (startSign + divisionPart) % 12;
    const deity = D27_DEITIES[divisionPart];

    return {
      d27SignIndex,
      divisionPart: divisionPart + 1,
      deity
    };
  };

  const ascD27 = getD27Info(baseAscDeg);
  const ascD27Sign = ascD27.d27SignIndex;

  const d27Houses = {};
  for (let h = 1; h <= 12; h++) {
    const sIdx = (ascD27Sign + (h - 1)) % 12;
    d27Houses[h] = {
      sign_index: sIdx,
      sign: signNames[sIdx],
      lord: lords[sIdx],
      planets: []
    };
  }

  const d27PlanetPositions = [];
  basePlanets.forEach((p) => {
    const pD27 = getD27Info(p.degree);
    const houseNum = ((pD27.d27SignIndex - ascD27Sign + 12) % 12) + 1;

    if (d27Houses[houseNum]) {
      d27Houses[houseNum].planets.push(p.planet);
    }

    d27PlanetPositions.push({
      planet: p.planet,
      house: houseNum,
      sign_index: pD27.d27SignIndex,
      sign: signNames[pD27.d27SignIndex],
      d27Part: pD27.divisionPart,
      deity: pD27.deity,
      d27Lord: lords[pD27.d27SignIndex],
      is_retrograde: p.is_retrograde,
      is_combust: p.is_combust
    });
  });

  return { d27Houses, d27PlanetPositions, ascD27Sign };
}

// Calculate Dignities & Functional Benefic Effects
const calculatePlanetEffects = (reportData) => {
  const effects = {};
  const planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];

  let lagnaSignIndex = 0;
  if (reportData?.vargas?.d27?.houses?.[1]?.sign_index !== undefined) {
    lagnaSignIndex = reportData.vargas.d27.houses[1].sign_index;
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

export default function D27ChartWindow() {
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
  const [d27Translations, setD27Translations] = useState(null);
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
        const d27Res = await axios.get(`${API_BASE_URL}/translate/d27-bhamsa/${newLang}`);
        if (d27Res.data?.success && d27Res.data?.data) {
          setD27Translations(d27Res.data.data);
          localStorage.setItem(`d27_bhamsa_trans_${newLang}`, JSON.stringify(d27Res.data.data));
        }
      } else {
        setD27Translations(null);
      }
    } catch (e) {
      console.warn('Could not fetch language translations for D27:', e);
    } finally {
      setIsLangLoading(false);
    }
  };

  useEffect(() => {
    if (currentLang && currentLang !== 'en') {
      axios.get(`${API_BASE_URL}/translate/kundali-hub/${currentLang}`)
        .then(res => { if (res.data) setTranslations(res.data); })
        .catch(e => console.warn('Language preload error:', e));

      const cacheKey = `d27_bhamsa_trans_${currentLang}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          setD27Translations(JSON.parse(cached));
        } catch (e) { }
      } else {
        axios.get(`${API_BASE_URL}/translate/d27-bhamsa/${currentLang}`)
          .then(res => {
            if (res.data?.success && res.data?.data) {
              setD27Translations(res.data.data);
              localStorage.setItem(cacheKey, JSON.stringify(res.data.data));
            }
          })
          .catch(e => console.warn('D27 DB translation error:', e));
      }
    } else {
      setD27Translations(null);
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
        if (candidate && (candidate.charts || candidate.vargas?.d27)) {
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
        setError('Failed to compute D27 Bhamsa Chart data. Please verify your connection.');
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

  const calculatedD27 = calculateD27Bhamsa(basePlanets, baseAscDeg, currentLang);

  let d27Houses = calculatedD27.d27Houses;
  let d27PlanetPositions = calculatedD27.d27PlanetPositions;

  // If backend provided pre-computed vargas.d27 houses
  if (reportData?.vargas?.d27?.houses) {
    const backendHouses = reportData.vargas.d27.houses;
    d27Houses = backendHouses;

    const mapped = [];
    Object.entries(backendHouses).forEach(([hNum, hData]) => {
      const pList = Array.isArray(hData.planets) ? hData.planets : [];
      pList.forEach(p => {
        const pName = typeof p === 'string' ? p : p.planet || p.name;
        const originalInfo = calculatedD27.d27PlanetPositions.find(x => x.planet === pName);
        mapped.push({
          planet: pName,
          house: parseInt(hNum, 10),
          sign_index: hData.sign_index,
          sign: MULTILINGUAL_SIGNS[currentLang]?.[hData.sign_index] || SIGN_NAMES_EN[hData.sign_index],
          d27Part: originalInfo?.d27Part || 1,
          deity: originalInfo?.deity || D27_DEITIES[0],
          d27Lord: MULTILINGUAL_LORDS[currentLang]?.[hData.sign_index] || MULTILINGUAL_LORDS['en'][hData.sign_index],
          is_retrograde: originalInfo?.is_retrograde || false,
          is_combust: originalInfo?.is_combust || false
        });
      });
    });
    if (mapped.length > 0) {
      d27PlanetPositions = mapped;
    }
  }

  // Planet Dignity & Functional Benefic Effects
  const effects = calculatePlanetEffects(reportData);

  // i18n Table & Header strings
  const tableI18n = D27_TABLE_I18N[currentLang] || D27_TABLE_I18N['hi'] || D27_TABLE_I18N['en'];
  const analysisHeaderI18n = D27_HEADER_I18N[currentLang] || D27_HEADER_I18N['hi'] || D27_HEADER_I18N['en'];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-amber-400 p-6">
        <RefreshCw className="w-12 h-12 animate-spin mb-4" />
        <h2 className="text-xl font-bold font-serif tracking-widest uppercase">Calculating D27 Bhamsa Kundali...</h2>
        <p className="text-sm text-slate-400 mt-2 font-mono">Analyzing Inner Strength, Subconscious Vitality & Soul Resilience</p>
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
          className="mt-6 px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-lg transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-amber-200 px-6 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <HeartPulse className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-wide text-slate-900 font-serif">
                D27 Bhamsa Chart (Saptavimshamsha)
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                Inner Strength · Vitality · Soul Power
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
            <Globe className="w-3.5 h-3.5 text-amber-600" />
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
                ? 'bg-white text-amber-900 shadow-xs'
                : 'text-slate-700 hover:text-black'
                }`}
            >
              North
            </button>
            <button
              onClick={() => setChartStyle('south')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${chartStyle === 'south'
                ? 'bg-white text-amber-900 shadow-xs'
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
          {/* D27 Chart Container */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center">
            {chartStyle === 'north' ? (
              <StandaloneD1Chart
                houses={d27Houses}
                planetPositions={d27PlanetPositions}
                title="D27 Bhamsa Chart (भांश कुंडली - आत्मबल व प्राण शक्ति)"
                lang={currentLang}
                hideTransitToggle={true}
              />
            ) : (
              <SouthIndianD1Chart
                houses={d27Houses}
                planetPositions={d27PlanetPositions}
                title="D27 Bhamsa Chart (பாம்ச சக்கரம்)"
                lang={currentLang}
                hideTransitToggle={true}
              />
            )}
          </div>

          {/* D27 Planetary Positions Table */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 font-serif">
                    {tableI18n.heading}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    {tableI18n.subtitle || "Inner Strength · Subconscious Vitality · Soul Power"}
                  </p>
                </div>
                <span className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                  <Activity className="w-5 h-5" />
                </span>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-600">
                    <th className="py-2.5 px-3">{tableI18n.colPlanet}</th>
                    <th className="py-2.5 px-3">{tableI18n.colLord}</th>
                    <th className="py-2.5 px-3">{tableI18n.colDeity}</th>
                    <th className="py-2.5 px-3">{tableI18n.colD27Sign}</th>
                    <th className="py-2.5 px-3 text-right">{tableI18n.colHouse}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {d27PlanetPositions.map((p) => {
                    const color = PLANET_COLORS[p.planet] || "#475569";
                    const isSelected = selectedPlanet === p.planet;
                    const translatedPlanet = translations?.planets?.[p.planet] || p.planet;

                    return (
                      <tr
                        key={p.planet}
                        onClick={() => setSelectedPlanet(p.planet)}
                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-amber-50' : 'hover:bg-slate-50'
                          }`}
                      >
                        <td className="py-3 px-3 font-sans font-bold flex items-center gap-2 text-base" style={{ color }}>
                          <span>{translatedPlanet}</span>
                        </td>
                        <td className="py-3 px-3 font-sans font-semibold text-slate-800 text-xs">
                          {p.d27Lord}
                        </td>
                        <td className="py-3 px-3 font-sans font-bold text-amber-800 text-xs">
                          <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            {p.deity}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-sans font-semibold text-black">
                          {p.sign}
                        </td>
                        <td className="py-3 px-3 font-black text-amber-900 text-base text-right">
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
            cid="d27"
            lang={currentLang}
          />
        )}

        {/* ROW 2: Bhamsa Analysis (D27) Interpretations matching Interactive Worksheet */}
        <section id="section-d27-interpretations" className="w-full max-w-full mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-amber-200 shadow-xl space-y-6">
          <div className="border-b border-amber-200 pb-4">
            <h3 className="text-3xl font-serif italic uppercase mb-2 text-slate-900">
              {d27Translations?.ui?.sectionTitle || analysisHeaderI18n.title}
            </h3>
            <p className="text-xs text-amber-600 font-bold uppercase tracking-widest mb-4">
              {d27Translations?.ui?.sectionSubtitle || analysisHeaderI18n.subtitle}
            </p>
          </div>

          <p className="text-[15px] text-amber-900 italic mb-8 whitespace-pre-line leading-relaxed">
            {d27Translations?.intro || D27_INTRO}
          </p>

          <div className="space-y-6">
            {d27PlanetPositions.map((p) => {
              const status = effects && effects[p.planet] ? effects[p.planet] : "neutral";
              const statusKey = status === "positive" ? "positive" : status === "negative" ? "negative" : "neutral";
              const interpretation = d27Translations?.interpretations?.[p.planet]?.[p.house]?.[statusKey] ||
                D27_INTERPRETATIONS[p.planet]?.[p.house]?.[statusKey];
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
                    } ${isSelected ? 'ring-2 ring-amber-500 shadow-md' : 'hover:border-amber-400'}`}
                >
                  {p.deity && (
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest">
                        {p.sign} · {d27Translations?.ui?.houseBadge || analysisHeaderI18n.houseLabel} {p.house}
                      </span>
                      <span className="px-3 py-1 bg-amber-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-sm">
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
                    {translatedPlanetName} · {d27Translations?.ui?.houseBadge || analysisHeaderI18n.houseLabel} {p.house}{' '}
                    <span className="text-xs ml-2 opacity-60">({statusKey})</span>
                  </h4>
                  <BulletInterpretation text={interpretation} colorClass="text-slate-900" />
                </section>
              );
            })}
          </div>
        </section>

        {/* Detailed Planetary Study in Bhamsa Section */}
        <section className="w-full max-w-full mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-amber-200 shadow-xl space-y-6">
          <div className="border-b border-amber-200 pb-4">
            <h3 className="text-2xl font-serif italic uppercase mb-1 text-slate-900">
              Planetary Significators in Saptavimshamsha (D27)
            </h3>
            <p className="text-xs text-amber-600 font-bold uppercase tracking-widest">
              Classical Impact of Each Planet on Subconscious Vitality and Inner Resilience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(D27_PLANET_DESCRIPTIONS).map(([planet, pDesc]) => {
              const transDesc = d27Translations?.planetDescriptions?.[planet];
              return (
                <div
                  key={planet}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-amber-300 transition-all shadow-xs"
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

