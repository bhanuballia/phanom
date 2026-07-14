// Helper functions for Dosha Analysis

// Analyze Pitra Dosha
const analyzePitraDosha = (planets) => {
    // Pitra Dosha is indicated by:
    // 1. Sun and Rahu conjunction or aspect
    // 2. Sun in 9th house with malefic planets
    // 3. 9th lord afflicted
    // 4. Saturn and Rahu in 9th house

    const sun = planets['Sun'] || planets['Surya'];
    const rahu = planets['Rahu'];
    const saturn = planets['Saturn'] || planets['Shani'];

    const sunHouse = sun ? (sun.HousePlanetIsIn || sun.house) : null;
    const rahuHouse = rahu ? (rahu.HousePlanetIsIn || rahu.house) : null;
    const saturnHouse = saturn ? (saturn.HousePlanetIsIn || saturn.house) : null;

    let isPresent = false;
    let reasons = [];

    // Check Sun-Rahu conjunction (same house)
    if (sunHouse && rahuHouse && sunHouse === rahuHouse) {
        isPresent = true;
        reasons.push(`Sun and Rahu are conjunct in ${sunHouse}th house`);
    }

    // Check Sun in 9th house
    if (sunHouse === 9) {
        reasons.push(`Sun is placed in 9th house (house of ancestors)`);
        isPresent = true;
    }

    // Check Saturn and Rahu in 9th house
    if ((saturnHouse === 9 || rahuHouse === 9)) {
        reasons.push(`Malefic planet in 9th house affecting ancestral blessings`);
        isPresent = true;
    }

    return {
        isPresent,
        reasons,
        sunHouse,
        rahuHouse,
        saturnHouse,
        summary: isPresent
            ? 'Pitra Dosha is indicated in your birth chart.'
            : 'No significant Pitra Dosha is found in your chart.'
    };
};

// Analyze Kalsarp Dosha
const analyzeKalsarpDosha = (planets) => {
    // Kalsarp Dosha occurs when all 7 planets are hemmed between Rahu and Ketu

    const rahu = planets['Rahu'];
    const ketu = planets['Ketu'];

    if (!rahu || !ketu) {
        return {
            isPresent: false,
            type: 'Cannot determine',
            summary: 'Insufficient data to determine Kalsarp Dosha'
        };
    }

    const rahuDegree = parseFloat(rahu.NirayanaLongitude?.TotalDegrees || 0);
    const ketuDegree = parseFloat(ketu.NirayanaLongitude?.TotalDegrees || 0);

    // Get all 7 planets (excluding Rahu and Ketu)
    const sevenPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    const planetDegrees = [];

    sevenPlanets.forEach(planetName => {
        const planet = planets[planetName];
        if (planet && planet.NirayanaLongitude) {
            const degree = parseFloat(planet.NirayanaLongitude.TotalDegrees || 0);
            planetDegrees.push({ name: planetName, degree });
        }
    });

    // Check if all planets are between Rahu and Ketu
    let allBetween = true;
    let rahuKetuAxis = rahuDegree;
    let oppositeAxis = (rahuDegree + 180) % 360;

    for (const planet of planetDegrees) {
        const deg = planet.degree;
        // Check if planet is in the Rahu-Ketu hemisphere
        const isInRahuSide = (deg >= rahuDegree && deg <= oppositeAxis) ||
            (rahuDegree > oppositeAxis && (deg >= rahuDegree || deg <= oppositeAxis));

        if (!isInRahuSide && deg !== rahuDegree && deg !== oppositeAxis) {
            allBetween = false;
            break;
        }
    }

    // Determine type based on Rahu's house
    const rahuHouse = rahu.HousePlanetIsIn || rahu.house || 1;
    const kalsarpTypes = [
        'Anant Kalsarp', 'Kulik Kalsarp', 'Vasuki Kalsarp', 'Shankhpal Kalsarp',
        'Padma Kalsarp', 'Mahapadma Kalsarp', 'Takshak Kalsarp', 'Karkotak Kalsarp',
        'Shankhachud Kalsarp', 'Ghatak Kalsarp', 'Vishdhar Kalsarp', 'Sheshnag Kalsarp'
    ];

    const type = kalsarpTypes[rahuHouse - 1] || 'Kalsarp Yoga';

    return {
        isPresent: allBetween,
        type: allBetween ? type : 'Not Present',
        rahuHouse,
        ketuHouse: ((rahuHouse + 5) % 12) + 1,
        summary: allBetween
            ? `${type} Dosha is present in your chart.`
            : 'Kalsarp Dosha is not present in your chart.'
    };
};

// Analyze Sadesati
const analyzeSadesati = (planets, dateOfBirth) => {
    // Sadesati occurs when Saturn transits the 12th, 1st, or 2nd house from Moon sign

    const moon = planets['Moon'] || planets['Chandra'];
    const saturn = planets['Saturn'] || planets['Shani'];

    if (!moon || !saturn) {
        return {
            isPresent: false,
            phase: 'Cannot determine',
            summary: 'Insufficient data to determine Sadesati'
        };
    }

    const moonSign = moon.Sign?.Name || moon.sign;
    const saturnSign = saturn.Sign?.Name || saturn.sign;

    // Zodiac signs in order
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

    const moonIndex = signs.indexOf(moonSign);
    const saturnIndex = signs.indexOf(saturnSign);

    if (moonIndex === -1 || saturnIndex === -1) {
        return {
            isPresent: false,
            phase: 'Cannot determine',
            summary: 'Sign data not available'
        };
    }

    // Calculate relative position
    let relativePosition = (saturnIndex - moonIndex + 12) % 12;

    let isPresent = false;
    let phase = '';
    let description = '';

    if (relativePosition === 11) {
        // Saturn in 12th from Moon - First Phase (Rising)
        isPresent = true;
        phase = 'First Phase (Rising) - Shani in 12th from Moon';
        description = 'This is the beginning phase of Sadesati. It may bring challenges related to expenses, losses, and mental stress.';
    } else if (relativePosition === 0) {
        // Saturn in same sign as Moon - Second Phase (Peak)
        isPresent = true;
        phase = 'Second Phase (Peak) - Shani in Moon Sign';
        description = 'This is the most intense phase of Sadesati. It tests your patience and resilience. Focus on hard work and spiritual practices.';
    } else if (relativePosition === 1) {
        // Saturn in 2nd from Moon - Third Phase (Setting)
        isPresent = true;
        phase = 'Third Phase (Setting) - Shani in 2nd from Moon';
        description = 'This is the concluding phase of Sadesati. Challenges begin to ease, and you start seeing the fruits of your hard work.';
    }

    return {
        isPresent,
        phase,
        description,
        moonSign,
        saturnSign,
        summary: isPresent
            ? `You are currently in ${phase} of Sadesati.`
            : 'You are not currently in Sadesati period.'
    };
};

module.exports = {
    analyzePitraDosha,
    analyzeKalsarpDosha,
    analyzeSadesati
};
