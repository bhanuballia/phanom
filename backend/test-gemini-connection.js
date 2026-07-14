const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGeminiConnection() {
    console.log('🧪 Testing Gemini AI Connection...\n');

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY not found in environment variables');
        return;
    }

    console.log('✅ API Key found:', apiKey.substring(0, 10) + '...');

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        console.log('📡 Sending test request to Gemini API...');

        const result = await model.generateContent('Say hello in one sentence.');
        const response = await result.response;
        const text = response.text();

        console.log('\n✅ SUCCESS! Gemini API is working!');
        console.log('Response:', text);

    } catch (error) {
        console.error('\n❌ ERROR connecting to Gemini API:');
        console.error('Error Type:', error.constructor.name);
        console.error('Error Message:', error.message);
        console.error('\nFull Error:', error);

        if (error.message.includes('fetch failed')) {
            console.log('\n💡 Troubleshooting:');
            console.log('1. Check your internet connection');
            console.log('2. Verify firewall/proxy settings');
            console.log('3. Try using a different network');
            console.log('4. Check if the API key is valid at: https://makersuite.google.com/app/apikey');
        }
    }
}

testGeminiConnection();
