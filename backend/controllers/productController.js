const Product = require('../models/Product');
const Order = require('../models/Order');
const path = require('path');
const fs = require('fs');
const { processNotes } = require('../services/aiService');
const storageService = require('../services/storageService');

// @desc    Create a product with local file upload
// @route   POST /api/products
// @access  Private/Broker
const createProduct = async (req, res, next) => {
  try {
    const { title, description, price, currency, images, category, demoUrl } = req.body;

    const productFile = req.files && req.files['productFile'] ? req.files['productFile'][0] : null;
    const productImages = req.files && req.files['productImages'] ? req.files['productImages'] : [];
    const githubRepo = req.body.githubRepo;

    if (!productFile && !githubRepo) {
      res.status(400);
      return next(new Error('Please upload a product file or provide a GitHub repository link'));
    }

    // Save master file (ZIP/PDF) or use GitHub URL
    const filePath = githubRepo ? githubRepo : await storageService.saveFile(productFile);

    // Process images: optimize and convert to WebP
    let finalImages = [];
    
    // Add file upload paths (optimized)
    if (productImages.length > 0) {
      const optimizedImages = await Promise.all(
        productImages.map(img => storageService.optimizeImage(img))
      );
      finalImages = optimizedImages;
    }

    // Add JSON provided images if any
    if (images) {
      let parsedImages = images;
      if (typeof images === 'string') {
        try {
          parsedImages = JSON.parse(images);
        } catch(e) {
          parsedImages = [images];
        }
      }
      const extraImages = Array.isArray(parsedImages) ? parsedImages : [parsedImages];
      // Filter out empty strings or duplicates if needed
      finalImages = [...finalImages, ...extraImages.filter(img => img && !img.startsWith('data:'))]; 
    }

    const product = await Product.create({
      title,
      description,
      price: Number(price),
      images: finalImages,
      filePath,
      category,
      demoUrl,
      currency: currency || 'USD',
      sellerId: req.user._id,
      status: 'approved' 
    });

    // --- AI SMART NOTES TRIGGER ---
    if (category === 'notes') {
      // Process AI in background so user doesn't wait
      processNotes(title, description).then(async (metadata) => {
        await Product.findByIdAndUpdate(product._id, {
          aiMetadata: { ...metadata, isProcessed: true }
        });
        console.log(`AI: Smart content generated for "${title}"`);
      }).catch(err => console.error('AI Processing Background Error:', err));
    }

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

    if (product.filePath.startsWith('http://') || product.filePath.startsWith('https://')) {
      return res.json({ downloadUrl: product.filePath, isExternal: true });
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

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Broker
const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      return next(new Error('Product not found'));
    }

    // Make sure user is product owner
    if (product.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(401);
      return next(new Error('User not authorized to update this product'));
    }

    const { title, description, price, currency, images, category, demoUrl } = req.body;

    // Handle Files from upload.fields
    const productFile = req.files && req.files['productFile'] ? req.files['productFile'][0] : null;
    const productImages = req.files && req.files['productImages'] ? req.files['productImages'] : [];
    const githubRepo = req.body.githubRepo;

    const updateData = {
      title: title || product.title,
      description: description || product.description,
      price: price ? Number(price) : product.price,
      currency: currency || product.currency,
      category: category || product.category,
      demoUrl: demoUrl !== undefined ? demoUrl : product.demoUrl,
    };

    // Update images
    let finalImages = [...product.images];
    
    if (productImages.length > 0) {
      const optimizedImages = await Promise.all(
        productImages.map(img => storageService.optimizeImage(img))
      );
      finalImages = [...finalImages, ...optimizedImages];
    }

    if (images) {
      let parsedImages = images;
      if (typeof images === 'string') {
        try {
          parsedImages = JSON.parse(images);
        } catch (e) {
          parsedImages = [images];
        }
      }
      const extraImages = Array.isArray(parsedImages) ? parsedImages : [parsedImages];
      finalImages = [...finalImages, ...extraImages.filter(img => img && !img.startsWith('data:'))];
    }
    
    updateData.images = finalImages;

    // Handle File Update
    if (githubRepo) {
      if (product.filePath && !product.filePath.startsWith('http') && fs.existsSync(product.filePath)) {
        fs.unlink(product.filePath, (err) => {
          if (err) console.error('Failed to delete old file during update', err);
        });
      }
      updateData.filePath = githubRepo;
    } else if (productFile) {
      // Delete old file if it exists
      if (product.filePath && !product.filePath.startsWith('http') && fs.existsSync(product.filePath)) {
        fs.unlink(product.filePath, (err) => {
          if (err) console.error('Failed to delete old file during update', err);
        });
      }
      updateData.filePath = productFile.path;
    }

    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json(product);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  downloadProductFile,
  updateProduct
};
