// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getUserOrder,
  cancelUserOrder
} = require('../controllers/orderController');
const { protectUser } = require('../middleware/authMiddleware');

// ✅ Use protectUser (not protect) for user authentication
// Public route - Create order (with optional auth)
router.post('/', protectUser, createOrder);

// Protected routes - User orders
router.get('/user', protectUser, getUserOrders);
router.get('/:id', protectUser, getUserOrder);
router.put('/:id/cancel', protectUser, cancelUserOrder);

module.exports = router;