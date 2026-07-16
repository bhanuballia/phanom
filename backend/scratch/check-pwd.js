require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const email = 'hony@astroconsult.com';
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User ${email} not found`);
      return;
    }

    console.log('User found in DB:', user.email);
    console.log('Password hash in DB:', user.password);

    // Test password match locally
    const isMatch = await bcrypt.compare('password123', user.password);
    console.log('Does "password123" match hash?', isMatch);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.connection.close();
  }
};

check();
