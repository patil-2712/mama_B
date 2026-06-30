// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  verifyPassword,
  debugResetPassword,
  debugAuthStatus,
  debugDatabase,
  debugEnv
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

// Validation rules
const registerValidation = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain a number'),
  body('phone')
    .optional()
    .isMobilePhone().withMessage('Please enter a valid phone number')
];

const loginValidation = [
  body('email')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

// ============================================
// ✅ DEBUG ROUTES - PUBLIC (NO authentication)
// These routes are for debugging and testing
// ============================================
router.get('/debug/env', debugEnv);
router.get('/debug/database', debugDatabase);
router.get('/debug/status', debugAuthStatus);
router.post('/debug/verify-password', verifyPassword);
router.post('/debug/reset-password', debugResetPassword);

// ============================================
// ✅ PUBLIC ROUTES - NO authentication required
// These routes can be accessed without a token
// ============================================
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// ============================================
// ❌ IMPORTANT: DO NOT put any routes after this point
// without the 'protect' middleware if they need authentication
// ============================================

// ============================================
// ✅ PROTECTED ROUTES - Authentication required
// These routes need a valid token
// ============================================
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;