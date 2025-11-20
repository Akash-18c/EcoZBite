const express = require('express');
const { auth } = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');

const router = express.Router();

// @route   GET /api/analytics/user-stats
// @desc    Get user statistics
// @access  Private
router.get('/user-stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user orders
    const orders = await Order.find({ user: userId });
    
    // Calculate stats
    const totalOrders = orders.length;
    const totalSaved = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const foodSaved = (totalSaved * 0.002).toFixed(1); // Estimate: ₹1000 = 2kg food saved
    
    // Get active deals count (products with discounts)
    const activeDeals = await Product.countDocuments({ 
      discount: { $gt: 0 },
      expiryDate: { $gte: new Date() }
    });
    
    res.json({
      success: true,
      stats: {
        totalSaved,
        orders: totalOrders,
        foodSaved: parseFloat(foodSaved),
        activeDeals
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics'
    });
  }
});

// @route   GET /api/analytics/user-analytics
// @desc    Get detailed user analytics for profile page
// @access  Private
router.get('/user-analytics', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const Wishlist = require('../models/Wishlist');
    
    // Get user's orders with populated data
    const orders = await Order.find({ user: userId })
      .populate('items.product')
      .sort({ createdAt: -1 });
    
    // Get wishlist count
    const wishlistCount = await Wishlist.countDocuments({ user: userId });
    
    // Calculate basic stats
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || order.total || 0), 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;
    
    // Monthly orders data (last 6 months)
    const monthlyOrders = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= monthStart && orderDate <= monthEnd;
      }).length;
      
      monthlyOrders.push({
        month: date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        orders: monthOrders
      });
    }
    
    // Favorite categories
    const categoryCount = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.product && item.product.category) {
          categoryCount[item.product.category] = (categoryCount[item.product.category] || 0) + item.quantity;
        }
      });
    });
    
    const favoriteCategories = Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
    
    // Recent activity
    const recentActivity = [];
    
    // Add recent orders
    orders.slice(0, 3).forEach(order => {
      recentActivity.push({
        action: 'Order Placed',
        details: `Order #${order._id.toString().slice(-6)} - ₹${order.totalAmount || order.total}`,
        date: order.createdAt
      });
    });
    
    // Add recent wishlist items (if available)
    try {
      const recentWishlist = await Wishlist.find({ user: userId })
        .populate('product')
        .sort({ addedAt: -1 })
        .limit(2);
      
      recentWishlist.forEach(item => {
        recentActivity.push({
          action: 'Added to Wishlist',
          details: item.product ? item.product.name : 'Product',
          date: item.addedAt
        });
      });
    } catch (wishlistError) {
      console.log('Wishlist not available yet');
    }
    
    // Sort by date
    recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json({
      success: true,
      analytics: {
        totalOrders,
        totalSpent: Math.round(totalSpent),
        avgOrderValue,
        wishlistItems: wishlistCount,
        monthlyOrders,
        favoriteCategories,
        recentActivity: recentActivity.slice(0, 5)
      }
    });
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;