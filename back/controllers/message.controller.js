const Message = require('../models/message.model');

const getMessages = async (req, res, next) => {
  try {
    const { sender, receiver, itemName, unread, search } = req.query;
    const filter = {};

    if (sender) filter.sender = { $regex: sender, $options: 'i' };
    if (receiver) filter.receiver = { $regex: receiver, $options: 'i' };
    if (itemName) filter.itemName = { $regex: itemName, $options: 'i' };
    if (unread !== undefined) filter.isRead = unread === 'true';
    if (search) {
      filter.$or = [
        { sender: { $regex: search, $options: 'i' } },
        { receiver: { $regex: search, $options: 'i' } },
        { itemName: { $regex: search, $options: 'i' } },
        { text: { $regex: search, $options: 'i' } },
      ];
    }

    const messages = await Message.find(filter).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    next(error);
  }
};

const getMessageById = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json(message);
  } catch (error) {
    next(error);
  }
};

const createMessage = async (req, res, next) => {
  try {
    const { sender, receiver, itemName, text } = req.body;
    const message = new Message({ sender, receiver, itemName, text });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

const updateMessage = async (req, res, next) => {
  try {
    const updates = req.body;
    const message = await Message.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json(message);
  } catch (error) {
    next(error);
  }
};

const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMessages,
  getMessageById,
  createMessage,
  updateMessage,
  deleteMessage,
};
