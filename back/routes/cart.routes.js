const express = require('express');
const { body, param } = require('express-validator');
const {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  updateCartItem,
} = require('../controllers/cart.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

// All cart routes require authentication
router.use(protect);

router.get('/', getCart);
router.post('/add', [
  body('itemId').isMongoId().withMessage('Invalid item ID.'),
  body('rentalDays').optional().isInt({ min: 1 }).withMessage('Rental days must be at least 1.'),
], validate, addToCart);

router.put('/update/:itemId', [
  param('itemId').isMongoId().withMessage('Invalid item ID.'),
  body('rentalDays').isInt({ min: 1 }).withMessage('Rental days must be at least 1.'),
], validate, updateCartItem);

router.delete('/clear', clearCart);
router.delete('/remove/:itemId', param('itemId').isMongoId().withMessage('Invalid item ID.'), validate, removeFromCart);

module.exports = router;
