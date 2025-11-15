const Amount = require('../models/Amount');
const User = require('../models/User');

exports.createAmount = async (req, res, next) => {
  try {
    const { money } = req.body;
    const user_id = req.isAdmin ? req.user.id_admin : req.user.id_user;

    if (!money || isNaN(parseFloat(money)) || parseFloat(money) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Por favor ingrese un monto válido',
        error: 'Please enter a valid amount'
      });
    }

    const amount = await Amount.create({
      user_id,
      money: parseFloat(money)
    });

    res.status(201).json({
      success: true,
      message: 'Aporte registrado exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllAmounts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const amounts = await Amount.findAll(page, limit);
    const total = await Amount.getTotal();

    res.status(200).json({
      success: true,
      message: 'Aportes recuperados exitosamente',
      total
    });
  } catch (error) {
    next(error);
  }
};

exports.getAmountsByUserId = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    
    const userExists = await User.findById_user(user_id);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        error: 'User not found'
      });
    }

    const currentUserId = req.isAdmin ? req.user.id_admin : req.user.id_user;
    if (!req.isAdmin && currentUserId !== parseInt(user_id)) {
      return res.status(403).json({
        success: false,
        message: 'No está autorizado para ver estos aportes',
        error: 'Not authorized to view these amounts'
      });
    }

    const amounts = await Amount.findByUserId(user_id);
    const total = await Amount.getTotalByUserId(user_id);

    res.status(200).json({
      success: true,
      message: 'Aportes del usuario recuperados exitosamente',
      total
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyAmounts = async (req, res, next) => {
  try {
    const user_id = req.isAdmin ? req.user.id_admin : req.user.id_user;
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'User ID not found in request'
      });
    }
    
    const amounts = await Amount.findByUserId(user_id);
    const total = await Amount.getTotalByUserId(user_id);

    res.status(200).json({
      success: true,
      message: 'Mis aportes recuperados exitosamente',
      total,
      data: amounts
    });
  } catch (error) {
    next(error);
  }
};

exports.getAmountById = async (req, res, next) => {
  try {
    const { id_amount } = req.params;
    const amount = await Amount.findById(id_amount);

    if (!amount) {
      return res.status(404).json({
        success: false,
        message: 'Aporte no encontrado',
        error: 'Amount not found'
      });
    }

    const currentUserId = req.isAdmin ? req.user.id_admin : req.user.id_user;
    if (!req.isAdmin && currentUserId !== amount.user_id) {
      return res.status(403).json({
        success: false,
        message: 'No está autorizado para ver este aporte',
        error: 'Not authorized to view this amount'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Aporte recuperado exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAmount = async (req, res, next) => {
  try {
    const { id_amount } = req.params;
    const { money } = req.body;

    const amount = await Amount.findById(id_amount);
    if (!amount) {
      return res.status(404).json({
        success: false,
        message: 'Aporte no encontrado',
        error: 'Amount not found'
      });
    }

    // Authorization check: admin only
    if (!req.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No está autorizado para actualizar aportes',
        error: 'Not authorized to update amounts'
      });
    }

    const updateData = {};
    if (money !== undefined) {
      if (isNaN(parseFloat(money)) || parseFloat(money) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Por favor ingrese un monto válido',
          error: 'Please enter a valid amount'
        });
      }
      updateData.money = parseFloat(money);
    }

    const result = await Amount.update(id_amount, updateData);

    res.status(200).json({
      success: true,
      message: 'Aporte actualizado exitosamente',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteAmount = async (req, res, next) => {
  try {
    const { id_amount } = req.params;

    const amount = await Amount.findById(id_amount);
    if (!amount) {
      return res.status(404).json({
        success: false,
        message: 'Aporte no encontrado',
        error: 'Amount not found'
      });
    }

    // Authorization check: admin only
    if (!req.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No está autorizado para eliminar aportes',
        error: 'Not authorized to delete amounts'
      });
    }

    const result = await Amount.delete(id_amount);

    res.status(200).json({
      success: true,
      message: 'Aporte eliminado exitosamente',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};

exports.getTotalAmount = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No está autorizado para ver el total de aportes',
        error: 'Not authorized to view total amounts'
      });
    }

    const total = await Amount.getTotal();

    res.status(200).json({
      success: true,
      message: 'Total de aportes recuperado exitosamente',
      total
    });
  } catch (error) {
    next(error);
  }
};