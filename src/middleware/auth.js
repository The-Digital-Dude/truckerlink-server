const jwt = require('jsonwebtoken');
const config = require('../config');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const Driver = require('../models/Driver');
const Mechanic = require('../models/Mechanic');

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new ApiError(401, 'Access token is required'));
    }

    const decoded = jwt.verify(token, config.jwt.secret);

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return next(new ApiError(401, 'Invalid token or user is inactive'));
    }

    req.user = user;
    req.userType = 'user';
    next();
  } catch (error) {
    next(error);
  }
};

const authenticateDriver = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new ApiError(401, 'Access token is required'));
    }

    const decoded = jwt.verify(token, config.jwt.secret);

    const driver = await Driver.findById(decoded.id);
    if (!driver || !driver.isActive) {
      return next(new ApiError(401, 'Invalid token or driver is inactive'));
    }

    req.user = driver;
    req.userType = 'driver';
    next();
  } catch (error) {
    next(error);
  }
};

const authenticateMechanic = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new ApiError(401, 'Access token is required'));
    }

    const decoded = jwt.verify(token, config.jwt.secret);

    const mechanic = await Mechanic.findById(decoded.id);
    if (!mechanic || !mechanic.isActive) {
      return next(new ApiError(401, 'Invalid token or mechanic is inactive'));
    }

    req.user = mechanic;
    req.userType = 'mechanic';
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticateUser,
  authenticateDriver,
  authenticateMechanic,
};
