/**
 * cleanFakeOrders.js
 * 
 * One-time script to delete fake/test orders from the database.
 * Real Razorpay payment IDs always start with "pay_" (e.g. pay_QXxxxxxx)
 * 
 * Usage:
 *   node scripts/cleanFakeOrders.js          → dry run (shows what would be deleted)
 *   node scripts/cleanFakeOrders.js --delete  → actually deletes the fake orders
 */

require('dotenv').config();
const mongoose = require('mongoose');
// Must require all models so Mongoose registers their schemas before populate() runs
require('../models/User');
require('../models/Product');
const Order = require('../models/Order');

const DRY_RUN = !process.argv.includes('--delete');

// ✅ Only these two payment IDs will be KEPT — all others will be deleted
const KEEP_PAYMENT_IDS = [
  'pay_SlESlEpASBCui4', // ₹48,000 - real Razorpay payment
  'pay_SitSFtVaQIuGRP', // $0.011  - real Razorpay payment
];

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  // Fetch all paid orders
  const allOrders = await Order.find({ status: 'paid' })
    .populate('productId', 'title')
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });

  console.log(`📦 Total paid orders found: ${allOrders.length}\n`);
  console.log('─'.repeat(100));
  console.log(
    'No.'.padEnd(5) +
    'ID'.padEnd(28) +
    'PaymentID'.padEnd(30) +
    'Amount'.padEnd(12) +
    'Currency'.padEnd(10) +
    'Type'.padEnd(12) +
    'REAL?'
  );
  console.log('─'.repeat(100));

  const realOrders = [];
  const fakeOrders = [];

  allOrders.forEach((o, idx) => {
    // Keep only the explicitly confirmed real payment IDs
    const isReal = KEEP_PAYMENT_IDS.includes(o.paymentId);
    const label = isReal ? '✅ REAL' : '❌ FAKE';

    console.log(
      `${String(idx + 1).padEnd(5)}` +
      `${o._id.toString().padEnd(28)}` +
      `${(o.paymentId || 'N/A').padEnd(30)}` +
      `${String(o.amount).padEnd(12)}` +
      `${(o.currency || 'USD').padEnd(10)}` +
      `${(o.paymentType || '').padEnd(12)}` +
      label
    );

    if (isReal) {
      realOrders.push(o);
    } else {
      fakeOrders.push(o);
    }
  });

  console.log('─'.repeat(100));
  console.log(`\n✅ Real orders (KEEPING): ${realOrders.length}`);
  console.log(`❌ Fake orders (TO DELETE): ${fakeOrders.length}\n`);

  if (fakeOrders.length === 0) {
    console.log('🎉 No fake orders found. Nothing to delete.');
    await mongoose.disconnect();
    return;
  }

  if (DRY_RUN) {
    console.log('🔍 DRY RUN — no changes made.');
    console.log('   Run with --delete flag to actually delete fake orders:\n');
    console.log('   node scripts/cleanFakeOrders.js --delete\n');
  } else {
    const fakeIds = fakeOrders.map(o => o._id);
    const result = await Order.deleteMany({ _id: { $in: fakeIds } });
    console.log(`🗑️  Deleted ${result.deletedCount} fake orders from the database.`);
  }

  await mongoose.disconnect();
  console.log('✅ Done. Disconnected from MongoDB.');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
