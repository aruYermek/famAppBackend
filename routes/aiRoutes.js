const express = require('express');
const router = express.Router();
const { getAIResponse } = require('../controllers/aiController');

// Обработка запроса на ответ от ИИ
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const aiResponse = await getAIResponse(message);
    return res.json({ reply: aiResponse });
  } catch (error) {
    console.error('Error in /chat route:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
