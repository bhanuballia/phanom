const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { protect } = require('../middleware/auth');

// All routes are protected by authentication
router.use(protect);

// Start session log (Astrologer)
router.post('/start', auditController.logStart);

// End session log (Astrologer)
router.post('/end/:logId', auditController.logEnd);

// Get day-wise report (Admin)
router.get('/report', auditController.getAuditReport);

module.exports = router;
