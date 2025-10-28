const express = require('express');
const { 
  getUsers,
  toggleUserStatus,
  joinGroup
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Join group route - accessible to authenticated users (not just admins)
router.post('/join-group', protect, joinGroup);

// All routes below need authentication and admin authorization
router.use(protect);
router.use(authorize('admin')); // Only admin can access user management routes

router.get('/', getUsers);
router.put('/:id/status', toggleUserStatus);

module.exports = router;
