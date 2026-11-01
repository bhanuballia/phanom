const mongoose = require('mongoose');

const d4ChaturthamshaTranslationSchema = new mongoose.Schema(
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
    interpretations: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('D4ChaturthamshaTranslation', d4ChaturthamshaTranslationSchema);
