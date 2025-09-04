const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

// Protect routes - middleware to check if user is authenticated
exports.protect = async (req, res, next) => {
  let token;
  
  // Check if authorization header is present and starts with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extract token from header
    token = req.headers.authorization.split(' ')[1];
  }
  
  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Try to find a regular user first
    req.user = await User.findById(decoded.id);
    
    // If not a regular user, check if it's an admin
    if (!req.user) {
      req.user = await Admin.findById(decoded.id);
      
      // If found an admin, mark the request as admin
      if (req.user) {
        req.isAdmin = true;
      }
    }
    
    // If no user or admin found
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not found with this ID'
      });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // For admins, always allow access
    if (req.isAdmin) {
      return next();
    }
    
    // For regular users, check role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Admin only routes
exports.adminOnly = (req, res, next) => {
  if (!req.isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Only administrators can access this route'
    });
  }
  next();
};
