// Simple test to verify chatbot caching and Gemini integration
const fs = require('fs');
const path = require('path');

console.log('Testing chatbot caching mechanism...');

// Test the cache functions directly
const testCacheMechanism = async () => {
  try {
    // Import the chatbot controller
    const chatbotController = require('./controllers/chatbotController');
    
    // Test query that should not be in cache
    const testQuery = "What is the capital of France?";
    console.log('\\nTesting with query:', testQuery);
    
    // Check if response is in cache
    console.log('\\n1. Checking cache...');
    const cachedResponse = chatbotController.getFromCache(testQuery);
    console.log('Cached response found:', !!cachedResponse);
    
    if (cachedResponse) {
      console.log('Cached response preview:', cachedResponse.substring(0, 100) + '...');
    } else {
      console.log('No cached response found, will generate new response');
    }
    
    // Test the generateIntelligentResponse function
    console.log('\\n2. Generating intelligent response...');
    const response = await chatbotController.generateIntelligentResponse(testQuery, {});
    console.log('Generated response preview:', response.substring(0, 100) + '...');
    
    // Check if response was cached
    console.log('\\n3. Checking if response was cached...');
    const newCachedResponse = chatbotController.getFromCache(testQuery);
    console.log('Response cached:', !!newCachedResponse);
    
    if (newCachedResponse) {
      console.log('✅ Caching is working correctly');
    } else {
      console.log('❌ Response was not cached');
    }
    
  } catch (error) {
    console.log('❌ Error testing cache mechanism:', error.message);
    console.log('Stack trace:', error.stack);
  }
};

// Run the test
testCacheMechanism();