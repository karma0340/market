const axios = require('axios');
const User = require('../models/User');
const Notification = require('../models/Notification');

const ISP_BASE_URL = process.env.ISP_API_URL || 'http://127.0.0.1:8000';

// @desc    Send OTP via ISP service
// @route   POST /api/verify/send-otp
// @access  Private/Broker
const sendOtp = async (req, res, next) => {
  try {
    const { mobileNumber } = req.body;
    if (!mobileNumber) {
      res.status(400);
      return next(new Error('Mobile number is required'));
    }

    console.log(`Attempting to send OTP to ${mobileNumber} via ${ISP_BASE_URL}...`);

    // Call FastAPI service
    const response = await axios.post(`${ISP_BASE_URL}/api/auth/send-otp`, {
      mobile_number: mobileNumber
    });

    console.log('ISP Response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('ISP Send OTP Error Details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    res.status(error.response?.status || 500);
    next(new Error(error.response?.data?.detail || error.message || 'Failed to send OTP via ISP service'));
  }
};

// @desc    Validate OTP and fetch profile
// @route   POST /api/verify/validate-otp
// @access  Private/Broker
const validateOtp = async (req, res, next) => {
  try {
    const { mobileNumber, otp, operator } = req.body;
    if (!mobileNumber || !otp) {
      res.status(400);
      return next(new Error('Mobile number and OTP are required'));
    }

    // Call FastAPI service to validate
    const validateRes = await axios.post(`${ISP_BASE_URL}/api/auth/verify-otp`, {
      mobile_number: mobileNumber,
      otp: otp
    });

    if (validateRes.data.status === 'success') {
      // Fetch full profile data
      let profileData = {};
      try {
        const op = (operator || validateRes.data.operator || '').toLowerCase();
        let profileEndpoint = '';
        
        if (op.includes('jio')) profileEndpoint = `/api/jio/profile/${mobileNumber}`;
        else if (op.includes('airtel')) profileEndpoint = `/api/airtel/profile/${mobileNumber}`;
        else if (op.includes('vi')) profileEndpoint = `/api/vi/profile/${mobileNumber}`;

        if (profileEndpoint) {
          const profileRes = await axios.get(`${ISP_BASE_URL}${profileEndpoint}`);
          profileData = profileRes.data;
        }
      } catch (profileErr) {
        console.error('Failed to fetch ISP profile:', profileErr.message);
      }

      // Update user model
      const user = await User.findById(req.user._id);
      user.phone = mobileNumber;
      user.isPhoneVerified = true;
      user.verificationData = {
        operator: operator || validateRes.data.operator,
        profileData: profileData,
        verifiedAt: new Date()
      };
      await user.save();

      // Notify admin about verification
      await Notification.create({
        type: 'system',
        title: 'Broker Identity Verified',
        message: `${user.name} has verified their identity via ${operator || validateRes.data.operator}.`,
        forRole: 'admin',
        fromUser: user._id,
        data: { userId: user._id, operator: operator || validateRes.data.operator }
      });

      res.json({
        message: 'Identity verified successfully',
        operator: operator || validateRes.data.operator,
        profile: profileData
      });
    } else {
      res.status(400).json({ message: 'Invalid OTP or verification failed' });
    }
  } catch (error) {
    console.error('ISP Validate OTP Error Details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    res.status(error.response?.status || 500);
    next(new Error(error.response?.data?.detail || error.message || 'Failed to validate OTP'));
  }
};

module.exports = { sendOtp, validateOtp };
