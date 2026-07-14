// test-knowledge-base.js
const chatbotController = require('./controllers/chatbotController');

// Test the knowledge base functionality
async function testKnowledgeBase() {
  console.log('🔍 Testing Knowledge Base Responses');
  console.log('=================================');
  
  // Test cases that should match different categories
  const testCases = [
    { message: 'नमस्ते', expectedCategory: 'greetings', description: 'Greetings' },
    { message: 'ज्योतिष', expectedCategory: 'astrology', description: 'Astrology' },
    { message: 'कुंडली', expectedCategory: 'kundali', description: 'Kundali' },
    { message: 'अपॉइंटमेंट', expectedCategory: 'appointment', description: 'Appointment' },
    { message: 'रत्न', expectedCategory: 'gemstones', description: 'Gemstones' },
    { message: 'मंत्र', expectedCategory: 'mantras', description: 'Mantras' },
    { message: 'गायत्री', expectedCategory: 'gayatri', description: 'Gayatri Mantra' },
    { message: 'व्रत', expectedCategory: 'festivals', description: 'Festivals/Vrats' },
    { message: 'करियर', expectedCategory: 'career', description: 'Career' },
    { message: 'स्वास्थ्य', expectedCategory: 'health', description: 'Health' },
    { message: 'शादी', expectedCategory: 'marriage', description: 'Marriage' }
  ];
  
  for (const testCase of testCases) {
    try {
      console.log(`\nTesting: ${testCase.description} ("${testCase.message}")`);
      
      // Create a mock user context
      const userContext = { name: 'Test User' };
      
      // Call the generateIntelligentResponse function
      const response = await chatbotController.generateIntelligentResponse(testCase.message, userContext);
      
      console.log('   ✅ Response generated successfully');
      console.log('   📝 Response preview:', response.substring(0, 100) + '...');
      
      // Check if response contains expected elements
      const hasHindiContent = /[ऀ-ॿ]/.test(response);
      console.log('   🇮🇳 Contains Hindi content:', hasHindiContent);
      
    } catch (error) {
      console.log(`   ❌ Error testing ${testCase.description}:`, error.message);
    }
  }
  
  // Test specific question patterns
  console.log('\n\nTesting Question Patterns:');
  const questionTests = [
    { message: 'कैसे', description: 'How questions' },
    { message: 'कब', description: 'When questions' },
    { message: 'क्यों', description: 'Why questions' }
  ];
  
  for (const test of questionTests) {
    try {
      console.log(`\nTesting: ${test.description} ("${test.message}")`);
      const response = await chatbotController.generateIntelligentResponse(test.message, {});
      console.log('   ✅ Response generated successfully');
      console.log('   📝 Response preview:', response.substring(0, 100) + '...');
    } catch (error) {
      console.log(`   ❌ Error testing ${test.description}:`, error.message);
    }
  }
}

testKnowledgeBase();