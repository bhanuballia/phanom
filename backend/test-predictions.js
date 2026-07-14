const axios = require('axios');

async function testPredictions() {
    const baseUrl = 'http://localhost:7071/api/Calculate';
    const person = {
        date: '1989-02-04',
        time: '13:40',
        location: '28.11,79.22', // Sample location
        timezone: '+05:30'
    };

    const timeUrl = `${person.time}/${person.date.split('-').reverse().join('/')}/${person.timezone}`;
    const url = `${baseUrl}/HoroscopePredictions/Location/${person.location}/Time/${timeUrl}/Ayanamsa/LAHIRI`;

    console.log(`Calling: ${url}`);
    try {
        const response = await axios.get(url);
        console.log('Predictions:', JSON.stringify(response.data.Payload, null, 2).substring(0, 2000));
    } catch (err) {
        console.error(err.message);
    }
}

testPredictions();
