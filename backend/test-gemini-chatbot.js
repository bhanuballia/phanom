const axios = require('axios');
require('dotenv').config();

// Test data for Gemini-enhanced chatbot functionality
const testQueries = [
  'latest information about Diwali 2025',
  'detailed information about Gayatri Mantra', 
  'current Hindu festivals',
  'comprehensive guide to yoga',
  'what is karma in Hinduism',
  'explain Navratri festival',
  'detailed information about Hanuman Chalisa',
  'current astrological predictions'
];

// Function to test chatbot with Gemini AI
const testGeminiChatbot = async (query) => {
  try {
    console.log(`\n🤖 Testing Gemini-enhanced query: "${query}"`);
    console.log('📤 Sending to enhanced chatbot...');

    const response = await axios.post('http://localhost:5000/api/chatbot/chat', {
      message: query,
      userId: null // Test as anonymous user
    });
    
    console.log('✅ Response received!');
    console.log('📊 Response length:', response.data.response.length, 'characters');
    
    // Check if response contains Gemini AI indicators
    const hasGeminiContent = response.data.response.includes('🤖') || 
                            response.data.response.includes('Gemini AI') || 
                            response.data.response.includes('AI Knowledge') ||
                            response.data.response.includes('Enhanced Search');
    
    console.log('🤖 Contains Gemini AI content:', hasGeminiContent ? 'YES' : 'NO');
    
    if (hasGeminiContent) {
      console.log('🎉 Gemini AI integration is working!');
    } else {
      console.log('⚠️ Response seems to be from traditional search or local knowledge base');
    }
    
    // Show first 300 characters of response
    console.log('📝 Response preview:', response.data.response.substring(0, 300) + '...');
    
    return {
      query,
      success: true,
      hasGeminiContent,
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

// Test Gemini API directly
const testGeminiAPI = async () => {
  try {
    console.log('\n🤖 Testing direct Gemini API access...');
    
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = "Explain the significance of Diwali festival in Hinduism in a concise way.";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (text && text.length > 50) {
      console.log('✅ Gemini API is accessible and working!');
      console.log('📝 Sample response:', text.substring(0, 200) + '...');
      return true;
    } else {
      console.log('⚠️ Gemini API returned insufficient content');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Direct Gemini API test failed:', error.message);
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

// Run all Gemini tests
const runGeminiChatbotTests = async () => {
  try {
    console.log('🚀 Starting Gemini AI Chatbot Integration Tests...\n');
    
    // Check if server is running
    const serverRunning = await checkServer();
    if (!serverRunning) {
      console.log('💥 Cannot proceed without backend server');
      return;
    }
    
    // Test Gemini API directly
    const geminiWorking = await testGeminiAPI();
    
    console.log('\n📋 Gemini API Status:');
    console.log('🤖 Gemini API:', geminiWorking ? '✅ Working' : '❌ Not Working');
    
    if (!geminiWorking) {
      console.log('\n⚠️ WARNING: Gemini API is not accessible!');
      console.log('🔧 Chatbot will fall back to traditional internet search methods');
      console.log('🔑 Please check your GEMINI_API_KEY in .env file');
    }
    
    // Test chatbot with Gemini integration
    console.log('\n🤖 Testing Gemini-Enhanced Chatbot...');
    
    const results = [];
    
    for (const query of testQueries) {
      const result = await testGeminiChatbot(query);
      results.push(result);
      
      // Wait between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Summary
    console.log('\n📊 Gemini Integration Test Results:');
    console.log('='.repeat(60));
    
    const successfulTests = results.filter(r => r.success);
    const geminiResponses = results.filter(r => r.success && r.hasGeminiContent);
    
    console.log(`✅ Successful requests: ${successfulTests.length}/${results.length}`);
    console.log(`🤖 Gemini-enhanced responses: ${geminiResponses.length}/${successfulTests.length}`);
    
    if (geminiResponses.length > 0) {
      console.log('\n🎉 Gemini AI integration is working successfully!');
      console.log('📈 Average response length:', 
        Math.round(geminiResponses.reduce((sum, r) => sum + r.responseLength, 0) / geminiResponses.length), 
        'characters'
      );
      console.log('🚀 Enhanced AI responses provide more comprehensive and accurate information!');
    } else if (successfulTests.length > 0) {
      console.log('\n⚠️ Chatbot is working but not using Gemini AI');
      console.log('🔧 This might be due to:');
      console.log('   1. Missing or invalid GEMINI_API_KEY');
      console.log('   2. Gemini API rate limiting');
      console.log('   3. Network connectivity issues');
      console.log('   4. Queries not triggering AI search logic');
    } else {
      console.log('\n❌ Chatbot tests failed completely');
      console.log('🔧 Check backend server and API endpoints');
    }
    
    console.log('\n✨ Gemini AI integration testing completed!');
    console.log('🌟 Gemini provides intelligent, context-aware responses for Hindu religious and astrological queries');
    
  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
  }
};

// Run the tests
runGeminiChatbotTests();