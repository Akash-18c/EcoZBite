const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: false
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' }
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'customer', 'store_owner'],
    required: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  store_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastPasswordChangeAt: Date,
  preferences: Object,
  profile: Object,
  stats: Object
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password comparison method
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate email verification token (6-digit OTP)
userSchema.methods.generateEmailVerificationToken = function() {
  const token = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  this.emailVerificationToken = token;
  this.emailVerificationExpires = Date.now() + 5 * 60 * 1000; // 5 minutes expiry
  return token;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const token = crypto.randomBytes(3).toString('hex'); // 6 hex chars
  this.passwordResetToken = token;
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour expiry
  return token;
};

module.exports = mongoose.model('User', userSchema);
