const { body } = require('express-validator');

const registerDriverValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .trim()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name must not exceed 50 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name must not exceed 50 characters'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('licenseNumber')
    .trim()
    .notEmpty()
    .withMessage('License number is required'),
  body('licenseExpiry')
    .notEmpty()
    .withMessage('License expiry date is required')
    .isISO8601()
    .withMessage('License expiry must be a valid date'),
  body('vehicleType').optional().trim(),
];

const loginDriverValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password').trim().notEmpty().withMessage('Password is required'),
];

module.exports = {
  registerDriverValidator,
  loginDriverValidator,
};
