const { body, param, query } = require('express-validator');

const createUserValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['driver', 'dispatcher', 'admin'])
    .withMessage('Role must be either driver, dispatcher, or admin'),
];

const updateUserValidation = [
  param('id').isInt({ min: 1 }).withMessage('Invalid user ID'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email').optional().trim().isEmail().withMessage('Please provide a valid email'),

  body('role')
    .optional()
    .trim()
    .isIn(['driver', 'dispatcher', 'admin'])
    .withMessage('Role must be either driver, dispatcher, or admin'),
];

const userIdValidation = [param('id').isInt({ min: 1 }).withMessage('Invalid user ID')];

const getUsersValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('search').optional().trim().isLength({ max: 100 }).withMessage('Search term too long'),
];

module.exports = {
  createUserValidation,
  updateUserValidation,
  userIdValidation,
  getUsersValidation,
};
