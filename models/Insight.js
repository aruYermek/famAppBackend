const mongoose = require('mongoose');

const InsightSchema = new mongoose.Schema({
  title: { type: String, required: true }, 
  category: { type: String, enum: ['Emotions', 'Finances', 'Values', 'Communication', 'Stress Management'], required: true }, 
  type: { type: String, enum: ['article', 'video', 'quiz'], required: true }, 
  content: { type: String, required: true }, 
  duration: { type: String, default: "10 min read" }, 
  viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
  createdAt: { type: Date, default: Date.now }, 
});

module.exports = mongoose.model('Insight', InsightSchema);