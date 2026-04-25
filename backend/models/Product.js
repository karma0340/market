const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a product title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
  },
  images: [{
    type: String,
    required: true,
  }],
  filePath: {
    type: String,
    required: [true, 'Please provide the file path for the digital asset'],
    select: false, // Don't return the raw filePath in regular queries for security
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  demoUrl: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    enum: ['templates', 'courses', 'software', 'assets'],
    default: 'assets',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
