require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const simulateWithdrawal = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find a broker with pending or available balance
    const broker = await User.findOne({ role: 'broker' });
    if (!broker) {
      console.log('No broker found.');
      process.exit(1);
    }

    // Move pending to balance for simulation
    if (broker.wallet.pending > 0) {
      broker.wallet.balance += broker.wallet.pending;
      broker.wallet.pending = 0;
      console.log(`Moved funds to available balance: $${broker.wallet.balance}`);
    }

    if (broker.wallet.balance <= 0) {
      console.log('Broker has no available balance to withdraw.');
      process.exit(1);
    }

    const amount = broker.wallet.balance;
    console.log(`Simulating withdrawal request for $${amount}`);

    // Create withdrawal transaction
    await Transaction.create({
      userId: broker._id,
      amount: amount,
      type: 'withdrawal',
      status: 'pending' // Admin needs to approve
    });

    console.log('Withdrawal request added to Admin Payout Queue!');
    process.exit(0);

  } catch (error) {
    console.error('Error simulating withdrawal:', error);
    process.exit(1);
  }
};

simulateWithdrawal();
