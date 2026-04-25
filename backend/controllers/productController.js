const Product = require('../models/Product');
const Order = require('../models/Order');
const path = require('path');
const fs = require('fs');

// @desc    Create a product with local file upload
// @route   POST /api/products
// @access  Private/Broker
const createProduct = async (req, res, next) => {
  try {
    const { title, description, price, images, category, demoUrl } = req.body;
    
    if (!req.file) {
      res.status(400);
      return next(new Error('Please upload a product file'));
    }

    // Save relative path to DB so we can locate it easily later
    const filePath = req.file.path;

    // Parse images if it's sent as a JSON string from FormData
    let parsedImages = images;
    if (typeof images === 'string') {
      try {
        parsedImages = JSON.parse(images);
      } catch(e) {
        // If it's a single string URL not in JSON array format
        parsedImages = [images];
      }
    }

    const product = await Product.create({
      title,
      description,
      price: Number(price),
      images: Array.isArray(parsedImages) ? parsedImages : [parsedImages],
      filePath,
      category,
      demoUrl,
      sellerId: req.user._id,
      status: 'approved' // Automatically approve for now to make it easier for the user
    });

    res.status(201).json(product);
  } catch (error) {
    // Clean up uploaded file if product creation fails
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Failed to delete file after error', err);
      });
    }
    next(error);
  }
};

// @desc    Get all approved products (Public listing)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ status: 'approved' })
      .populate('sellerId', 'name')
      .select('-filePath'); // Do not expose filePath publicly
      
    res.json(products);
  } catch (error) {
    next(error);
  }
};

// @desc    Get product details by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('sellerId', 'name')
      .select('-filePath');

    if (product) {
      res.json(product);
    } else {
      res.status(404);
      return next(new Error('Product not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Securely download a purchased product
// @route   GET /api/products/:id/download
// @access  Private/User
const downloadProductFile = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const userId = req.user._id;

    // Verify if user actually bought this product
    const order = await Order.findOne({
      userId,
      productId,
      status: 'paid'
    });

    if (!order) {
      res.status(403);
      return next(new Error('Access denied. You have not purchased this product.'));
    }

    const product = await Product.findById(productId).select('+filePath');
    if (!product || !product.filePath) {
      res.status(404);
      return next(new Error('Product file not found'));
    }

    const absolutePath = path.resolve(product.filePath);
    
    // Check if file exists on disk
    if (!fs.existsSync(absolutePath)) {
      res.status(404);
      return next(new Error('File is missing from server storage'));
    }

    res.download(absolutePath, `${product.title}.zip`, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  downloadProductFile
};
