const axios = require('axios');

// Test Node.js Backend Integration with VedAstro
async function testBackendIntegration() {
    const BACKEND_URL = 'http://localhost:5000/api/kundali/generate-vedastro';

    const payload = {
        name: "Test User",
        dateOfBirth: "1990-08-15",
        timeOfBirth: "12:00",
        country: "India",
        state: "Delhi",
        placeOfBirth: "New Delhi",
        coordinates: "28.7041, 77.1025",
        timezone: "Asia/Kolkata",
        chartStyle: "SouthIndian",
        divisionalChartType: "RasiD1"
    };

    console.log('Testing Backend Integration...');
    console.log('Target URL:', BACKEND_URL);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    try {
        const response = await axios.post(BACKEND_URL, payload, { timeout: 30000 });
        console.log('\n✅ Backend Response Success!');
        console.log('Status:', response.status);

        const data = response.data;
        console.log('Success Flag:', data.success);
        console.log('Message:', data.message);

        // Check Critical Data
        console.log('\n--- Data verification ---');
        console.log('Has Planetary Positions:', data.planetaryPositions && data.planetaryPositions.length > 0 ? 'YES' : 'NO');
        if (data.planetaryPositions && data.planetaryPositions.length > 0) {
            console.log('Sample Planet:', data.planetaryPositions[0]);
        }

        console.log('Has Chart SVG:', data.chartSvg ? 'YES' : 'NO');
        if (data.chartSvg) {
            console.log('Chart SVG starts with:', data.chartSvg.substring(0, 50));
        } else {
            console.warn('⚠️ Chart SVG is missing in backend response!');
        }

        console.log('Has Kundali Text:', data.kundali ? 'YES' : 'NO');

    } catch (error) {
        console.error('\n❌ Backend Test Failed!');
        console.error('Message:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.code === 'ECONNREFUSED') {
            console.error('Connection refused! Is the Node.js backend running on port 5000?');
        }
    }
}

testBackendIntegration();
