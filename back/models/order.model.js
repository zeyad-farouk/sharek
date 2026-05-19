const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    itemName: { type: String, required: true },
    itemImage: { type: String, default: '' },
    pricePerDay: { type: Number, required: true },
    rentalDays: { type: Number, default: 1, min: 1 },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'Order must contain at least one item',
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    serviceFee: {
      type: Number,
      required: true,
      default: 5.0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    // Payment method — matches Flutter PaymentPage options
    paymentMethod: {
      type: String,
      enum: ['visa', 'vodafone'],
      required: [true, 'Payment method is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
