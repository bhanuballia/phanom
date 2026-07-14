const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createN8nVideoRequest,
  getAllN8nVideoRequests,
  getN8nVideoById,
  updateN8nVideo,
  deleteN8nVideo,
  getLatestCompletedVideo
} = require('../controllers/n8nVideoController');

// Middleware to check admin role
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};

// Public route - get latest completed video for homepage
router.get('/latest', getLatestCompletedVideo);

// Protected routes (require authentication)
router.get('/', protect, adminAuth, getAllN8nVideoRequests);
router.get('/:id', protect, adminAuth, getN8nVideoById);
router.post('/request', protect, adminAuth, createN8nVideoRequest);
router.put('/:id', protect, adminAuth, updateN8nVideo);
router.delete('/:id', protect, adminAuth, deleteN8nVideo);

module.exports = router;