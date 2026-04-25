const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Transaction = require('./models/Transaction');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // 1. Create Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.findOneAndUpdate(
      { email: 'admin@market.com' },
      { 
        name: 'System Admin', 
        password: adminPassword, 
        role: 'admin',
        wallet: { balance: 0, pending: 0 }
      },
      { upsert: true, new: true }
    );

    // 2. Create User's specific account as Admin
    const sellerPassword = await bcrypt.hash('seller123', 10);
    const masterSeller = await User.findOneAndUpdate(
      { email: 'seller@gmail.com' },
      { 
        name: 'Master Admin', 
        password: sellerPassword, 
        role: 'admin',
        wallet: { balance: 500, pending: 0 }
      },
      { upsert: true, new: true }
    );

    // 3. Create Broker
    const brokerPassword = await bcrypt.hash('broker123', 10);
    const broker = await User.findOneAndUpdate(
      { email: 'broker@market.com' },
      { 
        name: 'Elite Vendor', 
        password: brokerPassword, 
        role: 'broker',
        wallet: { balance: 250, pending: 0 }
      },
      { upsert: true, new: true }
    );

    // 3. Create Demo Products
    const demoProducts = [
      {
        title: 'Premium React SaaS Template',
        description: 'A full-featured SaaS boilerplate with Auth, Stripe, and Dashboards. Built with Next.js 15 and Tailwind.',
        price: 49,
        images: ['https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80'],
        filePath: 'uploads/demo-asset.zip',
        sellerId: broker._id,
        status: 'approved'
      },
      {
        title: 'Modern UI Icon Pack',
        description: 'Over 500+ handcrafted SVG icons for modern web applications. Includes Figma files.',
        price: 19,
        images: ['https://images.unsplash.com/photo-1614036417651-efe591214972?w=800&q=80'],
        filePath: 'uploads/demo-asset.zip',
        sellerId: broker._id,
        status: 'approved'
      },
      {
        title: 'Ultimate Node.js Course',
        description: 'Master backend development with this 20-hour comprehensive video course and source code.',
        price: 99,
        images: ['https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&q=80'],
        filePath: 'uploads/demo-asset.zip',
        sellerId: broker._id,
        status: 'pending'
      }
    ];

    for (const p of demoProducts) {
      await Product.findOneAndUpdate({ title: p.title }, p, { upsert: true });
    }

    console.log('Seeding completed successfully!');
    process.exit();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
