const Loan = require('../models/Loan');
const User = require('../models/User');

exports.createLoan = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const user_id = req.isAdmin ? req.user.id_admin : req.user.id_user;

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Por favor ingrese un monto válido',
        error: 'Please enter a valid amount'
      });
    }

    const loan = await Loan.create({
      user_id,
      amount: parseFloat(amount),
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Solicitud de préstamo creada exitosamente',
      data: loan
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllLoans = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No está autorizado para ver todos los préstamos',
        error: 'Not authorized to view all loans'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const loans = await Loan.findAll(page, limit);
    const totalPending = await Loan.getTotalByStatus('pending');
    const totalApproved = await Loan.getTotalByStatus('approved');
    const totalRejected = await Loan.getTotalByStatus('rejected');

    res.status(200).json({
      success: true,
      message: 'Préstamos recuperados exitosamente',
      data: loans,
      summary: {
        totalPending,
        totalApproved,
        totalRejected
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyLoans = async (req, res, next) => {
  try {
    const user_id = req.isAdmin ? req.user.id_admin : req.user.id_user;
    const loans = await Loan.findByUserId(user_id);

    res.status(200).json({
      success: true,
      message: 'Mis préstamos recuperados exitosamente',
      data: loans
    });
  } catch (error) {
    next(error);
  }
};

exports.getLoanById = async (req, res, next) => {
  try {
    const { id_loan } = req.params;
    const loan = await Loan.findById(id_loan);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Préstamo no encontrado',
        error: 'Loan not found'
      });
    }

    const currentUserId = req.isAdmin ? req.user.id_admin : req.user.id_user;
    if (!req.isAdmin && currentUserId !== loan.user_id) {
      return res.status(403).json({
        success: false,
        message: 'No está autorizado para ver este préstamo',
        error: 'Not authorized to view this loan'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Préstamo recuperado exitosamente',
      data: loan
    });
  } catch (error) {
    next(error);
  }
};

exports.updateLoanStatus = async (req, res, next) => {
  try {
    const { id_loan } = req.params;
    const { status } = req.body;

    if (!req.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No está autorizado para actualizar el estado de préstamos',
        error: 'Not authorized to update loan status'
      });
    }

    const loan = await Loan.findById(id_loan);
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Préstamo no encontrado',
        error: 'Loan not found'
      });
    }

    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido. Debe ser pending, approved o rejected',
        error: 'Invalid status'
      });
    }

    const result = await Loan.updateStatus(id_loan, status);

    res.status(200).json({
      success: true,
      message: `Préstamo ${status === 'approved' ? 'aprobado' : status === 'rejected' ? 'rechazado' : 'actualizado'} exitosamente`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteLoan = async (req, res, next) => {
  try {
    const { id_loan } = req.params;

    const loan = await Loan.findById(id_loan);
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Préstamo no encontrado',
        error: 'Loan not found'
      });
    }

    const currentUserId = req.isAdmin ? req.user.id_admin : req.user.id_user;
    if (!req.isAdmin && currentUserId !== loan.user_id) {
      return res.status(403).json({
        success: false,
        message: 'No está autorizado para eliminar este préstamo',
        error: 'Not authorized to delete this loan'
      });
    }

    const result = await Loan.delete(id_loan);

    res.status(200).json({
      success: true,
      message: 'Préstamo eliminado exitosamente',
      data: result
    });
  } catch (error) {
    next(error);
  }
};