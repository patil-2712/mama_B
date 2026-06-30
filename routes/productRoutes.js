// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  // Admin Controllers
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  // Public Controllers
  getPublicProducts,
  getPublicProduct,
  getPublicCategories
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/upload');

// Validation rules
const productValidation = [
  body('name')
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 100 }).withMessage('Name cannot be more than 100 characters')
    .trim(),
  body('price')
    .isNumeric().withMessage('Price must be a number')
    .isFloat({ min: 0 }).withMessage('Price cannot be negative'),
  body('discount')
    .optional()
    .isNumeric().withMessage('Discount must be a number')
    .isFloat({ min: 0, max: 100 }).withMessage('Discount must be between 0 and 100'),
  body('description')
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 1000 }).withMessage('Description cannot be more than 1000 characters')
    .trim(),
  body('category')
    .notEmpty().withMessage('Category is required'),
  body('quantity')
    .optional()
    .isNumeric().withMessage('Quantity must be a number')
    .isInt({ min: 0 }).withMessage('Quantity cannot be negative')
];

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

// Get public products with pagination
router.get('/products', getPublicProducts);

// Get single public product
router.get('/products/:id', getPublicProduct);

// Get public categories (only categories with products)
router.get('/categories', getPublicCategories);

// ============================================
// ADMIN ROUTES (Authentication required)
// ============================================

// Product CRUD Routes with Image Upload
router.route('/admin/products')
  .post(
    protect, 
    authorize('admin'), 
    uploadSingle, 
    productValidation, 
    createProduct
  )
  .get(protect, authorize('admin'), getProducts);

router.route('/admin/products/:id')
  .get(protect, authorize('admin'), getProduct)
  .put(
    protect, 
    authorize('admin'), 
    uploadSingle, 
    productValidation, 
    updateProduct
  )
  .delete(protect, authorize('admin'), deleteProduct);

// Admin Categories Routes
router.get('/admin/categories', protect, authorize('admin'), getCategories);

module.exports = router;