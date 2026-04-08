const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all products with filtering, sorting, pagination
// @route   GET /api/products
exports.getProducts = asyncHandler(async (req, res) => {
  const { category, search, sort, page = 1, limit = 12, featured, minPrice, maxPrice } = req.query;

  const query = {};

  if (category && category !== 'All') query.category = category;
  if (featured === 'true') query.featured = true;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    rating: { rating: -1 },
    popular: { sold: -1 },
  };

  const sortBy = sortOptions[sort] || { createdAt: -1 };
  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(query).sort(sortBy).skip(skip).limit(Number(limit)),
    Product.countDocuments(query),
  ]);

  res.json({
    success: true,
    products,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// @desc    Get single product by ID or slug
// @route   GET /api/products/:id
exports.getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findOne({
    $or: [
      { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
      { slug: id },
    ],
  }).populate('reviews.user', 'name avatar');

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  res.json({ success: true, product });
});

// @desc    Create product (Admin)
// @route   POST /api/products
exports.createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
});

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  res.json({ success: true, product });
});

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  res.json({ success: true, message: 'Product deleted successfully' });
});

// @desc    Add review to product
// @route   POST /api/products/:id/reviews
exports.addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    return res.status(400).json({ success: false, message: 'Product already reviewed' });
  }

  product.reviews.push({
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  });

  product.calculateRating();
  await product.save();

  res.status(201).json({ success: true, message: 'Review added' });
});

// @desc    Get featured products
// @route   GET /api/products/featured
exports.getFeatured = asyncHandler(async (req, res) => {
  const products = await Product.find({ featured: true }).limit(8).sort({ createdAt: -1 });
  res.json({ success: true, products });
});
