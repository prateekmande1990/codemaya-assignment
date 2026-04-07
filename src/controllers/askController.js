const { z } = require('zod');
const asyncHandler = require('../utils/asyncHandler');
const { retrieveRelevantDocs } = require('../services/retrievalService');
const { generateGroundedAnswer } = require('../services/llmService');

const askSchema = z.object({
  question: z.string().min(3),
});

const askQuestion = asyncHandler(async (req, res) => {
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

  res.json(answer);
});

module.exports = {
  askQuestion,
};
