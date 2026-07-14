const axios = require('axios');

async function testSimpleAPI() {
    const VEDASTRO_API = 'http://localhost:7071';
    const locationString = '28.6139,77.2090';
    const timeString = '12:00/01/01/1990/+05:30';
    const ayanamsa = 'LAHIRI';
    const url = `${VEDASTRO_API}/api/Calculate/LunarDay/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}`;

    console.log(`Checking Simple URL: ${url}`);
    try {
        const response = await axios.get(url);
        console.log('--- Simple Response ---');
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error fetching tithi:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
    }
}

testSimpleAPI();
