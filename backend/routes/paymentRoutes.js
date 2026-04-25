const express = require('express');
const router = express.Router();
const { 
  initiatePayment, 
  verifyRazorpay, 
  stripeWebhook, 
  nowpaymentsWebhook 
} = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/initiate', protect, initiatePayment);
router.post('/razorpay/verify', protect, verifyRazorpay);

// Webhooks
// Stripe webhook is handled directly in server.js to preserve raw body
router.post('/nowpayments/webhook', express.json(), nowpaymentsWebhook);

module.exports = router;
