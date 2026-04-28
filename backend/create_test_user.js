const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    const email = 'razorpay-verification@market.com';
    const password = 'MarketTest2026!';
    
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      console.log('Test user already exists. Updating password...');
      user.password = password;
      await user.save();
    } else {
      user = await User.create({
        name: 'Razorpay Verification',
        email,
        password,
        role: 'user'
      });
      console.log('Test user created successfully!');
    }

    console.log('--- TEST ACCOUNT DETAILS ---');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('---------------------------');
    
    process.exit();
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
};

createTestUser();
