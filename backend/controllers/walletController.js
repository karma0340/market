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
      payoutMethods: user.payoutMethods
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update broker's payout methods
// @route   PUT /api/wallet/payout-methods
// @access  Private/Broker
const updatePayoutMethods = async (req, res, next) => {
  try {
    const { crypto, gpay, upi, paypal, bankTransfer } = req.body;
    const user = await User.findById(req.user._id);

    if (crypto !== undefined) user.payoutMethods.crypto = crypto;
    if (gpay !== undefined) user.payoutMethods.gpay = gpay;
    if (upi !== undefined) user.payoutMethods.upi = upi;
    if (paypal !== undefined) user.payoutMethods.paypal = paypal;
    if (bankTransfer !== undefined) user.payoutMethods.bankTransfer = bankTransfer;

    await user.save();

    res.json({ message: 'Payout methods updated successfully', payoutMethods: user.payoutMethods });
  } catch (error) {
    next(error);
  }
};

// @desc    Request payout (80% of balance)
// @route   POST /api/wallet/withdraw
// @access  Private/Broker
  const requestWithdrawal = async (req, res, next) => {
  try {
    const { amount, method } = req.body; // method can be 'crypto', 'gpay', 'upi', 'paypal', 'bankTransfer'
    const user = await User.findById(req.user._id);

    if (amount <= 0) {
      res.status(400);
      return next(new Error('Invalid amount'));
    }

    if (user.wallet.balance < amount) {
      res.status(400);
      return next(new Error('Insufficient balance'));
    }

    if (!method || !user.payoutMethods[method]) {
      res.status(400);
      return next(new Error('Please select a valid payout method'));
    }
    
    // Check if the selected method is properly configured
    let payoutDetails = '';
    if (method === 'crypto' && !user.payoutMethods.crypto?.address) {
      return next(new Error('Crypto wallet is not configured'));
    } else if (method === 'crypto') payoutDetails = `${user.payoutMethods.crypto.address} (${user.payoutMethods.crypto.currency})`;
    
    if (method === 'gpay' && !user.payoutMethods.gpay) return next(new Error('GPay is not configured'));
    else if (method === 'gpay') payoutDetails = user.payoutMethods.gpay;
    
    if (method === 'upi' && !user.payoutMethods.upi) return next(new Error('UPI is not configured'));
    else if (method === 'upi') payoutDetails = user.payoutMethods.upi;
    
    if (method === 'paypal' && !user.payoutMethods.paypal) return next(new Error('PayPal is not configured'));
    else if (method === 'paypal') payoutDetails = user.payoutMethods.paypal;
    
    if (method === 'bankTransfer' && !user.payoutMethods.bankTransfer?.accountNumber) return next(new Error('Bank account is not configured'));
    else if (method === 'bankTransfer') payoutDetails = `Acct: ${user.payoutMethods.bankTransfer.accountNumber}, IFSC: ${user.payoutMethods.bankTransfer.ifscCode}`;

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
      note: `Payout request: $${brokerPayout} via ${method.toUpperCase()} [${payoutDetails}]. Platform fee: $${platformFee}`,
      payoutAddress: payoutDetails,
      payoutCurrency: method,
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
  updatePayoutMethods,
  requestWithdrawal,
  getTransactions
};
