// routes/aboutRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createAbout,
  updateAbout,
  getAbout,
  getAdminAbout,
  toggleAboutStatus,
  deleteAbout
} = require('../controllers/aboutController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/upload');

// Validation rules
const aboutValidation = [
  body('title1')
    .notEmpty().withMessage('Title 1 is required')
    .isLength({ max: 100 }).withMessage('Title 1 cannot be more than 100 characters')
    .trim(),
  body('paragraph1')
    .notEmpty().withMessage('Paragraph 1 is required')
    .isLength({ max: 1000 }).withMessage('Paragraph 1 cannot be more than 1000 characters')
    .trim(),
  body('title2')
    .notEmpty().withMessage('Title 2 is required')
    .isLength({ max: 100 }).withMessage('Title 2 cannot be more than 100 characters')
    .trim(),
  body('paragraph2')
    .notEmpty().withMessage('Paragraph 2 is required')
    .isLength({ max: 1000 }).withMessage('Paragraph 2 cannot be more than 1000 characters')
    .trim()
];

// Configure multer for multiple images
const uploadFields = upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 }
]);

// ============ PUBLIC ROUTES ============
router.get('/about', getAbout);

// ============ ADMIN ROUTES ============
router.route('/admin/about')
  .post(
    protect,
    authorize('admin'),
    uploadFields,
    aboutValidation,
    createAbout
  )
  .get(protect, authorize('admin'), getAdminAbout);

router.route('/admin/about/:id')
  .put(
    protect,
    authorize('admin'),
    uploadFields,
    aboutValidation,
    updateAbout
  )
  .delete(protect, authorize('admin'), deleteAbout);

router.route('/admin/about/:id/toggle')
  .patch(protect, authorize('admin'), toggleAboutStatus);

module.exports = router;