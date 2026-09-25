//// routes/bannerRoutes.js
//const express = require('express');
//const router = express.Router();
//const { body } = require('express-validator');
//const {
//  createBanner,
//  updateBanner,
//  deleteBanner,
//  getBanners,
//  getBanner,
//  getActiveBanners,
//  toggleBannerStatus,
//  getBannersByPosition,
//  getFeaturedBanners,
//  updateBannerOrder,
//  bulkDeleteBanners,
//  getBannerStats
//} = require('../controllers/bannerController');
//const { protect, authorize } = require('../middleware/authMiddleware');
//const { uploadSingle } = require('../middleware/upload');
//
//// Validation rules
//const bannerValidation = [
//  body('title')
//    .notEmpty().withMessage('Title is required')
//    .isLength({ max: 100 }).withMessage('Title cannot be more than 100 characters')
//    .trim(),
//  body('description')
//    .notEmpty().withMessage('Description is required')
//    .isLength({ max: 500 }).withMessage('Description cannot be more than 500 characters')
//    .trim(),
//  body('subtitle')
//    .optional()
//    .isLength({ max: 200 }).withMessage('Subtitle cannot be more than 200 characters')
//    .trim(),
//  body('buttonText')
//    .optional()
//    .isLength({ max: 50 }).withMessage('Button text cannot be more than 50 characters')
//    .trim(),
//  body('position')
//    .optional()
//    .isIn(['hero', 'featured', 'promotion', 'sidebar'])
//    .withMessage('Invalid position value'),
//  body('order')
//    .optional()
//    .isNumeric().withMessage('Order must be a number'),
//  body('isActive')
//    .optional()
//    .isBoolean().withMessage('isActive must be a boolean'),
//  body('isFeatured')
//    .optional()
//    .isBoolean().withMessage('isFeatured must be a boolean')
//];
//
//// ============ PUBLIC ROUTES (No authentication required) ============
//router.get('/banners/active', getActiveBanners);
//router.get('/banners/position/:position', getBannersByPosition);
//router.get('/banners/featured', getFeaturedBanners);
//
//// ============ ADMIN ROUTES (Authentication required) ============
//// Get banner stats
//router.get('/banners/stats', protect, authorize('admin'), getBannerStats);
//
//// Bulk delete banners
//router.delete('/banners/bulk', protect, authorize('admin'), bulkDeleteBanners);
//
//// Main banner routes
//router.route('/banners')
//  .post(
//    protect,
//    authorize('admin'),
//    uploadSingle,
//    bannerValidation,
//    createBanner
//  )
//  .get(protect, authorize('admin'), getBanners);
//
//// Single banner routes
//router.route('/banners/:id')
//  .get(protect, authorize('admin'), getBanner)
//  .put(
//    protect,
//    authorize('admin'),
//    uploadSingle,
//    bannerValidation,
//    updateBanner
//  )
//  .delete(protect, authorize('admin'), deleteBanner);
//
//// Toggle banner status
//router.route('/banners/:id/toggle')
//  .patch(protect, authorize('admin'), toggleBannerStatus);
//
//// Update banner order
//router.route('/banners/:id/order')
//  .put(protect, authorize('admin'), updateBannerOrder);
//
//module.exports = router;

// routes/bannerRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createBanner,
  updateBanner,
  deleteBanner,
  getBanners,
  getBanner,
  getActiveBanners,
  toggleBannerStatus,
  getBannersByPosition,
  getFeaturedBanners,
  updateBannerOrder,
  bulkDeleteBanners,
  getBannerStats
} = require('../controllers/bannerController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/upload');

const bannerValidation = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title cannot be more than 100 characters')
    .trim(),
  body('description')
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 500 }).withMessage('Description cannot be more than 500 characters')
    .trim(),
  body('subtitle')
    .optional()
    .isLength({ max: 200 }).withMessage('Subtitle cannot be more than 200 characters')
    .trim(),
  body('buttonText')
    .optional()
    .isLength({ max: 50 }).withMessage('Button text cannot be more than 50 characters')
    .trim(),
  body('position')
    .optional()
    .isIn(['hero', 'featured', 'promotion', 'sidebar'])
    .withMessage('Invalid position value'),
  body('order')
    .optional()
    .isNumeric().withMessage('Order must be a number'),
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
  body('isFeatured')
    .optional()
    .isBoolean().withMessage('isFeatured must be a boolean')
];

// ============ PUBLIC ROUTES (mounted at /api) ============
// These will be registered at /api/banners/active etc.
router.get('/banners/active', getActiveBanners);
router.get('/banners/position/:position', getBannersByPosition);
router.get('/banners/featured', getFeaturedBanners);

// ============ ADMIN ROUTES (mounted at /api/admin) ============
// These will be registered at /api/admin/banners etc.
router.get('/banners/stats', protect, authorize('admin'), getBannerStats);
router.delete('/banners/bulk', protect, authorize('admin'), bulkDeleteBanners);

router.route('/banners')
  .post(
    protect,
    authorize('admin'),
    uploadSingle,
    bannerValidation,
    createBanner
  )
  .get(protect, authorize('admin'), getBanners);

router.route('/banners/:id')
  .get(protect, authorize('admin'), getBanner)
  .put(
    protect,
    authorize('admin'),
    uploadSingle,
    bannerValidation,
    updateBanner
  )
  .delete(protect, authorize('admin'), deleteBanner);

router.route('/banners/:id/toggle')
  .patch(protect, authorize('admin'), toggleBannerStatus);

router.route('/banners/:id/order')
  .put(protect, authorize('admin'), updateBannerOrder);

module.exports = router;