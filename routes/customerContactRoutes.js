// routes/customerContactRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  submitCustomerContact,
  getCustomerContacts,
  getCustomerContact,
  updateCustomerContactStatus,
  deleteCustomerContact,
  getCustomerContactStats,
  markAsRead,
  markAsReplied
} = require('../controllers/customerContactController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Validation rules for customer contact submission
const customerContactValidation = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot be more than 100 characters')
    .trim(),
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('phone')
    .notEmpty().withMessage('Phone number is required')
    .trim(),
  body('message')
    .notEmpty().withMessage('Message is required')
    .isLength({ max: 1000 }).withMessage('Message cannot be more than 1000 characters')
    .trim()
];

// ============ PUBLIC ROUTES (No authentication) ============
// Submit contact form from website
router.post('/customer-contact/submit', customerContactValidation, submitCustomerContact);

// ============ ADMIN ROUTES (Authentication required) ============
// Get all customer contacts with pagination and filters
router.get('/admin/customer-contacts', protect, authorize('admin'), getCustomerContacts);

// Get customer contact stats
router.get('/admin/customer-contacts/stats', protect, authorize('admin'), getCustomerContactStats);

// Get single customer contact
router.get('/admin/customer-contacts/:id', protect, authorize('admin'), getCustomerContact);

// Update customer contact status
router.patch('/admin/customer-contacts/:id/status', protect, authorize('admin'), updateCustomerContactStatus);

// Mark as read
router.patch('/admin/customer-contacts/:id/read', protect, authorize('admin'), markAsRead);

// Mark as replied
router.patch('/admin/customer-contacts/:id/replied', protect, authorize('admin'), markAsReplied);

// Delete customer contact
router.delete('/admin/customer-contacts/:id', protect, authorize('admin'), deleteCustomerContact);

module.exports = router;