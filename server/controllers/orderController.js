const Order = require('../models/Order');
const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Create new order
// @route   POST /api/orders
exports.createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, payment, guestInfo } = req.body;

  // Enforce Pakistan-only orders
  if (shippingAddress?.country && shippingAddress.country !== 'PK') {
    return res.status(400).json({ success: false, message: 'We currently only deliver within Pakistan.' });
  }

  // Validate payment method
  const paymentMethod = payment?.method || 'cod';
  if (!['card', 'cod', 'mock'].includes(paymentMethod)) {
    return res.status(400).json({ success: false, message: 'Invalid payment method.' });
  }

  // Anti-fake-order: require phone for COD
  if (paymentMethod === 'cod' && !shippingAddress?.phone) {
    return res.status(400).json({ success: false, message: 'Phone number is required for Cash on Delivery.' });
  }

  // Validate products and calculate totals
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${product.name}`,
      });
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0]?.url || '',
      price: product.price,
      quantity: item.quantity,
    });

    subtotal += product.price * item.quantity;
  }

  const shippingCost = subtotal > 200 ? 0 : 15;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

  const order = await Order.create({
    user: req.user && !req.user.isGuest ? req.user._id : null,
    guestInfo: req.user?.isGuest ? guestInfo : null,
    items: orderItems,
    shippingAddress,
    payment: {
      method: paymentMethod,
      status: 'pending',
    },
    subtotal: Math.round(subtotal * 100) / 100,
    shippingCost: Math.round(shippingCost * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
  });

  // COD: stays pending until delivery. Card/mock: simulate payment
  if (paymentMethod !== 'cod') {
    await new Promise((resolve) => setTimeout(resolve, 800));
    order.payment.status = 'paid';
    order.payment.paidAt = new Date();
    order.payment.transactionId = 'TXN_' + Date.now();
  }
  order.status = 'confirmed';
  await order.save();

  // Update product stock and sold count
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, sold: item.quantity },
    });
  }

  res.status(201).json({
    success: true,
    order: {
      id: order._id,
      orderNumber: order.orderNumber,
      total: order.total,
      status: order.status,
      payment: { method: order.payment.method, status: order.payment.status },
      items: order.items,
    },
  });
});

// @desc    Get user's orders
// @route   GET /api/orders/my-orders
exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

// @desc    Get single order
// @route   GET /api/orders/:id
exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('items.product', 'name images');

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  // Check if user owns the order
  if (order.user && order.user.toString() !== req.user?._id?.toString() && !req.user?.isAdmin) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  res.json({ success: true, order });
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders
exports.getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const query = status ? { status } : {};

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Order.countDocuments(query),
  ]);

  res.json({ success: true, orders, total });
});

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingNumber } = req.body;

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status,
      ...(trackingNumber && { trackingNumber }),
      ...(status === 'delivered' && { deliveredAt: new Date() }),
    },
    { new: true }
  );

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  res.json({ success: true, order });
});
