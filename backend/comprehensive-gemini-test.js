// comprehensive-gemini-test.js
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function comprehensiveGeminiTest() {
  console.log('🔍 Comprehensive Gemini AI Test');
  console.log('==============================');
  
  // Check API key
  console.log('1. API Key Status:');
  console.log('   - Present:', !!process.env.GEMINI_API_KEY);
  console.log('   - Length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);
  
  if (!process.env.GEMINI_API_KEY) {
    console.log('   ❌ No API key found');
    return;
  }
  
  try {
    console.log('\n2. Initializing Gemini AI...');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('   ✅ Gemini AI initialized successfully');
    
    try {
      console.log('\n3. Getting model (gemini-2.0-flash)...');
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      console.log('   ✅ Model retrieved successfully');
      
      console.log('\n4. Testing model with simple prompt...');
      const prompt = "What is karma in one sentence?";
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('   ✅ Model test successful!');
      console.log('   📝 Response:', text.trim());
      
    } catch (modelError) {
      console.log('   ❌ Model test failed:', modelError.message);
      
      // Try alternative models
      const alternativeModels = ['gemini-pro', 'gemini-1.0-pro', 'gemini-1.5-flash'];
      
      for (const altModel of alternativeModels) {
        try {
          console.log(`\n   Trying alternative model: ${altModel}`);
          const altModelInstance = genAI.getGenerativeModel({ model: altModel });
          
          const result = await altModelInstance.generateContent("Hello");
          const response = await result.response;
          const text = response.text();
          
          console.log(`   ✅ ${altModel} works!`);
          console.log('   📝 Response:', text.trim());
          break;
        } catch (altError) {
          console.log(`   ❌ ${altModel} also failed:`, altError.message);
        }
      }
    }
    
  } catch (initError) {
    console.log('   ❌ Gemini AI initialization failed:', initError.message);
  }
}

comprehensiveGeminiTest();