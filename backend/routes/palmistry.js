const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const palmistryController = require('../controllers/palmistryController');
const { protect, authorize } = require('../middleware/auth');

// Configure multer for image uploads
const { createStorage } = require('../config/cloudinary');

// Configure Cloudinary storage
const storage = createStorage('palmistry');

const fileFilter = (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max file size
    }
});

// Public route - Create submission (with optional authentication)
router.post(
    '/submit',
    (req, res, next) => {
        // Try to authenticate, but don't require it
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            protect(req, res, next);
        } else {
            next();
        }
    },
    upload.fields([
        { name: 'rightHandImage', maxCount: 1 },
        { name: 'leftHandImage', maxCount: 1 }
    ]),
    palmistryController.createSubmission
);

// Protected routes - Require authentication
router.get('/submissions', protect, palmistryController.getAllSubmissions);
router.get('/submissions/:id', protect, palmistryController.getSubmissionById);
router.put('/submissions/:id', protect, authorize('astrologer', 'admin'), palmistryController.updateSubmission);
router.delete('/submissions/:id', protect, authorize('admin'), palmistryController.deleteSubmission);

// Astrologer-specific route
router.get('/my-submissions', protect, authorize('astrologer'), palmistryController.getAstrologerSubmissions);

module.exports = router;
