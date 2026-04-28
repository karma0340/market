const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_for_dev_123', {
    expiresIn: '30d',
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'fallback_refresh_secret_for_dev_123', {
    expiresIn: '90d',
  });
};

module.exports = { generateToken, generateRefreshToken };
