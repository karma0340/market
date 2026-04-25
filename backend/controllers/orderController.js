const Order = require('../models/Order');

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private/User
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).populate('productId', 'title price images');
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private/User
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('productId', 'title price images');
    
    if (order && order.userId.toString() === req.user._id.toString()) {
      res.json(order);
    } else {
      res.status(404);
      return next(new Error('Order not found'));
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyOrders,
  getOrderById,
};
