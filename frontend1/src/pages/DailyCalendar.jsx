import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import { kundaliAPI } from '../services/api';
import {
  Calendar,
  Sun,
  Moon,
  Star,
  Clock,
  Compass,
  Sparkles,
  CalendarDays,
  Sunrise,
  Sunset,
  MapPin,
  ArrowRight,
  Info,
  Bell,
  Zap,
  Timer,
  Target
} from 'lucide-react';

const DailyCalendar = () => {
  const { isAuthenticated } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState(null);
  const [userLocation, setUserLocation] = useState({ lat: 28.6139, lon: 77.2090 }); // Default to Delhi, India

  // Hindu months in Devanagari
  const hinduMonths = [
    'चैत्र', 'वैशाख', 'ज्येष्ठ', 'आषाढ़', 'श्रावण', 'भाद्रपद',
    'आश्विन', 'कार्तिक', 'मार्गशीर्ष', 'पौष', 'माघ', 'फाल्गुन'
  ];

  // Weekdays in Hindi
  const hindiWeekdays = [
    'रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'
  ];

  // Nakshatras
  const nakshatras = [
    'अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशिरा', 'आर्द्रा', 'पुनर्वसु',
    'पुष्य', 'आश्लेषा', 'मघा', 'पूर्वा फाल्गुनी', 'उत्तरा फाल्गुनी', 'हस्त',
    'चित्रा', 'स्वाती', 'विशाखा', 'अनुराधा', 'ज्येष्ठा', 'मूल', 'पूर्वाषाढ़ा',
    'उत्तराषाढ़ा', 'श्रवण', 'धनिष्ठा', 'शतभिषा', 'पूर्वभाद्रपद', 'उत्तरभाद्रपद', 'रेवती'
  ];

  // Tithis
  const tithis = [
    'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी', 'षष्ठी', 'सप्तमी',
    'अष्टमी', 'नवमी', 'दशमी', 'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'पूर्णिमा/अमावस्या'
  ];

  // Chaughadiya types with their characteristics
  const chaughadiyaTypes = {
    'Amrit': { type: 'Amrit', isAuspicious: true, color: 'from-green-500/20 to-emerald-500/20', textColor: 'text-green-400', borderColor: 'border-green-400/30' },
    'Shubh': { type: 'Shubh', isAuspicious: true, color: 'from-blue-500/20 to-cyan-500/20', textColor: 'text-blue-400', borderColor: 'border-blue-400/30' },
    'Labh': { type: 'Labh', isAuspicious: true, color: 'from-purple-500/20 to-violet-500/20', textColor: 'text-purple-400', borderColor: 'border-purple-400/30' },
    'Char': { type: 'Char', isAuspicious: true, color: 'from-yellow-500/20 to-amber-500/20', textColor: 'text-yellow-400', borderColor: 'border-yellow-400/30' },
    'Rog': { type: 'Rog', isAuspicious: false, color: 'from-red-500/20 to-orange-500/20', textColor: 'text-red-400', borderColor: 'border-red-400/30' },
    'Kaal': { type: 'Kaal', isAuspicious: false, color: 'from-orange-500/20 to-red-500/20', textColor: 'text-orange-400', borderColor: 'border-orange-400/30' },
    'Udveg': { type: 'Udveg', isAuspicious: false, color: 'from-red-600/20 to-red-800/20', textColor: 'text-red-600', borderColor: 'border-red-600/30' }
  };

  // Planet rulers for Chaughadiya (day and night)
  const dayPlanetRulers = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Rahu'];
  const nightPlanetRulers = ['Moon', 'Saturn', 'Jupiter', 'Mars', 'Rahu', 'Sun', 'Venus', 'Mercury'];

  // Mapping of planets to Chaughadiya types
  const planetToChaughadiya = {
    'Sun': 'Rog',
    'Venus': 'Shubh',
    'Mercury': 'Char',
    'Moon': 'Amrit',
    'Saturn': 'Udveg',
    'Jupiter': 'Labh',
    'Mars': 'Kaal',
    'Rahu': 'Rog'
  };

  // Get Shubh Chaughadiya Muhurt based on weekday
  const getShubhChaughadiyaMuhurt = (weekday, dayChaughadiya) => {
    // Define which Chaughadiya periods are considered most auspicious
    // Based on traditional Hindu astrology - Amrit, Shubh, Labh are most auspicious
    const mostAuspiciousTypes = ['Amrit', 'Shubh', 'Labh'];

    // Filter the day Chaughadiya periods to find the most auspicious ones
    const shubhMuhurts = dayChaughadiya.filter(period =>
      mostAuspiciousTypes.includes(period.type)
    );

    return shubhMuhurts;
  };

  // Transit Interpretations
  const transitInterpretations = {
    'Sun': {
      'Aries': 'Heightened energy and leadership potential. Focus on self-expression.',
      'Taurus': 'Financial stability and focus on material security becomes priority.',
      'Gemini': 'Excellent for communication, networking, and learning new skills.',
      'Cancer': 'Emphasis on home, family, and emotional well-being.',
      'Leo': 'Confidence peak. Great for creative projects and public recognition.',
      'Virgo': 'Focus on health, organization, and attention to detail.',
      'Libra': 'Harmonious period for relationships and artistic endeavors.',
      'Scorpio': 'Deep transformation and intense focus on hidden matters.',
      'Sagittarius': 'Expansion of horizons, travel, and philosophical growth.',
      'Capricorn': 'Career advancement and disciplined pursuit of goals.',
      'Aquarius': 'Innovative thinking and focus on social/humanitarian causes.',
      'Pisces': 'Enhanced intuition and spiritual/artistic sensitivity.'
    },
    'Moon': {
      'Aries': 'Dynamic emotions and reactive instincts. Good for quick actions.',
      'Taurus': 'Emotional stability and seeking physical comforts.',
      'Gemini': 'Mental restlessness and social curiosity.',
      'Cancer': 'Deep emotional sensitivity and desire for security.',
      'Leo': 'Need for attention and creative expression of feelings.',
      'Virgo': 'Practical approach to emotions and focus on routine.',
      'Libra': 'Seeking balance and harmony in emotional exchanges.',
      'Scorpio': 'Intense emotional depths and intuitive insights.',
      'Sagittarius': 'Optimistic outlook and desire for freedom.',
      'Capricorn': 'Reserved emotions and focus on responsibilities.',
      'Aquarius': 'Detached perspective and focus on collective needs.',
      'Pisces': 'Dreamy state and high empathy for others.'
    },
    'Mars': {
      'Aries': 'Peak physical energy and competitive drive.',
      'Taurus': 'Determined effort toward financial goals.',
      'Gemini': 'Sharp intellect and quick, potentially aggressive communication.',
      'Cancer': 'Protective instincts and focus on domestic security.',
      'Leo': 'Dramatic actions and pursuit of creative passions.',
      'Virgo': 'High productivity and technical precision.',
      'Libra': 'Striving for justice and fairness in actions.',
      'Scorpio': 'Unwavering willpower and intense focus.',
      'Sagittarius': 'Avid pursuit of knowledge and adventure.',
      'Capricorn': 'Strategically applied energy for long-term success.',
      'Aquarius': 'Energy directed toward group goals and innovation.',
      'Pisces': 'Subtle actions and focus on spiritual battles.'
    },
    'Mercury': {
      'Aries': 'Quick-witted and direct communication.',
      'Taurus': 'Deliberate and practical thinking.',
      'Gemini': 'Exceptional versatility and social intelligence.',
      'Cancer': 'Subjective thinking influenced by emotions.',
      'Leo': 'Confident and expressive communication style.',
      'Virgo': 'Analytic brilliance and organized thoughts.',
      'Libra': 'Diplomatic communication and balanced judgment.',
      'Scorpio': 'Probing mind and interest in mysteries.',
      'Sagittarius': 'Broad-minded and philosophical communication.',
      'Capricorn': 'Logical, structured, and goal-oriented thinking.',
      'Aquarius': 'Progressive ideas and unconventional logic.',
      'Pisces': 'Poetic mind and intuitive understanding.'
    },
    'Jupiter': {
      'Aries': 'Growth through bold initiatives and self-confidence.',
      'Taurus': 'Excellent for wealth accumulation and financial growth.',
      'Gemini': 'Expansion through information and networking.',
      'Cancer': 'Emotional abundance and growth through family.',
      'Leo': 'Expansion of creativity and leadership influence.',
      'Virgo': 'Growth through service and attention to health.',
      'Libra': 'Beneficial developments in partnerships and law.',
      'Scorpio': 'Deep psychological growth and shared resource gains.',
      'Sagittarius': 'Vast expansion of knowledge and global perspectives.',
      'Capricorn': 'Expansion through discipline and social structures.',
      'Aquarius': 'Progress through social innovation and networking.',
      'Pisces': 'Deep spiritual expansion and compassionate growth.'
    },
    'Venus': {
      'Aries': 'Passionate and spontaneous approach to love.',
      'Taurus': 'Appreciation for luxury and stable relationships.',
      'Gemini': 'Intellectual attraction and social variety.',
      'Cancer': 'Nurturing love and focus on domestic harmony.',
      'Leo': 'Generous, dramatic, and loyal affections.',
      'Virgo': 'Love expressed through service and practical help.',
      'Libra': 'Peak period for romance and artistic beauty.',
      'Scorpio': 'Intense, transformative, and deep connections.',
      'Sagittarius': 'Love for adventure and freedom in relationships.',
      'Capricorn': 'Serious and committed approach to love/finance.',
      'Aquarius': 'Unconventional and friendly relationship dynamics.',
      'Pisces': 'Universal love and artistic inspiration.'
    },
    'Saturn': {
      'Aries': 'Need for discipline in self-initiative.',
      'Taurus': 'Testing financial foundations for long-term stability.',
      'Gemini': 'Requirement for mental focus and precise communication.',
      'Cancer': 'Emotional maturity and domestic responsibilities.',
      'Leo': 'Learning humility and disciplined creativity.',
      'Virgo': 'Refining health habits and work systems.',
      'Libra': 'Defining boundaries and fairness in relationships.',
      'Scorpio': 'Confronting deep fears and power structures.',
      'Sagittarius': 'Structuring beliefs and higher learning goals.',
      'Capricorn': 'Peak of professional responsibility and structure.',
      'Aquarius': 'Innovating within disciplined social frameworks.',
      'Pisces': 'Structured spiritual practice and facing endings.'
    }
  };

  // Get interpretation helper
  const getInterpretation = (planet, sign) => {
    if (transitInterpretations[planet] && transitInterpretations[planet][sign]) {
      return transitInterpretations[planet][sign];
    }
    // Generic fallbacks based on planet nature
    const defaults = {
      'Rahu': 'A period of intense desires and unconventional changes in the current house.',
      'Ketu': 'A time for detachment, spiritual realization, and letting go of old patterns.',
      'Sun': 'Brings vitality and light to the matters governed by the sign.',
      'Moon': 'Influences mood and emotional responses based on the sign.',
      'Jupiter': 'Indicates a phase of growth and expansion in this sign.',
      'Saturn': 'Suggests a period of learning, discipline, and karmic lessons.',
      'Mars': 'Indicates where energy and drive are being focused right now.',
      'Venus': 'Brings harmony, pleasure, and focus on values in this sign.',
      'Mercury': 'Influences how we think and communicate throughout this transit.'
    };
    return defaults[planet] || 'Influences are currently shaping your path in unique ways.';
  };

  // Get traditional Chaughadiya sequence based on weekday
  const getTraditionalDayChaughadiya = (weekday, sunrise, sunset) => {
    // Daytime Choghadiya sequence for each weekday
    // Based on the traditional tables provided
    const daySequences = {
      // Sunday: Udveg, Char, Labh, Amrit, Kaal, Shubh, Rog, Udveg
      0: ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg'],
      // Monday: Amrit, Kaal, Shubh, Rog, Char, Labh, Udveg, Amrit
      1: ['Amrit', 'Kaal', 'Shubh', 'Rog', 'Char', 'Labh', 'Udveg', 'Amrit'],
      // Tuesday: Rog, Udveg, Char, Labh, Amrit, Kaal, Shubh, Rog
      2: ['Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'],
      // Wednesday: Labh, Amrit, Rog, Shubh, Kaal, Udveg, Char, Labh
      3: ['Labh', 'Amrit', 'Rog', 'Shubh', 'Kaal', 'Udveg', 'Char', 'Labh'],
      // Thursday: Shubh, Rog, Char, Udveg, Labh, Amrit, Kaal, Shubh
      4: ['Shubh', 'Rog', 'Char', 'Udveg', 'Labh', 'Amrit', 'Kaal', 'Shubh'],
      // Friday: Char, Labh, Kaal, Amrit, Rog, Shubh, Udveg, Char
      5: ['Char', 'Labh', 'Kaal', 'Amrit', 'Rog', 'Shubh', 'Udveg', 'Char'],
      // Saturday: Kaal, Shubh, Udveg, Rog, Char, Labh, Amrit, Kaal
      6: ['Kaal', 'Shubh', 'Udveg', 'Rog', 'Char', 'Labh', 'Amrit', 'Kaal']
    };

    // Planet rulers for each position in sequence
    const planetRulers = {
      'Amrit': 'Moon',
      'Shubh': 'Jupiter',
      'Labh': 'Mercury',
      'Char': 'Venus',
      'Udveg': 'Sun',
      'Kaal': 'Saturn',
      'Rog': 'Mars'
    };

    // Parse sunrise and sunset times
    const parseTime = (timeStr) => {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':');
      hours = parseInt(hours);
      minutes = parseInt(minutes);

      if (modifier === 'PM' && hours !== 12) {
        hours += 12;
      }
      if (modifier === 'AM' && hours === 12) {
        hours = 0;
      }

      return { hours, minutes };
    };

    const sunriseTime = parseTime(sunrise);
    const sunsetTime = parseTime(sunset);

    // Calculate day duration
    const sunriseDate = new Date(2000, 0, 1, sunriseTime.hours, sunriseTime.minutes);
    const sunsetDate = new Date(2000, 0, 1, sunsetTime.hours, sunsetTime.minutes);

    // Handle case where sunset is next day (after midnight)
    if (sunsetDate < sunriseDate) {
      sunsetDate.setDate(sunsetDate.getDate() + 1);
    }

    const dayDuration = sunsetDate - sunriseDate;
    const dayInterval = dayDuration / 8; // 8 Chaughadiya periods during day

    // Get the sequence for the current weekday
    const sequence = daySequences[weekday] || daySequences[0]; // Default to Sunday

    // Generate day Chaughadiya timings based on traditional sequence
    const dayChaughadiya = [];
    for (let i = 0; i < 8; i++) {
      const startTime = new Date(sunriseDate.getTime() + i * dayInterval);
      const endTime = new Date(sunriseDate.getTime() + (i + 1) * dayInterval);

      const chaughadiyaType = sequence[i];
      const planet = planetRulers[chaughadiyaType];

      dayChaughadiya.push({
        startTime: startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        endTime: endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        type: chaughadiyaType,
        planet: planet,
        isAuspicious: chaughadiyaTypes[chaughadiyaType].isAuspicious
      });
    }

    return dayChaughadiya;
  };

  // Get traditional night Chaughadiya sequence based on weekday
  const getTraditionalNightChaughadiya = (weekday, sunset) => {
    // Nighttime Choghadiya sequence for each weekday
    // Based on the traditional tables provided
    const nightSequences = {
      // Sunday: Shubh, Amrit, Char, Rog, Kaal, Labh, Udveg, Shubh
      0: ['Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh'],
      // Monday: Char, Rog, Kaal, Labh, Udveg, Shubh, Amrit, Char
      1: ['Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char'],
      // Tuesday: Kaal, Labh, Udveg, Shubh, Amrit, Char, Rog, Kaal
      2: ['Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal'],
      // Wednesday: Labh, Udveg, Shubh, Amrit, Char, Rog, Kaal, Labh
      3: ['Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh'],
      // Thursday: Udveg, Shubh, Amrit, Char, Rog, Kaal, Labh, Udveg
      4: ['Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg'],
      // Friday: Shubh, Amrit, Char, Rog, Kaal, Labh, Udveg, Shubh
      5: ['Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh'],
      // Saturday: Amrit, Char, Rog, Kaal, Labh, Udveg, Shubh, Amrit
      6: ['Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit']
    };

    // Planet rulers for each position in sequence
    const planetRulers = {
      'Amrit': 'Moon',
      'Shubh': 'Jupiter',
      'Labh': 'Mercury',
      'Char': 'Venus',
      'Udveg': 'Sun',
      'Kaal': 'Saturn',
      'Rog': 'Mars'
    };

    // Parse sunset time
    const parseTime = (timeStr) => {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':');
      hours = parseInt(hours);
      minutes = parseInt(minutes);

      if (modifier === 'PM' && hours !== 12) {
        hours += 12;
      }
      if (modifier === 'AM' && hours === 12) {
        hours = 0;
      }

      return { hours, minutes };
    };

    const sunsetTime = parseTime(sunset);

    // Calculate night duration (next sunrise)
    const sunsetDate = new Date(2000, 0, 1, sunsetTime.hours, sunsetTime.minutes);
    const nextSunrise = new Date(sunsetDate);
    nextSunrise.setDate(nextSunrise.getDate() + 1);
    nextSunrise.setHours(6, 0, 0, 0); // Assuming next sunrise at 6:00 AM

    const nightDuration = nextSunrise - sunsetDate;
    const nightInterval = nightDuration / 8; // 8 Chaughadiya periods during night

    // Get the sequence for the current weekday
    const sequence = nightSequences[weekday] || nightSequences[0]; // Default to Sunday

    // Generate night Chaughadiya timings based on traditional sequence
    const nightChaughadiya = [];
    for (let i = 0; i < 8; i++) {
      const startTime = new Date(sunsetDate.getTime() + i * nightInterval);
      const endTime = new Date(sunsetDate.getTime() + (i + 1) * nightInterval);

      const chaughadiyaType = sequence[i];
      const planet = planetRulers[chaughadiyaType];

      nightChaughadiya.push({
        startTime: startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        endTime: endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        type: chaughadiyaType,
        planet: planet,
        isAuspicious: chaughadiyaTypes[chaughadiyaType].isAuspicious
      });
    }

    return nightChaughadiya;
  };

  // Updated calculateChaughadiya to use traditional sequences
  const calculateChaughadiya = (sunrise, sunset, weekday) => {
    const dayChaughadiya = getTraditionalDayChaughadiya(weekday, sunrise, sunset);
    const nightChaughadiya = getTraditionalNightChaughadiya(weekday, sunset);

    return { dayChaughadiya, nightChaughadiya };
  };

  // Get all Shubh (auspicious) Chaughadiya periods for the day
  const getAllShubhChaughadiya = (dayChaughadiya) => {
    // Amrit, Shubh, and Labh are considered the most auspicious
    return dayChaughadiya.filter(period =>
      period.type === 'Amrit' || period.type === 'Shubh' || period.type === 'Labh'
    );
  };

  // Get specific Shubh Chaughadiya based on weekday (as per traditional recommendations)
  const getWeekdaySpecificShubhChaughadiya = (weekday, dayChaughadiya) => {
    // Define which Chaughadiya periods are recommended for each day
    const shubhRecommendations = {
      0: ['Amrit', 'Shubh', 'Labh'], // Sunday - Amrit, Shubh, Labh
      1: ['Amrit', 'Shubh', 'Char'], // Monday - Amrit, Shubh, Char
      2: ['Amrit', 'Shubh', 'Labh'], // Tuesday - Amrit, Shubh, Labh
      3: ['Amrit', 'Shubh', 'Char'], // Wednesday - Amrit, Shubh, Char
      4: ['Amrit', 'Shubh', 'Labh'], // Thursday - Amrit, Shubh, Labh
      5: ['Amrit', 'Shubh', 'Char'], // Friday - Amrit, Shubh, Char
      6: ['Amrit', 'Shubh', 'Labh']  // Saturday - Amrit, Shubh, Labh
    };

    const recommendedTypes = shubhRecommendations[weekday] || ['Amrit', 'Shubh', 'Labh'];

    return dayChaughadiya.filter(period =>
      recommendedTypes.includes(period.type)
    );
  };



  // Calculate Hindu calendar data with real astronomical data from Google APIs
  const calculateHinduCalendar = async (date) => {
    const month = date.getMonth();
    const day = date.getDate();
    const weekday = date.getDay();
    const year = date.getFullYear();

    // Default values
    let hinduMonth = hinduMonths[(month + 10) % 12];
    let nakshatra = nakshatras[(day + month) % 27];
    let tithi = tithis[(day - 1) % 15];
    let paksh = day <= 15 ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष';
    let sunrise = '06:15 AM';
    let sunset = '06:45 PM';
    let rahuKaal = '07:30-09:00';
    let abhijeetMuhurt = '11:52-12:40';
    let dishaShul = 'पूर्व दिशा';
    let yoga = 'N/A';
    let karana = 'N/A';
    let transits = [];

    // Fetch accurate Panchang from VedAstro
    try {
      const panchangRes = await kundaliAPI.getPanchang({
        date: date.toISOString(),
        coordinates: `${userLocation.lat},${userLocation.lon}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });

      if (panchangRes.data.success) {
        const p = panchangRes.data.panchang;
        tithi = p.tithi;
        nakshatra = p.nakshatra;
        paksh = p.paksh;
        yoga = p.yoga;
        karana = p.karana;
        transits = p.transits;
      }
    } catch (error) {
      console.warn('VedAstro Panchang fetch failed, using approximations:', error);
    }

    try {
      // Format date as YYYY-MM-DD for the API
      const formattedDate = date.toISOString().split('T')[0];

      // Using Sunrise-Sunset API for accurate calculations
      const response = await fetch(
        `https://api.sunrise-sunset.org/json?lat=${userLocation.lat}&lng=${userLocation.lon}&date=${formattedDate}&formatted=0`
      );

      const data = await response.json();

      if (data.status === 'OK') {
        // Convert UTC times to local times
        const sunriseTime = new Date(data.results.sunrise);
        const sunsetTime = new Date(data.results.sunset);

        // Format times for display
        sunrise = sunriseTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });

        sunset = sunsetTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });

        // Calculate Rahu Kaal based on sunrise/sunset times
        // Parse the formatted time strings properly
        const parseTime = (timeStr) => {
          const [time, modifier] = timeStr.split(' ');
          let [hours, minutes] = time.split(':');
          hours = parseInt(hours);
          minutes = parseInt(minutes);

          if (modifier === 'PM' && hours !== 12) {
            hours += 12;
          }
          if (modifier === 'AM' && hours === 12) {
            hours = 0;
          }

          return { hours, minutes };
        };

        const sunriseTimeObj = parseTime(sunrise);
        const sunsetTimeObj = parseTime(sunset);

        const sunriseDate = new Date(2000, 0, 1, sunriseTimeObj.hours, sunriseTimeObj.minutes);
        const sunsetDate = new Date(2000, 0, 1, sunsetTimeObj.hours, sunsetTimeObj.minutes);

        // Handle case where sunset is next day (after midnight)
        if (sunsetDate < sunriseDate) {
          sunsetDate.setDate(sunsetDate.getDate() + 1);
        }

        // Duration of daylight
        const daylightDuration = sunsetDate - sunriseDate;

        // Rahu Kaal calculation based on traditional method
        // Divide daylight into 8 equal periods and identify Rahu Kaal based on weekday
        // First period is always auspicious and free from Rahu's malefic effects
        const periodDuration = daylightDuration / 8;

        // Rahu Kaal period index based on weekday (0-indexed)
        // Monday: 2nd period (index 1), Saturday: 3rd period (index 2), Friday: 4th period (index 3)
        // Wednesday: 5th period (index 4), Thursday: 6th period (index 5), Tuesday: 7th period (index 6)
        // Sunday: 8th period (index 7)
        const rahuKaalPeriods = [
          7, // Sunday - 8th period
          1, // Monday - 2nd period
          6, // Tuesday - 7th period
          4, // Wednesday - 5th period
          5, // Thursday - 6th period
          3, // Friday - 4th period
          2  // Saturday - 3rd period
        ];

        const rahuPeriodIndex = rahuKaalPeriods[weekday];
        const rahuStart = new Date(sunriseDate.getTime() + (rahuPeriodIndex * periodDuration));
        const rahuEnd = new Date(rahuStart.getTime() + periodDuration);

        rahuKaal = `${rahuStart.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })}-${rahuEnd.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })}`;

        // Calculate Abhijeet Muhurt according to Muhurat Shastra
        // Divide daylight into 15 equal muhurats and find the 8th muhurat (middle of 15th muhurat)
        const muhuratDuration = daylightDuration / 15;
        // The 8th muhurat starts at 7 * muhuratDuration from sunrise
        const abhijeetStart = new Date(sunriseDate.getTime() + (7 * muhuratDuration));
        // Abhijeet Muhurt lasts 48 minutes (centered on the 8th muhurat)
        const abhijeetMid = new Date(sunriseDate.getTime() + (7.5 * muhuratDuration));
        const abhijeetEnd = new Date(abhijeetMid.getTime() + 24 * 60000); // 24 minutes after midpoint
        const abhijeetRealStart = new Date(abhijeetMid.getTime() - 24 * 60000); // 24 minutes before midpoint

        abhijeetMuhurt = `${abhijeetRealStart.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })}-${abhijeetEnd.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })}`;
      }
    } catch (error) {
      console.error('Error fetching astronomical data:', error);
      // Fallback to calculated times if API fails
      const sunriseHour = 6 + Math.floor((month - 6) * 0.1);
      const sunriseMinute = 15 + Math.floor((day - 15) * 0.2);
      const sunsetHour = 18 + Math.floor((6 - month) * 0.15);
      const sunsetMinute = 45 + Math.floor((15 - day) * 0.3);

      const formatTime = (hour, minute) => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        const formattedMinute = minute.toString().padStart(2, '0');
        return `${formattedHour}:${formattedMinute} ${period}`;
      };

      sunrise = formatTime(sunriseHour, sunriseMinute);
      sunset = formatTime(sunsetHour, sunsetMinute);

      // Calculate Rahu Kaal based on sunrise/sunset times
      // Parse the formatted time strings properly
      const parseTime = (timeStr) => {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');
        hours = parseInt(hours);
        minutes = parseInt(minutes);

        if (modifier === 'PM' && hours !== 12) {
          hours += 12;
        }
        if (modifier === 'AM' && hours === 12) {
          hours = 0;
        }

        return { hours, minutes };
      };

      const sunriseTimeObj = parseTime(sunrise);
      const sunsetTimeObj = parseTime(sunset);

      const sunriseDate = new Date(2000, 0, 1, sunriseTimeObj.hours, sunriseTimeObj.minutes);
      const sunsetDate = new Date(2000, 0, 1, sunsetTimeObj.hours, sunsetTimeObj.minutes);

      // Handle case where sunset is next day (after midnight)
      if (sunsetDate < sunriseDate) {
        sunsetDate.setDate(sunsetDate.getDate() + 1);
      }

      // Duration of daylight
      const daylightDuration = sunsetDate - sunriseDate;

      // Rahu Kaal calculation based on traditional method
      // Divide daylight into 8 equal periods and identify Rahu Kaal based on weekday
      // First period is always auspicious and free from Rahu's malefic effects
      const periodDuration = daylightDuration / 8;

      // Rahu Kaal period index based on weekday (0-indexed)
      // Monday: 2nd period (index 1), Saturday: 3rd period (index 2), Friday: 4th period (index 3)
      // Wednesday: 5th period (index 4), Thursday: 6th period (index 5), Tuesday: 7th period (index 6)
      // Sunday: 8th period (index 7)
      const rahuKaalPeriods = [
        7, // Sunday - 8th period
        1, // Monday - 2nd period
        6, // Tuesday - 7th period
        4, // Wednesday - 5th period
        5, // Thursday - 6th period
        3, // Friday - 4th period
        2  // Saturday - 3rd period
      ];

      const rahuPeriodIndex = rahuKaalPeriods[weekday];
      const rahuStart = new Date(sunriseDate.getTime() + (rahuPeriodIndex * periodDuration));
      const rahuEnd = new Date(rahuStart.getTime() + periodDuration);

      rahuKaal = `${rahuStart.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })}-${rahuEnd.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })}`;

      // Calculate Abhijeet Muhurt according to Muhurat Shastra
      // Divide daylight into 15 equal muhurats and find the 8th muhurat (middle of 15th muhurat)
      const muhuratDuration = daylightDuration / 15;
      // The 8th muhurat starts at 7 * muhuratDuration from sunrise
      const abhijeetStart = new Date(sunriseDate.getTime() + (7 * muhuratDuration));
      // Abhijeet Muhurt lasts 48 minutes (centered on the 8th muhurat)
      const abhijeetMid = new Date(sunriseDate.getTime() + (7.5 * muhuratDuration));
      const abhijeetEnd = new Date(abhijeetMid.getTime() + 24 * 60000); // 24 minutes after midpoint
      const abhijeetRealStart = new Date(abhijeetMid.getTime() - 24 * 60000); // 24 minutes before midpoint

      abhijeetMuhurt = `${abhijeetRealStart.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })}-${abhijeetEnd.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })}`;
    }

    // Direction restrictions (DishaShul) - based on weekday
    const dishaShulDirections = [
      'पूर्व दिशा', 'उत्तर दिशा', 'पश्चिम दिशा', 'दक्षिण दिशा',
      'उत्तर-पूर्व', 'उत्तर-पश्चिम', 'दक्षिण-पूर्व'
    ];
    dishaShul = dishaShulDirections[weekday];

    // Sample festivals
    const festivalsData = getFestivalsForDate(date);

    // Get upcoming major festivals
    const upcomingMajorFestivals = getUpcomingFestivals(date);

    // Check for ongoing festivals
    const ongoingFestival = getOngoingFestival(date);

    // Calculate upcoming important dates
    const upcomingDates = calculateUpcomingDates(date);

    // Calculate Chaughadiya timings
    const { dayChaughadiya, nightChaughadiya } = calculateChaughadiya(sunrise, sunset, weekday);

    // Get Shubh Chaughadiya Muhurt for the current day
    const shubhChaughadiyaMuhurt = getShubhChaughadiyaMuhurt(weekday, dayChaughadiya);

    return {
      hinduMonth,
      weekday: hindiWeekdays[weekday],
      nakshatra,
      tithi,
      paksh,
      sunrise,
      sunset,
      rahuKaal,
      abhijeetMuhurt,
      dishaShul,
      festivalsData,
      upcomingMajorFestivals,
      ongoingFestival,
      upcomingDates,
      dayChaughadiya,
      nightChaughadiya,
      shubhChaughadiyaMuhurt,
      yoga,
      karana,
      transits
    };
  };


  // Multi-day ongoing festivals with day-wise information (Updated 2025 dates)
  const ongoingFestivals = {
    // Chaitra Navratri (9 days) - March/April 2025
    'chaitra-navratri': {
      name: 'चैत्र नवरात्रि',
      startMonth: 2, // March
      startDay: 30, // March 30, 2025
      duration: 9,
      importance: 'माता दुर्गा के नौ रूपों की आराधना। नव संवत्सर की शुरुआत। शक्ति और समृद्धि प्राप्ति का समय।',
      dailyGoddess: [
        { day: 1, goddess: 'माँ शैलपुत्री', color: 'सफेद', offering: 'घी' },
        { day: 2, goddess: 'माँ ब्रह्मचारिणी', color: 'लाल', offering: 'चीनी' },
        { day: 3, goddess: 'माँ चंद्रघंटा', color: 'शाही नीला', offering: 'दूध और मिठाई' },
        { day: 4, goddess: 'माँ कूष्मांडा', color: 'पीला', offering: 'मालपुआ' },
        { day: 5, goddess: 'माँ स्कंदमाता', color: 'हरा', offering: 'केला' },
        { day: 6, goddess: 'माँ कात्यायनी', color: 'स्लेटी', offering: 'शहद' },
        { day: 7, goddess: 'माँ कालरात्रि', color: 'नारंगी', offering: 'गुड़' },
        { day: 8, goddess: 'माँ महागौरी', color: 'मोर हरा', offering: 'नारियल' },
        { day: 9, goddess: 'माँ सिद्धिदात्री', color: 'गुलाबी', offering: 'तिल' }
      ]
    },
    // Sharadiya Navratri (9 days) - September 22 to September 30, 2025
    'sharadiya-navratri': {
      name: 'शारदीय नवरात्रि',
      startMonth: 8, // September (0-indexed)
      startDay: 22, // September 22, 2025
      duration: 9,
      importance: 'देवी दुर्गा की शक्ति आराधना। शारदीय ऋतु का पवित्र समय। बुराई पर अच्छाई की विजय।',
      dailyGoddess: [
        { day: 1, goddess: 'माँ शैलपुत्री', color: 'सफेद', offering: 'घी' },
        { day: 2, goddess: 'माँ ब्रह्मचारिणी', color: 'लाल', offering: 'चीनी' },
        { day: 3, goddess: 'माँ चंद्रघंटा', color: 'शाही नीला', offering: 'दूध और मिठाई' },
        { day: 4, goddess: 'माँ कूष्मांडा', color: 'पीला', offering: 'मालपुआ' },
        { day: 5, goddess: 'माँ स्कंदमाता', color: 'हरा', offering: 'केला' },
        { day: 6, goddess: 'माँ कात्यायनी', color: 'स्लेटी', offering: 'शहद' },
        { day: 7, goddess: 'माँ कालरात्रि', color: 'नारंगी', offering: 'गुड़' },
        { day: 8, goddess: 'माँ महागौरी', color: 'मोर हरा', offering: 'नारियल' },
        { day: 9, goddess: 'माँ सिद्धिदात्री', color: 'गुलाबी', offering: 'तिल' }
      ]
    },
    // Pitra Paksh (15 days) - September 7 to September 21, 2025
    'pitra-paksh': {
      name: 'पितृ पक्ष',
      startMonth: 8, // September (0-indexed)
      startDay: 7, // September 7, 2025
      duration: 15,
      importance: 'पूर्वजों की आत्मा की शांति। श्राद्ध और तर्पण का समय। पितरों का आशीर्वाद प्राप्ति।',
      dailyRitual: [
        { day: 1, ritual: 'पूर्णिमा श्राद्ध', significance: 'पूर्णिमा दिन मृत पितरों का श्राद्ध' },
        { day: 2, ritual: 'प्रतिपदा श्राद्ध', significance: 'अकाल मृत्यु प्राप्त व्यक्तियों का श्राद्ध' },
        { day: 3, ritual: 'द्वितीया श्राद्ध', significance: 'स्त्रियों का श्राद्ध' },
        { day: 4, ritual: 'तृतीया श्राद्ध', significance: 'योद्धाओं का श्राद्ध' },
        { day: 5, ritual: 'चतुर्थी श्राद्ध', significance: 'चतुर्थी दिन मृत पितरों का श्राद्ध' },
        { day: 14, ritual: 'चतुर्दशी श्राद्ध', significance: 'हिंसक मृत्यु का श्राद्ध' },
        { day: 15, ritual: 'सर्वपितृ अमावस्या', significance: 'सभी पितरों का एकसाथ श्राद्ध' }
      ]
    },
    // Chhath Puja (4 days) - October 27 to October 30, 2025
    'chhath-puja': {
      name: 'छठ पूजा',
      startMonth: 9, // October (0-indexed)
      startDay: 27, // October 27, 2025
      duration: 4,
      importance: 'सूर्य देव और छठी माता की आराधना। स्वास्थ्य, संतान और समृद्धि की प्राप्ति। निर्जला व्रत का महत्व।',
      dailyRitual: [
        { day: 1, ritual: 'नहाय खाय', significance: 'पवित्रता और शुद्धता के लिए स्नान और उत्तम भोजन' },
        { day: 2, ritual: 'खरना और लोहंडा', significance: 'निर्जला व्रत की शुरुआत और प्रसाद तैयारी' },
        { day: 3, ritual: 'संध्या अर्घ्य', significance: 'सूर्यास्त के समय सूर्य देव को अर्घ्य' },
        { day: 4, ritual: 'उषा अर्घ्य', significance: 'सूर्योदय के समय अर्घ्य और व्रत समाप्ति' }
      ]
    }
  };

  // Function to check for ongoing festivals
  const getOngoingFestival = (currentDate) => {
    const month = currentDate.getMonth();
    const day = currentDate.getDate();

    for (const [key, festival] of Object.entries(ongoingFestivals)) {
      const startDate = new Date(currentDate.getFullYear(), festival.startMonth, festival.startDay);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + festival.duration - 1);

      if (currentDate >= startDate && currentDate <= endDate) {
        const daysDiff = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        return {
          ...festival,
          currentDay: daysDiff,
          totalDays: festival.duration,
          daysRemaining: festival.duration - daysDiff + 1,
          key: key
        };
      }
    }
    return null;
  };

  // Major Hindu Festivals with detailed information (Updated for late 2025 and 2026)
  const majorFestivals = {
    // 2025 Finals
    '11-25': {
      name: 'क्रिसमस',
      importance: 'ईसा मसीह का जन्मोत्सव। शांति और प्रेम का संदेश। ईसाइयों का प्रमुख त्योहार।',
      pooja: 'चर्च जाएं, प्रार्थना करें। घर को लाइटों और ट्री से सजाएं। उपहार बांटें।'
    },
    // 2026 Starts
    '0-1': {
      name: 'अंग्रेजी नव वर्ष 2026',
      importance: 'नए साल की शुरुआत। नई ऊर्जा और संकल्प का दिन।',
      pooja: 'प्रार्थना करें, अगले वर्ष के लिए उत्तम स्वास्थ्य और समृद्धि की कामना करें।'
    },
    '0-14': {
      name: 'मकर संक्रांति',
      importance: 'सूर्य का मकर राशि में प्रवेश। दान-पुण्य का महत्वपूर्ण दिन। नई शुरुआत और समृद्धि का प्रतीक।',
      pooja: 'प्रातःकाल स्नान करें। सूर्य देव को अर्घ्य दें। तिल, गुड़ का दान करें। खिचड़ी का भोग लगाएं।'
    },
    '0-26': {
      name: 'गणतंत्र दिवस',
      importance: 'भारत का राष्ट्रीय पर्व। संविधान लागू होने का दिन।',
      pooja: 'ध्वज वंदन करें, राष्ट्र के प्रति सम्मान व्यक्त करें।'
    },
    '1-15': {
      name: 'महाशिवरात्रि 2026',
      importance: 'भगवान शिव का महापर्व। शिव-पार्वती के विवाह का दिन। व्रत और जागरण से सभी पाप नष्ट होते हैं।',
      pooja: 'रात्रि जागरण करें। शिवलिंग पर दूध, बेल पत्र, धतूरा अर्पित करें। "ॐ नमः शिवाय" का जाप करें।'
    },
    '2-3': {
      name: 'होली (धुलेंडी) 2026',
      importance: 'रंगों का त्योहार। बुराई पर अच्छाई की विजय। खुशी और एकता का प्रतीक।',
      pooja: 'होलिका दहन की पूजा करें। अगले दिन रंग खेलें। मिठाई बांटें।'
    }
  };

  // Enhanced festivals database
  const getFestivalsForDate = (date) => {
    const month = date.getMonth();
    const day = date.getDate();
    const year = date.getFullYear();

    // Check for major festivals first
    const majorKey = `${month}-${day}`;
    if (majorFestivals[majorKey]) {
      return {
        regular: [],
        major: majorFestivals[majorKey]
      };
    }

    // Comprehensive festival database for regular festivals
    const festivalMap = {
      // January
      '0-1': ['नव वर्ष'],
      '0-15': ['पोंगल'],
      '0-26': ['गणतंत्र दिवस'],

      // February 
      '1-13': ['वसंत पंचमी'],

      // March
      '2-13': ['धुलेंडी'],

      // April
      '3-1': ['उगादी'],
      '3-14': ['बैसाखी'],
      '3-21': ['हनुमान जयंती'],

      // May
      '4-1': ['अक्षय तृतीया'],
      '4-7': ['रबींद्रनाथ टैगोर जयंती'],

      // June
      '5-21': ['योग दिवस'],

      // August
      '7-15': ['स्वतंत्रता दिवस'],

      // September
      '8-15': ['विश्वकर्मा पूजा'],

      // October
      '9-2': ['गांधी जयंती'],
      '9-15': ['दशहरा'],
      '9-24': ['करवा चौथ'],

      // November
      '10-13': ['गोवर्धन पूजा'],
      '10-14': ['भाई दूज'],
      '10-15': ['कार्तिक पूर्णिमा'],

      // December
      '11-25': ['क्रिसमस']
    };

    const key = `${month}-${day}`;
    const festivals = festivalMap[key] || [];

    // Add weekly festivals
    const weekday = date.getDay();
    if (weekday === 1) festivals.push('सोमवार व्रत'); // Monday
    if (weekday === 2) festivals.push('मंगलवार व्रत'); // Tuesday
    if (weekday === 5) festivals.push('शुक्रवार व्रत'); // Friday
    if (weekday === 6) festivals.push('शनिवार व्रत'); // Saturday

    return { regular: festivals, major: null };
  };

  // Get upcoming festivals within 10 days
  const getUpcomingFestivals = (currentDate) => {
    const upcoming = [];
    const current = new Date(currentDate);

    // Check next 10 days for major festivals
    for (let i = 1; i <= 10; i++) {
      const futureDate = new Date(current);
      futureDate.setDate(current.getDate() + i);
      const month = futureDate.getMonth();
      const day = futureDate.getDate();
      const key = `${month}-${day}`;

      if (majorFestivals[key]) {
        upcoming.push({
          date: futureDate,
          daysLeft: i,
          festival: majorFestivals[key]
        });
      }
    }

    return upcoming.sort((a, b) => a.daysLeft - b.daysLeft);
  };

  // Calculate upcoming important dates (Accurate for late 2025 and early 2026)
  const calculateUpcomingDates = (currentDate) => {
    const upcoming = [];

    // Precise religious event mapping for Jan/Feb 2026
    const exactDates2026 = {
      '2025-11-25': { event: 'क्रिसमस', type: 'festival' },
      '2025-11-30': { event: 'गीता जयंती / मोक्षदा एकादशी', type: 'ekadashi' },
      '2025-12-15': { event: 'सफला एकादशी', type: 'ekadashi' },
      '2025-12-19': { event: 'मार्गशीर्ष अमावस्या', type: 'amavasya' },
      '2025-12-30': { event: 'पुत्रदा एकादशी', type: 'ekadashi' },
      '2026-0-1': { event: 'अंग्रेजी नव वर्ष', type: 'festival' },
      '2026-0-3': { event: 'पौष पूर्णिमा', type: 'purnima' },
      '2026-0-14': { event: 'मकर संक्रांति', type: 'sankranti' },
      '2026-0-14': { event: 'षट्तिला एकादशी', type: 'ekadashi' },
      '2026-0-18': { event: 'मौनी अमावस्या', type: 'amavasya' },
      '2026-0-26': { event: 'गणतंत्र दिवस', type: 'festival' },
      '2026-0-30': { event: 'जया एकादशी', type: 'ekadashi' },
      '2026-1-1': { event: 'माघ पूर्णिमा', type: 'purnima' },
      '2026-1-13': { event: 'विजया एकादशी', type: 'ekadashi' },
      '2026-1-15': { event: 'महाशिवरात्रि', type: 'shivratri' },
      '2026-1-17': { event: 'फाल्गुन अमावस्या', type: 'amavasya' },
      '2026-2-28': { event: 'आमली एकादशी', type: 'ekadashi' }
    };

    const current = new Date(currentDate);
    for (let i = 1; i <= 60; i++) { // Check next 60 days
      const d = new Date(current);
      d.setDate(current.getDate() + i);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

      if (exactDates2026[key]) {
        upcoming.push({
          date: d.toLocaleDateString('hi-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
          event: exactDates2026[key].event,
          type: exactDates2026[key].type,
          fullDate: d
        });
      }
    }

    return upcoming.sort((a, b) => a.fullDate - b.fullDate).slice(0, 12);
  };

  // Function to get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          setUserLocation(newLocation);
          // Update calendar data when location changes
          calculateHinduCalendar(currentDate);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use default location (Delhi, India) if unable to get user's location
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      // Use default location (Delhi, India) if geolocation is not supported
    }
  };

  // Function to manually refresh calendar data
  const refreshCalendarData = async () => {
    const data = await calculateHinduCalendar(currentDate);
    setCalendarData(data);
  };

  useEffect(() => {
    // Get user's current location when component mounts
    getUserLocation();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const data = await calculateHinduCalendar(currentDate);
      setCalendarData(data);
    };

    fetchData();
  }, [currentDate, userLocation]);

  if (!calendarData) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: 'url(/images/daily2.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
      </div>



      <Navigation />

      {/* Main Content */}
      <div className="relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <section className="relative mb-12 p-10 rounded-[36px] border border-white/20 bg-white/80 backdrop-blur-lg shadow-[0_30px_90px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col lg:flex-row items-center gap-12">
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/60 to-transparent pointer-events-none"></div>
            <div className="relative z-10 flex-1 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-black/5 border border-black/10 rounded-full mx-auto lg:mx-0 animate-pulse-slow">
                <Calendar className="h-12 w-12 text-astro-gold" />
              </div>
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-black/10 bg-white/80 shadow-sm">
                <Calendar className="h-5 w-5 text-astro-gold" />
                <span className="text-black font-semibold">दैनिक पंचांग</span>
                <Sparkles className="h-4 w-4 text-astro-gold" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-black mb-3">
                  Daily Calendar Overview
                </h1>
                <p className="text-black/80 text-lg max-w-2xl">
                  Complete Hindu Panchang with today’s auspicious timings, planetary positions, and upcoming festivals tailored to your location.
                </p>
                <p className="text-astro-gold font-hindi text-sm">
                  आज के शुभ मुहूर्त, ग्रह स्थिति और त्योहारों सहित संपूर्ण पंचांग
                </p>
              </div>
            </div>
            <div className="relative z-10 flex-1 w-full grid grid-cols-2 gap-4">
              <div className="p-5 rounded-3xl bg-white/90 border border-black/5 shadow-lg">
                <p className="text-xs uppercase tracking-[0.35em] text-black/60 mb-2">Sunrise</p>
                <p className="text-3xl font-bold text-black">{calendarData.sunrise}</p>
                <p className="text-sm text-black/60">Local time</p>
              </div>
              <div className="p-5 rounded-3xl bg-white/90 border border-black/5 shadow-lg">
                <p className="text-xs uppercase tracking-[0.35em] text-black/60 mb-2">Sunset</p>
                <p className="text-3xl font-bold text-black">{calendarData.sunset}</p>
                <p className="text-sm text-black/60">Evening glow</p>
              </div>
              <div className="p-5 rounded-3xl bg-white/90 border border-black/5 shadow-lg">
                <p className="text-xs uppercase tracking-[0.35em] text-black/60 mb-2">Nakshatra</p>
                <p className="text-2xl font-bold text-black">{calendarData.nakshatra}</p>
                <p className="text-sm text-black/60">Current lunar mansion</p>
              </div>
              <div className="p-5 rounded-3xl bg-white/90 border border-black/5 shadow-lg">
                <p className="text-xs uppercase tracking-[0.35em] text-black/60 mb-2">Hindu Month</p>
                <p className="text-2xl font-bold text-black">{calendarData.hinduMonth}</p>
                <p className="text-sm text-black/60">पंचांग अनुसार महीना</p>
              </div>
            </div>
          </section>

          {/* Today's Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Current Date & Time */}
            <div className="lg:col-span-1">
              <div className="glass-card rounded-3xl border border-astro-gold/30 p-8 h-full shadow-2xl bg-white/10 backdrop-blur-sm relative">
                <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/60 to-white/70 rounded-3xl" />
                <div className="relative z-10 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-astro-gold to-divine-orange rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <CalendarDays className="h-10 w-10 text-white" />
                  </div>

                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {currentDate.toLocaleDateString('hi-IN')}
                  </h2>

                  <p className="text-xl text-astro-gold mb-4 font-semibold">{calendarData.weekday}</p>

                  <div className="space-y-3">
                    <div className="bg-white/10 rounded-xl p-4 border border-astro-gold/20 backdrop-blur-sm">
                      <p className="text-gray-700 text-sm mb-1">Hindu Month</p>
                      <p className="text-gray-800 text-lg font-semibold">{calendarData.hinduMonth}</p>
                    </div>

                    <div className="bg-white/10 rounded-xl p-4 border border-astro-gold/20 backdrop-blur-sm">
                      <p className="text-gray-700 text-sm mb-1">Current Time</p>
                      <p className="text-gray-800 text-lg font-semibold">
                        {new Date().toLocaleTimeString('hi-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Astronomical Information */}
            <div className="lg:col-span-2">
              <div className="glass-card rounded-3xl border border-astro-gold/30 p-8 h-full shadow-2xl bg-white/10 backdrop-blur-sm relative">
                <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/60 to-white/70 rounded-3xl" />
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/50 to-white/60 rounded-xl" />
                    <div className="relative z-10 flex items-center">
                      <Star className="mr-3 h-6 w-6 text-astro-gold" />
                      Astronomical Details
                    </div>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-astro-gold/20 backdrop-blur-sm relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/40 to-white/50 rounded-xl" />
                        <div className="relative z-10 flex items-center justify-between w-full">
                          <div className="flex items-center">
                            <Sunrise className="h-5 w-5 text-orange-600 mr-3" />
                            <span className="text-gray-700">सूर्योदय</span>
                          </div>
                          <span className="text-gray-800 font-semibold">{calendarData.sunrise}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-astro-gold/20 backdrop-blur-sm relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/40 to-white/50 rounded-xl" />
                        <div className="relative z-10 flex items-center justify-between w-full">
                          <div className="flex items-center">
                            <Sunset className="h-5 w-5 text-red-600 mr-3" />
                            <span className="text-gray-700">सूर्यास्त</span>
                          </div>
                          <span className="text-gray-800 font-semibold">{calendarData.sunset}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-astro-gold/20 backdrop-blur-sm relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/40 to-white/50 rounded-xl" />
                        <div className="relative z-10 flex items-center justify-between w-full">
                          <div className="flex items-center">
                            <Star className="h-5 w-5 text-purple-600 mr-3" />
                            <span className="text-gray-700">नक्षत्र</span>
                          </div>
                          <span className="text-gray-800 font-semibold">{calendarData.nakshatra}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-astro-gold/20 backdrop-blur-sm relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/40 to-white/50 rounded-xl" />
                        <div className="relative z-10 flex items-center justify-between w-full">
                          <div className="flex items-center">
                            <Sparkles className="h-5 w-5 text-indigo-600 mr-3" />
                            <span className="text-gray-700">योग</span>
                          </div>
                          <span className="text-gray-800 font-semibold">{calendarData.yoga}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-astro-gold/20 backdrop-blur-sm relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/40 to-white/50 rounded-xl" />
                        <div className="relative z-10 flex items-center justify-between w-full">
                          <div className="flex items-center">
                            <Moon className="h-5 w-5 text-blue-600 mr-3" />
                            <span className="text-gray-700">तिथि</span>
                          </div>
                          <span className="text-gray-800 font-semibold">{calendarData.tithi}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-astro-gold/20 backdrop-blur-sm relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/40 to-white/50 rounded-xl" />
                        <div className="relative z-10 flex items-center justify-between w-full">
                          <div className="flex items-center">
                            <Calendar className="h-5 w-5 text-green-600 mr-3" />
                            <span className="text-gray-700">पक्ष</span>
                          </div>
                          <span className="text-gray-800 font-semibold">{calendarData.paksh}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-astro-gold/20 backdrop-blur-sm relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/40 to-white/50 rounded-xl" />
                        <div className="relative z-10 flex items-center justify-between w-full">
                          <div className="flex items-center">
                            <Compass className="h-5 w-5 text-red-600 mr-3" />
                            <span className="text-gray-700">दिशा शूल</span>
                          </div>
                          <span className="text-gray-800 font-semibold">{calendarData.dishaShul}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-astro-gold/20 backdrop-blur-sm relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/40 to-white/50 rounded-xl" />
                        <div className="relative z-10 flex items-center justify-between w-full">
                          <div className="flex items-center">
                            <Zap className="h-5 w-5 text-teal-600 mr-3" />
                            <span className="text-gray-700">करण</span>
                          </div>
                          <span className="text-gray-800 font-semibold">{calendarData.karana}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Planetary Transits */}
          {calendarData.transits && calendarData.transits.length > 0 && (
            <section className="mb-12">
              <div className="glass-card rounded-[32px] border border-white/20 bg-white/70 backdrop-blur-md shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 p-8 border-b border-white/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-3 bg-indigo-500/20 rounded-2xl mr-4">
                        <Star className="h-8 w-8 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">Current Planetary Transiting</h3>
                        <p className="text-indigo-600 text-sm font-medium uppercase tracking-wider">आज के ग्रह गोचर</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {calendarData.transits.map((transit, idx) => (
                      <div key={idx} className="p-5 rounded-2xl bg-white/50 border border-indigo-100 hover:border-indigo-300 transition-all hover:shadow-md group">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">{transit.planet}</span>
                          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg uppercase tracking-wide">House {transit.house}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Sign</p>
                            <p className="text-md font-semibold text-gray-700">{transit.sign}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Degree</p>
                            <p className="text-md font-semibold text-indigo-600">{transit.degree}°</p>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-indigo-50">
                          <p className="text-xs text-indigo-800/70 font-medium italic">
                            <span className="font-bold uppercase text-[10px] mr-1">Insight:</span>
                            {getInterpretation(transit.planet, transit.sign)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Chaughadiya Timings - Day and Night */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Day Chaughadiya */}
            <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl transition-all duration-300 hover:shadow-2xl border border-amber-100 group">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-300 via-orange-400 to-amber-300"></div>
              <div className="p-6 lg:p-8 relative z-10">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3.5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl mr-5 shadow-inner border border-amber-100/50">
                      <Sun className="h-8 w-8 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 tracking-tight">Day Chaughadiya</h3>
                      <p className="text-amber-600/80 font-medium text-sm mt-0.5 tracking-wide uppercase">दिन का चौघड़िया</p>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-widest rounded-full border border-amber-100">
                      Sunrise - Sunset
                    </span>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm mb-6">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50/80 text-gray-600 font-bold uppercase tracking-wider text-xs">
                      <tr>
                        <th className="px-6 py-4">Time Period</th>
                        <th className="px-6 py-4">Muhurat</th>
                        <th className="px-6 py-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {calendarData.dayChaughadiya && calendarData.dayChaughadiya.map((choghadiya, index) => {
                        const chaughadiyaInfo = chaughadiyaTypes[choghadiya.type] || chaughadiyaTypes['Char'];
                        const isGood = choghadiya.isAuspicious;
                        return (
                          <tr key={index} className="hover:bg-amber-50/30 transition-colors group">
                            <td className="px-6 py-4 font-medium text-gray-700 whitespace-nowrap group-hover:text-gray-900 transition-colors">
                              {choghadiya.startTime} - {choghadiya.endTime}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`font-bold text-sm ${chaughadiyaInfo.textColor}`}>
                                {choghadiya.type}
                              </span>
                              <span className="text-xs text-gray-400 block mt-0.5">{choghadiya.planet}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${isGood
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : 'bg-red-50 text-red-700 border-red-100'
                                }`}>
                                {isGood ? 'Good' : 'Bad'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <h4 className="text-gray-900 font-semibold mb-3 text-sm flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></div>
                    Auspicious Periods
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {['Amrit', 'Shubh', 'Labh', 'Char'].map((type) => (
                      <span key={type} className="text-xs font-medium px-3 py-1.5 rounded-xl bg-white text-gray-600 border border-gray-200 shadow-sm">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Night Chaughadiya */}
            <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl transition-all duration-300 hover:shadow-2xl border border-indigo-100 group">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-300 via-blue-400 to-indigo-300"></div>
              <div className="p-6 lg:p-8 relative z-10">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                  <div className="flex items-center">
                    <div className="p-3.5 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl mr-5 shadow-inner border border-indigo-100/50">
                      <Moon className="h-8 w-8 text-indigo-500" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 tracking-tight">Night Chaughadiya</h3>
                      <p className="text-indigo-600/80 font-medium text-sm mt-0.5 tracking-wide uppercase">रात का चौघड़िया</p>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-widest rounded-full border border-indigo-100">
                      Sunset - Sunrise
                    </span>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm mb-6">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50/80 text-gray-600 font-bold uppercase tracking-wider text-xs">
                      <tr>
                        <th className="px-6 py-4">Time Period</th>
                        <th className="px-6 py-4">Muhurat</th>
                        <th className="px-6 py-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {calendarData.nightChaughadiya && calendarData.nightChaughadiya.map((choghadiya, index) => {
                        const chaughadiyaInfo = chaughadiyaTypes[choghadiya.type] || chaughadiyaTypes['Char'];
                        const isGood = choghadiya.isAuspicious;
                        return (
                          <tr key={index} className="hover:bg-indigo-50/30 transition-colors group">
                            <td className="px-6 py-4 font-medium text-gray-700 whitespace-nowrap group-hover:text-gray-900 transition-colors">
                              {choghadiya.startTime} - {choghadiya.endTime}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`font-bold text-sm ${chaughadiyaInfo.textColor}`}>
                                {choghadiya.type}
                              </span>
                              <span className="text-xs text-gray-400 block mt-0.5">{choghadiya.planet}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${isGood
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : 'bg-red-50 text-red-700 border-red-100'
                                }`}>
                                {isGood ? 'Good' : 'Bad'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <h4 className="text-gray-900 font-semibold mb-3 text-sm flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></div>
                    Auspicious Periods
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {['Amrit', 'Shubh', 'Labh'].map((type) => (
                      <span key={type} className="text-xs font-medium px-3 py-1.5 rounded-xl bg-white text-gray-600 border border-gray-200 shadow-sm">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Auspicious and Inauspicious Timings */}
          {/* Auspicious and Inauspicious Timings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="p-2 bg-green-50 rounded-lg mr-3">
                  <Clock className="h-5 w-5 text-green-600" />
                </span>
                Auspicious Timings
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50/50 rounded-xl border border-green-100">
                  <div>
                    <p className="text-green-800 font-semibold">अभिजीत मुहूर्त</p>
                    <p className="text-green-600 text-xs mt-1">Best time for new ventures</p>
                  </div>
                  <span className="bg-white px-3 py-1.5 rounded-lg text-green-700 font-bold text-sm shadow-sm border border-green-100">
                    {calendarData.abhijeetMuhurt}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-red-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="p-2 bg-red-50 rounded-lg mr-3">
                  <Clock className="h-5 w-5 text-red-600" />
                </span>
                Inauspicious Timings
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-red-50/50 rounded-xl border border-red-100">
                  <div>
                    <p className="text-red-800 font-semibold">राहु काल</p>
                    <p className="text-red-600 text-xs mt-1">Avoid important work</p>
                  </div>
                  <span className="bg-white px-3 py-1.5 rounded-lg text-red-700 font-bold text-sm shadow-sm border border-red-100">
                    {calendarData.rahuKaal}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shubh Chaughadiya Muhurt */}
          <div className="mb-12">
            <div className="bg-white rounded-3xl border border-astro-gold/20 p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="p-2 bg-amber-50 rounded-lg mr-3">
                  <Star className="h-6 w-6 text-astro-gold" />
                </span>
                Shubh Chaughadiya Muhurt for {calendarData.weekday}
              </h3>

              {calendarData.shubhChaughadiyaMuhurt && calendarData.shubhChaughadiyaMuhurt.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-gray-700 mb-4 font-medium">Most auspicious periods for today ({calendarData.weekday}):</p>

                  <div className="overflow-hidden rounded-xl border border-astro-gold/20 shadow-sm">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-astro-gold/10 text-gray-900 font-semibold uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Time</th>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3">Ruler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white/50 backdrop-blur-sm">
                        {calendarData.shubhChaughadiyaMuhurt.map((muhurt, index) => {
                          const chaughadiyaInfo = chaughadiyaTypes[muhurt.type] || chaughadiyaTypes['Char'];
                          return (
                            <tr key={index} className="hover:bg-astro-gold/5 transition-colors">
                              <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                                {muhurt.startTime} - {muhurt.endTime}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`font-semibold ${chaughadiyaInfo.textColor}`}>
                                  {muhurt.type}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-600">
                                {muhurt.planet}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>


                  {/* Additional information about Chaughadiya types */}
                  {/* Additional information about Chaughadiya types */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <h4 className="text-blue-800 font-semibold mb-2">About These Auspicious Periods:</h4>
                    <ul className="text-gray-700 text-sm space-y-1">
                      <li>• <span className="text-green-700">Amrit</span> - Most auspicious time ruled by Moon, excellent for all activities</li>
                      <li>• <span className="text-blue-700">Shubh</span> - Auspicious time ruled by Jupiter, ideal for religious ceremonies</li>
                      <li>• <span className="text-purple-700">Labh</span> - Auspicious time ruled by Mercury, good for business and education</li>
                      {calendarData.weekday === 'सोमवार' || calendarData.weekday === 'बुधवार' || calendarData.weekday === 'शुक्रवार' ? (
                        <li>• <span className="text-yellow-700">Char</span> - Auspicious for travel and movement, ruled by Venus</li>
                      ) : null}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">No specific Shubh Chaughadiya Muhurt data available for today.</p>
              )}
            </div>
          </div>

          {/* Ongoing Festival Rituals */}
          {calendarData.ongoingFestival && calendarData.ongoingFestival.dailyRitual &&
            calendarData.ongoingFestival.dailyRitual.find(r => r.day === calendarData.ongoingFestival.currentDay) && (
              <div className="mb-12">
                <div className="glass-card rounded-3xl border border-astro-gold/30 p-8 shadow-2xl bg-white/10 backdrop-blur-sm relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/60 to-white/70 rounded-3xl" />
                  <div className="relative z-10">
                    <h6 className="text-astro-gold text-2xl font-semibold mb-2">
                      {calendarData.ongoingFestival.dailyRitual.find(r => r.day === calendarData.ongoingFestival.currentDay).ritual}
                    </h6>
                    <p className="text-gray-800">
                      <strong>महत्व:</strong> {calendarData.ongoingFestival.dailyRitual.find(r => r.day === calendarData.ongoingFestival.currentDay).significance}
                    </p>
                  </div>
                </div>
              </div>
            )}

          {/* Today's Festivals */}
          <div className="mb-12">
            <div className="glass-card rounded-3xl border border-astro-gold/30 p-8 shadow-2xl bg-white/10 backdrop-blur-sm relative">
              <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/60 to-white/70 rounded-3xl" />
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/50 to-white/60 rounded-xl" />
                  <div className="relative z-10 flex items-center">
                    <Sparkles className="mr-3 h-6 w-6 text-astro-gold" />
                    Today's Festivals & Observances
                  </div>
                </h3>

                {/* Major Festival with Importance and Pooja */}
                {calendarData.festivalsData.major && (
                  <div className="bg-orange-500/20 border-l-4 border-orange-400 p-6 rounded-lg shadow-lg mb-6 backdrop-blur-sm relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/40 to-white/50 rounded-lg" />
                    <div className="relative z-10">
                      <div className="flex items-start relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/30 to-white/40 rounded-lg" />
                        <div className="relative z-10 flex items-start w-full">
                          <div className="text-orange-400 mr-4 mt-1">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-orange-700 font-bold text-2xl mb-2">🎉 आज का महत्वपूर्ण त्योहार</h4>
                            <h5 className="text-astro-gold font-semibold text-2xl mb-4">{calendarData.festivalsData.major.name}</h5>

                            <div className="mb-4 bg-orange-500/10 p-4 rounded-lg border border-orange-400/30 backdrop-blur-sm relative">
                              <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/40 to-white/50 rounded-lg" />
                              <div className="relative z-10">
                                <h6 className="text-orange-700 font-medium mb-2 flex items-center relative">
                                  <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/30 to-white/40 rounded-lg" />
                                  <div className="relative z-10 flex items-center">
                                    <Info className="w-5 h-5 mr-2" />
                                    🕉️ त्योहार का महत्व:
                                  </div>
                                </h6>
                                <p className="text-gray-800 leading-relaxed">{calendarData.festivalsData.major.importance}</p>
                              </div>
                            </div>

                            <div className="bg-orange-500/10 p-4 rounded-lg border border-orange-400/30 backdrop-blur-sm relative">
                              <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/40 to-white/50 rounded-lg" />
                              <div className="relative z-10">
                                <h6 className="text-orange-700 font-medium mb-2 flex items-center relative">
                                  <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/30 to-white/40 rounded-lg" />
                                  <div className="relative z-10 flex items-center">
                                    <Star className="w-5 h-5 mr-2" />
                                    🪔 पूजा विधि:
                                  </div>
                                </h6>
                                <p className="text-gray-800 leading-relaxed">{calendarData.festivalsData.major.pooja}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Regular Festivals */}
                {calendarData.festivalsData.regular.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {calendarData.festivalsData.regular.map((festival, index) => (
                      <div key={index} className="p-4 bg-pink-500/20 rounded-xl border border-pink-400/30 backdrop-blur-sm">
                        <span className="text-pink-300 font-medium">{festival}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* No Festivals Message */}
                {!calendarData.festivalsData.major && calendarData.festivalsData.regular.length === 0 && (
                  <div className="text-center py-8 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/40 to-white/50 rounded-xl" />
                    <div className="relative z-10">
                      <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-700 text-lg">आज कोई मुख्य त्योहार नहीं है</p>
                      <p className="text-gray-600">अपने दैनिक पूजा और व्रत का पालन करें</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upcoming Major Festivals (10 days ahead) */}
          {calendarData.upcomingMajorFestivals.length > 0 && (
            <div className="mb-12">
              <div className="glass-card rounded-3xl border border-astro-gold/30 p-8 shadow-2xl bg-white/10 backdrop-blur-sm relative">
                <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/60 to-white/70 rounded-3xl" />
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/50 to-white/60 rounded-xl" />
                    <div className="relative z-10 flex items-center">
                      <Bell className="mr-3 h-6 w-6 text-astro-gold" />
                      📅 आगामी प्रमुख त्योहार (अगले 10 दिन में)
                    </div>
                  </h3>
                  <div className="space-y-4">
                    {calendarData.upcomingMajorFestivals.map((upcoming, index) => {
                      const options = {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      };
                      const formattedDate = upcoming.date.toLocaleDateString('hi-IN', options);

                      return (
                        <div key={index} className="bg-white/10 p-6 rounded-lg border border-astro-gold/30 hover:bg-white/15 transition-all duration-300 shadow-lg backdrop-blur-sm relative">
                          <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/40 to-white/50 rounded-lg" />
                          <div className="relative z-10">
                            <div className="flex justify-between items-start mb-3 relative">
                              <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/30 to-white/40 rounded-lg" />
                              <div className="relative z-10 flex justify-between items-start w-full">
                                <h5 className="text-astro-gold font-bold text-xl">{upcoming.festival.name}</h5>
                                <div className="flex items-center relative">
                                  <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/20 to-white/30 rounded-lg" />
                                  <div className="relative z-10 flex items-center">
                                    <Timer className="w-4 h-4 mr-1 text-astro-gold" />
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${upcoming.daysLeft <= 3
                                      ? 'bg-red-500/30 text-red-300 border border-red-400/50'
                                      : upcoming.daysLeft <= 7
                                        ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-400/50'
                                        : 'bg-green-500/30 text-green-300 border border-green-400/50'
                                      }`}>
                                      {upcoming.daysLeft} दिन बाकी
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-700 text-sm mb-3 flex items-center relative">
                              <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/30 to-white/40 rounded-lg" />
                              <div className="relative z-10 flex items-center">
                                <CalendarDays className="w-4 h-4 mr-2 text-astro-gold" />
                                📆 {formattedDate}
                              </div>
                            </p>
                            <div className="bg-blue-500/20 p-3 rounded-lg mb-3 border border-blue-400/30 backdrop-blur-sm relative">
                              <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/40 to-white/50 rounded-lg" />
                              <div className="relative z-10">
                                <p className="text-blue-700 text-sm leading-relaxed">
                                  <strong>महत्व:</strong> {upcoming.festival.importance.substring(0, 150)}...
                                </p>
                              </div>
                            </div>
                            <div className="bg-purple-500/20 p-3 rounded-lg border border-purple-400/30 backdrop-blur-sm relative">
                              <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/40 to-white/50 rounded-lg" />
                              <div className="relative z-10">
                                <p className="text-purple-700 text-sm leading-relaxed">
                                  <strong>पूजा:</strong> {upcoming.festival.pooja.substring(0, 150)}...
                                </p>
                              </div>
                            </div>

                            {upcoming.daysLeft <= 3 && (
                              <div className="mt-3 flex items-center text-red-700 text-sm relative">
                                <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/30 to-white/40 rounded-lg" />
                                <div className="relative z-10 flex items-center">
                                  <Zap className="w-4 h-4 mr-1" />
                                  <span>तैयारी शुरू कर दें!</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Important Dates */}
          {/* Upcoming Important Dates */}
          <div className="bg-white rounded-3xl border border-astro-gold/20 p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="p-2 bg-amber-50 rounded-lg mr-3">
                <CalendarDays className="h-6 w-6 text-astro-gold" />
              </span>
              Upcoming Important Dates
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {calendarData.upcomingDates.map((event, index) => (
                <div key={index} className="p-4 bg-white rounded-xl hover:shadow-md transition-all duration-300 border border-gray-100 group">
                  <div className="flex flex-col h-full justify-between">
                    <div className="mb-2">
                      <span className={`inline-block px-2 py-1 rounded-md text-xs font-semibold mb-2 ${event.type === 'purnima' ? 'bg-yellow-100 text-yellow-800' :
                        event.type === 'amavasya' ? 'bg-slate-100 text-slate-800' :
                          event.type === 'ekadashi' ? 'bg-green-100 text-green-800' :
                            event.type === 'pradosh' ? 'bg-purple-100 text-purple-800' :
                              event.type === 'shivratri' ? 'bg-orange-100 text-orange-800' :
                                'bg-pink-100 text-pink-800'
                        }`}>
                        {event.event}
                      </span>
                      <p className="text-gray-900 font-medium text-lg leading-tight">{event.event}</p>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm mt-3 pt-3 border-t border-gray-50">
                      <CalendarDays className="w-4 h-4 mr-2 text-gray-400 group-hover:text-astro-gold transition-colors" />
                      {event.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div >

  );
};

export default DailyCalendar;