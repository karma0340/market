const express = require('express');
const router = express.Router();
const { sendOtp, validateOtp } = require('../controllers/verificationController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.post('/send-otp', sendOtp);
router.post('/validate-otp', validateOtp);

module.exports = router;
