const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Store = require('../models/Store');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Store analytics - Real-time data for store owners
router.get('/store', auth, authorize(['store_owner']), async (req, res) => {
  try {
    const { range = '7d' } = req.query;
    const days = parseInt(range.replace('d', ''));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get store ID
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Sales & Revenue Analytics
    const salesData = await Order.aggregate([
      { $match: { store_id: store._id, createdAt: { $gte: startDate } } },
      { $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        totalSavings: { $sum: '$totalSavings' }
      }}
    ]);

    const sales = salesData[0] || { totalOrders: 0, totalRevenue: 0, totalSavings: 0 };
    const avgOrderValue = sales.totalOrders > 0 ? sales.totalRevenue / sales.totalOrders : 0;

    // Revenue Growth Trend (Daily)
    const revenueGrowth = await Order.aggregate([
      { $match: { store_id: store._id, createdAt: { $gte: startDate } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    // Order Analytics
    const ordersByStatus = await Order.aggregate([
      { $match: { store_id: store._id, createdAt: { $gte: startDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Top Selling Products
    const topProducts = await Order.aggregate([
      { $match: { store_id: store._id, createdAt: { $gte: startDate } } },
      { $unwind: '$items' },
      { $group: {
        _id: '$items.product_id',
        productName: { $first: '$items.productName' },
        totalSold: { $sum: '$items.quantity' },
        revenue: { $sum: '$items.totalPrice' }
      }},
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    // Customer Analytics
    const customerData = await Order.aggregate([
      { $match: { store_id: store._id, createdAt: { $gte: startDate } } },
      { $group: {
        _id: '$user_id',
        orderCount: { $sum: 1 },
        totalSpent: { $sum: '$totalAmount' }
      }},
      { $group: {
        _id: null,
        totalCustomers: { $sum: 1 },
        repeatCustomers: { $sum: { $cond: [{ $gt: ['$orderCount', 1] }, 1, 0] } }
      }}
    ]);

    const customers = customerData[0] || { totalCustomers: 0, repeatCustomers: 0 };
    const retentionRate = customers.totalCustomers > 0 ? (customers.repeatCustomers / customers.totalCustomers * 100) : 0;

    // Product & Inventory Insights
    const productStats = await Product.aggregate([
      { $match: { store: store._id } },
      { $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        activeProducts: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        lowStockProducts: { $sum: { $cond: [{ $lte: ['$stock', 5] }, 1, 0] } },
        expiringProducts: { $sum: { $cond: [{ $lte: ['$expiryDate', new Date(Date.now() + 2*24*60*60*1000)] }, 1, 0] } }
      }}
    ]);

    const products = productStats[0] || { totalProducts: 0, activeProducts: 0, lowStockProducts: 0, expiringProducts: 0 };

    // Impact Metrics (Food Waste Reduction)
    const impactData = await Order.aggregate([
      { $match: { store_id: store._id, status: 'completed' } },
      { $unwind: '$items' },
      { $group: {
        _id: null,
        totalItemsSaved: { $sum: '$items.quantity' },
        totalValueSaved: { $sum: '$totalSavings' }
      }}
    ]);

    const impact = impactData[0] || { totalItemsSaved: 0, totalValueSaved: 0 };

    res.json({
      totalRevenue: sales.totalRevenue,
      totalOrders: sales.totalOrders,
      productsSold: sales.totalOrders * 2, // Estimate
      wasteReduction: Math.round((sales.totalSavings / (sales.totalRevenue + sales.totalSavings)) * 100),
      revenue: revenueGrowth.map(item => ({
        date: item._id,
        amount: item.revenue
      })),
      topProducts: topProducts.map(item => ({
        name: item.productName || 'Unknown Product',
        sold: item.totalSold
      })),
      orderStatus: ordersByStatus.map(item => ({
        name: item._id,
        value: item.count
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin analytics - Platform-wide real-time data
router.get('/admin', auth, authorize(['admin']), async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Platform Overview
    const [totalUsers, totalStores, totalProducts, totalOrders] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Store.countDocuments({ isActive: true }),
      Product.countDocuments({ status: 'active' }),
      Order.countDocuments({ createdAt: { $gte: startDate } })
    ]);

    // Revenue Analytics
    const revenueData = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        totalSavings: { $sum: '$totalSavings' }
      }}
    ]);

    const revenue = revenueData[0] || { totalRevenue: 0, totalSavings: 0 };

    // User Growth
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        newUsers: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    // Sales by City
    const salesByCity = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $lookup: { from: 'stores', localField: 'store_id', foreignField: '_id', as: 'store' } },
      { $unwind: '$store' },
      { $group: {
        _id: '$store.address.city',
        orders: { $sum: 1 },
        revenue: { $sum: '$totalAmount' }
      }},
      { $sort: { revenue: -1 } }
    ]);

    // Category Performance
    const categoryPerformance = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$items' },
      { $lookup: { from: 'products', localField: 'items.product_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $group: {
        _id: '$product.category',
        totalSold: { $sum: '$items.quantity' },
        revenue: { $sum: '$items.totalPrice' }
      }},
      { $sort: { revenue: -1 } }
    ]);

    // Platform Impact
    const platformImpact = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $unwind: '$items' },
      { $group: {
        _id: null,
        totalFoodSaved: { $sum: '$items.quantity' },
        totalMoneySaved: { $sum: '$totalSavings' }
      }}
    ]);

    const impact = platformImpact[0] || { totalFoodSaved: 0, totalMoneySaved: 0 };

    res.json({
      overview: {
        totalUsers,
        totalStores,
        totalProducts,
        totalOrders,
        totalRevenue: revenue.totalRevenue
      },
      growth: {
        userGrowth,
        salesByCity
      },
      performance: {
        categoryPerformance
      },
      impact: {
        foodSavedKg: impact.totalFoodSaved,
        moneySaved: impact.totalMoneySaved,
        carbonFootprintReduced: Math.round(impact.totalFoodSaved * 2.5 * 100) / 100
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;