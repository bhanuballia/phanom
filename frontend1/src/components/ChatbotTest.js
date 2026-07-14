// Test script for AIChatbot Gayatri Mantra functionality
// Run this in browser console to test the chatbot responses

const testChatbotResponses = async () => {
  console.log('🧪 Testing AIChatbot Gayatri Mantra Functionality...\n');

  const testQueries = [
    // Different variations of Gayatri Mantra queries
    'गायत्री मंत्र',
    'Gayatri Mantra',
    'गायत्री मंत्र बताइए',
    'what is Gayatri Mantra',
    'tell me Gayatri Mantra',
    'Gayatri mantra kya hai',
    'महामंत्र',
    'mahamantra'
  ];

  const apiEndpoint = 'http://localhost:5000/api/chatbot/chat';

  for (let i = 0; i < testQueries.length; i++) {
    const query = testQueries[i];
    console.log(`\n📝 Test ${i + 1}: "${query}"`);
    
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: query
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Response received:');
        console.log(data.response);
        
        // Check if response contains Gayatri Mantra
        const hasGayatriContent = data.response.includes('गायत्री') || 
                                 data.response.includes('भूर्भुवः स्वः') ||
                                 data.response.includes('तत्सवितुर्वरेण्यं');
        
        if (hasGayatriContent) {
          console.log('🎯 CORRECT: Response contains Gayatri Mantra content');
        } else {
          console.log('❌ INCORRECT: Response does not contain expected Gayatri Mantra content');
        }
      } else {
        console.log('❌ API Error:', data.message);
      }
    } catch (error) {
      console.log('🔌 Network Error:', error.message);
    }
  }

  console.log('\n🏁 Test completed!');
};

// Test phonetic corrections function
const testPhoneticCorrections = () => {
  console.log('\n🔤 Testing Phonetic Corrections...\n');

  const phoneticCorrections = {
    // Gayatri Mantra variations
    'गायत्री मंत्र': 'गायत्री मंत्र',
    'gayatri mantra': 'गायत्री मंत्र',
    'गयत्री': 'गायत्री',
    'गायत्री': 'गायत्री',
    'gayatri': 'गायत्री',
    'gayathri': 'गायत्री',
    'gayathree': 'गायत्री',
    
    // Common mispronunciations
    'what is gayatri mantra': 'गायत्री मंत्र क्या है',
    'tell me gayatri mantra': 'गायत्री मंत्र बताइए',
    'गायत्री मंत्र बताओ': 'गायत्री मंत्र बताइए',
    'gayatri mantra bataiye': 'गायत्री मंत्र बताइए'
  };

  const improveVoiceTranscript = (transcript) => {
    let improved = transcript.toLowerCase().trim();
    
    // Apply corrections
    for (const [wrong, correct] of Object.entries(phoneticCorrections)) {
      const regex = new RegExp(wrong.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'), 'gi');
      improved = improved.replace(regex, correct);
    }
    
    // Handle mixed language queries better
    if (improved.includes('gayatri') && improved.includes('mantra')) {
      improved = 'गायत्री मंत्र बताइए';
    }
    
    return improved;
  };

  const testInputs = [
    'gayatri mantra',
    'what is gayatri mantra',
    'tell me gayatri mantra',
    'गयत्री',
    'gayathri mantra'
  ];

  testInputs.forEach((input, index) => {
    const corrected = improveVoiceTranscript(input);
    console.log(`📝 Test ${index + 1}:`);
    console.log(`  Input: "${input}"`);
    console.log(`  Corrected: "${corrected}"`);
    console.log(`  ✅ ${corrected.includes('गायत्री') ? 'PASS' : 'FAIL'}`);
    console.log();
  });
};

// Usage instructions
console.log(`
🚀 AIChatbot Test Suite

To run tests:
1. testChatbotResponses() - Test backend API responses
2. testPhoneticCorrections() - Test voice input corrections

Example usage:
- testChatbotResponses()
- testPhoneticCorrections()

Make sure your backend server is running on http://localhost:5000
`);

// Auto-run phonetic tests
testPhoneticCorrections();

// Export functions for browser usage
if (typeof window !== 'undefined') {
  window.testChatbotResponses = testChatbotResponses;
  window.testPhoneticCorrections = testPhoneticCorrections;
}