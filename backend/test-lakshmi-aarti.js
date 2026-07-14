const chatbotController = require('./controllers/chatbotController');

async function testLakshmiAarti() {
  console.log('Testing Lakshmi Ji Aarti...\n');
  
  try {
    // Test the updated Lakshmi Aarti
    const response = await chatbotController.generateIntelligentResponse("लक्ष्मी जी की आरती");
    console.log('Lakshmi Aarti Response:');
    console.log(response);
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test with English query
    const response2 = await chatbotController.generateIntelligentResponse("lakshmi aarti");
    console.log('Lakshmi Aarti Response (English):');
    console.log(response2);
    
  } catch (error) {
    console.error('Error testing Lakshmi Aarti:', error.message);
  }
}

testLakshmiAarti();