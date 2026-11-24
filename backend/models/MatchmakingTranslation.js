const mongoose = require('mongoose');

const matchmakingTranslationSchema = new mongoose.Schema(
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
    kootas: {
      type: Map,
      of: Object,
      default: {}
    },
    diagnostics: {
      type: Map,
      of: Object,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('MatchmakingTranslation', matchmakingTranslationSchema);
