const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: false
  },
  timeOfBirth: {
    type: String,
    required: false
  },
  placeOfBirth: {
    type: String,
    required: false
  },
  role: {
    type: String,
    enum: ['client', 'astrologer', 'admin'],
    default: 'client'
  },
  profilePicture: {
    type: String,
    default: ''
  },
  latitude: {
    type: Number,
    default: 0
  },
  longitude: {
    type: Number,
    default: 0
  },
  timezone: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  // Additional fields for astrologers
  specialization: {
    type: [String],
    default: []
  },
  experience: {
    type: Number,
    default: 0
  },
  languages: {
    type: [String],
    default: ['Hindi', 'English']
  },
  bio: {
    type: String,
    default: ''
  },
  pricing: {
    type: Number,
    default: 100
  },
  rating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  // Availability status for astrologers
  isAvailable: {
    type: Boolean,
    default: true
  },
  astrologerProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Astrologer'
  },

  // Registration metadata
  registrationSource: {
    type: String,
    enum: ['web_form', 'mobile_app', 'admin_created', 'social_login'],
    default: 'web_form'
  },
  lastLoginAt: {
    type: Date,
    default: null
  },
  emailVerificationToken: {
    type: String,
    default: ''
  },
  passwordResetToken: {
    type: String,
    default: ''
  },
  passwordResetExpires: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);