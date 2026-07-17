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
  Users,
  X
} from 'lucide-react';
import Navigation from '../components/Navigation';
import { useAuth } from '../context/AuthContext';
import { adminAPI, authAPI, buildAssetUrl, VEDIC_ASTROLOGY_BASE_URL } from '../services/api';

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
    link: '/daily-horoscope',
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
  }
];

const heroShortcutItems = [
  {
    label: 'Dainik Paanchang',
    path: `${VEDIC_ASTROLOGY_BASE_URL}/?panchang=true`,
    accent: 'from-amber-400 to-yellow-500',
    isExternal: true
  },
  {
    label: 'Monthly Prediction',
    path: '/booking',
    accent: 'from-purple-400 to-pink-500'
  },
  {
    label: 'Weekly Prediction',
    path: '/booking',
    accent: 'from-blue-400 to-indigo-500'
  },
  {
    label: 'Rahu Dosh',
    path: '/booking',
    accent: 'from-emerald-400 to-teal-500'
  },
  {
    label: 'Ketu Dosh',
    path: '/booking',
    accent: 'from-rose-400 to-orange-500'
  },
  {
    label: 'Pitra Dosh',
    path: '/booking',
    accent: 'from-green-400 to-teal-500',
  }
];

const exploreServices = [
  { name: 'Home', path: '/', icon: HomeIcon, color: 'from-yellow-400 to-orange-500' },
  { name: 'About Us', path: '/about', icon: Info, color: 'from-blue-400 to-cyan-500' },
  { name: 'Astrologers', path: '/astrologers', icon: Users, color: 'from-purple-400 to-pink-500' },
  { name: 'Booking', path: '/booking', icon: CalendarClock, color: 'from-green-400 to-emerald-500' },
  { name: 'Kundali', path: '/kundali', icon: ScrollText, color: 'from-amber-400 to-yellow-500' },
  { name: 'Kundali Matching', path: `${VEDIC_ASTROLOGY_BASE_URL}/?matchmaking=true`, icon: HeartHandshake, color: 'from-pink-400 to-rose-500', isExternal: true },
  { name: 'Love Calculator', path: `${VEDIC_ASTROLOGY_BASE_URL}/?compatibility-hub=true`, icon: Heart, color: 'from-red-400 to-rose-500', isExternal: true },
  { name: 'Advanced Muhurt', path: `${VEDIC_ASTROLOGY_BASE_URL}/?advanced_muhurt=true`, icon: Calendar, color: 'from-orange-400 to-amber-500', isExternal: true },
  { name: 'Ask Prashna', path: `${VEDIC_ASTROLOGY_BASE_URL}/?prashna=true`, icon: MessageCircle, color: 'from-purple-400 to-indigo-500', isExternal: true },
  { name: 'Ashtamangala Prasna', path: `${VEDIC_ASTROLOGY_BASE_URL}/?ashtamangala=true`, icon: Sparkles, color: 'from-amber-500 to-red-500', isExternal: true },
  { name: 'KP Astrology', path: `${VEDIC_ASTROLOGY_BASE_URL}/?kp_astrology=true`, icon: Globe, color: 'from-blue-400 to-indigo-500', isExternal: true },
  { name: 'Nadi Astrology', path: `${VEDIC_ASTROLOGY_BASE_URL}/?nadi=true`, icon: ScrollText, color: 'from-amber-400 to-orange-500', isExternal: true },
  { name: 'Japa Mala (Mantras)', path: `${VEDIC_ASTROLOGY_BASE_URL}/?mantra=true`, icon: Sparkles, color: 'from-pink-500 to-rose-600', isExternal: true },
  { name: 'Brahma Muhurt', path: `${VEDIC_ASTROLOGY_BASE_URL}/?brahma_muhurt=true`, icon: Sun, color: 'from-amber-400 to-orange-500', isExternal: true },
  { name: 'Daily Calendar', path: `${VEDIC_ASTROLOGY_BASE_URL}/?panchang=true`, icon: CalendarDays, color: 'from-indigo-400 to-purple-500', isExternal: true },
  { name: 'Monthly Calendar', path: `${VEDIC_ASTROLOGY_BASE_URL}/?monthly_panchang=true`, icon: Calendar, color: 'from-blue-400 to-indigo-500', isExternal: true },
  { name: 'Adv. Nakshatra', path: `${VEDIC_ASTROLOGY_BASE_URL}/?advanced_nakshatra=true&only_planetary=true`, icon: Star, color: 'from-amber-400 to-yellow-500', isExternal: true },
  { name: 'Lal Kitab', path: '/lal-kitab', icon: BookOpen, color: 'from-red-400 to-orange-500' },
  { name: 'Numerology', path: '/numerology', icon: Calculator, color: 'from-teal-400 to-cyan-500' },
  { name: 'Palmistry', path: '/palmistry', icon: Hand, color: 'from-fuchsia-400 to-purple-500' },
  { name: 'Vastu Shastra', path: '/vastu-shastra', icon: Building2, color: 'from-orange-400 to-amber-500' },
  { name: 'Zodiac Signs', path: '/zodiac', icon: MoonStar, color: 'from-violet-400 to-purple-500' },
  { name: 'Videos', path: '/community-videos', icon: PlayCircle, color: 'from-blue-500 to-indigo-500' },
  { name: 'Contact Us', path: '/contact', icon: PhoneCall, color: 'from-gray-400 to-slate-500' },
  { name: 'Shop', path: '/shop', icon: ShoppingBag, color: 'from-amber-400 to-rose-500' },
  { name: 'Live Chat', path: '/live-chat', icon: MessageCircle, color: 'from-blue-400 to-indigo-500' }
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
    name: 'Jason Patel',
    text: 'Loved the AI preview summarizing my next 6 months. The astrologer built on it which saved a ton of time.',
    location: 'Toronto, Canada'
  },
  {
    name: 'Ritika Sharma',
    text: 'Panchang, Muhurat and gemstone suggestions feel tailored. Premium yet intuitive.',
    location: 'Delhi, India'
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
  'सावन में राशि के अनुसार पूजा कैसे करे',
  'सावन में प्रतिदिन पूजा कैसे करे',
  'सितारों के राज खोलें!',
  'ब्रह्मांड के संकेत पहचानें!',
  'भविष्य की राह चुनें!',
  'अपनी किस्मत आज बदलें',
  'ग्रहों की चाल जानें!',
  'भाग्य का सटीक दर्पण!'
];

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [availableAstrologers, setAvailableAstrologers] = useState([]);
  const [isAstrologerLoading, setIsAstrologerLoading] = useState(true);
  const scrollContainerRef = useRef(null);
  const heroShortcutRef = useRef(null);
  const [heroShortcutHeight, setHeroShortcutHeight] = useState(60);
  const heroVideoRef = useRef(null);
  const [heroVideoHeight, setHeroVideoHeight] = useState(400);
  const navigate = useNavigate();
  const [quickKundaliData, setQuickKundaliData] = useState({
    name: '',
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: ''
  });
  const [sloganIndex, setSloganIndex] = useState(0);
  const [activeSideAnimation, setActiveSideAnimation] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalLine, setModalLine] = useState('');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videos = useMemo(() => ['/images/sawan.mp4', '/images/home2.mp4'], []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev === 0 ? 1 : 0));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

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

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSideAnimation((prev) => (prev === 0 ? 1 : 0));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleQuickPreviewChange = (e) => {
    setQuickKundaliData({
      ...quickKundaliData,
      [e.target.name]: e.target.value
    });
  };

  const handleQuickPreviewSubmit = (e) => {
    e.preventDefault();
    // Navigate to Kundali page with data as state
    navigate('/kundali', { state: { quickPreviewData: quickKundaliData } });
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
      () => setSloganIndex((prev) => (prev + 2) % consultationSlogans.length),
      5000
    );
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadAvailableAstrologers = async () => {
      try {
        setIsAstrologerLoading(true);
        const response = await authAPI.getAstrologers();
        const available = (response.data?.astrologers || []).filter(
          (astrologer) => astrologer.isAvailable !== false
        );
        setAvailableAstrologers(available);
      } catch (err) {
        console.error('Failed to fetch available astrologers', err);
        setAvailableAstrologers([]);
      } finally {
        setIsAstrologerLoading(false);
      }
    };

    loadAvailableAstrologers();
  }, []);



  const heroBackgroundStyle = useMemo(() => {
    if (!backgroundImage) {
      return {
        backgroundImage: 'linear-gradient(135deg, #020617 0%, #0f172a 45%, #1e1b4b 100%)'
      };
    }

    return {
      backgroundImage: `linear-gradient(135deg, rgba(2,6,23,0.9), rgba(15,23,42,0.85)), url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  }, [backgroundImage]);



  const testimonial = testimonialsSeed[currentTestimonial];

  return (
    <div
      className="min-h-screen text-white relative overflow-x-hidden bg-slate-950"
      style={{
        backgroundImage: "linear-gradient(135deg, rgba(2, 8, 32, 0.85), rgba(6, 3, 20, 0.8)), url('/images/wed.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >
      <Navigation />

      <div className="pt-0">
        {/* Fixed Hero Shortcut Flexbox */}
        <div
          ref={heroShortcutRef}
          className="fixed top-[64px] left-0 right-0 z-40 px-3 sm:px-4 lg:px-5 pointer-events-none"
        >
          <section className="w-full max-w-5xl mx-auto bg-white/5 border border-white/10 rounded-2xl px-3 py-2.5 backdrop-blur-md shadow-md shadow-black/20 pointer-events-auto">
            <div className="flex flex-nowrap items-center gap-2 overflow-x-auto scrollbar-hide">
              {heroShortcutItems.map((item) => {
                if (item.isExternal) {
                  return (
                    <a
                      key={item.label}
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-center px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r ${item.accent} text-slate-950 whitespace-nowrap shadow-sm shadow-black/30 hover:opacity-90 transition`}
                    >
                      {item.label}
                    </a>
                  );
                }
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`flex items-center justify-center px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r ${item.accent} text-slate-950 whitespace-nowrap shadow-sm shadow-black/30 hover:opacity-90 transition`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
        {/* Spacer to account for fixed flexbox height (64px nav + dynamic flexbox height) - no gap */}
        <div style={{ height: `${64 + heroShortcutHeight}px` }} />

        {/* Hero Video Section - Animation starts from bottom of flexbox */}
        <div className="pt-0">
          <section
            ref={heroVideoRef}
            className="relative w-full overflow-hidden py-0 flex items-end justify-center"
            style={{
              minHeight: '280px',
              marginTop: 0,
              animation: 'slideUpFromBottom 0.8s ease-out forwards',
              animationDelay: '0.1s',
              opacity: 0
            }}
          >
            <div className="relative flex flex-col lg:flex-row w-full max-w-6xl mx-auto px-2 gap-2 items-start -translate-x-.5 lg:-translate-x-14">
              <div className="relative w-full lg:flex-[1.9]">
                <div className="relative w-full">
                  <video
                    key={currentVideoIndex}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full rounded-2xl object-cover shadow-2xl"
                    style={{ height: '280px', objectFit: 'cover' }}
                  >
                    <source src={videos[currentVideoIndex]} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-950/0 via-slate-950/20 to-slate-950/60 pointer-events-none rounded-2xl" />
                </div>
              </div>

              {/* Consultation Card */}
              <div className="relative w-full lg:flex-[1.2] flex items-center justify-center">
                <div className="relative w-full bg-gradient-to-br from-amber-500/20 via-purple-500/20 to-pink-500/20 border border-white/20 rounded-2xl p-6 backdrop-blur-xl shadow-2xl shadow-black/30">
                  <div className="text-center space-y-4">
                    <h3 className="text-xl md:text-2xl font-bold text-white leading-tight min-h-[5rem] flex items-center justify-center animate-fadeIn">
                      {consultationSlogans[sloganIndex]}
                    </h3>
                    <h3 className="text-xl md:text-2xl font-bold text-white leading-tight min-h-[3rem] flex items-center justify-center animate-fadeIn">
                      {consultationSlogans[(sloganIndex + 1) % consultationSlogans.length]}
                    </h3>
                    <Link
                      to="/booking"
                      className="w-full inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-slate-950 font-semibold shadow-lg shadow-amber-400/40 hover:opacity-90 transition-all duration-300 transform hover:scale-105"
                    >
                      Chat with Astrologers Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none rounded-2xl"></div>
                </div>
              </div>

              <div className="relative w-full lg:flex-[1.2] flex flex-col gap-4 justify-center lg:justify-start">
                {/* Alternating side animations */}
                <Link to="/shop" className="relative w-full translate-x-2 lg:translate-x-8 transition-opacity duration-500 block hover:opacity-95 cursor-pointer">
                  <video
                    key={activeSideAnimation}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full rounded-2xl object-cover shadow-2xl border border-white/10 transition-transform duration-300 hover:scale-[1.02]"
                    style={{ height: '280px', objectFit: 'cover' }}
                  >
                    <source src={activeSideAnimation === 0 ? "/images/gem1.mp4" : "/images/rudra5.mp4"} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-950/0 via-slate-950/20 to-slate-950/60 pointer-events-none rounded-2xl" />
                </Link>
              </div>
            </div>
          </section>
        </div>
        {/* Navigation Cards Section - Animation starts from bottom of Hero Video Section */}
        <section
          className="relative z-10 px-4 sm:px-6 lg:px-8 pt-0 pb-12"
          style={{
            marginTop: 0,
            animation: 'slideUpFromBottom 0.8s ease-out forwards',
            animationDelay: '1s',
            opacity: 0
          }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="relative bg-slate-900 border border-white/10 rounded-3xl p-8 lg:p-12 backdrop-blur-xl shadow-2xl shadow-black/30 overflow-hidden">
              {/* Overlay Effect */}


              <div className="relative z-10">
                <div className="text-center mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-white  mb-2">
                    Explore Our Services
                  </h2>
                  <p className="text-slate-300 text-lg">
                    Discover all the features and services we offer
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {exploreServices.map((item) => {
                    const IconComponent = item.icon;
                    const isExternal = item.isExternal;

                    const linkContent = (
                      <>
                        <div className={`w-14 h-14 mx-auto mb-4 rounded-xl bg-white-to-r ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                          {item.iconImage ? (
                            <img src={item.iconImage} alt={`${item.name} icon`} className="h-8 w-8 object-contain" />
                          ) : IconComponent ? (
                            <IconComponent className="h-7 w-7 text-white" />
                          ) : (
                            <Star className="h-7 w-7 text-white" />
                          )}
                        </div>
                        <h3 className="text-center text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">
                          {item.name}
                        </h3>
                      </>
                    );

                    return isExternal ? (
                      <a
                        key={item.name}
                        href={item.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-amber-400/20 block text-decoration-none"
                      >
                        {linkContent}
                      </a>
                    ) : (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="group relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-amber-400/20"
                      >
                        {linkContent}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hindi Banner */}
        <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="relative bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-pink-500/20 border border-amber-400/30 rounded-2xl px-6 py-4 backdrop-blur-xl shadow-lg shadow-amber-400/20 overflow-hidden">
              {/* Overlay Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-pink-500/5 pointer-events-none"></div>

              <div className="relative z-10 flex items-center justify-center">
                <p className="text-center text-lg md:text-xl font-semibold text-white">
                  ग्रहों की बदलती चाल का आपके जीवन पर क्या असर होगा, यह जानने के लिए संपर्क करें
                </p>
              </div>
            </div>
          </div>
        </section>

        <div
          className="absolute inset-0 -z-10 bg-slate-950 transition-all duration-700"
          style={heroBackgroundStyle}
        />
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
          <div className="absolute top-10 -left-10 w-72 h-72 bg-orange-500/20 blur-[140px]" />
          <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-purple-600/25 blur-[220px]" />
        </div>

        <main className="relative z-10 px-4 sm:px-6 lg:px-8 pt-16 pb-20 space-y-20">
          {/* Hero Content Flexbox with Overlay */}
          <section className="relative max-w-6xl mx-auto">
            <div className="relative bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12 backdrop-blur-xl shadow-2xl shadow-black/30 overflow-hidden">
              {/* Overlay Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.1),_transparent_50%)] pointer-events-none"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.1),_transparent_50%)] pointer-events-none"></div>

              <div className="relative z-10 grid lg:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div className="inline-flex items-center space-x-3 bg-white/10 border border-white/20 rounded-full px-5 py-2">
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    <span className="text-xs uppercase tracking-[0.4em] text-amber-200">
                      Inspired by Experinced  Astrologers
                    </span>
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-white">
                    India&apos;s most trusted{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600">
                      astrology super-app
                    </span>
                  </h1>
                  <p className="text-lg text-slate-200 max-w-2xl">
                    Free Kundli, horoscope engine, Panchang, Muhurat, AI-powered predictions, and instant access to
                    senior astrologers—crafted with the same depth you love on AstroSage, reimagined for 2025.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      to="/kundali"
                      className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-slate-950 font-semibold shadow-lg shadow-amber-400/40"
                    >
                      Generate Free Kundli
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                    <Link
                      to="/astrologers"
                      className="inline-flex items-center px-6 py-3 rounded-full border border-white/30 text-white hover:bg-white/10"
                    >
                      Talk to Astrologer
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {trustBadges.map(({ label, icon: Icon }) => (
                      <div key={label} className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                        <Icon className="h-5 w-5 text-amber-300 mb-2" />
                        <p className="text-xs text-slate-300">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="bg-white/5 border border-white/15 rounded-3xl p-4 lg:p-5 backdrop-blur-xl shadow-2xl shadow-black/30">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.5em] text-emerald-200/70 mb-1">Available Now</p>
                        <h3 className="text-xl font-bold text-white">Live Astrologers</h3>
                      </div>
                      <div className="flex items-center text-emerald-200 text-xs font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)] mr-2 animate-pulse"></span>
                        {isAstrologerLoading ? 'Checking...' : `${availableAstrologers.length} online`}
                      </div>
                    </div>
                    <div className="relative group">
                      {isAstrologerLoading ? (
                        <div className="flex gap-3">
                          {[...Array(4)].map((_, idx) => (
                            <div key={idx} className="flex-1 min-w-[120px] h-32 bg-white/10 rounded-2xl animate-pulse" />
                          ))}
                        </div>
                      ) : availableAstrologers.length === 0 ? (
                        <p className="text-xs text-slate-300 px-2">No astrologers are online right now. Please check back soon.</p>
                      ) : (
                        <div className="relative">
                          {/* Navigation Buttons */}
                          <button
                            onClick={() => {
                              if (scrollContainerRef.current) {
                                scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
                              }
                            }}
                            className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-900/80 border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-800"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>

                          <button
                            onClick={() => {
                              if (scrollContainerRef.current) {
                                scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
                              }
                            }}
                            className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-900/80 border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-800"
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
                                  to="/booking"
                                  className="min-w-[135px] max-w-[135px] bg-white/10 border border-white/10 rounded-2xl p-3 flex flex-col items-center text-center text-white hover:border-white/30 hover:bg-white/15 transition-all duration-200 shadow-md shadow-black/20"
                                >
                                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-white/20 mb-2">
                                    {imageSrc ? (
                                      <img
                                        src={imageSrc}
                                        alt={astrologer.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-amber-400/70 to-pink-500/70 flex items-center justify-center text-xl font-bold">
                                        {astrologer.name?.charAt(0) || 'A'}
                                      </div>
                                    )}
                                    <span className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900 shadow-[0_0_8px_rgba(16,185,129,0.9)]"></span>
                                  </div>
                                  <p className="text-sm font-semibold leading-tight truncate w-full">{astrologer.name}</p>
                                  <p className="text-[11px] text-slate-300 truncate w-full">{subtitle}</p>
                                  <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-400/15 text-emerald-200 text-[11px] font-semibold whitespace-nowrap">
                                    <MessageCircle className="h-3.5 w-3.5" />
                                    Chat Now
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/15 rounded-3xl p-6 lg:p-8 backdrop-blur-xl">
                    <h3 className="text-2xl font-bold mb-2">Quick Kundli Preview</h3>
                    <p className="text-sm text-slate-300 mb-6">Get AI + Vedic insights before your consult begins.</p>
                    <form onSubmit={handleQuickPreviewSubmit} className="space-y-4">
                      <input
                        name="name"
                        value={quickKundaliData.name}
                        onChange={handleQuickPreviewChange}
                        className="w-full rounded-2xl bg-white/10 border border-white/15 px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                        placeholder="Full Name"
                        required
                      />
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={quickKundaliData.dateOfBirth}
                        onChange={handleQuickPreviewChange}
                        className="w-full rounded-2xl bg-white/10 border border-white/15 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                        required
                      />

                      <button
                        type="submit"
                        className="w-full rounded-2xl bg-gradient-to-r from-amber-400 to-pink-500 text-slate-900 font-semibold py-3 flex items-center justify-center gap-2"
                      >
                        Preview Chart
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      <p className="text-xs text-slate-400">
                        By generating a Kundli you agree to our privacy policy and consent to receive important notifications.
                      </p>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="max-w-6xl mx-auto grid lg:grid-cols-4 gap-6">
            {quickActions.map(({ title, description, action, link, icon: Icon, accent, isExternal }) => (
              <div key={title} className="bg-slate-900 border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-r ${accent} text-slate-950 mb-4`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold">{title}</h3>
                  <p className="text-sm text-slate-300 mt-2">{description}</p>
                </div>
                {isExternal ? (
                  <a href={link} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center text-amber-300 text-sm font-semibold">
                    {action}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </a>
                ) : (
                  <Link to={link} className="mt-6 inline-flex items-center text-amber-300 text-sm font-semibold">
                    {action}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                )}
              </div>
            ))}
          </section>

          <section className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Highlights</p>
                <h2 className="text-3xl md:text-4xl font-bold mt-2">Built for modern seekers</h2>
              </div>
              <Link to="/astrologers" className="inline-flex items-center text-amber-300 text-sm">
                Explore experts
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {astroHighlights.map(({ title, description, icon: Icon }) => (
                <div key={title} className="bg-slate-900 border border-white/10 rounded-3xl p-6 flex gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <p className="text-sm text-slate-300 mt-2">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Hindi Banner - Horoscope */}
          <section className="max-w-6xl mx-auto">
            <div className="relative bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-blue-500/20 border border-purple-400/30 rounded-2xl px-6 py-4 backdrop-blur-xl shadow-lg shadow-purple-400/20 overflow-hidden">
              {/* Overlay Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-indigo-500/5 to-blue-500/5 pointer-events-none"></div>

              <div className="relative z-10 flex items-center justify-center">
                <p className="text-center text-lg md:text-xl font-semibold text-white">
                  आज का राशिफल: जानिए कैसा रहेगा आपका आज का दिन सितारों की नज़र में।
                </p>
              </div>
            </div>
          </section>

          <section className="max-w-6xl mx-auto bg-slate-900 border border-white/10 rounded-[32px] p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-amber-200">Horoscopes</p>
                <h2 className="text-3xl font-bold">All zodiac insights, updated hourly</h2>
              </div>
              <Link to="/daily-calendar" className="inline-flex items-center text-amber-300 text-sm">
                View all horoscopes
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {horoscopeCategories.map((category) => (
                <div key={category} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5">
                  <p className="font-semibold">{category}</p>
                  <p className="text-xs text-slate-400 mt-2">Aries to Pisces • live updates</p>
                </div>
              ))}
            </div>
          </section>

          <section className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center rounded-[32px] bg-slate-900 border border-white/10 p-8">
            <div className="relative">
              <div className="absolute inset-0 blur-3xl bg-amber-500/20 -z-10 rounded-[32px]" />
              <img
                src="/images/home3.webp"
                alt="Horoscope and Consultations"
                className="w-full rounded-[28px] border border-white/10 object-cover shadow-[0_25px_80px_rgba(0,0,0,0.3)]"
                loading="lazy"
              />
            </div>
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.4em] text-amber-200">Horoscope & Consultations</p>
              <h2 className="text-3xl md:text-4xl font-bold">Ancient Wisdom, Modern Guidance</h2>
              <p className="text-slate-200 leading-relaxed">
                Our certified Hindu astrologers bring thousands of years of Vedic tradition to your modern life. With deep
                knowledge of Sanskrit texts and authentic practices, we provide personalized guidance that honors both
                tradition and your contemporary needs.
              </p>
              <div className="space-y-3">
                {[
                  'Certified Vedic astrologers with 15+ years experience',
                  'Authentic Sanskrit-based calculations and interpretations',
                  'Personalized remedies and spiritual guidance'
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3 text-slate-100">
                    <CheckCircle className="h-5 w-5 text-emerald-300 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
            <div className="rounded-[32px] bg-gradient-to-br from-purple-700/80 to-slate-900 border border-white/10 p-8 space-y-4">
              <p className="text-xs uppercase tracking-[0.4em] text-purple-200">Consultations</p>
              <h2 className="text-3xl font-bold">Talk to India&apos;s leading astrologers 24/7</h2>
              <p className="text-slate-200">
                Choose from 500+ vetted professionals specializing in marriage, career, finance, abroad settlement, and more.
              </p>
              {[
                'Instant chat/call with queue times under 60 seconds.',
                'Video consults with screen-shared Kundli insights.',
                'Detailed remedies shared in your dashboard.'
              ].map((point) => (
                <div key={point} className="flex items-start gap-3 text-sm text-slate-200">
                  <CheckCircle className="h-5 w-5 text-emerald-300 mt-0.5" />
                  <span>{point}</span>
                </div>
              ))}
              <div className="flex flex-wrap gap-3 pt-4">
                <Link to="/astrologers" className="inline-flex items-center rounded-full bg-white text-slate-900 px-5 py-2 font-semibold">
                  Browse Experts
                </Link>
                <Link
                  to="/booking"
                  className="inline-flex items-center rounded-full border border-white/40 px-5 py-2 text-white"
                >
                  Schedule later
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </div>
            </div>

            <div className="grid gap-6">
              {toolCards.map(({ title, description, icon: Icon }) => (
                <div key={title} className="rounded-[28px] bg-slate-900 border border-white/10 p-6">
                  <Icon className="h-6 w-6 text-amber-300" />
                  <h3 className="text-xl font-semibold mt-4">{title}</h3>
                  <p className="text-sm text-slate-300 mt-2">{description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
            <div className="rounded-[32px] bg-gradient-to-br from-purple-700/80 to-slate-900 border border-white/10 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-purple-300">Knowledge hub</p>
                  <h2 className="text-3xl font-bold mt-2">Latest from our astrologers</h2>
                </div>
                <Link to="/community-videos" className="text-sm text-amber-300 flex items-center">
                  Watch learning room
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              <div className="space-y-4">
                {knowledgeCards.map(({ tag, title }) => (
                  <div key={title} className="border border-white/10 rounded-2xl p-5 hover:bg-white/5 transition-colors">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{tag}</p>
                    <h3 className="text-lg font-semibold mt-2">{title}</h3>
                    <button className="mt-4 flex items-center text-sm text-amber-300">
                      Continue reading
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] bg-gradient-to-br from-amber-500/80 via-pink-500/50 to-purple-600/60 border border-white/10 p-8">
              <p className="text-xs uppercase tracking-[0.4em] text-amber-200">Astro shop</p>
              <h2 className="text-3xl font-bold mt-2">Sacred store curated by experts</h2>
              <p className="text-slate-200 mt-4">
                Everything is energized, documented, and shipped worldwide.
              </p>
              <div className="mt-6 space-y-4">
                {shopCards.map(({ title, description }) => (
                  <div key={title} className="bg-slate-900 rounded-2xl p-4">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="text-sm text-slate-200 mt-1">{description}</p>
                  </div>
                ))}
              </div>
              <Link
                to="/shop"
                className="mt-6 inline-flex items-center rounded-full bg-white text-slate-900 px-5 py-2 font-semibold"
              >
                Explore store
                <ShoppingBag className="h-4 w-4 ml-2" />
              </Link>
            </div>
          </section>

          <section className="max-w-6xl mx-auto rounded-[32px] bg-slate-900 border border-white/10 p-8 grid lg:grid-cols-2 gap-10">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Testimonials</p>
              <h2 className="text-3xl font-bold mt-2">Loved by seekers worldwide</h2>
              <p className="text-slate-300 mt-4">
                Real humans, verified consults, transparent reviews. We keep rotating fresh stories automatically.
              </p>
              <div className="mt-8 space-y-3">
                {testimonialsSeed.map((item, idx) => (
                  <button
                    key={item.name}
                    className={`w-full text-left rounded-2xl px-4 py-3 border transition-colors ${idx === currentTestimonial ? 'border-amber-300 bg-white/10' : 'border-white/10 text-slate-300'
                      }`}
                    onClick={() => setCurrentTestimonial(idx)}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-slate-600 rounded-3xl p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-pink-500 flex items-center justify-center text-slate-900 font-bold text-xl">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="text-lg font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-slate-300">{testimonial.location}</p>
                </div>
              </div>
              <p className="mt-6 text-lg">&ldquo;{testimonial.text}&rdquo;</p>
              <div className="mt-6 flex items-center text-amber-300">
                {[...Array(5)].map((_, idx) => (
                  <Star key={idx} className="h-5 w-5 fill-current" />
                ))}
              </div>
            </div>
          </section>

          <section className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
            <div className="rounded-[32px] bg-slate-600 border border-white/10 p-8">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">FAQs</p>
              <h2 className="text-3xl font-bold mt-2">Everything you need to know</h2>
              <div className="mt-6 space-y-3">
                {faqItems.map((faq) => (
                  <details key={faq.question} className="group border border-white/10 rounded-2xl">
                    <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-lg">
                      <span>{faq.question}</span>
                      <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="px-4 pb-4 text-sm text-slate-300">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] bg-gradient-to-br from-amber-500/20 via-pink-500/20 to-purple-600/60 border border-white/10 p-8 flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-amber-200">Download soon</p>
                <h2 className="text-3xl font-bold mt-2">AstroConsult app</h2>
                <p className="text-slate-100 mt-4">
                  Mirror the AstroSage mobile experience with offline mode, personalized alerts, and one-tap remedies. Launching Q1 2025.
                </p>
              </div>
              <div className="mt-6 flex gap-3">
                <button className="flex-1 rounded-2xl bg-white text-slate-900 px-4 py-3 font-semibold">
                  Join waitlist
                </button>
                <button className="flex-1 rounded-2xl border border-white/50 px-4 py-3 text-white">
                  Get SMS alert
                </button>
              </div>
            </div>
          </section>

          <section className="max-w-6xl mx-auto rounded-[40px] bg-white text-slate-900 p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Ready?</p>
              <h2 className="text-4xl font-black mt-3">
                Bring AstroSage-level depth into your journey
              </h2>
              <p className="text-base text-slate-600 mt-4">
                Free forever Kundli, premium consultations, secure remedies, modern UI.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              {isAuthenticated ? (
                <Link
                  to="/book-appointment"
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 text-white px-8 py-3 font-semibold"
                >
                  Continue consultation
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center rounded-full bg-slate-900 text-white px-8 py-3 font-semibold"
                  >
                    Create free account
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 px-8 py-3 font-semibold text-slate-900"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </section>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-visible text-slate-900 animate-in fade-in zoom-in-95 duration-200">
            {/* Top yellow header */}
            <div className="bg-gradient-to-b from-amber-400 to-yellow-500 rounded-t-3xl pt-14 pb-6 px-6 relative text-center">
              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-white hover:text-amber-100 transition-colors bg-black/25 hover:bg-black/40 p-1.5 rounded-full"
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
                <div className="flex justify-center gap-3 mb-3">
                  {availableAstrologers.slice(0, 3).map((astrologer, idx) => {
                    const rawImage =
                      astrologer.profilePicture ||
                      astrologer.image ||
                      astrologer.imageUrl ||
                      astrologer.photo;
                    const imageSrc = rawImage ? buildAssetUrl(rawImage) : null;
                    return (
                      <div key={idx} className="relative w-14 h-14 rounded-full border-2 border-amber-300 overflow-hidden bg-slate-100 shadow-md">
                        {imageSrc ? (
                          <img src={imageSrc} alt={astrologer.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-amber-400 to-pink-500 flex items-center justify-center text-slate-900 font-bold text-lg">
                            {astrologer.name?.charAt(0) || 'A'}
                          </div>
                        )}
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white shadow-sm"></span>
                      </div>
                    );
                  })}
                  {availableAstrologers.length === 0 && (
                    <>
                      <div className="relative w-14 h-14 rounded-full border-2 border-amber-300 overflow-hidden bg-slate-100 shadow-md flex items-center justify-center font-bold text-lg text-slate-600">
                        A
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white shadow-sm"></span>
                      </div>
                      <div className="relative w-14 h-14 rounded-full border-2 border-amber-300 overflow-hidden bg-slate-100 shadow-md flex items-center justify-center font-bold text-lg text-slate-600">
                        B
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white shadow-sm"></span>
                      </div>
                      <div className="relative w-14 h-14 rounded-full border-2 border-amber-300 overflow-hidden bg-slate-100 shadow-md flex items-center justify-center font-bold text-lg text-slate-600">
                        C
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white shadow-sm"></span>
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
                  to="/booking"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-center text-sm shadow-md transition-all active:scale-[0.98]"
                >
                  Call Now
                </Link>
                <Link
                  to="/booking"
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
    </div>
  );
};

export default Home;

