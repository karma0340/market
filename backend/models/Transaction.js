const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['payment', 'commission', 'withdrawal'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed',
  },
  isCleared: {
    type: Boolean,
    default: false
  },
  note: {
    type: String,
    default: null
  },
  payoutAddress: {
    type: String,
    default: null
  },
  payoutCurrency: {
    type: String,
    default: null
  },
  payoutTxId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
