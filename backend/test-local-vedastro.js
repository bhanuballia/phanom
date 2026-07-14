const axios = require('axios');

// Test Local VedAstro API
async function testLocalVedAstroAPI() {
    const VEDASTRO_API = 'http://localhost:7071/api';

    // Sample data
    const lat = 28.11;
    const lon = 79.22;
    const time = '13:40';
    const day = '02';
    const month = '04';
    const year = '1989';
    const timezoneOffset = '+05:30';
    const ayanamsa = 'LAHIRI';
    const divChart = 'NavamshaD9'; // Testing Navamsha

    const timeString = `${time}/${day}/${month}/${year}/${timezoneOffset}`;
    const locationString = `${lat},${lon}`; // Comma separated

    console.log('Testing Local VedAstro API...');

    // Test SouthIndianChart with NavamshaD9
    try {
        const testUrl = `${VEDASTRO_API}/Calculate/SouthIndianChart/Location/${locationString}/Time/${timeString}/ChartType/${divChart}/Ayanamsa/${ayanamsa}`;
        console.log(`\nTesting SouthIndianChart (${divChart}): ${testUrl}`);
        const response = await axios.get(testUrl, { timeout: 10000, responseType: 'text' });
        console.log('✅ Status:', response.status);
        console.log('Content-Type:', response.headers['content-type']);

        const data = response.data;
        if (typeof data === 'string' && data.includes('<svg')) {
            console.log('✅ Response Data looks like SVG (Success!)');
        } else {
            console.log('⚠️ Response Data is NOT SVG:', typeof data, data ? data.substring(0, 50) : 'null');
        }
    } catch (e) {
        console.error('❌ Failed:', e.message);
    }
}

testLocalVedAstroAPI();
