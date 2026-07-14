const axios = require('axios');

async function testVedAstroAPIDirect() {
    const VEDASTRO_API = 'http://localhost:7071/api';

    // Test data
    const lat = 25.875;
    const lon = 84.121;
    const time = '13:40';
    const day = '02';
    const month = '04';
    const year = '1987';
    const timezoneOffset = '+05:30';
    const ayanamsa = 'LAHIRI';

    const timeString = `${time}/${day}/${month}/${year}/${timezoneOffset}`;
    const locationString = `${lat},${lon}`;

    console.log('🧪 Testing VedAstro API Endpoints Directly...\n');
    console.log('Time String:', timeString);
    console.log('Location String:', locationString);
    console.log('Ayanamsa:', ayanamsa);
    console.log('\n' + '='.repeat(80) + '\n');

    // Test 1: AllPlanetData
    try {
        const planetUrl = `${VEDASTRO_API}/Calculate/AllPlanetData/PlanetName/All/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}`;
        console.log('1️⃣ Testing AllPlanetData:');
        console.log('URL:', planetUrl);

        const response = await axios.get(planetUrl, { timeout: 10000 });
        console.log('✅ Status:', response.status);
        console.log('Response Type:', typeof response.data);

        if (response.data && response.data.Payload) {
            console.log('✅ Payload received');
            if (Array.isArray(response.data.Payload)) {
                console.log('   Payload is Array with', response.data.Payload.length, 'items');
                console.log('   First item structure:', JSON.stringify(response.data.Payload[0], null, 2));
            } else {
                console.log('   Payload Keys:', Object.keys(response.data.Payload).slice(0, 5).join(', '), '...');
            }
        } else {
            console.log('⚠️ No Payload in response');
            console.log('Response:', JSON.stringify(response.data).substring(0, 200));
        }
    } catch (error) {
        console.error('❌ AllPlanetData failed:', error.message);
        if (error.response) {
            console.error('   Response:', JSON.stringify(error.response.data).substring(0, 200));
        }
    }

    console.log('\n' + '='.repeat(80) + '\n');

    // Test 2: MoonSign
    try {
        const moonSignUrl = `${VEDASTRO_API}/Calculate/MoonSign/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}`;
        console.log('2️⃣ Testing MoonSign:');
        console.log('URL:', moonSignUrl);

        const response = await axios.get(moonSignUrl, { timeout: 10000 });
        console.log('✅ Status:', response.status);
        console.log('Response:', JSON.stringify(response.data).substring(0, 200));
    } catch (error) {
        console.error('❌ MoonSign failed:', error.message);
        if (error.response) {
            console.error('   Response:', JSON.stringify(error.response.data).substring(0, 200));
        }
    }

    console.log('\n' + '='.repeat(80) + '\n');

    // Test 3: MoonConstellation (Nakshatra)
    try {
        const nakshatraUrl = `${VEDASTRO_API}/Calculate/MoonConstellation/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}`;
        console.log('3️⃣ Testing MoonConstellation:');
        console.log('URL:', nakshatraUrl);

        const response = await axios.get(nakshatraUrl, { timeout: 10000 });
        console.log('✅ Status:', response.status);
        console.log('Response:', JSON.stringify(response.data).substring(0, 200));
    } catch (error) {
        console.error('❌ MoonConstellation failed:', error.message);
        if (error.response) {
            console.error('   Response:', JSON.stringify(error.response.data).substring(0, 200));
        }
    }

    console.log('\n' + '='.repeat(80) + '\n');

    // Test 4: NorthIndianChart
    try {
        const chartUrl = `${VEDASTRO_API}/Calculate/NorthIndianChart/Location/${locationString}/Time/${timeString}/ChartType/RasiD1/Ayanamsa/${ayanamsa}`;
        console.log('4️⃣ Testing NorthIndianChart:');
        console.log('URL:', chartUrl);

        const response = await axios.get(chartUrl, { timeout: 10000, responseType: 'text' });
        console.log('✅ Status:', response.status);
        console.log('Content-Type:', response.headers['content-type']);

        if (typeof response.data === 'string' && response.data.includes('<svg')) {
            console.log('✅ SVG Chart received (length:', response.data.length, 'chars)');
            console.log('   Content:', response.data);
        } else {
            console.log('⚠️ Response is not SVG');
            console.log('Response:', JSON.stringify(response.data).substring(0, 200));
        }
    } catch (error) {
        console.error('❌ NorthIndianChart failed:', error.message);
        if (error.response) {
            console.error('   Response:', typeof error.response.data === 'string' ? error.response.data.substring(0, 200) : JSON.stringify(error.response.data).substring(0, 200));
        }
    }

    console.log('\n' + '='.repeat(80) + '\n');

    // Test 5: SarvashtakavargaChart
    try {
        const ashtakUrl = `${VEDASTRO_API}/Calculate/SarvashtakavargaChart/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}`;
        console.log('5️⃣ Testing SarvashtakavargaChart:');
        console.log('URL:', ashtakUrl);

        const response = await axios.get(ashtakUrl, { timeout: 10000 });
        console.log('✅ Status:', response.status);
        if (response.data && response.data.Payload) {
            console.log('✅ Payload received for Sarvashtakavarga');
            console.log('   Payload:', JSON.stringify(response.data.Payload).substring(0, 300) + '...');
        } else {
            console.log('⚠️ No Payload in Sarvashtakavarga response');
            console.log('   Response:', JSON.stringify(response.data).substring(0, 200));
        }
    } catch (error) {
        console.error('❌ SarvashtakavargaChart failed:', error.message);
    }

    console.log('\n' + '='.repeat(80) + '\n');

    // Test 6: BhinnashtakavargaChart
    try {
        const bhinnaUrl = `${VEDASTRO_API}/Calculate/BhinnashtakavargaChart/PlanetName/Sun/Location/${locationString}/Time/${timeString}/Ayanamsa/${ayanamsa}`;
        console.log('6️⃣ Testing BhinnashtakavargaChart (Sun):');
        console.log('URL:', bhinnaUrl);

        const response = await axios.get(bhinnaUrl, { timeout: 10000 });
        console.log('✅ Status:', response.status);
        if (response.data && response.data.Payload) {
            console.log('✅ Payload received for Bhinnashtakavarga (Sun)');
            console.log('   Payload:', JSON.stringify(response.data.Payload));
        } else {
            console.log('⚠️ No Payload in Bhinnashtakavarga response');
        }
    } catch (error) {
        console.error('❌ BhinnashtakavargaChart failed:', error.message);
    }
}

testVedAstroAPIDirect();
