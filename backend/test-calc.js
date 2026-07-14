const axios = require('axios');
const BASE_URL = 'https://api.vedastro.org/api';
// Location/New Delhi/Time/12:00/01/01/2000/+05:30
const TIME_URL = 'Location/New%20Delhi/Time/12:00/01/01/2000/+05:30';

async function run() {
    // Test a basic calculation that definitely exists
    const url = `${BASE_URL}/SunSign/${TIME_URL}`;
    console.log(`Testing: ${url}`);

    try {
        const res = await axios.get(url);
        console.log(`Status: ${res.status}`);
        console.log('Payload:', JSON.stringify(res.data));
    } catch (err) {
        console.log(`Error: ${err.message}`);
        if (err.response) console.log(err.response.data);
    }
}
run();
