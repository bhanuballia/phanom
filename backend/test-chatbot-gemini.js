// test-chatbot-gemini.js
const chatbotController = require('./controllers/chatbotController');

async function testGeminiIntegration() {
  console.log('🔍 Testing Chatbot Gemini Integration');
  console.log('====================================');
  
  try {
    // Test a simple Hindu-related query
    console.log('1. Testing Gemini search function...');
    const result = await chatbotController.searchWithGemini('What is karma in Hinduism?');
    
    console.log('   Result success:', result.success);
    if (result.success) {
      console.log('   ✅ Gemini search successful!');
      console.log('   📝 Content length:', result.content.length);
      console.log('   📍 Source:', result.source);
    } else {
      console.log('   ❌ Gemini search failed:');
      console.log('   📝 Message:', result.message);
    }
    
  } catch (error) {
    console.log('   ❌ Error testing Gemini integration:');
    console.log('   📝 Error:', error.message);
  }
  
  try {
    // Test the enhanced internet search
    console.log('\n2. Testing enhanced internet search...');
    const result2 = await chatbotController.searchInternetWithGemini('Explain the significance of Diwali');
    
    console.log('   Result success:', result2.success);
    if (result2.success) {
      console.log('   ✅ Enhanced search successful!');
      console.log('   📝 Content length:', result2.content.length);
      console.log('   📍 Source:', result2.source);
    } else {
      console.log('   ❌ Enhanced search failed:');
      console.log('   📝 Message:', result2.message);
    }
    
  } catch (error) {
    console.log('   ❌ Error testing enhanced search:');
    console.log('   📝 Error:', error.message);
  }
}

testGeminiIntegration();