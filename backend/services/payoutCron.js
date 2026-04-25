const cron = require('node-cron');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { executeCryptoPayout } = require('./nowpaymentsService');

const startAutomatedPayouts = () => {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('[CRON] Running automated payout processor...');
    try {
      // 1. Auto-clear funds (Reduce 7-day hold to 0 for instant liquidity)
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
          console.log(`[CRON] Cleared $${t.amount} for user ${user.email}`);
        }
      }

      // 2. Automatically generate withdrawal requests for balances > $10
      const brokersWithBalance = await User.find({ role: 'broker', 'wallet.balance': { $gte: 10 } });
      for (const broker of brokersWithBalance) {
        const amount = broker.wallet.balance;
        broker.wallet.balance -= amount;
        broker.wallet.pending += amount; // Lock it back for withdrawal processing
        await broker.save();

        const withdrawal = await Transaction.create({
          userId: broker._id,
          amount: amount,
          type: 'withdrawal',
          status: 'pending'
        });
        console.log(`[CRON] Auto-created withdrawal of $${amount} for ${broker.email}`);
      }

      // 3. Process Crypto Payouts
      const pendingWithdrawals = await Transaction.find({ type: 'withdrawal', status: 'pending' }).populate('userId');
      
      for (const req of pendingWithdrawals) {
        const methodStr = req.userId?.payoutMethod || '';
        
        // If they have a crypto address saved (e.g., crypto:USDT:0x123...)
        if (methodStr.startsWith('crypto:')) {
          const parts = methodStr.split(':');
          const address = parts[parts.length - 1]; // e.g., 0x123...
          
          if (address) {
            console.log(`[CRON] Initiating NOWPayments payout of $${req.amount} to ${address}...`);
            
            try {
              // Attempt to send via NOWPayments API
              const payoutResult = await executeCryptoPayout(address, req.amount, 'usd');
              
              if (payoutResult && payoutResult.status !== 'rejected') {
                req.status = 'completed';
                await req.save();
                
                // Deduct from wallet permanently
                const user = await User.findById(req.userId._id);
                if (user) {
                  user.wallet.pending -= req.amount;
                  await user.save();
                }
                console.log(`[CRON] Successfully paid $${req.amount} to ${address}`);
              }
            } catch (err) {
              console.error(`[CRON] Payout failed for ${req.userId.email}:`, err.message);
              // Leave as pending so admin can manually fix or it retries
            }
          }
        } else {
          // It's fiat (UPI/Bank), leave it in the Admin Payout Queue for manual settlement
        }
      }

    } catch (error) {
      console.error('[CRON] Error in payout processor:', error);
    }
  });
  
  console.log('Automated Payout Engine initialized (Runs every 5 minutes)');
};

module.exports = startAutomatedPayouts;
