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
    required: function() {
      return this.authProvider === 'local';
    },
    select: false, // Don't return password by default
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'github'],
    default: 'local'
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  githubId: {
    type: String,
    sparse: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['user', 'broker', 'admin'],
    default: 'user',
  },
  brokerStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none',
  },
  rejectionReason: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: null,
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  verificationData: {
    operator: { type: String, default: null },
    profileData: { type: mongoose.Schema.Types.Mixed, default: null },
    verifiedAt: { type: Date, default: null },
  },
  avatar: {
    type: String,
    default: null,
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
  payoutMethods: {
    crypto: {
      address: { type: String, default: null },
      currency: { type: String, default: 'usdttrc20' }
    },
    gpay: { type: String, default: null },
    upi: { type: String, default: null },
    paypal: { type: String, default: null },
    bankTransfer: {
      accountName: { type: String, default: null },
      accountNumber: { type: String, default: null },
      ifscCode: { type: String, default: null },
      bankName: { type: String, default: null }
    }
  },
  brokerDetails: {
    specialization: { type: String, enum: ['housing', 'gadgets', 'notes', 'tutoring', 'repairs', 'other'], default: 'other' },
    bio: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    totalLeads: { type: Number, default: 0 },
    verifiedCampus: { type: Boolean, default: false }
  },
  registrationIp: {
    type: String,
    default: null,
  },
  lastIp: {
    type: String,
    default: null,
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
