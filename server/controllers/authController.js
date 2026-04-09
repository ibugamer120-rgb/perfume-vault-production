const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { isAdminEmail } = require('../middleware/adminAuth');
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

  const existingByEmail = await User.findOne({ email: normalizedEmail });
  if (existingByEmail) {
    return res.status(400).json({ success: false, message: 'An account with this email already exists. Please sign in.' });
  }
  if (normalizedUsername) {
    const existingByUsername = await User.findOne({ username: normalizedUsername });
    if (existingByUsername) {
      return res.status(400).json({ success: false, message: 'This username is already taken. Please choose another.' });
    }
  }

  const userData = {
    name: name.trim(),
    email: normalizedEmail,
    password,
    isAdmin: isAdminEmail(normalizedEmail),
    lastLogin: new Date(),
  };
  if (normalizedUsername) userData.username = normalizedUsername;

  const user = await User.create(userData);
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

  const shouldBeAdmin = isAdminEmail(user.email);
  if (shouldBeAdmin !== user.isAdmin) user.isAdmin = shouldBeAdmin;
  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id);
  res.json({ success: true, token, user: user.toSafeObject() });
});

// @route   POST /api/auth/guest
exports.guestLogin = asyncHandler(async (req, res) => {
  const jwt = require('jsonwebtoken');
  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ success: false, message: 'Server configuration error: JWT_SECRET not set.' });
  const guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  const token = jwt.sign({ id: guestId, isGuest: true }, secret, { expiresIn: '7d' });
  res.json({ success: true, token, user: { id: guestId, name: 'Guest', isGuest: true, isAdmin: false } });
});

// @route   POST /api/auth/google — verify Google ID token (fallback)
exports.googleAuth = asyncHandler(async (req, res) => {
  const { OAuth2Client } = require('google-auth-library');
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ success: false, message: 'Google credential required.' });
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return res.status(500).json({ success: false, message: 'Google auth not configured.' });

  const client = new OAuth2Client(clientId);
  let payload;
  try {
    const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
    payload = ticket.getPayload();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid Google token.' });
  }

  const { sub: googleId, email, name, picture } = payload;
  const normalizedEmail = email.toLowerCase().trim();
  let user = await User.findOne({ $or: [{ googleId }, { email: normalizedEmail }] });

  if (user) {
    if (!user.googleId) user.googleId = googleId;
    if (!user.avatar && picture) user.avatar = picture;
    user.lastLogin = new Date();
    user.isAdmin = isAdminEmail(normalizedEmail);
    await user.save();
  } else {
    user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      googleId,
      avatar: picture || null,
      isAdmin: isAdminEmail(normalizedEmail),
      lastLogin: new Date(),
    });
  }

  if (user.isBlocked) return res.status(403).json({ success: false, message: 'Account suspended. Contact support.' });
  const token = generateToken(user._id);
  res.json({ success: true, token, user: user.toSafeObject() });
});

// @route   GET /api/auth/google/redirect — starts OAuth redirect flow
exports.googleRedirect = (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return res.status(500).send('Google auth not configured.');
  const base = process.env.CLIENT_URL || (process.env.RAILWAY_PUBLIC_DOMAIN ? 'https://' + process.env.RAILWAY_PUBLIC_DOMAIN : 'http://localhost:5000');
  const redirectUri = encodeURIComponent(base + '/api/auth/google/callback');
  const scope = encodeURIComponent('openid email profile');
  const url = 'https://accounts.google.com/o/oauth2/v2/auth' +
    '?client_id=' + clientId +
    '&redirect_uri=' + redirectUri +
    '&response_type=code' +
    '&scope=' + scope +
    '&access_type=online' +
    '&prompt=select_account';
  res.redirect(url);
};

// @route   GET /api/auth/google/callback — handles OAuth response
exports.googleCallback = asyncHandler(async (req, res) => {
  const { code, error } = req.query;
  const base = process.env.CLIENT_URL || (process.env.RAILWAY_PUBLIC_DOMAIN ? 'https://' + process.env.RAILWAY_PUBLIC_DOMAIN : 'http://localhost:5000');
  if (error || !code) return res.redirect(base + '/?oauth_error=cancelled');

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = base + '/api/auth/google/callback';

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code' }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) return res.redirect(base + '/?oauth_error=token_failed');

  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: 'Bearer ' + tokenData.access_token },
  });
  const profile = await userRes.json();
  if (!profile.email) return res.redirect(base + '/?oauth_error=no_email');

  const normalizedEmail = profile.email.toLowerCase().trim();
  let user = await User.findOne({ $or: [{ googleId: profile.id }, { email: normalizedEmail }] });

  if (user) {
    if (!user.googleId) user.googleId = profile.id;
    if (!user.avatar && profile.picture) user.avatar = profile.picture;
    user.lastLogin = new Date();
    user.isAdmin = isAdminEmail(normalizedEmail);
    await user.save();
  } else {
    user = await User.create({
      name: (profile.name || profile.email).trim(),
      email: normalizedEmail,
      googleId: profile.id,
      avatar: profile.picture || null,
      isAdmin: isAdminEmail(normalizedEmail),
      lastLogin: new Date(),
    });
  }

  if (user.isBlocked) return res.redirect(base + '/?oauth_error=blocked');
  const token = generateToken(user._id);
  const safeUser = encodeURIComponent(JSON.stringify(user.toSafeObject()));
  res.redirect(base + '/?oauth_token=' + token + '&oauth_user=' + safeUser);
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
  if (!username || username.trim().length < 3) return res.json({ success: true, available: true });
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
