const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const BrokerLead = require('../models/BrokerLead');
const Notification = require('../models/Notification');

// @desc    Get broker dashboard statistics
// @route   GET /api/broker/stats
// @access  Private/Broker
exports.getBrokerStats = async (req, res, next) => {
  try {
    const brokerId = req.user._id;

    // Get broker's products
    const products = await Product.find({ sellerId: brokerId });
    const productIds = products.map(p => p._id);

    // Get paid orders for broker's products
    const paidOrders = await Order.find({ 
      productId: { $in: productIds }, 
      status: 'paid' 
    }).populate('productId', 'title price currency').populate('userId', 'name email');

    const totalEarningsUSD = paidOrders.filter(o => o.currency !== 'INR').reduce((sum, o) => sum + (o.amount || 0), 0) * 0.8;
    const totalEarningsINR = paidOrders.filter(o => o.currency === 'INR').reduce((sum, o) => sum + (o.amount || 0), 0) * 0.8;
    const totalSold = paidOrders.length;
    const activeListings = products.filter(p => p.status === 'approved').length;
    const pendingListings = products.filter(p => p.status === 'pending').length;

    // Monthly earnings for the last 12 months
    const now = new Date();
    const monthlyEarnings = [];
    for (let i = 11; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const monthOrders = paidOrders.filter(o => {
        const d = new Date(o.createdAt);
        return d >= start && d <= end;
      });
      const revenue = monthOrders.reduce((sum, o) => sum + ((o.amount || 0) * 0.8), 0);
      monthlyEarnings.push({
        month: start.toLocaleString('default', { month: 'short' }),
        year: start.getFullYear(),
        revenue: Math.round(revenue * 100) / 100,
        orders: monthOrders.length,
      });
    }

    // Top selling products
    const productSales = {};
    paidOrders.forEach(o => {
      const pid = o.productId?._id?.toString();
      if (pid) {
        if (!productSales[pid]) {
          productSales[pid] = { 
            product: o.productId, 
            sales: 0, 
            revenue: 0 
          };
        }
        productSales[pid].sales++;
        productSales[pid].revenue += (o.amount || 0) * 0.8;
      }
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)
      .map(p => ({
        _id: p.product._id,
        title: p.product.title,
        price: p.product.price,
        currency: p.product.currency || 'USD',
        sales: p.sales,
        revenue: Math.round(p.revenue * 100) / 100,
      }));

    // Recent orders
    const recentOrders = paidOrders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(o => ({
        _id: o._id,
        buyer: o.userId?.name || 'Unknown',
        buyerEmail: o.userId?.email || '',
        product: o.productId?.title || 'Unknown',
        amount: o.amount,
        currency: o.currency || 'USD',
        brokerEarnings: Math.round(o.amount * 0.8 * 100) / 100,
        date: o.createdAt,
        status: o.status,
      }));

    // Asset performance (daily sales for last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const dailyPerformance = [];
    for (let i = 29; i >= 0; i--) {
      const dayStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      const dayOrders = paidOrders.filter(o => {
        const d = new Date(o.createdAt);
        return d >= dayStart && d <= dayEnd;
      });
      dailyPerformance.push({
        date: dayStart.toISOString().split('T')[0],
        sales: dayOrders.length,
        revenue: Math.round(dayOrders.reduce((sum, o) => sum + ((o.amount || 0) * 0.8), 0) * 100) / 100,
      });
    }

    res.json({
      totalEarningsUSD: Math.round(totalEarningsUSD * 100) / 100,
      totalEarningsINR: Math.round(totalEarningsINR * 100) / 100,
      totalSold,
      activeListings,
      pendingListings,
      totalProducts: products.length,
      monthlyEarnings,
      topProducts,
      recentOrders,
      dailyPerformance,
      wallet: req.user.wallet,
      brokerStatus: req.user.brokerStatus,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get broker's products
// @route   GET /api/broker/products
// @access  Private/Broker
exports.getBrokerProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ sellerId: req.user._id })
      .sort({ createdAt: -1 });

    // Attach sales count to each product
    const productIds = products.map(p => p._id);
    const orders = await Order.find({ 
      productId: { $in: productIds }, 
      status: 'paid' 
    });

    const salesMap = {};
    orders.forEach(o => {
      const pid = o.productId.toString();
      salesMap[pid] = (salesMap[pid] || 0) + 1;
    });

    const enrichedProducts = products.map(p => {
      const obj = p.toObject();
      obj.salesCount = salesMap[p._id.toString()] || 0;
      return obj;
    });

    res.json(enrichedProducts);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all leads for a broker
// @route   GET /api/broker/leads
// @access  Private/Broker
exports.getBrokerLeads = async (req, res) => {
  try {
    const leads = await BrokerLead.find({ brokerId: req.user._id })
      .populate('studentId', 'name email')
      .sort('-createdAt');
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update broker profile details
// @route   PUT /api/broker/profile
// @access  Private/Broker
exports.updateBrokerProfile = async (req, res) => {
  try {
    const { specialization, bio } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
      user.brokerDetails.specialization = specialization || user.brokerDetails.specialization;
      user.brokerDetails.bio = bio || user.brokerDetails.bio;
      
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a lead for a broker
// @route   POST /api/broker/leads
// @access  Private
exports.createLead = async (req, res) => {
  try {
    const { brokerId, serviceType, message } = req.body;
    
    const lead = await BrokerLead.create({
      brokerId,
      studentId: req.user._id,
      serviceType,
      message
    });

    // Increment broker's total leads
    await User.findByIdAndUpdate(brokerId, {
      $inc: { 'brokerDetails.totalLeads': 1 }
    });

    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
