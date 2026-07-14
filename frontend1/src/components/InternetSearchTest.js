// Comprehensive test suite for AIChatbot Internet Search Feature
// Run this in browser console or use as test script

const testInternetSearchFeature = async () => {
  console.log('🧪 Testing AIChatbot Internet Search Feature...\n');

  const apiEndpoint = 'http://localhost:5000/api/chatbot/chat';

  // Test cases categorized by feature
  const testCases = {
    // Internet search triggers
    internetSearchQueries: [
      {
        query: 'latest Hindu festivals 2025',
        expectedBehavior: 'Should trigger internet search and return current festival information',
        shouldSearch: true
      },
      {
        query: 'current information about Navratri',
        expectedBehavior: 'Should search for recent Navratri details',
        shouldSearch: true
      },
      {
        query: 'detailed information about Hanuman Chalisa',
        expectedBehavior: 'Should fetch comprehensive Hanuman Chalisa information',
        shouldSearch: true
      },
      {
        query: 'recent updates on Diwali celebration',
        expectedBehavior: 'Should search for current Diwali information',
        shouldSearch: true
      },
      {
        query: 'comprehensive guide to Vedic mantras',
        expectedBehavior: 'Should fetch detailed mantra information',
        shouldSearch: true
      }
    ],

    // Local knowledge queries (should NOT trigger search)
    localKnowledgeQueries: [
      {
        query: 'गायत्री मंत्र क्या है?',
        expectedBehavior: 'Should return local Gayatri Mantra knowledge',
        shouldSearch: false
      },
      {
        query: 'मेरी राशि क्या है?',
        expectedBehavior: 'Should return local astrology guidance',
        shouldSearch: false
      },
      {
        query: 'कुंडली कैसे बनवाएं?',
        expectedBehavior: 'Should return local kundali information',
        shouldSearch: false
      }
    ],

    // Hindu keyword validation
    hinduContentFilter: [
      {
        query: 'latest technology trends',
        expectedBehavior: 'Should NOT search (non-Hindu content)',
        shouldSearch: false
      },
      {
        query: 'current political news',
        expectedBehavior: 'Should NOT search (non-Hindu content)',
        shouldSearch: false
      },
      {
        query: 'latest cricket scores',
        expectedBehavior: 'Should NOT search (non-Hindu content)',
        shouldSearch: false
      }
    ],

    // Mixed language queries
    mixedLanguageQueries: [
      {
        query: 'आज का Hindu festival कौन सा है?',
        expectedBehavior: 'Should handle Hindi-English mix and search if current',
        shouldSearch: true
      },
      {
        query: 'विस्तृत जानकारी about Shiva temples',
        expectedBehavior: 'Should trigger search for detailed temple information',
        shouldSearch: true
      }
    ]
  };

  let totalTests = 0;
  let passedTests = 0;

  // Test each category
  for (const [category, queries] of Object.entries(testCases)) {
    console.log(`\n📁 Testing Category: ${category.toUpperCase()}`);
    console.log('=' * 50);

    for (let i = 0; i < queries.length; i++) {
      const testCase = queries[i];
      totalTests++;

      console.log(`\n🔍 Test ${totalTests}: "${testCase.query}"`);
      console.log(`Expected: ${testCase.expectedBehavior}`);

      try {
        const startTime = Date.now();
        
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: testCase.query
          })
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        const data = await response.json();
        
        if (data.success) {
          const responseText = data.response;
          
          // Check for internet search indicators
          const hasInternetIndicator = responseText.includes('🌐') || 
                                     responseText.includes('इंटरनेट से प्राप्त') ||
                                     responseText.includes('internet search');
          
          // Check if response matches expected search behavior
          const searchExpectationMet = testCase.shouldSearch === hasInternetIndicator;
          
          // Response time check (internet searches should be slower)
          const responseTimeOk = testCase.shouldSearch ? 
            responseTime > 1000 : // Internet search should take more time
            responseTime < 2000;   // Local responses should be faster

          if (searchExpectationMet && responseTimeOk) {
            passedTests++;
            console.log(`✅ PASS (${responseTime}ms)`);
            console.log(`   Search triggered: ${hasInternetIndicator}`);
            console.log(`   Response preview: ${responseText.substring(0, 100)}...`);
          } else {
            console.log(`❌ FAIL (${responseTime}ms)`);
            console.log(`   Expected search: ${testCase.shouldSearch}`);
            console.log(`   Actual search: ${hasInternetIndicator}`);
            console.log(`   Response: ${responseText.substring(0, 150)}...`);
          }
        } else {
          console.log('❌ API Error:', data.message);
        }
      } catch (error) {
        console.log('🔌 Network Error:', error.message);
      }
    }
  }

  // Summary
  console.log('\n' + '=' * 60);
  console.log(`📊 TEST SUMMARY`);
  console.log('=' * 60);
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! Internet search feature is working correctly.');
  } else {
    console.log(`\n⚠️ ${totalTests - passedTests} tests failed. Please review the implementation.`);
  }

  return {
    total: totalTests,
    passed: passedTests,
    failed: totalTests - passedTests,
    successRate: (passedTests / totalTests) * 100
  };
};

