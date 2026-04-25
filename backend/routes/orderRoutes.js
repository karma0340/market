const express = require('express');
const router = express.Router();
const { getMyOrders, getOrderById } = require('../controllers/orderController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

module.exports = router;
