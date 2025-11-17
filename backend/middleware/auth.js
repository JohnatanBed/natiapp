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
    const isAdminToken = decoded.isAdmin === true;
    
    
    if (!tokenId || tokenId === undefined) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token: no user ID found'
      });
    }
    
    // Check admin first only if the token explicitly says it's an admin
    if (isAdminToken) {
      const Admin = require('../models/Admin');
      const admin = await Admin.findById(tokenId);
      
      if (admin) {
        // Ensure id_admin is properly set (PostgreSQL returns lowercase column names)
        req.user = {
          id_admin: admin.id_admin || tokenId,
          name: admin.name,
          email: admin.email,
          code_group: admin.code_group,
          role: admin.role,
          registeredAt: admin.registeredat || admin.registeredAt
        };
        req.isAdmin = true;
        return next();
      }
    }
    
    // Otherwise, look for a regular user
    
    const [rows] = await db.query('SELECT * FROM users WHERE id_user = ?', [tokenId]);
    
    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'User not found with this ID'
      });
    }

    const user = await User.findById_user(tokenId);
    req.isAdmin = false;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found with this ID'
      });
    }
    
    // Ensure id_user is properly set (PostgreSQL returns lowercase column names)
    req.user = {
      id_user: user.id_user || tokenId,
      name: user.name,
      phoneNumber: user.phonenumber || user.phoneNumber,
      role: user.role,
      code_group: user.code_group,
      registeredAt: user.registeredat || user.registeredAt
    };
    
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
