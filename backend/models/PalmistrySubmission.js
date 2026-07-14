const mongoose = require('mongoose');

const palmistrySubmissionSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        trim: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional if user is logged in
    },
    astrologerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    astrologerName: {
        type: String,
        required: true
    },
    rightHandImage: {
        type: String,
        required: true
    },
    leftHandImage: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    astrologerNotes: {
        type: String,
        default: ''
    },
    response: {
        type: String,
        default: ''
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    respondedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Index for faster queries
palmistrySubmissionSchema.index({ astrologerId: 1, status: 1 });
palmistrySubmissionSchema.index({ userId: 1 });
palmistrySubmissionSchema.index({ submittedAt: -1 });

module.exports = mongoose.model('PalmistrySubmission', palmistrySubmissionSchema);
