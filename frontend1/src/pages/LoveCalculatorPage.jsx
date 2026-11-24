import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import NameNumerologyCalculator from './compatibility/NameNumerologyCalculator';
import BirthNumerologyCalculator from './compatibility/BirthNumerologyCalculator';
import MoonSignCalculator from './compatibility/MoonSignCalculator';
import SunSignCalculator from './compatibility/SunSignCalculator';
import NameHoroscopeCalculator from './compatibility/NameHoroscopeCalculator';
import FriendshipCalculator from './compatibility/FriendshipCalculator';
import PassionCalculator from './compatibility/PassionCalculator';
import PersonalAlignmentCalculator from './compatibility/PersonalAlignmentCalculator';
import RelationshipPathCalculator from './compatibility/RelationshipPathCalculator';
import MasterNumberCalculator from './compatibility/MasterNumberCalculator';
import CompleteReportForm from './compatibility/CompleteReportForm';
import WeeklyRelationshipCalculator from './compatibility/WeeklyRelationshipCalculator';
import {
    Sparkles,
    Moon,
    Sun,
    Star,
    Users,
    Calendar,
    Heart,
    Flame,
    UserCheck,
    Hexagon,
    Eye,
    FileText,
    ArrowLeft,
    ArrowRight,
    Shield,
    Compass,
    CheckCircle2,
    MessageCircle,
    HelpCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const LOVE_CONSULTATION_SLOGANS = [
    'क्या एक्स (ex) वापस आएगा या रिश्ता सुधर सकता है?',
    'रिश्ते को मजबूत करने के लिए क्या उपाय करें?',
    'क्या यह रिश्ता लंबे समय तक चलेगा?',
    'रिश्ते में आगे बढ़ने या परिवार से बात करने का सही समय कब है?'
];

const LoveCalculatorPage = () => {
    const navigate = useNavigate();
    const params = new URLSearchParams(window.location.search);
    const [activeCalculator, setActiveCalculator] = useState(params.get('calculator') || null);
    const [currentSloganIndex, setCurrentSloganIndex] = useState(0);

    // Rotate Love Consultation Slogan every 3 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSloganIndex((prev) => (prev + 1) % LOVE_CONSULTATION_SLOGANS.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    const calculators = [
        {
            id: 'weekly-relationship',
            title: 'Weekly Relationship Horoscope',
            description: 'Generate daily love, harmony & chemistry forecasts for both partners.',
            icon: <Heart className="w-6 h-6 text-rose-600 fill-rose-100" />,
            accent: 'border-rose-300 hover:border-rose-500 bg-gradient-to-br from-white via-rose-50/40 to-pink-50/60',
            badge: 'Daily & Weekly Forecast',
            component: <WeeklyRelationshipCalculator onBack={() => setActiveCalculator(null)} />
        },
        {
            id: 'name-numerology',
            title: 'Match Compatibility By Name',
            description: 'Check compatibility using the sacred Chaldean method based on names.',
            icon: <Sparkles className="w-6 h-6 text-amber-600" />,
            accent: 'border-amber-300 hover:border-amber-500 bg-gradient-to-br from-white via-amber-50/40 to-yellow-50/60',
            badge: 'Chaldean Numerology',
            component: <NameNumerologyCalculator onBack={() => setActiveCalculator(null)} />
        },
        {
            id: 'moon-sign',
            title: 'Match Compatibility By Moon Sign',
            description: 'Analyze emotional compatibility and mental wavelength based on Moon signs.',
            icon: <Moon className="w-6 h-6 text-blue-600" />,
            accent: 'border-blue-300 hover:border-blue-500 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/60',
            badge: 'Chandra Rashi',
            component: <MoonSignCalculator onBack={() => setActiveCalculator(null)} />
        },
        {
            id: 'sun-sign',
            title: 'Match Compatibility By Sun Sign',
            description: 'Analyze core personality, life goals, and ego alignment between partners.',
            icon: <Sun className="w-6 h-6 text-orange-600" />,
            accent: 'border-orange-300 hover:border-orange-500 bg-gradient-to-br from-white via-orange-50/40 to-amber-50/60',
            badge: 'Surya Rashi',
            component: <SunSignCalculator onBack={() => setActiveCalculator(null)} />
        },
        {
            id: 'name-horoscope',
            title: 'Match Compatibility By Initial Sound',
            description: 'Astrological sound-vibration compatibility using Vedic name initials (Avakahada).',
            icon: <Star className="w-6 h-6 text-amber-600" />,
            accent: 'border-amber-300 hover:border-amber-500 bg-gradient-to-br from-white via-amber-50/40 to-orange-50/60',
            badge: 'Akshara Milan',
            component: <NameHoroscopeCalculator onBack={() => setActiveCalculator(null)} />
        },
        {
            id: 'birth-numerology',
            title: 'Match Compatibility By Birth Date',
            description: 'Compatibility analysis based on Life Path, Destiny, and Mulank / Bhagyank numbers.',
            icon: <Calendar className="w-6 h-6 text-emerald-600" />,
            accent: 'border-emerald-300 hover:border-emerald-500 bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/60',
            badge: 'Life Path Numerology',
            component: <BirthNumerologyCalculator onBack={() => setActiveCalculator(null)} />
        },
        {
            id: 'friendship',
            title: 'Friendship Compatibility',
            description: 'Discover how strong and enduring your bond is as lifelong companions and friends.',
            icon: <Users className="w-6 h-6 text-purple-600" />,
            accent: 'border-purple-300 hover:border-purple-500 bg-gradient-to-br from-white via-purple-50/40 to-fuchsia-50/60',
            badge: 'Companionship Bond',
            component: <FriendshipCalculator onBack={() => setActiveCalculator(null)} />
        },
        {
            id: 'passion-romance',
            title: 'Passion & Romance (Venus / Mars)',
            description: 'Calculate magnetic attraction, physical sparks, and romantic harmony between Venus and Mars.',
            icon: <Flame className="w-6 h-6 text-red-600" />,
            accent: 'border-red-300 hover:border-red-500 bg-gradient-to-br from-white via-red-50/40 to-rose-50/60',
            badge: 'Shukra & Mangal Sparks',
            component: <PassionCalculator onBack={() => setActiveCalculator(null)} />
        },
        {
            id: 'personal-alignment',
            title: 'Name vs Birth Date Alignment',
            description: 'Check if your name vibration is auspiciously aligned with your birth life path number.',
            icon: <UserCheck className="w-6 h-6 text-teal-600" />,
            accent: 'border-teal-300 hover:border-teal-500 bg-gradient-to-br from-white via-teal-50/40 to-cyan-50/60',
            badge: 'Name Vibration',
            component: <PersonalAlignmentCalculator onBack={() => setActiveCalculator(null)} />
        },
        {
            id: 'relationship-path',
            title: 'The Relationship Path',
            description: 'Discover the ultimate destiny, shared karmic lessons, and future of your partnership.',
            icon: <Hexagon className="w-6 h-6 text-indigo-600" />,
            accent: 'border-indigo-300 hover:border-indigo-500 bg-gradient-to-br from-white via-indigo-50/40 to-purple-50/60',
            badge: 'Karmic Destiny',
            component: <RelationshipPathCalculator onBack={() => setActiveCalculator(null)} />
        },
        {
            id: 'master-number',
            title: 'Spiritual Bond (Master Numbers)',
            description: 'Check for rare, karmic Soul Contracts and high-frequency Master Numbers (11, 22, 33).',
            icon: <Eye className="w-6 h-6 text-amber-700" />,
            accent: 'border-amber-300 hover:border-amber-500 bg-gradient-to-br from-white via-amber-50/40 to-yellow-50/60',
            badge: 'Soul Contracts',
            component: <MasterNumberCalculator onBack={() => setActiveCalculator(null)} />
        },
        {
            id: 'complete-report',
            title: 'Generate Master Love Report',
            description: 'Run ALL calculators at once & generate a printable multi-page Vedic PDF summary!',
            icon: <FileText className="w-6 h-6 text-white" />,
            special: true,
            component: <CompleteReportForm onBack={() => setActiveCalculator(null)} />
        }
    ];

    if (activeCalculator) {
        const active = calculators.find(c => c.id === activeCalculator);
        const isFlushToNav = activeCalculator === 'sun-sign' || activeCalculator === 'name-numerology' || activeCalculator === 'name-horoscope' || activeCalculator === 'birth-numerology' || activeCalculator === 'friendship' || activeCalculator === 'passion' || activeCalculator === 'personal-alignment' || activeCalculator === 'relationship-path' || activeCalculator === 'master-number' || activeCalculator === 'complete-report';

        return (
            <div className="min-h-screen bg-stone-50 text-neutral-900 font-sans selection:bg-rose-200">
                <Navigation />
                <div className={`w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-12 ${isFlushToNav ? 'pt-[65px] lg:pt-[76px]' : 'pt-24 sm:pt-28 md:pt-32'
                    }`}>
                    {active ? active.component : null}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 text-neutral-900 font-sans selection:bg-rose-200 flex flex-col">
            <Navigation />

            {/* Hero Banner Header (Starts after fixed Nav Bar) */}
            <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/90 via-rose-50/30 to-stone-50 border-b border-amber-900/10 pt-24 sm:pt-28 md:pt-32">
                {/* Soft background glow circles */}
                <div className="absolute top-0 left-1/4 w-72 h-72 bg-rose-200/25 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-amber-200/25 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 relative z-10">
                    {/* Vedic Mantra Banner */}
                    <div className="flex justify-center mb-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100/90 border border-amber-300 text-amber-950 font-serif text-[11px] sm:text-xs font-bold shadow-2xs">
                            <span className="text-amber-700">ॐ</span>
                            <span>॥ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                        {/* Left Column: Rotating Consultation Questions / Slogans Pill Box */}
                        <div className="lg:col-span-4 flex flex-col justify-center">
                            <button
                                type="button"
                                onClick={() => navigate('/live-astrologers')}
                                className="w-full text-left p-3 sm:p-3.5 rounded-2xl bg-amber-400 border-2 border-rose-300 hover:border-rose-500 shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-400/10 to-amber-400/10 rounded-full blur-xl pointer-events-none" />

                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold uppercase tracking-wider">
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                                        <span>Live Astrologer Help</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                        परामर्श लें ↗
                                    </span>
                                </div>

                                {/* Animated Rotating Slogan Text */}
                                <div className="min-h-[46px] sm:min-h-[50px] flex items-center">
                                    <p
                                        key={currentSloganIndex}
                                        className="text-xs sm:text-[18px] font-bold font-serif text-neutral-900 leading-snug group-hover:text-rose-700 transition-colors animate-fade-in"
                                    >
                                        “{LOVE_CONSULTATION_SLOGANS[currentSloganIndex]}”
                                    </p>
                                </div>

                                <div className="mt-2 pt-1.5 border-t border-rose-100 flex items-center justify-between text-[16px] font-bold text-rose-700">
                                    <span className="flex items-center gap-1">
                                        <MessageCircle className="w-3.5 h-3.5 text-rose-600" /> ज्योतिषी से तुरंत बात करें
                                    </span>
                                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                                </div>
                            </button>
                        </div>

                        {/* Right Column: Hero Title & Badges */}
                        <div className="lg:col-span-8 text-center lg:text-left space-y-1.5">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-100 border border-rose-300 text-rose-900 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                                <Heart className="w-3 h-3 text-rose-600 fill-rose-600" />
                                <span>Vedic Love & Compatibility Engine</span>
                            </div>

                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-serif text-neutral-900 tracking-tight leading-snug">
                                Love & Relationship <span className="bg-gradient-to-r from-rose-700 via-pink-700 to-amber-700 bg-clip-text text-transparent">Compatibility Hub</span>
                            </h1>

                            <p className="text-xs sm:text-[16px] text-black leading-snug font-medium max-w-2xl">
                                केवल गुण नहीं, संपूर्ण ग्रहों की स्थिति, चंद्र राशि, सूर्य राशि और वैदिक अंकशास्त्र से जानें अपने साथी के साथ सच्चा तालमेल और प्रेम संबंध।
                            </p>

                            {/* Quick Slogan Bar */}
                            <div className="pt-1 flex flex-wrap items-center justify-center lg:justify-start gap-1.5 text-[14px] font-semibold text-neutral-800">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white border border-neutral-300 shadow-2xs">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 100% Free Calculators
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white border border-neutral-300 shadow-2xs">
                                    <Sparkles className="w-3 h-3 text-amber-600" /> Vedic & Chaldean Wisdom
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white border border-neutral-300 shadow-2xs">
                                    <Shield className="w-3 h-3 text-rose-600" /> Instant Accurate Readings
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Body */}
            <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-8">
                {/* 12 Individual Calculators Grid */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold font-serif text-neutral-900 flex items-center gap-2">
                                <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
                                <span>Explore Individual Love Calculators</span>
                            </h2>
                            <p className="text-xs sm:text-[16px] text-black mt-0.5">
                                Select any calculator below to check specific emotional, astrological, or numerological harmony.
                            </p>
                        </div>
                        <span className="text-[18px] font-bold text-orange-900 bg-neutral-200/70 px-2.5 py-1 rounded-full">
                            11 Specialized Tools
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 pt-1">
                        {calculators.filter(c => !c.special).map((calc) => (
                            <button
                                key={calc.id}
                                onClick={() => setActiveCalculator(calc.id)}
                                className={`group relative text-left p-4 sm:p-4.5 rounded-2xl border ${calc.accent} shadow-sm shadow-neutral-200/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between cursor-pointer overflow-hidden min-h-[160px]`}
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <div className="p-2 bg-white rounded-xl border border-neutral-200 shadow-2xs group-hover:scale-105 transition-transform duration-300">
                                            {calc.icon}
                                        </div>
                                        {calc.badge && (
                                            <span className="text-[14px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/90 text-neutral-800 border border-neutral-300 shadow-2xs">
                                                {calc.badge}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-sm sm:text-base font-bold font-serif text-neutral-900 group-hover:text-rose-700 transition-colors mb-1 line-clamp-1">
                                        {calc.title}
                                    </h3>

                                    <p className="text-[11px] sm:text-[16px] text-indigo-900 leading-snug font-medium line-clamp-2">
                                        {calc.description}
                                    </p>
                                </div>

                                <div className="mt-3 pt-2.5 border-t border-neutral-200/60 flex items-center justify-between text-[16px] font-bold text-neutral-900 group-hover:text-rose-700 transition-colors">
                                    <span>Start Free Analysis</span>
                                    <div className="w-5 h-5 rounded-full bg-white border border-neutral-300 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600 transition-all">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Master Report High-Priority Banner */}
                <div
                    onClick={() => setActiveCalculator('complete-report')}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-900 via-rose-900 to-amber-950 p-6 sm:p-8 text-white shadow-xl cursor-pointer hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 border border-amber-600/40 group"
                >
                    {/* Background decorative watermark */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 group-hover:opacity-15 transition-opacity pointer-events-none">
                        <Heart className="w-64 h-64 text-white fill-white" />
                    </div>

                    <div className="relative z-10 max-w-2xl space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-sm">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Recommended by Vedic Astrologers</span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-black font-serif text-amber-100 tracking-tight">
                            Generate Master Love & Compatibility Report
                        </h2>

                        <p className="text-xs sm:text-sm text-amber-200 leading-relaxed font-normal">
                            Want a 360° holistic evaluation? Run every numerological and astrological calculator simultaneously in one click and download or print a comprehensive PDF report.
                        </p>

                        <div className="pt-2 flex items-center gap-3">
                            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-lg group-hover:from-amber-300 group-hover:to-amber-400 transition-all">
                                Generate Full PDF Report <ArrowRight className="w-4 h-4" />
                            </span>
                            <span className="text-xs text-amber-200/80 font-medium">Free • Instant Download</span>
                        </div>
                    </div>
                </div>

                {/* Vedic Footer Bar */}
                <footer className="border-t border-neutral-300/80 pt-6 pb-8 text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-neutral-700">
                        <span>🕉️ Astro Consult Vedic Astrology</span>
                        <span>•</span>
                        <Link to="/kundali-matching" className="text-rose-700 hover:underline">Kundali Matching</Link>
                        <span>•</span>
                        <Link to="/relationship-horoscope" className="text-rose-700 hover:underline">Relationship Horoscope</Link>
                    </div>
                    <p className="text-[11px] text-neutral-500">
                        Copyright © 2026 Phanom Technologies. All Rights Reserved.
                    </p>
                </footer>
            </main>
        </div>
    );
};

export default LoveCalculatorPage;
