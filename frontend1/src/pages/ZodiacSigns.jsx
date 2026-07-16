import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { Star, Calendar, Heart, Briefcase, Zap, User, Moon, Sun, MapPin, Loader } from 'lucide-react';
import { calculateBothSigns, getZodiacSignByName } from '../utils/zodiacCalculator';
import { API_BASE_URL } from '../services/api';

const ZodiacSigns = () => {
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
      if (data.success) {
        const forecast = { ...data.horoscope, name: signName, perspective: forecastPerspective };
        setForecastCache(prev => ({ ...prev, [cacheKey]: forecast }));
        setActiveForecastSign(forecast);
      }
    } catch (error) {
      console.error('Error fetching forecast:', error);
    } finally {
      setIsFetchingForecast(false);
    }
  };

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
      console.error('Error calculating signs:', error);
      alert(`Failed to calculate zodiac signs: ${error.message}`);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#05050a] text-gray-100">
      <style>{`
        @keyframes rotate-wheel {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(150px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(150px) rotate(-360deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.1); }
          50% { box-shadow: 0 0 40px rgba(147, 197, 253, 0.2); }
        }
        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .animate-rotate-slow {
          animation: rotate-wheel 120s linear infinite;
        }
        .star-field {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .star {
          position: absolute;
          background: white;
          border-radius: 50%;
          animation: twinkle var(--duration) ease-in-out infinite;
          opacity: 0.3;
        }
        .zodiac-wheel-circle {
          stroke-dasharray: 2 40;
          stroke-linecap: round;
        }
        .glass-premium {
          background: rgba(22, 22, 35, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .glass-premium:hover {
          background: rgba(28, 28, 45, 0.85);
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 30px 60px -12px rgba(147, 197, 253, 0.2);
          border-color: rgba(212, 175, 55, 0.4);
        }
        .text-glow {
          text-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
        }
        .gold-gradient {
          background: linear-gradient(to right, #D4AF37, #F59E0B, #D4AF37);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      <Navigation />

      {/* Star Field Background */}
      <div className="star-field">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 3}px`,
              height: `${Math.random() * 3}px`,
              '--duration': `${2 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Hero Section Redesigned */}
      <section className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16">
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-[0.3em] text-cyan-400 animate-in slide-in-from-left duration-700">
              <Star className="h-4 w-4 animate-pulse" />
              ब्रह्‍मांड दर्शन • Cosmic Exploration
            </div>

            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-cinzel font-bold text-white tracking-tighter animate-in fade-in slide-in-from-bottom duration-1000">
                Zodiac <span className="relative gold-gradient">
                  Signs
                  <span className="absolute -bottom-2 left-0 w-full h-1 bg-gold/20 rounded-full"></span>
                </span>
              </h1>
              <p className="text-xl text-gray-400 leading-relaxed max-w-xl mx-auto lg:mx-0 animate-in fade-in slide-in-from-bottom delay-300 duration-1000">
                Journey through the 12 celestial houses. Decode the ancient alignment of stars and their profound influence on your terrestrial existence.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
              <button
                onClick={() => setShowCalculator(true)}
                className="px-8 py-4 bg-white text-black rounded-2xl font-bold tracking-widest uppercase hover:bg-gold-500 hover:text-white transition-all duration-500 shadow-xl hover:shadow-gold-500/50 transform hover:-translate-y-1"
              >
                Find My Sign
              </button>
              <div className="flex -space-x-3">
                {zodiacSigns.slice(0, 5).map((s, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-[#1a1a2e] border-2 border-white/10 flex items-center justify-center text-xl shadow-sm">
                    {s.symbol}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full bg-white text-black border-2 border-[#05050a] flex items-center justify-center text-xs font-bold">
                  +7
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex-1 flex items-center justify-center animate-in zoom-in duration-1000">
            {/* Rotating Zodiac Wheel Animation */}
            <div className="relative w-80 h-80 md:w-[500px] md:h-[500px]">
              <div className="absolute inset-0 border-[1px] border-dashed border-white/10 rounded-full animate-rotate-slow"></div>
              <div className="absolute inset-4 border-[2px] border-white/5 rounded-full"></div>

              <svg className="absolute inset-0 w-full h-full animate-rotate-slow opacity-20" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="95" fill="none" stroke="white" strokeWidth="0.5" className="zodiac-wheel-circle" />
                {[...Array(12)].map((_, i) => (
                  <line
                    key={i}
                    x1="100" y1="10"
                    x2="100" y2="20"
                    transform={`rotate(${i * 30}, 100, 100)`}
                    stroke="white"
                    strokeWidth="1"
                  />
                ))}
              </svg>

              {/* Floating Zodiac Symbols in Orbit */}
              {zodiacSigns.map((sign, i) => (
                <div
                  key={sign.id}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-40%) rotate(${-i * 30}deg)`,
                  }}
                >
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl glass-premium flex items-center justify-center text-3xl shadow-lg border border-white/10 transform transition-transform hover:scale-125 hover:rotate-12 cursor-pointer group"
                    onClick={() => setSelectedSign(sign)}>
                    <span className="group-hover:text-yellow-400 transition-colors">{sign.symbol}</span>
                  </div>
                </div>
              ))}

              {/* Center Element */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-[#1a1a2e] flex flex-col items-center justify-center text-white shadow-2xl animate-pulse-glow border border-white/10">
                  <Sun className="h-10 w-10 md:h-16 md:w-16 mb-2 text-yellow-400" />
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] text-yellow-500/70">ॐ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sun and Moon Sign Calculator */}
      <div className="relative rounded-2xl p-6 mb-12 border border-white/10 shadow-[0_35px_100px_rgba(0,0,0,0.4)] bg-[#10101a]/80 backdrop-blur-lg overflow-hidden">
        {/* Overlay Effect - Only visible on the card */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none opacity-30"></div>
        <div className="relative z-10">
          <div className="flex flex-wrap justify-between items-center mb-4">
            <h2 className="flex items-center justify-center text-2xl font-cinzel font-bold text-white">
              Discover Your <span className="text-yellow-400 border-b-2 border-yellow-400/20 pb-0.5 ml-2">Cosmic Identity</span>
            </h2>
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className="flex items-center justify-center text-gray-400 font-bold hover:text-white transition-colors"
            >
              {showCalculator ? 'Hide Calculator' : 'Show Calculator'}
            </button>
          </div>

          {showCalculator && (
            <div className="flex flex-col space-y-4">
              <div className="p-3 bg-white/85 backdrop-blur-lg rounded-lg border border-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.15)] mb-4 relative overflow-hidden">
                {/* Overlay Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/50 to-transparent pointer-events-none"></div>
                <p className="relative z-10 flex items-center justify-center text-black text-sm">
                  <span className="flex items-center justify-center text-center">
                    <strong>Note:</strong> This calculator provides approximate results for demonstration purposes.
                    For accurate Hindu astrology Moon sign calculation, please use our{' '}
                    <a href="/kundali" className="underline hover:text-black font-bold text-black">
                      Professional Kundali Service
                    </a>.
                  </span>
                </p>
              </div>

              <p className="flex items-center justify-center text-black mb-4">
                Enter your details to discover your Sun and Moon signs
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="flex items-center block text-sm font-medium text-gray-300 mb-2">
                    <User className="inline h-4 w-4 mr-2 text-yellow-400" />
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="flex items-center block text-sm font-medium text-gray-300 mb-2">
                    <Calendar className="inline h-4 w-4 mr-2 text-yellow-400" />
                    Birth Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="flex items-center block text-sm font-medium text-gray-300 mb-2">
                    <Moon className="inline h-4 w-4 mr-2 text-yellow-400" />
                    Birth Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="flex items-center block text-sm font-medium text-gray-300 mb-2">
                    <MapPin className="inline h-4 w-4 mr-2 text-yellow-400" />
                    City <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={handleCityChange}
                    placeholder="Enter your city"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="flex items-center block text-sm font-medium text-gray-300 mb-2">
                    <MapPin className="inline h-4 w-4 mr-2 text-yellow-400" />
                    State/Province (Optional)
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={handleStateChange}
                    placeholder="Enter your state or province"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="flex items-center block text-sm font-medium text-gray-300 mb-2">
                    <MapPin className="inline h-4 w-4 mr-2 text-yellow-400" />
                    Country (Optional)
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={handleCountryChange}
                    placeholder="Enter your country"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="flex items-center block text-sm font-medium text-gray-300 mb-2">
                    Latitude
                  </label>
                  <input
                    type="text"
                    value={latitude}
                    onChange={handleLatitudeChange}
                    placeholder="Enter latitude"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="flex items-center block text-sm font-medium text-gray-300 mb-2">
                    Longitude
                  </label>
                  <input
                    type="text"
                    value={longitude}
                    onChange={handleLongitudeChange}
                    placeholder="Enter longitude"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Calculation Method Toggle */}
              <div className="flex items-center justify-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10 mb-4">
                <span className={`text-sm font-medium ${!useVedAstro ? 'text-white' : 'text-gray-500'}`}>
                  Demo Mode
                </span>
                <button
                  onClick={() => setUseVedAstro(!useVedAstro)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${useVedAstro ? 'bg-yellow-500' : 'bg-gray-700'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useVedAstro ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
                <span className={`text-sm font-medium ${useVedAstro ? 'text-white' : 'text-gray-500'}`}>
                  VedAstro (Accurate)
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                  onClick={fetchLocationData}
                  disabled={!city || isFetchingLocation}
                  className={`flex-1 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center ${city && !isFetchingLocation
                    ? 'bg-yellow-500 text-black hover:bg-yellow-400 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] transform hover:scale-105'
                    : 'bg-gray-800 text-gray-600 cursor-not-allowed border border-white/5'
                    }`}
                >
                  {isFetchingLocation ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin mr-2" />
                      Fetching Location...
                    </>
                  ) : (
                    <>
                      <MapPin className="h-5 w-5 mr-2" />
                      Get Coordinates
                    </>
                  )}
                </button>

                <button
                  onClick={handleCalculateSigns}
                  disabled={!birthDate || !name || isCalculating}
                  className={`flex-1 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center ${birthDate && name && !isCalculating
                    ? 'bg-yellow-500 text-black hover:bg-yellow-400 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] transform hover:scale-105'
                    : 'bg-gray-800 text-gray-600 cursor-not-allowed border border-white/5'
                    }`}
                >
                  {isCalculating ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin mr-2" />
                      Calculating...
                    </>
                  ) : (
                    `Calculate My Signs ${useVedAstro ? '(VedAstro)' : '(Demo)'}`
                  )}
                </button>
              </div>

              {locationError && (
                <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg relative overflow-hidden">
                  {/* Overlay Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-transparent to-red-50/50 opacity-50 pointer-events-none"></div>
                  <p className="relative z-10 flex items-center justify-center text-red-800 text-sm">{locationError}</p>
                </div>
              )}

              {calculatedSigns && (
                <div className="mt-6 p-4 bg-[#1a1a2e]/60 backdrop-blur-lg rounded-xl border border-white/10 shadow-[0_35px_100px_rgba(0,0,0,0.4)] relative overflow-hidden">
                  {/* Overlay Effect - Only on card */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent pointer-events-none"></div>
                  <div className="relative z-10">
                    <h3 className="flex items-center justify-center text-lg font-semibold text-white mb-3">Your Cosmic Identity</h3>

                    <div className="mb-4 p-3 bg-white/5 backdrop-blur-lg rounded-lg border border-white/5 relative overflow-hidden">
                      <div className="relative z-10 flex flex-col space-y-1">
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-yellow-400 mr-2" />
                          <span className="font-semibold text-gray-300">Name:</span>
                          <span className="ml-2 text-white">{calculatedSigns.name}</span>
                        </div>
                        {(calculatedSigns.city || calculatedSigns.state || calculatedSigns.country) && (
                          <div className="flex items-center">
                            <MapPin className="h-5 w-5 text-yellow-400 mr-2" />
                            <span className="font-semibold text-gray-300">Location:</span>
                            <span className="ml-2 text-white">
                              {calculatedSigns.city}
                              {calculatedSigns.city && calculatedSigns.state ? ', ' : ''}
                              {calculatedSigns.state}
                              {(calculatedSigns.city || calculatedSigns.state) && calculatedSigns.country ? ', ' : ''}
                              {calculatedSigns.country}
                            </span>
                          </div>
                        )}
                        {(calculatedSigns.latitude && calculatedSigns.longitude) && (
                          <div className="flex items-center">
                            <MapPin className="h-5 w-5 text-yellow-400 mr-2" />
                            <span className="font-semibold text-gray-300">Coordinates:</span>
                            <span className="ml-2 text-white">
                              {calculatedSigns.latitude}, {calculatedSigns.longitude}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative rounded-lg p-4 border border-white/10 bg-white/5 backdrop-blur-lg shadow-lg overflow-hidden">
                        <div className="relative z-10 flex flex-col">
                          <div className="flex items-center mb-2">
                            <Sun className="h-5 w-5 text-yellow-400 mr-2" />
                            <h4 className="flex items-center font-semibold text-white">
                              {calculatedSigns.sun.name} | {calculatedSigns.sun.sanskrit}
                            </h4>
                          </div>
                          {calculatedSigns.sun ? (
                            <div className="flex flex-col">
                              <div className="flex items-center justify-center text-3xl mb-1">{calculatedSigns.sun.symbol}</div>
                              <button
                                onClick={() => setSelectedSign(calculatedSigns.sun)}
                                className="flex items-center justify-center mt-2 text-xs text-yellow-500 hover:text-white transition-colors font-bold"
                              >
                                View Details
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center text-gray-500">Unable to determine</div>
                          )}
                        </div>
                      </div>

                      <div className="relative rounded-lg p-4 border border-white/10 bg-white/5 backdrop-blur-lg shadow-lg overflow-hidden">
                        <div className="relative z-10 flex flex-col">
                          <div className="flex items-center mb-2">
                            <Moon className="h-5 w-5 text-cyan-400 mr-2" />
                            <h4 className="flex items-center font-semibold text-white">
                              {calculatedSigns.moon.name} | {calculatedSigns.moon.sanskrit}
                            </h4>
                          </div>
                          {calculatedSigns.moon ? (
                            <div className="flex flex-col">
                              <div className="flex items-center justify-center text-3xl mb-1">{calculatedSigns.moon.symbol}</div>
                              {calculatedSigns.nakshatra && (
                                <div className="flex items-center justify-center text-xs text-gray-400 mt-1">
                                  Nakshatra: {calculatedSigns.nakshatra} {calculatedSigns.nakshatraPad && `(Pad ${calculatedSigns.nakshatraPad})`}
                                </div>
                              )}
                              <button
                                onClick={() => setSelectedSign(calculatedSigns.moon)}
                                className="flex items-center justify-center mt-2 text-xs text-cyan-500 hover:text-white transition-colors font-bold"
                              >
                                View Details
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center text-gray-500">Unable to determine</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col items-center justify-center text-center">
                      {/* Calculation Method Badge */}
                      {calculatedSigns.calculationMethod && (
                        <div className={`mb-3 px-4 py-2 rounded-full text-xs font-medium ${calculatedSigns.isAccurate
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                          }`}>
                          {calculatedSigns.calculationMethod}
                        </div>
                      )}

                      <div className="mt-4 flex flex-col items-center justify-center text-center">
                        <p className="flex items-center justify-center text-sm text-gray-400">
                          <span className="flex items-center justify-center text-center">Your Sun sign represents your core personality, while your Moon sign reflects your emotional nature and inner self.</span>
                        </p>

                        {!calculatedSigns.isAccurate && (
                          <div className="p-3 bg-white/5 backdrop-blur-lg rounded-lg mt-3 border border-white/10 relative overflow-hidden">
                            <p className="relative z-10 flex items-center justify-center text-xs text-gray-500">
                              <span className="flex items-center justify-center text-center">
                                <strong className="text-yellow-500">Important:</strong> The Moon sign calculation above is for demonstration purposes only.
                                Accurate Moon sign requires precise birth time and location.
                                For a professional Kundali, please use our <a href="/kundali" className="underline hover:text-white text-yellow-500 ml-1">Kundali Generation Service</a>.
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Daily Horoscopes Section */}
                    {(sunHoroscope || moonHoroscope || isFetchingHoroscopes) && (
                      <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex flex-col items-center">
                          <h3 className="text-3xl font-cinzel font-bold text-center text-white mb-2">Daily Horoscopes</h3>
                          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
                          <p className="text-xs text-gray-500 uppercase tracking-[0.3em] mt-3">Celestial Guidance for Today</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Sun Sign Horoscope */}
                          <div className="bg-[#10101a]/95 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative group transition-all duration-500 hover:shadow-[0_30px_70px_rgba(0,0,0,0.6)] hover:-translate-y-1">
                            <div className="absolute -top-10 -right-10 p-4 opacity-[0.03] rotate-12 transition-transform duration-700 group-hover:rotate-0 group-hover:scale-110">
                              <Sun className="h-48 w-48 text-white" />
                            </div>
                            <div className="relative z-10">
                              <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-4xl shadow-inner border border-white/5">
                                  {calculatedSigns.sun?.symbol}
                                </div>
                                <div>
                                  <h4 className="font-cinzel text-2xl font-bold text-white tracking-tight">Sun Sign: {calculatedSigns.sun?.name}</h4>
                                  <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-medium">Your Outer Self & Soul</p>
                                </div>
                              </div>

                              {isFetchingHoroscopes ? (
                                <div className="flex flex-col items-center justify-center py-16">
                                  <div className="relative">
                                    <Loader className="h-12 w-12 animate-spin text-yellow-500" />
                                  </div>
                                  <p className="text-sm text-gray-400 mt-6 font-medium animate-pulse">Scanning the solar flares...</p>
                                </div>
                              ) : sunHoroscope ? (
                                <div className="space-y-6">
                                  <div className="p-5 bg-white/5 rounded-2xl border border-white/10 leading-relaxed text-gray-300 text-sm">
                                    <p>{sunHoroscope.overview}</p>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl transition-all hover:bg-white/[0.08] hover:border-white/20">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Heart className="h-3 w-3 text-red-400" />
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">LOVE</span>
                                      </div>
                                      <p className="text-[11px] leading-relaxed text-gray-400">{sunHoroscope.love}</p>
                                    </div>
                                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl transition-all hover:bg-white/[0.08] hover:border-white/20">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Briefcase className="h-3 w-3 text-cyan-400" />
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">CAREER</span>
                                      </div>
                                      <p className="text-[11px] leading-relaxed text-gray-400">{sunHoroscope.career}</p>
                                    </div>
                                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl transition-all hover:bg-white/[0.08] hover:border-white/20">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Zap className="h-3 w-3 text-yellow-400" />
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">HEALTH</span>
                                      </div>
                                      <p className="text-[11px] leading-relaxed text-gray-400">{sunHoroscope.health}</p>
                                    </div>
                                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl transition-all hover:bg-white/[0.08] hover:border-white/20">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Star className="h-3 w-3 text-amber-400" />
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">FINANCE</span>
                                      </div>
                                      <p className="text-[11px] leading-relaxed text-gray-400">{sunHoroscope.finance}</p>
                                    </div>
                                  </div>

                                  <div className="flex justify-between items-center py-4 px-6 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="flex flex-col items-center">
                                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Lucky No.</span>
                                      <span className="text-xl font-bold text-yellow-500 leading-none">{sunHoroscope.luckyNumber}</span>
                                    </div>
                                    <div className="h-8 w-[1px] bg-white/10"></div>
                                    <div className="flex flex-col items-center">
                                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Lucky Color</span>
                                      <span className="text-sm font-bold text-white leading-none">{sunHoroscope.luckyColor}</span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-20 bg-black/20 rounded-3xl">
                                  <p className="text-sm text-gray-600 italic">Horoscope drifted into another galaxy...</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Moon Sign Horoscope */}
                          <div className="bg-[#10101a]/95 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative group transition-all duration-500 hover:shadow-[0_30px_70px_rgba(0,0,0,0.6)] hover:-translate-y-1">
                            <div className="absolute -top-10 -right-10 p-4 opacity-[0.03] -rotate-12 transition-transform duration-700 group-hover:rotate-0 group-hover:scale-110">
                              <Moon className="h-48 w-48 text-white" />
                            </div>
                            <div className="relative z-10">
                              <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-4xl shadow-inner border border-white/5">
                                  {calculatedSigns.moon?.symbol}
                                </div>
                                <div>
                                  <h4 className="font-cinzel text-2xl font-bold text-white tracking-tight">Moon Sign: {calculatedSigns.moon?.name}</h4>
                                  <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-medium">Your Inner Self & Emotions</p>
                                </div>
                              </div>

                              {isFetchingHoroscopes ? (
                                <div className="flex flex-col items-center justify-center py-16">
                                  <div className="relative">
                                    <Loader className="h-12 w-12 animate-spin text-cyan-400" />
                                  </div>
                                  <p className="text-sm text-gray-400 mt-6 font-medium animate-pulse">Decoding the lunar whispers...</p>
                                </div>
                              ) : moonHoroscope ? (
                                <div className="space-y-6">
                                  <div className="p-5 bg-white/5 rounded-2xl border border-white/10 leading-relaxed text-gray-300 text-sm">
                                    <p>{moonHoroscope.overview}</p>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl transition-all hover:bg-white/[0.08] hover:border-white/20">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Heart className="h-3 w-3 text-red-400" />
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">LOVE</span>
                                      </div>
                                      <p className="text-[11px] leading-relaxed text-gray-400">{moonHoroscope.love}</p>
                                    </div>
                                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl transition-all hover:bg-white/[0.08] hover:border-white/20">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Briefcase className="h-3 w-3 text-cyan-400" />
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">CAREER</span>
                                      </div>
                                      <p className="text-[11px] leading-relaxed text-gray-400">{moonHoroscope.career}</p>
                                    </div>
                                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl transition-all hover:bg-white/[0.08] hover:border-white/20">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Zap className="h-3 w-3 text-yellow-400" />
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">HEALTH</span>
                                      </div>
                                      <p className="text-[11px] leading-relaxed text-gray-400">{moonHoroscope.health}</p>
                                    </div>
                                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl transition-all hover:bg-white/[0.08] hover:border-white/20">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Star className="h-3 w-3 text-amber-400" />
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">FINANCE</span>
                                      </div>
                                      <p className="text-[11px] leading-relaxed text-gray-400">{moonHoroscope.finance}</p>
                                    </div>
                                  </div>

                                  <div className="flex justify-between items-center py-4 px-6 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="flex flex-col items-center">
                                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Lucky No.</span>
                                      <span className="text-xl font-bold text-cyan-400 leading-none">{moonHoroscope.luckyNumber}</span>
                                    </div>
                                    <div className="h-8 w-[1px] bg-white/10"></div>
                                    <div className="flex flex-col items-center">
                                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Lucky Color</span>
                                      <span className="text-sm font-bold text-white leading-none">{moonHoroscope.luckyColor}</span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-20 bg-black/20 rounded-3xl">
                                  <p className="text-sm text-gray-600 italic">Emotions temporarily obscured by clouds...</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Inspirational Quote Banner */}
      <section className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-xl p-8 bg-[#1a1a2e]/60 backdrop-blur-lg border border-white/10 shadow-[0_35px_100px_rgba(0,0,0,0.4)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-transparent pointer-events-none"></div>
            <p className="relative z-10 text-center text-lg md:text-xl font-hindi font-medium text-white leading-relaxed italic">
              "जिंदगी में परेशानी तभी खत्म होती है जब हम अपने कर्म को पहचानें, ग्रहों के संकेतों को समझें और सही दिशा में कदम उठाएँ।"
            </p>
          </div>
        </div>
      </section>

      {/* Daily Horoscope Forecasts Dashboard */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 bg-transparent overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-cinzel font-bold text-white mb-4">Daily Horoscope Forecasts</h2>
            <div className="w-32 h-1 bg-yellow-500 mx-auto mb-6"></div>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Select a sign to reveal the celestial messages and energetic shifts for today.
              Whether it's your Sun, Moon, or Rising sign, the stars have a path for you.
            </p>
          </div>

          {/* Perspective Selector */}
          <div className="flex justify-center mb-10">
            <div className="bg-white/5 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 flex gap-2">
              <button
                onClick={() => setForecastPerspective('Sun')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${forecastPerspective === 'Sun'
                  ? 'bg-yellow-500 text-black font-bold shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Sun className={`h-4 w-4 ${forecastPerspective === 'Sun' ? 'fill-black' : ''}`} />
                Sun Sign Perspective
              </button>
              <button
                onClick={() => setForecastPerspective('Moon')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${forecastPerspective === 'Moon'
                  ? 'bg-yellow-500 text-black font-bold shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Moon className={`h-4 w-4 ${forecastPerspective === 'Moon' ? 'fill-black' : ''}`} />
                Moon Sign Perspective
              </button>
            </div>
          </div>

          {/* Sign Grid Icons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {zodiacSigns.map((sign) => (
              <button
                key={sign.id}
                onClick={() => fetchSignForecast(sign.name)}
                className={`group flex flex-col items-center p-4 rounded-2xl transition-all duration-300 w-24 h-24 border ${activeForecastSign?.name === sign.name
                  ? 'bg-yellow-500 border-yellow-500 text-black shadow-xl scale-110 z-20'
                  : 'glass-premium text-gray-400 opacity-60 hover:opacity-100'
                  }`}
              >
                <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">{sign.symbol}</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${activeForecastSign?.name === sign.name ? 'text-black' : 'text-gray-300'}`}>{sign.name}</span>
                <span className={`text-[10px] font-hindi ${activeForecastSign?.name === sign.name ? 'text-black' : 'text-gray-400'}`}>{sign.sanskrit.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Forecast Card Display */}
          <div className="min-h-[400px] flex items-center justify-center">
            {isFetchingForecast ? (
              <div className="flex flex-col items-center">
                <Loader className="h-12 w-12 animate-spin text-black mb-4" />
                <p className="text-black font-medium animate-pulse">Reading the cosmic alignment...</p>
              </div>
            ) : activeForecastSign ? (
              <div className="w-full bg-[#10101a]/90 backdrop-blur-xl rounded-[3rem] p-10 border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden animate-in fade-in zoom-in duration-500">
                {/* Overlay Effect - Only on card */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-cyan-500/5 pointer-events-none"></div>
                {/* Decorative background symbol */}
                <div className="absolute -bottom-20 -right-20 opacity-[0.03] pointer-events-none">
                  <span className="text-[20rem] leading-none text-white">
                    {zodiacSigns.find(s => s.name === activeForecastSign.name)?.symbol}
                  </span>
                </div>

                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row items-center gap-8 mb-10 pb-8 border-b border-white/5">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-6xl text-black shadow-md">
                      {zodiacSigns.find(s => s.name === activeForecastSign.name)?.symbol}
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="text-4xl font-cinzel font-bold text-white tracking-tight">
                        {activeForecastSign.name} | {zodiacSigns.find(s => s.name === activeForecastSign.name)?.sanskrit.split(' ')[0]}
                        <span className="text-gray-400 ml-2 opacity-60">Forecast</span>
                        <span className={`ml-4 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest bg-yellow-500/20 text-yellow-500`}>
                          {activeForecastSign.perspective} Sign
                        </span>
                      </h3>
                      <p className="text-gray-500 font-medium tracking-[0.2em] uppercase mt-2">
                        Today's Vibrational Frequency
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Overview and Luck */}
                    <div className="md:col-span-2 space-y-8">
                      <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                        <h4 className="text-sm font-bold text-yellow-500 uppercase tracking-[0.2em] mb-4 flex items-center">
                          <Zap className="h-4 w-4 mr-2" />
                          Today's Energy
                        </h4>
                        <p className="text-lg leading-relaxed text-gray-200 font-medium italic">
                          "{activeForecastSign.overview}"
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="group p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-yellow-500/30 hover:bg-white/[0.07] transition-all">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-500/10 rounded-lg"><Heart className="h-5 w-5 text-red-400" /></div>
                            <span className="font-bold text-gray-400 uppercase tracking-widest text-xs">Aura of Love</span>
                          </div>
                          <p className="text-sm text-gray-300 leading-relaxed">{activeForecastSign.love}</p>
                        </div>
                        <div className="group p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-cyan-500/30 hover:bg-white/[0.07] transition-all">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg"><Briefcase className="h-5 w-5 text-blue-400" /></div>
                            <span className="font-bold text-gray-400 uppercase tracking-widest text-xs">Path of Purpose</span>
                          </div>
                          <p className="text-sm text-gray-300 leading-relaxed">{activeForecastSign.career}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Key Details */}
                    <div className="space-y-6">
                      <div className="p-6 bg-white/5 rounded-3xl space-y-6 border border-white/10">
                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10 shadow-sm">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Lucky Number</span>
                          <span className="text-2xl font-bold text-yellow-500">{activeForecastSign.luckyNumber}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10 shadow-sm">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Lucky Color</span>
                          <span className="text-sm font-bold text-gray-200">{activeForecastSign.luckyColor}</span>
                        </div>
                      </div>

                      <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                        <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                          <Star className="h-3 w-3 mr-2" />
                          Body & Spirit
                        </h5>
                        <p className="text-xs text-gray-400 leading-relaxed mb-4">{activeForecastSign.health}</p>

                        <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                          <div className="h-1 w-1 bg-yellow-500 rounded-full mr-2"></div>
                          Prosperity
                        </h5>
                        <p className="text-xs text-gray-400 leading-relaxed">{activeForecastSign.finance}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center group cursor-pointer" onClick={() => fetchSignForecast('Aries')}>
                <div className="w-32 h-32 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 group-hover:border-yellow-500 transition-all duration-500">
                  <Star className="h-12 w-12 text-gray-500 group-hover:text-yellow-500 group-hover:rotate-45 transition-all duration-500" />
                </div>
                <h3 className="text-2xl font-cinzel font-bold text-gray-500 group-hover:text-yellow-400 transition-colors">Select a Moon or Sun Sign</h3>
                <p className="text-sm text-gray-600 mt-2 italic">Tap any sign above to unveil its daily stellar forecast</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Elements Overview */}
      <section className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        {/* Floating Nebula Decor */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse delay-700"></div>

        <div className="max-w-6xl mx-auto flex flex-col">
          <h2 className="flex flex-wrap items-center justify-center text-3xl font-cinzel font-bold text-center text-white mb-12">
            <span className="flex items-center justify-center">The Four</span>
            <span className="flex items-center justify-center text-yellow-500 ml-2 underline decoration-yellow-500/20 underline-offset-8">Elements</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {Object.entries(elements).map(([element, data], idx) => (
              <div key={element}
                className="relative rounded-xl p-6 text-center border border-white/10 bg-[#161623]/60 backdrop-blur-lg overflow-hidden shadow-lg animate-float-slow hover:animate-none group hover:border-yellow-500/30 transition-all"
                style={{ animationDelay: `${idx * 0.5}s` }}>
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <div className={`w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10 group-hover:bg-yellow-500/10 transition-colors`}>
                    <Zap className="h-8 w-8 text-yellow-500" />
                  </div>
                  <h3 className="flex items-center justify-center text-xl font-semibold text-white mb-2">{element}</h3>
                  <p className="flex items-center justify-center text-sm text-gray-400 mb-3">
                    {data.signs.join(', ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Zodiac Grid */}
      <section className="relative z-10 py-12 px-4 sm:px-6 lg:px-8" >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {zodiacSigns.map((sign) => (
              <button
                key={sign.id}
                onClick={() => setSelectedSign(sign)}
                className="glass-premium relative rounded-2xl p-8 text-center group"
              >
                {/* Overlay Effect - Only on card */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <div className="flex items-center justify-center text-6xl mb-4 transform group-hover:scale-125 transition-transform duration-500">{sign.symbol}</div>
                  <h3 className="flex items-center justify-center text-xl font-cinzel font-bold text-white mb-1 group-hover:text-yellow-400 transition-colors">
                    {sign.name} | {sign.sanskrit.split(' ')[0]}
                  </h3>
                  <p className="flex items-center justify-center text-sm text-gray-400 mb-2">{sign.dates}</p>
                  <div className={`flex items-center justify-center px-4 py-1 bg-white/10 text-gray-300 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm group-hover:bg-yellow-500 group-hover:text-black transition-colors`}>
                    {sign.element}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section >

      {/* Sign Detail Modal */}
      {
        selectedSign && (
          <div className="fixed inset-0 bg-[#05050a]/90 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300 backdrop-blur-md">
            <div className="relative rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] bg-[#10101a]/95 overflow-hidden">
              {/* Overlay Effect - Only in modal */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent pointer-events-none"></div>

              <div className="relative z-10 p-10">
                <div className="flex justify-between items-start mb-10">
                  <div className="flex flex-col items-center sm:items-start gap-2">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-5xl text-black shadow-lg">
                      {selectedSign.symbol}
                    </div>
                    <h2 className="text-4xl font-cinzel font-bold text-white mt-4">
                      {selectedSign.name} | {selectedSign.sanskrit.split(' ')[0]}
                    </h2>
                    <p className="text-gray-500 font-medium tracking-[0.2em] uppercase text-xs">
                      Celestial Profile & Wisdom
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedSign(null)}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-yellow-500 hover:text-black transition-all duration-300"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  <div className="bg-white/5 p-8 rounded-3xl space-y-4 border border-white/5">
                    <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-widest flex items-center">
                      <Star className="h-4 w-4 mr-2" />
                      Essence & Overview
                    </h3>
                    <p className="text-lg leading-relaxed text-gray-200 font-medium italic">
                      "{selectedSign.description}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl shadow-sm">
                      <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Elemental Power</span>
                      <span className="text-white font-bold text-lg">{selectedSign.element}</span>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl shadow-sm">
                      <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Ruling Celestial Body</span>
                      <span className="text-white font-bold text-lg">{selectedSign.rulingPlanet}</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Core Vibrations (Traits)</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedSign.traits.map((trait, index) => (
                          <span key={index} className="px-4 py-2 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-xs rounded-full font-bold tracking-wide">
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center">
                          <Heart className="h-4 w-4 mr-2" /> Love & Union
                        </h4>
                        <p className="text-sm text-gray-300 leading-relaxed font-medium">{selectedSign.love}</p>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center">
                          <Briefcase className="h-4 w-4 mr-2" /> Career & Purpose
                        </h4>
                        <p className="text-sm text-gray-300 leading-relaxed font-medium">{selectedSign.career}</p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-white/5">
                      <h4 className="text-xs font-bold text-green-400 uppercase tracking-widest">Vitality & Health</h4>
                      <p className="text-sm text-gray-300 leading-relaxed font-medium">{selectedSign.health}</p>
                    </div>
                  </div>

                  <div className="pt-8 text-center">
                    <button
                      onClick={() => setSelectedSign(null)}
                      className="w-full py-4 bg-yellow-500 text-black rounded-2xl font-bold tracking-[0.2em] uppercase hover:bg-yellow-400 transition-all duration-500 transform hover:-translate-y-1"
                    >
                      Close Celestial Map
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
          <div className="relative rounded-2xl p-12 border border-white/10 shadow-[0_35px_100px_rgba(0,0,0,0.4)] bg-[#10101a]/80 backdrop-blur-lg overflow-hidden">
            {/* Overlay Effect - Only in CTA card */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-cyan-500/5 pointer-events-none"></div>
            <div className="relative z-10 flex flex-col items-center justify-center">
              <h2 className="flex flex-wrap items-center justify-center text-3xl font-cinzel font-bold text-white mb-4">
                <span className="flex items-center justify-center">Discover Your</span>
                <span className="flex items-center justify-center text-yellow-500 ml-2 underline decoration-yellow-500/20 underline-offset-8">Cosmic Blueprint</span>
              </h2>
              <p className="flex items-center justify-center text-xl text-gray-400 mb-8">
                Get a personalized reading based on your unique zodiac profile and birth chart.
              </p>
              <a
                href="/book-appointment"
                className="inline-flex items-center px-8 py-4 bg-yellow-500 text-black font-semibold rounded-xl hover:bg-yellow-400 hover:shadow-[0_15px_40px_rgba(234,179,8,0.3)] transition-all duration-500 transform hover:scale-105"
              >
                <Star className="h-5 w-5 mr-2" />
                Get Personal Reading
              </a>
            </div>
          </div>
        </div>
      </section>
    </div >
  );
};

export default ZodiacSigns;