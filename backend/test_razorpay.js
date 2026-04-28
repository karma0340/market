require('dotenv').config();
const Razorpay = require('razorpay');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const testRazorpay = async () => {
  try {
    const orders = await razorpayInstance.orders.all({ count: 1 });
    console.log('Success! Razorpay credentials are valid. Found', orders.items.length, 'orders.');
  } catch (error) {
    console.log('Razorpay Error:', error.message);
  }
};

testRazorpay();
