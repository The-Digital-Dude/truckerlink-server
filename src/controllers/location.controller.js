const Driver = require('../models/Driver');
const Mechanic = require('../models/Mechanic');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/response');

// Update driver location
const updateDriverLocation = asyncHandler(async (req, res, next) => {
  try {
    const { latitude, longitude, address } = req.body;
    const driverId = req.user._id;

    const driver = await Driver.findByIdAndUpdate(
      driverId,
      {
        currentLocation: {
          type: 'Point',
          coordinates: [longitude, latitude],
          address,
        },
      },
      { new: true }
    ).select('-password');

    successResponse(res, 200, 'Location updated successfully', { driver });
  } catch (error) {
    next(error);
  }
});

// Get driver location
const getDriverLocation = asyncHandler(async (req, res, next) => {
  try {
    const { driverId } = req.params;

    const driver = await Driver.findById(driverId).select(
      'currentLocation firstName lastName phone'
    );

    if (!driver) {
      return next(new ApiError(404, 'Driver not found'));
    }

    successResponse(res, 200, 'Driver location retrieved successfully', {
      driver,
    });
  } catch (error) {
    next(error);
  }
});

// Update mechanic location
const updateMechanicLocation = asyncHandler(async (req, res, next) => {
  try {
    const { latitude, longitude, address } = req.body;
    const mechanicId = req.user._id;

    const mechanic = await Mechanic.findByIdAndUpdate(
      mechanicId,
      {
        currentLocation: {
          type: 'Point',
          coordinates: [longitude, latitude],
          address,
        },
      },
      { new: true }
    ).select('-password');

    successResponse(res, 200, 'Location updated successfully', { mechanic });
  } catch (error) {
    next(error);
  }
});

// Get mechanic location
const getMechanicLocation = asyncHandler(async (req, res, next) => {
  try {
    const { mechanicId } = req.params;

    const mechanic = await Mechanic.findById(mechanicId).select(
      'currentLocation firstName lastName phone'
    );

    if (!mechanic) {
      return next(new ApiError(404, 'Mechanic not found'));
    }

    successResponse(res, 200, 'Mechanic location retrieved successfully', {
      mechanic,
    });
  } catch (error) {
    next(error);
  }
});

// Update mechanic availability
const updateMechanicAvailability = asyncHandler(async (req, res, next) => {
  try {
    const { isAvailable } = req.body;
    const mechanicId = req.user._id;

    const mechanic = await Mechanic.findByIdAndUpdate(
      mechanicId,
      { isAvailable },
      { new: true }
    ).select('-password');

    successResponse(res, 200, 'Availability updated successfully', { mechanic });
  } catch (error) {
    next(error);
  }
});

// Get nearby drivers (for mechanics to see)
const getNearbyDrivers = asyncHandler(async (req, res, next) => {
  try {
    const { latitude, longitude, maxDistance = 10000 } = req.query;

    if (!latitude || !longitude) {
      return next(new ApiError(400, 'Latitude and longitude are required'));
    }

    const drivers = await Driver.find({
      currentLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      },
      isActive: true,
    }).select('firstName lastName phone vehicleType currentLocation');

    successResponse(res, 200, 'Nearby drivers retrieved successfully', {
      drivers,
    });
  } catch (error) {
    next(error);
  }
});

// Get nearby mechanics (for drivers to see)
const getNearbyMechanics = asyncHandler(async (req, res, next) => {
  try {
    const { latitude, longitude, maxDistance = 50000 } = req.query;

    if (!latitude || !longitude) {
      return next(new ApiError(400, 'Latitude and longitude are required'));
    }

    const mechanics = await Mechanic.find({
      currentLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      },
      isActive: true,
      isAvailable: true,
    }).select(
      'firstName lastName phone specializations shopName currentLocation'
    );

    successResponse(res, 200, 'Nearby mechanics retrieved successfully', {
      mechanics,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = {
  updateDriverLocation,
  getDriverLocation,
  updateMechanicLocation,
  getMechanicLocation,
  updateMechanicAvailability,
  getNearbyDrivers,
  getNearbyMechanics,
};
