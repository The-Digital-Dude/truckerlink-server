const express = require('express');
const router = express.Router();
const userRoutes = require('./user.routes');

router.get('/', (req, res) => {
  res.json({
    message: 'TruckerLink API',
    version: '1.0.0',
    endpoints: {
      users: '/api/v1/users',
      health: '/health',
    },
  });
});

router.use('/users', userRoutes);

module.exports = router;
