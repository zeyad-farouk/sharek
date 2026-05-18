const Notification = require('../models/notification.model');

const getNotifications = async (req, res, next) => {
  try {
    const { type, unread, search } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (unread !== undefined) filter.isRead = unread === 'true';
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } },
        { relatedItem: { $regex: search, $options: 'i' } },
      ];
    }

    const notifications = await Notification.find(filter).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

const getNotificationById = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    next(error);
  }
};

const createNotification = async (req, res, next) => {
  try {
    const { title, body, type, relatedItem, isRead } = req.body;
    const notification = new Notification({ title, body, type, relatedItem, isRead });
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    next(error);
  }
};

const updateNotification = async (req, res, next) => {
  try {
    const updates = req.body;
    const notification = await Notification.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
};
