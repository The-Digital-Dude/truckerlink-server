const { body, query } = require('express-validator');

const createEmergencyRequestValidator = [
  body('problemType')
    .trim()
    .notEmpty()
    .withMessage('Problem type is required')
    .isIn(['engine', 'tire', 'brake', 'electrical', 'fuel', 'transmission', 'other'])
    .withMessage('Invalid problem type'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
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
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority level'),
  body('vehicleInfo').optional().isObject().withMessage('Vehicle info must be an object'),
];

const updateRequestStatusValidator = [
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'accepted', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  body('cancelReason')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Cancel reason must not exceed 200 characters'),
];

const getNearbyRequestsValidator = [
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
    .isInt({ min: 1000, max: 100000 })
    .withMessage('Max distance must be between 1000 and 100000 meters'),
];

module.exports = {
  createEmergencyRequestValidator,
  updateRequestStatusValidator,
  getNearbyRequestsValidator,
};
