const Item = require('../models/item.model');

const getItems = async (req, res, next) => {
  try {
    const { search, category, condition, minPrice, maxPrice, available, sortBy } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { condition: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) filter.category = category;
    if (condition) filter.condition = condition;
    if (available !== undefined) filter.available = available === 'true';

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    const sort = sortBy === 'priceAsc'
      ? { price: 1 }
      : sortBy === 'priceDesc'
      ? { price: -1 }
      : { createdAt: -1 };

    const items = await Item.find(filter).sort(sort);
    res.json(items);
  } catch (error) {
    next(error);
  }
};

const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
};

const createItem = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      condition,
      price,
      imageUrl,
      available,
      location,
      ownerName,
    } = req.body;

    const item = new Item({
      title,
      description,
      category,
      condition,
      price,
      imageUrl,
      available: available ?? true,
      location,
      ownerName,
    });

    await item.save();
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const updates = req.body;
    const item = await Item.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    next(error);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
};
