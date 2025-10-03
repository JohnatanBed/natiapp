const Loan = require('../models/Loan');
const User = require('../models/User');

// @desc    Create a new loan request
// @route   POST /api/loans
// @access  Private
exports.createLoan = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const user_id = req.user.id_user;

    // Validate amount
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Por favor ingrese un monto válido',
        error: 'Please enter a valid amount'
      });
    }

    // Create loan request
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

// @desc    Get all loan requests (paginated)
// @route   GET /api/loans
// @access  Private (Admin)
exports.getAllLoans = async (req, res, next) => {
  try {
    // Authorization check: admin only
    if (req.user.role !== 'admin') {
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

// @desc    Get my loan requests
// @route   GET /api/loans/me
// @access  Private
exports.getMyLoans = async (req, res, next) => {
  try {
    const user_id = req.user.id_user;
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

// @desc    Get loan by ID
// @route   GET /api/loans/:id_loan
// @access  Private (Admin or Owner)
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

    // Authorization check: admin or owner
    if (req.user.role !== 'admin' && req.user.id_user !== loan.user_id) {
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

// @desc    Update loan status (approve/reject)
// @route   PUT /api/loans/:id_loan/status
// @access  Private (Admin only)
exports.updateLoanStatus = async (req, res, next) => {
  try {
    const { id_loan } = req.params;
    const { status } = req.body;

    // Authorization check: admin only
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No está autorizado para actualizar el estado de préstamos',
        error: 'Not authorized to update loan status'
      });
    }

    // Check if loan exists
    const loan = await Loan.findById(id_loan);
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Préstamo no encontrado',
        error: 'Loan not found'
      });
    }

    // Validate status
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

// @desc    Delete loan (only if pending)
// @route   DELETE /api/loans/:id_loan
// @access  Private (Admin or Owner if pending)
exports.deleteLoan = async (req, res, next) => {
  try {
    const { id_loan } = req.params;

    // Check if loan exists
    const loan = await Loan.findById(id_loan);
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Préstamo no encontrado',
        error: 'Loan not found'
      });
    }

    // Authorization check: admin or owner (only if pending)
    if (req.user.role !== 'admin' && req.user.id_user !== loan.user_id) {
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