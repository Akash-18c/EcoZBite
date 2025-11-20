const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Store = require('../models/Store');
const emailService = require('../utils/emailService');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
  
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE
  });
  
  return { accessToken, refreshToken };
};

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'customer', 'store_owner']).withMessage('Role must be admin, customer, or store_owner'),
  body('storeName').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Store name must be between 2-100 characters'),
  body('storeAddress').optional().isObject().withMessage('Store address must be an object')
], async (req, res) => {
  try {
    console.log('Registration attempt:', { email: req.body.email, role: req.body.role });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, email, password, role, storeName, storeAddress, storeContact } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role
    });

    // If store owner, create store
    if (role === 'store_owner') {
      if (!storeName || !storeAddress) {
        return res.status(400).json({ message: 'Store name and address are required for store owner registration' });
      }

      const store = new Store({
        name: storeName,
        address: storeAddress,
        contact: storeContact || { phone: '', email: email },
        owner: user._id
      });

      await store.save();
      user.store_id = store._id;
      console.log('Store created for store owner:', store._id);
    }

    // Generate email verification token
    const verificationCode = user.generateEmailVerificationToken();
    await user.save();
    console.log('User saved with verification code');

    // Send verification email (don't let email failure block registration)
    let emailSent = false;
    try {
      const emailResult = await emailService.sendVerificationEmail(user, verificationCode);
      if (emailResult && emailResult.success) {
        console.log('Verification email sent successfully to:', user.email);
        emailSent = true;
      } else {
        console.error('Email sending failed:', emailResult?.error || 'Unknown error');
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError.message);
    }

    // Always return success response
    res.status(201).json({
      success: true,
      message: emailSent 
        ? 'Registration successful! Please check your email for verification code.'
        : 'Registration successful! Verification code will be sent shortly.',
      userId: user._id,
      email: user.email,
      role: user.role,
      needsVerification: true
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific errors
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ 
      message: 'Registration failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify email with code
// @access  Public
router.post('/verify-email', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits')
], async (req, res) => {
  try {
    console.log('Email verification attempt:', { email: req.body.email, code: req.body.code });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email, code } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      emailVerificationToken: code.trim(),
      emailVerificationExpires: { $gt: Date.now() }
    }).populate('store_id');

    if (!user) {
      console.log('Verification failed - user not found or code expired');
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    
    console.log('Email verified successfully for:', user.email);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    res.json({
      success: true,
      message: 'Email verified successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        store_id: user.store_id,
        store: user.store_id ? {
          id: user.store_id._id,
          name: user.store_id.name
        } : null,
        isEmailVerified: user.isEmailVerified
      },
      accessToken,
      refreshToken,
      redirectTo: user.role === 'admin' ? '/admin/dashboard' : 
                  user.role === 'store_owner' ? '/store/dashboard' : 
                  '/dashboard'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ 
      message: 'Server error during email verification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post('/resend-otp', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email')
], async (req, res) => {
  try {
    console.log('Resend OTP attempt for:', req.body.email);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new OTP
    const otp = user.generateEmailVerificationToken();
    await user.save();
    console.log('New OTP generated for:', email);

    // Send verification email
    try {
      const emailResult = await emailService.sendVerificationEmail(user, otp);
      if (emailResult && emailResult.success) {
        console.log('OTP email sent successfully');
        res.json({ success: true, message: 'OTP sent successfully!' });
      } else {
        console.error('Failed to send OTP email:', emailResult?.error);
        res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
      }
    } catch (emailError) {
      console.error('Email service error:', emailError);
      res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
    }

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ 
      message: 'Server error while resending OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).populate('store_id');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      console.log('Login blocked - email not verified for:', email);
      return res.status(400).json({ 
        message: 'Please verify your email before logging in',
        needsVerification: true,
        email: user.email,
        userId: user._id
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is deactivated' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    res.json({
      message: 'Login successful!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        store_id: user.store_id,
        store: user.store_id ? {
          id: user.store_id._id,
          name: user.store_id.name
        } : null,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin
      },
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset code
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Generate password reset token (6-digit numerical OTP)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.passwordResetToken = resetCode;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour expiry
    await user.save();

    // Send password reset email
    await emailService.sendPasswordResetEmail(user, resetCode);

    res.json({ message: 'Password reset code sent to your email!' });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error while sending reset code' });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with code
// @access  Public
router.post('/reset-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('code').isLength({ min: 6, max: 6 }).matches(/^[0-9]+$/).withMessage('Reset code must be 6 numerical digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email, code, newPassword } = req.body;

    console.log('Reset password attempt:', { email, code: code.substring(0, 2) + '***' }); // Log partial code for debugging

    const user = await User.findOne({
      email: email.toLowerCase(),
      passwordResetToken: code.toLowerCase(),
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('User not found or token expired for email:', email);
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    console.log('User found, proceeding with password reset for:', email);

    // Update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful! You can now login with your new password.' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
});

// @route   POST /api/auth/refresh-token
// @desc    Refresh access token
// @access  Public
router.post('/refresh-token', [
  body('refreshToken').exists().withMessage('Refresh token is required')
], async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    res.json({
      accessToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('store_id');

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        store_id: user.store_id,
        store: user.store_id ? {
          id: user.store_id._id,
          name: user.store_id.name,
          address: user.store_id.address
        } : null,
        isEmailVerified: user.isEmailVerified,
        preferences: user.preferences,
        profile: user.profile,
        stats: user.stats,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error while fetching user data' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    // In a production app, you might want to blacklist the token
    // For now, we'll just send a success response
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

// @route   PUT /api/auth/update-profile
// @desc    Update user profile
// @access  Private
router.put('/update-profile', auth, [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2-50 characters'),
  body('phone').optional().trim().isLength({ min: 10, max: 15 }).withMessage('Phone number must be between 10-15 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, phone, address, description } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (description) updateData.description = description;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({ message: error.message });
  }
});



// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', auth, [
  body('currentPassword').exists().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Current password is incorrect' 
      });
    }
    
    // Update password
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    user.lastPasswordChangeAt = new Date();
    await user.save();
    
    // Send email notification
    try {
      await emailService.sendPasswordChangeNotification(user);
    } catch (emailError) {
      console.error('Email notification error:', emailError);
    }
    
    res.json({ 
      success: true,
      message: 'Password changed successfully' 
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while changing password' 
    });
  }
});

module.exports = router;
