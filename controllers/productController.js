// controllers/productController.js
const Product = require('../models/productModel');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

// ============================================
// ADMIN CONTROLLER METHODS
// ============================================

// @desc    Create a product with image upload
// @route   POST /api/admin/products
// @access  Private (Admin only)
exports.createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) {
        const filePath = path.join(__dirname, '..', req.file.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { 
      name, 
      price, 
      discount, 
      description, 
      category, 
      badge, 
      inStock, 
      quantity 
    } = req.body;

    const existingProduct = await Product.findOne({ name: name.trim() });
    if (existingProduct) {
      if (req.file) {
        const filePath = path.join(__dirname, '..', req.file.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return res.status(400).json({
        success: false,
        message: 'Product with this name already exists'
      });
    }

    const imageUrl = req.file ? `/uploads/images/${req.file.filename}` : '';

    console.log('📸 Image saved at:', imageUrl);

    const product = await Product.create({
      name: name.trim(),
      price: parseFloat(price),
      discount: discount ? parseFloat(discount) : 0,
      description: description.trim(),
      category,
      image: imageUrl,
      badge: badge || '',
      inStock: inStock !== undefined ? inStock : true,
      quantity: quantity ? parseInt(quantity) : 0,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    if (req.file) {
      const filePath = path.join(__dirname, '..', req.file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    console.error('Create Product Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update product with image upload
// @route   PUT /api/admin/products/:id
// @access  Private (Admin only)
exports.updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) {
        const filePath = path.join(__dirname, '..', req.file.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    let product = await Product.findById(req.params.id);
    
    if (!product) {
      if (req.file) {
        const filePath = path.join(__dirname, '..', req.file.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const { 
      name, 
      price, 
      discount, 
      description, 
      category, 
      badge, 
      inStock, 
      quantity 
    } = req.body;

    if (name) {
      const existingProduct = await Product.findOne({ 
        name: name.trim(), 
        _id: { $ne: req.params.id } 
      });
      if (existingProduct) {
        if (req.file) {
          const filePath = path.join(__dirname, '..', req.file.path);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
        return res.status(400).json({
          success: false,
          message: 'Product with this name already exists'
        });
      }
    }

    if (req.file) {
      if (product.image) {
        const oldImagePath = path.join(__dirname, '..', product.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const updateData = {
      name: name ? name.trim() : product.name,
      price: price ? parseFloat(price) : product.price,
      discount: discount !== undefined ? parseFloat(discount) : product.discount,
      description: description ? description.trim() : product.description,
      category: category || product.category,
      badge: badge !== undefined ? badge : product.badge,
      inStock: inStock !== undefined ? inStock : product.inStock,
      quantity: quantity !== undefined ? parseInt(quantity) : product.quantity
    };

    if (req.file) {
      updateData.image = `/uploads/images/${req.file.filename}`;
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    if (req.file) {
      const filePath = path.join(__dirname, '..', req.file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    console.error('Update Product Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private (Admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.image) {
      const imagePath = path.join(__dirname, '..', product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete Product Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all products with pagination (Admin)
// @route   GET /api/admin/products
// @access  Private (Admin only)
exports.getProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      search, 
      sortBy = 'createdAt',
      sortOrder = 'desc' 
    } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get Products Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single product (Admin)
// @route   GET /api/admin/products/:id
// @access  Private (Admin only)
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get Product Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get product categories (Admin)
// @route   GET /api/admin/categories
// @access  Private (Admin only)
exports.getCategories = async (req, res) => {
  try {
    const Category = require('../models/categoryModel');
    const categories = await Category.find({ isActive: true }).select('name');
    const categoryNames = categories.map(cat => cat.name);

    if (categoryNames.length === 0) {
      const fallbackCategories = [
        'Sports Nutrition',
        'Health Drinks',
        'Organic Tea',
        'Organic Spices',
        'Superfoods',
        'Baby Food',
        'Dry Fruits',
        'Organic Millet',
        'Organic Seeds',
        'Healthy Snacks',
        'Organic Pulses',
        'Natural Sweeteners',
        'Cooking Oils',
        'Dairy',
        'Gluten Free Pasta'
      ];
      
      const shuffled = [...fallbackCategories].sort(() => 0.5 - Math.random());
      const random5 = shuffled.slice(0, 5);

      return res.status(200).json({
        success: true,
        data: fallbackCategories,
        random: random5
      });
    }

    const shuffled = [...categoryNames].sort(() => 0.5 - Math.random());
    const random5 = shuffled.slice(0, 5);

    res.status(200).json({
      success: true,
      data: categoryNames,
      random: random5
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

// ============================================
// PUBLIC CONTROLLER METHODS
// ============================================

// @desc    Get all products with pagination (Public)
// @route   GET /api/products
// @access  Public
exports.getPublicProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      search, 
      sortBy = 'createdAt',
      sortOrder = 'desc' 
    } = req.query;

    const filter = { inStock: true };
    
    if (category && category !== '') {
      filter.category = category;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-createdBy -__v');

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get Public Products Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single product (Public)
// @route   GET /api/products/:id
// @access  Public
exports.getPublicProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .select('-createdBy -__v');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.inStock) {
      return res.status(404).json({
        success: false,
        message: 'Product is currently out of stock'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get Public Product Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get categories that have products (Public)
// @route   GET /api/categories
// @access  Public
exports.getPublicCategories = async (req, res) => {
  try {
    // Get distinct categories from products that are in stock
    const products = await Product.find({ inStock: true }).distinct('category');
    
    let categoryNames = products
      .filter(cat => cat && cat.trim() !== '')
      .map(cat => cat.trim());

    // If no categories found, use fallback
    if (categoryNames.length === 0) {
      categoryNames = [
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
    }

    categoryNames.sort();

    // Get random 5 categories for the "random" section
    const shuffled = [...categoryNames].sort(() => 0.5 - Math.random());
    const random5 = shuffled.slice(0, 5);

    res.status(200).json({
      success: true,
      data: categoryNames,
      random: random5,
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