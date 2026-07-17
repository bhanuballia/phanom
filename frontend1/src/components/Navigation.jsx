import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  X,
  Star,
  User,
  Calendar,
  Users,
  Info,
  Phone,
  Sparkles,
  Shield,
  ChevronDown,
  Heart,
  BookOpen,
  Calculator,
  Home as HomeIcon,
  MessageCircle
} from 'lucide-react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  // Removed dropdown state as all items are now displayed directly
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

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

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight * 0.8,
      behavior: 'smooth'
    });
  };

  const navigationItems = [
    { name: 'About AstroConsult', path: '/about', icon: Info },
    { name: 'Our Astrologers', path: '/astrologers', icon: Users },
    { name: 'Zodiac Insights', path: '/zodiac', icon: Star },
    { name: 'Daily Calendar', path: '/daily-calendar', icon: Calendar },
    { name: 'AI Astrologer', path: '/ai-astrologer', icon: Sparkles },
    { name: 'Kundali Services', path: '/kundali', icon: BookOpen },
    { name: 'Kundali Matching', path: '/kundali-matching', icon: Heart },
    { name: 'Lal Kitab Remedies', path: '/lal-kitab', icon: Sparkles },
    { name: 'Advanced Numerology', path: '/numerology', icon: Calculator },
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
    'group relative flex flex-col items-center justify-center px-2.5 py-1.5 rounded-lg border text-[10px] font-semibold leading-tight tracking-tight transition-all duration-300 min-w-[92px]';

  const actionButtons = isAuthenticated
    ? [
      {
        key: 'welcome',
        element: (
          <div className={`${actionButtonBase} border-white/15 text-yellow-200 bg-white/5`}>
            <span className="text-[9px] uppercase tracking-[0.4em] text-gray-400">Welcome</span>
            <span className="text-xs font-semibold text-yellow-300 text-center" style={twoLineTextStyles}>
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
            className={`${actionButtonBase} border-white/15 text-white/80 hover:text-white hover:border-white/40 hover:bg-white/10`}
          >
            <HomeIcon className="h-4 w-4 mb-1" />
            <span style={twoLineTextStyles}>Home</span>
          </Link>
        )
      },
      {
        key: 'free-consult',
        element: (
          <Link
            to="/booking"
            className={`${actionButtonBase} text-slate-900 bg-gradient-to-r from-amber-300 via-pink-400 to-purple-500 border-transparent shadow-lg shadow-amber-400/30`}
          >
            <MessageCircle className="h-4 w-4 mb-1" />
            <span style={twoLineTextStyles}>Free Consultation Chat</span>
          </Link>
        )
      },
      user?.role === 'admin'
        ? {
          key: 'admin',
          element: (
            <Link
              to="/admin"
              className={`${actionButtonBase} text-red-200 border-red-400/40 bg-gradient-to-r from-red-500/20 to-red-600/20`}
            >
              <Shield className="h-4 w-4 mb-1" />
              <span style={twoLineTextStyles}>Admin Panel</span>
            </Link>
          )
        }
        : null,
      {
        key: 'book',
        element: (
          <Link
            to="/booking"
            className={`${actionButtonBase} text-black bg-gradient-to-r from-yellow-400 to-orange-500 border-yellow-400/60`}
          >
            <Calendar className="h-4 w-4 mb-1" />
            <span style={twoLineTextStyles}>Book Session</span>
          </Link>
        )
      },
      {
        key: 'dashboard',
        element: (
          <Link
            to="/dashboard"
            className={`${actionButtonBase} text-white border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20`}
          >
            <User className="h-4 w-4 mb-1" />
            <span style={twoLineTextStyles}>Dashboard</span>
          </Link>
        )
      },
      {
        key: 'logout',
        element: (
          <button
            onClick={logout}
            className={`${actionButtonBase} text-red-200 border-red-400/40 bg-red-500/20 hover:bg-red-500/30`}
          >
            <X className="h-4 w-4 mb-1" />
            <span style={twoLineTextStyles}>Logout</span>
          </button>
        )
      }
    ].filter(Boolean)
    : [
      {
        key: 'welcome',
        element: (
          <div className={`${actionButtonBase} border-white/15 text-yellow-200 bg-white/5`}>
            <span className="text-[9px] uppercase tracking-[0.4em] text-gray-400">Welcome</span>
            <span className="text-xs font-semibold text-yellow-300 text-center" style={twoLineTextStyles}>
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
            className={`${actionButtonBase} border-white/15 text-white/80 hover:text-white hover:border-white/40 hover:bg-white/10`}
          >
            <HomeIcon className="h-4 w-4 mb-1" />
            <span style={twoLineTextStyles}>Home</span>
          </Link>
        )
      },
      {
        key: 'free-consult',
        element: (
          <Link
            to="/booking"
            className={`${actionButtonBase} text-slate-900 bg-gradient-to-r from-amber-300 via-pink-400 to-purple-500 border-transparent shadow-lg shadow-amber-400/30`}
          >
            <MessageCircle className="h-4 w-4 mb-1" />
            <span style={twoLineTextStyles}>Free Consultation Chat</span>
          </Link>
        )
      },
      {
        key: 'book',
        element: (
          <Link
            to="/booking"
            className={`${actionButtonBase} text-black bg-gradient-to-r from-yellow-400 to-orange-500 border-yellow-400/60`}
          >
            <Calendar className="h-4 w-4 mb-1" />
            <span style={twoLineTextStyles}>Book Session</span>
          </Link>
        )
      },
      {
        key: 'login',
        element: (
          <Link
            to="/login"
            className={`${actionButtonBase} text-white border-blue-400/40 bg-gradient-to-r from-blue-500/20 to-purple-500/20`}
          >
            <User className="h-4 w-4 mb-1" />
            <span style={twoLineTextStyles}>Login</span>
          </Link>
        )
      },
      {
        key: 'register',
        element: (
          <Link
            to="/register"
            className={`${actionButtonBase} text-white border-purple-400/50 bg-gradient-to-r from-purple-500 to-pink-500`}
          >
            <Star className="h-4 w-4 mb-1" />
            <span style={twoLineTextStyles}>Get Started</span>
          </Link>
        )
      }
    ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-5">
        <div className="flex justify-between items-center py-2 gap-2">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mr-3 group-hover:scale-110 transition-all duration-300 shadow-lg">
              <span className="text-xl">🕉</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-purple-400 bg-clip-text text-transparent">
                AstroConsult
              </h1>
              <span className="text-xs text-gray-400">ज्योतिष शास्त्र</span>
            </div>
          </Link>

          {/* Center spacer / scroll button */}
          <div className="hidden md:flex flex-1 justify-center">
            {showScrollDown && (
              <button
                onClick={scrollToContent}
                className="relative flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 group text-gray-300 hover:text-white"
                aria-label="Scroll down"
              >
                <div className="absolute inset-0 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <ChevronDown className="h-3.5 w-3.5 relative z-10" />
                <span className="relative z-10 hidden lg:inline">Scroll Down</span>
              </button>
            )}
          </div>

          {/* Actions / Auth Section */}
          <div className="hidden md:flex flex-1 justify-end">
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
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-300 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/10"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            {/* Mobile backdrop */}
            <div className="absolute inset-x-0 top-full bg-slate-900/95 backdrop-blur-lg border-t border-white/10 rounded-b-2xl shadow-2xl">
              <div className="px-4 py-6 space-y-3">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${isActivePath(item.path)
                          ? 'bg-gradient-to-r from-yellow-400/20 to-purple-400/20 text-yellow-400 border border-yellow-400/30'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

                {/* Mobile Auth */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  {isAuthenticated ? (
                    <>
                      {/* Mobile Welcome User Display */}
                      <div className="glass-card px-4 py-3 rounded-xl border border-yellow-400/30 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 backdrop-blur-sm">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-black" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-yellow-400 font-semibold">नमस्ते, {user?.name || 'Guest'} जी</span>
                            <span className="text-gray-400 text-sm">आपका स्वागत है</span>
                          </div>
                        </div>
                      </div>

                      {/* Admin Panel - Mobile */}
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center justify-center space-x-2 px-4 py-3 glass-card bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 rounded-xl border border-red-400/30 backdrop-blur-sm font-medium"
                        >
                          <Shield className="h-4 w-4" />
                          <span>Admin Panel</span>
                        </Link>
                      )}
                      <Link
                        to="/booking"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center space-x-2 px-4 py-3 glass-card bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-xl border border-yellow-400/50 font-semibold"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>Book Session</span>
                      </Link>
                      <Link
                        to="/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center space-x-2 px-4 py-3 glass-card bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 font-medium"
                      >
                        <User className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsOpen(false);
                        }}
                        className="w-full glass-card px-4 py-3 bg-red-500/20 text-red-300 border border-red-400/30 rounded-xl hover:bg-red-500/30 backdrop-blur-sm transition-colors duration-200 font-medium"
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
                        className="flex items-center justify-center space-x-2 px-4 py-3 glass-card bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white rounded-xl border border-blue-400/30 backdrop-blur-sm font-medium"
                      >
                        <User className="h-4 w-4" />
                        <span>Sign In</span>
                      </Link>

                      {/* Mobile Register Box */}
                      <Link
                        to="/register"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center space-x-2 px-4 py-3 glass-card bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl border border-purple-400/50 font-semibold"
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