const mongoose = require('mongoose');

const astrologerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
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
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Astrologer', astrologerSchema);
