const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { protect } = require('../middleware/auth');

// Get AI chatbot response (public route)
router.post('/chat', chatbotController.getChatbotResponse);

// Get popular questions (public route)
router.get('/popular-questions', chatbotController.getPopularQuestions);

// Enhanced chat with user context (protected route)
router.post('/chat/user', protect, async (req, res) => {
  try {
    // Add userId to request body for controller
    req.body.userId = req.user._id;
    console.log('Authenticated chat request from user:', req.user._id);
    return chatbotController.getChatbotResponse(req, res);
  } catch (error) {
    console.error('Error in authenticated chat route:', error);
    res.status(500).json({
      success: false,
      message: 'चैटबॉट में कुछ समस्या है। कृपया बाद में कोशिश करें।'
    });
  }
});

// Proxy for VedAstro API (public)
router.get('/vedastro-proxy/:path(*)', chatbotController.vedastroProxy);

module.exports = router;