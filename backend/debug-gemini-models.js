const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('Error: GEMINI_API_KEY not found in .env');
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // There isn't a direct listModels method on the class instance in some versions,
        // but usually we can try to get a model and assume. 
        // However, the error message from the user specifically says:
        // "Call ListModels to see the list of available models"
        // This implies we can call it globally or via a specific client.

        // In the Node.js SDK, listing models is done via the ModelManager or simply checking documentation.
        // But since I suspect a version/region issue, I'll try to use a raw fetch to the API endpoint which is more reliable for debugging.

        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log('Available Models:');
            data.models.forEach(model => {
                if (model.supportedGenerationMethods && model.supportedGenerationMethods.includes('generateContent')) {
                    console.log(`- ${model.name} (Methods: ${model.supportedGenerationMethods.join(', ')})`);
                }
            });
        } else {
            console.log('No models found or error:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('Error listing models:', error);
    }
}

listModels();
