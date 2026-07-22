const express = require('express');
const router = express.Router();
const LiveChatMessage = require('../models/LiveChatMessage');
const User = require('../models/User');
const LiveChatPayment = require('../models/LiveChatPayment');
const DisabledChat = require('../models/DisabledChat');


const { protect } = require('../middleware/auth');
const multer = require('multer');
const { createStorage } = require('../config/cloudinary');
const { prokeralaRequest } = require('../config/prokerala');

// Configure Cloudinary storage for chat attachments
// We include 'pdf' in allowed formats
const storage = createStorage('live-chat-attachments', ['jpg', 'jpeg', 'png', 'webp', 'pdf']);
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Middleware to check if user is admin
const adminAuth = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin only.' });
    }
};

// Get available astrologers
router.get('/astrologers', async (req, res) => {
    try {
        const astrologers = await User.find({
            role: 'astrologer',
            isAvailable: true
        }).select('name profilePicture specialization experience rating bio');
        res.json(astrologers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get chat history between current user and an astrologer
router.get('/history/:astrologerId', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const astrologerId = req.params.astrologerId;
        const chatId = [userId, astrologerId].sort().join('_');

        const messages = await LiveChatMessage.find({ chatId })
            .sort({ timestamp: 1 })
            .populate('sender', 'name profilePicture')
            .populate('receiver', 'name profilePicture');

        const isDisabled = await DisabledChat.findOne({ chatId });

        res.json({
            messages,
            isDisabled: !!isDisabled
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Astrologer: Get my own chat sessions
router.get('/my-sessions', protect, async (req, res) => {
    try {
        if (req.user.role !== 'astrologer') {
            return res.status(403).json({ message: 'Only astrologers can access their sessions' });
        }

        const astrologerId = req.user._id;

        // Find sessions where this astrologer is a participant
        const sessions = await LiveChatMessage.aggregate([
            {
                $match: {
                    $or: [
                        { sender: astrologerId },
                        { receiver: astrologerId }
                    ]
                }
            },
            {
                $sort: { timestamp: -1 }
            },
            {
                $group: {
                    _id: '$chatId',
                    lastMessage: { $first: '$message' },
                    lastTimestamp: { $first: '$timestamp' },
                    messageCount: { $sum: 1 },
                    sender: { $first: '$sender' },
                    receiver: { $first: '$receiver' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ['$isRead', false] },
                                        { $eq: ['$receiver', astrologerId] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            { $sort: { lastTimestamp: -1 } }
        ]);

        // Populate to get user info
        const populatedSessions = await LiveChatMessage.populate(sessions, [
            { path: 'sender', select: 'name profilePicture role' },
            { path: 'receiver', select: 'name profilePicture role' }
        ]);

        res.json(populatedSessions);
    } catch (error) {
        console.error('Error fetching astrologer sessions:', error);
        res.status(500).json({ message: error.message });
    }
});

// Admin: Get all chat history or specific chat sessions
router.get('/admin/all-history', [protect, adminAuth], async (req, res) => {
    try {
        const messages = await LiveChatMessage.find()
            .sort({ timestamp: -1 })
            .populate('sender', 'name email role')
            .populate('receiver', 'name email role')
            .limit(1000); // Limit to prevent overwhelming response

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin: Get chat sessions list
router.get('/admin/sessions', [protect, adminAuth], async (req, res) => {
    try {
        const sessions = await LiveChatMessage.aggregate([
            {
                $group: {
                    _id: '$chatId',
                    lastMessage: { $last: '$message' },
                    lastTimestamp: { $last: '$timestamp' },
                    messageCount: { $sum: 1 },
                    participants: { $addToSet: '$sender' }
                }
            },
            { $sort: { lastTimestamp: -1 } }
        ]);

        // Deeper population would be needed but for now this gives the IDs
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Upload a file for chat
router.post('/upload', protect, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        res.json({
            fileUrl: req.file.path,
            fileName: req.file.originalname,
            fileType: req.file.mimetype
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Error uploading file' });
    }
});

/**
 * @route   GET /api/live-chat/birth-report
 * @desc    Fetch birth details (panchang, planet-positions) for a user
 * @access  Protected
 */
router.get('/birth-report', protect, async (req, res) => {
    try {
        const { datetime, coordinates } = req.query;

        if (!datetime || !coordinates) {
            return res.status(400).json({ message: 'Datetime and coordinates (lat,lon) are required' });
        }

        // We can fetch multiple segments from Prokerala to provide a rich report
        // 1. Birth Panchang
        // 2. Planet Positions
        // 3. Mangal Dosha

        // 1. Panchang (Vedic)
        const panchang = await prokeralaRequest('/astrology/panchang', {
            datetime,
            coordinates
        });

        // 2. Planet Positions
        const planets = await prokeralaRequest('/astrology/planet-position', {
            datetime,
            coordinates
        });

        // 3. Mangal Dosha
        const mangalDosha = await prokeralaRequest('/astrology/mangal-dosha', {
            datetime,
            coordinates
        });

        res.json({
            panchang: panchang.data?.panchang || panchang.data,
            planets: planets.data?.planet_position || planets.data?.planets || planets.data,
            mangalDosha: mangalDosha.data?.mangal_dosha || mangalDosha.data
        });
    } catch (error) {
        console.error('Prokerala Report Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            message: 'Failed to fetch Prokerala astrological data',
            details: error.response?.data
        });
    }
});

// Get Guru Dakshina payment status for live chat
router.get('/dakshina-status/:astrologerId', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const astrologerId = req.params.astrologerId;
        const chatId = [userId, astrologerId].sort().join('_');

        const payment = await LiveChatPayment.findOne({
            chatId,
            paymentStatus: 'completed'
        });

        res.json({ isPaid: !!payment, payment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a pending Guru Dakshina payment
router.post('/dakshina-payment', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const { astrologerId, amount } = req.body;
        const chatId = [userId, astrologerId].sort().join('_');

        // Check if there is already a completed payment
        const existingPayment = await LiveChatPayment.findOne({
            chatId,
            paymentStatus: 'completed'
        });

        if (existingPayment) {
            return res.json({ message: 'Already paid', payment: existingPayment });
        }

        // Create new pending payment
        const payment = new LiveChatPayment({
            user: userId,
            astrologer: astrologerId,
            chatId,
            amount
        });

        await payment.save();
        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Confirm Guru Dakshina payment (Mock Payment Confirmation)
router.post('/dakshina-confirm', protect, async (req, res) => {
    try {
        const { paymentId } = req.body;

        const payment = await LiveChatPayment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ message: 'Payment record not found' });
        }

        payment.paymentStatus = 'completed';
        await payment.save();

        res.json({ success: true, payment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

