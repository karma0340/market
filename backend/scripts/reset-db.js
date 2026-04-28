const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');

dotenv.config();

const resetDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    // 1. Clear all data
    console.log('Clearing all collections...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Transaction.deleteMany({});
    console.log('All data cleared.');

    console.log('Creating fresh users with unique secure passwords...');
    
    const adminPass = 'Admin#UltraSecure_2026_XkL9';
    const brokerPass = 'Broker#Aman_Master_88_Qp7m';
    const buyerPass = 'Buyer#Abhishek_Market_11_Rv2z';

    // Admin
    await User.create({
      name: 'Admin',
      email: 'admin@market.com',
      password: adminPass,
      role: 'admin'
    });

    // Broker (Aman)
    await User.create({
      name: 'Aman',
      email: 'aman@market.com',
      password: brokerPass,
      role: 'broker'
    });

    // Buyer (Abhishek)
    await User.create({
      name: 'Abhishek',
      email: 'abhishek@market.com',
      password: buyerPass,
      role: 'user'
    });

    console.log('--------------------------------------------------');
    console.log('DATABASE RESET SUCCESSFUL');
    console.log('--------------------------------------------------');
    console.log('CREDENTIALS:');
    console.log('Admin:  admin@market.com     / ' + adminPass);
    console.log('Broker: aman@market.com      / ' + brokerPass);
    console.log('Buyer:  abhishek@market.com    / ' + buyerPass);
    console.log('--------------------------------------------------');

    process.exit();
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
};

resetDB();
