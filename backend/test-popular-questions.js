const axios = require('axios');

async function testPopularQuestions() {
  try {
    console.log('Testing popular questions API endpoint...');
    
    const response = await axios.get('http://localhost:5000/api/chatbot/popular-questions');
    
    console.log('API Response Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Number of categories:', response.data.questions.length);
    
    console.log('\nCategories:');
    response.data.questions.forEach((category, index) => {
      console.log(`${index + 1}. ${category.category} (${category.questions.length} questions)`);
    });
    
    console.log('\nAll questions:');
    response.data.questions.forEach((category, index) => {
      console.log(`\n${index + 1}. ${category.category}:`);
      category.questions.forEach((question, qIndex) => {
        console.log(`   ${qIndex + 1}. ${question}`);
      });
    });
    
  } catch (error) {
    console.error('Error testing popular questions API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testPopularQuestions();