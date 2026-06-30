// controllers/testimonialController.js
const Testimonial = require('../models/testimonialModel');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

// @desc    Create a testimonial
// @route   POST /api/admin/testimonials
// @access  Private (Admin only)
exports.createTestimonial = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, text, position, rating, isActive, order } = req.body;

    // Validate required fields
    if (!name || !text) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Name and testimonial text are required'
      });
    }

    // FIXED: Get image URL with correct path
    const imageUrl = req.file ? `/uploads/images/${req.file.filename}` : '';

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Testimonial image is required'
      });
    }

    console.log('📸 Testimonial image saved at:', imageUrl);

    const testimonial = await Testimonial.create({
      name: name.trim(),
      text: text.trim(),
      image: imageUrl,
      position: position || '',
      rating: rating || 5,
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Testimonial created successfully',
      data: testimonial
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Create Testimonial Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update a testimonial
// @route   PUT /api/admin/testimonials/:id
// @access  Private (Admin only)
exports.updateTestimonial = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    let testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    const { name, text, position, rating, isActive, order } = req.body;

    // Delete old image if new image is uploaded
    if (req.file) {
      if (testimonial.image) {
        const oldImagePath = path.join(__dirname, '..', testimonial.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const updateData = {
      name: name ? name.trim() : testimonial.name,
      text: text ? text.trim() : testimonial.text,
      position: position !== undefined ? position : testimonial.position,
      rating: rating || testimonial.rating,
      isActive: isActive !== undefined ? isActive : testimonial.isActive,
      order: order !== undefined ? order : testimonial.order
    };

    // FIXED: Update image with correct path
    if (req.file) {
      updateData.image = `/uploads/images/${req.file.filename}`;
    }

    testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Testimonial updated successfully',
      data: testimonial
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Update Testimonial Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete a testimonial
// @route   DELETE /api/admin/testimonials/:id
// @access  Private (Admin only)
exports.deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    // Delete image file
    if (testimonial.image) {
      const imagePath = path.join(__dirname, '..', testimonial.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await testimonial.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    console.error('Delete Testimonial Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all testimonials (Public)
// @route   GET /api/testimonials
// @access  Public
exports.getTestimonials = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const testimonials = await Testimonial.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: testimonials.length,
      data: testimonials
    });
  } catch (error) {
    console.error('Get Testimonials Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all testimonials (Admin)
// @route   GET /api/admin/testimonials
// @access  Private (Admin only)
exports.getAdminTestimonials = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { text: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const testimonials = await Testimonial.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');

    const total = await Testimonial.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: testimonials,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get Admin Testimonials Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single testimonial
// @route   GET /api/admin/testimonials/:id
// @access  Private (Admin only)
exports.getTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    res.status(200).json({
      success: true,
      data: testimonial
    });
  } catch (error) {
    console.error('Get Testimonial Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Toggle testimonial status
// @route   PATCH /api/admin/testimonials/:id/toggle
// @access  Private (Admin only)
exports.toggleTestimonialStatus = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    testimonial.isActive = !testimonial.isActive;
    await testimonial.save();

    res.status(200).json({
      success: true,
      message: `Testimonial ${testimonial.isActive ? 'activated' : 'deactivated'} successfully`,
      data: testimonial
    });
  } catch (error) {
    console.error('Toggle Testimonial Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get testimonial stats
// @route   GET /api/admin/testimonials/stats
// @access  Private (Admin only)
exports.getTestimonialStats = async (req, res) => {
  try {
    const total = await Testimonial.countDocuments();
    const active = await Testimonial.countDocuments({ isActive: true });
    const inactive = await Testimonial.countDocuments({ isActive: false });

    res.status(200).json({
      success: true,
      data: {
        total,
        active,
        inactive
      }
    });
  } catch (error) {
    console.error('Get Testimonial Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};