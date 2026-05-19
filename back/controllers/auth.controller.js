const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { sendSuccess, sendError } = require('../utils/response');

// Generate a signed JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

/**
 * POST /api/auth/register
 * Register a new user account.
 */
const register = async (req, res, next) => {
  try {
    const { email, password, name, department, location, avatar } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, { statusCode: 409, message: 'An account with this email already exists.' });
    }

    const user = await User.create({ email, password, name, department, location, avatar });
    const token = generateToken(user._id);

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Account created successfully.',
      data: { token, user },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
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

    // Update online status
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    // toJSON removes password from response
    const userObj = user.toJSON();

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Logged in successfully.',
      data: { token, user: userObj },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Get the currently authenticated user's profile.
 */
const getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, {
      message: 'Profile fetched successfully.',
      data: { user: req.user },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/auth/me
 * Update the currently authenticated user's profile.
 * (Does NOT allow password change via this endpoint)
 */
const updateMe = async (req, res, next) => {
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

    return sendSuccess(res, {
      message: 'Profile updated successfully.',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/auth/change-password
 * Change the currently authenticated user's password.
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
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

module.exports = { register, login, getMe, updateMe, changePassword };
