const express = require('express');
const {
  registerMechanic,
  loginMechanic,
  getMechanicProfile,
} = require('../controllers/mechanic.controller');
const { authenticateMechanic } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  registerMechanicValidator,
  loginMechanicValidator,
} = require('../validators/mechanic.validator');

const router = express.Router();

router.post('/register', validate(registerMechanicValidator), registerMechanic);
router.post('/login', validate(loginMechanicValidator), loginMechanic);
router.get('/profile', authenticateMechanic, getMechanicProfile);

module.exports = router;
