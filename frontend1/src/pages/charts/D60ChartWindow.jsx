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
  Infinity
} from 'lucide-react';

import StandaloneD1Chart from '../../components/StandaloneD1Chart';
import SouthIndianD1Chart from '../../components/SouthIndianD1Chart';
import DynamicVargaAnalysis from '../../components/DynamicVargaAnalysis';

import { D60_INTERPRETATIONS } from '../../data/d60HouseInterpretations';
import { D60_INTRO, D60_PLANET_DESCRIPTIONS } from '../../data/d60ShashtiamshaData';

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

// 60 Classical Parashari Deities of Shashtiamsha (D60) - Deva / Asura / Mixed Shaktis
const D60_DEITIES = [
  "Ghora (घोर - Terrifying Karma)", "Rakshasa (राक्षस - Demonic Trials)", "Deva (देव - Divine Blessing)", "Kubera (कुबेर - Celestial Wealth)",
  "Yaksha (यक्ष - Guardian of Secrets)", "Kinnara (किन्नर - Divine Music)", "Bhrashta (भ्रष्ट - Fall & Redemption)", "Kulaghna (कुलघ्न - Lineage Cleansing)",
  "Garala (गरल - Poison to Nectar)", "Vahni (वह्नि - Purifying Sacred Fire)", "Maya (माया - Cosmic Illusion)", "Purishaka (पुरीषक - Elemental Cleansing)",
  "Apampati (अपांपति - Lord of Waters)", "Marutvan (मरुत्वान् - Cosmic Winds)", "Kaala (काल - Eternal Time)", "Sarpa (सर्प - Kundalini & Rebirth)",
  "Amrita (अमृत - Divine Nectar)", "Indu (इन्दु - Nurturing Lunar Grace)", "Mridu (मृदु - Gentle Benevolence)", "Komala (कोमल - Supreme Tender Grace)",
  "Heramba (हेरम्ब - Ganesha's Protection)", "Brahma (ब्रह्मा - Supreme Creation)", "Vishnu (विष्णु - Righteous Preservation)", "Maheshwara (महेश्वर - Transcendence)",
  "Deva (देव - Luminous Virtue)", "Ardra (आर्द्रा - Compassionate Tear)", "Kalinasa (कलिनाश - Destruction of Strife)", "Kshiteesa (क्षितीश - Sovereign of Earth)",
  "Kamalakara (कमलाकर - Lotus Garden of Purity)", "Gulika (गुलिक - Saturnine Crucible)", "Mrityu (मृत्यु - Transformation of Ego)", "Kaala (काल - Lord of Chronos)",
  "Davagni (दावाग्नि - Forest Fire of Dissolution)", "Ghora (घोर - Intense Purification)", "Yama (यम - Dharma & Righteous Law)", "Kantaka (कण्टक - Thorny Awakening)",
  "Sudha (सुधा - Ambrosial Bliss)", "Amrita (अमृत - Eternal Immortality)", "Poornachandra (पूर्णचन्द्र - Full Moon Radiance)", "Vishadagdha (विषदिग्ध - Purged of Toxin)",
  "Kulanasa (कुलनाश - Transcending Family Karma)", "Vamshakshaya (वंशक्षय - Release of Ancestral Ties)", "Utpata (उत्पात - Sudden Awakening)", "Kaala (काल - Cosmic Time)",
  "Saumya (सौम्य - Gentle Peace)", "Komal (कोमल - Pure Tenderness)", "Sheetala (शीतल - Cooling Truth)", "Karaladamshtra (करालदंष्ट्र - Fierce Protection)",
  "Chandramukhi (चन्द्रमुखी - Lunar Illumination)", "Praveena (प्रवीण - Master of Wisdom)", "Kaalapavaka (कालपावक - Fire of Time)", "Dandadhara (दण्डधर - Wielder of Cosmic Justice)",
  "Nirmala (निर्मल - Spotless Purity)", "Subhada (शुभद - Giver of All Auspiciousness)", "Ashubhada (अशुभद - Karmic Reckoning)", "Atisheetala (अतिशीतल - Profound Peace)",
  "Payodhisa (पयोधीश - Ocean of Milk)", "Bhramana (भ्रमण - Cosmic Wanderer)", "Indumukhi (इन्दुमुखी - Radiance of the Soul)"
];

