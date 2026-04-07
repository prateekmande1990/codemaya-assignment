const { z } = require('zod');
const asyncHandler = require('../utils/asyncHandler');
const createHttpError = require('../utils/httpError');
const { StatusCodes } = require('../utils/httpStatus');
const { askHistoryLimit } = require('../config/env');
const { retrieveRelevantDocs } = require('../services/retrievalService');
const { generateGroundedAnswer } = require('../services/llmService');
const AskHistory = require('../models/AskHistory');
const { logInfo } = require('../utils/logger');

const askSchema = z.object({
  question: z.string().min(3),
});

const askHistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(askHistoryLimit),
});

const askQuestion = asyncHandler(async (req, res) => {
  const startMs = Date.now();
  const { question } = askSchema.parse(req.body);

  const retrieval = await retrieveRelevantDocs(question, 3);
  const contextDocs = retrieval.docs;

  const llmResult = await generateGroundedAnswer({
    question,
    contextDocs,
  });

  const validSourceIds = new Set(contextDocs.map((doc) => String(doc._id)));
  const sources = llmResult.sources.filter((id) => validSourceIds.has(String(id)));

  const answer = {
    answer:
      contextDocs.length === 0
        ? 'I do not have enough information in the provided documents to answer that question.'
        : llmResult.answer,
    sources,
    confidence: retrieval.confidence,
  };

  await AskHistory.create({
    userId: req.user.id,
    question,
    answer: answer.answer,
    sources: answer.sources,
    confidence: answer.confidence,
  });

  const latencyMs = Date.now() - startMs;
  logInfo('ask_request', {
    requestId: req.requestId,
    userId: req.user.id,
    question: question.length > 120 ? `${question.slice(0, 117)}...` : question,
    latencyMs,
    confidence: answer.confidence,
  });

  res.json(answer);
});

const askHistory = asyncHandler(async (req, res) => {
  if (!req.user?.id) {
    throw createHttpError(StatusCodes.UNAUTHORIZED, 'Unauthorized');
  }

  const { page, limit } = askHistoryQuerySchema.parse(req.query);
  const skip = (page - 1) * limit;

  const [history, total] = await Promise.all([
    AskHistory.find({ userId: req.user.id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    AskHistory.countDocuments({ userId: req.user.id }),
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  res.json({
    data: history,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
});

module.exports = {
  askQuestion,
  askHistory,
};
