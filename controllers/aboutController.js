// controllers/aboutController.js
const About = require('../models/aboutModel');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

// @desc    Create About page content
// @route   POST /api/admin/about
// @access  Private (Admin only)
exports.createAbout = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Delete uploaded files if validation fails
      if (req.files) {
        if (req.files.image1) fs.unlinkSync(req.files.image1[0].path);
        if (req.files.image2) fs.unlinkSync(req.files.image2[0].path);
      }
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      title1,
      paragraph1,
      title2,
      paragraph2,
      isActive
    } = req.body;

    // Check if about page already exists
    const existingAbout = await About.findOne();
    if (existingAbout) {
      if (req.files) {
        if (req.files.image1) fs.unlinkSync(req.files.image1[0].path);
        if (req.files.image2) fs.unlinkSync(req.files.image2[0].path);
      }
      return res.status(400).json({
        success: false,
        message: 'About page already exists. Please update instead.'
      });
    }

    // Get image URLs from uploaded files
    const image1Url = req.files && req.files.image1 ? `/uploads/${req.files.image1[0].filename}` : '';
    const image2Url = req.files && req.files.image2 ? `/uploads/${req.files.image2[0].filename}` : '';

    if (!image1Url || !image2Url) {
      return res.status(400).json({
        success: false,
        message: 'Both images are required'
      });
    }

    const about = await About.create({
      title1: title1.trim(),
      paragraph1: paragraph1.trim(),
      image1: image1Url,
      title2: title2.trim(),
      paragraph2: paragraph2.trim(),
      image2: image2Url,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'About page created successfully',
      data: about
    });
  } catch (error) {
    // Delete uploaded files if error occurs
    if (req.files) {
      if (req.files.image1) fs.unlinkSync(req.files.image1[0].path);
      if (req.files.image2) fs.unlinkSync(req.files.image2[0].path);
    }
    console.error('Create About Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update About page content
// @route   PUT /api/admin/about/:id
// @access  Private (Admin only)
exports.updateAbout = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.files) {
        if (req.files.image1) fs.unlinkSync(req.files.image1[0].path);
        if (req.files.image2) fs.unlinkSync(req.files.image2[0].path);
      }
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    let about = await About.findById(req.params.id);

    if (!about) {
      if (req.files) {
        if (req.files.image1) fs.unlinkSync(req.files.image1[0].path);
        if (req.files.image2) fs.unlinkSync(req.files.image2[0].path);
      }
      return res.status(404).json({
        success: false,
        message: 'About page not found'
      });
    }

    const {
      title1,
      paragraph1,
      title2,
      paragraph2,
      isActive
    } = req.body;

    // Delete old images if new images are uploaded
    if (req.files) {
      if (req.files.image1 && about.image1) {
        const oldImagePath = path.join(__dirname, '..', about.image1);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      if (req.files.image2 && about.image2) {
        const oldImagePath = path.join(__dirname, '..', about.image2);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const updateData = {
      title1: title1 ? title1.trim() : about.title1,
      paragraph1: paragraph1 ? paragraph1.trim() : about.paragraph1,
      title2: title2 ? title2.trim() : about.title2,
      paragraph2: paragraph2 ? paragraph2.trim() : about.paragraph2,
      isActive: isActive !== undefined ? isActive : about.isActive
    };

    // Update images if new files uploaded
    if (req.files) {
      if (req.files.image1) {
        updateData.image1 = `/uploads/${req.files.image1[0].filename}`;
      }
      if (req.files.image2) {
        updateData.image2 = `/uploads/${req.files.image2[0].filename}`;
      }
    }

    about = await About.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'About page updated successfully',
      data: about
    });
  } catch (error) {
    if (req.files) {
      if (req.files.image1) fs.unlinkSync(req.files.image1[0].path);
      if (req.files.image2) fs.unlinkSync(req.files.image2[0].path);
    }
    console.error('Update About Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get About page content
// @route   GET /api/about
// @access  Public
exports.getAbout = async (req, res) => {
  try {
    const about = await About.findOne({ isActive: true })
      .populate('createdBy', 'name email');

    if (!about) {
      return res.status(404).json({
        success: false,
        message: 'About page not found'
      });
    }

    res.status(200).json({
      success: true,
      data: about
    });
  } catch (error) {
    console.error('Get About Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get About page for admin
// @route   GET /api/admin/about
// @access  Private (Admin only)
exports.getAdminAbout = async (req, res) => {
  try {
    const about = await About.findOne()
      .populate('createdBy', 'name email');

    if (!about) {
      return res.status(404).json({
        success: false,
        message: 'About page not found'
      });
    }

    res.status(200).json({
      success: true,
      data: about
    });
  } catch (error) {
    console.error('Get Admin About Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Toggle About page status
// @route   PATCH /api/admin/about/:id/toggle
// @access  Private (Admin only)
exports.toggleAboutStatus = async (req, res) => {
  try {
    const about = await About.findById(req.params.id);

    if (!about) {
      return res.status(404).json({
        success: false,
        message: 'About page not found'
      });
    }

    about.isActive = !about.isActive;
    await about.save();

    res.status(200).json({
      success: true,
      message: `About page ${about.isActive ? 'activated' : 'deactivated'} successfully`,
      data: about
    });
  } catch (error) {
    console.error('Toggle About Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete About page
// @route   DELETE /api/admin/about/:id
// @access  Private (Admin only)
exports.deleteAbout = async (req, res) => {
  try {
    const about = await About.findById(req.params.id);

    if (!about) {
      return res.status(404).json({
        success: false,
        message: 'About page not found'
      });
    }

    // Delete images
    if (about.image1) {
      const imagePath1 = path.join(__dirname, '..', about.image1);
      if (fs.existsSync(imagePath1)) {
        fs.unlinkSync(imagePath1);
      }
    }
    if (about.image2) {
      const imagePath2 = path.join(__dirname, '..', about.image2);
      if (fs.existsSync(imagePath2)) {
        fs.unlinkSync(imagePath2);
      }
    }

    await about.deleteOne();

    res.status(200).json({
      success: true,
      message: 'About page deleted successfully'
    });
  } catch (error) {
    console.error('Delete About Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};