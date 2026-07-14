const UGCVideo = require('../models/UGCVideo');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const rateLimit = require('express-rate-limit');

const os = require('os');

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isProduction = process.env.NODE_ENV === 'production';
    const uploadDir = isProduction
      ? path.join(os.tmpdir(), 'ugc-videos')
      : 'uploads/ugc-videos';

    // Create directory if it doesn't exist
    fs.mkdir(uploadDir, { recursive: true }).then(() => {
      cb(null, uploadDir);
    }).catch(err => {
      console.error('Error creating upload dir:', err);
      // Fallback to tmp if local fails (e.g. permission issue)
      cb(null, os.tmpdir());
    });
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only specific video file types
  const allowedTypes = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
    'video/x-msvideo'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported video format. Please upload MP4, WebM, OGV, MOV, or AVI files.'), false);
  }
};

// Rate limiting for video uploads (5 uploads per hour per user)
const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many upload attempts, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Upload UGC video
const uploadUGCVideo = async (req, res) => {
  try {
    // Multer middleware handles file upload
    upload.single('video')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: 'Upload failed: ' + err.message
        });
      }

      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No video file provided'
        });
      }

      // Validate required fields
      const { title, description, category, tags, isHomePageFeatured, isApproved } = req.body;
      console.log('Received form data:', { title, description, category, tags, isHomePageFeatured, isApproved });
      if (!title) {
        // Clean up uploaded file
        await fs.unlink(req.file.path).catch(() => { });
        return res.status(400).json({
          success: false,
          message: 'Title is required'
        });
      }

      // Content moderation - check for inappropriate content
      const inappropriateWords = [
        'spam', 'scam', 'fraud', 'fake', 'inappropriate',
        'offensive', 'hate', 'abuse', 'violence', 'illegal'
      ];

      const checkForInappropriateContent = (text) => {
        if (!text) return false;
        const lowerText = text.toLowerCase();
        return inappropriateWords.some(word => lowerText.includes(word));
      };

      if (checkForInappropriateContent(title) || checkForInappropriateContent(description)) {
        // Clean up uploaded file
        await fs.unlink(req.file.path).catch(() => { });
        return res.status(400).json({
          success: false,
          message: 'Content contains inappropriate words. Please revise your submission.'
        });
      }

      // Create new UGC video record
      const isHomePageFeaturedBool = isHomePageFeatured === 'true' || isHomePageFeatured === true;
      const isApprovedBool = isApproved === 'true' || isApproved === true || true; // Auto-approve videos uploaded by admin

      console.log('Boolean values:', { isHomePageFeaturedBool, isApprovedBool });

      const ugcVideo = new UGCVideo({
        title,
        description: description || '',
        videoUrl: `/uploads/ugc-videos/${req.file.filename}`,
        user: req.user._id,
        category: category || 'other',
        tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
        isHomePageFeatured: isHomePageFeaturedBool,
        isApproved: isApprovedBool
      });

      console.log('Video object to save:', ugcVideo);

      // Save to database
      const savedVideo = await ugcVideo.save();

      console.log('Saved video:', {
        title: savedVideo.title,
        isHomePageFeatured: savedVideo.isHomePageFeatured,
        isApproved: savedVideo.isApproved,
        uploadDate: savedVideo.uploadDate
      });

      // Populate user info
      await savedVideo.populate('user', 'name profilePicture');

      res.status(201).json({
        success: true,
        message: 'Video uploaded successfully',
        data: savedVideo
      });
    });
  } catch (error) {
    console.error('UGC video upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during upload'
    });
  }
};

// Get all UGC videos (with pagination and filtering)
const getUGCVideos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const category = req.query.category;
    const search = req.query.search;
    const sortBy = req.query.sortBy || 'uploadDate';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // For admin users, allow filtering by approval status
    const isAdmin = req.user?.role === 'admin';
    const isApprovedFilter = req.query.isApproved !== undefined
      ? req.query.isApproved === 'true'
      : true;

    // Build filter object
    const filter = {};

    // Admins can see all videos, regular users only approved ones
    if (!isAdmin) {
      filter.isApproved = true;
    } else if (req.query.isApproved !== undefined) {
      filter.isApproved = isApprovedFilter;
    }

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder;

    // Get videos with pagination
    const videos = await UGCVideo.find(filter)
      .populate('user', 'name profilePicture')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count for pagination
    const totalCount = await UGCVideo.countDocuments(filter);

    res.json({
      success: true,
      data: videos,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching UGC videos:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching videos'
    });
  }
};

