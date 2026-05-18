const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    category: { type: String, required: true, trim: true },
    condition: {
      type: String,
      required: true,
      trim: true,
      enum: ['New', 'Used - Excellent', 'Used - Good', 'Used - Fair'],
    },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, trim: true, default: '' },
    available: { type: Boolean, default: true },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewsCount: { type: Number, min: 0, default: 0 },
    location: { type: String, trim: true, default: '' },
    ownerName: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Item || mongoose.model('Item', itemSchema);
