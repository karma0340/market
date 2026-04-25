require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');

// Connect to Database
connectDB();

// Initialize Automated Payout Engine (Skip on Vercel serverless)
if (process.env.VERCEL !== '1') {
  const startAutomatedPayouts = require('./services/payoutCron');
  startAutomatedPayouts();
}

const app = express();

// Middlewares
app.use(cors());

// Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const walletRoutes = require('./routes/walletRoutes');

// --- STRIPE WEBHOOK NEEDS RAW BODY ---
// Mount this route before express.json()
app.use('/api/payments/stripe/webhook', express.raw({ type: 'application/json' }), require('./controllers/paymentController').stripeWebhook);

// Now apply express.json() for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
