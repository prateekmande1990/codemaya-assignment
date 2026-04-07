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
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  llmApiKey: process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || '',
  llmModel: process.env.LLM_MODEL || 'gpt-4o-mini',
  llmBaseUrl: process.env.LLM_BASE_URL || undefined,
  askRateLimitPerMinute: Number(process.env.ASK_RATE_LIMIT_PER_MINUTE || 10),
  allowMockLlm: process.env.ALLOW_MOCK_LLM === 'true',
  requireEnv,
};