// Multilingual Table Headers
const D60_TABLE_I18N = {
  en: {
    heading: "D60 Shashtiamsha Planetary Status",
    subtitle: "Past-Life Karma · Soul's Origin · Deep Subtle Blueprint · Prarabdha",
    colPlanet: "Graha (Planet)",
    colLord: "D60 Lord",
    colDeity: "Shashtiamsha Deity",
    colD60Sign: "D60 Rashi (Sign)",
    colHouse: "D60 Bhava",
    footerText: "Calculated with classical Brihat Parashara Hora Shastra rules (each sign divided into 60 parts of 0°30'). Odd signs count from the same sign; Even signs count from the 7th sign."
  },
  hi: {
    heading: "D60 षष्ट्यंश ग्रह स्थिति",
    subtitle: "पूर्वजन्म संचित कर्म · आत्मा का मूल प्रारब्ध · सूक्ष्म कर्म बीज",
    colPlanet: "ग्रह",
    colLord: "D60 स्वामी",
    colDeity: "षष्ट्यंश अधिष्ठाता",
    colD60Sign: "D60 राशि",
    colHouse: "D60 भाव",
    footerText: "बृहत् पराशर होरा शास्त्र के शास्त्रीय षष्ट्यंश नियमों द्वारा गणना (प्रत्येक राशि ६० भागों में, प्रत्येक ३० कला; विषम राशि उसी राशि से, सम राशि ७वीं राशि से)।"
  },
  ta: {
    heading: "D60 ஷஷ்டியாம்ச கிரக நிலை",
    subtitle: "முற்பிறவி கர்மம் · ஆன்மாவின் மூல நோக்கம் · ஆழமான கர்ம பலன்",
    colPlanet: "கிரகம்",
    colLord: "D60 அதிபதி",
    colDeity: "ஷஷ்டியாம்ச தெய்வம்",
    colD60Sign: "D60 ராசி",
    colHouse: "D60 பாவம்",
    footerText: "பராசர ஹோரா சாஸ்திர பாரம்பரிய விதிகளின்படி கணக்கிடப்பட்டது (ஒவ்வொரு ராசியும் 60 பிரிவுகள், 30 கலைகள்)."
  },
  te: {
    heading: "D60 షష్ట్యంశ గ్రహ స్థితి",
    subtitle: "పూర్వజన్మ సంచిత కర్మ · ఆత్మ మూల ప్రారబ్ధం · సూక్ష్మ కర్మ బీజం",
    colPlanet: "గ్రహం",
    colLord: "D60 అధిపతి",
    colDeity: "షష్ట్యంశ దేవత",
    colD60Sign: "D60 రాశి",
    colHouse: "D60 భావం",
    footerText: "బృహత్ పరాశర హోరా శాస్త్ర సంప్రదాయ గణన (ప్రతి రాశి 60 విభాగాలు, 30 కళలు)."
  },
  kn: {
    heading: "D60 ಷಷ್ಟ್ಯಂಶ ಗ್ರಹ ಸ್ಥಿತಿ",
    subtitle: "ಪೂರ್ವಜನ್ಮ ಸಂಚಿತ ಕರ್ಮ · ಆತ್ಮದ ಮೂಲ ಪ್ರಾರಬ್ಧ · ಸೂಕ್ಷ್ಮ ಕರ್ಮ ರಹಸ್ಯ",
    colPlanet: "ಗ್ರಹ",
    colLord: "D60 ಅಧಿಪತಿ",
    colDeity: "ಷಷ್ಟ್ಯಂಶ ದೇವತೆ",
    colD60Sign: "D60 ರಾಶಿ",
    colHouse: "D60 ಭಾವ",
    footerText: "ಬೃಹತ್ ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರದ ಶಾಸ್ತ್ರೀಯ ನಿಯಮಗಳ ಪ್ರಕಾರ ಲೆಕ್ಕಹಾಕಲಾಗಿದೆ."
  },
  gu: {
    heading: "D60 ષષ્ટ્યાંશ ગ્રહ સ્થિતિ",
    subtitle: "પૂર્વજન્મ સંચિત કર્મ · આત્માનું મૂળ પ્રારબ્ધ · સૂક્ષ્મ કર્મ બીજ",
    colPlanet: "ગ્રહ",
    colLord: "D60 સ્વામી",
    colDeity: "ષષ્ટ્યાંશ અધિષ્ઠાતા",
    colD60Sign: "D60 રાશિ",
    colHouse: "D60 ભાવ",
    footerText: "બૃહત્ પરાશર હોરા શાસ્ત્રના શાસ્ત્રીય નિયમો અનુસાર ગણતરી (પ્રત્યેક રાશિ 60 ભાગોમાં)."
  },
  mr: {
    heading: "D60 षष्ट्यंश ग्रह स्थिती",
    subtitle: "पूर्वजन्म संचित कर्म · आत्म्याचे मूळ प्रारब्ध · सूक्ष्म कर्म बीज",
    colPlanet: "ग्रह",
    colLord: "D60 स्वामी",
    colDeity: "षष्ट्यंश अधिष्ठाता",
    colD60Sign: "D60 राशी",
    colHouse: "D60 भाव",
    footerText: "बृहत् पराशर होरा शास्त्राच्या शास्त्रीय नियमांनुसार षष्ट्यंश गणना."
  },
  bn: {
    heading: "D60 ষষ্ঠ্যাংশ গ্রহ স্থিতি",
    subtitle: "পূর্বজন্মের সঞ্চিত কর্ম · আত্মার মূল প্রারব্ধ · সূক্ষ্ম কর্ম বীজ",
    colPlanet: "গ্রহ",
    colLord: "D60 অধিপতি",
    colDeity: "ষষ্ঠ্যাংশ দেবতা",
    colD60Sign: "D60 রাশি",
    colHouse: "D60 ভাব",
    footerText: "বৃহৎ পরাশর হোরা শাস্ত্রের নিয়ম অনুযায়ী গণিত (প্রতি রাশি ৬০ অংশে বিভক্ত)।"
  },
  ml: {
    heading: "D60 ഷഷ്ട്യംശ ഗ്രഹനില",
    subtitle: "പൂർവ്വജന്മ സഞ്ചిత കർമ്മം · ആത്മാവിന്റെ പ്രാരബ്ധം · സൂക്ഷ്മ കർമ്മ രഹസ്യം",
    colPlanet: "ഗ്രഹം",
    colLord: "D60 അധിപൻ",
    colDeity: "ഷഷ്ട്യംശ ദേവത",
    colD60Sign: "D60 രാശി",
    colHouse: "D60 ഭാവം",
    footerText: "ബൃഹത് പരാശര ഹോരാ ശാസ്ത്ര വിധിപ്രകാരം കണക്കാക്കിയത്."
  },
  pa: {
    heading: "D60 ਸ਼ਸ਼ਟੀਅੰਸ਼ ਗ੍ਰਹਿ ਸਥਿਤੀ",
    subtitle: "ਪੂਰਵ ਜਨਮ ਦੇ ਕਰਮ · ਆਤਮਾ ਦਾ ਮੂਲ ਪ੍ਰਾਰਬਧ · ਸੂਖਮ ਕਰਮ ਬੀਜ",
    colPlanet: "ਗ੍ਰਹਿ",
    colLord: "D60 ਸੁਆਮੀ",
    colDeity: "ਸ਼ਸ਼ਟੀਅੰਸ਼ ਦੇਵਤਾ",
    colD60Sign: "D60 ਰਾਸ਼ੀ",
    colHouse: "D60 ਭਾਵ",
    footerText: "ਬ੍ਰਿਹਤ ਪਰਾਸ਼ਰ ਹੋਰਾ ਸ਼ਾਸਤਰ ਦੇ ਨਿਯਮਾਂ ਅਨੁਸਾਰ ਗਣਨਾ।"
  },
  sa: {
    heading: "D60 षष्ट्यंश ग्रहस्थितिः",
    subtitle: "पूर्वजन्म-सञ्चितकर्म · आत्मनः मूलप्रारब्धम् · सूक्ष्मकर्मबीजम्",
    colPlanet: "ग्रहः",
    colLord: "D60 स्वामी",
    colDeity: "षष्ट्यंशाधिष्ठातृदेवता",
    colD60Sign: "D60 राशिः",
    colHouse: "D60 भावः",
    footerText: "बृहत्पराशरहोराशास्त्रस्य शास्त्रीयनियमानुसारेण षष्ट्यंशगणना (प्रतिराशिं षष्टिभागाः, प्रत्येकं त्रिंशत्कलाः)।"
  }
};

