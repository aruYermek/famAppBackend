const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getSubtests, getSubtest, getStageQuestions, submitStageTest, getAllSubtests, getStages } = require('../controllers/testController');

// Get all stages with questionCount
router.get('/stages', authMiddleware, getStages);

// Get subtests for a stage
router.get('/subtests/:stageId', authMiddleware, getSubtests);

// Get a specific subtest
router.get('/subtest/:subtestId', authMiddleware, getSubtest);

// Get all questions for a stage (mixed)
router.get('/questions/:stageId', authMiddleware, getStageQuestions);

// Submit answers for a stage
router.post('/submit-stage/:stageId', authMiddleware, submitStageTest);

// Get all subtests
router.get('/subtests/all', authMiddleware, getAllSubtests);

// Get all stages (alternative endpoint, optional)
router.get('/stages/all', authMiddleware, getStages);

module.exports = router;