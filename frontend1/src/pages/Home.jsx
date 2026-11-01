import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Bot,
  Building2,
  Calculator,
  Calendar,
  CalendarClock,
  CalendarDays,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Hand,
  Heart,
  HeartHandshake,
  Home as HomeIcon,
  Info,
  Loader,
  MessageCircle,
  Moon,
  MoonStar,
  Phone,
  PhoneCall,
  PlayCircle,
  ScrollText,
  Shield,
  ShoppingBag,
  Sparkles,
  Star,
  Sun,
  User,
  Users,
  X,
  Video
} from 'lucide-react';
import Navigation from '../components/Navigation';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { adminAPI, authAPI, buildAssetUrl, kundaliAPI, VEDIC_ASTROLOGY_BASE_URL } from '../services/api';

const quickActions = [
  {
    title: 'Free Online Kundli',
    description: 'Generate detailed charts, yogas & remedies instantly.',
    action: 'Generate Kundli',
    link: '/kundali',
    icon: Sparkles,
    accent: 'from-orange-500 to-pink-500'
  },
  {
    title: "Today's Horoscope",
    description: 'Personalized daily love, career & finance guidance.',
    action: 'View Horoscope',
    link: '/zodiac',
    icon: Sun,
    accent: 'from-blue-500 to-indigo-500'
  },
  {
    title: 'Kundli Matching',
    description: 'Ashtakoot score, dosha insights & remedies.',
    action: 'Check Compatibility',
    link: `${VEDIC_ASTROLOGY_BASE_URL}/?matchmaking=true`,
    icon: Users,
    accent: 'from-purple-500 to-fuchsia-500',
    isExternal: true
  },
  {
    title: 'Consult Astrologer',
    description: 'Talk to certified experts via chat, call or video.',
    action: 'Book Session',
    link: '/booking',
    icon: Phone,
    accent: 'from-emerald-500 to-teal-500'
  }
];

const astroHighlights = [
  {
    title: 'AI + Vedic Guidance',
    description: 'Instant predictive summaries augmented by senior astrologer validation.',
    icon: Star
  },
  {
    title: 'Multi-language Support',
    description: 'Hindi, English, Tamil, Telugu, Marathi, Gujarati & more.',
    icon: Globe
  },
  {
    title: 'Live Learning Rooms',
    description: 'Weekly masterclasses, Q&A, and ritual walkthroughs.',
    icon: PlayCircle
  },
  {
    title: 'Personal Remedies',
    description: 'Gemstones, yantras & puja kits personalized to your dashas.',
    icon: Shield
  }
];

const horoscopeCategories = [
  'Daily Horoscope',
  'Weekly Horoscope',
  'Monthly Horoscope',
  'Yearly 2026',
  'Love Horoscope',
  'Career Horoscope',
  'Finance Horoscope',
  'Health Focus'
];

const toolCards = [
  {
    title: 'Panchang & Muhurat',
    description: 'Sunrise, tithi, nakshatra & shubh time for your city.',
    icon: Calendar
  },
  {
    title: 'Dosha Analyzer',
    description: 'Detect and pacify Mangal, Shani, Rahu & Pitra doshas.',
    icon: Moon
  },
  {
    title: 'Gemstone Finder',
    description: 'AI pairs your dashas with lab-certified gems.',
    icon: ShoppingBag
  },
  {
    title: 'Career Transit Radar',
    description: 'Track Saturn, Rahu, Jupiter transits & their timelines.',
    icon: Clock
  }
];

const knowledgeCards = [
  {
    tag: 'Insights',
    title: 'How AI is reshaping predictive astrology in 2025'
  },
  {
    tag: 'Guides',
    title: 'Step-by-step Kundli matching for modern couples'
  },
  {
    tag: 'Remedies',
    title: 'Top 7 fixes for retrograde Saturn in 10th house'
  },
  {
    tag: 'Gochar Ratna',
    title: 'Which gemstone should be worn according to the planets'
  }
];

const heroShortcutItems = [
  {
    label: 'Kundali',
    path: '/kundali',
    icon: ScrollText
  },
  {
    label: 'Horoscope',
    path: '/zodiac',
    icon: Sun
  },
  {
    label: 'Match Making',
    path: `${VEDIC_ASTROLOGY_BASE_URL}/?matchmaking=true&hide_search=true`,
    icon: HeartHandshake,
    isExternal: true
  },
  {
    label: 'Love Calculator',
    path: `${VEDIC_ASTROLOGY_BASE_URL}/?compatibility-hub=true&hide_search=true`,
    icon: Heart,
    isExternal: true
  },
  {
    label: 'Numerology',
    path: '/numerology',
    icon: Calculator
  },
  {
    label: 'Tarot',
    path: '/tarot-reading',
    icon: Sparkles
  },
  {
    label: 'Face Reading',
    path: `${VEDIC_ASTROLOGY_BASE_URL}/?face_reading=true&hide_search=true`,
    icon: User,
    isExternal: true
  },
  {
    label: 'Palmistry',
    path: '/palmistry',
    icon: Hand
  },
  {
    label: 'Quick Chart',
    path: '/kundali',
    icon: Sparkles
  },
  {
    label: 'Panchang Today',
    path: `${VEDIC_ASTROLOGY_BASE_URL}/?panchang=true&hide_search=true`,
    icon: CalendarDays,
    isExternal: true
  },
  {
    label: 'Varshphal',
    path: `${VEDIC_ASTROLOGY_BASE_URL}/?monthly_panchang=true&hide_search=true`,
    icon: Star,
    isExternal: true
  },
  {
    label: 'Transit Analysis',
    path: '/booking',
    icon: Clock
  },
  {
    label: 'Dainik Paanchang',
    path: `${VEDIC_ASTROLOGY_BASE_URL}/?panchang=true`,
    icon: Sun,
    isExternal: true
  },
  {
    label: 'Monthly Prediction',
    path: '/booking',
    icon: Calendar
  },
  {
    label: 'Weekly Prediction',
    path: '/booking',
    icon: CalendarClock
  },
  {
    label: 'Gaj Kesari Yog',
    path: '/booking',
    icon: ScrollText
  },
  {
    label: 'Rahu Dosh',
    path: '/booking',
    icon: Moon
  },
  {
    label: 'Ketu Dosh',
    path: '/booking',
    icon: Shield
  },
  {
    label: 'Pitra Dosh',
    path: '/booking',
    icon: Users
  },
  {
    label: 'Mangal Dosh',
    path: '/booking',
    icon: Sparkles
  },
  {
    label: 'Sadesati Dosh',
    path: '/booking',
    icon: Clock
  },
  {
    label: 'Kalsarp Dosh',
    path: '/booking',
    icon: Shield
  }
];

const exploreServices = [
  { name: 'Daily Calendar', path: `${VEDIC_ASTROLOGY_BASE_URL}/?panchang=true&hide_search=true`, icon: CalendarDays, color: 'from-blue-500 to-indigo-600', isExternal: true },
  { name: 'Monthly Calendar', path: `${VEDIC_ASTROLOGY_BASE_URL}/?monthly_panchang=true&hide_search=true`, icon: Calendar, color: 'from-indigo-500 to-purple-600', isExternal: true },
  { name: 'About Us', path: '/about', icon: Info, color: 'from-cyan-500 to-blue-600' },
  { name: 'Astrologers', path: '/astrologers', icon: Users, color: 'from-purple-500 to-pink-600' },
  { name: 'Consult Astrologer', path: '/booking', icon: CalendarClock, color: 'from-emerald-500 to-teal-600' },
  { name: 'Kundali', path: '/kundali', icon: ScrollText, color: 'from-amber-500 to-orange-600' },
  { name: 'Kundali Matching', path: `${VEDIC_ASTROLOGY_BASE_URL}/?matchmaking=true&hide_search=true`, icon: HeartHandshake, color: 'from-rose-500 to-pink-600', isExternal: true },
  { name: 'Love Calculator', path: `${VEDIC_ASTROLOGY_BASE_URL}/?compatibility-hub=true&hide_search=true`, icon: Heart, color: 'from-red-500 to-rose-600', isExternal: true },
  { name: 'Relationship Horoscope', path: `${VEDIC_ASTROLOGY_BASE_URL}/?compatibility-hub=true&calculator=weekly-relationship&hide_search=true`, icon: HeartHandshake, color: 'from-fuchsia-500 to-pink-600', isExternal: true },
  { name: 'Advanced Muhurt', path: `${VEDIC_ASTROLOGY_BASE_URL}/?advanced_muhurt=true&hide_search=true`, icon: Calendar, color: 'from-orange-500 to-amber-600', isExternal: true },
  { name: 'Ask Prashna', path: `${VEDIC_ASTROLOGY_BASE_URL}/?prashna=true&hide_search=true`, icon: MessageCircle, color: 'from-purple-500 to-indigo-600', isExternal: true },
  { name: 'Ashtamangala Prasna', path: `${VEDIC_ASTROLOGY_BASE_URL}/?ashtamangala=true&hide_search=true`, icon: Sparkles, color: 'from-amber-500 to-red-500', isExternal: true },
  { name: 'KP Astrology', path: `${VEDIC_ASTROLOGY_BASE_URL}/?kp_astrology=true&hide_search=true`, icon: Globe, color: 'from-blue-500 to-indigo-600', isExternal: true },
  { name: 'Nadi Astrology', path: `${VEDIC_ASTROLOGY_BASE_URL}/?nadi=true&hide_search=true`, icon: ScrollText, color: 'from-amber-500 to-orange-600', isExternal: true },
  { name: 'Japa Mala (Mantras)', path: `${VEDIC_ASTROLOGY_BASE_URL}/?mantra=true&hide_search=true`, icon: Sparkles, color: 'from-pink-500 to-rose-600', isExternal: true },
  { name: 'Brahma Muhurt', path: `${VEDIC_ASTROLOGY_BASE_URL}/?brahma_muhurt=true&hide_search=true`, icon: Sun, color: 'from-amber-400 to-orange-500', isExternal: true },
  { name: 'Adv. Nakshatra', path: `${VEDIC_ASTROLOGY_BASE_URL}/?advanced_nakshatra=true&only_planetary=true&hide_search=true`, icon: Star, color: 'from-yellow-500 to-amber-600', isExternal: true },
  { name: 'Numerology', path: '/numerology', icon: Calculator, color: 'from-teal-500 to-cyan-600' },
  { name: 'Tarot Reading', path: '/tarot-reading', icon: Sparkles, color: 'from-purple-500 to-indigo-600' },
  { name: 'Palmistry', path: '/palmistry', icon: Hand, color: 'from-fuchsia-500 to-purple-600' },
  { name: 'Face Reading', path: `${VEDIC_ASTROLOGY_BASE_URL}/?face_reading=true&hide_search=true`, icon: User, color: 'from-rose-500 to-pink-600', isExternal: true },
  { name: 'Vastu Shastra', path: '/vastu-shastra', icon: Building2, color: 'from-orange-500 to-amber-600' },
  { name: 'Garg Shutra', path: `${VEDIC_ASTROLOGY_BASE_URL}/?garga=true&hide_search=true`, icon: BookOpen, color: 'from-indigo-500 to-purple-600', isExternal: true },
  { name: 'Zodiac Signs', path: '/zodiac', icon: MoonStar, color: 'from-violet-500 to-purple-600' },
  { name: 'Videos', path: '/community-videos', icon: PlayCircle, color: 'from-blue-500 to-indigo-600' },
  { name: 'Contact Us', path: '/contact', icon: PhoneCall, color: 'from-slate-500 to-slate-700' },
  { name: 'Shop', path: '/shop', icon: ShoppingBag, color: 'from-amber-500 to-rose-500' },
  { name: 'Live Chat', path: '/live-chat', icon: MessageCircle, color: 'from-teal-500 to-emerald-600' }
];


const shopCards = [
  {
    title: 'Certified Gemstones',
    description: 'Govt-lab certified, energized & shipped worldwide.'
  },
  {
    title: 'Programmed Yantras',
    description: 'Copper/brass yantras tuned to your sankalp.'
  },
  {
    title: 'Puja Kits & Rudraksha',
    description: 'Curated kits for wealth, harmony & protection.'
  }
];

const testimonialsSeed = [
  {
    name: 'Aditi Verma',
    text: 'The dark UI mirrors AstroSage but feels calmer. I generated my Kundli, matched horoscopes, and booked a consult within minutes.',
    location: 'Pune, India'
  },
  {
    name: 'Vikas Rathi',
    text: 'Loved the AI preview summarizing my next 6 months. The astrologer built on it which saved a ton of time.',
    location: 'Gurugram, India'
  },
  {
    name: 'Jitender Shukla',
    text: 'Panchang, Muhurat and gemstone suggestions feel tailored. Premium yet intuitive.',
    location: 'Lucknow, Uttar Pradesh'
  }
];

const faqItems = [
  {
    question: 'Is the Kundli totally free?',
    answer: 'Yes. Download PDFs, view dasha timelines, strengths, yogas, and personalized tips without hidden fees.'
  },
  {
    question: 'How fast can I talk to an astrologer?',
    answer: 'Top experts are online 24/7. Choose chat, voice, or video and connect instantly or schedule for later.'
  },
  {
    question: 'Are remedies & products authentic?',
    answer: 'All gemstones, yantras, and puja kits are sourced from verified partners, energized, and shipped with certification.'
  }
];

const trustBadges = [
  { label: '45M+ charts interpreted', icon: Sparkles },
  { label: '15+ languages supported', icon: Globe },
  { label: '4.9★ user satisfaction', icon: Star },
  { label: '24/7 expert availability', icon: Clock }
];

const consultationSlogans = [
  'दीपावली में राशि के अनुसार पूजा कैसे करे',
  'कार्तिक में प्रतिदिन पूजा कैसे करे',
  'सितारों के राज खोलें!',
  'ब्रह्मांड के संकेत पहचानें!',
  'भविष्य की राह चुनें!',
  'अपनी किस्मत आज बदलें',
  'ग्रहों की चाल जानें!',
  'भाग्य का सटीक दर्पण!',
  'Talk To Our Astrologer For Free',
  'Find out what your Nakshatras Say For Today For Free',
  'Know your Horoscope For Free',
  'Create Your Kundali For Free',
  'Match Kundali for Marriage For Free',
  'Kundli Matching For Free',
  'Kundli Matching For Marriage',
  'Find out your Horoscope For Free'
];

