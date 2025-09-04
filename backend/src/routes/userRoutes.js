const express = require('express');
const { 
  getUsers,
  toggleUserStatus
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes below need authentication
router.use(protect);
router.use(authorize('admin')); // Only admin can access user routes

router.get('/', getUsers);
router.put('/:id/status', toggleUserStatus);

module.exports = router;
