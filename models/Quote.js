const mongoose = require('mongoose');

const DailyQuoteSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // формат YYYY-MM-DD
  text: { type: String, required: true },
  author: { type: String },
});

module.exports = mongoose.model('DailyQuote', DailyQuoteSchema);