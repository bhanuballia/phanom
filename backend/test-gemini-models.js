const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error('❌ No GEMINI_API_KEY found');
        return;
    }

    const genAI = new GoogleGenerativeAI(key);

    try {
        // We can't easily list models with the SDK without a helper, 
        // but we can try to use gemini-pro instead to see if it works.
        console.log('📡 Testing gemini-1.5-flash-latest...');
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
        const result = await model.generateContent('hi');
        console.log('✅ gemini-1.5-flash-latest works!');
    } catch (err) {
        console.error('❌ gemini-1.5-flash-latest failed:', err.message);

        try {
            console.log('📡 Testing gemini-pro...');
            const modelPro = genAI.getGenerativeModel({ model: 'gemini-pro' });
            const resultPro = await modelPro.generateContent('hi');
            console.log('✅ gemini-pro works!');
        } catch (err2) {
            console.error('❌ gemini-pro failed:', err2.message);
        }
    }
}

listModels();
