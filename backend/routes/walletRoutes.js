const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const { 
  getWallet, 
  updatePayoutMethods, 
  requestWithdrawal, 
  getTransactions
} = require('../controllers/walletController');

// All wallet routes require broker access
router.use(protect);
router.use(authorize('broker'));

router.get('/', getWallet);
router.put('/payout-methods', updatePayoutMethods);
router.get('/transactions', getTransactions);
router.post('/withdraw', requestWithdrawal);

module.exports = router;
