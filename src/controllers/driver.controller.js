const jwt = require('jsonwebtoken');
const config = require('../config');
const Driver = require('../models/Driver');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/response');

const generateToken = driverId => {
  return jwt.sign({ id: driverId }, config.jwt.secret, {
    expiresIn: config.jwt.expire,
  });
};

const registerDriver = asyncHandler(async (req, res, next) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      licenseNumber,
      licenseExpiry,
      vehicleType,
    } = req.body;

    const existingDriver = await Driver.findOne({
      $or: [{ email }, { licenseNumber }],
    });

    if (existingDriver) {
      return next(
        new ApiError(400, 'Driver with this email or license number already exists')
      );
    }

    const driver = await Driver.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      licenseNumber,
      licenseExpiry,
      vehicleType,
    });

    const token = generateToken(driver._id);

    successResponse(res, 201, 'Driver registered successfully', {
      driver,
      token,
    });
  } catch (error) {
    next(error);
  }
});

const loginDriver = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const driver = await Driver.findOne({ email }).select('+password');
    if (!driver || !(await driver.comparePassword(password))) {
      return next(new ApiError(401, 'Invalid email or password'));
    }

    if (!driver.isActive) {
      return next(new ApiError(403, 'Account is inactive'));
    }

    driver.lastLogin = new Date();
    await driver.save();

    const token = generateToken(driver._id);

    const driverResponse = driver.toJSON();

    successResponse(res, 200, 'Login successful', {
      driver: driverResponse,
      token,
    });
  } catch (error) {
    next(error);
  }
});

const getDriverProfile = asyncHandler(async (req, res, next) => {
  try {
    successResponse(res, 200, 'Driver profile retrieved successfully', {
      driver: req.user,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = {
  registerDriver,
  loginDriver,
  getDriverProfile,
};
