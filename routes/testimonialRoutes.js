// routes/testimonialRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getTestimonials,
  getAdminTestimonials,
  getTestimonial,
  toggleTestimonialStatus,
  getTestimonialStats
} = require('../controllers/testimonialController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/upload');

// Validation rules
const testimonialValidation = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 50 }).withMessage('Name cannot be more than 50 characters')
    .trim(),
  body('text')
    .notEmpty().withMessage('Testimonial text is required')
    .isLength({ max: 500 }).withMessage('Testimonial cannot be more than 500 characters')
    .trim(),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
];

// ============ PUBLIC ROUTES ============
router.get('/testimonials', getTestimonials);

// ============ ADMIN ROUTES ============
router.get('/admin/testimonials/stats', protect, authorize('admin'), getTestimonialStats);

router.route('/admin/testimonials')
  .post(
    protect,
    authorize('admin'),
    uploadSingle,
    testimonialValidation,
    createTestimonial
  )
  .get(protect, authorize('admin'), getAdminTestimonials);

router.route('/admin/testimonials/:id')
  .get(protect, authorize('admin'), getTestimonial)
  .put(
    protect,
    authorize('admin'),
    uploadSingle,
    testimonialValidation,
    updateTestimonial
  )
  .delete(protect, authorize('admin'), deleteTestimonial);

router.route('/admin/testimonials/:id/toggle')
  .patch(protect, authorize('admin'), toggleTestimonialStatus);

module.exports = router;