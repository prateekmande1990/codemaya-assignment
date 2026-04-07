const dotenv = require('dotenv');

dotenv.config();

function requireEnv(name, fallback = undefined) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/codemaya_assignment',
  mongoMaxRetries: Number(process.env.MONGO_MAX_RETRIES || 0),
  mongoRetryDelayMs: Number(process.env.MONGO_RETRY_DELAY_MS || 5000),
  enableInMemoryMongoFallback: process.env.ENABLE_IN_MEMORY_MONGO_FALLBACK === 'true',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  llmApiKey: process.env.GROQ_API_KEY || '',
  llmModel: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
  llmBaseUrl: process.env.LLM_BASE_URL || 'https://api.groq.com/openai/v1',
  askRateLimitPerMinute: Number(process.env.ASK_RATE_LIMIT_PER_MINUTE || 10),
  askHistoryLimit: Number(process.env.ASK_HISTORY_LIMIT || 10),
  allowMockLlm: process.env.ALLOW_MOCK_LLM === 'true',
  requireEnv,
};
