const express = require('express');
const { protect } = require('../middleware/auth');
const astrologerController = require('../controllers/astrologerController');
const prokeralaController = require('../controllers/prokeralaController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Profile routes
router.get('/profile', astrologerController.getProfile);
router.put('/profile', astrologerController.updateProfile);

// Appointment routes
router.get('/appointments', astrologerController.getMyAppointments);
router.get('/appointments/:id', astrologerController.getAppointmentById);
router.put('/appointments/:id', astrologerController.updateAppointment);

// Dashboard routes
router.get('/upcoming-appointments', astrologerController.getUpcomingAppointments);

// Prokerala Astro Tools
router.get('/astro/kundli-advanced', prokeralaController.getAdvancedKundli);
router.get('/astro/chart', prokeralaController.getChart);
router.get('/astro/sade-sati-advanced', prokeralaController.getAdvancedSadesati);
router.get('/astro/dasha-periods', prokeralaController.getDashaPeriods);
router.get('/astro/matching-advanced', prokeralaController.getAdvancedMatching);
router.post('/astro/personal-report', prokeralaController.getPersonalReport);
router.get('/astro/kaal-sarp-dosha', prokeralaController.getKaalSarpDosha);
router.get('/astro/mangal-dosha-advanced', prokeralaController.getMangalDoshaAdvanced);
router.get('/astro/planet-position', prokeralaController.getPlanetPosition);
router.get('/astro/daily-prediction-advanced', prokeralaController.getDailyPredictionAdvanced);
router.get('/astro/panchang-advanced', prokeralaController.getAdvancedPanchang);

module.exports = router;