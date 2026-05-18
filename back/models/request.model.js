const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    clientName: { type: String, required: true, trim: true },
    toolName: { type: String, required: true, trim: true },
    durationDays: { type: Number, required: true, min: 1 },
    message: { type: String, trim: true, default: '' },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Request || mongoose.model('Request', requestSchema);
