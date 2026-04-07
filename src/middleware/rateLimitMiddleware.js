const RateLimitWindow = require('../models/RateLimitWindow');
const { StatusCodes } = require('../utils/httpStatus');
const { askRateLimitPerMinute } = require('../config/env');

function getWindowStart(date) {
  return new Date(Math.floor(date.getTime() / 60000) * 60000);
}

async function askRateLimitMiddleware(req, res, next) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' });
  }

  const now = new Date();
  const windowStart = getWindowStart(now);
  const routeKey = 'ask';

  const updated = await RateLimitWindow.findOneAndUpdate(
    { userId, routeKey, windowStart },
    { $inc: { count: 1 }, $setOnInsert: { userId, routeKey, windowStart } },
    { upsert: true, new: true }
  );

  if (updated.count > askRateLimitPerMinute) {
    const retryAfterSeconds = Math.ceil((windowStart.getTime() + 60000 - now.getTime()) / 1000);
    res.setHeader('Retry-After', retryAfterSeconds);
    return res.status(StatusCodes.TOO_MANY_REQUESTS).json({ message: 'Rate limit exceeded. Please retry shortly.' });
  }

  return next();
}

module.exports = askRateLimitMiddleware;
