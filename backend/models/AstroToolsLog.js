const mongoose = require('mongoose');

const astroToolsLogSchema = new mongoose.Schema({
  astrologerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  astrologerName: {
    type: String,
    required: true
  },
  phoneUsed: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    default: null
  },
  accessDate: {
    type: String, // format YYYY-MM-DD
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AstroToolsLog', astroToolsLogSchema);
