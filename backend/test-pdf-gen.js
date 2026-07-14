const axios = require('axios');
const fs = require('fs');

async function testPDFGeneration() {
    const BACKEND_URL = 'http://localhost:5000/api/kundali/generate-pdf';
    const payload = {
        name: "भानु प्रताप (Bhanu Pratap)",
        dateOfBirth: "1989-04-02",
        timeOfBirth: "13:40",
        placeOfBirth: "Ballia, UP",
        coordinates: "28.11,79.22",
        timezone: "Asia/Kolkata"
    };

    console.log('Testing Enhanced PDF Generation...');
    try {
        const response = await axios.post(BACKEND_URL, payload, {
            responseType: 'arraybuffer',
            timeout: 300000
        });

        const fileName = `Kundali_Test_${Date.now()}.pdf`;
        fs.writeFileSync(fileName, response.data);
        console.log(`✅ Success! PDF saved as ${fileName}`);
        console.log(`Size: ${(response.data.length / 1024).toFixed(2)} KB`);
    } catch (e) {
        console.error('❌ Failed:', e.message);
        if (e.response && e.response.data) {
            console.log('Error Data:', Buffer.from(e.response.data).toString());
        }
    }
}

testPDFGeneration();
