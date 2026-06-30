// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategories,
  getAdminCategories,
  toggleCategoryStatus,
  getPublicCategories
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Validation rules
const categoryValidation = [
  body('name')
    .notEmpty().withMessage('Category name is required')
    .isLength({ max: 50 }).withMessage('Name cannot be more than 50 characters')
    .trim()
];

// ============ PUBLIC ROUTES ============
router.get('/categories', getPublicCategories);

// ============ ADMIN ROUTES ============
router.route('/admin/categories')
  .post(
    protect,
    authorize('admin'),
    categoryValidation,
    createCategory
  )
  .get(protect, authorize('admin'), getAdminCategories);

router.route('/admin/categories/:id')
  .put(
    protect,
    authorize('admin'),
    categoryValidation,
    updateCategory
  )
  .delete(protect, authorize('admin'), deleteCategory);

router.route('/admin/categories/:id/toggle')
  .patch(protect, authorize('admin'), toggleCategoryStatus);

// Admin categories list (for dropdown)
router.get('/admin/categories/list', protect, authorize('admin'), getCategories);

module.exports = router;