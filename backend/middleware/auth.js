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

  console.log("Token recibido en el middleware auth:", token);
  
  if (!token) {
    console.log("No token provided");
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decodificado:", decoded);
    
    const tokenId = decoded.id;
    
    if (!tokenId || tokenId === undefined) {
      console.log("No ID found in token:", decoded);
      return res.status(401).json({
        success: false,
        error: 'Invalid token: no user ID found'
      });
    }
    
    console.log("Token ID extraído:", tokenId);
    
    const Admin = require('../models/Admin');
    const admin = await Admin.findById(tokenId);
    
    if (admin) {
      req.user = admin;
      req.isAdmin = true;
      console.log('Administrador encontrado:', admin);
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
