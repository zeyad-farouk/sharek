const express = require('express');
const { body, param, query } = require('express-validator');
const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getMyItems,
} = require('../controllers/item.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

const CATEGORIES = ['Engineering', 'Art Tools', 'Construction', 'Design', 'Electronics', 'Clothing', 'Furniture', 'Books', 'Other'];
const CONDITIONS = ['New', 'Used - Excellent', 'Used - Good', 'Used - Fair'];

const itemBodyValidation = [
  body('name').trim().notEmpty().withMessage('Item name is required.').isLength({ max: 100 }).withMessage('Name too long.'),
  body('description').trim().notEmpty().withMessage('Description is required.').isLength({ min: 10 }).withMessage('Description too short.'),
  body('category').isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(', ')}.`),
  body('condition').isIn(CONDITIONS).withMessage(`Condition must be one of: ${CONDITIONS.join(', ')}.`),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number.'),
  body('image').optional().isURL().withMessage('Image must be a valid URL.'),
];

const mongoIdParam = (field = 'id') =>
  param(field).isMongoId().withMessage(`Invalid ${field} format.`);

// Public — read access
router.get('/', getItems);
router.get('/my', protect, getMyItems);  // Must be before /:id
router.get('/:id', mongoIdParam(), validate, getItemById);

// Protected — write access
router.post('/', protect, itemBodyValidation, validate, createItem);
router.put('/:id', protect, mongoIdParam(), [
  ...itemBodyValidation.map((v) => v.optional()),
  body('available').optional().isBoolean().withMessage('Available must be a boolean.'),
], validate, updateItem);
router.delete('/:id', protect, mongoIdParam(), validate, deleteItem);

module.exports = router;
