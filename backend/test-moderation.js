const { validateMessage } = require('./services/moderationService');

const testCases = [
  // 1. Clean messages
  { text: "Hello, I want to ask about my career prediction.", expectedValid: true },
  { text: "My birth date is 15th August 1995.", expectedValid: true },

  // 2. English profanity
  { text: "You are a fucking idiot", expectedValid: false, expectedViolation: "profanity / abusive language" },
  { text: "fuck this system", expectedValid: false, expectedViolation: "profanity / abusive language" },

  // 3. Hindi profanity (Devanagari)
  { text: "तू चूतिया है क्या?", expectedValid: false, expectedViolation: "profanity / abusive language" },
  { text: "गांडू साला", expectedValid: false, expectedViolation: "profanity / abusive language" },

  // 4. Hinglish profanity
  { text: "behenchod get lost", expectedValid: false, expectedViolation: "profanity / abusive language" },
  { text: "kamina astologer", expectedValid: false, expectedViolation: "profanity / abusive language" },

  // 5. Obfuscated / bypass attempts
  { text: "chut!ya pathak", expectedValid: false, expectedViolation: "profanity / abusive language" },
  { text: "c h u t i y a", expectedValid: false, expectedViolation: "profanity / abusive language" },
  { text: "chutiyaaaaa", expectedValid: false, expectedViolation: "profanity / abusive language" },
  { text: "f*ck", expectedValid: false, expectedViolation: "profanity / abusive language" },

  // 6. Contact Information Requests
  { text: "give your number please", expectedValid: false, expectedViolation: "contact information request" },
  { text: "let's connect on whatsapp", expectedValid: false, expectedViolation: "whatsapp contact/information" },

  // 7. PII / Phone Numbers
  { text: "My number is 9876543210", expectedValid: false, expectedViolation: "phone contact/information" },
  { text: "Email me: user@domain.com", expectedValid: false, expectedViolation: "email contact/information" },
  { text: "gmail: test at gmail dot com", expectedValid: false, expectedViolation: "email contact/information" },

  // 8. Romance/scam/threats
  { text: "be my girlfriend", expectedValid: false, expectedViolation: "contact information request" },
  { text: "I'll kill you if you lie", expectedValid: false, expectedViolation: "threat / abusive language" },
  { text: "Send me money via UPI", expectedValid: false, expectedViolation: "scam / financial request" }
];

console.log("=== RUNNING CONTENT MODERATION TESTS ===");
let passed = 0;
let failed = 0;

for (const tc of testCases) {
  const result = validateMessage(tc.text);
  const isMatch = result.isValid === tc.expectedValid;
  const violationMatch = tc.expectedValid || (result.violationType === tc.expectedViolation);

  if (isMatch && violationMatch) {
    console.log(`[PASS] Input: "${tc.text}" -> Valid: ${result.isValid} ${!result.isValid ? `(Violation: ${result.violationType})` : ""}`);
    passed++;
  } else {
    console.error(`[FAIL] Input: "${tc.text}"`);
    console.error(`       Expected: Valid=${tc.expectedValid}, Violation=${tc.expectedViolation}`);
    console.error(`       Got:      Valid=${result.isValid}, Violation=${result.violationType}`);
    failed++;
  }
}

console.log("\n=== TEST SUMMARY ===");
console.log(`Total tests: ${testCases.length}`);
console.log(`Passed:      ${passed}`);
console.log(`Failed:      ${failed}`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log("All tests passed successfully!");
  process.exit(0);
}