// Test individual search function
const testSearchAPI = async () => {
  console.log('\n🔧 Testing Individual Search Components...\n');

  const testQueries = [
    'Hindu festivals',
    'Gayatri Mantra',
    'Navratri celebration',
    'Vedic mantras',
    'Hanuman Chalisa'
  ];

  for (const query of testQueries) {
    console.log(`Testing search for: "${query}"`);
    
    try {
      // Test DuckDuckGo API directly
      const duckUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query + ' Hindu religion')}&format=json&no_html=1&skip_disambig=1`;
      
      const response = await fetch(duckUrl);
      const data = await response.json();
      
      console.log(`  DuckDuckGo Results: ${data.Abstract ? 'Found' : 'Not found'}`);
      if (data.Abstract) {
        console.log(`    Abstract: ${data.Abstract.substring(0, 100)}...`);
      }
      
    } catch (error) {
      console.log(`  DuckDuckGo Error: ${error.message}`);
    }

    try {
      // Test Wikipedia API
      const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
      
      const wikiResponse = await fetch(wikiUrl);
      const wikiData = await wikiResponse.json();
      
      console.log(`  Wikipedia Results: ${wikiData.extract ? 'Found' : 'Not found'}`);
      if (wikiData.extract) {
        console.log(`    Extract: ${wikiData.extract.substring(0, 100)}...`);
      }
      
    } catch (error) {
      console.log(`  Wikipedia Error: ${error.message}`);
    }

    console.log(''); // Empty line
  }
};

// Performance testing
const testPerformance = async () => {
  console.log('\n⚡ Performance Testing...\n');

  const performanceQueries = [
    'गायत्री मंत्र क्या है?', // Local (should be fast)
    'latest Hindu festivals', // Internet (should be slower)
    'कुंडली कैसे बनवाएं?', // Local (should be fast)
    'detailed information about Navratri' // Internet (should be slower)
  ];

  const results = [];

  for (const query of performanceQueries) {
    const times = [];
    
    console.log(`Testing performance for: "${query}"`);
    
    // Run 3 tests for each query
    for (let i = 0; i < 3; i++) {
      const startTime = Date.now();
      
      try {
        const response = await fetch('http://localhost:5000/api/chatbot/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: query })
        });
        
        const data = await response.json();
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        times.push(responseTime);
        
      } catch (error) {
        console.log(`  Test ${i + 1} failed: ${error.message}`);
      }
    }
    
    if (times.length > 0) {
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);
      
      results.push({
        query,
        avgTime,
        minTime,
        maxTime,
        times
      });
      
      console.log(`  Average: ${avgTime.toFixed(0)}ms (Min: ${minTime}ms, Max: ${maxTime}ms)`);
    }
    
    console.log('');
  }

  return results;
};

// Usage instructions
console.log(`
🚀 AIChatbot Internet Search Test Suite

Available test functions:
1. testInternetSearchFeature() - Comprehensive feature test
2. testSearchAPI() - Test external APIs directly
3. testPerformance() - Performance benchmarking

Example usage:
- await testInternetSearchFeature()
- await testSearchAPI()
- await testPerformance()

Make sure your backend server is running on http://localhost:5000
`);

// Export functions for browser usage
if (typeof window !== 'undefined') {
  window.testInternetSearchFeature = testInternetSearchFeature;
  window.testSearchAPI = testSearchAPI;
  window.testPerformance = testPerformance;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testInternetSearchFeature,
    testSearchAPI,
    testPerformance
  };
}