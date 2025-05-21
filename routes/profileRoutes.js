const express = require('express');
const profileRouter = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getUserProfile, updateUserProfile, logout } = require('../controllers/profileController');

// Log when profile routes are hit
profileRouter.get('/profile', authMiddleware, (req, res, next) => {
  console.log('profileRoutes - Handling GET /api/profile for user:', req.user.id);
  next();
}, getUserProfile);

profileRouter.put('/profile', authMiddleware, (req, res, next) => {
  console.log('profileRoutes - Handling PUT /api/profile for user:', req.user.id);
  next();
}, updateUserProfile);

profileRouter.post('/logout', authMiddleware, (req, res, next) => {
  console.log('profileRoutes - Handling POST /api/logout for user:', req.user.id);
  next();
}, logout);

module.exports = profileRouter;