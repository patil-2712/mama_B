// // routes/userRoutes.js
// const express = require('express');
// const router = express.Router();
// const { body } = require('express-validator');
// const {
//   register,
//   login,
//   getMe,
//   updateProfile
// } = require('../controllers/userController');
// const { protectUser } = require('../middleware/authMiddleware');
// const { uploadSingle } = require('../middleware/upload');
// const User = require('../models/userModel');
// const fs = require('fs');
// const path = require('path');

// // Validation rules
// const registerValidation = [
//   body('name')
//     .notEmpty().withMessage('Name is required')
//     .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
//   body('email')
//     .isEmail().withMessage('Please enter a valid email')
//     .normalizeEmail(),
//   body('password')
//     .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
// ];

// const loginValidation = [
//   body('email')
//     .isEmail().withMessage('Please enter a valid email')
//     .normalizeEmail(),
//   body('password')
//     .notEmpty().withMessage('Password is required')
// ];

// // User Routes
// router.post('/register', registerValidation, register);
// router.post('/login', loginValidation, login);
// router.get('/me', protectUser, getMe);
// router.put('/updateprofile', protectUser, updateProfile);

// // ✅ ADD THIS - Profile image upload route
// router.post('/profile/upload-image', protectUser, uploadSingle, async (req, res) => {
//   try {
//     console.log('📸 Profile image upload request received');
//     console.log('📸 File:', req.file);
//     console.log('📸 User ID:', req.user.id);

//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please upload an image'
//       });
//     }

//     const user = await User.findById(req.user.id);

//     if (!user) {
//       if (req.file) {
//         fs.unlinkSync(req.file.path);
//       }
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     // Delete old profile image if it exists and is not default
//     if (user.profileImage && user.profileImage !== 'default.jpg') {
//       const oldImagePath = path.join(__dirname, '..', user.profileImage);
//       console.log('🗑️ Deleting old image:', oldImagePath);
//       if (fs.existsSync(oldImagePath)) {
//         fs.unlinkSync(oldImagePath);
//         console.log('✅ Old image deleted');
//       }
//     }

//     // Update user with new image path
//     const imagePath = `/uploads/images/${req.file.filename}`;
//     user.profileImage = imagePath;
//     await user.save();

//     console.log('✅ Profile image saved successfully:', imagePath);

//     res.status(200).json({
//       success: true,
//       message: 'Profile image uploaded successfully',
//       data: {
//         profileImage: imagePath
//       }
//     });
//   } catch (error) {
//     if (req.file) {
//       try {
//         fs.unlinkSync(req.file.path);
//         console.log('🗑️ Deleted uploaded file due to error');
//       } catch (unlinkError) {
//         console.error('Error deleting file:', unlinkError);
//       }
//     }
//     console.error('❌ Upload Profile Image Error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server Error',
//       error: error.message
//     });
//   }
// });

// module.exports = router;
// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  register,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  verifyOTP,
  resetPassword,
  resendOTP
} = require('../controllers/userController');
const { protectUser } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/upload');
const User = require('../models/userModel');
const fs = require('fs');
const path = require('path');

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

// Forgot Password Validation
const forgotPasswordValidation = [
  body('email')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail()
];

const verifyOTPValidation = [
  body('email')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('otp')
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
];

const resetPasswordValidation = [
  body('newPassword')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your password')
];

// User Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protectUser, getMe);
router.put('/updateprofile', protectUser, updateProfile);

// Forgot Password Routes
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.post('/verify-otp', verifyOTPValidation, verifyOTP);
router.post('/reset-password', resetPasswordValidation, resetPassword);
router.post('/resend-otp', forgotPasswordValidation, resendOTP);

// Profile image upload
router.post('/profile/upload-image', protectUser, uploadSingle, async (req, res) => {
  try {
    console.log('📸 Profile image upload request received');
    console.log('📸 File:', req.file);
    console.log('📸 User ID:', req.user.id);

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
      console.log('🗑️ Deleting old image:', oldImagePath);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
        console.log('✅ Old image deleted');
      }
    }

    // Update user with new image path
    const imagePath = `/uploads/images/${req.file.filename}`;
    user.profileImage = imagePath;
    await user.save();

    console.log('✅ Profile image saved successfully:', imagePath);

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        profileImage: imagePath
      }
    });
  } catch (error) {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('🗑️ Deleted uploaded file due to error');
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    console.error('❌ Upload Profile Image Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

module.exports = router;