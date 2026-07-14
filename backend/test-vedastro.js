const axios = require('axios');

// Test VedAstro API
async function testVedAstroAPI() {
    const VEDASTRO_API = 'https://vedastroapi.azurewebsites.net/api';

    // Sample data
    const lat = 28.7041;
    const lon = 77.1025;
    const time = '12:00';
    const day = '15';
    const month = '08';
    const year = '1990';
    const timezoneOffset = '+05:30';

    const timeString = `${time}/${day}/${month}/${year}/${timezoneOffset}`;
    const locationString = `${lat}/${lon}`;

    console.log('Testing VedAstro API...');
    console.log('Time String:', timeString);
    console.log('Location String:', locationString);
    console.log('');

    const testUrl = `${VEDASTRO_API}/Calculate/AllPlanetData/Location/${locationString}/Time/${timeString}`;
    console.log('Test URL:', testUrl);
    console.log('');

    try {
        console.log('Making request...');
        const response = await axios.get(testUrl, { timeout: 30000 });
        console.log('✅ SUCCESS!');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('❌ ERROR!');
        console.error('Message:', error.message);
        console.error('Status:', error.response?.status);
        console.error('Status Text:', error.response?.statusText);
        console.error('Response Data:', JSON.stringify(error.response?.data, null, 2));
        console.error('');
        console.error('Full Error:', error);
    }
}

testVedAstroAPI();
