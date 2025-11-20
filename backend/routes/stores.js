const express = require('express');
const Store = require('../models/Store');
const Product = require('../models/Product');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all stores with real-time product counts
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 10, city } = req.query;
    
    let query = { isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }

    const stores = await Store.find(query)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Add real-time product counts
    const storesWithCounts = await Promise.all(
      stores.map(async (store) => {
        const activeProducts = await Product.countDocuments({ 
          store: store._id, 
          status: 'active',
          stock: { $gt: 0 }
        });
        
        return {
          ...store.toObject(),
          activeProductCount: activeProducts
        };
      })
    );

    const total = await Store.countDocuments(query);

    res.json({
      stores: storesWithCounts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get store by ID with products
router.get('/:id', async (req, res) => {
  try {
    const store = await Store.findById(req.params.id)
      .populate('owner', 'name email');
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Get store products with real-time data
    const products = await Product.find({ 
      store: store._id, 
      status: 'active',
      stock: { $gt: 0 }
    })
    .limit(20)
    .sort({ createdAt: -1 });

    res.json({
      store,
      products,
      productCount: products.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get store products (for customers)
router.get('/:id/products', async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    
    let query = { 
      store: req.params.id, 
      status: 'active',
      stock: { $gt: 0 }
    };
    
    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .populate('store', 'name address contact')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create store (Store owners only)
router.post('/', auth, authorize(['store_owner']), async (req, res) => {
  try {
    // Check if user already has a store
    const existingStore = await Store.findOne({ owner: req.user.id });
    if (existingStore) {
      return res.status(400).json({ message: 'User already has a store' });
    }

    const store = new Store({
      ...req.body,
      owner: req.user.id
    });

    await store.save();
    res.status(201).json(store);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update store (Admin only)
router.put('/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    Object.assign(store, req.body);
    await store.save();
    
    res.json(store);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete store (Admin only)
router.delete('/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    // Delete all products associated with this store
    const Product = require('../models/Product');
    await Product.deleteMany({ store: store._id });
    
    // Delete all orders associated with this store
    const Order = require('../models/Order');
    await Order.deleteMany({ store_id: store._id });
    
    // Delete the store
    await Store.findByIdAndDelete(req.params.id);
    
    res.json({ success: true, message: 'Store and all associated data deleted successfully' });
  } catch (error) {
    console.error('Delete store error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting store' });
  }
});

// Get my store with analytics
router.get('/my/store', auth, authorize(['store_owner']), async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found. Please create a store first.' });
    }

    // Get real-time stats
    const [totalProducts, activeProducts, lowStockProducts] = await Promise.all([
      Product.countDocuments({ store: store._id }),
      Product.countDocuments({ store: store._id, status: 'active', stock: { $gt: 0 } }),
      Product.countDocuments({ store: store._id, stock: { $lte: 5 } })
    ]);

    // Update store stats
    store.stats = store.stats || {};
    store.stats.totalProducts = totalProducts;
    store.stats.activeProducts = activeProducts;
    await store.save();

    res.json({
      success: true,
      ...store.toObject(),
      realTimeStats: {
        totalProducts,
        activeProducts,
        lowStockProducts
      }
    });
  } catch (error) {
    console.error('Get my store error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching store data' });
  }
});

// Update my store
router.put('/my/store', auth, authorize(['store_owner']), async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Update store fields
    const allowedFields = ['name', 'description', 'address', 'contact', 'operatingHours', 'logo', 'categories'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        store[field] = req.body[field];
      }
    });

    await store.save();
    res.json({ success: true, store });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Change store password
router.patch('/my/store/password', auth, authorize(['store_owner']), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get store analytics summary
router.get('/my/analytics', auth, authorize(['store_owner']), async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found. Please create a store first.' });
    }

    const Order = require('../models/Order');
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));

    // Get analytics data
    const [monthlyOrders, weeklyOrders, totalRevenue, lowStockProducts, totalProducts] = await Promise.all([
      Order.countDocuments({ store_id: store._id, createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({ store_id: store._id, createdAt: { $gte: startOfWeek } }),
      Order.aggregate([
        { $match: { store_id: store._id, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Product.countDocuments({ store: store._id, stock: { $lte: 5 } }),
      Product.countDocuments({ store: store._id })
    ]);

    const revenue = totalRevenue[0]?.total || 0;
    const totalOrders = await Order.countDocuments({ store_id: store._id });

    res.json({
      success: true,
      analytics: {
        totalProducts,
        totalOrders,
        revenue,
        monthlyOrders,
        weeklyOrders,
        lowStockProducts
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching analytics data' });
  }
});

// Delete user and cascade delete associated data (Admin only)
router.delete('/users/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If user is a store owner, delete their store and associated data
    if (user.role === 'store_owner') {
      const store = await Store.findOne({ owner: user._id });
      if (store) {
        const Product = require('../models/Product');
        await Product.deleteMany({ store: store._id });
        
        const Order = require('../models/Order');
        await Order.deleteMany({ store_id: store._id });
        
        await Store.findByIdAndDelete(store._id);
      }
    }
    
    // Delete user's orders if customer
    if (user.role === 'customer') {
      const Order = require('../models/Order');
      await Order.deleteMany({ user_id: user._id });
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ success: true, message: 'User and all associated data deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting user' });
  }
});

module.exports = router;