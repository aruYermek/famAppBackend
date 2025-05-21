const mongoose = require('mongoose');

const InsightSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Название статьи
  category: { type: String, enum: ['Emotions', 'Finances', 'Values', 'Communication', 'Stress Management'], required: true }, // Категория
  type: { type: String, enum: ['article', 'video', 'quiz'], required: true }, // Тип контента
  content: { type: String, required: true }, // Текст или URL
  duration: { type: String, default: "10 min read" }, // Длительность (например, "10 min read")
  viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Пользователи, просмотревшие
  createdAt: { type: Date, default: Date.now }, // Дата создания для сортировки
});

module.exports = mongoose.model('Insight', InsightSchema);