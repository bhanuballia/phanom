const axios = require('axios');

async function testEndpoints() {
    const VEDASTRO_API = 'http://localhost:7071/api/Calculate';
    const location = '28.11,79.22';
    const time = '13:40/02/04/1989/+05:30';

    const endpoints = [
        'IsManglik',
        'MangalDosha',
        'SadeSati',
        'SadeSatiReport',
        'HoroscopePredictions',
        'DasaForLife'
    ];

    for (const ep of endpoints) {
        const url = `${VEDASTRO_API}/${ep}/Location/${location}/Time/${time}/Ayanamsa/LAHIRI`;
        console.log(`Checking ${ep}...`);
        try {
            const res = await axios.get(url);
            console.log(`✅ ${ep}: Success!`);
            // console.log(JSON.stringify(res.data.Payload).substring(0, 100));
        } catch (e) {
            console.log(`❌ ${ep}: Failed - ${e.message}`);
        }
    }
}

testEndpoints();
