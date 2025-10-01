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
    // Find user by id
    // Cambia decoded.id_user por decoded.id si el token tiene la propiedad 'id'
    const userId = decoded.id_user || decoded.id;
    const [rows] = await db.query('SELECT * FROM users WHERE id_user = ?', [userId]);
    
    // If no user found
    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'User not found with this ID'
      });
    }

  req.user = await User.findById_user(userId);
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
