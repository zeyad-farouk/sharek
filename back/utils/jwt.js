const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT access token for a given user ID.
 * Reads JWT_SECRET and JWT_EXPIRE from environment variables.
 *
 * @param {string|ObjectId} userId - The MongoDB _id of the user.
 * @returns {string} Signed JWT token string.
 */
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables.');
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

module.exports = { generateToken };
