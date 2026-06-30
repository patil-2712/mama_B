// controllers/galleryController.js
const Gallery = require('../models/galleryModel');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

// @desc    Create Gallery
// @route   POST /api/admin/gallery
// @access  Private (Admin only)
exports.createGallery = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Delete uploaded files if validation fails
      if (req.files) {
        if (req.files.image1) fs.unlinkSync(req.files.image1[0].path);
        if (req.files.image2) fs.unlinkSync(req.files.image2[0].path);
        if (req.files.image3) fs.unlinkSync(req.files.image3[0].path);
        if (req.files.video1) fs.unlinkSync(req.files.video1[0].path);
        if (req.files.video2) fs.unlinkSync(req.files.video2[0].path);
        if (req.files.video3) fs.unlinkSync(req.files.video3[0].path);
      }
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Check if gallery already exists
    const existingGallery = await Gallery.findOne();
    if (existingGallery) {
      if (req.files) {
        if (req.files.image1) fs.unlinkSync(req.files.image1[0].path);
        if (req.files.image2) fs.unlinkSync(req.files.image2[0].path);
        if (req.files.image3) fs.unlinkSync(req.files.image3[0].path);
        if (req.files.video1) fs.unlinkSync(req.files.video1[0].path);
        if (req.files.video2) fs.unlinkSync(req.files.video2[0].path);
        if (req.files.video3) fs.unlinkSync(req.files.video3[0].path);
      }
      return res.status(400).json({
        success: false,
        message: 'Gallery already exists. Please update instead.'
      });
    }

    const {
      image1Title, image1Alt,
      image2Title, image2Alt,
      image3Title, image3Alt,
      video1Title, video1Description,
      video2Title, video2Description,
      video3Title, video3Description,
      isActive
    } = req.body;

    // Get image URLs from uploaded files - updated paths
    const image1Url = req.files && req.files.image1 ? `/uploads/images/${req.files.image1[0].filename}` : '';
    const image2Url = req.files && req.files.image2 ? `/uploads/images/${req.files.image2[0].filename}` : '';
    const image3Url = req.files && req.files.image3 ? `/uploads/images/${req.files.image3[0].filename}` : '';

    // Get video URLs from uploaded files - updated paths
    const video1Url = req.files && req.files.video1 ? `/uploads/videos/${req.files.video1[0].filename}` : '';
    const video2Url = req.files && req.files.video2 ? `/uploads/videos/${req.files.video2[0].filename}` : '';
    const video3Url = req.files && req.files.video3 ? `/uploads/videos/${req.files.video3[0].filename}` : '';

    // Validate images
    if (!image1Url || !image2Url || !image3Url) {
      if (req.files) {
        if (req.files.image1) fs.unlinkSync(req.files.image1[0].path);
        if (req.files.image2) fs.unlinkSync(req.files.image2[0].path);
        if (req.files.image3) fs.unlinkSync(req.files.image3[0].path);
        if (req.files.video1) fs.unlinkSync(req.files.video1[0].path);
        if (req.files.video2) fs.unlinkSync(req.files.video2[0].path);
        if (req.files.video3) fs.unlinkSync(req.files.video3[0].path);
      }
      return res.status(400).json({
        success: false,
        message: 'All 3 images are required'
      });
    }

    // Validate videos
    if (!video1Url || !video2Url || !video3Url) {
      if (req.files) {
        if (req.files.image1) fs.unlinkSync(req.files.image1[0].path);
        if (req.files.image2) fs.unlinkSync(req.files.image2[0].path);
        if (req.files.image3) fs.unlinkSync(req.files.image3[0].path);
        if (req.files.video1) fs.unlinkSync(req.files.video1[0].path);
        if (req.files.video2) fs.unlinkSync(req.files.video2[0].path);
        if (req.files.video3) fs.unlinkSync(req.files.video3[0].path);
      }
      return res.status(400).json({
        success: false,
        message: 'All 3 videos are required'
      });
    }

    const gallery = await Gallery.create({
      image1: image1Url,
      image1Title: image1Title || '',
      image1Alt: image1Alt || '',
      image2: image2Url,
      image2Title: image2Title || '',
      image2Alt: image2Alt || '',
      image3: image3Url,
      image3Title: image3Title || '',
      image3Alt: image3Alt || '',
      video1: video1Url,
      video1Title: video1Title || '',
      video1Description: video1Description || '',
      video2: video2Url,
      video2Title: video2Title || '',
      video2Description: video2Description || '',
      video3: video3Url,
      video3Title: video3Title || '',
      video3Description: video3Description || '',
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Gallery created successfully',
      data: gallery
    });
  } catch (error) {
    // Delete uploaded files if error occurs
    if (req.files) {
      if (req.files.image1) fs.unlinkSync(req.files.image1[0].path);
      if (req.files.image2) fs.unlinkSync(req.files.image2[0].path);
      if (req.files.image3) fs.unlinkSync(req.files.image3[0].path);
      if (req.files.video1) fs.unlinkSync(req.files.video1[0].path);
      if (req.files.video2) fs.unlinkSync(req.files.video2[0].path);
      if (req.files.video3) fs.unlinkSync(req.files.video3[0].path);
    }
    console.error('Create Gallery Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update Gallery
// @route   PUT /api/admin/gallery/:id
// @access  Private (Admin only)
exports.updateGallery = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.files) {
        if (req.files.image1) fs.unlinkSync(req.files.image1[0].path);
        if (req.files.image2) fs.unlinkSync(req.files.image2[0].path);
        if (req.files.image3) fs.unlinkSync(req.files.image3[0].path);
        if (req.files.video1) fs.unlinkSync(req.files.video1[0].path);
        if (req.files.video2) fs.unlinkSync(req.files.video2[0].path);
        if (req.files.video3) fs.unlinkSync(req.files.video3[0].path);
      }
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    let gallery = await Gallery.findById(req.params.id);

    if (!gallery) {
      if (req.files) {
        if (req.files.image1) fs.unlinkSync(req.files.image1[0].path);
        if (req.files.image2) fs.unlinkSync(req.files.image2[0].path);
        if (req.files.image3) fs.unlinkSync(req.files.image3[0].path);
        if (req.files.video1) fs.unlinkSync(req.files.video1[0].path);
        if (req.files.video2) fs.unlinkSync(req.files.video2[0].path);
        if (req.files.video3) fs.unlinkSync(req.files.video3[0].path);
      }
      return res.status(404).json({
        success: false,
        message: 'Gallery not found'
      });
    }

    const {
      image1Title, image1Alt,
      image2Title, image2Alt,
      image3Title, image3Alt,
      video1Title, video1Description,
      video2Title, video2Description,
      video3Title, video3Description,
      isActive
    } = req.body;

    // Delete old files if new ones are uploaded
    if (req.files) {
      // Delete old images - check both paths
      if (req.files.image1 && gallery.image1) {
        const oldPath1 = path.join(__dirname, '..', gallery.image1);
        if (fs.existsSync(oldPath1)) fs.unlinkSync(oldPath1);
      }
      if (req.files.image2 && gallery.image2) {
        const oldPath2 = path.join(__dirname, '..', gallery.image2);
        if (fs.existsSync(oldPath2)) fs.unlinkSync(oldPath2);
      }
      if (req.files.image3 && gallery.image3) {
        const oldPath3 = path.join(__dirname, '..', gallery.image3);
        if (fs.existsSync(oldPath3)) fs.unlinkSync(oldPath3);
      }
      // Delete old videos - check both paths
      if (req.files.video1 && gallery.video1) {
        const oldVideo1 = path.join(__dirname, '..', gallery.video1);
        if (fs.existsSync(oldVideo1)) fs.unlinkSync(oldVideo1);
      }
      if (req.files.video2 && gallery.video2) {
        const oldVideo2 = path.join(__dirname, '..', gallery.video2);
        if (fs.existsSync(oldVideo2)) fs.unlinkSync(oldVideo2);
      }
      if (req.files.video3 && gallery.video3) {
        const oldVideo3 = path.join(__dirname, '..', gallery.video3);
        if (fs.existsSync(oldVideo3)) fs.unlinkSync(oldVideo3);
      }
    }

    const updateData = {
      image1Title: image1Title !== undefined ? image1Title : gallery.image1Title,
      image1Alt: image1Alt !== undefined ? image1Alt : gallery.image1Alt,
      image2Title: image2Title !== undefined ? image2Title : gallery.image2Title,
      image2Alt: image2Alt !== undefined ? image2Alt : gallery.image2Alt,
      image3Title: image3Title !== undefined ? image3Title : gallery.image3Title,
      image3Alt: image3Alt !== undefined ? image3Alt : gallery.image3Alt,
      video1Title: video1Title !== undefined ? video1Title : gallery.video1Title,
      video1Description: video1Description !== undefined ? video1Description : gallery.video1Description,
      video2Title: video2Title !== undefined ? video2Title : gallery.video2Title,
      video2Description: video2Description !== undefined ? video2Description : gallery.video2Description,
      video3Title: video3Title !== undefined ? video3Title : gallery.video3Title,
      video3Description: video3Description !== undefined ? video3Description : gallery.video3Description,
      isActive: isActive !== undefined ? isActive : gallery.isActive
    };

    // Update images if new files uploaded - updated paths
    if (req.files) {
      if (req.files.image1) updateData.image1 = `/uploads/images/${req.files.image1[0].filename}`;
      if (req.files.image2) updateData.image2 = `/uploads/images/${req.files.image2[0].filename}`;
      if (req.files.image3) updateData.image3 = `/uploads/images/${req.files.image3[0].filename}`;
      if (req.files.video1) updateData.video1 = `/uploads/videos/${req.files.video1[0].filename}`;
      if (req.files.video2) updateData.video2 = `/uploads/videos/${req.files.video2[0].filename}`;
      if (req.files.video3) updateData.video3 = `/uploads/videos/${req.files.video3[0].filename}`;
    }

    gallery = await Gallery.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Gallery updated successfully',
      data: gallery
    });
  } catch (error) {
    if (req.files) {
      if (req.files.image1) fs.unlinkSync(req.files.image1[0].path);
      if (req.files.image2) fs.unlinkSync(req.files.image2[0].path);
      if (req.files.image3) fs.unlinkSync(req.files.image3[0].path);
      if (req.files.video1) fs.unlinkSync(req.files.video1[0].path);
      if (req.files.video2) fs.unlinkSync(req.files.video2[0].path);
      if (req.files.video3) fs.unlinkSync(req.files.video3[0].path);
    }
    console.error('Update Gallery Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get Gallery (Public)
// @route   GET /api/gallery
// @access  Public
exports.getGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findOne({ isActive: true })
      .populate('createdBy', 'name email');

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found'
      });
    }

    res.status(200).json({
      success: true,
      data: gallery
    });
  } catch (error) {
    console.error('Get Gallery Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get Gallery (Admin)
// @route   GET /api/admin/gallery
// @access  Private (Admin only)
exports.getAdminGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findOne()
      .populate('createdBy', 'name email');

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found'
      });
    }

    res.status(200).json({
      success: true,
      data: gallery
    });
  } catch (error) {
    console.error('Get Admin Gallery Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Toggle Gallery Status
// @route   PATCH /api/admin/gallery/:id/toggle
// @access  Private (Admin only)
exports.toggleGalleryStatus = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found'
      });
    }

    gallery.isActive = !gallery.isActive;
    await gallery.save();

    res.status(200).json({
      success: true,
      message: `Gallery ${gallery.isActive ? 'activated' : 'deactivated'} successfully`,
      data: gallery
    });
  } catch (error) {
    console.error('Toggle Gallery Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete Gallery
// @route   DELETE /api/admin/gallery/:id
// @access  Private (Admin only)
exports.deleteGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found'
      });
    }

    // Delete images - check both possible paths
    const imagePaths = [gallery.image1, gallery.image2, gallery.image3];
    imagePaths.forEach(imagePath => {
      if (imagePath) {
        const fullPath = path.join(__dirname, '..', imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    });

    // Delete videos - check both possible paths
    const videoPaths = [gallery.video1, gallery.video2, gallery.video3];
    videoPaths.forEach(videoPath => {
      if (videoPath) {
        const fullPath = path.join(__dirname, '..', videoPath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    });

    await gallery.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Gallery deleted successfully'
    });
  } catch (error) {
    console.error('Delete Gallery Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};