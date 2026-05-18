const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: { type: String, required: true, trim: true },
    receiver: { type: String, required: true, trim: true },
    itemName: { type: String, trim: true, default: '' },
    text: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Message || mongoose.model('Message', messageSchema);
