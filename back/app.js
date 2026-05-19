require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Route files
const authRoutes        = require('./routes/auth.routes');
const itemRoutes        = require('./routes/item.routes');
const cartRoutes        = require('./routes/cart.routes');
const orderRoutes       = require('./routes/order.routes');
const messageRoutes     = require('./routes/message.routes');
const notificationRoutes = require('./routes/notification.routes');
const requestRoutes     = require('./routes/request.routes');

// Middleware
const errorHandler = require('./middlewares/error.middleware');

const app = express();

// ────────────────────────────────────────────
// Core Middleware
// ────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ────────────────────────────────────────────
// Health Check
// ────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Sharek API is running',
    version: '1.0.0',
    docs: 'See README.md for API documentation',
  });
});

// ────────────────────────────────────────────
// API Routes
// ────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/items',         itemRoutes);
app.use('/api/cart',          cartRoutes);
app.use('/api/orders',        orderRoutes);
app.use('/api/messages',      messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/requests',      requestRoutes);

// ────────────────────────────────────────────
// 404 Handler
// ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ────────────────────────────────────────────
// Global Error Handler (must be last)
// ────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
