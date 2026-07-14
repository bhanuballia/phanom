const axios = require('axios');

// Test the home page background image API
async function testHomePageAPI() {
  try {
    console.log('Testing home page background image API...');
    
    // Test the GET endpoint
    const response = await axios.get('http://localhost:5000/api/admin/homepage-background');
    console.log('API Response:', response.data);
    
  } catch (error) {
    console.error('Error testing home page API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testHomePageAPI();