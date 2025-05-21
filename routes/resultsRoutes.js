const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getUserResults, getOverallResults, saveTestResult } = require('../controllers/resultsController');

// Restrict access to user's own results
const restrictToSelf = (req, res, next) => {
  const userId = req.params.userId || req.body.userId;
  console.log('📡 Checking authorization - userId:', userId, 'req.user._id:', req.user?._id);
  if (!userId || !req.user?._id || userId !== req.user._id) {
    console.log('Unauthorized access attempt - userId:', userId, 'req.user._id:', req.user?._id);
    return res.status(403).json({ message: 'Unauthorized access' });
  }
  next();
};

// Get individual subtest results
router.get('/:userId', authMiddleware, restrictToSelf, getUserResults);

// Get overall results across stages
router.get('/overall/:userId', authMiddleware, restrictToSelf, getOverallResults);

router.post('/', authMiddleware, restrictToSelf, saveTestResult);

module.exports = router;