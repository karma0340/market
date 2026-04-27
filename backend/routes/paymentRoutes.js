const express = require('express');
const router = express.Router();
const { 
  initiatePayment, 
  verifyRazorpay, 
  razorpayWebhook,
  stripeWebhook, 
  nowpaymentsWebhook 
} = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/initiate', protect, initiatePayment);
router.post('/razorpay/verify', protect, verifyRazorpay);

// Webhooks
// Stripe & Razorpay webhooks are handled directly in server.js to preserve raw body or for consistency
router.post('/razorpay/webhook', razorpayWebhook);
router.post('/nowpayments/webhook', express.json(), nowpaymentsWebhook);

module.exports = router;
