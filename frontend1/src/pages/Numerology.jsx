import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import {
  User,
  Calendar,
  Sparkles,
  Calculator,
  BookOpen,
  Compass,
  Star,
  Award,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Flame,
  MessageCircle,
  PhoneCall,
  CalendarCheck,
  Radio,
  ChevronDown,
  FileText,
  Download,
  Check,
  X
} from 'lucide-react';
import axios from 'axios';
import { VEDIC_ASTROLOGY_BASE_URL } from '../services/api';

// Astrologer display helper
const cleanAstrologerName = (rawName = '') => {
  return rawName.replace(/^Astrologer\s+/i, '').trim() || rawName;
};

// Slogans for Numerology Consultations
const NUMEROLOGY_POPUP_SLOGANS = [
  "मेरे नामांक (Name Number) और मूलांक के अनुसार व्यापार और करियर में कब बड़ी तरक्की होगी?",
  "क्या मेरी जन्मतिथि के अनुसार मेरा लकी नंबर, लकी रंग और शुभ दिशा सही है?",
  "अंक ज्योतिष के अनुसार क्या मेरा नया नाम या मोबाइल नंबर मेरे भाग्योदय में सहायक रहेगा?",
  "मूलांक और भाग्यांक के तालमेल से जानें कि विदेश यात्रा और धन लाभ के क्या योग हैं?"
];

