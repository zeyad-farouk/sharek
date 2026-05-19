/**
 * Reusable query builder for list endpoints.
 * Supports: search (text), filtering, sorting, pagination, field selection.
 *
 * Usage:
 *   const results = await applyQuery(Model, req.query, {
 *     searchFields: ['name', 'description'],
 *     allowedFilters: ['category', 'available'],
 *     defaultSort: { createdAt: -1 },
 *     populate: 'owner',
 *   });
 */
const applyQuery = async (Model, queryParams = {}, options = {}) => {
  const {
    searchFields = [],
    allowedFilters = [],
    defaultSort = { createdAt: -1 },
    populate = null,
    hardFilter = {},   // Always-applied filter (e.g. { user: req.user._id })
  } = options;

  const filter = { ...hardFilter };

  // --- Search ---
  const { search, sort, page, limit, fields, ...rest } = queryParams;

  if (search && searchFields.length > 0) {
    filter.$or = searchFields.map((field) => ({
      [field]: { $regex: search, $options: 'i' },
    }));
  }

  // --- Allowed field filters (e.g. category=Engineering&available=true) ---
  allowedFilters.forEach((key) => {
    if (rest[key] !== undefined) {
      // Range filters: price[gte]=100
      if (typeof rest[key] === 'object') {
        filter[key] = {};
        Object.entries(rest[key]).forEach(([op, val]) => {
          filter[key][`$${op}`] = isNaN(val) ? val : Number(val);
        });
      } else {
        // Boolean coercion
        if (rest[key] === 'true') filter[key] = true;
        else if (rest[key] === 'false') filter[key] = false;
        else filter[key] = rest[key];
      }
    }
  });

  // --- Sorting ---
  let sortObj = { ...defaultSort };
  if (sort) {
    sortObj = {};
    sort.split(',').forEach((field) => {
      if (field.startsWith('-')) sortObj[field.slice(1)] = -1;
      else sortObj[field] = 1;
    });
  }

  // --- Pagination ---
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  // --- Field selection ---
  const selectStr = fields ? fields.split(',').join(' ') : '';

  // --- Execute query ---
  const total = await Model.countDocuments(filter);

  let query = Model.find(filter).sort(sortObj).skip(skip).limit(limitNum);
  if (selectStr) query = query.select(selectStr);
  if (populate) query = query.populate(populate);

  const docs = await query;

  return {
    data: docs,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  };
};

module.exports = { applyQuery };
