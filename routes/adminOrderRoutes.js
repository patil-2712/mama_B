// routes/adminOrderRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAdminOrders,
  getAdminOrder,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Admin order routes
router.get('/orders', getAdminOrders);
router.get('/orders/:id', getAdminOrder);
router.put('/orders/:id/status', updateOrderStatus);

module.exports = router;