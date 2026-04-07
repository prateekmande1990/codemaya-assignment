const { ZodError } = require('zod');
const { nodeEnv } = require('../config/env');
const { logError } = require('../utils/logger');

function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, _next) {
  const isZodError = err instanceof ZodError;
  const statusCode = isZodError ? 400 : err.statusCode || 500;
  const isProd = nodeEnv === 'production';

  logError('request_failed', {
    path: req.originalUrl,
    method: req.method,
    statusCode,
    error: err.message,
  });

  const response = {
    message: statusCode === 500 ? 'Internal server error' : err.message,
  };

  if (isZodError) {
    response.issues = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
  }

  if (!isProd && statusCode === 500) {
    response.debug = err.message;
  }

  res.status(statusCode).json(response);
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
