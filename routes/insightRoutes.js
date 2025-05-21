// backend/routes/insightRoutes.js
const express = require('express');
const insightRouter = express.Router();
const { markInsightAsViewed, getFeaturedInsights, getAllInsights, getInsightById, saveInsight, unsaveInsight, getSavedArticles } = require('../controllers/insightController');
const authMiddleware = require('../middleware/authMiddleware');
const { getRecommendations, updateRecommendationStatus } = require('../controllers/recommendationController');
const { getQuoteOfTheDay } = require('../controllers/quoteController');

insightRouter.get('/featured', getFeaturedInsights);
insightRouter.get('/all', getAllInsights);
insightRouter.get('/quote', getQuoteOfTheDay);
insightRouter.get('/recommendations', getRecommendations);
insightRouter.get('/saved', authMiddleware, getSavedArticles);
insightRouter.get('/:id', getInsightById);
insightRouter.post('/:insightId/view', authMiddleware, markInsightAsViewed);
insightRouter.post('/:insightId/save', authMiddleware, saveInsight);
insightRouter.delete('/:insightId/unsave', authMiddleware, unsaveInsight);
insightRouter.post('/recommendations/:id/status', authMiddleware, updateRecommendationStatus);

module.exports = insightRouter;