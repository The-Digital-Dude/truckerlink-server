const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('./index');
const Driver = require('../models/Driver');
const Mechanic = require('../models/Mechanic');
const logger = require('../utils/logger');

let io;

const initializeSocket = httpServer => {
  io = new Server(httpServer, {
    cors: {
      origin: config.cors.origin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const userType = socket.handshake.auth.userType;

      if (!token || !userType) {
        return next(new Error('Authentication error: Missing token or userType'));
      }

      const decoded = jwt.verify(token, config.jwt.secret);
      socket.userId = decoded.id;
      socket.userType = userType;

      // Update socket ID in database
      if (userType === 'driver') {
        await Driver.findByIdAndUpdate(decoded.id, { socketId: socket.id });
      } else if (userType === 'mechanic') {
        await Mechanic.findByIdAndUpdate(decoded.id, { socketId: socket.id });
      }

      logger.info(`${userType} ${decoded.id} connected with socket ${socket.id}`);
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', socket => {
    logger.info(`Client connected: ${socket.id}`);

    // Handle location updates from drivers
    socket.on('driver:location-update', async data => {
      try {
        await Driver.findByIdAndUpdate(socket.userId, {
          currentLocation: {
            type: 'Point',
            coordinates: [data.longitude, data.latitude],
            address: data.address,
          },
        });

        // Broadcast location to any connected mechanics tracking this driver
        socket.broadcast.emit('driver:location-changed', {
          driverId: socket.userId,
          location: {
            latitude: data.latitude,
            longitude: data.longitude,
            address: data.address,
          },
        });
      } catch (error) {
        logger.error('Error updating driver location:', error);
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    // Handle location updates from mechanics
    socket.on('mechanic:location-update', async data => {
      try {
        await Mechanic.findByIdAndUpdate(socket.userId, {
          currentLocation: {
            type: 'Point',
            coordinates: [data.longitude, data.latitude],
            address: data.address,
          },
        });

        // Broadcast location to any connected drivers tracking this mechanic
        socket.broadcast.emit('mechanic:location-changed', {
          mechanicId: socket.userId,
          location: {
            latitude: data.latitude,
            longitude: data.longitude,
            address: data.address,
          },
        });
      } catch (error) {
        logger.error('Error updating mechanic location:', error);
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      logger.info(`Client disconnected: ${socket.id}`);

      try {
        if (socket.userType === 'driver') {
          await Driver.findByIdAndUpdate(socket.userId, { socketId: null });
        } else if (socket.userType === 'mechanic') {
          await Mechanic.findByIdAndUpdate(socket.userId, { socketId: null });
        }
      } catch (error) {
        logger.error('Error cleaning up socket ID:', error);
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initializeSocket, getIO };
