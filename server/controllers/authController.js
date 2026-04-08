const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { isAdminEmail, getAdminEmails } = require('../middleware/adminAuth');
const { body, validationResult } = require('express-validator');

// @route   POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { name, email, password, username } = req.body;
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedUsername = username ? username.toLowerCase().trim() : null;

  // SECURITY: Block registering with admin emails if they already have an account
  // (admins must register first, then they get admin flag automatically)
  const existingByEmail = await User.findOne({ email: normalizedEmail });
  if (existingByEmail) {
    return res.status(400).json({ success: false, message: 'An account with this email already exists. Please sign in.' });
  }

  // Username uniqueness check (case-insensitive — stored lowercase)
  if (normalizedUsername) {
    const existingByUsername = await User.findOne({ username: normalizedUsername });
    if (existingByUsername) {
      return res.status(400).json({ success: false, message: 'This username is already taken. Please choose another.' });
    }
  }

  const isAdmin = isAdminEmail(normalizedEmail);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    username: normalizedUsername,
    password,
    isAdmin,
    lastLogin: new Date(),
  });

  const token = generateToken(user._id);
  res.status(201).json({ success: true, token, user: user.toSafeObject() });
});

// @route   POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

  if (!user || !user.password) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  if (user.isBlocked) {
    return res.status(403).json({ success: false, message: 'Account suspended. Contact support.' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  // Sync admin status from admin.env on every login
  const shouldBeAdmin = isAdminEmail(user.email);
  if (shouldBeAdmin !== user.isAdmin) {
    user.isAdmin = shouldBeAdmin;
  }
  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id);
  res.json({ success: true, token, user: user.toSafeObject() });
});

// @route   POST /api/auth/guest
exports.guestLogin = asyncHandler(async (req, res) => {
  const jwt = require('jsonwebtoken');
  const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const token = jwt.sign({ id: guestId, isGuest: true }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token, user: { id: guestId, name: 'Guest', isGuest: true, isAdmin: false } });
});

// @route   GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user: user.toSafeObject() });
});

// @route   GET /api/auth/check-email
exports.checkEmail = asyncHandler(async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });
  const exists = await User.findOne({ email: email.toLowerCase().trim() });
  res.json({ success: true, available: !exists });
});

// @route   GET /api/auth/check-username
exports.checkUsername = asyncHandler(async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ success: false, message: 'Username required' });
  const exists = await User.findOne({ username: username.toLowerCase().trim() });
  res.json({ success: true, available: !exists });
});

// Validation rules
exports.validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

exports.validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];
