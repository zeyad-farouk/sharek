const express = require('express');
const { body, param } = require('express-validator');
const {
  getNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  handleAction,
  deleteNotification,
  createNotification,
} = require('../controllers/notification.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

// All notification routes require authentication
router.use(protect);

// Get user's notifications (supports: ?type=alert&unread=true&sort=-createdAt&page=1&limit=20)
router.get('/', getNotifications);

// Mark all as read (must be before /:id)
router.put('/read-all', markAllAsRead);

// Get single notification
router.get('/:id', param('id').isMongoId().withMessage('Invalid notification ID.'), validate, getNotificationById);

// Mark single as read
router.put('/:id/read', param('id').isMongoId().withMessage('Invalid notification ID.'), validate, markAsRead);

// Accept/decline rental request notification
router.put('/:id/action', [
  param('id').isMongoId().withMessage('Invalid notification ID.'),
  body('action').isIn(['accepted', 'declined']).withMessage('Action must be "accepted" or "declined".'),
], validate, handleAction);

// Delete (swipe-to-delete in Flutter)
router.delete('/:id', param('id').isMongoId().withMessage('Invalid notification ID.'), validate, deleteNotification);

// Admin: push a notification to any user
router.post('/', authorize('admin'), [
  body('userId').isMongoId().withMessage('Invalid user ID.'),
  body('title').trim().notEmpty().withMessage('Title is required.'),
  body('body').trim().notEmpty().withMessage('Body is required.'),
  body('type').isIn(['success', 'alert', 'message', 'system']).withMessage('Invalid notification type.'),
], validate, createNotification);

module.exports = router;
