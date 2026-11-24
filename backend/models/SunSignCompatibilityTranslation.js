const mongoose = require('mongoose');

const sunSignCompatibilityTranslationSchema = new mongoose.Schema(
  {
    lang: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    langName: {
      type: String,
      required: true
    },
    // UI strings for the Overall Compatibility Card section
    ui: {
      type: Map,
      of: String,
      default: {}
    },
    // Verdict texts mapped by verdict key (synergy, balance, complementary)
    verdicts: {
      type: Map,
      of: String,
      default: {}
    },
    // Pre-translated backend / calculated compatibility messages
    messages: {
      type: Map,
      of: String,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('SunSignCompatibilityTranslation', sunSignCompatibilityTranslationSchema);
