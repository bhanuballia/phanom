const PalmistrySubmission = require('../models/PalmistrySubmission');
const User = require('../models/User');
const path = require('path');
const fs = require('fs').promises;

// Create a new palmistry submission
exports.createSubmission = async (req, res) => {
    try {
        const { userName, astrologerId, astrologerName } = req.body;

        // Validate required fields
        if (!userName || !astrologerId || !astrologerName) {
            return res.status(400).json({
                success: false,
                message: 'Please provide userName, astrologerId, and astrologerName'
            });
        }

        // Validate images
        if (!req.files || !req.files.rightHandImage || !req.files.leftHandImage) {
            return res.status(400).json({
                success: false,
                message: 'Please upload both right hand and left hand images'
            });
        }

        // Verify astrologer exists and has Palmistry specialization
        const astrologer = await User.findById(astrologerId);
        if (!astrologer || astrologer.role !== 'astrologer') {
            return res.status(404).json({
                success: false,
                message: 'Astrologer not found'
            });
        }

        if (!astrologer.specialization || !astrologer.specialization.includes('Palmistry')) {
            return res.status(400).json({
                success: false,
                message: 'Selected astrologer does not specialize in Palmistry'
            });
        }

        // Get uploaded files
        const rightHandImage = req.files.rightHandImage[0];
        const leftHandImage = req.files.leftHandImage[0];

        // Create submission
        const submission = new PalmistrySubmission({
            userName,
            userId: req.user ? req.user.id : null, // Optional if user is logged in
            astrologerId,
            astrologerName,
            rightHandImage: rightHandImage.path,
            leftHandImage: leftHandImage.path
        });

        await submission.save();

        res.status(201).json({
            success: true,
            message: 'Palmistry submission created successfully',
            submission
        });
    } catch (error) {
        console.error('Error creating palmistry submission:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create palmistry submission',
            error: error.message
        });
    }
};

// Get all submissions (for admin or astrologer)
exports.getAllSubmissions = async (req, res) => {
    try {
        const { status, astrologerId } = req.query;
        const filter = {};

        if (status) {
            filter.status = status;
        }

        // If user is an astrologer, only show their submissions
        if (req.user && req.user.role === 'astrologer') {
            filter.astrologerId = req.user.id;
        } else if (astrologerId) {
            filter.astrologerId = astrologerId;
        }

        const submissions = await PalmistrySubmission.find(filter)
            .populate('userId', 'name email phone')
            .populate('astrologerId', 'name email specialization')
            .sort({ submittedAt: -1 });

        res.json({
            success: true,
            count: submissions.length,
            submissions
        });
    } catch (error) {
        console.error('Error fetching palmistry submissions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch palmistry submissions',
            error: error.message
        });
    }
};

// Get submission by ID
exports.getSubmissionById = async (req, res) => {
    try {
        const { id } = req.params;

        const submission = await PalmistrySubmission.findById(id)
            .populate('userId', 'name email phone')
            .populate('astrologerId', 'name email specialization');

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }

        res.json({
            success: true,
            submission
        });
    } catch (error) {
        console.error('Error fetching submission:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch submission',
            error: error.message
        });
    }
};

// Update submission (for astrologer to add notes/response)
exports.updateSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, astrologerNotes, response } = req.body;

        const submission = await PalmistrySubmission.findById(id);

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }

        // Only the assigned astrologer or admin can update
        if (req.user.role === 'astrologer' && submission.astrologerId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this submission'
            });
        }

        if (status) submission.status = status;
        if (astrologerNotes) submission.astrologerNotes = astrologerNotes;
        if (response) {
            submission.response = response;
            submission.respondedAt = new Date();
        }

        await submission.save();

        res.json({
            success: true,
            message: 'Submission updated successfully',
            submission
        });
    } catch (error) {
        console.error('Error updating submission:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update submission',
            error: error.message
        });
    }
};

// Delete submission
exports.deleteSubmission = async (req, res) => {
    try {
        const { id } = req.params;

        const submission = await PalmistrySubmission.findById(id);

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }

        // Delete associated images
        // Images are hosted on Cloudinary - no local deletion needed
        // TODO: Implement Cloudinary deletion using public_id if needed
        // await fs.unlink(submission.rightHandImage);
        // await fs.unlink(submission.leftHandImage);

        await PalmistrySubmission.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Submission deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting submission:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete submission',
            error: error.message
        });
    }
};

// Get submissions for a specific astrologer (for astrologer dashboard)
exports.getAstrologerSubmissions = async (req, res) => {
    try {
        const astrologerId = req.user.id;

        const submissions = await PalmistrySubmission.find({ astrologerId })
            .populate('userId', 'name email phone')
            .sort({ submittedAt: -1 });

        res.json({
            success: true,
            count: submissions.length,
            submissions
        });
    } catch (error) {
        console.error('Error fetching astrologer submissions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch submissions',
            error: error.message
        });
    }
};
