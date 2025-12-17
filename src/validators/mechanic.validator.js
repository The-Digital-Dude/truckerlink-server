const { body } = require('express-validator');

const registerMechanicValidator = [
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
  body('certificationNumber')
    .trim()
    .notEmpty()
    .withMessage('Certification number is required'),
  body('specializations')
    .optional()
    .isArray()
    .withMessage('Specializations must be an array'),
  body('yearsOfExperience')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Years of experience must be a positive number'),
  body('shopName').optional().trim(),
  body('shopAddress').optional().trim(),
];

const loginMechanicValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password').trim().notEmpty().withMessage('Password is required'),
];

module.exports = {
  registerMechanicValidator,
  loginMechanicValidator,
};
