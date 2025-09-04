const express = require('express');
const { 
  register, 
  login, 
  adminLogin, 
  getMe 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/admin-login', adminLogin);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;
