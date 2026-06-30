// routes/adminUserRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/userModel');

// ============ ADMIN USER MANAGEMENT FUNCTIONS ============

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getUsers = async (req, res) => {
  try {
    console.log('✅ Admin accessing users. Admin ID:', req.user._id);
    console.log('📋 Admin role:', req.user.role);
    
    const { 
      page = 1, 
      limit = 10, 
      search, 
      role, 
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc' 
    } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Query from User model (ecommerce users)
    const users = await User.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password');

    const total = await User.countDocuments(filter);

    console.log(`📊 Found ${users.length} users out of ${total} total`);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Get Users Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get user statistics (Admin only)
// @route   GET /api/admin/users/stats
// @access  Private (Admin only)
const getUserStats = async (req, res) => {
  try {
    console.log('✅ Admin accessing user stats. Admin ID:', req.user._id);
    
    const [totalUsers, activeUsers, inactiveUsers, suspendedUsers, adminUsers, regularUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'inactive' }),
      User.countDocuments({ status: 'suspended' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'user' })
    ]);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    console.log('📊 User stats:', { totalUsers, activeUsers, newUsers });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        suspendedUsers,
        adminUsers,
        regularUsers,
        newUsers
      }
    });
  } catch (error) {
    console.error('❌ Get User Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single user (Admin only)
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('❌ Get User Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update user (Admin only)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
const updateUser = async (req, res) => {
  try {
    console.log('📝 Admin updating user:', req.params.id);
    console.log('📝 Update data:', req.body);
    
    const { name, email, phone, address, role, status } = req.body;

    // Check if user exists
    const existingUser = await User.findById(req.params.id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        phone,
        address,
        role,
        status
      },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('❌ Update User Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    console.log('🗑️ Admin deleting user:', req.params.id);
    
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete User Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// ============ ROUTES ============
// All routes require admin authentication
router.route('/users')
  .get(protect, authorize('admin'), getUsers);

router.route('/users/stats')
  .get(protect, authorize('admin'), getUserStats);

router.route('/users/:id')
  .get(protect, authorize('admin'), getUser)
  .put(protect, authorize('admin'), updateUser)
  .delete(protect, authorize('admin'), deleteUser);

module.exports = router;