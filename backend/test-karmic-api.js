const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error('❌ Missing GEMINI_API_KEY in .env');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function testGeminiSimple() {
    console.log('--- Testing Simple Gemini Call ---');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });



    try {
        const result = await model.generateContent('Explain Vedic Astrology in 1 sentence.');
        console.log('✅ Gemini Response:', result.response.text());
    } catch (error) {
        console.error('❌ Simple Call Failed:', error.message);
    }
}

async function testDivisionalPrompt() {
    console.log('\n--- Testing Divisional Chart Prompt ---');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });




    const details = { name: "Test User" };
    const chartData = [
        { name: "D1 - Rasi Chart", placements: "Sun + Mercury in Scorpio, Moon in Cancer" },
        { name: "D9 - Navamsha Chart", placements: "Venus in Leo, Saturn in Aries" }
    ];

    const prompt = `You are a Vedic Karmic Astrologer. For each birth chart listed below, provide a personalized "Karmic Explanation" based on the planetary placements.

User Details:
Name: ${details.name}

Charts to Analyze:
${chartData.map(c => `- ${c.name}: ${c.placements}`).join('\n')}

For EACH chart, provide:
1. Karmic Meaning: Past-life context of these placements.
2. Past life involvement: Bullet points (e.g., secrecy, power struggles, etc.).
3. Karma related to: Misuse of traits or good deeds.
4. Effect in this life: What the user experiences now (e.g., sharp mind, delays).
5. One-line summary: A concise takeaway.

Use a professional, mystical, and empathetic tone. Use emojis like 🔵, 🔴, 🟡, 🟢, ⚫, ☊, ☋, ♄, ♃, ♂, ♀, 🌕, ☀️ for planets and relevant symbols.

Return ONLY a JSON object where keys are the Chart IDs (e.g., "NavamshaD9") and values are the formatted markdown strings for that chart's explanation.

Example Structure:
{
  "NavamshaD9": "### 🚩 Navamsha Chart (D9) Insights...\\n\\n**Karmic Meaning**...\\n\\n...",
  "ShashtyamshaD60": "..."
}
`;

    try {
        console.log('Sending Prompt...');
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        console.log('✅ Raw Response Type:', typeof text);
        console.log('✅ Raw Response Length:', text.length);
        console.log('--- First 500 chars ---');
        console.log(text.substring(0, 500));

        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const json = JSON.parse(cleanText);
        console.log('\n✅ Parsed JSON Keys:', Object.keys(json));
    } catch (error) {
        console.error('❌ Divisional Call Failed:', error.message);
    }
}

(async () => {
    await testGeminiSimple();
    await testDivisionalPrompt();
})();
