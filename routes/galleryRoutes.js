// routes/galleryRoutes.js
const express = require('express');
const router = express.Router();
const {
  createGallery,
  updateGallery,
  getGallery,
  getAdminGallery,
  toggleGalleryStatus,
  deleteGallery
} = require('../controllers/galleryController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadMultiple } = require('../middleware/upload');

// Configure multer for multiple files (images and videos)
const uploadFields = uploadMultiple;

// ============ PUBLIC ROUTES ============
router.get('/gallery', getGallery);

// ============ ADMIN ROUTES ============
router.route('/admin/gallery')
  .post(
    protect,
    authorize('admin'),
    uploadFields,
    createGallery
  )
  .get(protect, authorize('admin'), getAdminGallery);

router.route('/admin/gallery/:id')
  .put(
    protect,
    authorize('admin'),
    uploadFields,
    updateGallery
  )
  .delete(protect, authorize('admin'), deleteGallery);

router.route('/admin/gallery/:id/toggle')
  .patch(protect, authorize('admin'), toggleGalleryStatus);

module.exports = router;