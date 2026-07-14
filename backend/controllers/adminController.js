const User = require('../models/User');
const Astrologer = require('../models/Astrologer');
const Appointment = require('../models/Appointment');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
// Cleanup imports
// const fs = require('fs').promises; 
const { createStorage } = require('../config/cloudinary');
const AppSetting = require('../models/AppSetting');

// Configure multer for Lord Ganesha image uploads
// Configure multer for Lord Ganesha image uploads
const lordGaneshaStorage = createStorage('lord-ganesha');

const imageFileFilter = (req, file, cb) => {
  // Accept only image file types
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/svg+xml',
    'image/webp'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported image format. Please upload JPG, JPEG, PNG, GIF, SVG, or WebP files.'), false);
  }
};

// Configure multer for Lord Ganesha image uploads
const lordGaneshaUpload = multer({
  storage: lordGaneshaStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Configure multer for Kundali Matching background uploads
// Configure multer for Kundali Matching background uploads
const kundaliMatchingStorage = createStorage('kundali-matching-background');

// Configure multer for Home Page background uploads
// Configure multer for Home Page background uploads
const homePageBackgroundStorage = createStorage('homepage-background');

// Configure multer for Kundali Matching background uploads
const kundaliMatchingUpload = multer({
  storage: kundaliMatchingStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Configure multer for Home Page background uploads
const homePageBackgroundUpload = multer({
  storage: homePageBackgroundStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Configure multer for Astrologer profile picture uploads
// Configure multer for Astrologer profile picture uploads
const astrologerProfileStorage = createStorage('astrologers');

const astrologerProfileUpload = multer({
  storage: astrologerProfileStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Export multer middleware
exports.lordGaneshaUpload = lordGaneshaUpload;
exports.kundaliMatchingUpload = kundaliMatchingUpload;
exports.homePageBackgroundUpload = homePageBackgroundUpload;
exports.astrologerProfileUpload = astrologerProfileUpload;

// Email transporter setup (optional)
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

// Create new astrologer
exports.createAstrologer = async (req, res) => {
  try {
    // Log incoming request for debugging
    console.log('Creating astrologer - Request body:', {
      name: req.body.name,
      email: req.body.email,
      hasPassword: !!req.body.password,
      phone: req.body.phone,
      dateOfBirth: req.body.dateOfBirth,
      timeOfBirth: req.body.timeOfBirth,
      placeOfBirth: req.body.placeOfBirth,
      hasFile: !!req.file
    });

    let {
      name,
      email,
      password,
      phone,
      dateOfBirth,
      timeOfBirth,
      placeOfBirth,
      specialization,
      experience,
      languages,
      pricing,
      bio
    } = req.body;

    // Handle file upload if present
    // If file is uploaded via multer, use it. Otherwise, don't set profilePicture (leave as empty string)
    let profilePictureUrl = '';
    if (req.file) {
      profilePictureUrl = req.file.path;
    }
    // Don't use profilePicture from req.body when using FormData - it might be an object
    // Only use it if it's explicitly provided as a string (for API calls without file upload)

    // Parse JSON strings for arrays if they come from FormData
    if (typeof specialization === 'string') {
      try {
        specialization = JSON.parse(specialization);
      } catch (e) {
        specialization = specialization ? [specialization] : [];
      }
    }
    if (!Array.isArray(specialization)) {
      specialization = specialization ? [specialization] : [];
    }

    if (typeof languages === 'string') {
      try {
        languages = JSON.parse(languages);
      } catch (e) {
        languages = languages ? [languages] : ['Hindi', 'English'];
      }
    }
    if (!Array.isArray(languages)) {
      languages = languages ? [languages] : ['Hindi', 'English'];
    }

    // Validate required fields (check for empty strings too)
    const missingFields = [];
    if (!name || (typeof name === 'string' && name.trim() === '')) missingFields.push('name');
    if (!email || (typeof email === 'string' && email.trim() === '')) missingFields.push('email');
    if (!password || (typeof password === 'string' && password.trim() === '')) missingFields.push('password');
    if (!phone || (typeof phone === 'string' && phone.trim() === '')) missingFields.push('phone');

    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}. Please fill all required fields.`,
        missingFields: missingFields
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Validate date format
    let parsedDateOfBirth;
    if (dateOfBirth) {
      parsedDateOfBirth = new Date(dateOfBirth);
      if (isNaN(parsedDateOfBirth.getTime())) {
        return res.status(400).json({
          message: 'Invalid dateOfBirth format. Please provide a valid date.'
        });
      }
    }

    // Create new astrologer (password will be hashed by pre-save hook)
    const astrologer = new User({
      name: (name || '').trim(),
      email: (email || '').trim().toLowerCase(),
      password,
      phone: (phone || '').trim(),
      dateOfBirth: parsedDateOfBirth,
      timeOfBirth: (timeOfBirth || '').trim(),
      placeOfBirth: (placeOfBirth || '').trim(),
      role: 'astrologer',
      profilePicture: profilePictureUrl,
      isVerified: true,
      registrationSource: 'admin_created'
    });

    try {
      const savedUser = await astrologer.save();
      
      const astrologerProfile = new Astrologer({
        userId: savedUser._id,
        phone: (phone || '').trim(),
        specialization: specialization || [],
        experience: experience ? parseInt(experience) : 0,
        languages: languages || ['Hindi', 'English'],
        pricing: pricing ? parseFloat(pricing) : 100,
        bio: (bio || '').trim(),
        isAvailable: true
      });
      await astrologerProfile.save();

      savedUser.astrologerProfile = astrologerProfile._id;
      await savedUser.save();
    } catch (saveError) {
      console.error('Error saving astrologer:', saveError);
      // If it's a validation error, return more specific message
      if (saveError.name === 'ValidationError') {
        const errors = Object.values(saveError.errors).map(err => err.message);
        return res.status(400).json({
          message: 'Validation error: ' + errors.join(', '),
          errors: errors,
          fieldErrors: Object.keys(saveError.errors).reduce((acc, key) => {
            acc[key] = saveError.errors[key].message;
            return acc;
          }, {})
        });
      }
      // If it's a duplicate key error (e.g., email already exists)
      if (saveError.code === 11000) {
        const field = Object.keys(saveError.keyPattern)[0];
        return res.status(400).json({
          message: `${field} already exists. Please use a different ${field}.`
        });
      }
      throw saveError;
    }

    // Send welcome email to new astrologer
    if (transporter) {
      const welcomeEmail = `
        <div style="font-family: Arial, sans-serif; color: #333; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px;">
          <div style="background: white; padding: 30px; border-radius: 15px; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #D4AF37; font-size: 28px; margin-bottom: 10px;">🕉 Welcome to AstroConsult 🕉</h1>
              <h2 style="color: #9333EA; font-size: 24px;">नमस्ते ${name}</h2>
            </div>
            
            <div style="background: linear-gradient(45deg, #D4AF37, #F59E0B); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
              <h3 style="color: white; margin: 0; font-size: 22px;">🌟 You've been added as an Astrologer!</h3>
            </div>
            
            <div style="padding: 20px; background: #f8f9fa; border-radius: 10px; margin: 20px 0;">
              <h4 style="color: #333; margin-bottom: 15px;">📋 Your Details:</h4>
              <p style="margin: 8px 0;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 8px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 8px 0;"><strong>Phone:</strong> ${phone}</p>
              <p style="margin: 8px 0;"><strong>Role:</strong> Astrologer</p>
            </div>
            
            <div style="background: linear-gradient(45deg, #9333EA, #7C3AED); padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
              <p style="color: white; margin: 0; font-size: 16px;">🙏 Start providing divine guidance to seekers</p>
              <p style="color: white; margin: 5px 0 0 0; font-size: 14px;">अब आप जीवन की समस्याओं का समाधान दे सकते हैं</p>
            </div>
          </div>
        </div>
      `;

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: '🕉 Welcome to AstroConsult - Astrologer Account Created',
          html: welcomeEmail
        });
        console.log(`Welcome email sent to new astrologer: ${email}`);
      } catch (emailError) {
        console.log('Welcome email sending failed:', emailError.message);
      }
    }

    res.status(201).json({
      message: 'Astrologer created successfully',
      astrologer: {
        id: astrologer._id,
        name: astrologer.name,
        email: astrologer.email,
        phone: astrologer.phone,
        role: astrologer.role,
        specialization: astrologer.specialization,
        experience: astrologer.experience
      }
    });
  } catch (error) {
    console.error('Error creating astrologer:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      message: 'Server error creating astrologer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all astrologers
exports.getAllAstrologers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    let query = { role: 'astrologer' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }

    const astrologers = await User.find(query)
      .select('-password')
      .populate('astrologerProfile')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    // Get appointment counts for each astrologer
    const astrologersWithStats = await Promise.all(
      astrologers.map(async (astrologer) => {
        const uObj = astrologer.toObject();
        const profile = uObj.astrologerProfile || {};
        delete uObj.astrologerProfile;
        
        const mergedAstrologer = {
          ...uObj,
          phone: profile.phone || '',
          specialization: profile.specialization || [],
          experience: profile.experience || 0,
          languages: profile.languages || ['Hindi', 'English'],
          bio: profile.bio || '',
          pricing: profile.pricing || 100,
          rating: profile.rating || 0,
          totalReviews: profile.totalReviews || 0,
          isAvailable: profile.isAvailable !== false
        };

        const appointmentCount = await Appointment.countDocuments({
          astrologer: astrologer._id,
          status: { $ne: 'cancelled' }
        });

        const completedAppointments = await Appointment.countDocuments({
          astrologer: astrologer._id,
          status: 'completed'
        });

        return {
          ...mergedAstrologer,
          appointmentCount,
          completedAppointments
        };
      })
    );

    res.json({
      astrologers: astrologersWithStats,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching astrologers:', error);
    res.status(500).json({ message: 'Server error fetching astrologers' });
  }
};

// Get astrologer by ID
exports.getAstrologerById = async (req, res) => {
  try {
    const astrologerUser = await User.findById(req.params.id).select('-password').populate('astrologerProfile');

    if (!astrologerUser || astrologerUser.role !== 'astrologer') {
      return res.status(404).json({ message: 'Astrologer not found' });
    }

    const uObj = astrologerUser.toObject();
    const profile = uObj.astrologerProfile || {};
    delete uObj.astrologerProfile;
    
    const astrologer = {
      ...uObj,
      phone: profile.phone || '',
      specialization: profile.specialization || [],
      experience: profile.experience || 0,
      languages: profile.languages || ['Hindi', 'English'],
      bio: profile.bio || '',
      pricing: profile.pricing || 100,
      rating: profile.rating || 0,
      totalReviews: profile.totalReviews || 0,
      isAvailable: profile.isAvailable !== false
    };

    // Get astrologer's appointments
    const appointments = await Appointment.find({ astrologer: req.params.id })
      .populate('client', 'name email phone')
      .sort({ appointmentDate: -1 })
      .limit(10);

    const appointmentStats = await Appointment.aggregate([
      { $match: { astrologer: astrologerUser._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      astrologer,
      appointments,
      appointmentStats
    });
  } catch (error) {
    console.error('Error fetching astrologer:', error);
    res.status(500).json({ message: 'Server error fetching astrologer' });
  }
};

// Update astrologer information
exports.updateAstrologer = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove sensitive fields from updates
    delete updates.password;
    delete updates.role;

    // If password is being updated separately
    if (req.body.newPassword) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(req.body.newPassword, salt);
      delete updates.newPassword;
    }

    // Separate updates for User and Astrologer
    const userUpdateFields = {};
    const astrologerUpdateFields = {};

    const userFields = ['name', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth', 'profilePicture', 'latitude', 'longitude', 'timezone', 'password'];
    const astrologerFields = ['phone', 'specialization', 'experience', 'languages', 'bio', 'pricing', 'rating', 'totalReviews', 'isAvailable'];

    Object.keys(updates).forEach(key => {
      if (userFields.includes(key)) {
        userUpdateFields[key] = updates[key];
      } else if (astrologerFields.includes(key)) {
        astrologerUpdateFields[key] = updates[key];
      }
    });

    const astrologerUser = await User.findByIdAndUpdate(
      id,
      userUpdateFields,
      { new: true, runValidators: true }
    ).select('-password').populate('astrologerProfile');

    if (!astrologerUser || astrologerUser.role !== 'astrologer') {
      return res.status(404).json({ message: 'Astrologer not found' });
    }

    // Update or create Astrologer document
    let profile = await Astrologer.findOne({ userId: id });
    if (!profile) {
      profile = new Astrologer({
        userId: id,
        phone: updates.phone || '',
        ...astrologerUpdateFields
      });
      await profile.save();
      
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
      message: 'Astrologer updated successfully',
      astrologer: astrologerObj
    });
  } catch (error) {
    console.error('Error updating astrologer:', error);
    res.status(500).json({ message: 'Server error updating astrologer' });
  }
};

// Delete astrologer
exports.deleteAstrologer = async (req, res) => {
  try {
    const { id } = req.params;

    // Check for pending appointments
    const pendingAppointments = await Appointment.countDocuments({
      astrologer: id,
      status: { $in: ['scheduled', 'in_progress'] }
    });

    if (pendingAppointments > 0) {
      return res.status(400).json({
        message: `Cannot delete astrologer. ${pendingAppointments} pending appointments found.`
      });
    }

    const astrologer = await User.findByIdAndDelete(id);

    if (!astrologer || astrologer.role !== 'astrologer') {
      return res.status(404).json({ message: 'Astrologer not found' });
    }

    // Delete corresponding Astrologer profile document
    await Astrologer.findOneAndDelete({ userId: id });

    res.json({ message: 'Astrologer deleted successfully' });
  } catch (error) {
    console.error('Error deleting astrologer:', error);
    res.status(500).json({ message: 'Server error deleting astrologer' });
  }
};

// Get all appointments for admin
exports.getAllAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, astrologerId, startDate, endDate } = req.query;

    let query = {};

    if (status) query.status = status;
    if (astrologerId) query.astrologer = astrologerId;

    if (startDate && endDate) {
      query.appointmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const appointments = await Appointment.find(query)
      .populate('client', 'name email phone')
      .populate('astrologer', 'name email phone')
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
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Server error fetching appointments' });
  }
};

// Get appointment by ID
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('client', 'name email phone dateOfBirth timeOfBirth placeOfBirth')
      .populate('astrologer', 'name email phone');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({ appointment });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ message: 'Server error fetching appointment' });
  }
};

// Cancel appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      {
        status: 'cancelled',
        adminNotes: reason || 'Cancelled by admin',
        cancelledBy: req.user._id,
        cancelledAt: new Date()
      },
      { new: true }
    ).populate('client', 'name email phone')
      .populate('astrologer', 'name email phone');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Send cancellation notification to client and astrologer
    if (process.env.EMAIL_USER) {
      const cancellationEmailClient = `
        <div style="font-family: Arial, sans-serif; color: #333; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px;">
          <div style="background: white; padding: 30px; border-radius: 15px; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #D4AF37; font-size: 28px; margin-bottom: 10px;">🕉 Appointment Cancelled 🕉</h1>
              <h2 style="color: #9333EA; font-size: 24px;">नमस्ते ${appointment.client.name}</h2>
            </div>
            
            <div style="background: linear-gradient(45deg, #F59E0B, #EF4444); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
              <h3 style="color: white; margin: 0; font-size: 22px;">❌ Your appointment has been cancelled</h3>
            </div>
            
            <div style="padding: 20px; background: #f8f9fa; border-radius: 10px; margin: 20px 0;">
              <h4 style="color: #333; margin-bottom: 15px;">📅 Cancelled Appointment Details:</h4>
              <p style="margin: 8px 0;"><strong>Astrologer:</strong> ${appointment.astrologer.name}</p>
              <p style="margin: 8px 0;"><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString('en-IN')}</p>
              <p style="margin: 8px 0;"><strong>Time:</strong> ${appointment.appointmentTime}</p>
              <p style="margin: 8px 0;"><strong>Reason:</strong> ${reason || 'Administrative cancellation'}</p>
            </div>
            
            <div style="background: linear-gradient(45deg, #9333EA, #7C3AED); padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
              <p style="color: white; margin: 0; font-size: 16px;">🙏 We apologize for any inconvenience</p>
              <p style="color: white; margin: 5px 0 0 0; font-size: 14px;">Please book another appointment at your convenience</p>
            </div>
          </div>
        </div>
      `;

      // Send to client
      if (transporter) {
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: appointment.client.email,
            subject: '🕉 Appointment Cancelled - AstroConsult',
            html: cancellationEmailClient
          });

          // Send to astrologer
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: appointment.astrologer.email,
            subject: '🕉 Appointment Cancelled - AstroConsult',
            html: cancellationEmailClient.replace(appointment.client.name, appointment.astrologer.name)
          });
          console.log('Cancellation emails sent successfully');
        } catch (emailError) {
          console.log('Cancellation email sending failed:', emailError.message);
        }
      }
    }

    res.json({
      message: 'Appointment cancelled successfully',
      appointment
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ message: 'Server error cancelling appointment' });
  }
};

// Reschedule appointment
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { newDate, newTime, reason } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      {
        appointmentDate: new Date(newDate),
        appointmentTime: newTime,
        status: 'rescheduled',
        adminNotes: reason || 'Rescheduled by admin',
        rescheduledBy: req.user._id,
        rescheduledAt: new Date(),
        // Reset notification flags for new time
        notificationsSent: {
          oneHour: false,
          thirtyMinutes: false,
          fifteenMinutes: false,
          fiveMinutes: false
        }
      },
      { new: true }
    ).populate('client', 'name email phone')
      .populate('astrologer', 'name email phone');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({
      message: 'Appointment rescheduled successfully',
      appointment
    });
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    res.status(500).json({ message: 'Server error rescheduling appointment' });
  }
};

// Get admin dashboard statistics
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'client' });
    const totalAstrologers = await User.countDocuments({ role: 'astrologer' });
    const totalAppointments = await Appointment.countDocuments();

    const appointmentsByStatus = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const monthlyAppointments = await Appointment.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$appointmentDate' },
            month: { $month: '$appointmentDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    const topAstrologers = await Appointment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$astrologer',
          appointmentCount: { $sum: 1 }
        }
      },
      { $sort: { appointmentCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'astrologer'
        }
      },
      { $unwind: '$astrologer' },
      {
        $project: {
          name: '$astrologer.name',
          email: '$astrologer.email',
          appointmentCount: 1
        }
      }
    ]);

    res.json({
      totalUsers,
      totalAstrologers,
      totalAppointments,
      appointmentsByStatus,
      monthlyAppointments,
      topAstrologers
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search = '' } = req.query;

    let query = {};

    if (role) query.role = role;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['client', 'astrologer', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Server error updating user role' });
  }
};

// Get registration statistics
exports.getRegistrationStats = async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;

    let matchStage = {};
    const now = new Date();

    switch (timeframe) {
      case '7d':
        matchStage.createdAt = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case '30d':
        matchStage.createdAt = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        break;
      case '90d':
        matchStage.createdAt = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
        break;
      case '1y':
        matchStage.createdAt = { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
        break;
      default:
        matchStage.createdAt = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
    }

    // Daily registration counts
    const dailyRegistrations = await User.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          clients: {
            $sum: { $cond: [{ $eq: ['$role', 'client'] }, 1, 0] }
          },
          astrologers: {
            $sum: { $cond: [{ $eq: ['$role', 'astrologer'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Registration by role
    const roleDistribution = await User.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent registrations
    const recentRegistrations = await User.find(matchStage)
      .select('name email role createdAt isVerified')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      timeframe,
      dailyRegistrations,
      roleDistribution,
      recentRegistrations,
      summary: {
        totalRegistrations: dailyRegistrations.reduce((sum, day) => sum + day.count, 0),
        totalClients: dailyRegistrations.reduce((sum, day) => sum + day.clients, 0),
        totalAstrologers: dailyRegistrations.reduce((sum, day) => sum + day.astrologers, 0)
      }
    });
  } catch (error) {
    console.error('Error fetching registration stats:', error);
    res.status(500).json({ message: 'Server error fetching registration statistics' });
  }
};

// Upload Lord Ganesha Image
exports.uploadLordGaneshaImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const imageUrl = req.file.path;

    // Save to AppSetting
    await AppSetting.findOneAndUpdate(
      { key: 'lord_ganesha' },
      { key: 'lord_ganesha', value: imageUrl, updatedAt: Date.now() },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Lord Ganesha image uploaded successfully',
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Error uploading Lord Ganesha image:', error);
    res.status(500).json({ message: 'Server error uploading image' });
  }
};

// Get Lord Ganesha Image
exports.getLordGaneshaImage = async (req, res) => {
  try {
    const setting = await AppSetting.findOne({ key: 'lord_ganesha' });

    res.json({
      success: true,
      imageUrl: setting ? setting.value : null
    });
  } catch (error) {
    console.error('Error fetching Lord Ganesha image:', error);
    res.status(500).json({ message: 'Server error fetching image' });
  }
};

// Upload Kundali Matching Background Image
exports.uploadKundaliMatchingBackground = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const imageUrl = req.file.path;

    // Save to AppSetting
    await AppSetting.findOneAndUpdate(
      { key: 'kundali_matching_background' },
      { key: 'kundali_matching_background', value: imageUrl, updatedAt: Date.now() },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Kundali Matching background image uploaded successfully',
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Error uploading Kundali Matching background image:', error);
    res.status(500).json({ message: 'Server error uploading image' });
  }
};

// Get Kundali Matching Background Image
exports.getKundaliMatchingBackground = async (req, res) => {
  try {
    const setting = await AppSetting.findOne({ key: 'kundali_matching_background' });

    res.json({
      success: true,
      imageUrl: setting ? setting.value : null
    });
  } catch (error) {
    console.error('Error fetching Kundali Matching background image:', error);
    res.status(500).json({ message: 'Server error fetching image' });
  }
};

// Upload Home Page Background Image
exports.uploadHomePageBackground = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const imageUrl = req.file.path;

    // Save to AppSetting
    await AppSetting.findOneAndUpdate(
      { key: 'homepage_background' },
      { key: 'homepage_background', value: imageUrl, updatedAt: Date.now() },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Home Page background image uploaded successfully',
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Error uploading Home Page background image:', error);
    res.status(500).json({ message: 'Server error uploading image' });
  }
};

// Get Home Page Background Image
exports.getHomePageBackground = async (req, res) => {
  try {
    const setting = await AppSetting.findOne({ key: 'homepage_background' });

    res.json({
      success: true,
      imageUrl: setting ? setting.value : null
    });
  } catch (error) {
    console.error('Error fetching Home Page background image:', error);
    res.status(500).json({ message: 'Server error fetching image' });
  }
};
