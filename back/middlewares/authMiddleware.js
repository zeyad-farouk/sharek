const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { sendError } = require('../utils/response');

/**
 * protect — validates the Bearer JWT and attaches req.user.
 *
 * Reads the token from the Authorization header:
 *   Authorization: Bearer <token>
 *
 * On success:  calls next() with req.user populated (password excluded).
 * On failure:  returns 401 Unauthorized.
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, {
      statusCode: 401,
      message: 'Not authorized. No token provided.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return sendError(res, {
        statusCode: 401,
        message: 'User associated with this token no longer exists.',
      });
    }

    next();
  } catch (err) {
    return sendError(res, {
      statusCode: 401,
      message: 'Not authorized. Invalid or expired token.',
    });
  }
};

/**
 * authorize — restricts access to specific roles.
 *
 * Must be used AFTER protect middleware.
 *
 * Usage:
 *   router.get('/admin-only', protect, authorize('admin'), handler);
 *   router.get('/multi-role', protect, authorize('admin', 'moderator'), handler);
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, {
        statusCode: 401,
        message: 'Not authorized. Please log in.',
      });
    }

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
