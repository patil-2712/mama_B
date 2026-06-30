// routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createContact,
  updateContact,
  getContact,
  getAdminContact,
  toggleContactStatus,
  deleteContact
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Validation rules
const contactValidation = [
  body('address')
    .notEmpty().withMessage('Address is required')
    .isLength({ max: 500 }).withMessage('Address cannot be more than 500 characters')
    .trim(),
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('phone')
    .notEmpty().withMessage('Phone number is required')
    .trim(),
  body('timing')
    .optional()
    .trim(),
  body('mapUrl')
    .optional()
    .trim()
];

// ============ PUBLIC ROUTES ============
router.get('/contact', getContact);

// ============ ADMIN ROUTES ============
router.route('/admin/contact')
  .post(
    protect,
    authorize('admin'),
    contactValidation,
    createContact
  )
  .get(protect, authorize('admin'), getAdminContact);

router.route('/admin/contact/:id')
  .put(
    protect,
    authorize('admin'),
    contactValidation,
    updateContact
  )
  .delete(protect, authorize('admin'), deleteContact);

router.route('/admin/contact/:id/toggle')
  .patch(protect, authorize('admin'), toggleContactStatus);

module.exports = router;