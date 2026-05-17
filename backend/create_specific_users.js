const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // 1. Admin
    const adminPassword = await bcrypt.hash('Admin#UltraSecure_2026_XkL9', 10);
    await User.findOneAndUpdate(
      { email: 'admin@market.com' },
      { 
        name: 'Super Admin', 
        password: adminPassword, 
        role: 'admin',
        brokerStatus: 'approved',
        wallet: { balance: 0, pending: 0 }
      },
      { upsert: true, new: true }
    );

    // 2. Broker
    const brokerPassword = await bcrypt.hash('Broker#Aman_Master_88_Qp7m', 10);
    await User.findOneAndUpdate(
      { email: 'aman@market.com' },
      { 
        name: 'Aman Vendor', 
        password: brokerPassword, 
        role: 'broker',
        brokerStatus: 'approved',
        wallet: { balance: 1500, pending: 0 }
      },
      { upsert: true, new: true }
    );

    // 3. Buyer
    const buyerPassword = await bcrypt.hash('Buyer#Abhishek_Market_11_Rv2z', 10);
    await User.findOneAndUpdate(
      { email: 'abhishek@market.com' },
      { 
        name: 'Abhishek Buyer', 
        password: buyerPassword, 
        role: 'user',
        wallet: { balance: 50, pending: 0 }
      },
      { upsert: true, new: true }
    );

    console.log('Successfully created/updated the requested users!');
    process.exit();
  } catch (error) {
    console.error('Error creating users:', error);
    process.exit(1);
  }
};

createUsers();
