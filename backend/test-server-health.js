const axios = require('axios');

async function testHealth() {
    console.log('--- Testing Server Health ---');
    try {
        // Try a simple GET endpoint that doesn't require DB write (usually)
        // admin stats might be protected?
        // Let's try to get astrologers list (public)
        const response = await axios.get('http://localhost:5000/api/auth/astrologers');
        console.log('✅ Server is UP. Status:', response.status);
        console.log('Data length:', response.data.length);
    } catch (error) {
        console.error('❌ Server Health Check Failed');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testHealth();
