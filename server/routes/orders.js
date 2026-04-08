const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, optionalAuth } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminAuth');

router.post('/', optionalAuth, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', optionalAuth, getOrder);
router.get('/', protect, adminOnly, getAllOrders);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
