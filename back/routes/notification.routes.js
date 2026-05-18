const express = require('express');
const { body, param, query } = require('express-validator');
const validateRequest = require('../middleware/validation');
const {
  getNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
} = require('../controllers/notification.controller');

const router = express.Router();

router.get(
  '/',
  [
    query('type').optional().isIn(['success', 'alert', 'message', 'system']).withMessage('Type must be a valid notification type'),
    query('unread').optional().isBoolean().withMessage('unread must be true or false'),
  ],
  validateRequest,
  getNotifications
);

router.get('/:id', [param('id').isMongoId().withMessage('Invalid notification id')], validateRequest, getNotificationById);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('body').trim().notEmpty().withMessage('Body is required'),
    body('type')
      .trim()
      .isIn(['success', 'alert', 'message', 'system'])
      .withMessage('Type must be one of success, alert, message, or system'),
    body('relatedItem').optional().trim(),
    body('isRead').optional().isBoolean().withMessage('isRead must be true or false'),
  ],
  validateRequest,
  createNotification
);

router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid notification id'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('body').optional().trim().notEmpty().withMessage('Body cannot be empty'),
    body('type')
      .optional()
      .trim()
      .isIn(['success', 'alert', 'message', 'system'])
      .withMessage('Type must be one of success, alert, message, or system'),
    body('isRead').optional().isBoolean().withMessage('isRead must be true or false'),
  ],
  validateRequest,
  updateNotification
);

router.delete('/:id', [param('id').isMongoId().withMessage('Invalid notification id')], validateRequest, deleteNotification);

module.exports = router;
