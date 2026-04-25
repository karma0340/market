const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function seedTestData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    const broker = await User.findOne({ email: 'broker@gmail.com' });
    if (!broker) {
      console.log('Broker not found. Please register first.');
      process.exit(1);
    }

    // 1. Create a Product
    const sampleFileName = `test-source-${Date.now()}.zip`;
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    
    const filePath = `uploads/${sampleFileName}`;
    fs.writeFileSync(path.join(__dirname, filePath), 'This is the premium source code for the Elite Website Template.');

    const product = await Product.create({
      title: 'Elite Website Source Code',
      description: 'A complete premium Next.js SaaS template with authentication and payments.',
      price: 299,
      images: ['https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800'],
      category: 'software',
      filePath: filePath,
      sellerId: broker._id,
      status: 'approved'
    });
    console.log('Product created:', product._id);

    // 2. Ensure we have a buyer
    let buyer = await User.findOne({ email: 'buyer@gmail.com' });
    if (!buyer) {
      buyer = await User.create({
        name: 'Test Buyer',
        email: 'buyer@gmail.com',
        password: 'password123',
        role: 'user'
      });
    }

    // 3. Create a Paid Order so we can test download
    const order = await Order.create({
      userId: buyer._id,
      productId: product._id,
      amount: 299,
      status: 'paid',
      paymentId: 'pay_test_12345',
      paymentMethod: 'stripe',
      paymentType: 'stripe'
    });
    console.log('Paid Order created:', order._id);

    console.log('SUCCESS: Test data seeded. Login as buyer@gmail.com / password123 to test download.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedTestData();
