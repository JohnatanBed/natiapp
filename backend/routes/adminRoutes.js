const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const {
  getUserStatistics,
  getAllUsers,
  getUser,
  updateUserStatus
} = require('../controllers/adminController');

const router = express.Router();

// Admin dashboard routes
router.get('/user-statistics', protect, adminOnly, getUserStatistics);

// User management routes
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/users/:id', protect, adminOnly, getUser);
router.put('/users/:id/status', protect, adminOnly, updateUserStatus);

// Export router
module.exports = router;
