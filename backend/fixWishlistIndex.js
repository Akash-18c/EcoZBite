const mongoose = require('mongoose');
require('dotenv').config();

const fixWishlistIndex = async () => {
  try {
    console.log('Connecting to database...');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecozbite');
    
    const collection = mongoose.connection.db.collection('wishlists');
    
    // Drop the incorrect unique index on user field
    try {
      await collection.dropIndex('user_1');
      console.log('✅ Dropped incorrect user_1 index');
    } catch (error) {
      console.log('Index user_1 may not exist, continuing...');
    }
    
    // Ensure the correct compound index exists
    await collection.createIndex({ user: 1, product: 1 }, { unique: true });
    console.log('✅ Created correct compound index on user + product');
    
    console.log('🎉 Wishlist index fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing wishlist index:', error);
    process.exit(1);
  }
};

fixWishlistIndex();