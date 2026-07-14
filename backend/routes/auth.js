const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Astrologer = require('../models/Astrologer');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      if (mongoose.connection.readyState === 2) {
        console.log('DB is connecting... waiting for connection to establish');
        // Wait for connection to establish (max 5 seconds)
        await new Promise((resolve) => {
          let attempts = 0;
          const interval = setInterval(() => {
            attempts++;
            if (mongoose.connection.readyState === 1 || attempts > 50) {
              clearInterval(interval);
              resolve();
            }
          }, 100);
        });
      }

      if (mongoose.connection.readyState !== 1) {
        console.error('DB Connection Error: MongoDB is not connected (readyState: ' + mongoose.connection.readyState + ')');
        return res.status(503).json({ message: 'Service temporarily unavailable: Database connection error' });
      }
    }

    const {
      name,
      email,
      password,
      phone,
      dateOfBirth,
      timeOfBirth,
      placeOfBirth,
      role,
      qualification,
      experience,
      specialization,
      pricing,
      latitude,
      longitude,
      timezone
    } = req.body;

    // Enhanced validation
    if (!name || !email || !password || !phone || !dateOfBirth || !timeOfBirth || !placeOfBirth) {
      return res.status(400).json({ message: 'All fields are required for registration' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^[+]?[0-9]{10,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s()-]/g, ''))) {
      return res.status(400).json({ message: 'Please enter a valid phone number' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { phone: phone }
      ]
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }
      if (existingUser.phone === phone) {
        return res.status(400).json({ message: 'User already exists with this phone number' });
      }
    }

    // Create new user with enhanced data storage
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone.trim(),
      dateOfBirth: new Date(dateOfBirth),
      timeOfBirth: timeOfBirth.trim(),
      placeOfBirth: placeOfBirth.trim(),
      role: role || 'client',
      isVerified: false, // Email verification can be added later
      profilePicture: '', // Default empty, can be updated later
      latitude: latitude || 0,
      longitude: longitude || 0,
      timezone: timezone || '',
      // Astrologer-specific fields (only if role is astrologer)
      ...(role === 'astrologer' && {
        specialization: specialization ? [specialization] : [],
        experience: experience || 0,
        pricing: pricing || 100,
        // Set default values for other astrologer fields
        languages: ['Hindi', 'English'],
        isAvailable: true
      })
    });

    // Save user to database
    const savedUser = await user.save();

    if (role === 'astrologer') {
      try {
        const astrologerProfile = new Astrologer({
          userId: savedUser._id,
          phone: phone.trim(),
          specialization: specialization ? [specialization] : [],
          experience: experience || 0,
          pricing: pricing || 100,
          languages: ['Hindi', 'English'],
          isAvailable: true
        });
        await astrologerProfile.save();

        savedUser.astrologerProfile = astrologerProfile._id;
        await savedUser.save();
      } catch (profileErr) {
        console.error('Failed to create astrologer profile on register:', profileErr);
      }
    }

    console.log('New user registered:', {
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
      registrationTime: new Date().toISOString()
    });

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      console.error('CRITICAL: JWT_SECRET is not configured for registration');
      return res.status(500).json({ message: 'Server configuration error: Missing Secret' });
    }

    const token = jwt.sign(
      { userId: savedUser._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully! Welcome to our divine astrology community.',
      token,
      user: savedUser.toJSON()
    });
  } catch (error) {
    console.error('Register error:', error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const message = field === 'email'
        ? 'Email address is already registered'
        : `${field.charAt(0).toUpperCase() + field.slice(1)} is already registered`;
      return res.status(400).json({ message });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join('. ') });
    }

    res.status(500).json({
      message: 'Server error during registration',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      // If state is 0 (disconnected), try to connect now
      if (mongoose.connection.readyState === 0 && process.env.MONGODB_URI) {
        console.log('DB is disconnected. Attempting proactive connection...');
        try {
          await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000 // Fail fast if IP blocked
          });
          console.log('Proactive reconnection successful');
        } catch (connErr) {
          console.error('Proactive connection failed:', connErr.message);
          return res.status(503).json({
            message: 'Database connection failed. Check MongoDB IP Whitelist (0.0.0.0/0 required for Vercel).',
            error: connErr.message
          });
        }
      }

      if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 2) {
        console.log('Waiting for connection to establish...');
        // Wait for connection to establish (max 5 seconds)
        await new Promise((resolve) => {
          let attempts = 0;
          const interval = setInterval(() => {
            attempts++;
            if (mongoose.connection.readyState === 1 || attempts > 50) {
              clearInterval(interval);
              resolve();
            }
          }, 100);
        });
      }
    }

    if (mongoose.connection.readyState !== 1) {
      console.error('DB Connection Error: MongoDB is not connected (readyState: ' + mongoose.connection.readyState + ')');
      const hint = !process.env.MONGODB_URI ? ' (HINT: MONGODB_URI environment variable is missing in Vercel settings)' : ' (HINT: Check MongoDB Atlas IP whitelisting - allow 0.0.0.0/0)';
      return res.status(503).json({
        message: 'Service boys temporarily unavailable: Database connection error' + hint,
        connected: false,
        readyState: mongoose.connection.readyState
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check password
    console.log('Checking password...');
    try {
      const isMatch = await user.comparePassword(password);
      console.log('Password match result:', isMatch);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
    } catch (pwdError) {
      console.error('Password Comparison Error:', pwdError);
      throw new Error(`Password comparison failed: ${pwdError.message}`);
    }

    // Generate JWT token
    console.log('Generating token...');
    if (!process.env.JWT_SECRET) {
      console.error('CRITICAL: JWT_SECRET is not configured for login');
      return res.status(500).json({ message: 'Server configuration error: Missing Secret' });
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    console.log('Token generated successfully');

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Detailed Login Error:', error);

    // Return the actual error message to the frontend for debugging
    res.status(500).json({
      message: 'Login failed due to server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get current user profile
router.get('/profile', protect, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Update user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, dateOfBirth, timeOfBirth, placeOfBirth, profilePicture } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        name,
        phone,
        dateOfBirth,
        timeOfBirth,
        placeOfBirth,
        profilePicture
      },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser.toJSON()
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Get all astrologers (for appointment booking)
router.get('/astrologers', async (req, res) => {
  try {
    const astrologerUsers = await User.find({ role: 'astrologer' })
      .select('name email profilePicture placeOfBirth registrationSource astrologerProfile')
      .populate('astrologerProfile')
      .sort({ name: 1 });

    const astrologers = astrologerUsers.map(user => {
      const uObj = user.toObject();
      const profile = uObj.astrologerProfile || {};
      delete uObj.astrologerProfile;
      return {
        ...uObj,
        phone: profile.phone || '',
        specialization: profile.specialization || [],
        experience: profile.experience || 0,
        languages: profile.languages || ['Hindi', 'English'],
        bio: profile.bio || '',
        pricing: profile.pricing || 100,
        rating: profile.rating || 0,
        totalReviews: profile.totalReviews || 0,
        isAvailable: profile.isAvailable !== false
      };
    });

    res.json({ astrologers });
  } catch (error) {
    console.error('Astrologers fetch error:', error);
    res.status(500).json({ message: 'Server error fetching astrologers' });
  }
});

module.exports = router;