const EmergencyRequest = require('../models/EmergencyRequest');
const Driver = require('../models/Driver');
const Mechanic = require('../models/Mechanic');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/response');
const { getIO } = require('../config/socket');

// Driver creates an emergency request
const createEmergencyRequest = asyncHandler(async (req, res, next) => {
  try {
    const {
      problemType,
      description,
      latitude,
      longitude,
      address,
      priority,
      vehicleInfo,
    } = req.body;

    const driverId = req.user._id;

    const emergencyRequest = await EmergencyRequest.create({
      driver: driverId,
      problemType,
      description,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
        address,
      },
      priority: priority || 'medium',
      vehicleInfo,
    });

    const populatedRequest = await EmergencyRequest.findById(
      emergencyRequest._id
    ).populate('driver', '-password');

    // Find nearby available mechanics (within 50km)
    const nearbyMechanics = await Mechanic.find({
      currentLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: 50000, // 50km in meters
        },
      },
      isAvailable: true,
      isActive: true,
    }).select('socketId');

    // Emit to nearby mechanics via Socket.io
    const io = getIO();
    nearbyMechanics.forEach(mechanic => {
      if (mechanic.socketId) {
        io.to(mechanic.socketId).emit('emergency:new-request', {
          request: populatedRequest,
        });
      }
    });

    successResponse(res, 201, 'Emergency request created successfully', {
      request: populatedRequest,
      notifiedMechanics: nearbyMechanics.length,
    });
  } catch (error) {
    next(error);
  }
});

// Get all emergency requests for a driver
const getDriverRequests = asyncHandler(async (req, res, next) => {
  try {
    const driverId = req.user._id;
    const { status } = req.query;

    const filter = { driver: driverId };
    if (status) {
      filter.status = status;
    }

    const requests = await EmergencyRequest.find(filter)
      .populate('mechanic', '-password')
      .sort({ createdAt: -1 });

    successResponse(res, 200, 'Requests retrieved successfully', {
      requests,
    });
  } catch (error) {
    next(error);
  }
});

// Get all emergency requests for a mechanic (accepted, completed, cancelled)
const getMechanicRequests = asyncHandler(async (req, res, next) => {
  try {
    const mechanicId = req.user._id;
    const { status } = req.query;

    const filter = { mechanic: mechanicId };
    if (status) {
      filter.status = status;
    }

    const requests = await EmergencyRequest.find(filter)
      .populate('driver', '-password')
      .sort({ createdAt: -1 });

    successResponse(res, 200, 'Requests retrieved successfully', {
      requests,
    });
  } catch (error) {
    next(error);
  }
});

// Get nearby emergency requests for mechanics
const getNearbyRequests = asyncHandler(async (req, res, next) => {
  try {
    const mechanicId = req.user._id;
    const { latitude, longitude, maxDistance = 50000 } = req.query;

    if (!latitude || !longitude) {
      return next(new ApiError(400, 'Latitude and longitude are required'));
    }

    const requests = await EmergencyRequest.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      },
      status: 'pending',
    }).populate('driver', '-password');

    successResponse(res, 200, 'Nearby requests retrieved successfully', {
      requests,
    });
  } catch (error) {
    next(error);
  }
});

// Mechanic accepts an emergency request
const acceptEmergencyRequest = asyncHandler(async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const mechanicId = req.user._id;

    const request = await EmergencyRequest.findById(requestId);

    if (!request) {
      return next(new ApiError(404, 'Emergency request not found'));
    }

    if (request.status !== 'pending') {
      return next(
        new ApiError(400, 'This request has already been accepted or completed')
      );
    }

    request.status = 'accepted';
    request.mechanic = mechanicId;
    request.acceptedAt = new Date();
    await request.save();

    const populatedRequest = await EmergencyRequest.findById(requestId)
      .populate('driver', '-password')
      .populate('mechanic', '-password');

    // Notify the driver via Socket.io
    const driver = await Driver.findById(request.driver);
    if (driver && driver.socketId) {
      const io = getIO();
      io.to(driver.socketId).emit('emergency:request-accepted', {
        request: populatedRequest,
      });
    }

    // Notify other mechanics that this request is no longer available
    const io = getIO();
    io.emit('emergency:request-taken', { requestId });

    successResponse(res, 200, 'Emergency request accepted successfully', {
      request: populatedRequest,
    });
  } catch (error) {
    next(error);
  }
});

// Update emergency request status
const updateRequestStatus = asyncHandler(async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      'pending',
      'accepted',
      'in-progress',
      'completed',
      'cancelled',
    ];
    if (!validStatuses.includes(status)) {
      return next(new ApiError(400, 'Invalid status'));
    }

    const request = await EmergencyRequest.findById(requestId);

    if (!request) {
      return next(new ApiError(404, 'Emergency request not found'));
    }

    // Check authorization
    const userId = req.user._id.toString();
    const isDriver = request.driver.toString() === userId;
    const isMechanic = request.mechanic && request.mechanic.toString() === userId;

    if (!isDriver && !isMechanic) {
      return next(
        new ApiError(403, 'You are not authorized to update this request')
      );
    }

    request.status = status;

    if (status === 'completed') {
      request.completedAt = new Date();
    } else if (status === 'cancelled') {
      request.cancelledAt = new Date();
      request.cancelReason = req.body.cancelReason;
    }

    await request.save();

    const populatedRequest = await EmergencyRequest.findById(requestId)
      .populate('driver', '-password')
      .populate('mechanic', '-password');

    // Notify both parties via Socket.io
    const io = getIO();
    const driver = await Driver.findById(request.driver);
    const mechanic = request.mechanic
      ? await Mechanic.findById(request.mechanic)
      : null;

    if (driver && driver.socketId) {
      io.to(driver.socketId).emit('emergency:status-updated', {
        request: populatedRequest,
      });
    }

    if (mechanic && mechanic.socketId) {
      io.to(mechanic.socketId).emit('emergency:status-updated', {
        request: populatedRequest,
      });
    }

    successResponse(res, 200, 'Request status updated successfully', {
      request: populatedRequest,
    });
  } catch (error) {
    next(error);
  }
});

// Get single emergency request details
const getRequestDetails = asyncHandler(async (req, res, next) => {
  try {
    const { requestId } = req.params;

    const request = await EmergencyRequest.findById(requestId)
      .populate('driver', '-password')
      .populate('mechanic', '-password');

    if (!request) {
      return next(new ApiError(404, 'Emergency request not found'));
    }

    successResponse(res, 200, 'Request details retrieved successfully', {
      request,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = {
  createEmergencyRequest,
  getDriverRequests,
  getMechanicRequests,
  getNearbyRequests,
  acceptEmergencyRequest,
  updateRequestStatus,
  getRequestDetails,
};
