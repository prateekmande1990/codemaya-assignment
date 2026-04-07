const RateLimitWindow = require('../models/RateLimitWindow');
const createHttpError = require('../utils/httpError');
const { StatusCodes } = require('../utils/httpStatus');
const { askRateLimitPerMinute } = require('../config/env');

const WINDOW_MS = 60000;
const ROUTE_KEY = 'ask';

function getWindowStart(date) {
  return new Date(Math.floor(date.getTime() / WINDOW_MS) * WINDOW_MS);
}

async function askRateLimitMiddleware(req, res, next) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' });
  }

  const now = new Date();
  const windowStart = getWindowStart(now);

  const updated = await RateLimitWindow.findOneAndUpdate(
    { userId, routeKey: ROUTE_KEY, windowStart },
    { $inc: { count: 1 }, $setOnInsert: { userId, routeKey: ROUTE_KEY, windowStart } },
    { upsert: true, returnDocument: 'after' }
  );

  if (!updated || !Number.isFinite(updated.count)) {
    throw createHttpError(StatusCodes.INTERNAL_SERVER_ERROR, 'Rate limit state is invalid');
  }

  if (updated.count > askRateLimitPerMinute) {
    const retryAfterSeconds = Math.max(1, Math.ceil((windowStart.getTime() + WINDOW_MS - now.getTime()) / 1000));
    res.setHeader('Retry-After', retryAfterSeconds);
    return res.status(StatusCodes.TOO_MANY_REQUESTS).json({ message: 'Rate limit exceeded. Please retry shortly.' });
  }

  return next();
}

module.exports = askRateLimitMiddleware;

