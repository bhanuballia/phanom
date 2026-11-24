import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Upload,
    RefreshCw,
    AlertCircle,
    Camera,
    Sparkles,
    Hand,
    CheckCircle2,
    ChevronRight,
    Info,
    ShieldCheck,
    Award,
    Heart,
    Briefcase,
    Coins,
    Compass,
    Radio,
    X
} from 'lucide-react';
import Navigation from '../components/Navigation';
import PalmImageOverlay from '../components/PalmImageOverlay';
import { PYTHON_ASTRO_URL, authAPI, buildAssetUrl } from '../services/api';

// Helper to strip "Astrologer" / "Astrologer " prefix from name
const cleanAstrologerName = (rawName = '') => {
    return rawName.replace(/^Astrologer\s+/i, '').trim() || rawName;
};

// Slogans specifically tailored for palmistry consultations
const PALMISTRY_POPUP_SLOGANS = [
    "मेरी हथेली में भाग्य रेखा (Fate Line) कैसी है और सरकारी नौकरी के क्या योग हैं?",
    "मेरी कुंडली के अनुसार कौन सा व्यवसाय (Business) या नौकरी मेरे लिए सबसे शुभ रहेगी?",
    "मेरी जीवन रेखा और सूर्य पर्वत (Sun Mount) को देखकर बताएं कि मुझे कार्यक्षेत्र में सफलता कब मिलेगी?",
    "क्या मेरी कुंडली या हाथ की रेखाओं में विदेश यात्रा (Foreign Travel) या विदेश में बसने के योग हैं?"
];

// Default list matching the exact 9 live astrologers
const DEFAULT_PALMISTRY_ASTROLOGERS = [
    { _id: 'astro-1', name: 'Hony Singh K...', pricing: 16, isAvailable: true, image: '/images/astrologers/hony-singh.jpg' },
    { _id: 'astro-2', name: 'Kamal', pricing: 9, isAvailable: true, image: '/images/astrologers/kamal.jpg' },
    { _id: 'astro-3', name: 'Krishana', pricing: 9, isAvailable: true, image: '/images/astrologers/krishana.jpg' },
    { _id: 'astro-4', name: 'Monika Tyagi', pricing: 14, isAvailable: true, image: '/images/astrologers/monika-tyagi.jpg' },
    { _id: 'astro-5', name: 'Poonam', pricing: 9, isAvailable: true, image: '/images/astrologers/poonam.jpg' },
    { _id: 'astro-6', name: 'PreetPal', pricing: 9, isAvailable: true, image: '/images/astrologers/preetpal.jpg' },
    { _id: 'astro-7', name: 'Ravi Jhangra', pricing: 9, isAvailable: true, image: '/images/astrologers/ravi-jhangra.jpg' },
    { _id: 'astro-8', name: 'Ritu Saini', pricing: 12, isAvailable: true, image: '/images/astrologers/ritu-saini.jpg' },
    { _id: 'astro-9', name: 'Sarika', pricing: 9, isAvailable: true, image: '/images/astrologers/sarika.jpg' }
];

