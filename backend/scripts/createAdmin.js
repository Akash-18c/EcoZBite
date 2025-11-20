const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/ecozbite');
    
    const existingAdmin = await User.findOne({ email: 'admin@ecozbite.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    const admin = new User({
      name: 'Admin',
      email: 'admin@ecozbite.com',
      password: 'admin123',
      role: 'admin',
      isEmailVerified: true,
      isActive: true
    });

    await admin.save();
    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();