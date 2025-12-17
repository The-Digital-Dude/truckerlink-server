const { body, query } = require('express-validator');

const updateLocationValidator = [
  body('latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  body('longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  body('address').optional().trim(),
];

const getNearbyValidator = [
  query('latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  query('longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  query('maxDistance')
    .optional()
    .isInt({ min: 100, max: 100000 })
    .withMessage('Max distance must be between 100 and 100000 meters'),
];

const updateAvailabilityValidator = [
  body('isAvailable')
    .notEmpty()
    .withMessage('Availability status is required')
    .isBoolean()
    .withMessage('Availability must be a boolean value'),
];

module.exports = {
  updateLocationValidator,
  getNearbyValidator,
  updateAvailabilityValidator,
};
