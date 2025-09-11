const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Create first admin (for setup only)
// @route   POST /api/setup/create-admin
// @access  Public (but can be restricted in production)
exports.createFirstAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if any admin exists
    const adminCount = await Admin.countDocuments();
    
    if (adminCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un administrador en el sistema',
        error: 'Admin already exists'
      });
    }
    
    // Create admin
    const admin = await Admin.create({
      name,
      email,
      password,
      permissions: {
        manageUsers: true,
        viewStatistics: true
      }
    });
    
    // Create and return JWT token
    const token = generateToken(admin._id);
    
    res.status(201).json({
      success: true,
      message: 'Administrador creado exitosamente',
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
