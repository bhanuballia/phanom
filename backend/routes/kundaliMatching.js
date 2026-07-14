const express = require('express');
const router = express.Router();
const kundaliMatchingController = require('../controllers/kundaliMatchingController');
const { protect } = require('../middleware/auth');

// Match Kundalis using Ashtakoota system
router.post('/match', kundaliMatchingController.matchKundalis);

// Generate PDF report
router.post('/generate-pdf', kundaliMatchingController.generatePDF);

module.exports = router;