const Product = require('../models/Product');
const Store = require('../models/Store');
const User = require('../models/User');
const Notification = require('../models/Notification');
const emailService = require('./emailService');

// Check for expiring products and apply discounts
const checkExpiringProducts = async () => {
  try {
    console.log('🔄 Starting expiry check...');
    
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000));
    
    // Find products expiring in 2 days that aren't already discounted
    const expiringProducts = await Product.find({
      expiryDate: { $lte: twoDaysFromNow, $gt: now },
      status: { $in: ['active', 'expiring'] },
      stock: { $gt: 0 },
      isDiscounted: false
    }).populate('store');

    console.log(`📦 Found ${expiringProducts.length} products expiring soon`);

    for (const product of expiringProducts) {
      try {
        // Get store settings for discount percentage
        const store = await Store.findById(product.store);
        if (!store) continue;

        const discountPercentage = store.settings.defaultDiscountPercentage || 50;
        
        // Apply discount
        product.calculateDiscount(discountPercentage);
        product.status = 'expiring';
        await product.save();

        console.log(`💰 Applied ${discountPercentage}% discount to ${product.name}`);

        // Notify users who might be interested
        await notifyUsersAboutExpiringProduct(product, store);
        
      } catch (error) {
        console.error(`❌ Error processing product ${product._id}:`, error);
      }
    }

    // Update expired products
    await updateExpiredProducts();
    
    console.log('✅ Expiry check completed');
    
  } catch (error) {
    console.error('❌ Error in expiry check:', error);
  }
};

// Update products that have expired
const updateExpiredProducts = async () => {
  try {
    const now = new Date();
    
    const result = await Product.updateMany(
      { 
        expiryDate: { $lt: now },
        status: { $ne: 'expired' }
      },
      { 
        status: 'expired',
        isDiscounted: false
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`⏰ Marked ${result.modifiedCount} products as expired`);
    }
    
  } catch (error) {
    console.error('❌ Error updating expired products:', error);
  }
};

// Notify users about expiring products
const notifyUsersAboutExpiringProduct = async (product, store) => {
  try {
    // Find users who might be interested (same city, interested in category)
    const interestedUsers = await User.find({
      role: 'user',
      isActive: true,
      isEmailVerified: true,
      'preferences.notifications.email': true,
      $or: [
        { 'preferences.categories': product.category },
        { 'profile.address.city': store?.address?.city }
      ]
    });

    for (const user of interestedUsers) {
      try {
        // Create in-app notification
        await Notification.createNotification({
          recipient: user._id,
          type: 'new_discount',
          title: `🔥 ${product.discountPercentage}% OFF - ${product.name}`,
          message: `Great deal at ${store.name}! Save $${(product.originalPrice - product.discountedPrice).toFixed(2)} on ${product.name}. Expires ${new Date(product.expiryDate).toLocaleDateString()}!`,
          data: {
            product_id: product._id,
            store_id: store._id,
            discount_percentage: product.discountPercentage,
            action_url: `/products/${product._id}`
          },
          priority: 'high'
        });

        // Send email notification (batch them to avoid spam)
        if (Math.random() < 0.3) { // Send to 30% of users to avoid spam
          await emailService.sendExpiringProductsEmail(
            user,
            [product],
            store
          );
        }
        
      } catch (error) {
        console.error(`❌ Error notifying user ${user._id}:`, error);
      }
    }
    
  } catch (error) {
    console.error('❌ Error in user notification:', error);
  }
};

// Clean up old notifications
const cleanupOldNotifications = async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
    
    const result = await Notification.deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
      'channels.inApp.read': true
    });

    if (result.deletedCount > 0) {
      console.log(`🧹 Cleaned up ${result.deletedCount} old notifications`);
    }
    
  } catch (error) {
    console.error('❌ Error cleaning up notifications:', error);
  }
};

// Generate daily analytics
const generateDailyAnalytics = async () => {
  try {
    console.log('📊 Generating daily analytics...');
    
    // This could be expanded to generate and store daily analytics
    // For now, just log some basic stats
    
    const totalProducts = await Product.countDocuments({ status: { $ne: 'removed' } });
    const expiringProducts = await Product.countDocuments({ status: 'expiring' });
    const expiredProducts = await Product.countDocuments({ status: 'expired' });
    const activeStores = await Store.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments({ isActive: true });
    
    console.log('📈 Daily Stats:');
    console.log(`   Total Products: ${totalProducts}`);
    console.log(`   Expiring Products: ${expiringProducts}`);
    console.log(`   Expired Products: ${expiredProducts}`);
    console.log(`   Active Stores: ${activeStores}`);
    console.log(`   Total Users: ${totalUsers}`);
    
  } catch (error) {
    console.error('❌ Error generating analytics:', error);
  }
};

module.exports = {
  checkExpiringProducts,
  updateExpiredProducts,
  cleanupOldNotifications,
  generateDailyAnalytics
};