const express = require('express');
const {
  register,
  login,
  verifyEmail,
  resendCode,
  createPassword,
  forgotPassword, 
  verifyResetCode,
  resetPassword,
  registerAdmin,
  googleLogin
} = require('../controllers/authController');


const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/register-admin', registerAdmin);
router.post('/verify-email', verifyEmail);
router.post('/resend-code', resendCode);
router.post('/create-password', createPassword);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);
router.post('/google', googleLogin);


module.exports = router;