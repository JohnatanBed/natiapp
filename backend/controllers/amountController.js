const Amount = require('../models/Amount');
const User = require('../models/User');

// @desc    Create a new amount record
// @route   POST /api/amounts
// @access  Private
exports.createAmount = async (req, res, next) => {
  try {
    const { money } = req.body;
    const user_id = req.user.id_user;
    let screenshot = null;

    // Handle screenshot if provided
    if (req.files && req.files.screenshot) {
      screenshot = req.files.screenshot.data;
    }

    // Validate amount
    if (!money || isNaN(parseFloat(money)) || parseFloat(money) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Por favor ingrese un monto válido',
        error: 'Please enter a valid amount'
      });
    }

    // Create amount
    const amount = await Amount.create({
      user_id,
      money: parseFloat(money),
      screenshot
    });

    res.status(201).json({
      success: true,
      message: 'Aporte registrado exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all amount records (paginated)
// @route   GET /api/amounts
// @access  Private (Admin)
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

// @desc    Get amount records by user_id
// @route   GET /api/amounts/user/:user_id
// @access  Private (Admin or Self)
exports.getAmountsByUserId = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    
    // Check if user exists
    const userExists = await User.findById_user(user_id);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        error: 'User not found'
      });
    }

    // Authorization check: admin or self
    if (req.user.role !== 'admin' && req.user.id_user !== parseInt(user_id)) {
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

// @desc    Get my amount records
// @route   GET /api/amounts/me
// @access  Private
exports.getMyAmounts = async (req, res, next) => {
  try {
    const user_id = req.user.id_user;
    const amounts = await Amount.findByUserId(user_id);
    const total = await Amount.getTotalByUserId(user_id);

    res.status(200).json({
      success: true,
      message: 'Mis aportes recuperados exitosamente',
      total
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get amount record by id
// @route   GET /api/amounts/:id_amount
// @access  Private (Admin or Owner)
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

    // Authorization check: admin or owner
    if (req.user.role !== 'admin' && req.user.id_user !== amount.user_id) {
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

// @desc    Update amount record
// @route   PUT /api/amounts/:id_amount
// @access  Private (Admin only)
exports.updateAmount = async (req, res, next) => {
  try {
    const { id_amount } = req.params;
    const { money } = req.body;
    let screenshot;

    // Check if amount exists
    const amount = await Amount.findById(id_amount);
    if (!amount) {
      return res.status(404).json({
        success: false,
        message: 'Aporte no encontrado',
        error: 'Amount not found'
      });
    }

    // Authorization check: admin only
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No está autorizado para actualizar aportes',
        error: 'Not authorized to update amounts'
      });
    }

    // Handle screenshot if provided
    if (req.files && req.files.screenshot) {
      screenshot = req.files.screenshot.data;
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
    
    if (screenshot !== undefined) {
      updateData.screenshot = screenshot;
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

// @desc    Delete amount record
// @route   DELETE /api/amounts/:id_amount
// @access  Private (Admin only)
exports.deleteAmount = async (req, res, next) => {
  try {
    const { id_amount } = req.params;

    // Check if amount exists
    const amount = await Amount.findById(id_amount);
    if (!amount) {
      return res.status(404).json({
        success: false,
        message: 'Aporte no encontrado',
        error: 'Amount not found'
      });
    }

    // Authorization check: admin only
    if (req.user.role !== 'admin') {
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

// @desc    Get total sum of amounts
// @route   GET /api/amounts/total
// @access  Private (Admin only)
exports.getTotalAmount = async (req, res, next) => {
  try {
    // Authorization check: admin only
    if (req.user.role !== 'admin') {
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