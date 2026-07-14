// gemini-diagnostics.js
require('dotenv').config();
const axios = require('axios');

async function diagnoseGemini() {
  console.log('🔍 Gemini API Diagnostics');
  console.log('========================');
  
  // Check if API key is present
  console.log('1. API Key Check:');
  console.log('   - Key present:', !!process.env.GEMINI_API_KEY);
  console.log('   - Key length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);
  
  if (!process.env.GEMINI_API_KEY) {
    console.log('   ❌ No API key found in environment variables');
    return;
  }
  
  // Test API key validity with a simple request
  console.log('\n2. API Key Validity Test:');
  try {
    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const response = await axios.post(testUrl, {
      contents: [{
        parts: [{
          text: "Say hello"
        }]
      }]
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('   ✅ API key is valid');
    console.log('   ✅ Request successful');
    console.log('   📝 Response:', response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No text response');
    
  } catch (error) {
    console.log('   ❌ API key test failed');
    if (error.response) {
      console.log('   📊 Status:', error.response.status);
      console.log('   📝 Error:', error.response.data.error?.message || 'Unknown error');
    } else {
      console.log('   🔌 Connection error:', error.message);
    }
  }
  
  // Test available models
  console.log('\n3. Model Availability Test:');
  try {
    const modelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
    
    const response = await axios.get(modelsUrl, {
      timeout: 10000
    });
    
    console.log('   ✅ Models API accessible');
    const models = response.data.models || [];
    console.log('   📋 Available models:', models.map(m => m.name).join(', '));
    
  } catch (error) {
    console.log('   ❌ Models API test failed');
    if (error.response) {
      console.log('   📊 Status:', error.response.status);
      console.log('   📝 Error:', error.response.data.error?.message || 'Unknown error');
    } else {
      console.log('   🔌 Connection error:', error.message);
    }
  }
}

diagnoseGemini();