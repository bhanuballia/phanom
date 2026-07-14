const axios = require('axios');

async function testDashaAPI() {
    const VEDASTRO_API = 'http://localhost:7071';
    const locationString = '28.6139,77.2090';
    const timeString = '12:00/01/01/1990/+05:30';
    const ayanamsa = 'LAHIRI';
    // Deep test: Level 4, 120 years, but with a HUGE timeout
    const url = `${VEDASTRO_API}/api/Calculate/DasaForLife/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}/Levels/1/scanYears/10`;

    console.log(`Checking Dasha URL: ${url}`);
    console.log('This might take a few minutes. Please wait...');
    try {
        const response = await axios.get(url, { timeout: 600000 }); // 10 minutes
        console.log('--- Dasha Response Received ---');
        console.log('Status:', response.status);
        console.log('Data length:', JSON.stringify(response.data).length);
        console.log('Preview:', JSON.stringify(response.data, null, 2).substring(0, 1000));
    } catch (error) {
        if (error.response) {
            console.error('Error fetching dasha:', error.response.status, error.response.data);
        } else {
            console.error('Error fetching dasha:', error.message);
        }
    }
}

testDashaAPI();
