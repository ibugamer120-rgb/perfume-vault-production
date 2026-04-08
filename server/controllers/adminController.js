const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../client/images/products');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `product-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

exports.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// @desc    Get dashboard analytics
// @route   GET /api/admin/dashboard
exports.getDashboard = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalOrders,
    monthOrders,
    lastMonthOrders,
    totalUsers,
    totalProducts,
    revenueData,
    monthRevenueData,
    recentOrders,
    topProducts,
    ordersByStatus,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
    User.countDocuments({ isGuest: { $ne: true } }),
    Product.countDocuments(),
    Order.aggregate([
      { $match: { 'payment.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.aggregate([
      { $match: { 'payment.status': 'paid', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(5),
    Product.find().sort({ sold: -1 }).limit(5).select('name sold price images'),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const totalRevenue = revenueData[0]?.total || 0;
  const monthRevenue = monthRevenueData[0]?.total || 0;

  res.json({
    success: true,
    analytics: {
      totalOrders,
      monthOrders,
      lastMonthOrders,
      totalUsers,
      totalProducts,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      monthRevenue: Math.round(monthRevenue * 100) / 100,
      recentOrders,
      topProducts,
      ordersByStatus,
    },
  });
});

// @desc    Upload product image
// @route   POST /api/admin/upload
exports.uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const imageUrl = `/images/products/${req.file.filename}`;
  res.json({ success: true, url: imageUrl, filename: req.file.filename });
});

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ isGuest: { $ne: true } })
    .select('-password')
    .sort({ createdAt: -1 });
  res.json({ success: true, users });
});

// @desc    Toggle user admin status
// @route   PUT /api/admin/users/:id/admin
exports.toggleAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  user.isAdmin = !user.isAdmin;
  await user.save();

  res.json({ success: true, user: { id: user._id, isAdmin: user.isAdmin } });
});
