const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const Item = require('../models/item.model');
const { sendSuccess, sendError } = require('../utils/response');
const { applyQuery } = require('../utils/queryBuilder');

/**
 * POST /api/orders
 * Checkout: create an order from the user's cart.
 * Body: { paymentMethod }
 */
const createOrder = async (req, res, next) => {
  try {
    const { paymentMethod } = req.body;

    // Fetch user cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.item');
    if (!cart || cart.items.length === 0) {
      return sendError(res, { statusCode: 400, message: 'Your cart is empty. Please add items before checkout.' });
    }

    // Build order items and validate availability
    const orderItems = [];
    for (const cartItem of cart.items) {
      const item = cartItem.item;
      if (!item || !item.available) {
        return sendError(res, {
          statusCode: 400,
          message: `Item "${item ? item.name : 'unknown'}" is no longer available.`,
        });
      }
      orderItems.push({
        item: item._id,
        itemName: item.name,
        itemImage: item.image || '',
        pricePerDay: cartItem.priceSnapshot,
        rentalDays: cartItem.rentalDays,
        subtotal: cartItem.priceSnapshot * cartItem.rentalDays,
      });
    }

    const subtotal = orderItems.reduce((sum, oi) => sum + oi.subtotal, 0);
    const serviceFee = cart.serviceFee;
    const totalAmount = subtotal + serviceFee;

    // Create the order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      subtotal,
      serviceFee,
      totalAmount,
      paymentMethod,
      status: 'confirmed',
    });

    // Clear the cart after successful order
    cart.items = [];
    await cart.save();

    return sendSuccess(res, {
      statusCode: 201,
      message: `Payment of $${totalAmount.toFixed(2)} successful! Order confirmed.`,
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/orders
 * Get all orders for the authenticated user.
 * Query: status=confirmed, sort=-createdAt, page=1, limit=10
 */
const getMyOrders = async (req, res, next) => {
  try {
    const { data, meta } = await applyQuery(Order, req.query, {
      allowedFilters: ['status', 'paymentMethod'],
      defaultSort: { createdAt: -1 },
      hardFilter: { user: req.user._id },
    });

    return sendSuccess(res, {
      message: 'Orders fetched successfully.',
      data,
      meta,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/orders/:id
 * Get a single order by ID (must belong to authenticated user).
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) {
      return sendError(res, { statusCode: 404, message: 'Order not found.' });
    }
    return sendSuccess(res, { message: 'Order fetched successfully.', data: order });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/orders/:id/cancel
 * Cancel an order (only if still pending/confirmed).
 */
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) {
      return sendError(res, { statusCode: 404, message: 'Order not found.' });
    }
    if (!['pending', 'confirmed'].includes(order.status)) {
      return sendError(res, { statusCode: 400, message: `Cannot cancel an order with status "${order.status}".` });
    }

    order.status = 'cancelled';
    await order.save();

    return sendSuccess(res, { message: 'Order cancelled successfully.', data: order });
  } catch (err) {
    next(err);
  }
};

// Admin only
const getAllOrders = async (req, res, next) => {
  try {
    const { data, meta } = await applyQuery(Order, req.query, {
      allowedFilters: ['status', 'paymentMethod'],
      defaultSort: { createdAt: -1 },
      populate: { path: 'user', select: 'name email' },
    });

    return sendSuccess(res, { message: 'All orders fetched.', data, meta });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, cancelOrder, getAllOrders };
