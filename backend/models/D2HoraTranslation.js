const mongoose = require('mongoose');

const d2HoraTranslationSchema = new mongoose.Schema(
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
    ui: {
      type: Map,
      of: String,
      default: {}
    },
    planets: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    houses: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    guidelines: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    bhavasTitles: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    solarLunar: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('D2HoraTranslation', d2HoraTranslationSchema);
