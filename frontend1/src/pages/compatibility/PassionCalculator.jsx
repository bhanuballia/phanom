import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    RefreshCw,
    Heart,
    Sparkles,
    Flame,
    Video,
    ChevronRight,
    CheckCircle2,
    Globe,
    Compass,
    Zap,
    Activity
} from 'lucide-react';
import { authAPI, buildAssetUrl } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

const VEDIC_ZODIAC_LIST = [
    { en: 'Aries', hi: 'मेष (Mesh)', element: 'Fire', lord: 'Mars (Mangal)', symbol: '♈' },
    { en: 'Taurus', hi: 'वृषभ (Vrishabha)', element: 'Earth', lord: 'Venus (Shukra)', symbol: '♉' },
    { en: 'Gemini', hi: 'मिथुन (Mithun)', element: 'Air', lord: 'Mercury (Budh)', symbol: '♊' },
    { en: 'Cancer', hi: 'कर्क (Kark)', element: 'Water', lord: 'Moon (Chandra)', symbol: '♋' },
    { en: 'Leo', hi: 'सिंह (Simha)', element: 'Fire', lord: 'Sun (Surya)', symbol: '♌' },
    { en: 'Virgo', hi: 'कन्या (Kanya)', element: 'Earth', lord: 'Mercury (Budh)', symbol: '♍' },
    { en: 'Libra', hi: 'तुला (Tula)', element: 'Air', lord: 'Venus (Shukra)', symbol: '♎' },
    { en: 'Scorpio', hi: 'वृश्चिक (Vrishchik)', element: 'Water', lord: 'Mars (Mangal)', symbol: '♏' },
    { en: 'Sagittarius', hi: 'धनु (Dhanu)', element: 'Fire', lord: 'Jupiter (Guru)', symbol: '♐' },
    { en: 'Capricorn', hi: 'मकर (Makar)', element: 'Earth', lord: 'Saturn (Shani)', symbol: '♑' },
    { en: 'Aquarius', hi: 'कुंभ (Kumbh)', element: 'Air', lord: 'Saturn (Shani)', symbol: '♒' },
    { en: 'Pisces', hi: 'मीन (Meen)', element: 'Water', lord: 'Jupiter (Guru)', symbol: '♓' }
];

