// gemini-connection-test.js
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiConnection() {
  console.log('🔍 Testing Gemini AI Connection');
  console.log('============================');
  
  // Check if API key is present
  console.log('1. API Key Check:');
  console.log('   - Key present:', !!process.env.GEMINI_API_KEY);
  console.log('   - Key length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);
  
  if (!process.env.GEMINI_API_KEY) {
    console.log('   ❌ No API key found');
    return;
  }
  
  try {
    // Initialize Gemini AI
    console.log('\n2. Initializing Gemini AI...');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Try to get the model
    console.log('3. Getting model...');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // Test a simple prompt
    console.log('4. Testing model with simple prompt...');
    const prompt = "Say hello in one word";
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('   ✅ Gemini AI connection successful!');
    console.log('   📝 Response:', text.trim());
    
  } catch (error) {
    console.log('   ❌ Gemini AI connection failed:');
    console.log('   📝 Error:', error.message);
    
    // Try to provide more specific error information
    if (error.message.includes('API key')) {
      console.log('   🔑 The API key might be invalid or missing required permissions');
    } else if (error.message.includes('404')) {
      console.log('   📋 The model might not be available with your API key');
    } else if (error.message.includes('network')) {
      console.log('   🔌 There might be a network connectivity issue');
    }
  }
}

testGeminiConnection();