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

router.post('/', protect, createAmount);
router.get('/', protect, authorize('admin'), getAllAmounts);
router.get('/total', protect, authorize('admin'), getTotalAmount);
router.get('/me', protect, getMyAmounts);
router.get('/user/:user_id', protect, getAmountsByUserId);
router.get('/:id_amount', protect, getAmountById);
router.put('/:id_amount', protect, authorize('admin'), updateAmount);
router.delete('/:id_amount', protect, authorize('admin'), deleteAmount);

module.exports = router;