const express = require('express');
const router = express.Router();
const { 
  createLoan,
  getAllLoans,
  getMyLoans,
  getLoanById,
  updateLoanStatus,
  deleteLoan
} = require('../controllers/loanController');
const { protect } = require('../middleware/auth');

// Base route: /api/loans

// Create loan request
router.post('/', protect, createLoan);

// Get all loans (admin only)
router.get('/', protect, getAllLoans);

// Get my loans
router.get('/me', protect, getMyLoans);

// Get loan by ID
router.get('/:id_loan', protect, getLoanById);

// Update loan status (admin only)
router.put('/:id_loan/status', protect, updateLoanStatus);

// Delete loan (admin or owner if pending)
router.delete('/:id_loan', protect, deleteLoan);

module.exports = router;