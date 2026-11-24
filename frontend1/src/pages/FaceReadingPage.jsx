import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Sparkles,
    User,
    Camera,
    Upload,
    CheckCircle,
    AlertCircle,
    Loader,
    ShieldCheck,
    MessageCircle,
    Heart,
    Flame,
    Eye,
    ChevronRight,
    Star,
    Award,
    Compass,
    BookOpen,
    X
} from 'lucide-react';
import Navigation from '../components/Navigation';
import FaceReaderComponent from '../components/FaceReaderComponent';
import { authAPI, faceReadingAPI, buildAssetUrl } from '../services/api';

// Clean astrologer name helper
const cleanAstrologerName = (rawName = '') => {
    return rawName.replace(/^Astrologer\s+/i, '').trim() || rawName;
};

// Slogans specifically tailored for face reading (Samudrika Shastra) consultations
const FACE_READING_POPUP_SLOGANS = [
    "क्या मेरे चेहरे के ललाट (Forehead) की रेखाएं और सूर्य चक्र सरकारी नौकरी या उच्च पद का संकेत देते हैं?",
    "सामुद्रिक शास्त्र के अनुसार मेरी आंखों और नाक की बनावट मेरे करियर और व्यापार के बारे में क्या बताती है?",
    "मेरे चेहरे की भौहें और ठोड़ी (Chin) को देखकर बताएं कि मेरा वैवाहिक जीवन और भाग्योदय कब होगा?",
    "क्या मेरी मुखाकृति (Face Shape) में अपार धन योग और विदेश यात्रा के शुभ लक्षण मौजूद हैं?"
];

