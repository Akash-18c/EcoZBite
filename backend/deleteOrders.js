const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecozbite');

const Order = require('./models/Order');

const deleteAllOrders = async () => {
  try {
    console.log('Connecting to database...');
    
    const result = await Order.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} orders successfully`);
    
    console.log('🎉 Fresh start complete! All order history cleared.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting orders:', error);
    process.exit(1);
  }
};

deleteAllOrders();