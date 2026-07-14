// test-direct-gemini.js
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log('Testing Gemini API Key:');
console.log('Key present:', !!process.env.GEMINI_API_KEY);
console.log('Key length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);

if (process.env.GEMINI_API_KEY) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('✅ Gemini AI initialized successfully');
    
    // Try to list available models
    console.log('Attempting to list models...');
    // Note: This might not work with all API keys
    console.log('Skipping model listing (may not be supported with all keys)');
    
  } catch (error) {
    console.log('❌ Error initializing Gemini AI:', error.message);
  }
} else {
  console.log('❌ No API key found in environment variables');
}