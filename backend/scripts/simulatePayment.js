require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

const simulatePayment = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find an approved product
    const product = await Product.findOne({ status: 'approved' }).populate('sellerId');
    if (!product) {
      console.log('No approved products found to buy.');
      process.exit(1);
    }

    // Find a buyer (any user who is not the seller and is role: 'user')
    const buyer = await User.findOne({ _id: { $ne: product.sellerId._id }, role: 'user' });
    if (!buyer) {
      console.log('No buyer found. Please create a regular user first.');
      process.exit(1);
    }

    console.log(`Simulating purchase: Buyer ${buyer.email} buying ${product.title} from Broker ${product.sellerId.email}`);
    console.log(`Price: $${product.price}`);

    // Create an order
    const order = await Order.create({
      userId: buyer._id,
      productId: product._id,
      paymentType: 'stripe',
      paymentId: 'simulated_txn_' + Date.now(),
      amount: product.price,
      status: 'paid'
    });

    // Commission System (20% platform fee)
    const COMMISSION_PERCENTAGE = 20;
    const platformFee = (order.amount * COMMISSION_PERCENTAGE) / 100;
    const sellerEarnings = order.amount - platformFee;

    console.log(`Platform Fee (20%): $${platformFee}`);
    console.log(`Broker Earnings (80%): $${sellerEarnings}`);

    // Update Broker Wallet
    product.sellerId.wallet.pending += sellerEarnings;
    await product.sellerId.save();

    console.log(`Updated Broker pending wallet. New pending balance: $${product.sellerId.wallet.pending}`);

    // Record Transactions
    await Transaction.create([
      {
        userId: buyer._id,
        amount: order.amount,
        type: 'payment',
        status: 'completed'
      },
      {
        userId: product.sellerId._id,
        amount: sellerEarnings,
        type: 'commission',
        status: 'completed'
      }
    ]);

    console.log('Payment simulation completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error simulating payment:', error);
    process.exit(1);
  }
};

simulatePayment();
