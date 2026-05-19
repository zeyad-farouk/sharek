const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { sendError } = require('../utils/response');

/**
 * Protect route — validates Bearer JWT and attaches req.user
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, { statusCode: 401, message: 'Not authorized. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return sendError(res, { statusCode: 401, message: 'User associated with this token no longer exists.' });
    }

    next();
  } catch (err) {
    return sendError(res, { statusCode: 401, message: 'Not authorized. Invalid or expired token.' });
  }
};

/**
 * Restrict to specific roles
 * Usage: authorize('admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(res, {
        statusCode: 403,
        message: `Access denied. Required role: ${roles.join(' or ')}.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
