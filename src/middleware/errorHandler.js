const config = require('../config');
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

const handleMongooseValidationError = err => {
  const errors = Object.values(err.errors).map(el => ({
    field: el.path,
    message: el.message,
  }));
  const error = new ApiError(400, 'Validation failed');
  error.errors = errors;
  return error;
};

const handleMongooseDuplicateKeyError = err => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate value for ${field}: '${value}'. Please use another value.`;
  return new ApiError(409, message);
};

const handleMongooseCastError = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new ApiError(400, message);
};

const handleJWTError = () => {
  return new ApiError(401, 'Invalid token. Please log in again.');
};

const handleJWTExpiredError = () => {
  return new ApiError(401, 'Your token has expired. Please log in again.');
};

const errorConverter = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    let convertedError;

    if (err.name === 'ValidationError') {
      convertedError = handleMongooseValidationError(err);
    } else if (err.code === 11000) {
      convertedError = handleMongooseDuplicateKeyError(err);
    } else if (err.name === 'CastError') {
      convertedError = handleMongooseCastError(err);
    } else if (err.name === 'JsonWebTokenError') {
      convertedError = handleJWTError();
    } else if (err.name === 'TokenExpiredError') {
      convertedError = handleJWTExpiredError();
    } else {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Internal Server Error';
      convertedError = new ApiError(statusCode, message, false, err.stack);
    }

    error = convertedError;
  }

  next(error);
};

const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  if (!err.isOperational) {
    statusCode = 500;
    message = config.env === 'production' ? 'Internal Server Error' : err.message;
  }

  res.locals.errorMessage = message;

  const response = {
    success: false,
    error: message,
    ...(err.errors && { errors: err.errors }),
    ...(config.env === 'development' && {
      statusCode,
      stack: err.stack,
    }),
  };

  if (config.env !== 'test') {
    logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  }

  res.status(statusCode).json(response);
};

module.exports = { errorHandler, errorConverter };
