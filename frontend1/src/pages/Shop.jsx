import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import axios, { authAPI, buildAssetUrl } from '../services/api';
import {
  ShoppingBag,
  Search,
  Filter,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Star,
  Award,
  ChevronRight,
  Info,
  X,
  Eye,
  Heart,
  Truck,
  RotateCcw,
  RefreshCw,
  Flame,
  ArrowRight,
  PhoneCall,
  MessageSquare
} from 'lucide-react';

const FEATURE_HIGHLIGHTS = [
  { icon: ShieldCheck, title: "100% Authentic & Energized", desc: "Prana-Pratishtha consecrated by Vedic Brahmins" },
  { icon: Truck, title: "Insured Free Delivery", desc: "Safe express delivery all across India" },
  { icon: Award, title: "Lab Certified Gemstones", desc: "ISO certified government-approved gem testing" },
  { icon: RotateCcw, title: "Easy Returns", desc: "Hassle-free 7-day return policy" }
];

const POPULAR_TAGS = ['All', 'Yantras', 'Gemstones', 'Rudraksha', 'Parad & Crystals', 'Vastu Items'];

// Rotating Vedic Slogans for 20-second Pop-up Window
const VEDIC_SLOGANS = [
  "सही रत्न और सटीक ज्योतिषीय परामर्श, आपके जीवन की दिशा और दशा दोनों बदल सकते हैं।",
  "रत्न केवल आभूषण नहीं, बल्कि ग्रहों की सकारात्मक ऊर्जा को आकर्षित करने का माध्यम हैं।",
  "बिना कुंडली विश्लेषण के रत्न धारण न करें—सही रत्न भाग्य चमकाता है, तो गलत रत्न नुकसान भी पहुँचा सकता है।",
  "ग्रहों की चाल को समझें और अपनी कुंडली के अनुसार सही रत्न चुनकर जीवन में सुख-समृद्धि लाएं।",
  "एक अभिमंत्रित और शुद्ध रत्न, कमजोर ग्रहों को बल देकर सफलता के बंद द्वार खोल सकता है।"
];

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured'); // 'featured' | 'price-low' | 'price-high' | 'name'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Quick View Modal
  const [activeProductModal, setActiveProductModal] = useState(null);
  const [cartSuccessNotice, setCartSuccessNotice] = useState('');

  // Rotating Live Astrologers
  const [astrologersList, setAstrologersList] = useState([]);
  const [currentAstrologerIdx, setCurrentAstrologerIdx] = useState(0);

  // 20-second Pop-up Consultation Modal State
  const [showVedicPopup, setShowVedicPopup] = useState(false);
  const [currentSloganIdx, setCurrentSloganIdx] = useState(0);

  // Fetch products and categories on mount
  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchAstrologers();
  }, []);

  const fetchAstrologers = async () => {
    try {
      const response = await authAPI.getAstrologers();
      const list = response.data?.astrologers || [];
      if (list.length > 0) {
        setAstrologersList(list);
      }
    } catch (err) {
      console.error('Error fetching astrologers for shop banner:', err);
    }
  };

  // 5-second interval timer for rotating astrologer
  useEffect(() => {
    if (astrologersList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAstrologerIdx((prev) => (prev + 1) % astrologersList.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [astrologersList.length]);

  // 20-second interval timer for showing the Vedic Guidance Popup
  useEffect(() => {
    // Show first popup after 20 seconds, and periodically every 20 seconds
    const popupTimer = setInterval(() => {
      setCurrentSloganIdx((prev) => (prev + 1) % VEDIC_SLOGANS.length);
      setShowVedicPopup(true);
    }, 20000);

    return () => clearInterval(popupTimer);
  }, []);

  // Clean name without 'Astrologer' prefix
  const cleanAstrologerName = (name) => {
    if (!name) return 'Vedic Expert';
    return name
      .replace(/^astrologer\s+/i, '')
      .replace(/^astro\s+/i, '')
      .trim();
  };

  // Fetch products when category changes
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const params = selectedCategory ? { category: selectedCategory } : {};
      const response = await axios.get('/shopping/products', { params });
      setProducts(Array.isArray(response.data.products) ? response.data.products : []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Unable to load spiritual products. Please check server connection.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/shopping/categories');
      setCategories(Array.isArray(response.data.categories) ? response.data.categories : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    }
  };

  // Filtered & Sorted Products
  const displayedProducts = useMemo(() => {
    let list = [...products];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.category?.name && p.category.name.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === 'price-low') {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'name') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    return list;
  }, [products, searchQuery, sortBy]);

  const handleAddToCart = (product) => {
    setCartSuccessNotice(`"${product.name}" added to your spiritual cart!`);
    setTimeout(() => {
      setCartSuccessNotice('');
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900 font-sans">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-16">

        {/* COMPACT HERO SECTION WITH RIGHT-SIDE GEM VIDEO */}
        <section className="relative mb-6 rounded-2xl bg-white text-white p-4 sm:p-6 shadow-md overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute left-1/3 -bottom-10 w-48 h-48 bg-black/10 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-5">
            {/* Left Content */}
            <div className="space-y-2 text-center lg:text-left flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-stone-600 text-[18px] font-bold tracking-wider uppercase">
                <Sparkles className="w-3 h-3 text-amber-200" />
                Sacred Vedic Remedial Store
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-orange-900 leading-tight">
                Spiritual <span className="text-black">Astro Shop</span>
              </h1>

              <p className="text-neutral-900 text-xs sm:text-[18px] leading-relaxed max-w-xl">
                Prana-Pratishtha energized Yantras, certified Gemstones, authentic Rudrakshas, and Vastu articles.
              </p>

              {/* Search Bar */}
              <div className="pt-1 max-w-md mx-auto lg:mx-0">
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-600" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Yantras, Gemstones, Rudraksha..."
                    className="w-full pl-10 pr-4 py-2 bg-white rounded-xl text-slate-900 placeholder-stone-600 font-medium text-xs sm:text-[16px] focus:outline-none focus:ring-3 focus:ring-black/15 shadow-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2 text-stone-400 hover:text-stone-700 text-xs font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Center Slogan: Talk To Our Astrologers */}
            <div className="flex flex-col items-center justify-center text-center px-3 py-2 shrink-0">
              <Link
                to="/live-astrologers"
                className="group relative inline-flex items-center gap-2.5 px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-white/95 hover:bg-white text-amber-950 font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-amber-200/80 cursor-pointer"
              >
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs group-hover:rotate-12 transition-transform duration-300">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wider text-amber-700 font-bold leading-none mb-0.5">
                    Need Gem & Remedy Guidance?
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-stone-900 leading-tight">
                    Talk To Our Astrologers
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-700 group-hover:translate-x-1 transition-transform ml-1" />
              </Link>
            </div>

            {/* Right Side Video Banner (gem1.mp4) */}
            <div className="w-full sm:w-72 lg:w-80 shrink-0 flex items-center justify-center">
              <div className="relative w-full aspect-[16/9] sm:aspect-[4/3] max-h-36 sm:max-h-40 rounded-2xl overflow-hidden border-2 border-white/40 shadow-xl bg-black/30 group">
                <video
                  src="/images/gem1.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <span className="absolute bottom-2 left-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] text-amber-200 font-bold border border-amber-300/30 flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300 animate-pulse" />
                  Certified Vedic Gems
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* CART SUCCESS TOAST */}
        {cartSuccessNotice && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span>{cartSuccessNotice}</span>
          </div>
        )}

        {/* MAIN SHOP BODY WITH LEFT SIDEBAR */}
        <div className="flex flex-col lg:flex-row gap-8 items-start mb-12">

          {/* LEFT SIDEBAR: TRUST VALUE HIGHLIGHTS & SACRED ASSURANCE */}
          <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-stone-100">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Vedic Assurance
                </h3>
              </div>

              {/* Trust Value Cards */}
              <div className="flex flex-col gap-3">
                {FEATURE_HIGHLIGHTS.map((feat, idx) => {
                  const Icon = feat.icon;
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50/70 to-orange-50/50 border border-amber-200/60 shadow-2xs flex items-start gap-3 hover:border-amber-400 hover:shadow-xs transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">{feat.title}</h4>
                        <p className="text-xs text-stone-600 leading-relaxed mt-0.5">{feat.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Extra Helpline Box */}
              <div className="mt-5 pt-4 border-t border-stone-100">
                <div className="p-3.5 rounded-2xl bg-stone-900 text-white">
                  <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                    Authenticity Guarantee
                  </p>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Every article undergoes Vedic ritual purification & comes with a certificate of authenticity.
                  </p>
                </div>
              </div>
            </div>

            {/* ROTATING ASTROLOGER CARD (5s INTERVAL) REDIRECTS TO LIVE ASTROLOGERS */}
            {astrologersList.length > 0 && (() => {
              const currentAstro = astrologersList[currentAstrologerIdx];
              if (!currentAstro) return null;

              const astroImage = currentAstro.avatar || currentAstro.imageUrl || currentAstro.profilePicture || currentAstro.image
                ? buildAssetUrl(currentAstro.avatar || currentAstro.imageUrl || currentAstro.profilePicture || currentAstro.image)
                : '/images/AstroIcon.jpg';

              const displayName = cleanAstrologerName(currentAstro.name || currentAstro.fullName || currentAstro.username);

              return (
                <Link
                  to="/live-astrologers"
                  className="group block bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border-2 border-amber-300/40 relative overflow-hidden min-h-[300px] flex flex-col justify-between"
                >
                  <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-black/15 rounded-full blur-xl pointer-events-none" />

                  {/* Top Header Row */}
                  <div className="flex items-center justify-between relative z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/35 backdrop-blur-xs text-[11px] font-extrabold text-amber-200 border border-amber-300/35 shadow-xs">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      Live Online Astrologer
                    </span>
                    <span className="text-[11px] text-amber-100 font-bold bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                      {currentAstrologerIdx + 1} of {astrologersList.length}
                    </span>
                  </div>

                  {/* Centered Astrologer Avatar & Identity */}
                  <div className="flex flex-col items-center text-center my-4 relative z-10">
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-white/80 shadow-2xl bg-stone-900 group-hover:scale-105 transition-transform duration-500">
                      <img
                        key={currentAstro._id || currentAstrologerIdx}
                        src={astroImage}
                        alt={displayName}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/AstroIcon.jpg';
                        }}
                        className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                    </div>

                    <h4 className="text-lg sm:text-xl font-extrabold text-white leading-tight mt-3 tracking-tight">
                      {displayName}
                    </h4>

                    <p className="text-xs text-amber-100/90 font-medium max-w-[220px] line-clamp-2 mt-1 leading-relaxed">
                      {currentAstro.specialties?.length ? currentAstro.specialties.join(', ') : 'Vedic Astrology & Planetary Remedies'}
                    </p>

                    {currentAstro.experienceYears && (
                      <span className="text-[11px] font-semibold text-amber-200 mt-1">
                        ★ {currentAstro.experienceYears}+ Years Experience
                      </span>
                    )}
                  </div>

                  {/* Bottom Action CTA */}
                  <div className="relative z-10 pt-3 border-t border-white/20">
                    <div className="w-full py-2.5 px-4 rounded-2xl bg-white text-stone-950 font-extrabold text-xs sm:text-sm shadow-md group-hover:bg-amber-100 transition-all flex items-center justify-center gap-2">
                      <PhoneCall className="w-4 h-4 text-amber-700" />
                      <span>Start Instant Consultation</span>
                      <ArrowRight className="w-4 h-4 text-amber-700 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })()}

            {/* GS1 BANNER LINKING TO LIVE ASTROLOGERS */}
            <Link
              to="/live-astrologers"
              className="group block relative rounded-3xl overflow-hidden border border-stone-200 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] min-h-[460px] sm:min-h-[480px] flex flex-col"
            >
              <div className="relative w-full h-full min-h-[460px] sm:min-h-[480px] bg-stone-900 overflow-hidden flex flex-col justify-between">
                <img
                  src="/images/GS1.jpg"
                  alt="Live Astrologer Consultation"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20 pointer-events-none" />

                {/* Top Badge */}
                <div className="relative z-10 p-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-stone-950 text-[11px] font-extrabold uppercase shadow-md">
                    <Sparkles className="w-3.5 h-3.5 text-stone-950" />
                    Live Vedic Guidance
                  </span>
                </div>

                {/* Bottom Details & Button */}
                <div className="relative z-10 p-5 text-white space-y-3">
                  <div>
                    <h4 className="text-lg sm:text-xl font-extrabold text-white leading-tight">
                      Connect with Top Astrologers
                    </h4>
                    <p className="text-xs text-amber-200/90 leading-relaxed mt-1 font-medium">
                      Personalized Gemstone, Yantra & Remedy consultations via Call or Video.
                    </p>
                  </div>

                  <div className="w-full py-2.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2">
                    <PhoneCall className="w-4 h-4 text-stone-950" />
                    <span>Talk To Astrologer</span>
                    <ArrowRight className="w-4 h-4 text-stone-950 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </aside>

          {/* RIGHT / MAIN CONTENT: FILTERS & PRODUCTS GRID */}
          <div className="flex-1 min-w-0 w-full">

            {/* FILTER & SORT BAR */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 mb-6 border border-stone-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">

              {/* Categories Pill Bar */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${selectedCategory === ''
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-stone-100 text-slate-900 hover:bg-stone-200'
                    }`}
                >
                  All Items ({products.length})
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCategory(cat._id)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${selectedCategory === cat._id
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-stone-100 text-slate-700 hover:bg-stone-200'
                      }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                <span className="text-xs font-semibold text-slate-500">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="featured">Featured Remedies</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Product Name (A-Z)</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-2xl mb-8 text-sm">
                {error}
              </div>
            )}

            {/* PRODUCTS GRID */}
            {loading ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-stone-200">
                <RefreshCw className="w-10 h-10 text-amber-600 animate-spin mx-auto mb-3" />
                <p className="text-slate-700 font-bold text-sm">Loading authentic spiritual items...</p>
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 shadow-2xs">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  📿
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-1">No spiritual items found</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Try adjusting your search query or selecting a different category.
                </p>
                <button
                  onClick={() => { setSelectedCategory(''); setSearchQuery(''); }}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayedProducts.map((product) => {
                  const imageSrc = product.imageUrl
                    ? buildAssetUrl(product.imageUrl)
                    : '/images/AstroIcon.jpg';

                  return (
                    <div
                      key={product._id}
                      className="group bg-white rounded-3xl border border-stone-200 hover:border-amber-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1"
                    >
                      {/* Product Image Box */}
                      <div className="relative aspect-square bg-stone-100 overflow-hidden flex items-center justify-center p-3">
                        <img
                          src={imageSrc}
                          alt={product.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/AstroIcon.jpg';
                          }}
                          className="w-full h-full object-contain rounded-2xl group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Category Tag */}
                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-xs text-[10px] font-extrabold text-amber-800 rounded-full border border-amber-200 shadow-2xs">
                          {product.category?.name || 'Spiritual'}
                        </span>

                        {/* Quick View Button on Hover */}
                        <button
                          onClick={() => setActiveProductModal(product)}
                          className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/95 hover:bg-amber-600 text-stone-700 hover:text-white flex items-center justify-center shadow-md transition-all cursor-pointer opacity-90 group-hover:opacity-100"
                          title="Quick View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Product Details */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Consecrated
                            </span>
                            <div className="flex items-center text-amber-500 text-xs">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span className="text-slate-700 font-bold ml-1 text-[11px]">4.9</span>
                            </div>
                          </div>

                          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-1">
                            {product.name}
                          </h3>

                          <p className="text-[14px] text-slate-900 mt-1 line-clamp-2 leading-relaxed">
                            {product.description || 'Energized Vedic spiritual item for positive aura and planetary alignment.'}
                          </p>
                        </div>

                        <div className="pt-4 mt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[14px] text-slate-900 font-semibold uppercase">Blessing Price</p>
                            <p className="text-lg font-extrabold text-slate-900">
                              ₹{product.price ? product.price.toLocaleString('en-IN') : '999'}
                            </p>
                          </div>

                          <button
                            onClick={() => handleAddToCart(product)}
                            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-[14px] shadow-md shadow-amber-500/20 hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            Order Now
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* DETAILED QUICK-VIEW MODAL */}
        {activeProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300">
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Close Button */}
              <button
                onClick={() => setActiveProductModal(null)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8">
                {/* Modal Image */}
                <div className="aspect-square bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden flex items-center justify-center p-4">
                  <img
                    src={activeProductModal.imageUrl ? buildAssetUrl(activeProductModal.imageUrl) : '/images/AstroIcon.jpg'}
                    alt={activeProductModal.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Modal Info */}
                <div className="flex flex-col justify-between space-y-4">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase">
                      {activeProductModal.category?.name || 'Spiritual Product'}
                    </span>

                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                      {activeProductModal.name}
                    </h2>

                    <div className="flex items-center gap-3 my-2">
                      <p className="text-2xl font-extrabold text-amber-700">
                        ₹{activeProductModal.price ? activeProductModal.price.toLocaleString('en-IN') : '999'}
                      </p>
                      <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        In Stock & Blessed
                      </span>
                    </div>

                    <div className="space-y-3 mt-4 text-xs text-slate-600 max-h-48 overflow-y-auto pr-2">
                      {activeProductModal.description && (
                        <div>
                          <p className="font-bold text-slate-800">Sacred Description:</p>
                          <p className="mt-0.5 leading-relaxed">{activeProductModal.description}</p>
                        </div>
                      )}

                      {activeProductModal.usage && (
                        <div>
                          <p className="font-bold text-slate-800">Placement & Usage Method:</p>
                          <p className="mt-0.5 leading-relaxed">{activeProductModal.usage}</p>
                        </div>
                      )}

                      {activeProductModal.useByHoroscope && (
                        <div>
                          <p className="font-bold text-slate-800">Astrological Recommendation:</p>
                          <p className="mt-0.5 leading-relaxed">{activeProductModal.useByHoroscope}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex items-center gap-3">
                    <button
                      onClick={() => {
                        handleAddToCart(activeProductModal);
                        setActiveProductModal(null);
                      }}
                      className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Add to Sacred Order
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 20-SECOND VEDIC ASTROLOGER POPUP WINDOW */}
        {showVedicPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-300">
            <div className="relative w-full max-w-[420px] rounded-[32px] overflow-visible shadow-2xl animate-in zoom-in-95 duration-200 bg-white">

              {/* Overlapping Top Guru Badge Circle */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20">
                <div className="w-24 h-24 rounded-full border-4 border-amber-400 shadow-xl overflow-hidden bg-amber-100 flex items-center justify-center p-0.5">
                  <img
                    src="/images/vedic-guru-circle.png"
                    alt="Vedic Sage"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/AstroIcon.jpg';
                    }}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>

              {/* Golden Top Header Banner */}
              <div className="relative bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 pt-14 pb-4 px-6 rounded-t-[32px] flex items-center justify-end">
                <button
                  onClick={() => setShowVedicPopup(false)}
                  className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/35 text-white flex items-center justify-center transition cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 pt-5 bg-white rounded-b-[32px] text-center">

                {/* Rotating Hindi Slogan */}
                <div className="min-h-[90px] flex items-center justify-center px-2">
                  <h3 className="text-base sm:text-[17px] font-black text-amber-700 leading-snug tracking-tight">
                    "{VEDIC_SLOGANS[currentSloganIdx]}"
                  </h3>
                </div>

                <div className="w-16 h-0.5 bg-amber-200 mx-auto my-3 rounded-full" />

                {/* Astrologers Avatars Row */}
                <div className="mt-2 mb-3">
                  <div className="flex items-center justify-center gap-3 sm:gap-4">
                    {astrologersList.slice(0, 3).map((astro, i) => {
                      const img = astro.avatar || astro.imageUrl || astro.profilePicture || astro.image
                        ? buildAssetUrl(astro.avatar || astro.imageUrl || astro.profilePicture || astro.image)
                        : '/images/AstroIcon.jpg';
                      const name = cleanAstrologerName(astro.name || astro.fullName || `Astrologer ${i + 1}`);

                      return (
                        <div key={astro._id || i} className="flex flex-col items-center">
                          <div className="relative w-14 h-14 sm:w-28 sm:h-28 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 to-yellow-300 shadow-md">
                            <img
                              src={img}
                              alt={name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/images/AstroIcon.jpg';
                              }}
                              className="w-full h-full object-cover rounded-full"
                            />
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                          </div>
                          <span className="text-[14px] font-bold text-slate-800 mt-1 max-w-[80px] truncate">
                            {name}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-[16px] font-extrabold uppercase tracking-widest text-slate-600 mt-3">
                    CONSULT EXPERT ASTROLOGERS
                  </p>
                </div>

                {/* Two Action Buttons */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Link
                    to="/live-astrologers"
                    onClick={() => setShowVedicPopup(false)}
                    className="py-3 px-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-orange-500/25 hover:shadow-lg transition-all text-center flex items-center justify-center"
                  >
                    Live Astrologers
                  </Link>

                  <Link
                    to="/live-astrologers"
                    onClick={() => setShowVedicPopup(false)}
                    className="py-3 px-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-amber-500/25 hover:shadow-lg transition-all text-center flex items-center justify-center"
                  >
                    Chat Now
                  </Link>
                </div>

              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Shop;
