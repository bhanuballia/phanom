// test-internet-search-trigger.js
// Test to see if internet search is being triggered unnecessarily

// Test the needsInternetSearch function by recreating it
const needsInternetSearch = (query) => {
  const internetTriggers = [
    'latest', 'current', 'today', 'this year', '2025', 'recent',
    'update', 'new', 'modern', 'contemporary', 'now', 'currently',
    'अभी', 'आज', 'नया', 'ताजा', 'वर्तमान', 'हाल ही में'
  ];

  const complexQueries = [
    'detailed information', 'complete guide', 'comprehensive',
    'विस्तृत जानकारी', 'पूरी जानकारी', 'संपूर्ण गाइड'
  ];

  const unknownTerms = [
    'never heard', 'don\'t know', 'explain', 'what exactly',
    'नहीं पता', 'समझाइए', 'क्या है', 'बताइए'
  ];

  return internetTriggers.some(trigger => query.toLowerCase().includes(trigger)) ||
         complexQueries.some(trigger => query.toLowerCase().includes(trigger)) ||
         unknownTerms.some(trigger => query.toLowerCase().includes(trigger));
};

console.log('🔍 Testing Internet Search Trigger Logic');
console.log('=====================================');

// Test cases that should use local knowledge base but might trigger internet search
const testCases = [
  { message: 'detailed information about ज्योतिष', description: 'Detailed astrology info' },
  { message: 'current information about कुंडली', description: 'Current kundali info' },
  { message: 'latest updates on गायत्री', description: 'Latest Gayatri info' },
  { message: 'ज्योतिष', description: 'Simple astrology query (should not trigger internet)' },
  { message: 'कुंडली', description: 'Simple kundali query (should not trigger internet)' }
];

for (const testCase of testCases) {
  console.log(`\nTesting: ${testCase.description}`);
  console.log(`Message: "${testCase.message}"`);
  
  // Check if internet search would be triggered
  const needsSearch = needsInternetSearch(testCase.message);
  console.log(`Needs internet search: ${needsSearch ? '✅ YES' : '❌ NO'}`);
}

console.log('\n\nTesting needsInternetSearch function directly:');
const searchTriggerTests = [
  'latest information about Diwali',
  'detailed information about Gayatri Mantra',
  'current Hindu festivals',
  'ज्योतिष', // Should not trigger
  'कुंडली', // Should not trigger
  'simple question' // Should not trigger
];

for (const test of searchTriggerTests) {
  const needsSearch = needsInternetSearch(test);
  console.log(`"${test}" -> ${needsSearch ? 'TRIGGERS internet search' : 'LOCAL knowledge base'}`);
}