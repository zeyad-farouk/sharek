const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ['success', 'alert', 'message', 'system'],
    },
    isRead: { type: Boolean, default: false },
    relatedItem: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
