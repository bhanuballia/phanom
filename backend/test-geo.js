const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/geo';

const testGeo = async () => {
    console.log('--- Testing Geo API ---');

    // 1. Search for a place
    try {
        const city = 'London';
        console.log(`Searching for: ${city}`);
        const searchRes = await axios.get(`${BASE_URL}/search?q=${city}`);
        console.log('Status:', searchRes.status);

        if (searchRes.data.results && searchRes.data.results.length > 0) {
            const firstResult = searchRes.data.results[0];
            console.log('✅ Found Place:', firstResult.display_name);
            console.log('   Lat:', firstResult.latitude);
            console.log('   Lon:', firstResult.longitude);

            // 2. Get Timezone
            console.log('\nFetching Timezone...');
            const tzRes = await axios.get(`${BASE_URL}/timezone?lat=${firstResult.latitude}&lon=${firstResult.longitude}`);
            console.log('✅ Timezone:', tzRes.data.timezone);
            console.log('   Offset:', tzRes.data.offset);
        } else {
            console.log('❌ No results found (might be rate limited or blocked)');
        }

    } catch (error) {
        console.error('❌ Error:', error.response ? error.response.data : error.message);
    }
};

testGeo();
