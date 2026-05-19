const Cart = require('../models/cart.model');
const Item = require('../models/item.model');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * GET /api/cart
 * Get the authenticated user's cart.
 */
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.item',
      select: 'name image category price available owner',
      populate: { path: 'owner', select: 'name' },
    });

    // Auto-create empty cart if doesn't exist
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    return sendSuccess(res, { message: 'Cart fetched successfully.', data: cart });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/cart/add
 * Add an item to the cart. If already present, increments rentalDays.
 * Body: { itemId, rentalDays }
 */
const addToCart = async (req, res, next) => {
  try {
    const { itemId, rentalDays = 1 } = req.body;

    // Validate item exists and is available
    const item = await Item.findById(itemId);
    if (!item) {
      return sendError(res, { statusCode: 404, message: 'Item not found.' });
    }
    if (!item.available) {
      return sendError(res, { statusCode: 400, message: 'This item is not currently available for rent.' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if item already in cart
    const existingIndex = cart.items.findIndex((ci) => ci.item.toString() === itemId);

    if (existingIndex >= 0) {
      // Update rental days
      cart.items[existingIndex].rentalDays = rentalDays;
      cart.items[existingIndex].priceSnapshot = item.price;
    } else {
      cart.items.push({
        item: item._id,
        priceSnapshot: item.price,
        rentalDays,
      });
    }

    await cart.save();
    await cart.populate({
      path: 'items.item',
      select: 'name image category price available',
    });

    return sendSuccess(res, {
      statusCode: 200,
      message: `${item.name} added to cart.`,
      data: cart,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/cart/remove/:itemId
 * Remove a specific item from the cart.
 */
const removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return sendError(res, { statusCode: 404, message: 'Cart not found.' });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter((ci) => ci.item.toString() !== req.params.itemId);

    if (cart.items.length === initialLength) {
      return sendError(res, { statusCode: 404, message: 'Item not found in cart.' });
    }

    await cart.save();

    return sendSuccess(res, { message: 'Item removed from cart.', data: cart });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/cart/clear
 * Clear all items from the cart.
 */
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return sendError(res, { statusCode: 404, message: 'Cart not found.' });
    }

    cart.items = [];
    await cart.save();

    return sendSuccess(res, { message: 'Cart cleared successfully.', data: cart });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/cart/update/:itemId
 * Update rental days for a cart item.
 * Body: { rentalDays }
 */
const updateCartItem = async (req, res, next) => {
  try {
    const { rentalDays } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return sendError(res, { statusCode: 404, message: 'Cart not found.' });
    }

    const cartItem = cart.items.find((ci) => ci.item.toString() === req.params.itemId);
    if (!cartItem) {
      return sendError(res, { statusCode: 404, message: 'Item not found in cart.' });
    }

    cartItem.rentalDays = rentalDays;
    await cart.save();

    await cart.populate({ path: 'items.item', select: 'name image price' });
    return sendSuccess(res, { message: 'Cart item updated.', data: cart });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCart, addToCart, removeFromCart, clearCart, updateCartItem };
