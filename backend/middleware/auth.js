const jwt = require('jsonwebtoken');
const db = require('../config/db');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;
  
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const tokenId = decoded.id;
    
    if (!tokenId || tokenId === undefined) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token: no user ID found'
      });
    }
    
    const Admin = require('../models/Admin');
    const admin = await Admin.findById(tokenId);
    
    if (admin) {
      req.user = admin;
      req.isAdmin = true;
      return next();
    }
    
    const [rows] = await db.query('SELECT * FROM users WHERE id_user = ?', [tokenId]);
    
    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'User not found with this ID'
      });
    }

    req.user = await User.findById_user(tokenId);
    req.isAdmin = false;

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

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (req.isAdmin) {
      return next();
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

exports.adminOnly = (req, res, next) => {
  if (!req.isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Only administrators can access this route'
    });
  }
  next();
};
