// Simple test to check if the controller functions are accessible
const fs = require('fs');

// Check if controller file exists
if (fs.existsSync('./controllers/chatbotController.js')) {
  console.log('✅ Controller file exists');
  
  try {
    // Try to import the controller
    const controller = require('./controllers/chatbotController.js');
    console.log('✅ Controller imported successfully');
    
    // Check if generateIntelligentResponse function exists
    if (typeof controller.generateIntelligentResponse === 'function') {
      console.log('✅ generateIntelligentResponse function exists');
      
      // Test a few examples
      console.log('\nTesting sample queries:');
      
      // Test 1: Navratri query
      controller.generateIntelligentResponse("which day is Navratri today")
        .then(response => {
          console.log('✅ Navratri query test passed');
        })
        .catch(error => {
          console.log('❌ Navratri query test failed:', error.message);
        });
        
    } else {
      console.log('❌ generateIntelligentResponse function not found');
    }
  } catch (error) {
    console.log('❌ Error importing controller:', error.message);
  }
} else {
  console.log('❌ Controller file not found');
}