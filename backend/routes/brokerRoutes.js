const express = require('express');
const router = express.Router();
const { 
  getBrokerStats,
  getBrokerProducts,
  getBrokerLeads, 
  updateBrokerProfile, 
  createLead 
} = require('../controllers/brokerController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Public route - anyone can create a lead
router.post('/leads', protect, createLead);

// Broker-only routes
router.get('/stats', protect, authorize('broker'), getBrokerStats);
router.get('/products', protect, authorize('broker'), getBrokerProducts);
router.get('/leads', protect, authorize('broker'), getBrokerLeads);
router.put('/profile', protect, authorize('broker'), updateBrokerProfile);

module.exports = router;
