const express = require('express');
const User = require('../models/User');
const Store = require('../models/Store');
const Product = require('../models/Product');
const Order = require('../models/Order');
const ContactMessage = require('../models/ContactMessage');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/stats', auth, authorize(['admin']), async (req, res) => {
  try {
    // Get counts
    const [
      totalUsers,
      totalStores,
      totalProducts,
      totalOrders,
      pendingMessages,
      activeUsers,
      recentOrders
    ] = await Promise.all([
      User.countDocuments({ role: { $in: ['customer', 'admin'] } }),
      Store.countDocuments({ isActive: true }),
      Product.countDocuments(),
      Order.countDocuments(),
      ContactMessage.countDocuments({ status: 'pending' }),
      User.countDocuments({ 
        role: { $in: ['customer', 'admin'] },
        lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      }),
      Order.find()
        .populate('user_id', 'name email')
        .populate('store_id', 'name')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    // Calculate revenue (sum of all delivered orders)
    const revenueResult = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Today's revenue
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayRevenueResult = await Order.aggregate([
      { 
        $match: { 
          status: 'delivered',
          createdAt: { $gte: todayStart, $lte: todayEnd }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const todayRevenue = todayRevenueResult.length > 0 ? todayRevenueResult[0].total : 0;

    // Weekly stats for charts
    const weeklyStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      totalUsers,
      totalStores,
      totalProducts,
      totalOrders,
      pendingMessages,
      activeUsers,
      revenue: todayRevenue,
      totalRevenue,
      recentOrders,
      weeklyStats
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin statistics'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filters
// @access  Private (Admin only)
router.get('/users', auth, authorize(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role && role !== 'all') {
      query.role = role;
    }
    
    if (status && status !== 'all') {
      if (status === 'active') {
        query.isActive = true;
      } else if (status === 'blocked') {
        query.isActive = false;
      } else if (status === 'pending') {
        query.isEmailVerified = false;
      }
    }

    const users = await User.find(query)
      .select('-password')
      .populate('store_id', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status (block/unblock/verify)
// @access  Private (Admin only)
router.put('/users/:id/status', auth, authorize(['admin']), async (req, res) => {
  try {
    const { isActive, isEmailVerified } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        isActive: isActive !== undefined ? isActive : undefined,
        isEmailVerified: isEmailVerified !== undefined ? isEmailVerified : undefined
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User status updated successfully',
      user
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
});

// @route   GET /api/admin/stores
// @desc    Get all stores with pagination and filters
// @access  Private (Admin only)
router.get('/stores', auth, authorize(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status && status !== 'all') {
      if (status === 'active') {
        query.isActive = true;
      } else if (status === 'inactive') {
        query.isActive = false;
      }
    }

    const stores = await Store.find(query)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Store.countDocuments(query);

    // Get product counts for each store
    const storesWithStats = await Promise.all(
      stores.map(async (store) => {
        const productCount = await Product.countDocuments({ store: store._id });
        const orderCount = await Order.countDocuments({ store: store._id });
        return {
          ...store.toObject(),
          productCount,
          orderCount
        };
      })
    );

    res.json({
      success: true,
      stores: storesWithStats,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stores'
    });
  }
});

// @route   PUT /api/admin/stores/:id/status
// @desc    Update store status (approve/reject/activate/deactivate)
// @access  Private (Admin only)
router.put('/stores/:id/status', auth, authorize(['admin']), async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const store = await Store.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    ).populate('owner', 'name email');

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    res.json({
      success: true,
      message: 'Store status updated successfully',
      store
    });

  } catch (error) {
    console.error('Update store status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update store status'
    });
  }
});

module.exports = router;