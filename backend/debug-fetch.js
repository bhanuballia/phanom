const axios = require('axios');
const baseUrl = 'http://localhost:7071/api/Calculate';
const timeString = '13:40/02/04/1989/+05:30';
const locationString = '28.11,79.22';
const ayanamsa = 'LAHIRI';

async function debugFetch() {
    const dashaUrl = `${baseUrl}/DasaForLife/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}/Levels/2`;
    try {
        const response = await axios.get(dashaUrl);
        console.log('Raw Data Type:', typeof response.data);
        console.log('Raw Data Sample:', JSON.stringify(response.data).substring(0, 500));

        // Check if it's double-encoded if it's a string
        if (typeof response.data === 'string' && (response.data.startsWith('[') || response.data.startsWith('{'))) {
            try {
                const parsed = JSON.parse(response.data);
                console.log('Parsed Data is Array:', Array.isArray(parsed));
            } catch (e) {
                console.log('Not valid JSON string');
            }
        }
    } catch (err) {
        console.log('Error:', err.message);
    }
}
debugFetch();
