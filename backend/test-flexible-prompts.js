const chatbotController = require('./controllers/chatbotController');

async function testFlexiblePrompts() {
  console.log('Testing flexible prompts for chatbot...\n');
  
  const testQueries = [
    "which day is Navratri today",
    "what panchang say for today",
    "ganesh Ji ki Aaarti batye",
    "Laxmi Ji Arti Batye",
    "Vishnu Mantra Kya Hai",
    "आज कौन सा त्योहार है",
    "शिवरात्रि कब है",
    "हनुमान चालीसा कैसे पढ़ें"
  ];
  
  for (const query of testQueries) {
    console.log(`🔍 Testing query: "${query}"`);
    try {
      const response = await chatbotController.generateIntelligentResponse(query);
      console.log(`✅ Response: ${response.substring(0, 100)}...\n`);
    } catch (error) {
      console.log(`❌ Error: ${error.message}\n`);
    }
  }
  
  console.log('Test completed!');
}

testFlexiblePrompts();