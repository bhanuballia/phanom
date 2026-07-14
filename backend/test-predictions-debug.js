const axios = require('axios');

async function testPredictions() {
    const VEDASTRO_API = 'http://localhost:7071/api';
    const lat = 25.8750;
    const lon = 84.1210;
    const time = '13:40';
    const day = '02';
    const month = '04';
    const year = '1987';
    const timezoneOffset = '+05:30';
    const ayanamsa = 'LAHIRI';

    const timeString = `${time}/${day}/${month}/${year}/${timezoneOffset}`;
    const locationString = `${lat},${lon}`;

    const url = `${VEDASTRO_API}/Calculate/HoroscopePredictions/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}`;
    console.log(`Testing URL: ${url}`);

    try {
        const response = await axios.get(url);
        console.log('Status:', response.status);
        console.log('Data Type:', typeof response.data);
        console.log('Payload:', JSON.stringify(response.data.Payload || response.data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
    }
}

testPredictions();
