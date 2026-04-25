const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updatePayoutSettings } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/payout-settings', protect, updatePayoutSettings);

module.exports = router;