export default function PalmistryCalculator() {
    const [leftImage, setLeftImage] = useState(null);
    const [rightImage, setRightImage] = useState(null);
    const [leftPreviewUrl, setLeftPreviewUrl] = useState(null);
    const [rightPreviewUrl, setRightPreviewUrl] = useState(null);

    const [loading, setLoading] = useState(false);
    const [reading, setReading] = useState(null);
    const [error, setError] = useState(null);

    const [activeTab, setActiveTab] = useState('left'); // 'left' or 'right'
    const [activeItem, setActiveItem] = useState(null);
    const [gender, setGender] = useState('male'); // 'male' or 'female'

    const [liveAstrologers, setLiveAstrologers] = useState(DEFAULT_PALMISTRY_ASTROLOGERS);

    // Modal popup states
    const [showModal, setShowModal] = useState(false);
    const [sloganIndex, setSloganIndex] = useState(0);
    const [modalAstrologerIndex, setModalAstrologerIndex] = useState(0);

    const leftFileInputRef = useRef(null);
    const rightFileInputRef = useRef(null);

    // Initial popup display and recurring trigger every 15 seconds
    useEffect(() => {
        // Show after initial delay
        const initialTimer = setTimeout(() => {
            setShowModal(true);
        }, 1500);

        // Every 15 seconds, cycle to the next slogan and show modal
        const recurringTimer = setInterval(() => {
            setSloganIndex((prev) => (prev + 1) % PALMISTRY_POPUP_SLOGANS.length);
            setShowModal(true);
        }, 15000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(recurringTimer);
        };
    }, []);

    // Rotate astrologers inside the popup when modal is visible
    useEffect(() => {
        if (!showModal || liveAstrologers.length <= 3) return;
        const timer = setInterval(() => {
            setModalAstrologerIndex((prev) => (prev + 1) % liveAstrologers.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [showModal, liveAstrologers.length]);

    // 3 astrologers for the popup modal
    const modalAstrologers = useMemo(() => {
        if (!liveAstrologers || liveAstrologers.length === 0) return [];
        if (liveAstrologers.length <= 3) return liveAstrologers;
        const list = [];
        for (let i = 0; i < 3; i++) {
            list.push(liveAstrologers[(modalAstrologerIndex + i) % liveAstrologers.length]);
        }
        return list;
    }, [liveAstrologers, modalAstrologerIndex]);

    useEffect(() => {
        const fetchAstrologers = async () => {
            try {
                const response = await authAPI.getAstrologers();
                const apiAstros = response.data?.astrologers || [];
                if (apiAstros.length > 0) {
                    // Merge API astrologers prioritizing image matches
                    const merged = DEFAULT_PALMISTRY_ASTROLOGERS.map((def) => {
                        const found = apiAstros.find(
                            (a) =>
                                a.name &&
                                cleanAstrologerName(a.name).toLowerCase().includes(cleanAstrologerName(def.name).replace(/\.+$/, '').toLowerCase())
                        );
                        return found
                            ? {
                                ...found,
                                image: def.image, // retain verified crisp avatar
                                name: cleanAstrologerName(found.name || def.name),
                                pricing: found.pricing || def.pricing
                            }
                            : def;
                    });
                    setLiveAstrologers(merged);
                }
            } catch (e) {
                // Fallback to DEFAULT_PALMISTRY_ASTROLOGERS
            }
        };
        fetchAstrologers();
    }, []);

    const handleFileSelect = (event, side) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                setError('Image size should be less than 10MB');
                return;
            }

            if (side === 'left') {
                setLeftImage(file);
                setLeftPreviewUrl(URL.createObjectURL(file));
            } else {
                setRightImage(file);
                setRightPreviewUrl(URL.createObjectURL(file));
            }

            setReading(null);
            setError(null);
        }
    };

    const handleAnalyze = async () => {
        if (!leftImage || !rightImage) {
            setError("Please upload both Left and Right palm images.");
            return;
        }

        setLoading(true);
        setError(null);
        setReading(null);

        const formData = new FormData();
        formData.append('left_hand', leftImage);
        formData.append('right_hand', rightImage);

        try {
            const targetUrl = PYTHON_ASTRO_URL
                ? `${PYTHON_ASTRO_URL}/api/palmistry/analyze`
                : '/api/palmistry/analyze';

            const response = await fetch(targetUrl, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                if (errorData && errorData.detail) {
                    throw new Error(errorData.detail);
                }
                throw new Error('Failed to analyze palm. Please make sure the palms are flat and lines are clearly lit.');
            }

            const data = await response.json();
            setReading(data);

            // Automatically switch to the active hand tab based on gender
            setActiveTab(gender === 'male' ? 'right' : 'left');
        } catch (err) {
            console.error('Error during palm analysis:', err);
            setError(err.message || 'An unexpected error occurred during palmistry analysis.');
        } finally {
            setLoading(false);
        }
    };

    const resetState = () => {
        setLeftImage(null);
        setRightImage(null);
        setLeftPreviewUrl(null);
        setRightPreviewUrl(null);
        setReading(null);
        setError(null);
        if (leftFileInputRef.current) leftFileInputRef.current.value = '';
        if (rightFileInputRef.current) rightFileInputRef.current.value = '';
    };

    return (
        <div className="min-h-screen bg-stone-50 text-neutral-900 flex flex-col font-sans relative selection:bg-amber-200">
            <Navigation />

            {/* Subtle Warm Background Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-0">
                <div className="absolute top-1/4 left-10 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl" />
                <div className="absolute top-2/3 right-10 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl" />
            </div>

            <div className="pt-24 sm:pt-28 pb-16 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-grow flex flex-col relative z-10">
                {/* Header & Astrologers Flex Row */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-6">
                    {/* Header Left Section */}
                    <div className="text-center lg:text-left max-w-xl">
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-100/90 border border-amber-300 text-amber-900 text-[11px] font-bold mb-2 shadow-2xs">
                            <Sparkles className="h-3 w-3 text-amber-700 animate-pulse" />
                            <span>Classical Hast Rekha Shastra</span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-serif tracking-tight text-neutral-900 mb-1.5">
                            Vedic Palmistry Calculator
                        </h1>
                        <p className="text-neutral-900 text-xs sm:text-[14px] leading-relaxed">
                            Upload clear photographs of your palms for automated astrological Hast Rekha reading, mapping major lifeline contours, planetary mounts, and karmic potentials.
                        </p>
                    </div>

                    {/* Separate Section on Right: Astrologers Horizontal Flex */}
                    <div className="w-full lg:w-auto shrink-0 bg-white/95 backdrop-blur-xs border border-amber-200/80 rounded-2xl p-3 shadow-xs">
                        <div className="flex items-center justify-between gap-3 mb-2 px-1">
                            <div className="flex items-center gap-1.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-800">
                                    Live Astrologers
                                </span>
                            </div>
                            <Link
                                to="/live-astrologers"
                                className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center transition-colors"
                            >
                                <span>View All</span>
                                <ChevronRight className="h-3 w-3 ml-0.5" />
                            </Link>
                        </div>

                        {/* Astrologers Flex matching attached image */}
                        <div
                            className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-1 px-0.5"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', maxWidth: '100%' }}
                        >
                            {liveAstrologers.map((astrologer, idx) => {
                                const displayName = cleanAstrologerName(astrologer.name);
                                const rate = astrologer.pricing || 9;
                                const avatarUrl = astrologer.image || astrologer.profilePicture || '/images/AstroIcon.jpg';

                                return (
                                    <Link
                                        key={astrologer._id || idx}
                                        to="/live-astrologers"
                                        state={{ astrologer }}
                                        className="group shrink-0 flex flex-col items-center text-center cursor-pointer transition-transform duration-150 hover:-translate-y-1 focus:outline-none"
                                        style={{ width: '64px' }}
                                        title={`Consult ${displayName}`}
                                    >
                                        {/* Golden Circle Avatar with Green Online Dot */}
                                        <div className="relative mb-1">
                                            <div className="w-12 h-12 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-500 shadow-2xs group-hover:shadow-md transition-all">
                                                <div className="w-full h-full rounded-full overflow-hidden bg-white">
                                                    <img
                                                        src={avatarUrl}
                                                        alt={displayName}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                        onError={(e) => {
                                                            e.target.src = '/images/AstroIcon.jpg';
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            {/* Live Online Dot */}
                                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white shadow-2xs"></span>
                                        </div>

                                        {/* Astrologer Name (Cleaned without "Astrologer" prefix) */}
                                        <span className="font-semibold text-[11px] text-neutral-900 group-hover:text-amber-600 transition-colors truncate w-full leading-tight block">
                                            {displayName}
                                        </span>

                                        {/* Price per minute */}
                                        <span className="text-[10px] text-neutral-500 font-medium block">
                                            ₹{rate}/min
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Dual Layout: Left Upload Studio, Right Guidelines / Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-start">
                    {/* Left Canvas: Upload, Gender, Analysis Action */}
                    <div className="lg:col-span-7 bg-white border border-stone-600 rounded-3xl p-5 sm:p-7 shadow-xs">
                        {/* Gender Selection */}
                        <div className="mb-6 flex flex-col items-center border-b border-stone-100 pb-5">
                            <h3 className="text-[16px] font-bold uppercase tracking-wider text-black mb-2">
                                Select Gender for Active Vedic Hand Calibration
                            </h3>
                            <div className="inline-flex p-1 bg-stone-100 rounded-2xl border border-stone-200">
                                <button
                                    type="button"
                                    onClick={() => setGender('male')}
                                    className={`px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${gender === 'male'
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                                        : 'text-neutral-900 hover:text-neutral-900'
                                        }`}
                                >
                                    Male (Right Hand Active)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setGender('female')}
                                    className={`px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${gender === 'female'
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                                        : 'text-neutral-900 hover:text-neutral-900'
                                        }`}
                                >
                                    Female (Left Hand Active)
                                </button>
                            </div>
                            <p className="text-[14px] text-neutral-900 mt-2 text-center max-w-md">
                                In Vedic Hast Rekha, primary life karma is read from the <strong>Right Hand for males</strong> and the <strong>Left Hand for females</strong>. Please upload both hands for dual comparative synthesis.
                            </p>
                        </div>

                        {/* Two Palm Upload Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Left Hand */}
                            <div className="flex flex-col gap-1.5">
                                <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                                    <Hand className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Left Hand Palm</span>
                                </span>
                                {!leftPreviewUrl ? (
                                    <div
                                        onClick={() => leftFileInputRef.current?.click()}
                                        className="border-2 border-dashed border-amber-300 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer hover:bg-amber-50/50 hover:border-amber-400 transition-all bg-stone-50/60 h-48 text-center"
                                    >
                                        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-2 text-amber-700">
                                            <Upload className="w-5 h-5 animate-pulse" />
                                        </div>
                                        <span className="text-xs font-bold text-neutral-800 block">Upload Left Palm</span>
                                        <span className="text-[12px] text-neutral-900 mt-0.5">Clear flat photo (JPG/PNG)</span>
                                    </div>
                                ) : (
                                    <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-neutral-950 flex justify-center h-48 shadow-inner">
                                        <img src={leftPreviewUrl} alt="Left Palm Preview" className="h-full object-contain" />
                                        <button
                                            type="button"
                                            onClick={() => { setLeftImage(null); setLeftPreviewUrl(null); }}
                                            className="absolute top-2 right-2 bg-neutral-900/80 hover:bg-rose-600 text-white p-1.5 rounded-full backdrop-blur-sm transition-colors text-xs"
                                            title="Remove Left Palm"
                                        >
                                            ✕
                                        </button>
                                        <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                                            Left Hand
                                        </span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={leftFileInputRef}
                                    onChange={(e) => handleFileSelect(e, 'left')}
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                />
                            </div>

                            {/* Right Hand */}
                            <div className="flex flex-col gap-1.5">
                                <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                                    <Hand className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Right Hand Palm</span>
                                </span>
                                {!rightPreviewUrl ? (
                                    <div
                                        onClick={() => rightFileInputRef.current?.click()}
                                        className="border-2 border-dashed border-amber-300 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer hover:bg-amber-50/50 hover:border-amber-400 transition-all bg-stone-50/60 h-48 text-center"
                                    >
                                        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-2 text-amber-700">
                                            <Upload className="w-5 h-5 animate-pulse" />
                                        </div>
                                        <span className="text-xs font-bold text-neutral-800 block">Upload Right Palm</span>
                                        <span className="text-[12px] text-neutral-900 mt-0.5">Clear flat photo (JPG/PNG)</span>
                                    </div>
                                ) : (
                                    <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-neutral-950 flex justify-center h-48 shadow-inner">
                                        <img src={rightPreviewUrl} alt="Right Palm Preview" className="h-full object-contain" />
                                        <button
                                            type="button"
                                            onClick={() => { setRightImage(null); setRightPreviewUrl(null); }}
                                            className="absolute top-2 right-2 bg-neutral-900/80 hover:bg-rose-600 text-white p-1.5 rounded-full backdrop-blur-sm transition-colors text-xs"
                                            title="Remove Right Palm"
                                        >
                                            ✕
                                        </button>
                                        <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                                            Right Hand
                                        </span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={rightFileInputRef}
                                    onChange={(e) => handleFileSelect(e, 'right')}
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleAnalyze}
                            disabled={!leftImage || !rightImage || loading}
                            className={`w-full mt-6 py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-900/10 cursor-pointer ${!leftImage || !rightImage || loading
                                ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                                : 'bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 hover:brightness-105 active:scale-[0.99] text-white'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span>Analyzing Both Palms via Hast Rekha Engine...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    <span>Analyze Both Palms (Hast Rekha)</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Right Column: Photography Guidelines & Hast Rekha Overview */}
                    <div className="lg:col-span-5 bg-white border border-stone-600 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                                    <Camera className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold font-serif text-base text-neutral-900 leading-tight">
                                        Palm Photography Guidelines
                                    </h3>
                                    <p className="text-[16px] text-neutral-900">Ensure optimal detection for Hast Rekha overlay</p>
                                </div>
                            </div>

                            <div className="space-y-2.5 text-[14px] text-neutral-900">
                                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70">
                                    <strong className="text-neutral-900 block mb-0.5">☀️ Natural Daylight Lighting</strong>
                                    <span>Avoid harsh flash glare or deep shadows across the palm crease.</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70">
                                    <strong className="text-neutral-900 block mb-0.5">🖐️ Flat Palm & Separated Fingers</strong>
                                    <span>Keep hand flat with fingers slightly parted and wrist clearly in frame.</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70">
                                    <strong className="text-neutral-900 block mb-0.5">📷 Top-Down Vertical Angle</strong>
                                    <span>Align camera parallel to the palm surface to preserve true geometrical ratios.</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-[16px] text-neutral-900">
                            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5" /> High-Resolution Line Mapping
                            </span>
                            <span>100% Private</span>
                        </div>
                    </div>
                </div>

                {/* RESULTS SECTION */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/90 flex flex-col">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 pb-4 border-b border-stone-200">
                        <h2 className="text-xl font-bold font-serif text-neutral-900 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-600" />
                            <span>Hast Rekha Analysis Results</span>
                        </h2>

                        {reading && (
                            <div className="inline-flex rounded-xl bg-stone-100 p-1 border border-stone-200 text-xs font-bold">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('left')}
                                    className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${activeTab === 'left' ? 'bg-amber-500 text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                                        }`}
                                >
                                    Left Hand {gender === 'female' ? '(Active)' : ''}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('right')}
                                    className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${activeTab === 'right' ? 'bg-amber-500 text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                                        }`}
                                >
                                    Right Hand {gender === 'male' ? '(Active)' : ''}
                                </button>
                            </div>
                        )}
                    </div>

                    {!reading && !loading && (
                        <div className="flex flex-col items-center justify-center text-center py-8">
                            <div className="w-16 h-16 rounded-3xl bg-amber-100 flex items-center justify-center text-3xl mb-4 text-amber-800 shadow-2xs">
                                🖐️
                            </div>
                            <h4 className="text-base font-bold text-neutral-900 mb-1">Upload Palms for Instant Hast Rekha Reading</h4>
                            <p className="text-[14px] text-neutral-900 max-w-md mb-8">
                                Your uploaded images will be analyzed for major lifelines, planetary mounts, and key life dimensions.
                            </p>

                            {/* Informative Life Topics Reference Grid */}
                            <div className="w-full bg-stone-50 border border-stone-600 rounded-2xl p-6 text-left">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-4 pb-2 border-b border-stone-200 flex items-center gap-2">
                                    <Compass className="w-4 h-4 text-amber-600" />
                                    <span>Key Life Dimensions Analyzed in Hast Rekha</span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-[16px] text-neutral-700">
                                    <div className="p-3 bg-white rounded-xl border border-stone-200/60">
                                        <span className="font-bold text-emerald-800 block mb-0.5">🔎 Health & Longevity (Ayur)</span>
                                        <span className="text-[14px] text-neutral-900">Life Line (Ayu Rekha) vitality and major life energy cycles.</span>
                                    </div>
                                    <div className="p-3 bg-white rounded-xl border border-stone-200/60">
                                        <span className="font-bold text-amber-800 block mb-0.5">📊 Wealth & Finance (Vitta)</span>
                                        <span className="text-[14px] text-neutral-900">Fate Line (Bhagya Rekha) and Mount of Jupiter/Mercury stability.</span>
                                    </div>
                                    <div className="p-3 bg-white rounded-xl border border-stone-200/60">
                                        <span className="font-bold text-indigo-800 block mb-0.5">📈 Career & Status (Karma)</span>
                                        <span className="text-[14px] text-neutral-900">Sun Line (Surya Rekha) authority, leadership, and public recognition.</span>
                                    </div>
                                    <div className="p-3 bg-white rounded-xl border border-stone-200/60">
                                        <span className="font-bold text-blue-800 block mb-0.5">💡 Mindset & Intellect (Buddhi)</span>
                                        <span className="text-[14px] text-neutral-900">Head Line (Buddhi Rekha) reasoning, strategic focus, and memory.</span>
                                    </div>
                                    <div className="p-3 bg-white rounded-xl border border-stone-200/60">
                                        <span className="font-bold text-rose-800 block mb-0.5">✨ Relationships & Marriage (Vivaha)</span>
                                        <span className="text-[14px] text-neutral-900">Heart Line (Hridaya Rekha) emotional depth and marital harmony.</span>
                                    </div>
                                    <div className="p-3 bg-white rounded-xl border border-stone-200/60">
                                        <span className="font-bold text-purple-800 block mb-0.5">💰 Dhan Yog (Wealth Triangles)</span>
                                        <span className="text-[14px] text-neutral-900">Money Triangle formed by intersecting Fate, Head, and Mercury lines.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div className="py-12 flex flex-col items-center justify-center space-y-4">
                            <RefreshCw className="w-8 h-8 text-amber-600 animate-spin" />
                            <p className="text-sm font-bold text-neutral-800">Analyzing Palm Creases & Planetary Mounts...</p>
                            <p className="text-xs text-neutral-500">Detecting Ayu, Bhagya, Buddhi, and Hridaya Rekha configurations</p>
                        </div>
                    )}

                    {reading && (() => {
                        const currentReading = activeTab === 'left' ? reading.left_hand_reading : reading.right_hand_reading;
                        if (!currentReading) return null;

                        return (
                            <div className="space-y-6">
                                {/* Visual Overlay Canvas */}
                                <div className="w-full max-w-xs mx-auto">
                                    <PalmImageOverlay
                                        imageUrl={activeTab === 'left' ? leftPreviewUrl : rightPreviewUrl}
                                        reading={
                                            (gender === 'male' && activeTab === 'right') || (gender === 'female' && activeTab === 'left')
                                                ? currentReading
                                                : null
                                        }
                                        activeItem={activeItem}
                                    />
                                </div>

                                {/* Overall Summary Card */}
                                <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-2xl p-6 shadow-md">
                                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span>Overall Summary ({activeTab === 'left' ? 'Left' : 'Right'} Hand)</span>
                                    </div>
                                    <p className="text-sm sm:text-base leading-relaxed text-emerald-50/90 font-medium">
                                        {currentReading.overall_summary}
                                    </p>
                                </div>

                                {/* Key Life Topics */}
                                {currentReading.key_topics && currentReading.key_topics.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-base font-bold font-serif text-neutral-900 border-b border-neutral-200 pb-2">
                                            Key Life Topics Interpreted
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {currentReading.key_topics.map((topic, idx) => (
                                                <div key={idx} className="bg-stone-50 border border-amber-600 rounded-2xl p-4 shadow-2xs">
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <span className="text-xl">{topic.icon}</span>
                                                        <h4 className="font-bold text-[16px] text-neutral-900">{topic.topic}</h4>
                                                    </div>
                                                    <p className="text-[14px] text-neutral-900 leading-relaxed font-medium">{topic.interpretation}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Major Rekhas / Lines */}
                                {currentReading.lines && (
                                    <div className="space-y-3">
                                        <h3 className="text-base font-bold font-serif text-neutral-900 border-b border-stone-200 pb-2">
                                            Major Lines (Rekhas)
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {currentReading.lines.map((line, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`rounded-2xl p-4 border transition-all cursor-default ${activeItem === line.name
                                                        ? 'border-amber-400 bg-amber-50/50 shadow-xs'
                                                        : 'border-stone-600 bg-stone-50/60 hover:border-stone-300'
                                                        }`}
                                                    onMouseEnter={() => setActiveItem(line.name)}
                                                    onMouseLeave={() => setActiveItem(null)}
                                                >
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <span className="text-amber-700 text-sm font-bold">〰️</span>
                                                        <h4 className="font-bold text-[16px] text-neutral-900">{line.name}</h4>
                                                    </div>
                                                    <p className="text-[16px] text-neutral-900 leading-relaxed font-medium">{line.interpretation}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Planetary Mounts */}
                                {currentReading.mounts && (
                                    <div className="space-y-3">
                                        <h3 className="text-base font-bold font-serif text-neutral-900 border-b border-stone-200 pb-2">
                                            Planetary Mounts (Graha Parvat)
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {currentReading.mounts.map((mount, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`rounded-2xl p-4 border transition-all cursor-default ${activeItem === mount.name
                                                        ? 'border-purple-600 bg-purple-50/50 shadow-xs'
                                                        : 'border-lime-600 bg-stone-50/60 hover:border-stone-300'
                                                        }`}
                                                    onMouseEnter={() => setActiveItem(mount.name)}
                                                    onMouseLeave={() => setActiveItem(null)}
                                                >
                                                    <h4 className="font-bold text-[16px] text-purple-950 mb-1">{mount.name}</h4>
                                                    <p className="text-[16px] text-neutral-900 leading-relaxed font-medium">{mount.interpretation}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Periodic Consult Expert Astrologer Pop-up Modal (Every 15 Seconds) */}
            {showModal && (
                <div
                    onClick={() => setShowModal(false)}
                    className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 cursor-pointer"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-visible text-slate-900 animate-in fade-in zoom-in-95 duration-200 cursor-default"
                    >
                        {/* Top Golden/Yellow Header with Overlapping Avatar */}
                        <div className="bg-gradient-to-b from-amber-400 to-yellow-500 rounded-t-3xl pt-14 pb-5 px-6 relative text-center">
                            {/* Close Button */}
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 text-white hover:text-amber-100 transition-colors bg-black/25 hover:bg-black/40 p-1.5 rounded-full cursor-pointer z-10"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            {/* Overlapping Spiritual Avatar Image Circle */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border-4 border-amber-400 bg-white overflow-hidden shadow-lg flex items-center justify-center">
                                <img
                                    src="/images/ganeshji.jpg"
                                    alt="Vedic Guru & Ganesha"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/images/AstroIcon.jpg";
                                    }}
                                />
                            </div>
                        </div>

                        {/* Modal Body Content */}
                        <div className="px-6 pb-8 pt-6 text-center flex flex-col items-center">
                            {/* Main Slogan text (Rotating every 15s) */}
                            <p className="text-base sm:text-lg font-bold text-amber-700 leading-relaxed mb-5 min-h-[58px] flex items-center justify-center">
                                {PALMISTRY_POPUP_SLOGANS[sloganIndex]}
                            </p>

                            {/* Astrologers Section */}
                            <div className="w-full border-t border-slate-100 pt-4 mb-6">
                                <div className="flex justify-center items-start gap-4 sm:gap-6 mb-3 px-1">
                                    {modalAstrologers.map((astrologer, idx) => {
                                        const displayName = cleanAstrologerName(astrologer.name);
                                        const rawImage =
                                            astrologer.image ||
                                            astrologer.profilePicture ||
                                            astrologer.imageUrl ||
                                            astrologer.photo;
                                        // If path starts with '/' or 'http', use directly; otherwise resolve via buildAssetUrl
                                        const imageSrc = rawImage
                                            ? (rawImage.startsWith('/') || rawImage.startsWith('http')
                                                ? rawImage
                                                : buildAssetUrl(rawImage))
                                            : '/images/AstroIcon.jpg';

                                        return (
                                            <Link
                                                key={`${astrologer._id || idx}-${modalAstrologerIndex}`}
                                                to="/live-astrologers"
                                                state={{ astrologer }}
                                                onClick={() => setShowModal(false)}
                                                className="group flex flex-col items-center w-20 sm:w-22 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
                                            >
                                                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-amber-400 p-0.5 bg-white overflow-hidden shadow-sm group-hover:border-amber-500">
                                                    <img
                                                        src={imageSrc}
                                                        alt={displayName}
                                                        className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = '/images/AstroIcon.jpg';
                                                        }}
                                                    />
                                                    <span className="absolute bottom-0 right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-xs"></span>
                                                </div>
                                                <p className="text-[14px] font-bold text-slate-800 mt-1.5 truncate w-full text-center group-hover:text-amber-600 transition-colors">
                                                    {displayName}
                                                </p>

                                            </Link>
                                        );
                                    })}
                                </div>
                                <h4 className="text-[14px] font-extrabold text-slate-700 tracking-wider uppercase">
                                    Consult Expert Astrologers
                                </h4>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 w-full">
                                <Link
                                    to="/live-astrologers"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-center text-xs sm:text-sm shadow-md transition-all active:scale-[0.98]"
                                >
                                    Live Astrologers
                                </Link>
                                <Link
                                    to="/live-chat"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-center text-xs sm:text-sm shadow-md transition-all active:scale-[0.98]"
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
}
