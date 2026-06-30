// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  register,
  login,
  getMe,
  updateProfile
} = require('../controllers/userController');
const { protectUser } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/upload'); // Add this import

// Validation rules
const registerValidation = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidation = [
  body('email')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

// User Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protectUser, getMe);
router.put('/updateprofile', protectUser, updateProfile);

// Profile image upload route
router.post('/profile/upload-image', protectUser, uploadSingle, async (req, res) => {
  try {
    const User = require('../models/userModel');
    const fs = require('fs');
    const path = require('path');

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old profile image
    if (user.profileImage && user.profileImage !== 'default.jpg') {
      const oldImagePath = path.join(__dirname, '..', user.profileImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    user.profileImage = `/uploads/images/${req.file.filename}`;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Upload Profile Image Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

module.exports = router;