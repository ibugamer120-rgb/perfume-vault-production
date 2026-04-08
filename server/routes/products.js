const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  getFeatured,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminAuth');

router.get('/', getProducts);
router.get('/featured', getFeatured);
router.get('/:id', getProduct);
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.post('/:id/reviews', protect, addReview);

module.exports = router;
