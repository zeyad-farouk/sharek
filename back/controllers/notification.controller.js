const Notification = require('../models/notification.model');
const { sendSuccess, sendError } = require('../utils/response');
const { applyQuery } = require('../utils/queryBuilder');

/**
 * GET /api/notifications
 * Get all notifications for the authenticated user.
 * Query: type=alert, isRead=false, sort=-createdAt, page=1, limit=20
 */
const getNotifications = async (req, res, next) => {
  try {
    const queryParams = { ...req.query };

    // Map "unread=true" → "isRead=false" for intuitive URL
    if (queryParams.unread !== undefined) {
      queryParams.isRead = queryParams.unread === 'true' ? 'false' : 'true';
      delete queryParams.unread;
    }

    const { data, meta } = await applyQuery(Notification, queryParams, {
      searchFields: ['title', 'body', 'relatedItem'],
      allowedFilters: ['type', 'isRead', 'actionTaken'],
      defaultSort: { createdAt: -1 },
      hardFilter: { user: req.user._id },
    });

    // Count unread for badge
    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

    return sendSuccess(res, {
      message: 'Notifications fetched successfully.',
      data,
      meta: { ...meta, unreadCount },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/notifications/:id
 * Get a single notification.
 */
const getNotificationById = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });
    if (!notification) {
      return sendError(res, { statusCode: 404, message: 'Notification not found.' });
    }
    return sendSuccess(res, { message: 'Notification fetched successfully.', data: notification });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/notifications/:id/read
 * Mark a notification as read.
 */
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return sendError(res, { statusCode: 404, message: 'Notification not found.' });
    }
    return sendSuccess(res, { message: 'Notification marked as read.', data: notification });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read.
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    return sendSuccess(res, { message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/notifications/:id/action
 * Accept or decline an "alert" type notification (rental request).
 * Body: { action: 'accepted' | 'declined' }
 */
const handleAction = async (req, res, next) => {
  try {
    const { action } = req.body;
    if (!['accepted', 'declined'].includes(action)) {
      return sendError(res, { statusCode: 400, message: 'Action must be "accepted" or "declined".' });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, type: 'alert' },
      { actionTaken: action, isRead: true },
      { new: true }
    );

    if (!notification) {
      return sendError(res, { statusCode: 404, message: 'Notification not found or not an actionable type.' });
    }

    return sendSuccess(res, {
      message: `Request ${action} successfully.`,
      data: notification,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/notifications/:id
 * Delete a notification (swipe-to-delete in Flutter UI).
 */
const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!notification) {
      return sendError(res, { statusCode: 404, message: 'Notification not found.' });
    }
    return sendSuccess(res, { message: 'Notification deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/notifications (internal / admin use)
 * Create a notification for a specific user.
 */
const createNotification = async (req, res, next) => {
  try {
    const { userId, title, body, type, relatedItem } = req.body;
    const notification = await Notification.create({
      user: userId || req.user._id,
      title,
      body,
      type,
      relatedItem: relatedItem || '',
    });
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Notification created.',
      data: notification,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  handleAction,
  deleteNotification,
  createNotification,
};
