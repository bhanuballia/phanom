const express = require('express');
const router = express.Router();
const kundaliController = require('../controllers/kundaliController');
const { protect } = require('../middleware/auth');

// Generate Kundali (public route - no auth required)
router.post('/generate', kundaliController.generateKundali);

// Generate Kundali with VedAstro (proxy to avoid CORS)
router.post('/generate-vedastro', kundaliController.generateKundaliWithVedAstro);

// Get Panchang data with VedAstro
router.post('/panchang', kundaliController.getPanchang);

// Generate Kundali with JKS.exe
router.post('/generate-jks', kundaliController.generateKundaliWithJKS);

// Send Kundali to email
router.post('/send-email', kundaliController.sendKundaliToEmail);

// Send Kundali to phone via SMS
router.post('/send-sms', kundaliController.sendKundaliToPhone);

// Generate PDF
router.post('/generate-pdf', kundaliController.generatePDF);

// Generate 100-Page Hybrid Kundali (Swiss Ephemeris + Gemini Flash)
router.post('/generate-100-page-pdf', kundaliController.generate100PagePDF);

// Generate 40-Page Hybrid Kundali (Swiss Ephemeris + Gemini Flash)
router.post('/generate-40-page-pdf', kundaliController.generate40PagePDF);

// Generate 25-Page Hybrid Dhan Yog Report (Swiss Ephemeris + Gemini Flash)
router.post('/generate-dhanyog-report', kundaliController.generateDhanYogReport);

// Generate 25-Page Hybrid Remedies Report (Encyclopedia of Remedies + Gemini Flash)
router.post('/generate-remedies-report', kundaliController.generateRemedies25PageReport);

// Calculate Zodiac Signs (Sun & Moon) using VedAstro
router.post('/calculate-signs', kundaliController.calculateZodiacSigns);

// Get Daily Horoscope
router.post('/daily-horoscope', kundaliController.getDailyHoroscope);

// ── Reverse Proxy / Bridge to Python Astrology Engine (Port 8000 / PYTHON_ASTRO_URL) ──
const axios = require('axios');
const PYTHON_ASTRO_URL = process.env.PYTHON_ASTRO_URL || 'http://localhost:8000';

const forwardToPython = async (req, res, targetPath) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${PYTHON_ASTRO_URL}${targetPath}`,
      data: req.body,
      params: req.query,
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });
    return res.status(response.status).json(response.data);
  } catch (err) {
    console.error(`Error forwarding request to Python astro engine (${targetPath}):`, err.message);
    const status = err.response?.status || 502;
    const data = err.response?.data || { error: 'Astrology calculation engine unavailable', details: err.message };
    return res.status(status).json(data);
  }
};

// Report data & basic Kundali
router.all('/report/data', (req, res) => forwardToPython(req, res, '/api/report/data'));
router.all('/calc', (req, res) => forwardToPython(req, res, '/api/kundali'));
router.all('/dasha/rashi', (req, res) => forwardToPython(req, res, '/api/dasha/rashi'));
router.all('/dasha/timeline', (req, res) => forwardToPython(req, res, '/api/dasha/timeline'));
router.all('/vimshottari-table', (req, res) => forwardToPython(req, res, '/api/vimshottari-table'));
router.all('/dasha/all-nakshatra', (req, res) => forwardToPython(req, res, '/api/dasha/all-nakshatra'));
router.all('/panchang/daily', (req, res) => forwardToPython(req, res, '/api/panchang/daily'));
router.all('/panchang/monthly-sheet', (req, res) => forwardToPython(req, res, '/api/panchang/monthly-sheet'));

module.exports = router;
