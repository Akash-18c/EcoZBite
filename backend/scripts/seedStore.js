const mongoose = require('mongoose');
const Store = require('../models/Store');
const User = require('../models/User');

const seedStore = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecozbite');
    
    // Check if default store exists
    const existingStore = await Store.findById('507f1f77bcf86cd799439011');
    if (existingStore) {
      console.log('Default store already exists');
      return;
    }

    // Find or create a default admin user
    let adminUser = await User.findOne({ email: 'admin@ecozbite.com' });
    if (!adminUser) {
      adminUser = new User({
        _id: '507f1f77bcf86cd799439012',
        name: 'EcoZBite Admin',
        email: 'admin@ecozbite.com',
        password: 'hashedpassword',
        role: 'admin'
      });
      await adminUser.save();
    }

    // Create default store
    const defaultStore = new Store({
      _id: '507f1f77bcf86cd799439011',
      name: 'EcoZBite Default Store',
      description: 'Default store for product management',
      address: {
        street: '123 Green Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        coordinates: { lat: 19.0760, lng: 72.8777 }
      },
      contact: {
        phone: '+91-9876543210',
        email: 'store@ecozbite.com'
      },
      owner: adminUser._id,
      isActive: true
    });

    await defaultStore.save();
    console.log('Default store created successfully');
  } catch (error) {
    console.error('Error seeding store:', error);
  } finally {
    mongoose.disconnect();
  }
};

module.exports = seedStore;

if (require.main === module) {
  seedStore();
}