const express = require('express');
const { body, param } = require('express-validator');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
} = require('../controllers/order.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

// All order routes require authentication
router.use(protect);

router.post('/', [
  body('paymentMethod').isIn(['visa', 'vodafone']).withMessage('Payment method must be "visa" or "vodafone".'),
], validate, createOrder);

router.get('/my', getMyOrders);
router.get('/all', authorize('admin'), getAllOrders);  // Admin only
router.get('/:id', param('id').isMongoId().withMessage('Invalid order ID.'), validate, getOrderById);
router.put('/:id/cancel', param('id').isMongoId().withMessage('Invalid order ID.'), validate, cancelOrder);

module.exports = router;