const D60_HEADER_I18N = {
  en: {
    title: "Shashtiamsa Analysis (D60)",
    subtitle: "Past Life Karma · Deep Subtle Causes · Foundation of Current Incarnation",
    houseLabel: "House"
  },
  hi: {
    title: "षष्ट्यंश विश्लेषण (D60)",
    subtitle: "पूर्वजन्म संचित कर्म · आत्मा का मूल प्रारब्ध · सूक्ष्म कर्म बीज एवं मोक्ष मार्ग",
    houseLabel: "भाव"
  },
  ta: {
    title: "ஷஷ்டியாம்ச பகுப்பாய்வு (D60)",
    subtitle: "முற்பிறவி கர்மம் · ஆன்மாவின் மூல நோக்கம் · ஆழமான கர்ம பலன்",
    houseLabel: "பாவம்"
  },
  te: {
    title: "షష్ట్యంశ విశ్లేషణ (D60)",
    subtitle: "పూర్వజన్మ సంచిత కర్మ · ఆత్మ మూల ప్రారబ్ధం · సూక్ష్మ కర్మ బీజం",
    houseLabel: "భావం"
  },
  kn: {
    title: "ಷಷ್ಟ್ಯಂಶ ವಿಶ್ಲೇಷಣೆ (D60)",
    subtitle: "ಪೂರ್ವಜನ್ಮ ಸಂಚಿತ ಕರ್ಮ · ಆತ್ಮದ ಮೂಲ ಪ್ರಾರಬ್ಧ · ಸೂಕ್ಷ್ಮ ಕರ್ಮ ರಹಸ್ಯ",
    houseLabel: "ಭಾವ"
  },
  gu: {
    title: "ષષ્ટ્યાંશ વિશ્લેષણ (D60)",
    subtitle: "પૂર્વજન્મ સંચિત કર્મ · આત્માનું મૂળ પ્રારબ્ધ · સૂક્ષ્મ કર્મ બીજ",
    houseLabel: "ભાવ"
  },
  mr: {
    title: "षष्ट्यंश विश्लेषण (D60)",
    subtitle: "पूर्वजन्म संचित कर्म · आत्म्याचे मूळ प्रारब्ध · सूक्ष्म कर्म बीज",
    houseLabel: "भाव"
  },
  bn: {
    title: "ষষ্ঠ্যাংশ বিশ্লেষণ (D60)",
    subtitle: "পূর্বজন্মের সঞ্চিত কর্ম · আত্মার মূল প্রারব্ধ · সূক্ষ্ম কর্ম বীজ",
    houseLabel: "ভাব"
  },
  ml: {
    title: "ഷഷ്ട്യംശ വിശകലനം (D60)",
    subtitle: "പൂർവ്വജന്മ സഞ്ചిత കർമ്മം · ആത്മാവിന്റെ പ്രാരബ്ധം · സൂക്ഷ്മ കർമ്മ രഹസ്യം",
    houseLabel: "ഭാവം"
  },
  pa: {
    title: "ਸ਼ਸ਼ਟੀਅੰਸ਼ ਵਿਸ਼ਲੇਸ਼ਣ (D60)",
    subtitle: "ਪੂਰਵ ਜਨਮ ਦੇ ਕਰਮ · ਆਤਮਾ ਦਾ ਮੂਲ ਪ੍ਰਾਰਬਧ · ਸੂਖਮ ਕਰਮ ਬੀਜ",
    houseLabel: "ਭਾਵ"
  },
  sa: {
    title: "षष्ट्यंश विश्लेषणम् (D60)",
    subtitle: "पूर्वजन्म-सञ्चितकर्म · आत्मनः मूलप्रारब्धम् · सूक्ष्मकर्मबीजम्",
    houseLabel: "भावः"
  }
};

