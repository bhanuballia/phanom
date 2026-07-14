const chatbotController = require('./controllers/chatbotController');

async function testAllAartis() {
  console.log('Testing all Aartis...\n');
  
  const testCases = [
    { query: "लक्ष्मी जी की आरती", name: "Lakshmi Ji Aarti" },
    { query: "विष्णु जी की आरती", name: "Vishnu Ji Aarti" },
    { query: "शिव जी की आरती", name: "Shiv Ji Aarti" },
    { query: "दुर्गा जी की आरती", name: "Durga Ji Aarti" },
    { query: "हनुमान जी की आरती", name: "Hanuman Ji Aarti" },
    { query: "राम जी की आरती", name: "Ram Ji Aarti" },
    { query: "कृष्ण जी की आरती", name: "Krishna Ji Aarti" },
    { query: "साई बाबा की आरती", name: "Sai Baba Aarti" },
    { query: "गणेश जी की आरती", name: "Ganesh Ji Aarti" }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.name}`);
      const response = await chatbotController.generateIntelligentResponse(testCase.query);
      console.log(`✅ ${testCase.name} - Success`);
      console.log(response.substring(0, 100) + '...\n');
    } catch (error) {
      console.log(`❌ ${testCase.name} - Error: ${error.message}\n`);
    }
  }

  // Test English queries as well
  console.log('Testing English queries...\n');
  
  const englishTestCases = [
    { query: "lakshmi aarti", name: "Lakshmi Aarti (English)" },
    { query: "vishnu aarti", name: "Vishnu Aarti (English)" },
    { query: "shiv aarti", name: "Shiv Aarti (English)" },
    { query: "durga aarti", name: "Durga Aarti (English)" },
    { query: "hanuman aarti", name: "Hanuman Aarti (English)" },
    { query: "ram aarti", name: "Ram Aarti (English)" },
    { query: "krishna aarti", name: "Krishna Aarti (English)" },
    { query: "sai baba aarti", name: "Sai Baba Aarti (English)" },
    { query: "ganesh aarti", name: "Ganesh Aarti (English)" }
  ];

  for (const testCase of englishTestCases) {
    try {
      console.log(`Testing: ${testCase.name}`);
      const response = await chatbotController.generateIntelligentResponse(testCase.query);
      console.log(`✅ ${testCase.name} - Success`);
      console.log(response.substring(0, 100) + '...\n');
    } catch (error) {
      console.log(`❌ ${testCase.name} - Error: ${error.message}\n`);
    }
  }

  console.log('All tests completed!');
}

testAllAartis();