require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

const testLogin = async () => {
    console.log('--- Diagnosis Start ---');

    // 1. Check Env Vars
    console.log('Checking Environment Variables:');
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    if (process.env.MONGODB_URI) {
        console.log('MONGODB_URI length:', process.env.MONGODB_URI.length);
    } else {
        console.error('CRITICAL: MONGODB_URI is missing!');
        process.exit(1);
    }

    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    if (!process.env.JWT_SECRET) {
        console.error('CRITICAL: JWT_SECRET is missing!');
        process.exit(1);
    }

    // 2. Test DB Connection
    console.log('\nTesting Database Connection...');
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB successfully.');
    } catch (err) {
        console.error('❌ MongoDB Connection Failed:', err.message);
        process.exit(1);
    }

    // 3. Test Login Logic (Simulate)
    console.log('\nTesting Login Logic...');
    const email = 'test@example.com'; // Simulate a login attempt
    const password = 'password123';

    try {
        // Check if user exists (just to verify query works)
        console.log(`Searching for user: ${email}...`);
        const user = await User.findOne({ email });
        console.log('Query executed successfully.');

        if (user) {
            console.log('User found.');
        } else {
            console.log('User not found (this matches behavior if no user is in DB, but query worked).');
        }

        // Simulate Token Generation
        console.log('Testing Token Generation...');
        const token = jwt.sign(
            { userId: 'test_id_123' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        console.log('✅ Token generated successfully:', token.substring(0, 20) + '...');

    } catch (err) {
        console.error('❌ Error during login simulation:', err);
    } finally {
        await mongoose.connection.close();
        console.log('\n--- Diagnosis Complete ---');
    }
};

testLogin();
