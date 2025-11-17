const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

const generateToken = (id, isAdmin = false) => {
  return jwt.sign({ id, isAdmin }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

exports.createFirstAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    const adminCount = await Admin.countDocuments();
    
    if (adminCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un administrador en el sistema',
        error: 'Admin already exists'
      });
    }
    
    const admin = await Admin.create({
      name,
      email,
      password,
      permissions: {
        manageUsers: true,
        viewStatistics: true
      }
    });
    
    const token = generateToken(admin._id, true);
    
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
