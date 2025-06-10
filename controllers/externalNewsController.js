const axios = require('axios');

const NEWS_API_KEY = process.env.NEWS_API_KEY;

const TOPICS = {
  family: 'family relationships OR family values OR parenting OR marriage',
  selfReflection: 'self analysis OR self reflection OR personal growth OR mindfulness',
};

exports.getNewsByTopic = async (req, res) => {
  try {
    const { topic } = req.params;
    const query = TOPICS[topic];
    if (!query) {
      return res.status(400).json({ message: 'Invalid topic' });
    }

    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${NEWS_API_KEY}`;

    const response = await axios.get(url);
    const articles = response.data.articles.map(article => ({
      title: article.title,
      description: article.description,
      url: article.url,
      source: article.source.name,
      publishedAt: article.publishedAt,
      content: article.content,
      urlToImage: article.urlToImage,
    }));

    res.json(articles);
  } catch (error) {
    console.error('Error fetching news:', error.message);
    res.status(500).json({ message: 'Failed to fetch news' });
  }
};
