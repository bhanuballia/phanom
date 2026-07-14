const axios = require('axios');

// Test data for registration
const testUserData = {
  name: 'Test User',
  email: `test.user.${Date.now()}@example.com`, // Unique email
  password: 'testpassword123',
  phone: '+1234567890',
  dateOfBirth: '1990-01-15',
  timeOfBirth: '10:30',
  placeOfBirth: 'Mumbai, India',
  role: 'client',
  registrationSource: 'web_form',
  registrationTimestamp: new Date().toISOString()
};

// Function to test registration
const testRegistration = async () => {
  try {
    console.log('🧪 Testing user registration...');
    console.log('📤 Sending registration data:', {
      ...testUserData,
      password: '[HIDDEN]'
    });

    const response = await axios.post('http://localhost:5000/api/auth/register', testUserData);
    
    console.log('✅ Registration successful!');
    console.log('📊 Response status:', response.status);
    console.log('🎉 Response data:', {
      success: response.data.success,
      message: response.data.message,
      userId: response.data.user?._id,
      userRole: response.data.user?.role,
      tokenReceived: !!response.data.token
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Registration failed!');
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('💬 Error message:', error.response.data.message);
    } else {
      console.error('🔌 Network error:', error.message);
    }
    throw error;
  }
};

// Function to test login with registered user
const testLogin = async (email, password) => {
  try {
    console.log('\n🔐 Testing login with registered user...');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email,
      password
    });
    
    console.log('✅ Login successful!');
    console.log('🎟️ Token received:', !!response.data.token);
    console.log('👤 User data:', {
      id: response.data.user._id,
      name: response.data.user.name,
      email: response.data.user.email,
      role: response.data.user.role
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Login failed!');
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('💬 Error message:', error.response.data.message);
    }
    throw error;
  }
};

// Run the tests
const runTests = async () => {
  try {
    console.log('🚀 Starting registration system tests...\n');
    
    // Test registration
    const registrationResult = await testRegistration();
    
    // Test login with the registered user
    await testLogin(testUserData.email, testUserData.password);
    
    console.log('\n🎊 All tests passed! Registration system is working properly.');
    
  } catch (error) {
    console.log('\n💥 Test failed. Please check the server and database connection.');
    process.exit(1);
  }
};

// Check if server is running
const checkServer = async () => {
  try {
    await axios.get('http://localhost:5000/api/auth/astrologers');
    console.log('🟢 Server is running on port 5000');
    return true;
  } catch (error) {
    console.log('🔴 Server is not running on port 5000');
    console.log('📝 Please start the backend server with: npm run dev');
    return false;
  }
};

// Main execution
const main = async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runTests();
  }
};

main();