const mongoose = require('mongoose');

const astroTranslationSchema = new mongoose.Schema(
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
    planets: {
      type: Map,
      of: String,
      default: {}
    },
    signs: {
      type: Map,
      of: String,
      default: {}
    },
    nakshatras: {
      type: Map,
      of: String,
      default: {}
    },
    ui: {
      type: Map,
      of: String,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AstroTranslation', astroTranslationSchema);
