const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Название (например, "Box Breathing")
  category: { type: String, enum: ['Breathing', 'Mindfulness', 'Exercise'], required: true }, // Категория
  duration: { type: String, default: "5 min" }, // Длительность
  description: { type: String, required: true }, // Описание (например, "Reduces anxiety and improves focus")
  status: { type: String, enum: ['Not Started', 'In Progress', 'Completed'], default: 'Not Started' }, // Статус
  userProgress: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Прогресс пользователей
  content: { type: String }, // Инструкции или URL
});

module.exports = mongoose.model('Recommendation', RecommendationSchema);