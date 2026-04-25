const axios = require('axios');
const crypto = require('crypto');

const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';

const createCryptoInvoice = async (priceInUSD, orderId, orderDescription) => {
  try {
    const response = await axios.post(`${NOWPAYMENTS_API_URL}/invoice`, {
      price_amount: priceInUSD,
      price_currency: 'usd',
      order_id: orderId,
      order_description: orderDescription,
      success_url: `${process.env.FRONTEND_URL}/payment/success?order_id=${orderId}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel?order_id=${orderId}`,
    }, {
      headers: {
        'x-api-key': process.env.NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    return response.data; // contains invoice_url
  } catch (error) {
    console.error('NOWPayments Error:', error.response ? error.response.data : error.message);
    throw new Error('Failed to create crypto invoice');
  }
};

const verifyNowPaymentsSignature = (signature, body) => {
  const hmac = crypto.createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET || process.env.NOWPAYMENTS_API_KEY);
  hmac.update(JSON.stringify(body, Object.keys(body).sort()));
  const expectedSignature = hmac.digest('hex');
  return expectedSignature === signature;
};

const executeCryptoPayout = async (address, amountUsd, currency = 'usdttrc20') => {
  try {
    const response = await axios.post(
      `${NOWPAYMENTS_API_URL}/payout`,
      {
        ipn_callback_url: `${process.env.BACKEND_URL || 'https://market-backend-7gxi.onrender.com'}/api/payments/nowpayments/webhook`,
        withdrawals: [
          {
            address: address,
            currency: currency,
            amount: amountUsd,
          }
        ]
      },
      {
        headers: {
          'x-api-key': process.env.NOWPAYMENTS_API_KEY,
          'Authorization': `Bearer ${process.env.NOWPAYMENTS_JWT_TOKEN || ''}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`[NOWPayments] Payout initiated:`, response.data);
    return response.data;
  } catch (error) {
    console.error('NOWPayments Payout Error:', error.response ? error.response.data : error.message);
    throw new Error('Failed to execute crypto payout: ' + (error.response?.data?.message || error.message));
  }
};

module.exports = {
  createCryptoInvoice,
  verifyNowPaymentsSignature,
  executeCryptoPayout
};
