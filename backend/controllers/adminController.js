const User = require('../models/User');
const Admin = require('../models/Admin');

// @desc    Get user statistics for admin dashboard
// @route   GET /api/admin/user-statistics
// @access  Admin only
exports.getUserStatistics = async (req, res, next) => {
  try {
    // Count total users
    const totalUsers = await User.countDocuments();
    
    // Count active users
    const activeUsers = await User.countDocuments({ isActive: true });
    
    // Count users registered in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newRegistrations = await User.countDocuments({
      registeredAt: { $gte: thirtyDaysAgo }
    });
    
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        newRegistrations
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of all users
// @route   GET /api/admin/users
// @access  Admin only
exports.getAllUsers = async (req, res, next) => {
  try {
    const adminCodeGroup = req.user.code_group;
    const adminId = req.user.id_admin;
    
    console.log('[getAllUsers] Admin code_group:', adminCodeGroup);
    console.log('[getAllUsers] Admin id:', adminId);
    
    const GroupMember = require('../models/GroupMember');
    const groupMembers = await GroupMember.findByAdminId(adminId);
    
    console.log('[getAllUsers] Group members found:', groupMembers.length);
    
    const userIds = groupMembers.map(gm => gm.user_id);
    
    let users = [];
    
    if (userIds.length > 0) {
      for (const userId of userIds) {
        const user = await User.findById_user(userId);
        if (user) {
          users.push(user);
        }
      }
    }
    
    const usersByCodeGroup = await User.findAll({ code_group: adminCodeGroup });
    
    const allUsers = [...users];
    for (const user of usersByCodeGroup) {
      if (!allUsers.find(u => u.id_user === user.id_user)) {
        allUsers.push(user);
      }
    }
    
    console.log('[getAllUsers] Total users found:', allUsers.length);
    console.log('[getAllUsers] Users data:', allUsers);
    console.log('[getAllUsers] Sending response...');
    
    return res.status(200).json({
      success: true,
      count: allUsers.length,
      users: allUsers
    });
  } catch (error) {
    console.error('[getAllUsers] Error:', error);
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Admin only
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById_user(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Verify the user belongs to the same code_group as admin
    if (user.code_group !== req.user.code_group) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this user'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status (activate/deactivate)
// @route   PUT /api/admin/users/:id/status
// @access  Admin only
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    
    // First, check if user exists
    const user = await User.findById_user(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Verify the user belongs to the same code_group as admin
    if (user.code_group !== req.user.code_group) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this user'
      });
    }
    
    // Update user status
    await User.updateOne(
      { id_user: req.params.id },
      { active: isActive }
    );
    
    // Get updated user
    const updatedUser = await User.findById_user(req.params.id);
    
    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};
