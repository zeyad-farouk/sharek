const express = require('express');
const { body, param } = require('express-validator');
const {
  getConversations,
  getThread,
  sendMessage,
  deleteMessage,
  markAsRead,
} = require('../controllers/message.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

// All message routes require authentication
router.use(protect);

// Conversation list (for Flutter MessagesPage)
router.get('/conversations', getConversations);

// Thread with a specific user (for Flutter ChatDetailPage)
router.get('/thread/:userId', [
  param('userId').isMongoId().withMessage('Invalid user ID.'),
], validate, getThread);

// Send a message
router.post('/', [
  body('receiverId').isMongoId().withMessage('Invalid receiver ID.'),
  body('text').trim().notEmpty().withMessage('Message text cannot be empty.').isLength({ max: 2000 }).withMessage('Message too long.'),
  body('itemId').optional().isMongoId().withMessage('Invalid item ID.'),
], validate, sendMessage);

// Mark message as read
router.put('/:id/read', param('id').isMongoId().withMessage('Invalid message ID.'), validate, markAsRead);

// Delete a message
router.delete('/:id', param('id').isMongoId().withMessage('Invalid message ID.'), validate, deleteMessage);

module.exports = router;
