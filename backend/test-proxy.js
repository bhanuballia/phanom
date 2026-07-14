const axios = require('axios');

async function test() {
    console.log('--- Testing VedAstro Proxy ---');
    try {
        const url = 'http://localhost:5000/api/chatbot/vedastro-proxy/HoroscopeChat/Location/Ballia/Time/13:50/10/09/2000/%2b05:30/UserQuestion/Tell%20me%20about%20my%20career/UserId/tester/SessionId/sess_' + Date.now();
        console.log('Calling:', url);
        const response = await axios.get(url, { timeout: 60000 });
        console.log('Status:', response.data.Status);
        console.log('Payload Text:', response.data.Payload.Text);
    } catch (error) {
        if (error.response) {
            console.error('Error Status:', error.response.status);
            console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

test();
