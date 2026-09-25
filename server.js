////// server.js - COMPLETE FIXED VERSION
////const express = require('express');
////const cors = require('cors');
////const dotenv = require('dotenv');
////const path = require('path');
////const mongoose = require('mongoose'); // ✅ ADD THIS IMPORT
////const connectDB = require('./config/db');
////
////// Load env vars
////dotenv.config();
////
////// Connect to database
////connectDB();
////
////const app = express();
////
////// ============================================
////// MIDDLEWARE
////// ============================================
////
////// CORS Configuration
////app.use(cors({
////  origin: [
////	   'https://maisfood.in',
////    'https://www.maisfood.in',
////    'http://localhost:3000',
////    'http://localhost:3001',
////    'http://localhost:5173',
////    'http://localhost:5174',
////    'http://localhost:8080'
////  ],
////  credentials: true,
////  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
////  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
////}));
////
////// Body Parser
////app.use(express.json({ limit: '50mb' }));
////app.use(express.urlencoded({ extended: true, limit: '50mb' }));
////
////// Serve static files (uploads)
////app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
////
////// Request logging (development only)
////if (process.env.NODE_ENV === 'development') {
////  app.use((req, res, next) => {
////    console.log(`📝 ${req.method} ${req.url}`);
////    next();
////  });
////}
////
////// ============================================
////// MOUNT ROUTES
////// ============================================
////app.use('/api', require('./routes/galleryRoutes'));
////// ---------- PUBLIC ROUTES (No authentication) ----------
////console.log('\n🔓 Mounting Public Routes...');
////
////// Banner Routes - Public
////app.use('/api', require('./routes/bannerRoutes'));
////
////// Gallery Routes - Public
////app.use('/api', require('./routes/galleryRoutes'));
////
////// About Routes - Public
////app.use('/api', require('./routes/aboutRoutes'));
////
////// Testimonial Routes - Public
////app.use('/api', require('./routes/testimonialRoutes'));
////
////// Product Routes - Public (GET only)
////app.use('/api', require('./routes/productRoutes'));
////
////// Category Routes - Public (GET only)
////app.use('/api', require('./routes/categoryRoutes'));
////
////// Contact Routes - Public (POST only)
////app.use('/api', require('./routes/contactRoutes'));
////
////// ---------- AUTH ROUTES ----------
////console.log('🔐 Mounting Auth Routes...');
////
////// User Authentication Routes
////app.use('/api/auth', require('./routes/userRoutes'));
////
////// Admin Authentication Routes
////app.use('/api/admin/auth', require('./routes/adminRoutes'));
////
////// ---------- PROTECTED ROUTES (Require Authentication) ----------
////console.log('🛡️ Mounting Protected Routes...');
////
////// Order Routes - User (Requires user authentication)
////app.use('/api/orders', require('./routes/orderRoutes'));
////
////// Admin Order Routes (Requires admin authentication)
////app.use('/api/admin', require('./routes/adminOrderRoutes'));
////
////// Admin User Management Routes (Requires admin authentication)
////app.use('/api/admin', require('./routes/adminUserRoutes'));
////
////// ============================================
////// HEALTH CHECK & ROOT ROUTES
////// ============================================
////
////// Health check endpoint
////app.get('/health', (req, res) => {
////  const dbState = mongoose.connection.readyState;
////  const dbStates = {
////    0: 'disconnected',
////    1: 'connected',
////    2: 'connecting',
////    3: 'disconnecting'
////  };
////  
////  res.status(200).json({
////    status: 'OK',
////    timestamp: new Date().toISOString(),
////    uptime: process.uptime(),
////    memory: process.memoryUsage(),
////    environment: process.env.NODE_ENV || 'development',
////    database: {
////      connected: dbState === 1,
////      state: dbStates[dbState] || 'unknown',
////      name: mongoose.connection.name || 'Not connected',
////      host: mongoose.connection.host || 'Not connected'
////    }
////  });
////});
////
////// Root route
////app.get('/', (req, res) => {
////  res.json({
////    success: true,
////    message: 'Assure Organic Zone API is running',
////    version: '1.0.0',
////    environment: process.env.NODE_ENV || 'development',
////    timestamp: new Date().toISOString(),
////    documentation: {
////      public_routes: {
////        products: '/api/products',
////        categories: '/api/categories',
////        banners: '/api/banners',
////        gallery: '/api/gallery',
////        about: '/api/about',
////        testimonials: '/api/testimonials',
////        contact: '/api/contact'
////      },
////      auth_routes: {
////        user_register: '/api/auth/register',
////        user_login: '/api/auth/login',
////        admin_register: '/api/admin/auth/register',
////        admin_login: '/api/admin/auth/login'
////      },
////      protected_routes: {
////        orders: '/api/orders',
////        admin_orders: '/api/admin/orders',
////        admin_users: '/api/admin/users'
////      }
////    }
////  });
////});
////app.use('/api/auth', require('./routes/userRoutes'));
////
////// Admin Authentication Routes
////app.use('/api/admin/auth', require('./routes/adminRoutes'));
////
////app.use('/api/admin', require('./routes/bannerRoutes'));
////// ============================================
////// ERROR HANDLING
////// ============================================
////
////// ✅ ADD THIS LINE - Serve images from the images subfolder too!
////app.use('/uploads', express.static(path.join(__dirname, 'uploads/images')));
////
////// Also serve videos if needed
////app.use('/uploads', express.static(path.join(__dirname, 'uploads/videos')));
////app.use('/api', require('./routes/customerContactRoutes'));
////// 404 Not Found Handler
////app.use((req, res) => {
////  console.log(`❌ 404 Not Found: ${req.method} ${req.originalUrl}`);
////  res.status(404).json({
////    success: false,
////    message: `Route ${req.originalUrl} not found`,
////    method: req.method,
////    available_routes: {
////      public: [
////        '/api/products',
////        '/api/categories',
////        '/api/banners',
////        '/api/banners/active',
////        '/api/gallery',
////        '/api/about',
////        '/api/testimonials',
////        '/api/contact'
////      ],
////      auth: [
////        '/api/auth/register',
////        '/api/auth/login',
////        '/api/admin/auth/register',
////        '/api/admin/auth/login'
////      ],
////      protected: [
////        '/api/orders',
////        '/api/admin/orders',
////        '/api/admin/users'
////      ]
////    }
////  });
////});
////
////// Global Error Handler
////app.use((err, req, res, next) => {
////  console.error('❌ Server Error:', err.stack);
////  
////  // Handle specific error types
////  if (err.name === 'ValidationError') {
////    return res.status(400).json({
////      success: false,
////      message: 'Validation Error',
////      errors: Object.values(err.errors).map(e => e.message)
////    });
////  }
////  
////  if (err.name === 'CastError') {
////    return res.status(400).json({
////      success: false,
////      message: 'Invalid ID format',
////      error: err.message
////    });
////  }
////  
////  if (err.code === 11000) {
////    return res.status(400).json({
////      success: false,
////      message: 'Duplicate field value entered',
////      field: Object.keys(err.keyPattern)[0]
////    });
////  }
////  
////  // Default error
////  res.status(500).json({
////    success: false,
////    message: 'Something went wrong!',
////    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
////  });
////});
////
////// ============================================
////// START SERVER
////// ============================================
////
////const PORT = process.env.PORT || 5000;
////
////const server = app.listen(PORT, () => {
////  console.log('\n' + '='.repeat(60));
////  console.log(`🚀 Server running on port ${PORT}`);
////  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
////  console.log(`📅 Started at: ${new Date().toISOString()}`);
////  console.log('='.repeat(60));
////  
////  console.log('\n📍 PUBLIC ROUTES:');
////  console.log(`   ├── Products:      http://localhost:${PORT}/api/products`);
////  console.log(`   ├── Categories:    http://localhost:${PORT}/api/categories`);
////  console.log(`   ├── Banners:       http://localhost:${PORT}/api/banners`);
////  console.log(`   ├── Banners Active: http://localhost:${PORT}/api/banners/active`);
////  console.log(`   ├── Gallery:       http://localhost:${PORT}/api/gallery`);
////  console.log(`   ├── About:         http://localhost:${PORT}/api/about`);
////  console.log(`   ├── Testimonials:  http://localhost:${PORT}/api/testimonials`);
////  console.log(`   └── Contact:       http://localhost:${PORT}/api/contact`);
////  
////  console.log('\n🔐 AUTH ROUTES:');
////  console.log(`   ├── User Register: http://localhost:${PORT}/api/auth/register`);
////  console.log(`   ├── User Login:    http://localhost:${PORT}/api/auth/login`);
////  console.log(`   ├── Admin Register: http://localhost:${PORT}/api/admin/auth/register`);
////  console.log(`   └── Admin Login:   http://localhost:${PORT}/api/admin/auth/login`);
////  
////  console.log('\n🛡️ PROTECTED ROUTES:');
////  console.log(`   ├── User Orders:   http://localhost:${PORT}/api/orders`);
////  console.log(`   ├── Admin Orders:  http://localhost:${PORT}/api/admin/orders`);
////  console.log(`   └── Admin Users:   http://localhost:${PORT}/api/admin/users`);
////  
////  // Check database connection status
////  const dbState = mongoose.connection.readyState;
////  const dbStates = {
////    0: 'disconnected',
////    1: 'connected',
////    2: 'connecting',
////    3: 'disconnecting'
////  };
////  
////  console.log('\n📊 DATABASE:');
////  if (dbState === 1) {
////    console.log(`   └── ✅ Connected to ${mongoose.connection.name} on ${mongoose.connection.host}`);
////  } else if (dbState === 2) {
////    console.log(`   └── ⏳ Connecting to database...`);
////  } else {
////    console.log(`   └── ❌ Database ${dbStates[dbState] || 'unknown state'}`);
////  }
////  
////  console.log('\n' + '='.repeat(60));
////  console.log('✅ Server is ready to accept requests');
////  console.log('='.repeat(60) + '\n');
////});
////
////// ============================================
////// GRACEFUL SHUTDOWN
////// ============================================
////
////// Handle unhandled promise rejections
////process.on('unhandledRejection', (err) => {
////  console.log('❌ UNHANDLED REJECTION! 💥 Shutting down...');
////  console.log(err.name, err.message);
////  server.close(() => {
////    process.exit(1);
////  });
////});
////
////// Handle uncaught exceptions
////process.on('uncaughtException', (err) => {
////  console.log('❌ UNCAUGHT EXCEPTION! 💥 Shutting down...');
////  console.log(err.name, err.message);
////  console.log(err.stack);
////  server.close(() => {
////    process.exit(1);
////  });
////});
////
////// Handle SIGTERM
////process.on('SIGTERM', () => {
////  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
////  server.close(() => {
////    console.log('💥 Process terminated!');
////  });
////});
////
////// Handle SIGINT (Ctrl+C)
////process.on('SIGINT', () => {
////  console.log('\n👋 SIGINT RECEIVED. Shutting down gracefully');
////  server.close(() => {
////    console.log('💥 Process terminated!');
////    process.exit(0);
////  });
////});
////
////// Export for testing
////module.exports = { app, server };
//
//// server.js - FULLY WORKING VERSION
//const express = require('express');
//const cors = require('cors');
//const dotenv = require('dotenv');
//const path = require('path');
//const mongoose = require('mongoose');
//const connectDB = require('./config/db');
//
//dotenv.config();
//connectDB();
//
//const app = express();
//
//// ============================================
//// MIDDLEWARE
//// ============================================
//app.use(cors({
//  origin: [
//    'https://maisfood.in',
//    'https://www.maisfood.in',
//    'http://localhost:3000',
//    'http://localhost:3001',
//    'http://localhost:5173',
//    'http://localhost:5174',
//    'http://localhost:8080'
//  ],
//  credentials: true,
//  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
//}));
//
//app.use(express.json({ limit: '50mb' }));
//app.use(express.urlencoded({ extended: true, limit: '50mb' }));
//
//// ✅ ONE static serving route — correct
//app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//
//if (process.env.NODE_ENV === 'development') {
//  app.use((req, res, next) => {
//    console.log(`📝 ${req.method} ${req.url}`);
//    next();
//  });
//}
//
//// ============================================
//// MOUNT ROUTES
//// ============================================
//console.log('\n🔓 Mounting Public Routes...');
//
//// ✅ GALLERY FIRST — CRITICAL
//app.use('/api', require('./routes/galleryRoutes'));
//
//// Then the rest
//app.use('/api', require('./routes/bannerRoutes'));
//app.use('/api', require('./routes/aboutRoutes'));
//app.use('/api', require('./routes/testimonialRoutes'));
//app.use('/api', require('./routes/productRoutes'));
//app.use('/api', require('./routes/categoryRoutes'));
//app.use('/api', require('./routes/contactRoutes'));
//app.use('/api', require('./routes/customerContactRoutes'));
//
//console.log('🔐 Mounting Auth Routes...');
//app.use('/api/auth', require('./routes/userRoutes'));
//app.use('/api/admin/auth', require('./routes/adminRoutes'));
//
//console.log('🛡️ Mounting Protected Routes...');
//app.use('/api/orders', require('./routes/orderRoutes'));
//app.use('/api/admin', require('./routes/adminOrderRoutes'));
//app.use('/api/admin', require('./routes/adminUserRoutes'));
//
//// ⚠️ DO NOT re-mount bannerRoutes at /api/admin — that was the bug
//
//// ============================================
//// HEALTH & ROOT
//// ============================================
//app.get('/health', (req, res) => {
//  const dbState = mongoose.connection.readyState;
//  const dbStates = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
//
//  res.status(200).json({
//    status: 'OK',
//    timestamp: new Date().toISOString(),
//    uptime: process.uptime(),
//    environment: process.env.NODE_ENV || 'development',
//    database: {
//      connected: dbState === 1,
//      state: dbStates[dbState] || 'unknown',
//      name: mongoose.connection.name || 'Not connected',
//      host: mongoose.connection.host || 'Not connected'
//    }
//  });
//});
//
//app.get('/', (req, res) => {
//  res.json({ success: true, message: 'MaisFood API is running', version: '1.0.0' });
//});
//
//// ============================================
//// ERROR HANDLING
//// ============================================
//app.use((req, res) => {
//  console.log(`❌ 404 Not Found: ${req.method} ${req.originalUrl}`);
//  res.status(404).json({
//    success: false,
//    message: `Route ${req.originalUrl} not found`,
//    method: req.method
//  });
//});
//
//app.use((err, req, res, next) => {
//  console.error('❌ Server Error:', err.stack);
//
//  if (err.name === 'ValidationError') {
//    return res.status(400).json({
//      success: false,
//      message: 'Validation Error',
//      errors: Object.values(err.errors).map(e => e.message)
//    });
//  }
//
//  if (err.name === 'CastError') {
//    return res.status(400).json({ success: false, message: 'Invalid ID format' });
//  }
//
//  if (err.code === 11000) {
//    return res.status(400).json({
//      success: false,
//      message: 'Duplicate field value entered',
//      field: Object.keys(err.keyPattern)[0]
//    });
//  }
//
//  if (err.code === 'LIMIT_FILE_SIZE') {
//    return res.status(413).json({
//      success: false,
//      message: 'File too large. Maximum size is 100MB.'
//    });
//  }
//
//  res.status(500).json({
//    success: false,
//    message: 'Something went wrong!',
//    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
//  });
//});
//
//// ============================================
//// START SERVER
//// ============================================
//const PORT = process.env.PORT || 5000;
//
//const server = app.listen(PORT, () => {
//  console.log('\n' + '='.repeat(60));
//  console.log(`🚀 Server running on port ${PORT}`);
//  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
//
//  const dbState = mongoose.connection.readyState;
//  if (dbState === 1) {
//    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
//    console.log(`📊 Database Name: ${mongoose.connection.name}`);
//  }
//  console.log('='.repeat(60) + '\n');
//});
//
//process.on('unhandledRejection', (err) => {
//  console.log('❌ UNHANDLED REJECTION! 💥');
//  console.log(err.name, err.message);
//  server.close(() => process.exit(1));
//});
//
//process.on('uncaughtException', (err) => {
//  console.log('❌ UNCAUGHT EXCEPTION! 💥');
//  console.log(err.name, err.message);
//  server.close(() => process.exit(1));
//});
//
//process.on('SIGTERM', () => server.close(() => console.log('💥 Process terminated!')));
//process.on('SIGINT', () => server.close(() => process.exit(0)));
//
//module.exports = { app, server };


