const express = require('express');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const appointmentController = require('../controllers/appointmentController');

const router = express.Router();

// Create new appointment with automatic reminders
router.post('/', protect, appointmentController.createAppointment);

// Check if this is a first-time booking (for free consultation)
router.get('/check-first-time', protect, appointmentController.checkFirstTimeBooking);

// Get user appointments
router.get('/', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = {};

    // Filter by user role
    if (req.user.role === 'astrologer') {
      query.astrologer = req.user._id;
    } else {
      query.client = req.user._id;
    }

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('client', 'name email phone dateOfBirth timeOfBirth placeOfBirth')
      .populate('astrologer', 'name email profilePicture')
      .sort({ appointmentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Appointment.countDocuments(query);

    res.json({
      appointments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Appointments fetch error:', error);
    res.status(500).json({ message: 'Server error fetching appointments' });
  }
});

// Get single appointment
router.get('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('client', 'name email phone dateOfBirth timeOfBirth placeOfBirth')
      .populate('astrologer', 'name email profilePicture');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user has access to this appointment
    const hasAccess = appointment.client._id.toString() === req.user._id.toString() ||
      appointment.astrologer._id.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ appointment });
  } catch (error) {
    console.error('Appointment fetch error:', error);
    res.status(500).json({ message: 'Server error fetching appointment' });
  }
});

// Update appointment
router.put('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check permissions
    const hasAccess = appointment.client.toString() === req.user._id.toString() ||
      appointment.astrologer.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const allowedUpdates = ['status', 'notes', 'clientNotes', 'astrologerNotes', 'appointmentDate', 'appointmentTime'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('client', 'name email phone')
      .populate('astrologer', 'name email');

    res.json({
      message: 'Appointment updated successfully',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Appointment update error:', error);
    res.status(500).json({ message: 'Server error updating appointment' });
  }
});

// Cancel appointment
router.delete('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check permissions
    const hasAccess = appointment.client.toString() === req.user._id.toString() ||
      appointment.astrologer.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Appointment cancellation error:', error);
    res.status(500).json({ message: 'Server error cancelling appointment' });
  }
});

// Get available time slots for an astrologer
router.get('/astrologer/:astrologerId/availability', async (req, res) => {
  try {
    const { astrologerId } = req.params;
    const { date, duration = 30 } = req.query; // Default duration to 30 mins if not provided

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const durationNum = parseInt(duration);

    // Get all booked appointments for the astrologer on the specified date
    const bookedAppointments = await Appointment.find({
      astrologer: astrologerId,
      appointmentDate: new Date(date),
      status: { $nin: ['cancelled', 'completed'] }
    }).select('appointmentTime duration');

    // Generate available time slots (9 AM to 10 PM)
    const allSlots = [];
    const startTime = 9 * 60; // 9:00 AM in minutes
    const endTime = 22 * 60; // 10:00 PM in minutes

    for (let time = startTime; time < endTime; time += durationNum) {
      const hours = Math.floor(time / 60);
      const minutes = time % 60;
      allSlots.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    }

    // Filter out booked slots
    // For more robust checking, we should check for any overlap, 
    // but for now we'll match simple overlap with existing start times
    const bookedTimes = bookedAppointments.map(apt => apt.appointmentTime);
    const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));

    res.json({ availableSlots });
  } catch (error) {
    console.error('Availability fetch error:', error);
    res.status(500).json({ message: 'Server error fetching availability' });
  }
});

// Test route to manually trigger reminder check (for testing purposes)
router.post('/test-reminders', protect, async (req, res) => {
  try {
    await appointmentController.checkAndSendReminders();
    res.json({ message: 'Reminder check completed successfully' });
  } catch (error) {
    console.error('Manual reminder check error:', error);
    res.status(500).json({ message: 'Error checking reminders' });
  }
});

module.exports = router;