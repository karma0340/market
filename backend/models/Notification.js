const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['broker_request', 'broker_approved', 'broker_rejected', 'product_submitted', 'product_approved', 'product_rejected', 'new_sale', 'withdrawal_request', 'withdrawal_approved', 'system'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  // Who this notification is for
  forUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  // null forUser + forRole means it's for all users of that role
  forRole: {
    type: String,
    enum: ['user', 'broker', 'admin', null],
    default: null,
  },
  // Who triggered this notification
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true
});

// Index for fast queries
notificationSchema.index({ forUser: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ forRole: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
