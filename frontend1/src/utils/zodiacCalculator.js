// Utility functions for calculating zodiac signs

/**
 * Calculate sun sign based on birth date
 * @param {Date} birthDate - The user's birth date
 * @returns {string} The sun sign name
 */
export const calculateSunSign = (birthDate) => {
  const month = birthDate.getMonth() + 1; // Month is 0-indexed
  const day = birthDate.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces';

  return 'Unknown';
};

/**
 * Calculate moon sign based on birth date, time, and location
 * IMPORTANT: This is a simplified calculation for demonstration purposes only.
 * Accurate Hindu astrology Moon sign calculation requires:
 * 1. Exact birth time (down to the minute)
 * 2. Precise birth location coordinates
 * 3. Complex astronomical calculations based on the Moon's position
 * 4. Consideration of Ayanamsa (correction for precession of equinoxes)
 * 
 * For accurate Moon sign calculation, please use our Kundali generation service
 * which uses professional astrological algorithms.
 * 
 * @param {Date} birthDate - The user's birth date
 * @param {string} birthTime - The user's birth time (HH:MM format)
 * @param {string} latitude - The birth location latitude
 * @param {string} longitude - The birth location longitude
 * @returns {string} The moon sign name (approximation only)
 */
export const calculateMoonSign = (birthDate, birthTime = '12:00', latitude = null, longitude = null) => {
  if (!birthDate) return 'Aries';

  const date = new Date(birthDate);
  const [hours, minutes] = (birthTime || '12:00').split(':').map(Number);

  // Compute Julian Date (JD)
  const yr = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate() + (hours + minutes / 60) / 24;

  let y = yr;
  let month = m;
  if (month <= 2) {
    y -= 1;
    month += 12;
  }

  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (month + 1)) + d + B - 1524.5;

  // Days from J2000.0
  const daysSinceJ2000 = jd - 2451545.0;

  // Moon's Mean Tropical Longitude (Degrees)
  let moonMeanLongitude = (218.316 + 13.176396 * daysSinceJ2000) % 360;
  if (moonMeanLongitude < 0) moonMeanLongitude += 360;

  // Lahiri Ayanamsa Correction (~23.85° at J2000 + precession)
  const ayanamsa = 23.85 + (yr - 2000) * 0.01397;

  // Sidereal Longitude (Nirayana)
  let siderealLongitude = (moonMeanLongitude - ayanamsa) % 360;
  if (siderealLongitude < 0) siderealLongitude += 360;

  const zodiacSigns = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  const signIndex = Math.floor(siderealLongitude / 30);
  return zodiacSigns[signIndex] || 'Aries';
};

/**
 * Get zodiac sign details by name
 * @param {string} signName - The name of the zodiac sign
 * @param {Array} zodiacSigns - Array of zodiac sign objects
 * @returns {Object|null} The zodiac sign object or null if not found
 */
export const getZodiacSignByName = (signName, zodiacSigns) => {
  if (!signName || !zodiacSigns) return null;

  const normalizedSignName = signName.charAt(0).toUpperCase() + signName.slice(1).toLowerCase();
  return zodiacSigns.find(sign =>
    sign.name === normalizedSignName ||
    sign.name.toLowerCase() === signName.toLowerCase()
  ) || null;
};

/**
 * Calculate both sun and moon signs
 * IMPORTANT: Moon sign calculation is for demonstration purposes only.
 * For accurate Hindu astrology Moon sign, please use our professional Kundali service.
 * 
 * @param {Date} birthDate - The user's birth date
 * @param {string} birthTime - The user's birth time (HH:MM format)
 * @param {string} latitude - The birth location latitude (optional)
 * @param {string} longitude - The birth location longitude (optional)
 * @returns {Object} Object containing sunSign and moonSign (approximation only for moonSign)
 */
export const calculateBothSigns = (birthDate, birthTime, latitude = null, longitude = null) => {
  return {
    sunSign: calculateSunSign(birthDate),
    moonSign: calculateMoonSign(birthDate, birthTime, latitude, longitude)
  };
};