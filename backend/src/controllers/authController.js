const User = require('../models/User');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, phoneNumber, password } = req.body;
    
    // Check if user with phoneNumber already exists
    const userExists = await User.findOne({ phoneNumber });
    
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'El número de teléfono ya está registrado',
        error: 'Phone number already registered'
      });
    }
    
    // Create user
    const user = await User.create({
      name,
      phoneNumber,
      password
    });
    
    // Create and return JWT token
    const token = generateToken(user._id);
    
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        isActive: user.isActive,
        registeredAt: user.registeredAt
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { phoneNumber, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ phoneNumber }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas',
        error: 'Invalid credentials'
      });
    }
    
    // Check if password matches
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas',
        error: 'Invalid credentials'
      });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Create and return JWT token
    const token = generateToken(user._id);
    
    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      user: {
        id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        isActive: user.isActive,
        registeredAt: user.registeredAt,
        lastLogin: user.lastLogin
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin login
// @route   POST /api/auth/admin-login
// @access  Public
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Use the Admin model to find the admin by email
    const Admin = require('../models/Admin');
    const admin = await Admin.findOne({ 
      email
    }).select('+password');
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas',
        error: 'Invalid credentials'
      });
    }
    
    // Check if password matches
    const isMatch = await admin.matchPassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas',
        error: 'Invalid credentials'
      });
    }
    
    // Update last login
    admin.lastLogin = new Date();
    await admin.save();
    
    // Create and return JWT token
    const token = generateToken(admin._id);
    
    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    // If the request is from an admin (marked by auth middleware)
    if (req.isAdmin) {
      const admin = req.user;
      
      return res.status(200).json({
        success: true,
        isAdmin: true,
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
          registeredAt: admin.registeredAt,
          lastLogin: admin.lastLogin
        }
      });
    }
    
    // Regular user
    const user = req.user;
    
    res.status(200).json({
      success: true,
      isAdmin: false,
      user: {
        id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        isActive: user.isActive,
        registeredAt: user.registeredAt,
        lastLogin: user.lastLogin,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};
