const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getStageTree } = require('../controllers/stageController');

router.get('/tree/:userId', authMiddleware, getStageTree);

module.exports = router;