require('dotenv').config();
const mongoose = require('mongoose');
const startAutomatedPayouts = require('../services/payoutCron');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { executeCryptoPayout } = require('../services/nowpaymentsService');

const triggerManualRun = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB - Triggering Engine Manually...');

    // Ensure brokers have a crypto address for the test
    await User.updateMany({ role: 'broker' }, { payoutMethod: 'crypto:USDT:0xMarketplaceSimulatedAddress777' });

    // 1. Auto-clear funds
    const unclearedTransactions = await Transaction.find({
      type: 'commission',
      isCleared: false
    });

    for (const t of unclearedTransactions) {
      const user = await User.findById(t.userId);
      if (user) {
        t.isCleared = true;
        await t.save();
        user.wallet.pending -= t.amount;
        user.wallet.balance += t.amount;
        await user.save();
        console.log(`[ENGINE] Cleared $${t.amount} for user ${user.email}`);
      }
    }

    // 2. Automatically generate withdrawal requests for balances > $10
    const brokersWithBalance = await User.find({ role: 'broker', 'wallet.balance': { $gte: 10 } });
    for (const broker of brokersWithBalance) {
      const amount = broker.wallet.balance;
      broker.wallet.balance -= amount;
      broker.wallet.pending += amount; 
      await broker.save();

      const withdrawal = await Transaction.create({
        userId: broker._id,
        amount: amount,
        type: 'withdrawal',
        status: 'pending'
      });
      console.log(`[ENGINE] Auto-created withdrawal of $${amount} for ${broker.email}`);
    }

    // 3. Process Crypto Payouts
    const pendingWithdrawals = await Transaction.find({ type: 'withdrawal', status: 'pending' }).populate('userId');
    
    for (const req of pendingWithdrawals) {
      const methodStr = req.userId?.payoutMethod || '';
      
      // If they have a crypto address saved (e.g., crypto:USDT:0x123...)
      if (methodStr.startsWith('crypto:')) {
        const parts = methodStr.split(':');
        const address = parts[parts.length - 1];
        
        if (address) {
          console.log(`[ENGINE] Initiating NOWPayments payout of $${req.amount} to ${address}...`);
          
          try {
            const payoutResult = await executeCryptoPayout(address, req.amount, 'usd');
            
            if (payoutResult && payoutResult.status !== 'rejected') {
              req.status = 'completed';
              await req.save();
              
              const user = await User.findById(req.userId._id);
              if (user) {
                user.wallet.pending -= req.amount;
                await user.save();
              }
              console.log(`[ENGINE] ✅ Successfully paid $${req.amount} to ${address}`);
            }
          } catch (err) {
            console.error(`[ENGINE] ❌ Payout failed for ${req.userId.email}:`, err.message);
          }
        }
      } else {
        console.log(`[ENGINE] Skipped fiat payout for ${req.userId.email} - left in Admin Queue for manual processing.`);
      }
    }

    console.log('Manual trigger complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error triggering manual run:', error);
    process.exit(1);
  }
};

triggerManualRun();
