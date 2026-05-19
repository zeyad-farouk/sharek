const Message = require('../models/message.model');
const { sendSuccess, sendError } = require('../utils/response');
const { applyQuery } = require('../utils/queryBuilder');
const mongoose = require('mongoose');

/**
 * GET /api/messages/conversations
 * Get all conversations for the authenticated user.
 * Returns the latest message per conversation partner.
 */
const getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Aggregate to get unique conversation threads
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        // Create a canonical conversation key (always sorted pair of IDs)
        $addFields: {
          conversationKey: {
            $cond: {
              if: { $lt: ['$sender', '$receiver'] },
              then: { $concat: [{ $toString: '$sender' }, '_', { $toString: '$receiver' }] },
              else: { $concat: [{ $toString: '$receiver' }, '_', { $toString: '$sender' }] },
            },
          },
        },
      },
      {
        $group: {
          _id: '$conversationKey',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [{ $and: [{ $eq: ['$receiver', userId] }, { $eq: ['$isRead', false] }] }, 1, 0],
            },
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ['$lastMessage', { unreadCount: '$unreadCount' }],
          },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    // Populate sender and receiver info
    await Message.populate(conversations, [
      { path: 'sender', select: 'name avatar isOnline', model: 'User' },
      { path: 'receiver', select: 'name avatar isOnline', model: 'User' },
    ]);

    return sendSuccess(res, {
      message: 'Conversations fetched successfully.',
      data: conversations,
      meta: { total: conversations.length },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/messages/thread/:userId
 * Get all messages in a conversation with a specific user.
 * Query: page, limit
 */
const getThread = async (req, res, next) => {
  try {
    const myId = req.user._id;
    const otherId = req.params.userId;

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 50);
    const skip = (page - 1) * limit;

    const filter = {
      $or: [
        { sender: myId, receiver: otherId },
        { sender: otherId, receiver: myId },
      ],
    };

    const total = await Message.countDocuments(filter);
    const messages = await Message.find(filter)
      .sort({ createdAt: 1 }) // Chronological for chat display
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    // Mark messages received by me as read
    await Message.updateMany({ sender: otherId, receiver: myId, isRead: false }, { isRead: true });

    return sendSuccess(res, {
      message: 'Thread fetched successfully.',
      data: messages,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/messages
 * Send a new message.
 * Body: { receiverId, text, itemId?, itemName? }
 */
const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, text, itemId, itemName } = req.body;

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      text,
      item: itemId || null,
      itemName: itemName || '',
    });

    await message.populate([
      { path: 'sender', select: 'name avatar' },
      { path: 'receiver', select: 'name avatar' },
    ]);

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Message sent successfully.',
      data: message,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/messages/:id
 * Delete a message (only sender can delete).
 */
const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return sendError(res, { statusCode: 404, message: 'Message not found.' });
    }
    if (message.sender.toString() !== req.user._id.toString()) {
      return sendError(res, { statusCode: 403, message: 'You can only delete your own messages.' });
    }

    await message.deleteOne();
    return sendSuccess(res, { message: 'Message deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/messages/:id/read
 * Mark a message as read.
 */
const markAsRead = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return sendError(res, { statusCode: 404, message: 'Message not found.' });
    }
    if (message.receiver.toString() !== req.user._id.toString()) {
      return sendError(res, { statusCode: 403, message: 'Not authorized.' });
    }

    message.isRead = true;
    await message.save();

    return sendSuccess(res, { message: 'Message marked as read.', data: message });
  } catch (err) {
    next(err);
  }
};

module.exports = { getConversations, getThread, sendMessage, deleteMessage, markAsRead };
