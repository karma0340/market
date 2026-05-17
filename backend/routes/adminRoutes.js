const express = require('express');
const router = express.Router();
const { 
  getDashboardStats,
  getPendingBrokers,
  getAllBrokers,
  approveBroker,
  rejectBroker,
  getPendingProducts,
  getAllProducts,
  updateProductStatus,
  deleteProduct,
  getWithdrawalRequests, 
  approveWithdrawal,
  getUsers,
  getAllOrders,
  generateInvoice
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect, authorize('admin')); // Apply to all routes below

// Dashboard
router.get('/stats', getDashboardStats);

// Broker approval
router.get('/brokers/pending', getPendingBrokers);
router.get('/brokers', getAllBrokers);
router.put('/brokers/:id/approve', approveBroker);
router.put('/brokers/:id/reject', rejectBroker);

// Products
router.get('/products/pending', getPendingProducts);
router.get('/products', getAllProducts);
router.put('/products/:id/status', updateProductStatus);
router.delete('/products/:id', deleteProduct);

// Withdrawals
router.get('/withdrawals', getWithdrawalRequests);
router.put('/withdrawals/:id/approve', approveWithdrawal);

// Orders
router.get('/orders', getAllOrders);
router.get('/orders/:id/invoice', generateInvoice);

// Users
router.get('/users', getUsers);

module.exports = router;
