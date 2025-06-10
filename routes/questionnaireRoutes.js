const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); 
const { submitStep1, submitStep2 } = require('../controllers/questionnaireController');

router.post('/step1', authMiddleware, submitStep1);
router.post('/step2', authMiddleware, submitStep2);

module.exports = router; 