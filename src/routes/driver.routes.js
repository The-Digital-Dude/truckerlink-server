const express = require('express');
const {
  registerDriver,
  loginDriver,
  getDriverProfile,
} = require('../controllers/driver.controller');
const { authenticateDriver } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  registerDriverValidator,
  loginDriverValidator,
} = require('../validators/driver.validator');

const router = express.Router();

router.post('/register', validate(registerDriverValidator), registerDriver);
router.post('/login', validate(loginDriverValidator), loginDriver);
router.get('/profile', authenticateDriver, getDriverProfile);

module.exports = router;
