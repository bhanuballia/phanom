const axios = require('axios');

async function testKundaliGeneration() {
    const testData = {
        name: 'Bhanu Pratap Singh',
        dateOfBirth: '1987-04-02',
        country: 'india',
        state: 'uttar pradesh',
        placeOfBirth: 'Ballia',
        timeOfBirth: '13:40',
        coordinates: '25.8750, 84.1210',
        timezone: 'Asia/Kolkata',
        email: 'bhanu361@gmail.com',
        phoneNumber: '9898009898',
        chartStyle: 'NorthIndian',
        divisionalChartType: 'RasiD1'
    };

    console.log('🧪 Testing Kundali Generation...\n');
    console.log('Request Data:', JSON.stringify(testData, null, 2));

    try {
        const response = await axios.post('http://localhost:5000/api/kundali/generate-vedastro', testData, {
            timeout: 150000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('\n✅ SUCCESS! Kundali generated successfully!\n');
        console.log('Response Status:', response.status);
        console.log('Response Data Keys:', Object.keys(response.data));

        if (response.data.success) {
            console.log('\n✅ Success:', response.data.message);
            console.log('📊 Planetary Positions:', response.data.planetaryPositions?.length || 0, 'planets');
            console.log('🏠 Lagna Chart Houses:', response.data.lagnaChart?.length || 0, 'houses');
            console.log('🌙 Moon Sign:', response.data.moonSign);
            console.log('⭐ Nakshatra:', response.data.nakshatra);
            console.log('📈 Ascendant:', response.data.ascendant);
            console.log('🎨 Chart SVG:', response.data.chartSvg ? 'Available ✅' : 'Not Available ❌');
        } else {
            console.log('\n⚠️ Request completed but success=false');
            console.log('Message:', response.data.message);
        }

    } catch (error) {
        console.error('\n❌ ERROR during Kundali generation!\n');

        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error('No response received from server');
            console.error('Error:', error.message);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testKundaliGeneration();
