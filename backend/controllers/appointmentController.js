const Appointment = require('../models/Appointment');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Initialize Twilio client only if credentials are provided
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

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

// Helper function to calculate time difference in minutes
const getTimeDifferenceInMinutes = (appointmentDateTime) => {
  const now = new Date();
  const appointmentTime = new Date(appointmentDateTime);
  return Math.floor((appointmentTime - now) / (1000 * 60));
};

// Helper function to format appointment date and time
const formatAppointmentDateTime = (appointmentDate, appointmentTime) => {
  const date = new Date(appointmentDate);
  const [hours, minutes] = appointmentTime.split(':');
  date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return date;
};

// Send email notification
const sendEmailNotification = async (userEmail, userName, astrologerName, timeLeft, appointmentDate, appointmentTime) => {
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; color: #333; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px;">
      <div style="background: white; padding: 30px; border-radius: 15px; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #D4AF37; font-size: 28px; margin-bottom: 10px;">🕉 Appointment Reminder 🕉</h1>
          <h2 style="color: #9333EA; font-size: 24px;">नमस्ते ${userName}</h2>
        </div>
        
        <div style="background: linear-gradient(45deg, #D4AF37, #F59E0B); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
          <h3 style="color: white; margin: 0; font-size: 22px;">⏰ Your astrology consultation starts in ${timeLeft} minutes!</h3>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa; border-radius: 10px; margin: 20px 0;">
          <h4 style="color: #333; margin-bottom: 15px;">📅 Appointment Details:</h4>
          <p style="margin: 8px 0;"><strong>Astrologer:</strong> ${astrologerName}</p>
          <p style="margin: 8px 0;"><strong>Date:</strong> ${new Date(appointmentDate).toLocaleDateString('en-IN')}</p>
          <p style="margin: 8px 0;"><strong>Time:</strong> ${appointmentTime}</p>
          <p style="margin: 8px 0;"><strong>Remaining Time:</strong> ${timeLeft} minutes</p>
        </div>
        
        <div style="background: linear-gradient(45deg, #9333EA, #7C3AED); padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
          <p style="color: white; margin: 0; font-size: 16px;">🙏 Please be ready for your divine consultation</p>
          <p style="color: white; margin: 5px 0 0 0; font-size: 14px;">कृपया अपने दिव्य परामर्श के लिए तैयार रहें</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #666; font-size: 14px;">
            🌟 Join your video consultation on time to get the most accurate predictions 🌟
          </p>
        </div>
      </div>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `🕉 Appointment Reminder - ${timeLeft} minutes to go!`,
    html: emailHtml
  };

  try {
    if (transporter) {
      await transporter.sendMail(mailOptions);
      console.log(`Email reminder sent to ${userEmail} for ${timeLeft} minutes before appointment`);
    } else {
      console.log('Email not sent - Email configuration not available');
    }
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};

