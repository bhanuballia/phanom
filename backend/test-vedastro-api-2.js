const axios = require('axios');

const BASE_URL = 'https://api.vedastro.org/api';

// Base parts
const TIME_URL = 'Location/New%20Delhi/Time/12:00/01/01/2000/+05:30';
const Q = 'UserQuestion/Hello';
const U = 'UserId/101';
const S = 'SessionId/Test1';

async function test(path, name) {
    const url = `${BASE_URL}/${path}`;
    console.log(`\nTesting ${name}: ${url}`);
    try {
        const res = await axios.get(url);
        console.log(`Status: ${res.status}`);
        console.log('Response Status:', res.data.Status);
        if (res.data.Status !== 'Fail') {
            console.log('✅ SUCCESS!');
            console.log('Payload:', JSON.stringify(res.data.Payload).substring(0, 50));
        } else {
            console.log('❌ Payload:', JSON.stringify(res.data.Payload));
        }
    } catch (err) {
        console.log(`Error: ${err.message}`);
    }
}

async function run() {
    // 1. Current format (UserId then SessionId)
    await test(`HoroscopeChat/${TIME_URL}/${Q}/${U}/${S}`, "Original Order");

    // 2. Swapped (SessionId then UserId)
    await test(`HoroscopeChat/${TIME_URL}/${Q}/${S}/${U}`, "Swapped Order");

    // 3. UserQuestion as just Question?
    await test(`HoroscopeChat/${TIME_URL}/Question/Hello/${U}/${S}`, "Question instead of UserQuestion");

    // 4. Try HoroscopeChat2
    await test(`HoroscopeChat2/${TIME_URL}/${Q}/${U}/${S}`, "HoroscopeChat2");

    // 5. Try without Session/User (Optionals?)
    await test(`HoroscopeChat/${TIME_URL}/${Q}`, "Minimal");
}

run();
