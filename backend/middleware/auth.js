const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    res.status(401).json({ message: 'Token is not valid.' });
  }
};

// Check if user is admin
const adminAuth = async (req, res, next) => {
  try {
    console.log('Admin auth check - User role:', req.user?.role);
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error in admin authentication.' });
  }
};

// Check if user is regular user (customer)
const userAuth = async (req, res, next) => {
  try {
    console.log('User auth check - User role:', req.user?.role);
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access denied. Customer privileges required.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error in user authentication.' });
  }
};

// Check store ownership (for admin operations)
const storeOwnership = async (req, res, next) => {
  try {
    const storeId = req.params.storeId || req.body.store_id || req.query.store_id;
    
    if (!storeId) {
      return res.status(400).json({ message: 'Store ID is required.' });
    }

    if (req.user.role === 'admin' && req.user.store_id.toString() !== storeId) {
      return res.status(403).json({ message: 'Access denied. You can only manage your own store.' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error in store ownership check.' });
  }
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

// Role-based authorization middleware
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log('Authorization failed: No user found');
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    console.log('Authorization check - User role:', req.user.role, 'Required roles:', roles);
    
    if (!roles.includes(req.user.role)) {
      console.log('Authorization failed: Insufficient permissions');
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        userRole: req.user.role,
        requiredRoles: roles
      });
    }
    
    console.log('Authorization successful');
    next();
  };
};

module.exports = {
  auth,
  authorize,
  adminAuth,
  userAuth,
  storeOwnership,
  optionalAuth
};