// controllers/bannerController.js
const Banner = require('../models/bannerModel');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

// @desc    Get active banners for frontend
// @route   GET /api/banners/active
// @access  Public (NO authentication required)
exports.getActiveBanners = async (req, res) => {
  try {
    console.log('📢 Fetching active banners...');
    const { position, limit = 5 } = req.query;

    const filter = {
      isActive: true,
      startDate: { $lte: new Date() }
    };

    // Add end date filter if it exists
    filter.$or = [
      { endDate: { $gte: new Date() } },
      { endDate: null }
    ];

    if (position) {
      filter.position = position;
    }

    console.log('🔍 Filter:', filter);

    const banners = await Banner.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .limit(parseInt(limit));

    console.log(`📦 Found ${banners.length} active banners`);

    res.status(200).json({
      success: true,
      count: banners.length,
      data: banners
    });
  } catch (error) {
    console.error('❌ Get Active Banners Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create a banner
// @route   POST /api/admin/banners
// @access  Private (Admin only)
exports.createBanner = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      title,
      subtitle,
      description,
      buttonText,
      buttonLink,
      position,
      order,
      isActive,
      isFeatured,
      startDate,
      endDate
    } = req.body;

    // Validate required fields
    if (!title || !description) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    // Get image URL from uploaded file
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Banner image is required'
      });
    }

    const banner = await Banner.create({
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : '',
      description: description.trim(),
      image: imageUrl,
      buttonText: buttonText || 'Shop Now',
      buttonLink: buttonLink || '/shop',
      position: position || 'hero',
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured !== undefined ? isFeatured : false,
      startDate: startDate || Date.now(),
      endDate: endDate || null,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      data: banner
    });
  } catch (error) {
    // Delete uploaded file if error occurs
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Create Banner Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update a banner
// @route   PUT /api/admin/banners/:id
// @access  Private (Admin only)
exports.updateBanner = async (req, res) => {
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

    let banner = await Banner.findById(req.params.id);

    if (!banner) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    const {
      title,
      subtitle,
      description,
      buttonText,
      buttonLink,
      position,
      order,
      isActive,
      isFeatured,
      startDate,
      endDate
    } = req.body;

    // Delete old image if new image is uploaded
    if (req.file) {
      if (banner.image) {
        const oldImagePath = path.join(__dirname, '..', banner.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const updateData = {
      title: title ? title.trim() : banner.title,
      subtitle: subtitle !== undefined ? subtitle.trim() : banner.subtitle,
      description: description ? description.trim() : banner.description,
      buttonText: buttonText || banner.buttonText,
      buttonLink: buttonLink || banner.buttonLink,
      position: position || banner.position,
      order: order !== undefined ? order : banner.order,
      isActive: isActive !== undefined ? isActive : banner.isActive,
      isFeatured: isFeatured !== undefined ? isFeatured : banner.isFeatured,
      startDate: startDate || banner.startDate,
      endDate: endDate !== undefined ? endDate : banner.endDate
    };

    // Update image if new file uploaded
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    banner = await Banner.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Banner updated successfully',
      data: banner
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Update Banner Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete a banner
// @route   DELETE /api/admin/banners/:id
// @access  Private (Admin only)
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    // Delete image file
    if (banner.image) {
      const imagePath = path.join(__dirname, '..', banner.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await banner.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (error) {
    console.error('Delete Banner Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all banners with pagination
// @route   GET /api/admin/banners
// @access  Private (Admin only)
exports.getBanners = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      position,
      isActive,
      isFeatured,
      search,
      sortBy = 'order',
      sortOrder = 'asc'
    } = req.query;

    const filter = {};
    if (position) filter.position = position;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subtitle: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const banners = await Banner.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');

    const total = await Banner.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: banners,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get Banners Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single banner
// @route   GET /api/admin/banners/:id
// @access  Private (Admin only)
exports.getBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    res.status(200).json({
      success: true,
      data: banner
    });
  } catch (error) {
    console.error('Get Banner Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Toggle banner status (activate/deactivate)
// @route   PATCH /api/admin/banners/:id/toggle
// @access  Private (Admin only)
exports.toggleBannerStatus = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    res.status(200).json({
      success: true,
      message: `Banner ${banner.isActive ? 'activated' : 'deactivated'} successfully`,
      data: banner
    });
  } catch (error) {
    console.error('Toggle Banner Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get banners by position
// @route   GET /api/banners/position/:position
// @access  Public
exports.getBannersByPosition = async (req, res) => {
  try {
    const { position } = req.params;
    const { limit = 10 } = req.query;

    const filter = {
      isActive: true,
      position: position,
      startDate: { $lte: new Date() },
      $or: [
        { endDate: { $gte: new Date() } },
        { endDate: null }
      ]
    };

    const banners = await Banner.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: banners.length,
      data: banners
    });
  } catch (error) {
    console.error('Get Banners By Position Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get featured banners
// @route   GET /api/banners/featured
// @access  Public
exports.getFeaturedBanners = async (req, res) => {
  try {
    const { limit = 3 } = req.query;

    const filter = {
      isActive: true,
      isFeatured: true,
      startDate: { $lte: new Date() },
      $or: [
        { endDate: { $gte: new Date() } },
        { endDate: null }
      ]
    };

    const banners = await Banner.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: banners.length,
      data: banners
    });
  } catch (error) {
    console.error('Get Featured Banners Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update banner order
// @route   PUT /api/admin/banners/:id/order
// @access  Private (Admin only)
exports.updateBannerOrder = async (req, res) => {
  try {
    const { order } = req.body;

    if (order === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Order is required'
      });
    }

    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      { order: order },
      {
        new: true,
        runValidators: true
      }
    );

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Banner order updated successfully',
      data: banner
    });
  } catch (error) {
    console.error('Update Banner Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Bulk delete banners
// @route   DELETE /api/admin/banners/bulk
// @access  Private (Admin only)
exports.bulkDeleteBanners = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of banner IDs'
      });
    }

    // Delete images for all banners
    const banners = await Banner.find({ _id: { $in: ids } });
    for (const banner of banners) {
      if (banner.image) {
        const imagePath = path.join(__dirname, '..', banner.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    }

    const result = await Banner.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} banners deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Bulk Delete Banners Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get banner statistics
// @route   GET /api/admin/banners/stats
// @access  Private (Admin only)
exports.getBannerStats = async (req, res) => {
  try {
    const totalBanners = await Banner.countDocuments();
    const activeBanners = await Banner.countDocuments({ isActive: true });
    const inactiveBanners = await Banner.countDocuments({ isActive: false });
    const featuredBanners = await Banner.countDocuments({ isFeatured: true });
    const heroBanners = await Banner.countDocuments({ position: 'hero' });

    // Get banners expiring soon (within 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const expiringBanners = await Banner.countDocuments({
      isActive: true,
      endDate: { 
        $gte: new Date(),
        $lte: sevenDaysFromNow 
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalBanners,
        activeBanners,
        inactiveBanners,
        featuredBanners,
        heroBanners,
        expiringBanners
      }
    });
  } catch (error) {
    console.error('Get Banner Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};