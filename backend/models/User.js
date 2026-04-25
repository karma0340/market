const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    select: false, // Don't return password by default
  },
  role: {
    type: String,
    enum: ['user', 'broker', 'admin'],
    default: 'user',
  },
  wallet: {
    balance: {
      type: Number,
      default: 0,
    },
    pending: {
      type: Number,
      default: 0,
    }
  },
  payoutMethod: {
    type: String, // e.g., 'upi:user@upi', 'crypto:0x...', 'bank:acc_number'
    default: null
  },
  cryptoWallet: {
    address: { type: String, default: null },
    currency: { type: String, default: 'usdttrc20' } // USDT on TRC20 network by default
  }
}, {
  timestamps: true
});

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
