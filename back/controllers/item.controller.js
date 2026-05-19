const Item = require('../models/item.model');
const { sendSuccess, sendError } = require('../utils/response');
const { applyQuery } = require('../utils/queryBuilder');

const ALLOWED_FILTERS = ['category', 'condition', 'available', 'owner'];

/**
 * GET /api/items
 * Get all items with search, filter, sort, pagination.
 * Query params:
 *   search=laser           - text search across name, description, category
 *   category=Engineering   - filter by category
 *   condition=New          - filter by condition
 *   available=true         - filter by availability
 *   sort=-createdAt        - sort field (prefix - for desc)
 *   page=1&limit=10        - pagination
 *   fields=name,price      - select specific fields
 *   minPrice=5&maxPrice=50 - price range (handled via filter object)
 */
const getItems = async (req, res, next) => {
  try {
    // Handle price range filters (minPrice / maxPrice → price[gte] / price[lte])
    const queryParams = { ...req.query };
    if (queryParams.minPrice || queryParams.maxPrice) {
      queryParams.price = {};
      if (queryParams.minPrice) queryParams.price.gte = queryParams.minPrice;
      if (queryParams.maxPrice) queryParams.price.lte = queryParams.maxPrice;
      delete queryParams.minPrice;
      delete queryParams.maxPrice;
    }

    const { data, meta } = await applyQuery(Item, queryParams, {
      searchFields: ['name', 'description', 'category'],
      allowedFilters: [...ALLOWED_FILTERS, 'price'],
      defaultSort: { createdAt: -1 },
      populate: { path: 'owner', select: 'name avatar department location isOnline' },
    });

    return sendSuccess(res, {
      message: 'Items fetched successfully.',
      data,
      meta,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/items/:id
 * Get a single item by ID.
 */
const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate('owner', 'name avatar department location isOnline');
    if (!item) {
      return sendError(res, { statusCode: 404, message: 'Item not found.' });
    }
    return sendSuccess(res, { message: 'Item fetched successfully.', data: item });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/items
 * Create a new item listing. Requires authentication.
 */
const createItem = async (req, res, next) => {
  try {
    const { name, description, category, condition, price, image, location } = req.body;

    const item = await Item.create({
      owner: req.user._id,
      name,
      description,
      category,
      condition,
      price,
      image: image || '',
      location: location || '',
    });

    await item.populate('owner', 'name avatar department');

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Item created successfully.',
      data: item,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/items/:id
 * Update an item. Only the owner can update.
 */
const updateItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return sendError(res, { statusCode: 404, message: 'Item not found.' });
    }

    // Authorization: only the owner can edit
    if (item.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, { statusCode: 403, message: 'You are not authorized to update this item.' });
    }

    const allowedUpdates = ['name', 'description', 'category', 'condition', 'price', 'image', 'location', 'available'];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) item[field] = req.body[field];
    });

    await item.save();
    await item.populate('owner', 'name avatar department');

    return sendSuccess(res, { message: 'Item updated successfully.', data: item });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/items/:id
 * Delete an item. Only the owner or admin can delete.
 */
const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return sendError(res, { statusCode: 404, message: 'Item not found.' });
    }

    if (item.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, { statusCode: 403, message: 'You are not authorized to delete this item.' });
    }

    await item.deleteOne();

    return sendSuccess(res, { message: 'Item deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/items/my
 * Get all items listed by the authenticated user (for Profile page).
 */
const getMyItems = async (req, res, next) => {
  try {
    const items = await Item.find({ owner: req.user._id }).sort({ createdAt: -1 });
    return sendSuccess(res, {
      message: 'Your items fetched successfully.',
      data: items,
      meta: { total: items.length },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getItems, getItemById, createItem, updateItem, deleteItem, getMyItems };
