const express = require('express');
const { body, param, query } = require('express-validator');
const validateRequest = require('../middleware/validation');
const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} = require('../controllers/item.controller');

const router = express.Router();

router.get(
  '/',
  [
    query('minPrice').optional().isFloat({ min: 0 }).withMessage('minPrice must be a number >= 0'),
    query('maxPrice').optional().isFloat({ min: 0 }).withMessage('maxPrice must be a number >= 0'),
    query('available').optional().isBoolean().withMessage('available must be true or false'),
  ],
  validateRequest,
  getItems
);

router.get('/:id', [param('id').isMongoId().withMessage('Invalid item id')], validateRequest, getItemById);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('condition')
      .trim()
      .isIn(['New', 'Used - Excellent', 'Used - Good', 'Used - Fair'])
      .withMessage('Condition must be a valid value'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a number greater than or equal to 0'),
    body('imageUrl').optional().isURL().withMessage('imageUrl must be a valid URL'),
    body('available').optional().isBoolean().withMessage('Available must be true or false'),
  ],
  validateRequest,
  createItem
);

router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid item id'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
    body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
    body('condition')
      .optional()
      .trim()
      .isIn(['New', 'Used - Excellent', 'Used - Good', 'Used - Fair'])
      .withMessage('Condition must be a valid value'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a number greater than or equal to 0'),
    body('imageUrl').optional().isURL().withMessage('imageUrl must be a valid URL'),
    body('available').optional().isBoolean().withMessage('Available must be true or false'),
  ],
  validateRequest,
  updateItem
);

router.delete('/:id', [param('id').isMongoId().withMessage('Invalid item id')], validateRequest, deleteItem);

module.exports = router;
