const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stageId: { type: String, ref: 'Stage', required: true }, // Изменяем на String
  results: [
    {
      subtestId: { type: String, ref: 'Subtest', required: true }, // Изменяем на String
      subtestTitle: String,
      overallScore: Number,
      subcategories: [
        {
          subcategory: String,
          score: Number,
          comment: String,
        },
      ],
    },
  ],
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('TestResult', testResultSchema);