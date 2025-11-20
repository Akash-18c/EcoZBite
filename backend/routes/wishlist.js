const express = require('express');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user's wishlist
router.get('/', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ user: req.user.id })
      .populate({
        path: 'product',
        populate: {
          path: 'store',
          select: 'name address contact'
        }
      })
      .sort({ addedAt: -1 });

    // Filter out items where product no longer exists
    const validWishlist = wishlist.filter(item => item.product && item.product.store);

    res.json({
      success: true,
      wishlist: validWishlist,
      count: validWishlist.length
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add product to wishlist
router.post('/add/:productId', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if already in wishlist
    const existingItem = await Wishlist.findOne({
      user: req.user.id,
      product: req.params.productId
    });

    if (existingItem) {
      return res.status(400).json({ success: false, message: 'Product already in wishlist' });
    }

    const wishlistItem = new Wishlist({
      user: req.user.id,
      product: req.params.productId,
      priceWhenAdded: product.discountedPrice || product.originalPrice
    });

    await wishlistItem.save();

    res.json({
      success: true,
      message: 'Product added to wishlist',
      wishlistItem
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove product from wishlist
router.delete('/remove/:productId', auth, async (req, res) => {
  try {
    const result = await Wishlist.findOneAndDelete({
      user: req.user.id,
      product: req.params.productId
    });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Product not found in wishlist' });
    }

    res.json({
      success: true,
      message: 'Product removed from wishlist'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get wishlist count
router.get('/count', auth, async (req, res) => {
  try {
    const count = await Wishlist.countDocuments({ user: req.user.id });
    res.json({ success: true, count });
  } catch (error) {
    console.error('Get wishlist count error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Check if product is in wishlist
router.get('/check/:productId', auth, async (req, res) => {
  try {
    const item = await Wishlist.findOne({
      user: req.user.id,
      product: req.params.productId
    });

    res.json({
      success: true,
      inWishlist: !!item
    });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;