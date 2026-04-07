const { StatusCodes } = require('./httpStatus');

function createHttpError(statusCode, message) {
  const normalized = Number.isInteger(statusCode) && statusCode >= 400 && statusCode <= 599
    ? statusCode
    : StatusCodes.INTERNAL_SERVER_ERROR;

  const err = new Error(message);
  err.statusCode = normalized;
  return err;
}

module.exports = createHttpError;