const PassionCalculator = ({ onBack }) => {
    const { currentLang, changeLanguage, supportedLanguages } = useLanguage();
    const [venus1, setVenus1] = useState('Taurus');
    const [mars1, setMars1] = useState('Scorpio');
    const [venus2, setVenus2] = useState('Libra');
    const [mars2, setMars2] = useState('Aries');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Live Astrologers State for Header Strip
    const [liveAstrologers, setLiveAstrologers] = useState([]);
    const [loadingAstrologers, setLoadingAstrologers] = useState(false);

    useEffect(() => {
        const fetchLiveAstrologers = async () => {
            setLoadingAstrologers(true);
            try {
                const response = await authAPI.getAstrologers();
                const all = response?.data?.astrologers || [];
                const live = all.filter((a) => a.isLive);
                if (live.length > 0) {
                    setLiveAstrologers(live);
                } else {
                    setLiveAstrologers(all.slice(0, 8));
                }
            } catch (err) {
                console.error('Failed to load astrologers:', err);
            } finally {
                setLoadingAstrologers(false);
            }
        };

        fetchLiveAstrologers();
    }, []);

    const cleanAstrologerName = (name) => {
        if (!name) return 'Vedic Expert';
        return name
            .replace(/^(Astrologer|Astro\.?|Acharya|Pandit|Dr\.?)\s+/i, '')
            .replace(/\s+/g, ' ')
            .trim();
    };

    const handleCalculate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch((import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api') + '/astrology/compatibility/passion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ venus1, mars1, venus2, mars2 }),
            });

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            console.error(err);
            setError('शुक्र-मंगल आकर्षण व केमिस्ट्री गणना में त्रुटि हुई। कृपया पुनः प्रयास करें।');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setResult(null);
        setError(null);
    };

    const v1Meta = VEDIC_ZODIAC_LIST.find((s) => s.en.toLowerCase() === (result?.venus1 || venus1).toLowerCase()) || VEDIC_ZODIAC_LIST[1];
    const m1Meta = VEDIC_ZODIAC_LIST.find((s) => s.en.toLowerCase() === (result?.mars1 || mars1).toLowerCase()) || VEDIC_ZODIAC_LIST[7];
    const v2Meta = VEDIC_ZODIAC_LIST.find((s) => s.en.toLowerCase() === (result?.venus2 || venus2).toLowerCase()) || VEDIC_ZODIAC_LIST[6];
    const m2Meta = VEDIC_ZODIAC_LIST.find((s) => s.en.toLowerCase() === (result?.mars2 || mars2).toLowerCase()) || VEDIC_ZODIAC_LIST[0];

    return (
        <div className="w-full max-w-7xl mx-auto space-y-4 animate-fade-in-up pt-1">
            {/* 1. Live Astrologer Strip (Starts immediately after Nav Bar with zero unwanted gap) */}
            <div className="bg-gradient-to-r from-white via-amber-50/50 to-orange-50/60 border border-amber-200/90 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl shadow-xs space-y-1.5 mt-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-amber-100 pb-1.5">
                    <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                        </span>
                        <span className="text-[11px] sm:text-[14px] font-extrabold uppercase tracking-wider text-amber-950 font-serif flex items-center gap-1.5">
                            <span>लाइव ज्योतिषी से तुरंत परामर्श लें</span>
                            <span className="text-[14px] font-sans font-bold text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.2 rounded-full">
                                LIVE NOW
                            </span>
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[14px] text-black hidden md:inline">
                            Vedic Shukra-Mangal Romance, Chemistry & Physical Affinity
                        </span>
                        <Link
                            to="/live-astrologers"
                            className="inline-flex items-center gap-1 text-[14px] font-bold text-amber-800 hover:text-amber-950 transition-colors bg-white px-2 py-0.5 rounded-lg border border-amber-200 shadow-2xs"
                        >
                            <span>View All</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                {loadingAstrologers ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-1">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-14 bg-white rounded-xl animate-pulse border border-neutral-200" />
                        ))}
                    </div>
                ) : liveAstrologers.length === 0 ? (
                    <div className="bg-white border border-amber-100 p-2 rounded-xl flex items-center justify-between text-xs text-neutral-600">
                        <span>हमारे वरिष्ठ वैदिक ज्योतिषी अभी उपलब्ध हैं।</span>
                        <Link
                            to="/live-astrologers"
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 text-xs"
                        >
                            <Video className="w-3.5 h-3.5" />
                            <span>Connect Live</span>
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-3 pt-0.5">
                        {/* Left/Center: Circular Live Astrologers Roster */}
                        <div className="flex items-center gap-3.5 sm:gap-5 overflow-x-auto py-0.5 px-0.5 scrollbar-none w-full lg:w-auto">
                            {liveAstrologers.slice(0, 8).map((astro) => {
                                const rawImage = astro.profilePicture || astro.image || astro.imageUrl || astro.photo;
                                const imageSrc = rawImage ? buildAssetUrl(rawImage) : null;
                                const liveLink = astro.isLive ? `/live/${astro._id}` : `/astrologer/${astro._id || astro.id}`;
                                const displayName = cleanAstrologerName(astro.name);

                                return (
                                    <Link
                                        key={astro._id || astro.id}
                                        to={liveLink}
                                        className="group flex flex-col items-center shrink-0 cursor-pointer transition-transform hover:-translate-y-0.5"
                                        title={`Talk to ${displayName}`}
                                    >
                                        <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-500 shadow-2xs group-hover:scale-105 transition-transform">
                                            <div className="w-11 h-11 sm:w-18 sm:h-18 rounded-full overflow-hidden bg-neutral-900 border border-white flex items-center justify-center">
                                                {imageSrc ? (
                                                    <img
                                                        src={imageSrc}
                                                        alt={displayName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-xs font-bold text-amber-300">
                                                        {displayName?.charAt(0) || 'A'}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-white rounded-full shadow-2xs"></span>
                                        </div>

                                        <span className="mt-1 text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-amber-600 transition-colors text-center truncate max-w-[65px] sm:max-w-[75px] block leading-tight">
                                            {displayName}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Right Side: First Consultation Free Button */}
                        <div className="shrink-0 w-full lg:w-auto flex justify-center lg:justify-end">
                            <Link
                                to="/book-appointment"
                                className="group relative flex items-center gap-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-600 hover:via-orange-600 hover:to-rose-700 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border border-amber-300/40 cursor-pointer overflow-hidden text-center"
                            >
                                <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                                    <Sparkles className="w-4 h-4 text-amber-200 fill-amber-200 group-hover:rotate-12 transition-transform" />
                                </div>
                                <div className="text-left">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[12px] font-black uppercase tracking-wider bg-white/25 px-1.5 py-0.2 rounded-full text-white">
                                            100% FREE
                                        </span>
                                        <span className="text-[14px] font-bold text-amber-100">Special Offer</span>
                                    </div>
                                    <div className="text-xs sm:text-[24px] font-black font-serif tracking-tight leading-tight text-white mt-0.5">
                                        First Consultation Free
                                    </div>
                                    <div className="text-[12px] font-bold text-amber-100 flex items-center gap-1">
                                        <span>Book Appointment Now</span>
                                        <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. Top Header Bar */}
            <div className="bg-white border border-amber-200/80 px-4 sm:px-6 py-3.5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-900 font-extrabold text-xs uppercase tracking-wider shadow-sm border border-amber-500 transition-all cursor-pointer shrink-0"
                        title="Back to All Love Calculators"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>← Back to All Love Calculators</span>
                    </button>

                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-900">
                                वैदिक काम व आकर्षण मिलान
                            </span>
                            <span className="text-[10px] font-semibold text-neutral-500 hidden sm:inline">Venus-Mars Passion & Chemistry</span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-black font-serif text-neutral-900 tracking-tight">
                            Passion & Chemistry Compatibility
                        </h2>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Indian Language Selector */}
                    {supportedLanguages && supportedLanguages.length > 0 && (
                        <div className="flex items-center gap-1.5 bg-amber-50/80 border border-amber-200 px-2 py-1 rounded-xl">
                            <Globe className="w-3.5 h-3.5 text-amber-700" />
                            <select
                                value={currentLang || 'en'}
                                onChange={(e) => changeLanguage && changeLanguage(e.target.value)}
                                className="bg-transparent text-xs font-bold text-amber-950 focus:outline-hidden cursor-pointer"
                                title="Select Indian Language"
                            >
                                {supportedLanguages.map((l) => (
                                    <option key={l.code} value={l.code}>
                                        {l.native} ({l.name})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex items-center gap-1.5 text-rose-900 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 text-xs font-bold">
                        <Flame className="w-3.5 h-3.5 text-rose-600 fill-rose-500" />
                        <span>Venus & Mars Dynamic Spark</span>
                    </div>
                </div>
            </div>

            {/* 3. Form or Result Overview */}
            {!result ? (
                <form onSubmit={handleCalculate} className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                        {/* Left Column: Vedic Shukra-Mangal Chemistry Philosophy & Guidance */}
                        <div className="lg:col-span-5 bg-gradient-to-br from-amber-50 via-orange-50/60 to-rose-50 border border-amber-200/90 p-5 sm:p-6 rounded-2xl shadow-xs flex flex-col justify-between space-y-4">
                            <div className="space-y-3">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/90 text-rose-900 border border-rose-300 text-xs font-bold uppercase tracking-wider">
                                    <Flame className="w-3.5 h-3.5 text-rose-600 fill-rose-500" />
                                    <span>शुक्र (प्रेम) एवं मंगल (आकर्षण) योग</span>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-base sm:text-lg font-bold font-serif text-amber-950 leading-snug">
                                        शुक्र प्रेम, सौंदर्य व सुख का कारक है जबकि मंगल ऊर्जा, आकर्षण व पराक्रम को दर्शाता है
                                    </p>
                                    <p className="text-xs sm:text-[16px] text-neutral-800 leading-relaxed font-medium">
                                        Evaluate your physical, emotional and romantic chemistry by comparing both partners' Venus and Mars planetary placements.
                                    </p>
                                </div>
                            </div>

                            {/* Decorative Vedic Highlight Pill */}
                            <div className="bg-white/80 border border-amber-200/80 p-3.5 rounded-xl space-y-2">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                                    <Sparkles className="w-4 h-4 text-amber-600" />
                                    <span>केमिस्ट्री विश्लेषण के प्रमुख कारक:</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-neutral-700">
                                    <div className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                        <span>रोमांटिक आकर्षण (Romance)</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                        <span>शारीरिक सामंजस्य (Affinity)</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        <span>ऊर्जा व जोश (Energy Spark)</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                                        <span>दीर्घकालीन लगाव (Bonding)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Venus & Mars Selectors for Both Partners */}
                        <div className="lg:col-span-7 flex flex-col justify-start space-y-2.5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Person 1 Placements */}
                                <div className="bg-white border border-amber-600 p-3.5 sm:p-5 rounded-2xl space-y-2 shadow-xs">
                                    <div className="flex items-center gap-2 border-b border-amber-100 pb-1.5">
                                        <div className="w-5 h-5 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                                            1
                                        </div>
                                        <h3 className="text-sm font-bold text-neutral-900">Partner 1 (प्रथम साथी)</h3>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="space-y-1">
                                            <label className="text-[16px] font-bold text-neutral-800 flex items-center gap-1">
                                                <Heart className="w-3.5 h-3.5 text-rose-600" />
                                                <span>Venus Sign / शुक्र राशि</span>
                                            </label>
                                            <select
                                                value={venus1}
                                                onChange={(e) => setVenus1(e.target.value)}
                                                className="w-full bg-stone-50 border border-neutral-600 rounded-xl px-3 py-1.5 text-neutral-900 focus:outline-none focus:border-rose-500 transition-all text-xs sm:text-sm font-medium cursor-pointer"
                                            >
                                                {VEDIC_ZODIAC_LIST.map((s) => (
                                                    <option key={s.en} value={s.en}>
                                                        {s.symbol} {s.en} - {s.hi}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-1 pt-0.5">
                                            <label className="text-[16px] font-bold text-neutral-800 flex items-center gap-1">
                                                <Flame className="w-3.5 h-3.5 text-red-500" />
                                                <span>Mars Sign / मंगल राशि</span>
                                            </label>
                                            <select
                                                value={mars1}
                                                onChange={(e) => setMars1(e.target.value)}
                                                className="w-full bg-stone-50 border border-neutral-600 rounded-xl px-3 py-1.5 text-neutral-900 focus:outline-none focus:border-red-500 transition-all text-xs sm:text-sm font-medium cursor-pointer"
                                            >
                                                {VEDIC_ZODIAC_LIST.map((s) => (
                                                    <option key={s.en} value={s.en}>
                                                        {s.symbol} {s.en} - {s.hi}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Person 2 Placements */}
                                <div className="bg-white border border-rose-600 p-3.5 sm:p-5 rounded-2xl space-y-2 shadow-xs">
                                    <div className="flex items-center gap-2 border-b border-rose-100 pb-1.5">
                                        <div className="w-5 h-5 rounded-lg bg-rose-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                                            2
                                        </div>
                                        <h3 className="text-sm font-bold text-neutral-900">Partner 2 (द्वितीय साथी)</h3>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="space-y-1">
                                            <label className="text-[16px] font-bold text-neutral-800 flex items-center gap-1">
                                                <Heart className="w-3.5 h-3.5 text-rose-600" />
                                                <span>Venus Sign / शुक्र राशि</span>
                                            </label>
                                            <select
                                                value={venus2}
                                                onChange={(e) => setVenus2(e.target.value)}
                                                className="w-full bg-stone-50 border border-neutral-600 rounded-xl px-3 py-1.5 text-neutral-900 focus:outline-none focus:border-rose-500 transition-all text-xs sm:text-sm font-medium cursor-pointer"
                                            >
                                                {VEDIC_ZODIAC_LIST.map((s) => (
                                                    <option key={s.en} value={s.en}>
                                                        {s.symbol} {s.en} - {s.hi}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-1 pt-0.5">
                                            <label className="text-[16px] font-bold text-neutral-800 flex items-center gap-1">
                                                <Flame className="w-3.5 h-3.5 text-red-500" />
                                                <span>Mars Sign / मंगल राशि</span>
                                            </label>
                                            <select
                                                value={mars2}
                                                onChange={(e) => setMars2(e.target.value)}
                                                className="w-full bg-stone-50 border border-neutral-600 rounded-xl px-3 py-1.5 text-neutral-900 focus:outline-none focus:border-red-500 transition-all text-xs sm:text-sm font-medium cursor-pointer"
                                            >
                                                {VEDIC_ZODIAC_LIST.map((s) => (
                                                    <option key={s.en} value={s.en}>
                                                        {s.symbol} {s.en} - {s.hi}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm text-center font-semibold">
                                    {error}
                                </div>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-rose-500 via-pink-600 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-2xl shadow-md shadow-rose-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            <span>शुक्र-मंगल केमिस्ट्री का विश्लेषण हो रहा है...</span>
                                        </span>
                                    ) : (
                                        <>
                                            <span>Calculate Passion & Chemistry</span>
                                            <Flame className="w-4 h-4 fill-white" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="space-y-5">
                    {/* Result Overview Header */}
                    <div className="bg-white border border-neutral-200/90 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="space-y-1 text-center sm:text-left">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                <span className="text-[14px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                                    ✓ विश्लेषण पूर्ण (Analysis Completed)
                                </span>
                                <span className="text-[14px] font-semibold text-neutral-900 bg-stone-50 px-2 py-0.5 rounded border border-neutral-200">
                                    Vedic Shukra-Mangal Passion Synthesis
                                </span>
                            </div>
                            <h3 className="text-lg sm:text-xl font-black font-serif text-neutral-900 tracking-tight">
                                Romantic Synergy & Passion Chemistry
                            </h3>
                            <p className="text-xs sm:text-[14px] text-neutral-900">
                                Partner 1 (Venus in <strong className="text-rose-700 font-bold">{result.venus1}</strong>, Mars in <strong className="text-red-600 font-bold">{result.mars1}</strong>) &{' '}
                                Partner 2 (Venus in <strong className="text-rose-700 font-bold">{result.venus2}</strong>, Mars in <strong className="text-red-600 font-bold">{result.mars2}</strong>)
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={reset}
                                className="flex items-center gap-1.5 bg-white hover:bg-neutral-100 text-neutral-800 font-bold text-xs py-2 px-3 rounded-xl border border-neutral-300 shadow-2xs transition-all cursor-pointer"
                            >
                                <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                                <span>Try Another Match</span>
                            </button>
                            <Link
                                to="/live-astrologers"
                                className="flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl shadow-2xs transition-all"
                            >
                                <Video className="w-3.5 h-3.5" />
                                <span>Talk to Astrologer</span>
                            </Link>
                        </div>
                    </div>

                    {/* 3-Column Core Metric Row: Compatibility Score, Partner 1 Placements, Partner 2 Placements */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                        {/* Overall Passion Card */}
                        <div className="md:col-span-4 bg-gradient-to-br from-rose-50 via-pink-50/60 to-red-50 border border-black p-4 rounded-2xl flex flex-col justify-between space-y-3">
                            <div className="flex items-center justify-between border-b border-rose-200/60 pb-2">
                                <span className="text-[16px] font-bold text-rose-950 uppercase tracking-wider flex items-center gap-1">
                                    <Flame className="w-4 h-4 text-rose-600 fill-rose-400" />
                                    <span>Chemistry Score</span>
                                </span>
                                <span className="text-2xl sm:text-3xl font-black font-serif text-rose-700">
                                    {result.compatibilityScore}%
                                </span>
                            </div>

                            <p className="text-[16px] text-neutral-900 font-medium leading-relaxed">
                                "{result.message}"
                            </p>

                            <div className="bg-white/80 border border-rose-200 px-3 py-1.5 rounded-xl flex items-center justify-between text-[14px] font-bold text-neutral-800">
                                <span>Vedic Romance Verdict:</span>
                                <span className="text-rose-700">
                                    {result.compatibilityScore >= 70 ? '★ Electric & Magnetic' : result.compatibilityScore >= 50 ? 'Harmonious & Tender' : 'Subtle (Requires Cultivation)'}
                                </span>
                            </div>
                        </div>

                        {/* Partner 1 Card */}
                        <div className="md:col-span-4 bg-white border border-rose-600 p-4 rounded-2xl flex flex-col justify-between space-y-2.5 shadow-xs">
                            <div className="flex items-center justify-between border-b border-rose-100 pb-2">
                                <span className="text-[16px] font-bold text-rose-950">
                                    Partner 1 Placements
                                </span>
                                <span className="text-[14px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                                    Venus + Mars
                                </span>
                            </div>

                            <div className="space-y-1.5 text-[16px]">
                                <div className="flex justify-between py-1 border-b border-stone-100 text-neutral-900">
                                    <span className="flex items-center gap-1">
                                        <Heart className="w-3.5 h-3.5 text-rose-500" /> Venus (शुक्र):
                                    </span>
                                    <span className="font-bold text-rose-800">{v1Meta.symbol} {result.venus1} ({v1Meta.element})</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-stone-100 text-neutral-900">
                                    <span className="flex items-center gap-1">
                                        <Flame className="w-3.5 h-3.5 text-red-500" /> Mars (मंगल):
                                    </span>
                                    <span className="font-bold text-red-700">{m1Meta.symbol} {result.mars1} ({m1Meta.element})</span>
                                </div>
                                <div className="flex justify-between py-1 text-neutral-900">
                                    <span>Romantic Style:</span>
                                    <span className="font-bold text-neutral-900">{v1Meta.element === 'Water' || v1Meta.element === 'Earth' ? 'Sensual & Loyal' : 'Passionate & Dynamic'}</span>
                                </div>
                            </div>

                            <div className="bg-rose-50/70 border border-rose-200 p-2 rounded-xl text-[14px] text-rose-950">
                                Governs tenderness, love languages, and personal desire expression.
                            </div>
                        </div>

                        {/* Partner 2 Card */}
                        <div className="md:col-span-4 bg-white border border-red-600 p-4 rounded-2xl flex flex-col justify-between space-y-2.5 shadow-xs">
                            <div className="flex items-center justify-between border-b border-red-100 pb-2">
                                <span className="text-[16px] font-bold text-red-950">
                                    Partner 2 Placements
                                </span>
                                <span className="text-[14px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                                    Venus + Mars
                                </span>
                            </div>

                            <div className="space-y-1.5 text-[16px]">
                                <div className="flex justify-between py-1 border-b border-stone-100 text-neutral-900">
                                    <span className="flex items-center gap-1">
                                        <Heart className="w-3.5 h-3.5 text-rose-500" /> Venus (शुक्र):
                                    </span>
                                    <span className="font-bold text-rose-800">{v2Meta.symbol} {result.venus2} ({v2Meta.element})</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-stone-100 text-neutral-900">
                                    <span className="flex items-center gap-1">
                                        <Flame className="w-3.5 h-3.5 text-red-500" /> Mars (मंगल):
                                    </span>
                                    <span className="font-bold text-red-700">{m2Meta.symbol} {result.mars2} ({m2Meta.element})</span>
                                </div>
                                <div className="flex justify-between py-1 text-neutral-900">
                                    <span>Romantic Style:</span>
                                    <span className="font-bold text-neutral-900">{v2Meta.element === 'Water' || v2Meta.element === 'Earth' ? 'Sensual & Loyal' : 'Passionate & Dynamic'}</span>
                                </div>
                            </div>

                            <div className="bg-red-50/70 border border-red-200 p-2 rounded-xl text-[14px] text-red-950">
                                Shapes intensity, responsiveness, and romantic compatibility.
                            </div>
                        </div>
                    </div>

                    {/* Elemental Harmony & Guidance Dynamics */}
                    <div className="bg-white border border-neutral-200/90 p-4 rounded-2xl shadow-xs space-y-3">
                        <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                            <div className="flex items-center gap-1.5">
                                <Compass className="w-4 h-4 text-rose-600" />
                                <h4 className="text-xs sm:text-[14px] font-bold font-serif text-neutral-900">
                                    Shukra-Mangal Energy Resonance & Intimacy Dynamics
                                </h4>
                            </div>
                            <span className="text-[14px] text-neutral-900 hidden sm:inline">Vedic Passion Harmony</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[16px]">
                            <div className="bg-stone-50 border border-neutral-200/80 p-3 rounded-xl space-y-1">
                                <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>आकर्षण एवं केमिस्ट्री (Passion & Magnetic Spark)</span>
                                </div>
                                <p className="text-neutral-900 leading-relaxed">
                                    शुक्र और मंगल का सकारात्मक संबंध रिश्ते में स्वाभाविक आकर्षण, रोमांस और शारीरिक केमिस्ट्री को दीर्घकाल तक प्रगाढ़ बनाए रखता है।
                                </p>
                            </div>

                            <div className="bg-stone-50 border border-neutral-200/80 p-3 rounded-xl space-y-1">
                                <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                                    <Heart className="w-3.5 h-3.5 text-rose-600" />
                                    <span>वैदिक प्रेम सूत्र (Vedic Guidance)</span>
                                </div>
                                <p className="text-neutral-900 leading-relaxed">
                                    प्रेम में कोमलता (शुक्र) और समर्पण (मंगल) का संतुलन ही दांपत्य को अमर बनाता है। एक-दूसरे की भावनाओं का आदर करने से आकर्षण नित्य नवीन रहता है।
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <button
                            onClick={reset}
                            className="flex items-center space-x-2 bg-gradient-to-r from-rose-500 via-pink-600 to-red-600 hover:from-rose-600 hover:to-red-700 text-white text-xs sm:text-sm font-bold py-2.5 px-6 rounded-xl shadow-sm transition-all cursor-pointer"
                        >
                            <RefreshCw className="w-6 h-6" />
                            <span>Calculate Another Match</span>
                        </button>
                        <Link
                            to="/book-appointment"
                            className="flex items-center space-x-2 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 text-xs sm:text-sm font-bold py-2.5 px-6 rounded-xl shadow-2xs transition-all cursor-pointer"
                        >
                            <Sparkles className="w-6 h-6 text-amber-600" />
                            <span>Book Passion & Relationship Consultation</span>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PassionCalculator;