/**
 * Parashari D60 (Shashtiamsha) Calculation:
 * - Each sign is divided into 60 equal parts of 0°30' (30 arcminutes = 0.5 degrees).
 * - Odd Signs (Aries, Gemini, Leo, Libra, Sagittarius, Aquarius -> 0, 2, 4, 6, 8, 10):
 *   Counting starts from the sign itself (startSign = baseSignIdx).
 * - Even Signs (Taurus, Cancer, Virgo, Scorpio, Capricorn, Pisces -> 1, 3, 5, 7, 9, 11):
 *   Counting starts from the 7th sign from it ((baseSignIdx + 6) % 12).
 */
function calculateD60Shashtiamsha(basePlanets = [], baseAscDeg = 0, lang = 'en') {
  const lords = MULTILINGUAL_LORDS[lang] || MULTILINGUAL_LORDS['hi'] || MULTILINGUAL_LORDS['en'];
  const signNames = MULTILINGUAL_SIGNS[lang] || MULTILINGUAL_SIGNS['hi'] || MULTILINGUAL_SIGNS['en'];

  const getD60Info = (totalDeg) => {
    const normDeg = ((totalDeg % 360) + 360) % 360;
    const baseSignIdx = Math.floor(normDeg / 30);
    const degInSign = normDeg % 30;

    const divisionPart = Math.min(Math.floor(degInSign / 0.5), 59); // 0..59 (0.5 degrees = 30 minutes each)
    const isOdd = baseSignIdx % 2 === 0; // Aries=0 (odd sign), Taurus=1 (even sign)

    const startSign = isOdd ? baseSignIdx : ((baseSignIdx + 6) % 12);
    const d60SignIdx = (startSign + divisionPart) % 12;

    const deity = D60_DEITIES[divisionPart] || D60_DEITIES[0];

    return {
      d60SignIdx,
      divisionPart: divisionPart + 1,
      deity
    };
  };

  // 1. Calculate D60 Ascendant
  const ascInfo = getD60Info(baseAscDeg);
  const ascD60SignIdx = ascInfo.d60SignIdx;

  // 2. Initialize 12 Houses from D60 Ascendant
  const d60Houses = {};
  for (let h = 1; h <= 12; h++) {
    const sIdx = (ascD60SignIdx + (h - 1)) % 12;
    d60Houses[h] = {
      sign_index: sIdx,
      sign_name: SIGN_NAMES_EN[sIdx],
      planets: []
    };
  }

  // 3. Map Each Planet into D60 Houses
  const d60PlanetPositions = [];
  basePlanets.forEach((p) => {
    const pDeg = p.total_degree !== undefined ? p.total_degree : ((p.sign_index || 0) * 30 + (p.degree || 0));
    const pInfo = getD60Info(pDeg);
    const pD60SignIdx = pInfo.d60SignIdx;

    // House calculation from D60 Ascendant
    const houseNum = (((pD60SignIdx - ascD60SignIdx) % 12) + 12) % 12 + 1;

    d60Houses[houseNum].planets.push(p.planet);

    d60PlanetPositions.push({
      planet: p.planet,
      sign_index: pD60SignIdx,
      sign: signNames[pD60SignIdx],
      house: houseNum,
      divisionPart: pInfo.divisionPart,
      deity: pInfo.deity,
      d60Lord: lords[pD60SignIdx],
      is_retrograde: p.is_retrograde || false,
      is_combust: p.is_combust || false
    });
  });

  return { d60Houses, d60PlanetPositions };
}

