const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const Order = require('./models/Order');
const User = require('./models/User');

async function markPaid() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const user = await User.findOne({ email: 'buyer@gmail.com' });
    if (!user) {
      console.log('Buyer user not found');
      return;
    }

    const order = await Order.findOne({ userId: user._id, status: 'pending' }).sort({ createdAt: -1 });
    if (!order) {
      console.log('No pending orders found for this buyer.');
      return;
    }

    order.status = 'paid';
    order.paymentId = 'manual_test_' + Date.now();
    await order.save();

    console.log(`Order ${order._id} for ${order.amount} has been marked as PAID!`);
    console.log('You can now check your Dashboard to download the files.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

markPaid();
