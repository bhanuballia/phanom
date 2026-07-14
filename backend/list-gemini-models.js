const axios = require('axios');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error('❌ Missing GEMINI_API_KEY in .env');
    process.exit(1);
}

async function listModels() {
    try {
        console.log('Listing models...');
        // Try v1 instead of v1beta if possible, or stick to v1beta but check output carefully
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
        const response = await axios.get(url);

        console.log('--- Raw Model Names ---');
        response.data.models.forEach(m => {
            // Log the "name" field exactly as it appears
            console.log(`"${m.name}"`);
        });
    } catch (error) {
        console.error('❌ Failed to list models:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
}

listModels();
