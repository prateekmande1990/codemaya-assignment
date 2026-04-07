const mongoose = require('mongoose');

const askHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    sources: { type: [String], default: [] },
    confidence: { type: String, enum: ['high', 'medium', 'low'], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AskHistory', askHistorySchema);
