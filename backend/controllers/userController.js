const User = require('../models/User');
const Admin = require('../models/Admin');
const GroupMember = require('../models/GroupMember');

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({ role: 'user' });
    
    res.status(200).json({
      success: true,
      users: users.map(user => ({
        id: user.id_user,
        name: user.name,
        phoneNumber: user.phoneNumber,
        isActive: user.active,
        registeredAt: user.registeredAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById_user(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const newActiveStatus = !user.active;
    await User.updateOne(
      { id_user: req.params.id },
      { active: newActiveStatus }
    );
    
    const updatedUser = await User.findById_user(req.params.id);
    
    res.status(200).json({
      success: true,
      message: `Usuario ${updatedUser.active ? 'activado' : 'desactivado'} exitosamente`,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

exports.joinGroup = async (req, res, next) => {
  try {
    const { code_group } = req.body;
    const userId = req.user?.id_user || req.user?.id;

    if (!code_group?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El código de grupo es requerido',
        error: 'CODE_GROUP_REQUIRED'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        error: 'UNAUTHORIZED'
      });
    }

    const admin = await Admin.findByCodeGroup(code_group.trim());
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'El código de grupo no existe',
        error: 'INVALID_CODE_GROUP'
      });
    }

    const user = await User.findById_user(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        error: 'USER_NOT_FOUND'
      });
    }

    const existingMembership = await GroupMember.findOne({
      admin_id: admin.id_admin,
      user_id: userId
    });

    if (existingMembership) {
      return res.status(400).json({
        success: false,
        message: 'Ya perteneces a este grupo',
        error: 'ALREADY_MEMBER'
      });
    }

    await User.updateOne(
      { id_user: userId },
      { code_group: code_group.trim() }
    );

    await GroupMember.create({
      admin_id: admin.id_admin,
      user_id: userId
    });

    res.status(200).json({
      success: true,
      message: 'Te has unido al grupo exitosamente',
      data: {
        code_group: code_group.trim(),
        admin_name: admin.name,
        union_date: new Date()
      }
    });
  } catch (error) {
    console.error('[UserController] Error in joinGroup:', error);
    
    if (error.message === 'User is already a member of this group') {
      return res.status(400).json({
        success: false,
        message: 'Ya perteneces a este grupo',
        error: 'ALREADY_MEMBER'
      });
    }
    
    next(error);
  }
};
