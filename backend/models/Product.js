const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Fruits & Vegetables',
      'Dairy & Eggs',
      'Meat & Seafood',
      'Bakery',
      'Frozen Foods',
      'Pantry Staples',
      'Beverages',
      'Snacks',
      'Health & Beauty',
      'Other'
    ]
  },
  originalPrice: {
    type: Number,
    required: [true, 'Original price is required'],
    min: [0, 'Price cannot be negative']
  },
  discountedPrice: {
    type: Number,
    min: [0, 'Discounted price cannot be negative']
  },
  discountPercentage: {
    type: Number,
    min: [0, 'Discount percentage cannot be negative'],
    max: [100, 'Discount percentage cannot exceed 100']
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['kg', 'g', 'lb', 'oz', 'piece', 'pack', 'bottle', 'can', 'box', 'bag']
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  manufactureDate: Date,
  batchNumber: String,
  barcode: String,
  images: [String],
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expiring', 'expired', 'sold_out', 'removed'],
    default: 'active'
  },
  isDiscounted: {
    type: Boolean,
    default: false
  },
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
    sugar: Number,
    sodium: Number
  },
  tags: [String],
  allergens: [String],
  storage: {
    temperature: String,
    humidity: String,
    instructions: String
  },
  supplier: {
    name: String,
    contact: String
  },
  stats: {
    views: { type: Number, default: 0 },
    orders: { type: Number, default: 0 },
    reserved: { type: Number, default: 0 }
  },
  aiPrediction: {
    demandScore: Number,
    optimalDiscountPercentage: Number,
    predictedSellDate: Date,
    lastUpdated: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ store: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ expiryDate: 1 });
productSchema.index({ isDiscounted: 1 });
productSchema.index({ 'stats.views': -1 });

// Virtual for days until expiry
productSchema.virtual('daysUntilExpiry').get(function() {
  const now = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to calculate discount
productSchema.methods.calculateDiscount = function(percentage) {
  this.discountPercentage = percentage;
  this.discountedPrice = this.originalPrice * (1 - percentage / 100);
  this.isDiscounted = true;
  return this.discountedPrice;
};

// Method to check if product is expiring soon
productSchema.methods.isExpiringSoon = function(days = 2) {
  const now = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= days && diffDays > 0;
};

// Pre-save middleware to update status
productSchema.pre('save', function(next) {
  const now = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (this.stock === 0) {
    this.status = 'sold_out';
  } else if (diffDays <= 0) {
    this.status = 'expired';
  } else if (diffDays <= 2) {
    this.status = 'expiring';
  } else {
    this.status = 'active';
  }

  next();
});

module.exports = mongoose.model('Product', productSchema);