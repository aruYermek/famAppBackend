const axios = require('axios');
const DailyQuote = require('../models/Quote');

exports.getQuoteOfTheDay = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    let dailyQuote = await DailyQuote.findOne({ date: today });

    if (!dailyQuote) {
      const response = await axios.get('https://zenquotes.io/api/today');
      const quoteData = response.data[0];

      dailyQuote = new DailyQuote({
        date: today,
        text: quoteData.q,
        author: quoteData.a || 'Unknown',
      });

      await dailyQuote.save();
    }

    res.json({ text: dailyQuote.text, author: dailyQuote.author });
  } catch (error) {
    console.error('Failed to fetch or save daily quote:', error.message);
    res.status(500).json({ message: 'Failed to get quote of the day' });
  }
};
