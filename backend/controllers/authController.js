const User = require('../models/User');
const Notification = require('../models/Notification');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');
const { z } = require('zod');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['user', 'broker']).optional(),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { name, email, password, role, phone } = validatedData;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      return next(new Error('User already exists'));
    }

    const isBroker = role === 'broker';
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      brokerStatus: isBroker ? 'pending' : 'none',
      phone: phone || null,
      registrationIp: clientIp,
      lastIp: clientIp,
    });

    if (user) {
      // If broker, notify all admins
      if (isBroker) {
        await Notification.create({
          type: 'broker_request',
          title: 'New Broker Application',
          message: `${name} (${email}) has applied to become a broker and is awaiting approval.`,
          forRole: 'admin',
          fromUser: user._id,
          data: { userId: user._id, userName: name, userEmail: email, phone },
        });
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        brokerStatus: user.brokerStatus,
        token: generateToken(user._id),
        refreshToken: generateRefreshToken(user._id)
      });
    } else {
      res.status(400);
      return next(new Error('Invalid user data'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      user.lastIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
      await user.save({ validateBeforeSave: false });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        brokerStatus: user.brokerStatus,
        token: generateToken(user._id),
        refreshToken: generateRefreshToken(user._id)
      });
    } else {
      res.status(401);
      return next(new Error('Invalid email or password'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        brokerStatus: user.brokerStatus,
        phone: user.phone,
        isPhoneVerified: user.isPhoneVerified,
        avatar: user.avatar,
        wallet: user.wallet,
        payoutMethod: user.payoutMethod,
        brokerDetails: user.brokerDetails,
        createdAt: user.createdAt,
      });
    } else {
      res.status(404);
      return next(new Error('User not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    const { name, phone, avatar, brokerDetails } = req.body;
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (brokerDetails) {
      if (brokerDetails.specialization) user.brokerDetails.specialization = brokerDetails.specialization;
      if (brokerDetails.bio) user.brokerDetails.bio = brokerDetails.bio;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      brokerStatus: updatedUser.brokerStatus,
      phone: updatedUser.phone,
      avatar: updatedUser.avatar,
      wallet: updatedUser.wallet,
      brokerDetails: updatedUser.brokerDetails,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update payout settings
// @route   PUT /api/auth/payout-settings
// @access  Private
const updatePayoutSettings = async (req, res, next) => {
  try {
    const { payoutMethod } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
      user.payoutMethod = payoutMethod;
      await user.save();
      res.json({ message: 'Payout settings updated', payoutMethod: user.payoutMethod });
    } else {
      res.status(404);
      return next(new Error('User not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Google OAuth Login/Signup
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400);
      return next(new Error('No token provided'));
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID || undefined,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

    let user = await User.findOne({ email });

    if (user) {
      user.lastIp = clientIp;
      if (!user.googleId) {
        user.googleId = googleId;
      }
      await user.save({ validateBeforeSave: false });
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: 'google',
        role: 'user',
        registrationIp: clientIp,
        lastIp: clientIp
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      brokerStatus: user.brokerStatus,
      token: generateToken(user._id),
      refreshToken: generateRefreshToken(user._id)
    });
  } catch (error) {
    console.error('Google Auth Error:', error.message);
    res.status(401);
    next(new Error('Invalid Google Token'));
  }
};

// @desc    GitHub OAuth Login/Signup
// @route   POST /api/auth/github
// @access  Public
const githubAuth = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      res.status(400);
      return next(new Error('No GitHub code provided'));
    }

    // 1. Exchange code for access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { accept: 'application/json' } }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      res.status(401);
      return next(new Error('Invalid GitHub authorization code'));
    }

    // 2. Fetch user profile from GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `token ${accessToken}` },
    });
    const githubUser = userResponse.data;
    
    let email = githubUser.email;

    // 3. If email is private, fetch from emails endpoint
    if (!email) {
      const emailResponse = await axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `token ${accessToken}` },
      });
      const primaryEmail = emailResponse.data.find(e => e.primary && e.verified);
      email = primaryEmail ? primaryEmail.email : emailResponse.data[0]?.email;
    }

    if (!email) {
      res.status(400);
      return next(new Error('Could not retrieve email from GitHub'));
    }

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

    let user = await User.findOne({ email });
    if (user) {
      user.lastIp = clientIp;
      if (!user.githubId) {
        user.githubId = githubUser.id.toString();
      }
      if (user.authProvider === 'local') {
        user.authProvider = 'github';
      }
      await user.save({ validateBeforeSave: false });
    } else {
      user = await User.create({
        name: githubUser.name || githubUser.login,
        email,
        githubId: githubUser.id.toString(),
        authProvider: 'github',
        role: 'user',
        registrationIp: clientIp,
        lastIp: clientIp
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      brokerStatus: user.brokerStatus,
      token: generateToken(user._id),
      refreshToken: generateRefreshToken(user._id)
    });
  } catch (error) {
    console.error('GitHub Auth Error:', error.message);
    res.status(401);
    next(new Error('Failed to authenticate with GitHub'));
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      res.status(400);
      return next(new Error('Please provide both current and new passwords'));
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    if (user.authProvider !== 'local') {
      res.status(400);
      return next(new Error('Cannot change password for OAuth users'));
    }

    if (!(await user.matchPassword(currentPassword))) {
      res.status(401);
      return next(new Error('Incorrect current password'));
    }

    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateProfile,
  updatePayoutSettings,
  googleAuth,
  githubAuth,
  changePassword
};
