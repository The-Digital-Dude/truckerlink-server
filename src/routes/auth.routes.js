const express = require('express');
const {
  registerUser,
  loginUser,
  getUserProfile,
} = require('../controllers/auth.controller');
const { authenticateUser } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  registerUserValidator,
  loginValidator,
} = require('../validators/auth.validator');

const router = express.Router();

router.post('/register', validate(registerUserValidator), registerUser);
router.post('/login', validate(loginValidator), loginUser);
router.get('/profile', authenticateUser, getUserProfile);

module.exports = router;
