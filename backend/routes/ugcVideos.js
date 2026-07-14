const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadRateLimit, uploadUGCVideo, getUGCVideos, getUGCVideoById, getHomePageFeaturedVideos, updateUGCVideo, deleteUGCVideo, likeUGCVideo, addCommentToUGCVideo } = require('../controllers/ugcVideoController');

// Public routes
router.get('/', getUGCVideos);
router.get('/homepage-featured', getHomePageFeaturedVideos); // New route for home page videos
router.get('/:id', getUGCVideoById);

// Protected routes (require authentication)
router.post('/upload', protect, uploadRateLimit, uploadUGCVideo);
router.put('/:id', protect, updateUGCVideo);
router.delete('/:id', protect, deleteUGCVideo);
router.post('/:id/like', protect, likeUGCVideo);
router.post('/:id/comment', protect, addCommentToUGCVideo);

module.exports = router;