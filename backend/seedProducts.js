const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB...');

    const broker = await User.findOne({ email: 'broker@gmail.com' });
    if (!broker) {
      console.error('Broker user not found!');
      process.exit(1);
    }

    const products = [
      {
        title: 'Mastering Indian Equity Markets',
        description: 'A comprehensive guide to investing in the Indian stock market. Covers fundamental and technical analysis specifically for NSE/BSE.',
        price: 499,
        category: 'courses',
        images: ['https://images.unsplash.com/photo-1611974717482-48a66500b396?auto=format&fit=crop&q=80&w=1000'],
        demoUrl: 'https://example.com/demo1',
        filePath: 'backend/uploads/test_asset_1.pdf',
        sellerId: broker._id,
        status: 'approved'
      },
      {
        title: 'SaaS Dashboard Framer Template',
        description: 'A high-converting, professional Framer template for your next SaaS project. Modern design with premium animations.',
        price: 1299,
        category: 'templates',
        images: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000'],
        demoUrl: 'https://example.com/demo2',
        filePath: 'backend/uploads/test_asset_2.zip',
        sellerId: broker._id,
        status: 'approved'
      },
      {
        title: 'Python for Data Science BootCamp',
        description: 'Go from zero to data scientist with this intensive Python course. Includes 20+ real-world projects and datasets.',
        price: 2999,
        category: 'courses',
        images: ['https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1000'],
        demoUrl: 'https://example.com/demo3',
        filePath: 'backend/uploads/test_asset_3.pdf',
        sellerId: broker._id,
        status: 'approved'
      },
      {
        title: 'Elite Trading Signals Discord Bot',
        description: 'Automated trading signals for Crypto and Forex. High-precision algorithms built with Node.js and Python.',
        price: 4999,
        category: 'software',
        images: ['https://images.unsplash.com/photo-1642790103300-97e45bc12c6e?auto=format&fit=crop&q=80&w=1000'],
        demoUrl: 'https://example.com/demo4',
        filePath: 'backend/uploads/test_asset_4.zip',
        sellerId: broker._id,
        status: 'approved'
      },
      {
        title: 'Modern Minimalism Icon Pack',
        description: '500+ handcrafted SVG icons for modern web and mobile applications. Multiple styles including line, solid, and duotone.',
        price: 199,
        category: 'assets',
        images: ['https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=1000'],
        demoUrl: 'https://example.com/demo5',
        filePath: 'backend/uploads/test_asset_5.zip',
        sellerId: broker._id,
        status: 'approved'
      }
    ];

    await Product.deleteMany({ sellerId: broker._id });
    await Product.insertMany(products);

    console.log('Seed successful! 5 professional products added for broker.');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
