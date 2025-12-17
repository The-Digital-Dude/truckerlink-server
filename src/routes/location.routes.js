const express = require('express');
const {
  updateDriverLocation,
  getDriverLocation,
  updateMechanicLocation,
  getMechanicLocation,
  updateMechanicAvailability,
  getNearbyDrivers,
  getNearbyMechanics,
} = require('../controllers/location.controller');
const { authenticateDriver, authenticateMechanic } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  updateLocationValidator,
  getNearbyValidator,
  updateAvailabilityValidator,
} = require('../validators/location.validator');

const router = express.Router();

// Driver routes
router.patch(
  '/driver',
  authenticateDriver,
  validate(updateLocationValidator),
  updateDriverLocation
);
router.get('/driver/:driverId', getDriverLocation);
router.get(
  '/nearby-mechanics',
  authenticateDriver,
  validate(getNearbyValidator),
  getNearbyMechanics
);

// Mechanic routes
router.patch(
  '/mechanic',
  authenticateMechanic,
  validate(updateLocationValidator),
  updateMechanicLocation
);
router.get('/mechanic/:mechanicId', getMechanicLocation);
router.patch(
  '/mechanic/availability',
  authenticateMechanic,
  validate(updateAvailabilityValidator),
  updateMechanicAvailability
);
router.get(
  '/nearby-drivers',
  authenticateMechanic,
  validate(getNearbyValidator),
  getNearbyDrivers
);

module.exports = router;
