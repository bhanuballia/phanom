// Simple test to verify cache directory exists and is accessible
const fs = require('fs');
const path = require('path');

// Check if cache directory exists
const CACHE_DIR = path.join(__dirname, 'cache');
console.log('Cache directory:', CACHE_DIR);

if (fs.existsSync(CACHE_DIR)) {
  console.log('✅ Cache directory exists');
  
  // List files in cache directory
  try {
    const files = fs.readdirSync(CACHE_DIR);
    console.log('Cache files found:', files.length);
    console.log('Files:', files);
  } catch (err) {
    console.log('Error reading cache directory:', err.message);
  }
} else {
  console.log('❌ Cache directory does not exist');
}

// Test basic cache functionality
const testQuery = "gayatri mantra";
const safeQuery = testQuery.toLowerCase()
  .replace(/[^a-z0-9\u0900-\u097F]/g, '_')
  .replace(/_+/g, '_')
  .substring(0, 100);

const cacheFilePath = path.join(CACHE_DIR, `${safeQuery}.json`);
console.log('Cache file path for test query:', cacheFilePath);

// Test data
const cacheData = {
  response: "This is a test cached response",
  timestamp: Date.now(),
  query: testQuery
};

try {
  // Write test data to cache
  fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData, null, 2));
  console.log('✅ Test data written to cache');
  
  // Read test data from cache
  if (fs.existsSync(cacheFilePath)) {
    const cachedData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
    console.log('✅ Test data read from cache');
    console.log('Cached response:', cachedData.response);
    
    // Check if cache is still valid (less than 7 days old)
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    if (cachedData.timestamp > oneWeekAgo) {
      console.log('✅ Cache entry is valid');
    } else {
      console.log('❌ Cache entry is expired');
    }
    
    // Clean up test file
    fs.unlinkSync(cacheFilePath);
    console.log('✅ Test file cleaned up');
  }
} catch (err) {
  console.log('Error testing cache functionality:', err.message);
}

console.log('\\n✅ Cache system test completed');