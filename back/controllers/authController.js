const crypto = require('crypto');
const User = require('../models/user.model');
const { generateToken } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/response');

// ─────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────
/**
 * Register a new user account.
 * Hashing is handled by the User model pre-save hook.
 */
const register = async (req, res, next) => {
  try {
    const { email, password, name, department, location, avatar } = req.body;

    // Reject duplicate emails early with a clear message
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, {
        statusCode: 409,
        message: 'An account with this email already exists.',
      });
    }

    const user = await User.create({ email, password, name, department, location, avatar });
    const token = generateToken(user._id);

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Account created successfully.',
      data: { token, user: user.toJSON() },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────
/**
 * Authenticate a user and return a JWT token.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Explicitly select password (it has select: false in schema)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, { statusCode: 401, message: 'Invalid email or password.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, { statusCode: 401, message: 'Invalid email or password.' });
    }

    // Update presence fields
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Logged in successfully.',
      data: { token, user: user.toJSON() },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────────────────────────
/**
 * Log out the currently authenticated user.
 * Sets isOnline = false and updates lastSeen.
 * JWT invalidation is client-side (stateless); server records presence only.
 */
const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      isOnline: false,
      lastSeen: new Date(),
    });

    return sendSuccess(res, { message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/auth/change-password
// ─────────────────────────────────────────────────────────────
/**
 * Change the currently authenticated user's password.
 * Requires the existing password for confirmation.
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return sendError(res, { statusCode: 404, message: 'User not found.' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return sendError(res, { statusCode: 400, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    return sendSuccess(res, { message: 'Password changed successfully.' });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/forgot-password
// ─────────────────────────────────────────────────────────────
/**
 * Generate a password-reset token and store its hash on the user document.
 * In production, email the raw token to the user. Here we return it in the
 * response so the flow can be tested without an email service.
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Always return 200 to prevent email enumeration attacks
      return sendSuccess(res, {
        message: 'If that email exists, a reset link has been sent.',
      });
    }

    // Generate raw token
    const rawToken = crypto.randomBytes(32).toString('hex');

    // Store hashed version; never save raw token to DB
    user.passwordResetToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.passwordResetExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save({ validateBeforeSave: false });

    // TODO: In production, send rawToken via email instead of returning it
    return sendSuccess(res, {
      message: 'Password reset token generated. Check your email.',
      data: {
        // Remove this in production — only for development/testing
        resetToken: process.env.NODE_ENV === 'development' ? rawToken : undefined,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/reset-password/:token
// ─────────────────────────────────────────────────────────────
/**
 * Reset password using the token received from the forgot-password flow.
 * Hashes the incoming raw token and compares to the stored hash.
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return sendError(res, { statusCode: 400, message: 'Reset token is required.' });
    }

    // Hash the incoming raw token to compare with DB
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpire: { $gt: Date.now() },
    });

    if (!user) {
      return sendError(res, {
        statusCode: 400,
        message: 'Invalid or expired password reset token.',
      });
    }

    // Set new password — model pre-save hook hashes it automatically
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    const newToken = generateToken(user._id);

    return sendSuccess(res, {
      message: 'Password reset successfully.',
      data: { token: newToken },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
};
