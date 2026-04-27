require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createStripeCheckoutSession = async (products, tempId) => {
  const line_items = products.map(product => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: product.title,
        description: product.description,
        images: product.images,
      },
      unit_amount: product.price * 100,
    },
    quantity: 1,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items,
    mode: 'payment',
    success_url: `${process.env.FRONTEND_URL}/dashboard/user?success=true`,
    cancel_url: `${process.env.FRONTEND_URL}/cart?canceled=true`,
    metadata: {
      paymentId: tempId, // This links the session to our pending orders
    },
  });

  console.log('Stripe Session Created for', products.length, 'items. Session ID:', session.id);
  return session;
};

const constructStripeEvent = (rawBody, signature) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
};

module.exports = {
  createStripeCheckoutSession,
  constructStripeEvent
};
