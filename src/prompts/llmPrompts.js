const { PromptTemplate } = require('@langchain/core/prompts');

const LLM_SYSTEM_PROMPT = 'You are a JSON-only assistant.';

const ASK_USER_PROMPT_TEMPLATE = `You are a strict retrieval-based assistant.
Answer ONLY from the provided context snippets.
If the context does not contain the answer, respond with:
- answer: "I do not have enough information in the provided documents to answer that question."
- sources: []

Rules:
1) Do not use outside knowledge.
2) Keep answer concise and factual.
3) sources must contain only document IDs used.
4) Output valid JSON ONLY with keys: answer, sources.

Question:
{question}

Context:
{context}
`;

const askPromptTemplate = PromptTemplate.fromTemplate(ASK_USER_PROMPT_TEMPLATE);

module.exports = {
  LLM_SYSTEM_PROMPT,
  ASK_USER_PROMPT_TEMPLATE,
  askPromptTemplate,
};
