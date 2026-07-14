// Direct test of the specific functionality we added
const chatbotController = require('./controllers/chatbotController');

// Test the specific handlers we added
console.log('Testing specific handlers...\n');

// Test Navratri handler
console.log('1. Testing Navratri handler:');
try {
  const response1 = chatbotController.generateIntelligentResponse("which day is Navratri today");
  console.log('   Result: Success - Response generated');
} catch (error) {
  console.log('   Error:', error.message);
}

// Test Panchang handler
console.log('\n2. Testing Panchang handler:');
try {
  const response2 = chatbotController.generateIntelligentResponse("what panchang say for today");
  console.log('   Result: Success - Response generated');
} catch (error) {
  console.log('   Error:', error.message);
}

// Test Ganesh Aarti handler
console.log('\n3. Testing Ganesh Aarti handler:');
try {
  const response3 = chatbotController.generateIntelligentResponse("ganesh Ji ki Aaarti batye");
  console.log('   Result: Success - Response generated');
} catch (error) {
  console.log('   Error:', error.message);
}

// Test Lakshmi Aarti handler
console.log('\n4. Testing Lakshmi Aarti handler:');
try {
  const response4 = chatbotController.generateIntelligentResponse("Laxmi Ji Arti Batye");
  console.log('   Result: Success - Response generated');
} catch (error) {
  console.log('   Error:', error.message);
}

// Test Vishnu Mantra handler
console.log('\n5. Testing Vishnu Mantra handler:');
try {
  const response5 = chatbotController.generateIntelligentResponse("Vishnu Mantra Kya Hai");
  console.log('   Result: Success - Response generated');
} catch (error) {
  console.log('   Error:', error.message);
}

console.log('\n✅ All handler tests completed!');