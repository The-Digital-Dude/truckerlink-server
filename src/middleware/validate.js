const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validate = validations => {
  return async (req, res, next) => {
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
    }));

    const error = ApiError.badRequest('Validation failed');
    error.errors = extractedErrors;

    return next(error);
  };
};

module.exports = validate;
