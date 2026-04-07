const dotenv = require('dotenv');

dotenv.config();

function requireEnv(name, fallback = undefined) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parseNumberEnv(name, fallback, { min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY } = {}) {
  const raw = process.env[name];
  const parsed = Number(raw);

  if (raw === undefined || raw === '' || Number.isNaN(parsed) || parsed < min || parsed > max) {
    return fallback;
  }

  return parsed;
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseNumberEnv('PORT', 5000, { min: 1, max: 65535 }),
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/codemaya_assignment',
  mongoMaxRetries: parseNumberEnv('MONGO_MAX_RETRIES', 0, { min: 0 }),
  mongoRetryDelayMs: parseNumberEnv('MONGO_RETRY_DELAY_MS', 5000, { min: 100 }),
  enableInMemoryMongoFallback: process.env.ENABLE_IN_MEMORY_MONGO_FALLBACK === 'true',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  llmApiKey: process.env.GROQ_API_KEY || '',
  llmModel: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
  llmBaseUrl: process.env.LLM_BASE_URL || 'https://api.groq.com/openai/v1',
  askRateLimitPerMinute: parseNumberEnv('ASK_RATE_LIMIT_PER_MINUTE', 10, { min: 1 }),
  askHistoryLimit: parseNumberEnv('ASK_HISTORY_LIMIT', 10, { min: 1 }),
  allowMockLlm: process.env.ALLOW_MOCK_LLM === 'true',
  requireEnv,
};
