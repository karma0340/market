const express = require('express');
const router = express.Router();
const { 
  getPendingProducts,
  getAllProducts,
  updateProductStatus,
  deleteProduct,
  getWithdrawalRequests, 
  approveWithdrawal,
  getUsers,
  getAllOrders 
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect, authorize('admin')); // Apply to all routes below

router.get('/products/pending', getPendingProducts);
router.get('/products', getAllProducts);
router.put('/products/:id/status', updateProductStatus);
router.delete('/products/:id', deleteProduct);

router.get('/withdrawals', getWithdrawalRequests);
router.put('/withdrawals/:id/approve', approveWithdrawal);

router.get('/orders', getAllOrders);

router.get('/users', getUsers);

module.exports = router;
