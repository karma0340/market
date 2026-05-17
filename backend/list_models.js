require('dotenv').config();
const axios = require('axios');

async function listModels() {
  const apiKey = process.env.GOOGLE_API_KEY;
  try {
    const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    console.log('Available Models:');
    response.data.models.forEach(m => console.log(`- ${m.name}`));
  } catch (error) {
    console.error('Error listing models:', error.response?.data || error.message);
  }
}

listModels();
