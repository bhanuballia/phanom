const axios = require('axios');
const fs = require('fs');

async function testLifePredictionsPDF() {
    const testData = {
        name: 'Bhanu Pratap Singh',
        dateOfBirth: '1987-04-02',
        timeOfBirth: '13:40',
        placeOfBirth: 'Ballia, Uttar Pradesh',
        gender: 'Male',
        coordinates: '25.8750,84.1210',
        timezone: 'Asia/Kolkata'
    };

    console.log('🧪 Testing PDF Generation with Life Predictions...\n');
    console.log('Request Data:', JSON.stringify(testData, null, 2));

    try {
        console.log('\n📄 Generating PDF with comprehensive Life Predictions...');

        const response = await axios.post('http://localhost:5000/api/kundali/generate-pdf', testData, {
            responseType: 'arraybuffer',
            timeout: 300000, // 5 minutes for AI generation
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const filename = `Kundali_${testData.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
        fs.writeFileSync(filename, response.data);

        console.log('\n✅ SUCCESS! PDF generated with Life Predictions!');
        console.log(`📁 File saved as: ${filename}`);
        console.log(`📊 File size: ${(response.data.length / 1024).toFixed(2)} KB`);

    } catch (error) {
        console.error('\n❌ ERROR during PDF generation!\n');

        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Headers:', error.response.headers);
            if (error.response.data) {
                try {
                    const errorText = Buffer.from(error.response.data).toString('utf-8');
                    console.error('Error Message:', errorText);
                } catch (e) {
                    console.error('Could not parse error response');
                }
            }
        } else if (error.request) {
            console.error('No response received from server');
            console.error('Error:', error.message);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testLifePredictionsPDF();