// server.js - FULLY WORKING VERSION
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({
  origin: [
    'https://maisfood.in',
    'https://www.maisfood.in',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:8080'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ✅ CORS FIX: Explicitly handle OPTIONS for all routes — BEFORE route mounting
app.options('*', cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ✅ ONE static serving route — correct
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`📝 ${req.method} ${req.url}`);
    next();
  });
}

// ============================================
// MOUNT ROUTES
// ============================================
console.log('\n🔓 Mounting Public Routes...');

// ✅ GALLERY FIRST — CRITICAL
app.use('/api', require('./routes/galleryRoutes'));

// Then the rest
app.use('/api', require('./routes/bannerRoutes'));
app.use('/api', require('./routes/aboutRoutes'));
app.use('/api', require('./routes/testimonialRoutes'));
app.use('/api', require('./routes/productRoutes'));
app.use('/api', require('./routes/categoryRoutes'));
app.use('/api', require('./routes/contactRoutes'));
app.use('/api', require('./routes/customerContactRoutes'));

console.log('🔐 Mounting Auth Routes...');
app.use('/api/auth', require('./routes/userRoutes'));
app.use('/api/admin/auth', require('./routes/adminRoutes'));

console.log('🛡️ Mounting Protected Routes...');
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminOrderRoutes'));
app.use('/api/admin', require('./routes/adminUserRoutes'));

