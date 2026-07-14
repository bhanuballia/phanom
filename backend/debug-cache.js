// Debug script to test chatbot caching and Gemini integration
const fs = require('fs');
const path = require('path');

// Test the chatbot controller functions
const chatbotControllerPath = path.join(__dirname, 'controllers', 'chatbotController.js');

// Check if file exists
if (!fs.existsSync(chatbotControllerPath)) {
  console.log('❌ Chatbot controller file not found at:', chatbotControllerPath);
  process.exit(1);
}

console.log('✅ Chatbot controller file found');

// Test cache directory
const CACHE_DIR = path.join(__dirname, 'cache');
console.log('Cache directory:', CACHE_DIR);

if (!fs.existsSync(CACHE_DIR)) {
  console.log('❌ Cache directory does not exist');
  try {
    fs.mkdirSync(CACHE_DIR);
    console.log('✅ Cache directory created');
  } catch (err) {
    console.log('❌ Failed to create cache directory:', err.message);
  }
} else {
  console.log('✅ Cache directory exists');
}

// List cache files
try {
  const files = fs.readdirSync(CACHE_DIR);
  console.log('Cache files found:', files.length);
  files.forEach(file => console.log('  -', file));
} catch (err) {
  console.log('❌ Error reading cache directory:', err.message);
}

// Test a specific query
const testQuery = "What is the meaning of life?";

console.log('\\nTesting query:', testQuery);

// Test cache functions directly
const testCacheFunctions = () => {
  try {
    // Dynamically import the controller
    const controller = require('./controllers/chatbotController');
    
    // Test getFromCache
    console.log('\\nTesting getFromCache...');
    const cachedResponse = controller.getFromCache(testQuery);
    console.log('Cached response:', cachedResponse ? 'Found' : 'Not found');
    
    if (cachedResponse) {
      console.log('Cached content preview:', cachedResponse.substring(0, 100) + '...');
    }
    
    // Test generateIntelligentResponse
    console.log('\\nTesting generateIntelligentResponse...');
    controller.generateIntelligentResponse(testQuery, {})
      .then(response => {
        console.log('Generated response preview:', response.substring(0, 100) + '...');
        
        // Check if response was cached
        const newCachedResponse = controller.getFromCache(testQuery);
        if (newCachedResponse) {
          console.log('✅ Response was cached successfully');
        } else {
          console.log('❌ Response was not cached');
        }
      })
      .catch(err => {
        console.log('❌ Error generating response:', err.message);
      });
      
  } catch (err) {
    console.log('❌ Error testing cache functions:', err.message);
  }
};

testCacheFunctions();