const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'user' });
    
    res.status(200).json({
      success: true,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        isActive: user.isActive,
        registeredAt: user.registeredAt,
        lastLogin: user.lastLogin
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user status (active/inactive)
// @route   PUT /api/users/:id/status
// @access  Private/Admin
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Toggle user status
    user.isActive = !user.isActive;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `Usuario ${user.isActive ? 'activado' : 'desactivado'} exitosamente`
    });
  } catch (error) {
    next(error);
  }
};
