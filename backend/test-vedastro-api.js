const axios = require('axios');

// We suspect the correct base might be /api/Calculate or just /api
const BASE_URL_1 = 'https://api.vedastro.org/api';
const BASE_URL_2 = 'https://api.vedastro.org/api/Calculate';

// Sample Call Params
// Format: Location/New Delh/Time/12:00/01/01/2000/+05:30/UserQuestion/Hello/UserId/101/SessionId/Test1
const SAMPLE_PATH = 'HoroscopeChat/Location/New%20Delhi/Time/12:00/01/01/2000/+05:30/UserQuestion/Hello/UserId/101/SessionId/Test1';

async function testUrl(baseUrl, label) {
    const fullUrl = `${baseUrl}/${SAMPLE_PATH}`;
    console.log(`\nTesting ${label}: ${fullUrl}`);
    try {
        const res = await axios.get(fullUrl);
        console.log(`Status: ${res.status}`);
        console.log('Response Status Field:', res.data.Status);
        if (res.data.Status === "Fail") {
            console.log('Payload:', JSON.stringify(res.data.Payload, null, 2));
        } else {
            console.log('Success! Payload Preview:', JSON.stringify(res.data.Payload).substring(0, 100));
        }
    } catch (err) {
        console.log(`Error: ${err.message}`);
        if (err.response) {
            console.log('Response Data:', err.response.data);
        }
    }
}

async function run() {
    await testUrl(BASE_URL_1, "Base /api");
    await testUrl(BASE_URL_2, "Base /api/Calculate");
}

run();