const consultationButtons = [
  {
    type: 'external',
    path: `${VEDIC_ASTROLOGY_BASE_URL}/?matchmaking=true`,
    label: 'गुण मिलने के बाद भी शादी में दोष क्यों ?'
  },
  {
    type: 'external',
    path: `${VEDIC_ASTROLOGY_BASE_URL}/?compatibility-hub=true&calculator=weekly-relationship`,
    label: 'Weekly Relationship Horoscope For Free'
  },
  {
    type: 'internal',
    path: '/numerology',
    label: 'Unlock Your Future With Numerology For Free'
  },
  {
    type: 'internal',
    path: '/booking',
    label: 'महादशा और अंतर्दशा का समय-चक्र और भविष्य'
  },
  {
    type: 'internal',
    path: '/vastu-shastra',
    label: 'Check Vastu For Free'
  },
  {
    type: 'internal',
    path: '/zodiac',
    label: 'Check Horoscope For Free'
  },
  {
    type: 'external',
    path: `${VEDIC_ASTROLOGY_BASE_URL}/?compatibility-hub=true`,
    label: 'Check Your Love Compatibility!'
  },
  {
    type: 'external',
    path: `${VEDIC_ASTROLOGY_BASE_URL}/?matchmaking=true`,
    label: 'Match Kundali For Free'
  },
  {
    type: 'internal',
    path: '/tarot-reading',
    label: 'Ask Tarot For Free'
  },
  {
    type: 'internal',
    path: '/live-chat',
    label: 'Live Chat with Astrologers Now For Free'
  },
  {
    type: 'action',
    actionName: 'scrollToServices',
    label: 'Explore Our Services For Free'
  },
  {
    type: 'internal',
    path: '/booking',
    label: 'Chat with Astrologers Now For Free'
  }
];

