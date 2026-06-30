// controllers/adminController.js
const Admin = require('../models/adminModel');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Register user (with role set to admin by default)
// @route   POST /api/admin/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, password, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await Admin.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user with admin role by default
    const user = await Admin.create({
      name,
      email,
      password,
      phone: phone || '',
      address: address || {},
      role: 'admin',
      isVerified: true // Auto-verify for testing
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/admin/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('\n🔐 === LOGIN ATTEMPT ===');
    console.log('📧 Email:', email);
    console.log('🔑 Password provided:', password ? 'Yes' : 'No');
    console.log('🔑 Password length:', password ? password.length : 0);

    // Validate email & password
    if (!email || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user
    console.log('🔍 Looking for user in database...');
    const user = await Admin.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found with email:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('✅ User found:', {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      hashedPassword: user.password ? 'Yes' : 'No',
      hashedPasswordLength: user.password ? user.password.length : 0,
      hashedPasswordPreview: user.password ? user.password.substring(0, 20) + '...' : 'N/A'
    });

    // Check if password matches
    console.log('🔐 Verifying password...');
    const isPasswordMatch = await user.matchPassword(password);
    console.log('📊 Password match result:', isPasswordMatch);
    
    // Also test with bcrypt directly for debugging
    const directCompare = await bcrypt.compare(password, user.password);
    console.log('📊 Direct bcrypt compare:', directCompare);

    if (!isPasswordMatch) {
      console.log('❌ Password mismatch for user:', email);
      console.log('💡 Tip: Make sure you\'re using the correct password');
      
      // Check if password might be admin@1234 (common default)
      if (password === 'admin@1234') {
        console.log('💡 You tried "admin@1234" but it didn\'t work.');
        console.log('💡 Try resetting the password using the reset script.');
      }
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate token
    const token = generateToken(user._id);
    console.log('✅ Login successful for:', email);
    console.log('🎫 Token generated:', token.substring(0, 30) + '...');

    res.status(200).json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/admin/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await Admin.findById(req.user.id);
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
    console.error('Get Me Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update user details
// @route   PUT /api/admin/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await Admin.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update Details Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update password
// @route   PUT /api/admin/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const user = await Admin.findById(req.user.id).select('+password');

    // Check current password
    const isPasswordMatch = await user.matchPassword(req.body.currentPassword);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Forgot password
// @route   POST /api/admin/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const user = await Admin.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Get reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
      resetToken
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Reset password
// @route   PUT /api/admin/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await Admin.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Verify password (Debug endpoint)
// @route   POST /api/admin/auth/debug/verify-password
// @access  Public
exports.verifyPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('\n🔍 === PASSWORD VERIFICATION ===');
    console.log('📧 Email:', email);
    console.log('🔑 Password provided:', password ? 'Yes' : 'No');
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    // Find user
    const user = await Admin.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      return res.json({
        success: false,
        message: 'User not found',
        debug: { email }
      });
    }
    
    console.log('✅ User found:', {
      id: user._id,
      email: user.email,
      name: user.name,
      hashedPassword: user.password ? 'Yes' : 'No',
      hashLength: user.password ? user.password.length : 0
    });
    
    // Test bcrypt comparison
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('📊 bcrypt.compare result:', isMatch);
    
    // Also test with the matchPassword method
    const isMatchMethod = await user.matchPassword(password);
    console.log('📊 matchPassword method result:', isMatchMethod);
    
    res.json({
      success: true,
      debug: {
        userFound: true,
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        passwordMatch: isMatch,
        passwordMatchMethod: isMatchMethod,
        hashedPasswordLength: user.password.length,
        passwordProvided: !!password,
        passwordLength: password ? password.length : 0,
        // Don't send actual hash or password for security
      }
    });
  } catch (error) {
    console.error('Error verifying password:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Reset password directly (Debug endpoint)
// @route   POST /api/admin/auth/debug/reset-password
// @access  Public
exports.debugResetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    console.log('\n🔧 === DEBUG PASSWORD RESET ===');
    console.log('📧 Email:', email);
    console.log('🔑 New Password:', newPassword || 'Not provided');
    
    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and newPassword'
      });
    }
    
    // Find user
    const user = await Admin.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    user.password = hashedPassword;
    await user.save();
    
    console.log('✅ Password updated successfully');
    
    // Verify the new password works
    const verifyMatch = await bcrypt.compare(newPassword, user.password);
    console.log('🔐 Verification:', verifyMatch ? '✅ PASSED' : '❌ FAILED');
    
    res.json({
      success: true,
      message: 'Password reset successfully',
      debug: {
        email: email,
        passwordSet: newPassword,
        verificationPassed: verifyMatch
      }
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Check auth status (Debug endpoint)
// @route   GET /api/admin/auth/debug/status
// @access  Public
exports.debugAuthStatus = async (req, res) => {
  const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
  
  const debugInfo = {
    timestamp: new Date().toISOString(),
    token: {
      present: !!token,
      length: token ? token.length : 0,
      preview: token ? token.substring(0, 20) + '...' : 'N/A'
    },
    environment: {
      jwtSecret: process.env.JWT_SECRET ? '✅ Set' : '❌ MISSING',
      jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
      jwtExpire: process.env.JWT_EXPIRE || '30d',
      nodeEnv: process.env.NODE_ENV || 'development'
    },
    database: {
      connected: require('mongoose').connection.readyState === 1,
      readyState: require('mongoose').connection.readyState,
      name: require('mongoose').connection.name || 'Not connected'
    }
  };

  // Try to verify token if present
  if (token && process.env.JWT_SECRET) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      debugInfo.token.verified = true;
      debugInfo.token.decoded = {
        id: decoded.id,
        iat: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : 'N/A',
        exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'N/A',
        isExpired: decoded.exp ? Date.now() >= decoded.exp * 1000 : 'N/A'
      };
      
      // Check if user exists
      if (decoded.id) {
        const admin = await Admin.findById(decoded.id).select('-password');
        debugInfo.user = {
          found: !!admin,
          adminData: admin ? {
            id: admin._id,
            email: admin.email,
            role: admin.role,
            name: admin.name
          } : null
        };
      }
    } catch (error) {
      debugInfo.token.verified = false;
      debugInfo.token.error = {
        name: error.name,
        message: error.message
      };
    }
  }

  res.json({
    success: true,
    debug: debugInfo
  });
};

// @desc    Check database status (Debug endpoint)
// @route   GET /api/admin/auth/debug/database
// @access  Public
exports.debugDatabase = async (req, res) => {
  try {
    const adminCount = await Admin.countDocuments();
    const userCount = await User.countDocuments();
    
    // Get all admin emails (for debugging)
    const admins = await Admin.find({}, { email: 1, name: 1, role: 1, _id: 1 });
    
    res.json({
      success: true,
      database: {
        connected: require('mongoose').connection.readyState === 1,
        readyState: require('mongoose').connection.readyState,
        name: require('mongoose').connection.name,
        host: require('mongoose').connection.host,
        collections: {
          admins: adminCount,
          users: userCount
        }
      },
      admins: admins.map(a => ({
        id: a._id,
        email: a.email,
        name: a.name,
        role: a.role
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Environment check (Debug endpoint)
// @route   GET /api/admin/auth/debug/env
// @access  Public
exports.debugEnv = (req, res) => {
  res.json({
    success: true,
    environment: {
      jwtSecret: process.env.JWT_SECRET ? '✅ Set' : '❌ Not Set',
      jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
      jwtExpire: process.env.JWT_EXPIRE || 'Not Set (using default: 30d)',
      nodeEnv: process.env.NODE_ENV || 'Not Set (default: development)',
      mongoUri: process.env.MONGODB_URI ? '✅ Set' : '❌ Not Set',
      port: process.env.PORT || '5000'
    }
  });
};