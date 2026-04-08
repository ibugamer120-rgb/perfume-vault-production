const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true, // always stored lowercase — prevents Ibugamer vs ibugamer
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  googleId: { type: String, unique: true, sparse: true },
  avatar: { type: String, default: null },
  isAdmin: { type: Boolean, default: false },
  isGuest: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  lastLogin: { type: Date, default: null },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Safe user object to return to client
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    username: this.username,
    email: this.email,
    isAdmin: this.isAdmin,
    avatar: this.avatar,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
