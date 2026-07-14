const axios = require('axios');

const VEDASTRO_API = 'https://api.vedastro.org';
const timeString = '13:40/02/04/1989/+05:30';
const locationString = '28.11,79.22';
const ayanamsa = 'LAHIRI';

async function testDivisionalData() {
    const chart = 'NavamshaD9';
    const url = `${VEDASTRO_API}/api/Calculate/AllPlanetData/PlanetName/All/Location/${locationString}/Time/${timeString}/ChartType/${chart}/Ayanamsa/${ayanamsa}`;
    console.log(`Testing URL for ${chart}: ${url}`);

    try {
        const response = await axios.get(url, { timeout: 15000 });
        const payload = response.data.Payload || response.data;

        // Deep inspection of AllPlanetData
        const data = payload.AllPlanetData || payload;
        console.log('Data Type:', typeof data);
        if (Array.isArray(data)) {
            console.log('Data is Array. Length:', data.length);
            console.log('First Item:', JSON.stringify(data[0], null, 2));
        } else if (data && typeof data === 'object') {
            console.log('Data is Object. Keys:', Object.keys(data));
            if (data.Sun) {
                console.log('Sun Data:', JSON.stringify(data.Sun, null, 2));
            } else {
                // Check if it's nested even further or has different keys
                const firstKey = Object.keys(data)[0];
                console.log(`First key in data: ${firstKey}`);
                console.log(`Value of ${firstKey}:`, JSON.stringify(data[firstKey], null, 2));
            }
        } else {
            console.log('Unexpected Data structure:', data);
        }
    } catch (err) {
        console.log(`Failed for ${chart}: ${err.message}`);
    }
}

testDivisionalData();
