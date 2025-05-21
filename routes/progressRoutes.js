const express = require('express');
const progressRouter = express.Router();
const { getUserProgress } = require('../controllers/progressController');
const authMiddleware = require('../middleware/authMiddleware');

// Get user progress (subtests and insights)
progressRouter.get('/progress', authMiddleware, getUserProgress);

module.exports = progressRouter; // Export the router directly