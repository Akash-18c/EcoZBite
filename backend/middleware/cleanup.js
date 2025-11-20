const Product = require('../models/Product');
const Store = require('../models/Store');
const Order = require('../models/Order');

// Middleware to clean up orphaned products
const cleanupOrphanedProducts = async (req, res, next) => {
  try {
    // Find products with stores that don't exist or are inactive
    const orphanedProducts = await Product.find({})
      .populate('store')
      .then(products => products.filter(product => !product.store || !product.store.isActive));

    if (orphanedProducts.length > 0) {
      const orphanedIds = orphanedProducts.map(p => p._id);
      
      // Delete orders containing orphaned products
      await Order.deleteMany({
        'items.product_id': { $in: orphanedIds }
      });
      
      // Delete orphaned products
      await Product.deleteMany({
        _id: { $in: orphanedIds }
      });
      
      console.log(`Cleaned up ${orphanedProducts.length} orphaned products`);
    }
    
    next();
  } catch (error) {
    console.error('Cleanup middleware error:', error);
    next();
  }
};

module.exports = { cleanupOrphanedProducts };