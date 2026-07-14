const axios = require('axios');

async function testDashaApi() {
    const VEDASTRO_API = 'http://localhost:7071';
    const locationString = '28.6139,77.2090'; // New Delhi
    const timeString = '12:00/01/01/1990/+05:30';
    const ayanamsa = 'LAHIRI';

    // Verify Dasha with high precision hours (fewer checks)
    const dashaUrl = `${VEDASTRO_API}/api/Calculate/DasaForLife/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}/Levels/1/ScanYears/120/PrecisionHours/2000`;

    console.log(`Calling Dasha API: ${dashaUrl}`);

    try {
        const response = await axios.get(dashaUrl, { timeout: 60000 });
        console.log('✅ Response Status:', response.status);

        let data = response.data.Payload || response.data;

        console.log('📦 Data Received Type:', typeof data);
        if (typeof data === 'object') {
            console.log('📦 keys:', Object.keys(data));
            if (Array.isArray(data)) {
                console.log('📦 Array Length:', data.length);
                if (data.length > 0) console.log('📦 First Item:', JSON.stringify(data[0], null, 2));
            } else {
                console.log('📦 Structure:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
            }
        } else {
            console.log('📦 Content:', data);
        }

    } catch (error) {
        console.error('❌ API Error Message:', error.message);
        console.error('❌ Full Error Code:', error.code);
        if (error.response) {
            console.error('❌ Status:', error.response.status);
            console.error('❌ Data:', error.response.data);
        }
    }
}

testDashaApi();
