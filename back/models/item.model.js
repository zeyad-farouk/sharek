const mongoose = require('mongoose');

const CATEGORIES = ['Engineering', 'Art Tools', 'Construction', 'Design', 'Electronics', 'Clothing', 'Furniture', 'Books', 'Other'];
const CONDITIONS = ['New', 'Used - Excellent', 'Used - Good', 'Used - Fair'];

const itemSchema = new mongoose.Schema(
  {
    // Owner reference (the user who listed this item)
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
    },
    // Basic info — matches Flutter Product model & AddNewItemPage form
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: { values: CATEGORIES, message: `Category must be one of: ${CATEGORIES.join(', ')}` },
    },
    condition: {
      type: String,
      required: [true, 'Condition is required'],
      enum: { values: CONDITIONS, message: `Condition must be one of: ${CONDITIONS.join(', ')}` },
    },
    // Price per day — matches Flutter "$/day" display
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    // Image URL — matches Flutter Image.network() usage
    image: {
      type: String,
      trim: true,
      default: '',
    },
    // Availability flag — shown as "Available" badge in profile
    available: {
      type: Boolean,
      default: true,
    },
    // Ratings — displayed in home & profile pages
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviews: {
      type: Number,
      min: 0,
      default: 0,
    },
    // Location — shown in item details tab
    location: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

// Text index for search functionality
itemSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Item', itemSchema);
