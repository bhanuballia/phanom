const N8nVideo = require('../models/N8nVideo');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const os = require('os');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isProduction = process.env.NODE_ENV === 'production';
    const uploadDir = isProduction
      ? path.join(os.tmpdir(), 'n8n-images')
      : 'uploads/n8n-images';

    // Create directory if it doesn't exist
    fs.mkdir(uploadDir, { recursive: true }).then(() => {
      cb(null, uploadDir);
    }).catch(err => {
      console.error('Error creating upload dir:', err);
      cb(null, os.tmpdir());
    });
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept image files only
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
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Create a new n8n video generation request (admin only)
const createN8nVideoRequest = async (req, res) => {
  try {
    // Multer middleware handles file upload
    upload.single('image')(req, res, async (err) => {
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
          message: 'No image file provided'
        });
      }

      // Validate required fields
      const { title, description, prompt } = req.body;
      if (!title || !prompt) {
        // Clean up uploaded file
        await fs.unlink(req.file.path).catch(() => { });
        return res.status(400).json({
          success: false,
          message: 'Title and prompt are required'
        });
      }

      // Create new n8n video request
      const n8nVideo = new N8nVideo({
        title,
        description: description || '',
        prompt,
        imageUrl: `/uploads/n8n-images/${req.file.filename}`,
        createdBy: req.user._id
      });

      // Save to database
      const savedVideo = await n8nVideo.save();

      res.status(201).json({
        success: true,
        message: 'Video generation request created successfully',
        data: savedVideo
      });
    });
  } catch (error) {
    console.error('N8n video request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during request creation'
    });
  }
};

// Get all n8n video requests (admin only)
const getAllN8nVideoRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    // Build filter object
    const filter = {};

    if (status) {
      filter.status = status;
    }

    // Get videos with pagination
    const videos = await N8nVideo.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count for pagination
    const totalCount = await N8nVideo.countDocuments(filter);

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
    console.error('Error fetching n8n video requests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching video requests'
    });
  }
};

// Get n8n video by ID (admin only)
const getN8nVideoById = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await N8nVideo.findById(id).populate('createdBy', 'name email');

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video request not found'
      });
    }

    res.json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('Error fetching n8n video request:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching video request'
    });
  }
};

// Update n8n video (admin only)
const updateN8nVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, prompt, videoUrl, status } = req.body;

    // Find video
    const video = await N8nVideo.findById(id);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video request not found'
      });
    }

    // Update fields
    if (title !== undefined) video.title = title;
    if (description !== undefined) video.description = description;
    if (prompt !== undefined) video.prompt = prompt;
    if (videoUrl !== undefined) video.videoUrl = videoUrl;
    if (status !== undefined) video.status = status;

    // Save updated video
    const updatedVideo = await video.save();

    res.json({
      success: true,
      message: 'Video request updated successfully',
      data: updatedVideo
    });
  } catch (error) {
    console.error('Error updating n8n video request:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating video request'
    });
  }
};

// Delete n8n video (admin only)
const deleteN8nVideo = async (req, res) => {
  try {
    const { id } = req.params;

    // Find video
    const video = await N8nVideo.findById(id);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video request not found'
      });
    }

    // Delete image file from filesystem
    if (video.imageUrl) {
      const imagePath = path.join(__dirname, '..', video.imageUrl);
      await fs.unlink(imagePath).catch(() => { }); // Ignore errors if file doesn't exist
    }

    // Delete video file from filesystem if exists
    if (video.videoUrl) {
      const videoPath = path.join(__dirname, '..', video.videoUrl);
      await fs.unlink(videoPath).catch(() => { }); // Ignore errors if file doesn't exist
    }

    // Delete from database
    await N8nVideo.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Video request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting n8n video request:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting video request'
    });
  }
};

// Get latest completed n8n video for display on homepage
const getLatestCompletedVideo = async (req, res) => {
  try {
    const video = await N8nVideo.findOne({ status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!video) {
      return res.json({
        success: true,
        data: null
      });
    }

    res.json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('Error fetching latest n8n video:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching latest video'
    });
  }
};

module.exports = {
  createN8nVideoRequest,
  getAllN8nVideoRequests,
  getN8nVideoById,
  updateN8nVideo,
  deleteN8nVideo,
  getLatestCompletedVideo
};