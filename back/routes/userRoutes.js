const express = require('express');
const { body } = require('express-validator');
const {
  getProfile,
  updateProfile,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

// ─────────────────────────────────────────────────────────────
// All user routes require authentication
// ─────────────────────────────────────────────────────────────
router.use(protect);

// ─────────────────────────────────────────────────────────────
// Self-service Profile Routes  (any authenticated user)
// ─────────────────────────────────────────────────────────────

// GET  /api/users/me  — get own profile
router.get('/me', getProfile);

// PUT  /api/users/me  — update own profile (no password)
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty.'),
  body('department')
    .optional()
    .trim()
    .isString()
    .withMessage('Department must be a string.'),
  body('location')
    .optional()
    .trim()
    .isString()
    .withMessage('Location must be a string.'),
  body('avatar')
    .optional()
    .trim()
    .isURL()
    .withMessage('Avatar must be a valid URL.'),
];

router.put('/me', updateProfileValidation, validate, updateProfile);

// ─────────────────────────────────────────────────────────────
// Admin Routes  (role: 'admin' required)
// ─────────────────────────────────────────────────────────────

// GET    /api/users        — list all users (paginated, filterable)
router.get('/', authorize('admin'), getUsers);

// GET    /api/users/:id    — get a specific user by ID
router.get('/:id', authorize('admin'), getUser);

// PUT    /api/users/:id    — update a user's fields (no password)
router.put('/:id', authorize('admin'), updateUser);

// DELETE /api/users/:id    — permanently delete a user
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
