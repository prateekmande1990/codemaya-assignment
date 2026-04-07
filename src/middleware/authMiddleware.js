const jwt = require('jsonwebtoken');
const { StatusCodes } = require('../utils/httpStatus');
const { jwtSecret } = require('../config/env');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Missing or invalid authorization token' });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = {
      id: payload.sub,
      email: payload.email,
    };
    return next();
  } catch (err) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;
