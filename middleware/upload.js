//// middleware/upload.js
//const multer = require('multer');
//const path = require('path');
//const fs = require('fs');
//
//// Ensure uploads directory exists
//const uploadDir = './uploads';
//if (!fs.existsSync(uploadDir)) {
//  fs.mkdirSync(uploadDir, { recursive: true });
//}
//
//// Ensure images directory exists
//const imageDir = './uploads/images';
//if (!fs.existsSync(imageDir)) {
//  fs.mkdirSync(imageDir, { recursive: true });
//}
//
//// Ensure videos directory exists
//const videoDir = './uploads/videos';
//if (!fs.existsSync(videoDir)) {
//  fs.mkdirSync(videoDir, { recursive: true });
//}
//
//// Configure storage
//// middleware/upload.js - Keep images in uploads/images/
//const storage = multer.diskStorage({
//  destination: function (req, file, cb) {
//    if (file.mimetype && file.mimetype.startsWith('video/')) {
//      cb(null, 'uploads/videos/');
//    } else if (file.mimetype && file.mimetype.startsWith('image/')) {
//      cb(null, 'uploads/images/');
//    } else {
//      cb(null, 'uploads/');
//    }
//  },
//  filename: function (req, file, cb) {
//    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//    const ext = path.extname(file.originalname);
//    const filename = file.fieldname + '-' + uniqueSuffix + ext;
//    cb(null, filename);
//  }
//});
//
//// File filter - allow images AND videos
//const fileFilter = (req, file, cb) => {
//  console.log('🔍 File filter - Fieldname:', file.fieldname);
//  console.log('🔍 File filter - Mimetype:', file.mimetype);
//  console.log('🔍 File filter - Originalname:', file.originalname);
//  
//  // Allowed image types
//  const allowedImageTypes = /jpeg|jpg|png|gif|webp|svg|bmp|tiff/;
//  // Allowed video types
//  const allowedVideoTypes = /mp4|webm|ogv|mov|avi|mkv|flv|wmv|m4v|3gp/;
//  
//  const extname = path.extname(file.originalname).toLowerCase();
//  const mimetype = file.mimetype;
//
//  // Check if it's an image
//  const isImage = allowedImageTypes.test(extname) && mimetype && mimetype.startsWith('image/');
//  
//  // Check if it's a video
//  const isVideo = allowedVideoTypes.test(extname) && mimetype && mimetype.startsWith('video/');
//
//  if (isImage || isVideo) {
//    console.log('✅ File accepted:', file.originalname);
//    return cb(null, true);
//  } else {
//    console.log('❌ File rejected:', file.originalname);
//    cb(new Error(`Only image and video files are allowed. Supported formats: Images (jpeg, jpg, png, gif, webp, svg, bmp, tiff) and Videos (mp4, webm, ogv, mov, avi, mkv, flv, wmv, m4v, 3gp)`));
//  }
//};
//
//// Create multer upload instance with file size limit for videos (100MB)
//const upload = multer({
//  storage: storage,
//  limits: {
//    fileSize: 100 * 1024 * 1024 // 100MB limit for videos
//  },
//  fileFilter: fileFilter
//});
//
//// Single file upload - expects field name 'image'
//const uploadSingle = upload.single('image');
//
//// Multiple file upload (for gallery)
//const uploadMultiple = upload.fields([
//  { name: 'image1', maxCount: 1 },
//  { name: 'image2', maxCount: 1 },
//  { name: 'image3', maxCount: 1 },
//  { name: 'video1', maxCount: 1 },
//  { name: 'video2', maxCount: 1 },
//  { name: 'video3', maxCount: 1 }
//]);
//
//module.exports = {
//  upload,
//  uploadSingle,
//  uploadMultiple
//};

// middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Ensure images directory exists
const imageDir = './uploads/images';
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

// Ensure videos directory exists
const videoDir = './uploads/videos';
if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir, { recursive: true });
}

// Configure storage
// middleware/upload.js - Keep images in uploads/images/
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype && file.mimetype.startsWith('video/')) {
      cb(null, 'uploads/videos/');
    } else if (file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, 'uploads/images/');
    } else {
      cb(null, 'uploads/');
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + ext;
    cb(null, filename);
  }
});

// File filter - allow images AND videos
const fileFilter = (req, file, cb) => {
  console.log('🔍 File filter - Fieldname:', file.fieldname);
  console.log('🔍 File filter - Mimetype:', file.mimetype);
  console.log('🔍 File filter - Originalname:', file.originalname);
  
  // Allowed image types
  const allowedImageTypes = /jpeg|jpg|png|gif|webp|svg|bmp|tiff/;
  // Allowed video types
  const allowedVideoTypes = /mp4|webm|ogv|mov|avi|mkv|flv|wmv|m4v|3gp/;
  
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  // Check if it's an image
  const isImage = allowedImageTypes.test(extname) && mimetype && mimetype.startsWith('image/');
  
  // Check if it's a video
  const isVideo = allowedVideoTypes.test(extname) && mimetype && mimetype.startsWith('video/');

  if (isImage || isVideo) {
    console.log('✅ File accepted:', file.originalname);
    return cb(null, true);
  } else {
    console.log('❌ File rejected:', file.originalname);
    cb(new Error(`Only image and video files are allowed. Supported formats: Images (jpeg, jpg, png, gif, webp, svg, bmp, tiff) and Videos (mp4, webm, ogv, mov, avi, mkv, flv, wmv, m4v, 3gp)`));
  }
};

// Create multer upload instance with file size limit for videos (100MB)
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for videos
  },
  fileFilter: fileFilter
});

// Single file upload - expects field name 'image'
const uploadSingle = upload.single('image');

// ✅ CORS FIX: Wrap multer so errors go to Express error handler (which adds CORS headers)
const uploadMultiple = (req, res, next) => {
  const uploader = upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'video1', maxCount: 1 },
    { name: 'video2', maxCount: 1 },
    { name: 'video3', maxCount: 1 }
  ]);
  
  uploader(req, res, (err) => {
    if (err) {
      console.error('❌ Multer error:', err.message);
      return next(err);
    }
    next();
  });
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple
};