const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGemini() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error('❌ No GEMINI_API_KEY found in .env');
        return;
    }

    console.log('🔑 Using Key:', key.substring(0, 8) + '...');

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    try {
        console.log('📡 Sending test prompt...');
        const result = await model.generateContent('Say "Gemini is working!"');
        const response = await result.response;
        console.log('✅ Response:', response.text());
    } catch (err) {
        console.error('❌ Gemini Error:', err.message);
        if (err.message.includes('429')) {
            console.error('💡 Recommendation: Your API key has hit the rate limit. Please wait or use a different key.');
        }
    }
}

testGemini();
