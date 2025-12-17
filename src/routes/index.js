const express = require('express');
const router = express.Router();
const userRoutes = require('./user.routes');
const authRoutes = require('./auth.routes');
const driverRoutes = require('./driver.routes');
const mechanicRoutes = require('./mechanic.routes');
const emergencyRoutes = require('./emergency.routes');
const locationRoutes = require('./location.routes');

router.get('/', (req, res) => {
  res.json({
    message: 'TruckerLink API',
    version: '1.0.0',
    endpoints: {
      users: '/api/v1/users',
      auth: '/api/v1/auth',
      drivers: '/api/v1/drivers',
      mechanics: '/api/v1/mechanics',
      emergency: '/api/v1/emergency',
      location: '/api/v1/location',
      health: '/health',
    },
  });
});

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/drivers', driverRoutes);
router.use('/mechanics', mechanicRoutes);
router.use('/emergency', emergencyRoutes);
router.use('/location', locationRoutes);

module.exports = router;
