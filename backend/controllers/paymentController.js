const Product = require('../models/Product');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Notification = require('../models/Notification');

const { createRazorpayOrder, verifyRazorpaySignature } = require('../services/razorpayService');
const { createStripeCheckoutSession, constructStripeEvent } = require('../services/stripeService');
const { createCryptoInvoice, verifyNowPaymentsSignature } = require('../services/nowpaymentsService');

// @desc    Initiate payment for multiple products
// @route   POST /api/payments/initiate
// @access  Private/User
const initiatePayment = async (req, res, next) => {
  try {
    const { productIds, paymentType } = req.body;
    const userId = req.user._id;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0 || !paymentType) {
      res.status(400);
      return next(new Error('Please provide productIds (array) and paymentType'));
    }

    const products = await Product.find({ _id: { $in: productIds }, status: 'approved' });
    if (products.length !== productIds.length) {
      res.status(404);
      return next(new Error('One or more products not found or not approved'));
    }

    // Check if user already purchased any of these products
    const existingOrders = await Order.find({
      userId,
      productId: { $in: productIds },
      status: 'paid'
    }).populate('productId', 'title');

    if (existingOrders.length > 0) {
      const titles = existingOrders.map(o => o.productId.title).join(', ');
      res.status(400);
      return next(new Error(`You have already purchased: ${titles}`));
    }

    const USD_TO_INR = Number(process.env.USD_TO_INR_RATE) || 84;

    // Calculate totals in both currencies
    let totalUSD = 0;
    let totalINR = 0;

    products.forEach(p => {
      if (p.currency === 'INR') {
        totalINR += p.price;
        totalUSD += p.price / USD_TO_INR;
      } else {
        // Default to USD
        totalUSD += p.price;
        totalINR += p.price * USD_TO_INR;
      }
    });

    // Create pending orders for all products
    const orders = await Promise.all(products.map(product =>
      Order.create({
        userId,
        productId: product._id,
        paymentType,
        amount: product.price,
        currency: product.currency || 'USD',
        status: 'pending'
      })
    ));

    const tempPaymentId = `TEMP_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    let paymentData = {};

    console.log(`[PAYMENT] Initiating ${paymentType} for User: ${userId}. Total USD: ${totalUSD}, Total INR: ${totalINR}`);

    switch (paymentType) {
      case 'razorpay': {
        const roundedTotalINR = Math.round(totalINR);
        const totalInPaise = roundedTotalINR * 100;

        if (totalInPaise < 100) {
          res.status(400);
          return next(new Error('Minimum amount for Razorpay is ₹1 (100 paise)'));
        }

        // Razorpay often has limits (e.g., ₹5,00,000). If it's too high, let's log it.
        if (roundedTotalINR > 1000000) {
          console.warn(`[PAYMENT] Large Razorpay amount: ₹${roundedTotalINR}`);
        }

        const rzOrder = await createRazorpayOrder(roundedTotalINR, tempPaymentId);

        await Order.updateMany({ _id: { $in: orders.map(o => o._id) } }, { paymentId: rzOrder.id });

        paymentData = { pgOrderId: rzOrder.id, currency: rzOrder.currency, amount: rzOrder.amount };
        break;
      }

      case 'stripe': {
        // Stripe expects amounts in cents. createStripeCheckoutSession currently assumes products have price in USD.
        // We need to pass the normalized USD products or update the service.
        // For now, let's pass the products but the service needs to know their USD price.
        const normalizedProducts = products.map(p => ({
          ...p.toObject(),
          price: p.currency === 'INR' ? p.price / USD_TO_INR : p.price
        }));

        const session = await createStripeCheckoutSession(normalizedProducts, tempPaymentId);

        await Order.updateMany({ _id: { $in: orders.map(o => o._id) } }, { paymentId: session.id });

        paymentData = { url: session.url };
        break;
      }

      case 'crypto': {
        const invoice = await createCryptoInvoice(totalUSD, tempPaymentId, `Bulk purchase of ${products.length} items`);

        await Order.updateMany({ _id: { $in: orders.map(o => o._id) } }, { paymentId: invoice.invoice_id });

        paymentData = { invoiceUrl: invoice.invoice_url };
        break;
      }

      default:
        res.status(400);
        return next(new Error('Invalid paymentType'));
    }

    res.json({
      orderIds: orders.map(o => o._id),
      paymentType,
      ...paymentData
    });
  } catch (error) {
    console.error('Payment Initiation Error Detail:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    const message = error.response?.data?.message || error.message || 'Payment engine failure';
    res.status(500).json({ message });
  }
};

// Helper function to handle commission split and wallet updates on successful payment
const processSuccessfulPayment = async (paymentId, actualPGId) => {
  // Find all orders linked to this payment ID
  const orders = await Order.find({ paymentId, status: 'pending' }).populate('productId');

  if (orders.length === 0) {
    console.log(`[PAYMENT] No pending orders found for paymentId: ${paymentId}`);
    return;
  }

  const COMMISSION_PERCENTAGE = Number(process.env.COMMISSION_PERCENTAGE) || 20;

  for (const order of orders) {
    order.status = 'paid';
    if (actualPGId) {
      order.paymentId = actualPGId; // Update to actual payment ID if provided
    }
    await order.save();

    // Commission System
    const platformFee = (order.amount * COMMISSION_PERCENTAGE) / 100;
    const sellerEarnings = order.amount - platformFee;

    // Convert to USD if needed for the wallet balance (Assuming wallet is in USD)
    const USD_TO_INR = Number(process.env.USD_TO_INR_RATE) || 84;
    const sellerEarningsInUSD = order.currency === 'INR' ? sellerEarnings / USD_TO_INR : sellerEarnings;

    // Update Broker Wallet
    const sellerId = order.productId.sellerId;
    const seller = await User.findById(sellerId);
    if (seller) {
      seller.wallet.pending += sellerEarningsInUSD;
      await seller.save();
    }

    // Record Transactions
    await Transaction.create([
      {
        userId: order.userId,
        amount: order.amount,
        type: 'payment',
        status: 'completed',
        note: `Payment for ${order.productId.title}`
      },
      {
        userId: sellerId,
        amount: sellerEarnings,
        type: 'commission',
        status: 'completed',
        note: `Commission from ${order.productId.title}`
      }
    ]);

    // Send Notification to Broker
    await Notification.create({
      type: 'product_sold',
      title: 'Asset Sold!',
      message: `Your asset "${order.productId.title}" has been sold. You earned $${sellerEarningsInUSD.toFixed(2)}.`,
      forRole: 'broker',
      forUser: sellerId,
      data: { orderId: order._id, amount: sellerEarningsInUSD }
    });

    // Send Notification to Admin
    await Notification.create({
      type: 'new_order',
      title: 'New Order Completed',
      message: `User purchased "${order.productId.title}". Platform earned $${platformFee.toFixed(2)}.`,
      forRole: 'admin',
      data: { orderId: order._id, platformFee }
    });
  }

  console.log(`[PAYMENT] Successfully processed ${orders.length} orders for paymentId: ${paymentId}`);
};

// @desc    Verify Razorpay payment (Client-side trigger)
// @route   POST /api/payments/razorpay/verify
// @access  Private/User
const verifyRazorpay = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400);
      return next(new Error('Missing required Razorpay fields'));
    }

    const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isValid) {
      res.status(400);
      return next(new Error('Invalid Razorpay signature'));
    }

    await processSuccessfulPayment(razorpay_order_id, razorpay_payment_id);
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
    const paymentId = session.metadata.paymentId;
    // For Stripe, we use the session.id as the final paymentId in DB
    await processSuccessfulPayment(paymentId, session.id);
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

// @desc    Razorpay Webhook
// @route   POST /api/payments/razorpay/webhook
// @access  Public
const razorpayWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature using the raw body
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(req.body) // req.body is a Buffer from express.raw()
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('[RAZORPAY] Invalid webhook signature');
      return res.status(400).send('Invalid signature');
    }

    // Now parse the body since we used express.raw()
    const body = JSON.parse(req.body.toString());
    const { event, payload } = body;

    if (event === 'order.paid') {
      const rzOrder = payload.order.entity;
      console.log(`[RAZORPAY] Webhook received: order.paid for ${rzOrder.id}`);
      await processSuccessfulPayment(rzOrder.id, payload.payment.entity.id);
    }

    res.send({ status: 'ok' });
  } catch (error) {
    console.error('Razorpay Webhook Error:', error);
    res.status(500).send('Webhook failed');
  }
};

module.exports = {
  initiatePayment,
  verifyRazorpay,
  stripeWebhook,
  razorpayWebhook,
  nowpaymentsWebhook
};
