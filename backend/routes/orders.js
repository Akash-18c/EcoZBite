const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Store = require('../models/Store');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all orders (admin) or user orders
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // If not admin, only show user's orders
    if (req.user.role !== 'admin') {
      query.user_id = req.user.id;
    }
    
    const orders = await Order.find(query)
      .populate('user_id', 'name email')
      .populate('items.product_id', 'name originalPrice images')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching orders' });
  }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user.id })
      .populate('items.product_id')
      .sort({ createdAt: -1 });
    
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get store's orders
router.get('/store', auth, authorize(['store_owner']), async (req, res) => {
  try {
    const { status, page = 1, limit = 10, startDate, endDate } = req.query;
    const Store = require('../models/Store');
    const store = await Store.findOne({ owner: req.user.id });
    
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    let query = { store_id: store._id };
    if (status && status !== 'all') query.status = status;
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const orders = await Order.find(query)
      .populate('user_id', 'name email phone')
      .populate('items.product_id', 'name images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    // Get order statistics
    const [pendingCount, completedCount, totalRevenue] = await Promise.all([
      Order.countDocuments({ store_id: store._id, status: 'pending' }),
      Order.countDocuments({ store_id: store._id, status: 'completed' }),
      Order.aggregate([
        { $match: { store_id: store._id, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);
    
    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total
      },
      stats: {
        pending: pendingCount,
        completed: completedCount,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create order (Single store only)
router.post('/', auth, async (req, res) => {
  try {
    const { items, customerInfo } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
    }

    // Validate all products belong to same store
    const firstProduct = await Product.findById(items[0].product_id).populate('store');
    if (!firstProduct) {
      return res.status(400).json({ success: false, message: 'Product not found' });
    }

    const storeId = firstProduct.store._id;
    const orderItems = [];
    let totalAmount = 0;
    let totalSavings = 0;
    
    for (const item of items) {
      const product = await Product.findById(item.product_id).populate('store');
      if (!product) {
        return res.status(400).json({ success: false, message: `Product ${item.product_id} not found` });
      }

      // Ensure all products are from same store
      if (product.store._id.toString() !== storeId.toString()) {
        return res.status(400).json({ 
          success: false,
          message: 'All products must be from the same store. Please place separate orders for different stores.' 
        });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          success: false,
          message: `Insufficient stock for ${product.name}. Only ${product.stock} available.` 
        });
      }

      const itemTotal = (product.discountedPrice || product.originalPrice) * item.quantity;
      const itemSavings = product.discountedPrice ? 
        (product.originalPrice - product.discountedPrice) * item.quantity : 0;
      
      orderItems.push({
        product_id: product._id,
        productName: product.name,
        quantity: item.quantity,
        originalPrice: product.originalPrice,
        discountedPrice: product.discountedPrice || product.originalPrice,
        totalPrice: itemTotal,
        unit: product.unit
      });

      totalAmount += itemTotal;
      totalSavings += itemSavings;
    }
    
    // Generate order number
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    const orderNumber = `EZ${timestamp}${random}`;
    
    const order = new Order({
      orderNumber,
      user_id: req.user.id,
      store_id: storeId,
      items: orderItems,
      totalAmount,
      totalSavings,
      customerInfo: customerInfo || {
        name: req.user.name,
        phone: req.user.phone || '+91-9876543210',
        email: req.user.email
      },
      status: 'pending'
    });
    
    await order.save();
    
    // Update store stats
    await Store.findByIdAndUpdate(storeId, {
      $inc: { 'stats.totalOrders': 1 }
    });
    
    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Cancel order (User within 2 minutes)
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Check if user owns the order
    if (order.user_id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    // Check if order can be cancelled (within 2 minutes)
    const orderTime = new Date(order.createdAt);
    const now = new Date();
    const timeDiff = (now - orderTime) / (1000 * 60); // minutes
    
    if (timeDiff > 2) {
      return res.status(400).json({ success: false, message: 'Cancel period expired. Orders can only be cancelled within 2 minutes.' });
    }
    
    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled in current status' });
    }
    
    order.status = 'cancelled';
    await order.save();
    
    res.json({ success: true, message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ success: false, message: 'Server error while cancelling order' });
  }
});

// Update order status (Store owners and Admin)
router.patch('/:id/status', auth, authorize(['store_owner', 'admin']), async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const order = await Order.findById(req.params.id).populate('store_id');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if store owner owns this order's store
    if (req.user.role === 'store_owner') {
      const Store = require('../models/Store');
      const store = await Store.findOne({ owner: req.user.id });
      if (!store || order.store_id._id.toString() !== store._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }
    
    // Update stock when order is confirmed (reserve stock)
    if (status === 'confirmed' && order.status === 'pending') {
      for (const item of order.items) {
        const product = await Product.findById(item.product_id);
        if (!product || product.stock < item.quantity) {
          return res.status(400).json({ 
            success: false, 
            message: `Insufficient stock for ${product?.name || 'product'}. Only ${product?.stock || 0} available.` 
          });
        }
        
        await Product.findByIdAndUpdate(
          item.product_id,
          { $inc: { stock: -item.quantity } }
        );
      }
    }
    
    // Update stats when order is completed
    if (status === 'completed' && order.status !== 'completed') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product_id,
          { $inc: { 'stats.orders': 1 } }
        );
      }
      
      // Update store revenue stats
      await Store.findByIdAndUpdate(order.store_id._id, {
        $inc: { 'stats.revenue': order.totalAmount }
      });
    }
    
    // Restore stock if order is cancelled after being confirmed
    if (status === 'cancelled' && ['confirmed', 'preparing', 'ready'].includes(order.status)) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product_id,
          { $inc: { stock: item.quantity } }
        );
      }
    }
    
    // Handle cancellation after completion
    if (status === 'cancelled' && order.status === 'completed') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product_id,
          { $inc: { stock: item.quantity, 'stats.orders': -1 } }
        );
      }
      
      // Update store revenue stats
      await Store.findByIdAndUpdate(order.store_id._id, {
        $inc: { 'stats.revenue': -order.totalAmount }
      });
    }
    
    order.status = status;
    if (notes) order.storeNotes = notes;
    await order.save();
    
    res.json({ success: true, message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating order status' });
  }
});

// Get order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product_id')
      .populate('store_id', 'name address')
      .populate('user_id', 'name email phone');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user owns the order or is the store owner
    if (order.user_id._id.toString() !== req.user.id && 
        order.store_id._id.toString() !== req.user.store) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order statistics for store dashboard
router.get('/store/stats', auth, authorize(['store_owner']), async (req, res) => {
  try {
    const Store = require('../models/Store');
    const store = await Store.findOne({ owner: req.user.id });
    
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todayOrders, weekOrders, monthOrders, pendingOrders, recentOrders] = await Promise.all([
      Order.countDocuments({ store_id: store._id, createdAt: { $gte: startOfDay } }),
      Order.countDocuments({ store_id: store._id, createdAt: { $gte: startOfWeek } }),
      Order.countDocuments({ store_id: store._id, createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({ store_id: store._id, status: 'pending' }),
      Order.find({ store_id: store._id })
        .populate('user_id', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('orderNumber totalAmount status customerInfo createdAt')
    ]);

    res.json({
      success: true,
      stats: {
        todayOrders,
        weekOrders,
        monthOrders,
        pendingOrders,
        recentOrders
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;