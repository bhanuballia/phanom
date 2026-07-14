const { generateIntelligentResponse } = require('./controllers/chatbotController');

// Mock user context
const contextWithBirth = {
    name: "John Doe",
    dob: "1990-01-01",
    tob: "12:00",
    pob: "London",
    userId: "101"
};

const contextWithoutBirth = {
    name: "Guest",
    userId: "Guest-123"
};

async function runTests() {
    console.log('🧪 Testing Enforce VedAstro-Only Logic...\n');

    // Test 1: With Birth Details (Should try VedAstro)
    console.log('Test 1: Query WITH birth details');
    try {
        const response1 = await generateIntelligentResponse("What is my career future?", contextWithBirth);
        console.log('Response 1:', response1);
        if (response1.includes('VedAstro') || response1.includes('गणना इंजन')) {
            console.log('✅ PASS: VedAstro path taken.\n');
        } else {
            console.log('❌ FAIL: Unexpected response source.\n');
        }
    } catch (e) {
        console.log('Error 1:', e.message);
    }

    // Test 2: Without Birth Details (Should prompt for details)
    console.log('Test 2: Query WITHOUT birth details');
    try {
        const response2 = await generateIntelligentResponse("What is my career future?", contextWithoutBirth);
        console.log('Response 2:', response2);
        if (response2.includes('विवरण भरें') || response2.includes('birth details')) {
            console.log('✅ PASS: Prompted for birth details.\n');
        } else {
            console.log('❌ FAIL: Did not prompt for birth details.\n');
        }
    } catch (e) {
        console.log('Error 2:', e.message);
    }

    // Test 3: Greeting (Should give minimal local greeting)
    console.log('Test 3: Greeting WITHOUT birth details');
    try {
        const response3 = await generateIntelligentResponse("Hello", contextWithoutBirth);
        console.log('Response 3:', response3);
        if (response3.includes('नमस्ते') && response3.includes('जन्म विवरण')) {
            console.log('✅ PASS: Minimal local greeting given.\n');
        } else {
            console.log('❌ FAIL: Greeting logic failed.\n');
        }
    } catch (e) {
        console.log('Error 3:', e.message);
    }
}

runTests();
