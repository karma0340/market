const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  paymentId: {
    type: String,
    required: false, // Initially null until payment is confirmed
  },
  paymentType: {
    type: String,
    enum: ['razorpay', 'stripe', 'crypto'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    enum: ['USD', 'INR'],
    default: 'USD',
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
