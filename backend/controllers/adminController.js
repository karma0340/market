const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { executeCryptoPayout } = require('../services/nowpaymentsService');

// @desc    Get all pending products
// @route   GET /api/admin/products/pending
// @access  Private/Admin
const getPendingProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ status: 'pending' }).populate('sellerId', 'name email');
    res.json(products);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all products (any status)
// @route   GET /api/admin/products
// @access  Private/Admin
const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find({}).populate('sellerId', 'name email');
    res.json(products);
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject product
// @route   PUT /api/admin/products/:id/status
// @access  Private/Admin
const updateProductStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      res.status(400);
      return next(new Error('Invalid status'));
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      return next(new Error('Product not found'));
    }

    product.status = status;
    await product.save();

    res.json({ message: `Product ${status} successfully`, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      return next(new Error('Product not found'));
    }
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all withdrawal requests
// @route   GET /api/admin/withdrawals
// @access  Private/Admin
const getWithdrawalRequests = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ type: 'withdrawal', status: 'pending' }).populate('userId', 'name email payoutMethod');
    res.json(transactions);
  } catch (error) {
    next(error);
  }
};

// @desc    Approve withdrawal request
// @route   PUT /api/admin/withdrawals/:id/approve
// @access  Private/Admin
const approveWithdrawal = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction || transaction.type !== 'withdrawal' || transaction.status !== 'pending') {
      res.status(404);
      return next(new Error('Pending withdrawal transaction not found'));
    }

    const user = await User.findById(transaction.userId);

    // Auto-execute crypto payout if broker has a wallet address on the transaction
    if (transaction.payoutAddress && transaction.payoutCurrency) {
      try {
        const payoutResult = await executeCryptoPayout(
          transaction.payoutAddress,
          transaction.amount,
          transaction.payoutCurrency
        );
        // Store the transaction ID from NOWPayments for tracking
        const txId = payoutResult?.withdrawals?.[0]?.id || payoutResult?.batch_withdrawal_id || 'sent';
        transaction.payoutTxId = txId;
        console.log(`[Admin] Crypto payout sent. Tx ID: ${txId}`);
      } catch (payoutError) {
        // Log the error but don't block the approval — admin can retry manually
        console.error('[Admin] Auto crypto payout failed:', payoutError.message);
        transaction.note = (transaction.note || '') + ` | PAYOUT ERROR: ${payoutError.message}`;
      }
    }

    transaction.status = 'completed';
    await transaction.save();

    // Deduct from user's pending wallet
    if (user) {
      user.wallet.pending -= transaction.amount;
      await user.save();
    }

    res.json({ message: 'Withdrawal approved and crypto payout initiated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPendingProducts,
  getAllProducts,
  updateProductStatus,
  deleteProduct,
  getWithdrawalRequests,
  approveWithdrawal,
  getUsers
};
