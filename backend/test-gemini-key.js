// test-gemini-key.js
require('dotenv').config();
console.log('Testing Gemini API key:', process.env.GEMINI_API_KEY ? '✅ Key loaded' : '❌ Key not found');
console.log('Key length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);

// Test Gemini API connectivity with different models
async function testGemini() {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    console.log('✅ Gemini AI SDK loaded successfully');
    
    // Test different models
    const modelsToTest = [
      'gemini-1.5-flash',
      'gemini-1.5-flash-001',
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro',
      'gemini-1.5-pro-001',
      'gemini-1.5-pro-latest',
      'gemini-1.0-pro',
      'gemini-1.0-pro-001',
      'gemini-pro'
    ];
    
    for (const modelVersion of modelsToTest) {
      try {
        console.log(`\n🔍 Testing model: ${modelVersion}`);
        const model = genAI.getGenerativeModel({ model: modelVersion });
        
        // Test a simple prompt
        const prompt = "Say hello in one word";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log(`✅ ${modelVersion} model connection successful`);
        console.log(`Test response: ${text.trim()}`);
        return; // Exit after first successful model
      } catch (modelError) {
        console.log(`❌ ${modelVersion} model test failed:`, modelError.message);
      }
    }
    
    console.log('💥 All model tests failed');
    
  } catch (error) {
    console.log('❌ Gemini API test failed:', error.message);
  }
}

testGemini();