// ⚠️ DO NOT re-mount bannerRoutes at /api/admin — that was the bug

// ============================================
// HEALTH & ROOT
// ============================================
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStates = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      connected: dbState === 1,
      state: dbStates[dbState] || 'unknown',
      name: mongoose.connection.name || 'Not connected',
      host: mongoose.connection.host || 'Not connected'
    }
  });
});

app.get('/', (req, res) => {
  res.json({ success: true, message: 'MaisFood API is running', version: '1.0.0' });
});

// ============================================
// ERROR HANDLING
// ============================================
app.use((req, res) => {
  console.log(`❌ 404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    method: req.method
  });
});

app.use((err, req, res, next) => {
  // ✅ CORS FIX: Re-apply CORS headers on every error
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://maisfood.in',
    'https://www.maisfood.in',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:8080'
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  }
  
  console.error('❌ Server Error:', err.stack);

  // ✅ CORS FIX: Handle Multer errors (so they don't bypass CORS)
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
      field: err.field
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate field value entered',
      field: Object.keys(err.keyPattern)[0]
    });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'File too large. Maximum size is 100MB.'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

  const dbState = mongoose.connection.readyState;
  if (dbState === 1) {
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
    console.log(`📊 Database Name: ${mongoose.connection.name}`);
  }
  console.log('='.repeat(60) + '\n');
});

process.on('unhandledRejection', (err) => {
  console.log('❌ UNHANDLED REJECTION! 💥');
  console.log(err.name, err.message);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.log('❌ UNCAUGHT EXCEPTION! 💥');
  console.log(err.name, err.message);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => server.close(() => console.log('💥 Process terminated!')));
process.on('SIGINT', () => server.close(() => process.exit(0)));

module.exports = { app, server };