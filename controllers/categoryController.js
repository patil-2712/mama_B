// controllers/categoryController.js
const Category = require('../models/categoryModel');
const { validationResult } = require('express-validator');

// @desc    Create a category
// @route   POST /api/admin/categories
// @access  Private (Admin only)
exports.createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Check if category already exists (case insensitive)
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    });
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists'
      });
    }

    const category = await Category.create({
      name: name.trim(),
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    console.error('Create Category Error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update a category
// @route   PUT /api/admin/categories/:id
// @access  Private (Admin only)
exports.updateCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Check if category with same name exists (excluding current)
    if (name.trim() !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category already exists'
        });
      }
    }

    category = await Category.findByIdAndUpdate(
      req.params.id,
      { name: name.trim() },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    console.error('Update Category Error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete a category
// @route   DELETE /api/admin/categories/:id
// @access  Private (Admin only)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete Category Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all categories (Public)
// @route   GET /api/categories
// @access  Public
exports.getPublicCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 })
      .select('name');

    const categoryNames = categories.map(cat => cat.name);

    if (categoryNames.length === 0) {
      const fallbackCategories = [
        "Sports Nutrition",
        "Health Drinks",
        "Organic Tea",
        "Organic Spices",
        "Superfoods",
        "Baby Food",
        "Dry Fruits",
        "Organic Millet",
        "Organic Seeds",
        "Healthy Snacks",
        "Organic Pulses",
        "Natural Sweeteners",
        "Cooking Oils",
        "Dairy",
        "Gluten Free Pasta"
      ];
      
      return res.status(200).json({
        success: true,
        data: fallbackCategories,
        count: fallbackCategories.length
      });
    }

    res.status(200).json({
      success: true,
      data: categoryNames,
      count: categoryNames.length
    });
  } catch (error) {
    console.error('Get Public Categories Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all categories (Admin)
// @route   GET /api/admin/categories
// @access  Private (Admin only)
exports.getAdminCategories = async (req, res) => {
  try {
    const { search } = req.query;

    const filter = {};
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const categories = await Category.find(filter)
      .sort({ name: 1 })
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get Admin Categories Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Toggle category status
// @route   PATCH /api/admin/categories/:id/toggle
// @access  Private (Admin only)
exports.toggleCategoryStatus = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    category.isActive = !category.isActive;
    await category.save();

    res.status(200).json({
      success: true,
      message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
      data: category
    });
  } catch (error) {
    console.error('Toggle Category Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get categories for dropdown (Admin)
// @route   GET /api/admin/categories/list
// @access  Private (Admin only)
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 })
      .select('name');

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get Categories Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};