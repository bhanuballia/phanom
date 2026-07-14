const axios = require('axios');
const fs = require('fs');

async function testPdfDasha() {
    const details = {
        name: 'Test User',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '12:00',
        placeOfBirth: 'New Delhi, India',
        coordinates: '28.6139,77.2090',
        timezone: '+05:30',
        ayanamsa: 'LAHIRI'
    };

    try {
        console.log('Generating PDF...');
        const response = await axios.post('http://localhost:5000/api/kundali/generate-pdf', details, {
            responseType: 'arraybuffer',
            timeout: 120000 // 2 minutes
        });

        fs.writeFileSync('test_kundali.pdf', response.data);
        console.log('PDF generated: test_kundali.pdf');
    } catch (err) {
        console.error('Error generating PDF:', err.message);
        if (err.response) {
            console.error('Response:', err.response.data.toString());
        }
    }
}

testPdfDasha();
