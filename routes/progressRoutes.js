const express = require('express');
const progressRouter = express.Router();
const { getUserProgress } = require('../controllers/progressController');
const authMiddleware = require('../middleware/authMiddleware');

progressRouter.get('/progress', authMiddleware, getUserProgress);

module.exports = progressRouter; 