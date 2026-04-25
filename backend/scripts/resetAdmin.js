require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Delete existing admins
    const deleteResult = await User.deleteMany({ role: 'admin' });
    console.log(`Deleted ${deleteResult.deletedCount} existing admin(s)`);

    // Create new admin
    const admin = await User.create({
      name: 'Global Admin',
      email: 'admin@gmail.com',
      password: 'admin123',
      role: 'admin'
    });

    console.log('New admin created successfully:');
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);

    process.exit(0);
  } catch (error) {
    console.error('Error resetting admin:', error);
    process.exit(1);
  }
};

resetAdmin();
