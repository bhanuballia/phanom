const mongoose = require('mongoose');

const d9NavamshaTranslationSchema = new mongoose.Schema(
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
    dynamicAi: {
      heading: { type: String, default: "" },
      subheading: { type: String, default: "" },
      sourceBadge: { type: String, default: "" },
      defaultAssessment: { type: String, default: "" }
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

module.exports = mongoose.model('D9NavamshaTranslation', d9NavamshaTranslationSchema);