// Default 9 verified live astrologers
const DEFAULT_NUMEROLOGY_ASTROLOGERS = [
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

const NUMEROLOGY_SYSTEMS = [
  {
    number: "1-9",
    title: "Chaldean & Pythagorean",
    desc: "Ancient sound frequencies & vibrations mapping letters to cosmic numbers.",
    icon: Star,
    badge: "Dual Systems"
  },
  {
    number: "3x3",
    title: "Loshu Magic Grid",
    desc: "Mental, Emotional & Practical planes of life mapped to directional energies.",
    icon: Compass,
    badge: "Grid Planes"
  },
  {
    number: "11, 22, 33",
    title: "Master Numbers",
    desc: "High spiritual vibration, grand manifestation & global impact archetypes.",
    icon: Award,
    badge: "Master Vibration"
  }
];

const QUICK_FACTS = [
  { label: "Mulank (Driver)", val: "Birth Day", desc: "Inner psyche & desires" },
  { label: "Bhagyank (Conductor)", val: "Full DOB", desc: "Life purpose & destiny" },
  { label: "Namank (Expression)", val: "Full Name", desc: "Public image & success" },
  { label: "Loshu Yogas", val: "8 Planes", desc: "Golden & Silver Raj Yogas" }
];

const Numerology = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [talkMenuOpen, setTalkMenuOpen] = useState(false);

  // 25-Page Hybrid Report State
  const [generatingHybrid, setGeneratingHybrid] = useState(false);
  const [hybridReportData, setHybridReportData] = useState(null);
  const [showHybridModal, setShowHybridModal] = useState(false);
  const [reportLang, setReportLang] = useState('en'); // 'en' | 'hi'

  // Astrologer popup state
  const [showModal, setShowModal] = useState(false);
  const [sloganIndex, setSloganIndex] = useState(0);
  const [modalAstrologerIndex, setModalAstrologerIndex] = useState(0);
  const astrologers = DEFAULT_NUMEROLOGY_ASTROLOGERS;

  // 15-second recurring popup modal trigger
  useEffect(() => {
    const initialTimer = setTimeout(() => {
      setShowModal(true);
    }, 2500);

    const recurringTimer = setInterval(() => {
      setSloganIndex((prev) => (prev + 1) % NUMEROLOGY_POPUP_SLOGANS.length);
      setShowModal(true);
    }, 18000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(recurringTimer);
    };
  }, []);

  // Rotate astrologers inside popup
  useEffect(() => {
    if (!showModal || astrologers.length <= 2) return;
    const timer = setInterval(() => {
      setModalAstrologerIndex((prev) => (prev + 1) % astrologers.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [showModal, astrologers.length]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.name.trim() || !formData.dateOfBirth) {
      setError('Please provide your full name and date of birth');
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams({
        name: formData.name.trim(),
        date: formData.dateOfBirth
      });
      navigate(`/numerology-dashboard?${params.toString()}`);
    } catch (err) {
      setError('Error launching Numerology Dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateHybrid25Page = async () => {
    if (!formData.name.trim() || !formData.dateOfBirth) {
      setError('Please provide your full name and date of birth first.');
      return;
    }

    setGeneratingHybrid(true);
    setError('');

    try {
      const response = await axios.post('/api/numerology/hybrid-report-25', {
        name: formData.name.trim(),
        dateOfBirth: formData.dateOfBirth,
        language: reportLang
      });

      if (response.data && response.data.success) {
        setHybridReportData(response.data);
        setShowHybridModal(true);
      } else {
        setError(response.data?.error || 'Failed to generate 25-Page Hybrid Report.');
      }
    } catch (err) {
      console.error('25-page report error:', err);
      // Fallback: if server endpoint needs proxy or offline, provide immediate structured preview
      setError('Unable to reach AI generator. Please verify your backend server is running.');
    } finally {
      setGeneratingHybrid(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      dateOfBirth: ''
    });
    setError('');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-white text-slate-900 font-sans">
      <Navigation />

      <main className="relative z-10 max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24">

        {/* HERO BANNER - COMPACT WHITE CARD WITH WARM ACCENTS */}
        <section className="relative mb-6 rounded-2xl border border-stone-600 bg-white shadow-md shadow-stone-200/50 p-4 sm:p-6 z-20">
          {/* Subtle decorative accent */}
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-amber-100/50 rounded-full blur-2xl pointer-events-none overflow-hidden" />
          <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-orange-50/60 rounded-full blur-2xl pointer-events-none overflow-hidden" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-5">
            <div className="space-y-2 text-center lg:text-left max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[16px] font-bold tracking-wider uppercase">
                <Sparkles className="w-3 h-3 text-amber-600 animate-pulse" />
                Vedic & Western Numerology Studio
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Decode Your Cosmic <span className="bg-gradient-to-r from-amber-600 via-amber-700 to-orange-600 bg-clip-text text-transparent">Numbers</span>
              </h1>

              <p className="text-slate-900 text-xs sm:text-[16px] leading-relaxed max-w-xl">
                Discover the vibrational blueprint of your life with your <strong className="text-slate-900 font-semibold">Mulank (Life Path)</strong>, <strong className="text-slate-900 font-semibold">Bhagyank (Destiny)</strong>, and <strong className="text-slate-900 font-semibold">Loshu Grid</strong> analysis.
              </p>

              {/* Compact Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-[16px]">
                <span className="px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-600 text-slate-800 font-semibold flex items-center gap-1 shadow-2xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Pythagorean & Chaldean
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-600 text-slate-800 font-semibold flex items-center gap-1 shadow-2xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Loshu 3x3 Magic Grid
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-600 text-slate-800 font-semibold flex items-center gap-1 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Raj Yogas & Doshas
                </span>
              </div>
            </div>

            {/* Right Side: Quick Metrics & Talk to Our Astrologer CTA */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col items-center lg:items-end gap-3 shrink-0">
              {/* Quick Metrics Cards */}
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5 w-full sm:w-auto">
                {QUICK_FACTS.map((fact, idx) => (
                  <div key={idx} className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-stone-50 border border-stone-600 shadow-2xs text-center hover:border-amber-400 hover:bg-amber-50/40 transition-all duration-200">
                    <p className="text-[16px] uppercase tracking-wider text-amber-700 font-extrabold">{fact.label}</p>
                    <p className="text-sm sm:text-[16px] font-extrabold text-slate-900">{fact.val}</p>
                    <p className="text-[16px] text-slate-900 font-medium">{fact.desc}</p>
                  </div>
                ))}
              </div>

              {/* Talk to Our Astrologer Now Flex & 3 Options Dropdown */}
              <div className="relative w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setTalkMenuOpen(!talkMenuOpen)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-md shadow-amber-500/25 hover:shadow-lg transition-all duration-200 flex items-center justify-between sm:justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <span className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                    </span>
                    <PhoneCall className="w-4 h-4 text-white" />
                    <span>Talk to Our Astrologer Now</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${talkMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* 3 Options Dropdown Menu */}
                {talkMenuOpen && (
                  <>
                    {/* Backdrop for closing dropdown */}
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setTalkMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-full sm:w-72 bg-white rounded-2xl border border-amber-200 shadow-xl p-2 z-40 transition-all animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-1.5 border-b border-stone-100 mb-1">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">Choose Consultation Mode</p>
                      </div>

                      {/* Option 1: Book Consultation */}
                      <Link
                        to="/booking"
                        onClick={() => setTalkMenuOpen(false)}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-amber-50/70 transition-colors group text-left"
                      >
                        <div className="w-9 h-9 rounded-xl bg-amber-100/70 border border-amber-300 flex items-center justify-center text-amber-700 group-hover:scale-105 transition-transform shrink-0">
                          <CalendarCheck className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                            Book Consultation
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">
                            Schedule a 1-on-1 private appointment
                          </p>
                        </div>
                      </Link>

                      {/* Option 2: Live Astrologer */}
                      <Link
                        to="/live-astrologers"
                        onClick={() => setTalkMenuOpen(false)}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-amber-50/70 transition-colors group text-left"
                      >
                        <div className="w-9 h-9 rounded-xl bg-emerald-100/70 border border-emerald-300 flex items-center justify-center text-emerald-700 group-hover:scale-105 transition-transform shrink-0">
                          <Radio className="w-4 h-4 animate-pulse" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                            Live Astrologer
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">
                            Call or connect directly with live experts
                          </p>
                        </div>
                      </Link>

                      {/* Option 3: Live Chat */}
                      <Link
                        to="/live-chat"
                        onClick={() => setTalkMenuOpen(false)}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-amber-50/70 transition-colors group text-left"
                      >
                        <div className="w-9 h-9 rounded-xl bg-orange-100/70 border border-orange-300 flex items-center justify-center text-orange-700 group-hover:scale-105 transition-transform shrink-0">
                          <MessageCircle className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                            Live Chat
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">
                            Instant online chat consultation
                          </p>
                        </div>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* MAIN INTERACTIVE SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">

          {/* LEFT: FORM CARD (7 COLS) - CRISP WHITE CONTAINER */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-600 p-6 sm:p-8 shadow-xl shadow-stone-200/50 relative overflow-hidden">
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-300 flex items-center justify-center text-amber-600 shadow-xs">
                  <Calculator className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Generate Your Numerology Profile</h2>
                  <p className="text-xs sm:text-[16px] text-slate-900">Instant comprehensive multi-dimensional analysis</p>
                </div>
              </div>
              <span className="hidden sm:inline-flex px-3 py-1 text-[16px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Live Studio
              </span>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-900 text-rose-800 text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input */}
              <div className="space-y-2">
                <label className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-600" />
                  Full Name (as used commonly or on official documents)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-4 py-3.5 bg-white border border-stone-300 rounded-xl text-slate-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-medium shadow-2xs"
                    required
                  />
                  <span className="absolute right-3.5 top-3.5 text-xs text-stone-400 font-medium">Chaldean/Pythagorean</span>
                </div>
                <p className="text-[14px] text-slate-900">Used to calculate your Namank, Soul Urge & Personality expression number.</p>
              </div>

              {/* DOB Input */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  Date of Birth
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 bg-white border border-stone-300 rounded-xl text-slate-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-medium shadow-2xs [color-scheme:light]"
                    required
                  />
                </div>
                <p className="text-[14px] text-slate-900">Used to map your Mulank, Bhagyank, and populate the 3x3 Loshu Grid.</p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-base tracking-wide shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-70 cursor-pointer active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Loading Numerology Studio...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-white" />
                      Generate Report
                      <ArrowRight className="w-5 h-5 ml-1" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-stone-100 hover:bg-stone-200 border border-stone-300 text-slate-700 font-bold transition-all duration-200 text-sm shadow-2xs"
                >
                  Reset Form
                </button>
              </div>
            </form>

            {/* 25-PAGE AI HYBRID REPORT PROMO BANNER */}
            <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50/50 to-white border-2 border-amber-300 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-700" />
                      AI Hybrid Edition
                    </span>
                    <span className="text-xs font-bold text-slate-800">25 Comprehensive Pages</span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Generate 25-Page Numerology Life Book
                  </h3>
                  <p className="text-[14px] text-slate-900 max-w-md">
                    Detailed  narrative chapters, 5-Year timeline forecasts, Loshu Raj Yogas, and remedial gem/mantra prescriptions.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0">
                  {/* Language Selector */}
                  <select
                    value={reportLang}
                    onChange={(e) => setReportLang(e.target.value)}
                    className="px-2.5 py-2.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिंदी (Hindi)</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleGenerateHybrid25Page}
                    disabled={generatingHybrid}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-700 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70 whitespace-nowrap"
                  >
                    {generatingHybrid ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Synthesizing 25 Pages...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 text-white" />
                        Generate 25-Page Book
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* In-app Feature guarantee */}
            <div className="mt-6 pt-5 border-t border-stone-100 flex flex-wrap items-center justify-between text-[18px] text-slate-500 gap-3">
              <span className="flex items-center gap-1.5 text-slate-900 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                100% Confidential & Instant
              </span>
              <span className="text-slate-900 font-medium">Opens directly in interactive Numerology Details Section </span>
            </div>
          </div>

          {/* RIGHT: FEATURE OVERVIEW (5 COLS) - WHITE CARDS WITH DARK TEXT */}
          <div className="lg:col-span-5 space-y-4">
            {NUMEROLOGY_SYSTEMS.map((sys, idx) => {
              const IconComponent = sys.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-white border border-stone-600 hover:border-amber-400 transition-all duration-300 shadow-md hover:shadow-lg group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-[16px] font-bold px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800">
                      {sys.badge}
                    </span>
                  </div>
                  <h3 className="text-[16px] font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                    {sys.title}
                  </h3>
                  <p className="text-slate-900 text-xs sm:text-[16px] mt-1 leading-relaxed">
                    {sys.desc}
                  </p>
                </div>
              );
            })}

            {/* LIVE ASTROLOGER CALLOUT BANNER - WARM CREAM CARD WITH CRISP TEXT */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-50/80 via-white to-stone-50 border border-amber-200 shadow-md relative overflow-hidden">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
                  <Flame className="w-6 h-6 text-amber-600 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Need Personal Consultation?</h4>
                  <p className="text-xs text-slate-600">Talk directly to certified Vedic numerologists.</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center -space-x-2">
                  {DEFAULT_NUMEROLOGY_ASTROLOGERS.slice(0, 4).map((a, i) => (
                    <img
                      key={i}
                      src={a.image}
                      alt={a.name}
                      className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-2xs"
                    />
                  ))}
                  <span className="w-9 h-9 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center border-2 border-white shadow-2xs">
                    +5
                  </span>
                </div>

                <Link
                  to="/live-astrologers"
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Consult Live
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: 9 NUMBERS MATRIX GUIDE - WHITE CARDS WITH DARK TEXT */}
        <section className="mb-16 rounded-3xl border border-stone-600 bg-white p-6 sm:p-10 shadow-lg shadow-stone-200/50">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-700 font-extrabold mb-2">Vedic Planet Rulership</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              The 9 Cosmic Archetypes (1 to 9)
            </h2>
            <p className="text-slate-900 text-[16px] mt-2">
              Every number corresponds to a Vedic celestial deity that governs your strengths, destiny, and career inclinations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {[
              { num: 1, planet: "Sun (Surya)", title: "The Leader", trait: "Independence, Authority, Ambition, Willpower" },
              { num: 2, planet: "Moon (Chandra)", title: "The Intuitive Diplomat", trait: "Harmony, Sensitivity, Imagination, Empathy" },
              { num: 3, planet: "Jupiter (Guru)", title: "The Creative Guru", trait: "Wisdom, Optimism, Creative Self-Expression" },
              { num: 4, planet: "Rahu", title: "The Master Builder", trait: "Practicality, Organization, Hard Work, Strategy" },
              { num: 5, planet: "Mercury (Budh)", title: "The Dynamic Adventurer", trait: "Communication, Versatility, Rapid Adaptability" },
              { num: 6, planet: "Venus (Shukra)", title: "The Harmonious Nurturer", trait: "Love, Beauty, Luxury, Healing, Responsibility" },
              { num: 7, planet: "Ketu", title: "The Spiritual Seeker", trait: "Intuition, Analytical Depth, Mysticism, Research" },
              { num: 8, planet: "Saturn (Shani)", title: "The Powerful Manifestor", trait: "Material Abundance, Discipline, Justice, Authority" },
              { num: 9, planet: "Mars (Mangal)", title: "The Fiery Humanitarian", trait: "Compassion, Universal Vision, Courage, Dynamism" }
            ].map((card) => (
              <div
                key={card.num}
                className="p-5 rounded-2xl bg-stone-50 border border-stone-600 hover:border-amber-400 hover:bg-amber-50/30 transition-all duration-300 hover:-translate-y-1 group shadow-2xs"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="w-10 h-10 rounded-xl bg-white text-amber-700 font-extrabold text-xl flex items-center justify-center border border-amber-300 shadow-xs">
                    {card.num}
                  </span>
                  <span className="text-[16px] font-bold text-amber-800 bg-amber-100/70 px-2.5 py-1 rounded-full border border-amber-300/60">
                    {card.planet}
                  </span>
                </div>
                <h4 className="text-[16px] font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                  {card.title}
                </h4>
                <p className="text-[16px] text-slate-900 mt-1.5 leading-relaxed font-medium">
                  {card.trait}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* POPUP CONSULTATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300">
          <div className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-amber-200">
            {/* Top Amber Header */}
            <div className="relative bg-gradient-to-r from-amber-500 to-amber-600 px-6 pt-10 pb-6 text-center text-white">
              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Floating Vedic Icon */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-2 border-white shadow-md overflow-hidden bg-amber-100 flex items-center justify-center">
                <img
                  src="/images/AstroIcon.jpg"
                  alt="Vedic Astrologer"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Slogan */}
              <p className="text-sm sm:text-base font-bold leading-snug tracking-wide text-amber-50 mt-2 px-2">
                "{NUMEROLOGY_POPUP_SLOGANS[sloganIndex]}"
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 bg-stone-50">
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[0, 1].map((offset) => {
                  const idx = (modalAstrologerIndex + offset) % astrologers.length;
                  const astrologer = astrologers[idx];
                  const displayName = cleanAstrologerName(astrologer.name);

                  return (
                    <Link
                      key={`${astrologer._id || idx}-${modalAstrologerIndex}`}
                      to="/live-astrologers"
                      state={{ astrologer }}
                      onClick={() => setShowModal(false)}
                      className="group flex flex-col items-center bg-white hover:bg-amber-50/60 p-3 rounded-2xl border border-stone-200 hover:border-amber-400 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer shadow-sm text-center"
                    >
                      <div className="relative w-full aspect-square max-h-24 rounded-xl overflow-hidden border border-amber-300 bg-stone-100 mb-2 flex items-center justify-center p-1">
                        <img
                          src={astrologer.image}
                          alt={displayName}
                          style={{ imageRendering: '-webkit-optimize-contrast' }}
                          className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded-full text-[9px] text-emerald-300 font-bold border border-emerald-400/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Live
                        </span>
                      </div>

                      <p className="text-xs font-bold text-slate-900 truncate w-full group-hover:text-amber-700 transition-colors">
                        {displayName}
                      </p>

                      <span className="text-[11px] text-amber-600 font-bold mt-0.5">
                        ₹{astrologer.pricing || 9}/min
                      </span>
                    </Link>
                  );
                })}
              </div>

              <div className="text-center mb-5">
                <h4 className="text-xs font-extrabold text-stone-600 tracking-wider uppercase">
                  Consult Expert Vedic Numerologists
                </h4>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/live-astrologers"
                  onClick={() => setShowModal(false)}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm text-center shadow-md hover:shadow-lg transition-all"
                >
                  Live Astrologers
                </Link>
                <Link
                  to="/live-chat"
                  onClick={() => setShowModal(false)}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs sm:text-sm text-center shadow-md hover:shadow-lg transition-all"
                >
                  Chat Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 25-PAGE HYBRID AI REPORT VIEWER MODAL */}
      {showHybridModal && hybridReportData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm transition-all duration-300">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-amber-300 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-orange-600 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-amber-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                      Hybrid  Edition
                    </span>
                    <span className="text-[18px] text-amber-600 font-bold">25 Pages Comprehensive</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold">
                    {hybridReportData.meta?.name}'s Numerology Life Book
                  </h3>
                  <p className="text-[18px] text-amber-100">
                    DOB: {hybridReportData.meta?.dateOfBirth} | Generated with Vedic Math & Gemini Synthesis
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Print / Save as PDF"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setShowHybridModal(false)}
                  className="w-9 h-9 rounded-xl bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 bg-stone-50">
              {/* Executive Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-stone-200 text-center shadow-2xs">
                  <p className="text-[10px] font-extrabold uppercase text-amber-700">Mulank (Driver)</p>
                  <p className="text-2xl font-extrabold text-slate-900">{hybridReportData.mathData?.numbers?.mulank}</p>
                  <p className="text-[11px] text-slate-500">{hybridReportData.mathData?.planetaryRulers?.mulank}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-stone-200 text-center shadow-2xs">
                  <p className="text-[10px] font-extrabold uppercase text-amber-700">Bhagyank (Destiny)</p>
                  <p className="text-2xl font-extrabold text-slate-900">{hybridReportData.mathData?.numbers?.bhagyank}</p>
                  <p className="text-[11px] text-slate-500">{hybridReportData.mathData?.planetaryRulers?.bhagyank}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-stone-200 text-center shadow-2xs">
                  <p className="text-[10px] font-extrabold uppercase text-amber-700">Namank (Expression)</p>
                  <p className="text-2xl font-extrabold text-slate-900">{hybridReportData.mathData?.numbers?.namank}</p>
                  <p className="text-[11px] text-slate-500">{hybridReportData.mathData?.planetaryRulers?.namank}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-stone-200 text-center shadow-2xs">
                  <p className="text-[10px] font-extrabold uppercase text-amber-700">Personal Year</p>
                  <p className="text-2xl font-extrabold text-slate-900">{hybridReportData.mathData?.currentYearCycle?.personalYear}</p>
                  <p className="text-[11px] text-slate-500">Year {hybridReportData.mathData?.currentYearCycle?.calendarYear}</p>
                </div>
              </div>

              {/* 6 AI Synthesis Chapters */}
              {hybridReportData.aiChapters && (
                <div className="space-y-6">
                  {/* Chapter 1: Pages 3-5 */}
                  <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-100">
                      <Star className="w-5 h-5 text-amber-600" />
                      <h4 className="text-base sm:text-lg font-extrabold text-slate-900">
                        Pages 3–5: Core Numbers Deep Dive & Driver-Conductor Dynamics
                      </h4>
                    </div>
                    <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-line leading-relaxed font-sans text-xs sm:text-sm">
                      {hybridReportData.aiChapters.coreNumbersDeepDive}
                    </div>
                  </div>

                  {/* Chapter 2: Pages 6-9 */}
                  <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-100">
                      <Compass className="w-5 h-5 text-amber-600" />
                      <h4 className="text-base sm:text-lg font-extrabold text-slate-900">
                        Pages 6–9: Loshu Grid Magic Planes, Raj Yogas & Missing Vibrations
                      </h4>
                    </div>
                    <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-line leading-relaxed font-sans text-xs sm:text-sm">
                      {hybridReportData.aiChapters.loshuYogasPlanes}
                    </div>
                  </div>

                  {/* Chapter 3: Pages 10-12 */}
                  <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-100">
                      <Award className="w-5 h-5 text-amber-600" />
                      <h4 className="text-base sm:text-lg font-extrabold text-slate-900">
                        Pages 10–12: Career, Wealth, Business Acumen & Auspicious Partnerships
                      </h4>
                    </div>
                    <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-line leading-relaxed font-sans text-xs sm:text-sm">
                      {hybridReportData.aiChapters.careerWealthStrategic}
                    </div>
                  </div>

                  {/* Chapter 4: Pages 13-16 */}
                  <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-100">
                      <User className="w-5 h-5 text-amber-600" />
                      <h4 className="text-base sm:text-lg font-extrabold text-slate-900">
                        Pages 13–16: Love, Marriage Synastry & Ayurvedic Vitality
                      </h4>
                    </div>
                    <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-line leading-relaxed font-sans text-xs sm:text-sm">
                      {hybridReportData.aiChapters.relationshipHealthVitality}
                    </div>
                  </div>

                  {/* Chapter 5: Pages 17-22 */}
                  <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-100">
                      <Calendar className="w-5 h-5 text-amber-600" />
                      <h4 className="text-base sm:text-lg font-extrabold text-slate-900">
                        Pages 17–22: 9-Year Epicycle & 5-Year Predictive Roadmap
                      </h4>
                    </div>
                    <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-line leading-relaxed font-sans text-xs sm:text-sm">
                      {hybridReportData.aiChapters.predictiveRoadmap5Years}
                    </div>
                  </div>

                  {/* Chapter 6: Pages 23-25 */}
                  <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-100">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                      <h4 className="text-base sm:text-lg font-extrabold text-slate-900">
                        Pages 23–25: Personalized Remedies, Signature Angle & Affirmations
                      </h4>
                    </div>
                    <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-line leading-relaxed font-sans text-xs sm:text-sm">
                      {hybridReportData.aiChapters.remediesAffirmationsBlueprint}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-stone-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 font-medium">
                Vedic & Western Numerology Hybrid AI Engine
              </span>
              <button
                onClick={() => setShowHybridModal(false)}
                className="px-5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-bold transition-all"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Numerology;
