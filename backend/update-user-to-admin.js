const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function updateUserToAdmin() {
  try {
    console.log('🔧 Updating user to admin...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/astrology';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Get user email from command line or use default
    const userEmail = process.argv[2] || 'your-email@example.com';
    
    console.log(`🔍 Looking for user with email: ${userEmail}`);
    
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.log('❌ User not found. Available users:');
      const allUsers = await User.find({}).select('name email role');
      allUsers.forEach(u => {
        console.log(`   - ${u.name} (${u.email}) - Role: ${u.role}`);
      });
      return;
    }
    
    // Update user role to admin
    user.role = 'admin';
    user.isVerified = true;
    await user.save();
    
    console.log('✅ User updated to admin successfully!');
    console.log(`   👤 Name: ${user.name}`);
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   🔑 Role: ${user.role}`);
    
    console.log('\n🎉 You can now login and access the admin panel!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateUserToAdmin();


