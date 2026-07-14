require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const addAdmin = async (email) => {
    if (!email) {
        console.error('Usage: node addAdmin.js <email>');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to Database');

        const user = await User.findOne({ email });

        if (user) {
            user.role = 'admin';
            await user.save();
            console.log(`✅ User ${user.name} (${email}) has been promoted to Admin.`);
        } else {
            console.log(`❌ User with email ${email} not found.`);
            console.log('Please register the user first via the website, then run this script to promote them.');
        }

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

const email = process.argv[2];
addAdmin(email);
