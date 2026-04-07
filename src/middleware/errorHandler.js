const { ZodError } = require('zod');
const { nodeEnv } = require('../config/env');
const { StatusCodes, ReasonPhrases } = require('../utils/httpStatus');
const { logError } = require('../utils/logger');

function notFoundHandler(req, res) {
  res.status(StatusCodes.NOT_FOUND).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, _next) {
  const isZodError = err instanceof ZodError;
  const rawStatusCode = isZodError ? StatusCodes.BAD_REQUEST : err.statusCode;
  const statusCode =
    Number.isInteger(rawStatusCode) && rawStatusCode >= 400 && rawStatusCode <= 599
      ? rawStatusCode
      : StatusCodes.INTERNAL_SERVER_ERROR;
  const isProd = nodeEnv === 'production';

  logError('request_failed', {
    requestId: req.requestId,
    path: req.originalUrl,
    method: req.method,
    statusCode,
    error: err.message,
  });

  const response = {
    message: statusCode === StatusCodes.INTERNAL_SERVER_ERROR ? ReasonPhrases.INTERNAL_SERVER_ERROR : err.message,
    requestId: req.requestId,
  };

  if (isZodError) {
    response.issues = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
  }

  if (!isProd && statusCode === StatusCodes.INTERNAL_SERVER_ERROR) {
    response.debug = err.message;
  }

  res.status(statusCode).json(response);
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
