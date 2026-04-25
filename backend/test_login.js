const axios = require('axios');

const testLogin = async () => {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'seller@gmail.com',
      password: 'seller123'
    });
    console.log('Login Success:', res.data);
  } catch (error) {
    console.log('Login Failed:', error.response ? error.response.data : error.message);
  }
};

testLogin();
