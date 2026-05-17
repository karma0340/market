const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateProfile,
  updatePayoutSettings, 
  googleAuth,
  githubAuth,
  changePassword
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.post('/github', githubAuth);
router.route('/profile').get(protect, getUserProfile).put(protect, updateProfile);
router.put('/payout-settings', protect, updatePayoutSettings);
router.put('/change-password', protect, changePassword);

module.exports = router;
