const express = require('express');
const router = express.Router();
const { getWallet, updateCryptoWallet, requestWithdrawal, getTransactions } = require('../controllers/walletController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', protect, authorize('broker'), getWallet);
router.get('/transactions', protect, authorize('broker'), getTransactions);
router.put('/crypto-wallet', protect, authorize('broker'), updateCryptoWallet);
router.post('/withdraw', protect, authorize('broker'), requestWithdrawal);

module.exports = router;
