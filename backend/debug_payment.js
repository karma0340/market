const axios = require('axios');
require('dotenv').config();

const debugInitiate = async () => {
  try {
    // 1. Login to get token
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'buyer@gmail.com',
      password: 'buyer123'
    });
    const token = loginRes.data.token;
    console.log('Login Success.');

    // 2. Get first approved product
    const productsRes = await axios.get('http://localhost:5000/api/products');
    if (productsRes.data.length === 0) {
      console.log('No approved products found.');
      return;
    }
    const productId = productsRes.data[0]._id;
    console.log('Using Product ID:', productId);

    // 3. Initiate payment
    const initiateRes = await axios.post('http://localhost:5000/api/payments/initiate', {
      productId: productId,
      paymentType: 'stripe'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Initiate Success:', initiateRes.data);
  } catch (error) {
    console.log('Error Status:', error.response?.status);
    console.log('Error Data:', error.response?.data);
  }
};

debugInitiate();
