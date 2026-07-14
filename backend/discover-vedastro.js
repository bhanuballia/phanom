const axios = require('axios');
const fs = require('fs');

async function discoverVedAstroData() {
    const VEDASTRO_API = 'http://localhost:7071/api';

    console.log('--- Fetching All Available API Calls ---');
    try {
        const listUrl = `${VEDASTRO_API}/ListAllCalls`;
        const listRes = await axios.get(listUrl, { timeout: 10000 });
        const calls = listRes.data.Payload || listRes.data;
        if (Array.isArray(calls)) {
            console.log(`✅ Success: Found ${calls.length} API calls.`);
            // Filter some interesting ones
            const interesting = calls.filter(c =>
                c.Name.includes('Dasha') ||
                c.Name.includes('Ashtakvarga') ||
                c.Name.includes('Shadbala') ||
                c.Name.includes('KP') ||
                c.Name.includes('LalKitab') ||
                c.Name.includes('Avkahada') ||
                c.Name.includes('PlanetData') ||
                c.Name.includes('Chart')
            );
            console.log('Interesting Calls:', interesting.map(c => c.Name).join(', '));

            // Save to file for later reference
            fs.writeFileSync('vedastro-api-calls.json', JSON.stringify(calls, null, 2));
            console.log('Saved all calls to vedastro-api-calls.json');
        }
    } catch (e) {
        console.log(`❌ Failed to list calls: ${e.message}`);
    }
}

discoverVedAstroData();
