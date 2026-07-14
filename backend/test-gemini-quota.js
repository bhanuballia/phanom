require('dotenv').config();
const axios = require('axios');

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyBOZk3dJZDfQuNbumue5o85RzTKBIJzIjc';
    const models = [
        'gemini-2.0-flash-exp',
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-1.5-pro'
    ];

    console.log(`Using API Key: ${apiKey.substring(0, 10)}...`);

    for (const model of models) {
        console.log(`\n--- Testing Model: ${model} ---`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        try {
            const response = await axios.post(url, {
                contents: [{
                    parts: [{ text: "Hello, this is a test. Reply with 'OK'." }]
                }]
            }, { timeout: 10000 });

            console.log(`[PASS] ${model} responded:`, response.data?.candidates?.[0]?.content?.parts?.[0]?.text);
        } catch (error) {
            console.error(`[FAIL] ${model}: Status ${error.response?.status}`);
            console.error(`Error details:`, JSON.stringify(error.response?.data || error.message, null, 2));
        }
    }
}

testGemini();
