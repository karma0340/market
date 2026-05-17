const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const { executeCryptoPayout } = require('../services/nowpaymentsService');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

// ────────────────────────────────────────────────────────────────────────
// DASHBOARD STATS
// ────────────────────────────────────────────────────────────────────────

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalBrokers, totalProducts, totalOrders, paidOrders, pendingBrokers] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'broker' }),
      Product.countDocuments({}),
      Order.countDocuments({}),
      Order.find({ status: 'paid' }),
      User.countDocuments({ role: 'broker', brokerStatus: 'pending' }),
    ]);

    // Total revenue from paid orders
    const totalRevenueUSD = paidOrders.filter(o => o.currency !== 'INR').reduce((sum, o) => sum + (o.amount || 0), 0);
    const totalRevenueINR = paidOrders.filter(o => o.currency === 'INR').reduce((sum, o) => sum + (o.amount || 0), 0);

    // Monthly revenue for the last 12 months
    const now = new Date();
    const monthlyRevenue = [];
    for (let i = 11; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const monthOrders = paidOrders.filter(o => {
        const d = new Date(o.createdAt);
        return d >= start && d <= end;
      });
      const revenue = monthOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
      monthlyRevenue.push({
        month: start.toLocaleString('default', { month: 'short' }),
        year: start.getFullYear(),
        revenue,
        orders: monthOrders.length,
      });
    }

    // Top selling products (by order count)
    const ordersByProduct = {};
    paidOrders.forEach(o => {
      const pid = o.productId?.toString();
      if (pid) {
        ordersByProduct[pid] = (ordersByProduct[pid] || 0) + 1;
      }
    });
    const topProductIds = Object.entries(ordersByProduct)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    const topProducts = await Product.find({ _id: { $in: topProductIds } })
      .populate('sellerId', 'name')
      .lean();

    const topProductsWithSales = topProducts.map(p => ({
      ...p,
      totalSales: ordersByProduct[p._id.toString()] || 0,
      totalRevenue: paidOrders
        .filter(o => o.productId?.toString() === p._id.toString())
        .reduce((sum, o) => sum + (o.amount || 0), 0),
    })).sort((a, b) => b.totalSales - a.totalSales);

    // Recent orders
    const recentOrders = await Order.find({})
      .populate('userId', 'name email')
      .populate('productId', 'title price')
      .sort({ createdAt: -1 })
      .limit(10);

    // Recent users
    const recentUsers = await User.find({})
      .select('name email role brokerStatus createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      totalUsers,
      totalBrokers,
      totalProducts,
      totalOrders,
      totalRevenueUSD,
      totalRevenueINR,
      pendingBrokers,
      monthlyRevenue,
      topProducts: topProductsWithSales,
      recentOrders,
      recentUsers,
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────────────────────
// BROKER APPROVAL
// ────────────────────────────────────────────────────────────────────────

// @desc    Get all pending broker applications
// @route   GET /api/admin/brokers/pending
// @access  Private/Admin
const getPendingBrokers = async (req, res, next) => {
  try {
    const brokers = await User.find({ role: 'broker', brokerStatus: 'pending' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(brokers);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all brokers
// @route   GET /api/admin/brokers
// @access  Private/Admin
const getAllBrokers = async (req, res, next) => {
  try {
    const brokers = await User.find({ role: 'broker' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(brokers);
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a broker application
// @route   PUT /api/admin/brokers/:id/approve
// @access  Private/Admin
const approveBroker = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }
    if (user.role !== 'broker') {
      res.status(400);
      return next(new Error('User is not a broker'));
    }

    user.brokerStatus = 'approved';
    await user.save();

    // Notify the broker
    await Notification.create({
      type: 'broker_approved',
      title: 'Broker Application Approved!',
      message: 'Congratulations! Your broker application has been approved. You can now start selling digital assets.',
      forUser: user._id,
      fromUser: req.user._id,
    });

    res.json({ message: 'Broker approved successfully', user });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a broker application
// @route   PUT /api/admin/brokers/:id/reject
// @access  Private/Admin
const rejectBroker = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    user.brokerStatus = 'rejected';
    user.rejectionReason = reason || 'Application did not meet our requirements.';
    await user.save();

    // Notify the broker
    await Notification.create({
      type: 'broker_rejected',
      title: 'Broker Application Update',
      message: `Your broker application has been reviewed. Reason: ${user.rejectionReason}`,
      forUser: user._id,
      fromUser: req.user._id,
    });

    res.json({ message: 'Broker rejected', user });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────────────────────
// EXISTING ENDPOINTS (preserved)
// ────────────────────────────────────────────────────────────────────────

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

    // Notify the seller
    const notifType = status === 'approved' ? 'product_approved' : status === 'rejected' ? 'product_rejected' : 'system';
    await Notification.create({
      type: notifType,
      title: `Product ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your product "${product.title}" has been ${status}.`,
      forUser: product.sellerId,
      fromUser: req.user._id,
      data: { productId: product._id },
    });

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
        const txId = payoutResult?.withdrawals?.[0]?.id || payoutResult?.batch_withdrawal_id || 'sent';
        transaction.payoutTxId = txId;
        console.log(`[Admin] Crypto payout sent. Tx ID: ${txId}`);
      } catch (payoutError) {
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

      // Notify broker
      await Notification.create({
        type: 'withdrawal_approved',
        title: 'Withdrawal Approved',
        message: `Your withdrawal of $${transaction.amount} has been processed.`,
        forUser: user._id,
        fromUser: req.user._id,
      });
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

// @desc    Get all orders (customer payments)
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate('userId', 'name email')
      .populate('productId', 'title')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Generate PDF Invoice for an order
// @route   GET /api/admin/orders/:id/invoice
// @access  Private/Admin
const generateInvoice = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('productId', 'title description price currency');

    if (!order) {
      res.status(404);
      return next(new Error('Order not found'));
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${order._id}.pdf`);

    doc.pipe(res);

    // Styling constants
    const brandColor = '#0070FF'; // Main brand blue
    const darkColor = '#111113';
    const grayColor = '#6B7280';
    const lightGray = '#E5E7EB';

    // Logo
    const logoPath = path.join(__dirname, '../../frontend/public/icon-logo.png');
    let titleX = 50;
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 45, { width: 40 });
      titleX = 100;
    }

    // Company Header
    doc.fillColor(darkColor)
       .fontSize(22).font('Helvetica-Bold')
       .text('DigitalMarket', titleX, 50);
    
    doc.fillColor(grayColor)
       .fontSize(10).font('Helvetica')
       .text('Premium Digital Assets', titleX, 75);

    // Invoice Meta (Right Aligned)
    doc.fillColor(brandColor)
       .fontSize(20).font('Helvetica-Bold')
       .text('INVOICE', 0, 50, { align: 'right', width: 545 });
    
    doc.fillColor(darkColor).fontSize(10)
       .text(`Invoice No: INV-${order._id.toString().slice(-8).toUpperCase()}`, 0, 75, { align: 'right', width: 545 })
       .text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 0, 90, { align: 'right', width: 545 })
       .text(`Status: ${order.status.toUpperCase()}`, 0, 105, { align: 'right', width: 545 });

    doc.moveDown();
    doc.moveTo(50, 140).lineTo(545, 140).lineWidth(1).strokeColor(lightGray).stroke();

    // Bill To Section
    doc.fillColor(grayColor).fontSize(10).font('Helvetica-Bold').text('BILL TO:', 50, 160);
    doc.fillColor(darkColor).fontSize(12).text(order.userId?.name || 'Guest User', 50, 175);
    doc.fillColor(grayColor).fontSize(10).font('Helvetica').text(order.userId?.email || 'N/A', 50, 190);

    // Table Header
    const tableTop = 240;
    doc.rect(50, tableTop, 495, 30).fillColor(brandColor).fill();
    
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(10)
       .text('ITEM DESCRIPTION', 60, tableTop + 10)
       .text('QTY', 380, tableTop + 10, { width: 40, align: 'center' })
       .text('TOTAL', 430, tableTop + 10, { width: 100, align: 'right' });

    // Table Row
    const rowTop = tableTop + 45;
    doc.fillColor(darkColor).font('Helvetica').fontSize(10)
       .text(order.productId?.title || 'Unknown Product', 60, rowTop, { width: 300 })
       .text('1', 380, rowTop, { width: 40, align: 'center' });
       
    const currency = order.currency === 'INR' ? 'INR' : 'USD';
    const symbol = currency === 'INR' ? 'Rs.' : '$';
    doc.text(`${symbol}${order.amount || 0}`, 430, rowTop, { width: 100, align: 'right' });

    // Bottom Line
    doc.moveTo(50, rowTop + 30).lineTo(545, rowTop + 30).lineWidth(1).strokeColor(lightGray).stroke();

    // Total Section
    const totalTop = rowTop + 50;
    doc.fillColor(darkColor).font('Helvetica-Bold').fontSize(12)
       .text('TOTAL PAID:', 330, totalTop, { width: 100, align: 'right' })
       .fillColor(brandColor).fontSize(16)
       .text(`${symbol}${order.amount || 0}`, 430, totalTop - 2, { width: 100, align: 'right' });

    // Footer
    doc.fillColor(grayColor).fontSize(10).font('Helvetica')
       .text('Thank you for choosing DigitalMarket. All digital asset sales are final.', 50, 750, { align: 'center', width: 495 });
    
    doc.end();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getPendingBrokers,
  getAllBrokers,
  approveBroker,
  rejectBroker,
  getPendingProducts,
  getAllProducts,
  updateProductStatus,
  deleteProduct,
  getWithdrawalRequests,
  approveWithdrawal,
  getUsers,
  getAllOrders,
  generateInvoice
};
