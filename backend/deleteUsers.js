const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function deleteAllUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const result = await User.deleteMany({});
    console.log(`Deleted ${result.deletedCount} users`);
  } catch (error) {
    console.error('Error deleting users:', error);
  } finally {
    mongoose.connection.close();
  }
}

deleteAllUsers();
