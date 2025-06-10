const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getSubtests, getSubtest, getStageQuestions, submitStageTest, getAllSubtests, getStages } = require('../controllers/testController');

router.get('/stages', authMiddleware, getStages);
router.get('/subtests/:stageId', authMiddleware, getSubtests);
router.get('/subtest/:subtestId', authMiddleware, getSubtest);
router.get('/questions/:stageId', authMiddleware, getStageQuestions);
router.post('/submit-stage/:stageId', authMiddleware, submitStageTest);
router.get('/subtests/all', authMiddleware, getAllSubtests);
router.get('/stages/all', authMiddleware, getStages);

module.exports = router;