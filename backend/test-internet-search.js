const axios = require('axios');

// Test data for internet search functionality
const testQueries = [
  'latest information about Diwali 2025',
  'detailed information about Gayatri Mantra',
  'current Hindu festivals',
  'comprehensive guide to yoga',
  'what is karma in Hinduism',
  'explain Navratri festival'
];

// Function to test chatbot with internet search
const testInternetSearch = async (query) => {
  try {
    console.log(`\n🔍 Testing query: "${query}"`);
    console.log('📤 Sending to chatbot...');

    const response = await axios.post('http://localhost:5000/api/chatbot/chat', {
      message: query,
      userId: null // Test as anonymous user
    });
    
    console.log('✅ Response received!');
    console.log('📊 Response length:', response.data.response.length, 'characters');
    
    // Check if response contains internet search indicators
    const hasInternetContent = response.data.response.includes('🌐') || 
                              response.data.response.includes('📖') || 
                              response.data.response.includes('📚') ||
                              response.data.response.includes('🏛️') ||
                              response.data.response.includes('🔍');
    
    console.log('🌐 Contains internet content:', hasInternetContent ? 'YES' : 'NO');
    
    if (hasInternetContent) {
      console.log('🎉 Internet search appears to be working!');
    } else {
      console.log('⚠️ Response seems to be from local knowledge base');
    }
    
    // Show first 200 characters of response
    console.log('📝 Response preview:', response.data.response.substring(0, 200) + '...');
    
    return {
      query,
      success: true,
      hasInternetContent,
      responseLength: response.data.response.length
    };
    
  } catch (error) {
    console.error('❌ Test failed for query:', query);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('💬 Error message:', error.response.data.message);
    } else {
      console.error('🔌 Network error:', error.message);
    }
    
    return {
      query,
      success: false,
      error: error.message
    };
  }
};

// Function to test direct Wikipedia API access
const testWikipediaAPI = async () => {
  try {
    console.log('\n📖 Testing direct Wikipedia API access...');
    
    const response = await axios.get('https://en.wikipedia.org/api/rest_v1/page/summary/Diwali', {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AstrologyBot/1.0)',
        'Accept': 'application/json'
      }
    });
    
    if (response.data && response.data.extract) {
      console.log('✅ Wikipedia API accessible!');
      console.log('📝 Sample extract:', response.data.extract.substring(0, 150) + '...');
      return true;
    } else {
      console.log('⚠️ Wikipedia API returned no content');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Wikipedia API test failed:', error.message);
    return false;
  }
};

// Function to test DuckDuckGo API access
const testDuckDuckGoAPI = async () => {
  try {
    console.log('\n🦆 Testing DuckDuckGo API access...');
    
    const response = await axios.get('https://api.duckduckgo.com/?q=Hindu+festival+Diwali&format=json&no_html=1&skip_disambig=1', {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AstrologyBot/1.0)'
      }
    });
    
    if (response.data) {
      console.log('✅ DuckDuckGo API accessible!');
      console.log('📊 Response keys:', Object.keys(response.data));
      
      if (response.data.Abstract) {
        console.log('📝 Has Abstract:', response.data.Abstract.length > 0);
      }
      if (response.data.Definition) {
        console.log('📝 Has Definition:', response.data.Definition.length > 0);
      }
      if (response.data.RelatedTopics) {
        console.log('📝 Has Related Topics:', response.data.RelatedTopics.length);
      }
      
      return true;
    } else {
      console.log('⚠️ DuckDuckGo API returned no data');
      return false;
    }
    
  } catch (error) {
    console.error('❌ DuckDuckGo API test failed:', error.message);
    return false;
  }
};

// Check if backend server is running
const checkServer = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/chatbot/popular-questions');
    console.log('🟢 Backend server is running on port 5000');
    return true;
  } catch (error) {
    console.log('🔴 Backend server is not running on port 5000');
    console.log('📝 Please start the backend server with: npm run dev');
    return false;
  }
};

// Run all tests
const runInternetSearchTests = async () => {
  try {
    console.log('🚀 Starting Internet Search Functionality Tests...\n');
    
    // Check if server is running
    const serverRunning = await checkServer();
    if (!serverRunning) {
      console.log('💥 Cannot proceed without backend server');
      return;
    }
    
    // Test external APIs directly
    const wikiWorking = await testWikipediaAPI();
    const duckWorking = await testDuckDuckGoAPI();
    
    console.log('\n📋 API Accessibility Summary:');
    console.log('📖 Wikipedia API:', wikiWorking ? '✅ Working' : '❌ Not Working');
    console.log('🦆 DuckDuckGo API:', duckWorking ? '✅ Working' : '❌ Not Working');
    
    if (!wikiWorking && !duckWorking) {
      console.log('\n⚠️ WARNING: Both external APIs are not accessible!');
      console.log('🔧 Internet search will fall back to enhanced local knowledge base');
    }
    
    // Test chatbot internet search with different queries
    console.log('\n🤖 Testing Chatbot Internet Search...');
    
    const results = [];
    
    for (const query of testQueries) {
      const result = await testInternetSearch(query);
      results.push(result);
      
      // Wait between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Summary
    console.log('\n📊 Test Results Summary:');
    console.log('=' .repeat(50));
    
    const successfulTests = results.filter(r => r.success);
    const internetResponses = results.filter(r => r.success && r.hasInternetContent);
    
    console.log(`✅ Successful requests: ${successfulTests.length}/${results.length}`);
    console.log(`🌐 Internet-enhanced responses: ${internetResponses.length}/${successfulTests.length}`);
    
    if (internetResponses.length > 0) {
      console.log('\n🎉 Internet search functionality is working!');
      console.log('📈 Average response length:', 
        Math.round(internetResponses.reduce((sum, r) => sum + r.responseLength, 0) / internetResponses.length), 
        'characters'
      );
    } else if (successfulTests.length > 0) {
      console.log('\n⚠️ Chatbot is working but using local knowledge base only');
      console.log('🔧 This might be due to:');
      console.log('   1. Network connectivity issues');
      console.log('   2. External API rate limiting');
      console.log('   3. Query not triggering internet search logic');
    } else {
      console.log('\n❌ Chatbot tests failed completely');
      console.log('🔧 Check backend server and API endpoints');
    }
    
    console.log('\n✨ Internet search testing completed!');
    
  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
  }
};

// Run the tests
runInternetSearchTests();
