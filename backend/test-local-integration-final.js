const axios = require('axios');
require('dotenv').config();

const message = "Hello";
const userContext = {
    name: "Test User",
    dob: "2000-01-01",
    tob: "12:00",
    pob: "London",
    userId: "101"
};

async function testIntegration() {
    console.log('Testing Backend -> Local VedAstro API Integration...');
    console.log('VEDASTRO_API_URL:', process.env.VEDASTRO_API_URL);

    // We can't easily call the controller directly without setting up express,
    // so we'll test the URL construction logic and a direct call to where the controller would call.

    const VEDASTRO_API_BASE = process.env.VEDASTRO_API_URL || 'http://localhost:7071';
    let url = VEDASTRO_API_BASE;
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
        url = url.replace(/\/+$/, '') + '/api/Calculate';
    }

    const timeUrl = `Location/London/Time/12:00/01/01/2000/+00:00`;
    const fullUrl = `${url}/HoroscopeChat/${timeUrl}/UserQuestion/Hello/UserId/101/SessionId/TestSession`;

    console.log('Constructed URL:', fullUrl);

    try {
        const response = await axios.get(fullUrl, { timeout: 10000 });
        console.log('✅ Response Status:', response.status);
        console.log('✅ Response Data Status:', response.data.Status);
        if (response.data.Status === 'Pass' || response.data.Status === 'Success') {
            console.log('✅ SUCCESS: Backend can reach Local VedAstro API!');
        } else {
            console.log('⚠️ API returned non-success status:', response.data.Status);
            console.log('Payload:', JSON.stringify(response.data.Payload).substring(0, 100));
        }
    } catch (error) {
        console.error('❌ Failed to connect to Local VedAstro API:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('Is the local API running on port 7071?');
        }
    }
}

testIntegration();
