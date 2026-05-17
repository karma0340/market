require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sanitizeHtml = require('sanitize-html');
const hpp = require('hpp');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');

// Custom NoSQL injection sanitizer compatible with Express 5
// (express-mongo-sanitize 2.2.0 tries to reassign req.query which is
//  a read-only getter in Express 5, causing 500 on every request)
const mongoSanitize = () => (req, res, next) => {
  const stripDollar = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
      } else {
        stripDollar(obj[key]);
      }
    }
  };
  stripDollar(req.body);
  stripDollar(req.params);
  next();
};

// Connect to Database
connectDB();

// Initialize Automated Payout Engine (Skip on Vercel serverless)
if (process.env.VERCEL !== '1') {
  const startAutomatedPayouts = require('./services/payoutCron');
  startAutomatedPayouts();
}

const app = express();

const path = require('path');
// Middlewares
app.use(cors());

// Set security headers
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // Allow images to be served cross-origin

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 500 // Limit each IP to 500 requests per `window` (here, per 10 minutes)
});
app.use('/api', limiter);

// Serve static files from the uploads directory with caching headers
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1y', // Cache for 1 year (Standard for CDNs)
  immutable: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.pdf') || path.endsWith('.zip')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Explicit for large files
    }
  }
}));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const walletRoutes = require('./routes/walletRoutes');

// --- WEBHOOKS NEED RAW BODY ---
// Mount these routes before express.json()
app.use('/api/payments/stripe/webhook', express.raw({ type: 'application/json' }), require('./controllers/paymentController').stripeWebhook);
app.use('/api/payments/razorpay/webhook', express.raw({ type: 'application/json' }), require('./controllers/paymentController').razorpayWebhook);

// Now apply express.json() with increased limit for large uploads (Base64 images, etc)
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Sanitize data against NoSQL Injection
app.use(mongoSanitize());

// Prevent XSS attacks – recursively strip HTML from all string fields in req.body
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    const clean = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = sanitizeHtml(obj[key], { allowedTags: [], allowedAttributes: {} });
        } else if (typeof obj[key] === 'object') {
          clean(obj[key]);
        }
      }
    };
    clean(req.body);
  }
  next();
});

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Basic route
app.get('/', (req, res) => {
  res.send('Marketplace API is running...');
});

// Handle favicon.ico requests to avoid 404 errors in browser console
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/broker', require('./routes/brokerRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/verify', require('./routes/verificationRoutes'));

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app;
