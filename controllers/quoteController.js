const Quote = require('../models/Quote');

exports.getQuoteOfTheDay = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // Текущая дата (например, 2025-05-21)
    let quote = await Quote.findOne({ date: today });

    if (!quote) {
      const allQuotes = await Quote.find();
      quote = allQuotes[Math.floor(Math.random() * allQuotes.length)];
    }

    res.json(quote);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};