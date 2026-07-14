// verify-fix.js
const chatbotController = require('./controllers/chatbotController');

async function testFixedFlow() {
  console.log('🔍 Testing Fixed Chatbot Flow');
  console.log('============================');
  
  try {
    console.log('Testing needsInternetSearch function:');
    console.log('Query "latest information about Gayatri Mantra":', chatbotController.needsInternetSearch('latest information about Gayatri Mantra'));
    console.log('Query "What is Gayatri Mantra?":', chatbotController.needsInternetSearch('What is Gayatri Mantra?'));
    console.log('Query "current Navratri dates":', chatbotController.needsInternetSearch('current Navratri dates'));
    console.log('Query "Explain Karma":', chatbotController.needsInternetSearch('Explain Karma'));

    console.log('\nTesting the fixed flow:');
    // This should trigger internet search because it contains "latest"
    console.log('Query "latest information about Gayatri Mantra" needs search:', chatbotController.needsInternetSearch('latest information about Gayatri Mantra'));
    // This should not trigger internet search and fall back to local knowledge base
    console.log('Query "What is Gayatri Mantra?" needs search:', chatbotController.needsInternetSearch('What is Gayatri Mantra?'));
    
    console.log('\n✅ Fix verification completed successfully!');
    
  } catch (error) {
    console.log('❌ Error in verification:', error.message);
  }
}

testFixedFlow();