const express = require('express');
const router = express.Router();
const { 
  createProduct, 
  getProducts, 
  getProductById, 
  downloadProductFile,
  updateProduct
} = require('../controllers/productController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.route('/')
  .get(getProducts)
  .post(protect, authorize('broker'), upload.fields([
    { name: 'productFile', maxCount: 1 },
    { name: 'productImages', maxCount: 10 }
  ]), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, authorize('broker'), upload.fields([
    { name: 'productFile', maxCount: 1 },
    { name: 'productImages', maxCount: 10 }
  ]), updateProduct);

router.get('/:id/download', protect, downloadProductFile);

module.exports = router;
