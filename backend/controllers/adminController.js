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
    const users = await User.find()
      .select('-__v')
      .sort({ registeredAt: -1 });
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Admin only
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-__v');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
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
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
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
