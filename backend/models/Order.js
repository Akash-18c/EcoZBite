const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  store_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  items: [{
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    originalPrice: Number,
    discountedPrice: Number,
    totalPrice: Number,
    unit: String
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  totalSavings: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'ready', 'completed', 'cancelled', 'expired'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'digital_wallet', 'upi'],
    default: 'cash'
  },
  pickupTime: {
    scheduled: Date,
    actual: Date
  },
  notes: String,
  customerInfo: {
    name: String,
    phone: String,
    email: String
  },
  storeNotes: String,
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: Date
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    }
  }
}, {
  timestamps: true
});

// Indexes
orderSchema.index({ user_id: 1 });
orderSchema.index({ store_id: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Order number is generated in the route handler

// Method to calculate total savings
orderSchema.methods.calculateSavings = function() {
  let totalOriginal = 0;
  let totalDiscounted = 0;
  
  this.items.forEach(item => {
    totalOriginal += item.originalPrice * item.quantity;
    totalDiscounted += item.discountedPrice * item.quantity;
  });
  
  this.totalSavings = totalOriginal - totalDiscounted;
  return this.totalSavings;
};

// Auto-expire orders after 24 hours
orderSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Order', orderSchema);