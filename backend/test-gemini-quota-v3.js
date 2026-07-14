require('dotenv').config();
const axios = require('axios');

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyBOZk3dJZDfQuNbumue5o85RzTKBIJzIjc';
    const models = [
        'gemini-flash-latest',
        'gemini-flash-lite-latest',
        'gemini-2.0-flash',
        'gemini-2.5-flash'
    ];

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
            if (error.response?.data?.error?.message) {
                console.error(`Reason: ${error.response.data.error.message.substring(0, 200)}...`);
            }
        }
    }
}

testGemini();
