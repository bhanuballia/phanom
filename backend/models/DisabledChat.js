const mongoose = require('mongoose');

const disabledChatSchema = new mongoose.Schema({
  chatId: {
    type: String,
    required: true,
    unique: true
  },
  disabledAt: {
    type: Date,
    default: Date.now
  },
  reason: {
    type: String,
    default: 'three_strikes_policy_violation'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DisabledChat', disabledChatSchema);
