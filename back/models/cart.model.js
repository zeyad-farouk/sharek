const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Item reference is required'],
    },
    // Snapshot the price at time of adding to cart (prices can change)
    priceSnapshot: {
      type: Number,
      required: true,
      min: 0,
    },
    // Rental duration in days — linked to Flutter "$/day" display
    rentalDays: {
      type: Number,
      default: 1,
      min: [1, 'Rental must be at least 1 day'],
    },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    // One cart per user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    // Flat service fee — matches the Flutter CartPage $5 fee
    serviceFee: {
      type: Number,
      default: 5.0,
    },
  },
  { timestamps: true }
);

// Virtual: subtotal (sum of price * days for each item)
cartSchema.virtual('subtotal').get(function () {
  return this.items.reduce((sum, ci) => sum + ci.priceSnapshot * ci.rentalDays, 0);
});

// Virtual: total = subtotal + serviceFee
cartSchema.virtual('total').get(function () {
  return this.subtotal + this.serviceFee;
});

cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Cart', cartSchema);
