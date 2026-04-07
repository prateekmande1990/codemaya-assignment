const mongoose = require('mongoose');

const rateLimitWindowSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    routeKey: { type: String, required: true, index: true },
    windowStart: { type: Date, required: true, index: true },
    count: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

rateLimitWindowSchema.index({ userId: 1, routeKey: 1, windowStart: 1 }, { unique: true });

module.exports = mongoose.model('RateLimitWindow', rateLimitWindowSchema);
