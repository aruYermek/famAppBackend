const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
};


router.post('/stages', authMiddleware, isAdmin, adminController.createStage);
router.post('/subtests', authMiddleware, isAdmin, adminController.createSubtest);
router.post('/questions', authMiddleware, isAdmin, adminController.addQuestion);
router.post('/comments', authMiddleware, isAdmin, adminController.createComment);
router.get('/comments', authMiddleware, isAdmin, adminController.getComments);
router.delete('/comments/:commentId', authMiddleware, isAdmin, adminController.deleteComment);
router.get('/users', authMiddleware, isAdmin, adminController.getUsers);
router.delete('/stages/:stageId', authMiddleware, isAdmin, adminController.deleteStage);
router.delete('/subtests/:subtestId', authMiddleware, isAdmin, adminController.deleteSubtest);
router.get('/subtests/all', authMiddleware, adminController.getAllSubtests);

module.exports = router;