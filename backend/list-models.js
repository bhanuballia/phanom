// list-models.js
require('dotenv').config();
const axios = require('axios');

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error('No API key found!');
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        console.log(`Querying: ${url.replace(key, 'HIDDEN_KEY')}`);
        const response = await axios.get(url);
        const models = response.data.models;

        console.log('✅ Available Models:');
        if (models && models.length > 0) {
            models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(`- ${m.name.replace('models/', '')} (${m.displayName})`);
                }
            });
        } else {
            console.log('No models found.');
        }
    } catch (error) {
        console.error('❌ Error listing models:');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
        } else {
            console.error(error.message);
        }
    }
}

listModels();
