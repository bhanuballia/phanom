require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const reset = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const email = 'hony@astroconsult.com';
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User ${email} not found`);
      return;
    }

    user.password = 'password123';
    await user.save();
    console.log(`Password reset successfully for ${email} to "password123"`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.connection.close();
  }
};

reset();
