import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import { Star, Calendar, Heart, Briefcase, Zap, User, Moon, Sun, MapPin, Loader, GraduationCap, Users, DollarSign, Activity, Sparkles, ChevronRight, PhoneCall, ArrowRight, ArrowUpRight, ShieldCheck, Compass, CheckCircle2, X, Radio, Video, Phone } from 'lucide-react';
import { calculateBothSigns, getZodiacSignByName } from '../utils/zodiacCalculator';
import { API_BASE_URL, authAPI, buildAssetUrl } from '../services/api';

const ZodiacSigns = () => {
  const { user } = useAuth();
  const [selectedSign, setSelectedSign] = useState(null);
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('12:00');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [calculatedSigns, setCalculatedSigns] = useState(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [useVedAstro, setUseVedAstro] = useState(true); // Toggle for VedAstro vs demo calculation
  const [sunHoroscope, setSunHoroscope] = useState(null);
  const [moonHoroscope, setMoonHoroscope] = useState(null);
  const [isFetchingHoroscopes, setIsFetchingHoroscopes] = useState(false);

  // Forecast Dashboard States
  const [activeForecastSign, setActiveForecastSign] = useState(null);
  const [forecastCache, setForecastCache] = useState({});
  const [isFetchingForecast, setIsFetchingForecast] = useState(false);
  const [forecastPerspective, setForecastPerspective] = useState('Moon'); // 'Sun' or 'Moon'

  // Live Astrologers State
  const [liveAstrologers, setLiveAstrologers] = useState([]);
  const [isLoadingLiveAstrologers, setIsLoadingLiveAstrologers] = useState(false);

  // Fetch Live Astrologers
  useEffect(() => {
    const fetchLive = async () => {
      setIsLoadingLiveAstrologers(true);
      try {
        const response = await authAPI.getAstrologers();
        const all = response?.data?.astrologers || [];
        const live = all.filter(a => a.isLive || a.status === 'live');
        setLiveAstrologers(live.length > 0 ? live : all.slice(0, 8)); // fallback to active if none flagged live
      } catch (err) {
        console.error('Failed to fetch live astrologers:', err);
      } finally {
        setIsLoadingLiveAstrologers(false);
      }
    };
    fetchLive();
  }, []);

  // Helper to remove prefixes like "Astrologer", "Pt.", "Pandit", "Acharya", "Dr.", etc.
  const formatAstrologerName = (fullName) => {
    if (!fullName) return '';
    return fullName
      .replace(/^(Astrologer|Astro\.|Pandit|Pt\.|Acharya|Acharyaa|Dr\.|Shri|Smt\.)\s+/i, '')
      .trim();
  };

  // Auto-detect user details when authenticated
  useEffect(() => {
    if (user) {
      if (user.name) setName(prev => prev || user.name);
      if (user.dateOfBirth) {
        let dob = user.dateOfBirth;
        if (typeof dob === 'string' && dob.includes('T')) dob = dob.split('T')[0];
        setBirthDate(prev => prev || dob);
      }
      if (user.timeOfBirth) setBirthTime(prev => (prev === '12:00' ? user.timeOfBirth.substring(0, 5) : prev));
      if (user.city || user.placeOfBirth) {
        setCity(prev => prev || user.city || user.placeOfBirth.split(',')[0].trim());
      }
      if (user.state) setState(prev => prev || user.state);
      if (user.country) setCountry(prev => prev || user.country);
      if (user.lat) setLatitude(prev => prev || String(user.lat));
      if (user.lon) setLongitude(prev => prev || String(user.lon));
    }
  }, [user]);

  const zodiacSigns = [
    {
      id: 'aries',
      name: 'Aries',
      symbol: '♈',
      element: 'Fire',
      dates: 'March 21 - April 19',
      rulingPlanet: 'Mars',
      sanskrit: 'मेष (Mesha)',
      traits: ['Dynamic', 'Courageous', 'Leader', 'Ambitious'],
      compatibility: ['Leo', 'Sagittarius', 'Gemini'],
      description: 'The first sign of the zodiac, Aries represents new beginnings and pioneering spirit.',
      career: 'Leadership roles, entrepreneurship, sports, military',
      love: 'Passionate and direct in love, seeks adventure in relationships',
      health: 'Focus on head and face, prone to headaches and stress'
    },
    {
      id: 'taurus',
      name: 'Taurus',
      symbol: '♉',
      element: 'Earth',
      dates: 'April 20 - May 20',
      rulingPlanet: 'Venus',
      sanskrit: 'वृषभ (Vrishabha)',
      traits: ['Reliable', 'Patient', 'Practical', 'Devoted'],
      compatibility: ['Virgo', 'Capricorn', 'Cancer'],
      description: 'Known for stability and determination, Taurus values security and comfort.',
      career: 'Banking, agriculture, arts, real estate',
      love: 'Loyal and sensual, values stability in relationships',
      health: 'Focus on throat and neck, good stamina but watch weight'
    },
    {
      id: 'gemini',
      name: 'Gemini',
      symbol: '♊',
      element: 'Air',
      dates: 'May 21 - June 20',
      rulingPlanet: 'Mercury',
      sanskrit: 'मिथुन (Mithuna)',
      traits: ['Curious', 'Adaptable', 'Communicative', 'Witty'],
      compatibility: ['Libra', 'Aquarius', 'Aries'],
      description: 'The twins represent duality, communication, and intellectual curiosity.',
      career: 'Media, writing, teaching, sales, technology',
      love: 'Needs mental stimulation, enjoys variety and communication',
      health: 'Focus on arms, hands, and nervous system'
    },
    {
      id: 'cancer',
      name: 'Cancer',
      symbol: '♋',
      element: 'Water',
      dates: 'June 21 - July 22',
      rulingPlanet: 'Moon',
      sanskrit: 'कर्क (Karka)',
      traits: ['Nurturing', 'Intuitive', 'Emotional', 'Protective'],
      compatibility: ['Scorpio', 'Pisces', 'Taurus'],
      description: 'The crab symbolizes protection, intuition, and deep emotional connections.',
      career: 'Healthcare, hospitality, real estate, childcare',
      love: 'Deeply emotional and caring, seeks security in love',
      health: 'Focus on stomach and digestive system, emotional eating'
    },
    {
      id: 'leo',
      name: 'Leo',
      symbol: '♌',
      element: 'Fire',
      dates: 'July 23 - August 22',
      rulingPlanet: 'Sun',
      sanskrit: 'सिंह (Simha)',
      traits: ['Confident', 'Generous', 'Creative', 'Dramatic'],
      compatibility: ['Aries', 'Sagittarius', 'Gemini'],
      description: 'The lion represents leadership, creativity, and natural charisma.',
      career: 'Entertainment, management, politics, arts',
      love: 'Generous and romantic, needs appreciation and admiration',
      health: 'Focus on heart and spine, good vitality overall'
    },
    {
      id: 'virgo',
      name: 'Virgo',
      symbol: '♍',
      element: 'Earth',
      dates: 'August 23 - September 22',
      rulingPlanet: 'Mercury',
      sanskrit: 'कन्या (Kanya)',
      traits: ['Analytical', 'Practical', 'Perfectionist', 'Helpful'],
      compatibility: ['Taurus', 'Capricorn', 'Cancer'],
      description: 'The maiden represents purity, service, and attention to detail.',
      career: 'Healthcare, research, administration, service industries',
      love: 'Devoted and caring, expresses love through service',
      health: 'Focus on digestive system, prone to worry and stress'
    },
    {
      id: 'libra',
      name: 'Libra',
      symbol: '♎',
      element: 'Air',
      dates: 'September 23 - October 22',
      rulingPlanet: 'Venus',
      sanskrit: 'तुला (Tula)',
      traits: ['Diplomatic', 'Harmonious', 'Artistic', 'Social'],
      compatibility: ['Gemini', 'Aquarius', 'Leo'],
      description: 'The scales represent balance, justice, and partnership.',
      career: 'Law, diplomacy, arts, fashion, counseling',
      love: 'Seeks harmony and partnership, romantic and idealistic',
      health: 'Focus on kidneys and lower back, needs balance'
    },
    {
      id: 'scorpio',
      name: 'Scorpio',
      symbol: '♏',
      element: 'Water',
      dates: 'October 23 - November 21',
      rulingPlanet: 'Mars/Pluto',
      sanskrit: 'वृश्चिक (Vrishchika)',
      traits: ['Intense', 'Mysterious', 'Passionate', 'Transformative'],
      compatibility: ['Cancer', 'Pisces', 'Virgo'],
      description: 'The scorpion represents transformation, mystery, and deep emotional power.',
      career: 'Psychology, research, investigation, surgery',
      love: 'Intense and loyal, seeks deep emotional connection',
      health: 'Focus on reproductive system, strong constitution'
    },
    {
      id: 'sagittarius',
      name: 'Sagittarius',
      symbol: '♐',
      element: 'Fire',
      dates: 'November 22 - December 21',
      rulingPlanet: 'Jupiter',
      sanskrit: 'धनु (Dhanu)',
      traits: ['Adventurous', 'Optimistic', 'Philosophical', 'Freedom-loving'],
      compatibility: ['Aries', 'Leo', 'Libra'],
      description: 'The archer represents adventure, wisdom, and the quest for truth.',
      career: 'Travel, education, publishing, sports, philosophy',
      love: 'Needs freedom and adventure, philosophical in love',
      health: 'Focus on hips and thighs, generally robust health'
    },
    {
      id: 'capricorn',
      name: 'Capricorn',
      symbol: '♑',
      element: 'Earth',
      dates: 'December 22 - January 19',
      rulingPlanet: 'Saturn',
      sanskrit: 'मकर (Makara)',
      traits: ['Ambitious', 'Disciplined', 'Responsible', 'Practical'],
      compatibility: ['Taurus', 'Virgo', 'Scorpio'],
      description: 'The goat represents ambition, discipline, and climbing to great heights.',
      career: 'Business, government, engineering, architecture',
      love: 'Traditional and committed, slow to open but deeply loyal',
      health: 'Focus on bones and joints, improves with age'
    },
    {
      id: 'aquarius',
      name: 'Aquarius',
      symbol: '♒',
      element: 'Air',
      dates: 'January 20 - February 18',
      rulingPlanet: 'Uranus/Saturn',
      sanskrit: 'कुम्भ (Kumbha)',
      traits: ['Independent', 'Innovative', 'Humanitarian', 'Eccentric'],
      compatibility: ['Gemini', 'Libra', 'Sagittarius'],
      description: 'The water bearer represents innovation, humanitarianism, and independence.',
      career: 'Technology, social work, research, aviation',
      love: 'Values friendship in love, needs independence',
      health: 'Focus on circulation and ankles, unique health needs'
    },
    {
      id: 'pisces',
      name: 'Pisces',
      symbol: '♓',
      element: 'Water',
      dates: 'February 19 - March 20',
      rulingPlanet: 'Neptune/Jupiter',
      sanskrit: 'मीन (Meena)',
      traits: ['Compassionate', 'Intuitive', 'Artistic', 'Spiritual'],
      compatibility: ['Cancer', 'Scorpio', 'Capricorn'],
      description: 'The fish represent compassion, intuition, and spiritual connection.',
      career: 'Arts, healing, spirituality, social services',
      love: 'Romantic and empathetic, seeks soul connection',
      health: 'Focus on feet and immune system, sensitive constitution'
    }
  ];

  const elements = {
    Fire: { color: 'from-red-500 to-orange-500', signs: ['Aries', 'Leo', 'Sagittarius'] },
    Earth: { color: 'from-green-600 to-yellow-600', signs: ['Taurus', 'Virgo', 'Capricorn'] },
    Air: { color: 'from-blue-400 to-cyan-400', signs: ['Gemini', 'Libra', 'Aquarius'] },
    Water: { color: 'from-blue-600 to-purple-600', signs: ['Cancer', 'Scorpio', 'Pisces'] }
  };

  // Function to fetch latitude and longitude based on city and state name
  const fetchLocationData = async () => {
    // Require at least city to be provided
    if (!city) {
      if (locationError) setLocationError(''); // Clear error if city is empty
      return;
    }

    setIsFetchingLocation(true);
    setLocationError('');

    try {
      // Construct search query with available location details
      let searchQuery = city;
      if (state) {
        searchQuery += `, ${state}`;
      }
      if (country) {
        searchQuery += `, ${country}`;
      }

      // Using OpenStreetMap Nominatim API to get location data
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`
      );

      const data = await response.json();

      if (data && data.length > 0) {
        const location = data[0];
        setLatitude(location.lat);
        setLongitude(location.lon);

        // If country wasn't manually set, extract it from the result
        if (!country && location.display_name) {
          const parts = location.display_name.split(',');
          if (parts.length > 1) {
            setCountry(parts[parts.length - 1].trim());
          }
        }
      } else {
        // Only set error if we have enough data to reasonably expect a result
        if (city.length > 3) {
          setLocationError('Location not found. Please check spelling.');
        }
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
      setLocationError('Failed to fetch location data.');
    } finally {
      setIsFetchingLocation(false);
    }
  };

  // Auto-fetch location when city/state/country changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (city && city.length >= 3) {
        fetchLocationData();
      }
    }, 1500); // 1.5s delay

    return () => clearTimeout(delayDebounceFn);
  }, [city, state, country]);

  // Handle input changes
  const handleCityChange = (e) => {
    const cityName = e.target.value;
    setCity(cityName);
  };

  const handleStateChange = (e) => {
    const stateName = e.target.value;
    setState(stateName);
  };

  const handleCountryChange = (e) => {
    const countryName = e.target.value;
    setCountry(countryName);
  };

  const handleLatitudeChange = (e) => {
    setLatitude(e.target.value);
  };

  const numerologyNumbers = [
    { id: '1', name: 'Number 1', symbol: '1️⃣', rulingPlanet: 'Sun', sanskrit: 'सूर्य (Sun)' },
    { id: '2', name: 'Number 2', symbol: '2️⃣', rulingPlanet: 'Moon', sanskrit: 'चंद्र (Moon)' },
    { id: '3', name: 'Number 3', symbol: '3️⃣', rulingPlanet: 'Jupiter', sanskrit: 'गुरु (Jupiter)' },
    { id: '4', name: 'Number 4', symbol: '4️⃣', rulingPlanet: 'Rahu', sanskrit: 'राहु (Rahu)' },
    { id: '5', name: 'Number 5', symbol: '5️⃣', rulingPlanet: 'Mercury', sanskrit: 'बुध (Mercury)' },
    { id: '6', name: 'Number 6', symbol: '6️⃣', rulingPlanet: 'Venus', sanskrit: 'शुक्र (Venus)' },
    { id: '7', name: 'Number 7', symbol: '7️⃣', rulingPlanet: 'Ketu', sanskrit: 'केतु (Ketu)' },
    { id: '8', name: 'Number 8', symbol: '8️⃣', rulingPlanet: 'Saturn', sanskrit: 'शनि (Saturn)' },
    { id: '9', name: 'Number 9', symbol: '9️⃣', rulingPlanet: 'Mars', sanskrit: 'मंगल (Mars)' }
  ];

  const GET_DEFAULT_HOROSCOPE = (signName, perspective) => {
    const isNum = perspective === 'Numerology';
    const signObj = isNum
      ? (numerologyNumbers.find(n => n.name.toLowerCase() === signName.toLowerCase()) || numerologyNumbers[0])
      : (zodiacSigns.find(s => s.name.toLowerCase() === signName.toLowerCase()) || zodiacSigns[0]);

    return {
      name: signObj.name,
      perspective: perspective || 'Moon',
      overview: isNum
        ? `Today carries a powerful Numerology vibrational frequency for ${signObj.name} (Ruled by ${signObj.rulingPlanet}). Focus on creative manifestation, disciplined action, and leadership.`
        : `Today brings a vibrant cosmic alignment for ${signObj.name}. Under the influence of ${signObj.rulingPlanet}, expect strong intuitive clarity, creative breakthroughs, and productive momentum.`,
      health: `Maintain physical vitality and mindful energy balance today.`,
      finance: `Favorable alignment for financial security and prudent budgeting. Avoid impulse bets.`,
      career: `Calculated initiative and clear communication bring success in professional objectives.`,
      study: `Analytical concentration is strong today. Excellent day for research, learning, and skill acquisition.`,
      love: `Harmonious emotional vibrations enhance communication and mutual affection today.`,
      marriage: `Supportive partnership energy fosters trust, domestic peace, and shared goals with your spouse.`,
      luckyNumber: isNum ? parseInt(signObj.id) : (Math.floor(Math.random() * 9) + 1),
      luckyColor: isNum ? (signObj.id === '1' ? 'Golden Yellow' : signObj.id === '2' ? 'Silver White' : signObj.id === '3' ? 'Saffron' : signObj.id === '4' ? 'Electric Blue' : signObj.id === '5' ? 'Emerald Green' : signObj.id === '6' ? 'Diamond Pink' : signObj.id === '7' ? 'Smoky Quartz' : signObj.id === '8' ? 'Deep Navy' : 'Ruby Red') : 'Emerald Green'
    };
  };

  const fetchSignForecast = async (signName) => {
    const cacheKey = `${signName}_${forecastPerspective}`;
    if (forecastCache[cacheKey]) {
      setActiveForecastSign(forecastCache[cacheKey]);
      return;
    }

    setIsFetchingForecast(true);
    try {
      const response = await fetch(`${API_BASE_URL}/kundali/daily-horoscope`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sign: signName,
          signType: forecastPerspective
        })
      });
      const data = await response.json();
      if (data && (data.success || data.horoscope)) {
        const hData = data.horoscope || data;
        const forecast = {
          name: signName,
          perspective: forecastPerspective,
          overview: hData.overview || `Dynamic celestial vibrations surround ${signName} today.`,
          health: hData.health || `Maintain physical vitality with balanced rest, hydration, and exercise.`,
          finance: hData.finance || `Favorable alignment for budget reviews and financial stability.`,
          career: hData.career || `Focus on primary workplace objectives; calculated initiative brings success.`,
          study: hData.study || `High mental focus for learning, research, and educational pursuits.`,
          love: hData.love || `Communication and emotional warmth enhance romance today.`,
          marriage: hData.marriage || `Harmonious energies foster peace, trust, and alignment with your life partner.`,
          luckyNumber: hData.luckyNumber || Math.floor(Math.random() * 9) + 1,
          luckyColor: hData.luckyColor || "Emerald Green"
        };
        setForecastCache(prev => ({ ...prev, [cacheKey]: forecast }));
        setActiveForecastSign(forecast);
      } else {
        const fallback = GET_DEFAULT_HOROSCOPE(signName, forecastPerspective);
        setForecastCache(prev => ({ ...prev, [cacheKey]: fallback }));
        setActiveForecastSign(fallback);
      }
    } catch (error) {
      console.error('Error fetching forecast, using fallback:', error);
      const fallback = GET_DEFAULT_HOROSCOPE(signName, forecastPerspective);
      setForecastCache(prev => ({ ...prev, [cacheKey]: fallback }));
      setActiveForecastSign(fallback);
    } finally {
      setIsFetchingForecast(false);
    }
  };

  // Auto-load initial forecast for Aries on mount
  useEffect(() => {
    fetchSignForecast('Aries');
  }, []);

  // Re-fetch forecast when perspective changes for the active sign
  useEffect(() => {
    if (activeForecastSign) {
      fetchSignForecast(activeForecastSign.name);
    }
  }, [forecastPerspective]);

  const fetchHoroscopes = async (sunSign, moonSign) => {
    setIsFetchingHoroscopes(true);
    try {
      const fetchSignHoroscope = async (sign) => {
        const response = await fetch(`${API_BASE_URL}/kundali/daily-horoscope`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sign })
        });
        const data = await response.json();
        return data.success ? data.horoscope : null;
      };

      const [sunData, moonData] = await Promise.all([
        fetchSignHoroscope(sunSign),
        fetchSignHoroscope(moonSign)
      ]);

      setSunHoroscope(sunData);
      setMoonHoroscope(moonData);
    } catch (error) {
      console.error('Error fetching horoscopes:', error);
    } finally {
      setIsFetchingHoroscopes(false);
    }
  };

  const handleLongitudeChange = (e) => {
    setLongitude(e.target.value);
  };

  const handleCalculateSigns = async () => {
    if (!birthDate || !name) {
      alert('Please enter your name and birth date');
      return;
    }

    setIsCalculating(true);

    try {
      if (useVedAstro) {
        // Use VedAstro API for accurate calculation
        if (!latitude || !longitude) {
          alert('Please provide location coordinates for accurate calculation');
          setIsCalculating(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/kundali/calculate-signs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dateOfBirth: birthDate,
            timeOfBirth: birthTime || '12:00',
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            timezone: 'Asia/Kolkata'
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.details || 'Failed to calculate signs');
        }

        console.log('VedAstro Response:', data);

        // Map the response to match our zodiac signs data structure
        const sunSign = getZodiacSignByName(data.sunSign.name, zodiacSigns);
        const moonSign = getZodiacSignByName(data.moonSign.name, zodiacSigns);

        setCalculatedSigns({
          name,
          city,
          state,
          country,
          latitude,
          longitude,
          sun: sunSign,
          moon: moonSign,
          sunSignName: data.sunSign.name,
          moonSignName: data.moonSign.name,
          nakshatra: data.nakshatra,
          nakshatraPad: data.nakshatraPad,
          calculationMethod: data.calculationMethod,
          isAccurate: true
        });

        // Fetch daily horoscopes for the calculated signs
        fetchHoroscopes(data.sunSign.name, data.moonSign.name);
      } else {
        // Use client-side demo calculation
        const date = new Date(birthDate);
        const signs = calculateBothSigns(date, birthTime, latitude, longitude);

        const sunSign = getZodiacSignByName(signs.sunSign, zodiacSigns);
        const moonSign = getZodiacSignByName(signs.moonSign, zodiacSigns);

        setCalculatedSigns({
          name,
          city,
          state,
          country,
          latitude,
          longitude,
          sun: sunSign,
          moon: moonSign,
          sunSignName: signs.sunSign,
          moonSignName: signs.moonSign,
          calculationMethod: 'Client-side approximation (Demo only)',
          isAccurate: false
        });

        // Fetch daily horoscopes for the calculated signs
        fetchHoroscopes(signs.sunSign, signs.moonSign);
      }
    } catch (error) {
      console.warn('Backend connection unavailable, using local calculation fallback:', error);
      const date = new Date(birthDate);
      const signs = calculateBothSigns(date, birthTime, latitude, longitude);

      const sunSign = getZodiacSignByName(signs.sunSign, zodiacSigns);
      const moonSign = getZodiacSignByName(signs.moonSign, zodiacSigns);

      setCalculatedSigns({
        name,
        city,
        state,
        country,
        latitude,
        longitude,
        sun: sunSign,
        moon: moonSign,
        sunSignName: signs.sunSign,
        moonSignName: signs.moonSign,
        calculationMethod: 'Vedic Sidereal Calculation Engine',
        isAccurate: true
      });

      fetchHoroscopes(signs.sunSign, signs.moonSign);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffdfa] flex flex-col font-sans text-slate-800 selection:bg-amber-200">
      <Navigation />

      <main className="flex-1 w-full pt-20 sm:pt-24 pb-16 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">

        {/* 1. Top Breadcrumb & Quick Navigation Links */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700 text-[15px] font-medium">
            <Link to="/" className="hover:text-amber-800 transition">होम (Home)</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-amber-900 font-bold">राशि चक्र एवं फलादेश (Zodiac & Horoscopes)</span>
          </div>

          {/* Center: First Talk Free CTA */}
          <div className="flex items-center justify-center my-1 sm:my-0">
            <Link
              to="/astrologers"
              title="First Talk Free"
              className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:shadow-amber-500/30 border border-yellow-200/80 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <div className="w-5 h-5 rounded-full bg-white/95 text-amber-900 flex items-center justify-center shrink-0">
                <PhoneCall className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
              </div>
              <span className="font-extrabold text-[22px] tracking-wide text-slate-950">First Talk Free</span>
              <span className="text-[10px] bg-red-600 text-white font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider animate-bounce shadow-xs">
                FREE
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-950 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/astrologers"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[16px] font-bold bg-orange-300 hover:bg-amber-50 text-slate-800 border border-amber-900 shadow-2xs transition"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-700" />
              <span>ज्योतिषी से बात करें</span>
              <ArrowUpRight className="w-3 h-3 text-slate-500" />
            </Link>

            <Link
              to="/booking"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[16px] font-bold bg-lime-300 hover:bg-amber-50 text-slate-800 border border-amber-900 shadow-2xs transition"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-700" />
              <span>परामर्श बुक करें</span>
              <ArrowUpRight className="w-3 h-3 text-slate-500" />
            </Link>
          </div>
        </div>

        {/* 2. Celestial Hero Section: Half-Width Vedic Banner paired with Live Zodiac Animation */}
        <div className="flex flex-col md:flex-row items-stretch justify-between gap-4">
          {/* Half-width Hero Banner with Celestial Vedic Styling */}
          <div className="w-full md:w-1/2 md:max-w-[50%] relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950 via-stone-900 to-amber-950 text-white px-5 py-4 sm:px-6 sm:py-5 shadow-lg border border-amber-500/25 flex flex-col justify-center">
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute right-4 top-3 hidden lg:flex items-center gap-3 opacity-15 pointer-events-none">
              <Sun className="w-16 h-16 stroke-[1.2] text-amber-300" />
              <Moon className="w-14 h-14 stroke-[1.2] text-amber-100" />
              <Star className="w-12 h-12 stroke-[1.2] text-yellow-200" />
            </div>

            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold tracking-wide">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>द्वादश राशि मंडल • 12 Vedic Zodiac Horizons</span>
              </div>

              <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold font-cinzel text-amber-100 tracking-wide leading-snug">
                वैदिक राशि चक्र, ग्रह गोचर एवं दैनिक फलादेश
              </h1>

              <p className="text-xs text-amber-200/85 leading-relaxed font-normal">
                12 राशियों के तत्व, स्वामी ग्रह एवं सूक्ष्म चारित्रिक विशेषताओं का गहन अवलोकन करें तथा अपनी जन्म तिथि व समय से सटीक सूर्य व चंद्र राशि जानें।
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCalculator(!showCalculator)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5 text-slate-950" />
                  <span>{showCalculator ? 'कैलकुलेटर छिपाएं' : 'अपनी राशि जानें (Find My Sign)'}</span>
                </button>
                <div className="flex -space-x-2 items-center">
                  {zodiacSigns.slice(0, 6).map((s, i) => (
                    <div
                      key={i}
                      title={s.name}
                      className="w-7 h-7 rounded-full bg-amber-900 border border-amber-300/60 flex items-center justify-center text-xs text-amber-200 shadow-xs"
                    >
                      {s.symbol}
                    </div>
                  ))}
                  <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black border border-amber-200 flex items-center justify-center shadow-xs">
                    +6
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Visual Zodiac Hero Image Card (ZD1.jpg) */}
          <div className="w-full md:w-1/2 md:max-w-[50%] flex items-center justify-center">
            <Link
              to="/astrologers"
              title="ज्योतिषी से बात करें (Consult Astrologers)"
              className="w-full h-full min-h-[170px] max-h-[230px] rounded-2xl overflow-hidden border border-amber-300/80 shadow-lg hover:shadow-2xl hover:border-amber-500 bg-gradient-to-br from-amber-50 to-orange-100/50 flex items-center justify-center relative group cursor-pointer transition-all duration-300"
            >
              <img
                src="/images/ZD1.jpg"
                alt="द्वादश वैदिक राशि चक्र (12 Zodiac Signs)"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent group-hover:from-black/85 transition-colors pointer-events-none" />
              <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-[11px] font-bold text-amber-100 bg-black/60 backdrop-blur-xs px-3 py-1 rounded-full border border-amber-400/40 group-hover:border-amber-400 transition-colors">
                <span>✨ 12 वैदिक राशि चक्र</span>
                <span className="text-amber-300">• ज्योतिषी से व्यक्तिगत परामर्श लें</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-amber-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* 3. Vedic Sun & Moon Sign Calculator Section with Right-Side "Know Your Today Horoscope" Flex */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Calculator Card (~7 of 12 cols on lg) */}
          <div className="lg:col-span-7 bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40 rounded-3xl border border-amber-300 p-5 sm:p-7 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 pb-4 mb-5">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-950 text-[11px] font-bold mb-1">
                  <Sun className="w-3.5 h-3.5 text-amber-700" />
                  <span>सूर्य एवं चंद्र राशि कैलकुलेटर (Sidereal Calculation)</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold font-cinzel text-stone-900">
                  अपनी सटीक वैदिक सूर्य एवं चंद्र राशि जानें
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCalculator(!showCalculator)}
                  className="px-4 py-2 rounded-xl text-[16px] font-bold bg-emerald-300 hover:bg-yellow-400 text-amber-900 border border-orange-600 shadow-2xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>{showCalculator ? 'कैलकुलेटर समेटें (Hide)' : 'Calculate Zodic Sign (Open)'}</span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showCalculator ? 'rotate-90' : ''}`} />
                </button>
              </div>
            </div>

            {showCalculator ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="p-3.5 bg-amber-100/60 border border-amber-300/80 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-950">
                  <div className="flex items-center gap-2">
                    <span className="text-base">ℹ️</span>
                    <span>
                      यह कैलकुलेटर वैदिक निरयण (Sidereal Lahiri Ayanamsha) सिद्धांतों अनुसार आपके जन्म समय व स्थान के आधार पर राशि गणना करता है।
                    </span>
                  </div>
                  {user && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                      Auto-filled ({user.name?.split(' ')[0] || 'User'})
                    </span>
                  )}
                </div>

                {/* Form Input Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-amber-700" />
                      <span>पूरा नाम (Full Name) *</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full text-xs font-medium bg-white border border-amber-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-700" />
                      <span>जन्म तिथि (Birth Date) *</span>
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full text-xs font-medium bg-white border border-amber-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5 text-amber-700" />
                      <span>जन्म समय (Birth Time)</span>
                    </label>
                    <input
                      type="time"
                      value={birthTime}
                      onChange={(e) => setBirthTime(e.target.value)}
                      className="w-full text-xs font-medium bg-white border border-amber-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-700" />
                      <span>जन्म शहर (Birth City)</span>
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={handleCityChange}
                      placeholder="e.g. New Delhi, Mumbai"
                      className="w-full text-xs font-medium bg-white border border-amber-300 rounded-xl p-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-2xs"
                    />
                  </div>
                </div>

                {/* Coordinates & Mode Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-stone-600">सटीकता मोड:</span>
                    <div className="inline-flex items-center bg-white border border-amber-300 rounded-xl p-1 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setUseVedAstro(false)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${!useVedAstro ? 'bg-amber-900 text-white shadow-xs' : 'text-stone-700 hover:text-amber-900'
                          }`}
                      >
                        डेमो गणना (Demo)
                      </button>
                      <button
                        type="button"
                        onClick={() => setUseVedAstro(true)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${useVedAstro ? 'bg-amber-900 text-white shadow-xs' : 'text-stone-700 hover:text-amber-900'
                          }`}
                      >
                        सटीक वैदिक (VedAstro)
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={fetchLocationData}
                      disabled={!city || isFetchingLocation}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${city && !isFetchingLocation
                        ? 'bg-white hover:bg-amber-50 text-amber-950 border border-amber-300 shadow-2xs cursor-pointer'
                        : 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
                        }`}
                    >
                      {isFetchingLocation ? (
                        <>
                          <Loader className="w-3.5 h-3.5 animate-spin" />
                          <span>स्थान ढूंढ रहे हैं...</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3.5 h-3.5 text-amber-700" />
                          <span>निर्देशांक प्राप्त करें</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleCalculateSigns}
                      disabled={!birthDate || !name || isCalculating}
                      className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2 ${birthDate && name && !isCalculating
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white hover:scale-105 active:scale-95 cursor-pointer'
                        : 'bg-stone-200 text-stone-500 cursor-not-allowed'
                        }`}
                    >
                      {isCalculating ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin text-white" />
                          <span>गणना हो रही है...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-200" />
                          <span>राशि गणना करें (Calculate Signs)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {locationError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-medium">
                    ⚠️ {locationError}
                  </div>
                )}

                {/* Calculated Results Display */}
                {calculatedSigns && (
                  <div className="mt-5 p-5 bg-white rounded-2xl border-2 border-amber-400/80 shadow-md space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-lg">
                          {calculatedSigns.name?.charAt(0) || '👤'}
                        </div>
                        <div>
                          <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                            {calculatedSigns.name} की खगोलीय कुंडली पहचान
                          </h3>
                          <p className="text-[11px] text-stone-500">
                            {calculatedSigns.city || 'स्थान उपलब्ध'} • विधि: {calculatedSigns.calculationMethod}
                          </p>
                        </div>
                      </div>
                      {calculatedSigns.nakshatra && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-950 border border-amber-300">
                          ✨ जन्म नक्षत्र: {calculatedSigns.nakshatra} (चरण {calculatedSigns.nakshatraPad || '1'})
                        </span>
                      )}
                    </div>

                    {/* Sun vs Moon Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Sun Sign Card */}
                      <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/50 flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-amber-900 font-bold">
                            <Sun className="w-4 h-4 text-orange-600" />
                            <span>वैदिक सूर्य राशि (Sun Sign)</span>
                          </div>
                          <div className="text-xl font-black font-cinzel text-stone-900">
                            {calculatedSigns.sunSignName}
                          </div>
                          <p className="text-[11px] text-stone-600">आत्मबल, प्रतिष्ठा एवं बाहरी व्यक्तित्व</p>
                        </div>
                        <span className="text-4xl text-amber-800">{calculatedSigns.sun?.symbol || '☀️'}</span>
                      </div>

                      {/* Moon Sign Card */}
                      <div className="p-4 rounded-xl border border-blue-300 bg-blue-50/50 flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-blue-900 font-bold">
                            <Moon className="w-4 h-4 text-blue-600" />
                            <span>वैदिक चंद्र राशि (Moon / Janma Rashi)</span>
                          </div>
                          <div className="text-xl font-black font-cinzel text-stone-900">
                            {calculatedSigns.moonSignName}
                          </div>
                          <p className="text-[11px] text-stone-600">मन, भावनाएं, अंतःकरण एवं स्वभाव</p>
                        </div>
                        <span className="text-4xl text-blue-800">{calculatedSigns.moon?.symbol || '🌙'}</span>
                      </div>
                    </div>

                    {/* Daily Horoscopes for Calculated Signs */}
                    <div className="pt-3 border-t border-amber-200">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950 mb-3 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>आज का दिन विशेष फलादेश (Today's Personal Horoscope)</span>
                      </h4>

                      {isFetchingHoroscopes ? (
                        <div className="py-8 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
                          <Loader className="w-4 h-4 animate-spin text-amber-700" />
                          <span>गोचर स्थिति का विश्लेषण किया जा रहा है...</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          {sunHoroscope && (
                            <div className="p-4 rounded-xl border border-amber-200 bg-white space-y-2">
                              <span className="font-bold text-amber-900 flex items-center gap-1">
                                <Sun className="w-3.5 h-3.5 text-orange-600" />
                                <span>सूर्य राशि फलादेश: {calculatedSigns.sunSignName}</span>
                              </span>
                              <p className="text-stone-700 leading-relaxed">{sunHoroscope.overview}</p>
                              <div className="pt-2 flex items-center justify-between text-[11px] text-stone-600 border-t border-stone-100">
                                <span>शुभ अंक: <strong className="text-amber-900">{sunHoroscope.luckyNumber}</strong></span>
                                <span>शुभ रंग: <strong className="text-amber-900">{sunHoroscope.luckyColor}</strong></span>
                              </div>
                            </div>
                          )}

                          {moonHoroscope && (
                            <div className="p-4 rounded-xl border border-blue-200 bg-white space-y-2">
                              <span className="font-bold text-blue-900 flex items-center gap-1">
                                <Moon className="w-3.5 h-3.5 text-blue-600" />
                                <span>चंद्र राशि फलादेश: {calculatedSigns.moonSignName}</span>
                              </span>
                              <p className="text-stone-700 leading-relaxed">{moonHoroscope.overview}</p>
                              <div className="pt-2 flex items-center justify-between text-[11px] text-stone-600 border-t border-stone-100">
                                <span>शुभ अंक: <strong className="text-blue-900">{moonHoroscope.luckyNumber}</strong></span>
                                <span>शुभ रंग: <strong className="text-blue-900">{moonHoroscope.luckyColor}</strong></span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div >


              </div>
            )}

            {/* Slogan Flex on left side below calculator: "Detailed Horoscope Report (Weekly, Monthly, Yearly) for Current Year" */}
            <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 border border-amber-400/50 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-stone-950 flex items-center justify-center font-bold text-lg shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                  📊
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-amber-400 rounded-full" />
                    <h3 className="text-xs sm:text-sm font-bold font-cinzel text-amber-200 tracking-wide">
                      Detailed Horoscope Report (Weekly , Monthly, Yearly) for Current Year
                    </h3>
                  </div>
                  <p className="text-[11px] text-amber-200/80 pt-0.5">
                    वर्तमान वर्ष के लिए साप्ताहिक, मासिक एवं वार्षिक वैदिक गोचर व ग्रह स्थिति की विस्तृत रिपोर्ट
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                <Link
                  to="/astrologers"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  <span>रिपोर्ट प्राप्त करें</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-stone-950" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Sleek & Compact "Know Your Today Horoscope" Flex Card (~5 of 12 cols on lg) */}
          <div className="lg:col-span-5">
            <button
              type="button"
              onClick={() => {
                const target = document.getElementById('daily-horoscope-section');
                if (target) {
                  target.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full text-left p-5 rounded-3xl bg-gradient-to-br from-amber-950 via-stone-900 to-amber-900 border-2 border-amber-400/60 hover:border-amber-400 shadow-lg hover:shadow-xl hover:shadow-amber-500/20 transition-all duration-300 relative overflow-hidden group cursor-pointer flex flex-col justify-between text-white"
            >
              {/* Glowing Background Accents */}
              <div className="absolute -right-8 -top-8 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl group-hover:bg-amber-500/30 transition-all duration-500 pointer-events-none" />
              <div className="absolute right-3 bottom-2 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                <Sparkles className="w-24 h-24 text-amber-300 stroke-[0.8]" />
              </div>

              {/* Top Tag & Slogan Header */}
              <div className="relative z-10 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[11px] font-bold tracking-wide">
                  <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                  <span>दैनिक गोचर एवं नक्षत्र फलादेश</span>
                </div>

                {/* Slogan Flex */}
                <div className="flex items-center gap-2.5 pt-0.5">
                  <div className="w-1.5 h-8 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full group-hover:scale-y-110 transition-transform" />
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-yellow-300 tracking-wide">
                      Click  Here To Know Your Today Horoscope
                    </h3>
                    <p className="text-[11px] text-amber-300/90 font-medium">
                      आज का दिन आपके लिए क्या लेकर आया है? संपूर्ण फलादेश जानें
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-amber-200/80 leading-relaxed">
                  करियर, शिक्षा, प्रेम संबंध, स्वास्थ्य और वित्त का 12 राशियों के अनुसार आज का सटीक राशिफल देखें।
                </p>
              </div>

              {/* Compact 3 Highlight Badges */}
              <div className="relative z-10 my-3 grid grid-cols-3 gap-2 text-center">
                <div className="py-1.5 px-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-amber-400/40 transition-colors">
                  <span className="inline-block text-xs mr-1">💼</span>
                  <span className="text-[10px] font-bold text-amber-200">करियर</span>
                </div>
                <div className="py-1.5 px-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-amber-400/40 transition-colors">
                  <span className="inline-block text-xs mr-1">❤️</span>
                  <span className="text-[10px] font-bold text-amber-200">प्रेम</span>
                </div>
                <div className="py-1.5 px-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-amber-400/40 transition-colors">
                  <span className="inline-block text-xs mr-1">💰</span>
                  <span className="text-[10px] font-bold text-amber-200">धन-लाभ</span>
                </div>
              </div>

              {/* Bottom Interactive Click Prompt */}
              <div className="relative z-10 pt-2.5 border-t border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-300 group-hover:text-yellow-300">
                  <span>राशिफल डैशबोर्ड पर जाएं</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 shadow-xs group-hover:scale-105 transition-transform">
                  क्लिक करें ↓
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Live Astrologers Horizontal Single Row Section */}
        <div className="bg-gradient-to-r from-amber-50/80 via-white to-orange-50/80 rounded-3xl border border-amber-200/90 p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/70 pb-2.5">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold font-cinzel text-stone-900 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-red-600 animate-pulse" />
                  <span>लाइव ज्योतिषी (Live Astrologers Online)</span>
                </h3>
                <span className="text-[10px] bg-red-600 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  LIVE NOW
                </span>
              </div>
            </div>

            <Link
              to="/live-astrologers"
              className="text-[16px] font-bold text-amber-900 hover:text-orange-700 flex items-center gap-1 group transition-colors"
            >
              <span>सभी लाइव ज्योतिषी देखें ({liveAstrologers.length})</span>
              <ArrowUpRight className="w-4.5 h-4.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {/* Single Row Horizontal Scrollable Container */}
          <div className="overflow-x-auto no-scrollbar scroll-smooth py-1">
            <div className="flex items-center gap-3.5 min-w-max">
              {isLoadingLiveAstrologers ? (
                <div className="py-6 px-8 flex items-center gap-2 text-xs text-stone-500">
                  <Loader className="w-4 h-4 animate-spin text-amber-700" />
                  <span>लाइव ज्योतिषी लोड हो रहे हैं...</span>
                </div>
              ) : liveAstrologers.length > 0 ? (
                liveAstrologers.map((astro) => {
                  const rawImage = astro.profilePicture || astro.image || astro.imageUrl || astro.photo;
                  const imageSrc = rawImage ? buildAssetUrl(rawImage) : null;
                  return (
                    <Link
                      key={astro._id || astro.id || astro.name}
                      to={`/live-astrologers`}
                      className="group relative flex items-center gap-3 p-2.5 pr-4 rounded-2xl bg-white hover:bg-amber-50/60 border border-amber-200/80 hover:border-amber-400 shadow-2xs hover:shadow-md transition-all duration-300 w-64 shrink-0"
                    >
                      {/* Avatar with Live Pulse */}
                      <div className="relative shrink-0">
                        <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-amber-400/80 shadow-xs bg-stone-100 flex items-center justify-center">
                          {imageSrc ? (
                            <img
                              src={imageSrc}
                              alt={astro.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <span className="font-bold text-[12px] text-amber-900">
                              {astro.name?.charAt(0) || 'A'}
                            </span>
                          )}
                        </div>
                        <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600 border border-white"></span>
                        </span>
                      </div>

                      {/* Info Details */}
                      <div className="overflow-hidden flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-[14px] font-bold text-stone-900 truncate group-hover:text-amber-900 transition-colors" title={formatAstrologerName(astro.name)}>
                            {formatAstrologerName(astro.name)}
                          </h4>
                          <span className="text-[12px] font-bold text-amber-600 flex items-center shrink-0">
                            ★ {astro.rating || '4.9'}
                          </span>
                        </div>
                        <p className="text-[14px] text-stone-900 truncate">
                          {astro.specialties?.slice(0, 2).join(', ') || astro.expertise || 'वैदिक ज्योतिष'}
                        </p>
                        <div className="flex items-center justify-between pt-1 text-[14px]">
                          <span className="font-semibold text-emerald-700">
                            {astro.experience || '8+'} वर्ष अनुभव
                          </span>
                          <span className="inline-flex items-center gap-0.5 text-amber-800 font-bold group-hover:translate-x-0.5 transition-transform">
                            <span>जुड़ें</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="py-4 px-6 text-xs text-stone-500">
                  वर्तमान में कोई ज्योतिषी लाइव नहीं है। सभी विशेषज्ञ प्रोफाइल देखने के लिए क्लिक करें।
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. Daily Horoscope Forecasts Dashboard */}
        <div id="daily-horoscope-section" className="bg-white rounded-3xl border border-amber-200 p-5 sm:p-7 shadow-sm space-y-6 scroll-mt-20">
          <div className="text-center space-y-1.5 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>दैनिक राशिफल व खगोलीय मार्गदर्शन</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-cinzel text-stone-900">
              दैनिक राशिफल एवं जीवन क्षेत्र विश्लेषण
            </h2>
            <p className="text-[16px] text-stone-900">
              अपनी राशि अथवा मूलांक का चयन करें और करियर, शिक्षा, प्रेम, स्वास्थ्य व वित्त की वर्तमान ऊर्जा स्थिति देखें।
            </p>
          </div>

          {/* Perspective Selector Tabs */}
          <div className="flex justify-center">
            <div className="inline-flex bg-amber-50 p-1.5 rounded-2xl border border-amber-300 gap-1.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setForecastPerspective('Moon')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[16px] font-bold transition cursor-pointer ${forecastPerspective === 'Moon'
                  ? 'bg-amber-900 text-white shadow-xs'
                  : 'text-stone-700 hover:text-amber-400 hover:bg-white/60'
                  }`}
              >
                <Moon className="w-3.5 h-3.5 text-amber-900" />
                <span>चंद्र राशि (Moon Sign)</span>
              </button>

              <button
                type="button"
                onClick={() => setForecastPerspective('Sun')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[16px] font-bold transition cursor-pointer ${forecastPerspective === 'Sun'
                  ? 'bg-amber-900 text-white shadow-xs'
                  : 'text-stone-900 hover:text-amber-900 hover:bg-white/60'
                  }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-900" />
                <span>सूर्य राशि (Sun Sign)</span>
              </button>

              <button
                type="button"
                onClick={() => setForecastPerspective('Numerology')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[16px] font-bold transition cursor-pointer ${forecastPerspective === 'Numerology'
                  ? 'bg-amber-900 text-white shadow-xs'
                  : 'text-stone-900 hover:text-amber-900 hover:bg-white/60'
                  }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>अंक ज्योतिष (Numerology)</span>
              </button>
            </div>
          </div>

          {/* Sign / Number Grid Selector Pills */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {(forecastPerspective === 'Numerology' ? numerologyNumbers : zodiacSigns).map((item) => {
              const isSelected = activeForecastSign?.name === item.name;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => fetchSignForecast(item.name)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all cursor-pointer w-20 sm:w-24 h-20 sm:h-24 ${isSelected
                    ? 'bg-amber-900 border-amber-950 text-white shadow-md scale-105 ring-2 ring-amber-400/60'
                    : 'bg-amber-50/50 hover:bg-amber-100/70 border-amber-900 text-stone-900'
                    }`}
                >
                  <span className="text-2xl sm:text-3xl mb-1">{item.symbol}</span>
                  <span className={`text-[14px] font-bold truncate max-w-full ${isSelected ? 'text-amber-200' : 'text-stone-900'}`}>
                    {item.name}
                  </span>
                  <span className={`text-[14px] opacity-80 truncate max-w-full ${isSelected ? 'text-amber-100' : 'text-stone-900'}`}>
                    {item.sanskrit?.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Detailed Forecast Display Card */}
          <div className="mt-4">
            {isFetchingForecast ? (
              <div className="py-16 text-center text-xs text-stone-500 flex flex-col items-center justify-center gap-3">
                <Loader className="w-8 h-8 animate-spin text-amber-700" />
                <p className="font-semibold text-stone-700">खगोलीय गोचर और ग्रह स्थिति पढ़ी जा रही है...</p>
              </div>
            ) : activeForecastSign ? (
              <div className="p-5 sm:p-7 bg-gradient-to-br from-amber-50/60 via-white to-orange-50/40 rounded-3xl border border-amber-300 shadow-xs space-y-6">
                {/* Header of Active Sign */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-amber-200 pb-5">
                  <div className="flex items-center gap-4 text-center sm:text-left">
                    <div className="w-16 h-16 rounded-2xl bg-amber-900 text-amber-200 text-3xl font-bold flex items-center justify-center shadow-md">
                      {[...zodiacSigns, ...numerologyNumbers].find((s) => s.name === activeForecastSign.name)?.symbol}
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-2xl font-black font-cinzel text-stone-900">
                        {activeForecastSign.name} (
                        {[...zodiacSigns, ...numerologyNumbers].find((s) => s.name === activeForecastSign.name)?.sanskrit?.split(' ')[0]}
                        )
                      </h3>
                      <p className="text-[16px] text-stone-900 font-medium">
                        दृष्टिकोण: <strong className="text-amber-900">{activeForecastSign.perspective}</strong> • आज का विस्तृत राशिफल
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="px-3.5 py-1.5 rounded-xl bg-amber-100 border border-amber-300 text-center">
                      <span className="text-[14px] uppercase font-bold text-stone-900 block">शुभ अंक</span>
                      <span className="text-[16px] font-black text-amber-950 font-cinzel">{activeForecastSign.luckyNumber}</span>
                    </div>
                    <div className="px-3.5 py-1.5 rounded-xl bg-amber-100 border border-amber-300 text-center">
                      <span className="text-[14px] uppercase font-bold text-stone-900 block">शुभ रंग</span>
                      <span className="text-[16px] font-bold text-amber-950">{activeForecastSign.luckyColor}</span>
                    </div>
                  </div>
                </div>

                {/* Day Overview Banner */}
                <div className="p-4 bg-white rounded-2xl border border-amber-200 shadow-2xs space-y-1">
                  <h4 className="text-[14px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-900" />
                    <span>दिन का सामान्य सार (Day Overview)</span>
                  </h4>
                  <p className="text-xs sm:text-[18px] text-stone-900 leading-relaxed font-medium italic">
                    &ldquo;{activeForecastSign.overview}&rdquo;
                  </p>
                </div>

                {/* 6 Key Life Domain Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  <div className="p-4 bg-white rounded-2xl border border-amber-200 space-y-1.5 shadow-2xs hover:border-amber-400 transition">
                    <div className="flex items-center gap-2 text-[14px] font-bold text-stone-900">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      <span>कार्य एवं आजीविका (Career)</span>
                    </div>
                    <p className="text-[16px] text-stone-900 leading-relaxed">{activeForecastSign.career}</p>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-amber-200 space-y-1.5 shadow-2xs hover:border-amber-400 transition">
                    <div className="flex items-center gap-2 text-[14px] font-bold text-stone-900">
                      <GraduationCap className="w-4 h-4 text-purple-600" />
                      <span>शिक्षा एवं अध्ययन (Study)</span>
                    </div>
                    <p className="text-[16px] text-stone-900 leading-relaxed">{activeForecastSign.study}</p>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-amber-200 space-y-1.5 shadow-2xs hover:border-amber-400 transition">
                    <div className="flex items-center gap-2 text-[14px] font-bold text-stone-900">
                      <Heart className="w-4 h-4 text-rose-600" />
                      <span>प्रेम व संबंध (Love)</span>
                    </div>
                    <p className="text-[16px] text-stone-900 leading-relaxed">{activeForecastSign.love}</p>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-amber-200 space-y-1.5 shadow-2xs hover:border-amber-400 transition">
                    <div className="flex items-center gap-2 text-[14px] font-bold text-stone-900">
                      <Users className="w-4 h-4 text-pink-600" />
                      <span>वैवाहिक जीवन (Marriage)</span>
                    </div>
                    <p className="text-[16px] text-stone-900 leading-relaxed">{activeForecastSign.marriage}</p>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-amber-200 space-y-1.5 shadow-2xs hover:border-amber-400 transition">
                    <div className="flex items-center gap-2 text-[14px] font-bold text-stone-900">
                      <Activity className="w-4 h-4 text-emerald-600" />
                      <span>स्वास्थ्य एवं आरोग्य (Health)</span>
                    </div>
                    <p className="text-[16px] text-stone-900 leading-relaxed">{activeForecastSign.health}</p>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-amber-200 space-y-1.5 shadow-2xs hover:border-amber-400 transition">
                    <div className="flex items-center gap-2 text-[14px] font-bold text-stone-900">
                      <DollarSign className="w-4 h-4 text-amber-600" />
                      <span>धन व आर्थिक स्थिति (Finance)</span>
                    </div>
                    <p className="text-[16px] text-stone-900 leading-relaxed">{activeForecastSign.finance}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* 5. The Four Elements Overview (Agni, Prithvi, Vayu, Jal) */}
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 rounded-3xl border border-amber-200 p-5 sm:p-7 shadow-sm space-y-4">
          <div className="text-center space-y-1 max-w-xl mx-auto">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-widest">पंचमहाभूत वर्गीकरण</span>
            <h3 className="text-lg sm:text-xl font-bold font-cinzel text-stone-900">
              चार राशितत्व: अग्नि, पृथ्वी, वायु एवं जल
            </h3>
            <p className="text-[16px] text-stone-900">
              प्रत्येक राशि का मूल स्वभाव उसके अधिष्ठाता तत्व से निर्धारित होता है।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
            {Object.entries(elements).map(([element, data]) => (
              <div
                key={element}
                className="bg-white rounded-2xl p-4 border border-amber-200 text-center space-y-2 shadow-2xs hover:border-amber-400 transition"
              >
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center mx-auto text-lg">
                  {element === 'Fire' ? '🔥' : element === 'Earth' ? '🌍' : element === 'Air' ? '💨' : '🌊'}
                </div>
                <h4 className="font-bold text-stone-900 text-sm">
                  {element === 'Fire' ? 'अग्नि तत्व (Fire)' : element === 'Earth' ? 'पृथ्वी तत्व (Earth)' : element === 'Air' ? 'वायु तत्व (Air)' : 'जल तत्व (Water)'}
                </h4>
                <p className="text-[16px] text-amber-900 font-semibold">{data.signs.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 6. All 12 Zodiac Signs Grid Cards */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">समस्त 12 राशियां</span>
              <h3 className="text-lg sm:text-xl font-bold font-cinzel text-stone-900">
                वैदिक राशियां एवं चारित्रिक लक्षण (12 Celestial Signs)
              </h3>
            </div>
            <p className="text-[14px] text-stone-900">किसी भी राशि पर क्लिक कर विस्तृत खगोलीय रूपरेखा देखें</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {zodiacSigns.map((sign) => (
              <button
                key={sign.id}
                type="button"
                onClick={() => setSelectedSign(sign)}
                className="group p-5 rounded-2xl border border-amber-900 bg-yellow-200 hover:bg-amber-50/60 hover:border-amber-400 text-left transition-all duration-300 shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform">{sign.symbol}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-950 border border-amber-300">
                      {sign.element}
                    </span>
                  </div>

                  <h4 className="font-cinzel font-bold text-base text-stone-900 group-hover:text-amber-900 transition-colors">
                    {sign.name} • {sign.sanskrit.split(' ')[0]}
                  </h4>
                  <p className="text-[14px] text-stone-900 font-medium mt-0.5">{sign.dates}</p>

                  <p className="text-[16px] text-stone-900 line-clamp-2 mt-2 leading-relaxed">
                    {sign.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between text-[14px] font-bold text-amber-900">
                  <span>स्वामी: {sign.rulingPlanet}</span>
                  <span className="flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    <span>विवरण</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 7. Sign Detail Modal */}
        {selectedSign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative bg-[#fffdfa] border-2 border-amber-400 rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-red-950 via-stone-900 to-amber-950 border-b border-amber-500/30 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedSign.symbol}</span>
                  <div>
                    <h3 className="text-lg font-bold font-cinzel text-amber-100">
                      {selectedSign.name} | {selectedSign.sanskrit}
                    </h3>
                    <p className="text-xs text-amber-200/80">
                      तत्व: {selectedSign.element} • स्वामी: {selectedSign.rulingPlanet}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedSign(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-5 text-xs text-stone-700">
                <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-1">
                  <span className="text-[11px] uppercase font-bold text-amber-900">राशि स्वभाव एवं परिचय</span>
                  <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
                    &ldquo;{selectedSign.description}&rdquo;
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-white rounded-xl border border-amber-200">
                    <span className="font-bold text-stone-500 block text-[10px] uppercase">अनुकूल राशियां (Compatibility)</span>
                    <span className="font-bold text-stone-900 mt-1 block">
                      {selectedSign.compatibility?.join(', ') || 'Various'}
                    </span>
                  </div>
                  <div className="p-3.5 bg-white rounded-xl border border-amber-200">
                    <span className="font-bold text-stone-500 block text-[10px] uppercase">अवधि (Solar Transit Dates)</span>
                    <span className="font-bold text-stone-900 mt-1 block">{selectedSign.dates}</span>
                  </div>
                </div>

                {/* Traits */}
                <div>
                  <span className="font-bold text-stone-800 block mb-2">मुख्य गुण व विशेषताएं (Key Traits):</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedSign.traits.map((t, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-950 border border-amber-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Domains */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-white rounded-xl border border-amber-200 space-y-1">
                    <span className="font-bold text-blue-900 flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                      <span>करियर (Career)</span>
                    </span>
                    <p className="text-stone-600 leading-relaxed">{selectedSign.career}</p>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-amber-200 space-y-1">
                    <span className="font-bold text-rose-900 flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-600" />
                      <span>प्रेम व संबंध (Love)</span>
                    </span>
                    <p className="text-stone-600 leading-relaxed">{selectedSign.love}</p>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-amber-200 space-y-1">
                    <span className="font-bold text-emerald-900 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-emerald-600" />
                      <span>स्वास्थ्य (Health)</span>
                    </span>
                    <p className="text-stone-600 leading-relaxed">{selectedSign.health}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-amber-50/80 border-t border-amber-200 flex items-center justify-between shrink-0">
                <Link
                  to="/astrologers"
                  onClick={() => setSelectedSign(null)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-xs uppercase tracking-wider shadow hover:scale-105 transition"
                >
                  इस राशि हेतु विशेषज्ञ से बात करें
                </Link>

                <button
                  type="button"
                  onClick={() => setSelectedSign(null)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-800 font-bold text-xs border border-amber-300 transition cursor-pointer"
                >
                  बंद करें (Close)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 8. Personalized Consultation Footer CTA Card */}
        <div className="rounded-3xl bg-gradient-to-r from-red-950 via-stone-900 to-amber-950 text-white p-6 sm:p-8 lg:p-10 shadow-xl border border-amber-500/30 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center lg:text-left max-w-2xl">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-widest flex items-center justify-center lg:justify-start gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              व्यक्तिगत खगोलीय मार्गदर्शन
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-cinzel text-amber-100">
              अपनी जन्म कुंडली व राशि अनुसार संपूर्ण जीवन फलादेश प्राप्त करें
            </h3>

            {/* Vedic Slogan Flex Box */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-amber-500/15 border border-amber-400/30 backdrop-blur-xs text-amber-200">
              <span className="text-base sm:text-lg">🕉️</span>
              <p className="text-xs sm:text-sm font-semibold tracking-wide text-amber-100 italic leading-snug">
                &ldquo;जिंदगी में परेशानी तभी खत्म होती है जब हम अपने कर्म को पहचानें, ग्रहों के संकेतों को समझें और सही दिशा में कदम उठाएँ।&rdquo;
              </p>
            </div>

            <p className="text-xs sm:text-sm text-amber-200/80 leading-relaxed font-normal">
              हमारे वरिष्ठ वैदिक ज्योतिषी आपकी जन्म कुंडली, महादशा और गोचर का सूक्ष्म विश्लेषण कर करियर, विवाह और धन से जुड़ी सटीक दिशा प्रदान करते हैं।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              to="/astrologers"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-amber-500/20 hover:scale-105 transition"
            >
              <PhoneCall className="w-4 h-4 text-orange-600" />
              <span>ज्योतिषी से बात करें</span>
            </Link>

            <Link
              to="/booking"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition"
            >
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>परामर्श बुक करें</span>
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
};

export default ZodiacSigns;
