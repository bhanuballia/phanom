const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/auth');

// Middleware to check admin role
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};

// Public routes for image retrieval (no authentication required)
router.get('/lord-ganesha-image', adminController.getLordGaneshaImage);
router.get('/kundali-matching-background', adminController.getKundaliMatchingBackground);
router.get('/homepage-background', adminController.getHomePageBackground);

// Admin authentication for all other routes
router.use(protect);
router.use(adminAuth);

// Astrologer Management
router.post('/astrologers', adminController.astrologerProfileUpload.single('profilePicture'), adminController.createAstrologer);
router.get('/astrologers', adminController.getAllAstrologers);
router.get('/astrologers/:id', adminController.getAstrologerById);
router.put('/astrologers/:id', adminController.updateAstrologer);
router.delete('/astrologers/:id', adminController.deleteAstrologer);

// Appointment Management
router.get('/appointments', adminController.getAllAppointments);
router.get('/appointments/:id', adminController.getAppointmentById);
router.put('/appointments/:id/cancel', adminController.cancelAppointment);
router.put('/appointments/:id/reschedule', adminController.rescheduleAppointment);

// Dashboard Statistics
router.get('/stats', adminController.getAdminStats);
router.get('/registration-stats', adminController.getRegistrationStats);

// User Management
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/role', adminController.updateUserRole);

// Lord Ganesha Image Management (admin only)
router.post('/lord-ganesha-image', adminController.lordGaneshaUpload.single('image'), adminController.uploadLordGaneshaImage);

// Kundali Matching Background Image Management (admin only)
router.post('/kundali-matching-background', adminController.kundaliMatchingUpload.single('image'), adminController.uploadKundaliMatchingBackground);

// Home Page Background Image Management (admin only)
router.post('/homepage-background', adminController.homePageBackgroundUpload.single('image'), adminController.uploadHomePageBackground);

module.exports = router;