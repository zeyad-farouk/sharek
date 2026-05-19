const express = require('express');
const { body, param } = require('express-validator');
const {
  getRequests,
  getRequestById,
  createRequest,
  updateRequestStatus,
  updateRequest,
  deleteRequest,
} = require('../controllers/request.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

// All request routes require authentication
router.use(protect);

// List (users see own; admins see all)
router.get('/', getRequests);

// Create
router.post('/', [
  body('clientName').trim().notEmpty().withMessage('Client name is required.'),
  body('toolName').trim().notEmpty().withMessage('Tool name is required.'),
  body('durationDays').isInt({ min: 1 }).withMessage('Duration must be at least 1 day.'),
  body('itemId').optional().isMongoId().withMessage('Invalid item ID.'),
  body('message').optional().trim(),
], validate, createRequest);

// Single
router.get('/:id', param('id').isMongoId().withMessage('Invalid request ID.'), validate, getRequestById);

// Update details (only pending, by requester)
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid request ID.'),
  body('clientName').optional().trim().notEmpty().withMessage('Client name cannot be empty.'),
  body('toolName').optional().trim().notEmpty().withMessage('Tool name cannot be empty.'),
  body('durationDays').optional().isInt({ min: 1 }).withMessage('Duration must be at least 1 day.'),
], validate, updateRequest);

// Update status (accept/decline by admin, cancel by requester)
router.put('/:id/status', [
  param('id').isMongoId().withMessage('Invalid request ID.'),
  body('status').isIn(['accepted', 'declined', 'cancelled']).withMessage('Status must be accepted, declined, or cancelled.'),
], validate, updateRequestStatus);

// Delete
router.delete('/:id', param('id').isMongoId().withMessage('Invalid request ID.'), validate, deleteRequest);

module.exports = router;
