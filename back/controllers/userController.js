const User = require('../models/user.model');
const { applyQuery } = require('../utils/queryBuilder');
const { sendSuccess, sendError } = require('../utils/response');

// ─────────────────────────────────────────────────────────────
// GET /api/users/me   (alias: /api/auth/me kept for compatibility)
// ─────────────────────────────────────────────────────────────
/**
 * Get the currently authenticated user's own profile.
 * req.user is populated by the protect middleware.
 */
const getProfile = async (req, res, next) => {
  try {
    return sendSuccess(res, {
      message: 'Profile fetched successfully.',
      data: { user: req.user },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/users/me
// ─────────────────────────────────────────────────────────────
/**
 * Update the currently authenticated user's own profile.
 * Password changes are NOT allowed here — use /api/auth/change-password.
 */
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'department', 'location', 'avatar'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return sendError(res, { statusCode: 404, message: 'User not found.' });
    }

    return sendSuccess(res, {
      message: 'Profile updated successfully.',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/users   (Admin only)
// ─────────────────────────────────────────────────────────────
/**
 * Get all users with search, filter, sort, and pagination.
 * Restricted to admin role via authorize middleware in the route.
 */
const getUsers = async (req, res, next) => {
  try {
    const result = await applyQuery(User, req.query, {
      searchFields: ['name', 'email', 'department'],
      allowedFilters: ['role', 'isOnline', 'isVerified'],
      defaultSort: { createdAt: -1 },
    });

    return sendSuccess(res, {
      message: 'Users fetched successfully.',
      data: { users: result.data },
      meta: result.meta,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/users/:id   (Admin only)
// ─────────────────────────────────────────────────────────────
/**
 * Get a single user by their MongoDB ObjectId.
 * Restricted to admin role.
 */
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, { statusCode: 404, message: 'User not found.' });
    }

    return sendSuccess(res, {
      message: 'User fetched successfully.',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/users/:id   (Admin only)
// ─────────────────────────────────────────────────────────────
/**
 * Admin update of any user's fields (role, isVerified, etc.).
 * Password changes are NOT allowed here.
 */
const updateUser = async (req, res, next) => {
  try {
    // Prevent admins from directly changing passwords via this endpoint
    if (req.body.password) {
      return sendError(res, {
        statusCode: 400,
        message: 'Use /api/auth/change-password to update passwords.',
      });
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return sendError(res, { statusCode: 404, message: 'User not found.' });
    }

    return sendSuccess(res, {
      message: 'User updated successfully.',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/users/:id   (Admin only)
// ─────────────────────────────────────────────────────────────
/**
 * Permanently delete a user by ID.
 * Restricted to admin role.
 */
const deleteUser = async (req, res, next) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user._id.toString()) {
      return sendError(res, {
        statusCode: 400,
        message: 'You cannot delete your own account via this endpoint.',
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return sendError(res, { statusCode: 404, message: 'User not found.' });
    }

    return sendSuccess(res, { message: 'User deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
