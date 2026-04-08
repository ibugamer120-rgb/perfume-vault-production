const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  register, login, guestLogin, getMe,
  checkEmail, checkUsername,
  validateRegister, validateLogin,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { success: false, message: 'Too many attempts. Please wait 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/guest', guestLogin);
router.get('/me', protect, getMe);
router.get('/check-email', checkEmail);
router.get('/check-username', checkUsername);

module.exports = router;