// Calculate Dignities & Functional Benefic Effects
const calculatePlanetEffects = (reportData) => {
  const effects = {};
  const planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];

  let lagnaSignIndex = 0;
  if (reportData?.vargas?.d60?.houses?.[1]?.sign_index !== undefined) {
    lagnaSignIndex = reportData.vargas.d60.houses[1].sign_index;
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

    if (reportData?.vargas?.d60?.houses) {
      for (const [hNum, hData] of Object.entries(reportData.vargas.d60.houses)) {
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

export default function D60ChartWindow() {
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
  const [d60Translations, setD60Translations] = useState(null);
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
        const d60Res = await axios.get(`${API_BASE_URL}/translate/d60-shashtiamsha/${newLang}`);
        if (d60Res.data?.success && d60Res.data?.data) {
          setD60Translations(d60Res.data.data);
          localStorage.setItem(`d60_shashtiamsha_trans_${newLang}`, JSON.stringify(d60Res.data.data));
        }
      } else {
        setD60Translations(null);
      }
    } catch (e) {
      console.warn('Could not fetch language translations for D60:', e);
    } finally {
      setIsLangLoading(false);
    }
  };

  useEffect(() => {
    if (currentLang && currentLang !== 'en') {
      axios.get(`${API_BASE_URL}/translate/kundali-hub/${currentLang}`)
        .then(res => { if (res.data) setTranslations(res.data); })
        .catch(e => console.warn('Language preload error:', e));

      const cacheKey = `d60_shashtiamsha_trans_${currentLang}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          setD60Translations(JSON.parse(cached));
        } catch (e) { }
      } else {
        axios.get(`${API_BASE_URL}/translate/d60-shashtiamsha/${currentLang}`)
          .then(res => {
            if (res.data?.success && res.data?.data) {
              setD60Translations(res.data.data);
              localStorage.setItem(cacheKey, JSON.stringify(res.data.data));
            }
          })
          .catch(e => console.warn('D60 DB translation error:', e));
      }
    } else {
      setD60Translations(null);
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
        if (candidate && (candidate.charts || candidate.vargas?.d60)) {
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
        setError('Failed to compute D60 Shashtiamsha Chart data. Please verify your connection.');
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

  const calculatedD60 = calculateD60Shashtiamsha(basePlanets, baseAscDeg, currentLang);

  let d60Houses = calculatedD60.d60Houses;
  let d60PlanetPositions = calculatedD60.d60PlanetPositions;

  // If backend provided pre-computed vargas.d60 houses
  if (reportData?.vargas?.d60?.houses) {
    const backendHouses = reportData.vargas.d60.houses;
    d60Houses = backendHouses;

    const mapped = [];
    Object.entries(backendHouses).forEach(([hNum, hData]) => {
      const pList = Array.isArray(hData.planets) ? hData.planets : [];
      pList.forEach(p => {
        const pName = typeof p === 'string' ? p : p.planet || p.name;
        const originalInfo = calculatedD60.d60PlanetPositions.find(x => x.planet === pName);
        mapped.push({
          planet: pName,
          house: parseInt(hNum, 10),
          sign_index: hData.sign_index,
          sign: MULTILINGUAL_SIGNS[currentLang]?.[hData.sign_index] || SIGN_NAMES_EN[hData.sign_index],
          divisionPart: originalInfo?.divisionPart || 1,
          deity: originalInfo?.deity || D60_DEITIES[0],
          d60Lord: MULTILINGUAL_LORDS[currentLang]?.[hData.sign_index] || MULTILINGUAL_LORDS['en'][hData.sign_index],
          is_retrograde: originalInfo?.is_retrograde || false,
          is_combust: originalInfo?.is_combust || false
        });
      });
    });

    if (mapped.length > 0) {
      d60PlanetPositions = mapped;
    }
  }

  // Planet Dignity & Functional Benefic Effects
  const effects = calculatePlanetEffects(reportData);

  // i18n Table & Header strings
  const tableI18n = D60_TABLE_I18N[currentLang] || D60_TABLE_I18N['hi'] || D60_TABLE_I18N['en'];
  const analysisHeaderI18n = D60_HEADER_I18N[currentLang] || D60_HEADER_I18N['hi'] || D60_HEADER_I18N['en'];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-amber-400 p-6">
        <RefreshCw className="w-12 h-12 animate-spin mb-4" />
        <h2 className="text-xl font-bold font-serif tracking-widest uppercase">Calculating D60 Shashtiamsha Kundali...</h2>
        <p className="text-xs text-amber-200/60 mt-2">Computing Parashari 60-fold divisions (0°30'), past-life karmic blueprints & deities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-amber-400">Unable to Load D60 Chart</h2>
        <p className="text-slate-400 text-sm mt-2 max-w-md text-center">{error}</p>
        <button
          onClick={fetchData}
          className="mt-6 px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-medium transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-800 flex flex-col selection:bg-amber-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/80 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-700 to-yellow-500 flex items-center justify-center text-white shadow-md shadow-amber-200">
            <Infinity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-serif">
              <span>{analysisHeaderI18n.title}</span>
              <span className="text-xs font-sans font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
                D60
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
                ? 'bg-white text-amber-900 shadow-xs'
                : 'text-slate-700 hover:text-black'
                }`}
            >
              North
            </button>
            <button
              onClick={() => setChartStyle('south')}
              className={`px-3 py-1 rounded-lg text-[14px] font-bold transition ${chartStyle === 'south'
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
          {/* D60 Chart Container */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center">
            {chartStyle === 'north' ? (
              <StandaloneD1Chart
                houses={d60Houses}
                planetPositions={d60PlanetPositions}
                title="D60 Shashtiamsha Chart (षष्ट्यंश कुंडली - पूर्वजन्म संचित कर्म व प्रारब्ध)"
                lang={currentLang}
                hideTransitToggle={true}
              />
            ) : (
              <SouthIndianD1Chart
                houses={d60Houses}
                planetPositions={d60PlanetPositions}
                title="D60 Shashtiamsha Chart (ஷஷ்டியாம்ச சக்கரம்)"
                lang={currentLang}
                hideTransitToggle={true}
              />
            )}
          </div>

          {/* D60 Planetary Status Table */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-xl font-bold font-serif text-slate-900 mb-1">
                {tableI18n.heading}
              </h3>
              <p className="text-xs text-amber-700 font-medium">
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
                    <th className="py-2.5 px-3">{tableI18n.colD60Sign}</th>
                    <th className="py-2.5 px-3 text-right">{tableI18n.colHouse}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {d60PlanetPositions.map((p) => {
                    const color = getPlanetColor(p.planet);
                    const translatedPlanet = translations?.planets?.[p.planet] || p.planet;
                    const isSelected = selectedPlanet === p.planet;

                    return (
                      <tr
                        key={p.planet}
                        onClick={() => setSelectedPlanet(p.planet)}
                        className={`hover:bg-amber-50/60 transition cursor-pointer ${isSelected ? 'bg-amber-50 font-bold' : ''
                          }`}
                      >
                        <td className="py-3 px-3 font-sans font-bold flex items-center gap-2 text-base" style={{ color }}>
                          <span>{translatedPlanet}</span>
                        </td>
                        <td className="py-3 px-3 font-sans font-semibold text-slate-800 text-xs">
                          {p.d60Lord}
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
            cid="d60"
            lang={currentLang}
          />
        )}

        {/* ROW 2: Shashtiamsa Analysis (D60) Interpretations matching Interactive Worksheet */}
        <section id="section-d60-interpretations" className="w-full max-w-full mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-amber-200 shadow-xl space-y-6">
          <div className="border-b border-amber-200 pb-4">
            <h3 className="text-3xl font-serif italic uppercase mb-2 text-slate-900">
              {d60Translations?.ui?.sectionTitle || analysisHeaderI18n.title}
            </h3>
            <p className="text-xs text-amber-600 font-bold uppercase tracking-widest mb-4">
              {d60Translations?.ui?.sectionSubtitle || analysisHeaderI18n.subtitle}
            </p>
          </div>

          <p className="text-[15px] text-amber-900 italic mb-8 whitespace-pre-line leading-relaxed">
            {d60Translations?.intro || D60_INTRO}
          </p>

          <div className="space-y-6">
            {d60PlanetPositions.map((p) => {
              const status = effects && effects[p.planet] ? effects[p.planet] : "neutral";
              const statusKey = status === "positive" ? "positive" : status === "negative" ? "negative" : "neutral";
              const interpretation = d60Translations?.interpretations?.[p.planet]?.[p.house]?.[statusKey] ||
                D60_INTERPRETATIONS[p.planet]?.[p.house]?.[statusKey];
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
                        {p.sign} · {d60Translations?.ui?.houseBadge || analysisHeaderI18n.houseLabel} {p.house}
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
                    {translatedPlanetName} · {d60Translations?.ui?.houseBadge || analysisHeaderI18n.houseLabel} {p.house}{' '}
                    <span className="text-xs ml-2 opacity-60">({statusKey})</span>
                  </h4>
                  <BulletInterpretation text={interpretation} colorClass="text-slate-900" />
                </section>
              );
            })}
          </div>
        </section>

        {/* Detailed Planetary Study in Shashtiamsha Section */}
        <section className="w-full max-w-full mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-amber-200 shadow-xl space-y-6">
          <div className="border-b border-amber-200 pb-4">
            <h3 className="text-2xl font-serif italic uppercase mb-1 text-slate-900">
              Planetary Significators in Shashtiamsha (D60)
            </h3>
            <p className="text-xs text-amber-600 font-bold uppercase tracking-widest">
              Classical Impact of Each Planet on Past-Life Karma, Deep Subtle Causes & Prarabdha
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(D60_PLANET_DESCRIPTIONS).map(([planet, pDesc]) => {
              const transDesc = d60Translations?.planetDescriptions?.[planet];
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

