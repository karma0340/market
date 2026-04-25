const Product = require('../models/Product');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

const { createRazorpayOrder, verifyRazorpaySignature } = require('../services/razorpayService');
const { createStripeCheckoutSession, constructStripeEvent } = require('../services/stripeService');
const { createCryptoInvoice, verifyNowPaymentsSignature } = require('../services/nowpaymentsService');

// @desc    Initiate payment for a product
// @route   POST /api/payments/initiate
// @access  Private/User
const initiatePayment = async (req, res, next) => {
  try {
    const { productId, paymentType } = req.body;
    const userId = req.user._id;

    if (!productId || !paymentType) {
      res.status(400);
      return next(new Error('Please provide productId and paymentType'));
    }

    const product = await Product.findById(productId);
    if (!product || product.status !== 'approved') {
      res.status(404);
      return next(new Error('Product not found or not approved'));
    }

    // Check if user already purchased this product
    const existingOrder = await Order.findOne({ userId, productId, status: 'paid' });
    if (existingOrder) {
      res.status(400);
      return next(new Error('You have already purchased this product'));
    }

    // Create a pending order
    const order = await Order.create({
      userId,
      productId,
      paymentType,
      amount: product.price,
      status: 'pending'
    });

    let paymentData = {};

    switch (paymentType) {
      case 'razorpay':
        // Assuming product.price is in INR
        const rzOrder = await createRazorpayOrder(product.price, order._id.toString());
        order.paymentId = rzOrder.id; // Store Razorpay order ID temporarily
        await order.save();
        paymentData = { pgOrderId: rzOrder.id, currency: rzOrder.currency, amount: rzOrder.amount };
        break;

      case 'stripe':
        const session = await createStripeCheckoutSession(product, order._id.toString());
        order.paymentId = session.id;
        await order.save();
        paymentData = { url: session.url };
        break;

      case 'crypto':
        // Assuming price is USD equivalent
        const invoice = await createCryptoInvoice(product.price, order._id.toString(), `Payment for ${product.title}`);
        order.paymentId = invoice.invoice_id;
        await order.save();
        paymentData = { invoiceUrl: invoice.invoice_url };
        break;

      default:
        res.status(400);
        return next(new Error('Invalid paymentType'));
    }

    res.json({
      orderId: order._id,
      paymentType,
      ...paymentData
    });
  } catch (error) {
    console.error('Payment Initiation Error:', error);
    const message = error.response?.data?.message || error.message || 'Payment engine failure';
    res.status(500).json({ message });
  }
};

// Helper function to handle commission split and wallet updates on successful payment
const processSuccessfulPayment = async (orderId, actualPaymentId) => {
  const order = await Order.findById(orderId).populate('productId');
  if (!order || order.status === 'paid') return; // Already processed

  order.status = 'paid';
  if (actualPaymentId) {
    order.paymentId = actualPaymentId;
  }
  await order.save();

  // Commission System (20% platform fee)
  const COMMISSION_PERCENTAGE = Number(process.env.COMMISSION_PERCENTAGE) || 20;
  const platformFee = (order.amount * COMMISSION_PERCENTAGE) / 100;
  const sellerEarnings = order.amount - platformFee;

  // Update Broker Wallet (Add to pending for 7-day clearance)
  const sellerId = order.productId.sellerId;
  const seller = await User.findById(sellerId);
  if (seller) {
    seller.wallet.pending += sellerEarnings;
    await seller.save();
  }

  // Record Transactions
  await Transaction.create([
    {
      userId: order.userId,
      amount: order.amount,
      type: 'payment',
      status: 'completed'
    },
    {
      userId: sellerId,
      amount: sellerEarnings,
      type: 'commission',
      status: 'completed'
    }
  ]);
};

// @desc    Verify Razorpay payment
// @route   POST /api/payments/razorpay/verify
// @access  Private/User
const verifyRazorpay = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = req.body;

    const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isValid) {
      res.status(400);
      return next(new Error('Invalid signature'));
    }

    await processSuccessfulPayment(dbOrderId, razorpay_payment_id);
    res.json({ success: true, message: 'Payment verified successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Stripe Webhook
// @route   POST /api/payments/stripe/webhook
// @access  Public
const stripeWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // req.body must be raw for Stripe webhook verification
    event = constructStripeEvent(req.body, sig);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata.orderId;
    await processSuccessfulPayment(orderId, session.id);
  }

  res.send();
};

// @desc    NOWPayments Webhook (IPN)
// @route   POST /api/payments/nowpayments/webhook
// @access  Public
const nowpaymentsWebhook = async (req, res, next) => {
  try {
    const sig = req.headers['x-nowpayments-sig'];
    if (!sig) return res.status(400).send('No signature');

    const isValid = verifyNowPaymentsSignature(sig, req.body);
    if (!isValid) return res.status(400).send('Invalid signature');

    const { payment_status, order_id, payment_id } = req.body;

    if (payment_status === 'finished') {
      await processSuccessfulPayment(order_id, payment_id);
    }

    res.send();
  } catch (error) {
    console.error('NOWPayments Webhook Error:', error);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  initiatePayment,
  verifyRazorpay,
  stripeWebhook,
  nowpaymentsWebhook
};
