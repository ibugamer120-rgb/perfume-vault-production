require('dotenv').config();
require('dotenv').config({ path: './admin.env' });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// ── DB ────────────────────────────────────────────────────────────
connectDB();

// ── Security ──────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // Allow CDN scripts (Three.js, GSAP)
  crossOriginEmbedderPolicy: false,
}));

// Trust Railway/Heroku proxy
app.set('trust proxy', 1);

// CORS — allow Railway domain + localhost
const allowedOrigins = [
  'http://localhost:5000',
  'http://localhost:3000',
  process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : null,
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// ── Body parsing ──────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logging ───────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// ── Global rate limit ─────────────────────────────────────────────
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
}));

// ── Static files ──────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../client'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
}));

// ── API Routes ────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

// ── Health check ──────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'online',
    app: 'The Perfume Vault API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()) + 's',
  });
});

// ── Public config (safe to expose) ───────────────────────────────
app.get('/api/config', (req, res) => {
  res.json({ googleClientId: process.env.GOOGLE_CLIENT_ID || null });
});

// ── Site config (contact, socials) ───────────────────────────────
app.get('/api/config/contact', async (req, res) => {
  try {
    const SiteConfig = require('./models/SiteConfig');
    const doc = await SiteConfig.findOne({ key: 'contact' });
    res.json({ success: true, contact: doc?.value || {} });
  } catch { res.json({ success: true, contact: {} }); }
});

app.put('/api/config/contact', require('./middleware/auth').protect, require('./middleware/adminAuth').adminOnly, async (req, res) => {
  try {
    const SiteConfig = require('./models/SiteConfig');
    const doc = await SiteConfig.findOneAndUpdate({ key: 'contact' }, { value: req.body }, { upsert: true, new: true });
    res.json({ success: true, contact: doc.value });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── SPA Catch-all ─────────────────────────────────────────────────
// All routes serve index.html — the client-side router handles pages
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// ── Global Error Handler ──────────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n💎 ════════════════════════════════════════');
  console.log('   THE PERFUME VAULT v2.0 — Production');
  console.log(`   http://localhost:${PORT}`);
  console.log(`   Admin: http://localhost:${PORT}/admin`);
  console.log(`   Env:   ${process.env.NODE_ENV || 'development'}`);
  console.log('════════════════════════════════════════\n');
});

module.exports = app;
