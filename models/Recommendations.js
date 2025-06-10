const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema({
  title: { type: String, required: true }, 
  category: { type: String, enum: ['Breathing', 'Mindfulness', 'Exercise'], required: true },
  duration: { type: String, default: "5 min" }, 
  description: { type: String, required: true }, 
  status: { type: String, enum: ['Not Started', 'In Progress', 'Completed'], default: 'Not Started' }, 
  userProgress: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  content: { type: String }, 
});

module.exports = mongoose.model('Recommendation', RecommendationSchema);