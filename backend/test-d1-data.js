const axios = require('axios');

const VEDASTRO_API = 'https://api.vedastro.org';
const timeString = '13:40/02/04/1989/+05:30';
const locationString = '28.11,79.22';
const ayanamsa = 'LAHIRI';

async function testAllPlanetDataCheck() {
    const url = `${VEDASTRO_API}/api/Calculate/AllPlanetData/PlanetName/All/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}`;
    console.log(`URL: ${url}`);

    try {
        const response = await axios.get(url, { timeout: 15000 });
        const payload = response.data.Payload || response.data;
        const planets = payload.AllPlanetData || payload;

        const sun = planets.Sun || (Array.isArray(planets) ? planets.find(p => p.Sun)?.Sun : null);
        if (sun) {
            console.log('Keys in Sun data:', Object.keys(sun).filter(k => k.includes('Sign') || k.includes('D')));
        }
    } catch (err) {
        console.log(`Failed: ${err.message}`);
    }
}

testAllPlanetDataCheck();
