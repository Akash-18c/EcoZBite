const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  originalPrice: {
    type: Number,
    required: true
  },
  discountedPrice: {
    type: Number,
    required: true
  },
  discountPercentage: {
    type: Number,
    default: 0
  },
  recordedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
priceHistorySchema.index({ product: 1, recordedAt: -1 });

module.exports = mongoose.model('PriceHistory', priceHistorySchema);