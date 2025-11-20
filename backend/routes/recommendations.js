const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Wishlist = require('../models/Wishlist');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get personalized product recommendations
router.get('/products', auth, async (req, res) => {
  try {
    // Get user's order history to understand preferences
    const userOrders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .limit(20);

    // Get user's wishlist to understand interests
    const userWishlist = await Wishlist.find({ user: req.user.id })
      .populate('product');

    // Extract categories and products user has interacted with
    const userCategories = new Set();
    const userProducts = new Set();

    userOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.product) {
          userCategories.add(item.product.category);
          userProducts.add(item.product._id.toString());
        }
      });
    });

    userWishlist.forEach(item => {
      if (item.product) {
        userCategories.add(item.product.category);
        userProducts.add(item.product._id.toString());
      }
    });

    // Build recommendation query
    let recommendationQuery = {
      status: 'active',
      stock: { $gt: 0 },
      _id: { $nin: Array.from(userProducts).map(id => id) } // Exclude already purchased/wishlisted
    };

    // If user has preferences, prioritize those categories
    if (userCategories.size > 0) {
      recommendationQuery.category = { $in: Array.from(userCategories) };
    }

    // Get recommended products
    const recommendations = await Product.find(recommendationQuery)
      .populate('store', 'name address contact')
      .sort({ 
        isDiscounted: -1, // Prioritize discounted items
        discountPercentage: -1, // Higher discounts first
        'stats.views': -1, // Popular items
        createdAt: -1 // Newer items
      })
      .limit(20);

    // If not enough recommendations from user categories, get general popular items
    if (recommendations.length < 10) {
      const generalRecommendations = await Product.find({
        status: 'active',
        stock: { $gt: 0 },
        _id: { $nin: [...Array.from(userProducts), ...recommendations.map(p => p._id)] }
      })
      .populate('store', 'name address contact')
      .sort({ 
        isDiscounted: -1,
        'stats.views': -1,
        discountPercentage: -1
      })
      .limit(10 - recommendations.length);

      recommendations.push(...generalRecommendations);
    }

    res.json({
      success: true,
      recommendations: recommendations.slice(0, 12),
      userPreferences: {
        categories: Array.from(userCategories),
        totalOrders: userOrders.length,
        wishlistItems: userWishlist.length
      }
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get "Because you bought" recommendations
router.get('/because-you-bought/:productId', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Find similar products in same category or with similar names
    const similarProducts = await Product.find({
      $and: [
        { _id: { $ne: req.params.productId } },
        { status: 'active' },
        { stock: { $gt: 0 } },
        {
          $or: [
            { category: product.category },
            { name: { $regex: product.name.split(' ')[0], $options: 'i' } }
          ]
        }
      ]
    })
    .populate('store', 'name address contact')
    .sort({ 
      isDiscounted: -1,
      discountPercentage: -1,
      'stats.views': -1
    })
    .limit(8);

    res.json({
      success: true,
      originalProduct: {
        id: product._id,
        name: product.name,
        category: product.category
      },
      recommendations: similarProducts
    });
  } catch (error) {
    console.error('Get similar products error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get best deals (highest discount products)
router.get('/best-deals', async (req, res) => {
  try {
    const bestDeals = await Product.find({
      status: 'active',
      stock: { $gt: 0 },
      isDiscounted: true,
      discountPercentage: { $gte: 20 } // At least 20% discount
    })
    .populate('store', 'name address contact')
    .sort({ discountPercentage: -1, 'stats.views': -1 })
    .limit(12);

    res.json({
      success: true,
      deals: bestDeals
    });
  } catch (error) {
    console.error('Get best deals error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get trending products (most viewed recently)
router.get('/trending', async (req, res) => {
  try {
    const trending = await Product.find({
      status: 'active',
      stock: { $gt: 0 },
      'stats.views': { $gte: 1 }
    })
    .populate('store', 'name address contact')
    .sort({ 'stats.views': -1, createdAt: -1 })
    .limit(12);

    res.json({
      success: true,
      trending
    });
  } catch (error) {
    console.error('Get trending products error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get expiring soon products (good deals)
router.get('/expiring-soon', async (req, res) => {
  try {
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

    const expiringSoon = await Product.find({
      status: 'active',
      stock: { $gt: 0 },
      expiryDate: { $lte: twoDaysFromNow },
      isDiscounted: true
    })
    .populate('store', 'name address contact')
    .sort({ expiryDate: 1, discountPercentage: -1 })
    .limit(12);

    res.json({
      success: true,
      expiringSoon
    });
  } catch (error) {
    console.error('Get expiring soon products error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;