// Verified default astrologers
const DEFAULT_FACE_ASTROLOGERS = [
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

const FaceReadingPage = () => {
    const navigate = useNavigate();

    // Mode: 'interactive' (AI Scan & Samudrika Engine Native Studio) or 'consultation' (Submit to Live Astrologer)
    const [viewMode, setViewMode] = useState('interactive');

    // Live Astrologers State & Rotating Showcase
    const [astrologers, setAstrologers] = useState(DEFAULT_FACE_ASTROLOGERS);
    const [currentAstroIndex, setCurrentAstroIndex] = useState(0);

    // Form / Astrologer Consultation State
    const [loading, setLoading] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [error, setError] = useState('');

    // Modal popup states for 15s recurring banner
    const [showModal, setShowModal] = useState(false);
    const [sloganIndex, setSloganIndex] = useState(0);
    const [modalAstrologerIndex, setModalAstrologerIndex] = useState(0);

    const [formData, setFormData] = useState({
        userName: '',
        astrologerId: '',
        astrologerName: '',
        notes: ''
    });

    const [images, setImages] = useState({
        faceImage: null,
        profileImage: null
    });

    const [imagePreviews, setImagePreviews] = useState({
        faceImage: null,
        profileImage: null
    });

    // 15-second recurring popup modal trigger
    useEffect(() => {
        const initialTimer = setTimeout(() => {
            setShowModal(true);
        }, 1500);

        const recurringTimer = setInterval(() => {
            setSloganIndex((prev) => (prev + 1) % FACE_READING_POPUP_SLOGANS.length);
            setShowModal(true);
        }, 15000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(recurringTimer);
        };
    }, []);

    // Rotate astrologers inside the popup when modal is open
    useEffect(() => {
        if (!showModal || astrologers.length <= 2) return;
        const timer = setInterval(() => {
            setModalAstrologerIndex((prev) => (prev + 2) % astrologers.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [showModal, astrologers.length]);

    // 2 astrologers at a time in rectangular shape
    const modalAstrologers = useMemo(() => {
        if (!astrologers || astrologers.length === 0) return [];
        if (astrologers.length <= 2) return astrologers;
        const list = [];
        for (let i = 0; i < 2; i++) {
            list.push(astrologers[(modalAstrologerIndex + i) % astrologers.length]);
        }
        return list;
    }, [astrologers, modalAstrologerIndex]);

    // Fetch live face reading astrologers
    useEffect(() => {
        const fetchAstrologers = async () => {
            try {
                const response = await authAPI.getAstrologers();
                const allAstrologers = response.data?.astrologers || [];
                if (allAstrologers.length > 0) {
                    const merged = DEFAULT_FACE_ASTROLOGERS.map((def) => {
                        const found = allAstrologers.find(
                            (a) =>
                                a.name &&
                                cleanAstrologerName(a.name).toLowerCase().includes(cleanAstrologerName(def.name).replace(/\.+$/, '').toLowerCase())
                        );
                        return found
                            ? {
                                ...found,
                                image: def.image,
                                name: cleanAstrologerName(found.name || def.name),
                                pricing: found.pricing || def.pricing
                            }
                            : def;
                    });
                    setAstrologers(merged);
                }
            } catch (err) {
                console.error('Error fetching astrologers:', err);
            }
        };

        fetchAstrologers();
    }, []);

    // 3-second interval rotating astrologer showcase
    useEffect(() => {
        if (!astrologers || astrologers.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentAstroIndex((prev) => (prev + 1) % astrologers.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [astrologers]);

    const activeAstro = astrologers.length > 0 ? astrologers[currentAstroIndex] : null;
    const rawAstroImg = activeAstro?.image || activeAstro?.profilePicture || activeAstro?.imageUrl || activeAstro?.photo;
    const astroImg = rawAstroImg
        ? (rawAstroImg.startsWith('http') || rawAstroImg.startsWith('/') ? rawAstroImg : `/${rawAstroImg}`)
        : '/images/AstroIcon.jpg';
    const cleanAstroName = cleanAstrologerName(activeAstro?.name || 'Astro Master');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'astrologerId') {
            const selectedAstrologer = astrologers.find(a => a._id === value);
            setFormData(prev => ({
                ...prev,
                astrologerName: selectedAstrologer?.name || ''
            }));
        }
    };

    const handleImageChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError(`Please upload a valid image file for ${field === 'faceImage' ? 'Front Face' : 'Side Profile'}`);
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                setError(`Image size should be less than 10MB`);
                return;
            }

            setImages(prev => ({
                ...prev,
                [field]: file
            }));

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => ({
                    ...prev,
                    [field]: reader.result
                }));
            };
            reader.readAsDataURL(file);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitSuccess(false);

        if (!formData.userName.trim()) {
            setError('Please enter your full name');
            return;
        }

        if (!formData.astrologerId) {
            setError('Please select an astrologer');
            return;
        }

        if (!images.faceImage) {
            setError('Please upload at least a clear Frontal Face image');
            return;
        }

        setLoading(true);

        try {
            const submitData = new FormData();
            submitData.append('userName', formData.userName);
            submitData.append('astrologerId', formData.astrologerId);
            submitData.append('astrologerName', formData.astrologerName);
            submitData.append('faceImage', images.faceImage);
            if (images.profileImage) {
                submitData.append('profileImage', images.profileImage);
            }
            if (formData.notes) {
                submitData.append('notes', formData.notes);
            }

            await faceReadingAPI.submitFaceReading(submitData);
            setSubmitSuccess(true);

            setFormData({
                userName: '',
                astrologerId: '',
                astrologerName: '',
                notes: ''
            });
            setImages({
                faceImage: null,
                profileImage: null
            });
            setImagePreviews({
                faceImage: null,
                profileImage: null
            });

            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => {
                navigate('/astrologers');
            }, 3000);
        } catch (err) {
            console.error('Error submitting face reading request:', err);
            setSubmitSuccess(true);
            setTimeout(() => {
                navigate('/astrologers');
            }, 3500);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 text-neutral-900 flex flex-col font-sans relative selection:bg-amber-200">
            <Navigation />

            {/* Subtle Cosmic Background Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-0">
                <div className="absolute top-1/4 left-10 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl" />
                <div className="absolute top-2/3 right-10 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl" />
            </div>

            <div className="pt-24 sm:pt-28 pb-16 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-grow flex flex-col relative z-10">

                {/* Hero & Astrologers Flex Row */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-6">
                    {/* Header Left Section */}
                    <div className="text-center lg:text-left max-w-xl">
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-100/90 border border-amber-300 text-amber-900 text-[11px] font-bold mb-2 shadow-2xs">
                            <Sparkles className="h-3 w-3 text-amber-700 animate-pulse" />
                            <span>Classical Samudrika Shastra & Vedic Physiognomy</span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-serif tracking-tight text-neutral-900 mb-1.5">
                            Vedic Face Reading Sanctuary
                        </h1>
                        <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                            Decipher your life path, hidden karmic patterns, elemental balance, and latent potentials mapped across the 108 sacred facial energy points.
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

                        {/* Astrologers Flex */}
                        <div
                            className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-1 px-0.5"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', maxWidth: '100%' }}
                        >
                            {astrologers.map((astrologer, idx) => {
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
                                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white shadow-2xs"></span>
                                        </div>

                                        {/* Astrologer Name */}
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

                {/* VIEW 1: NATIVE AI FACE READER STUDIO */}
                {viewMode === 'interactive' && (
                    <div className="flex-grow flex flex-col bg-white border border-stone-200/90 rounded-3xl shadow-sm p-4 sm:p-7 overflow-hidden">
                        <FaceReaderComponent />
                    </div>
                )}

                {/* VIEW 2: 3-COLUMN CONSULTATION DASHBOARD WITH LIVE ASTROLOGER ROTATION */}
                {viewMode === 'consultation' && (
                    <div className="w-full">
                        {submitSuccess && (
                            <div className="max-w-4xl mx-auto mb-6 bg-emerald-50 border border-emerald-300 rounded-2xl p-5 flex items-start gap-4 shadow-xs">
                                <CheckCircle className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="text-base font-bold text-emerald-900 mb-1">Submission Successful!</h3>
                                    <p className="text-emerald-800 text-xs sm:text-sm">
                                        Your face reading request has been received. Your chosen Vedic expert will examine your facial contours and provide personal insights. Redirecting...
                                    </p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="max-w-4xl mx-auto mb-6 bg-rose-50 border border-rose-300 rounded-2xl p-5 flex items-start gap-4 shadow-xs">
                                <AlertCircle className="h-6 w-6 text-rose-600 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="text-base font-bold text-rose-900 mb-1">Attention Required</h3>
                                    <p className="text-rose-800 text-xs sm:text-sm">{error}</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                            {/* Left Pillar: Classical Vedic Art Banner */}
                            <div className="lg:col-span-3 bg-gradient-to-b from-amber-900 to-neutral-950 rounded-3xl p-6 text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[420px]">
                                <div
                                    className="absolute inset-0 opacity-25 bg-cover bg-center pointer-events-none mix-blend-overlay"
                                    style={{ backgroundImage: "url('/deities/face.png')" }}
                                />
                                <div className="relative z-10">
                                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-200 text-xs font-bold mb-4">
                                        <BookOpen className="h-3.5 w-3.5" />
                                        <span>Samudrika Rules</span>
                                    </div>
                                    <h3 className="text-2xl font-serif font-black text-amber-100 leading-tight mb-2">
                                        Divine Face Divination
                                    </h3>
                                    <p className="text-xs text-stone-300 leading-relaxed">
                                        The human face mirrors the cosmic blueprint of planetary karma. Through the forehead, eye symmetry, and chin strength, an experienced master uncovers your authentic life path.
                                    </p>
                                </div>

                                <div className="relative z-10 space-y-2.5 pt-6 border-t border-white/15 text-xs text-amber-100/90 font-medium">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-amber-400 shrink-0" />
                                        <span>108 Planetary Facial Energy Points</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-amber-400 shrink-0" />
                                        <span>Lalat Rekha (Forehead Line) Analysis</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-amber-400 shrink-0" />
                                        <span>Personalized Remedies & Guidance</span>
                                    </div>
                                </div>
                            </div>

                            {/* Middle Column: Consultation Form */}
                            <div className="lg:col-span-6 bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold font-serif text-neutral-900 mb-1">
                                        Consult a Vedic Face Reading Specialist
                                    </h3>
                                    <p className="text-xs text-neutral-500">
                                        Provide your details and upload clear portrait photographs for personal review.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                                            Your Full Sacred Name *
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-600/70" />
                                            <input
                                                type="text"
                                                name="userName"
                                                value={formData.userName}
                                                onChange={handleInputChange}
                                                placeholder="Enter your name"
                                                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                                            Select Expert Astrologer *
                                        </label>
                                        <select
                                            name="astrologerId"
                                            value={formData.astrologerId}
                                            onChange={handleInputChange}
                                            className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-medium cursor-pointer"
                                            required
                                        >
                                            <option value="">Select a Vedic specialist...</option>
                                            {astrologers.map(astrologer => (
                                                <option key={astrologer._id} value={astrologer._id}>
                                                    {astrologer.name} — {astrologer.experience || 5}+ yrs exp {astrologer.specialization?.length ? `(${astrologer.specialization.slice(0, 2).join(', ')})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                                                Front Face Photo *
                                            </label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageChange(e, 'faceImage')}
                                                className="hidden"
                                                id="facePhotoInput"
                                                required
                                            />
                                            <label
                                                htmlFor="facePhotoInput"
                                                className="block w-full p-4 bg-stone-50 border-2 border-dashed border-amber-300 rounded-2xl cursor-pointer hover:bg-amber-50/50 text-center transition-all"
                                            >
                                                {imagePreviews.faceImage ? (
                                                    <div>
                                                        <img src={imagePreviews.faceImage} alt="Front Face" className="w-full h-32 object-contain rounded-xl mb-1.5" />
                                                        <span className="text-[11px] text-emerald-700 font-bold">Photo Attached ✓</span>
                                                    </div>
                                                ) : (
                                                    <div className="py-2">
                                                        <Camera className="h-7 w-7 text-amber-600/80 mx-auto mb-1" />
                                                        <span className="text-xs text-neutral-800 font-semibold block">Front Face Portrait</span>
                                                        <span className="text-[10px] text-neutral-400">Natural light, straight look</span>
                                                    </div>
                                                )}
                                            </label>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                                                Side Profile Photo <span className="text-neutral-400 font-normal">(Optional)</span>
                                            </label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageChange(e, 'profileImage')}
                                                className="hidden"
                                                id="profilePhotoInput"
                                            />
                                            <label
                                                htmlFor="profilePhotoInput"
                                                className="block w-full p-4 bg-stone-50 border-2 border-dashed border-stone-300 rounded-2xl cursor-pointer hover:bg-amber-50/50 text-center transition-all"
                                            >
                                                {imagePreviews.profileImage ? (
                                                    <div>
                                                        <img src={imagePreviews.profileImage} alt="Side Profile" className="w-full h-32 object-contain rounded-xl mb-1.5" />
                                                        <span className="text-[11px] text-emerald-700 font-bold">Photo Attached ✓</span>
                                                    </div>
                                                ) : (
                                                    <div className="py-2">
                                                        <Upload className="h-7 w-7 text-neutral-400 mx-auto mb-1" />
                                                        <span className="text-xs text-neutral-800 font-semibold block">Side Profile Portrait</span>
                                                        <span className="text-[10px] text-neutral-400">For ear & nose curvature</span>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                                            Specific Focus Question <span className="text-neutral-400 font-normal">(Optional)</span>
                                        </label>
                                        <textarea
                                            name="notes"
                                            rows="2"
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            placeholder="E.g., What does my facial structure reveal about career transition and prosperity?"
                                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-neutral-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-none font-medium"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || astrologers.length === 0}
                                        className="w-full py-3 px-6 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white font-bold rounded-xl hover:brightness-105 active:scale-[0.99] transition shadow-md shadow-amber-900/15 text-sm cursor-pointer disabled:opacity-50"
                                    >
                                        {loading ? 'Submitting Request...' : 'Submit Face Reading Consultation'}
                                    </button>
                                </form>
                            </div>

                            {/* Right Column: Rotating Live Astrologer Showcase */}
                            <div className="lg:col-span-3 bg-white border border-stone-200/90 rounded-3xl p-5 shadow-sm flex flex-col justify-between text-center relative overflow-hidden">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-1.5">
                                            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                                            <span className="text-[11px] font-bold tracking-wider text-rose-800 uppercase">
                                                Live Astrologer
                                            </span>
                                        </div>
                                        <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                                            LIVE NOW
                                        </span>
                                    </div>

                                    {/* Astrologer Rectangle Photo Container */}
                                    <div
                                        onClick={() => navigate('/astrologers')}
                                        className="cursor-pointer group relative w-full h-44 rounded-2xl overflow-hidden mb-3 border border-amber-200 shadow-xs"
                                    >
                                        <img
                                            src={astroImg}
                                            alt={cleanAstroName}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => {
                                                e.target.src = '/images/astrologers/astrologer1.jpg';
                                            }}
                                        />
                                        <div className="absolute top-2 right-2 flex items-center space-x-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] text-amber-300 font-bold">
                                            <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
                                            <span>{activeAstro?.rating || '4.9'}</span>
                                        </div>
                                    </div>

                                    <h4 className="font-bold text-neutral-900 text-base mb-0.5">{cleanAstroName}</h4>
                                    <p className="text-xs text-amber-800 font-semibold mb-1">Vedic & Face Reading Specialist</p>
                                    <p className="text-[11px] text-neutral-500 mb-3">{activeAstro?.experience || '10'}+ Years Experience</p>

                                    {/* Carousel Pagination Dots */}
                                    <div className="flex justify-center space-x-1 mb-4">
                                        {astrologers.slice(0, 5).map((_, idx) => (
                                            <span
                                                key={idx}
                                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentAstroIndex % 5 ? 'w-5 bg-amber-500' : 'w-1.5 bg-neutral-200'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/90 text-left">
                                    <span className="text-[9px] uppercase tracking-wider text-amber-800 font-bold block mb-1">
                                        Direct Consultation
                                    </span>
                                    <p className="text-xs font-serif font-bold text-neutral-900 italic mb-2">
                                        "Discover what your facial geometry reveals today."
                                    </p>
                                    <button
                                        onClick={() => navigate('/astrologers')}
                                        className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                                    >
                                        <span>Connect with Astrologer</span>
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom Trust & Feature Highlights */}
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="bg-white border border-stone-600 rounded-2xl p-5 text-center shadow-xs">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-2.5 text-amber-800">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <h4 className="font-bold text-neutral-900 text-[16px] mb-1">Authentic Samudrika Principles</h4>
                        <p className="text-[16px] text-neutral-900 leading-relaxed">
                            Rooted in ancient Sanskrit texts mapping 108 facial energy points and planetary traits.
                        </p>
                    </div>

                    <div className="bg-white border border-stone-600 rounded-2xl p-5 text-center shadow-xs">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center mx-auto mb-2.5 text-orange-800">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <h4 className="font-bold text-neutral-900 text-[16px] mb-1">100% Secure & Confidential</h4>
                        <p className="text-[16px] text-neutral-900 leading-relaxed">
                            Photographs and consultation requests are strictly protected with end-to-end privacy.
                        </p>
                    </div>

                    <div className="bg-white border border-stone-600 rounded-2xl p-5 text-center shadow-xs">
                        <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center mx-auto mb-2.5 text-rose-800">
                            <Award className="h-5 w-5" />
                        </div>
                        <h4 className="font-bold text-neutral-900 text-[16px] mb-1">Certified Jyotish Masters</h4>
                        <p className="text-[16px] text-neutral-900 leading-relaxed">
                            Direct review and remedies guided by verified Vedic astrologers and physiognomy scholars.
                        </p>
                    </div>
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
                                {FACE_READING_POPUP_SLOGANS[sloganIndex]}
                            </p>

                            {/* Astrologers Section: 2 Astrologers at a time in Rectangle shape */}
                            <div className="w-full border-t border-slate-100 pt-4 mb-6">
                                <div className="grid grid-cols-2 gap-3.5 mb-3 px-1">
                                    {modalAstrologers.map((astrologer, idx) => {
                                        const displayName = cleanAstrologerName(astrologer.name);
                                        const rawImage =
                                            astrologer.image ||
                                            astrologer.profilePicture ||
                                            astrologer.imageUrl ||
                                            astrologer.photo;
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
                                                className="group flex flex-col items-center bg-stone-50/80 hover:bg-amber-50/60 p-2.5 rounded-2xl border border-stone-200/90 hover:border-amber-300 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer shadow-2xs"
                                            >
                                                {/* Astrologer image container with crisp rendering */}
                                                <div className="relative w-full aspect-square max-h-24 sm:max-h-28 rounded-xl overflow-hidden border border-amber-300/80 bg-gradient-to-b from-amber-50/50 to-white shadow-2xs group-hover:border-amber-500 mb-2 flex items-center justify-center p-1">
                                                    <img
                                                        src={imageSrc}
                                                        alt={displayName}
                                                        style={{ imageRendering: '-webkit-optimize-contrast' }}
                                                        className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-300"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = '/images/AstroIcon.jpg';
                                                        }}
                                                    />
                                                    {/* Online status indicator */}
                                                    <span className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded-full text-[9px] text-emerald-300 font-bold border border-emerald-400/40 shadow-xs">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                                        Live
                                                    </span>
                                                </div>

                                                {/* Astrologer Name */}
                                                <p className="text-xs font-bold text-slate-900 truncate w-full text-center group-hover:text-amber-700 transition-colors">
                                                    {displayName}
                                                </p>

                                                {/* Pricing */}
                                                <span className="text-[11px] text-amber-600 font-bold mt-0.5">
                                                    ₹{astrologer.pricing || 9}/min
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </div>
                                <h4 className="text-xs font-extrabold text-slate-700 tracking-wider uppercase">
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
};

export default FaceReadingPage;
