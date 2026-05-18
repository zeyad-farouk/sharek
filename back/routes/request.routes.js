const express = require('express');
const { body, param, query } = require('express-validator');
const validateRequest = require('../middleware/validation');
const {
  getRequests,
  getRequestById,
  createRequest,
  updateRequest,
  deleteRequest,
} = require('../controllers/request.controller');

const router = express.Router();

router.get(
  '/',
  [
    query('status').optional().isIn(['pending', 'accepted', 'declined']).withMessage('Status must be pending, accepted or declined'),
  ],
  validateRequest,
  getRequests
);

router.get('/:id', [param('id').isMongoId().withMessage('Invalid request id')], validateRequest, getRequestById);

router.post(
  '/',
  [
    body('clientName').trim().notEmpty().withMessage('Client name is required'),
    body('toolName').trim().notEmpty().withMessage('Tool name is required'),
    body('durationDays').isInt({ min: 1 }).withMessage('Duration must be at least 1 day'),
    body('message').optional().trim(),
  ],
  validateRequest,
  createRequest
);

router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid request id'),
    body('clientName').optional().trim().notEmpty().withMessage('Client name cannot be empty'),
    body('toolName').optional().trim().notEmpty().withMessage('Tool name cannot be empty'),
    body('durationDays').optional().isInt({ min: 1 }).withMessage('Duration must be at least 1 day'),
    body('status').optional().isIn(['pending', 'accepted', 'declined']).withMessage('Status must be pending, accepted or declined'),
  ],
  validateRequest,
  updateRequest
);

router.delete('/:id', [param('id').isMongoId().withMessage('Invalid request id')], validateRequest, deleteRequest);

module.exports = router;
