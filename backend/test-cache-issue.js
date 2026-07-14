// test-cache-issue.js
const chatbotController = require('./controllers/chatbotController');

async function testCacheAndGeminiFlow() {
  console.log('🔍 Testing Chatbot Cache and Gemini Flow');
  console.log('========================================');
  
  try {
    // Test a query that should NOT be in cache and should trigger Gemini search
    const testQuery = "What is the significance of Mahashivratri in 2025?";
    console.log(`1. Testing query: "${testQuery}"`);
    console.log('   This query should NOT be in cache and should trigger Gemini search');
    
    // Check if it's in cache first
    const cachedResponse = chatbotController.getFromCache(testQuery);
    console.log('   Cached response:', cachedResponse ? 'FOUND' : 'NOT FOUND');
    
    if (cachedResponse) {
      console.log('   ❌ Query was found in cache, testing with different query');
      const testQuery2 = "Explain the rituals of Chhath Puja in detail";
      console.log(`2. Testing alternative query: "${testQuery2}"`);
      
      const cachedResponse2 = chatbotController.getFromCache(testQuery2);
      console.log('   Cached response:', cachedResponse2 ? 'FOUND' : 'NOT FOUND');
      
      if (cachedResponse2) {
        console.log('   ❌ Both queries were found in cache, cache is too extensive');
      } else {
        console.log('   ✅ Query not in cache, proceeding with response generation');
        const response = await chatbotController.generateIntelligentResponse(testQuery2);
        console.log('   Generated response length:', response.length);
        console.log('   Response preview:', response.substring(0, 200) + '...');
      }
    } else {
      console.log('   ✅ Query not in cache, proceeding with response generation');
      const response = await chatbotController.generateIntelligentResponse(testQuery);
      console.log('   Generated response length:', response.length);
      console.log('   Response preview:', response.substring(0, 200) + '...');
    }
    
  } catch (error) {
    console.log('   ❌ Error testing cache and Gemini flow:');
    console.log('   📝 Error:', error.message);
    console.log('   📝 Stack:', error.stack);
  }
}

testCacheAndGeminiFlow();