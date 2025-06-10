const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getUserResults, getOverallResults, saveTestResult } = require('../controllers/resultsController');

const restrictToSelf = (req, res, next) => {
  const userId = req.params.userId || req.body.userId;
  console.log('📡 Checking authorization - userId:', userId, 'req.user._id:', req.user?._id);
  if (!userId || !req.user?._id || userId !== req.user._id) {
    console.log('Unauthorized access attempt - userId:', userId, 'req.user._id:', req.user?._id);
    return res.status(403).json({ message: 'Unauthorized access' });
  }
  next();
};

router.get('/:userId', authMiddleware, restrictToSelf, getUserResults);

router.get('/overall/:userId', authMiddleware, restrictToSelf, getOverallResults);

router.post('/', authMiddleware, restrictToSelf, saveTestResult);

module.exports = router;