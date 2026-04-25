require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const testKey = async () => {
  try {
    const customers = await stripe.customers.list({ limit: 1 });
    console.log('Success! Key is valid. Found', customers.data.length, 'customers.');
  } catch (error) {
    console.log('Stripe Error:', error.message);
    console.log('Key used:', process.env.STRIPE_SECRET_KEY.substring(0, 10) + '...' + process.env.STRIPE_SECRET_KEY.slice(-5));
  }
};

testKey();
