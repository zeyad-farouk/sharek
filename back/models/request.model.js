const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    // The user submitting the request — matches Flutter RequestPage "Client Name"
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester is required'],
    },
    clientName: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
    },
    // Tool being requested — matches Flutter "Tool Name" field
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      default: null,
    },
    toolName: {
      type: String,
      required: [true, 'Tool name is required'],
      trim: true,
    },
    // Borrow duration — matches Flutter "Borrow Duration (Days)" field
    durationDays: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 day'],
    },
    // Optional message/notes
    message: {
      type: String,
      trim: true,
      default: '',
    },
    // Request lifecycle status
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Request', requestSchema);
