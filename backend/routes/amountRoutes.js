const express = require('express');
const router = express.Router();
const { 
  createAmount,
  getAllAmounts,
  getAmountsByUserId,
  getMyAmounts,
  getAmountById,
  updateAmount,
  deleteAmount,
  getTotalAmount
} = require('../controllers/amountController');
const { protect, authorize } = require('../middleware/auth');

// Base route: /api/amounts

// Create amount route
router.post('/', protect, createAmount);

// Get all amounts (admin only)
router.get('/', protect, authorize('admin'), getAllAmounts);

// Get total amount (admin only)
router.get('/total', protect, authorize('admin'), getTotalAmount);

// Get my amounts
router.get('/me', protect, getMyAmounts);

// Get amounts by user_id (admin or self)
router.get('/user/:user_id', protect, getAmountsByUserId);

// Get amount by id
router.get('/:id_amount', protect, getAmountById);

// Update amount (admin only)
router.put('/:id_amount', protect, authorize('admin'), updateAmount);

// Delete amount (admin only)
router.delete('/:id_amount', protect, authorize('admin'), deleteAmount);

module.exports = router;