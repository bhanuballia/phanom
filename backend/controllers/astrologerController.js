const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Astrologer = require('../models/Astrologer');

// Get astrologer's appointments
exports.getMyAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = { astrologer: req.user._id };
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('client', 'name email phone dateOfBirth timeOfBirth placeOfBirth')
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
    console.error('Error fetching astrologer appointments:', error);
    res.status(500).json({ message: 'Server error fetching appointments' });
  }
};

// Get single appointment for astrologer
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('client', 'name email phone dateOfBirth timeOfBirth placeOfBirth');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if astrologer has access to this appointment
    if (appointment.astrologer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ appointment });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ message: 'Server error fetching appointment' });
  }
};

// Update appointment status and add notes
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, astrologerNotes } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if astrologer has access to this appointment
    if (appointment.astrologer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow specific status updates
    const allowedStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled'];
    if (status && allowedStatuses.includes(status)) {
      appointment.status = status;
    }

    // Update astrologer notes if provided
    if (astrologerNotes) {
      appointment.astrologerNotes = astrologerNotes;
    }

    const updatedAppointment = await appointment.save();

    // Populate the updated appointment
    const populatedAppointment = await Appointment.findById(updatedAppointment._id)
      .populate('client', 'name email phone')
      .populate('astrologer', 'name email');

    res.json({
      message: 'Appointment updated successfully',
      appointment: populatedAppointment
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Server error updating appointment' });
  }
};

// Get astrologer profile
exports.getProfile = async (req, res) => {
  try {
    const astrologerUser = await User.findById(req.user._id)
      .select('-password')
      .populate('astrologerProfile');

    if (!astrologerUser || astrologerUser.role !== 'astrologer') {
      return res.status(404).json({ message: 'Astrologer not found' });
    }

    // Get appointment statistics
    const totalAppointments = await Appointment.countDocuments({
      astrologer: req.user._id
    });

    const completedAppointments = await Appointment.countDocuments({
      astrologer: req.user._id,
      status: 'completed'
    });

    const upcomingAppointments = await Appointment.countDocuments({
      astrologer: req.user._id,
      status: 'scheduled',
      appointmentDate: { $gte: new Date() }
    });

    // Merge astrologerProfile fields into the returned astrologer object for frontend compatibility
    const astrologerObj = astrologerUser.toObject();
    if (astrologerUser.astrologerProfile) {
      Object.assign(astrologerObj, {
        phone: astrologerUser.astrologerProfile.phone,
        specialization: astrologerUser.astrologerProfile.specialization,
        experience: astrologerUser.astrologerProfile.experience,
        languages: astrologerUser.astrologerProfile.languages,
        bio: astrologerUser.astrologerProfile.bio,
        pricing: astrologerUser.astrologerProfile.pricing,
        rating: astrologerUser.astrologerProfile.rating,
        totalReviews: astrologerUser.astrologerProfile.totalReviews,
        isAvailable: astrologerUser.astrologerProfile.isAvailable
      });
    }

    res.json({
      astrologer: astrologerObj,
      statistics: {
        totalAppointments,
        completedAppointments,
        upcomingAppointments
      }
    });
  } catch (error) {
    console.error('Error fetching astrologer profile:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// Update astrologer profile
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;

    // Remove sensitive fields from updates
    delete updates.password;
    delete updates.role;
    delete updates.email;

    // Separate updates for User and Astrologer
    const userUpdateFields = {};
    const astrologerUpdateFields = {};

    const userFields = ['name', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth', 'profilePicture', 'latitude', 'longitude', 'timezone'];
    const astrologerFields = ['phone', 'specialization', 'experience', 'languages', 'bio', 'pricing', 'rating', 'totalReviews', 'isAvailable'];

    Object.keys(updates).forEach(key => {
      if (userFields.includes(key)) {
        userUpdateFields[key] = updates[key];
      } else if (astrologerFields.includes(key)) {
        astrologerUpdateFields[key] = updates[key];
      }
    });

    // Update User document
    const astrologerUser = await User.findByIdAndUpdate(
      req.user._id,
      userUpdateFields,
      { new: true, runValidators: true }
    ).select('-password').populate('astrologerProfile');

    if (!astrologerUser || astrologerUser.role !== 'astrologer') {
      return res.status(404).json({ message: 'Astrologer not found' });
    }

    // Update or create Astrologer document
    let profile = await Astrologer.findOne({ userId: req.user._id });
    if (!profile) {
      profile = new Astrologer({
        userId: req.user._id,
        phone: req.user.phone || '',
        ...astrologerUpdateFields
      });
      await profile.save();
      
      // Update link in User
      astrologerUser.astrologerProfile = profile._id;
      await astrologerUser.save();
    } else {
      Object.assign(profile, astrologerUpdateFields);
      await profile.save();
    }

    // Merge for frontend compatibility
    const astrologerObj = astrologerUser.toObject();
    Object.assign(astrologerObj, {
      phone: profile.phone,
      specialization: profile.specialization,
      experience: profile.experience,
      languages: profile.languages,
      bio: profile.bio,
      pricing: profile.pricing,
      rating: profile.rating,
      totalReviews: profile.totalReviews,
      isAvailable: profile.isAvailable
    });

    res.json({
      message: 'Profile updated successfully',
      astrologer: astrologerObj
    });
  } catch (error) {
    console.error('Error updating astrologer profile:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// Get upcoming appointments for dashboard
exports.getUpcomingAppointments = async (req, res) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Appointment.find({
      astrologer: req.user._id,
      status: 'scheduled',
      appointmentDate: {
        $gte: new Date(),
        $lte: tomorrow
      }
    })
    .populate('client', 'name email phone')
    .sort({ appointmentDate: 1, appointmentTime: 1 })
    .limit(5);

    res.json({ appointments });
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    res.status(500).json({ message: 'Server error fetching upcoming appointments' });
  }
};