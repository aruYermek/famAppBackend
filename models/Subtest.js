const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  subcategory: { type: String, required: true }, 
  options: {
    type: [String],
    required: true,
    default: [
      'Completely Disagree',
      'Somewhat Disagree',
      'Neither Agree nor Disagree',
      'Somewhat Agree',
      'Completely Agree',
    ], 
    validate: {
      validator: (v) => v.length === 5,
      message: 'Options must contain exactly 5 elements',
    },
  },
});

const SubtestSchema = new mongoose.Schema({
  _id: { type: String, required: true }, 
  stageId: { type: String, ref: 'Stage', required: true },
  title: { type: String, required: true }, 
  questions: [QuestionSchema], 
  subcategories: {
    type: [String],
    required: true,
    validate: {
      validator: (v) => v.length > 0,
      message: 'Subcategories must not be empty',
    },
  },
  unlockRequirement: { type: Number, default: 0 }, 
  cooldownDays: { type: Number, default: 1 },
}, {
  versionKey: '__v',
});

SubtestSchema.index({ stageId: 1 });

module.exports = mongoose.model('Subtest', SubtestSchema);