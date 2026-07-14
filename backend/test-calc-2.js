const axios = require('axios');
const BASE_URL = 'https://api.vedastro.org/api/Calculate';
const TIME_URL = 'Location/New%20Delhi/Time/12:00/01/01/2000/+05:30';

async function test(path) {
    const url = `${BASE_URL}/${path}`;
    console.log(`Testing: ${url}`);
    try {
        const res = await axios.get(url);
        console.log(`Status: ${res.status}`);
        if (res.data.Status === "Fail") {
            console.log('Payload:', JSON.stringify(res.data.Payload));
        } else {
            console.log('SUCCESS Payload:', JSON.stringify(res.data.Payload).substring(0, 100));
        }
    } catch (err) {
        console.log(`Error: ${err.message}`);
    }
}

async function run() {
    // 1. SunSign (Calculator)
    await test(`SunSign/${TIME_URL}`);

    // 2. AllPlanetData (Calculator)
    await test(`AllPlanetData/PlanetName/Sun/${TIME_URL}`);

    // 3. HoroscopeChat
    await test(`HoroscopeChat/${TIME_URL}/UserQuestion/Hello/UserId/101/SessionId/Test1`);
}
run();
