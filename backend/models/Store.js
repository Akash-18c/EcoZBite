const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Store name is required'],
    trim: true,
    maxlength: [100, 'Store name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 }
    }
  },
  contact: {
    phone: { type: String, required: true },
    email: { type: String, required: true },
    website: String
  },
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  logo: String,
  images: [String],
  categories: [String],
  settings: {
    autoDiscountDays: { type: Number, default: 2 },
    defaultDiscountPercentage: { type: Number, default: 50 },
    minDiscountPercentage: { type: Number, default: 20 },
    maxDiscountPercentage: { type: Number, default: 70 }
  },
  stats: {
    totalProducts: { type: Number, default: 0 },
    activeProducts: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    wasteReduced: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for geospatial queries
storeSchema.index({ 'address.coordinates': '2dsphere' });
storeSchema.index({ owner: 1 });
storeSchema.index({ isActive: 1 });

module.exports = mongoose.model('Store', storeSchema);