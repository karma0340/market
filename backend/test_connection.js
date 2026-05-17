const axios = require('axios');
const url = 'http://127.0.0.1:8000/api/auth/send-otp';
console.log('Testing connection to:', url);
axios.post(url, { mobile_number: '9876543210' })
  .then(res => console.log('Success:', res.data))
  .catch(err => {
    console.error('Error:', err.message);
    if (err.response) {
      console.error('Response Status:', err.response.status);
      console.error('Response Data:', err.response.data);
    }
  });
