const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      if (mongoose.connection.readyState === 2 || mongoose.connection.readyState === 0) {
        console.log('Protect Middleware: DB not ready, waiting...');

        if (mongoose.connection.readyState === 0 && process.env.MONGODB_URI) {
          mongoose.connect(process.env.MONGODB_URI).catch(err => console.error('Auto-connect failed:', err));
        }

        await new Promise((resolve) => {
          let attempts = 0;
          const interval = setInterval(() => {
            attempts++;
            if (mongoose.connection.readyState === 1 || attempts > 30) {
              clearInterval(interval);
              resolve();
            }
          }, 100);
        });
      }
    }

    if (!token) {
      console.log('Auth failed: No token provided in header');
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('CRITICAL: JWT_SECRET is not configured in environment variables!');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        console.log(`Auth failed: User matching ID ${decoded.userId} not found in database`);
        return res.status(401).json({ message: 'Invalid token. User not found.' });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      console.error('JWT Verification Error:', jwtError.message);
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }
  } catch (error) {
    console.error('Internal Auth middleware error:', error);
    res.status(500).json({ message: 'Internal server error during authentication' });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user ? req.user.role : 'unknown'} is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };