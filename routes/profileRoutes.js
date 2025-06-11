const express = require('express');
const profileRouter = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getUserProfile, updateUserProfile, logout, deleteUserAccount } = require('../controllers/profileController');

// Маршрут для получения профиля
profileRouter.get('/profile', authMiddleware, (req, res, next) => {
  console.log('profileRoutes - Handling GET /api/profile for user:', req.user.id);
  next();
}, getUserProfile);

// Маршрут для обновления профиля
profileRouter.put('/profile', authMiddleware, (req, res, next) => {
  console.log('profileRoutes - Handling PUT /api/profile for user:', req.user.id);
  next();
}, updateUserProfile);

// Маршрут для выхода
profileRouter.post('/logout', authMiddleware, (req, res, next) => {
  console.log('profileRoutes - Handling POST /api/logout for user:', req.user.id);
  next();
}, logout);

// Маршрут для удаления аккаунта
profileRouter.delete('/profile', authMiddleware, (req, res, next) => {
  console.log('profileRoutes - Handling DELETE /api/profile for user:', req.user.id);
  next();
}, deleteUserAccount);

module.exports = profileRouter;
