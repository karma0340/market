const express = require('express');
const router = express.Router();
const { 
  createProduct, 
  getProducts, 
  getProductById, 
  downloadProductFile 
} = require('../controllers/productController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.route('/')
  .get(getProducts)
  .post(protect, authorize('broker'), upload.single('productFile'), createProduct);

router.route('/:id')
  .get(getProductById);

router.get('/:id/download', protect, downloadProductFile);

module.exports = router;
