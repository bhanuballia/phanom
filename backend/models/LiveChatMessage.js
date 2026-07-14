const mongoose = require('mongoose');

const liveChatMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: false // Now optional if there's an attachment
  },
  attachments: [{
    fileUrl: String,
    fileType: String,
    fileName: String
  }],
  timestamp: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  },
  chatId: {
    type: String,
    required: true // Combined ID of user and astrologer to group messages
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LiveChatMessage', liveChatMessageSchema);
