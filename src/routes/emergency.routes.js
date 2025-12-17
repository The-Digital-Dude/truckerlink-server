const express = require('express');
const {
  createEmergencyRequest,
  getDriverRequests,
  getMechanicRequests,
  getNearbyRequests,
  acceptEmergencyRequest,
  updateRequestStatus,
  getRequestDetails,
} = require('../controllers/emergency.controller');
const { authenticateDriver, authenticateMechanic } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createEmergencyRequestValidator,
  updateRequestStatusValidator,
  getNearbyRequestsValidator,
} = require('../validators/emergency.validator');

const router = express.Router();

// Driver routes
router.post(
  '/create',
  authenticateDriver,
  validate(createEmergencyRequestValidator),
  createEmergencyRequest
);
router.get('/driver/my-requests', authenticateDriver, getDriverRequests);

// Mechanic routes
router.get(
  '/nearby',
  authenticateMechanic,
  validate(getNearbyRequestsValidator),
  getNearbyRequests
);
router.get('/mechanic/my-requests', authenticateMechanic, getMechanicRequests);
router.post('/accept/:requestId', authenticateMechanic, acceptEmergencyRequest);

// Shared routes (both driver and mechanic can access)
router.get('/:requestId', getRequestDetails);
router.patch(
  '/:requestId/status',
  validate(updateRequestStatusValidator),
  updateRequestStatus
);

module.exports = router;
