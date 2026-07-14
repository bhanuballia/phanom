const mongoose = require('mongoose');

const ugcVideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  videoUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    default: ''
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  fileSize: {
    type: Number, // in bytes
    default: 0
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['testimonial', 'experience', 'teaching', 'other'],
    default: 'other'
  },
  tags: {
    type: [String],
    default: []
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  // New field for home page featured videos
  isHomePageFeatured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Metadata
  uploadDate: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
ugcVideoSchema.index({ user: 1, uploadDate: -1 });
ugcVideoSchema.index({ category: 1 });
ugcVideoSchema.index({ isApproved: 1 });
ugcVideoSchema.index({ isHomePageFeatured: 1 }); // Index for home page videos
ugcVideoSchema.index({ tags: 1 });

// Update lastModified timestamp before saving
ugcVideoSchema.pre('save', function(next) {
  this.lastModified = Date.now();
  next();
});

module.exports = mongoose.model('UGCVideo', ugcVideoSchema);