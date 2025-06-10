const mongoose = require('mongoose');

const UserProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subtestId: { type: String, ref: 'Subtest', required: true },
  testName: { type: String },
  score: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now },
  eligibleForRetakeAt: { type: Date },
  subcategories: [{
    subcategory: String,
    score: Number,
    comment: String,
  }],
  insightsViewed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Insight' }],
  answers: { type: Object },
});

module.exports = mongoose.model('UserProgress', UserProgressSchema);