// Get UGC video by ID
const getUGCVideoById = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await UGCVideo.findById(id)
      .populate('user', 'name profilePicture')
      .populate('comments.user', 'name profilePicture');

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Increment view count
    video.views += 1;
    await video.save();

    res.json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('Error fetching UGC video:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching video'
    });
  }
};

// Get home page featured videos
const getHomePageFeaturedVideos = async (req, res) => {
  try {
    // Get the latest approved home page featured video
    const videos = await UGCVideo.find({
      isHomePageFeatured: true,
      isApproved: true
    })
      .populate('user', 'name profilePicture')
      .sort({ uploadDate: -1 })
      .limit(1);

    console.log('Found featured videos:', videos.length);
    if (videos.length > 0) {
      console.log('Featured video details:', {
        title: videos[0].title,
        isHomePageFeatured: videos[0].isHomePageFeatured,
        isApproved: videos[0].isApproved,
        uploadDate: videos[0].uploadDate
      });
    }

    // Return the first video or null if none found
    const video = videos.length > 0 ? videos[0] : null;

    res.json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('Error fetching home page featured video:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching home page video'
    });
  }
};

// Update UGC video (owner or admin only)
const updateUGCVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, tags, isApproved } = req.body;

    // Find video
    const video = await UGCVideo.findById(id);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check if user is owner or admin
    const isAdmin = req.user.role === 'admin';
    const isOwner = video.user.toString() === req.user._id.toString();

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this video'
      });
    }

    // Update fields
    if (title !== undefined) video.title = title;
    if (description !== undefined) video.description = description;
    if (category !== undefined) video.category = category;
    if (tags !== undefined) video.tags = Array.isArray(tags) ? tags : [tags];
    if (isApproved !== undefined && isAdmin) video.isApproved = isApproved;

    // Save updated video
    const updatedVideo = await video.save();

    // Populate user info
    await updatedVideo.populate('user', 'name profilePicture');

    res.json({
      success: true,
      message: 'Video updated successfully',
      data: updatedVideo
    });
  } catch (error) {
    console.error('Error updating UGC video:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating video'
    });
  }
};

// Delete UGC video (owner or admin only)
const deleteUGCVideo = async (req, res) => {
  try {
    const { id } = req.params;

    // Find video
    const video = await UGCVideo.findById(id);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check if user is owner or admin
    const isAdmin = req.user.role === 'admin';
    const isOwner = video.user.toString() === req.user._id.toString();

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this video'
      });
    }

    // Delete video file from filesystem
    if (video.videoUrl) {
      const filePath = path.join(__dirname, '..', video.videoUrl);
      await fs.unlink(filePath).catch(() => { }); // Ignore errors if file doesn't exist
    }

    // Delete from database
    await UGCVideo.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting UGC video:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting video'
    });
  }
};

// Like UGC video
const likeUGCVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const video = await UGCVideo.findById(id);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check if user already liked the video
    const likedIndex = video.likedBy.indexOf(userId);

    if (likedIndex > -1) {
      // Unlike: remove user from likedBy and decrement likes
      video.likedBy.splice(likedIndex, 1);
      video.likes -= 1;
    } else {
      // Like: add user to likedBy and increment likes
      video.likedBy.push(userId);
      video.likes += 1;
    }

    await video.save();

    res.json({
      success: true,
      message: likedIndex > -1 ? 'Video unliked' : 'Video liked',
      data: {
        likes: video.likes,
        userLiked: likedIndex === -1
      }
    });
  } catch (error) {
    console.error('Error liking UGC video:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while liking video'
    });
  }
};

// Add comment to UGC video
const addCommentToUGCVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    const video = await UGCVideo.findById(id);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Add comment
    const comment = {
      user: userId,
      text: text.trim()
    };

    video.comments.push(comment);
    await video.save();

    // Populate user info for the new comment
    await video.populate({
      path: 'comments.user',
      select: 'name profilePicture'
    });

    // Get the newly added comment
    const newComment = video.comments[video.comments.length - 1];

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: newComment
    });
  } catch (error) {
    console.error('Error adding comment to UGC video:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding comment'
    });
  }
};

module.exports = {
  uploadRateLimit,
  uploadUGCVideo,
  getUGCVideos,
  getUGCVideoById,
  getHomePageFeaturedVideos, // Add this new function
  updateUGCVideo,
  deleteUGCVideo,
  likeUGCVideo,
  addCommentToUGCVideo
};