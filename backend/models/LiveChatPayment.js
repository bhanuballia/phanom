const mongoose = require('mongoose');

const liveChatPaymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  astrologer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chatId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  questionsLimit: {
    type: Number,
    default: 1
  },
  questionsAsked: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LiveChatPayment', liveChatPaymentSchema);