// Helper to strip "Astrologer" / "Astrologer " prefix from name
const cleanAstrologerName = (rawName = '') => {
  return rawName.replace(/^Astrologer\s+/i, '').trim() || rawName;
};

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const { t, currentLang } = useLanguage();
  const [backgroundImage, setBackgroundImage] = useState('/images/home4.png');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [availableAstrologers, setAvailableAstrologers] = useState([]);
  const [isAstrologerLoading, setIsAstrologerLoading] = useState(true);
  const scrollContainerRef = useRef(null);
  const liveAstroScrollRef = useRef(null);
  const chatNowScrollRef = useRef(null);
  const heroShortcutRef = useRef(null);
  const [heroShortcutHeight, setHeroShortcutHeight] = useState(60);
  const heroVideoRef = useRef(null);
  const [heroVideoHeight, setHeroVideoHeight] = useState(400);
  const navigate = useNavigate();
  const [quickKundaliData, setQuickKundaliData] = useState({
    name: '',
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: '',
    gender: 'Male'
  });
  const [isSubmittingKundali, setIsSubmittingKundali] = useState(false);

  // Automatically fetch name & date of birth from user sign up details
  useEffect(() => {
    if (user) {
      let userName = user.name || '';
      if (!userName && (user.firstName || user.lastName)) {
        userName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      }

      let userDob = user.dateOfBirth || '';
      if (userDob && userDob.includes('T')) {
        userDob = userDob.split('T')[0];
      }

      setQuickKundaliData(prev => ({
        ...prev,
        name: userName || prev.name,
        dateOfBirth: userDob || prev.dateOfBirth,
        timeOfBirth: user.timeOfBirth || user.birthTime || prev.timeOfBirth,
        placeOfBirth: user.placeOfBirth || user.city || prev.placeOfBirth,
        gender: user.gender || prev.gender || 'Male'
      }));
    }
  }, [user]);

  const [sloganIndex, setSloganIndex] = useState(0);
  const [activeSideAnimation, setActiveSideAnimation] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalLine, setModalLine] = useState('');
  const [modalAstrologerIndex, setModalAstrologerIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videos = useMemo(() => ['/images/sapt.mp4', '/images/home2.mp4'], []);

  const [activeButtonGroup, setActiveButtonGroup] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveButtonGroup((prev) => (prev === 0 ? 1 : 0));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev === 0 ? 1 : 0));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const braceletImages = useMemo(() => [
    '/bracelet/bracelet1.png',
    '/bracelet/bracelet2.png',
    '/bracelet/braclet3.png',
    '/bracelet/bracelet4.png',
    '/bracelet/bracelet5.png',
    '/bracelet/bracelet6.png',
    '/bracelet/bracelet7.png',
    '/bracelet/bracelet8.png',
    '/bracelet/bracelet9.png'
  ], []);
  const [currentBraceletIndex, setCurrentBraceletIndex] = useState(0);

  const heroMediaItems = useMemo(() => [
    { type: 'video', src: '/images/gem1.mp4' },
    { type: 'image', src: '/dosha/D1.png' },
    { type: 'image', src: '/dosha/D2.png' },
    { type: 'image', src: '/dosha/D3.png' },
    { type: 'image', src: '/dosha/D4.png' },
    { type: 'image', src: '/dosha/D5.png' },
    { type: 'image', src: '/dosha/D6.png' },
    { type: 'image', src: '/dosha/D7.png' },
    { type: 'image', src: '/dosha/D8.png' }
  ], []);

  const [heroMediaIndex, setHeroMediaIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroMediaIndex((prev) => (prev + 1) % heroMediaItems.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [heroMediaItems.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBraceletIndex((prev) => (prev + 1) % braceletImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [braceletImages.length]);

  useEffect(() => {
    const posterLines = [
      "ग्रहों की बदलती चाल आपके जीवन को कैसे प्रभावित करेगी? अपनी कुंडली के सटीक विश्लेषण और सही समाधान के लिए आज ही संपर्क करें।",
      "क्या आपकी किस्मत में है कोई नया बदलाव? ग्रहों के गोचर (चाल) का अपने करियर, धन और स्वास्थ्य पर असर जानने के लिए संपर्क करें।",
      "समय के साथ ग्रहों की स्थिति बदलती है। आपकी राशि पर इसका क्या प्रभाव होगा? जानिए हमारे विशेषज्ञ ज्योतिषी से, संपर्क करने के लिए क्लिक करें।",
      "ग्रहों का परिवर्तन लाता है जीवन में नए अवसर। आपकी कुंडली के अनुसार आपका भाग्य क्या कहता है? जानने के लिए संपर्क करें।",
      "सितारों की चाल से तय होते हैं जीवन के रास्ते। आपकी सफलता, विवाह या व्यापार का भविष्य जानने के लिए संपर्क करें।"
    ];
    const randomIndex = Math.floor(Math.random() * posterLines.length);
    setModalLine(posterLines[randomIndex]);
    setShowModal(true);
  }, []);

  // Automatically cycle through all astrologers one by one, displaying 3 at a time in the pop-up modal
  useEffect(() => {
    if (!showModal || availableAstrologers.length <= 3) return;
    const timer = setInterval(() => {
      setModalAstrologerIndex((prev) => (prev + 1) % availableAstrologers.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [showModal, availableAstrologers.length]);

  const modalAstrologers = useMemo(() => {
    if (!availableAstrologers || availableAstrologers.length === 0) return [];
    if (availableAstrologers.length <= 3) return availableAstrologers;
    const list = [];
    for (let i = 0; i < 3; i++) {
      list.push(availableAstrologers[(modalAstrologerIndex + i) % availableAstrologers.length]);
    }
    return list;
  }, [availableAstrologers, modalAstrologerIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSideAnimation((prev) => (prev === 0 ? 1 : 0));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Automatically scroll Live Astrologers row one by one every 5 seconds
  const [isLiveAstroHovered, setIsLiveAstroHovered] = useState(false);
  useEffect(() => {
    if (isLiveAstroHovered) return;
    const interval = setInterval(() => {
      if (liveAstroScrollRef.current) {
        const el = liveAstroScrollRef.current;
        // Each astrologer item is 108px + gap (24px on mobile, 32px on sm/lg) = ~132px-140px
        const itemWidth = 140;
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (el.scrollLeft + itemWidth >= maxScroll - 10) {
          el.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          el.scrollBy({ left: itemWidth, behavior: 'smooth' });
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isLiveAstroHovered]);

  // Automatically scroll Chat Now row one by one every 5 seconds
  const [isChatNowHovered, setIsChatNowHovered] = useState(false);
  useEffect(() => {
    if (isChatNowHovered) return;
    const interval = setInterval(() => {
      if (chatNowScrollRef.current) {
        const el = chatNowScrollRef.current;
        const itemWidth = 140;
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (el.scrollLeft + itemWidth >= maxScroll - 10) {
          el.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          el.scrollBy({ left: itemWidth, behavior: 'smooth' });
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isChatNowHovered]);

  // Cycle astrologer image in "Talk To Astrologer" flex card every 5 seconds
  const [talkAstroCardIndex, setTalkAstroCardIndex] = useState(0);
  useEffect(() => {
    const totalAstros = (availableAstrologers && availableAstrologers.length > 0) ? availableAstrologers.length : 3;
    const interval = setInterval(() => {
      setTalkAstroCardIndex((prev) => (prev + 1) % totalAstros);
    }, 5000);
    return () => clearInterval(interval);
  }, [availableAstrologers]);

  // ♈ Gemini AI Daily Horoscope State
  const ZODIAC_SIGNS = [
    { name: 'Aries', hindi: 'मेष', symbol: '♈', dates: 'Mar 21 - Apr 19' },
    { name: 'Taurus', hindi: 'वृषभ', symbol: '♉', dates: 'Apr 20 - May 20' },
    { name: 'Gemini', hindi: 'मिथुन', symbol: '♊', dates: 'May 21 - Jun 20' },
    { name: 'Cancer', hindi: 'कर्क', symbol: '♋', dates: 'Jun 21 - Jul 22' },
    { name: 'Leo', hindi: 'सिंह', symbol: '♌', dates: 'Jul 23 - Aug 22' },
    { name: 'Virgo', hindi: 'कन्या', symbol: '♍', dates: 'Aug 23 - Sep 22' },
    { name: 'Libra', hindi: 'तुला', symbol: '♎', dates: 'Sep 23 - Oct 22' },
    { name: 'Scorpio', hindi: 'वृश्चिक', symbol: '♏', dates: 'Oct 23 - Nov 21' },
    { name: 'Sagittarius', hindi: 'धनु', symbol: '♐', dates: 'Nov 22 - Dec 21' },
    { name: 'Capricorn', hindi: 'मकर', symbol: '♑', dates: 'Dec 22 - Jan 19' },
    { name: 'Aquarius', hindi: 'कुंभ', symbol: '♒', dates: 'Jan 20 - Feb 18' },
    { name: 'Pisces', hindi: 'मीन', symbol: '♓', dates: 'Feb 19 - Mar 20' },
  ];
  const [selectedHoroscopeSign, setSelectedHoroscopeSign] = useState('Aries');
  const [horoscopeSignType, setHoroscopeSignType] = useState('Moon'); // 'Moon' (चंद्र राशि) | 'Sun' (सूर्य राशि)
  const [horoscopeData, setHoroscopeData] = useState(null);
  const [isHoroscopeLoading, setIsHoroscopeLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchHoroscope = async () => {
      const today = new Date().toISOString().split('T')[0];
      const activeLang = currentLang || 'hi';
      const cacheKey = `gemini_horoscope_${horoscopeSignType}_${selectedHoroscopeSign}_${activeLang}_${today}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          setHoroscopeData(JSON.parse(cached));
          return;
        } catch (e) { }
      }

      setIsHoroscopeLoading(true);
      try {
        const res = await kundaliAPI.getDailyHoroscope({
          sign: selectedHoroscopeSign,
          date: today,
          signType: horoscopeSignType,
          language: activeLang
        });
        if (res.data?.success && isMounted) {
          setHoroscopeData(res.data.horoscope);
          localStorage.setItem(cacheKey, JSON.stringify(res.data.horoscope));
        }
      } catch (err) {
        console.warn('Failed to load Gemini horoscope:', err);
      } finally {
        if (isMounted) setIsHoroscopeLoading(false);
      }
    };
    fetchHoroscope();
    return () => { isMounted = false; };
  }, [selectedHoroscopeSign, horoscopeSignType, currentLang]);

  // Dynamic Daily Vedic Panchang for Current Date
  const [dailyPanchang, setDailyPanchang] = useState(null);
  const [isPanchangLoading, setIsPanchangLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchTodayPanchang = async () => {
      setIsPanchangLoading(true);
      try {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        const res = await kundaliAPI.getDailyPanchang({
          lat: 28.6139,
          lon: 77.2090,
          tz: 5.5,
          date: dateStr
        });

        if (res?.data && isMounted) {
          setDailyPanchang(res.data);
        }
      } catch (err) {
        console.warn('Could not fetch daily panchang:', err);
      } finally {
        if (isMounted) setIsPanchangLoading(false);
      }
    };

    fetchTodayPanchang();
    return () => { isMounted = false; };
  }, []);

  const [submitTarget, setSubmitTarget] = useState('kundali');
  const handleQuickPreviewChange = (e) => {
    setQuickKundaliData({
      ...quickKundaliData,
      [e.target.name]: e.target.value
    });
  };

  const handleQuickPreviewSubmit = async (e, directTarget) => {
    if (e && e.preventDefault) e.preventDefault();
    const activeTarget = directTarget || submitTarget;
    if (!quickKundaliData.dateOfBirth) {
      alert('कृपया जन्म तिथि भरें (Please select Date of Birth)');
      return;
    }

    setIsSubmittingKundali(true);

    try {
      const cityName = (quickKundaliData.placeOfBirth || 'New Delhi').trim();
      let coords = '28.6139, 77.2090';
      const lowerCity = cityName.toLowerCase();

      // Common Indian cities coordinate lookup
      const cityCoordsMap = {
        'delhi': '28.6139, 77.2090',
        'new delhi': '28.6139, 77.2090',
        'mumbai': '19.0760, 72.8777',
        'bombay': '19.0760, 72.8777',
        'bangalore': '12.9716, 77.5946',
        'bengaluru': '12.9716, 77.5946',
        'kolkata': '22.5726, 88.3639',
        'calcutta': '22.5726, 88.3639',
        'chennai': '13.0827, 80.2707',
        'madras': '13.0827, 80.2707',
        'hyderabad': '17.3850, 78.4867',
        'ahmedabad': '23.0225, 72.5714',
        'pune': '18.5204, 73.8567',
        'jaipur': '26.9124, 75.7873',
        'lucknow': '26.8467, 80.9462',
        'varanasi': '25.3176, 82.9739',
        'kashi': '25.3176, 82.9739',
        'patna': '25.5941, 85.1376',
        'bhopal': '23.2599, 77.4126',
        'indore': '22.7196, 75.8577',
        'chandigarh': '30.7333, 76.7794',
        'surat': '21.1702, 72.8311',
        'nagpur': '21.1458, 79.0882',
        'agra': '27.1767, 78.0081',
        'kanpur': '26.4499, 80.3319'
      };

      if (cityCoordsMap[lowerCity]) {
        coords = cityCoordsMap[lowerCity];
      } else if (cityName && cityName !== 'New Delhi') {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1500);
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(cityName)}`,
            {
              headers: { 'Accept-Language': 'en', 'User-Agent': 'AstrologyApp/1.0' },
              signal: controller.signal
            }
          );
          clearTimeout(timeoutId);
          if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
              coords = `${parseFloat(data[0].lat).toFixed(4)}, ${parseFloat(data[0].lon).toFixed(4)}`;
            }
          }
        } catch (e) {
          coords = '28.6139, 77.2090';
        }
      }

      const submissionData = {
        name: quickKundaliData.name || user?.name || 'Quick User',
        dateOfBirth: quickKundaliData.dateOfBirth,
        timeOfBirth: quickKundaliData.timeOfBirth || '12:00',
        placeOfBirth: cityName || 'New Delhi',
        gender: quickKundaliData.gender || 'Male',
        country: 'India',
        state: 'Delhi',
        coordinates: coords,
        timezone: 'Asia/Kolkata'
      };

      // Persist in sessionStorage for KundaliHub & reload support
      sessionStorage.setItem('lastGeneratedKundali', JSON.stringify(submissionData));

      if (activeTarget === 'matchmaking') {
        window.location.href = `${VEDIC_ASTROLOGY_BASE_URL}/?matchmaking=true&hide_search=true`;
      } else {
        // Redirect to KundaliHub
        navigate('/kundali-hub', { state: { birthData: submissionData } });
      }
    } catch (err) {
      console.error('Failed to submit quick Kundali form:', err);
    } finally {
      setIsSubmittingKundali(false);
    }
  };

  const fetchBackgroundImage = useCallback(async () => {
    try {
      const response = await adminAPI.getHomePageBackground();
      if (response.data.success && response.data.imageUrl) {
        setBackgroundImage(buildAssetUrl(response.data.imageUrl));
      } else {
        setBackgroundImage(null);
      }
    } catch (err) {
      console.log('Failed to fetch background image', err);
      setBackgroundImage(null);
    }
  }, []);

  useEffect(() => {
    fetchBackgroundImage();
    const handleBackgroundImageUpdate = () => fetchBackgroundImage();
    window.addEventListener('backgroundImageUpdated', handleBackgroundImageUpdate);
    return () => window.removeEventListener('backgroundImageUpdated', handleBackgroundImageUpdate);
  }, [fetchBackgroundImage]);

  useEffect(() => {
    const updateHeroShortcutHeight = () => {
      if (heroShortcutRef.current) {
        const height = heroShortcutRef.current.offsetHeight;
        setHeroShortcutHeight(height);
      }
    };

    updateHeroShortcutHeight();
    window.addEventListener('resize', updateHeroShortcutHeight);
    return () => window.removeEventListener('resize', updateHeroShortcutHeight);
  }, []);

  useEffect(() => {
    const updateHeroVideoHeight = () => {
      if (heroVideoRef.current) {
        const height = heroVideoRef.current.offsetHeight;
        setHeroVideoHeight(height);
      }
    };

    // Wait for animation to complete before measuring
    const timer = setTimeout(() => {
      updateHeroVideoHeight();
    }, 1000);

    updateHeroVideoHeight();
    window.addEventListener('resize', updateHeroVideoHeight);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateHeroVideoHeight);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(
      () => setCurrentTestimonial((prev) => (prev + 1) % testimonialsSeed.length),
      5000
    );
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(
      () => setSloganIndex((prev) => (prev + 4) % consultationSlogans.length),
      5000
    );
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadAvailableAstrologers = async () => {
      try {
        setIsAstrologerLoading(true);
        const response = await authAPI.getAstrologers();
        const allAstrologers = response.data?.astrologers || [];
        let available = allAstrologers.filter(
          (astrologer) => astrologer.isAvailable !== false
        );

        // Pad with other astrologers in the system if available count is less than 4
        if (available.length < allAstrologers.length) {
          const offlineAstrologers = allAstrologers.filter(
            (astrologer) => !available.some((a) => a._id === astrologer._id)
          );
          available = [...available, ...offlineAstrologers];
        }

        // Pad with static mock experts if still less than 4
        if (available.length < 4) {
          const mockExperts = [
            {
              _id: 'mock-1',
              name: 'Acharya Ravi Sharma',
              languages: ['Hindi', 'English'],
              specialization: ['Vedic, KP System'],
              rating: '4.9',
              totalConsultations: '500+ reviews',
              isAvailable: true,
              isLive: true,
              profilePicture: '/images/hero1.png'
            },
            {
              _id: 'mock-2',
              name: 'Dr. Priya Nair',
              languages: ['Hindi', 'English'],
              specialization: ['Vedic, KP System'],
              rating: '4.9',
              totalConsultations: '500+ reviews',
              isAvailable: true,
              isLive: true,
              profilePicture: ''
            },
            {
              _id: 'mock-3',
              name: 'Acharya Ravil',
              languages: ['Hindi', 'English'],
              specialization: ['Vedic, English'],
              rating: '4.9',
              totalConsultations: '500+ reviews',
              isAvailable: true,
              isLive: true,
              profilePicture: ''
            },
            {
              _id: 'mock-4',
              name: 'Dr. Sonakshi',
              languages: ['Hindi', 'English'],
              specialization: ['Vedic, KP Exam'],
              rating: '4.9',
              totalConsultations: '500+ reviews',
              isAvailable: true,
              isLive: true,
              profilePicture: ''
            }
          ];
          const needed = 4 - available.length;
          available = [...available, ...mockExperts.slice(0, needed)];
        }

        setAvailableAstrologers(available);
      } catch (err) {
        console.error('Failed to fetch available astrologers', err);
        // Fallback entirely to mock experts if API fails
        setAvailableAstrologers([
          {
            _id: 'mock-1',
            name: 'Acharya Ravi Sharma',
            languages: ['Hindi', 'English'],
            specialization: ['Vedic, KP System'],
            rating: '4.9',
            totalConsultations: '500+ reviews',
            isAvailable: true,
            isLive: true,
            profilePicture: '/images/hero1.png'
          },
          {
            _id: 'mock-2',
            name: 'Dr. Priya Nair',
            languages: ['Hindi', 'English'],
            specialization: ['Vedic, KP System'],
            rating: '4.9',
            totalConsultations: '500+ reviews',
            isAvailable: true,
            isLive: true,
            profilePicture: ''
          },
          {
            _id: 'mock-3',
            name: 'Acharya Ravil',
            languages: ['Hindi', 'English'],
            specialization: ['Vedic, English'],
            rating: '4.9',
            totalConsultations: '500+ reviews',
            isAvailable: true,
            isLive: true,
            profilePicture: ''
          },
          {
            _id: 'mock-4',
            name: 'Dr. Sonakshi',
            languages: ['Hindi', 'English'],
            specialization: ['Vedic, KP Exam'],
            rating: '4.9',
            totalConsultations: '500+ reviews',
            isAvailable: true,
            isLive: true,
            profilePicture: ''
          }
        ]);
      } finally {
        setIsAstrologerLoading(false);
      }
    };

    loadAvailableAstrologers();
  }, []);



  const heroBackgroundStyle = useMemo(() => {
    if (!backgroundImage) {
      return {
        backgroundColor: '#ffffff'
      };
    }

    return {
      backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,255,255,0.95)), url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  }, [backgroundImage]);



  const testimonial = testimonialsSeed[currentTestimonial];

  return (
    <div
      className="min-h-screen text-slate-900 relative overflow-x-hidden bg-cover bg-center bg-no-repeat bg-fixed"
      style={{
        backgroundImage: "url('/images/home5.png')"
      }}
    >
      <Navigation />

      <div className="pt-0">
        {/* Fixed Hero Shortcut Flexbox */}
        <div
          ref={heroShortcutRef}
          className="fixed top-[64px] left-0 right-0 z-40 px-3 sm:px-4 lg:px-5 pointer-events-none"
        >
          <section className="w-full max-w-6xl mx-auto bg-white/95 border border-slate-200/90 rounded-2xl px-3 py-2 backdrop-blur-md shadow-xs pointer-events-auto">
            <div className="flex flex-nowrap items-center gap-2 overflow-x-auto scrollbar-hide py-0.5">
              {heroShortcutItems.map((item) => {
                const IconComponent = item.icon || Sparkles;
                const pillContent = (
                  <>
                    <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 group-hover:scale-110 transition-transform shrink-0" />
                    <span>{t(item.label)}</span>
                  </>
                );

                if (item.isExternal) {
                  return (
                    <a
                      key={item.label}
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-white border border-slate-200 text-slate-800 shadow-2xs hover:border-amber-400 hover:text-amber-600 hover:shadow-xs transition-all whitespace-nowrap"
                    >
                      {pillContent}
                    </a>
                  );
                }
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-white border border-slate-200 text-slate-800 shadow-2xs hover:border-amber-400 hover:text-amber-600 hover:shadow-xs transition-all whitespace-nowrap"
                  >
                    {pillContent}
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
        {/* Spacer to account for fixed flexbox height (64px nav + dynamic flexbox height) - no gap */}
        <div style={{ height: `${64 + heroShortcutHeight}px` }} />

        {/* Hero Video Section - Animation starts from bottom of flexbox */}
        <div className="pt-2">
          <section
            ref={heroVideoRef}
            className="relative w-full overflow-hidden py-0 flex items-end justify-center"
            style={{
              minHeight: '290px',
              marginTop: 0,
              animation: 'slideUpFromBottom 0.8s ease-out forwards',
              animationDelay: '0.1s',
              opacity: 0
            }}
          >
            <div className="relative flex flex-col lg:flex-row w-full max-w-7xl mx-auto px-2 gap-4 items-stretch -translate-x-.5 lg:-translate-x-0">
              {/* Left Side: Cosmic Insights Video Player */}
              <div className="relative w-full lg:flex-[1.9]">
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-950 flex flex-col justify-end">
                  <video
                    key={currentVideoIndex}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover absolute inset-0"
                    style={{ minHeight: '380px' }}
                  >
                    <source src={videos[currentVideoIndex]} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />
                  <div className="relative z-10 p-6 flex items-end justify-between text-white pointer-events-none">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 block mb-1">
                        Cosmic Guidance & Insights
                      </span>
                      <h3 className="text-xl sm:text-2xl font-bold tracking-wide">
                        VEDIC ASTROLOGY INSIGHTS
                      </h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shrink-0">
                      <PlayCircle className="w-7 h-7" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Quick Consultation Card */}
              <div className="relative w-full lg:flex-[1.3] flex flex-col justify-center gap-2.5">
                {/* Small Astro Slogan Banner */}
                <Link
                  to="/astrologers"
                  className="group relative block w-full rounded-2xl overflow-hidden border border-amber-200/90 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <img
                    src="/images/AstroSlogan.jpg"
                    alt="Talk to Astrologer Free"
                    className="w-full h-24 sm:h-38 object-cover object-[center_42%] group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent pointer-events-none" />
                </Link>

                <div className="relative w-full bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xl shadow-slate-100">
                  <div className="mb-3.5">
                    <span className="text-[16px] font-bold text-amber-600 uppercase tracking-wider block mb-1">
                      {t('Kundali Prediction')}
                    </span>
                  </div>

                  <form onSubmit={handleQuickPreviewSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <input
                          type="text"
                          name="name"
                          placeholder={t('Full Name (पूरा नाम)')}
                          value={quickKundaliData.name}
                          onChange={handleQuickPreviewChange}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition"
                          required
                        />
                      </div>
                      <div>
                        <select
                          name="gender"
                          value={quickKundaliData.gender || 'Male'}
                          onChange={handleQuickPreviewChange}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition cursor-pointer"
                        >
                          <option value="Male">Male (पुरुष)</option>
                          <option value="Female">Female (महिला)</option>
                          <option value="Other">Other (अन्य)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <input
                          type="date"
                          name="dateOfBirth"
                          placeholder="Date of Birth"
                          value={quickKundaliData.dateOfBirth}
                          onChange={handleQuickPreviewChange}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="time"
                          name="timeOfBirth"
                          placeholder="Time of Birth"
                          value={quickKundaliData.timeOfBirth}
                          onChange={handleQuickPreviewChange}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition"
                        />
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        name="placeOfBirth"
                        placeholder={t('Birth Place (e.g. New Delhi, Mumbai, Jaipur)')}
                        value={quickKundaliData.placeOfBirth}
                        onChange={handleQuickPreviewChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition"
                      />
                    </div>

                    {/* Two Action Buttons: Kundali Hub & Match Making */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {/* Button 1: Kundali Hub */}
                      <button
                        type="submit"
                        onClick={() => setSubmitTarget('kundali')}
                        disabled={isSubmittingKundali}
                        className="py-3 px-4 rounded-xl font-medium bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 text-sm sm:text-[15px] disabled:opacity-75 cursor-pointer"
                      >
                        {isSubmittingKundali && submitTarget === 'kundali' ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-yellow-200" />
                            <span>{t('Kundali Hub')}</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      {/* Button 2: Match Making */}
                      <button
                        type="button"
                        onClick={(e) => handleQuickPreviewSubmit(e, 'matchmaking')}
                        disabled={isSubmittingKundali}
                        className="py-3 px-4 rounded-xl font-medium bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 text-sm sm:text-[15px] disabled:opacity-75 cursor-pointer"
                      >
                        {isSubmittingKundali && submitTarget === 'matchmaking' ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            <span>Loading...</span>
                          </>
                        ) : (
                          <>
                            <HeartHandshake className="w-4 h-4 text-rose-100" />
                            <span>{t('Match Making')}</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Live Astrologers & Chat Now (Left 60%) + Hindu Panchang (Right 40%) Side-by-Side Section */}
        <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">

              {/* LEFT COLUMN (60% on desktop: lg:col-span-7) */}
              <div className="lg:col-span-7 space-y-3 flex flex-col justify-between">

                {/* 1. Live Astrologers Section */}
                <div className="bg-white/92 backdrop-blur-md border border-white/80 rounded-2xl p-3 sm:p-4 shadow-md shadow-amber-900/5">
                  <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-2">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        {t('Live Astrologers')}
                      </h2>
                      <span className="hidden sm:inline text-slate-300">|</span>
                      <p className="text-[13px] text-slate-900 font-medium">
                        {t('Connect with Expert Astrologers (Live Now)')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            if (liveAstroScrollRef.current) {
                              liveAstroScrollRef.current.scrollBy({ left: -260, behavior: 'smooth' });
                            }
                          }}
                          aria-label="Scroll left"
                          className="w-7 h-7 rounded-full border border-slate-300 hover:border-amber-500 bg-white shadow-2xs hover:bg-amber-50 flex items-center justify-center text-slate-700 hover:text-amber-700 transition-all cursor-pointer"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (liveAstroScrollRef.current) {
                              liveAstroScrollRef.current.scrollBy({ left: 260, behavior: 'smooth' });
                            }
                          }}
                          aria-label="Scroll right"
                          className="w-7 h-7 rounded-full border border-slate-300 hover:border-amber-500 bg-white shadow-2xs hover:bg-amber-50 flex items-center justify-center text-slate-700 hover:text-amber-700 transition-all cursor-pointer"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <Link to="/live-astrologers" className="text-xs sm:text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 whitespace-nowrap">
                        {t('View All')} <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Single Row Astrologer List */}
                  <div
                    ref={liveAstroScrollRef}
                    onMouseEnter={() => setIsLiveAstroHovered(true)}
                    onMouseLeave={() => setIsLiveAstroHovered(false)}
                    className="flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-hide py-1 px-1 scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {(availableAstrologers.length > 0 ? availableAstrologers : [
                      { _id: 'mock-1', name: 'Ravi Sharma', pricing: 16 },
                      { _id: 'mock-2', name: 'Priya Nair', pricing: 20 },
                      { _id: 'mock-3', name: 'Ravil', pricing: 15 },
                      { _id: 'mock-4', name: 'Sonakshi', pricing: 18 },
                      { _id: 'mock-5', name: 'Aarav Shastri', pricing: 22 },
                      { _id: 'mock-6', name: 'Meera Devi', pricing: 19 },
                    ]).map((astrologer) => {
                      const displayName = cleanAstrologerName(astrologer.name);
                      const rate = astrologer.pricing || 16;
                      const rawImage = astrologer.profilePicture || astrologer.image || astrologer.imageUrl || astrologer.photo;
                      const imageSrc = rawImage ? buildAssetUrl(rawImage) : null;

                      return (
                        <Link
                          key={astrologer._id}
                          to="/live-astrologers"
                          state={{ astrologer }}
                          className="group shrink-0 flex flex-col items-center text-center hover:-translate-y-0.5 transition-transform duration-200"
                          style={{ width: '84px' }}
                        >
                          <div className="relative mb-1">
                            <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full overflow-hidden border-2 border-amber-400 group-hover:border-amber-500 shadow-sm bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center ring-2 ring-amber-100 group-hover:ring-amber-300 transition-all">
                              {imageSrc ? (
                                <img
                                  src={imageSrc}
                                  alt={displayName}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    e.target.src = '/images/AstroIcon.jpg';
                                  }}
                                />
                              ) : (
                                <span className="text-base font-bold text-amber-700">
                                  {displayName.charAt(0) || 'A'}
                                </span>
                              )}
                            </div>
                            <span
                              className={`absolute bottom-0 right-0.5 w-3 h-3 rounded-full border-2 border-white shadow-2xs ${astrologer.isAvailable !== false ? 'bg-emerald-500' : 'bg-red-500'}`}
                              title={astrologer.isAvailable !== false ? 'Available' : 'Unavailable'}
                            ></span>
                          </div>
                          <h3 className="font-semibold text-xs text-slate-800 group-hover:text-amber-600 transition-colors truncate w-full mb-0.5">
                            {displayName}
                          </h3>
                          <p className="text-[11px] font-bold text-slate-600 group-hover:text-amber-700">
                            ₹{rate}/min
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Chat Now Section */}
                <div className="bg-white/92 backdrop-blur-md border border-white/80 rounded-2xl p-3 sm:p-4 shadow-md shadow-teal-900/5">
                  <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-2">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
                        {t('Chat Now')}
                      </h2>
                      <span className="hidden sm:inline text-slate-300">|</span>
                      <p className="text-[13px] text-slate-900 font-medium">
                        {t('Available for Instant Chat with Top Astrologers')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            if (chatNowScrollRef.current) {
                              chatNowScrollRef.current.scrollBy({ left: -260, behavior: 'smooth' });
                            }
                          }}
                          aria-label="Scroll left"
                          className="w-7 h-7 rounded-full border border-slate-300 hover:border-teal-500 bg-white shadow-2xs hover:bg-teal-50 flex items-center justify-center text-slate-700 hover:text-teal-700 transition-all cursor-pointer"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (chatNowScrollRef.current) {
                              chatNowScrollRef.current.scrollBy({ left: 260, behavior: 'smooth' });
                            }
                          }}
                          aria-label="Scroll right"
                          className="w-7 h-7 rounded-full border border-slate-300 hover:border-teal-500 bg-white shadow-2xs hover:bg-teal-50 flex items-center justify-center text-slate-700 hover:text-teal-700 transition-all cursor-pointer"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <Link to="/live-chat" className="text-xs sm:text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 whitespace-nowrap">
                        {t('Live Chat')} <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Single Row Chat Astrologers List */}
                  <div
                    ref={chatNowScrollRef}
                    onMouseEnter={() => setIsChatNowHovered(true)}
                    onMouseLeave={() => setIsChatNowHovered(false)}
                    className="flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-hide py-1 px-1 scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {(availableAstrologers.length > 0 ? availableAstrologers : [
                      { _id: 'mock-1', name: 'Ravi Sharma' },
                      { _id: 'mock-2', name: 'Priya Nair' },
                      { _id: 'mock-3', name: 'Ravil' },
                      { _id: 'mock-4', name: 'Sonakshi' },
                      { _id: 'mock-5', name: 'Aarav Shastri' },
                      { _id: 'mock-6', name: 'Meera Devi' },
                    ]).map((astrologer) => {
                      const displayName = cleanAstrologerName(astrologer.name);
                      const rawImage = astrologer.profilePicture || astrologer.image || astrologer.imageUrl || astrologer.photo;
                      const imageSrc = rawImage ? buildAssetUrl(rawImage) : null;

                      return (
                        <Link
                          key={`chat-${astrologer._id}`}
                          to="/live-chat"
                          state={{ autoSelectAstroId: astrologer._id, astrologer }}
                          className="group shrink-0 flex flex-col items-center text-center hover:-translate-y-0.5 transition-transform duration-200"
                          style={{ width: '84px' }}
                        >
                          <div className="relative mb-1">
                            <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full overflow-hidden border-2 border-teal-400 group-hover:border-teal-500 shadow-sm bg-gradient-to-br from-teal-50 to-emerald-100 flex items-center justify-center ring-2 ring-teal-100 group-hover:ring-teal-300 transition-all">
                              {imageSrc ? (
                                <img
                                  src={imageSrc}
                                  alt={displayName}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    e.target.src = '/images/AstroIcon.jpg';
                                  }}
                                />
                              ) : (
                                <span className="text-base font-bold text-teal-700">
                                  {displayName.charAt(0) || 'A'}
                                </span>
                              )}
                            </div>
                            <span
                              className={`absolute bottom-0 right-0.5 w-3 h-3 rounded-full border-2 border-white shadow-2xs ${astrologer.isAvailable !== false ? 'bg-emerald-500' : 'bg-red-500'}`}
                              title={astrologer.isAvailable !== false ? 'Available' : 'Unavailable'}
                            ></span>
                          </div>
                          <h3 className="font-semibold text-xs text-slate-800 group-hover:text-teal-600 transition-colors truncate w-full mb-1">
                            {displayName}
                          </h3>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600 transition-colors">
                            <MessageCircle className="w-2.5 h-2.5" /> Chat
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Authentic Daily Vedic Panchang (40% on desktop: lg:col-span-5) */}
              <div className="lg:col-span-5 bg-gradient-to-b from-[#fffaf4] via-white to-[#fff8ee] border-2 border-amber-300/80 rounded-2xl shadow-lg shadow-amber-900/10 flex flex-col justify-between overflow-hidden">
                {(() => {
                  const today = new Date();
                  const hindiMonths = [
                    'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
                    'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
                  ];
                  const hindiWeekdays = [
                    'रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'
                  ];
                  const dateStrDisplay = `${today.getDate()} ${hindiMonths[today.getMonth()]} ${today.getFullYear()} (${hindiWeekdays[today.getDay()]})`;

                  // Calculate approximate Samvat
                  const vikramSamvat = today.getFullYear() + 57;
                  const shakaSamvat = today.getFullYear() - 78;

                  const tithiHindiMap = {
                    'Shukla Paksha - Tithi 1': 'शुक्ल पक्ष प्रतिपदा',
                    'Shukla Paksha - Tithi 2': 'शुक्ल पक्ष द्वितीया',
                    'Shukla Paksha - Tithi 3': 'शुक्ल पक्ष तृतीया',
                    'Shukla Paksha - Tithi 4': 'शुक्ल पक्ष चतुर्थी',
                    'Shukla Paksha - Tithi 5': 'शुक्ल पक्ष पंचमी',
                    'Shukla Paksha - Tithi 6': 'शुक्ल पक्ष षष्ठी',
                    'Shukla Paksha - Tithi 7': 'शुक्ल पक्ष सप्तमी',
                    'Shukla Paksha - Tithi 8': 'शुक्ल पक्ष अष्टमी',
                    'Shukla Paksha - Tithi 9': 'शुक्ल पक्ष नवमी',
                    'Shukla Paksha - Tithi 10': 'शुक्ल पक्ष दशमी',
                    'Shukla Paksha - Tithi 11': 'शुक्ल पक्ष एकादशी',
                    'Shukla Paksha - Tithi 12': 'शुक्ल पक्ष द्वादशी',
                    'Shukla Paksha - Tithi 13': 'शुक्ल पक्ष त्रयोदशी',
                    'Shukla Paksha - Tithi 14': 'शुक्ल पक्ष चतुर्दशी',
                    'Shukla Paksha - Tithi 15': 'शुक्ल पक्ष पूर्णिमा',
                    'Krishna Paksha - Tithi 1': 'कृष्ण पक्ष प्रतिपदा',
                    'Krishna Paksha - Tithi 2': 'कृष्ण पक्ष द्वितीया',
                    'Krishna Paksha - Tithi 3': 'कृष्ण पक्ष तृतीया',
                    'Krishna Paksha - Tithi 4': 'कृष्ण पक्ष चतुर्थी',
                    'Krishna Paksha - Tithi 5': 'कृष्ण पक्ष पंचमी',
                    'Krishna Paksha - Tithi 6': 'कृष्ण पक्ष षष्ठी',
                    'Krishna Paksha - Tithi 7': 'कृष्ण पक्ष सप्तमी',
                    'Krishna Paksha - Tithi 8': 'कृष्ण पक्ष अष्टमी',
                    'Krishna Paksha - Tithi 9': 'कृष्ण पक्ष नवमी',
                    'Krishna Paksha - Tithi 10': 'कृष्ण पक्ष दशमी',
                    'Krishna Paksha - Tithi 11': 'कृष्ण पक्ष एकादशी',
                    'Krishna Paksha - Tithi 12': 'कृष्ण पक्ष द्वादशी',
                    'Krishna Paksha - Tithi 13': 'कृष्ण पक्ष त्रयोदशी',
                    'Krishna Paksha - Tithi 14': 'कृष्ण पक्ष चतुर्दशी',
                    'Krishna Paksha - Tithi 30': 'कृष्ण पक्ष अमावस्या'
                  };

                  const nakshatraHindiMap = {
                    'Ashwini': 'अश्विनी', 'Bharani': 'भरणी', 'Krittika': 'कृत्तिका', 'Rohini': 'रोहिणी',
                    'Mrigashira': 'मृगशिरा', 'Ardra': 'आर्द्रा', 'Punarvasu': 'पुनर्वसु', 'Pushya': 'पुष्य',
                    'Ashlesha': 'आश्लेषा', 'Magha': 'मघा', 'Purva Phalguni': 'पूर्वाफाल्गुनी',
                    'Uttara Phalguni': 'उत्तराफाल्गुनी', 'Hasta': 'हस्त', 'Chitra': 'चित्रा', 'Swati': 'स्वाती',
                    'Vishakha': 'विशाखा', 'Anuradha': 'अनुराधा', 'Jyeshtha': 'ज्येष्ठा', 'Mula': 'मूल',
                    'Purva Ashadha': 'पूर्वाषाढ़ा', 'Uttara Ashadha': 'उत्तराषाढ़ा', 'Shravana': 'श्रवण',
                    'Dhanishta': 'धनिष्ठा', 'Shatabhisha': 'शतभिषा', 'Purva Bhadrapada': 'पूर्वभाद्रपद',
                    'Uttara Bhadrapada': 'उत्तरभाद्रपद', 'Revati': 'रेवती'
                  };

                  const yogaHindiMap = {
                    'Vishkumbha': 'विष्कम्भ', 'Priti': 'प्रीति', 'Ayushman': 'आयुष्मान', 'Saubhagya': 'सौभाग्य',
                    'Shobhana': 'शोभन', 'Atiganda': 'अतिगण्ड', 'Sukarma': 'सुकर्मा', 'Dhriti': 'धृति',
                    'Shula': 'शूल', 'Ganda': 'गण्ड', 'Vriddhi': 'वृद्धि', 'Dhruva': 'ध्रुव',
                    'Vyaghata': 'व्याघात', 'Harshana': 'हर्षण', 'Vajra': 'वज्र', 'Siddhi': 'सिद्धि',
                    'Vyatipata': 'व्यतीपात', 'Variyan': 'वरीयान', 'Parigha': 'परिघ', 'Shiva': 'शिव',
                    'Siddha': 'सिद्ध', 'Sadhya': 'साध्य', 'Shubha': 'शुभ', 'Shukla': 'शुक्ल',
                    'Brahma': 'ब्रह्म', 'Indra': 'इन्द्र', 'Vaidhriti': 'वैधृति'
                  };

                  const karanaHindiMap = {
                    'Bava': 'बव', 'Balava': 'बालव', 'Kaulava': 'कौलव', 'Taitila': 'तैतिल',
                    'Gara': 'गर', 'Vanija': 'वणिज', 'Vishti': 'विष्टि (भद्रा)', 'Shakuni': 'शकुनि',
                    'Chatushpada': 'चतुष्पद', 'Naga': 'नाग', 'Kimstughna': 'किंस्तुघ्न'
                  };

                  const rawTithiName = dailyPanchang?.tithi?.tithi_name || '';
                  const displayTithi = tithiHindiMap[rawTithiName] || rawTithiName || 'शुक्ल पक्ष एकादशी';

                  const rawNakName = dailyPanchang?.nakshatra?.nakshatra_name || '';
                  const displayNakshatra = nakshatraHindiMap[rawNakName] || rawNakName || 'धनिष्ठा';

                  const rawYogaName = dailyPanchang?.yoga?.yoga_name || '';
                  const displayYoga = yogaHindiMap[rawYogaName] || rawYogaName || 'गण्ड योग';

                  const rawKaranaName = dailyPanchang?.karana?.karana_name || '';
                  const displayKarana = karanaHindiMap[rawKaranaName] || rawKaranaName || 'नाग';

                  const sunriseTime = dailyPanchang?.sun_rise || '06:25 AM';
                  const sunsetTime = dailyPanchang?.sun_set || '05:46 PM';

                  const rahuStart = dailyPanchang?.muhurtas?.rahu_kaal?.start || '12:05 PM';
                  const rahuEnd = dailyPanchang?.muhurtas?.rahu_kaal?.end || '01:30 PM';

                  const abhijitStart = dailyPanchang?.muhurtas?.abhijit?.start || '11:43 AM';
                  const abhijitEnd = dailyPanchang?.muhurtas?.abhijit?.end || '12:28 PM';

                  const brahmaStart = dailyPanchang?.muhurtas?.brahma_muhurta?.start || '04:49 AM';
                  const brahmaEnd = dailyPanchang?.muhurtas?.brahma_muhurta?.end || '05:37 AM';

                  // Festival / Parva info
                  const festivalName = today.getDate() === 21 && today.getMonth() === 9 && today.getFullYear() === 2026
                    ? 'दशहरा पारण / भरत मिलाप'
                    : (dailyPanchang?.sankranti?.name || dailyPanchang?.monthly_sankranti?.name || 'शुभ दैनिक पंचांग मुहूर्त');

                  return (
                    <>
                      {/* Traditional Sacred Saffron Header */}
                      <div className="bg-white text-black p-3 text-center shadow-xs">
                        <div className="flex items-center justify-center gap-1.5 mb-0.5">
                          <span className="text-amber-900 text-[14px]">ॐ</span>
                          <h3 className="font-serif font-black text-sm sm:text-base tracking-wide text-black">
                            आज {dateStrDisplay} का हिन्दू पंचांग
                          </h3>
                          <span className="text-amber-900 text-[14px]">ॐ</span>
                        </div>
                        <p className="text-[12px] text-black font-medium">
                          विक्रम संवत - {vikramSamvat} • शक संवत - {shakaSamvat} • आश्विन/कार्तिक
                        </p>
                      </div>

                      {/* Panchang Core Body */}
                      <div className="p-3 sm:p-3.5 space-y-2 text-[11px] sm:text-xs">

                        {/* 1. Tithi, Nakshatra, Karan, Yog */}
                        <div className="grid grid-cols-2 gap-2 bg-amber-50/70 border border-amber-200/60 rounded-xl p-2.5">
                          <div>
                            <span className="text-[12px] font-bold text-amber-900 uppercase block">तिथि (Tithi)</span>
                            <p className="font-bold text-slate-800">{displayTithi}</p>
                            <span className="text-[12px] text-slate-900 block">सूर्योदय व्यापिनी</span>
                          </div>
                          <div>
                            <span className="text-[12px] font-bold text-amber-900 uppercase block">नक्षत्र (Nakshatra)</span>
                            <p className="font-bold text-slate-800">{displayNakshatra}</p>
                            <span className="text-[12px] text-slate-900 block">चरण {dailyPanchang?.nakshatra?.pada || '4'}</span>
                          </div>
                          <div className="border-t border-amber-200/50 pt-1.5">
                            <span className="text-[12px] font-bold text-amber-900 uppercase block">करण (Karana)</span>
                            <p className="font-bold text-slate-900">{displayKarana}</p>
                          </div>
                          <div className="border-t border-amber-200/50 pt-1.5">
                            <span className="text-[12px] font-bold text-amber-900 uppercase block">योग (Yoga)</span>
                            <p className="font-bold text-slate-900">{displayYoga}</p>
                          </div>
                        </div>

                        {/* 2. Sun & Moon Times */}
                        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span className="text-amber-600 font-bold">☀️ सूर्य:</span>
                            <span className="text-slate-800 font-semibold">{sunriseTime} - {sunsetTime}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-indigo-600 font-bold">🌙 चंद्र:</span>
                            <span className="text-slate-800 font-semibold">कुंभ/मकर राशि संचार</span>
                          </div>
                        </div>

                        {/* 3. Inauspicious vs Auspicious Timings */}
                        <div className="grid grid-cols-2 gap-2">
                          {/* Ashubh Kaal (Rahu Kaal & Yamaganda) */}
                          <div className="bg-rose-50/90 border border-rose-200/80 rounded-xl p-2 text-rose-950">
                            <div className="flex items-center gap-1 font-bold text-[10px] text-rose-700 uppercase mb-0.5">
                              <span>⚠️ अशुभ काल</span>
                            </div>
                            <div className="space-y-0.5 text-[10.5px]">
                              <p><span className="font-semibold text-rose-900">राहु काल:</span> {rahuStart} - {rahuEnd}</p>
                              <p><span className="font-semibold text-rose-900">यम गण्ड:</span> 07:50 AM - 09:15 AM</p>
                              <p><span className="font-semibold text-rose-900">गुलिक काल:</span> 10:40 AM - 12:05 PM</p>
                            </div>
                          </div>

                          {/* Shubh Kaal (Abhijit & Amrit Kaal) */}
                          <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-xl p-2 text-emerald-950">
                            <div className="flex items-center gap-1 font-bold text-[10px] text-emerald-700 uppercase mb-0.5">
                              <span>✨ शुभ मुहूर्त</span>
                            </div>
                            <div className="space-y-0.5 text-[10.5px]">
                              <p><span className="font-semibold text-emerald-900">अभिजीत:</span> {abhijitStart} - {abhijitEnd}</p>
                              <p><span className="font-semibold text-emerald-900">अमृत काल:</span> 07:50 AM - 09:15 AM</p>
                              <p><span className="font-semibold text-emerald-900">ब्रह्म मुहूर्त:</span> {brahmaStart} - {brahmaEnd}</p>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Footer Action link */}
                      <div className="bg-gradient-to-r from-amber-100/70 to-orange-100/70 border-t border-amber-200 p-2.5 flex items-center justify-between text-xs">
                        <span className="text-[11px] font-semibold text-amber-950 truncate max-w-[200px] sm:max-w-[260px]" title={festivalName}>
                          पर्व/त्यौहार: {festivalName}
                        </span>
                        <Link
                          to={`${VEDIC_ASTROLOGY_BASE_URL}/?panchang=true&hide_search=true`}
                          target="_blank"
                          className="font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 text-[11px] underline underline-offset-2 transition shrink-0"
                        >
                          विस्तृत पंचांग ↗
                        </Link>
                      </div>
                    </>
                  );
                })()}
              </div>

            </div>
          </div>
        </section>

        {/* Navigation Cards Section - Animation starts from bottom of Hero Video Section */}
        <section
          id="explore-our-services-section"
          className="relative z-10 px-4 sm:px-6 lg:px-8 pt-0 pb-12"
          style={{
            marginTop: 0,
            animation: 'slideUpFromBottom 0.8s ease-out forwards',
            animationDelay: '1s',
            opacity: 0
          }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-4 items-stretch">
              {/* Explore Our Services - 70% width on desktop */}
              <div className="w-full lg:w-[70%] bg-white border border-slate-200 rounded-3xl p-5 lg:p-8 shadow-xl shadow-slate-100 flex flex-col justify-between">
                <div>
                  {/* Restructured Header: Centered Text at Top, Buttons Below */}
                  <div className="flex flex-col items-center mb-6 w-full">
                    <div className="text-center px-2 mb-4">
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">
                        {t('Explore Our Services')}
                      </h2>
                      <p className="text-slate-600 text-xs sm:text-sm">
                        {t('Discover all the features and services we offer')}
                      </p>
                    </div>

                    {/* Button Clusters Displayed Below Header (Left Side Buttons & Right Side Buttons) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                      {/* Left Side Buttons (3 Columns) */}
                      <div className="grid grid-cols-3 gap-1.5">
                        <Link
                          to="/booking"
                          className="px-1.5 py-1.5 rounded-lg text-[10.5px] font-bold bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-xs hover:opacity-90 transition animate-fadeIn text-center whitespace-nowrap"
                        >
                          {t('GajKesari Yog')}
                        </Link>
                        <Link
                          to="/booking"
                          className="px-1.5 py-1.5 rounded-lg text-[10.5px] font-bold bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-xs hover:opacity-90 transition animate-fadeIn text-center whitespace-nowrap"
                        >
                          {t('Raj Yog')}
                        </Link>
                        <Link
                          to="/booking"
                          className="px-1.5 py-1.5 rounded-lg text-[10.5px] font-bold bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-xs hover:opacity-90 transition animate-fadeIn text-center whitespace-nowrap"
                        >
                          {t('Dhan Yog')}
                        </Link>
                        <Link
                          to="/booking"
                          className="px-1.5 py-1.5 rounded-lg text-[10.5px] font-bold bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-xs hover:opacity-90 transition animate-fadeIn text-center whitespace-nowrap"
                        >
                          {t('Panch Mahapurush')}
                        </Link>
                        <Link
                          to="/booking"
                          className="px-1.5 py-1.5 rounded-lg text-[10.5px] font-bold bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-xs hover:opacity-90 transition animate-fadeIn text-center whitespace-nowrap"
                        >
                          {t('Malvaya Yog')}
                        </Link>
                        <Link
                          to="/booking"
                          className="px-1.5 py-1.5 rounded-lg text-[10.5px] font-bold bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-xs hover:opacity-90 transition animate-fadeIn text-center whitespace-nowrap"
                        >
                          {t('Budhaditya Yog')}
                        </Link>
                      </div>

                      {/* Right Side Buttons (3 Columns) */}
                      <div className="grid grid-cols-3 gap-1.5">
                        <Link
                          to="/booking"
                          className="px-1.5 py-1.5 rounded-lg text-[10.5px] font-bold bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-xs hover:opacity-90 transition animate-fadeIn text-center whitespace-nowrap"
                        >
                          {t('Marriage')}
                        </Link>
                        <Link
                          to="/booking"
                          className="px-1.5 py-1.5 rounded-lg text-[10.5px] font-bold bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-xs hover:opacity-90 transition animate-fadeIn text-center whitespace-nowrap"
                        >
                          {t('Carrier')}
                        </Link>
                        <Link
                          to="/booking"
                          className="px-1.5 py-1.5 rounded-lg text-[10.5px] font-bold bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-xs hover:opacity-90 transition animate-fadeIn text-center whitespace-nowrap"
                        >
                          {t('Finance')}
                        </Link>
                        <Link
                          to="/booking"
                          className="px-1.5 py-1.5 rounded-lg text-[10.5px] font-bold bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-xs hover:opacity-90 transition animate-fadeIn text-center whitespace-nowrap"
                        >
                          {t('Health')}
                        </Link>
                        <Link
                          to="/booking"
                          className="px-1.5 py-1.5 rounded-lg text-[10.5px] font-bold bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-xs hover:opacity-90 transition animate-fadeIn text-center whitespace-nowrap"
                        >
                          {t('Study Abroad')}
                        </Link>
                        <Link
                          to="/booking"
                          className="px-1.5 py-1.5 rounded-lg text-[10.5px] font-bold bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-xs hover:opacity-90 transition animate-fadeIn text-center whitespace-nowrap"
                        >
                          {t('Property / Land')}
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* AstroSage Style 4-Column Tiled Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 border-t border-l border-amber-200/90 bg-white shadow-xs overflow-hidden rounded-xl">
                    {exploreServices.map((item) => {
                      const IconComponent = item.icon || Sparkles;
                      const isExternal = item.isExternal;
                      const isSpecial = item.name === 'Talk to Astrologer' || item.name === 'Consult Astrologer';

                      const innerTile = (
                        <div className={`flex items-center gap-2.5 p-2.5 sm:p-3 transition-colors duration-150 h-full w-full ${isSpecial
                          ? 'bg-[#8572b8] text-white hover:bg-[#725ea7]'
                          : 'bg-white hover:bg-amber-50/60'
                          }`}>
                          <div className="shrink-0 flex items-center justify-center">
                            {isSpecial ? (
                              <div className="w-8 h-8 rounded-full bg-white text-[#8572b8] flex items-center justify-center shadow-xs">
                                <PhoneCall className="w-4 h-4 fill-current" />
                              </div>
                            ) : (
                              <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 text-[#f26522] stroke-[1.8]" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1 text-left">
                            <span className={`block text-xs font-semibold leading-tight line-clamp-2 ${isSpecial ? 'text-white font-bold' : 'text-slate-800 group-hover:text-amber-800'
                              }`}>
                              {t(item.name)}
                            </span>
                          </div>
                        </div>
                      );

                      return isExternal ? (
                        <a
                          key={item.name}
                          href={item.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group border-r border-b border-amber-200/90 flex items-center focus:outline-none"
                        >
                          {innerTile}
                        </a>
                      ) : (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="group border-r border-b border-amber-200/90 flex items-center focus:outline-none"
                        >
                          {innerTile}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Side: Sacred Treasures Image Banner (30% width on desktop) redirecting to Shop Page */}
              <div className="w-full lg:w-[30%] flex">
                <Link
                  to="/shop"
                  className="w-full group relative rounded-3xl overflow-hidden shadow-xl border-2 border-amber-300/80 hover:border-amber-400 transition-all duration-300 flex flex-col justify-center items-center bg-[#070b19] hover:shadow-2xl hover:scale-[1.01]"
                  title="Visit Sacred Treasures Shop"
                >
                  <img
                    src="/images/shop5.jpg"
                    alt="Sacred Treasures - Vedic Shop"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Subtle hover overlay badge */}
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-center justify-between pointer-events-none">
                    <span className="text-xs font-serif font-bold text-amber-200 tracking-wide">
                      Sacred Treasures
                    </span>
                    <span className="text-[11px] font-bold text-black bg-gradient-to-r from-amber-400 to-yellow-500 px-3 py-1 rounded-full shadow-md group-hover:from-amber-300 group-hover:to-yellow-400 transition-colors">
                      Shop Now →
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FULL-WIDTH INTERACTIVE DAILY HOROSCOPE SECTION (Right Below Explore Our Services) */}
        <section
          id="daily-horoscope-section"
          className="relative z-10 px-4 sm:px-6 lg:px-8 pt-0 pb-10"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-4 items-stretch">
              {/* Daily Horoscope - 70% width on desktop */}
              <div className="w-full lg:w-[70%] bg-gradient-to-b from-[#fffaf3] via-white to-[#fff7ea] border-2 border-amber-300/90 rounded-3xl p-5 sm:p-7 shadow-xl shadow-amber-900/10 flex flex-col justify-between">
                <div>
                  {/* Header with Title, Controls, and Gemini AI Tag */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-amber-200/80 pb-4 mb-4 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-serif font-black text-slate-900 text-lg sm:text-xl">
                            आज का दैनिक राशिफल
                          </h3>
                          <span className="text-[11px] font-bold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full border border-purple-200 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse"></span>
                            Expert Flash
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-amber-800 font-medium">
                          Daily Horoscope (Astroo Consult Vedic Engine)
                        </p>
                      </div>
                    </div>

                    {/* Moon Sign vs Sun Sign Switcher */}
                    <div className="flex items-center gap-1.5 p-1 bg-amber-100/70 border border-amber-200/90 rounded-2xl self-start lg:self-auto">
                      <button
                        type="button"
                        onClick={() => setHoroscopeSignType('Moon')}
                        className={`py-1.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${horoscopeSignType === 'Moon'
                          ? 'bg-amber-200 text-black shadow-xs'
                          : 'text-slate-700 hover:text-amber-800 hover:bg-white/60'
                          }`}
                      >
                        <span>🌙 चंद्र राशि</span>
                        <span className="text-[10px] sm:text-xs opacity-80">(Moon Sign)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setHoroscopeSignType('Sun')}
                        className={`py-1.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${horoscopeSignType === 'Sun'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                          : 'text-slate-700 hover:text-amber-800 hover:bg-white/60'
                          }`}
                      >
                        <span>☀️ सूर्य राशि</span>
                        <span className="text-[10px] sm:text-xs opacity-80">(Sun Sign)</span>
                      </button>
                    </div>
                  </div>

                  {/* 12 Zodiac Rashi Selector Grid (Responsive 4 / 6 / 12 columns) */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 mb-5">
                    {ZODIAC_SIGNS.map((z) => {
                      const isSelected = selectedHoroscopeSign === z.name;
                      return (
                        <button
                          key={z.name}
                          type="button"
                          onClick={() => setSelectedHoroscopeSign(z.name)}
                          className={`flex flex-col items-center justify-center py-2 px-1.5 rounded-xl transition-all cursor-pointer ${isSelected
                            ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md scale-103 ring-2 ring-amber-400'
                            : 'bg-white/95 border border-amber-200/80 text-slate-700 hover:bg-amber-50 hover:border-amber-300'
                            }`}
                        >
                          <span className="text-base sm:text-lg mb-0.5">{z.symbol}</span>
                          <span className="text-xs font-bold truncate max-w-full">{z.hindi}</span>
                          <span className={`text-[10px] font-medium truncate max-w-full ${isSelected ? 'text-amber-100' : 'text-slate-400'}`}>
                            {z.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Sign Highlights Banner */}
                  <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-300/80 rounded-2xl p-3 sm:p-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-amber-700 bg-white/80 w-12 h-12 rounded-xl flex items-center justify-center shadow-xs border border-amber-200">
                        {ZODIAC_SIGNS.find(s => s.name === selectedHoroscopeSign)?.symbol}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-slate-900 text-base sm:text-lg">
                            {selectedHoroscopeSign} ({ZODIAC_SIGNS.find(s => s.name === selectedHoroscopeSign)?.hindi})
                          </h4>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white border border-amber-300 text-amber-900">
                            {horoscopeSignType === 'Moon' ? '🌙 चंद्र राशि (Moon Sign)' : '☀️ सूर्य राशि (Sun Sign)'}
                          </span>
                        </div>
                        <span className="text-xs text-slate-600 block mt-0.5">
                          {ZODIAC_SIGNS.find(s => s.name === selectedHoroscopeSign)?.dates}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="bg-white/95 px-3 py-1.5 rounded-xl border border-amber-200 shadow-xs text-center min-w-[80px]">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Lucky No</span>
                        <span className="text-sm sm:text-base font-black text-amber-700">
                          {horoscopeData?.luckyNumber || '7'}
                        </span>
                      </div>
                      <div className="bg-white/95 px-3 py-1.5 rounded-xl border border-amber-200 shadow-xs text-center min-w-[90px]">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Lucky Color</span>
                        <span className="text-xs sm:text-sm font-bold text-slate-800 truncate block">
                          {horoscopeData?.luckyColor || 'Golden'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AI Prediction Content */}
                  {isHoroscopeLoading ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-3 bg-white/60 rounded-2xl border border-amber-200/50">
                      <div className="w-8 h-8 rounded-full border-3 border-amber-500 border-t-transparent animate-spin"></div>
                      <p className="text-xs sm:text-sm text-amber-800 font-medium">
                        Consulting Gemini AI Vedic Ephemeris for {selectedHoroscopeSign} ({horoscopeSignType} Sign)...
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white/95 border border-amber-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
                      {/* Section Title */}
                      <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-amber-100">
                        <span className="text-xs sm:text-sm font-bold text-amber-900 uppercase flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-600" />
                          <span>दैनिक संपूर्ण राशिफल फलकथन (Comprehensive Vedic Horoscope)</span>
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/70">
                          {selectedHoroscopeSign} • {horoscopeSignType === 'Moon' ? 'चंद्र फल' : 'सूर्य फल'}
                        </span>
                      </div>

                      {/* Comprehensive Horoscope Narrative (6 to 7 lines) */}
                      <div className="text-black text-xs sm:text-[14px] leading-relaxed space-y-2.5">
                        <p>
                          {horoscopeData?.comprehensive || horoscopeData?.fullHoroscope || (() => {
                            const isEn = currentLang === 'en';
                            if (isEn) {
                              const overview = horoscopeData?.overview || `Today brings progressive opportunities and balanced cosmic energy for ${selectedHoroscopeSign}.`;
                              const career = horoscopeData?.career ? `Career: ${horoscopeData.career}` : 'Career front looks promising with collaborative support from colleagues and superiors.';
                              const finance = horoscopeData?.finance ? `Finances: ${horoscopeData.finance}` : 'Financial matters remain steady; maintain prudent control over discretionary spending.';
                              const relationships = (horoscopeData?.love || horoscopeData?.marriage) ? `Relationships: ${horoscopeData.love || horoscopeData.marriage}` : 'Domestic life and personal relationships will experience warmth and mutual understanding.';
                              const health = horoscopeData?.health ? `Wellness: ${horoscopeData.health}` : 'Health is vibrant; regular hydration and timely rest keep your energy balanced.';
                              const advice = `Daily Guidance: Trust your inner wisdom and approach important decisions with measured calm.`;
                              return `${overview} ${career} ${finance} ${relationships} ${health} ${advice}`;
                            }

                            // Default Hindi / Indian localized fallback
                            const overview = horoscopeData?.overview || `आज ${selectedHoroscopeSign} राशि के जातकों के लिए ग्रहों की स्थिति एक सकारात्मक एवं ऊर्जावान वातावरण का निर्माण कर रही है।`;
                            const career = horoscopeData?.career ? `कार्यक्षेत्र में: ${horoscopeData.career}` : 'कार्यक्षेत्र में नए प्रोजेक्ट्स या जिम्मेदारियों के अवसर प्राप्त होंगे; सहकर्मियों का सहयोग आपके प्रयासों को गति देगा।';
                            const finance = horoscopeData?.finance ? `आर्थिक स्थिति: ${horoscopeData.finance}` : 'आर्थिक दृष्टिकोण से दिन संतुलित रहेगा, आय के नए स्रोत सामने आ सकते हैं किंतु गैर-जरूरी खर्चों पर नियंत्रण बनाए रखें।';
                            const relationships = (horoscopeData?.love || horoscopeData?.marriage) ? `पारिवारिक व प्रेम जीवन: ${horoscopeData.love || horoscopeData.marriage}` : 'पारिवारिक और दांपत्य जीवन में आपसी समझ और मधुरता बढ़ेगी, प्रियजनों के साथ बिताया समय मानसिक शांति देगा।';
                            const health = horoscopeData?.health ? `स्वास्थ्य एवं कल्याण: ${horoscopeData.health}` : 'स्वास्थ्य सामान्य रहेगा, पर्याप्त जलपान और नियमित दिनचर्या बनाए रखना आपकी ऊर्जा को संतुलित रखेगा।';
                            const advice = `आज का विशेष मार्गदर्शन: किसी भी महत्वपूर्ण निर्णय में जल्दबाजी न करें, अपने आत्मबल और सूझबूझ पर भरोसा रखें।`;

                            return `${overview} ${career} ${finance} ${relationships} ${health} ${advice}`;
                          })()}
                        </p>
                      </div>

                      {/* Mini Key Metrics Tags */}
                      <div className="mt-4 pt-3.5 border-t border-amber-100 flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="font-bold text-slate-700">प्रमुख ग्रह गोचर प्रभाव:</span>
                        <span className="bg-amber-100/70 text-amber-900 font-medium px-2.5 py-1 rounded-lg border border-amber-200">
                          💼 कार्य: {horoscopeData?.career ? 'अनुकूल' : 'प्रगतिशील'}
                        </span>
                        <span className="bg-emerald-50 text-emerald-800 font-medium px-2.5 py-1 rounded-lg border border-emerald-200">
                          💰 धन: {horoscopeData?.finance ? 'स्थिर' : 'वृद्धि योग'}
                        </span>
                        <span className="bg-rose-50 text-rose-800 font-medium px-2.5 py-1 rounded-lg border border-rose-200">
                          ❤️ संबंध: {horoscopeData?.love ? 'मधुर' : 'सद्भाव'}
                        </span>
                        <span className="bg-teal-50 text-teal-800 font-medium px-2.5 py-1 rounded-lg border border-teal-200">
                          🌿 स्वास्थ्य: {horoscopeData?.health ? 'सचेत' : 'उत्तम'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Action to Full Horoscope */}
                <div className="mt-5 pt-3.5 border-t border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs text-slate-500 font-medium">
                    दैनिक {horoscopeSignType === 'Moon' ? 'चंद्र' : 'सूर्य'} राशिफल विश्लेषण
                  </span>
                  <Link
                    to="/horoscope"
                    className="text-xs sm:text-sm font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1.5 transition underline underline-offset-4"
                  >
                    सम्पूर्ण 12 राशियों का विस्तृत राशिफल देखें ↗
                  </Link>
                </div>
              </div>

              {/* Right Side: Two Equal Sized Flex Cards Up & Down (30% width on desktop) */}
              <div className="w-full lg:w-[30%] flex flex-col sm:flex-row lg:flex-col gap-4">

                {/* 1st Flex Card: Talk To Astrologer (Cycles one astrologer every 5s from Astrologers page) */}
                {(() => {
                  const currentAstro = (availableAstrologers && availableAstrologers.length > 0)
                    ? availableAstrologers[talkAstroCardIndex % availableAstrologers.length]
                    : {
                      name: 'Acharya Ravi Sharma',
                      specialization: ['Vedic Astrology'],
                      profilePicture: '/images/consult-astrologer-sidebar.jpg'
                    };

                  // Fallback images array if astrologer has no profilePicture
                  const fallbackAstroImages = [
                    '/images/consult-astrologer-sidebar.jpg',
                    '/images/ai-astrologers/arjun_pandit.jpg',
                    '/images/ai-astrologers/mr_krishnamurthy.jpg',
                    '/images/ai-astrologers/swami_ji.jpg'
                  ];

                  const astroImageSrc = currentAstro?.profilePicture
                    ? buildAssetUrl(currentAstro.profilePicture)
                    : fallbackAstroImages[talkAstroCardIndex % fallbackAstroImages.length];

                  const astroSpecialty = Array.isArray(currentAstro?.specialization)
                    ? currentAstro.specialization.join(', ')
                    : (currentAstro?.specialization || 'Vedic Astrology');

                  return (
                    <Link
                      to="/astrologers"
                      className="flex-1 group relative rounded-3xl overflow-hidden shadow-xl border-2 border-amber-300/85 hover:border-amber-500 transition-all duration-300 bg-gradient-to-br from-amber-950 via-slate-900 to-black flex flex-col justify-between p-4 min-h-[220px] hover:shadow-2xl hover:scale-[1.01]"
                      title={`Talk To ${currentAstro?.name || 'Astrologer'}`}
                    >
                      <img
                        key={currentAstro?._id || talkAstroCardIndex}
                        src={astroImageSrc}
                        alt={currentAstro?.name || 'Talk To Astrologer'}
                        className="absolute inset-0 w-full h-full object-cover object-top opacity-75 group-hover:scale-105 group-hover:opacity-85 transition-all duration-700 animate-fadeIn"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = fallbackAstroImages[talkAstroCardIndex % fallbackAstroImages.length];
                        }}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent pointer-events-none"></div>

                      {/* Top Badge with Live Consultation & 5s rotation indicator */}
                      <div className="relative z-10 flex items-center justify-between">
                        <span className="text-[11px] font-bold bg-amber-500/90 text-slate-950 px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                          <PhoneCall className="w-3 h-3 fill-current" />
                          Live Consultation
                        </span>
                        <div className="flex items-center gap-1.5 bg-black/50 px-2 py-0.5 rounded-full border border-amber-400/30">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span className="text-[10px] text-emerald-300 font-semibold">Available</span>
                        </div>
                      </div>

                      {/* Bottom Content with Slogan and Astrologer Name */}
                      <div className="relative z-10">
                        <div className="mb-1 flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold text-amber-300 truncate">
                            {currentAstro?.name || 'Vedic Astrologer'}
                          </span>
                          <span className="text-[10px] text-slate-300 truncate max-w-[110px]">
                            • {astroSpecialty}
                          </span>
                        </div>

                        <h4 className="text-xl sm:text-2xl font-serif font-black text-white tracking-wide drop-shadow-md mb-1">
                          Talk To Astrologer
                        </h4>
                        <p className="text-xs text-amber-200/90 font-medium mb-3 line-clamp-1">
                          Connect instantly with India&apos;s verified Vedic masters
                        </p>
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 px-3.5 py-1.5 rounded-xl shadow-md group-hover:from-amber-300 group-hover:to-yellow-300 transition-colors">
                          <span>Call Now</span>
                          <span>→</span>
                        </div>
                      </div>
                    </Link>
                  );
                })()}

                {/* 2nd Flex Card: 100 pages Detailed Kundali Report */}
                <Link
                  to="/kundali"
                  className="flex-1 group relative rounded-3xl overflow-hidden shadow-xl border-2 border-amber-300/85 hover:border-amber-500 transition-all duration-300 bg-gradient-to-br from-[#2a1309] via-slate-900 to-black flex flex-col justify-between p-4 min-h-[220px] hover:shadow-2xl hover:scale-[1.01]"
                  title="Your 100 pages Detailed Kundali Report"
                >
                  <img
                    src="/images/report.png"
                    alt="Your 100 pages Detailed Kundali Report"
                    className="absolute inset-0 w-full h-full object-cover object-center opacity-70 group-hover:scale-105 group-hover:opacity-80 transition-all duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none"></div>

                  {/* Top Badge */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[11px] font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-200" />
                      Brihat Vedic Patrika
                    </span>
                    <span className="text-[10px] font-bold text-amber-300 bg-black/60 px-2 py-0.5 rounded-md border border-amber-400/30">
                      100+ Pages
                    </span>
                  </div>

                  {/* Bottom Content with Slogan */}
                  <div className="relative z-10">
                    <h4 className="text-lg sm:text-xl font-serif font-black text-amber-100 tracking-wide drop-shadow-md mb-1 leading-snug">
                      Your 100 pages Detailed Kundali Report
                    </h4>
                    <p className="text-xs text-amber-200/90 font-medium mb-3 line-clamp-1">
                      Complete Dasha, Transit & Life Predictions
                    </p>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 px-3.5 py-1.5 rounded-xl shadow-md group-hover:from-amber-300 group-hover:to-yellow-300 transition-colors">
                      <span>Get Kundali</span>
                      <span>→</span>
                    </div>
                  </div>
                </Link>

              </div>
            </div>
          </div>
        </section>

        {/* Hindi Banner */}
        <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="relative bg-gradient-to-r from-amber-50 via-orange-50 to-pink-50 border border-amber-300/80 rounded-2xl px-6 py-4 shadow-sm overflow-hidden">
              <div className="relative z-10 flex items-center justify-center">
                <p className="text-center text-lg md:text-xl font-bold text-slate-900">
                  ग्रहों की बदलती चाल का आपके जीवन पर क्या असर होगा, यह जानने के लिए संपर्क करें
                </p>
              </div>
            </div>
          </div>
        </section>

        <div
          className="absolute inset-0 -z-10 bg-white transition-all duration-700"
          style={heroBackgroundStyle}
        />
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-30">
          <div className="absolute top-10 -left-10 w-72 h-72 bg-amber-200/50 blur-[140px]" />
          <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-purple-200/40 blur-[220px]" />
        </div>

        <main className="relative z-10 px-4 sm:px-6 lg:px-8 pt-16 pb-20 space-y-20">
          {/* Hero Content Flexbox with Overlay */}
          <section className="relative max-w-6xl mx-auto">
            <div className="relative bg-white border border-slate-200 rounded-3xl p-8 lg:p-12 shadow-xl shadow-slate-100 overflow-hidden">
              <div className="relative z-10 grid lg:grid-cols-12 gap-12">
                <div className="lg:col-span-6 space-y-8">
                  <div className="relative w-full overflow-hidden rounded-3xl border border-slate-200 shadow-md mb-6 h-70">
                    {heroMediaItems[heroMediaIndex]?.type === 'video' ? (
                      <video
                        key={heroMediaItems[heroMediaIndex].src}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      >
                        <source src={heroMediaItems[heroMediaIndex].src} type="video/mp4" />
                      </video>
                    ) : (
                      <img
                        key={heroMediaItems[heroMediaIndex]?.src}
                        src={heroMediaItems[heroMediaIndex]?.src}
                        alt="Hero rotating media"
                        className="w-full h-full object-cover animate-fadeIn"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
                  </div>

                  <div className="inline-flex items-center space-x-3 bg-amber-50 border border-amber-200 rounded-full px-5 py-2">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    <span className="text-xs uppercase tracking-[0.4em] text-amber-800 font-bold">
                      {t('Inspired by Experienced Astrologers')}
                    </span>
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-slate-900">
                    {t("India's most trusted")}{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600">
                      {t('astrology super-app')}
                    </span>
                  </h1>
                  <p className="text-lg text-slate-700 max-w-2xl font-normal leading-relaxed">
                    {t('Free Kundli, horoscope engine, Panchang, Muhurat, AI-powered predictions, and instant access to senior astrologers—crafted with the same depth you love on AstroSage, reimagined for 2025.')}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      to="/kundali"
                      className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold shadow-md hover:shadow-lg transition"
                    >
                      {t('Generate Free Kundli')}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                    <Link
                      to="/astrologers"
                      className="inline-flex items-center px-6 py-3 rounded-full border border-slate-300 text-slate-900 font-bold hover:bg-slate-100 transition"
                    >
                      {t('Talk to Astrologer')}
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {trustBadges.map(({ label, icon: Icon }) => (
                      <div key={label} className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 shadow-xs">
                        <Icon className="h-5 w-5 text-amber-500 mb-2" />
                        <p className="text-xs text-slate-700 font-semibold">{t(label)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-6 space-y-5">
                  <div id="live-astrologers" className="bg-white border border-slate-200 rounded-3xl p-4 lg:p-5 shadow-lg shadow-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.5em] text-emerald-700 font-bold mb-1">{t('Available Now')}</p>
                        <h3 className="text-xl font-extrabold text-slate-900">{t('Live Astrologers')}</h3>
                      </div>
                      <div className="flex items-center text-emerald-700 text-xs font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                        {isAstrologerLoading ? 'Checking...' : `${availableAstrologers.length} online`}
                      </div>
                    </div>
                    <div className="relative group">
                      {isAstrologerLoading ? (
                        <div className="flex gap-3">
                          {[...Array(4)].map((_, idx) => (
                            <div key={idx} className="flex-1 min-w-[120px] h-32 bg-slate-100 rounded-2xl animate-pulse" />
                          ))}
                        </div>
                      ) : availableAstrologers.length === 0 ? (
                        <p className="text-xs text-slate-500 px-2">No astrologers are online right now. Please check back soon.</p>
                      ) : (
                        <div className="relative">
                          {/* Navigation Buttons */}
                          <button
                            onClick={() => {
                              if (scrollContainerRef.current) {
                                scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
                              }
                            }}
                            className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-50 shadow-md"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>

                          <button
                            onClick={() => {
                              if (scrollContainerRef.current) {
                                scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
                              }
                            }}
                            className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-50 shadow-md"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>

                          <div
                            ref={scrollContainerRef}
                            className="flex flex-nowrap gap-3 overflow-x-auto scrollbar-hide pb-1 scroll-smooth"
                          >
                            {availableAstrologers.map((astrologer, index) => {
                              const rawImage =
                                astrologer.profilePicture ||
                                astrologer.image ||
                                astrologer.imageUrl ||
                                astrologer.photo;
                              const imageSrc = rawImage ? buildAssetUrl(rawImage) : null;
                              const subtitle = astrologer.languages?.length
                                ? astrologer.languages.slice(0, 2).join(', ')
                                : astrologer.specialization?.[0] || 'Vedic Expert';

                              return (
                                <Link
                                  key={`${astrologer._id || astrologer.name}-${index}`}
                                  to={astrologer.isLive ? `/live/${astrologer._id}` : "/booking"}
                                  className={`flex-1 min-w-[115px] max-w-[135px] bg-slate-50 border ${astrologer.isLive ? 'border-red-500/50 hover:border-red-500' : 'border-slate-200 hover:border-amber-400'} rounded-2xl p-2.5 flex flex-col items-center text-center text-slate-900 hover:bg-white transition-all duration-200 shadow-xs`}
                                >
                                  <div className={`relative w-20 h-20 rounded-2xl overflow-hidden border ${astrologer.isLive ? 'border-red-500' : 'border-slate-200'} mb-2`}>
                                    {imageSrc ? (
                                      <img
                                        src={imageSrc}
                                        alt={astrologer.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-amber-400/70 to-pink-500/70 flex items-center justify-center text-xl font-bold text-slate-900">
                                        {astrologer.name?.charAt(0) || 'A'}
                                      </div>
                                    )}
                                    {astrologer.isLive ? (
                                      <div className="absolute bottom-0 inset-x-0 bg-red-600 text-white text-[9px] font-bold py-0.5 text-center uppercase tracking-widest flex items-center justify-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                                        LIVE
                                      </div>
                                    ) : (
                                      <span className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-xs"></span>
                                    )}
                                  </div>
                                  <p className="text-sm font-bold leading-tight truncate w-full text-slate-900">{cleanAstrologerName(astrologer.name)}</p>
                                  <p className="text-[11px] font-semibold text-slate-700 truncate w-full">₹{astrologer.pricing || 16}/min</p>

                                  {astrologer.isLive ? (
                                    <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 border border-red-300 text-[11px] font-bold whitespace-nowrap">
                                      <Video className="h-3.5 w-3.5" />
                                      Join Stream
                                    </div>
                                  ) : (
                                    <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold whitespace-nowrap">
                                      <MessageCircle className="h-3.5 w-3.5" />
                                      Chat Now
                                    </div>
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-lg shadow-slate-100">
                    <h3 className="text-2xl font-extrabold text-slate-900 mb-2">{t('Quick Kundli Preview')}</h3>
                    <p className="text-sm text-slate-600 mb-6">{t('Get AI + Vedic insights before your consult begins.')}</p>
                    <form onSubmit={handleQuickPreviewSubmit} className="space-y-4">
                      <input
                        name="name"
                        value={quickKundaliData.name}
                        onChange={handleQuickPreviewChange}
                        className="w-full rounded-2xl bg-slate-50 border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/60 transition"
                        placeholder={t('Full Name (पूरा नाम)')}
                        required
                      />
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={quickKundaliData.dateOfBirth}
                        onChange={handleQuickPreviewChange}
                        className="w-full rounded-2xl bg-slate-50 border border-slate-300 px-4 py-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/60 transition"
                        required
                      />

                      <button
                        type="submit"
                        className="w-full rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold py-3 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer"
                      >
                        {t('Preview Chart')}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      <p className="text-xs text-slate-500">
                        By generating a Kundli you agree to our privacy policy and consent to receive important notifications.
                      </p>
                    </form>
                  </div>

                  <Link
                    to="/shop"
                    className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm overflow-hidden flex flex-col items-center cursor-pointer hover:border-amber-400 hover:shadow-md transition-all duration-300 block"
                  >
                    <img
                      src={braceletImages[currentBraceletIndex]}
                      alt="Inspired Astrology Bracelet"
                      className="w-full h-auto max-h-[250px] object-cover rounded-2xl transition-transform duration-300 hover:scale-[1.02]"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className="max-w-6xl mx-auto grid lg:grid-cols-4 gap-6">
            {quickActions.map(({ title, description, action, link, icon: Icon, accent, isExternal }) => (
              <div key={title} className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition">
                <div>
                  <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-r ${accent} text-slate-950 mb-4 shadow-xs`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{t(title)}</h3>
                  <p className="text-sm text-slate-600 mt-2">{description}</p>
                </div>
                {isExternal ? (
                  <a href={link} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center text-amber-600 hover:text-amber-700 text-sm font-bold">
                    {t(action)}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </a>
                ) : (
                  <Link to={link} className="mt-6 inline-flex items-center text-amber-600 hover:text-amber-700 text-sm font-bold">
                    {t(action)}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                )}
              </div>
            ))}
          </section>

          <section className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500 font-bold">{t('Highlights')}</p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2">{t('Built for modern seekers')}</h2>
              </div>
              <Link to="/astrologers" className="inline-flex items-center text-amber-600 hover:text-amber-700 text-sm font-bold">
                {t('Explore experts')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {astroHighlights.map(({ title, description, icon: Icon }) => (
                <div key={title} className="bg-white border border-slate-200 rounded-3xl p-6 flex gap-4 shadow-sm hover:shadow-md transition">
                  <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                    <Icon className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{t(title)}</h3>
                    <p className="text-sm text-slate-600 mt-2">{t(description)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Hindi Banner - Horoscope */}
          <section className="max-w-6xl mx-auto">
            <div className="relative bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200 rounded-2xl px-6 py-4 shadow-sm overflow-hidden">
              <div className="relative z-10 flex items-center justify-center">
                <p className="text-center text-lg md:text-xl font-bold text-slate-900">
                  {t('आज का राशिफल: जानिए कैसा रहेगा आपका आज का दिन सितारों की नज़र में।')}
                </p>
              </div>
            </div>
          </section>

          <section className="max-w-6xl mx-auto bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-amber-600 font-bold">{t('Horoscopes')}</p>
                <h2 className="text-3xl font-extrabold text-slate-900">{t('All zodiac insights, updated hourly')}</h2>
              </div>
              <Link to="/kundali" className="inline-flex items-center text-amber-600 hover:text-amber-700 text-sm font-bold">
                {t('View all horoscopes')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {horoscopeCategories.map((category) => (
                <div key={category} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 hover:bg-white hover:border-amber-300 transition">
                  <p className="font-bold text-slate-900">{t(category)}</p>
                  <p className="text-xs text-slate-500 mt-2">{t('Aries to Pisces • live updates')}</p>
                </div>
              ))}
            </div>
          </section>


          <section className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
            <div className="rounded-[32px] bg-slate-50 border border-slate-200 p-8 space-y-4 shadow-sm">
              {/* Askarsan Yantra Image */}
              <Link
                to="/shop"
                className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md block cursor-pointer group"
              >
                <img
                  src="/yantra/Askarsan%20Yantra.jpg"
                  alt="Askarsan Yantra"
                  className="w-full h-70 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 flex justify-between items-end">
                  <span className="text-sm md:text-base font-bold text-white uppercase tracking-wider px-3 py-1 rounded-lg">
                    {t('Askarsan Yantra (FOR MORE YANTRA CLICK ON IMAGE)')}
                  </span>
                </div>
              </Link>
              <p className="text-xs uppercase tracking-[0.4em] text-purple-700 font-bold">{t('Consultations')}</p>
              <h2 className="text-3xl font-extrabold text-slate-900">{t("Talk to India's leading astrologers 24/7")}</h2>
              <p className="text-slate-700">
                {t('Choose from 500+ vetted professionals specializing in marriage, career, finance, abroad settlement, and more.')}
              </p>
              {[
                'Instant chat/call with queue times under 60 seconds.',
                'Video consults with screen-shared Kundli insights.',
                'Detailed remedies shared in your dashboard.'
              ].map((point) => (
                <div key={point} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>{t(point)}</span>
                </div>
              ))}
              <div className="flex flex-wrap gap-3 pt-4">
                <Link to="/astrologers" className="inline-flex items-center rounded-full bg-slate-900 text-white hover:bg-black px-5 py-2 font-bold shadow-sm">
                  {t('Browse Experts')}
                </Link>
                <Link
                  to="/booking"
                  className="inline-flex items-center rounded-full border border-slate-300 px-5 py-2 text-slate-900 font-bold hover:bg-slate-100 transition"
                >
                  {t('Schedule later')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </div>
            </div>

            <div className="grid gap-6">
              {toolCards.map(({ title, description, icon: Icon }) => (
                <div key={title} className="rounded-[28px] bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
                  <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-3">{t(title)}</h3>
                  <p className="text-sm text-slate-600 mt-2">{t(description)}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
            <div className="rounded-[32px] bg-white border border-slate-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-purple-700 font-bold">{t('Knowledge hub')}</p>
                  <h2 className="text-3xl font-extrabold text-slate-900 mt-2">{t('Latest from our astrologers')}</h2>
                </div>
                <Link to="/community-videos" className="text-sm text-amber-600 hover:text-amber-700 font-bold flex items-center">
                  {t('Watch learning room')}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              <div className="space-y-4">
                {knowledgeCards.map(({ tag, title }) => (
                  <div key={title} className="border border-slate-200 rounded-2xl p-5 hover:bg-slate-50 transition-colors">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold">{t(tag)}</p>
                    <h3 className="text-lg font-bold text-slate-900 mt-2">{t(title)}</h3>
                    <button className="mt-4 flex items-center text-sm text-amber-600 hover:text-amber-700 font-bold">
                      {t('Continue reading')}
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] bg-slate-50 border border-slate-200 p-8 space-y-4 shadow-sm">
              {/* Rudrakash Image */}
              <div className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md">
                <img
                  src="/images/Rudrakash.png"
                  alt="Rudraksha"
                  className="w-full h-70 object-cover"
                />
              </div>
              <p className="text-xs uppercase tracking-[0.4em] text-amber-700 font-bold">{t('Astro shop')}</p>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-2">{t('Sacred store curated by experts')}</h2>
              <p className="text-slate-700 mt-4">
                {t('Everything is energized, documented, and shipped worldwide.')}
              </p>
              <div className="mt-6 space-y-4">
                {shopCards.map(({ title, description }) => (
                  <div key={title} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                    <h3 className="text-lg font-bold text-slate-900">{t(title)}</h3>
                    <p className="text-sm text-slate-600 mt-1">{t(description)}</p>
                  </div>
                ))}
              </div>
              <Link
                to="/shop"
                className="mt-6 inline-flex items-center rounded-full bg-slate-900 text-white hover:bg-black px-5 py-2 font-bold shadow-sm"
              >
                {t('Explore store')}
                <ShoppingBag className="h-4 w-4 ml-2" />
              </Link>
            </div>
          </section>

          <section className="max-w-6xl mx-auto rounded-[32px] bg-white border border-slate-200 p-8 grid lg:grid-cols-2 gap-10 shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500 font-bold">{t('Testimonials')}</p>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-2">{t('Loved by seekers worldwide')}</h2>
              <p className="text-slate-600 mt-4">
                {t('Real humans, verified consults, transparent reviews. We keep rotating fresh stories automatically.')}
              </p>
              <div className="mt-8 space-y-3">
                {testimonialsSeed.map((item, idx) => (
                  <button
                    key={item.name}
                    className={`w-full text-left rounded-2xl px-4 py-3 border transition-colors ${idx === currentTestimonial ? 'border-amber-400 bg-amber-50/60 font-bold text-slate-900' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    onClick={() => setCurrentTestimonial(idx)}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-bold text-xl shadow-xs">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">{testimonial.name}</p>
                  <p className="text-sm text-slate-500">{testimonial.location}</p>
                </div>
              </div>
              <p className="mt-6 text-lg text-slate-800 italic">&ldquo;{t(testimonial.text)}&rdquo;</p>
              <div className="mt-6 flex items-center text-amber-500">
                {[...Array(5)].map((_, idx) => (
                  <Star key={idx} className="h-5 w-5 fill-current" />
                ))}
              </div>
            </div>
          </section>

          <section className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
            <div className="rounded-[32px] bg-white border border-slate-200 p-8 shadow-sm">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500 font-bold">{t('FAQs')}</p>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-2">{t('Everything you need to know')}</h2>
              <div className="mt-6 space-y-3">
                {faqItems.map((faq) => (
                  <details key={faq.question} className="group border border-slate-200 rounded-2xl">
                    <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-lg font-bold text-slate-900">
                      <span>{t(faq.question)}</span>
                      <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180 text-slate-500" />
                    </summary>
                    <p className="px-4 pb-4 text-sm text-slate-600">{t(faq.answer)}</p>
                  </details>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 border border-amber-200 p-8 flex flex-col justify-between shadow-sm">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-amber-700 font-bold">{t('Download soon')}</p>
                <h2 className="text-3xl font-extrabold text-slate-900 mt-2">{t('AstroConsult app')}</h2>
                <p className="text-slate-700 mt-4">
                  {t('Mirror the AstroSage mobile experience with offline mode, personalized alerts, and one-tap remedies. Launching Q1 2025.')}
                </p>
              </div>
              <div className="mt-6 flex gap-3">
                <button className="flex-1 rounded-2xl bg-slate-900 hover:bg-black text-white px-4 py-3 font-bold shadow-sm">
                  {t('Join waitlist')}
                </button>
                <button className="flex-1 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-3 text-slate-900 font-semibold shadow-xs">
                  {t('Get SMS alert')}
                </button>
              </div>
            </div>
          </section>

          <section className="max-w-6xl mx-auto rounded-[40px] bg-white border border-slate-200 shadow-xl text-slate-900 p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500 font-bold">{t('Ready?')}</p>
              <h2 className="text-4xl font-black mt-3 text-slate-900">
                {t('Bring Brihat Prashar Shastra-level depth into your journey')}
              </h2>
              <p className="text-base text-slate-600 mt-4">
                {t('Free forever Kundli, premium consultations, secure remedies, modern UI.')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              {isAuthenticated ? (
                <Link
                  to="/book-appointment"
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 hover:bg-black text-white px-8 py-3 font-bold shadow-md"
                >
                  {t('Continue consultation')}
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center rounded-full bg-slate-900 hover:bg-black text-white px-8 py-3 font-bold shadow-md"
                  >
                    {t('Create free account')}
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 hover:bg-slate-50 px-8 py-3 font-bold text-slate-900"
                  >
                    {t('Sign in')}
                  </Link>
                </>
              )}
            </div>
          </section>
        </main >
      </div >

      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-visible text-slate-900 animate-in fade-in zoom-in-95 duration-200 cursor-default"
          >
            {/* Top yellow header */}
            <div className="bg-gradient-to-b from-amber-400 to-yellow-500 rounded-t-3xl pt-14 pb-6 px-6 relative text-center">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-white hover:text-amber-100 transition-colors bg-black/25 hover:bg-black/40 p-1.5 rounded-full cursor-pointer z-10"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Overlapping Ganesha Image Circle */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border-4 border-amber-400 bg-white overflow-hidden shadow-lg flex items-center justify-center">
                <img
                  src="/images/ganeshji.jpg"
                  alt="Lord Ganesha"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/AstroIcon.jpg";
                  }}
                />
              </div>
            </div>

            {/* White Body Content */}
            <div className="px-6 pb-8 pt-6 text-center flex flex-col items-center">
              {/* Main Slogan text */}
              <p className="text-lg md:text-xl font-bold text-amber-600 leading-relaxed mb-6">
                {modalLine}
              </p>

              {/* Astrologers Section */}
              <div className="w-full border-t border-slate-100 pt-4 mb-6">
                <div className="flex justify-center items-start gap-3 mb-3">
                  {modalAstrologers.map((astrologer, idx) => {
                    const rawImage =
                      astrologer.profilePicture ||
                      astrologer.image ||
                      astrologer.imageUrl ||
                      astrologer.photo;
                    const imageSrc = rawImage ? buildAssetUrl(rawImage) : null;
                    return (
                      <div
                        key={`${astrologer._id || astrologer.name}-${modalAstrologerIndex}-${idx}`}
                        className="flex flex-col items-center w-20 transition-all duration-500 animate-fadeIn"
                      >
                        <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full border-2 border-amber-300 overflow-hidden bg-slate-100 shadow-md">
                          {imageSrc ? (
                            <img src={imageSrc} alt={astrologer.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-amber-400 to-pink-500 flex items-center justify-center text-slate-900 font-bold text-2xl">
                              {astrologer.name?.charAt(0) || 'A'}
                            </div>
                          )}
                          <span className="absolute bottom-0 right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white shadow-sm"></span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-800 mt-1.5 truncate w-full text-center">
                          {astrologer.name}
                        </p>
                      </div>
                    );
                  })}
                  {modalAstrologers.length === 0 && (
                    <>
                      <div className="relative w-20 h-20 rounded-full border-2 border-amber-300 overflow-hidden bg-slate-100 shadow-md flex items-center justify-center font-bold text-2xl text-slate-600">
                        A
                        <span className="absolute bottom-0 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white shadow-sm"></span>
                      </div>
                      <div className="relative w-20 h-20 rounded-full border-2 border-amber-300 overflow-hidden bg-slate-100 shadow-md flex items-center justify-center font-bold text-2xl text-slate-600">
                        B
                        <span className="absolute bottom-0 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white shadow-sm"></span>
                      </div>
                      <div className="relative w-20 h-20 rounded-full border-2 border-amber-300 overflow-hidden bg-slate-100 shadow-md flex items-center justify-center font-bold text-2xl text-slate-600">
                        C
                        <span className="absolute bottom-0 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white shadow-sm"></span>
                      </div>
                    </>
                  )}
                </div>
                <h4 className="text-sm font-extrabold text-slate-700 tracking-wide uppercase">
                  Consult Expert Astrologers
                </h4>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 w-full">
                <Link
                  to="/live-astrologers"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-center text-sm shadow-md transition-all active:scale-[0.98]"
                >
                  Live Astrologers
                </Link>
                <Link
                  to="/live-chat"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-center text-sm shadow-md transition-all active:scale-[0.98]"
                >
                  Chat Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div >
  );
};

export default Home;

