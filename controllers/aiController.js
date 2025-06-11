const axios = require('axios');
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 60 * 5 }); 

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const getAIResponse = async (message) => {
  try {
    const cachedResponse = cache.get(message);
    if (cachedResponse) {
      console.log("Returning cached response");
      return cachedResponse;  
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo', 
        messages: [
          { role: 'user', content: message }
        ],
        max_tokens: 150,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );


    const aiResponse = response.data.choices[0].message.content.trim();

    cache.set(message, aiResponse);

    return aiResponse;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.error('Quota exceeded:', error.response.data);
      throw new Error('You have exceeded your usage quota. Please check your plan and billing details.');
    }
    console.error('Error fetching AI response:', error.message);
    console.error('Error details:', error.response ? error.response.data : error);
    throw new Error('Error processing AI request');
  }
};

module.exports = {
  getAIResponse,
};
