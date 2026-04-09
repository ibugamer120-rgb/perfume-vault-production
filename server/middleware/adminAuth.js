const path = require('path');

// Load admin.env if it exists (local dev) — Railway uses env vars directly
try { require('dotenv').config({ path: path.join(__dirname, '../../admin.env') }); } catch { }

// Parse admin emails — works from admin.env locally OR Railway env vars in production
const getAdminEmails = () =>
  (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

// Middleware: must be admin
exports.adminOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
  const isAdmin = getAdminEmails().includes(req.user.email.toLowerCase()) || req.user.isAdmin;
  if (!isAdmin) return res.status(403).json({ success: false, message: 'Admin access required' });
  next();
};

exports.isAdminEmail = (email) => getAdminEmails().includes((email || '').toLowerCase());
exports.getAdminEmails = getAdminEmails;
