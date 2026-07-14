const axios = require('axios');
require('dotenv').config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await axios.get(url);
        console.log('Flash Models:');
        response.data.models
            .filter(m => m.name.includes('flash'))
            .forEach(m => {
                console.log(`- ${m.name}`);
            });
    } catch (error) {
        console.error('Error listing models:', error.response ? error.response.data : error.message);
    }
}

listModels();
