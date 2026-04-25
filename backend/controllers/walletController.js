const Transaction = require('../models/Transaction');
const User = require('../models/User');

// @desc    Get broker wallet details
// @route   GET /api/wallet
// @access  Private/Broker
const getWallet = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Auto-clear funds older than 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const unclearedTransactions = await Transaction.find({
      userId: req.user._id,
      type: 'commission',
      isCleared: false,
      createdAt: { $lte: sevenDaysAgo }
    });

    if (unclearedTransactions.length > 0) {
      let totalToClear = 0;
      for (const t of unclearedTransactions) {
        totalToClear += t.amount;
        t.isCleared = true;
        await t.save();
      }
      
      user.wallet.pending -= totalToClear;
      user.wallet.balance += totalToClear;
      await user.save();
    }

    const transactions = await Transaction.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.json({
      balance: user.wallet.balance,
      pending: user.wallet.pending,
      transactions,
      clearancePeriod: 7, // Days
      cryptoWallet: user.cryptoWallet
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update broker's crypto wallet address
// @route   PUT /api/wallet/crypto-wallet
// @access  Private/Broker
const updateCryptoWallet = async (req, res, next) => {
  try {
    const { address, currency } = req.body;

    if (!address || address.trim() === '') {
      res.status(400);
      return next(new Error('Please provide a valid crypto wallet address'));
    }

    const user = await User.findById(req.user._id);
    user.cryptoWallet = {
      address: address.trim(),
      currency: currency || 'usdttrc20'
    };
    await user.save();

    res.json({ message: 'Crypto wallet updated successfully', cryptoWallet: user.cryptoWallet });
  } catch (error) {
    next(error);
  }
};

// @desc    Request payout (80% of balance)
// @route   POST /api/wallet/withdraw
// @access  Private/Broker
const requestWithdrawal = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user._id);

    if (amount <= 0) {
      res.status(400);
      return next(new Error('Invalid amount'));
    }

    if (user.wallet.balance < amount) {
      res.status(400);
      return next(new Error('Insufficient balance'));
    }

    if (!user.cryptoWallet || !user.cryptoWallet.address) {
      res.status(400);
      return next(new Error('Please add a crypto wallet address before requesting a payout'));
    }

    // Calculate 80/20 split
    const BROKER_SHARE = 0.80;
    const brokerPayout = parseFloat((amount * BROKER_SHARE).toFixed(2));
    const platformFee = parseFloat((amount - brokerPayout).toFixed(2));

    // Move balance to pending (hold until admin approves)
    user.wallet.balance -= amount;
    user.wallet.pending += brokerPayout;
    await user.save();

    const transaction = await Transaction.create({
      userId: req.user._id,
      amount: brokerPayout,
      type: 'withdrawal',
      status: 'pending',
      note: `Payout request: $${brokerPayout} to ${user.cryptoWallet.address} (${user.cryptoWallet.currency}). Platform fee: $${platformFee}`,
      payoutAddress: user.cryptoWallet.address,
      payoutCurrency: user.cryptoWallet.currency,
    });

    res.status(201).json({
      message: `Payout of $${brokerPayout} requested. Platform fee: $${platformFee}. Pending admin approval.`,
      transaction,
      breakdown: {
        requested: amount,
        brokerReceives: brokerPayout,
        platformFee: platformFee,
        splitPercentage: '80/20'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transaction history
// @route   GET /api/wallet/transactions
// @access  Private/Broker
const getTransactions = async (req, res, next) => {
  try {
    console.log(`Fetching transactions for user: ${req.user._id}`);
    const transactions = await Transaction.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    console.error('Error in getTransactions:', error);
    next(error);
  }
};

module.exports = {
  getWallet,
  updateCryptoWallet,
  requestWithdrawal,
  getTransactions
};
