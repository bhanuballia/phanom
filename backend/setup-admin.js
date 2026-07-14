const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function setupAdmin() {
  try {
    console.log('🔧 Setting up admin user...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/astrology';
    console.log('📡 Connecting to MongoDB...');
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Check if admin already exists
    console.log('🔍 Checking for existing admin user...');
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists:');
      console.log(`   📧 Email: ${existingAdmin.email}`);
      console.log(`   👤 Name: ${existingAdmin.name}`);
      console.log(`   🔑 Role: ${existingAdmin.role}`);
      console.log(`   ✅ Verified: ${existingAdmin.isVerified}`);
      console.log('\n🎉 You can now login with:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log('   Password: admin123 (if this is the default admin)');
      return;
    }
    
    // Create admin user
    console.log('👤 Creating new admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@astroconsult.com',
      password: hashedPassword,
      phone: '1234567890',
      dateOfBirth: new Date('1990-01-01'),
      timeOfBirth: '12:00',
      placeOfBirth: 'Delhi, India',
      role: 'admin',
      isVerified: true,
      registrationSource: 'admin_created'
    });
    
    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('\n🎉 Admin Login Credentials:');
    console.log('   📧 Email: admin@astroconsult.com');
    console.log('   🔑 Password: admin123');
    console.log('\n📝 Next Steps:');
    console.log('   1. Start the backend server: npm start');
    console.log('   2. Start the frontend: cd ../frontend && npm run dev');
    console.log('   3. Go to http://localhost:5173/login');
    console.log('   4. Login with the admin credentials above');
    console.log('   5. You should see the Admin button in the navigation');
    console.log('   6. Click Admin to access the admin dashboard');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up admin:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 MongoDB is not running. Please:');
      console.log('   1. Install MongoDB if not installed');
      console.log('   2. Start MongoDB service');
      console.log('   3. Run this script again');
    } else if (error.message.includes('EADDRINUSE')) {
      console.log('\n💡 Port is already in use. Please:');
      console.log('   1. Stop any running MongoDB instances');
      console.log('   2. Run this script again');
    }
    
    process.exit(1);
  }
}

setupAdmin();


