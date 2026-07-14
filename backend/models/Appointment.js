const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  astrologer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 60, // Duration in minutes
    required: true
  },
  consultationType: {
    type: String,
    enum: [
      'birth_chart',
      'relationship',
      'career',
      'health',
      'general',
      'vastu_consultation',
      'marriage_consultation',
      'finance_consultation',
      'business_consultation',
      'study_consultation',
      'horoscope_weekly',
      'horoscope_monthly',
      'horoscope_yearly',
      'lalkitab_consultation',
      'numerology_consultation',
      'palmistry',
      'special_pooja',
      'negative_energy'
    ],
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  meetingLink: {
    type: String,
    default: ''
  },
  roomId: {
    type: String,
    unique: true,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  clientNotes: {
    type: String,
    default: ''
  },
  astrologerNotes: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    default: ''
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  isFirstTimeBooking: {
    type: Boolean,
    default: false
  },
  clientName: {
    type: String,
    default: ''
  },
  clientAge: {
    type: Number,
    min: 0
  },
  clientDateOfBirth: {
    type: Date
  },
  clientPlaceOfBirth: {
    type: String,
    default: ''
  },
  clientState: {
    type: String,
    default: ''
  },
  clientCountry: {
    type: String,
    default: ''
  },
  astrologerCategory: {
    type: String,
    default: ''
  },
  selectedTopic: {
    type: String,
    default: ''
  },
  selectedQuestion: {
    type: String,
    default: ''
  },
  selectedQuestions: {
    type: [{
      topic: String,
      question: String
    }],
    default: []
  },


  notificationsSent: {
    oneHour: { type: Boolean, default: false },
    thirtyMinutes: { type: Boolean, default: false },
    fifteenMinutes: { type: Boolean, default: false },
    fiveMinutes: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Generate unique room ID before validation
appointmentSchema.pre('validate', function (next) {
  if (!this.roomId) {
    this.roomId = `room_${this._id}_${Date.now()}`;
  }
  next();
});

// Index for efficient querying
appointmentSchema.index({ client: 1, appointmentDate: 1 });
appointmentSchema.index({ astrologer: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);