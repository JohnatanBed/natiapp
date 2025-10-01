const express = require('express');
const router = express.Router();
const { 
  addUserToGroup,
  getGroupMembers,
  getUserGroups,
  getMyGroups,
  getAllGroupMembers,
  checkGroupMembership,
  removeUserFromGroup,
  removeAllUsersFromGroup
} = require('../controllers/groupMemberController');
const { protect, adminOnly, authorize } = require('../middleware/auth');

// Base route: /api/group-members

// Admin routes (requires admin authentication)
router.post('/', adminOnly, addUserToGroup);
router.get('/admin', adminOnly, getGroupMembers);
router.get('/check/:user_id', adminOnly, checkGroupMembership);
router.delete('/:user_id', adminOnly, removeUserFromGroup);
router.delete('/admin', adminOnly, removeAllUsersFromGroup);

// User routes
router.get('/me', protect, getMyGroups);
router.get('/user/:user_id', protect, getUserGroups);

// Super admin routes
router.get('/', adminOnly, getAllGroupMembers);

module.exports = router;