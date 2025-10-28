const GroupMember = require('../models/GroupMember');
const User = require('../models/User');
const Admin = require('../models/Admin');

// @desc    Add a user to a group
// @route   POST /api/group-members
// @access  Private (Admin only)
exports.addUserToGroup = async (req, res, next) => {
  try {
    const { user_id } = req.body;
    const admin_id = req.admin.id_admin; // From auth middleware
    
    // Validate input
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el ID del usuario',
        error: 'User ID is required'
      });
    }

    // Check if user exists
    const user = await User.findById_user(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        error: 'User not found'
      });
    }

    // Create group member relationship
    const groupMember = await GroupMember.create({
      admin_id,
      user_id
    });

    res.status(201).json({
      success: true,
      message: 'Usuario agregado al grupo exitosamente',
      data: groupMember
    });
  } catch (error) {
    // Handle duplicate entry error
    if (error.message === 'User is already a member of this group') {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya es miembro de este grupo',
        error: error.message
      });
    }
    next(error);
  }
};

// @desc    Get all members in an admin's group
// @route   GET /api/group-members/admin
// @access  Private (Admin only)
exports.getGroupMembers = async (req, res, next) => {
  try {
    const admin_id = req.admin.id_admin; // From auth middleware
    const includeUserDetails = req.query.details === 'true';
    
    const members = await GroupMember.findByAdminId(admin_id, includeUserDetails);
    const memberCount = await GroupMember.countMembersByAdminId(admin_id);

    res.status(200).json({
      success: true,
      message: 'Miembros del grupo recuperados exitosamente',
      count: memberCount,
      data: members
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all groups a user belongs to
// @route   GET /api/group-members/user/:user_id
// @access  Private (Admin only or self)
exports.getUserGroups = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const includeAdminDetails = req.query.details === 'true';
    
    // Authorization check: admin or self
    const currentUserId = req.isAdmin ? req.user.id_admin : req.user.id_user;
    if (req.user && currentUserId !== parseInt(user_id) && !req.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No está autorizado para ver estos grupos',
        error: 'Not authorized to view these groups'
      });
    }

    // Check if user exists
    const user = await User.findById_user(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        error: 'User not found'
      });
    }

    const groups = await GroupMember.findByUserId(user_id, includeAdminDetails);
    const groupCount = await GroupMember.countGroupsByUserId(user_id);

    res.status(200).json({
      success: true,
      message: 'Grupos del usuario recuperados exitosamente',
      count: groupCount,
      data: groups
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all groups the current user belongs to
// @route   GET /api/group-members/me
// @access  Private
exports.getMyGroups = async (req, res, next) => {
  try {
    const user_id = req.isAdmin ? req.user.id_admin : req.user.id_user;
    const includeAdminDetails = req.query.details === 'true';
    
    const groups = await GroupMember.findByUserId(user_id, includeAdminDetails);
    const groupCount = await GroupMember.countGroupsByUserId(user_id);

    res.status(200).json({
      success: true,
      message: 'Mis grupos recuperados exitosamente',
      count: groupCount,
      data: groups
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all group members (paginated)
// @route   GET /api/group-members
// @access  Private (Super Admin only)
exports.getAllGroupMembers = async (req, res, next) => {
  try {
    // Authorization check: super admin only
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'No está autorizado para ver todos los miembros de grupos',
        error: 'Not authorized to view all group members'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const groupMembers = await GroupMember.findAll(page, limit);

    res.status(200).json({
      success: true,
      message: 'Todos los miembros de grupos recuperados exitosamente',
      data: groupMembers.data,
      pagination: groupMembers.pagination
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if a user is a member of a group
// @route   GET /api/group-members/check/:user_id
// @access  Private (Admin only)
exports.checkGroupMembership = async (req, res, next) => {
  try {
    const admin_id = req.admin.id_admin;
    const { user_id } = req.params;
    
    const membership = await GroupMember.findOne({
      admin_id,
      user_id
    });

    res.status(200).json({
      success: true,
      isMember: membership !== null,
      data: membership
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a user from a group
// @route   DELETE /api/group-members/:user_id
// @access  Private (Admin only)
exports.removeUserFromGroup = async (req, res, next) => {
  try {
    const admin_id = req.admin.id_admin;
    const { user_id } = req.params;
    
    // Check if the relationship exists
    const relationship = await GroupMember.findOne({
      admin_id,
      user_id
    });
    
    if (!relationship) {
      return res.status(404).json({
        success: false,
        message: 'El usuario no es miembro de este grupo',
        error: 'User is not a member of this group'
      });
    }

    const result = await GroupMember.delete(admin_id, user_id);

    res.status(200).json({
      success: true,
      message: 'Usuario removido del grupo exitosamente',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove all users from a group
// @route   DELETE /api/group-members/admin
// @access  Private (Admin only)
exports.removeAllUsersFromGroup = async (req, res, next) => {
  try {
    const admin_id = req.admin.id_admin;
    
    const result = await GroupMember.deleteAllByAdminId(admin_id);

    res.status(200).json({
      success: true,
      message: 'Todos los usuarios removidos del grupo exitosamente',
      data: result
    });
  } catch (error) {
    next(error);
  }
};