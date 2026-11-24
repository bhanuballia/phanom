/**
 * Astrology - run/backend/routes/numerologyHybrid.js
 * 
 * Express Router for 25-Page Hybrid Numerology Life Book:
 * POST /api/numerology/hybrid-report-25
 * GET  /api/numerology/hybrid-report-25/preview
 */

const express = require('express');
const router = express.Router();
const {
  calculateDeterministicNumerology,
  generate25PageNumerologyData
} = require('../services/hybridNumerologyService');

// POST /api/numerology/hybrid-report-25
router.post('/hybrid-report-25', async (req, res) => {
  try {
    const { name, dateOfBirth, language = 'en' } = req.body;

    if (!name || !dateOfBirth) {
      return res.status(400).json({
        success: false,
        error: 'Both name and dateOfBirth are required for the 25-Page Numerology Report.'
      });
    }

    const report = await generate25PageNumerologyData({
      name: name.trim(),
      dateOfBirth: dateOfBirth.trim(),
      language
    });

    return res.json(report);
  } catch (error) {
    console.error('Error generating 25-Page Numerology Report:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate 25-Page Numerology Report',
      details: error.message
    });
  }
});

// GET /api/numerology/hybrid-report-25/math-only
router.get('/hybrid-report-25/math-only', (req, res) => {
  try {
    const { name = 'Seeker', dob = '1995-01-01' } = req.query;
    const mathData = calculateDeterministicNumerology(name, dob);
    return res.json({ success: true, mathData });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
