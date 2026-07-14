// final-gemini-test.js
require('dotenv').config();

async function testGemini() {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Use the gemini-2.0-flash model which should be available based on diagnostics
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    console.log('✅ Gemini AI SDK loaded successfully');
    console.log('✅ Using model: gemini-2.0-flash');
    
    // Test a simple prompt
    const prompt = "Explain what Hinduism is in one sentence";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini API connection successful');
    console.log('Test response:', text.trim());
    
  } catch (error) {
    console.log('❌ Gemini API test failed:', error.message);
    
    // If that fails, try the latest model
    try {
      console.log('\n🔄 Trying latest model: gemini-flash-latest');
      const genAI2 = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model2 = genAI2.getGenerativeModel({ model: 'gemini-flash-latest' });
      
      const prompt2 = "Explain what Hinduism is in one sentence";
      const result2 = await model2.generateContent(prompt2);
      const response2 = await result2.response;
      const text2 = response2.text();
      
      console.log('✅ Latest model connection successful');
      console.log('Test response:', text2.trim());
    } catch (error2) {
      console.log('❌ Latest model also failed:', error2.message);
    }
  }
}

testGemini();