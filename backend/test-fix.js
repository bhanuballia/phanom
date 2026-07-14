// test-fix.js
const chatbotController = require('./controllers/chatbotController');

async function testFixedFlow() {
  console.log('🔍 Testing Fixed Chatbot Flow');
  console.log('============================');
  
  try {
    // Test a query that should trigger internet search (has "latest" keyword)
    const testQuery = "latest information about Gayatri Mantra";
    console.log(`1. Testing query: "${testQuery}"`);
    console.log('   This query should trigger internet search because it contains "latest"');
    
    // Check if it's in cache first
    const cachedResponse = chatbotController.getFromCache(testQuery);
    console.log('   Cached response:', cachedResponse ? 'FOUND' : 'NOT FOUND');
    
    // Check if it needs internet search
    const needsSearch = chatbotController.needsInternetSearch(testQuery);
    console.log('   Needs internet search:', needsSearch ? 'YES' : 'NO');
    
    if (!cachedResponse) {
      console.log('   ✅ Query not in cache, proceeding with response generation');
      const response = await chatbotController.generateIntelligentResponse(testQuery);
      console.log('   Generated response length:', response.length);
      console.log('   Response preview:', response.substring(0, 200) + '...');
      
      // Check if response contains Gemini indicators
      const hasGeminiContent = response.includes('🤖') || response.includes('Gemini AI');
      console.log('   Contains Gemini content:', hasGeminiContent ? 'YES' : 'NO');
    } else {
      console.log('   ℹ️  Query was found in cache, which is expected for repeated tests');
    }
    
    console.log('\n---\n');
    
    // Test a query that should use local knowledge base
    const localQuery = "What is Gayatri Mantra?";
    console.log(`2. Testing query: "${localQuery}"`);
    console.log('   This query should use local knowledge base');
    
    // Check if it's in cache first
    const cachedResponse2 = chatbotController.getFromCache(localQuery);
    console.log('   Cached response:', cachedResponse2 ? 'FOUND' : 'NOT FOUND');
    
    // Check if it needs internet search
    const needsSearch2 = chatbotController.needsInternetSearch(localQuery);
    console.log('   Needs internet search:', needsSearch2 ? 'YES' : 'NO');
    
    if (!cachedResponse2) {
      console.log('   ✅ Query not in cache, proceeding with response generation');
      const response = await chatbotController.generateIntelligentResponse(localQuery);
      console.log('   Generated response length:', response.length);
      console.log('   Response preview:', response.substring(0, 200) + '...');
      
      // Check if response contains Gemini indicators
      const hasGeminiContent = response.includes('🤖') || response.includes('Gemini AI');
      console.log('   Contains Gemini content:', hasGeminiContent ? 'YES' : 'NO');
    } else {
      console.log('   ℹ️  Query was found in cache, which is expected for repeated tests');
    }
    
  } catch (error) {
    console.log('   ❌ Error testing fixed flow:');
    console.log('   📝 Error:', error.message);
    console.log('   📝 Stack:', error.stack);
  }
}

testFixedFlow();