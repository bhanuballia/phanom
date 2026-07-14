// debug-controller.js
// This will help us debug the controller functions directly

// First, let's check if we can import the controller
try {
  const controller = require('./controllers/chatbotController');
  console.log('✅ Controller imported successfully');
  
  // Let's check what functions are available
  console.log('Available functions:', Object.keys(controller));
  
} catch (importError) {
  console.log('❌ Error importing controller:', importError.message);
}

// Let's also check the environment
require('dotenv').config();
console.log('\nEnvironment check:');
console.log('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);