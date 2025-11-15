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

router.post('/', protect, createLoan);
router.get('/', protect, getAllLoans);
router.get('/me', protect, getMyLoans);
router.get('/:id_loan', protect, getLoanById);
router.put('/:id_loan/status', protect, updateLoanStatus);
router.delete('/:id_loan', protect, deleteLoan);

module.exports = router;