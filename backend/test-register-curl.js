const axios = require('axios');

async function testRegister() {
    console.log('--- Testing Registration Endpoint ---');
    try {
        const payload = {
            name: "Test User",
            email: `test${Date.now()}@example.com`,
            password: "password123",
            phone: `+9198765${Math.floor(10000 + Math.random() * 90000)}`,
            dateOfBirth: "1990-01-01",
            timeOfBirth: "10:00",
            placeOfBirth: "Delhi"
        };

        console.log('Sending payload:', payload);

        const response = await axios.post('http://localhost:5000/api/auth/register', payload);
        console.log('✅ Registration Successful!');
        console.log('Response:', response.data);

    } catch (error) {
        console.error('❌ Registration Failed');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data); // This is what I want to see!
        } else if (error.request) {
            console.error('No response received (Server likely down or crashing):', error.message);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testRegister();
