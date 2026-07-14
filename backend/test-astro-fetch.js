const axios = require('axios');
require('dotenv').config();

const parseVedAstroTime = (dateOfBirth, timeOfBirth, timezone = 'Asia/Kolkata') => {
    const dob = new Date(dateOfBirth);
    const [hours, minutes] = timeOfBirth.split(':');
    const day = dob.getDate();
    const month = dob.getMonth() + 1;
    const year = dob.getFullYear();
    const timezoneOffset = '+05:30';
    return `${hours}:${minutes}/${day}/${month}/${year}/${timezoneOffset}`;
};

const fetchComprehensiveAstroData = async (details) => {
    const { dateOfBirth, timeOfBirth, coordinates, timezone } = details;
    const VEDASTRO_API = process.env.VEDASTRO_API_URL || 'http://localhost:7071';
    const apiBase = VEDASTRO_API.endsWith('/api') ? VEDASTRO_API : `${VEDASTRO_API}/api`;
    const baseUrl = `${apiBase}/Calculate`;

    const timeString = parseVedAstroTime(dateOfBirth, timeOfBirth, timezone);
    const locationString = coordinates || '28.11,79.22';
    const ayanamsa = 'LAHIRI';

    const divisionalCharts = [
        'RasiD1', 'HoraD2', 'DrekkanaD3', 'ChaturthamsaD4', 'SaptamsaD7',
        'NavamshaD9', 'DashamamsaD10', 'DwadamshaD12', 'ShodashamshaD16',
        'VimshamshaD20', 'ChathurvimshamshaD24', 'SaptavimshamshaD27',
        'TrimshamshaD30', 'KhavedamshaD40', 'AkshavedamshaD45', 'ShashtiamshaD60'
    ];

    const planetsForAshtakvarga = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

    const requests = {
        tithi: `${baseUrl}/LunarDay/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}`,
        planets: `${baseUrl}/AllPlanetData/PlanetName/All/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}`,
        sarvashtakvarga: `${baseUrl}/BhinnashtakavargaChart/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}`
    };

    divisionalCharts.forEach(type => {
        requests[`${type}_North`] = `${baseUrl}/NorthIndianChart/Location/${locationString}/Time/${timeString}/ChartType/${type}/Ayanamsa/${ayanamsa}`;
    });

    const results = {};
    const entries = Object.entries(requests);
    console.log(`🚀 Starting test fetch for ${entries.length} items...`);

    for (const [key, url] of entries) {
        try {
            const response = await axios.get(url, { timeout: 10000 });
            results[key] = response.data.Payload || response.data;
            console.log(`✅ ${key}: ${typeof results[key] === 'string' ? 'SVG (' + results[key].length + ' bytes)' : 'Object'}`);
        } catch (err) {
            console.log(`❌ ${key}: FAILED - ${err.message}`);
        }
    }
    return results;
};

fetchComprehensiveAstroData({
    dateOfBirth: "1989-04-02",
    timeOfBirth: "13:40",
    placeOfBirth: "Ballia, UP",
    coordinates: "28.11,79.22",
    timezone: "Asia/Kolkata"
});
