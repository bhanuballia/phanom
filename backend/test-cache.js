// Test script to verify caching mechanism
const fs = require('fs');
const path = require('path');

// Create cache directory if it doesn't exist
const CACHE_DIR = path.join(__dirname, 'cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR);
}

// Import the chatbot controller functions
const chatbotController = require('./controllers/chatbotController');

// Test the caching mechanism
async function testCaching() {
  console.log('Testing caching mechanism...');
  
  // Test query
  const testQuery = "What is Gayatri Mantra?";
  
  // First call - should generate a new response and cache it
  console.log('\\nFirst call (should generate new response):');
  const response1 = await chatbotController.generateIntelligentResponse(testQuery, {});
  console.log('Response 1:', response1.substring(0, 100) + '...');
  
  // Second call - should return cached response
  console.log('\\nSecond call (should return cached response):');
  const response2 = await chatbotController.generateIntelligentResponse(testQuery, {});
  console.log('Response 2:', response2.substring(0, 100) + '...');
  
  // Check if responses are the same (indicating cache was used)
  if (response1 === response2) {
    console.log('\\n✅ Caching is working correctly - same response returned');
  } else {
    console.log('\\n❌ Caching may not be working - different responses returned');
  }
  
  // List cache files
  console.log('\\nCache files:');
  const files = fs.readdirSync(CACHE_DIR);
  console.log(files);
}

// Run the test
testCaching().catch(console.error);