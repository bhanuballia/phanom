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
  // Disclaimer: This is NOT an accurate calculation for Hindu astrology purposes
  console.warn('This Moon sign calculation is for demonstration only. For accurate results, please use our professional Kundali service.');

  // Improved approximation using Moon's orbital characteristics
  // The Moon completes one orbit through the zodiac approximately every 27.3 days
  // This is still a simplified calculation and NOT suitable for real astrological work

  const year = birthDate.getFullYear();
  const month = birthDate.getMonth() + 1; // 1-12
  const day = birthDate.getDate();

  // Parse birth time
  const [hours, minutes] = birthTime.split(':').map(Number);
  const timeInHours = hours + (minutes / 60);

  // Calculate days since a reference point (Jan 1, 2000)
  const referenceDate = new Date(2000, 0, 1);
  const daysSinceReference = Math.floor((birthDate - referenceDate) / (1000 * 60 * 60 * 24));

  // Moon's approximate cycle through zodiac (27.3 days)
  const moonCycleDays = 27.3;

  // Calculate approximate position in cycle
  let moonPosition = (daysSinceReference % moonCycleDays) / moonCycleDays;

  // Adjust for birth time (time of day affects moon position)
  moonPosition += (timeInHours / 24) * (1 / moonCycleDays);

  // Location adjustment (longitude affects local time)
  if (longitude) {
    const lon = parseFloat(longitude);
    if (!isNaN(lon)) {
      // Longitude affects time zone and thus moon position
      const longitudeAdjustment = (lon / 360) * (1 / moonCycleDays);
      moonPosition += longitudeAdjustment;
    }
  }

  // Normalize to 0-1 range
  moonPosition = moonPosition % 1;
  if (moonPosition < 0) moonPosition += 1;

  // Map to zodiac signs (12 signs, each occupying ~1/12 of the cycle)
  const zodiacSigns = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  const signIndex = Math.floor(moonPosition * 12);
  return zodiacSigns[signIndex];
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