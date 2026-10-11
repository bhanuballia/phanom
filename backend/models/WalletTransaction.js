const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['credit', 'debit'], // credit = recharge, debit = deduction
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  balanceAfter: {
    type: Number, // Keep track of what the balance was after this transaction for auditing
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'success'
  },
  // If integrating with Razorpay/Stripe, you'll store their payment/order IDs here
  paymentGatewayOrderId: {
    type: String,
    default: null
  },
  paymentGatewayTransactionId: {
    type: String,
    default: null
  },
  // If the transaction is related to an astrologer service/chat, link it here
  relatedServiceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
