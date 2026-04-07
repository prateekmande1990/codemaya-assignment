const Document = require('../models/Document');

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function scoreDocument(questionTokens, doc) {
  const titleTokens = tokenize(doc.title);
  const contentTokens = tokenize(doc.content);
  const tagTokens = (doc.tags || []).flatMap((tag) => tokenize(tag));

  const titleSet = new Set(titleTokens);
  const contentSet = new Set(contentTokens);
  const tagSet = new Set(tagTokens);

  let score = 0;
  for (const token of questionTokens) {
    if (titleSet.has(token)) score += 3;
    if (tagSet.has(token)) score += 2;
    if (contentSet.has(token)) score += 1;
  }

  return score;
}

function deriveConfidence(topScore) {
  if (topScore >= 8) return 'high';
  if (topScore >= 4) return 'medium';
  return 'low';
}

async function retrieveRelevantDocs(question, topN = 3) {
  const docs = await Document.find().lean();
  const questionTokens = tokenize(question);

  const ranked = docs
    .map((doc) => ({ doc, score: scoreDocument(questionTokens, doc) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  const topScore = ranked[0]?.score || 0;

  return {
    docs: ranked.map((row) => ({ ...row.doc, retrievalScore: row.score })),
    confidence: deriveConfidence(topScore),
    topScore,
  };
}

module.exports = {
  retrieveRelevantDocs,
};
