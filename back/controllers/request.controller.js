const Request = require('../models/request.model');
const Notification = require('../models/notification.model');
const { sendSuccess, sendError } = require('../utils/response');
const { applyQuery } = require('../utils/queryBuilder');

/**
 * GET /api/requests
 * Get requests. Users see their own requests; admins see all.
 * Query: status=pending, search=laser, sort=-createdAt, page=1, limit=10
 */
const getRequests = async (req, res, next) => {
  try {
    const hardFilter = req.user.role === 'admin' ? {} : { requester: req.user._id };

    const { data, meta } = await applyQuery(Request, req.query, {
      searchFields: ['clientName', 'toolName', 'message'],
      allowedFilters: ['status'],
      defaultSort: { createdAt: -1 },
      hardFilter,
      populate: { path: 'requester', select: 'name email avatar' },
    });

    return sendSuccess(res, { message: 'Requests fetched successfully.', data, meta });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/requests/:id
 * Get a single request.
 */
const getRequestById = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id).populate('requester', 'name email avatar');
    if (!request) {
      return sendError(res, { statusCode: 404, message: 'Request not found.' });
    }

    // Non-admins can only see their own requests
    if (req.user.role !== 'admin' && request.requester._id.toString() !== req.user._id.toString()) {
      return sendError(res, { statusCode: 403, message: 'Access denied.' });
    }

    return sendSuccess(res, { message: 'Request fetched successfully.', data: request });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/requests
 * Create a new tool rental request.
 * Body: { clientName, toolName, durationDays, message?, itemId? }
 */
const createRequest = async (req, res, next) => {
  try {
    const { clientName, toolName, durationDays, message, itemId } = req.body;

    const request = await Request.create({
      requester: req.user._id,
      clientName,
      toolName,
      durationDays,
      message: message || '',
      item: itemId || null,
    });

    // Auto-create a "Rental Request" notification for the requester
    await Notification.create({
      user: req.user._id,
      title: 'Request Submitted',
      body: `Your request for "${toolName}" for ${durationDays} day(s) has been submitted successfully.`,
      type: 'system',
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Request submitted successfully.',
      data: request,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/requests/:id/status
 * Update request status (admin or owner).
 * Body: { status: 'accepted' | 'declined' | 'cancelled' }
 */
const updateRequestStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['accepted', 'declined', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
      return sendError(res, { statusCode: 400, message: `Status must be one of: ${allowedStatuses.join(', ')}.` });
    }

    const request = await Request.findById(req.params.id);
    if (!request) {
      return sendError(res, { statusCode: 404, message: 'Request not found.' });
    }

    // Only requester can cancel; only admin can accept/decline
    if (status === 'cancelled') {
      if (request.requester.toString() !== req.user._id.toString()) {
        return sendError(res, { statusCode: 403, message: 'Only the requester can cancel a request.' });
      }
    } else {
      if (req.user.role !== 'admin') {
        return sendError(res, { statusCode: 403, message: 'Only admins can accept or decline requests.' });
      }
    }

    request.status = status;
    await request.save();

    // Notify requester of the status change
    if (status === 'accepted' || status === 'declined') {
      await Notification.create({
        user: request.requester,
        title: `Request ${status.charAt(0).toUpperCase() + status.slice(1)}!`,
        body: `Your request for "${request.toolName}" has been ${status}.`,
        type: status === 'accepted' ? 'success' : 'alert',
        relatedItem: request.toolName,
      });
    }

    return sendSuccess(res, { message: `Request ${status} successfully.`, data: request });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/requests/:id
 * Update request details (only while pending, by requester).
 */
const updateRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return sendError(res, { statusCode: 404, message: 'Request not found.' });
    }
    if (request.requester.toString() !== req.user._id.toString()) {
      return sendError(res, { statusCode: 403, message: 'Access denied.' });
    }
    if (request.status !== 'pending') {
      return sendError(res, { statusCode: 400, message: 'Only pending requests can be edited.' });
    }

    const allowedFields = ['clientName', 'toolName', 'durationDays', 'message'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) request[field] = req.body[field];
    });

    await request.save();
    return sendSuccess(res, { message: 'Request updated successfully.', data: request });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/requests/:id
 * Delete a request (only requester can delete, or admin).
 */
const deleteRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return sendError(res, { statusCode: 404, message: 'Request not found.' });
    }
    if (request.requester.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, { statusCode: 403, message: 'Access denied.' });
    }

    await request.deleteOne();
    return sendSuccess(res, { message: 'Request deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRequests,
  getRequestById,
  createRequest,
  updateRequestStatus,
  updateRequest,
  deleteRequest,
};
