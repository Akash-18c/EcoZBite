const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  priceWhenAdded: {
    type: Number,
    required: true
  },
  notificationSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate entries (user + product combination should be unique)
wishlistSchema.index({ user: 1, product: 1 }, { unique: true });

// Index for efficient queries
wishlistSchema.index({ user: 1, addedAt: -1 });

module.exports = mongoose.model('Wishlist', wishlistSchema);