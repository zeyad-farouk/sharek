const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, updateMe, changePassword } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

// --- Validation chains ---
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters.'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty.'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required.'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters.'),
];

// --- Public Routes ---
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);

// --- Protected Routes ---
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/change-password', protect, changePasswordValidation, validate, changePassword);

module.exports = router;