// Send SMS notification
const sendSMSNotification = async (phoneNumber, userName, astrologerName, timeLeft, appointmentDate, appointmentTime) => {
  const smsMessage = `🕉 नमस्ते ${userName}!

Reminder: Your astrology consultation with ${astrologerName} starts in ${timeLeft} minutes!

📅 Date: ${new Date(appointmentDate).toLocaleDateString('en-IN')}
⏰ Time: ${appointmentTime}

Please be ready for your session.

ज्योतिष शास्त्र - AstroConsult`;

  try {
    if (twilioClient && phoneNumber) {
      await twilioClient.messages.create({
        body: smsMessage,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
      console.log(`SMS reminder sent to ${phoneNumber} for ${timeLeft} minutes before appointment`);
    } else {
      console.log(`SMS not sent - Twilio not configured or phone number missing`);
    }
  } catch (error) {
    console.error('SMS sending failed:', error);
  }
};

// Main function to send reminders
const sendAppointmentReminder = async (appointment, reminderType) => {
  try {
    // Get full appointment details with user information
    const fullAppointment = await Appointment.findById(appointment._id)
      .populate('client', 'name email phone')
      .populate('astrologer', 'name email');

    if (!fullAppointment || !fullAppointment.client || !fullAppointment.astrologer) {
      console.error('Appointment or user details not found');
      return;
    }

    const client = fullAppointment.client;
    const astrologer = fullAppointment.astrologer;

    // Calculate appointment date-time
    const appointmentDateTime = formatAppointmentDateTime(
      fullAppointment.appointmentDate,
      fullAppointment.appointmentTime
    );

    const timeLeft = getTimeDifferenceInMinutes(appointmentDateTime);

    // Send email notification
    if (client.email) {
      await sendEmailNotification(
        client.email,
        client.name,
        astrologer.name,
        timeLeft,
        fullAppointment.appointmentDate,
        fullAppointment.appointmentTime
      );
    }

    // Send SMS notification
    if (client.phone) {
      await sendSMSNotification(
        client.phone,
        client.name,
        astrologer.name,
        timeLeft,
        fullAppointment.appointmentDate,
        fullAppointment.appointmentTime
      );
    }

    // Update notification status
    const updateField = `notificationsSent.${reminderType}`;
    await Appointment.findByIdAndUpdate(appointment._id, {
      [updateField]: true
    });

    console.log(`${reminderType} reminder sent successfully for appointment ${appointment._id}`);

  } catch (error) {
    console.error(`Error sending ${reminderType} reminder:`, error);
  }
};

// Function to check and send all pending reminders
const checkAndSendReminders = async () => {
  try {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
    const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    // Find appointments that need reminders
    const appointments = await Appointment.find({
      status: 'scheduled',
      appointmentDate: {
        $gte: now,
        $lte: oneHourFromNow
      }
    });

    for (const appointment of appointments) {
      const appointmentDateTime = formatAppointmentDateTime(
        appointment.appointmentDate,
        appointment.appointmentTime
      );

      const timeLeft = getTimeDifferenceInMinutes(appointmentDateTime);

      // Send 1-hour reminder
      if (timeLeft <= 60 && timeLeft > 55 && !appointment.notificationsSent.oneHour) {
        await sendAppointmentReminder(appointment, 'oneHour');
      }

      // Send 30-minute reminder
      if (timeLeft <= 30 && timeLeft > 25 && !appointment.notificationsSent.thirtyMinutes) {
        await sendAppointmentReminder(appointment, 'thirtyMinutes');
      }

      // Send 15-minute reminder
      if (timeLeft <= 15 && timeLeft > 10 && !appointment.notificationsSent.fifteenMinutes) {
        await sendAppointmentReminder(appointment, 'fifteenMinutes');
      }

      // Send 5-minute reminder
      if (timeLeft <= 5 && timeLeft > 0 && !appointment.notificationsSent.fiveMinutes) {
        await sendAppointmentReminder(appointment, 'fiveMinutes');
      }
    }

  } catch (error) {
    console.error('Error in checkAndSendReminders:', error);
  }
};



// Check if this is a first-time booking based on email or phone
const checkFirstTimeBooking = async (req, res) => {
  try {
    const { email, phone } = req.query;

    if (!email && !phone) {
      return res.status(400).json({ message: 'Email or phone number required' });
    }

    // Find user by email or phone
    let user = null;
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
    }
    if (!user && phone) {
      user = await User.findOne({ phone });
    }

    if (!user) {
      // No user found, this is definitely a first-time booking
      return res.json({ isFirstTime: true, message: 'First consultation is FREE!' });
    }

    // Check if user has any previous appointments
    const previousAppointments = await Appointment.countDocuments({
      client: user._id,
      status: { $nin: ['cancelled'] } // Don't count cancelled appointments
    });

    const isFirstTime = previousAppointments === 0;

    res.json({
      isFirstTime,
      message: isFirstTime ? 'First consultation is FREE!' : 'Regular pricing applies',
      previousBookings: previousAppointments
    });

  } catch (error) {
    console.error('Error checking first-time booking:', error);
    res.status(500).json({ message: 'Server error checking booking status' });
  }
};

// Create appointment with automatic reminder setup and first-time free booking
const createAppointment = async (req, res) => {
  try {
    const {
      astrologerId,
      appointmentDate,
      appointmentTime,
      duration,
      consultationType,
      notes,
      price,
      clientName,
      clientAge,
      clientDateOfBirth,
      clientPlaceOfBirth,
      clientState,
      clientCountry,
      astrologerCategory,
      selectedTopic,
      selectedQuestion,
      selectedQuestions
    } = req.body;



    // Log the request body for debugging
    console.log('Creating appointment with data:', {
      astrologerId,
      appointmentDate,
      appointmentTime,
      clientName
    });

    if (!astrologerId || !appointmentDate || !appointmentTime || !consultationType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if astrologer exists
    const astrologer = await User.findById(astrologerId);
    if (!astrologer || astrologer.role !== 'astrologer') {
      return res.status(400).json({ message: 'Invalid astrologer selected' });
    }

    // Check for existing appointment at the same time
    // Convert appointmentDate string to Date object for consistent comparison
    const bookingDate = new Date(appointmentDate);
    if (isNaN(bookingDate.getTime())) {
      return res.status(400).json({ message: 'Invalid appointment date' });
    }

    const existingAppointment = await Appointment.findOne({
      astrologer: astrologerId,
      appointmentDate: bookingDate,
      appointmentTime,
      status: { $nin: ['cancelled', 'completed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    // Check if this is a first-time booking
    const previousAppointments = await Appointment.countDocuments({
      client: req.user._id,
      status: { $nin: ['cancelled'] }
    });

    const isFirstTime = previousAppointments === 0;
    const finalPrice = isFirstTime ? 0 : (price || 100);

    // Sanitize client information to handle empty strings (preventing Mongoose casting errors)
    const sanitizedClientDateOfBirth = clientDateOfBirth && clientDateOfBirth !== "" ? new Date(clientDateOfBirth) : undefined;
    const sanitizedClientAge = (clientAge && clientAge !== "") ? Number(clientAge) : undefined;

    // Create appointment
    const appointment = new Appointment({
      client: req.user._id,
      astrologer: astrologerId,
      appointmentDate: bookingDate,
      appointmentTime,
      duration: duration || 60,
      consultationType,
      notes,
      price: finalPrice,
      isFirstTimeBooking: isFirstTime,
      clientName,
      clientAge: sanitizedClientAge,
      clientDateOfBirth: sanitizedClientDateOfBirth,
      clientPlaceOfBirth,
      clientState,
      clientCountry,
      astrologerCategory,
      selectedTopic,
      selectedQuestion,
      selectedQuestions: selectedQuestions || [],
      notificationsSent: {


        oneHour: false,
        thirtyMinutes: false,
        fifteenMinutes: false,
        fiveMinutes: false
      }
    });

    await appointment.save();

    // Populate the appointment with user details for the response and potential emails
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('client', 'name email phone')
      .populate('astrologer', 'name email');

    if (!populatedAppointment) {
      throw new Error('Failed to retrieve populated appointment');
    }

    // --- NOTIFICATION BLOCK (Failsafe) ---
    // We send notifications but don't let their failure crash the booking
    try {
      const client = populatedAppointment.client;
      const astrologerInfo = populatedAppointment.astrologer;

      if (client.email && transporter) {
        const confirmationHtml = `
          <div style="font-family: Arial, sans-serif; color: #333; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px;">
            <div style="background: white; padding: 30px; border-radius: 15px; max-width: 600px; margin: 0 auto;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #D4AF37; font-size: 28px; margin-bottom: 10px;">🕉 Appointment Confirmed 🕉</h1>
                <h2 style="color: #9333EA; font-size: 24px;">नमस्ते ${client.name}</h2>
              </div>
              
              ${isFirstTime ? `
              <div style="background: linear-gradient(45deg, #10B981, #059669); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
                <h3 style="color: white; margin: 0; font-size: 22px;">🎉 Your FIRST consultation is FREE! 🎉</h3>
                <p style="color: white; margin: 10px 0 0 0;">Welcome to our astrology family!</p>
              </div>
              ` : ''}
              
              <div style="background: linear-gradient(45deg, #D4AF37, #F59E0B); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
                <h3 style="color: white; margin: 0; font-size: 22px;">✅ Your appointment has been successfully booked!</h3>
              </div>
              
              <div style="padding: 20px; background: #f8f9fa; border-radius: 10px; margin: 20px 0;">
                <h4 style="color: #333; margin-bottom: 15px;">📅 Appointment Details:</h4>
                <p style="margin: 8px 0;"><strong>Astrologer:</strong> ${astrologerInfo.name}</p>
                <p style="margin: 8px 0;"><strong>Date:</strong> ${new Date(appointmentDate).toLocaleDateString('en-IN')}</p>
                <p style="margin: 8px 0;"><strong>Time:</strong> ${appointmentTime}</p>
                <p style="margin: 8px 0;"><strong>Duration:</strong> ${duration} minutes</p>
                <p style="margin: 8px 0;"><strong>Consultation Type:</strong> ${consultationType}</p>
                <p style="margin: 8px 0;"><strong>Price:</strong> ${isFirstTime ? 'FREE (First Consultation)' : `₹${finalPrice}`}</p>
              </div>
              
              <div style="background: linear-gradient(45deg, #9333EA, #7C3AED); padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
                <p style="color: white; margin: 0; font-size: 16px;">🔔 You'll receive reminders before your appointment</p>
                <p style="color: white; margin: 5px 0 0 0; font-size: 14px;">1 hour, 30 min, 15 min, and 5 min before the session</p>
              </div>
            </div>
          </div>
        `;

        // Send email asynchronously without awaiting if possible, 
        // but here we are in a serverless func, so we await just in case, 
        // wrapped in its own try/catch.
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: client.email,
          subject: isFirstTime ? '🕉 FREE First Consultation Confirmed!' : '🕉 Appointment Confirmation - AstroConsult',
          html: confirmationHtml
        }).catch(e => console.error('Immediate Email Confirmation Failed:', e.message));
      }
    } catch (notificationError) {
      // Log the error but DO NOT block the response. The booking is already saved.
      console.error('Non-blocking Notification Error:', notificationError.message);
    }
    // --- END NOTIFICATION BLOCK ---

    res.status(201).json({
      message: isFirstTime
        ? 'Congratulations! Your FIRST consultation is FREE! You will receive reminders before your session.'
        : 'Appointment booked successfully! You will receive reminders before your session.',
      appointment: populatedAppointment,
      isFirstTime,
      finalPrice
    });

  } catch (error) {
    console.error('Detailed Appointment Creation Error:', {
      message: error.message,
      stack: error.stack,
      body: req.body,
      user: req.user?._id
    });
    res.status(500).json({
      message: 'Server error creating appointment',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createAppointment,
  checkAndSendReminders,
  sendAppointmentReminder,
  checkFirstTimeBooking
};