// Test cases for video chat validation functionality
// These tests demonstrate how the validation system works

const testValidation = () => {
  // Validation function (same as in VideoChat.jsx)
  const validateMessage = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Phone number patterns (various formats)
    const phonePatterns = [
      /\b\d{10}\b/, // 10 digits
      /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, // US format
      /\b\+?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}\b/, // International
      /\b\d{5}[-.\s]?\d{5}\b/, // Indian format
      /\b(phone|call|number|mobile|contact)[\s:]*\d/i
    ];
    
    // Email patterns
    const emailPatterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
      /\b(email|mail|gmail|yahoo|hotmail|outlook)[\s:]*[A-Za-z0-9._%+-]*@?[A-Za-z0-9.-]*\b/i
    ];
    
    // WhatsApp patterns
    const whatsappPatterns = [
      /\b(whatsapp|whats app|wa|watsapp)\b/i,
      /\b(whatsapp|whats app|wa)[\s:]*\+?\d/i
    ];
    
    // Instagram patterns
    const instagramPatterns = [
      /\b(instagram|insta|ig)\b/i,
      /\b@[A-Za-z0-9._]+\b/,
      /\b(instagram|insta|ig)[\s:]*[A-Za-z0-9._]/i
    ];
    
    // Facebook patterns
    const facebookPatterns = [
      /\b(facebook|fb|face book)\b/i,
      /\bfacebook\.com\b/i,
      /\b(facebook|fb)[\s:]*[A-Za-z0-9._]/i
    ];
    
    // Check for phone numbers
    for (const pattern of phonePatterns) {
      if (pattern.test(message)) {
        return { isValid: false, violationType: 'phone number' };
      }
    }
    
    // Check for emails
    for (const pattern of emailPatterns) {
      if (pattern.test(message)) {
        return { isValid: false, violationType: 'email address' };
      }
    }
    
    // Check for WhatsApp
    for (const pattern of whatsappPatterns) {
      if (pattern.test(message)) {
        return { isValid: false, violationType: 'WhatsApp contact' };
      }
    }
    
    // Check for Instagram
    for (const pattern of instagramPatterns) {
      if (pattern.test(message)) {
        return { isValid: false, violationType: 'Instagram ID' };
      }
    }
    
    // Check for Facebook
    for (const pattern of facebookPatterns) {
      if (pattern.test(message)) {
        return { isValid: false, violationType: 'Facebook profile' };
      }
    }
    
    return { isValid: true };
  };

  // Test cases
  const testCases = [
    // Valid messages
    { message: "Hello, how are you?", expected: true, description: "Normal greeting" },
    { message: "Thank you for the consultation", expected: true, description: "Appreciation message" },
    { message: "Can you explain about my horoscope?", expected: true, description: "Astrology question" },
    
    // Phone number violations
    { message: "Call me at 9876543210", expected: false, description: "10-digit phone number" },
    { message: "My number is 123-456-7890", expected: false, description: "US format phone" },
    { message: "Contact: +91 98765 43210", expected: false, description: "International format" },
    { message: "phone: 12345", expected: false, description: "Phone keyword with numbers" },
    
    // Email violations
    { message: "Email me at john@example.com", expected: false, description: "Email address" },
    { message: "My gmail is user123@gmail.com", expected: false, description: "Gmail address" },
    { message: "mail: contact@domain.org", expected: false, description: "Email with keyword" },
    
    // WhatsApp violations
    { message: "WhatsApp me later", expected: false, description: "WhatsApp mention" },
    { message: "Send on whats app", expected: false, description: "WhatsApp alternative spelling" },
    { message: "WA me", expected: false, description: "WhatsApp abbreviation" },
    
    // Instagram violations
    { message: "Follow me on Instagram", expected: false, description: "Instagram mention" },
    { message: "My insta is @user123", expected: false, description: "Instagram handle" },
    { message: "Check my IG profile", expected: false, description: "Instagram abbreviation" },
    
    // Facebook violations
    { message: "Add me on Facebook", expected: false, description: "Facebook mention" },
    { message: "My FB profile", expected: false, description: "Facebook abbreviation" },
    { message: "facebook.com/myprofile", expected: false, description: "Facebook URL" },
  ];

  console.log("🧪 Running Video Chat Validation Tests...\n");

  let passedTests = 0;
  let totalTests = testCases.length;

  testCases.forEach((testCase, index) => {
    const result = validateMessage(testCase.message);
    const passed = result.isValid === testCase.expected;
    
    if (passed) {
      passedTests++;
      console.log(`✅ Test ${index + 1}: ${testCase.description}`);
    } else {
      console.log(`❌ Test ${index + 1}: ${testCase.description}`);
      console.log(`   Message: "${testCase.message}"`);
      console.log(`   Expected: ${testCase.expected ? 'Valid' : 'Invalid'}`);
      console.log(`   Got: ${result.isValid ? 'Valid' : `Invalid (${result.violationType})`}`);
    }
  });

  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log("🎉 All tests passed! Validation system is working correctly.");
  } else {
    console.log("⚠️ Some tests failed. Please review the validation logic.");
  }
};

// Run tests if this file is executed directly
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testValidation };
} else {
  // Browser environment
  testValidation();
}