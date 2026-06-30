// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');

// Debug helper function
const debugAuth = (step, data = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`\n🔐 [${timestamp}] AUTH DEBUG - ${step}`);
  console.log('📊 Data:', JSON.stringify(data, null, 2));
  
  // Also log to a debug file if needed
  try {
    const fs = require('fs');
    const path = require('path');
    const logFile = path.join(__dirname, '../auth-debug.log');
    const logEntry = `[${timestamp}] ${step}: ${JSON.stringify(data)}\n`;
    fs.appendFileSync(logFile, logEntry);
  } catch (err) {
    // Silently fail if can't write to file
  }
};

// Check environment variables
const checkEnvironment = () => {
  const envChecks = {
    JWT_SECRET: process.env.JWT_SECRET ? '✅ Set' : '❌ MISSING',
    JWT_EXPIRE: process.env.JWT_EXPIRE || '⚠️ Using default (30d)',
    NODE_ENV: process.env.NODE_ENV || '⚠️ Not set (default: development)',
    MONGODB_URI: process.env.MONGODB_URI ? '✅ Set' : '❌ MISSING'
  };
  
  console.log('\n🔧 Environment Check:');
  Object.entries(envChecks).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });
  
  return envChecks;
};

// Run environment check on startup
checkEnvironment();

// Protect Admin routes
exports.protect = async (req, res, next) => {
  const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  debugAuth(`[${requestId}] protect() called`, {
    url: req.url,
    method: req.method,
    headers: {
      authorization: req.headers.authorization ? 'Bearer [PRESENT]' : 'MISSING',
      'content-type': req.headers['content-type']
    }
  });

  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    debugAuth(`[${requestId}] Token extracted`, { 
      tokenLength: token.length,
      tokenPreview: token.substring(0, 20) + '...'
    });
  } else {
    debugAuth(`[${requestId}] No token found in headers`);
  }

  // Check for token in cookies (optional)
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
    debugAuth(`[${requestId}] Token found in cookies`);
  }

  if (!token) {
    debugAuth(`[${requestId}] No token provided`);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
      debug: {
        requestId,
        hasAuthHeader: !!req.headers.authorization,
        hasCookie: !!(req.cookies && req.cookies.token)
      }
    });
  }

  try {
    // Verify JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      debugAuth(`[${requestId}] JWT_SECRET is missing from environment variables`);
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: JWT_SECRET not set',
        debug: { requestId }
      });
    }

    // Verify token
    debugAuth(`[${requestId}] Verifying token with JWT_SECRET`);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    debugAuth(`[${requestId}] Token verified successfully`, {
      decoded: {
        id: decoded.id,
        iat: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : 'N/A',
        exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'N/A'
      }
    });

    // Check if token is expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      debugAuth(`[${requestId}] Token has expired`);
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        debug: { requestId }
      });
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      debugAuth(`[${requestId}] MongoDB is not connected`, {
        readyState: mongoose.connection.readyState
      });
      return res.status(500).json({
        success: false,
        message: 'Database connection error',
        debug: { requestId }
      });
    }

    // Find admin user
    debugAuth(`[${requestId}] Searching for admin with ID: ${decoded.id}`);
    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin) {
      debugAuth(`[${requestId}] Admin not found in database`, { id: decoded.id });
      
      // Check if user exists in User collection (for debugging)
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        debugAuth(`[${requestId}] User found in User collection but not Admin`, {
          userId: user._id,
          email: user.email,
          role: user.role || 'user'
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Admin not found',
        debug: {
          requestId,
          userId: decoded.id,
          isUser: !!user
        }
      });
    }

    // Attach admin to request
    req.user = admin;
    req.userId = admin._id;
    
    debugAuth(`[${requestId}] Admin authenticated successfully`, {
      adminId: admin._id,
      email: admin.email,
      role: admin.role,
      name: admin.name
    });

    next();
  } catch (error) {
    debugAuth(`[${requestId}] Authentication error`, {
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack
    });

    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        debug: {
          requestId,
          errorType: 'JsonWebTokenError',
          details: error.message
        }
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        debug: {
          requestId,
          errorType: 'TokenExpiredError',
          expiredAt: error.expiredAt
        }
      });
    }

    // Generic error
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
      debug: {
        requestId,
        errorType: error.name,
        errorMessage: error.message
      }
    });
  }
};

// Protect User routes
exports.protectUser = async (req, res, next) => {
  const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  debugAuth(`[${requestId}] protectUser() called`, {
    url: req.url,
    method: req.method,
    headers: {
      authorization: req.headers.authorization ? 'Bearer [PRESENT]' : 'MISSING'
    }
  });

  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    debugAuth(`[${requestId}] Token extracted for user`);
  }

  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
    debugAuth(`[${requestId}] Token found in cookies for user`);
  }

  if (!token) {
    debugAuth(`[${requestId}] No token provided for user`);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: JWT_SECRET not set'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    debugAuth(`[${requestId}] User token verified`, { userId: decoded.id });

    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      debugAuth(`[${requestId}] User not found in database`, { userId: decoded.id });
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;
    debugAuth(`[${requestId}] User authenticated successfully`, {
      userId: user._id,
      email: user.email
    });

    next();
  } catch (error) {
    debugAuth(`[${requestId}] User authentication error`, {
      errorName: error.name,
      errorMessage: error.message
    });

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    debugAuth(`[${requestId}] authorize() called`, {
      requiredRoles: roles,
      userRole: req.user ? req.user.role : 'No user'
    });

    if (!req.user) {
      debugAuth(`[${requestId}] No user object in request`);
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      debugAuth(`[${requestId}] User role not authorized`, {
        userRole: req.user.role,
        requiredRoles: roles
      });
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    debugAuth(`[${requestId}] Authorization successful`, {
      userRole: req.user.role,
      requiredRoles: roles
    });
    next();
  };
};

// Debug endpoint to check auth status
exports.checkAuth = async (req, res) => {
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
      nodeEnv: process.env.NODE_ENV || 'development'
    },
    database: {
      connected: mongoose.connection.readyState === 1,
      readyState: mongoose.connection.readyState,
      name: mongoose.connection.name || 'Not connected'
    },
    headers: {
      authorization: req.headers.authorization ? 'Bearer [PRESENT]' : 'MISSING'
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
        const user = await User.findById(decoded.id).select('-password');
        debugInfo.user = {
          found: !!admin || !!user,
          asAdmin: !!admin,
          asUser: !!user,
          adminData: admin ? {
            id: admin._id,
            email: admin.email,
            role: admin.role,
            name: admin.name
          } : null,
          userData: user ? {
            id: user._id,
            email: user.email,
            name: user.name
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

// Check database connection
exports.checkDatabase = async (req, res) => {
  try {
    const adminCount = await Admin.countDocuments();
    const userCount = await User.countDocuments();
    
    res.json({
      success: true,
      database: {
        connected: mongoose.connection.readyState === 1,
        readyState: mongoose.connection.readyState,
        name: mongoose.connection.name,
        host: mongoose.connection.host,
        collections: {
          admins: adminCount,
          users: userCount
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};