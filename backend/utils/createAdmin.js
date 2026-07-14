require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
    const name = process.argv[2];
    const email = process.argv[3];
    const password = process.argv[4];
    const phone = process.argv[5] || '0000000000';

    if (!name || !email || !password) {
        console.log('Usage: node createAdmin.js <name> <email> <password> [phone]');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to Database');

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log(`❌ Error: User with email ${email} already exists.`);
            console.log('Use utils/addAdmin.js if you want to promote an existing user.');
            process.exit(1);
        }

        const admin = new User({
            name,
            email,
            password, // Will be hashed by User model pre-save hook
            phone,
            dateOfBirth: new Date('1990-01-01'),
            timeOfBirth: '12:00',
            placeOfBirth: 'Default',
            role: 'admin',
            isVerified: true,
            registrationSource: 'admin_created'
        });

        await admin.save();
        console.log(`✅ Admin created successfully:`);
        console.log(`Name: ${name}`);
        console.log(`Email: ${email}`);
        console.log(`Role: ${admin.role}`);

    } catch (err) {
        console.error('❌ Error creating admin:', err.message);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

createAdmin();
