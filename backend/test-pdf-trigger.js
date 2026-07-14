const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function testPDFGeneration() {
    const testData = {
        name: "Devesh Singh",
        dateOfBirth: "1995-10-15",
        timeOfBirth: "14:30",
        placeOfBirth: "Bareilly, Uttar Pradesh",
        gender: "Male",
        coordinates: "28.3670,79.4304",
        timezone: "Asia/Kolkata"
    };

    console.log('🚀 Triggering PDF Generation...');
    console.log('📊 Test Data:', JSON.stringify(testData, null, 2));

    try {
        // We use the full internal path/method if we can't call the API directly
        // But since we have a server.js, we should try to call the local endpoint if the server is running
        // If server is not running, we might need a standalone script that imports the controller

        const response = await axios.post('http://localhost:5000/api/kundali/generate-pdf', testData, {
            responseType: 'arraybuffer',
            timeout: 300000 // 5 minutes timeout for the massive 50-page report
        });

        const fileName = `Test_Report_${Date.now()}.pdf`;
        const filePath = path.join(__dirname, fileName);
        fs.writeFileSync(filePath, response.data);

        console.log(`✅ Success! PDF saved to: ${filePath}`);
        console.log(`📏 File size: ${(response.data.length / 1024 / 1024).toFixed(2)} MB`);
    } catch (err) {
        console.error('❌ PDF Generation Failed:', err.message);
        if (err.code === 'ECONNREFUSED') {
            console.error('💡 Error: Backend server is not running on port 5000.');
            console.error('Please start it with: cd backend && npm start');
        } else if (err.response) {
            const errorText = Buffer.from(err.response.data).toString();
            console.error('Server Response:', errorText);
        }
    }
}

testPDFGeneration();
