const OpenAI = require('openai');
const { z } = require('zod');
const { llmApiKey, llmModel, llmBaseUrl, allowMockLlm } = require('../config/env');
const { LLM_SYSTEM_PROMPT, askPromptTemplate } = require('../prompts/llmPrompts');

const AskResponseSchema = z.object({
  answer: z.string().min(1),
  sources: z.array(z.string()).default([]),
});

function extractJson(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch (_err) {
    return null;
  }
}

function runMockModel(contextDocs) {
  if (!contextDocs.length) {
    return {
      answer: 'I do not have enough information in the provided documents to answer that question.',
      sources: [],
    };
  }

  const topDoc = contextDocs[0];
  const snippet = String(topDoc.content).slice(0, 220);
  return {
    answer: snippet.endsWith('.') ? snippet : `${snippet}...`,
    sources: [String(topDoc._id)],
  };
}

async function generateGroundedAnswer({ question, contextDocs }) {
  if (!llmApiKey) {
    if (!allowMockLlm) {
      throw new Error(
        'No Groq API key configured. Set GROQ_API_KEY, or set ALLOW_MOCK_LLM=true for local/testing mode.'
      );
    }
    return runMockModel(contextDocs);
  }

  const context = contextDocs
    .map(
      (doc, idx) =>
        `[${idx + 1}] id=${doc._id}\ntitle=${doc.title}\ntags=${(doc.tags || []).join(', ')}\ncontent=${doc.content}`
    )
    .join('\n\n');

  const prompt = await askPromptTemplate.format({
    question,
    context: context || '(no relevant documents found)',
  });

  const client = new OpenAI({ apiKey: llmApiKey, baseURL: llmBaseUrl });

  const completion = await client.chat.completions.create({
    model: llmModel,
    temperature: 0,
    messages: [
      { role: 'system', content: LLM_SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
  });

  const rawContent = completion.choices?.[0]?.message?.content || '{}';
  const parsed = extractJson(rawContent) || {};
  const validated = AskResponseSchema.parse(parsed);

  return validated;
}

module.exports = {
  AskResponseSchema,
  generateGroundedAnswer,
};
