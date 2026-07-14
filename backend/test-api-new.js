const axios = require('axios');

async function testNameNumber() {
    const baseUrl = 'http://localhost:7071/api/Calculate';

    console.log('--- Testing NameNumber Logic ---');
    const testCases = [
        { input: '123', expected: 123, desc: 'Number only' },
        { input: '32A', expected: 6, desc: 'Mixed: 3+2 + A(1) = 6' },
        { input: 'J Doe', expected: 26, desc: 'J(initial 10) + D(4)+O(7)+E(5) = 26' },
        { input: 'Mr. John Doe', expected: 34, desc: 'Ignore Mr., John(18) + Doe(16) = 34' },
        { input: 'Dr. John Doe', expected: 40, desc: 'Keep Dr(6), John(18) + Doe(16) = 40' }
    ];

    for (const tc of testCases) {
        try {
            const encodedInput = encodeURIComponent(tc.input);
            const url = `${baseUrl}/NameNumber/InputText/${encodedInput}`;
            const response = await axios.get(url);
            const actual = response.data.Payload;
            const status = actual == tc.expected ? 'PASS' : 'FAIL';
            console.log(`[${status}] ${tc.desc}: Input="${tc.input}", Expected=${tc.expected}, Actual=${actual}`);
        } catch (error) {
            console.error(`[ERROR] ${tc.desc}: ${error.message}`);
        }
    }

    console.log('\n--- Testing NameNumberPrediction ---');
    try {
        const input = 'John Doe';
        const encodedInput = encodeURIComponent(input);
        const url = `${baseUrl}/NameNumberPrediction/FullName/${encodedInput}`;
        const response = await axios.get(url);
        console.log(`Input="${input}", Response:`, JSON.stringify(response.data.Payload, null, 2));
    } catch (error) {
        console.error(`[ERROR] NameNumberPrediction: ${error.message}`);
    }
}

testNameNumber();
