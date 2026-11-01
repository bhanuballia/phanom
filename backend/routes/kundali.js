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

module.exports = router;