// connectivity-test.js
require('dotenv').config();
const https = require('https');

console.log('Testing basic connectivity to Google APIs...');

// Test basic HTTPS connectivity
const testUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GEMINI_API_KEY;

console.log('API Key loaded:', !!process.env.GEMINI_API_KEY);
console.log('Key length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);

// Simple HTTPS request test
const postData = JSON.stringify({
  contents: [{
    parts: [{
      text: "Hello"
    }]
  }]
});

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': postData.length
  }
};

console.log('Testing direct HTTPS request to Gemini API...');
console.log('URL:', testUrl.substring(0, 80) + '...');

const req = https.request(testUrl, options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  res.on('data', (chunk) => {
    console.log('Response received (first 200 chars):', chunk.toString().substring(0, 200));
  });
  
  res.on('end', () => {
    console.log('Request completed');
  });
});

req.on('error', (error) => {
  console.log('Request error:', error.message);
});

req.write(postData);
req.end();