/**
 * Unified API response helpers.
 * All responses follow the format:
 *   Success: { success: true, message: '...', data: {}, meta: {} }
 *   Error:   { success: false, message: '...' }
 */

const sendSuccess = (res, { statusCode = 200, message = 'Success', data = null, meta = null } = {}) => {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  if (meta !== null) body.meta = meta;
  return res.status(statusCode).json(body);
};

const sendError = (res, { statusCode = 500, message = 'Internal server error' } = {}) => {
  return res.status(statusCode).json({ success: false, message });
};

module.exports = { sendSuccess, sendError };
