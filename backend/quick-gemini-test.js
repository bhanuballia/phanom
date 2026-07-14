// quick-gemini-test.js
require('dotenv').config();

async function quickTest() {
  try {
    console.log('Starting quick Gemini test...');
    
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Use a model that should be available
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    
    console.log('Model initialized, sending request...');
    
    // Very simple request with short timeout
    const result = await model.generateContent("Hello");
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Success! Response:', text.trim());
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('Error code:', error.code);
  }
}

// Set a timeout to ensure the script doesn't hang
setTimeout(() => {
  console.log('Test timed out after 10 seconds');
  process.exit(1);
}, 10000);

quickTest();