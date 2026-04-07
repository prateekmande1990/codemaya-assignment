const Document = require('../models/Document');
const asyncHandler = require('../utils/asyncHandler');

const listDocuments = asyncHandler(async (_req, res) => {
  const docs = await Document.find().sort({ createdAt: -1 }).lean();
  res.json({ data: docs });
});

module.exports = {
  listDocuments,
};
