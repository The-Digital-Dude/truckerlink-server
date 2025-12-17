const jwt = require('jsonwebtoken');
const config = require('../config');
const Mechanic = require('../models/Mechanic');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/response');

const generateToken = mechanicId => {
  return jwt.sign({ id: mechanicId }, config.jwt.secret, {
    expiresIn: config.jwt.expire,
  });
};

const registerMechanic = asyncHandler(async (req, res, next) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      certificationNumber,
      specializations,
      yearsOfExperience,
      shopName,
      shopAddress,
    } = req.body;

    const existingMechanic = await Mechanic.findOne({
      $or: [{ email }, { certificationNumber }],
    });

    if (existingMechanic) {
      return next(
        new ApiError(
          400,
          'Mechanic with this email or certification number already exists'
        )
      );
    }

    const mechanic = await Mechanic.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      certificationNumber,
      specializations,
      yearsOfExperience,
      shopName,
      shopAddress,
    });

    const token = generateToken(mechanic._id);

    successResponse(res, 201, 'Mechanic registered successfully', {
      mechanic,
      token,
    });
  } catch (error) {
    next(error);
  }
});

const loginMechanic = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const mechanic = await Mechanic.findOne({ email }).select('+password');
    if (!mechanic || !(await mechanic.comparePassword(password))) {
      return next(new ApiError(401, 'Invalid email or password'));
    }

    if (!mechanic.isActive) {
      return next(new ApiError(403, 'Account is inactive'));
    }

    mechanic.lastLogin = new Date();
    await mechanic.save();

    const token = generateToken(mechanic._id);

    const mechanicResponse = mechanic.toJSON();

    successResponse(res, 200, 'Login successful', {
      mechanic: mechanicResponse,
      token,
    });
  } catch (error) {
    next(error);
  }
});

const getMechanicProfile = asyncHandler(async (req, res, next) => {
  try {
    successResponse(res, 200, 'Mechanic profile retrieved successfully', {
      mechanic: req.user,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = {
  registerMechanic,
  loginMechanic,
  getMechanicProfile,
};
