const Request = require('../models/request.model');

const getRequests = async (req, res, next) => {
  try {
    const { clientName, toolName, status, search } = req.query;
    const filter = {};

    if (clientName) filter.clientName = { $regex: clientName, $options: 'i' };
    if (toolName) filter.toolName = { $regex: toolName, $options: 'i' };
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { clientName: { $regex: search, $options: 'i' } },
        { toolName: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    const requests = await Request.find(filter).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

const getRequestById = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.json(request);
  } catch (error) {
    next(error);
  }
};

const createRequest = async (req, res, next) => {
  try {
    const { clientName, toolName, durationDays, message } = req.body;
    const request = new Request({ clientName, toolName, durationDays, message });
    await request.save();
    res.status(201).json(request);
  } catch (error) {
    next(error);
  }
};

const updateRequest = async (req, res, next) => {
  try {
    const updates = req.body;
    const request = await Request.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(request);
  } catch (error) {
    next(error);
  }
};

const deleteRequest = async (req, res, next) => {
  try {
    const request = await Request.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRequests,
  getRequestById,
  createRequest,
  updateRequest,
  deleteRequest,
};
