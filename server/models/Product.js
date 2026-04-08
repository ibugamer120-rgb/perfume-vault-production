const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Product name is required'], trim: true, maxlength: 100 },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, required: [true, 'Description is required'] },
  shortDescription: { type: String, maxlength: 300 },
  price: { type: Number, required: [true, 'Price is required'], min: 0 },
  comparePrice: { type: Number, default: null },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Men', 'Women', 'Luxury'], // Removed Unisex
  },
  brand: { type: String, default: 'The Perfume Vault' },
  notes: {
    top: [String],
    middle: [String],
    base: [String],
  },
  size: { type: String, default: '100ml' },
  stock: { type: Number, required: true, min: 0, default: 0 },
  images: [{
    url: { type: String, required: true },
    publicId: { type: String, default: null },
    alt: { type: String, default: '' },
  }],
  featured: { type: Boolean, default: false },
  isNew: { type: Boolean, default: true },
  reviews: [reviewSchema],
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  sold: { type: Number, default: 0 },
  tags: [String],
}, { timestamps: true });

productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

productSchema.methods.calculateRating = function () {
  if (this.reviews.length === 0) { this.rating = 0; this.numReviews = 0; }
  else {
    const total = this.reviews.reduce((s, r) => s + r.rating, 0);
    this.rating = parseFloat((total / this.reviews.length).toFixed(1));
    this.numReviews = this.reviews.length;
  }
};

module.exports = mongoose.model('Product', productSchema);
