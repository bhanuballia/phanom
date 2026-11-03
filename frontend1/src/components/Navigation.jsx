import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { walletAPI, VEDIC_ASTROLOGY_BASE_URL } from '../services/api';
import {
  Menu,
  X,
  Star,
  User,
  Calendar,
  CalendarDays,
  Clock,
  Users,
  Info,
  Phone,
  Sparkles,
  Shield,
  ChevronDown,
  Heart,
  HeartHandshake,
  BookOpen,
  Calculator,
  Home as HomeIcon,
  MessageCircle,
  Wallet,
  ScrollText,
  Sun,
  Hand,
  Building2,
  ShoppingBag,
  Globe
} from 'lucide-react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { currentLang, currentLangObj, changeLanguage, supportedLanguages, t } = useLanguage();
  const location = useLocation();

  // Close language dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('#lang-selector-container')) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Handle scroll down button visibility
  useEffect(() => {
    const handleScroll = () => {
      // Show scroll down button only when at the top of the page
      setShowScrollDown(window.scrollY < 100);
    };

    // Initial check
    handleScroll();

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch wallet balance if authenticated
  useEffect(() => {
    const fetchBalance = async () => {
      if (isAuthenticated) {
        try {
          const res = await walletAPI.getBalance();
          setWalletBalance(res.data.balance || 0);
        } catch (error) {
          console.error("Failed to fetch wallet balance:", error);
        }
      }
    };
    fetchBalance();
  }, [isAuthenticated]);

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight * 0.8,
      behavior: 'smooth'
    });
  };

  const navServices = [
    {
      name: 'Daily Panchang',
      path: '/daily-calendar',
      icon: CalendarDays,
      isExternal: false
    },
    {
      name: 'Monthly Calendar',
      path: `${VEDIC_ASTROLOGY_BASE_URL}/?monthly_panchang=true&hide_search=true`,
      icon: Calendar,
      isExternal: true
    },
    {
      name: 'Monthly Panchang',
      path: '/monthly-panchang',
      icon: CalendarDays,
      isExternal: false
    },
    {
      name: 'Relationship Horoscope',
      path: `${VEDIC_ASTROLOGY_BASE_URL}/?compatibility-hub=true&calculator=weekly-relationship&hide_search=true`,
      icon: HeartHandshake,
      isExternal: true
    },
    {
      name: 'Advance Muhurt',
      path: `${VEDIC_ASTROLOGY_BASE_URL}/?advanced_muhurt=true&hide_search=true`,
      icon: Clock,
      isExternal: true
    },
    {
      name: 'Adv. Nakshatra',
      path: `${VEDIC_ASTROLOGY_BASE_URL}/?advanced_nakshatra=true&only_planetary=true&hide_search=true`,
      icon: Star,
      isExternal: true
    },
    {
      name: 'Vastu Shastra',
      path: '/vastu-shastra',
      icon: Building2,
      isExternal: false
    },
    {
      name: 'Shop',
      path: '/shop',
      icon: ShoppingBag,
      isExternal: false
    }
  ];

  const navigationItems = [
    { name: 'About AstroConsult', path: '/about', icon: Info },
    { name: 'Our Astrologers', path: '/astrologers', icon: Users },
    { name: 'Zodiac Insights', path: '/zodiac', icon: Star },
    { name: 'Daily Calendar', path: '/daily-calendar', icon: Calendar },
    { name: 'Monthly Panchang', path: '/monthly-panchang', icon: CalendarDays || Calendar },
    { name: 'AI Astrologer', path: '/ai-astrologer', icon: Sparkles },
    { name: 'Kundali Services', path: '/kundali', icon: BookOpen },
    { name: 'Kundali Matching', path: '/kundali-matching', icon: Heart },
    { name: 'Lal Kitab Remedies', path: '/lal-kitab', icon: Sparkles },
    { name: 'Advanced Numerology', path: '/numerology', icon: Calculator },
    { name: 'Tarot Card Reading', path: '/tarot-reading', icon: Sparkles },
    { name: 'Community Videos', path: '/community-videos', icon: MessageCircle },
    { name: 'Contact & Support', path: '/contact', icon: Phone }
  ];

  const twoLineTextStyles = {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  };

  const isActivePath = (path) => location.pathname === path;
  const trimmedName = user?.name?.split(' ')?.[0] || 'Seeker';
  const welcomeMessage = isAuthenticated ? `Welcome, ${trimmedName}` : 'Welcome, Guest';
  const actionButtonBase =
    'group relative flex flex-col items-center justify-center px-2 py-1 rounded-lg border text-[10px] font-semibold leading-tight tracking-tight transition-all duration-300 min-w-[76px]';

  const actionButtons = isAuthenticated
    ? [
      {
        key: 'welcome',
        element: (
          <div className={`hidden 2xl:flex ${actionButtonBase} border-amber-300 text-slate-800 bg-amber-50/80`}>
            <span className="text-[9px] uppercase tracking-[0.4em] text-slate-500 font-bold">Welcome</span>
            <span className="text-xs font-bold text-amber-700 text-center" style={twoLineTextStyles}>
              {welcomeMessage}
            </span>
          </div>
        )
      },
      {
        key: 'home',
        element: (
          <Link
            to="/"
            className={`hidden 2xl:flex ${actionButtonBase} border-slate-200 text-slate-700 hover:text-black hover:border-slate-300 hover:bg-slate-50`}
          >
            <HomeIcon className="h-4 w-4 mb-1" />
            <span style={twoLineTextStyles}>Home</span>
          </Link>
        )
      },

      user?.role === 'admin'
        ? {
          key: 'admin',
          element: (
            <Link
              to="/admin"
              className={`${actionButtonBase} text-red-700 border-red-300 bg-red-50 hover:bg-red-100`}
            >
              <Shield className="h-4 w-4 mb-1" />
              <span style={twoLineTextStyles}>Admin Panel</span>
            </Link>
          )
        }
        : null,

      {
        key: 'wallet',
        element: (
          <Link
            to="/dashboard#wallet"
            className={`${actionButtonBase} text-slate-950 font-bold text-[16px] border-emerald-300 bg-emerald-50`}
          >
            <Wallet className="h-6 w-8 mb-1" />
            <span style={twoLineTextStyles}>₹{walletBalance}</span>
          </Link>
        )
      },
      {
        key: 'dashboard',
        element: (
          <Link
            to="/dashboard"
            className={`${actionButtonBase} text-slate-800 border-slate-200 bg-slate-50 hover:bg-slate-100`}
          >
            <User className="h-4 w-4 mb-1" />
            <span style={twoLineTextStyles}>{t('Dashboard')}</span>
          </Link>
        )
      },
      {
        key: 'logout',
        element: (
          <button
            onClick={logout}
            className={`${actionButtonBase} text-red-700 border-red-200 bg-red-50 hover:bg-red-100`}
          >
            <X className="h-4 w-4 mb-1" />
            <span style={twoLineTextStyles}>{t('Logout')}</span>
          </button>
        )
      }
    ].filter(Boolean)
    : [
      {
        key: 'welcome',
        element: (
          <div className={`hidden 2xl:flex ${actionButtonBase} border-amber-300 text-slate-800 bg-amber-50/80`}>
            <span className="text-[9px] uppercase tracking-[0.4em] text-slate-500 font-bold">Welcome</span>
            <span className="text-xs font-bold text-amber-700 text-center" style={twoLineTextStyles}>
              {welcomeMessage}
            </span>
          </div>
        )
      },
      {
        key: 'home',
        element: (
          <Link
            to="/"
            className={`hidden 2xl:flex ${actionButtonBase} border-slate-200 text-slate-700 hover:text-black hover:border-slate-300 hover:bg-slate-50`}
          >
            <HomeIcon className="h-4 w-4 mb-1" />
            <span style={twoLineTextStyles}>{t('Home')}</span>
          </Link>
        )
      },
      {
        key: 'free-consult',
        element: (
          <Link
            to="/booking"
            className={`${actionButtonBase} text-slate-950 font-bold bg-gradient-to-r from-amber-300 via-orange-400 to-pink-500 border-transparent shadow-xs`}
          >
            <MessageCircle className="h-4 w-4 mb-1" />
            <span style={twoLineTextStyles}>{t('Free Consultation Chat')}</span>
          </Link>
        )
      },
      {
        key: 'book',
        element: (
          <Link
            to="/booking"
            className={`${actionButtonBase} text-slate-950 font-bold bg-gradient-to-r from-yellow-400 to-orange-500 border-yellow-400/60 shadow-xs`}
          >
            <Calendar className="h-4 w-4 mb-1" />
            <span style={twoLineTextStyles}>{t('Book Session')}</span>
          </Link>
        )
      },
      {
        key: 'login',
        element: (
          <Link
            to="/login"
            className={`${actionButtonBase} text-slate-900 border-slate-300 hover:bg-slate-100 font-bold`}
          >
            <User className="h-4 w-4 mb-1" />
            <span style={twoLineTextStyles}>{t('Login')}</span>
          </Link>
        )
      },
      {
        key: 'register',
        element: (
          <Link
            to="/register"
            className={`${actionButtonBase} text-white font-bold border-transparent bg-gradient-to-r from-purple-600 to-pink-600 shadow-xs hover:opacity-95`}
          >
            <Star className="h-4 w-4 mb-1" />
            <span style={twoLineTextStyles}>{t('Get Started')}</span>
          </Link>
        )
      }
    ];

  const renderNavServiceButton = (service) => {
    const Icon = service.icon;
    const isCurrent = isActivePath(service.path);
    const linkContent = (
      <>
        <Icon className="h-3.5 w-3.5 text-amber-500 group-hover:scale-110 transition-transform shrink-0" />
        <span>{t(service.name)}</span>
      </>
    );

    const buttonClasses = `group flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${isCurrent
      ? 'bg-amber-50 text-amber-700 border border-amber-300 shadow-2xs'
      : 'text-slate-800 hover:text-amber-600 hover:bg-amber-50/70 border border-transparent hover:border-amber-200'
      }`;

    return service.isExternal ? (
      <a
        key={service.name}
        href={service.path}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClasses}
      >
        {linkContent}
      </a>
    ) : (
      <Link
        key={service.name}
        to={service.path}
        className={buttonClasses}
      >
        {linkContent}
      </Link>
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center py-2 gap-3">
          {/* Logo */}
          <Link to="/" className="flex items-center group shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mr-2.5 group-hover:scale-110 transition-all duration-300 shadow-md">
              <span className="text-xl">🕉</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-extrabold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent leading-tight">
                AstroConsult
              </h1>
              <span className="text-[11px] text-slate-500 font-semibold">ज्योतिष शास्त्र</span>
            </div>
          </Link>

          {/* Desktop Nav Bar Direct Buttons displayed in Two Rows */}
          <div className="hidden lg:flex flex-col items-center justify-center gap-1 shrink-0 py-0.5">
            {/* Row 1: Daily Panchang, Monthly Calendar, Monthly Panchang, Relationship Horoscope */}
            <div className="flex items-center gap-1.5 xl:gap-2 justify-center">
              {navServices.slice(0, 4).map(renderNavServiceButton)}
            </div>
            {/* Row 2: Advance Muhurt, Adv. Nakshatra, Vastu Shastra, Shop */}
            <div className="flex items-center gap-1.5 xl:gap-2 justify-center">
              {navServices.slice(4).map(renderNavServiceButton)}
            </div>
          </div>

          {/* Actions / Auth Section + Language Dropdown */}
          <div className="hidden md:flex items-center justify-end gap-2 shrink-0">
            {/* Global Language Selector (AstroSage style) */}
            <div id="lang-selector-container" className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-slate-800 text-xs font-bold transition shadow-xs cursor-pointer"
                title="Select Website Language"
              >
                <Globe className="h-3.5 w-3.5 text-amber-600" />
                <span className="font-semibold text-amber-900">{currentLangObj?.native || 'English'}</span>
                <ChevronDown className={`h-3 w-3 text-slate-500 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                    Select Language
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {supportedLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          changeLanguage(lang.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition hover:bg-amber-50 ${currentLang === lang.code
                          ? 'font-bold text-amber-800 bg-amber-50/70'
                          : 'text-slate-700'
                          }`}
                      >
                        <span className="font-medium">{lang.native}</span>
                        <span className="text-[10px] text-slate-400 uppercase">{lang.code}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div
              className="flex items-stretch gap-1.5 text-[10px] whitespace-nowrap overflow-x-auto flex-nowrap"
              style={{ scrollbarWidth: 'none' }}
            >
              {actionButtons.map((action) => (
                <React.Fragment key={action.key}>{action.element}</React.Fragment>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-700 hover:text-black transition-colors duration-200 rounded-lg hover:bg-slate-100"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden">
            {/* Mobile backdrop */}
            <div className="absolute inset-x-0 top-full bg-white/98 backdrop-blur-lg border-t border-slate-200 rounded-b-2xl shadow-2xl">
              <div className="px-4 py-6 space-y-3 max-h-[85vh] overflow-y-auto">
                {/* Mobile Language Selector Strip */}
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-2">
                    <Globe className="h-4 w-4 text-amber-600" />
                    <span>Select Language (ভাষা নির্বাচন)</span>
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                    {supportedLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          changeLanguage(lang.code);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${currentLang === lang.code
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-amber-100/50'
                          }`}
                      >
                        {lang.native}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Explore Services Direct Buttons (Mobile Nav) */}
                <div className="mb-4 pb-3 border-b border-slate-200">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2 px-1">
                    Explore Services
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {navServices.map((service) => {
                      const Icon = service.icon;
                      const isCurrent = isActivePath(service.path);
                      const content = (
                        <>
                          <Icon className="h-4 w-4 text-amber-500 shrink-0" />
                          <span className="text-xs font-bold text-slate-800">{t(service.name)}</span>
                        </>
                      );
                      return service.isExternal ? (
                        <a
                          key={service.name}
                          href={service.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-amber-50 transition"
                        >
                          {content}
                        </a>
                      ) : (
                        <Link
                          key={service.name}
                          to={service.path}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-2 p-2 rounded-xl border transition ${isCurrent
                            ? 'bg-amber-50 border-amber-300 text-amber-700'
                            : 'bg-slate-50 border-slate-200 hover:bg-amber-50 text-slate-800'
                            }`}
                        >
                          {content}
                        </Link>
                      );
                    })}
                  </div>
                </div>
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${isActivePath(item.path)
                        ? 'bg-amber-50 text-amber-700 border border-amber-300 font-bold'
                        : 'text-slate-700 hover:text-black hover:bg-slate-50'
                        }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{t(item.name)}</span>
                    </Link>
                  );
                })}

                {/* Mobile Auth */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  {isAuthenticated ? (
                    <>
                      {/* Mobile Welcome User Display */}
                      <div className="px-4 py-3 rounded-xl border border-amber-200 bg-amber-50/70">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-black" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-amber-800 font-bold">नमस्ते, {user?.name || 'Guest'} जी</span>
                            <span className="text-slate-500 text-sm">आपका स्वागत है</span>
                          </div>
                        </div>
                      </div>

                      {/* Admin Panel - Mobile */}
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-50 text-red-700 rounded-xl border border-red-200 font-bold"
                        >
                          <Shield className="h-4 w-4" />
                          <span>Admin Panel</span>
                        </Link>
                      )}
                      <Link
                        to="/booking"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-950 rounded-xl font-bold shadow-xs"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>Book Session</span>
                      </Link>
                      <Link
                        to="/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center space-x-2 px-4 py-3 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 font-semibold"
                      >
                        <User className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsOpen(false);
                        }}
                        className="w-full px-4 py-3 bg-red-50 text-red-700 border border-red-200 rounded-xl hover:bg-red-100 transition-colors duration-200 font-bold"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Mobile Login Box */}
                      <Link
                        to="/login"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center space-x-2 px-4 py-3 bg-slate-50 text-slate-900 rounded-xl border border-slate-300 font-bold hover:bg-slate-100"
                      >
                        <User className="h-4 w-4" />
                        <span>Sign In</span>
                      </Link>

                      {/* Mobile Register Box */}
                      <Link
                        to="/register"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-xs"
                      >
                        <Star className="h-4 w-4" />
                        <span>Get Started</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </nav>
  );
};

export default Navigation;