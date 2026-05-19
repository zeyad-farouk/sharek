const express = require('express');
const { body, param } = require('express-validator');
const {
  register,
  login,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

// ─────────────────────────────────────────────────────────────
// Validation Chains
// ─────────────────────────────────────────────────────────────
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters.'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty.'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address.'),
  body('password')
    .notEmpty()
    .withMessage('Password is required.'),
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required.'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters.'),
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address.'),
];

const resetPasswordValidation = [
  param('token')
    .notEmpty()
    .withMessage('Reset token is required.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters.'),
];

// ─────────────────────────────────────────────────────────────
// Public Routes  (no token required)
// ─────────────────────────────────────────────────────────────
router.post('/register', registerValidation, validate, register);
router.post('/login',    loginValidation,    validate, login);

router.post('/forgot-password', forgotPasswordValidation, validate, forgotPassword);
router.post('/reset-password/:token', resetPasswordValidation, validate, resetPassword);

// ─────────────────────────────────────────────────────────────
// Protected Routes  (valid JWT required)
// ─────────────────────────────────────────────────────────────
router.post('/logout',           protect, logout);
router.put('/change-password',   protect, changePasswordValidation, validate, changePassword);

module.exports = router;
