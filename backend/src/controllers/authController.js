const User = require('../models/User');
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
    let { name, phoneNumber, password } = req.body;
    
    // Asegurar que password sea un string
    password = String(password);
    
    // Eliminar espacios en blanco
    password = password.trim();
    
    // Verificar si la contraseña contiene exactamente 4 dígitos
    const passwordRegex = /^\d{4}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe ser de 4 dígitos exactamente',
        error: 'Password must be exactly 4 digits'
      });
    }
    
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
    const token = generateToken(user.id);
    
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id: user.id,
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
    let { phoneNumber, password } = req.body;
    
    // Asegurar que password sea un string
    password = String(password);
    
    // Eliminar espacios en blanco
    password = password.trim();
    
    // Validate password is exactly 4 digits
    const passwordRegex = /^\d{4}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe ser de 4 dígitos exactamente',
        error: 'Password must be exactly 4 digits'
      });
    }
    
    // Check if user exists
    const user = await User.findOne({ phoneNumber });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas',
        error: 'Invalid credentials'
      });
    }
    
    // Check if password matches
    const isMatch = await User.matchPassword(user.id, password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas',
        error: 'Invalid credentials'
      });
    }
    
    // Create and return JWT token
    const token = generateToken(user.id);
    
    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      user: {
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        registeredAt: user.registeredAt,
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
    
    // Para administradores, permitimos contraseñas más complejas (no hay restricción de 4 dígitos)
    // Si quisieras aplicar la misma restricción, descomenta el código a continuación
    /*
    const passwordRegex = /^\d{4}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe ser de 4 dígitos exactamente',
        error: 'Password must be exactly 4 digits'
      });
    }
    */
    
    // Use the Admin model to find the admin by email
    const Admin = require('../models/Admin');
    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas',
        error: 'Invalid credentials'
      });
    }
    
    // Check if password matches
    const isMatch = await Admin.matchPassword(admin.id, password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas',
        error: 'Invalid credentials'
      });
    }
    
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

// @desc    Check if user exists by phone number
// @route   POST /api/auth/check-user
// @access  Public
exports.checkUser = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ phoneNumber });
    
    res.status(200).json({
      success: true,
      exists: !!user, // Convert to boolean
      message: user ? 'Usuario encontrado' : 'Usuario no encontrado',
      // Only return minimal info if user exists
      user: user ? { 
        id: user._id,
        phoneNumber: user.phoneNumber
      } : null
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
        registeredAt: user.registeredAt,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};
