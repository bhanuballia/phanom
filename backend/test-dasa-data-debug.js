const axios = require('axios');

async function testDasaData() {
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

    const url = `${VEDASTRO_API}/Calculate/DasaForLife/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}/Levels/1`;
    console.log(`Testing URL: ${url}`);

    try {
        const response = await axios.get(url);
        console.log('Status:', response.status);
        const data = response.data.Payload || response.data;
        console.log('Is Array?', Array.isArray(data));
        if (Array.isArray(data)) {
            console.log('First 2 items keys:', data.map(d => Object.keys(d)));
        } else {
            console.log('Keys:', Object.keys(data));
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testDasaData();
