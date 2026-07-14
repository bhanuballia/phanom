const chatbotController = require('./controllers/chatbotController');

async function testGaneshAarti() {
  console.log('Testing Bhagwan Ganesh Aarti...\n');
  
  try {
    // Test the updated Ganesh Aarti
    const response = await chatbotController.generateIntelligentResponse("भगवान गणेश की आरती");
    console.log('Ganesh Aarti Response:');
    console.log(response);
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test with English query
    const response2 = await chatbotController.generateIntelligentResponse("ganesh aarti");
    console.log('Ganesh Aarti Response (English):');
    console.log(response2);
    
  } catch (error) {
    console.error('Error testing Ganesh Aarti:', error.message);
  }
}

testGaneshAarti();