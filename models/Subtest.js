const mongoose = require('mongoose');

// Schema for individual questions
const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true }, // The question text (e.g., "I often think that if something can go wrong, it will")
  subcategory: { type: String, required: true }, // Subcategory (e.g., "emotional-maturity")
  options: {
    type: [String],
    required: true,
    default: [
      'Completely Disagree',
      'Somewhat Disagree',
      'Neither Agree nor Disagree',
      'Somewhat Agree',
      'Completely Agree',
    ], // Fixed 5-point Likert scale
    validate: {
      validator: (v) => v.length === 5,
      message: 'Options must contain exactly 5 elements',
    },
  },
});

// Schema for subtests
const SubtestSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Custom ID (e.g., "emotional-maturity")
  stageId: { type: String, ref: 'Stage', required: true }, // Reference to the Stage
  title: { type: String, required: true }, // Subtest name (e.g., "Emotional Maturity")
  questions: [QuestionSchema], // Array of questions
  subcategories: {
    type: [String],
    required: true,
    validate: {
      validator: (v) => v.length > 0,
      message: 'Subcategories must not be empty',
    },
  },
  unlockRequirement: { type: Number, default: 0 }, // Minimum score to unlock next subtest
  cooldownDays: { type: Number, default: 1 }, // Days before retake is allowed
}, {
  versionKey: '__v',
});

// Index for faster queries by stageId
SubtestSchema.index({ stageId: 1 });

module.exports = mongoose.model('Subtest', SubtestSchema);