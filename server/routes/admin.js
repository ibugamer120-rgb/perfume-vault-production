const express = require('express');
const router = express.Router();
const {
  getDashboard,
  uploadImage,
  getUsers,
  toggleAdmin,
  upload,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminAuth');

// All admin routes require auth + admin
router.use(protect, adminOnly);

router.get('/dashboard', getDashboard);
router.post('/upload', upload.single('image'), uploadImage);
router.get('/users', getUsers);
router.put('/users/:id/admin', toggleAdmin);

module.exports = router;
