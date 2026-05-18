const express = require('express');
const { body, param, query } = require('express-validator');
const validateRequest = require('../middleware/validation');
const {
  getMessages,
  getMessageById,
  createMessage,
  updateMessage,
  deleteMessage,
} = require('../controllers/message.controller');

const router = express.Router();

router.get(
  '/',
  [
    query('unread').optional().isBoolean().withMessage('unread must be true or false'),
  ],
  validateRequest,
  getMessages
);

router.get('/:id', [param('id').isMongoId().withMessage('Invalid message id')], validateRequest, getMessageById);

router.post(
  '/',
  [
    body('sender').trim().notEmpty().withMessage('Sender is required'),
    body('receiver').trim().notEmpty().withMessage('Receiver is required'),
    body('text').trim().notEmpty().withMessage('Text is required'),
    body('itemName').optional().trim(),
    body('isRead').optional().isBoolean().withMessage('isRead must be true or false'),
  ],
  validateRequest,
  createMessage
);

router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid message id'),
    body('sender').optional().trim().notEmpty().withMessage('Sender cannot be empty'),
    body('receiver').optional().trim().notEmpty().withMessage('Receiver cannot be empty'),
    body('text').optional().trim().notEmpty().withMessage('Text cannot be empty'),
    body('isRead').optional().isBoolean().withMessage('isRead must be true or false'),
  ],
  validateRequest,
  updateMessage
);

router.delete('/:id', [param('id').isMongoId().withMessage('Invalid message id')], validateRequest, deleteMessage);

module.exports = router;
