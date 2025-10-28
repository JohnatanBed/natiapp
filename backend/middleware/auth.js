const jwt = require('jsonwebtoken');
const db = require('../config/db');
const User = require('../models/User');

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

  console.log("Token recibido en el middleware auth:", token);
  
  // Check if token exists
  if (!token) {
    console.log("No token provided");
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decodificado:", decoded);
    
    // The token contains 'id' which could be id_user or id_admin
    const tokenId = decoded.id;
    
    // Validate that tokenId exists
    if (!tokenId || tokenId === undefined) {
      console.log("No ID found in token:", decoded);
      return res.status(401).json({
        success: false,
        error: 'Invalid token: no user ID found'
      });
    }
    
    console.log("Token ID extraído:", tokenId);
    
    // First, try to find in admins table
    const Admin = require('../models/Admin');
    const admin = await Admin.findById(tokenId);
    
    if (admin) {
      // User is an admin
      req.user = admin;
      req.isAdmin = true;
      console.log('Administrador encontrado:', admin);
      return next();
    }
    
    // If not admin, try to find in users table
    const [rows] = await db.query('SELECT * FROM users WHERE id_user = ?', [tokenId]);
    
    // If no user found in either table
    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'User not found with this ID'
      });
    }

    req.user = await User.findById_user(tokenId);
    req.isAdmin = false;
    console.log('Usuario encontrado:', req.user);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not found with this ID'
      });
    }
    
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
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
