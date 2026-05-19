const mongoose = require('mongoose');

const NOTIFICATION_TYPES = ['success', 'alert', 'message', 'system'];

const notificationSchema = new mongoose.Schema(
  {
    // Recipient user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    body: {
      type: String,
      required: [true, 'Body is required'],
      trim: true,
      maxlength: [500, 'Body cannot exceed 500 characters'],
    },
    // Matches Flutter NotificationType enum exactly
    type: {
      type: String,
      enum: { values: NOTIFICATION_TYPES, message: `Type must be one of: ${NOTIFICATION_TYPES.join(', ')}` },
      required: [true, 'Type is required'],
    },
    // Related item name — shown in notification body
    relatedItem: {
      type: String,
      trim: true,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // For alert-type notifications (rental requests): accept/decline state
    actionTaken: {
      type: String,
      enum: ['none', 'accepted', 'declined'],
      default: 'none',
    },
  },
  { timestamps: true }
);

// Index for user-specific notification queries
notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
