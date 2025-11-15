const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

exports.register = async (req, res, next) => {
  try {
    let { name, phoneNumber, password } = req.body;
    
    password = String(password);
    password = password.trim();
    
    const passwordRegex = /^\d{4}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe ser de 4 dígitos exactamente',
        error: 'Password must be exactly 4 digits'
      });
    }
    
    const userExists = await User.findOne({ phoneNumber });
    
    if (userExists) {
      console.log('[Backend] Registration blocked - user already exists:', phoneNumber);
      return res.status(400).json({
        success: false,
        message: 'El número de teléfono ya está registrado',
        error: 'Phone number already registered'
      });
    }
    
    const user = await User.create({
      name,
      phoneNumber,
      password
    });
        
    const token = generateToken(user.id_user);
    
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id_user: user.id_user,
        name: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role,
        registeredAt: user.registeredAt
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    let { phoneNumber, password } = req.body;

    password = String(password);
    password = password.trim();
    
    const passwordRegex = /^\d{4}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe ser de 4 dígitos exactamente',
        error: 'Password must be exactly 4 digits'
      });
    }
    
    const user = await User.findOne({ phoneNumber });
    
    if (!user) {
      console.log('[Backend] Login failed - user not found:', phoneNumber);
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas',
        error: 'Invalid credentials'
      });
    }
    
    const isMatch = await User.matchPassword(user.id_user, password);
    
    if (!isMatch) {
      console.log('[Backend] Login failed - incorrect password for:', phoneNumber);
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas',
        error: 'Invalid credentials'
      });
    }
    
    console.log('[Backend] Login successful for:', phoneNumber);
    
    const token = generateToken(user.id_user);
    
    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      user: {
        id_user: user.id_user,
        name: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role,
        registeredAt: user.registeredAt,
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const Admin = require('../models/Admin');
    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas',
        error: 'Invalid credentials'
      });
    }
    
    const isMatch = await Admin.matchPassword(admin.id_admin, password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas',
        error: 'Invalid credentials'
      });
    }
    
    const token = generateToken(admin.id_admin);
    
    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      admin: {
        id_admin: admin.id_admin,
        name: admin.name,
        email: admin.email,
        code_group: admin.code_group,
        role: admin.role,
        registeredAt: admin.registeredAt
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

exports.adminRegister = async (req, res, next) => {
  try {
    const { name, email, password, code_group } = req.body;
    
    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El nombre es requerido',
        error: 'INVALID_NAME'
      });
    }

    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El email es requerido',
        error: 'INVALID_EMAIL'
      });
    }

    if (!password?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña es requerida',
        error: 'INVALID_PASSWORD'
      });
    }

    if (!code_group?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El código de grupo es requerido',
        error: 'INVALID_CODE_GROUP'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Por favor ingresa un email válido',
        error: 'INVALID_EMAIL_FORMAT'
      });
    }

    if (password.trim().length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres',
        error: 'PASSWORD_TOO_SHORT'
      });
    }

    if (code_group.trim().length < 4) {
      return res.status(400).json({
        success: false,
        message: 'El código de grupo debe tener al menos 4 caracteres',
        error: 'CODE_GROUP_TOO_SHORT'
      });
    }
    
    const Admin = require('../models/Admin');
    
    try {
      const admin = await Admin.create({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        code_group: code_group.trim(),
        role: 'admin'
      });
      
      const token = generateToken(admin.id_admin);
      
      res.status(201).json({
        success: true,
        message: 'Administrador registrado exitosamente',
        admin: {
          id_admin: admin.id_admin,
          name: admin.name,
          email: admin.email,
          code_group: admin.code_group,
          role: admin.role,
          registeredAt: admin.registeredAt
        },
        token
      });
    } catch (adminError) {
      if (adminError.message.includes('email already exists')) {
        return res.status(400).json({
          success: false,
          message: 'Este email ya está registrado',
          error: 'EMAIL_EXISTS'
        });
      } else if (adminError.message.includes('Code group already in use')) {
        return res.status(400).json({
          success: false,
          message: 'Este código de grupo ya está en uso',
          error: 'CODE_GROUP_EXISTS'
        });
      } else {
        throw adminError;
      }
    }
  } catch (error) {
    next(error);
  }
};

const normalizePhoneNumber = (phoneNumber) => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    return cleaned;
};

exports.checkUser = async (req, res, next) => {
  try {
    let { phoneNumber } = req.body;
    
    phoneNumber = normalizePhoneNumber(phoneNumber);
    console.log('[Backend] Checking user existence for normalized phone:', phoneNumber);
    
    const user = await User.findOne({ phoneNumber });
    
    console.log('[Backend] User check result:', { exists: !!user, phoneNumber });
    
    res.status(200).json({
      success: true,
      exists: !!user,
      message: user ? 'Usuario encontrado' : 'Usuario no encontrado',
      user: user ? { 
        id: user._id,
        phoneNumber: user.phoneNumber
      } : null
    });
  } catch (error) {
    console.error('[Backend] Error checking user existence:', error);
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
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
